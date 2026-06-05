import { Link } from "react-router-dom";
import { ArrowLeft, CreditCard } from "lucide-react";

export default function DonateCancel() {
  return (
    <main className="min-h-screen bg-[var(--bj-bg)] text-[var(--bj-text)]">
      <section className="relative flex min-h-[calc(100vh-82px)] items-center justify-center overflow-hidden px-6 pb-16 pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(214,31,44,0.14),transparent_32%),linear-gradient(90deg,#F6F7F9_0%,rgba(246,247,249,0.96)_100%)] dark:bg-[radial-gradient(circle_at_50%_35%,rgba(214,31,44,0.16),transparent_32%),linear-gradient(90deg,#131311_0%,rgba(19,19,17,0.98)_100%)]" />

        <div className="relative max-w-xl rounded-[2rem] border border-black/10 bg-white/75 p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.10)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-600 dark:text-red-500">
            <CreditCard size={34} />
          </div>

          <p className="premium-label mb-4 uppercase text-red-600 dark:text-red-500">
            Payment Cancelled
          </p>

          <h1 className="font-serif text-4xl font-bold leading-tight tracking-[-0.055em] md:text-5xl">
            Donation was not completed.
          </h1>

          <p className="mx-auto mt-5 max-w-md text-[15.5px] leading-7 text-[var(--bj-muted)]">
            You can return to the donation page and try again whenever you are
            ready.
          </p>

          <Link
            to="/donate"
            className="mt-7 inline-flex items-center justify-center gap-3 rounded-full bg-red-600 px-7 py-4 text-sm font-black uppercase tracking-[0.14em] text-white transition hover:bg-red-700"
          >
            <ArrowLeft size={17} />
            Return to Donate
          </Link>
        </div>
      </section>
    </main>
  );
}