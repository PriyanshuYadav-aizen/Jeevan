import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URLS } from "../utils/api";
import { useToast } from "../components/ToastProvider";

type SignUpResponse = {
  id?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  message?: string;
};

export default function AdminSignUp() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const nextErrors: Record<string, string> = {};

    // Validation
    if (!formData.username || !formData.email || !formData.password || !formData.phone) {
      if (!formData.username) nextErrors.username = "Username is required";
      if (!formData.email) nextErrors.email = "Email is required";
      if (!formData.password) nextErrors.password = "Password is required";
      if (!formData.phone) nextErrors.phone = "Phone is required";
    }

    if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters long";
    }

    if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_URLS.auth.register(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          role: "Admin", // Register as Admin
        }),
      });

      const data: SignUpResponse = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Registration failed");
      }

      setSuccess("Admin account created successfully! You can now log in.");
      showToast("Admin account created successfully", "success");
      setTimeout(() => {
        navigate("/admin/login");
      }, 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold leading-none text-gray-900">Admin Sign Up</h1>
          <p className="text-sm text-slate-500 mt-2">Create your admin account</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
              placeholder="Enter username"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            />
            {fieldErrors.username && <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="admin@example.com"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              placeholder="+91 1234567890"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            />
            {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Your address"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            />
            <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters</p>
            {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            />
            {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-600">{fieldErrors.confirmPassword}</p>}
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 text-sm text-emerald-800 bg-emerald-100 border border-emerald-200 rounded-lg px-3 py-2">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg border border-teal-600 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-300 text-white font-semibold px-3 py-3 transition-colors"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Creating Account...
            </span>
          ) : "Create Admin Account"}
        </button>

        <div className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <a
            href="/admin/login"
            onClick={(e) => {
              e.preventDefault();
              navigate("/admin/login");
            }}
            className="text-teal-600 hover:text-teal-700 font-semibold"
          >
            Sign in
          </a>
        </div>
      </form>
    </div>
  );
}

