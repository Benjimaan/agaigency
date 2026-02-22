import type { Metadata } from "next";
import { inter } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.agaigency.com"),
  title: "AgaiGency — Agence Digitale Premium",
  description:
    "Nous créons des sites web premium qui convertissent. Design, développement et stratégie digitale sur mesure.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  alternates: {
    canonical: "https://www.agaigency.com",
  },
  openGraph: {
    title: "AgaiGency — Agence Digitale Premium",
    description:
      "Nous créons des sites web premium qui convertissent. Design, développement et stratégie digitale sur mesure.",
    url: "https://www.agaigency.com",
    siteName: "AgaiGency",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AgaiGency — Agence Digitale Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgaiGency — Agence Digitale Premium",
    description:
      "Nous créons des sites web premium qui convertissent. Design, développement et stratégie digitale sur mesure.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
