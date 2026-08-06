"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Login berhasil!");
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Login gagal");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center bg-linear-to-br from-pink-100 via-purple-100 to-pink-100 p-4 min-h-screen">
      <div className="bg-white/90 shadow-2xl backdrop-blur-md p-8 border border-pink-200 rounded-3xl w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Heart className="fill-pink-500 w-16 h-16 text-pink-500" />
          </div>
          <h1 className="bg-clip-text bg-linear-to-r from-pink-500 to-purple-500 font-bold text-transparent text-3xl">
            Welcome Back!
          </h1>
          <p className="mt-2 text-gray-600">
            Login to track your menstrual tracker
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block mb-2 font-medium text-gray-700 text-sm"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="px-4 py-3 border border-gray-300 focus:border-pink-500 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 w-full transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 font-medium text-gray-700 text-sm"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="px-4 py-3 border border-gray-300 focus:border-pink-500 rounded-xl outline-none focus:ring-2 focus:ring-purple-200 w-full transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-linear-to-r from-pink-500 to-purple-500 hover:shadow-lg hover:scale-[1.02]"}`}
          >
            {loading ? "Loading..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-gray-600 text-center">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-pink-500 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
