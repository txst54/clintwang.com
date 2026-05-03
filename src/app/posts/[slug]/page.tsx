// src/app/posts/[slug]/page.tsx
import fs from 'fs';
import path from 'path';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
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
import React from 'react';

export async function generateStaticParams() {
  const entriesPath = path.join(process.cwd(), 'public', 'entries');

  return fs
    .readdirSync(entriesPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => ({ slug: dirent.name }));
}

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
                                         params,
                                       }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;

  const mdPath = path.join(
    process.cwd(),
    'public',
    'entries',
    slug,
    'main.md'
  );

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
  const { slug } = await params;

  const mdPath = path.join(
    process.cwd(),
    'public',
    'entries',
    slug,
    'main.md'
  );

  const rawContent = fs.readFileSync(mdPath, 'utf8');
  const { data, content } = matter(rawContent);

  const components: Components & {
    twocol?: React.ElementType;
  } = {
    img: ({ ...props }) => (
      <span className="flex justify-center">
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

    h1: (props) => (
      <h1
        className="text-2xl sm:text-4xl font-serif my-4"
        {...props}
      />
    ),

    h2: (props) => (
      <h2
        className="text-xl sm:text-2xl font-serif my-3"
        {...props}
      />
    ),

    h3: (props) => (
      <h3
        className="text-lg sm:text-xl font-serif my-2"
        {...props}
      />
    ),

    p: (props) => (
      <p className="mb-4 leading-relaxed" {...props} />
    ),

    a: (props) => (
      <a
        className="text-blue-500 hover:text-blue-400 underline"
        {...props}
      />
    ),

    ol: (props) => (
      <ol className="list-decimal ml-6" {...props} />
    ),

    ul: (props) => (
      <ul className="list-disc ml-6" {...props} />
    ),

    li: (props) => (
      <li className="mb-2" {...props} />
    ),

    twocol: ({
               children,
             }: {
      children?: React.ReactNode;
    }) => {
      const items = React.Children.toArray(children);

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
          {items.map((child, i) => (
            <div key={i}>{child}</div>
          ))}
        </div>
      );
    },
  };

  return (
    <article className="mx-auto my-12 max-w-4xl px-4">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-5xl font-serif">
          {data.title}
        </h1>

        <p className="text-gray-500 mt-2">
          {data.author} ·{' '}
          {new Date(data.date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </header>

      <div className="prose prose-lg prose-headings:font-serif prose-a:text-blue-500 prose-a:hover:text-blue-400 mx-auto break-words hyphens-auto">
        <ReactMarkdown
          remarkPlugins={[
            remarkGfm,
            remarkMath,
            remarkDirective,
            remarkTwoCol,
          ]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          components={components}
        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
}