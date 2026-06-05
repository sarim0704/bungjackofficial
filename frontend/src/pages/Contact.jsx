import { useState } from "react";
import { motion } from "framer-motion";
import {
  Facebook, Instagram, Mail, MessageCircle,
  ArrowRight, CheckCircle2, Loader2, Send,
} from "lucide-react";
import { apiPost } from "../api.js";
import Captcha, { CAPTCHA_ENABLED } from "../components/Captcha.jsx";

/* ─── Animations ─────────────────────────────────────── */
const up      = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

/* ─── Constants ──────────────────────────────────────── */
const SUBJECTS = [
  "General inquiry",
  "Media collaboration",
  "Press & interview",
  "Platform support",
  "Donation question",
  "Other",
];

const getChannels = (s) => [
  { label: "Email",     detail: s?.email        || "blackservice27@gmail.com",   icon: Mail,          href: `mailto:${s?.email || "blackservice27@gmail.com"}`,                                  external: false },
  { label: "WhatsApp",  detail: s?.whatsapp      || "+1 312 459 0936",            icon: MessageCircle, href: s?.whatsappLink || "https://wa.me/13124590936",                                      external: true  },
  { label: "Facebook",  detail: "Open page",                                      icon: Facebook,      href: s?.facebook     || "https://www.facebook.com/share/1BSGbLnQcv/?mibextid=wwXIfr",    external: true  },
  { label: "Instagram", detail: "@rajputh62",                                     icon: Instagram,     href: s?.instagram    || "https://www.instagram.com/rajputh62?igsh=Zno3NnhndGM4bjcy",     external: true  },
];

function sanitise(str = "") {
  return str.replace(/<[^>]*>/g, "").trim().slice(0, 2000);
}

/* ─── Label component ────────────────────────────────── */
function FieldLabel({ children }) {
  return (
    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em]"
           style={{ color: "var(--bj-muted)" }}>
      {children}
    </label>
  );
}

export default function Contact({ settings }) {
  const [form, setForm]   = useState({ name: "", email: "", subject: SUBJECTS[0], message: "", _hp: "" });
  const [state, setState] = useState("idle");
  const [errMsg, setErr]  = useState("");
  const [captcha, setCaptcha] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form._hp) return;

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErr("Please fill in all required fields."); setState("error"); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErr("Please enter a valid email address."); setState("error"); return;
    }
    if (CAPTCHA_ENABLED && !captcha) {
      setErr("Please complete the captcha."); setState("error"); return;
    }

    setState("loading"); setErr("");
    try {
      await apiPost("/contact", {
        name:    sanitise(form.name),
        email:   form.email.trim().toLowerCase().slice(0, 254),
        subject: sanitise(form.subject),
        message: sanitise(form.message),
        captchaToken: captcha,
      });
      setState("success");
    } catch (err) {
      setErr(err.message || "Unable to send message. Please try again.");
      setState("error");
    }
  };

  const channels = getChannels(settings);

  return (
    <main className="min-h-screen overflow-hidden" style={{ background: "var(--bj-bg)", color: "var(--bj-text)" }}>

      {/* ── HERO — compact, no dead space ───────────────── */}
      <section className="relative border-b py-10 sm:py-12" style={{ borderColor: "var(--bj-border)" }}>
        {/* Gradient accent */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_30%,rgba(220,38,38,0.10),transparent_28%),linear-gradient(90deg,#F6F7F9_0%,rgba(246,247,249,0.94)_55%,transparent_100%)] dark:bg-[radial-gradient(circle_at_78%_30%,rgba(220,38,38,0.16),transparent_28%),linear-gradient(90deg,#131311_0%,rgba(19,19,17,0.96)_55%,transparent_100%)]" />

        {/* Watermark — subtle */}
        <div className="pointer-events-none absolute left-[4%] top-[12%] select-none text-[12vw] font-black uppercase leading-none tracking-[-0.08em] opacity-[0.022]"
             style={{ color: "var(--bj-text)" }}>
          CONNECT
        </div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p variants={up} className="premium-label mb-4 uppercase">
              Get in Touch
            </motion.p>
            <motion.h1
              variants={up}
              className="font-serif text-5xl font-bold leading-none tracking-tight sm:text-6xl lg:text-7xl"
              style={{ color: "var(--bj-text)" }}
            >
              Contact
            </motion.h1>
            <motion.p
              variants={up}
              className="mt-4 max-w-xl text-[15.5px] leading-7"
              style={{ color: "var(--bj-muted)" }}
            >
              Reach out for media collaborations, press inquiries, platform support, or any questions. We read every message.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── FORM + CHANNELS ─────────────────────────────── */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:items-start">

            {/* ── Contact form ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="rounded-[1.75rem] p-7 sm:p-8"
              style={{
                border: "1px solid var(--bj-border-hover)",
                background: "var(--bj-surface)",
                boxShadow: "0 16px 50px rgba(0,0,0,0.055)",
              }}
            >
              <p className="premium-label mb-3 uppercase">Send a Message</p>
              <h2 className="font-serif text-2xl font-bold tracking-tight" style={{ color: "var(--bj-text)" }}>
                We'd love to hear from you.
              </h2>
              <p className="mt-2 text-[14px] leading-6" style={{ color: "var(--bj-muted)" }}>
                Fill in the form and we'll respond as soon as possible.
              </p>

              {/* ── Success state ── */}
              {state === "success" ? (
                <div className="mt-7 flex flex-col items-center rounded-2xl p-8 text-center"
                     style={{ border: "1px solid rgba(34,197,94,0.20)", background: "rgba(34,197,94,0.07)" }}>
                  <CheckCircle2 size={38} className="mb-4 text-green-500" />
                  <h3 className="font-serif text-xl font-bold tracking-tight" style={{ color: "var(--bj-text)" }}>
                    Message sent.
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-6" style={{ color: "var(--bj-muted)" }}>
                    Thank you. We'll get back to you within 24–48 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setForm({ name:"", email:"", subject:SUBJECTS[0], message:"", _hp:"" }); setState("idle"); }}
                    className="mt-5 rounded-full px-6 py-2.5 text-sm font-bold transition"
                    style={{ border: "1px solid var(--bj-border-hover)", color: "var(--bj-text)" }}
                  >
                    Send another
                  </button>
                </div>
              ) : (
                /* ── Form ── */
                <form onSubmit={submit} className="mt-6 grid gap-4" noValidate>
                  {/* Honeypot */}
                  <input type="text" name="_hp" value={form._hp} onChange={set("_hp")}
                    tabIndex={-1} aria-hidden="true"
                    style={{ position:"absolute", left:"-9999px", opacity:0, height:0, width:0 }} />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel>Full name <span style={{ color:"var(--bj-red)" }}>*</span></FieldLabel>
                      <input className="bj-input" placeholder="Your name"
                             value={form.name} onChange={set("name")}
                             maxLength={120} required autoComplete="name" />
                    </div>
                    <div>
                      <FieldLabel>Email address <span style={{ color:"var(--bj-red)" }}>*</span></FieldLabel>
                      <input className="bj-input" type="email" placeholder="your@email.com"
                             value={form.email} onChange={set("email")}
                             maxLength={254} required autoComplete="email" />
                    </div>
                  </div>

                  <div>
                    <FieldLabel>Subject</FieldLabel>
                    <select className="bj-input" value={form.subject} onChange={set("subject")}>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div>
                    <FieldLabel>Message <span style={{ color:"var(--bj-red)" }}>*</span></FieldLabel>
                    <textarea className="bj-input resize-none" style={{ minHeight: "130px" }}
                              placeholder="Write your message here..."
                              value={form.message} onChange={set("message")}
                              maxLength={2000} required />
                    <p className="mt-1 text-right text-[11px]" style={{ color:"var(--bj-subtle)" }}>
                      {form.message.length}/2000
                    </p>
                  </div>

                  {CAPTCHA_ENABLED && <Captcha onToken={setCaptcha} />}

                  {state === "error" && (
                    <div className="rounded-xl px-4 py-3 text-sm"
                         style={{ border:"1px solid rgba(220,38,38,0.22)", background:"rgba(220,38,38,0.07)", color:"var(--bj-red)" }}>
                      {errMsg}
                    </div>
                  )}

                  <button type="submit" disabled={state === "loading"}
                          className="btn-primary w-full rounded-xl py-3.5 disabled:opacity-55">
                    {state === "loading"
                      ? <><Loader2 size={15} className="animate-spin" /> Sending...</>
                      : <><Send size={15} /> Send Message <ArrowRight size={14} /></>}
                  </button>
                </form>
              )}
            </motion.div>

            {/* ── Sidebar — channels + response time ── */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={stagger}
              className="grid gap-3"
            >
              {/* Header */}
              <motion.div variants={up} className="mb-1">
                <p className="premium-label mb-2.5 uppercase">Contact Channels</p>
                <h2 className="font-serif text-2xl font-bold tracking-tight" style={{ color: "var(--bj-text)" }}>
                  Other ways to reach us.
                </h2>
                <p className="mt-2 text-[13.5px] leading-6" style={{ color: "var(--bj-muted)" }}>
                  Choose the channel that works best for you.
                </p>
              </motion.div>

              {/* Channel cards */}
              {channels.map(({ label, detail, icon: Icon, href, external }) => (
                <motion.a
                  key={label}
                  variants={up}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-4 rounded-[1.25rem] p-4 transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    border:     "1px solid var(--bj-border-hover)",
                    background: "var(--bj-surface)",
                    boxShadow:  "0 4px 20px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--bj-red-border)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--bj-border-hover)"; }}
                >
                  {/* Icon circle — strong background so it's always visible */}
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition"
                    style={{
                      border:     "1.5px solid var(--bj-border-hover)",
                      background: "var(--bj-surface-2)",
                      color:      "var(--bj-muted)",
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold" style={{ color: "var(--bj-text)" }}>{label}</p>
                    <p className="mt-0.5 truncate text-[12.5px]" style={{ color: "var(--bj-muted)" }}>{detail}</p>
                  </div>

                  <ArrowRight
                    size={14}
                    className="shrink-0 transition"
                    style={{ color: "var(--bj-subtle)" }}
                  />
                </motion.a>
              ))}

              {/* Response time */}
              <motion.div
                variants={up}
                className="rounded-[1.25rem] p-5"
                style={{
                  border:     "1px solid var(--bj-border-hover)",
                  background: "var(--bj-surface-2)",
                }}
              >
                <p className="text-[10.5px] font-bold uppercase tracking-[0.18em]"
                   style={{ color: "var(--bj-subtle)" }}>
                  Response time
                </p>
                <p className="font-serif mt-2 text-lg font-bold tracking-tight" style={{ color: "var(--bj-text)" }}>
                  Within 24–48 hours
                </p>
                <p className="mt-1.5 text-[13px] leading-5" style={{ color: "var(--bj-muted)" }}>
                  We review all messages personally and respond as quickly as possible.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
