import Link from "next/link";
import React from "react";
import { allProjects } from "contentlayer/generated";
import { Navigation } from "../components/nav";
import { Card } from "../components/card";
import { Article } from "./article";

export default function ProjectsPage() {
  const publishedProjects = allProjects.filter(p => p.published);

  if (publishedProjects.length === 0) {
    return (
      <div className="relative pb-16">
        <Navigation />
        <div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32">
          <div className="max-w-2xl mx-auto lg:mx-0">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
              Projects
            </h2>
            <p className="mt-4 text-zinc-400">
              Some of the projects are from work and some are on my own time.
            </p>
          </div>
          <div className="w-full h-px bg-zinc-800" />
          <p className="text-zinc-400">No projects available yet.</p>
        </div>
      </div>
    );
  }

  const sortedProjects = publishedProjects.sort(
    (a, b) =>
      new Date(b.date ?? '1970-01-01').getTime() -
      new Date(a.date ?? '1970-01-01').getTime(),
  );

  const featured = sortedProjects.find((project) => project.slug === "noworkflow") || sortedProjects[0];
  const top2 = sortedProjects.find((project) => project.slug === "aria");
  const top3 = sortedProjects.find((project) => project.slug === "bank_py");

  const usedSlugs = new Set([featured?.slug, top2?.slug, top3?.slug].filter(Boolean));
  const remainingProjects = sortedProjects.filter(project => !usedSlugs.has(project.slug));
  return (
    <div className="relative pb-16">
      <Navigation />
      <div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32">
        <div className="max-w-2xl mx-auto lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            Projects
          </h2>
          <p className="mt-4 text-zinc-400">
            Some of the projects are from work and some are on my own time.
          </p>
        </div>
        <div className="w-full h-px bg-zinc-800" />

        {featured && (
          <>
            <div className="grid grid-cols-1 gap-8 mx-auto lg:grid-cols-2">
              <Card>
                <Link
                  href={`/projects/${featured.slug}`}
                  className="block p-8 hover:bg-zinc-800/40 rounded-lg transition-colors duration-150"
                >
                  <article className="relative w-full h-full">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-zinc-500 font-mono">
                        {featured.date ? (
                          <time dateTime={new Date(featured.date).toISOString()}>
                            {Intl.DateTimeFormat(undefined, {
                              dateStyle: "medium",
                            }).format(new Date(featured.date))}
                          </time>
                        ) : (
                          <span>SOON</span>
                        )}
                      </span>
                    </div>

                    <h2
                      id="featured-post"
                      className="mt-4 text-3xl font-bold text-zinc-100 group-hover:text-white sm:text-4xl font-display"
                    >
                      {featured.title}
                    </h2>
                    <p className="mt-4 leading-8 text-zinc-400 group-hover:text-zinc-300 line-clamp-4">
                      {featured.description}
                    </p>
                    <div className="mt-6">
                      <p className="hidden text-zinc-200 hover:text-zinc-50 lg:block">
                        Read more <span aria-hidden="true">&rarr;</span>
                      </p>
                    </div>
                  </article>
                </Link>
              </Card>

              <div className="flex flex-col w-full gap-8 mx-auto border-t border-gray-900/10 lg:mx-0 lg:border-t-0">
                {top2 && (
                  <Card key={top2.slug}>
                    <Article project={top2} views={0} />
                  </Card>
                )}

                {top3 && (
                  <Card key={top3.slug}>
                    <Article project={top3} views={0} />
                  </Card>
                )}

                {(!top2 || !top3) && remainingProjects.slice(0, top2 && top3 ? 0 : (top2 || top3 ? 1 : 2)).map((project) => (
                  <Card key={project.slug}>
                    <Article project={project} views={0} />
                  </Card>
                ))}
              </div>
            </div>

            {remainingProjects.length > 0 && (
              <div className="hidden w-full h-px md:block bg-zinc-800" />
            )}
          </>
        )}

        {remainingProjects.length > 0 && (
          <div className="grid grid-cols-1 gap-4 mx-auto lg:mx-0 md:grid-cols-3">
            <div className="grid grid-cols-1 gap-4">
              {remainingProjects
                .filter((_, i) => i % 3 === 0)
                .map((project) => (
                  <Card key={project.slug}>
                    <Article project={project} views={0} />
                  </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 gap-4">
              {remainingProjects
                .filter((_, i) => i % 3 === 1)
                .map((project) => (
                  <Card key={project.slug}>
                    <Article project={project} views={0} />
                  </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 gap-4">
              {remainingProjects
                .filter((_, i) => i % 3 === 2)
                .map((project) => (
                  <Card key={project.slug}>
                    <Article project={project} views={0} />
                  </Card>
                ))}
            </div>
          </div>
        )}

        {publishedProjects.length <= 3 && !featured && (
          <div className="grid grid-cols-1 gap-4 mx-auto lg:mx-0 md:grid-cols-2 lg:grid-cols-3">
            {publishedProjects.map((project) => (
              <Card key={project.slug}>
                <Article project={project} views={0} />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}