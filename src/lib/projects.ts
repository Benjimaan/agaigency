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
    slug: "villa-angelie",
    translationKey: "villaAngelie",
    color: "#C5A55A",
    heroImage: "/images/projects/villaangelie/02-accueil-hero.png",
    carouselSectionKey: "website",
    pages: [
      { label: "Accueil", image: "/images/projects/villaangelie/01-accueil.png" },
      { label: "Hero", image: "/images/projects/villaangelie/02-accueil-hero.png" },
      { label: "La Villa", image: "/images/projects/villaangelie/03-la-villa.png" },
      { label: "Prestations", image: "/images/projects/villaangelie/04-prestations.png" },
      { label: "Pré-réservation", image: "/images/projects/villaangelie/05-pre-reservation.png" },
      { label: "Contact", image: "/images/projects/villaangelie/06-contact.png" },
      { label: "Mobile", image: "/images/projects/villaangelie/07-mobile-accueil.png" },
    ],
    sections: [
      {
        key: "villa",
        images: ["/images/projects/villaangelie/03-la-villa.png"],
      },
      {
        key: "prestations",
        images: ["/images/projects/villaangelie/04-prestations.png"],
        reverse: true,
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
    heroImage: "/images/projects/prospectpro/02-dashboard.png",
    carouselSectionKey: "dashboard",
    pages: [
      { label: "Login", image: "/images/projects/prospectpro/01-login.png" },
      { label: "Dashboard", image: "/images/projects/prospectpro/02-dashboard.png" },
      { label: "Leads", image: "/images/projects/prospectpro/03-leads.png" },
      { label: "Scraping", image: "/images/projects/prospectpro/04-scraping.png" },
      { label: "Campagnes", image: "/images/projects/prospectpro/05-campaigns.png" },
      { label: "Templates", image: "/images/projects/prospectpro/06-templates.png" },
      { label: "Settings", image: "/images/projects/prospectpro/07-settings.png" },
    ],
    sections: [
      {
        key: "scraping",
        images: ["/images/projects/prospectpro/04-scraping.png"],
      },
      {
        key: "campaigns",
        images: ["/images/projects/prospectpro/05-campaigns.png"],
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
