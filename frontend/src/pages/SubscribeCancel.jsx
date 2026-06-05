import { Link } from "react-router-dom";
import { ArrowLeft, CreditCard } from "lucide-react";

export default function SubscribeCancel() {
  return (
    <main className="bj-page relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-16 pt-28">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(220,38,38,0.12),transparent_34%)]" />

      <div className="relative w-full max-w-xl rounded-[2rem] border border-[var(--bj-border)] bg-[var(--bj-surface)] p-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bj-red-surface)] text-[var(--bj-red)]">
          <CreditCard size={34} />
        </div>

        <p className="premium-label mb-4 justify-center uppercase">Subscription Cancelled</p>

        <h1 className="font-serif text-[clamp(1.9rem,4vw,3rem)] font-bold leading-tight tracking-tight text-[var(--bj-text)]">
          Subscription was not completed.
        </h1>

        <p className="mx-auto mt-5 max-w-md text-[15px] leading-7 text-[var(--bj-muted)]">
          No payment was taken. Return to the subscription page and choose a plan
          whenever you are ready.
        </p>

        <Link
          to="/subscribe"
          className="btn-primary mt-8 inline-flex justify-center rounded-full px-8 py-3.5"
        >
          <ArrowLeft size={16} />
          Return to Subscribe
        </Link>
      </div>
    </main>
  );
}
