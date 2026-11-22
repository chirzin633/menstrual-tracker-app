// src/components/Navbar.jsx

"use client";

import { Button } from "./ui/button";
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
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";

export default function Navbar() {
  const pathName = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/cycles", label: "Cycle Tracker", icon: Calendar },
    { href: "/mood-activity", label: "Mood & Activty", icon: Smile },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const isActive = (path) => pathName === path;

  const handleLogout = async () => {
    try {
      localStorage.removeItem("user");

      (window, (location.href = "/api/auth/logout"));
    } catch (error) {
      console.error("Log out error: ", error);
    }
  };

  return (
    <nav className="bg-[var(--secondary-background)] border-b-2 border-black shadow-[0_4px_0_0_#000]">
      <div className="mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Heart className="fill-[var(--main)] w-8 h-8 text-[var(--main)]" />
            <span className="font-bold text-xl text-[var(--foreground)]">
              Menstrual Tracker
            </span>
          </Link>

          {/* Navigation Links */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink
                      className={
                        isActive(item.href)
                          ? "bg-main text-main-foreground border-border"
                          : ""
                      }
                      render={<Link href={item.href} />}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </span>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Logout Button */}
          <Button onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline font-medium text-sm">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}
