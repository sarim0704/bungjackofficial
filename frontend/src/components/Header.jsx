import { Link, NavLink } from "react-router-dom";
import { Menu, X, Sun, Moon, Heart, Facebook, Instagram, Crown } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { LOGO_SRC, BRAND_NAME } from "../brand.js";

const navLinks = [
  { label: "Home",            path: "/" },
  { label: "Content",         path: "/content" },
  { label: "Premium Members", path: "/premium" },
  { label: "About",           path: "/about" },
  { label: "Contact",         path: "/contact" },
  { label: "Subscribe",       path: "/subscribe" },
];

export default function Header({ settings, theme, setTheme }) {
  const [open, setOpen]           = useState(false);
  const [visible, setVisible]     = useState(true);
  const [scrolled, setScrolled]   = useState(false);
  const [lastScroll, setLastScroll] = useState(0);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const closeMenu   = () => setOpen(false);

  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    setScrolled(y > 12);
    if (y < 80)          setVisible(true);
    else if (y > lastScroll) setVisible(false);
    else                 setVisible(true);
    setLastScroll(y);
  }, [lastScroll]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  /* lock body scroll when mobile menu is open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const fb  = settings?.facebook  || "https://www.facebook.com/share/1BSGbLnQcv/?mibextid=wwXIfr";
  const ig  = settings?.instagram || "https://www.instagram.com/rajputh62?igsh=Zno3NnhndGM4bjcy";

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-[999] w-full px-3 pt-3 transition-transform duration-500 ease-out sm:px-5 ${
          visible ? "translate-y-0" : "-translate-y-[120%]"
        }`}
      >
        <div
          className="mx-auto flex h-[54px] max-w-7xl items-center justify-between rounded-full border px-4 backdrop-blur-2xl transition-all duration-300 sm:h-[60px] sm:px-5"
          style={{
            background: "var(--bj-surface)",
            borderColor: "var(--bj-border-hover)",
            boxShadow: scrolled
              ? "0 14px 45px rgba(0,0,0,0.16)"
              : "0 6px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* Logo — hardcoded brand mark (contains wordmark) */}
          <Link to="/" className="flex shrink-0 items-center" aria-label={`${BRAND_NAME} home`}>
            <img
              src={LOGO_SRC}
              alt={BRAND_NAME}
              className="h-9 w-auto object-contain sm:h-11"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Main navigation">
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-red-600 text-white shadow-[0_0_22px_rgba(220,38,38,0.28)]"
                      : "text-[var(--bj-muted)] hover:bg-[var(--bj-surface-2)] hover:text-[var(--bj-text)]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Social icons */}
            <a
              href={fb}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn hidden sm:flex"
              aria-label="Facebook"
            >
              <Facebook size={15} />
            </a>
            <a
              href={ig}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn hidden sm:flex"
              aria-label="Instagram"
            >
              <Instagram size={15} />
            </a>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="icon-btn"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Premium pill */}
            <Link
              to="/premium"
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-[11.5px] font-bold uppercase tracking-[0.1em] transition hover:-translate-y-0.5 sm:inline-flex"
              style={{
                border: "1.5px solid var(--bj-gold-border)",
                background: "var(--bj-gold-surface)",
                color: "var(--bj-gold)",
              }}
              aria-label="Premium content"
            >
              <Crown size={12} />
              Premium
            </Link>

            {/* Donate CTA */}
            <Link
              to="/donate"
              className="group relative hidden items-center gap-1.5 overflow-hidden rounded-full bg-red-600 px-4 py-2.5 text-[11.5px] font-black uppercase tracking-[0.12em] text-white shadow-[0_0_28px_rgba(220,38,38,0.32)] transition hover:-translate-y-0.5 hover:bg-red-700 sm:inline-flex"
            >
              <span className="absolute -left-8 top-0 h-full w-8 rotate-12 bg-white/25 blur-sm transition-all duration-700 group-hover:left-[120%]" />
              <Heart size={13} fill="currentColor" className="relative z-10 animate-pulse" />
              <span className="relative z-10">Donate</span>
            </Link>

            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="icon-btn xl:hidden"
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[1000] xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeMenu}
          />

          {/* Panel */}
          <div className="absolute right-3 top-3 w-[calc(100%-24px)] max-w-sm overflow-hidden rounded-[2rem] border border-[var(--bj-border)] bg-[#F6F7F9]/96 p-5 shadow-2xl backdrop-blur-2xl dark:bg-[#1F1F1D]/96">
            {/* Header row */}
            <div className="mb-5 flex items-center justify-between">
              <Link to="/" onClick={closeMenu} className="flex items-center" aria-label={`${BRAND_NAME} home`}>
                <img src={LOGO_SRC} alt={BRAND_NAME} className="h-11 w-auto object-contain" />
              </Link>
              <button
                type="button"
                onClick={closeMenu}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-black/5 text-black dark:border-white/10 dark:bg-white/5 dark:text-white"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="grid gap-1.5" aria-label="Mobile navigation">
              {navLinks.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                      isActive
                        ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.22)]"
                        : "bg-black/[0.04] text-black/72 hover:bg-red-600 hover:text-white dark:bg-white/[0.04] dark:text-white/72 dark:hover:bg-red-600 dark:hover:text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Bottom actions */}
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => { toggleTheme(); closeMenu(); }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-black/5 px-4 py-3 text-sm font-bold text-black dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                Theme
              </button>

              <Link
                to="/donate"
                onClick={closeMenu}
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-red-600 px-4 py-3 text-sm font-black uppercase tracking-wide text-white"
              >
                <span className="absolute -left-8 top-0 h-full w-8 rotate-12 bg-white/25 blur-sm transition-all duration-700 group-hover:left-[120%]" />
                <Heart size={15} fill="currentColor" className="relative z-10 animate-pulse" />
                <span className="relative z-10">Donate</span>
              </Link>
            </div>

            {/* Social row */}
            <div className="mt-3 flex items-center justify-center gap-3 border-t border-black/8 pt-3 border-[var(--bj-border)]">
              <a href={fb} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="Facebook">
                <Facebook size={15} />
              </a>
              <a href={ig} target="_blank" rel="noopener noreferrer" className="icon-btn" aria-label="Instagram">
                <Instagram size={15} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* icon-btn utility — injected as a global so Tailwind purges it */}
      <style>{`
        .icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 2.25rem;
          width: 2.25rem;
          border-radius: 9999px;
          border: 1px solid rgba(10,11,18,0.14);
          background: rgba(10,11,18,0.04);
          color: rgba(10,11,18,0.72);
          transition: color 0.2s, border-color 0.2s, background 0.2s;
          cursor: pointer;
        }
        /* Dark: Warm Zinc surface tints — stronger so icons stay visible */
        .dark .icon-btn {
          border-color: rgba(244,244,242,0.22);
          background: rgba(244,244,242,0.10);
          color: rgba(244,244,242,0.88);
        }
        .icon-btn:hover { color: #DC2626; border-color: rgba(220,38,38,0.32); background: rgba(220,38,38,0.06); }
        .dark .icon-btn:hover { color: #F03030; border-color: rgba(240,48,48,0.35); background: rgba(240,48,48,0.10); }
      `}</style>
    </>
  );
}
