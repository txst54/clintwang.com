// src/app/posts/page.js

import Link from 'next/link';
import Posts from "@/util/posts.ts";

export default function PostsPage() {
  const posts = new Posts().posts;

  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      <h1 className="text-5xl font-serif mb-8">All Posts</h1>
      <ul className="space-y-4">
        {posts.map(post => (
          <li key={post.slug}>
            <Link
              href={`/posts/${post.slug}`}
              className="text-black hover:text-zinc-600 underline text-lg"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
