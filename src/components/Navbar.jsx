"use client";

import {
  Calendar,
  Heart,
  LayoutDashboard,
  LogOut,
  Smile,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathName = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/cycles", label: "Cycle Tracker", icon: Calendar },
    { href: "/mood-activity", label: "Mood & Activty", icon: Smile },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const isActive = (path) => pathName === path;

  return (
    <nav className="bg-white/80 shadow-lg backdrop-blur-md border-pink-100 border-b">
      <div className="mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Heart className="fill-pink-500 w-8 h-8 text-pink-500" />
            <span className="bg-clip-text bg-linear-to-r from-pink-500 to-purple-500 font-bold text-transparent text-xl">
              Menstrual Tracker
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive(item.href) ? "bg-pink-500 text-white shadow-md" : "text-gray-500 hover:bg-pink-50 hover:text-pink-500"}`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              window.location.href = "/login";
            }}
            className="flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-lg text-red-500 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline font-medium text-sm">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
