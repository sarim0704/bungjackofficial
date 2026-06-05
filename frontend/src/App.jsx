import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Header          from "./components/Header.jsx";
import Footer          from "./components/Footer.jsx";
import WhatsAppButton  from "./components/WhatsAppButton.jsx";

import Home            from "./pages/Home.jsx";
import About           from "./pages/About.jsx";
import Content         from "./pages/Content.jsx";
import Donate          from "./pages/Donate.jsx";
import DonateSuccess   from "./pages/DonateSuccess.jsx";
import DonateCancel    from "./pages/DonateCancel.jsx";
import Subscribe       from "./pages/Subscribe.jsx";
import SubscribeSuccess from "./pages/SubscribeSuccess.jsx";
import SubscribeCancel from "./pages/SubscribeCancel.jsx";
import Premium         from "./pages/Premium.jsx";
import Contact         from "./pages/Contact.jsx";
import Admin           from "./pages/Admin.jsx";

import { apiGet } from "./api.js";
import { fallbackSettings, fallbackPosts, fallbackVideos } from "./data/fallback.js";

function normalizeList(response, fallback = []) {
  if (Array.isArray(response))              return response;
  if (Array.isArray(response?.items))       return response.items;
  if (Array.isArray(response?.data))        return response.data;
  if (Array.isArray(response?.posts))       return response.posts;
  if (Array.isArray(response?.videos))      return response.videos;
  if (Array.isArray(response?.results))     return response.results;
  return fallback;
}

function normalizeSettings(response, fallback = {}) {
  if (!response || typeof response !== "object") return fallback;
  if (response.settings && typeof response.settings === "object") return response.settings;
  if (response.data    && typeof response.data    === "object") return response.data;
  return response;
}

export default function App() {
  const [theme,    setTheme]    = useState(localStorage.getItem("theme") || "dark");
  const [settings, setSettings] = useState(fallbackSettings);
  const [posts,    setPosts]    = useState(fallbackPosts);
  const [videos,   setVideos]   = useState(fallbackVideos);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    Promise.all([
      apiGet("/settings"),
      apiGet("/posts"),
      apiGet("/videos"),
    ])
      .then(([s, p, v]) => {
        setSettings(normalizeSettings(s, fallbackSettings));
        setPosts(normalizeList(p, fallbackPosts));
        setVideos(normalizeList(v, fallbackVideos));
      })
      .catch(() => {
        setSettings(fallbackSettings);
        setPosts(fallbackPosts);
        setVideos(fallbackVideos);
      });
  }, []);

  const safePosts  = Array.isArray(posts)  ? posts  : [];
  const safeVideos = Array.isArray(videos) ? videos : [];

  /* Combined & date-sorted for Content page */
  const allContent = [...safePosts, ...safeVideos].sort((a, b) => {
    const da = new Date(a.createdAt || a.date || 0).getTime();
    const db = new Date(b.createdAt || b.date || 0).getTime();
    return db - da;
  });

  return (
    <div className="min-h-screen bg-[var(--bj-bg)] text-[var(--bj-text)] transition-colors">
      <Header settings={settings} theme={theme} setTheme={setTheme} />

      <Routes>
        <Route path="/" element={<Home posts={safePosts} videos={safeVideos} settings={settings} />} />

        {/* Main content page — replaces /videos, /reels, /news, /investigations */}
        <Route path="/content" element={<Content posts={safePosts} videos={safeVideos} />} />

        {/* Legacy redirects — keep old URLs working */}
        <Route path="/videos"         element={<Navigate to="/content" replace />} />
        <Route path="/reels"          element={<Navigate to="/content" replace />} />
        <Route path="/news"           element={<Navigate to="/content" replace />} />
        <Route path="/investigations" element={<Navigate to="/content" replace />} />

        <Route path="/about"          element={<About settings={settings} />} />
        <Route path="/contact"        element={<Contact settings={settings} />} />

        <Route path="/donate"         element={<Donate />} />
        <Route path="/donate/success" element={<DonateSuccess />} />
        <Route path="/donate/cancel"  element={<DonateCancel />} />

        <Route path="/subscribe"          element={<Subscribe />} />
        <Route path="/subscribe/success"  element={<SubscribeSuccess />} />
        <Route path="/subscribe/cancel"   element={<SubscribeCancel />} />

        <Route path="/premium"        element={<Premium />} />

        <Route path="/admin"          element={<Admin />} />
        <Route path="/admin/*"        element={<Navigate to="/admin" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer settings={settings} />
      <WhatsAppButton link={settings?.whatsappLink} />
    </div>
  );
}
