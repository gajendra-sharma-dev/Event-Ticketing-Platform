"use client";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/UserProvider";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading, register } = useContext(UserContext);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // already logged in -> go home
  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const username = form.username.trim();
    const email = form.email.trim();
    const { password } = form;

    if (!username || !email || !password)
      return setError("All fields are required.");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return setError("Enter a valid email address.");
    if (password.length < 6)
      return setError("Password must be at least 6 characters.");

    try {
      setSubmitting(true);
      await register({ username, email, password });
      router.push("/");
    } catch (err) {
      setError(
        err?.userMessage ||
          err?.response?.data?.message ||
          err?.message ||
          "Signup failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] grid place-items-center p-6">
      <form onSubmit={onSubmit} className="glass w-full max-w-sm p-8 space-y-4">
        <div>
          <h1 className="text-3xl font-black">Create account</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Sign up to book seats and manage your events.
          </p>
        </div>

        <input
          className="field"
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={onChange}
          autoComplete="username"
          required
        />

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
            placeholder="Password (min 6 characters)"
            value={form.password}
            onChange={onChange}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPass((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#5b2be0]"
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="btn btn-grad w-full h-12"
        >
          {submitting ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-sm text-center text-neutral-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-[#5b2be0] hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
