"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Github, Search, X } from "lucide-react";
import Particles from "../components/particles";
import { Card } from "../components/card";
import { SignalHeader } from "../components/SignalHeader";

interface ProjectItem {
  slug: string;
  title: string;
  description: string;
  date: string;
  url?: string;
  repository?: string;
  coverImage?: string;
  summaryTags: string[];
  tags?: string[];
  published?: boolean;
}

interface ProjectsClientProps {
  projects: ProjectItem[];
}

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = projects.filter((project) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.title.toLowerCase().includes(query) ||
      project.description.toLowerCase().includes(query) ||
      project.summaryTags.some((tag) => tag.toLowerCase().includes(query)) ||
      (project.tags || []).some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="relative min-h-screen bg-black pb-20 font-sans text-zinc-400 selection:bg-zinc-100 selection:text-zinc-950">
      <Particles className="absolute inset-0 -z-10 animate-fade-in opacity-60" quantity={60} />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-800/60 bg-black/75 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium uppercase tracking-normal text-zinc-400 transition-colors duration-200 hover:text-zinc-100">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back home
          </Link>
          <span className="font-display text-xs font-semibold uppercase tracking-normal text-zinc-500">Project index</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-32">
        <SignalHeader
          eyebrow="Project index / filtered work"
          title="Projects"
          description="Backend, applied-ML, open-source, and product-oriented builds with enough detail to evaluate the engineering work."
          meta={[`${projects.length} records`, "derived covers", "mdx source", "searchable"]}
          compact
          className="mb-10"
          minimal={true}
        />

        <div className="relative mb-12 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search projects by stack, name..."
            className="w-full rounded-full border border-zinc-800 bg-zinc-950/70 py-2.5 pl-10 pr-10 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-500 focus:border-zinc-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-800 py-20 text-center text-sm text-zinc-500">
            No matching projects found.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => {
              const repoLink = project.repository && !/private/i.test(project.repository)
                ? project.repository.startsWith("http") ? project.repository : `https://github.com/${project.repository}`
                : null;

              return (
                <Card key={project.slug}>
                  <article className="flex h-full min-h-[470px] flex-col justify-between">
                    {project.coverImage && (
                      <div className="relative aspect-[16/10] overflow-hidden border-b border-zinc-800 bg-zinc-950">
                        <Image
                          src={project.coverImage}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                          className="object-cover opacity-80 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                        />
                      </div>
                    )}

                    <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">{project.date}</p>
                          <h3 className="card-title-glitch mt-2 font-display text-2xl font-semibold tracking-normal text-zinc-100" data-text={project.title}>
                            <span>{project.title}</span>
                          </h3>
                          <p className="mt-3 text-sm leading-relaxed text-zinc-400">{project.description}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">Technologies</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {project.summaryTags.map((tech) => (
                              <button
                                type="button"
                                key={tech}
                                onClick={() => setSearchQuery(tech)}
                                className="rounded-full border border-zinc-800 bg-zinc-950/80 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500"
                              >
                                {tech}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex items-center justify-between border-t border-zinc-800/80 pt-4">
                        <Link href={`/projects/${project.slug}`} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-zinc-300 transition hover:text-white">
                          Details
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                        {repoLink && (
                          <a href={repoLink} target="_blank" rel="noreferrer" aria-label="Open repository" className="text-zinc-500 transition hover:text-zinc-200">
                            <Github className="h-4 w-4" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
