// src/app/profile/page.jsx

"use client";

import Card from "@/components/Card";
import LoadingSpinner from "@/components/LoadingSpinner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  }, []);

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
            data.profile.pushNotification !== undefined
              ? data.profile.pushNotification
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
          <h1 className="font-bold text-foreground text-3xl">
            Profile Settings
          </h1>
          <p className="mt-1 text-foreground">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 px-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="flex justify-center items-center bg-main text-main-foreground w-20 h-20 font-bold text-3xl border-2 border-border rounded-full">
                {profile?.user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <h2 className="font-bold text-foreground0 text-2xl">
                  {profile?.user?.name}
                </h2>
                <p className="text-foreground">{profile?.user?.email}</p>
                {profile?.user?.birthDate && (
                  <p className="mt-1 text-foreground opacity-70 text-sm">
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
            <Button
              variant={isEditing ? "neutral" : "default"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </Card>

        {/* Stats Card */}
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mb-6">
          <Card className="px-2">
            <h3 className="font-semibold text-foreground text-lg">
              Cycle Statistics
            </h3>
            <div className="space-y-2 text-foreground">
              <div className="flex justify-between">
                <span>Average Cycle Length</span>
                <span className="font-bold text-main">
                  {profile?.averageCycleLength || 28} days
                </span>
              </div>
              <div className="flex justify-between">
                <span>Average Period Length</span>
                <span className="font-bold text-main">
                  {profile?.averagePeriodLength || 5} days
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Cycles</span>
                <span className="font-bold text-main">
                  {profile?.user?._count?.cycles || 0}
                </span>
              </div>
            </div>
          </Card>

          <Card className="px-2">
            <h3 className="text-lg font-semibold text-foreground">
              Preferences
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Email Notifications</span>
                <span
                  className={`px-3 py-1 rounded-base border-2 border-border font-bold text-sm ${
                    profile?.emailNotifications
                      ? "bg-main text-main-foreground"
                      : "bg-secondary-background text-foreground"
                  }`}
                >
                  {profile?.emailNotifications ? "On" : "Off"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Push Notifications</span>
                <span
                  className={`px-3 py-1 rounded-base border-2 border-border font-bold text-sm ${
                    profile?.pushNotification
                      ? "bg-main text-main-foreground"
                      : "bg-secondary-background text-foreground"
                  }`}
                >
                  {profile?.pushNotification ? "On" : "Off"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Edit Form */}
        {isEditing && (
          <Card className="px-2">
            <h3 className="mb-2 font-bold text-foreground text-xl">
              Edit Profile
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Birth Date</Label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) =>
                    setFormData({ ...formData, birthDate: e.target.value })
                  }
                />
              </div>

              <div className="gap-4 grid grid-cols-2">
                <div className="space-y-2">
                  <Label>Average Cycle Length (days)</Label>
                  <Input
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
                  />
                </div>

                <div className="space-y-2">
                  <Label>Average Period Length (days)</Label>
                  <Input
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notifications</Label>
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.emailNotifications}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          emailNotifications: checked,
                        })
                      }
                    />
                    <span className="text-foreground">Email Notifications</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.pushNotifications}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          pushNotifications: checked,
                        })
                      }
                    />
                    Push Notifications
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="neutral"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 cursor-pointer">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Account Actions */}
        <Card className="mt-6 px-2">
          <h3 className="mb-4 font-bold text-lg text-foreground">Account</h3>
          <div className="space-y-3">
            <Button
              className="flex justify-between items-center w-full h-auto py-3 cursor-pointer"
              variant="neutral"
            >
              <span className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-foreground" />
                Change Password
              </span>
              <span>→</span>
            </Button>
            <Button
              variant="neutral"
              className="flex justify-between items-center w-full h-auto py-3 cursor-pointer"
            >
              <span className="flex items-center gap-2 text-red-500">
                <User className="w-5 h-5" />
                Delete Account
              </span>
              <span className="text-red-500">→</span>
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
