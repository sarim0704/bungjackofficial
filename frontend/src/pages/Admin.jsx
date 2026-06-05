import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3, CheckCircle2, Edit3, ExternalLink, Eye,
  FileText, Film, Heart, Image as ImageIcon, Link as LinkIcon,
  Loader2, Lock, LogOut, Mail, Plus, RefreshCcw, Save,
  Search, Settings, ShieldCheck, Trash2, Upload, Video, X,
  KeyRound,
} from "lucide-react";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut, apiUpload } from "../api.js";
import { LOGO_SRC, BRAND_NAME } from "../brand.js";
import Captcha, { CAPTCHA_ENABLED } from "../components/Captcha.jsx";

/* ─── Constants ──────────────────────────────────────── */
const TABS = [
  { key: "dashboard", icon: BarChart3, label: "Dashboard" },
  { key: "posts",     icon: FileText,  label: "Posts"     },
  { key: "videos",    icon: Film,      label: "Videos"    },
  { key: "premium",   icon: ImageIcon, label: "Premium"   },
  { key: "donations", icon: Heart,     label: "Donations" },
  { key: "messages",  icon: Mail,      label: "Messages"  },
  { key: "settings",  icon: Settings,  label: "Settings"  },
];

const BLANK_POST = {
  title: "", category: "News", excerpt: "", content: "",
  image: "", featured: false, status: "published",
};
const BLANK_VIDEO = {
  title: "", category: "Video", platform: "Facebook",
  url: "", thumbnail: "", description: "", featured: false, status: "published",
};
const BLANK_PREMIUM = {
  title: "", type: "image", accessPlan: "images",
  url: "", thumbnail: "", description: "", status: "published",
};
const DEFAULT_SETTINGS = {
  brandName: "Bung Jack Official", tagline: "Independent media platform",
  email: "blackservice27@gmail.com", whatsappLink: "https://wa.me/13124590936",
  facebook: "", instagram: "", youtube: "", logo: "",
  aboutHeroImage: "", aboutPortraitImage: "", aboutFeaturedImage: "",
};

/* ─── Utilities ──────────────────────────────────────── */
const normalizeList = (r) => {
  if (Array.isArray(r))         return r;
  for (const k of ["items","data","posts","videos","messages","donations"]) {
    if (Array.isArray(r?.[k])) return r[k];
  }
  return [];
};
const getId      = (i) => i?._id || i?.id;
const fmtDate    = (v) => v ? new Date(v).toLocaleDateString("en", { year:"numeric", month:"short", day:"numeric" }) : "—";
const cleanForm  = (f) => {
  const p = { ...f };
  delete p._id; delete p.id; delete p.__v; delete p.createdAt; delete p.updatedAt;
  if (p.plan && !p.accessPlan) p.accessPlan = p.plan;
  delete p.plan;
  return p;
};

/* ─── Micro components ───────────────────────────────── */
function StatusPill({ value }) {
  const s  = value || "unknown";
  const ok = ["published","paid","active","read"].includes(s);
  const wn = ["pending","draft"].includes(s);
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.1em] ${
      ok ? "border-emerald-500/22 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
         : wn ? "border-yellow-500/22 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
              : "border-red-500/22 bg-red-500/10 text-red-600 dark:text-red-400"
    }`}>{s}</span>
  );
}

function Toast({ toast, onClose }) {
  if (!toast?.message) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[9999] max-w-sm rounded-2xl border border-[var(--bj-border)] bg-[var(--bj-surface)] p-4 shadow-2xl">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${toast.type === "error" ? "bg-red-600/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>
          {toast.type === "error" ? <X size={16} /> : <CheckCircle2 size={16} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[var(--bj-text)]">{toast.type === "error" ? "Action failed" : "Success"}</p>
          <p className="mt-0.5 text-sm leading-6 text-[var(--bj-muted)]">{toast.message}</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-1 text-[var(--bj-muted)] hover:text-[var(--bj-text)]"><X size={14} /></button>
      </div>
    </div>
  );
}

/* ─── Image Upload Zone ──────────────────────────────── */
function ImageUpload({ value, onChange, label = "Image" }) {
  const inputRef      = useRef(null);
  const [uploading, setUploading]   = useState(false);
  const [dragOver,  setDragOver]    = useState(false);
  const [uploadErr, setUploadErr]   = useState("");

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setUploadErr("");
    setUploading(true);
    try {
      const res = await apiUpload(file);
      if (res?.url) onChange(res.url);
      else throw new Error("No URL returned from upload.");
    } catch (err) {
      setUploadErr(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">
        {label}
      </label>

      {value ? (
        <div className="relative mb-2 overflow-hidden rounded-xl border border-[var(--bj-border)]">
          <img src={value} alt="preview" className="h-36 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm hover:bg-red-600"
            title="Remove image"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <div
          className={`upload-zone mb-2 ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-[var(--bj-muted)]">
              <Loader2 size={16} className="animate-spin" /> Uploading...
            </div>
          ) : (
            <>
              <Upload size={22} className="mx-auto mb-2 text-[var(--bj-muted)]" />
              <p className="text-sm font-semibold text-[var(--bj-muted)]">Drop image here or click to browse</p>
              <p className="mt-1 text-[11px] text-[var(--bj-subtle)]">PNG, JPG, WebP · max 3 MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Manual URL input */}
      <input
        className="bj-input text-[12.5px]"
        placeholder="Or paste image URL directly"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      />

      {uploadErr && (
        <p className="mt-1.5 text-[11.5px] text-red-500">{uploadErr}</p>
      )}
    </div>
  );
}

/* ─── Login (captcha + optional 2FA) ─────────────────── */
function AdminLogin({ onDone }) {
  const [email,    setEmail]    = useState("admin@bungjackofficial.com");
  const [password, setPassword] = useState("");
  const [token,    setToken]    = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [captcha,  setCaptcha]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const login = async (e) => {
    e?.preventDefault();
    setError("");
    if (CAPTCHA_ENABLED && !captcha) { setError("Please complete the captcha."); return; }
    if (needs2FA && !/^\d{6}$/.test(token.trim())) { setError("Enter the 6-digit authenticator code."); return; }
    setLoading(true);
    try {
      const res = await apiPost("/auth/login", {
        email, password,
        token: needs2FA ? token.trim() : undefined,
        captchaToken: captcha,
      });
      if (res?.twoFactorRequired) {
        setNeeds2FA(true);
        setError("");
      } else {
        onDone(res.admin);
      }
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bj-page relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(220,38,38,0.16),transparent_32%)]" />
      <form onSubmit={login} className="bj-panel relative w-full max-w-md p-8 shadow-2xl">
        <img src={LOGO_SRC} alt={BRAND_NAME} className="mb-6 h-16 w-auto object-contain" />
        <p className="premium-label mb-3 uppercase">Admin Login</p>
        <h1 className="font-serif text-[var(--text-display)] font-bold leading-tight tracking-tight text-[var(--bj-text)]">
          BungJack Workspace
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--bj-muted)]">
          Sign in to manage posts, videos, premium content, messages, donations, and site settings.
        </p>
        <div className="mt-7 grid gap-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Email</label>
            <input className="bj-input" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" disabled={needs2FA} required />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Password</label>
            <input className="bj-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" disabled={needs2FA} required />
          </div>

          {needs2FA && (
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Authenticator code</label>
              <input className="bj-input text-center text-lg font-black tracking-[0.4em]" inputMode="numeric" autoFocus
                     placeholder="000000" value={token} maxLength={6}
                     onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))} />
              <p className="mt-1.5 text-[12px] text-[var(--bj-muted)]">Open your authenticator app and enter the 6-digit code.</p>
            </div>
          )}

          {CAPTCHA_ENABLED && !needs2FA && <div className="pt-1"><Captcha onToken={setCaptcha} /></div>}

          {error && (
            <div className="rounded-xl border border-red-600/22 bg-red-600/8 p-3 text-sm text-red-500">{error}</div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full rounded-xl py-3.5 disabled:opacity-60">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Signing in..." : needs2FA ? "Verify & sign in" : "Sign in"}
          </button>
        </div>
        <p className="mt-5 flex items-center gap-2 text-xs text-[var(--bj-muted)]">
          <ShieldCheck size={13} /> Session stored in an httpOnly cookie.
        </p>
      </form>
    </main>
  );
}

/* ─── Dashboard ──────────────────────────────────────── */
function Dashboard({ data, setTab, loading }) {
  const stats = data.dashboard?.stats || {};
  const cards = [
    { label: "Total Posts",    value: stats.totalPosts        ?? data.posts.length,                                 icon: FileText,  tab: "posts"    },
    { label: "Total Videos",   value: stats.totalVideos       ?? data.videos.length,                                icon: Film,      tab: "videos"   },
    { label: "Premium Items",  value: stats.premiumItems      ?? data.premium.length,                               icon: ImageIcon, tab: "premium"  },
    { label: "Active Subs",    value: stats.activeSubscriptions ?? 0,                                               icon: Heart,     tab: "premium"  },
    { label: "Donations",      value: stats.totalDonations    ?? data.donations.length,                             icon: Heart,     tab: "donations"},
    { label: "Unread Messages",value: stats.unreadMessages    ?? data.messages.filter((m) => !m.isRead).length,    icon: Mail,      tab: "messages" },
  ];
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button key={c.label} type="button" onClick={() => setTab(c.tab)}
              className="bj-panel p-5 text-left transition hover:-translate-y-0.5 hover:border-red-600/35">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[12.5px] font-semibold text-[var(--bj-muted)]">{c.label}</p>
                  <p className="mt-1.5 font-serif text-4xl font-black tracking-tight text-red-600">{loading ? "—" : c.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/10 text-red-500"><Icon size={20} /></div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <PreviewList title="Latest Posts"  items={data.posts.slice(0,4)}  empty="No posts yet."  onAction={() => setTab("posts")}  />
        <PreviewList title="Latest Videos" items={data.videos.slice(0,4)} empty="No videos yet." onAction={() => setTab("videos")} />
      </div>
    </div>
  );
}

function PreviewList({ title, items, empty, onAction }) {
  return (
    <div className="bj-panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--bj-border)] p-5">
        <h2 className="font-serif text-xl font-bold tracking-tight">{title}</h2>
        <button type="button" onClick={onAction} className="text-sm font-bold text-red-500 hover:text-red-600">Manage</button>
      </div>
      <div className="divide-y divide-[var(--bj-border)]">
        {items.length === 0 ? (
          <p className="p-5 text-sm text-[var(--bj-muted)]">{empty}</p>
        ) : items.map((item) => (
          <div key={getId(item)} className="flex items-center gap-4 p-4">
            {(item.image || item.thumbnail) && (
              <img src={item.image || item.thumbnail} alt={item.title} className="h-12 w-16 shrink-0 rounded-lg border border-[var(--bj-border)] object-cover" />
            )}
            <div className="min-w-0">
              <p className="line-clamp-1 text-sm font-semibold">{item.title}</p>
              <p className="mt-0.5 text-xs text-[var(--bj-muted)]">{item.category || item.platform || item.status} · {fmtDate(item.createdAt)}</p>
            </div>
            <StatusPill value={item.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Post Form ──────────────────────────────────────── */
function PostForm({ form, setForm }) {
  const s = (k) => (v) => setForm((f) => ({ ...f, [k]: typeof v === "string" ? v : v?.target?.value ?? v }));
  return (
    <div className="grid gap-3">
      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Title *</label>
        <input className="bj-input" placeholder="Post title" value={form.title} onChange={s("title")} maxLength={200} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Category</label>
          <select className="bj-input" value={form.category} onChange={s("category")}>
            {["News","Story","Update","Community","Post"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Status</label>
          <select className="bj-input" value={form.status} onChange={s("status")}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>
      <ImageUpload label="Post Image" value={form.image} onChange={s("image")} />
      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Excerpt</label>
        <textarea className="bj-input min-h-[88px] resize-none" placeholder="Short summary (shown in card previews)" value={form.excerpt} onChange={s("excerpt")} maxLength={400} />
      </div>
      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Full Content</label>
        <textarea className="bj-input min-h-[140px] resize-y" placeholder="Full post body (optional)" value={form.content} onChange={s("content")} />
      </div>
      <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--bj-border)] bg-[var(--bj-surface-2)] px-4 py-3 text-sm font-semibold cursor-pointer">
        <span>Featured post</span>
        <input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="accent-red-600" />
      </label>
    </div>
  );
}

/* ─── Video Form ──────────────────────────────────────── */
function VideoForm({ form, setForm }) {
  const s = (k) => (v) => setForm((f) => ({ ...f, [k]: typeof v === "string" ? v : v?.target?.value ?? v }));
  return (
    <div className="grid gap-3">
      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Title *</label>
        <input className="bj-input" placeholder="Video or reel title" value={form.title} onChange={s("title")} maxLength={200} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Type</label>
          <select className="bj-input" value={form.category} onChange={s("category")}>
            <option value="Video">Video</option>
            <option value="Reel">Reel</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Platform</label>
          <select className="bj-input" value={form.platform} onChange={s("platform")}>
            {["Facebook","Instagram","YouTube","Other"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Video URL *</label>
        <input className="bj-input" type="url" placeholder="https://facebook.com/..." value={form.url} onChange={s("url")} />
      </div>
      <ImageUpload label="Thumbnail Image" value={form.thumbnail} onChange={s("thumbnail")} />
      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Description</label>
        <textarea className="bj-input min-h-[88px] resize-none" placeholder="Brief description of the video" value={form.description} onChange={s("description")} maxLength={600} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="bj-input" value={form.status} onChange={s("status")}>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--bj-border)] bg-[var(--bj-surface-2)] px-4 py-3 text-sm font-semibold cursor-pointer">
          <span>Featured</span>
          <input type="checkbox" checked={Boolean(form.featured)} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="accent-red-600" />
        </label>
      </div>
    </div>
  );
}

/* ─── Premium Form ───────────────────────────────────── */
function PremiumForm({ form, setForm }) {
  const s = (k) => (v) => setForm((f) => ({ ...f, [k]: typeof v === "string" ? v : v?.target?.value ?? v }));
  const isImage = form.type === "image";
  return (
    <div className="grid gap-3">
      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Title *</label>
        <input className="bj-input" placeholder="Content title" value={form.title} onChange={s("title")} maxLength={200} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Content Type</label>
          <select className="bj-input" value={form.type} onChange={s("type")}>
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Access Plan</label>
          <select className="bj-input" value={form.accessPlan} onChange={s("accessPlan")}>
            <option value="images">$5 — Images Plan</option>
            <option value="videos">$10 — Videos Plan</option>
          </select>
        </div>
      </div>

      {isImage ? (
        <ImageUpload label="Premium Image" value={form.url} onChange={s("url")} />
      ) : (
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Content URL *</label>
          <input className="bj-input" type="url" placeholder="https://..." value={form.url} onChange={s("url")} />
        </div>
      )}

      <ImageUpload label="Thumbnail (optional)" value={form.thumbnail} onChange={s("thumbnail")} />

      <div>
        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">Description</label>
        <textarea className="bj-input min-h-[88px] resize-none" placeholder="Describe this content" value={form.description} onChange={s("description")} maxLength={600} />
      </div>

      <select className="bj-input" value={form.status} onChange={s("status")}>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>

      <div className="rounded-2xl border border-red-600/14 bg-red-600/5 p-4 text-sm">
        <p className="font-bold text-red-600 dark:text-red-500">Access rule</p>
        <p className="mt-1 leading-6 text-[var(--bj-muted)]">
          <b>$5 Images Plan</b> — image subscribers only.
          <br /><b>$10 Videos Plan</b> — video subscribers see everything.
        </p>
      </div>
    </div>
  );
}

/* ─── Generic Manager ────────────────────────────────── */
function Manager({ type, title, items, blank, refresh, showToast }) {
  const [form,    setForm]    = useState(blank);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [query,   setQuery]   = useState("");

  const endpoint = `/${type}`;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      [i.title, i.category, i.platform, i.accessPlan, i.status, i.email]
        .filter(Boolean).join(" ").toLowerCase().includes(q)
    );
  }, [items, query]);

  const reset = () => { setForm(blank); setEditing(null); };

  const save = async () => {
    if (!form.title?.trim()) { showToast("Title is required.", "error"); return; }
    try {
      setSaving(true);
      const payload = cleanForm(form);
      if (editing) {
        await apiPut(`${endpoint}/${editing}`, payload);
        showToast(`${title} updated.`);
      } else {
        await apiPost(endpoint, payload);
        showToast(`${title} created.`);
      }
      reset(); await refresh();
    } catch (err) {
      showToast(err.message || `Unable to save.`, "error");
    } finally { setSaving(false); }
  };

  const edit = (item) => {
    setForm({ ...blank, ...item, accessPlan: item.accessPlan || item.plan || blank.accessPlan });
    setEditing(getId(item));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    try {
      await apiDelete(`${endpoint}/${id}`);
      showToast(`${title} deleted.`);
      await refresh();
    } catch (err) { showToast(err.message || "Delete failed.", "error"); }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
      {/* Form panel */}
      <div className="bj-panel h-fit p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="premium-label uppercase">{editing ? "Edit" : "Create"}</p>
            <h2 className="font-serif mt-1 text-2xl font-bold tracking-tight">{title}</h2>
          </div>
          {editing && (
            <button type="button" onClick={reset} className="btn-secondary !px-3 !py-2 text-xs">Cancel</button>
          )}
        </div>

        {type === "posts"           && <PostForm    form={form} setForm={setForm} />}
        {type === "videos"          && <VideoForm   form={form} setForm={setForm} />}
        {type === "premium-content" && <PremiumForm form={form} setForm={setForm} />}

        <button type="button" onClick={save} disabled={saving}
          className="btn-primary mt-5 w-full rounded-xl py-3.5 disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Saving..." : editing ? "Save Changes" : "Create Item"}
        </button>
      </div>

      {/* List panel */}
      <div className="bj-panel overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[var(--bj-border)] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold tracking-tight">{title} List</h2>
            <p className="mt-0.5 text-sm text-[var(--bj-muted)]">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--bj-muted)]" />
            <input className="bj-input !pl-9" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        <div className="divide-y divide-[var(--bj-border)]">
          {filtered.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/8 text-red-500"><Plus size={22} /></div>
              <p className="font-bold text-[var(--bj-text)]">No items yet</p>
              <p className="mt-1 text-sm text-[var(--bj-muted)]">Create your first item using the form.</p>
            </div>
          ) : filtered.map((item) => {
            const id    = getId(item);
            const title = item.title || item.subject || item.email || "Untitled";
            const image = item.image || item.thumbnail || (item.type === "image" ? item.url : "");
            const url   = item.url || item.image || item.thumbnail;
            const meta  = item.category || item.platform || item.accessPlan || item.type || item.status || "—";
            return (
              <div key={id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 gap-3.5">
                  {image ? (
                    <img src={image} alt={title} className="h-14 w-18 shrink-0 rounded-xl border border-[var(--bj-border)] object-cover" />
                  ) : (
                    <div className="flex h-14 w-18 shrink-0 items-center justify-center rounded-xl border border-[var(--bj-border)] bg-[var(--bj-surface-2)] text-red-500">
                      {type === "videos" ? <Video size={18} /> : type === "premium-content" ? <ImageIcon size={18} /> : <FileText size={18} />}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="line-clamp-1 text-sm font-semibold">{title}</p>
                      <StatusPill value={item.status} />
                    </div>
                    <p className="text-xs text-[var(--bj-muted)]">
                      {meta}
                      {item.accessPlan ? ` · ${item.accessPlan === "images" ? "$5" : "$10"} plan` : ""}
                      {" · "}{fmtDate(item.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="btn-secondary !px-2.5 !py-2" title="Open"><ExternalLink size={13} /></a>
                  )}
                  <button type="button" onClick={() => edit(item)} className="btn-secondary !px-2.5 !py-2" title="Edit"><Edit3 size={13} /></button>
                  <button type="button" onClick={() => remove(id)} className="btn-secondary !px-2.5 !py-2 hover:!border-red-600/35 hover:!text-red-500" title="Delete"><Trash2 size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Donations ──────────────────────────────────────── */
function Donations({ items }) {
  return (
    <div className="bj-panel overflow-hidden">
      <div className="border-b border-[var(--bj-border)] p-5">
        <h2 className="font-serif text-xl font-bold tracking-tight">Donations</h2>
        <p className="mt-1 text-sm text-[var(--bj-muted)]">Stripe payment records appear here after donations are completed.</p>
      </div>
      <div className="divide-y divide-[var(--bj-border)]">
        {items.length === 0 ? (
          <p className="p-5 text-sm text-[var(--bj-muted)]">No donation records yet.</p>
        ) : items.map((item) => (
          <div key={getId(item)} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="font-semibold">{item.donorName || "Anonymous"} · {item.amount} {item.currency}</p>
              <p className="mt-0.5 text-sm text-[var(--bj-muted)]">{item.donorEmail || "No email"} · {fmtDate(item.createdAt)}</p>
            </div>
            <StatusPill value={item.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Messages ───────────────────────────────────────── */
function Messages({ items, refresh, showToast }) {
  const markRead = async (id) => {
    try { await apiPatch(`/contact/${id}/read`); showToast("Marked as read."); await refresh(); }
    catch (err) { showToast(err.message || "Failed.", "error"); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this message?")) return;
    try { await apiDelete(`/contact/${id}`); showToast("Deleted."); await refresh(); }
    catch (err) { showToast(err.message || "Failed.", "error"); }
  };
  return (
    <div className="grid gap-4">
      {items.length === 0 ? (
        <div className="bj-panel p-10 text-center">
          <Mail className="mx-auto mb-3 text-red-500" size={28} />
          <p className="font-bold">No messages yet</p>
          <p className="mt-1.5 text-sm text-[var(--bj-muted)]">Contact form submissions appear here.</p>
        </div>
      ) : items.map((msg) => (
        <div key={getId(msg)} className="bj-panel p-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row">
            <div className="min-w-0">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <p className="font-bold">{msg.subject}</p>
                <StatusPill value={msg.isRead ? "read" : "pending"} />
              </div>
              <p className="text-sm text-[var(--bj-muted)]">{msg.name} · {msg.email} · {fmtDate(msg.createdAt)}</p>
              <p className="mt-3 leading-7 text-[var(--bj-text)]">{msg.message}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              {!msg.isRead && (
                <button type="button" onClick={() => markRead(getId(msg))} className="btn-secondary h-fit gap-1.5">
                  <Eye size={14} /> Read
                </button>
              )}
              <button type="button" onClick={() => remove(getId(msg))} className="btn-secondary h-fit hover:!border-red-600/35 hover:!text-red-500">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Settings Panel ─────────────────────────────────── */
function SettingsPanel({ settings, refresh, showToast }) {
  const [form,   setForm]   = useState({ ...DEFAULT_SETTINGS, ...(settings || {}) });
  const [saving, setSaving] = useState(false);
  const s = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => { setForm({ ...DEFAULT_SETTINGS, ...(settings || {}) }); }, [settings]);

  const save = async () => {
    try {
      setSaving(true);
      await apiPut("/settings", cleanForm(form));
      showToast("Settings saved.");
      await refresh();
    } catch (err) { showToast(err.message || "Save failed.", "error"); }
    finally { setSaving(false); }
  };

  const FIELDS = [
    { key: "brandName",    label: "Brand Name",    type: "text",  placeholder: "Bung Jack Official" },
    { key: "tagline",      label: "Tagline",        type: "text",  placeholder: "Independent media platform" },
    { key: "email",        label: "Contact Email",  type: "email", placeholder: "contact@example.com" },
    { key: "whatsappLink", label: "WhatsApp URL",   type: "url",   placeholder: "https://wa.me/..." },
    { key: "facebook",     label: "Facebook URL",   type: "url",   placeholder: "https://facebook.com/..." },
    { key: "instagram",    label: "Instagram URL",  type: "url",   placeholder: "https://instagram.com/..." },
    { key: "youtube",      label: "YouTube URL",    type: "url",   placeholder: "https://youtube.com/..." },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <div className="bj-panel p-6">
        <p className="premium-label mb-3 uppercase">Website Settings</p>
        <h2 className="font-serif text-2xl font-bold tracking-tight">Global site details</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--bj-muted)]">These settings update the brand, contact links, social links, and logo across the website.</p>

        <div className="mt-6 grid gap-3">
          {FIELDS.map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--bj-muted)]">{label}</label>
              <input className="bj-input" type={type} placeholder={placeholder} value={form[key] || ""} onChange={s(key)} />
            </div>
          ))}
          <ImageUpload label="Logo" value={form.logo} onChange={(url) => setForm((f) => ({ ...f, logo: url }))} />
        </div>

        {/* ── About Page Images ── */}
        <div className="mt-7 border-t border-[var(--bj-border)] pt-6">
          <p className="premium-label mb-1.5 uppercase">About Page Images</p>
          <p className="mb-4 text-[12.5px] leading-5 text-[var(--bj-muted)]">
            Replace the portraits shown on the public About page. Leave empty to use the built-in defaults.
          </p>
          <div className="grid gap-4">
            <ImageUpload
              label="Hero Portrait (top of About)"
              value={form.aboutHeroImage}
              onChange={(url) => setForm((f) => ({ ...f, aboutHeroImage: url }))}
            />
            <ImageUpload
              label="Mission Portrait (black & white)"
              value={form.aboutPortraitImage}
              onChange={(url) => setForm((f) => ({ ...f, aboutPortraitImage: url }))}
            />
            <ImageUpload
              label="Featured Work Image"
              value={form.aboutFeaturedImage}
              onChange={(url) => setForm((f) => ({ ...f, aboutFeaturedImage: url }))}
            />
          </div>
        </div>

        <button type="button" onClick={save} disabled={saving} className="btn-primary mt-6 flex items-center gap-2 rounded-xl py-3 disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="bj-panel overflow-hidden">
        <div className="border-b border-[var(--bj-border)] p-5">
          <h2 className="font-serif text-xl font-bold tracking-tight">Preview</h2>
          <p className="mt-0.5 text-sm text-[var(--bj-muted)]">Current public identity.</p>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-4">
            {form.logo ? (
              <img src={form.logo} alt="Logo" className="h-14 w-14 rounded-2xl border border-[var(--bj-border)] object-cover" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-lg font-black text-white">BJ</div>
            )}
            <div>
              <p className="font-sans text-lg font-black uppercase tracking-wide">{form.brandName || "Bung Jack Official"}</p>
              <p className="mt-0.5 text-sm text-[var(--bj-muted)]">{form.tagline || "Independent media platform"}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-2 text-sm">
            {[["Email", form.email], ["WhatsApp", form.whatsappLink], ["Facebook", form.facebook], ["Instagram", form.instagram]].map(([l, v]) => (
              <div key={l} className="flex items-center justify-between gap-4 rounded-xl border border-[var(--bj-border)] bg-[var(--bj-surface-2)] px-4 py-2.5">
                <span className="text-[var(--bj-muted)]">{l}</span>
                <span className="max-w-[200px] truncate font-semibold">{v || "Not set"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Two-Factor Authentication Panel ────────────────── */
function TwoFactorPanel({ showToast }) {
  const [enabled,   setEnabled]   = useState(false);
  const [loading,   setLoading]   = useState(true);
  const [setupData, setSetupData] = useState(null); // { qr, secret }
  const [code,      setCode]      = useState("");
  const [busy,      setBusy]      = useState(false);

  const refresh = async () => {
    try {
      const res = await apiGet("/auth/me");
      setEnabled(Boolean(res.admin?.twoFactorEnabled));
    } catch { /* noop */ } finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []);

  const startSetup = async () => {
    setBusy(true);
    try {
      const res = await apiPost("/auth/2fa/setup", {});
      setSetupData({ qr: res.qr, secret: res.secret });
      setCode("");
    } catch (err) { showToast(err.message || "Could not start 2FA setup.", "error"); }
    finally { setBusy(false); }
  };

  const confirmEnable = async () => {
    if (!/^\d{6}$/.test(code.trim())) { showToast("Enter the 6-digit code.", "error"); return; }
    setBusy(true);
    try {
      await apiPost("/auth/2fa/enable", { token: code.trim() });
      showToast("Two-factor authentication enabled.");
      setSetupData(null); setCode(""); setEnabled(true);
    } catch (err) { showToast(err.message || "Invalid code.", "error"); }
    finally { setBusy(false); }
  };

  const disable = async () => {
    const c = window.prompt("Enter a current authenticator code to disable 2FA:");
    if (!c) return;
    setBusy(true);
    try {
      await apiPost("/auth/2fa/disable", { token: c.trim() });
      showToast("Two-factor authentication disabled.");
      setEnabled(false); setSetupData(null);
    } catch (err) { showToast(err.message || "Invalid code.", "error"); }
    finally { setBusy(false); }
  };

  return (
    <div className="bj-panel mt-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl"
             style={{ background: "var(--bj-red-surface)", color: "var(--bj-red)" }}>
          <KeyRound size={18} />
        </div>
        <div>
          <p className="premium-label uppercase">Account Security</p>
          <h2 className="font-serif text-xl font-bold tracking-tight">Two-factor authentication</h2>
        </div>
        <span className="ml-auto rounded-full px-3 py-1 text-[10.5px] font-black uppercase tracking-[0.12em]"
              style={{
                background: enabled ? "rgba(34,197,94,0.12)" : "var(--bj-surface-2)",
                color: enabled ? "#16a34a" : "var(--bj-muted)",
                border: `1px solid ${enabled ? "rgba(34,197,94,0.25)" : "var(--bj-border-hover)"}`,
              }}>
          {loading ? "…" : enabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-[var(--bj-muted)]">
        Require a one-time code from an authenticator app (Google Authenticator, Authy, 1Password) at every admin login.
      </p>

      {!loading && !enabled && !setupData && (
        <button type="button" onClick={startSetup} disabled={busy}
                className="btn-primary mt-5 rounded-xl px-5 py-3 disabled:opacity-60">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
          Set up 2FA
        </button>
      )}

      {setupData && (
        <div className="mt-5 grid gap-4 rounded-2xl border border-[var(--bj-border)] bg-[var(--bj-surface-2)] p-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <img src={setupData.qr} alt="2FA QR code" className="h-40 w-40 rounded-xl bg-white p-2" />
          <div>
            <p className="text-sm font-semibold text-[var(--bj-text)]">1. Scan this QR with your authenticator app</p>
            <p className="mt-1 text-[12.5px] text-[var(--bj-muted)]">
              Or enter this key manually:
              <code className="ml-1 break-all rounded bg-[var(--bj-surface)] px-1.5 py-0.5 text-[11px]">{setupData.secret}</code>
            </p>
            <p className="mt-3 text-sm font-semibold text-[var(--bj-text)]">2. Enter the 6-digit code to confirm</p>
            <div className="mt-2 flex gap-2">
              <input className="bj-input max-w-[140px] text-center text-lg font-black tracking-[0.3em]"
                     inputMode="numeric" placeholder="000000" value={code} maxLength={6}
                     onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
              <button type="button" onClick={confirmEnable} disabled={busy} className="btn-primary rounded-xl px-5 disabled:opacity-60">
                {busy ? <Loader2 size={15} className="animate-spin" /> : "Enable"}
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && enabled && (
        <button type="button" onClick={disable} disabled={busy}
                className="btn-secondary mt-5 rounded-xl px-5 py-3 hover:!border-red-600/40 hover:!text-red-500 disabled:opacity-60">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
          Disable 2FA
        </button>
      )}
    </div>
  );
}

/* ─── Root Admin Component ───────────────────────────── */
export default function Admin() {
  const [admin,       setAdmin]       = useState(null);
  const [checking,    setChecking]    = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [tab,         setTab]         = useState("dashboard");
  const [toast,       setToast]       = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [data, setData] = useState({
    posts: [], videos: [], donations: [], messages: [], premium: [], dashboard: null,
    settings: DEFAULT_SETTINGS,
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(window.__bjToast);
    window.__bjToast = window.setTimeout(() => setToast(null), 3500);
  };

  const refresh = async () => {
    try {
      setLoadingData(true);
      const [dashboard, posts, videos, donations, messages, premium, settings] = await Promise.all([
        apiGet("/admin/dashboard").catch(() => null),
        apiGet("/posts?status=all&limit=100").catch(() => ({ items: [] })),
        apiGet("/videos?status=all&limit=100").catch(() => ({ items: [] })),
        apiGet("/donations").catch(() => ({ items: [] })),
        apiGet("/contact").catch(() => ({ items: [] })),
        apiGet("/premium-content").catch(() => ({ items: [] })),
        apiGet("/settings/admin").catch(() => DEFAULT_SETTINGS),
      ]);
      setData({
        dashboard,
        posts:     normalizeList(posts),
        videos:    normalizeList(videos),
        donations: normalizeList(donations),
        messages:  normalizeList(messages),
        premium:   normalizeList(premium),
        settings:  settings?.settings || settings?.data || settings || DEFAULT_SETTINGS,
      });
    } catch (err) {
      showToast(err.message || "Unable to refresh data.", "error");
    } finally { setLoadingData(false); }
  };

  useEffect(() => {
    apiGet("/auth/me")
      .then((r) => { setAdmin(r.admin); return refresh(); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const logout = async () => {
    try { await apiPost("/auth/logout", {}); } catch {}
    setAdmin(null); setTab("dashboard");
    showToast("Logged out.");
  };

  if (checking) {
    return (
      <main className="bj-page flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--bj-border)] bg-[var(--bj-surface)] px-5 py-4 shadow-lg">
          <Loader2 className="animate-spin text-red-600" size={18} />
          <p className="text-sm font-semibold">Checking session...</p>
        </div>
      </main>
    );
  }

  if (!admin) return <><AdminLogin onDone={(a) => { setAdmin(a); refresh(); showToast("Welcome back."); }} /><Toast toast={toast} onClose={() => setToast(null)} /></>;

  return (
    <main className="bj-page min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop sidebar — flex column, nav scrolls, buttons pinned at bottom */}
      <aside className="sticky top-[72px] flex h-[calc(100vh-72px)] flex-col overflow-hidden border-r border-[var(--bj-border)] bg-[var(--bj-surface)] max-lg:hidden">
        {/* Scrollable section */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-5 rounded-2xl border border-[var(--bj-border)] bg-[var(--bj-surface-2)] p-4">
            <img src={LOGO_SRC} alt={BRAND_NAME} className="h-12 w-auto object-contain" />
            <p className="premium-label mt-2.5">Admin workspace</p>
            <p className="mt-2 text-xs text-[var(--bj-muted)]">
              Signed in as{" "}
              <span className="break-all font-semibold text-[var(--bj-text)]">{admin.email}</span>
            </p>
          </div>

          <nav className="grid gap-1">
            {TABS.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  tab === key
                    ? "bg-red-600 text-white shadow-[0_0_22px_rgba(220,38,38,0.18)]"
                    : "text-[var(--bj-muted)] hover:bg-[var(--bj-surface-2)] hover:text-[var(--bj-text)]"
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Pinned bottom actions — never overlaps nav */}
        <div className="shrink-0 border-t border-[var(--bj-border)] p-4 grid gap-2">
          <button
            type="button"
            onClick={refresh}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--bj-border)] px-3 py-2.5 text-sm font-semibold text-[var(--bj-muted)] transition hover:border-[var(--bj-border-hover)] hover:text-[var(--bj-text)]"
          >
            {loadingData ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
            Refresh data
          </button>
          <button
            type="button"
            onClick={logout}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <section className="px-5 py-8 sm:px-6 lg:px-10">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="premium-label uppercase">Private Admin</p>
            <h1 className="font-serif mt-1 text-[var(--text-display)] font-bold capitalize leading-tight tracking-tight">
              {TABS.find((t) => t.key === tab)?.label || tab}
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            {/* Mobile tab selector */}
            <select className="bj-input lg:hidden" value={tab} onChange={(e) => setTab(e.target.value)}>
              {TABS.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>

            <button type="button" onClick={refresh}
              className="btn-secondary hidden items-center gap-2 sm:inline-flex">
              {loadingData ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
              Refresh
            </button>
            <button type="button" onClick={logout}
              className="btn-secondary hidden items-center gap-2 lg:hidden sm:inline-flex">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {tab === "dashboard" && <Dashboard data={data} setTab={setTab} loading={loadingData} />}
        {tab === "posts"     && <Manager type="posts"           title="Posts"          items={data.posts}    blank={BLANK_POST}    refresh={refresh} showToast={showToast} />}
        {tab === "videos"    && <Manager type="videos"          title="Videos & Reels" items={data.videos}   blank={BLANK_VIDEO}   refresh={refresh} showToast={showToast} />}
        {tab === "premium"   && <Manager type="premium-content" title="Premium Content" items={data.premium}  blank={BLANK_PREMIUM} refresh={refresh} showToast={showToast} />}
        {tab === "donations" && <Donations items={data.donations} />}
        {tab === "messages"  && <Messages items={data.messages} refresh={refresh} showToast={showToast} />}
        {tab === "settings"  && (
          <>
            <SettingsPanel settings={data.settings} refresh={refresh} showToast={showToast} />
            <TwoFactorPanel showToast={showToast} />
          </>
        )}
      </section>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
}
