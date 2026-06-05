import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, PlayCircle, ExternalLink, Film, FileText,
  ChevronLeft, ChevronRight, Calendar, ArrowRight,
} from "lucide-react";

/* ─── Helpers ─────────────────────────────────────────── */
const FILTERS = [
  { key: "all",    label: "All"    },
  { key: "posts",  label: "Posts"  },
  { key: "videos", label: "Videos" },
  { key: "reels",  label: "Reels"  },
];

function getPlatform(url = "") {
  if (url.includes("instagram"))                    return "Instagram";
  if (url.includes("youtube") || url.includes("youtu.be")) return "YouTube";
  if (url.includes("facebook"))                     return "Facebook";
  return "Media";
}
const isReel      = (i) => i.category === "Reel" || i.category === "Reels";
const isVideoItem = (i) => Boolean(i.url) && !i.image;
const getThumb    = (i) => i.image || i.thumbnail || null;
const getTypeLabel= (i) => isReel(i) ? "Reel" : isVideoItem(i) ? "Video" : (i.category || "Post");

function getDate(item) {
  const d = item.createdAt || item.date;
  if (!d) return null;
  return new Date(d).toLocaleDateString("en", { month:"short", day:"numeric", year:"numeric" });
}
function sortByDate(arr) {
  return [...arr].sort((a, b) =>
    new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
  );
}

/* ─── CSS vars shorthand ───────────────────────────────── */
const V = {
  bg:       "var(--bj-bg)",
  surface:  "var(--bj-surface)",
  surface2: "var(--bj-surface-2)",
  border:   "var(--bj-border)",
  borderH:  "var(--bj-border-hover)",
  text:     "var(--bj-text)",
  muted:    "var(--bj-muted)",
  subtle:   "var(--bj-subtle)",
  red:      "var(--bj-red)",
  redH:     "var(--bj-red-hover)",
  redBorder:"var(--bj-red-border)",
  redGlow:  "var(--bj-red-glow)",
  redSurf:  "var(--bj-red-surface)",
};

/* ─── Modal ────────────────────────────────────────────── */
function ContentModal({ item, onClose }) {
  const thumb    = getThumb(item);
  const date     = getDate(item);
  const isVideo  = isVideoItem(item) || isReel(item);
  const platform = isVideo ? getPlatform(item.url || "") : null;

  return (
    <motion.div
      className="fixed inset-0 z-[2000] flex items-end justify-center p-4 sm:items-center"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      transition={{ duration:0.2 }}
    >
      <motion.div className="absolute inset-0 bg-black/65 backdrop-blur-md" onClick={onClose} />

      <motion.div
        className="relative w-full max-w-2xl overflow-hidden rounded-[1.75rem] bg-[var(--bj-surface)] shadow-[0_32px_80px_rgba(0,0,0,0.5)] sm:max-h-[88vh]"
        style={{ border:`1px solid ${V.borderH}` }}
        initial={{ y:50, opacity:0, scale:0.97 }}
        animate={{ y:0,  opacity:1, scale:1    }}
        exit   ={{ y:30, opacity:0, scale:0.97 }}
        transition={{ duration:0.3, ease:[0.22,1,0.36,1] }}
      >
        <button type="button" onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full transition hover:text-[var(--bj-text)]"
          style={{ border:`1px solid ${V.borderH}`, background:V.surface2, color:V.muted }}>
          <X size={14} />
        </button>

        <div className="flex flex-col sm:max-h-[88vh] sm:flex-row">
          {thumb && (
            <div className="relative h-48 shrink-0 overflow-hidden sm:h-auto sm:w-[45%]">
              <img src={thumb} alt={item.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent sm:bg-gradient-to-r" />
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-sm">
                    <PlayCircle size={26} />
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-1 flex-col overflow-y-auto p-6 sm:p-7">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em]"
                    style={{ border:`1px solid ${V.redBorder}`, background:V.redSurf, color:V.red }}>
                {getTypeLabel(item)}
              </span>
              {platform && (
                <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                      style={{ border:`1px solid ${V.borderH}`, background:V.surface2, color:V.muted }}>
                  {platform}
                </span>
              )}
              {date && (
                <span className="flex items-center gap-1 text-[11px]" style={{ color:V.subtle }}>
                  <Calendar size={10} /> {date}
                </span>
              )}
            </div>

            <h2 className="font-serif line-clamp-3 text-[1.5rem] font-bold leading-[1.18] tracking-tight text-[var(--bj-text)]">
              {item.title || "Untitled"}
            </h2>
            {(item.excerpt || item.description || item.content) && (
              <p className="mt-4 flex-1 text-[14px] leading-7 text-[var(--bj-muted)]">
                {item.excerpt || item.description || item.content?.slice(0, 350)}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {isVideo && item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                   className="btn-primary rounded-full px-6 py-2.5 text-sm">
                  <PlayCircle size={15} /> Watch on {platform || "Platform"}
                </a>
              ) : (
                <button type="button" onClick={onClose} className="btn-primary rounded-full px-6 py-2.5 text-sm">
                  <ArrowRight size={15} /> View Story
                </button>
              )}
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer"
                   className="btn-secondary rounded-full px-5 py-2.5 text-sm">
                  <ExternalLink size={13} /> Open original
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Compact Spotlight (hero right) ──────────────────── */
function SpotlightCard({ item, onClick }) {
  const thumb    = getThumb(item);
  const isVideo  = isVideoItem(item) || isReel(item);
  const platform = isVideo ? getPlatform(item.url || "") : null;

  return (
    <button type="button" onClick={onClick} aria-label={`Open: ${item.title}`}
      className="group relative flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[1.25rem] text-left transition-all duration-300"
      style={{ border:`1px solid ${V.borderH}`, background:V.surface }}>

      {/* Image */}
      <div className="relative overflow-hidden" style={{ flex:"1 1 0", minHeight:0 }}>
        {thumb ? (
          <img src={thumb} alt={item.title}
               className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center" style={{ background:V.surface2 }}>
            {isVideo ? <Film size={36} style={{ color:V.subtle }} /> : <FileText size={36} style={{ color:V.subtle }} />}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/92 backdrop-blur-sm">
            {getTypeLabel(item)}
          </span>
          {platform && (
            <span className="rounded-full border border-white/12 bg-black/40 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/75 backdrop-blur-sm">
              {platform}
            </span>
          )}
        </div>

        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-sm transition group-hover:scale-110 group-hover:bg-[var(--bj-red)]">
              <PlayCircle size={20} />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="shrink-0 p-4">
        <h3 className="font-serif line-clamp-2 text-[1rem] font-bold leading-snug tracking-tight text-[var(--bj-text)]">
          {item.title || "Latest update"}
        </h3>
        {(item.excerpt || item.description) && (
          <p className="mt-1.5 line-clamp-1 text-[12px] leading-5 text-[var(--bj-muted)]">
            {item.excerpt || item.description}
          </p>
        )}
        <span className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-[var(--bj-red)]">
          {isVideo ? "Watch" : "Read"} <ArrowRight size={11} />
        </span>
      </div>
    </button>
  );
}

/* ─── Carousel Card ────────────────────────────────────── */
function CarouselCard({ item, index, onClick }) {
  const thumb    = getThumb(item);
  const date     = getDate(item);
  const isVideo  = isVideoItem(item) || isReel(item);
  const platform = isVideo ? getPlatform(item.url || "") : null;

  return (
    <button type="button" onClick={onClick} aria-label={`Open: ${item.title}`}
      className="group flex w-[260px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-[1.15rem] text-left transition-all duration-200 hover:-translate-y-1"
      style={{ border:`1px solid ${V.borderH}`, background:V.surface, flexShrink:0 }}>

      <div className="relative h-[152px] overflow-hidden" style={{ background:V.surface2 }}>
        {thumb ? (
          <img src={thumb} alt={item.title}
               className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center">
            {isVideo ? <Film size={28} style={{ color:V.subtle }} /> : <FileText size={28} style={{ color:V.subtle }} />}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

        <span className="absolute left-3 top-2.5 rounded-full border border-white/15 bg-black/50 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-[0.14em] text-white/92 backdrop-blur-sm">
          {getTypeLabel(item)}
        </span>
        {platform && (
          <span className="absolute right-3 top-2.5 rounded-full border border-white/12 bg-black/40 px-2 py-0.5 text-[8.5px] font-bold uppercase text-white/75 backdrop-blur-sm">
            {platform}
          </span>
        )}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white transition group-hover:scale-110 group-hover:bg-[var(--bj-red)]">
              <PlayCircle size={16} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="mb-1.5 flex items-center gap-1.5">
          <span className="text-[8.5px] font-black uppercase tracking-[0.2em]" style={{ color:V.red }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          {date && <span className="text-[8.5px]" style={{ color:V.subtle }}>· {date}</span>}
        </div>
        <h3 className="font-serif line-clamp-2 flex-1 text-[0.95rem] font-bold leading-[1.25] tracking-tight text-[var(--bj-text)]">
          {item.title || "Untitled"}
        </h3>
        <span className="mt-2 text-[10.5px] font-bold" style={{ color:V.red }}>
          {isVideo ? "Watch →" : "Read →"}
        </span>
      </div>
    </button>
  );
}

/* ─── Feed Card (YouTube/Instagram style for individual filter) */
function FeedCard({ item, index, onClick }) {
  const thumb    = getThumb(item);
  const date     = getDate(item);
  const isVideo  = isVideoItem(item) || isReel(item);
  const platform = isVideo ? getPlatform(item.url || "") : null;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={`Open: ${item.title}`}
      variants={{ hidden:{opacity:0,y:16}, visible:{opacity:1,y:0,transition:{duration:0.4,ease:"easeOut"}} }}
      className="group cursor-pointer overflow-hidden rounded-[1.15rem] text-left transition-all duration-250 hover:-translate-y-1"
      style={{ border:`1px solid ${V.borderH}`, background:V.surface }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ aspectRatio:"16/9", background:V.surface2 }}>
        {thumb ? (
          <img src={thumb} alt={item.title}
               className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center">
            {isVideo ? <Film size={40} style={{ color:V.subtle }} /> : <FileText size={40} style={{ color:V.subtle }} />}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/52 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/92 backdrop-blur-sm">
          {getTypeLabel(item)}
        </span>
        {platform && (
          <span className="absolute right-3 top-3 rounded-full border border-white/12 bg-black/40 px-2.5 py-1 text-[9px] font-bold uppercase text-white/75 backdrop-blur-sm">
            {platform}
          </span>
        )}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white transition group-hover:scale-110 group-hover:bg-[var(--bj-red)]">
              <PlayCircle size={22} />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[9.5px] font-black uppercase tracking-[0.18em]" style={{ color:V.red }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          {date && (
            <span className="flex items-center gap-1 text-[10px]" style={{ color:V.subtle }}>
              <Calendar size={9} /> {date}
            </span>
          )}
        </div>

        <h3 className="font-serif line-clamp-2 text-[1.05rem] font-bold leading-snug tracking-tight text-[var(--bj-text)]">
          {item.title || "Untitled"}
        </h3>

        {(item.excerpt || item.description) && (
          <p className="mt-2 line-clamp-2 text-[12.5px] leading-5 text-[var(--bj-muted)]">
            {item.excerpt || item.description}
          </p>
        )}

        <span className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] font-bold" style={{ color:V.red }}>
          {isVideo ? "Watch" : "Read"} <ArrowRight size={12} />
        </span>
      </div>
    </motion.button>
  );
}

/* ─── Carousel Row ─────────────────────────────────────── */
function CarouselRow({ label, title, items, onOpen }) {
  const scrollRef = useRef(null);

  const scroll = useCallback((dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 290, behavior: "smooth" });
  }, []);

  if (!items.length) return null;

  return (
    <div className="relative mb-10">
      {/* Row header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="premium-label uppercase">{label}</p>
          <h3 className="font-serif text-xl font-bold tracking-tight text-[var(--bj-text)]">{title}</h3>
          <span className="rounded-full px-2.5 py-0.5 text-[10.5px] font-bold"
                style={{ border:`1px solid ${V.borderH}`, background:V.surface2, color:V.muted }}>
            {items.length}
          </span>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => scroll(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full transition"
            style={{ border:`1px solid ${V.borderH}`, background:V.surface, color:V.muted }}
            aria-label="Scroll left">
            <ChevronLeft size={14} />
          </button>
          <button type="button" onClick={() => scroll(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full transition"
            style={{ border:`1px solid ${V.borderH}`, background:V.surface, color:V.muted }}
            aria-label="Scroll right">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Horizontal scroll — inline style for guaranteed cross-browser support */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: "14px",
          overflowX: "auto",
          overflowY: "visible",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          paddingBottom: "6px",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="[&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <div key={item._id || item.id || i}
               style={{ scrollSnapAlign:"start", flexShrink:0 }}>
            <CarouselCard item={item} index={i} onClick={() => onOpen(item)} />
          </div>
        ))}
        <div style={{ width:"20px", flexShrink:0 }} />
      </div>
    </div>
  );
}

/* ─── Feed Grid (for individual filter) ───────────────── */
function FeedGrid({ items, onOpen }) {
  const stagger = { hidden:{}, visible:{ transition:{ staggerChildren:0.07 } } };
  return (
    <motion.div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, i) => (
        <FeedCard key={item._id || item.id || i} item={item} index={i} onClick={() => onOpen(item)} />
      ))}
    </motion.div>
  );
}

/* ─── Page ─────────────────────────────────────────────── */
export default function Content({ posts = [], videos = [] }) {
  const [filter,   setFilter]  = useState("all");
  const [modal,    setModal]   = useState(null);

  const reels        = useMemo(() => videos.filter(isReel),             [videos]);
  const normalVideos = useMemo(() => videos.filter((v) => !isReel(v)), [videos]);
  const allSorted    = useMemo(() => sortByDate([...posts, ...videos]), [posts, videos]);

  const featuredItem = useMemo(() => allSorted[0] || null, [allSorted]);

  const counts = {
    all:    posts.length + videos.length,
    posts:  posts.length,
    videos: normalVideos.length,
    reels:  reels.length,
  };

  /* Items shown in individual filter feed grids */
  const feedItems = useMemo(() => {
    switch (filter) {
      case "posts":  return sortByDate(posts);
      case "videos": return sortByDate(normalVideos);
      case "reels":  return sortByDate(reels);
      default:       return [];
    }
  }, [filter, posts, normalVideos, reels]);

  return (
    <main className="min-h-screen overflow-hidden" style={{ background:V.bg, color:V.text }}>

      {/* ── HERO — compact two-column ───────────────── */}
      <section className="relative border-b py-6 sm:py-8" style={{ borderColor:V.border }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(220,38,38,0.10),transparent_28%)] dark:bg-[radial-gradient(circle_at_72%_45%,rgba(220,38,38,0.17),transparent_28%)]" />
        <div className="pointer-events-none absolute left-[3%] top-[10%] select-none text-[10vw] font-black uppercase leading-none tracking-[-0.08em] opacity-[0.022]" style={{ color:V.text }}>
          CONTENT
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[1fr_0.55fr]">

            {/* Left — title + slim filters */}
            <motion.div
              initial={{ opacity:0, y:18 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:0.5, ease:"easeOut" }}
            >
              <p className="premium-label mb-3 uppercase">Media Desk</p>
              <h1 className="font-serif text-4xl font-bold leading-none tracking-tight sm:text-5xl lg:text-6xl" style={{ color:V.text }}>
                Content
              </h1>
              <p className="mt-3 max-w-lg text-[14.5px] leading-6" style={{ color:V.muted }}>
                Posts, videos, and reels — sorted newest first.
              </p>

              {/* Slim filter pills */}
              <div className="mt-5 flex flex-wrap gap-2">
                {FILTERS.map((f) => {
                  const active = filter === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilter(f.key)}
                      className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-200"
                      style={{
                        background: active ? V.red      : V.surface,
                        color:      active ? "#fff"     : V.muted,
                        border:     `1.5px solid ${active ? V.red : V.borderH}`,
                        boxShadow:  active ? `0 0 14px var(--bj-red-glow)` : "none",
                      }}
                    >
                      {f.label}
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[9px] font-black"
                        style={{
                          background: active ? "rgba(255,255,255,0.22)" : V.surface2,
                          color:      active ? "#fff" : V.subtle,
                        }}
                      >
                        {counts[f.key]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Right — Latest Upload card (only on All filter) */}
            <AnimatePresence mode="wait">
              {filter === "all" && featuredItem ? (
                <motion.div
                  key="spotlight"
                  initial={{ opacity:0, x:20 }}
                  animate={{ opacity:1, x:0  }}
                  exit   ={{ opacity:0, x:20 }}
                  transition={{ duration:0.4, ease:"easeOut" }}
                  className="flex flex-col"
                  style={{ height:"260px" }}
                >
                  <p className="premium-label mb-2.5 uppercase">Latest Upload</p>
                  <div style={{ flex:1, minHeight:0 }}>
                    <SpotlightCard item={featuredItem} onClick={() => setModal(featuredItem)} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity:0 }}
                  animate={{ opacity:1 }}
                  exit   ={{ opacity:0 }}
                  transition={{ duration:0.2 }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── CONTENT BELOW HERO ──────────────────────── */}
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">

        {/* ALL — three separate carousels */}
        {filter === "all" && (
          <div>
            <CarouselRow
              label="Latest"  title="Reels"
              items={sortByDate(reels)}
              onOpen={setModal}
            />
            <CarouselRow
              label="Latest"  title="Posts"
              items={sortByDate(posts)}
              onOpen={setModal}
            />
            <CarouselRow
              label="Latest"  title="Videos"
              items={sortByDate(normalVideos)}
              onOpen={setModal}
            />
            {(posts.length + videos.length) === 0 && (
              <div className="rounded-[1.5rem] p-12 text-center"
                   style={{ border:`1px solid ${V.borderH}`, background:V.surface }}>
                <p className="premium-label mb-3 justify-center uppercase">No Content</p>
                <h2 className="font-serif text-2xl font-bold tracking-tight" style={{ color:V.text }}>
                  Nothing published yet.
                </h2>
                <p className="mx-auto mt-3 max-w-xs text-[13.5px] leading-6" style={{ color:V.muted }}>
                  Add posts and videos from the admin dashboard.
                </p>
              </div>
            )}
          </div>
        )}

        {/* INDIVIDUAL FILTER — YouTube/Instagram feed grid */}
        {filter !== "all" && (
          <div>
            {feedItems.length === 0 ? (
              <div className="rounded-[1.5rem] p-12 text-center"
                   style={{ border:`1px solid ${V.borderH}`, background:V.surface }}>
                <p className="premium-label mb-3 justify-center uppercase">No {filter}</p>
                <h2 className="font-serif text-2xl font-bold tracking-tight" style={{ color:V.text }}>
                  No {filter} published yet.
                </h2>
                <p className="mx-auto mt-3 max-w-xs text-[13.5px] leading-6" style={{ color:V.muted }}>
                  Add {filter} from the admin dashboard.
                </p>
              </div>
            ) : (
              <FeedGrid items={feedItems} onOpen={setModal} />
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && <ContentModal item={modal} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </main>
  );
}
