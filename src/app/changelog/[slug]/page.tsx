import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs, formatDate } from "@/lib/posts";
import { categoryLabels, type PostSection } from "@/types/post";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <header>
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

        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {post.title}
        </h1>

        <p className="mt-4 text-lg text-muted">{post.description}</p>

        <p className="mt-4 text-sm text-muted">By {post.author}</p>
      </header>

      {/* Content */}
      <div className="mt-10 space-y-6">
        {post.content.map((section, index) => (
          <ContentSection key={index} section={section} />
        ))}
      </div>

      {/* Related Models */}
      {post.relatedModels && post.relatedModels.length > 0 && (
        <div className="mt-12 rounded-lg border border-card-border bg-card-bg p-6">
          <h3 className="font-semibold">Related Models</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {post.relatedModels.map((modelSlug) => (
              <Link
                key={modelSlug}
                href={`/model/${modelSlug}`}
                className="rounded-full bg-muted-bg px-3 py-1 text-sm font-medium hover:bg-green-100 hover:text-green-800 dark:hover:bg-green-900/30 dark:hover:text-green-400"
              >
                {formatModelName(modelSlug)}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-12 flex items-center justify-between border-t border-card-border pt-8">
        <Link
          href="/changelog"
          className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          All posts
        </Link>

        <Link
          href="/"
          className="text-sm font-medium text-muted hover:text-foreground"
        >
          View all models &rarr;
        </Link>
      </div>
    </article>
  );
}

function ContentSection({ section }: { section: PostSection }) {
  switch (section.type) {
    case "heading":
      return (
        <h2 className="text-xl font-bold tracking-tight">{section.content}</h2>
      );

    case "paragraph":
      return <p className="text-muted leading-relaxed">{section.content}</p>;

    case "list":
      return (
        <ul className="space-y-2 text-muted">
          {section.items?.map((item, index) => (
            <li key={index} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case "callout":
      return (
        <div
          className={`rounded-lg border p-4 ${getCalloutStyles(section.variant)}`}
        >
          <p className="text-sm">{section.content}</p>
        </div>
      );

    default:
      return null;
  }
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

function getCalloutStyles(variant?: string): string {
  switch (variant) {
    case "warning":
      return "border-yellow-300 bg-yellow-50 text-yellow-900 dark:border-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-200";
    case "success":
      return "border-green-300 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-900/20 dark:text-green-200";
    case "info":
    default:
      return "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-200";
  }
}

function formatModelName(slug: string): string {
  return slug
    .split("-")
    .map((part) => {
      if (/^\d+$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}
