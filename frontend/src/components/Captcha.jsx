import { useEffect, useRef } from "react";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";
export const CAPTCHA_ENABLED = Boolean(SITE_KEY && !SITE_KEY.includes("replace"));

const SCRIPT_ID  = "cf-turnstile-script";
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/*
  Cloudflare Turnstile widget.
  - If no site key is configured, renders nothing and immediately
    reports a placeholder token so the form still submits (the
    backend also skips verification when unconfigured).
  - Otherwise loads the Turnstile script once and renders the widget.
*/
export default function Captcha({ onToken }) {
  const containerRef = useRef(null);
  const widgetIdRef  = useRef(null);

  useEffect(() => {
    if (!CAPTCHA_ENABLED) {
      onToken("disabled");
      return;
    }

    const render = () => {
      if (window.turnstile && containerRef.current && widgetIdRef.current === null) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme: "auto",
          callback: (token) => onToken(token),
          "error-callback": () => onToken(""),
          "expired-callback": () => onToken(""),
        });
      }
    };

    if (window.turnstile) {
      render();
    } else {
      let script = document.getElementById(SCRIPT_ID);
      if (!script) {
        script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
    }

    return () => {
      if (window.turnstile && widgetIdRef.current !== null) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* noop */ }
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!CAPTCHA_ENABLED) return null;
  return <div ref={containerRef} className="flex justify-center" />;
}
