import type { Project } from "@/.contentlayer/generated";
import Link from "next/link";
import { Eye, View } from "lucide-react";

type Props = {
  project: Project;
  views: number;
};

export const Article: React.FC<Props> = ({ project, views }) => {
  return (
    <Link
      href={`/projects/${project.slug}/`}
      className="block p-6 rounded-lg transition-colors duration-150"
    >
      <article className="h-full">
        <div className="flex justify-between gap-2 items-center">
          <span className="text-xs text-zinc-500 font-mono">
            {project.date ? (
              <time dateTime={new Date(project.date).toISOString()}>
                {Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                  new Date(project.date)
                )}
              </time>
            ) : (
              <span>SOON</span>
            )}
          </span>
          {views > 0 && (
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <Eye className="w-3 h-3" />
              <span>{views}</span>
            </div>
          )}
        </div>
        <h2 className="mt-1 text-lg font-semibold text-zinc-100 font-display">
          {project.title}
        </h2>
        <p className="mt-2 text-sm text-zinc-400 line-clamp-3">
          {project.description}
        </p>
      </article>
    </Link>
  );
};