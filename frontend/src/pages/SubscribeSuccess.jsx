import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { BadgeCheck, ArrowRight, Lock, Crown, Loader2, XCircle } from "lucide-react";
import { apiGet } from "../api.js";

export default function SubscribeSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus]               = useState("loading");
  const [plan, setPlan]                   = useState(null);
  const [subscriberName, setSubscriberName] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (!sessionId) { setStatus("failed"); return; }

    apiGet(`/subscriptions/verify/${sessionId}`)
      .then((data) => {
        const sub = data.subscription;
        if (sub?.status === "active") {
          if (sub.subscriberEmail) localStorage.setItem("bj_subscriber_email", sub.subscriberEmail);
          setPlan(sub.plan);
          setSubscriberName(sub.subscriberName || "");
          setStatus("verified");
        } else {
          setStatus("failed");
        }
      })
      .catch(() => setStatus("failed"));
  }, []);

  /* ── Loading ── */
  if (status === "loading") {
    return (
      <main className="bj-page flex min-h-screen items-center justify-center px-6">
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--bj-border)] bg-[var(--bj-surface)] px-6 py-4 shadow-xl">
          <Loader2 className="animate-spin text-[var(--bj-red)]" size={20} />
          <p className="text-sm font-semibold text-[var(--bj-text)]">Verifying your subscription...</p>
        </div>
      </main>
    );
  }

  /* ── Failed ── */
  if (status === "failed") {
    return (
      <main className="bj-page relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-16 pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(220,38,38,0.12),transparent_34%)]" />
        <div className="relative w-full max-w-xl rounded-[2rem] border border-[var(--bj-border)] bg-[var(--bj-surface)] p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.14)] backdrop-blur-xl dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bj-red-surface)] text-[var(--bj-red)]">
            <XCircle size={34} />
          </div>
          <p className="premium-label mb-4 justify-center uppercase">Verification Failed</p>
          <h1 className="font-serif text-[clamp(1.9rem,4vw,3rem)] font-bold leading-tight tracking-tight text-[var(--bj-text)]">
            Could not verify subscription.
          </h1>
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-7 text-[var(--bj-muted)]">
            If you completed payment, please contact support or try again.
            Your payment record is saved and can be verified manually.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link to="/subscribe" className="btn-primary justify-center rounded-xl py-3.5">
              Try again
            </Link>
            <Link to="/" className="btn-secondary justify-center rounded-xl py-3.5">
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ── Verified ── */
  return (
    <main className="bj-page relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-16 pt-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(220,38,38,0.14),transparent_34%)]" />

      <div className="relative w-full max-w-xl rounded-[2rem] border border-[var(--bj-border)] bg-[var(--bj-surface)] p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bj-red-surface)] text-[var(--bj-red)]">
          <BadgeCheck size={34} />
        </div>

        <p className="premium-label mb-4 justify-center uppercase">Subscription Active</p>

        <h1 className="font-serif text-[clamp(1.9rem,4vw,3rem)] font-bold leading-tight tracking-tight text-[var(--bj-text)]">
          Premium access unlocked.
        </h1>

        {subscriberName && (
          <p className="mt-3 text-sm font-semibold text-[var(--bj-muted)]">
            Welcome, {subscriberName}
          </p>
        )}

        <p className="mx-auto mt-5 max-w-md text-[15px] leading-7 text-[var(--bj-muted)]">
          {plan === "videos"
            ? "Your $10 Videos plan is active. Access premium videos, links, and images."
            : "Your $5 Images plan is active. Access the full premium image library."}
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link to="/premium" className="btn-primary justify-center rounded-xl py-3.5">
            <Crown size={16} />
            Open Premium
            <ArrowRight size={15} />
          </Link>
          <Link to="/" className="btn-secondary justify-center rounded-xl py-3.5">
            Back to Home
          </Link>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--bj-subtle)]">
          <Lock size={12} />
          Access verified via Stripe and stored on this device.
        </p>
      </div>
    </main>
  );
}
