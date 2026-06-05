import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CreditCard, Heart, Lock, ShieldCheck, Globe, Zap, Loader2 } from "lucide-react";
import { apiPost } from "../api.js";

const up      = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const CURRENCIES = {
  USD: { symbol: "$",  amounts: [5, 10, 25, 50, 100], label: "US Dollar" },
  CAD: { symbol: "C$", amounts: [5, 10, 25, 50, 100], label: "Canadian Dollar" },
  THB: { symbol: "฿",  amounts: [100, 300, 500, 1000, 2000], label: "Thai Baht" },
};

export default function Donate() {
  const [currency,  setCurrency]  = useState("USD");
  const [selected,  setSelected]  = useState(10);
  const [custom,    setCustom]    = useState("");
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);

  const cur    = CURRENCIES[currency];
  const amount = useMemo(() => (Number(custom) > 0 ? Number(custom) : selected), [custom, selected]);

  const changeCurrency = (c) => {
    setCurrency(c);
    setSelected(CURRENCIES[c].amounts[1]);
    setCustom("");
  };

  const startCheckout = async () => {
    setError("");
    if (amount < 1) { setError("Please enter a valid donation amount."); return; }
    setLoading(true);
    try {
      const data = await apiPost("/donations/create-checkout-session", {
        amount,
        currency,
        donorName:  name.trim().slice(0, 120),
        donorEmail: email.trim().toLowerCase().slice(0, 254),
      });
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Stripe checkout is not configured yet. Please try again later.");
      }
    } catch (err) {
      setError(err.message || "Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--bj-bg)] text-[var(--bj-text)]">

      {/* ── HERO ── */}
      <section className="relative border-b border-black/8 py-20 border-[var(--bj-border)] sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_38%,rgba(220,38,38,0.11),transparent_28%),linear-gradient(90deg,#F6F7F9_0%,rgba(246,247,249,0.96)_55%,transparent_100%)] dark:bg-[radial-gradient(circle_at_78%_38%,rgba(220,38,38,0.17),transparent_28%),linear-gradient(90deg,#131311_0%,rgba(19,19,17,0.98)_55%,transparent_100%)]" />
        <div className="pointer-events-none absolute left-[4%] top-[18%] select-none text-[13vw] font-black uppercase leading-none tracking-[-0.08em] text-black/[0.03] dark:text-white/[0.028]">
          DONATE
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={up} className="premium-label mb-5 uppercase">Support the Work</motion.p>
            <motion.h1
              variants={up}
              className="font-serif text-5xl font-bold leading-[0.94] tracking-[-0.05em] text-black sm:text-6xl lg:text-7xl dark:text-white"
            >
              Fund independent media.
            </motion.h1>
            <motion.p variants={up} className="mt-6 max-w-2xl text-[16.5px] leading-8 text-[var(--bj-muted)]">
              Your contribution supports public stories, videos, and community-focused
              updates. All payments are processed securely through Stripe.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── FORM + FEATURES ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">

            {/* Left — why donate */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              <motion.p variants={up} className="premium-label mb-3 uppercase">Why Donate</motion.p>
              <motion.h2 variants={up} className="font-serif text-3xl font-bold tracking-tight text-[var(--bj-text)]">
                Keep independent media alive.
              </motion.h2>
              <motion.p variants={up} className="mt-4 text-[15px] leading-7 text-[var(--bj-muted)]">
                Every contribution — large or small — directly supports the creation
                of stories, videos, reels, and public updates that bring important
                issues to the community's attention.
              </motion.p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: ShieldCheck, title: "Secure",      text: "Stripe handles all payment details. No card data is stored." },
                  { icon: Globe,       title: "Global",      text: "Accepts USD, CAD, and THB for global supporters." },
                  { icon: Zap,         title: "Purposeful",  text: "Funds go directly toward media production." },
                ].map(({ icon: Icon, title, text }) => (
                  <motion.div
                    key={title}
                    variants={up}
                    className="rounded-[1.5rem] border border-black/8 bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.045)] border-[var(--bj-border)] dark:bg-white/[0.035] dark:shadow-none"
                  >
                    <Icon className="mb-3 text-red-600 dark:text-red-500" size={20} />
                    <h3 className="font-serif text-base font-bold tracking-tight text-[var(--bj-text)]">{title}</h3>
                    <p className="mt-2 text-[13px] leading-6 text-black/55 dark:text-white/50">{text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right — donation form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="rounded-[2rem] border border-black/8 bg-white p-8 shadow-[0_18px_55px_rgba(0,0,0,0.06)] border-[var(--bj-border)] dark:bg-white/[0.035] dark:shadow-none"
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="premium-label uppercase">Donation</p>
                  <h2 className="font-serif mt-1 text-2xl font-bold tracking-tight text-[var(--bj-text)]">
                    Choose your amount
                  </h2>
                </div>
                <Heart className="text-red-600 dark:text-red-500" fill="currentColor" size={22} />
              </div>

              {/* Currency */}
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-black/50 dark:text-white/45">
                Currency
              </label>
              <div className="mb-5 grid grid-cols-3 gap-2">
                {Object.entries(CURRENCIES).map(([c, { label }]) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => changeCurrency(c)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                      currency === c
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-black/8 bg-[#F4F4F5] text-black/65 hover:border-red-500/30 border-[var(--bj-border)] dark:bg-white/[0.05] dark:text-white/62"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Preset amounts */}
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-black/50 dark:text-white/45">
                Amount
              </label>
              <div className="mb-3 grid grid-cols-5 gap-2">
                {cur.amounts.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => { setSelected(a); setCustom(""); }}
                    className={`rounded-xl border py-2.5 text-sm font-bold transition ${
                      !custom && selected === a
                        ? "border-red-600 bg-red-600 text-white"
                        : "border-black/8 bg-[#F4F4F5] text-black/65 hover:border-red-500/30 border-[var(--bj-border)] dark:bg-white/[0.05] dark:text-white/62"
                    }`}
                  >
                    {cur.symbol}{a}
                  </button>
                ))}
              </div>

              <input
                className="bj-input mb-5"
                type="number"
                min="1"
                placeholder={`Custom amount (${cur.symbol})`}
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
              />

              {/* Donor info */}
              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-black/50 dark:text-white/45">Full name</label>
                  <input className="bj-input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} autoComplete="name" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-black/50 dark:text-white/45">Email</label>
                  <input className="bj-input" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={254} autoComplete="email" />
                </div>
              </div>

              {/* Total */}
              <div className="mb-5 flex items-center justify-between rounded-xl border border-black/8 bg-[#F4F4F5] px-4 py-3.5 border-[var(--bj-border)] dark:bg-white/[0.05]">
                <span className="text-[13px] font-semibold text-black/55 dark:text-white/50">Donation total</span>
                <span className="font-serif text-2xl font-black text-[var(--bj-text)]">
                  {cur.symbol}{amount} <span className="text-sm font-semibold text-black/45 dark:text-white/40">{currency}</span>
                </span>
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-600/22 bg-red-600/8 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={startCheckout}
                disabled={loading}
                className="btn-primary w-full rounded-xl py-4 text-[13.5px] disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Starting checkout...</>
                ) : (
                  <><CreditCard size={16} /> Donate {cur.symbol}{amount} {currency} securely <ArrowRight size={16} /></>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-black/40 text-[var(--bj-subtle)]">
                <Lock size={12} />
                Secured by Stripe. We never store card numbers.
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
