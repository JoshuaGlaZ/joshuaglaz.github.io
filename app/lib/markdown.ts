import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

export interface ProjectData {
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
  featured?: boolean;
  contentHtml: string;
}

export interface BlogData {
  slug: string;
  title: string;
  week: number;
  date: string;
  description?: string;
  tags?: string[];
  contentHtml: string;
}

const rootDir = process.cwd();

const technologyKeywords = [
  "Python",
  "FastAPI",
  "Django",
  "Flask",
  "React",
  "TypeScript",
  "JavaScript",
  "Android",
  "Docker",
  "FAISS",
  "SQLite",
  "PostgreSQL",
  "TensorFlow",
  "Keras",
  "OpenCV",
  "SVM",
  "RAG",
  "HTMX",
  "Tailwind",
  "Ionic",
  "Angular",
  "PHP",
  "AWS"
];

function getFirstMarkdownImage(content: string): string {
  const match = content.match(/!\[[^\]]*]\((\/[^)\s]+)[^)]*\)/);
  return match?.[1] || "";
}

function getSummaryTags(data: Record<string, unknown>, content: string): string[] {
  const explicitTags = data.tags;
  if (Array.isArray(explicitTags) && explicitTags.length > 0) {
    return explicitTags.slice(0, 4).map(String);
  }

  const source = `${String(data.title || "")} ${String(data.description || "")} ${content}`.toLowerCase();
  return technologyKeywords
    .filter((keyword) => source.includes(keyword.toLowerCase()))
    .slice(0, 4);
}

export function getProjects(): ProjectData[] {
  const projectsDir = path.join(rootDir, "content", "projects");
  if (!fs.existsSync(projectsDir)) return [];

  const files = fs.readdirSync(projectsDir).filter((file) => file.endsWith(".mdx") || file.endsWith(".md"));
  const list: ProjectData[] = [];

  for (const file of files) {
    const filePath = path.join(projectsDir, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    const slug = file.replace(/\.mdx?$/, "");

    list.push({
      slug,
      title: data.title || slug,
      description: data.description || "",
      date: data.date || "2024-01-01",
      url: data.url || "",
      repository: data.repository || "",
      coverImage: getFirstMarkdownImage(content),
      summaryTags: getSummaryTags(data, content),
      tags: data.tags || [],
      published: data.published ?? true,
      featured: data.featured ?? false,
      contentHtml: marked.parse(content) as string
    });
  }

  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getGSoCPosts(): BlogData[] {
  const gsocDir = path.join(rootDir, "content", "gsoc");
  if (!fs.existsSync(gsocDir)) return [];

  const files = fs.readdirSync(gsocDir).filter((file) => file.endsWith(".mdx") || file.endsWith(".md"));
  const list: BlogData[] = [];

  for (const file of files) {
    const filePath = path.join(gsocDir, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(fileContent);
    const slug = file.replace(/\.mdx?$/, "");

    list.push({
      slug,
      title: data.title || slug,
      week: data.week ?? 0,
      date: data.date || "2024-01-01",
      description: data.description || "",
      tags: data.tags || [],
      contentHtml: marked.parse(content) as string
    });
  }

  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getProject(slug: string): ProjectData | null {
  const projects = getProjects();
  return projects.find((project) => project.slug === slug) || null;
}

export function getGSoCPost(slug: string): BlogData | null {
  const posts = getGSoCPosts();
  return posts.find((post) => post.slug === slug) || null;
}

export function makeExcerpt(body: string, maxLength = 140): string {
  const clean = body
    .replace(/<[^>]+>/g, "")
    .replace(/\n+/g, " ")
    .trim();

  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength)}...`;
}
