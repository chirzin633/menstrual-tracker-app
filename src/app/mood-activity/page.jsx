// src/app/mood-activity/page.jsx

"use client";

import Card from "@/components/Card";
import LoadingSpinner from "@/components/LoadingSpinner";
import Navbar from "@/components/Navbar";
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
      // Fetch moods
      const moodsRes = await fetch("/api/moods");
      if (!moodsRes.ok) {
        throw new Error(`Moods API error: ${moodsRes.status}`);
      }
      const moodsData = await moodsRes.json();
      setMoods(moodsData.moods || []);

      // Fetch activities
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
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

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
            <h1 className="font-bold text-gray-800 text-3xl">
              Mood & Activity
            </h1>
            <p className="mt-1 text-gray-600">
              Track your mood and physical activities
            </p>
          </div>
          <button
            onClick={() => {
              setShowModal(true);
              setFormData({ ...formData, type: activeTab });
            }}
            className="flex items-center gap-2 bg-linear-to-br from-pink-500 to-purple-500 hover:shadow-lg px-6 py-3 rounded-xl text-white transition-all"
          >
            <Plus className="w-5 h-5" />
            Log {activeTab === "mood" ? "Mood" : "Activity"}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-white/80 shadow-lg mb-6 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("mood")}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${
              activeTab === "mood"
                ? "bg-linear-to-r from-pink-500 to-purple-500 text-white shadow-md"
                : "text-gray-600 hover:bg-pink-50"
            }`}
          >
            <Smile className="inline mr-2 w-5 h-5" />
            Mood
          </button>

          <button
            onClick={() => setActiveTab("activity")}
            className={`flex-1 py-3 rounded-lg font-medium transition-all ${activeTab === "activity" ? "bg-linear-to-r from-pink-500 to-purple-500 text-white shadow-md" : "text-gray-600 hover:bg-pink-50"}`}
          >
            <Activity className="inline mr-2 w-5 h-5" />
            Activity
          </button>
        </div>

        {/* Content */}
        {activeTab === "mood" ? (
          <div className="space-y-4">
            {moods.length === 0 ? (
              <Card className="py-12 text-center">
                <Smile className="mx-auto mb-4 w-16 h-16 text-gray-300" />
                <h3 className="font-semibold text-gray-600 text-xl">
                  No Mood Logs Yet
                </h3>
                <p className="mt-2 text-gray-500">Start tracking your mood!</p>
              </Card>
            ) : (
              moods.map((mood) => (
                <Card key={mood.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {moodEmojies[mood.mood] || "😐"}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-800 capitalize">
                            {mood.mood}
                          </p>
                          <p className="text-gray-500 text-sm">
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
                      <div className="flex gap-4 mt-2">
                        <span className="text-gray-600 text-sm">
                          Energy: {"⚡".repeat(mood.energyLevel || 0)}
                        </span>
                        <span className="text-gray-600 text-sm">
                          Stress: {"😰".repeat(mood.stressLevel || 0)}
                        </span>
                      </div>
                      {mood.notes && (
                        <p className="mt-2 text-gray-500 text-sm">
                          📝 {mood.notes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(mood.id, "mood")}
                      className="hover:bg-red-50 p-2 rounded-lg text-red-500 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.length === 0 ? (
              <Card className="py-12 text-center">
                <Activity className="mx-auto mb-4 w-16 h-16 text-gray-300" />
                <h3 className="font-semibold text-gray-600 text-xl">
                  No Activities Logged Yet
                </h3>
                <p className="mt-2 text-gray-500">
                  Start tracking your activities!
                </p>
              </Card>
            ) : (
              activities.map((activity) => (
                <Card key={activity.id}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div>
                        <p className="font-semibold text-gray-800 capitalize">
                          {activity.activityType}
                        </p>
                        <p className="text-gray-500 text-sm">
                          {new Date(activity.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex gap-4 mt-2">
                        <span className="text-gray-600 text-sm">
                          Duration: {activity.duration} minutes
                        </span>
                        <span className="text-gray-600 text-sm">
                          Intensity: {"💪".repeat(activity.intensity || 0)}
                        </span>
                      </div>
                      {activity.notes && (
                        <p className="mt-2 text-gray-500 text-sm">
                          📝 {activity.notes}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(activity.id, "activity")}
                      className="hover:bg-red-50 p-2 rounded-lg text-red-500 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="mb-4 font-bold text-gray-800 text-2xl">
                  Log {formData.type === "mood" ? "Mood" : "Activity"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formData.type === "mood" ? (
                    <>
                      <div>
                        <label className="block mb-2 font-medium text-gray-700 text-sm">
                          Mood
                        </label>
                        <select
                          value={formData.mood}
                          onChange={(e) =>
                            setFormData({ ...formData, mood: e.target.value })
                          }
                          className="px-4 py-2 border border-gray-300 focus:border-pink-500 rounded-lg outline-none focus:ring-2 focus:ring-pink-200 w-full"
                        >
                          {Object.keys(moodEmojies).map((key) => (
                            <option key={key} value={key}>
                              {moodEmojies[key]} {key}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block mb-2 font-medium text-gray-700 text-sm">
                          Energy Level (1-10)
                        </label>
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
                          className="w-full"
                        />
                        <div className="text-gray-600 text-sm text-center">
                          Level: {formData.energyLevel}
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 font-medium text-gray-700 text-sm">
                          Stress Level (1-10)
                        </label>
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
                          className="w-full"
                        />
                        <div className="text-gray-600 text-sm text-center">
                          Level: {formData.stressLevel}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block mb-2 font-medium text-gray-700 text-sm">
                          Activity Type
                        </label>
                        <select
                          value={formData.activityType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              activityType: e.target.value,
                            })
                          }
                          className="px-4 py-2 border border-gray-300 focus:border-pink-500 rounded-lg outline-none focus:ring-2 focus:ring-pink-200 w-full"
                        >
                          <option value="exercise">Exercise</option>
                          <option value="yoga">Yoga</option>
                          <option value="meditation">Meditation</option>
                          <option value="walking">Walking</option>
                          <option value="running">Running</option>
                          <option value="swimming">Swimming</option>
                          <option value="dancing">Dancing</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block mb-2 font-medium text-gray-700 text-sm">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          value={formData.duration}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              duration: e.target.value,
                            })
                          }
                          min="1"
                          className="px-4 py-2 border border-gray-300 focus:border-pink-500 rounded-lg outline-none focus:ring-2 focus:ring-pink-200 w-full"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 font-medium text-gray-700 text-sm">
                          Intensity (1-10)
                        </label>
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
                          className="w-full"
                        />
                        <div className="text-gray-600 text-sm text-center">
                          Level: {formData.intensity}
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block mb-2 font-medium text-gray-700 text-sm">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={3}
                      className="px-4 py-2 border border-gray-300 focus:border-pink-500 rounded-lg outline-none focus:ring-2 focus:ring-pink-200 w-full resize-none"
                      placeholder="Any notes..."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setFormData({ ...formData, type: activeTab });
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-gray-700 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-linear-to-r from-pink-500 to-purple-500 hover:shadow-lg py-2 rounded-lg text-white transition-all"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
