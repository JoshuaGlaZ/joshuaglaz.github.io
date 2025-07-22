import Link from "next/link";
import React from "react";
import { allProjects } from "contentlayer/generated";
import { Navigation } from "../components/nav";
import { Card } from "../components/card";
import { ViewCounter } from "../components/ViewCounter";

export const dynamic = 'force-static';
export const revalidate = false;

export default function ProjectsPage() {
  const published = allProjects.filter(p => p.published);
  const featured = published.find(p => p.slug === "noworkflow")!;
  const top2 = published.find(p => p.slug === "aria")!;
  const top3 = published.find(p => p.slug === "bank_py")!;
  const rest = published.filter(p => ![featured.slug, top2.slug, top3.slug].includes(p.slug))
    .sort((a, b) => new Date(b.date ?? 0).valueOf() - new Date(a.date ?? 0).valueOf());

  return (
    <div className="relative pb-16">
      <Navigation />
      <div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8">
        <header className="max-w-2xl mx-auto lg:mx-0">
          <h2 className="text-3xl font-bold text-zinc-100 sm:text-4xl">Projects</h2>
          <p className="mt-4 text-zinc-400">Some of the projects are from work and some are on my own time.</p>
        </header>
        <div className="w-full h-px bg-zinc-800" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <Link href={`/projects/${featured.slug}`}>
              <article className="p-8">
                <div className="flex justify-between items-center">
                  <time dateTime={new Date(featured.date!).toISOString()}>
                    {Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(featured.date!))}
                  </time>
                  <ViewCounter slug={featured.slug} initial={0} />
                </div>
                <h3 className="mt-4 text-3xl font-bold text-zinc-100">{featured.title}</h3>
                <p className="mt-2 text-zinc-400">{featured.description}</p>
              </article>
            </Link>
          </Card>

          <div className="flex flex-col gap-8">
            {[top2, top3].map(p => (
              <Card key={p.slug}>
                <Link href={`/projects/${p.slug}`}>
                  <article className="p-8 flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-medium text-zinc-100">{p.title}</h3>
                      <time className="text-xs text-zinc-400" dateTime={new Date(p.date!).toISOString()}>
                        {Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(p.date!))}
                      </time>
                    </div>
                    <ViewCounter slug={p.slug} initial={0} />
                  </article>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {rest.map(p => (
            <Card key={p.slug}>
              <Link href={`/projects/${p.slug}`}>
                <article className="p-4 flex justify-between items-center">
                  <span>{p.title}</span>
                  <ViewCounter slug={p.slug} initial={0} />
                </article>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
