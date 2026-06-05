import { Link } from "react-router-dom";
import { Facebook, Instagram, Mail, Heart, MessageCircle, ArrowUpRight } from "lucide-react";
import { LOGO_SRC, BRAND_NAME } from "../brand.js";

const footerLinks = [
  { label: "Home",            path: "/" },
  { label: "Content",         path: "/content" },
  { label: "Premium Members", path: "/premium" },
  { label: "About",           path: "/about" },
  { label: "Donate",          path: "/donate" },
  { label: "Subscribe",       path: "/subscribe" },
  { label: "Contact",         path: "/contact" },
];

export default function Footer({ settings = {} }) {
  const brandName = settings.brandName    || "Bung Jack Official";
  const tagline   = settings.tagline      || "Independent Media. Stories That Speak the Truth.";
  const email     = settings.email        || "blackservice27@gmail.com";
  const facebook  = settings.facebook    || "https://www.facebook.com/share/1BSGbLnQcv/?mibextid=wwXIfr";
  const instagram = settings.instagram   || "https://www.instagram.com/rajputh62?igsh=Zno3NnhndGM4bjcy";
  const whatsapp  = settings.whatsappLink || "https://wa.me/13124590936";

  return (
    <footer
      className="border-t text-[var(--bj-text)]"
      style={{ borderColor: "var(--bj-border)", background: "var(--bj-surface)" }}
    >
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.9fr_0.9fr] lg:items-start">

          {/* ── Brand ── */}
          <div>
            <Link to="/" className="mb-5 inline-flex items-center" aria-label={`${BRAND_NAME} home`}>
              <img src={LOGO_SRC} alt={BRAND_NAME} className="h-16 w-auto object-contain" />
            </Link>

            <p className="max-w-sm text-[14px] leading-7" style={{ color: "var(--bj-muted)" }}>
              {tagline}
            </p>

            <Link
              to="/donate"
              className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:-translate-y-0.5"
              style={{
                background: "var(--bj-red)",
                boxShadow: "0 0 24px var(--bj-red-glow)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--bj-red-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "var(--bj-red)"}
            >
              <Heart size={13} fill="currentColor" className="animate-pulse" />
              Support the Work
            </Link>
          </div>

          {/* ── Navigation ── */}
          <div>
            <h4
              className="mb-5 text-[11px] font-black uppercase tracking-[0.2em]"
              style={{ color: "var(--bj-text)" }}
            >
              Navigation
            </h4>
            <nav className="grid gap-2.5" aria-label="Footer navigation">
              {footerLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="group inline-flex items-center gap-1.5 text-[13.5px] font-medium transition-colors duration-150"
                  style={{ color: "var(--bj-muted)" }}
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--bj-red)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "var(--bj-muted)"}
                >
                  <ArrowUpRight
                    size={12}
                    className="opacity-0 transition group-hover:opacity-100"
                  />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Connect ── */}
          <div>
            <h4
              className="mb-5 text-[11px] font-black uppercase tracking-[0.2em]"
              style={{ color: "var(--bj-text)" }}
            >
              Connect
            </h4>

            <div className="flex flex-wrap gap-3">
              {[
                { href: facebook,           icon: Facebook,      label: "Facebook"  },
                { href: instagram,          icon: Instagram,     label: "Instagram" },
                { href: `mailto:${email}`,  icon: Mail,          label: "Email"     },
                { href: whatsapp,           icon: MessageCircle, label: "WhatsApp"  },
              ].map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200"
                  style={{
                    border: "1.5px solid var(--bj-border-hover)",
                    background: "var(--bj-surface-2)",
                    color: "var(--bj-muted)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--bj-red-border)";
                    e.currentTarget.style.color = "var(--bj-red)";
                    e.currentTarget.style.background = "var(--bj-red-surface)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--bj-border-hover)";
                    e.currentTarget.style.color = "var(--bj-muted)";
                    e.currentTarget.style.background = "var(--bj-surface-2)";
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>

            <p
              className="mt-5 text-[13px] font-medium"
              style={{ color: "var(--bj-muted)" }}
            >
              {email}
            </p>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="mt-10 flex flex-col gap-2 border-t pt-6 text-[11px] font-semibold uppercase tracking-[0.14em] sm:flex-row sm:items-center sm:justify-between"
          style={{
            borderColor: "var(--bj-border)",
            color: "var(--bj-subtle)",
          }}
        >
          <p>© {new Date().getFullYear()} Bung Jack Official. All rights reserved.</p>
          <p>Independent Media · Stories That Matter</p>
        </div>
      </div>
    </footer>
  );
}
