import { useNavigate } from "react-router-dom";

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
};

export default function EmptyState({
  title,
  message,
  actionLabel,
  actionTo,
  onAction,
}: EmptyStateProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600">
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-7 4h8m-9 4h10a2 2 0 002-2V8l-6-6H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-slate-600">{message}</p>
      {actionLabel && (actionTo || onAction) && (
        <button
          type="button"
          onClick={onAction || (() => actionTo && navigate(actionTo))}
          className="mt-6 rounded-lg bg-teal-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-teal-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
