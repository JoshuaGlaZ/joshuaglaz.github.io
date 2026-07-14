import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, CheckCircle2, FileText, Github, Linkedin, Mail } from "lucide-react";
import Navigation from "./components/Navigation";
import Particles from "./components/particles";

import HeroGlobe from "./components/HeroGlobe";
import { Journey } from "./components/Journey";
import { Card } from "./components/card";
import { getGSoCPosts, getProjects, makeExcerpt } from "./lib/markdown";

const techSkills = [
  "Python",
  "FastAPI",
  "Django",
  "PyTorch",
  "scikit-learn",
  "FAISS",
  "PostgreSQL",
  "Docker",
  "AWS Lightsail",
  "Prometheus",
  "TypeScript",
  "React"
];

const stats = [
  { value: "Surabaya, ID", label: "Current base" },
  { value: "Python + ML", label: "Primary build lane" },
  { value: "Portfolio-ready", label: "Project posture" }
];

const proofSignals = [
  {
    label: "Search systems",
    value: "Local-first RAG",
    copy: "StrataSearch combines scraping, ingestion, FAISS retrieval, and reranking for codebase documentation."
  },
  {
    label: "Open source",
    value: "Python provenance",
    copy: "GSoC work on noWorkflow surfaces AST and trial views for understanding how scripts evolve."
  },
  {
    label: "Applied ML",
    value: "Real-time feedback",
    copy: "ARIA connects Android audio capture with backend inference for sub-300 ms piano practice feedback."
  }
];

const focusAreas = [
  {
    title: "Service architecture",
    copy: "FastAPI, Django, data contracts, background workflows, and clear operational surfaces for demos that can be inspected."
  },
  {
    title: "Evidence-led ML",
    copy: "Retrieval, anomaly detection, recommender evaluation, and inference paths that keep baselines and assumptions visible."
  },
  {
    title: "Practical delivery",
    copy: "Project pages, deployment notes, and user-facing demos that show how models, services, and workflows connect."
  }
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com/JoshuaGlaZ", icon: Github },
  { label: "LinkedIn", href: "https://linkedin.com/in/joshua-daniel-talahatu", icon: Linkedin },
  { label: "Resume", href: "/resume/JoshuaDaniel_FXMedia.pdf", icon: FileText },
  { label: "Email", href: "mailto:joshuatalahatu7@gmail.com", icon: Mail }
];

const projectOutcomes: Record<string, string[]> = {
  stratasearch: [
    "Multi-stage retrieval pipeline for legacy-vs-modern documentation",
    "CLI workflow for scraping, ingestion, and evaluation"
  ],
  noworkflow: [
    "Open-source provenance tooling contribution through GSoC",
    "AST, trial, and comparison views for Python script analysis"
  ],
  aria: [
    "Real-time pitch and rhythm feedback for self-learners",
    "Mistake classification backed by annotated piano audio data"
  ]
};

export default async function Home() {
  const allProjects = getProjects();
  const allBlogs = getGSoCPosts();

  const featuredSlugs = ["stratasearch", "noworkflow", "aria"];
  const featuredProjects = featuredSlugs
    .map((slug) => allProjects.find((project) => project.slug === slug))
    .filter((project): project is (typeof allProjects)[number] => Boolean(project));

  if (featuredProjects.length < 3) {
    const remaining = allProjects.filter((project) => !featuredSlugs.includes(project.slug));
    featuredProjects.push(...remaining.slice(0, 3 - featuredProjects.length));
  }

  const latestBlogs = allBlogs.slice(0, 3);

  return (
    <div id="top" className="relative min-h-screen overflow-hidden bg-black text-zinc-400 font-sans selection:bg-zinc-100 selection:text-zinc-950">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_50%_0%,rgba(82,82,91,0.34),transparent_32rem),linear-gradient(#000,#050505)]" />
      <Navigation />

      <section id="hero" className="relative isolate flex min-h-[92svh] flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-28 text-center sm:pb-20">
        <Particles className="absolute inset-0 z-0 animate-fade-in opacity-40" quantity={85} size={[0.15, 1.6]} speed={0.16} />
        <div aria-hidden="true" className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_45%,rgba(0,0,0,0.08)_0,rgba(0,0,0,0.32)_30rem,#000_54rem)]" />

        <div className="site-load-reveal relative z-10 flex flex-col items-center">
          <p className="hero-fade text-xs font-medium uppercase tracking-normal text-zinc-400">
            Backend & Applied ML
          </p>
          <div className="hero-title-stage relative mt-6 max-w-6xl px-2 py-4">
            <HeroGlobe className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[20rem] w-[min(112vw,44rem)] -translate-x-1/2 -translate-y-1/2 opacity-[0.34] mix-blend-screen sm:h-[28rem] sm:opacity-[0.4] md:h-[32rem] lg:h-[34rem]" />
            <h1 className="relative z-10 animate-title font-display text-5xl font-bold leading-none tracking-normal text-zinc-100 sm:text-7xl md:text-8xl lg:text-9xl">
              Joshua Daniel Talahatu
            </h1>
          </div>
          <p className="hero-fade mt-7 max-w-3xl text-base leading-8 text-zinc-300 sm:text-xl">
            Python-focused backend developer shaping retrieval systems, ML inference workflows, and portfolio demos that can be audited end to end.
          </p>

          <div className="hero-fade mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#projects"
              className="glitch-button inline-flex items-center gap-2 rounded-full bg-zinc-100 px-5 py-3 text-xs font-semibold uppercase tracking-normal text-zinc-950 transition hover:bg-white"
            >
              See the work
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#contact"
              className="glitch-button inline-flex items-center gap-2 rounded-full border border-zinc-700 px-5 py-3 text-xs font-semibold uppercase tracking-normal text-zinc-200 transition hover:border-zinc-400 hover:text-white"
            >
              Get in touch
            </a>
          </div>

          <div className="hero-fade mt-9 flex items-center justify-center gap-3">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"}
                  aria-label={link.label}
                  title={link.label}
                  className="glitch-button flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-black/55 text-zinc-300 backdrop-blur transition-colors duration-200 hover:border-zinc-400 hover:bg-zinc-900 hover:text-white"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              );
            })}
          </div>

          <div className="hero-fade mt-12 grid w-full max-w-5xl gap-3 text-left sm:grid-cols-3">
            {proofSignals.map((signal) => (
              <div key={signal.label} className="rounded-lg border border-zinc-800/90 bg-zinc-950/70 p-4 shadow-[0_18px_70px_rgba(0,0,0,0.28)] backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">{signal.label}</p>
                <p className="mt-2 font-display text-xl font-semibold tracking-normal text-zinc-100">{signal.value}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{signal.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl border-t border-zinc-900 px-6 py-24 md:py-32">
        <div className="grid gap-10 lg:grid-cols-[160px_1fr] lg:gap-16">
          <div className="flex flex-col gap-3 lg:pt-4">
            <span className="text-xs font-medium uppercase tracking-normal text-zinc-500">About</span>
            <span aria-hidden="true" className="h-px w-12 bg-zinc-700" />
          </div>
          <div>
            <h2 className="font-display text-4xl font-bold tracking-normal text-zinc-100 sm:text-5xl md:text-6xl">
              Systems, retrieval, and ML demos with receipts
            </h2>
            <div className="mt-8 max-w-3xl space-y-6 text-base leading-8 text-zinc-400 sm:text-lg">
              <p>
                I build Python-heavy backend systems and applied ML projects where the engineering story matters as much as the model. The strongest pieces combine APIs, reproducible evaluation, retrieval, and deployment-ready demos.
              </p>
              <p>
                This portfolio is intentionally practical: open-source provenance work, RAG/search systems, recommender experiments, and anomaly-detection services that show how data moves from notebooks into usable software.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {focusAreas.map((area) => (
                <div key={area.title} className="rounded-lg border border-zinc-800 bg-zinc-950/55 p-5">
                  <h3 className="font-display text-lg font-semibold tracking-normal text-zinc-100">{area.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{area.copy}</p>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">Stack and tools</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {techSkills.map((tech) => (
                  <span key={tech} className="rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1.5 text-xs font-medium text-zinc-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-8 border-t border-zinc-800/80 pt-10 sm:grid-cols-3 sm:gap-6">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl font-semibold tracking-normal text-zinc-100 sm:text-4xl">{stat.value}</p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-normal text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="experience" className="mx-auto max-w-5xl border-t border-zinc-900 px-6 py-24 md:py-32">
        <div className="mb-10 flex flex-col gap-3 md:mb-14">
          <span className="text-xs font-medium uppercase tracking-normal text-zinc-500">Experience</span>
          <h2 className="font-display text-4xl font-bold tracking-normal text-zinc-100 sm:text-5xl md:text-6xl">
            Work and education
          </h2>
        </div>
        <Journey />
      </section>

      <section id="projects" className="mx-auto max-w-6xl border-t border-zinc-900 px-6 py-24 md:py-32">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-normal text-zinc-500">Featured</span>
            <h2 className="font-display text-4xl font-bold tracking-normal text-zinc-100 sm:text-5xl md:text-6xl">Projects</h2>
          </div>
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-normal text-zinc-400 transition-colors hover:text-zinc-200">
            See all work
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project) => {
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
                  <div className="flex flex-1 flex-col justify-between p-6">
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
                            <span key={tech} className="rounded-full border border-zinc-800 bg-zinc-950/80 px-2.5 py-1 text-xs font-medium text-zinc-300">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      {projectOutcomes[project.slug] && (
                        <div>
                          <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">Evidence</p>
                          <ul className="mt-2 space-y-2">
                            {projectOutcomes[project.slug].map((outcome) => (
                              <li key={outcome} className="flex gap-2 text-sm leading-6 text-zinc-300">
                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-300" aria-hidden="true" />
                                <span>{outcome}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
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
      </section>

      <section id="blog" className="mx-auto max-w-5xl border-t border-zinc-900 px-6 py-24 md:py-32">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-medium uppercase tracking-normal text-zinc-500">Writing</span>
            <h2 className="font-display text-4xl font-bold tracking-normal text-zinc-100 sm:text-5xl md:text-6xl">GSoC dev logs</h2>
          </div>
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-normal text-zinc-400 transition-colors hover:text-zinc-200">
            See all logs
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="space-y-4">
          {latestBlogs.map((blog) => {
            const dateObj = new Date(blog.date);
            const dateStr = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            const excerpt = blog.description || makeExcerpt(blog.contentHtml, 120);

            return (
              <Link key={blog.slug} href={`/blog/${blog.slug}`} className="group flex flex-col justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-950/45 p-6 transition duration-300 hover:border-zinc-600 hover:bg-zinc-950/70 sm:flex-row sm:items-baseline">
                <div className="max-w-3xl space-y-1">
                  <h3 className="font-display text-xl font-semibold tracking-normal text-zinc-100 transition-colors group-hover:text-white">{blog.title}</h3>
                  <p className="line-clamp-2 text-sm text-zinc-400">{excerpt}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 sm:shrink-0">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {dateStr}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-5xl border-t border-zinc-900 px-6 py-24 md:py-32">
        <div className="mb-10 flex flex-col gap-3 md:mb-14">
          <span className="text-xs font-medium uppercase tracking-normal text-zinc-500">Contact</span>
          <h2 className="font-display text-4xl font-bold tracking-normal text-zinc-100 sm:text-5xl md:text-6xl">Get in touch</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {socialLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a key={link.label} href={link.href} target={link.href.startsWith("mailto:") ? undefined : "_blank"} rel={link.href.startsWith("mailto:") ? undefined : "noreferrer"} className="group relative flex flex-col items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-950/55 p-7 text-center transition duration-300 hover:border-zinc-600 hover:bg-zinc-950/80">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 text-zinc-200 transition-colors duration-300 group-hover:border-zinc-500 group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-base font-medium tracking-normal text-zinc-100 break-all">{link.label === "Email" ? "joshuatalahatu7@gmail.com" : link.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-normal text-zinc-500">{link.label}</p>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <footer className="relative z-10 w-full border-t border-white/10 bg-black py-8">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-xs text-white/40">Copyright 2026 Joshua Daniel Talahatu. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
