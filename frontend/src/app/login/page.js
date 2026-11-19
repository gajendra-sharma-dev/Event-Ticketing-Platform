"use client";
import { UserContext } from "@/context/AuthProvider";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full px-4 py-3 rounded-lg bg-stone-100 border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500";

export default function LoginPage() {
  const router = useRouter();
  const [showSignup, setShowSignup] = useState(false);
  const { user, login, loading, register, logout } = useContext(UserContext);

  // form data
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // ui state
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");

  // LOGOUT
  const handleLogout = async () => {
    try {
      setSubmitting(true);
      await logout();
    } finally {
      setSubmitting(false);
    }
  };

  // generic input change handlers
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData((prev) => ({ ...prev, [name]: value }));
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    const email = loginData.email.trim();
    const password = loginData.password;

    if (!email || !password) {
      setLoginError("Email and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      setRedirecting(true); // hide "already logged in" card during redirect
      await login({ email, password });
      setLoginData({ email: "", password: "" });
      router.push("/");
    } catch (err) {
      setRedirecting(false);
      setLoginError(
        err?.response?.data?.message || err?.message || "Login failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
    setSignupError("");

    const name = signupData.name.trim();
    const email = signupData.email.trim();
    const password = signupData.password;

    if (!name || !email || !password) {
      setSignupError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setSignupError("Password must be at least 6 characters.");
      return;
    }

    try {
      setSubmitting(true);
      setRedirecting(true);
      await register({ username: name, email, password });
      setSignupData({ name: "", email: "", password: "" });
      setShowSignup(false);
      router.push("/");
    } catch (err) {
      setRedirecting(false);
      setSignupError(
        err?.response?.data?.message || err?.message || "Signup failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const closeSignup = () => {
    setShowSignup(false);
    setSignupError("");
  };

  // wait until user check finishes
  if (loading || redirecting) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <p className="text-stone-500">
          {redirecting ? "Redirecting..." : "Loading..."}
        </p>
      </main>
    );
  }

  // ALREADY LOGGED IN -> show Logout instead of login form
  if (user) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-4 text-center">
          <h1 className="text-2xl font-bold text-stone-900">
            Hi, {user.username || user.name || "User"}!
          </h1>
          <p className="text-sm text-stone-600">You are already logged in.</p>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full py-3 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-900 font-semibold transition"
          >
            Go to Home
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={submitting}
            className="w-full py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Logging out..." : "Logout"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      {/* LOGIN CARD */}
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-4"
      >
        <h1 className="text-2xl font-bold text-stone-900">Login now!</h1>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={loginData.email}
          onChange={handleLoginChange}
          autoComplete="email"
          required
          className={inputClass}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={loginData.password}
          onChange={handleLoginChange}
          autoComplete="current-password"
          required
          className={inputClass}
        />

        {loginError && <p className="text-sm text-red-600">{loginError}</p>}

        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-center text-stone-600">
          New user?{" "}
          <button
            type="button"
            onClick={() => setShowSignup(true)}
            className="text-red-500 font-semibold hover:underline"
          >
            Sign up
          </button>
        </p>
      </form>

      {/* SIGNUP MODAL */}
      {showSignup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closeSignup}
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleRegister}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8 space-y-4"
          >
            <button
              type="button"
              onClick={closeSignup}
              className="absolute top-3 right-4 text-2xl text-stone-400 hover:text-stone-700"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-stone-900">
              Create account
            </h2>

            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={signupData.name}
              onChange={handleSignupChange}
              autoComplete="name"
              required
              className={inputClass}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={signupData.email}
              onChange={handleSignupChange}
              autoComplete="email"
              required
              className={inputClass}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={signupData.password}
              onChange={handleSignupChange}
              autoComplete="new-password"
              required
              className={inputClass}
            />

            {signupError && (
              <p className="text-sm text-red-600">{signupError}</p>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating account..." : "Sign up"}
            </button>

            <p className="text-sm text-center text-stone-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={closeSignup}
                className="text-red-500 font-semibold hover:underline"
              >
                Login
              </button>
            </p>
          </form>
        </div>
      )}
    </main>
  );
}
