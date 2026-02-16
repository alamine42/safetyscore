import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatDate } from "@/lib/posts";
import { categoryLabels } from "@/types/post";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Updates, model evaluations, and methodology changes from SafetyScore.",
};

export default function ChangelogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Changelog
      </h1>
      <p className="mt-4 text-lg text-muted">
        Model evaluations, methodology updates, and announcements.
      </p>

      <div className="mt-12 space-y-8">
        {posts.length === 0 ? (
          <p className="text-muted">No posts yet. Check back soon!</p>
        ) : (
          posts.map((post) => (
            <article
              key={post.slug}
              className="group rounded-lg border border-card-border bg-card-bg p-6 transition-colors hover:border-green-600/50 dark:hover:border-green-400/50"
            >
              <div className="flex items-center gap-3 text-sm">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getCategoryStyles(post.category)}`}
                >
                  {categoryLabels[post.category]}
                </span>
                <time dateTime={post.publishedAt} className="text-muted">
                  {formatDate(post.publishedAt)}
                </time>
              </div>

              <Link href={`/changelog/${post.slug}`} className="mt-3 block">
                <h2 className="text-xl font-semibold group-hover:text-green-700 dark:group-hover:text-green-400">
                  {post.title}
                </h2>
              </Link>

              <p className="mt-2 text-muted">{post.description}</p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-muted">By {post.author}</span>
                <Link
                  href={`/changelog/${post.slug}`}
                  className="text-sm font-medium text-green-700 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
                >
                  Read more &rarr;
                </Link>
              </div>
            </article>
          ))
        )}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to all models
        </Link>
      </div>
    </div>
  );
}

function getCategoryStyles(category: string): string {
  switch (category) {
    case "evaluation":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "methodology":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "announcement":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
  }
}
