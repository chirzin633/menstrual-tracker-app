// src/app/signup/page.jsx

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="flex justify-center items-center bg-[var(--background)] p-4 min-h-screen">
      <div className="bg-[var(--secondary-background)] border-2 border-black rounded-[5px] shadow-[4px_4px_0_0_#000] p-8 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Heart className="fill-[var(--main)] w-16 h-16 text-[var(--main)]" />
          </div>
          <h1 className="font-bold text-3xl text-[var(--foreground)]">
            Create Account
          </h1>
          <p className="mt-2 text-[var(--foreground)]">
            Start tracking your menstrual cycle
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your Name"
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <Label
              htmlFor="confirmPassword"
              className="block mb-2 font-medium text-gray-700 text-sm"
            >
              Confirm Password
            </Label>
            <Input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Loading..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-[var(--foreground)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold underline decoration-2 underline-offset-2 hover:text-[var(--main)]"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
