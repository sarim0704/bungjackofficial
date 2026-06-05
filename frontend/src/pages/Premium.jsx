import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock, Crown, Image, Video, ExternalLink, ShieldCheck,
  ArrowRight, Loader2, Mail, KeyRound, LogOut, RefreshCcw,
} from "lucide-react";
import { apiGet, apiPost } from "../api.js";
import Captcha, { CAPTCHA_ENABLED } from "../components/Captcha.jsx";

const up      = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const PLAN_FILTERS = [
  { key: "all",    label: "All" },
  { key: "images", label: "$5 Images" },
  { key: "videos", label: "$10 Videos" },
];

function PremiumCard({ item }) {
  const isImage = item.type === "image";
  const isVideo = item.type === "video";
  return (
    <article className="group overflow-hidden rounded-[1.6rem] transition hover:-translate-y-1"
             style={{ border: "1px solid var(--bj-border-hover)", background: "var(--bj-surface)" }}>
      <div className="relative h-56 overflow-hidden bg-black">
        {item.url && isImage ? (
          <img src={item.url} alt={item.title} className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105" loading="lazy" />
        ) : item.thumbnail ? (
          <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-black/35">
            {isImage ? <Image size={40} className="text-white/25" /> : <Video size={40} className="text-white/25" />}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/18 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full border border-white/12 bg-black/45 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-md">
          {item.accessPlan === "videos" ? "$10 Plan" : "$5 Plan"}
        </span>
        <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-black/45 text-white backdrop-blur-md">
          {isImage ? <Image size={16} /> : isVideo ? <Video size={16} /> : <ExternalLink size={16} />}
        </div>
      </div>
      <div className="p-5">
        <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--bj-red)" }}>Premium {item.type}</p>
        <h3 className="font-serif line-clamp-2 text-[1.2rem] font-bold leading-tight" style={{ color: "var(--bj-text)" }}>{item.title}</h3>
        <p className="mt-3 line-clamp-2 text-[13.5px] leading-6" style={{ color: "var(--bj-muted)" }}>
          {item.description || "Exclusive premium media content."}
        </p>
        <a href={item.url} target="_blank" rel="noopener noreferrer"
           className="mt-4 inline-flex items-center gap-2 text-sm font-bold transition" style={{ color: "var(--bj-red)" }}>
          Open content <ExternalLink size={14} />
        </a>
      </div>
    </article>
  );
}

export default function Premium() {
  const [checking,   setChecking]   = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [plan,       setPlan]       = useState(null);
  const [items,      setItems]      = useState([]);
  const [planFilter, setPlanFilter] = useState("all");

  /* verification gate */
  const [step,    setStep]    = useState("email"); // email | otp
  const [email,   setEmail]   = useState(localStorage.getItem("bj_subscriber_email") || "");
  const [code,    setCode]    = useState("");
  const [captcha, setCaptcha] = useState("");
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState("");
  const [info,    setInfo]    = useState("");

  const loadContent = async () => {
    try {
      const res = await apiGet("/subscriptions/content");
      setItems(res?.items || []);
    } catch { setItems([]); }
  };

  const loadSession = async () => {
    try {
      const res = await apiGet("/subscriptions/session");
      if (res?.subscribed) {
        setSubscribed(true);
        setPlan(res.plan);
        await loadContent();
      } else {
        setSubscribed(false);
      }
    } catch {
      setSubscribed(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => { loadSession(); }, []);

  const requestOtp = async () => {
    setError(""); setInfo("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email address."); return; }
    if (CAPTCHA_ENABLED && !captcha) { setError("Please complete the captcha."); return; }
    setBusy(true);
    try {
      const res = await apiPost("/subscriptions/request-otp", { email: email.trim().toLowerCase(), captchaToken: captcha });
      localStorage.setItem("bj_subscriber_email", email.trim().toLowerCase());
      setStep("otp");
      setInfo(res?.devCode ? `Dev code: ${res.devCode}` : "A 6-digit code was sent to your email.");
    } catch (err) {
      setError(err.message || "Could not send the code.");
    } finally { setBusy(false); }
  };

  const verifyOtp = async () => {
    setError(""); setInfo("");
    if (!/^\d{6}$/.test(code.trim())) { setError("Enter the 6-digit code."); return; }
    setBusy(true);
    try {
      const res = await apiPost("/subscriptions/verify-otp", { email: email.trim().toLowerCase(), code: code.trim() });
      setSubscribed(true);
      setPlan(res.plan);
      await loadContent();
    } catch (err) {
      setError(err.message || "Invalid code.");
    } finally { setBusy(false); }
  };

  const signOut = async () => {
    try { await apiPost("/subscriptions/logout", {}); } catch { /* noop */ }
    setSubscribed(false); setItems([]); setPlan(null);
    setStep("email"); setCode(""); setInfo("");
  };

  const filtered = planFilter === "all" ? items : items.filter((i) => i.accessPlan === planFilter);

  return (
    <main className="min-h-screen overflow-hidden" style={{ background: "var(--bj-bg)", color: "var(--bj-text)" }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b" style={{ borderColor: "var(--bj-border)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_35%,rgba(220,38,38,0.10),transparent_30%)] dark:bg-[radial-gradient(circle_at_82%_35%,rgba(220,38,38,0.16),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-24 lg:px-10 lg:pt-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.p variants={up} className="premium-label mb-4 uppercase">Premium Members</motion.p>
              <motion.h1 variants={up} className="font-serif font-bold leading-none tracking-tight"
                style={{ fontSize: "clamp(2.2rem,4.6vw,4.4rem)", color: "var(--bj-text)" }}>
                Exclusive media <span style={{ color: "var(--bj-red)" }}>library.</span>
              </motion.h1>
              <motion.p variants={up} className="mt-4 max-w-xl text-[15.5px] leading-7" style={{ color: "var(--bj-muted)" }}>
                Verify your subscriber email to unlock private images, videos, and media links based on your active plan.
              </motion.p>
              <motion.div variants={up} className="mt-6 flex flex-wrap gap-2.5">
                <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
                      style={{ border: "1px solid var(--bj-border-hover)", background: "var(--bj-surface)", color: "var(--bj-muted)" }}>
                  <ShieldCheck size={15} /> Email-verified access
                </span>
                <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
                      style={{ border: "1px solid var(--bj-border-hover)", background: "var(--bj-surface)", color: "var(--bj-muted)" }}>
                  <Crown size={15} /> Plan-based content
                </span>
              </motion.div>
            </motion.div>

            {/* ── Access card ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="rounded-[1.75rem] p-7"
              style={{ border: "1px solid var(--bj-border-hover)", background: "var(--bj-surface)", boxShadow: "0 20px 60px rgba(0,0,0,0.10)" }}
            >
              {checking ? (
                <div className="flex items-center gap-3 py-6">
                  <Loader2 className="animate-spin" size={18} style={{ color: "var(--bj-red)" }} />
                  <p className="text-sm font-semibold" style={{ color: "var(--bj-muted)" }}>Checking access…</p>
                </div>
              ) : subscribed ? (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="premium-label uppercase">Access Granted</p>
                      <h2 className="font-serif mt-1 text-2xl font-bold tracking-tight" style={{ color: "var(--bj-text)" }}>
                        Premium active
                      </h2>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full text-white" style={{ background: "var(--bj-red)" }}>
                      <Crown size={20} />
                    </div>
                  </div>
                  <p className="text-[13.5px] leading-6" style={{ color: "var(--bj-muted)" }}>
                    Your <b>{plan}</b> plan is active. Premium content is unlocked below.
                  </p>
                  <div className="mt-5 flex gap-2.5">
                    <button onClick={loadContent}
                      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition"
                      style={{ border: "1px solid var(--bj-border-hover)", color: "var(--bj-muted)" }}>
                      <RefreshCcw size={14} /> Refresh
                    </button>
                    <button onClick={signOut}
                      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition"
                      style={{ border: "1px solid var(--bj-border-hover)", color: "var(--bj-muted)" }}>
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </div>
              ) : step === "email" ? (
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white" style={{ background: "var(--bj-red)" }}>
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="premium-label uppercase">Verify Email</p>
                      <h2 className="font-serif text-xl font-bold tracking-tight" style={{ color: "var(--bj-text)" }}>Unlock your access</h2>
                    </div>
                  </div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: "var(--bj-muted)" }}>
                    Subscriber email
                  </label>
                  <input className="bj-input" type="email" placeholder="your@email.com" value={email}
                         onChange={(e) => setEmail(e.target.value)} maxLength={254} autoComplete="email" />
                  {CAPTCHA_ENABLED && <div className="mt-3"><Captcha onToken={setCaptcha} /></div>}
                  {error && <p className="mt-3 text-sm" style={{ color: "var(--bj-red)" }}>{error}</p>}
                  <button onClick={requestOtp} disabled={busy} className="btn-primary mt-4 w-full rounded-xl py-3.5 disabled:opacity-55">
                    {busy ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : <>Send code <ArrowRight size={15} /></>}
                  </button>
                  <p className="mt-3 text-center text-[12px]" style={{ color: "var(--bj-subtle)" }}>
                    Not a member yet? <Link to="/subscribe" style={{ color: "var(--bj-red)", fontWeight: 700 }}>Subscribe</Link>
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white" style={{ background: "var(--bj-red)" }}>
                      <KeyRound size={18} />
                    </div>
                    <div>
                      <p className="premium-label uppercase">Enter Code</p>
                      <h2 className="font-serif text-xl font-bold tracking-tight" style={{ color: "var(--bj-text)" }}>Check your inbox</h2>
                    </div>
                  </div>
                  {info && <p className="mb-3 text-[13px]" style={{ color: "var(--bj-muted)" }}>{info}</p>}
                  <input className="bj-input text-center text-lg font-black tracking-[0.5em]" inputMode="numeric"
                         placeholder="000000" value={code} maxLength={6}
                         onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
                  {error && <p className="mt-3 text-sm" style={{ color: "var(--bj-red)" }}>{error}</p>}
                  <button onClick={verifyOtp} disabled={busy} className="btn-primary mt-4 w-full rounded-xl py-3.5 disabled:opacity-55">
                    {busy ? <><Loader2 size={15} className="animate-spin" /> Verifying…</> : <>Unlock premium <Lock size={14} /></>}
                  </button>
                  <button onClick={() => { setStep("email"); setError(""); setInfo(""); }}
                          className="mt-3 w-full text-center text-[12px] font-semibold" style={{ color: "var(--bj-subtle)" }}>
                    Use a different email
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        {!subscribed ? (
          <div className="rounded-[2rem] p-12 text-center"
               style={{ border: "1px solid var(--bj-border-hover)", background: "var(--bj-surface)" }}>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                 style={{ background: "var(--bj-red-surface)", color: "var(--bj-red)" }}>
              <Lock size={28} />
            </div>
            <h2 className="font-serif text-2xl font-black tracking-tight" style={{ color: "var(--bj-text)" }}>
              Premium content is locked.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-7" style={{ color: "var(--bj-muted)" }}>
              Verify your subscriber email above to unlock content, or subscribe to become a member.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap gap-2.5">
              {PLAN_FILTERS.map((f) => (
                <button key={f.key} onClick={() => setPlanFilter(f.key)}
                  className="rounded-full px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-[0.12em] transition"
                  style={{
                    background: planFilter === f.key ? "var(--bj-red)" : "var(--bj-surface)",
                    color:      planFilter === f.key ? "#fff" : "var(--bj-muted)",
                    border:     `1.5px solid ${planFilter === f.key ? "var(--bj-red)" : "var(--bj-border-hover)"}`,
                  }}>
                  {f.label}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-[2rem] p-10 text-center"
                   style={{ border: "1px solid var(--bj-border-hover)", background: "var(--bj-surface)" }}>
                <h2 className="font-serif text-2xl font-black tracking-tight" style={{ color: "var(--bj-text)" }}>No content yet.</h2>
                <p className="mt-3 text-sm" style={{ color: "var(--bj-muted)" }}>Admin can upload premium content from the dashboard.</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item) => <PremiumCard key={item._id || item.id} item={item} />)}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
