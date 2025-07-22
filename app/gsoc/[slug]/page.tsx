import { notFound } from 'next/navigation';
import { allGSoCPosts } from 'contentlayer/generated';
import { Mdx } from '@/app/components/mdx';
import { Header } from '@/app/components/header';

type Props = {
  params: {
    slug: string;
  };
};

  
export async function generateStaticParams() {
  const params: { slug: string; }[] = [];
  allGSoCPosts.forEach(post => {
    params.push({ slug: post.slug });
    if (post.week) {
      params.push({ slug: post.week.toString() });
    }
  });
  return params;
}

function findPostBySlugOrWeek(slug: string) {
  let post = allGSoCPosts.find(p => p.slug === slug);
  if (post) return post;

  if (/^\d+$/.test(slug)) {
    const weekTag = `week${slug}`;
    post = allGSoCPosts.find(p => Array.isArray(p.tags) && p.tags.includes(weekTag));
    if (post) return post;
  }
  return null;
}

export default function GSoCPostPage({ params }: Props) {
  const post = findPostBySlugOrWeek(params.slug);
  if (!post) return notFound();

  return (
    <div className="bg-zinc-50 min-h-screen">
      <Header 
      project={{
          title: post.title,
          description: post.description || "",
        }}
        views={0}/>
      <article className="px-4 py-12 mx-auto prose prose-zinc prose-quoteless max-w-4xl">
        <Mdx code={post.body.code} />
      </article>
    </div>
  );
} 