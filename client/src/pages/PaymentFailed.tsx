import { Link, useLocation } from "react-router-dom";

export default function PaymentFailed() {
  const location = useLocation();
  const reason = (location.state as { reason?: string } | null)?.reason;

  return (
    <section className="min-h-screen bg-red-50 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-700">Payment failed</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">We could not complete your payment</h1>
        <p className="mt-3 text-slate-600">
          {reason || "Sorry, something went wrong while processing the payment. Please try again."}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/browse" className="rounded-lg bg-teal-600 px-5 py-2.5 text-center font-semibold text-white hover:bg-teal-700">
            Try Again
          </Link>
          <Link to="/bookings" className="rounded-lg border border-slate-300 px-5 py-2.5 text-center font-semibold text-slate-700 hover:bg-slate-50">
            Check Bookings
          </Link>
        </div>
      </div>
    </section>
  );
}
