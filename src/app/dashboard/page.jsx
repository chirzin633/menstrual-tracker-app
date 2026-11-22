// src/app/dashboard/page.jsx

"use client";

import Card from "@/components/Card";
import LoadingSpinner from "@/components/LoadingSpinner";
import Navbar from "@/components/Navbar";
import {
  Activity,
  Award,
  Calendar,
  Clock,
  Droplet,
  Smile,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import Link from "next/link";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    cycles: [],
    profile: null,
    nextPrediction: null,
    cycleDay: 0,
    badges: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const cyclesRes = await fetch("/api/cycles");
      const cyclesData = await cyclesRes.json();

      const profileRes = await fetch("/api/profile");
      const profileData = await profileRes.json();

      let nextPrediction = null;
      let cycleDay = 0;

      if (cyclesData.cycles && cyclesData.cycles.length > 0) {
        const latestCycle = cyclesData.cycles[0];
        const today = new Date();
        const startDate = new Date(latestCycle.startDate);
        const diffDays = Math.floor(
          (today - startDate) / (1000 * 60 * 60 * 24),
        );

        if (diffDays <= (latestCycle.periodLength || 5)) {
          cycleDay = diffDays + 1;
        } else {
          cycleDay = diffDays + 1;
        }

        if (latestCycle.predictedNextDate) {
          nextPrediction = new Date(latestCycle.predictedNextDate);
        }
      }

      const mockBadges = [
        { id: 1, name: "First Cycle", icon: "🩸" },
        { id: 2, name: "Consistent Tracker", icon: "🎯" },
      ];

      setDashboardData({
        cycles: cyclesData.cycles || [],
        profile: profileData.profile || null,
        nextPrediction,
        cycleDay,
        badges: mockBadges,
      });
    } catch (error) {
      console.error("Error fetching dashboard data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = [...dashboardData.cycles]
    .slice(0, 6)
    .reverse()
    .map((cycle, index) => ({
      label: `Siklus ${index + 1}`,
      panjangSiklus: cycle.cycleLength || 0,
      durasiHaid: cycle.periodLength || 0,
    }));

  const chartConfig = {
    panjangSiklus: {
      label: "Panjang Siklus (hari)",
      color: "var(--chart-1)",
    },
    durasiHaid: {
      label: "Durasi Haid (hari)",
      color: "var(--chart-2)",
    },
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="mx-auto px-4 py-8 max-w-7xl">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  const getCycleDayText = (day) => {
    if (day <= 5) return "Menstruation";
    if (day <= 13) return "Follicular Phase";
    if (day <= 16) return "Ovulation";
    return "Luteal Phase";
  };

  return (
    <>
      <Navbar />
      <div className="mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bold text-foreground text-3xl">
            Hello, {dashboardData.profile?.user?.name || "User"}!
          </h1>
          <p className="mt-1 text-gray-600">
            Here's your menstrual cycle overview
          </p>
        </div>

        {/* Stats Card */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="bg-linear-to-br from-pink-500 to-pink-400 text-white px-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="opacity-80 text-sm">Cycle Day</p>
                <p className="font-bold text-3xl">
                  Day {dashboardData.cycleDay}
                </p>
                <p className="opacity-90 mt-1 text-sm">
                  {getCycleDayText(dashboardData.cycleDay)}
                </p>
              </div>
              <Calendar className="opacity-80 w-12 h-12" />
            </div>
          </Card>

          <Card className="bg-linear-to-br from-purple-500 to-purple-400 text-white px-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="opacity-80 text-sm">Total Cycle</p>
                <p className="font-bold text-3xl">
                  {dashboardData.cycles.length}
                </p>
                <p className="opacity-90 mt-1 text-sm">Recorded</p>
              </div>
              <TrendingUp className="opacity-80 w-12 h-12" />
            </div>
          </Card>

          <Card className="bg-linear-to-br from-blue-500 to-blue-400 text-white px-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="opacity-80 text-sm">Next Period</p>
                <p className="font-bold text-lg">
                  {dashboardData.nextPrediction
                    ? dashboardData.nextPrediction.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                      })
                    : "Not Set"}
                </p>
                <p>Prediction</p>
              </div>
              <Clock className="opacity-80 w-12 h-12" />
            </div>
          </Card>

          <Card className="bg-linear-to-br from-green-500 to-green-400 text-white px-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="opacity-80 text-sm">Badges</p>
                <p className="font-bold text-3xl">
                  {dashboardData.badges.length}
                </p>
                <p className="opacity-90 mt-1 text-sm">Achievements</p>
              </div>
              <Award className="opacity-80 w-12 h-12" />
            </div>
          </Card>
        </div>

        {/* Chart section */}
        <Card className="mb-8 px-2">
          <h2 className="flex items-center gap-2 mb-4 font-heading text-xl">
            <TrendingUp className="w-5 h-5 text-main" />
            Riwayat Siklus
          </h2>

          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-75 w-full">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)", strokeWidth: 2 }}
                  tick={{ fill: "var(--foreground)" }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)", strokeWidth: 2 }}
                  tick={{ fill: "var(--foreground)" }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="panjangSiklus"
                  fill="var(--color-panjangSiklus)"
                  stroke="var(--border)"
                  strokeWidth={2}
                  radius={0}
                />
                <Bar
                  dataKey="durasiHaid"
                  fill="var(--color-durasiHaid)"
                  stroke="var(--border)"
                  strokeWidth={2}
                  radius={0}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-foreground">
              Belum ada data siklus untuk ditampilkan.
            </p>
          )}
        </Card>

        {/* Badges Section */}
        <Card className="mb-8 px-2">
          <h2 className="flex items-center gap-2 mb-4 font-heading text-xl">
            <Award className="w-5 h-5 text-heading" />
            Your Badges
          </h2>

          {dashboardData.badges.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {dashboardData.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 bg-main text-main-foreground border-2 border-border rounded-base px-4 py-2"
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <span className="font-medium text-sm">{badge.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-foreground">
              No badges yet. Start tracking to earn badges!
            </p>
          )}
        </Card>

        {/* Quick Action */}
        <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
          <Link href="/cycles">
            <Button className="flex w-full justify-center items-center gap-3 h-auto py-4">
              <Droplet className="w-6 h-6 text-pink-500" />
              <span>Log New Cycle</span>
            </Button>
          </Link>

          <Link href="/mood-activity">
            <Button className="flex w-full justify-center items-center gap-3 h-auto py-4">
              <Smile className="w-6 h-6 text-purple-500" />
              <span>Log Mood</span>
            </Button>
          </Link>

          <Link href="/mood-activity">
            <Button className="flex w-full justify-center items-center gap-3 h-auto py-4">
              <Activity className="w-6 h-6 text-blue-500" />
              <span>Log Activity</span>
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
