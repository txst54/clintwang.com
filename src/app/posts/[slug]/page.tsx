// src/app/posts/[slug]/page.tsx
import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import matter from 'gray-matter';
import 'katex/dist/katex.min.css';
import Image from 'next/image';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Metadata } from 'next';
import remarkDirective from 'remark-directive';
import { visit } from 'unist-util-visit';
import React from "react";

export async function generateStaticParams() {
  const entriesPath = path.join(process.cwd(), 'public', 'entries');
  const folders = fs.readdirSync(entriesPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => ({ slug: dirent.name }));
  return folders;
}

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const mdPath = path.join(process.cwd(), 'public', 'entries', slug, 'main.md');
  const rawContent = fs.readFileSync(mdPath, 'utf8');
  const { data, content } = matter(rawContent);

  return {
    title: data.title,
    description: data.description || content.slice(0, 160),
    openGraph: {
      title: data.title,
      description: data.description || content.slice(0, 160),
      type: 'article',
      url: `https://clintwang.com/posts/${slug}`,
      images: data.cover ? [`/entries/${slug}/${data.cover}`] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: data.title,
      description: data.description || content.slice(0, 160),
      images: data.cover ? [`/entries/${slug}/${data.cover}`] : [],
    },
  };
}

function remarkTwoCol() {
  return (tree: any) => {
    visit(tree, (node: any) => {
      if (
        node.type === 'containerDirective' &&
        node.name === 'twocol'
      ) {
        node.data = {
          hName: 'twocol',
          hProperties: {},
        };
      }
    });
  };
}

export default async function PostPage({ params }: PostPageProps) {
  // Await params in Next.js 15+
  const { slug } = await params;

  // Load Markdown file
  const mdPath = path.join(process.cwd(), 'public', 'entries', slug, 'main.md');
  const rawContent = fs.readFileSync(mdPath, 'utf8');

  // Parse frontmatter
  const { data, content } = matter(rawContent);

  return (
    <article className="mx-auto my-12 max-w-4xl px-4">
      {/* Post Metadata */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-5xl font-serif ">{data.title}</h1>
        <p className="text-gray-500 mt-2">
          {data.author} · {new Date(data.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {/* Markdown Content */}
      <div className="prose prose-lg prose-headings:font-serif prose-a:text-blue-500 prose-a:hover:text-blue-400 mx-auto break-words hyphens-auto">
        <ReactMarkdown
          remarkPlugins={[
            remarkGfm,
            remarkMath,
            remarkDirective,
            remarkTwoCol
          ]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          components={{
            img: ({ node, ...props }) => (
              <span className="flex flex-row justify-center">
                <Image
                  {...props}
                  src={`/entries/${slug}/${props.src}`}
                  className="m-4 w-2/3"
                  width={800}
                  height={600}
                  style={{ width: '60%', height: 'auto' }}
                  alt={props.alt || ''}
                />
              </span>
            ),
            h1: ({ node, ...props }) => <h1 className="text-2xl sm:text-4xl font-serif my-4" {...props} />,
            h2: ({ node, ...props }) => <h2 className="text-xl sm:text-2xl font-serif my-3" {...props} />,
            h3: ({ node, ...props }) => <h3 className="text-lg sm:text-xl font-serif my-2" {...props} />,
            p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
            a: ({ node, ...props }) => <a className="text-blue-500 hover:text-blue-400 underline" {...props} />,
            // Ordered lists
            ol: ({ node, ...props }) => (
              <ol className="list-decimal ml-6 indent-0" {...props} />
            ),
            // Unordered lists
            ul: ({ node, ...props }) => (
              <ul className="list-disc ml-6 indent-0" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="mb-2 indent-0" {...props} />
            ),
            twocol: ({ children }) => {
              const items = React.Children.toArray(children);

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
                  {items.map((child, i) => (
                    <div key={i}>{child}</div>
                  ))}
                </div>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

    </article>
  );
}