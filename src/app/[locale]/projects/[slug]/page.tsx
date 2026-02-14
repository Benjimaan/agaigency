import { notFound } from "next/navigation";
import { getProjectBySlug, getAllProjectSlugs } from "@/lib/projects";
import CaseStudyPage from "@/components/CaseStudyPage";

export function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return <CaseStudyPage project={project} />;
}
