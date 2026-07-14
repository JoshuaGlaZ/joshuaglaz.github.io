import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Github, ArrowLeft, ArrowUpRight } from "lucide-react";
import { getProject, getProjects } from "../../lib/markdown";
import Particles from "../../components/particles";
import { SignalHeader } from "../../components/SignalHeader";

export async function generateStaticParams() {
	const projects = getProjects();
	return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const project = getProject(slug);
	if (!project) return { title: "Project not found" };
	
	return {
		title: project.title,
		description: project.description,
	};
}

export default async function ProjectPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const project = getProject(slug);
	if (!project) notFound();

	const repoLink = project.repository && !/private/i.test(project.repository)
		? (project.repository.startsWith("http") ? project.repository : `https://github.com/${project.repository}`)
		: null;

	return (
		<div className="relative min-h-screen bg-black text-zinc-400 font-sans selection:bg-zinc-800 selection:text-white pb-24">
			{/* Background Particles */}
			<Particles className="absolute inset-0 -z-10 animate-fade-in" quantity={60} />

			{/* Header sticky menu */}
			<header className="fixed top-0 inset-x-0 z-50 bg-zinc-950/70 backdrop-blur-md border-b border-zinc-800/50 py-4">
				<div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
					<Link
						href="/projects"
						className="flex items-center gap-2 text-sm font-medium tracking-normal text-zinc-400 transition-colors duration-200 hover:text-zinc-100 uppercase"
					>
						<ArrowLeft className="h-4 w-4" /> All Projects
					</Link>
					{repoLink && (
						<a
							href={repoLink}
							target="_blank"
							rel="noreferrer"
							className="text-zinc-400 hover:text-zinc-100 transition-colors"
							title="GitHub Repo"
						>
							<Github className="h-5 w-5" />
						</a>
					)}
				</div>
			</header>

			{/* Main Content Area */}
			<main className="mx-auto max-w-4xl px-6 pt-32">
				<SignalHeader
					eyebrow={`Project / ${project.slug}`}
					title={project.title}
					description={project.description}
					meta={[project.date, ...project.summaryTags.slice(0, 3)]}
					compact
					className="mb-12"
					showSwarm={true}
				>
					<div className="flex flex-wrap items-center gap-3">
						{repoLink && (
							<a
								href={repoLink}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-xs font-semibold uppercase tracking-normal text-zinc-950 transition hover:bg-white"
							>
								<Github className="h-4 w-4" aria-hidden="true" />
								Repository
							</a>
						)}
						{project.url && (
							<a
								href={project.url}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-xs font-semibold uppercase tracking-normal text-zinc-200 transition hover:border-zinc-400 hover:text-white"
							>
								Live link
								<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
							</a>
						)}
					</div>
				</SignalHeader>

				{/* Markdown Content rendered as clean prose */}
				<article
					className="prose prose-zinc prose-invert max-w-none mt-12 
					prose-headings:font-display prose-headings:font-semibold prose-headings:text-zinc-100
					prose-p:leading-relaxed prose-p:text-zinc-300
					prose-a:text-zinc-200 prose-a:underline hover:prose-a:text-white
					prose-code:text-zinc-200 prose-code:bg-zinc-900/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
					prose-pre:bg-zinc-900/80 prose-pre:border prose-pre:border-zinc-800"
					dangerouslySetInnerHTML={{ __html: project.contentHtml }}
				/>

				<div className="mt-20 pt-8 border-t border-zinc-800 flex justify-between">
					<Link
						href="/projects"
						className="text-sm font-semibold uppercase tracking-normal text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5"
					>
						<ArrowLeft className="h-4 w-4" /> Back to projects
					</Link>
				</div>
			</main>
		</div>
	);
}

