"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { Technician } from "@/types";
import { toast } from "sonner";

export function CreateAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    technicianId: "",
    startTime: "",
    duration: 60,
    notes: "",
    serviceType: "",
    priority: "medium",
    location: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  // Get technician ID from URL query parameter
  const preselectedTechnicianId = searchParams.get("technician");

  // Check if user is authenticated and has proper role
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Authentication required", {
        description: "Please log in to book an appointment.",
        duration: 5000,
      });
      navigate("/auth/login");
      return;
    }

    if (!authLoading && user && !["customer", "admin"].includes(user.role)) {
      toast.error("Access denied", {
        description: "You don't have permission to book appointments.",
        duration: 5000,
      });
      navigate("/app/dashboard");
      return;
    }
  }, [user, authLoading, navigate]);

  const fetchTechnicians = useCallback(async () => {
    if (!user) return;

    try {
      const response = await api.get("/technicians");
      console.log("Technicians API response:", response.data);

      // Handle different response structures
      const techniciansList =
        response.data.data?.technicians || response.data.technicians || [];
      setTechnicians(techniciansList);

      // Pre-select technician from URL if available
      if (preselectedTechnicianId) {
        const foundTechnician = techniciansList.find(
          (tech: any) => (tech.id || tech._id) === preselectedTechnicianId
        );

        if (foundTechnician) {
          setFormData((prev) => ({
            ...prev,
            technicianId: preselectedTechnicianId,
          }));
        } else {
          toast.warning("Technician not found", {
            description: "The specified technician could not be found.",
            duration: 5000,
          });
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch technicians:", error);
      const message =
        error.response?.data?.message || "Failed to fetch technicians";
      setError(message);
      toast.error("Error", {
        description: message,
        duration: 5000,
      });
    }
  }, [preselectedTechnicianId, user]);

  const fetchAvailableSlots = useCallback(async () => {
    if (!selectedDate || !formData.technicianId) {
      setAvailableSlots([]);
      return;
    }

    try {
      const dateStr = selectedDate.toISOString().split("T")[0];
      const response = await api.get(
        `/technicians/${formData.technicianId}/availability?date=${dateStr}`
      );

      const slots =
        response.data.data?.availableSlots || response.data.slots || [];
      setAvailableSlots(slots);
      setError("");

      // Reset selected time if it's no longer available
      if (formData.startTime && !slots.includes(formData.startTime)) {
        setFormData((prev) => ({ ...prev, startTime: "" }));
      }
    } catch (error: any) {
      console.error("Failed to fetch available slots:", error);
      const message =
        error.response?.data?.message || "Unable to fetch available time slots";
      setError(message);
      toast.warning("Warning", {
        description: message,
        duration: 5000,
      });
      // Provide fallback slots
      setAvailableSlots(["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]);
    }
  }, [selectedDate, formData.technicianId, formData.startTime]);

  useEffect(() => {
    if (user) {
      fetchTechnicians();
    }
  }, [fetchTechnicians, user]);

  useEffect(() => {
    if (selectedDate && formData.technicianId) {
      fetchAvailableSlots();
    }
  }, [selectedDate, formData.technicianId, fetchAvailableSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (
        !selectedDate ||
        !formData.startTime ||
        !formData.technicianId ||
        !formData.serviceType
      ) {
        throw new Error("Please fill in all required fields.");
      }

      // Create start and end times
      const startDateTime = new Date(
        `${selectedDate.toISOString().split("T")[0]}T${formData.startTime}:00Z`
      );
      const endDateTime = new Date(
        startDateTime.getTime() + formData.duration * 60000
      );

      const appointmentData = {
        technicianId: formData.technicianId,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        notes: formData.notes,
        serviceType: formData.serviceType,
        priority: formData.priority,
        estimatedDuration: formData.duration,
        location: formData.location.address ? formData.location : undefined,
      };

      const response = await api.post("/appointments", appointmentData);

      toast.success("Success", {
        description: "Appointment booked successfully!",
        duration: 5000,
      });

      navigate("/app/appointments");
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to book appointment";
      setError(message);
      toast.error("Error", {
        description: message,
        duration: 5000,
      });
      console.error("Book appointment error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [locationField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setFormData((prev) => ({ ...prev, startTime: "" })); // Reset time when date changes
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    return !!(
      formData.technicianId &&
      selectedDate &&
      formData.startTime &&
      formData.serviceType &&
      availableSlots.includes(formData.startTime)
    );
  };

  // Helper function to get technician display name with hourly rate
  const getTechnicianDisplayName = (tech: any) => {
    // Get the technician name
    const name =
      tech.name ||
      tech.username ||
      tech.firstName ||
      tech.fullName ||
      `Technician ${tech._id?.slice(-4)}`;

    // Get the hourly rate
    const hourlyRate = tech.hourlyRate || tech.rate || tech.price || tech.cost;

    if (hourlyRate) {
      return `${name} - $${hourlyRate}/hour`;
    }

    return name;
  };

  // Get selected technician info for display
  const selectedTechnician = technicians.find(
    (tech) => (tech.id || tech._id) === formData.technicianId
  );

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if user is not authenticated or doesn't have proper role
  if (!user || !["customer", "admin"].includes(user.role)) {
    return null;
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
        <h1 className="text-3xl font-bold">Book New Appointment</h1>
      </div>

      {preselectedTechnicianId && selectedTechnician && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-blue-700">
                <strong>Pre-selected technician:</strong>{" "}
                {getTechnicianDisplayName(selectedTechnician)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>
            {preselectedTechnicianId
              ? "Complete the details below to book your appointment with the selected technician"
              : "Fill in the details below to book your appointment"}
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
              <Label htmlFor="technicianId">Select Technician *</Label>
              <Select
                name="technicianId"
                value={formData.technicianId}
                onValueChange={(value) =>
                  handleSelectChange("technicianId", value)
                }
                required
                disabled={!!preselectedTechnicianId} // Disable if pre-selected
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" disabled>
                    Choose a technician
                  </SelectItem>
                  {technicians.map((tech) => (
                    <SelectItem
                      key={tech.id || tech._id}
                      value={tech.id || tech._id}
                    >
                      {getTechnicianDisplayName(tech)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {preselectedTechnicianId && (
                <p className="text-xs text-muted-foreground">
                  Technician pre-selected from link.{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, technicianId: "" }));
                      navigate("/app/appointments/new", { replace: true });
                    }}
                  >
                    Change technician
                  </button>
                </p>
              )}
            </div>

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

            {selectedDate && formData.technicianId && (
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
              <Label htmlFor="priority">Priority</Label>
              <Select
                name="priority"
                value={formData.priority}
                onValueChange={(value) => handleSelectChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Location (Optional)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location.address">Address</Label>
                  <Input
                    id="location.address"
                    name="location.address"
                    placeholder="Street address"
                    value={formData.location.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location.city">City</Label>
                  <Input
                    id="location.city"
                    name="location.city"
                    placeholder="City"
                    value={formData.location.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location.state">State</Label>
                  <Input
                    id="location.state"
                    name="location.state"
                    placeholder="State"
                    value={formData.location.state}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location.zipCode">ZIP Code</Label>
                  <Input
                    id="location.zipCode"
                    name="location.zipCode"
                    placeholder="ZIP Code"
                    value={formData.location.zipCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
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
                {loading ? "Booking..." : "Book Appointment"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/app/appointments")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
