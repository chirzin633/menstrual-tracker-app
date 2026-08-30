// src/app/profile/page.jsx

"use client";

import Card from "@/components/Card";
import LoadingSpinner from "@/components/LoadingSpinner";
import Navbar from "@/components/Navbar";
import { Calendar, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    birthDate: "",
    averageCycleLength: 28,
    averagePeriodLength: 5,
    emailNotifications: true,
    pushNotifications: true,
  });

  useEffect(() => {
    fetchProfile();
  });

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();

      if (data.profile) {
        setProfile(data.profile);
        setFormData({
          name: data.profile.user?.name || "",
          email: data.profile.user?.email || "",
          birthDate: data.profile.user?.birthDate
            ? new Date(data.profile.user.birthDate).toISOString().split("T")[0]
            : "",
          averageCycleLength: data.profile.averageCycleLength || 28,
          averagePeriodLength: data.profile.averagePeriodLength || 5,
          emailNotifications:
            data.profile.emailNotifications !== undefined
              ? data.profile.emailNotifications
              : true,
          pushNotifications:
            data.profile.pushNotifications !== undefined
              ? data.profile.pushNotifications
              : true,
        });
      }
    } catch (error) {
      console.error("Error fetching profile: ", error);
      toast.error("Gagal mengambil data profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          birthDate: formData.birthDate || null,
          averageCycleLength: parseInt(formData.averageCycleLength),
          averagePeriodLength: parseInt(formData.averagePeriodLength),
          emailNotifications: formData.emailNotifications,
          pushNotifications: formData.pushNotifications,
        }),
      });

      if (response.ok) {
        toast.success("Profil berhasil diupdate!");
        setIsEditing(false);
        fetchProfile();
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal update profil");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan pada server");
    }
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

  return (
    <>
      <Navbar />
      <div className="mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-bold text-gray-800 text-3xl">Profile Settings</h1>
          <p className="mt-1 text-gray-600">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="flex justify-center items-center bg-linear-to-r from-pink-500 to-purple-500 rounded-full w-20 h-20 font-bold text-white text-3xl">
                {profile?.user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h2 className="font-semibold text-gray-800 text-2xl">
                  {profile?.user?.name}
                </h2>
                <p className="text-gray-600">{profile?.user?.email}</p>
                {profile?.user?.birthDate && (
                  <p className="mt-1 text-gray-500 text-sm">
                    <Calendar className="inline mr-1 w-4 h-4" />
                    Born:{" "}
                    {new Date(profile.user.birthDate).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-linear-to-r from-pink-500 to-purple-500 hover:shadow-lg px-4 py-2 rounded-lg text-white transition-all"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </Card>

        {/* Stats Card */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mb-6">
          <Card>
            <h3 className="mb-2 font-semibold text-gray-700">
              Cycle Statistics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Average Cycle Length</span>
                <span className="font-semibold text-pink-500">
                  {profile?.averageCycleLength || 28} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Period Length</span>
                <span className="font-semibold text-pink-500">
                  {profile?.averagePeriodLength || 5} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Cycles</span>
                <span className="font-semibold text-pink-500">
                  {profile?.user?.cycles?.length || 0}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="mb-2 font-semibold text-gray-700">Preferences</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email Notifications</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    profile?.emailNotifications
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {profile?.emailNotifications ? "On" : "Off"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Push Notifications</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    profile?.pushNotifications
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {profile?.pushNotifications ? "On" : "Off"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <Card>
            <h3 className="mb-4 font-semibold text-gray-800 text-xl">
              Edit Profile
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 font-medium text-gray-700 text-sm">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 focus:border-pink-500 rounded-lg outline-none focus:ring-2 focus:ring-pink-200 w-full"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700 text-sm">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) =>
                    setFormData({ ...formData, birthDate: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 focus:border-pink-500 rounded-lg outline-none focus:ring-2 focus:ring-pink-200 w-full"
                />
              </div>

              <div className="gap-4 grid grid-cols-2">
                <div>
                  <label className="block mb-2 font-medium text-gray-700 text-sm">
                    Average Cycle Length (days)
                  </label>
                  <input
                    type="number"
                    value={formData.averageCycleLength}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        averageCycleLength: e.target.value,
                      })
                    }
                    min="20"
                    max="40"
                    className="px-4 py-2 border border-gray-300 focus:border-pink-500 rounded-lg outline-none focus:ring-2 focus:ring-pink-200 w-full"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium text-gray-700 text-sm">
                    Average Period Length (days)
                  </label>
                  <input
                    type="number"
                    value={formData.averagePeriodLength}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        averagePeriodLength: e.target.value,
                      })
                    }
                    min="3"
                    max="10"
                    className="px-4 py-2 border border-gray-300 focus:border-pink-500 rounded-lg outline-none focus:ring-2 focus:ring-pink-200 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700 text-sm">
                  Notifications
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.emailNotifications}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          emailNotifications: e.target.checked,
                        })
                      }
                      className="rounded focus:ring-pink-500 w-4 h-4 text-pink-500"
                    />
                    Email Notifications
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.pushNotifications}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pushNotifications: e.target.checked,
                        })
                      }
                      className="rounded focus:ring-pink-500 w-4 h-4 text-pink-500"
                    />
                    Push Notifications
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-linear-to-r from-pink-500 to-purple-500 hover:shadow-lg py-2 rounded-lg text-white transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </Card>
        )}

        {/* Account Actions */}
        <Card className="mt-6">
          <h3 className="mb-4 font-semibold text-gray-700">Account</h3>
          <div className="space-y-3">
            <button className="flex justify-between items-center bg-gray-50 hover:bg-gray-100 p-3 rounded-lg w-full transition-all">
              <span className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-600" />
                Change Password
              </span>
              <span className="text-gray-400">→</span>
            </button>
            <button className="flex justify-between items-center bg-red-50 hover:bg-red-100 p-3 rounded-lg w-full transition-all">
              <span className="flex items-center gap-2 text-red-600">
                <User className="w-5 h-5" />
                Delete Account
              </span>
              <span className="text-red-400">→</span>
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}
