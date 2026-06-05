import { PlayCircle, Film } from "lucide-react";

function getPlatform(video) {
  if (video?.platform) return video.platform;
  const url = video?.url || "";
  if (url.includes("instagram")) return "Instagram";
  if (url.includes("youtube") || url.includes("youtu.be")) return "YouTube";
  if (url.includes("facebook")) return "Facebook";
  return "Media";
}

export default function VideoCard({ video, index = 0 }) {
  const platform = getPlatform(video);
  const isReel   = video?.category === "Reel" || video?.category === "Reels";

  const date = video?.createdAt || video?.date
    ? new Date(video.createdAt || video.date).toLocaleDateString("en", {
        year: "numeric", month: "short", day: "numeric",
      })
    : null;

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-black/8 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.055)] transition-all duration-300 hover:-translate-y-1 hover:border-red-500/30 border-[var(--bj-border)] dark:bg-[#1F1F1D]/80 dark:shadow-none dark:backdrop-blur-xl dark:hover:border-red-500/25">
      {/* Thumbnail */}
      <div className="relative h-52 overflow-hidden bg-black">
        {video?.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title || "Video"}
            className="h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 dark:opacity-55"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/40">
            <Film size={40} className="text-white/25" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/30 to-transparent" />

        {/* Platform */}
        <span className="absolute left-4 top-4 rounded-full border border-white/12 bg-black/45 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/88 backdrop-blur-md">
          {platform}
        </span>

        {/* Reel / Video badge */}
        <span className="absolute right-4 top-4 rounded-full border border-white/12 bg-black/45 px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/75 backdrop-blur-md">
          {isReel ? "Reel" : "Video"}
        </span>

        {/* Play button */}
        <a
          href={video?.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Watch ${video?.title || "video"}`}
          tabIndex={-1}
          className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-md transition group-hover:scale-110 group-hover:bg-red-600"
        >
          <PlayCircle size={26} />
        </a>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-600 dark:text-red-500">
            {isReel ? "Reel" : "Media"} {String(index + 1).padStart(2, "0")}
          </span>
          {date && (
            <span className="text-[10px] text-black/35 dark:text-white/32">· {date}</span>
          )}
        </div>

        <h3 className="font-serif line-clamp-2 text-[1.2rem] font-bold leading-tight text-[var(--bj-text)]">
          {video?.title || "Latest media update"}
        </h3>

        <p className="mt-3 line-clamp-2 text-[14px] leading-7 text-[var(--bj-muted)]">
          {video?.description ||
            "Watch the latest videos, reels, and public updates from the platform."}
        </p>

        <a
          href={video?.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-red-600 transition hover:text-black dark:text-red-500 dark:hover:text-white"
        >
          Watch now <PlayCircle size={15} />
        </a>
      </div>
    </article>
  );
}
