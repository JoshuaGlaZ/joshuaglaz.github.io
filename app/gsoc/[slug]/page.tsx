"use client";
import { notFound } from 'next/navigation';
import { allGSoCPosts } from 'contentlayer/generated';
import { Mdx } from '@/app/components/mdx';
import Link from 'next/link';
import { ArrowLeft, Twitter, Github } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface GSoCPostPageProps {
  params: { slug: string };
}

export default function GSoCPostPage({ params }: GSoCPostPageProps) {
  const post = allGSoCPosts.find(p => p.slug === params.slug);
  if (!post) return notFound();

  const ref = useRef<HTMLElement>(null);
  const [isIntersecting, setIntersecting] = useState(true);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new window.IntersectionObserver(([entry]) =>
      setIntersecting(entry.isIntersecting)
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-zinc-50 min-h-screen">
      <header
        ref={ref}
        className="relative isolate overflow-hidden bg-gradient-to-tl from-black via-zinc-900 to-black"
      >
        <div
          className={`fixed inset-x-0 top-0 z-50 backdrop-blur lg:backdrop-blur-none duration-200 border-b lg:bg-transparent ${
            isIntersecting
              ? 'bg-zinc-900/0 border-transparent'
              : 'bg-white/10 border-zinc-200 lg:border-transparent'
          }`}
        >
          <div className="container flex flex-row-reverse items-center justify-between p-6 mx-auto">
            <div className="flex justify-between gap-8">
              <Link target="_blank" href="https://twitter.com/chronark_">
                <Twitter
                  className={`w-6 h-6 duration-200 hover:font-medium ${
                    isIntersecting
                      ? ' text-zinc-400 hover:text-zinc-100'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                />
              </Link>
              <Link target="_blank" href="https://github.com/chronark">
                <Github
                  className={`w-6 h-6 duration-200 hover:font-medium ${
                    isIntersecting
                      ? ' text-zinc-400 hover:text-zinc-100'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                />
              </Link>
            </div>
            <Link
              href="/gsoc"
              className={`duration-200 hover:font-medium ${
                isIntersecting
                  ? ' text-zinc-400 hover:text-zinc-100'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <ArrowLeft className="w-6 h-6 " />
            </Link>
          </div>
        </div>
        <div className="container mx-auto relative isolate overflow-hidden py-32 sm:py-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center flex flex-col items-center">
            {/* GSoC 2024 badge */}
            <span className="inline-block mb-4 px-4 py-1 rounded-full bg-zinc-800 text-zinc-200 text-xs font-semibold tracking-widest uppercase">
              Google Summer of Code 2024
            </span>
            <div className="mx-auto max-w-3xl lg:mx-0">
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl font-display mb-4">
                {post.title}
              </h1>
              <p className="mt-2 text-2xl leading-9 text-zinc-300">
                {post.description}
              </p>
            </div>
            <div className="mx-auto mt-6 max-w-2xl lg:mx-0 lg:max-w-none">
              <span className="text-base text-zinc-400 font-mono">
                {post.date ? (
                  <time dateTime={new Date(post.date).toISOString()}>
                    {Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(post.date))}
                  </time>
                ) : (
                  <span>SOON</span>
                )}
                {`  |  Week ${post.week}`}
              </span>
            </div>
          </div>
        </div>
        <hr className="my-0 border-0 border-l-0 border-r-0 border-t-4 border-t-zinc-300 rounded-full w-2/3 mx-auto" />
      </header>
      <article className="px-4 py-12 mx-auto prose prose-zinc prose-quoteless max-w-4xl">
        <Mdx code={post.body.code} />
      </article>
    </div>
  );
} 