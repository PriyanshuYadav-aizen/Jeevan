import { Link, useLocation } from "react-router-dom";

type PaymentState = {
  bookingId?: string;
  paymentId?: string;
  orderId?: string;
  amount?: number;
  service?: string;
  workerName?: string;
};

export default function PaymentSuccess() {
  const location = useLocation();
  const details = (location.state || {}) as PaymentState;

  return (
    <section className="min-h-screen bg-emerald-50 px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-xl border border-emerald-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Payment confirmed</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Your booking is confirmed</h1>
        <p className="mt-3 text-slate-600">
          Thank you. We have received your payment and saved the booking details.
        </p>

        <div className="mt-6 grid gap-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
          <p><span className="font-semibold">Service:</span> {details.service || "Healthcare service"}</p>
          <p><span className="font-semibold">Provider:</span> {details.workerName || "Assigned provider"}</p>
          <p><span className="font-semibold">Amount:</span> Rs. {(details.amount || 0).toLocaleString()}</p>
          <p><span className="font-semibold">Booking ID:</span> {details.bookingId || "Available in bookings"}</p>
          {details.paymentId && <p className="sm:col-span-2"><span className="font-semibold">Payment ID:</span> {details.paymentId}</p>}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/bookings" className="rounded-lg bg-teal-600 px-5 py-2.5 text-center font-semibold text-white hover:bg-teal-700">
            View My Bookings
          </Link>
          <Link to="/browse" className="rounded-lg border border-slate-300 px-5 py-2.5 text-center font-semibold text-slate-700 hover:bg-slate-50">
            Browse More Providers
          </Link>
        </div>
      </div>
    </section>
  );
}
