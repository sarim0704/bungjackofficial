import { useState } from "react";
import { motion } from "framer-motion";
import { Image, Video, Lock, ArrowRight, Crown, ShieldCheck, Loader2 } from "lucide-react";
import { apiPost } from "../api.js";
import Captcha, { CAPTCHA_ENABLED } from "../components/Captcha.jsx";

const up      = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const PLANS = [
  {
    id: "images",
    price: 5,
    title: "Images Access",
    icon: Image,
    tag: "Entry",
    features: ["All premium images", "New content notifications", "Cancel anytime"],
    description: "Unlock the full premium image library uploaded by the admin.",
  },
  {
    id: "videos",
    price: 10,
    title: "Videos Access",
    icon: Video,
    tag: "Full Access",
    features: ["All premium images", "Exclusive videos & links", "Priority new content", "Cancel anytime"],
    description: "Everything in Images plus premium videos and private media links.",
    recommended: true,
  },
];

const FEATURES = [
  { icon: Crown,       title: "Admin-curated",  text: "Premium images, videos, and links uploaded directly by the admin team." },
  { icon: Lock,        title: "Access control", text: "Content is plan-gated — only active subscribers can view it." },
  { icon: ShieldCheck, title: "Stripe secure",  text: "Payments processed by Stripe. PCI DSS compliant by default." },
];

export default function Subscribe() {
  const [selected, setSelected] = useState("videos");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [captcha,  setCaptcha]  = useState("");

  const plan = PLANS.find((p) => p.id === selected);

  const startCheckout = async () => {
    setError("");
    if (!email.trim()) { setError("Email address is required."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }
    if (CAPTCHA_ENABLED && !captcha) { setError("Please complete the captcha."); return; }
    setLoading(true);
    try {
      const data = await apiPost("/subscriptions/create-checkout-session", {
        subscriberName:  name.trim().slice(0, 120),
        subscriberEmail: email.trim().toLowerCase().slice(0, 254),
        plan: selected,
        captchaToken: captcha,
      });
      if (data.url) window.location.href = data.url;
      else setError(data.error || "Checkout is not available yet. Please try again.");
    } catch (err) {
      setError(err.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden" style={{ background: "var(--bj-bg)", color: "var(--bj-text)" }}>

      {/* ── HERO — compact ─────────────────────────────── */}
      <section className="relative border-b py-8 sm:py-10" style={{ borderColor: "var(--bj-border)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_38%,rgba(220,38,38,0.10),transparent_28%),linear-gradient(90deg,#F6F7F9_0%,rgba(246,247,249,0.94)_55%,transparent_100%)] dark:bg-[radial-gradient(circle_at_78%_38%,rgba(220,38,38,0.16),transparent_28%),linear-gradient(90deg,#131311_0%,rgba(19,19,17,0.96)_55%,transparent_100%)]" />
        <div className="pointer-events-none absolute left-[4%] top-[10%] select-none text-[11vw] font-black uppercase leading-none tracking-[-0.08em] opacity-[0.022]"
             style={{ color: "var(--bj-text)" }}>
          PREMIUM
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={up} className="premium-label mb-4 uppercase">Premium Access</motion.p>
            <motion.h1
              variants={up}
              className="font-serif text-5xl font-bold leading-none tracking-tight sm:text-6xl lg:text-7xl"
              style={{ color: "var(--bj-text)" }}
            >
              Subscribe
            </motion.h1>
            <motion.p variants={up} className="mt-4 max-w-xl text-[15.5px] leading-7" style={{ color: "var(--bj-muted)" }}>
              Choose a monthly access tier. Unlock exclusive images, videos, and private media links uploaded by the platform.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── PLANS + CHECKOUT ────────────────────────────── */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">

            {/* ── Plan cards ── */}
            <motion.div initial="hidden" whileInView="visible"
                        viewport={{ once: true, amount: 0.15 }} variants={stagger}>
              <motion.p variants={up} className="premium-label mb-2.5 uppercase">Choose a Plan</motion.p>
              <motion.h2 variants={up} className="font-serif text-3xl font-bold tracking-tight" style={{ color: "var(--bj-text)" }}>
                Simple, transparent pricing.
              </motion.h2>
              <motion.p variants={up} className="mt-2 text-[14px]" style={{ color: "var(--bj-muted)" }}>
                Cancel anytime. Payments processed securely via Stripe.
              </motion.p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {PLANS.map((p) => {
                  const Icon   = p.icon;
                  const active = selected === p.id;
                  return (
                    <motion.button
                      key={p.id}
                      variants={up}
                      type="button"
                      onClick={() => setSelected(p.id)}
                      className="relative rounded-[1.5rem] p-5 text-left transition-all duration-200"
                      style={{
                        border:     `1.5px solid ${active ? "var(--bj-red)" : "var(--bj-border-hover)"}`,
                        background: active ? "var(--bj-surface)" : "var(--bj-surface)",
                        boxShadow:  active ? "0 0 32px var(--bj-red-glow)" : "none",
                      }}
                    >
                      {p.recommended && (
                        <span className="absolute right-3.5 top-3.5 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white"
                              style={{ background: "var(--bj-red)" }}>
                          Recommended
                        </span>
                      )}

                      {/* Icon */}
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full"
                           style={{
                             border:     `1.5px solid ${active ? "var(--bj-red-border)" : "var(--bj-border-hover)"}`,
                             background: active ? "var(--bj-red-surface)" : "var(--bj-surface-2)",
                             color:      active ? "var(--bj-red)" : "var(--bj-muted)",
                           }}>
                        <Icon size={18} />
                      </div>

                      {/* Title + tag */}
                      <div className="mb-2 flex items-center gap-2">
                        <h3 className="font-serif text-[1.15rem] font-bold tracking-tight" style={{ color: "var(--bj-text)" }}>
                          {p.title}
                        </h3>
                        <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                              style={{
                                background: active ? "var(--bj-red-surface)" : "var(--bj-surface-2)",
                                color:      active ? "var(--bj-red)"         : "var(--bj-subtle)",
                              }}>
                          {p.tag}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="mb-4 text-[12.5px] leading-5" style={{ color: "var(--bj-muted)" }}>
                        {p.description}
                      </p>

                      {/* Price */}
                      <p className="font-serif text-3xl font-black tracking-tight" style={{ color: "var(--bj-red)" }}>
                        ${p.price}
                        <span className="text-sm font-semibold" style={{ color: "var(--bj-subtle)" }}> / mo</span>
                      </p>

                      {/* Features */}
                      <ul className="mt-4 grid gap-1.5">
                        {p.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-[12px]" style={{ color: "var(--bj-muted)" }}>
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: "var(--bj-red)" }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* ── Checkout form ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="rounded-[1.75rem] p-7"
              style={{
                border:     "1px solid var(--bj-border-hover)",
                background: "var(--bj-surface)",
                boxShadow:  "0 16px 50px rgba(0,0,0,0.06)",
              }}
            >
              {/* Header */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
                     style={{ background: "var(--bj-red)" }}>
                  <Lock size={18} />
                </div>
                <div>
                  <p className="premium-label uppercase">Checkout</p>
                  <h2 className="font-serif text-xl font-bold tracking-tight" style={{ color: "var(--bj-text)" }}>
                    Create access pass
                  </h2>
                </div>
              </div>

              <div className="grid gap-3.5">
                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em]"
                         style={{ color: "var(--bj-muted)" }}>
                    Full name
                  </label>
                  <input className="bj-input" placeholder="Your name"
                         value={name} onChange={(e) => setName(e.target.value)}
                         maxLength={120} autoComplete="name" />
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em]"
                         style={{ color: "var(--bj-muted)" }}>
                    Email address <span style={{ color: "var(--bj-red)" }}>*</span>
                  </label>
                  <input className="bj-input" type="email" placeholder="your@email.com"
                         value={email} onChange={(e) => setEmail(e.target.value)}
                         maxLength={254} required autoComplete="email" />
                </div>

                {/* Plan summary */}
                <div className="flex items-center justify-between rounded-xl px-4 py-3"
                     style={{ border: "1px solid var(--bj-border-hover)", background: "var(--bj-surface-2)" }}>
                  <span className="text-[12.5px] font-semibold" style={{ color: "var(--bj-muted)" }}>
                    Selected plan
                  </span>
                  <span className="font-bold text-sm" style={{ color: "var(--bj-text)" }}>
                    {plan?.title} — ${plan?.price}/mo
                  </span>
                </div>

                {CAPTCHA_ENABLED && <Captcha onToken={setCaptcha} />}

                {error && (
                  <div className="rounded-xl px-4 py-3 text-sm"
                       style={{ border: "1px solid rgba(220,38,38,0.22)", background: "rgba(220,38,38,0.07)", color: "var(--bj-red)" }}>
                    {error}
                  </div>
                )}

                <button type="button" onClick={startCheckout} disabled={loading}
                        className="btn-primary w-full rounded-xl py-3.5 disabled:opacity-55">
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> Starting checkout...</>
                    : <>Continue to Stripe <ArrowRight size={15} /></>}
                </button>

                <p className="flex items-center justify-center gap-2 text-[11.5px]"
                   style={{ color: "var(--bj-subtle)" }}>
                  <ShieldCheck size={12} />
                  Stripe handles payment. We never store card details.
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Feature trust cards ── */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="mt-8 grid gap-4 sm:grid-cols-3"
          >
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <motion.div
                key={title}
                variants={up}
                className="rounded-[1.25rem] p-5"
                style={{
                  border:     "1px solid var(--bj-border-hover)",
                  background: "var(--bj-surface)",
                }}
              >
                {/* Icon in circle */}
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full"
                     style={{
                       border:     "1.5px solid var(--bj-red-border)",
                       background: "var(--bj-red-surface)",
                       color:      "var(--bj-red)",
                     }}>
                  <Icon size={18} />
                </div>
                <h3 className="font-serif text-base font-bold tracking-tight" style={{ color: "var(--bj-text)" }}>
                  {title}
                </h3>
                <p className="mt-2 text-[13px] leading-6" style={{ color: "var(--bj-muted)" }}>
                  {text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
