import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getGSoCPost, getGSoCPosts } from "../../lib/markdown";
import Particles from "../../components/particles";
import { SignalHeader } from "../../components/SignalHeader";

export async function generateStaticParams() {
	const posts = getGSoCPosts();
	return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}): Promise<Metadata> {
	const { slug } = await params;
	const post = getGSoCPost(slug);
	if (!post) return { title: "Post not found" };

	return {
		title: post.title,
		description: post.description || `Week ${post.week} updates for GSoC 2024.`,
	};
}

export default async function BlogPostPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const post = getGSoCPost(slug);
	if (!post) notFound();

	const dateObj = new Date(post.date);
	const dateStr = dateObj.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric"
	});

	return (
		<div className="relative min-h-screen bg-black text-zinc-400 font-sans selection:bg-zinc-800 selection:text-white pb-24">
			{/* Background Particles */}
			<Particles className="absolute inset-0 -z-10 animate-fade-in" quantity={60} />

			{/* Header sticky menu */}
			<header className="fixed top-0 inset-x-0 z-50 bg-zinc-950/70 backdrop-blur-md border-b border-zinc-800/50 py-4">
				<div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
					<Link
						href="/blog"
						className="flex items-center gap-2 text-sm font-medium tracking-normal text-zinc-400 transition-colors duration-200 hover:text-zinc-100 uppercase"
					>
						<ArrowLeft className="h-4 w-4" /> All Blog Posts
					</Link>
				</div>
			</header>

			{/* Main Content Area */}
			<main className="mx-auto max-w-4xl px-6 pt-32">
				<SignalHeader
					eyebrow={`GSoC log / week ${post.week}`}
					title={post.title}
					description={post.description}
					meta={[dateStr, "GSoC 2024", "noWorkflow", "MDX source"]}
					compact
					className="mb-12"
					showSwarm={true}
				/>

				{/* Article Body */}
				<article
					className="prose prose-zinc prose-invert max-w-none mt-12 
					prose-headings:font-display prose-headings:font-semibold prose-headings:text-zinc-100
					prose-p:leading-relaxed prose-p:text-zinc-300
					prose-a:text-zinc-200 prose-a:underline hover:prose-a:text-white
					prose-code:text-zinc-200 prose-code:bg-zinc-900/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
					prose-pre:bg-zinc-900/80 prose-pre:border prose-pre:border-zinc-800"
					dangerouslySetInnerHTML={{ __html: post.contentHtml }}
				/>

				<div className="mt-20 pt-8 border-t border-zinc-800 flex justify-between">
					<Link
						href="/blog"
						className="text-sm font-semibold uppercase tracking-normal text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5"
					>
						<ArrowLeft className="h-4 w-4" /> Back to writing
					</Link>
				</div>
			</main>
		</div>
	);
}

