export interface ProjectPage {
  label: string;
  image: string;
}

export interface ProjectData {
  slug: string;
  translationKey: string;
  color: string;
  liveUrl?: string;
  heroImage: string;
  pages: ProjectPage[];
}

export const projects: ProjectData[] = [
  {
    slug: "dakar-eat",
    translationKey: "dkrEat",
    color: "#e87435",
    heroImage: "/images/projects/dkr-eat/accueil.png",
    pages: [
      { label: "Accueil", image: "/images/projects/dkr-eat/accueil.png" },
      { label: "Menu", image: "/images/projects/dkr-eat/menu.png" },
      { label: "À propos", image: "/images/projects/dkr-eat/a-propos.png" },
      { label: "Contact", image: "/images/projects/dkr-eat/contact.png" },
      { label: "Admin", image: "/images/projects/dkr-eat/admin-login.png" },
    ],
  },
];

export function getProjectBySlug(slug: string): ProjectData | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAllProjectSlugs(): string[] {
  return projects.map((p) => p.slug);
}
