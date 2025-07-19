import { allGSoCPosts } from 'contentlayer/generated';
import Link from 'next/link';
import { Card } from '../components/card';
import { Navigation } from '../components/nav';

// Try to infer the type from allGSoCPosts
// If not available, fallback to a minimal type
// type GSoCPost = typeof allGSoCPosts[number];
type GSoCPost = {
  slug: string;
  week: number;
  date: string;
  title: string;
  description?: string;
};

function GSoCItem({ post }: { post: GSoCPost }) {
  // Format the date as a human-readable date (not datetime)
  const formattedDate = post.date
    ? Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(post.date))
    : '';

  return (
    <Card key={post.slug}>
      <Link href={`/gsoc/${post.slug}`} className="block p-6 hover:bg-zinc-800/40 rounded-lg transition-colors duration-150">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-mono">Week {post.week}</span>
            <span className="text-xs text-zinc-400 font-mono">{formattedDate}</span>
          </div>
          <span className="text-lg font-semibold text-zinc-100 mt-1">{post.title}</span>
          {post.description && (
            <span className="text-zinc-400 mt-1 text-sm">{post.description}</span>
          )}
        </div>
      </Link>
    </Card>
  );
}

export default function GSoCPage() {
  const posts = allGSoCPosts.sort((a, b) => b.week - a.week);

  // Debug: List all post slugs and weeks
  // Remove or comment out in production
  console.log('GSoC posts:', allGSoCPosts.map(p => ({ slug: p.slug, week: p.week, title: p.title })));

  return (
    <div className="relative pb-16">
      <Navigation />
      <div className="px-6 pt-20 mx-auto space-y-8 max-w-7xl lg:px-8 md:space-y-16 md:pt-24 lg:pt-32">
        <div className="max-w-2xl mx-auto lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            Google Summer of Code 2024
          </h2>
          <p className="mt-4 text-zinc-400">
            Welcome to my GSoC 2024 journey! Here you'll find my project details, weekly reports, and progress updates.
          </p>
        </div>
        <div className="w-full h-px bg-zinc-800" />
        <div className="grid grid-cols-1 gap-8 mx-auto lg:grid-cols-2 ">
          {posts.map(post => (
            <GSoCItem key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
} 