"use client";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/AuthProvider";
import AuthShell from "@/components/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useContext(UserContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);
  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const email = form.email.trim();
    if (!email || !form.password)
      return setError("Email and password are required.");
    try {
      setSubmitting(true);
      await login({ email, password: form.password });
      router.push("/");
    } catch (err) {
      setError(
        err?.userMessage ||
          err?.response?.data?.message ||
          err?.message ||
          "Login failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to book seats and manage your orders."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="field"
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          autoComplete="email"
          required
        />
        <div className="relative">
          <input
            className="field pr-16"
            type={showPass ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5b2be0]"
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>
        {error && (
          <p className="text-sm text-rose-600 bg-rose-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="btn btn-grad w-full h-12"
        >
          {submitting ? "Logging in..." : "Login"}
        </button>
        <p className="text-sm text-center text-neutral-600">
          New here?{" "}
          <Link
            href="/signup"
            className="font-bold text-[#5b2be0] hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
