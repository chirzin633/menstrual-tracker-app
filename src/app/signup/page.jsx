"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password tidak cocok");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...signupData } = formData;
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Akun berhasil dibuat! Silahkan login");
        router.push("/login");
      } else {
        toast.error(data.error || "Sign Up Gagal");
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
            Create Account
          </h1>
          <p className="mt-2 text-gray-600">
            Start tracking your menstrual cycle
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block mb-2 font-medium text-gray-700 text-sm"
            >
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your Name"
              className="px-4 py-3 border border-gray-300 focus:border-pink-500 rounded-xl outline-none focus:ring-2 focus:ring-pink-200 w-full transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block mb-2 font-medium text-gray-700 text-sm"
            >
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="px-4 py-3 border border-gray-300 focus:border-pink-500 rounded-xl outline-none focus:ring-2 focus:ring-pink-200 w-full transition-all"
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
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Min 6 characters"
              className="px-4 py-3 border border-gray-300 focus:border-pink-500 rounded-xl outline-none focus:ring-2 focus:ring-pink-200 w-full transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block mb-2 font-medium text-gray-700 text-sm"
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              className="px-4 py-3 border border-gray-300 focus:border-pink-500 rounded-xl outline-none focus:ring-2 focus:ring-pink-200 w-full transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-linear-to-r from-pink-500 to-purple-500 hover:shadow-lg hover:scale-[1.02]"}`}
          >
            {loading ? "Loading..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-gray-600 text-center">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-pink-500 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
