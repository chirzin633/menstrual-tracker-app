// src/app/mood-activity/page.jsx

"use client";

import Card from "@/components/Card";
import LoadingSpinner from "@/components/LoadingSpinner";
import Navbar from "@/components/Navbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Activity, Plus, Smile, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MoodActivityPage() {
  const [loading, setLoading] = useState(true);
  const [moods, setMoods] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState("mood");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: "mood",
    mood: "happy",
    energyLevel: 5,
    stressLevel: 5,
    activityType: "exercise",
    duration: 30,
    intensity: 5,
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const moodsRes = await fetch("/api/moods");
      if (!moodsRes.ok) {
        throw new Error(`Moods API error: ${moodsRes.status}`);
      }
      const moodsData = await moodsRes.json();
      setMoods(moodsData.moods || []);

      const activitiesRes = await fetch("/api/activities");
      if (!activitiesRes.ok) {
        throw new Error(`Activities API error: ${activitiesRes.status}`);
      }
      const activitiesData = await activitiesRes.json();
      setActivities(activitiesData.activities || []);
    } catch (error) {
      console.error("Error fetching data: ", error);
      toast.error("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint =
        formData.type === "mood" ? "/api/moods" : "/api/activities";
      const payload =
        formData.type === "mood"
          ? {
              mood: formData.mood,
              energyLevel: parseInt(formData.energyLevel),
              stressLevel: parseInt(formData.stressLevel),
              notes: formData.notes,
            }
          : {
              activityType: formData.activityType,
              duration: parseInt(formData.duration),
              intensity: parseInt(formData.intensity),
              notes: formData.notes,
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(
          `${formData.type === "mood" ? "Mood" : "Activity"} berhasil dicatat`,
        );
        setShowModal(false);
        setFormData({
          type: "mood",
          mood: "happy",
          energyLevel: 5,
          stressLevel: 5,
          activityType: "exercise",
          duration: 30,
          intensity: 5,
          notes: "",
        });
        fetchData();
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menyimpan");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan pada server");
    }
  };

  const handleDelete = async (id, type) => {
    try {
      const endpoint =
        type === "mood" ? `/api/moods/${id}` : `/api/activities/${id}`;
      const response = await fetch(endpoint, { method: "DELETE" });

      if (response.ok) {
        toast.success("Data berhasil dihapus");
        fetchData();
      } else {
        toast.error("Gagal menghapus data");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan pada server");
    }
  };

  const moodEmojies = {
    happy: "😊",
    sad: "😢",
    anxious: "😰",
    tired: "😴",
    energetic: "⚡",
    calm: "😌",
    irritable: "😤",
    neutral: "😐",
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
      <div className="mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-heading text-3xl text-foreground">
              Mood & Activity
            </h1>
            <p className="mt-1 text-foreground">
              Track your mood and physical activities
            </p>
          </div>
          <Button
            onClick={() => {
              setShowModal(true);
              setFormData({ ...formData, type: activeTab });
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Log {activeTab === "mood" ? "Mood" : "Activity"}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="mood" className="flex items-center gap-2">
              <Smile className="w-5 h-5" />
              Mood
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Mood Content */}
          <TabsContent value="mood">
            <div className="space-y-4">
              {moods.length === 0 ? (
                <Card className="py-12 text-center px-2">
                  <Smile className="mx-auto mb-4 w-16 h-16 text-muted-foreground" />
                  <h3 className="font-heading text-xl text-foreground">
                    No Mood Logs Yet
                  </h3>
                  <p className="mt-2 text-foreground">
                    Start tracking your mood!
                  </p>
                </Card>
              ) : (
                moods.map((mood) => (
                  <Card key={mood.id} className="px-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">
                            {moodEmojies[mood.mood] || "😐"}
                          </span>
                          <div>
                            <p className="font-bold text-foreground capitalize">
                              {mood.mood}
                            </p>
                            <p className="text-sm text-foreground opacity-70">
                              {new Date(mood.date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-4 mt-2 text-sm text-foreground">
                          <span>
                            Energy: {"⚡".repeat(mood.energyLevel || 0)}
                          </span>
                          <span>
                            Stress: {"😰".repeat(mood.stressLevel || 0)}
                          </span>
                        </div>
                        {mood.notes && (
                          <p className="mt-2 text-sm text-foreground opacity-80">
                            📝 {mood.notes}
                          </p>
                        )}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button variant="neutral" size="icon">
                              <Trash2 className="w-5 h-5 text-red-500" />
                            </Button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Mood?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus data mood ini?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(mood.id, "mood")}
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Activity Content */}
          <TabsContent value="activity">
            <div className="space-y-4 ">
              {activities.length === 0 ? (
                <Card className="py-12 text-center px-2">
                  <Activity className="mx-auto mb-4 w-16 h-16 text-muted-foreground" />
                  <h3 className="font-heading text-xl text-foreground">
                    No Activities Logged Yet
                  </h3>
                  <p className="mt-2 text-foreground">
                    Start tracking your activities!
                  </p>
                </Card>
              ) : (
                activities.map((activity) => (
                  <Card key={activity.id} className="px-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-foreground capitalize">
                          {activity.activityType}
                        </p>
                        <p className="text-sm text-foreground opacity-70">
                          {new Date(activity.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-foreground">
                          <span>Duration: {activity.duration} minutes</span>
                          <span>
                            Intensity: {"💪".repeat(activity.intensity || 0)}
                          </span>
                        </div>
                        {activity.notes && (
                          <p className="mt-2 text-sm text-foreground opacity-80">
                            📝 {activity.notes}
                          </p>
                        )}
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button variant="neutral" size="icon">
                              <Trash2 className="w-5 h-5 text-red-500" />
                            </Button>
                          }
                        />
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Activity?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus data aktivitas
                              ini?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDelete(activity.id, "activity")
                              }
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Log {formData.type === "mood" ? "Mood" : "Activity"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formData.type === "mood" ? (
                <>
                  <div className="space-y-2">
                    <Label>Mood</Label>
                    <Select
                      value={formData.mood}
                      onValueChange={(value) =>
                        setFormData({ ...formData, mood: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(moodEmojies).map((key) => (
                          <SelectItem key={key} value={key}>
                            {moodEmojies[key]} {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Energy Level (1-10)</Label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.energyLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          energyLevel: e.target.value,
                        })
                      }
                      className="w-full accent-main"
                    />
                    <div className="text-sm text-center text-foreground">
                      Level: {formData.energyLevel}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Stress Level (1-10)</Label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.stressLevel}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stressLevel: e.target.value,
                        })
                      }
                      className="w-full accent-main"
                    />
                    <div className="text-sm text-center text-foreground">
                      Level: {formData.stressLevel}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Activity Type</Label>
                    <Select
                      value={formData.activityType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, activityType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exercise">Exercise</SelectItem>
                        <SelectItem value="yoga">Yoga</SelectItem>
                        <SelectItem value="meditation">Meditation</SelectItem>
                        <SelectItem value="walking">Walking</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="swimming">Swimming</SelectItem>
                        <SelectItem value="dancing">Dancing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration: e.target.value,
                        })
                      }
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Intensity (1-10)</Label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={formData.intensity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          intensity: e.target.value,
                        })
                      }
                      className="w-full accent-main"
                    />
                    <div className="text-sm text-center text-foreground">
                      Level: {formData.intensity}
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  placeholder="Any notes..."
                />
              </div>

              <DialogFooter className="flex gap-3 pt-2">
                <DialogClose
                  render={
                    <Button
                      variant="neutral"
                      onClick={() =>
                        setFormData({ ...formData, type: activeTab })
                      }
                    />
                  }
                >
                  Cancel
                </DialogClose>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
