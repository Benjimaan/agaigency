export interface ProjectPage {
  label: string;
  image: string;
}

export interface ProjectSection {
  key: string;
  images?: string[];
  reverse?: boolean;
}

export interface ProjectData {
  slug: string;
  translationKey: string;
  color: string;
  liveUrl?: string;
  heroImage: string;
  pages: ProjectPage[];
  /** First section key used above the carousel (e.g. "website", "landing") */
  carouselSectionKey: string;
  /** Sticky text+image sections */
  sections: ProjectSection[];
}

export const projects: ProjectData[] = [
  {
    slug: "dakar-eat",
    translationKey: "dkrEat",
    color: "#e87435",
    liveUrl: "dakareat.com",
    heroImage: "/images/projects/dkr-eat/accueil.png",
    carouselSectionKey: "website",
    pages: [
      { label: "Accueil", image: "/images/projects/dkr-eat/accueil.png" },
      { label: "Menu", image: "/images/projects/dkr-eat/menu.png" },
      { label: "À propos", image: "/images/projects/dkr-eat/a-propos.png" },
      { label: "Contact", image: "/images/projects/dkr-eat/contact.png" },
      { label: "Admin", image: "/images/projects/dkr-eat/admin-login.png" },
    ],
    sections: [
      {
        key: "dashboard",
        images: ["/images/projects/dkr-eat/admin-login.png"],
        reverse: true,
      },
    ],
  },
  {
    slug: "nisware",
    translationKey: "nisware",
    color: "#e74c3c",
    heroImage: "/images/projects/nisware/desktop-full.png",
    carouselSectionKey: "landing",
    pages: [
      { label: "Desktop", image: "/images/projects/nisware/desktop-hero.png" },
      { label: "Tablet", image: "/images/projects/nisware/tablet-hero.png" },
      { label: "Mobile", image: "/images/projects/nisware/mobile-hero.png" },
    ],
    sections: [
      {
        key: "concept",
        images: ["/images/projects/nisware/mobile-full.png"],
      },
    ],
  },
  {
    slug: "duo2mc",
    translationKey: "duo2mc",
    color: "#d4a84a",
    liveUrl: "duo2mc.fr",
    heroImage: "/images/projects/duo2mc/homepage.png",
    carouselSectionKey: "website",
    pages: [
      { label: "Accueil", image: "/images/projects/duo2mc/homepage.png" },
      { label: "Mariages", image: "/images/projects/duo2mc/mariages.png" },
      { label: "Corporate", image: "/images/projects/duo2mc/corporate.png" },
      { label: "Offres", image: "/images/projects/duo2mc/offres.png" },
      { label: "Booking", image: "/images/projects/duo2mc/booking.png" },
    ],
    sections: [
      {
        key: "booking",
        images: ["/images/projects/duo2mc/booking.png"],
        reverse: true,
      },
    ],
  },
  {
    slug: "prospect-pro",
    translationKey: "prospectPro",
    color: "#3b82f6",
    heroImage: "/images/projects/prospectpro/dashboard.png",
    carouselSectionKey: "dashboard",
    pages: [
      { label: "Dashboard", image: "/images/projects/prospectpro/dashboard.png" },
      { label: "Leads", image: "/images/projects/prospectpro/leads.png" },
      { label: "Scraping", image: "/images/projects/prospectpro/scraping.png" },
      { label: "Campagnes", image: "/images/projects/prospectpro/campagnes.png" },
      { label: "Templates", image: "/images/projects/prospectpro/templates.png" },
      { label: "Statistiques", image: "/images/projects/prospectpro/statistiques.png" },
    ],
    sections: [
      {
        key: "scraping",
        images: ["/images/projects/prospectpro/scraping.png"],
      },
      {
        key: "campaigns",
        images: ["/images/projects/prospectpro/campagnes.png"],
        reverse: true,
      },
    ],
  },
];

export function getProjectBySlug(slug: string): ProjectData | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAllProjectSlugs(): string[] {
  return projects.map((p) => p.slug);
}
