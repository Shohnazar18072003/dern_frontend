"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { Appointment } from "@/types";
import api from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Edit,
} from "lucide-react";
import { toast } from "sonner";

export function Appointments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(
    null
  );
  const [cancellationReason, setCancellationReason] = useState("");

  const fetchAppointments = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);

      console.log("Fetching appointments with params:", params.toString());
      const response = await api.get(`/appointments?${params.toString()}`);
      console.log("API Response:", response.data);

      // Fix: Check for the correct response structure
      if (
        response.data &&
        response.data.data &&
        response.data.data.appointments
      ) {
        setAppointments(response.data.data.appointments);
      } else if (response.data && Array.isArray(response.data)) {
        setAppointments(response.data);
      } else {
        console.error("Unexpected API response structure:", response.data);
        setAppointments([]);
        toast.error("Error loading appointments", {
          description: "Unexpected data format from server",
        });
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast.error("Failed to load appointments", {
        description: "Please try again later",
      });
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async () => {
    if (!appointmentToCancel) return;
    setLoading(true);
    try {
      // Use the new PATCH endpoint with cancellation reason
      await api.patch(`/appointments/${appointmentToCancel}/cancel`, {
        cancellationReason: cancellationReason || "No reason provided",
      });
      setCancelDialogOpen(false);
      setAppointmentToCancel(null);
      setCancellationReason("");
      toast.success("Appointment canceled successfully");
      await fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as any).response === "object" &&
        (error as any).response !== null &&
        "data" in (error as any).response &&
        typeof (error as any).response.data === "object" &&
        (error as any).response.data !== null &&
        "message" in (error as any).response.data
      ) {
        toast.error("Error", {
          description: (error as any).response.data.message,
        });
      } else {
        toast.error("Failed to cancel appointment");
      }
    } finally {
      setLoading(false);
    }
  };

  const openCancelDialog = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setCancellationReason("");
    setCancelDialogOpen(true);
  };

  const filteredAppointments = appointments.filter((appointment) => {
    // Safety check for undefined properties
    if (!appointment || !appointment.client || !appointment.technician) {
      return false;
    }

    const matchesSearch =
      (appointment.client.username || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (appointment.technician.username || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (appointment.notes || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || appointment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "canceled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "in-progress":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "canceled":
        return <XCircle className="h-4 w-4" />;
      case "in-progress":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your scheduled appointments with technicians
          </p>
        </div>
        {user?.role === "customer" && (
          <Link to="/app/appointments/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={statusFilter || "all"}
                onValueChange={(value) =>
                  setStatusFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No appointments found
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {user?.role === "customer"
                  ? "You haven't booked any appointments yet."
                  : "No appointments match your current filters."}
              </p>
              {user?.role === "customer" && (
                <Link to="/app/appointments/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Book Your First Appointment
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card
              key={appointment._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <Badge
                        className={`${getStatusColor(
                          appointment.status
                        )} border`}
                      >
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1 capitalize">
                          {appointment.status}
                        </span>
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDateTime(appointment.startTime)}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="text-muted-foreground">
                              Client:
                            </span>{" "}
                            {appointment.client?.username || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="text-muted-foreground">
                              Technician:
                            </span>{" "}
                            {appointment.technician?.username || "Unknown"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="text-muted-foreground">
                              Duration:
                            </span>{" "}
                            {Math.round(
                              (new Date(appointment.endTime).getTime() -
                                new Date(appointment.startTime).getTime()) /
                                (1000 * 60)
                            )}{" "}
                            minutes
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="text-muted-foreground">
                              Booked:
                            </span>{" "}
                            {formatDateTime(appointment.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {appointment.serviceType && (
                      <div className="mt-3">
                        <span className="text-sm text-muted-foreground">
                          Service Type:
                        </span>
                        <p className="text-sm mt-1 capitalize">
                          {appointment.serviceType}
                        </p>
                      </div>
                    )}
                    {appointment.notes && (
                      <div className="mt-3">
                        <span className="text-sm text-muted-foreground">
                          Notes:
                        </span>
                        <p className="text-sm mt-1">{appointment.notes}</p>
                      </div>
                    )}
                    {appointment.cancellationReason &&
                      appointment.status === "canceled" && (
                        <div className="mt-3">
                          <span className="text-sm text-muted-foreground">
                            Cancellation Reason:
                          </span>
                          <p className="text-sm mt-1">
                            {appointment.cancellationReason}
                          </p>
                        </div>
                      )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    {appointment.status === "scheduled" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/app/appointments/edit/${appointment._id}`
                            )
                          }
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openCancelDialog(appointment._id)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {appointment.status === "completed" &&
                      user?.role === "customer" && (
                        <Button variant="outline" size="sm">
                          Rate Service
                        </Button>
                      )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Cancel Dialog with Reason */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? Please provide a
              reason for cancellation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancellationReason">
                Reason for Cancellation (Optional)
              </Label>
              <Textarea
                id="cancellationReason"
                placeholder="Please explain why you're canceling this appointment..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setCancellationReason("");
              }}
            >
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={loading}
            >
              {loading ? "Canceling..." : "Confirm Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
