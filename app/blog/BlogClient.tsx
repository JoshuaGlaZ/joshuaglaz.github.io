"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, X, Calendar } from "lucide-react";
import Particles from "../components/particles";
import { SignalHeader } from "../components/SignalHeader";

interface BlogItem {
	slug: string;
	title: string;
	date: string;
	description?: string;
}

interface BlogClientProps {
	blogs: BlogItem[];
}

export default function BlogClient({ blogs }: BlogClientProps) {
	const [searchQuery, setSearchQuery] = useState("");

	const filtered = blogs.filter((b) => {
		if (!searchQuery.trim()) return true;
		const q = searchQuery.toLowerCase();
		return (
			b.title.toLowerCase().includes(q) ||
			(b.description || "").toLowerCase().includes(q) ||
			b.slug.toLowerCase().includes(q)
		);
	});

	return (
		<div className="relative min-h-screen bg-black text-zinc-400 font-sans selection:bg-zinc-800 selection:text-white pb-20">
			{/* Canvas particles background */}
			<Particles className="absolute inset-0 -z-10 animate-fade-in" quantity={60} />

			{/* Top nav */}
			<header className="fixed top-0 inset-x-0 z-50 bg-zinc-950/70 backdrop-blur-md border-b border-zinc-800/50 py-4">
				<div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
					<Link
						href="/"
						className="flex items-center gap-2 text-sm font-medium tracking-normal text-zinc-400 transition-colors duration-200 hover:text-zinc-100 uppercase"
					>
						<ArrowLeft className="h-4 w-4" /> Back Home
					</Link>
					<span className="text-xs uppercase tracking-normal text-zinc-500 font-display font-semibold font-mono">
						GSoC Logs
					</span>
				</div>
			</header>

			<main className="mx-auto max-w-4xl px-6 pt-32">
				{/* Header */}
				<SignalHeader
					eyebrow="Writing / GSoC evidence"
					title="Dev Logs"
					description="Progress logs from the GSoC 2024 noWorkflow contribution, kept as supporting evidence for the open-source work."
					meta={[`${blogs.length} logs`, "noworkflow", "gsoc 2024", "mdx source"]}
					compact
					className="mb-10"
					minimal={true}
				/>

				{/* Search Bar */}
				<div className="relative mb-12 max-w-md">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search logs by keyword, week..."
						className="w-full rounded-full border border-zinc-800 bg-zinc-950/60 py-2.5 pl-10 pr-10 text-sm text-zinc-200 placeholder-zinc-500 outline-none transition focus:border-zinc-500"
					/>
					{searchQuery && (
						<button
							onClick={() => setSearchQuery("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
							aria-label="Clear search"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>

				{/* List */}
				{filtered.length === 0 ? (
					<div className="py-20 text-center text-sm text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
						No matching logs found.
					</div>
				) : (
					<div className="space-y-6">
						{filtered.map((b) => {
							const dateObj = new Date(b.date);
							const dateStr = dateObj.toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric"
							});
							return (
								<Link
									key={b.slug}
									href={`/blog/${b.slug}`}
									className="group flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950/20 p-4 sm:p-6 transition-all duration-300 hover:border-zinc-500/50 hover:bg-zinc-950/50"
								>
									<div className="space-y-1 max-w-2xl min-w-0">
										<h3 className="font-display text-lg sm:text-xl font-semibold text-zinc-100 transition-colors duration-200 group-hover:text-white">
											{b.title}
										</h3>
										{b.description && (
											<p className="text-sm text-zinc-400 line-clamp-2">
												{b.description}
											</p>
										)}
									</div>
									<div className="flex items-center gap-2 text-xs text-zinc-500 sm:shrink-0 font-mono">
										<Calendar className="h-3.5 w-3.5" />
										{dateStr}
									</div>
								</Link>
							);
						})}
					</div>
				)}
			</main>
		</div>
	);
}

