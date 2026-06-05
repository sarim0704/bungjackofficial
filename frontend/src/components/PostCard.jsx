import { Link } from "react-router-dom";
import { ArrowRight, FileText } from "lucide-react";

export default function PostCard({ post, index = 0 }) {
  const date = post?.createdAt || post?.date
    ? new Date(post.createdAt || post.date).toLocaleDateString("en", {
        year: "numeric", month: "short", day: "numeric",
      })
    : null;

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-black/8 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.055)] transition-all duration-300 hover:-translate-y-1 hover:border-red-500/30 border-[var(--bj-border)] dark:bg-white/[0.035] dark:shadow-none dark:backdrop-blur-xl dark:hover:border-red-500/25">
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-[#111318]">
        {post?.image ? (
          <img
            src={post.image}
            alt={post.title || "Post"}
            className="h-full w-full object-cover opacity-88 transition duration-500 group-hover:scale-105 dark:opacity-72"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/8 dark:bg-white/[0.04]">
            <FileText size={36} className="text-black/20 dark:text-white/18" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Category badge */}
        <span className="absolute left-4 top-4 rounded-full border border-white/12 bg-black/45 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/88 backdrop-blur-md">
          {post?.category || "Post"}
        </span>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-600 dark:text-red-500">
            Post {String(index + 1).padStart(2, "0")}
          </span>
          {date && (
            <span className="text-[10px] text-black/35 dark:text-white/32">· {date}</span>
          )}
        </div>

        <h3 className="font-serif line-clamp-2 text-[1.25rem] font-bold leading-tight text-[var(--bj-text)]">
          {post?.title || "Independent story update"}
        </h3>

        <p className="mt-3 line-clamp-3 text-[14px] leading-7 text-[var(--bj-muted)]">
          {post?.excerpt || post?.description ||
            "A public story published for community awareness."}
        </p>

        <Link
          to="/content"
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-red-600 transition hover:text-black dark:text-red-500 dark:hover:text-white"
        >
          Read story <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}
