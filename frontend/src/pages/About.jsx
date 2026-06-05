import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Facebook, Instagram, MessageCircle,
  ShieldCheck, Users, Search, Play, Heart, ArrowRight,
} from "lucide-react";

const up       = { hidden: { opacity: 0, y: 34 }, visible: { opacity: 1, y: 0, transition: { duration: 0.72, ease: "easeOut" } } };
const fromLeft = { hidden: { opacity: 0, x: -45 }, visible: { opacity: 1, x: 0, transition: { duration: 0.82, ease: "easeOut" } } };
const fromRight= { hidden: { opacity: 0, x: 45  }, visible: { opacity: 1, x: 0, transition: { duration: 0.82, ease: "easeOut" } } };
const stagger  = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };

const socialLinks = {
  facebook:  "https://www.facebook.com/share/1BSGbLnQcv/?mibextid=wwXIfr",
  instagram: "https://www.instagram.com/rajputh62?igsh=Zno3NnhndGM4bjcy",
  whatsapp:  "https://wa.me/13124590936",
};

function ValueCard({ icon: Icon, title, text }) {
  return (
    <motion.div
      variants={up}
      className="rounded-[1.75rem] border border-black/8 bg-white p-7 shadow-[0_18px_50px_rgba(0,0,0,0.055)] transition hover:-translate-y-1 hover:border-red-500/30 border-[var(--bj-border)] dark:bg-white/[0.035] dark:shadow-none dark:backdrop-blur-xl"
    >
      <div className="mb-5 flex h-13 w-13 items-center justify-center rounded-full border border-red-500/22 bg-red-500/8 text-red-600 dark:text-red-500">
        <Icon size={22} />
      </div>
      <h3 className="font-serif text-xl font-bold tracking-tight text-[var(--bj-text)]">{title}</h3>
      <p className="mt-3 text-[14.5px] leading-7 text-[var(--bj-muted)]">{text}</p>
    </motion.div>
  );
}

function StatCard({ value, label }) {
  return (
    <motion.div
      variants={up}
      className="rounded-[1.75rem] border border-black/8 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.055)] transition hover:border-red-500/28 border-[var(--bj-border)] dark:bg-[#1F1F1D]/80 dark:shadow-none dark:backdrop-blur-xl"
    >
      <h3 className="font-serif text-3xl font-black tracking-[-0.04em] text-black md:text-4xl dark:text-white">{value}</h3>
      <p className="mt-3 text-sm leading-6 text-[var(--bj-muted)]">{label}</p>
    </motion.div>
  );
}

export default function About({ settings }) {
  const fb = settings?.facebook  || socialLinks.facebook;
  const ig = settings?.instagram || socialLinks.instagram;

  /* Admin-editable imagery (fall back to bundled defaults) */
  const heroImg     = settings?.aboutHeroImage     || "/images/about/cutout-portrait.webp";
  const portraitImg = settings?.aboutPortraitImage || "/images/about/about-bw.webp";
  const featuredImg = settings?.aboutFeaturedImage || "/images/about/hero-portrait.webp";

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--bj-bg)] text-[var(--bj-text)]">

      {/* ── HERO ── */}
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden border-b border-black/8 border-[var(--bj-border)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_52%,rgba(220,38,38,0.13),transparent_30%),linear-gradient(90deg,#F6F7F9_0%,rgba(246,247,249,0.98)_49%,rgba(246,247,249,0.78)_100%)] dark:bg-[radial-gradient(circle_at_80%_52%,rgba(220,38,38,0.18),transparent_30%),linear-gradient(90deg,#131311_0%,rgba(19,19,17,0.98)_49%,rgba(19,19,17,0.78)_100%)]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px] dark:opacity-[0.036] dark:[background-image:radial-gradient(#fff_1px,transparent_1px)]" />
        <div className="pointer-events-none absolute left-[4%] top-[20%] select-none text-[13vw] font-black uppercase leading-none tracking-[-0.08em] text-black/[0.03] dark:text-white/[0.028]">
          TRUTH
        </div>

        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-6 pb-16 pt-28 lg:min-h-[calc(100vh-72px)] lg:grid-cols-[1fr_0.95fr] lg:px-10 lg:pb-10 lg:pt-24">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="relative z-20">
            <motion.p variants={up} className="premium-label mb-5 uppercase">About</motion.p>
            <motion.h1
              variants={up}
              className="font-serif text-[clamp(2.3rem,4.8vw,4.7rem)] font-bold leading-[0.96] tracking-[-0.05em] text-[var(--bj-text)]"
            >
              Independent <br />
              <span className="text-red-600 dark:text-red-500">Media Voice</span>
            </motion.h1>
            <motion.p variants={up} className="mt-7 max-w-xl text-[17px] leading-8 text-[var(--bj-muted)]">
              We investigate what others avoid, publish stories that challenge
              silence, and create media that brings hidden issues forward for
              public awareness.
            </motion.p>
            <motion.div variants={up} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/content"
                className="inline-flex items-center gap-3 rounded-full bg-red-600 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_0_30px_rgba(220,38,38,0.24)] transition hover:bg-red-700"
              >
                <Play size={15} fill="currentColor" />
                Watch Latest
              </Link>
              <Link
                to="/donate"
                className="inline-flex items-center gap-3 rounded-full border border-red-600/45 bg-red-600/8 px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-red-700 transition hover:bg-red-600/14 dark:border-red-500/38 dark:bg-red-500/8 dark:text-red-400"
              >
                <Heart size={15} />
                Support Work
              </Link>
            </motion.div>
            <motion.div variants={up} className="mt-10 flex flex-wrap items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.25em] text-black/38 text-[var(--bj-subtle)]">Follow</span>
              <a href={fb} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-black/60 transition hover:text-red-600 dark:text-white/65 dark:hover:text-red-500"><Facebook size={18} /></a>
              <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-black/60 transition hover:text-red-600 dark:text-white/65 dark:hover:text-red-500"><Instagram size={18} /></a>
              <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-black/60 transition hover:text-red-600 dark:text-white/65 dark:hover:text-red-500"><MessageCircle size={18} /></a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative z-10 flex items-end justify-center self-end lg:h-[calc(100vh-170px)]"
          >
            <div className="absolute bottom-2 h-[330px] w-[330px] rounded-full border border-red-500/18 bg-red-500/5 sm:h-[380px] sm:w-[380px] lg:h-[410px] lg:w-[410px]" />
            <div className="absolute bottom-8 h-[240px] w-[240px] rounded-full bg-red-600/10 blur-3xl sm:h-[280px] sm:w-[280px]" />
            <img
              src={heroImg}
              alt="Independent media"
              className="relative z-10 max-h-[380px] w-auto translate-y-6 object-contain drop-shadow-[0_0_55px_rgba(220,38,38,0.14)] sm:max-h-[445px] md:max-h-[500px] lg:max-h-[535px] xl:max-h-[560px]"
            />
          </motion.div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="relative overflow-hidden border-b border-black/8 border-[var(--bj-border)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(220,38,38,0.07),transparent_28%)] dark:bg-[radial-gradient(circle_at_15%_30%,rgba(220,38,38,0.11),transparent_28%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.28 }}
            variants={fromLeft}
            className="relative"
          >
            <div className="absolute -right-6 -top-6 h-full w-full border border-black/8 border-[var(--bj-border)]" />
            <img
              src={portraitImg}
              alt="Editorial portrait"
              className="relative z-10 max-h-[560px] w-full rounded-sm border object-contain grayscale border-[var(--bj-border)]"
            />
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.28 }} variants={stagger}>
            <motion.p variants={up} className="premium-label mb-4 uppercase">The Mission</motion.p>
            <motion.h2 variants={up} className="font-serif max-w-2xl text-4xl font-bold leading-tight tracking-tight text-black md:text-5xl dark:text-white">
              To inform. To question.<br />To expose what matters.
            </motion.h2>
            <motion.p variants={up} className="mt-7 max-w-2xl text-[16.5px] leading-8 text-[var(--bj-muted)]">
              This platform exists to bring attention to stories that deserve
              public awareness. Through posts, videos, reels, and coverage
              built around community-focused truth and responsibility.
            </motion.p>
            <motion.div variants={up} className="mt-8 flex flex-wrap gap-2.5">
              {["News", "Reels", "Videos", "Community"].map((tag) => (
                <span key={tag} className="rounded-full border border-black/10 bg-white/65 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-black/60 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/58">
                  {tag}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="border-b border-black/8 border-[var(--bj-border)]">
        <div className="mx-auto w-full max-w-7xl px-6 py-16 lg:px-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.28 }} variants={stagger} className="mx-auto max-w-3xl text-center">
            <motion.p variants={up} className="premium-label mb-4 uppercase">Values</motion.p>
            <motion.h2 variants={up} className="font-serif text-4xl font-bold leading-tight tracking-tight text-black md:text-5xl dark:text-white">
              Built for clarity, courage, and public voice.
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.22 }} variants={stagger} className="mt-12 grid gap-5 md:grid-cols-3">
            <ValueCard icon={ShieldCheck} title="Truth First"       text="Every story should be guided by facts, honesty, and a commitment to accuracy." />
            <ValueCard icon={Search}      title="Independent Voice" text="Built around questioning, verifying, and bringing important issues forward — without influence." />
            <ValueCard icon={Users}       title="Community Impact"  text="The platform focuses on people, public awareness, and stories that create real conversation." />
          </motion.div>
        </div>
      </section>

      {/* ── MOVEMENT ── */}
      <section className="relative overflow-hidden border-b border-black/8 border-[var(--bj-border)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_30%,rgba(220,38,38,0.07),transparent_28%)] dark:bg-[radial-gradient(circle_at_75%_30%,rgba(220,38,38,0.12),transparent_28%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.28 }} variants={stagger}>
            <motion.p variants={up} className="premium-label mb-4 uppercase">The Reach</motion.p>
            <motion.h2 variants={up} className="font-serif text-4xl font-bold leading-tight tracking-tight text-black md:text-5xl dark:text-white">
              From a single voice to a global audience.
            </motion.h2>
            <motion.p variants={up} className="mt-7 max-w-2xl text-[16.5px] leading-8 text-[var(--bj-muted)]">
              With a large digital following and a growing English and Thai-speaking
              audience, the platform continues to publish stories, videos, and updates
              that reach people across borders.
            </motion.p>
            <motion.div variants={stagger} className="mt-10 grid gap-4 sm:grid-cols-2">
              <StatCard value="1.3M+" label="Followers across platforms" />
              <StatCard value="1.4K+" label="Posts published" />
              <StatCard value="EN + TH" label="English and Thai audience" />
              <StatCard value="Media"  label="Independent news platform" />
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.28 }}
            variants={fromRight}
            className="relative flex justify-center"
          >
            <div className="absolute top-20 h-[340px] w-[340px] rounded-full border border-red-500/18" />
            <div className="absolute top-20 h-[260px] w-[260px] rounded-full bg-red-600/8 blur-3xl" />
            <img src={heroImg} alt="Media platform" className="relative z-10 max-h-[500px] w-auto object-contain" />
          </motion.div>
        </div>
      </section>

      {/* ── FEATURED WORK ── */}
      <section className="border-b border-black/8 border-[var(--bj-border)]">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
          <motion.div
            initial="hidden" whileInView="visible"
            viewport={{ once: true, amount: 0.28 }}
            variants={stagger}
            className="flex flex-col justify-between rounded-[2rem] border border-red-500/22 bg-gradient-to-br from-red-700 to-[#160608] p-10 text-white"
          >
            <div>
              <motion.p variants={up} className="premium-label mb-4 uppercase !text-red-100 [&::before]:!bg-red-200">Featured Work</motion.p>
              <motion.h2 variants={up} className="font-serif text-4xl font-black leading-tight tracking-tight text-white md:text-[2.6rem]">
                Stories with impact.
              </motion.h2>
              <motion.p variants={up} className="mt-5 max-w-md text-[15px] leading-7 text-white/70">
                A space for the latest videos, reels, and posts that bring public
                attention to what matters most.
              </motion.p>
            </div>
            <motion.div variants={up}>
              <Link
                to="/content"
                className="mt-9 inline-flex items-center gap-3 rounded-full border border-white/22 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black"
              >
                View All Content <ArrowRight size={14} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 45 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.28 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="group relative min-h-[420px] overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_18px_50px_rgba(0,0,0,0.055)] border-[var(--bj-border)] dark:bg-white/[0.035] dark:shadow-none"
          >
            <img
              src={featuredImg}
              alt="Featured media"
              className="h-full min-h-[420px] w-full object-cover opacity-72 transition duration-500 group-hover:scale-105 dark:opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/8" />
            <Link
              to="/content"
              className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/28 bg-black/38 text-white backdrop-blur-md transition hover:scale-105 hover:bg-red-600"
              aria-label="Watch latest content"
            >
              <Play size={28} fill="white" />
            </Link>
            <div className="absolute bottom-8 left-8 right-8">
              <p className="premium-label mb-2 uppercase !text-red-400">Latest Media</p>
              <h3 className="font-serif max-w-xl text-2xl font-bold tracking-tight text-white md:text-3xl">
                Watch the latest stories and public updates.
              </h3>
              <p className="mt-2 text-sm text-white/58">Videos, reels, and posts from the platform.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── SUPPORT CTA ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-8 rounded-[2rem] border border-red-600/22 bg-gradient-to-r from-[#fff7e8] to-white p-8 shadow-[0_18px_55px_rgba(0,0,0,0.055)] md:grid-cols-[1fr_auto] md:items-center dark:border-red-600/18 dark:from-[#221210] dark:to-[#1F1F1D] dark:shadow-none">
            <div>
              <p className="premium-label mb-4 uppercase">Support the Platform</p>
              <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-black md:text-5xl dark:text-white">
                Support independent media.
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-7 text-black/60 dark:text-white/58">
                Your support helps continue creating stories, videos, and public updates for the community.
              </p>
            </div>
            <Link
              to="/donate"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-red-600 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-[0_0_30px_rgba(220,38,38,0.24)] transition hover:-translate-y-0.5 hover:bg-red-700"
            >
              <Heart size={17} />
              Donate Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
