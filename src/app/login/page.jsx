// src/app/login/page.jsx

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        router.refresh();
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
    <div className="flex justify-center items-center bg-[var(--background)] p-4 min-h-screen">
      <div className="bg-[var(--secondary-background)] border-2 border-black rounded-[5px] shadow-[4px_4px_0_0_#000] p-8 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Heart className="fill-[var(--main)] w-16 h-16 text-[var(--main)]" />
          </div>
          <h1 className="font-bold text-3xl text-[var(--foreground)]">
            Welcome Back!
          </h1>
          <p className="mt-2 text-[var(--foreground)]0">
            Login to track your menstrual tracker
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Loading..." : "Login"}
          </Button>
        </form>

        <p className="mt-6 text-[var(--foreground)] text-center">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-bold underline decoration-2 underline-offset-2 hover:text-[var(--main)]"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
