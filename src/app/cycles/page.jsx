"use client";

import Card from "@/components/Card";
import LoadingSpinner from "@/components/LoadingSpinner";
import Navbar from "@/components/Navbar";
import { Calendar, Droplet, Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CyclesPage() {
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCycle, setEditingCycle] = useState(null);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    flowIntensity: 3,
    symptoms: "",
    notes: "",
  });

  useEffect(() => {
    fetchCycles();
  }, []);

  const fetchCycles = async () => {
    try {
      const response = await fetch("/api/cycles");
      const data = await response.json();
      setCycles(data.cycles || []);
    } catch (error) {
      console.error("Error fetching cyles: ", error);
      toast.error("Gagal mengambil data siklus");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.prevenetDefault();

    try {
      const url = editingCycle
        ? `/api/cycles/${editingCycle.id}`
        : "/api/cycles";
      const method = editingCycle ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          symptoms: formData.symptoms
            ? formData.symptoms.split(",").map((s) => s.trim())
            : [],
        }),
      });

      if (response.ok) {
        toast.success(
          editingCycle ? "Siklus berhasil diupdate" : "Siklus berhasil dicatat",
        );
        setShowModal(false);
        setEditingCycle(null);
        setFormData({
          startDate: "",
          endDate: "",
          flowIntensity: 3,
          symptoms: "",
          notes: "",
        });
        fetchCycles();
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menyimpan siklus");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan pada server");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah anda yakin ingin menghapus siklus ini?")) return;

    try {
      const response = await fetch(`/api/cycles/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Siklus berhasil dihapus");
        fetchCycles();
      } else {
        toast.error("Gagal menghapus siklus");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan pada server");
    }
  };

  const handleEdit = (cycle) => {
    setEditingCycle(cycle);
    setFormData({
      startDate: new Date(cycle.startDate).toISOString().split("T")[0],
      endDate: new Date(cycle.endDate).toISOString().split("T")[0],
      flowIntensity: cycle.flowIntensity || 3,
      symptoms: cycle.symptoms ? JSON.parse(cycle.symptoms).join(", ") : "",
      notes: cycle.notes || "",
    });
    setShowModal(true);
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
            <h1 className="font-bold text-gray-800 text-3xl">Cycle Tracker</h1>
            <p className="mt-1 text-gray-600">Track your menstrual cycles</p>
          </div>

          <button
            onClick={() => {
              setEditingCycle(null);
              setFormData({
                startDate: "",
                endDate: "",
                flowIntensity: 3,
                symptoms: "",
                notes: "",
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-linear-to-r from-pink-500 to-purple-500 hover:shadow-lg px-6 py-3 rounded-xl text-white transition-all"
          >
            <Plus className="w-5 h-5" /> Log New Cycle
          </button>
        </div>

        {/* Cycle List */}

        {cycles.length === 0 ? (
          <Card className="py-12 text-center">
            <Droplet className="mx-auto mb-4 w-16 h-16 text-gray-300" />
            <h3 className="font-semibold text-gray-600 text-xl">
              No cylces recorded yet
            </h3>
            <p className="mt-2 text-gray-500">
              Start tracking your first cycle!
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {cycles.map((cycle) => {
              const start = new Date(cycle.startDate);
              const end = new Date(cycle.endDate);
              const symptoms = cycle.symptoms ? JSON.parse(cycle.symptoms) : [];

              return (
                <Card key={cycle.id} className="hover:shadow-xl transition-all">
                  <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <Calendar className="w-6 h-6 text-pink-500" />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {start.toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}{" "}
                            -{" "}
                            {end.toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-gray-600 text-sm">
                              Duration : {cycle.periodLength || 0} days
                            </span>
                            {cycle.cycleLength && (
                              <span className="text-gray-600 text-sm">
                                • Cycle: {cycle.cycleLength} days
                              </span>
                            )}
                            <span>
                              • Flow: {"🩸".repeat(cycle.flowIntensity || 0)}
                            </span>
                          </div>
                          {symptoms.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {symptoms.map((symtom, index) => (
                                <span
                                  key={index}
                                  className="bg-pink-100 px-2 py-1 rounded-full text-pink-700 text-xs"
                                >
                                  {symptoms}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(cycle)}
                        className="hover:bg-blue-50 p-2 rounded-lg text-blue-500 transition-all"
                      >
                        <Edit className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDelete(cycle.id)}
                        className="hover:bg-red-50 p-2 rounded-lg text-red-500 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white shadow-2xl rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="mb-4 font-bold text-gray-800 text-2xl">
                  {editingCycle ? "Edit Cycle" : "Log New Cycle"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block mb-2 font-medium text-gray-700 text-sm">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                      className="px-4 py-2 border border-gray-300 focus:border-pink-500 rounded-lg outline-none focus:ring-2 focus:ring-pink-200 w-full"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700 text-sm">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      required
                      className="px-4 py-2 border border-gray-300 focus:border-pink-500 rounded-lg outline-none focus:ring-2 focus:ring-pink-200 w-full"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700 text-sm">
                      Flow Intensity (1-5)
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, flowIntensity: value })
                          }
                          className={`flex-1 py-2 rounded-lg transition-all ${formData.flowIntensity === value ? "bg-pink-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                        >
                          {"🩸".repeat(value)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700 text-sm">
                      Symptoms (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.symptoms}
                      onChange={(e) =>
                        setFormData({ ...formData, symptoms: e.target.value })
                      }
                      placeholder="cramps, headcache, fatigue"
                      className="px-4 py-2 border border-gray-300 focus:border-pink-500 rounded-lg outline-none focus:ring-2 focus:ring-pink-200 w-full"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-700 text-sm">
                      Notes
                    </label>

                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Any additional notes..."
                      rows={3}
                      className="px-4 py-2 border border-gray-300 focus:border-pink-500 rounded-lg outline-none focus:ring-2 focus:ring-pink-200 w-full resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingCycle(null);
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-gray-700 transition-all"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="flex-1 bg-linear-to-r from-pink-500 to-purple-500 hover:shadow-lg py-2 rounded-lg text-white transition-all"
                    >
                      {editingCycle ? "Update" : "Save"}
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
