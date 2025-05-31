"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAppointments = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);

      const response = await api.get(`/appointments?${params.toString()}`);
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      // Mock data for demo
      setAppointments([
        {
          _id: "1",
          client: {
            _id: "1",
            id: "1",
            username: "John Smith",
            email: "john@example.com",
            role: "customer",
            accountType: "individual",
            phone: "+1234567890",
            address: "123 Main St",
            isActive: true,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          technician: {
            _id: "2",
            id: "2",
            username: "Mike Johnson",
            email: "mike@example.com",
            role: "technician",
            accountType: "individual",
            phone: "+1234567891",
            address: "456 Tech Ave",
            isActive: true,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          startTime: "2024-01-25T10:00:00Z",
          endTime: "2024-01-25T11:00:00Z",
          status: "scheduled",
          notes: "Computer hardware repair consultation",
          createdAt: "2024-01-20T10:00:00Z",
          updatedAt: "2024-01-20T10:00:00Z",
        },
        {
          _id: "2",
          client: {
            _id: "3",
            id: "3",
            username: "Sarah Wilson",
            email: "sarah@example.com",
            role: "customer",
            accountType: "business",
            phone: "+1234567892",
            address: "789 Business Blvd",
            isActive: true,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          technician: {
            _id: "2",
            id: "2",
            username: "Mike Johnson",
            email: "mike@example.com",
            role: "technician",
            accountType: "individual",
            phone: "+1234567891",
            address: "456 Tech Ave",
            isActive: true,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          startTime: "2024-01-23T14:00:00Z",
          endTime: "2024-01-23T15:30:00Z",
          status: "completed",
          notes: "Network setup and configuration",
          createdAt: "2024-01-18T10:00:00Z",
          updatedAt: "2024-01-23T15:30:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments, search, statusFilter]);

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.client.username
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      appointment.technician.username
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (appointment.notes &&
        appointment.notes.toLowerCase().includes(search.toLowerCase()));
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
                defaultValue="all"
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
                            {appointment.client.username}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            <span className="text-muted-foreground">
                              Technician:
                            </span>{" "}
                            {appointment.technician.username}
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

                    {appointment.notes && (
                      <div className="mt-3">
                        <span className="text-sm text-muted-foreground">
                          Notes:
                        </span>
                        <p className="text-sm mt-1">{appointment.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    {appointment.status === "scheduled" && (
                      <>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm">
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
    </div>
  );
}
