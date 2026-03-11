import { Resend } from "resend";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

const TO_EMAILS = ["contact@agaigency.com"];

const DATAFORSEO_API = "https://api.dataforseo.com/v3";

/* ─── Rate Limiting (in-memory) ─────────────────────── */

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5; // max 5 audits per IP per hour
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

/* ─── Helpers ───────────────────────────────────────── */

function getAuthHeader(): string {
  const login = process.env.DATAFORSEO_LOGIN || "";
  const password = process.env.DATAFORSEO_PASSWORD || "";
  return "Basic " + Buffer.from(`${login}:${password}`).toString("base64");
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

function normalizeUrl(url: string): string {
  if (!url.startsWith("http")) return `https://${url}`;
  return url;
}

/* ─── Interfaces ────────────────────────────────────── */

interface AuditItem {
  status: "pass" | "warning" | "fail";
  labelKey: string;
  findingKey: string;
  findingArgs?: Record<string, string | number>;
  impactKey: string;
}

interface AuditCategory {
  score: number;
  items: AuditItem[];
}

interface PageSpeedData {
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
  fcp: number;
  lcp: number;
  cls: number;
  tbt: number;
  speedIndex: number;
  tti: number;
  hasMetaDescription: boolean;
  hasViewport: boolean;
  isCrawlable: boolean;
  hasCanonical: boolean;
  fontSizeOk: boolean;
  tapTargetsOk: boolean;
  imagesHaveAlt: boolean;
  htmlHasLang: boolean;
  colorContrast: boolean;
  headingsOrder: boolean;
  imagesOptimized: boolean;
  textCompressed: boolean;
  renderBlockingCount: number;
  unusedCss: boolean;
  unusedJs: boolean;
  modernImageFormats: boolean;
  efficientCachePolicy: boolean;
  screenshotBase64: string | null;
}

interface ScrapingData {
  title: string;
  titleLength: number;
  metaDescription: string;
  metaDescriptionLength: number;
  h1Count: number;
  h1Content: string;
  h2Count: number;
  h3Count: number;
  totalImages: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  isHttps: boolean;
  pageSizeBytes: number;
  wordCount: number;
  hasStructuredData: boolean;
  hasOgTitle: boolean;
  hasOgDescription: boolean;
  hasOgImage: boolean;
  hasTwitterCard: boolean;
  hasFavicon: boolean;
  hasCharset: boolean;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  hasGzip: boolean;
  securityHeaders: {
    xFrameOptions: boolean;
    contentSecurityPolicy: boolean;
    strictTransportSecurity: boolean;
    xContentTypeOptions: boolean;
  };
}

interface PositioningData {
  positioningScore: number;
  keywords: { keyword: string; volume: number; difficulty: number; position: number }[];
  financialLoss: number;
  competitors: number;
  missingPages: number;
}

export interface ScanResults {
  globalScore: number;
  screenshot: string | null;
  categories: {
    performance: AuditCategory;
    seo: AuditCategory;
    mobile: AuditCategory;
    security: AuditCategory;
  };
  keyMetrics: {
    loadTime: string;
    mobileReady: boolean;
    seoReady: boolean;
    isSecure: boolean;
  };
  // Legacy fields for positioning data
  positioningScore: number;
  keywords: { keyword: string; volume: number; difficulty: number; position: number }[];
  financialLoss: number;
  competitors: number;
  missingPages: number;
  // Raw scores for bars
  performanceScore: number;
  seoScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  // Partial flags
  hasPageSpeed: boolean;
  hasScraping: boolean;
}

/* ─── Google PageSpeed Insights (FREE, no key required) ─ */

async function fetchPageSpeed(url: string, strategy: "mobile" | "desktop" = "mobile"): Promise<PageSpeedData | null> {
  const normalizedUrl = normalizeUrl(url);
  const params = new URLSearchParams({
    url: normalizedUrl,
    category: "performance",
    strategy,
  });
  // Add multiple categories
  params.append("category", "seo");
  params.append("category", "accessibility");
  params.append("category", "best-practices");

  const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`;

  const res = await fetch(apiUrl, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) return null;
  const data = await res.json();

  const lr = data.lighthouseResult;
  if (!lr) return null;

  const audit = (id: string) => lr.audits?.[id];
  const auditScore = (id: string): boolean => (audit(id)?.score ?? 0) === 1;

  return {
    performance: (lr.categories?.performance?.score ?? 0) * 100,
    seo: (lr.categories?.seo?.score ?? 0) * 100,
    accessibility: (lr.categories?.accessibility?.score ?? 0) * 100,
    bestPractices: (lr.categories?.["best-practices"]?.score ?? 0) * 100,
    fcp: audit("first-contentful-paint")?.numericValue ?? 0,
    lcp: audit("largest-contentful-paint")?.numericValue ?? 0,
    cls: audit("cumulative-layout-shift")?.numericValue ?? 0,
    tbt: audit("total-blocking-time")?.numericValue ?? 0,
    speedIndex: audit("speed-index")?.numericValue ?? 0,
    tti: audit("interactive")?.numericValue ?? 0,
    hasMetaDescription: auditScore("meta-description"),
    hasViewport: auditScore("viewport"),
    isCrawlable: auditScore("is-crawlable"),
    hasCanonical: auditScore("canonical"),
    fontSizeOk: auditScore("font-size"),
    tapTargetsOk: auditScore("tap-targets"),
    imagesHaveAlt: auditScore("image-alt"),
    htmlHasLang: auditScore("html-has-lang"),
    colorContrast: auditScore("color-contrast"),
    headingsOrder: auditScore("heading-order"),
    imagesOptimized: auditScore("uses-optimized-images"),
    textCompressed: auditScore("uses-text-compression"),
    renderBlockingCount: audit("render-blocking-resources")?.details?.items?.length ?? 0,
    unusedCss: auditScore("unused-css-rules"),
    unusedJs: auditScore("unused-javascript"),
    modernImageFormats: auditScore("modern-image-formats"),
    efficientCachePolicy: auditScore("uses-long-cache-ttl"),
    screenshotBase64: audit("final-screenshot")?.details?.data ?? null,
  };
}

/* ─── HTML Scraping + Technical Checks ──────────────── */

async function scrapeAndAnalyze(url: string): Promise<ScrapingData> {
  const normalizedUrl = normalizeUrl(url);

  // Fetch main page
  const response = await fetch(normalizedUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; AgaiGencyBot/1.0; +https://agaigency.com)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(10000),
  });
  const html = await response.text();
  const $ = cheerio.load(html);

  // Parse URL for link classification
  let baseHost: string;
  try {
    baseHost = new URL(normalizedUrl).hostname;
  } catch {
    baseHost = "";
  }

  // Title
  const title = $("title").first().text().trim();

  // Meta Description
  const metaDescription = $('meta[name="description"]').attr("content")?.trim() || "";

  // Headings
  const h1Elements = $("h1");
  const h1Content = h1Elements.first().text().trim();

  // Images
  const imgElements = $("img");
  const totalImages = imgElements.length;
  let imagesWithoutAlt = 0;
  imgElements.each((_, el) => {
    const alt = $(el).attr("alt")?.trim();
    if (!alt) imagesWithoutAlt++;
  });

  // Links
  let internalLinks = 0;
  let externalLinks = 0;
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (href.startsWith("#") || href.startsWith("javascript:")) return;
    try {
      const linkHost = href.startsWith("http") ? new URL(href).hostname : baseHost;
      if (linkHost === baseHost) internalLinks++;
      else externalLinks++;
    } catch {
      internalLinks++; // relative links are internal
    }
  });

  // Word count (strip tags, scripts, styles)
  $("script, style, noscript").remove();
  const textContent = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;

  // Robots.txt & Sitemap
  const [robotsResult, sitemapResult] = await Promise.allSettled([
    fetch(new URL("/robots.txt", normalizedUrl).href, { signal: AbortSignal.timeout(5000) })
      .then((r) => (r.ok ? r.text() : null)),
    fetch(new URL("/sitemap.xml", normalizedUrl).href, { signal: AbortSignal.timeout(5000) })
      .then((r) => (r.ok ? r.text() : null)),
  ]);

  // HTTP Headers
  let hasGzip = false;
  const securityHeaders = {
    xFrameOptions: false,
    contentSecurityPolicy: false,
    strictTransportSecurity: false,
    xContentTypeOptions: false,
  };
  try {
    const headRes = await fetch(normalizedUrl, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    hasGzip = headRes.headers.get("content-encoding")?.includes("gzip") || headRes.headers.get("content-encoding")?.includes("br") || false;
    securityHeaders.xFrameOptions = !!headRes.headers.get("x-frame-options");
    securityHeaders.contentSecurityPolicy = !!headRes.headers.get("content-security-policy");
    securityHeaders.strictTransportSecurity = !!headRes.headers.get("strict-transport-security");
    securityHeaders.xContentTypeOptions = !!headRes.headers.get("x-content-type-options");
  } catch {
    // ignore
  }

  return {
    title,
    titleLength: title.length,
    metaDescription,
    metaDescriptionLength: metaDescription.length,
    h1Count: h1Elements.length,
    h1Content,
    h2Count: $("h2").length,
    h3Count: $("h3").length,
    totalImages,
    imagesWithoutAlt,
    internalLinks,
    externalLinks,
    isHttps: normalizedUrl.startsWith("https"),
    pageSizeBytes: Buffer.byteLength(html, "utf8"),
    wordCount,
    hasStructuredData: html.includes("application/ld+json"),
    hasOgTitle: $('meta[property="og:title"]').length > 0,
    hasOgDescription: $('meta[property="og:description"]').length > 0,
    hasOgImage: $('meta[property="og:image"]').length > 0,
    hasTwitterCard: $('meta[name="twitter:card"]').length > 0 || $('meta[property="twitter:card"]').length > 0,
    hasFavicon: $('link[rel="icon"]').length > 0 || $('link[rel="shortcut icon"]').length > 0,
    hasCharset: $('meta[charset]').length > 0 || html.toLowerCase().includes('charset='),
    hasRobotsTxt: robotsResult.status === "fulfilled" && robotsResult.value !== null,
    hasSitemap: sitemapResult.status === "fulfilled" && sitemapResult.value !== null,
    hasGzip,
    securityHeaders,
  };
}

/* ─── Build Audit Categories ────────────────────────── */

function buildPerformanceItems(ps: PageSpeedData | null, sc: ScrapingData | null): AuditItem[] {
  const items: AuditItem[] = [];

  if (ps) {
    // LCP
    const lcpSec = ps.lcp / 1000;
    items.push({
      status: lcpSec <= 2.5 ? "pass" : lcpSec <= 4 ? "warning" : "fail",
      labelKey: "perf.lcp.label",
      findingKey: lcpSec <= 2.5 ? "perf.lcp.findingGood" : "perf.lcp.findingBad",
      findingArgs: { value: lcpSec.toFixed(1) },
      impactKey: "perf.lcp.impact",
    });

    // CLS
    items.push({
      status: ps.cls <= 0.1 ? "pass" : ps.cls <= 0.25 ? "warning" : "fail",
      labelKey: "perf.cls.label",
      findingKey: ps.cls <= 0.1 ? "perf.cls.findingGood" : "perf.cls.findingBad",
      findingArgs: { value: ps.cls.toFixed(3) },
      impactKey: "perf.cls.impact",
    });

    // TBT
    items.push({
      status: ps.tbt <= 200 ? "pass" : ps.tbt <= 600 ? "warning" : "fail",
      labelKey: "perf.tbt.label",
      findingKey: ps.tbt <= 200 ? "perf.tbt.findingGood" : "perf.tbt.findingBad",
      findingArgs: { value: Math.round(ps.tbt).toString() },
      impactKey: "perf.tbt.impact",
    });

    // FCP
    const fcpSec = ps.fcp / 1000;
    items.push({
      status: fcpSec <= 1.8 ? "pass" : fcpSec <= 3 ? "warning" : "fail",
      labelKey: "perf.fcp.label",
      findingKey: fcpSec <= 1.8 ? "perf.fcp.findingGood" : "perf.fcp.findingBad",
      findingArgs: { value: fcpSec.toFixed(1) },
      impactKey: "perf.fcp.impact",
    });

    // Images optimization
    items.push({
      status: ps.imagesOptimized ? "pass" : "fail",
      labelKey: "perf.images.label",
      findingKey: ps.imagesOptimized ? "perf.images.findingGood" : "perf.images.findingBad",
      impactKey: "perf.images.impact",
    });

    // Modern image formats
    items.push({
      status: ps.modernImageFormats ? "pass" : "warning",
      labelKey: "perf.modernFormats.label",
      findingKey: ps.modernImageFormats ? "perf.modernFormats.findingGood" : "perf.modernFormats.findingBad",
      impactKey: "perf.modernFormats.impact",
    });

    // Text compression
    items.push({
      status: ps.textCompressed ? "pass" : "fail",
      labelKey: "perf.compression.label",
      findingKey: ps.textCompressed ? "perf.compression.findingGood" : "perf.compression.findingBad",
      impactKey: "perf.compression.impact",
    });

    // Cache policy
    items.push({
      status: ps.efficientCachePolicy ? "pass" : "warning",
      labelKey: "perf.cache.label",
      findingKey: ps.efficientCachePolicy ? "perf.cache.findingGood" : "perf.cache.findingBad",
      impactKey: "perf.cache.impact",
    });

    // Render-blocking resources
    if (ps.renderBlockingCount > 0) {
      items.push({
        status: "warning",
        labelKey: "perf.renderBlocking.label",
        findingKey: "perf.renderBlocking.findingBad",
        findingArgs: { count: ps.renderBlockingCount },
        impactKey: "perf.renderBlocking.impact",
      });
    }

    // Unused CSS
    if (!ps.unusedCss) {
      items.push({
        status: "warning",
        labelKey: "perf.unusedCss.label",
        findingKey: "perf.unusedCss.findingBad",
        impactKey: "perf.unusedCss.impact",
      });
    }

    // Unused JS
    if (!ps.unusedJs) {
      items.push({
        status: "warning",
        labelKey: "perf.unusedJs.label",
        findingKey: "perf.unusedJs.findingBad",
        impactKey: "perf.unusedJs.impact",
      });
    }
  }

  return items;
}

function buildSeoItems(ps: PageSpeedData | null, sc: ScrapingData | null): AuditItem[] {
  const items: AuditItem[] = [];

  if (sc) {
    // Title
    const titleOk = sc.titleLength >= 30 && sc.titleLength <= 65;
    items.push({
      status: sc.titleLength === 0 ? "fail" : titleOk ? "pass" : "warning",
      labelKey: "seo.title.label",
      findingKey: sc.titleLength === 0 ? "seo.title.findingMissing" : titleOk ? "seo.title.findingGood" : "seo.title.findingBad",
      findingArgs: { content: sc.title.slice(0, 80), length: sc.titleLength },
      impactKey: "seo.title.impact",
    });

    // Meta description
    const metaOk = sc.metaDescriptionLength >= 120 && sc.metaDescriptionLength <= 160;
    items.push({
      status: sc.metaDescriptionLength === 0 ? "fail" : metaOk ? "pass" : "warning",
      labelKey: "seo.meta.label",
      findingKey: sc.metaDescriptionLength === 0 ? "seo.meta.findingMissing" : metaOk ? "seo.meta.findingGood" : "seo.meta.findingBad",
      findingArgs: { length: sc.metaDescriptionLength },
      impactKey: "seo.meta.impact",
    });

    // H1
    items.push({
      status: sc.h1Count === 1 ? "pass" : sc.h1Count === 0 ? "fail" : "warning",
      labelKey: "seo.h1.label",
      findingKey: sc.h1Count === 0 ? "seo.h1.findingMissing" : sc.h1Count === 1 ? "seo.h1.findingGood" : "seo.h1.findingMultiple",
      findingArgs: { count: sc.h1Count, content: sc.h1Content.slice(0, 60) },
      impactKey: "seo.h1.impact",
    });

    // Images alt
    items.push({
      status: sc.imagesWithoutAlt === 0 ? "pass" : sc.imagesWithoutAlt <= 3 ? "warning" : "fail",
      labelKey: "seo.imagesAlt.label",
      findingKey: sc.imagesWithoutAlt === 0 ? "seo.imagesAlt.findingGood" : "seo.imagesAlt.findingBad",
      findingArgs: { missing: sc.imagesWithoutAlt, total: sc.totalImages },
      impactKey: "seo.imagesAlt.impact",
    });

    // Sitemap
    items.push({
      status: sc.hasSitemap ? "pass" : "fail",
      labelKey: "seo.sitemap.label",
      findingKey: sc.hasSitemap ? "seo.sitemap.findingGood" : "seo.sitemap.findingBad",
      impactKey: "seo.sitemap.impact",
    });

    // Robots.txt
    items.push({
      status: sc.hasRobotsTxt ? "pass" : "fail",
      labelKey: "seo.robots.label",
      findingKey: sc.hasRobotsTxt ? "seo.robots.findingGood" : "seo.robots.findingBad",
      impactKey: "seo.robots.impact",
    });

    // Structured data
    items.push({
      status: sc.hasStructuredData ? "pass" : "warning",
      labelKey: "seo.structuredData.label",
      findingKey: sc.hasStructuredData ? "seo.structuredData.findingGood" : "seo.structuredData.findingBad",
      impactKey: "seo.structuredData.impact",
    });

    // Open Graph
    const ogComplete = sc.hasOgTitle && sc.hasOgImage;
    items.push({
      status: ogComplete ? "pass" : sc.hasOgTitle ? "warning" : "fail",
      labelKey: "seo.og.label",
      findingKey: ogComplete ? "seo.og.findingGood" : "seo.og.findingBad",
      impactKey: "seo.og.impact",
    });

    // Word count
    items.push({
      status: sc.wordCount >= 300 ? "pass" : sc.wordCount >= 100 ? "warning" : "fail",
      labelKey: "seo.wordCount.label",
      findingKey: sc.wordCount >= 300 ? "seo.wordCount.findingGood" : "seo.wordCount.findingBad",
      findingArgs: { count: sc.wordCount },
      impactKey: "seo.wordCount.impact",
    });

    // Canonical
    if (ps) {
      items.push({
        status: ps.hasCanonical ? "pass" : "warning",
        labelKey: "seo.canonical.label",
        findingKey: ps.hasCanonical ? "seo.canonical.findingGood" : "seo.canonical.findingBad",
        impactKey: "seo.canonical.impact",
      });
    }
  }

  return items;
}

function buildMobileItems(ps: PageSpeedData | null, sc: ScrapingData | null): AuditItem[] {
  const items: AuditItem[] = [];

  if (ps) {
    // Viewport
    items.push({
      status: ps.hasViewport ? "pass" : "fail",
      labelKey: "mobile.viewport.label",
      findingKey: ps.hasViewport ? "mobile.viewport.findingGood" : "mobile.viewport.findingBad",
      impactKey: "mobile.viewport.impact",
    });

    // Font size
    items.push({
      status: ps.fontSizeOk ? "pass" : "fail",
      labelKey: "mobile.fontSize.label",
      findingKey: ps.fontSizeOk ? "mobile.fontSize.findingGood" : "mobile.fontSize.findingBad",
      impactKey: "mobile.fontSize.impact",
    });

    // Tap targets
    items.push({
      status: ps.tapTargetsOk ? "pass" : "fail",
      labelKey: "mobile.tapTargets.label",
      findingKey: ps.tapTargetsOk ? "mobile.tapTargets.findingGood" : "mobile.tapTargets.findingBad",
      impactKey: "mobile.tapTargets.impact",
    });

    // Mobile LCP
    const lcpSec = ps.lcp / 1000;
    items.push({
      status: lcpSec <= 2.5 ? "pass" : lcpSec <= 4 ? "warning" : "fail",
      labelKey: "mobile.loadTime.label",
      findingKey: lcpSec <= 2.5 ? "mobile.loadTime.findingGood" : "mobile.loadTime.findingBad",
      findingArgs: { value: lcpSec.toFixed(1) },
      impactKey: "mobile.loadTime.impact",
    });
  }

  return items;
}

function buildSecurityItems(ps: PageSpeedData | null, sc: ScrapingData | null): AuditItem[] {
  const items: AuditItem[] = [];

  if (sc) {
    // HTTPS
    items.push({
      status: sc.isHttps ? "pass" : "fail",
      labelKey: "security.https.label",
      findingKey: sc.isHttps ? "security.https.findingGood" : "security.https.findingBad",
      impactKey: "security.https.impact",
    });

    // Security headers
    const headersOk = Object.values(sc.securityHeaders).filter(Boolean).length;
    const headersMissing = 4 - headersOk;
    items.push({
      status: headersMissing === 0 ? "pass" : headersMissing <= 2 ? "warning" : "fail",
      labelKey: "security.headers.label",
      findingKey: headersMissing === 0 ? "security.headers.findingGood" : "security.headers.findingBad",
      findingArgs: { missing: headersMissing },
      impactKey: "security.headers.impact",
    });

    // Compression
    items.push({
      status: sc.hasGzip ? "pass" : "fail",
      labelKey: "security.compression.label",
      findingKey: sc.hasGzip ? "security.compression.findingGood" : "security.compression.findingBad",
      impactKey: "security.compression.impact",
    });
  }

  return items;
}

/* ─── Score Computation ─────────────────────────────── */

function computeGlobalScore(ps: PageSpeedData | null, sc: ScrapingData | null): number {
  if (ps) {
    // PageSpeed-based weighted score
    const weightedPageSpeed =
      ps.performance * 0.30 +
      ps.seo * 0.30 +
      ps.accessibility * 0.15 +
      ps.bestPractices * 0.10;

    if (sc) {
      // On-page checks (15% remaining)
      const onPageChecks = [
        sc.titleLength >= 30 && sc.titleLength <= 65,
        sc.metaDescriptionLength >= 120 && sc.metaDescriptionLength <= 160,
        sc.h1Count === 1,
        sc.imagesWithoutAlt === 0,
        sc.isHttps,
        sc.hasSitemap,
        sc.hasRobotsTxt,
        sc.hasOgTitle && sc.hasOgImage,
        sc.wordCount > 300,
        sc.hasStructuredData,
        sc.hasFavicon,
        sc.hasCharset,
      ];
      const onPageScore = (onPageChecks.filter(Boolean).length / onPageChecks.length) * 100;
      return Math.round(weightedPageSpeed * 0.85 + onPageScore * 0.15);
    }

    return Math.round(weightedPageSpeed);
  }

  // Fallback: scraping-only score
  if (sc) {
    const checks = [
      sc.titleLength >= 30 && sc.titleLength <= 65,
      sc.metaDescriptionLength >= 120 && sc.metaDescriptionLength <= 160,
      sc.h1Count === 1,
      sc.h2Count >= 3,
      sc.imagesWithoutAlt === 0,
      sc.isHttps,
      sc.hasSitemap,
      sc.hasRobotsTxt,
      sc.hasOgTitle && sc.hasOgImage,
      sc.wordCount > 300,
      sc.hasStructuredData,
      sc.hasFavicon,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  return 0;
}

function computeMobileScore(ps: PageSpeedData | null): number {
  if (!ps) return 0;
  let score = 0;
  let total = 0;
  const checks = [ps.hasViewport, ps.fontSizeOk, ps.tapTargetsOk];
  checks.forEach((c) => { total++; if (c) score++; });
  // LCP under 4s on mobile
  total++;
  if (ps.lcp / 1000 <= 4) score++;
  return Math.round((score / total) * 100);
}

function computeSecurityScore(sc: ScrapingData | null): number {
  if (!sc) return 0;
  let score = 0;
  let total = 0;
  total++; if (sc.isHttps) score++;
  total++; if (sc.hasGzip) score++;
  Object.values(sc.securityHeaders).forEach((v) => { total++; if (v) score++; });
  return Math.round((score / total) * 100);
}

/* ─── DataForSEO (unchanged) ───────────────────────── */

async function getRankedKeywords(domain: string, auth: string) {
  const res = await fetch(`${DATAFORSEO_API}/dataforseo_labs/google/ranked_keywords/live`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify([{
      target: domain,
      location_code: 2250,
      language_code: "fr",
      limit: 20,
      order_by: ["keyword_data.keyword_info.search_volume,desc"],
    }]),
  });
  return res.json();
}

async function getCompetitors(domain: string, auth: string) {
  const res = await fetch(`${DATAFORSEO_API}/dataforseo_labs/google/competitors_domain/live`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify([{
      target: domain,
      location_code: 2250,
      language_code: "fr",
      limit: 5,
      order_by: ["metrics.organic.count,desc"],
    }]),
  });
  return res.json();
}

async function getKeywordSuggestions(keyword: string, auth: string) {
  const res = await fetch(`${DATAFORSEO_API}/dataforseo_labs/google/keyword_suggestions/live`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify([{
      keyword,
      location_code: 2250,
      language_code: "fr",
      limit: 10,
      order_by: ["keyword_info.search_volume,desc"],
    }]),
  });
  return res.json();
}

async function fetchPositioningData(domain: string): Promise<PositioningData> {
  const auth = getAuthHeader();

  const [rankedRes, competitorsRes] = await Promise.all([
    getRankedKeywords(domain, auth),
    getCompetitors(domain, auth),
  ]);

  const rankedItems = rankedRes?.tasks?.[0]?.result?.[0]?.items || [];
  const totalRankedKeywords = rankedRes?.tasks?.[0]?.result?.[0]?.total_count || 0;

  let positioningScore = 0;
  for (const item of rankedItems) {
    const pos = item.ranked_serp_element?.serp_item?.rank_group || 100;
    if (pos <= 3) positioningScore += 5;
    else if (pos <= 10) positioningScore += 3;
    else if (pos <= 20) positioningScore += 1;
  }
  positioningScore = Math.min(Math.round((positioningScore / 80) * 100), 100);
  if (totalRankedKeywords < 5) positioningScore = Math.min(positioningScore, 35);

  const topKeyword = rankedItems[0]?.keyword_data?.keyword || domain.split(".")[0];
  const suggestionsRes = await getKeywordSuggestions(topKeyword, auth);
  const suggestionItems = suggestionsRes?.tasks?.[0]?.result?.[0]?.items || [];

  const rankedKeywordSet = new Set(
    rankedItems.map((item: { keyword_data?: { keyword?: string } }) =>
      item.keyword_data?.keyword?.toLowerCase()
    )
  );

  const keywordGaps = suggestionItems
    .filter(
      (item: { keyword_data?: { keyword?: string }; keyword?: string }) => {
        const kw = item.keyword_data?.keyword || item.keyword;
        return kw && !rankedKeywordSet.has(kw.toLowerCase());
      }
    )
    .slice(0, 3)
    .map((item: {
      keyword_data?: {
        keyword?: string;
        keyword_info?: { search_volume?: number; keyword_difficulty?: number };
      };
      keyword?: string;
      keyword_info?: { search_volume?: number; keyword_difficulty?: number };
      search_volume?: number;
      keyword_difficulty?: number;
    }) => ({
      keyword: item.keyword_data?.keyword || item.keyword || "",
      volume: item.keyword_data?.keyword_info?.search_volume || item.keyword_info?.search_volume || item.search_volume || 0,
      difficulty: item.keyword_data?.keyword_info?.keyword_difficulty || item.keyword_info?.keyword_difficulty || item.keyword_difficulty || 0,
      position: 0,
    }));

  const competitorItems = competitorsRes?.tasks?.[0]?.result?.[0]?.items || [];
  const competitors = competitorItems.length || 3;

  const missedVolume = keywordGaps.reduce(
    (sum: number, kw: { volume: number }) => sum + kw.volume,
    0
  );
  const financialLoss = Math.max(Math.round(missedVolume * 0.05 * 2), 350);
  const missingPages = Math.max(keywordGaps.length, 3);

  return {
    positioningScore: Math.max(positioningScore, 5),
    keywords: keywordGaps.length > 0 ? keywordGaps : getFallbackKeywords(domain),
    financialLoss,
    competitors,
    missingPages,
  };
}

function getFallbackKeywords(domain: string) {
  const name = domain.split(".")[0];
  return [
    { keyword: `${name} avis`, volume: 320, difficulty: 20, position: 0 },
    { keyword: `${name} contact`, volume: 210, difficulty: 15, position: 0 },
    { keyword: `${name} tarifs`, volume: 170, difficulty: 25, position: 0 },
    { keyword: `${name} services`, volume: 140, difficulty: 18, position: 0 },
    { keyword: `${name} horaires`, volume: 110, difficulty: 12, position: 0 },
  ];
}

/* ─── POST Handler ─────────────────────────────────── */

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "rate_limited", message: "Vous avez atteint la limite d'audits. Contactez-nous directement." },
        { status: 429 }
      );
    }

    const { url, email } = await request.json();
    if (!url || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const domain = extractDomain(url);

    // Run ALL three data sources in PARALLEL
    const [pageSpeedResult, scrapingResult, positioningResult] = await Promise.allSettled([
      fetchPageSpeed(url, "mobile"),
      scrapeAndAnalyze(url),
      fetchPositioningData(domain),
    ]);

    const ps: PageSpeedData | null =
      pageSpeedResult.status === "fulfilled" ? pageSpeedResult.value : null;
    const sc: ScrapingData | null =
      scrapingResult.status === "fulfilled" ? scrapingResult.value : null;
    const positioning: PositioningData =
      positioningResult.status === "fulfilled"
        ? positioningResult.value
        : {
            positioningScore: 15,
            keywords: getFallbackKeywords(domain),
            financialLoss: 1200,
            competitors: 5,
            missingPages: 7,
          };

    if (pageSpeedResult.status === "rejected") {
      console.error("PageSpeed error:", pageSpeedResult.reason);
    }
    if (scrapingResult.status === "rejected") {
      console.error("Scraping error:", scrapingResult.reason);
    }
    if (positioningResult.status === "rejected") {
      console.error("DataForSEO error:", positioningResult.reason);
    }

    // Build categories
    const performanceItems = buildPerformanceItems(ps, sc);
    const seoItems = buildSeoItems(ps, sc);
    const mobileItems = buildMobileItems(ps, sc);
    const securityItems = buildSecurityItems(ps, sc);

    const performanceScore = ps ? Math.round(ps.performance) : 0;
    const seoScore = ps ? Math.round(ps.seo) : 0;
    const accessibilityScore = ps ? Math.round(ps.accessibility) : 0;
    const bestPracticesScore = ps ? Math.round(ps.bestPractices) : 0;
    const mobileScore = computeMobileScore(ps);
    const securityScore = computeSecurityScore(sc);
    const globalScore = computeGlobalScore(ps, sc);

    const lcpSec = ps ? ps.lcp / 1000 : 0;

    const results: ScanResults = {
      globalScore,
      screenshot: ps?.screenshotBase64 ?? null,
      categories: {
        performance: { score: performanceScore, items: performanceItems },
        seo: { score: seoScore, items: seoItems },
        mobile: { score: mobileScore, items: mobileItems },
        security: { score: securityScore, items: securityItems },
      },
      keyMetrics: {
        loadTime: ps ? `${lcpSec.toFixed(1)}s` : "N/A",
        mobileReady: ps ? ps.tapTargetsOk && ps.fontSizeOk : false,
        seoReady: (ps?.hasMetaDescription ?? false) && (ps?.isCrawlable ?? false) && (sc?.h1Count === 1),
        isSecure: sc?.isHttps ?? false,
      },
      positioningScore: positioning.positioningScore,
      keywords: positioning.keywords,
      financialLoss: positioning.financialLoss,
      competitors: positioning.competitors,
      missingPages: positioning.missingPages,
      performanceScore,
      seoScore,
      accessibilityScore,
      bestPracticesScore,
      hasPageSpeed: ps !== null,
      hasScraping: sc !== null,
    };

    // Send lead capture email via Resend
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const keywordsList = results.keywords
        .map((kw) => `${kw.keyword} (${kw.volume} vol.)`)
        .join(", ");

      const failCount =
        performanceItems.filter((i) => i.status === "fail").length +
        seoItems.filter((i) => i.status === "fail").length +
        mobileItems.filter((i) => i.status === "fail").length +
        securityItems.filter((i) => i.status === "fail").length;

      const warnCount =
        performanceItems.filter((i) => i.status === "warning").length +
        seoItems.filter((i) => i.status === "warning").length +
        mobileItems.filter((i) => i.status === "warning").length +
        securityItems.filter((i) => i.status === "warning").length;

      await resend.emails.send({
        from: "AgaiGency <noreply@agaigency.com>",
        to: TO_EMAILS,
        replyTo: email,
        subject: `Nouveau lead SEO Audit — ${domain} (${globalScore}/100)`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h1 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 12px;">
              Nouveau lead — Audit SEO
            </h1>

            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Email</td><td><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">URL</td><td><a href="${normalizeUrl(url)}">${url}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Domaine</td><td>${domain}</td></tr>
            </table>

            <h2 style="margin-top: 24px;">Scores</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 160px;">Score global</td><td><strong>${globalScore}/100</strong></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Performance</td><td>${performanceScore}/100</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">SEO</td><td>${seoScore}/100</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Accessibilité</td><td>${accessibilityScore}/100</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Bonnes pratiques</td><td>${bestPracticesScore}/100</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Mobile</td><td>${mobileScore}/100</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Sécurité</td><td>${securityScore}/100</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Positionnement</td><td>${positioning.positioningScore}/100</td></tr>
            </table>

            <h2 style="margin-top: 24px;">Problèmes détectés</h2>
            <p>❌ ${failCount} erreurs critiques — ⚠️ ${warnCount} avertissements</p>

            <h2 style="margin-top: 24px;">Positionnement</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold;">Manque à gagner</td><td>${positioning.financialLoss.toLocaleString("fr-FR")} €/mois</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Concurrents</td><td>${positioning.competitors}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Mots-clés manqués</td><td>${keywordsList}</td></tr>
            </table>

            <hr style="margin-top: 32px; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">Envoyé depuis l'outil Audit SEO — agaigency.com</p>
          </div>
        `,
      });
    } catch {
      console.error("Failed to send lead email");
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
