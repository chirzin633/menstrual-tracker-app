// src/app/cycles/page.jsx

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
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Calendar, Droplet, Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function CyclesPage() {
  const [loading, setLoading] = useState(true);
  const [cycles, setCycles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCycle, setEditingCycle] = useState(null);
  const [dateRange, setDateRange] = useState(undefined);
  const [formData, setFormData] = useState({
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
    e.preventDefault();
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Pilih tanggal mulai dan selesai");
      return;
    }

    try {
      const url = editingCycle
        ? `/api/cycles/${editingCycle.id}`
        : "/api/cycles";
      const method = editingCycle ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: format(dateRange.from, "yyyy-MM-dd"),
          endDate: format(dateRange.to, "yyyy-MM-dd"),
          flowIntensity: formData.flowIntensity,
          symptoms: formData.symptoms
            ? formData.symptoms.split(",").map((s) => s.trim())
            : [],
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        toast.success(
          editingCycle ? "Siklus berhasil diupdate" : "Siklus berhasil dicatat",
        );
        setShowModal(false);
        setEditingCycle(null);
        setFormData({
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
    setDateRange({
      from: new Date(cycle.startDate),
      to: new Date(cycle.endDate),
    });
    setFormData({
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
            <h1 className="font-bold text-foreground text-3xl">
              Cycle Tracker
            </h1>
            <p className="mt-1 text-foreground">Track your menstrual cycles</p>
          </div>

          <Button
            onClick={() => {
              setEditingCycle(null);
              setDateRange(undefined);
              setFormData({
                flowIntensity: 3,
                symptoms: "",
                notes: "",
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Log New Cycle
          </Button>
        </div>

        {/* Cycle List */}

        {cycles.length === 0 ? (
          <Card className="py-12 text-center">
            <Droplet className="mx-auto mb-4 w-16 h-16 text-muted-foreground" />
            <h3 className="font-heading text-foreground text-xl">
              No cylces recorded yet
            </h3>
            <p className="mt-2 text-foreground">
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
                <Card key={cycle.id} className="px-2">
                  <div className="flex md:flex-row flex-col md:justify-between md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <Calendar className="w-6 h-6 text-main" />
                        <div>
                          <p className="font-semibold text-foreground">
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
                          <div className="flex flex-wrap gap-2 mt-1 text-sm text-foreground">
                            <span>
                              Duration : {cycle.periodLength || 0} days
                            </span>
                            {cycle.cycleLength && (
                              <span>• Cycle: {cycle.cycleLength} days</span>
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
                                  className="bg-main text-main-foreground border-2 border-border rounded-base px-2 py-1 text-xs font-bold"
                                >
                                  {symtom}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="neutral"
                        onClick={() => handleEdit(cycle)}
                      >
                        <Edit className="w-5 h-5" />
                      </Button>

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
                            <AlertDialogTitle>Hapus Siklus?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus siklus ini?
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(cycle.id)}
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modal */}

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCycle ? "Edit Cycle" : "Log New Cycle"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tanggal Siklus</Label>

                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      />
                    }
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange?.to ? (
                        <>
                          {format(dateRange.from, "d MMM yyyy")} -{" "}
                          {format(dateRange.to, "d MMM yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "d MMM yyyy")
                      )
                    ) : (
                      "Pilih rentang tanggal"
                    )}
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0">
                    <CalendarUI
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={1}
                      defaultMonth={dateRange?.from}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Flow Intensity (1-5)</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, flowIntensity: value })
                      }
                      className={`flex-1 py-2 rounded-lg transition-all ${formData.flowIntensity === value ? "bg-main text-main-foreground shadow-[2px_2px_0_0_#000]" : "bg-secondary-background text-foreground hover:bg-main/20"}`}
                    >
                      {"🩸".repeat(value)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Symptoms (comma separated)</Label>
                <Input
                  type="text"
                  value={formData.symptoms}
                  onChange={(e) =>
                    setFormData({ ...formData, symptoms: e.target.value })
                  }
                  placeholder="cramps, headcache, fatigue"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes</Label>

                <Textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Any additional notes..."
                  rows={3}
                />
              </div>

              <DialogFooter className="flex gap-2 pt-2">
                <Button
                  variant="neutral"
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </Button>
                <Button type="submit">
                  {editingCycle ? "Update" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
