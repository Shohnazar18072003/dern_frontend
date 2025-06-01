"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import api from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import type { Appointment } from "@/types";
import { toast } from "sonner";

export function EditAppointment() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    startTime: "",
    duration: 60,
    notes: "",
    serviceType: "",
  });

  // Debug: Log form state changes
  useEffect(() => {
    console.log("Edit form data updated:", formData);
    console.log("Selected date:", selectedDate);
    console.log("Available slots:", availableSlots);
  }, [formData, selectedDate, availableSlots]);

  const fetchAppointment = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      console.log("Appointment response:", response.data);

      const appt = response.data.data?.appointment || response.data.appointment;
      setAppointment(appt);
      setSelectedDate(new Date(appt.startTime));
      setFormData({
        startTime: new Date(appt.startTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        duration: Math.round(
          (new Date(appt.endTime).getTime() -
            new Date(appt.startTime).getTime()) /
            (1000 * 60)
        ),
        notes: appt.notes || "",
        serviceType: appt.serviceType || "",
      });
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to fetch appointment";
      setError(message);
      toast.error("Error", {
        description: message,
        duration: 5000,
      });
      console.error("Fetch appointment error:", err);
    } finally {
      setLoading(false);
    }
  }, [appointmentId]);

  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedDate || !appointment?.technician?._id) {
      setAvailableSlots([]);
      return;
    }
    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      console.log("Fetching slots for edit:", {
        technicianId: appointment.technician._id,
        date: dateStr,
      });

      const response = await api.get(
        `/technicians/${appointment.technician._id}/availability?date=${dateStr}`
      );

      console.log("Edit availability response:", response.data);

      const slots =
        response.data.data?.availableSlots || response.data.slots || [];

      // Include current appointment time slot as available
      const currentTimeSlot = new Date(
        appointment.startTime
      ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      if (!slots.includes(currentTimeSlot)) {
        slots.push(currentTimeSlot);
        slots.sort();
      }

      setAvailableSlots(slots);
      setError("");
    } catch (error: any) {
      console.error("Failed to fetch available slots:", error);
      const message =
        error.response?.data?.message ||
        "Unable to fetch available time slots. Using default slots.";
      setError(message);
      toast.warning("Warning", {
        description: message,
        duration: 5000,
      });
      setAvailableSlots(["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]);
    }
  }, [selectedDate, appointment]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  useEffect(() => {
    if (selectedDate && appointment?.technician._id) {
      fetchAvailableSlots();
    }
  }, [selectedDate, appointment, fetchAvailableSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!selectedDate || !formData.startTime) {
        throw new Error("Please select a date and time.");
      }

      const updateData = {
        startTime: new Date(
          `${selectedDate.toISOString().split("T")[0]}T${
            formData.startTime
          }:00Z`
        ).toISOString(),
        endTime: new Date(
          new Date(
            `${selectedDate.toISOString().split("T")[0]}T${
              formData.startTime
            }:00Z`
          ).getTime() +
            formData.duration * 60000
        ).toISOString(),
        notes: formData.notes,
        serviceType: formData.serviceType,
      };

      console.log("Updating appointment with data:", updateData);
      const response = await api.put(
        `/appointments/${appointmentId}`,
        updateData
      );
      console.log("Update response:", response.data);

      toast.success("Success", {
        description: "Appointment updated successfully.",
        duration: 5000,
      });
      navigate("/app/appointments");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to update appointment";
      setError(message);
      toast.error("Error", {
        description: message,
        duration: 5000,
      });
      console.error("Update appointment error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    console.log(`Edit select change: ${name} = ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    console.log("Edit date selected:", date);
    setSelectedDate(date);
    setFormData((prev) => ({ ...prev, startTime: "" })); // Reset time when date changes
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    const isValid = !!(
      selectedDate &&
      formData.startTime &&
      formData.serviceType &&
      availableSlots.includes(formData.startTime)
    );

    console.log("Edit form validation:", {
      selectedDate: !!selectedDate,
      startTime: !!formData.startTime,
      serviceType: !!formData.serviceType,
      timeSlotAvailable: availableSlots.includes(formData.startTime),
      isValid,
    });

    return isValid;
  };

  if (loading || !appointment) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/app/appointments")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Appointments
        </Button>
        <h1 className="text-3xl font-bold">Edit Appointment</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>
            Update your appointment with {appointment.technician.username}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Select Date *</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                  date.getDay() === 0 ||
                  date.getDay() === 6
                }
                className="rounded-md border"
              />
            </div>

            {selectedDate && (
              <div className="space-y-2">
                <Label htmlFor="startTime">Select Time *</Label>
                <Select
                  name="startTime"
                  value={formData.startTime}
                  onValueChange={(value) =>
                    handleSelectChange("startTime", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" disabled>
                      Choose a time slot
                    </SelectItem>
                    {availableSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableSlots.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No available time slots for this date
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Select
                name="duration"
                value={formData.duration.toString()}
                onValueChange={(value) => handleSelectChange("duration", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType">Service Type *</Label>
              <Select
                name="serviceType"
                value={formData.serviceType}
                onValueChange={(value) =>
                  handleSelectChange("serviceType", value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" disabled>
                    Select service type
                  </SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="installation">Installation</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="troubleshooting">
                    Troubleshooting
                  </SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Describe what you need help with..."
                value={formData.notes}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={loading || !isFormValid()}
                className="flex-1"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/app/appointments")}
              >
                Cancel
              </Button>
            </div>

            {/* Debug info - remove in production */}
            {/* <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Debug Info</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <p>Form Valid: {isFormValid() ? "✅" : "❌"}</p>
                <p>Selected Date: {selectedDate ? "✅" : "❌"}</p>
                <p>Start Time: {formData.startTime || "❌"}</p>
                <p>Service Type: {formData.serviceType || "❌"}</p>
                <p>Available Slots: {availableSlots.length}</p>
                <p>
                  Time Slot Valid:{" "}
                  {availableSlots.includes(formData.startTime) ? "✅" : "❌"}
                </p>
              </CardContent>
            </Card> */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
