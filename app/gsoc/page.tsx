import { allGSoCPosts } from 'contentlayer/generated';
import Link from 'next/link';
import { Card } from '../components/card';
import { Navigation } from '../components/nav';
import { LazyImage } from '../components/lazy-image';
import { ProjectSkeleton } from '../components/loading-skeleton';
import { Suspense } from 'react';
import { ScrollProgressBar } from '../components/progress-bar';
import { BackToTop } from '../components/back-to-top';

type GSoCPost = {
  slug: string;
  week: number;
  date: string;
  title: string;
  description?: string;
  tags?: string[];
  cover?: string;
};

function getMainWeek(post: GSoCPost): number {
  if (post.tags) {
    const weekNums = post.tags
      .map(tag => tag.match(/^week(\d+)$/))
      .filter(Boolean)
      .map(match => parseInt(match![1], 10));
    if (weekNums.length > 0) {
      return Math.min(...weekNums);
    }
  }
  return post.week;
}

function getWeekRange(post: GSoCPost): string {
  if (post.tags) {
    const weekNums = post.tags
      .map(tag => tag.match(/^week(\d+)$/))
      .filter(Boolean)
      .map(match => parseInt(match![1], 10))
      .sort((a, b) => a - b);
    if (weekNums.length > 1) {
      return `Weeks ${weekNums.join(' & ')}`;
    } else if (weekNums.length === 1) {
      return `Week ${weekNums[0]}`;
    }
  }
  return `Week ${post.week}`;
}

function GSoCItem({ post }: { post: GSoCPost }) {
  const formattedDate = post.date
    ? Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(post.date))
    : '';
  const mainWeek = getMainWeek(post);
  const weekRange = getWeekRange(post);

  return (
    <Card key={post.slug}>
      <Link href={`/gsoc/${mainWeek}`} className="block p-6 hover:bg-zinc-800/40 rounded-lg transition-colors duration-150">
        <div className="flex flex-col gap-2">
          {post.cover && (
            <Suspense fallback={<div className="w-full h-40 bg-zinc-800/20 animate-pulse rounded" />}>
              <div className="mb-2 rounded overflow-hidden">
                <LazyImage
                  src={post.cover}
                  alt={post.title}
                  width={600}
                  height={300}
                  className="w-full h-40 object-cover rounded"
                  priority={false}
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Ss6RtNP8A4jQB5JgZzTBknyJckliyjqTzSlT54b6bk+h0R+Ss6RtNP8A4jQB5JgZzTBknyJckliyjqTzSlT54b6bk+h0R+Ss6RtNP/9k="
                />
              </div>
            </Suspense>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-500 font-mono">{weekRange}</span>
            <span className="text-xs text-zinc-400 font-mono">{formattedDate}</span>
          </div>
          <span className="text-lg font-semibold text-zinc-100 mt-1">{post.title}</span>
          {post.description && (
            <span className="text-zinc-400 mt-1 text-sm">{post.description}</span>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {post.tags.filter(tag => tag.startsWith('week')).map(tag => (
                <span key={tag} className="px-2 py-0.5 text-xs bg-zinc-700/40 text-zinc-300 rounded-full font-mono">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}

export default function GSoCPage() {
  const posts = allGSoCPosts.sort((a, b) => b.week - a.week);

  console.log('GSoC posts:', allGSoCPosts.map(p => ({ slug: p.slug, week: p.week, title: p.title })));

  return (
    <div className="relative pb-16 min-h-screen bg-zinc-900">
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