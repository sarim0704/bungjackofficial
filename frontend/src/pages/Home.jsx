import { useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, PlayCircle, Crown, Heart, Zap, Globe,
  ShieldCheck, ChevronLeft, ChevronRight, Film, FileText,
  Check, Image as ImageIcon, Video as VideoIcon, Lock,
} from "lucide-react";

/* ─── Helpers ─────────────────────────────────────────── */
function getPlatform(url = "") {
  if (url.includes("instagram"))                    return "Instagram";
  if (url.includes("youtube") || url.includes("youtu.be")) return "YouTube";
  if (url.includes("facebook"))                     return "Facebook";
  return "Media";
}
function sortByDate(arr) {
  return [...arr].sort((a, b) =>
    new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
  );
}
function getThumb(item) { return item.image || item.thumbnail || null; }
const isVideo = (item) => Boolean(item.url) && !item.image;

/* ─── Easing presets — Apple / Framer style ───────────── */
const EASE_OUT_EXPO  = [0.16, 1, 0.3, 1];
const EASE_OUT_QUART = [0.25, 1, 0.5, 1];

const fadeUp = (delay = 0) => ({
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE_OUT_EXPO, delay } },
});

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

/* ─── Hero scroll card ────────────────────────────────── */
function HeroScrollCard({ item, index }) {
  const video    = isVideo(item);
  const platform = video ? getPlatform(item.url) : null;
  const thumb    = getThumb(item);
  const label    = platform || item.category || "Post";
  const href     = video ? item.url : "/content";

  return (
    <a href={href} target={video ? "_blank" : undefined}
       rel={video ? "noopener noreferrer" : undefined}
       className="group flex min-w-[252px] gap-3.5 rounded-[1.25rem] p-3 transition-all duration-300 hover:-translate-y-0.5"
       style={{ border:"1px solid var(--bj-border-hover)", background:"var(--bj-surface)" }}>
      <div className="relative h-22 w-22 shrink-0 overflow-hidden rounded-xl" style={{ width:88, height:88, background:"var(--bj-surface-2)" }}>
        {thumb ? (
          <img src={thumb} alt={item.title}
               className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-110" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center">
            {video ? <Film size={22} style={{ color:"var(--bj-subtle)" }} /> : <FileText size={22} style={{ color:"var(--bj-subtle)" }} />}
          </div>
        )}
        <div className="absolute inset-0 bg-black/15" />
        {video && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-sm">
              <PlayCircle size={14} />
            </div>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <span className="text-[9.5px] font-black uppercase tracking-[0.18em]" style={{ color:"var(--bj-red)" }}>{label}</span>
        <h3 className="font-serif mt-1 line-clamp-2 text-[14px] font-bold leading-snug" style={{ color:"var(--bj-text)" }}>
          {item.title || "Latest update"}
        </h3>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color:"var(--bj-subtle)" }}>
          {String(index + 1).padStart(2, "0")}
        </p>
      </div>
    </a>
  );
}

/* ─── Content card for carousel ──────────────────────── */
function ContentCard({ item, index }) {
  const video    = isVideo(item);
  const thumb    = getThumb(item);
  const platform = video ? getPlatform(item.url || "") : null;
  const typeLabel = item.category || (video ? "Video" : "Post");
  const href     = video ? (item.url || "/content") : "/content";

  return (
    <motion.article
      whileHover={{ y: -6, transition: { duration: 0.25, ease: EASE_OUT_QUART } }}
      className="group w-[300px] shrink-0 overflow-hidden rounded-[1.5rem] text-left sm:w-[330px]"
      style={{ border:"1px solid var(--bj-border-hover)", background:"var(--bj-surface)" }}
    >
      {/* Thumbnail */}
      <div className="relative h-[190px] overflow-hidden" style={{ background:"var(--bj-surface-2)" }}>
        {thumb ? (
          <img src={thumb} alt={item.title}
               className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center">
            {video ? <Film size={36} style={{ color:"var(--bj-subtle)" }} /> : <FileText size={36} style={{ color:"var(--bj-subtle)" }} />}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        <span className="absolute left-3.5 top-3.5 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[9.5px] font-black uppercase tracking-[0.14em] text-white/92 backdrop-blur-sm">
          {platform || typeLabel}
        </span>

        {video && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white transition group-hover:scale-110 group-hover:bg-[var(--bj-red)]">
              <PlayCircle size={22} />
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[9.5px] font-black uppercase tracking-[0.2em]" style={{ color:"var(--bj-red)" }}>
            {String(index + 1).padStart(2, "0")} · Latest
          </span>
        </div>
        <h3 className="font-serif line-clamp-2 text-[1.1rem] font-bold leading-snug tracking-tight" style={{ color:"var(--bj-text)" }}>
          {item.title || "Latest content"}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-5" style={{ color:"var(--bj-muted)" }}>
          {item.excerpt || item.description || "A story, video, or update from the platform."}
        </p>
        <a href={href} target={video && item.url ? "_blank" : undefined}
           rel={video && item.url ? "noopener noreferrer" : undefined}
           className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold transition"
           style={{ color:"var(--bj-red)" }}>
          {video ? "Watch now" : "Read story"} <ArrowRight size={13} />
        </a>
      </div>
    </motion.article>
  );
}

/* ─── Feature row — Apple-style numbered list ─────────── */
function FeatureRow({ num, icon: Icon, title, text, delay = 0 }) {
  return (
    <motion.div
      variants={fadeUp(delay)}
      className="group flex items-start gap-6 border-t py-7 transition-all duration-300 hover:gap-8"
      style={{ borderColor:"var(--bj-border)" }}
    >
      {/* Number */}
      <span className="shrink-0 font-sans text-[11px] font-black uppercase tracking-[0.2em] pt-0.5" style={{ color:"var(--bj-subtle)", minWidth:"28px" }}>
        {num}
      </span>

      {/* Icon circle */}
      <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-full transition group-hover:scale-105"
           style={{ border:"1.5px solid var(--bj-red-border)", background:"var(--bj-red-surface)", color:"var(--bj-red)" }}>
        <Icon size={17} />
      </div>

      {/* Text */}
      <div className="flex-1">
        <h3 className="font-serif text-xl font-bold tracking-tight" style={{ color:"var(--bj-text)" }}>{title}</h3>
        <p className="mt-1.5 text-[14px] leading-6" style={{ color:"var(--bj-muted)" }}>{text}</p>
      </div>

      {/* Arrow */}
      <ArrowRight size={16} className="mt-1.5 shrink-0 transition group-hover:translate-x-1" style={{ color:"var(--bj-subtle)" }} />
    </motion.div>
  );
}

/* ─── Page ─────────────────────────────────────────────── */
export default function Home({ posts = [], videos = [], settings }) {
  const carouselRef  = useRef(null);
  const allItems     = sortByDate([...posts, ...videos]);
  const heroScroll   = allItems.slice(0, 5);
  const latestCards  = allItems.slice(0, 8);

  const scrollCarousel = useCallback((dir) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 350, behavior: "smooth" });
  }, []);

  return (
    <main className="min-h-screen overflow-hidden" style={{ background:"var(--bj-bg)", color:"var(--bj-text)" }}>

      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden border-b" style={{ borderColor:"var(--bj-border)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_42%,rgba(220,38,38,0.11),transparent_28%),radial-gradient(circle_at_14%_80%,rgba(216,180,106,0.09),transparent_26%),linear-gradient(90deg,#F6F7F9_0%,rgba(246,247,249,0.96)_58%,rgba(246,247,249,0.82)_100%)] dark:bg-[radial-gradient(circle_at_82%_42%,rgba(220,38,38,0.17),transparent_28%),radial-gradient(circle_at_14%_80%,rgba(216,180,106,0.07),transparent_26%),linear-gradient(90deg,#131311_0%,rgba(19,19,17,0.98)_58%,rgba(19,19,17,0.82)_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:radial-gradient(rgba(0,0,0,0.5)_1px,transparent_1px)] [background-size:22px_22px] dark:opacity-[0.028]" />
        <div className="pointer-events-none absolute left-[3%] top-[16%] select-none text-[13vw] font-black uppercase leading-none tracking-[-0.08em] opacity-[0.025]" style={{ color:"var(--bj-text)" }}>
          MEDIA
        </div>

        <div className="relative mx-auto grid min-h-[calc(100vh-72px)] w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-28 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-10 lg:pt-24">
          {/* Left */}
          <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-20 max-w-3xl">
            <motion.p variants={fadeUp(0)} className="premium-label mb-5 uppercase">
              Independent Media Platform
            </motion.p>
            <motion.h1
              variants={fadeUp(0.05)}
              className="font-serif font-bold leading-[0.96] tracking-[-0.05em]"
              style={{ fontSize:"clamp(2.3rem,4.6vw,4.4rem)", color:"var(--bj-text)" }}
            >
              Stories that <br />
              <span style={{ color:"var(--bj-red)" }}>speak the truth.</span>
            </motion.h1>
            <motion.p variants={fadeUp(0.1)} className="mt-6 max-w-xl text-[16px] leading-7" style={{ color:"var(--bj-muted)" }}>
              An independent media platform delivering public-interest stories, original video, and timely updates — created to inform, question, and give the community a voice.
            </motion.p>

            <motion.div variants={fadeUp(0.15)} className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/content"
                className="inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition hover:-translate-y-0.5"
                style={{ background:"var(--bj-red)", boxShadow:"0 0 30px var(--bj-red-glow)" }}>
                <PlayCircle size={16} /> Watch Latest
              </Link>
              <Link to="/donate"
                className="inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-bold uppercase tracking-wide transition hover:-translate-y-0.5"
                style={{ border:"1.5px solid var(--bj-red-border)", background:"var(--bj-red-surface)", color:"var(--bj-red)" }}>
                <Heart size={16} /> Support Work
              </Link>
            </motion.div>

            <motion.div variants={fadeUp(0.2)} className="mt-10 grid max-w-sm grid-cols-3 gap-5">
              {[["1.3M+","Community"],["1.4K+","Stories Published"],["EN · TH","Audience Reach"]].map(([val, lbl]) => (
                <div key={lbl}>
                  <p className="font-serif text-2xl font-black tracking-tight" style={{ color:"var(--bj-text)" }}>{val}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em]" style={{ color:"var(--bj-subtle)" }}>{lbl}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — latest content mini-scroll */}
          <motion.div
            initial={{ opacity:0, x:45, scale:0.97 }}
            animate={{ opacity:1, x:0, scale:1 }}
            transition={{ duration:0.8, ease:EASE_OUT_EXPO }}
            className="relative z-10 lg:justify-self-end"
          >
            <div className="relative overflow-hidden rounded-[2rem] p-5"
                 style={{ border:"1px solid var(--bj-border-hover)", background:"var(--bj-surface)", boxShadow:"0 24px 80px rgba(0,0,0,0.09)" }}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="premium-label uppercase">Latest Content</p>
                  <h2 className="font-serif mt-1.5 text-2xl font-black tracking-tight" style={{ color:"var(--bj-text)" }}>
                    Just published
                  </h2>
                </div>
                <Link to="/content"
                  className="hidden rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] transition hover:text-[var(--bj-text)] sm:inline-flex"
                  style={{ border:"1px solid var(--bj-border-hover)", color:"var(--bj-muted)" }}>
                  VIEW ALL
                </Link>
              </div>

              <div className="flex max-w-[560px] gap-3.5 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden"
                   style={{ scrollbarWidth:"none" }}>
                {heroScroll.length > 0 ? heroScroll.map((item, i) => (
                  <HeroScrollCard key={item.id || item._id || i} item={item} index={i} />
                )) : (
                  <div className="rounded-2xl p-6 text-sm"
                       style={{ border:"1px solid var(--bj-border)", background:"var(--bj-surface-2)", color:"var(--bj-muted)" }}>
                    Add content from the admin dashboard to display here.
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3.5">
                {[{ icon:Zap, title:"Trending", desc:"Fast updates and reels." },
                  { icon:Globe, title:"Social", desc:"Facebook and Instagram." }].map(({ icon:Icon, title, desc }) => (
                  <div key={title} className="rounded-[1.25rem] p-4"
                       style={{ border:"1px solid var(--bj-border)", background:"var(--bj-surface-2)" }}>
                    <Icon size={18} className="mb-2.5" style={{ color:"var(--bj-red)" }} />
                    <h3 className="font-serif text-base font-black tracking-tight" style={{ color:"var(--bj-text)" }}>{title}</h3>
                    <p className="mt-0.5 text-[12px]" style={{ color:"var(--bj-muted)" }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── LATEST CONTENT — horizontal carousel ──────── */}
      <section className="border-b py-14" style={{ borderColor:"var(--bj-border)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {/* Header */}
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once:true, amount:0.3 }}
            variants={stagger}
            className="mb-8 flex items-end justify-between gap-4"
          >
            <div>
              <motion.p variants={fadeUp()} className="premium-label mb-3 uppercase">Latest Content</motion.p>
              <motion.h2 variants={fadeUp(0.05)}
                className="font-serif font-bold leading-tight tracking-tight"
                style={{ fontSize:"clamp(1.9rem,3.5vw,3rem)", color:"var(--bj-text)" }}>
                Fresh from the media desk.
              </motion.h2>
              <motion.p variants={fadeUp(0.1)} className="mt-3 max-w-md text-[14px] leading-6" style={{ color:"var(--bj-muted)" }}>
                The newest stories, video, and reels — published first, here.
              </motion.p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex gap-2">
                <button type="button" onClick={() => scrollCarousel(-1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition"
                  style={{ border:"1.5px solid var(--bj-border-hover)", background:"var(--bj-surface)", color:"var(--bj-muted)" }}
                  aria-label="Scroll left">
                  <ChevronLeft size={16} />
                </button>
                <button type="button" onClick={() => scrollCarousel(1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition"
                  style={{ border:"1.5px solid var(--bj-border-hover)", background:"var(--bj-surface)", color:"var(--bj-muted)" }}
                  aria-label="Scroll right">
                  <ChevronRight size={16} />
                </button>
              </div>
              <Link to="/content"
                className="hidden items-center gap-2 text-sm font-bold transition hover:gap-3 sm:inline-flex"
                style={{ color:"var(--bj-red)" }}>
                View all content <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>

          {/* Carousel — cards reveal one after another */}
          {latestCards.length > 0 ? (
            <motion.div
              ref={carouselRef}
              initial="hidden"
              whileInView="visible"
              viewport={{ once:true, amount:0.15 }}
              variants={stagger}
              style={{
                display:"flex", gap:"16px", overflowX:"auto",
                scrollSnapType:"x mandatory", WebkitOverflowScrolling:"touch",
                paddingBottom:"8px", scrollbarWidth:"none", msOverflowStyle:"none",
              }}
              className="[&::-webkit-scrollbar]:hidden"
            >
              {latestCards.map((item, i) => (
                <motion.div
                  key={item.id || item._id || i}
                  variants={fadeUp()}
                  style={{ scrollSnapAlign:"start", flexShrink:0, display:"flex" }}
                >
                  <ContentCard item={item} index={i} />
                </motion.div>
              ))}
              <div style={{ width:24, flexShrink:0 }} />
            </motion.div>
          ) : (
            <div className="rounded-[1.75rem] p-10 text-center"
                 style={{ border:"1px solid var(--bj-border-hover)", background:"var(--bj-surface)" }}>
              <p className="font-serif text-xl font-bold" style={{ color:"var(--bj-text)" }}>No content yet.</p>
              <p className="mt-2 text-sm" style={{ color:"var(--bj-muted)" }}>Add posts and videos from the admin dashboard.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── FEATURES — Apple-style numbered rows ──────── */}
      <section className="border-b py-14" style={{ borderColor:"var(--bj-border)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once:true, amount:0.2 }}
            variants={stagger}
          >
            <motion.p variants={fadeUp()} className="premium-label mb-3 uppercase">Platform</motion.p>
            <motion.h2 variants={fadeUp(0.05)}
              className="font-serif mb-2 font-bold tracking-tight"
              style={{ fontSize:"clamp(1.7rem,3vw,2.5rem)", color:"var(--bj-text)" }}>
              Built for truth, reach &amp; community.
            </motion.h2>

            <FeatureRow num="01" icon={ShieldCheck} delay={0.1}
              title="Independent Voice"
              text="A clean platform for public stories, awareness, and community-focused media — free from bias or sponsored influence." />
            <FeatureRow num="02" icon={PlayCircle} delay={0.15}
              title="Social Video Ready"
              text="Facebook videos, reels, YouTube and Instagram media displayed directly from URLs — no re-upload needed." />
            <FeatureRow num="03" icon={Crown} delay={0.2}
              title="Premium Membership"
              text="Exclusive images, videos, and private media links unlocked for subscribers. Starting at $5/month, cancel anytime." />
          </motion.div>
        </div>
      </section>

      {/* ── PREMIUM MEMBERS — Apple-style showcase card ─── */}
      <section className="border-b py-16" style={{ borderColor:"var(--bj-border)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div
            initial={{ opacity:0, y:36 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true, amount:0.2 }}
            transition={{ duration:0.8, ease:EASE_OUT_EXPO }}
            className="relative overflow-hidden rounded-[2rem]"
            style={{
              border:"1px solid var(--bj-gold-border)",
              background:"linear-gradient(135deg, var(--bj-gold-surface) 0%, var(--bj-surface) 55%)",
            }}
          >
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full"
                 style={{ background:"radial-gradient(circle, var(--bj-gold-surface) 0%, transparent 70%)", filter:"blur(40px)" }} />

            <div className="relative grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              {/* Left — copy + features */}
              <div>
                <p className="premium-label gold mb-4 uppercase">Premium Members</p>
                <h2 className="font-serif font-bold leading-[1.05] tracking-tight"
                    style={{ fontSize:"clamp(1.9rem,3.6vw,3.1rem)", color:"var(--bj-text)" }}>
                  Exclusive content,<br />unlocked for members.
                </h2>
                <p className="mt-4 max-w-md text-[15px] leading-7" style={{ color:"var(--bj-text)", opacity:0.74 }}>
                  Subscribe to access private images, videos, and media links uploaded exclusively for premium members.
                </p>

                {/* Feature checklist */}
                <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
                  {[
                    "Full premium image library",
                    "Exclusive videos & reels",
                    "Private media links",
                    "New content notifications",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[13.5px] font-medium"
                        style={{ color:"var(--bj-text)", opacity:0.82 }}>
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                            style={{ background:"var(--bj-gold-surface)", color:"var(--bj-gold)", border:"1px solid var(--bj-gold-border)" }}>
                        <Check size={11} strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — plan chips + CTAs */}
              <div className="rounded-[1.5rem] p-6"
                   style={{ border:"1px solid var(--bj-border-hover)", background:"var(--bj-surface)", boxShadow:"0 20px 60px rgba(0,0,0,0.10)" }}>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon:ImageIcon, label:"Images", price:"$5", note:"/mo" },
                    { icon:VideoIcon, label:"Videos", price:"$10", note:"/mo", best:true },
                  ].map(({ icon:Icon, label, price, note, best }) => (
                    <div key={label} className="relative rounded-[1.1rem] p-4"
                         style={{
                           border:`1.5px solid ${best ? "var(--bj-gold-border)" : "var(--bj-border-hover)"}`,
                           background: best ? "var(--bj-gold-surface)" : "var(--bj-surface-2)",
                         }}>
                      {best && (
                        <span className="absolute right-2.5 top-2.5 rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-white"
                              style={{ background:"var(--bj-gold)" }}>
                          Best
                        </span>
                      )}
                      <Icon size={18} style={{ color: best ? "var(--bj-gold)" : "var(--bj-muted)" }} />
                      <p className="mt-2.5 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color:"var(--bj-muted)" }}>{label}</p>
                      <p className="font-serif mt-0.5 text-2xl font-black tracking-tight" style={{ color:"var(--bj-text)" }}>
                        {price}<span className="text-xs font-semibold" style={{ color:"var(--bj-subtle)" }}>{note}</span>
                      </p>
                    </div>
                  ))}
                </div>

                <Link to="/subscribe"
                  className="mt-4 flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-black uppercase tracking-wide text-white transition hover:-translate-y-0.5"
                  style={{ background:"var(--bj-gold)", boxShadow:"0 0 26px var(--bj-gold-surface)" }}>
                  <Crown size={15} /> Subscribe Now
                </Link>
                <Link to="/premium"
                  className="mt-2.5 flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold uppercase tracking-wide transition hover:-translate-y-0.5"
                  style={{ border:"1.5px solid var(--bj-gold-border)", color:"var(--bj-gold)" }}>
                  <Lock size={13} /> View Premium
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DONATE CTA — matching showcase card ───────── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div
            initial={{ opacity:0, y:36 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true, amount:0.2 }}
            transition={{ duration:0.8, ease:EASE_OUT_EXPO }}
            className="relative overflow-hidden rounded-[2rem]"
            style={{
              border:"1px solid var(--bj-red-border)",
              background:"linear-gradient(135deg, var(--bj-red-surface) 0%, var(--bj-surface) 55%)",
            }}
          >
            {/* Ambient glow */}
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full"
                 style={{ background:"radial-gradient(circle, var(--bj-red-surface) 0%, transparent 70%)", filter:"blur(40px)" }} />

            <div className="relative grid gap-8 p-8 sm:p-12 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="premium-label mb-4 uppercase">Support the Platform</p>
                <h2 className="font-serif font-bold leading-[1.05] tracking-tight"
                    style={{ fontSize:"clamp(1.9rem,3.6vw,3.1rem)", color:"var(--bj-text)" }}>
                  Support independent media.
                </h2>
                <p className="mt-4 max-w-lg text-[15px] leading-7" style={{ color:"var(--bj-text)", opacity:0.74 }}>
                  Your contribution helps continue creating stories, videos, and public updates for the community. Every donation matters.
                </p>

                {/* Currency chips — visual interest */}
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color:"var(--bj-subtle)" }}>Accepts</span>
                  {["USD", "CAD", "THB"].map((c) => (
                    <span key={c} className="rounded-full px-3 py-1 text-[11px] font-bold"
                          style={{ border:"1px solid var(--bj-border-hover)", background:"var(--bj-surface)", color:"var(--bj-muted)" }}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <Link to="/donate"
                className="inline-flex shrink-0 items-center justify-center gap-3 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:-translate-y-0.5"
                style={{ background:"var(--bj-red)", boxShadow:"0 0 28px var(--bj-red-glow)" }}>
                <Heart size={16} fill="currentColor" /> Donate Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
