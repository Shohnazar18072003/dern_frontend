"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectGroup,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Technician } from "@/types";
import api from "@/lib/api";
import { ArrowLeft, CalendarIcon, Clock, User } from "lucide-react";

export function CreateAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const technicianId = searchParams.get("technician");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechnician, setSelectedTechnician] =
    useState<Technician | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    technicianId: technicianId || "",
    date: "",
    time: "",
    duration: 60,
    notes: "",
    serviceType: "",
  });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  useEffect(() => {
    if (technicianId) {
      const technician = technicians.find((t) => t.id === technicianId);
      if (technician) {
        setSelectedTechnician(technician);
        setFormData((prev) => ({ ...prev, technicianId }));
      }
    }
  }, [technicianId, technicians]);

  const fetchAvailableSlots = React.useCallback(async () => {
    try {
      const dateStr = selectedDate?.toISOString().split("T")[0];
      const response = await api.get(
        `/technicians/${selectedTechnician?.id}/availability?date=${dateStr}`
      );
      setAvailableSlots(response.data.slots || []);
    } catch (error) {
      console.error("Failed to fetch available slots:", error);
      // Mock available slots for demo
      setAvailableSlots(["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]);
    }
  }, [selectedDate, selectedTechnician]);

  useEffect(() => {
    if (selectedDate && selectedTechnician) {
      fetchAvailableSlots();
    }
  }, [fetchAvailableSlots, selectedDate, selectedTechnician]);

  const fetchTechnicians = async () => {
    try {
      const response = await api.get("/technicians?availability=available");
      setTechnicians(response.data.technicians || []);
    } catch (error) {
      console.error("Failed to fetch technicians:", error);
      // Mock data for demo
      setTechnicians([
        {
          id: "1",
          _id: "1",
          username: "Mike Johnson",
          email: "mike@example.com",
          role: "technician",
          accountType: "individual",
          phone: "+1234567891",
          address: "456 Tech Ave",
          isActive: true,
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
          specialization: ["Hardware", "Software"],
          experience: 5,
          hourlyRate: 75,
          availability: "available",
          rating: 4.8,
          totalReviews: 124,
          certifications: ["CompTIA A+", "Microsoft Certified"],
        },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const appointmentData = {
        technicianId: formData.technicianId,
        startTime: new Date(
          `${formData.date}T${formData.time}:00`
        ).toISOString(),
        endTime: new Date(
          new Date(`${formData.date}T${formData.time}:00`).getTime() +
            formData.duration * 60000
        ).toISOString(),
        notes: formData.notes,
        serviceType: formData.serviceType,
      };

      await api.post("/appointments", appointmentData);
      navigate("/app/appointments");
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTechnicianSelect = (technicianId: string) => {
    const technician = technicians.find((t) => t.id === technicianId);
    setSelectedTechnician(technician || null);
    setFormData((prev) => ({ ...prev, technicianId }));
    setSelectedDate(undefined);
    setAvailableSlots([]);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData((prev) => ({
        ...prev,
        date: date.toISOString().split("T")[0],
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Book Appointment</h1>
          <p className="text-muted-foreground">
            Schedule a session with one of our expert technicians
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Appointment Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>
                Fill in the details for your appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                  </div>
                )}

                {/* Technician Selection */}
                <div className="space-y-2">
                  <Label htmlFor="technicianId">Select Technician *</Label>
                  <Select
                    value={formData.technicianId || "all"}
                    defaultValue="all"
                    onValueChange={(value) =>
                      handleTechnicianSelect(value === "all" ? "" : value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a technician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Choose a technician</SelectItem>
                      {technicians.map((technician) => (
                        <SelectItem key={technician.id} value={technician.id}>
                          {technician.username} - ${technician.hourlyRate}/hr
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Service Type */}
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Select
                    name="serviceType"
                    value={formData.serviceType || "all"}
                    defaultValue="all"
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        serviceType: value === "all" ? "" : value,
                      }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Select service type</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="installation">Installation</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="troubleshooting">
                        Troubleshooting
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Selection */}
                {selectedTechnician && (
                  <div className="space-y-2">
                    <Label>Select Date *</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) =>
                        date < new Date() ||
                        date.getDay() === 0 ||
                        date.getDay() === 6
                      }
                      className="rounded-md border"
                    />
                  </div>
                )}

                {/* Time Selection */}
                {selectedDate && availableSlots.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="time">Select Time *</Label>
                    <Select
                      name="time"
                      value={formData.time || "all"}
                      defaultValue="all"
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          time: value === "all" ? "" : value,
                        }))
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Choose a time slot</SelectItem>
                        {availableSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Select
                    name="duration"
                    value={
                      formData.duration ? formData.duration.toString() : "30"
                    }
                    defaultValue="30"
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: parseInt(value) || 30,
                      }))
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes (default)</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
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
                    disabled={
                      loading ||
                      !formData.technicianId ||
                      !formData.date ||
                      !formData.time
                    }
                  >
                    {loading ? "Booking..." : "Book Appointment"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Technician */}
          {selectedTechnician && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Technician</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {selectedTechnician.username}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedTechnician.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Experience:</span>
                      <span>{selectedTechnician.experience} years</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rate:</span>
                      <span>${selectedTechnician.hourlyRate}/hour</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Rating:</span>
                      <span>{selectedTechnician.rating}/5 ⭐</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">
                      Specializations:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTechnician.specialization
                        .slice(0, 3)
                        .map((spec, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {spec}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appointment Summary */}
          {formData.technicianId && formData.date && formData.time && (
            <Card>
              <CardHeader>
                <CardTitle>Appointment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(formData.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formData.time} ({formData.duration} minutes)
                    </span>
                  </div>
                  {selectedTechnician && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {selectedTechnician.username}
                      </span>
                    </div>
                  )}
                  {formData.serviceType && (
                    <div className="pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        Service:
                      </span>
                      <p className="text-sm font-medium capitalize">
                        {formData.serviceType}
                      </p>
                    </div>
                  )}
                  {selectedTechnician && (
                    <div className="pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        Estimated Cost:
                      </span>
                      <p className="text-lg font-bold">
                        $
                        {(
                          (selectedTechnician.hourlyRate * formData.duration) /
                          60
                        ).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Booking Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Appointments can be booked up to 30 days in advance</p>
                <p>• Minimum booking duration is 30 minutes</p>
                <p>• Cancellations must be made at least 24 hours in advance</p>
                <p>• You will receive a confirmation email after booking</p>
                <p>• Payment is processed after the appointment</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
