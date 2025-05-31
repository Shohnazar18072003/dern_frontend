"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CalendarIcon,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";

interface Job {
  id: string;
  title: string;
  customer: string;
  technician: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  type: "on-site" | "remote" | "drop-off";
  location: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  description: string;
  requirements: string[];
}

export function JobScheduling() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Mock data
  useEffect(() => {
    const mockJobs: Job[] = [
      {
        id: "1",
        title: "Computer Hardware Repair",
        customer: "John Smith",
        technician: "Mike Johnson",
        priority: "high",
        status: "scheduled",
        type: "on-site",
        location: "123 Business Ave, Suite 100",
        scheduledDate: "2024-01-20",
        scheduledTime: "09:00",
        estimatedDuration: 120,
        description: "Replace faulty motherboard and RAM upgrade",
        requirements: ["Motherboard", "16GB RAM", "Screwdriver set"],
      },
      {
        id: "2",
        title: "Network Setup",
        customer: "ABC Corporation",
        technician: "Sarah Wilson",
        priority: "medium",
        status: "in-progress",
        type: "on-site",
        location: "456 Corporate Blvd",
        scheduledDate: "2024-01-20",
        scheduledTime: "11:00",
        estimatedDuration: 180,
        description: "Install and configure new network infrastructure",
        requirements: ["Router", "Switches", "Ethernet cables"],
      },
      {
        id: "3",
        title: "Software Installation",
        customer: "Mary Johnson",
        technician: "David Brown",
        priority: "low",
        status: "scheduled",
        type: "remote",
        location: "Remote Session",
        scheduledDate: "2024-01-20",
        scheduledTime: "14:00",
        estimatedDuration: 60,
        description: "Install and configure accounting software",
        requirements: ["Software license", "Remote access"],
      },
      {
        id: "4",
        title: "Virus Removal",
        customer: "Tech Startup Inc",
        technician: "Lisa Davis",
        priority: "urgent",
        status: "scheduled",
        type: "on-site",
        location: "789 Innovation Drive",
        scheduledDate: "2024-01-20",
        scheduledTime: "16:00",
        estimatedDuration: 90,
        description: "Remove malware and secure systems",
        requirements: ["Antivirus software", "Security tools"],
      },
    ];

    setJobs(mockJobs);
    setLoading(false);
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = !statusFilter || job.status === statusFilter;
    const matchesPriority = !priorityFilter || job.priority === priorityFilter;
    const matchesDate =
      job.scheduledDate === format(selectedDate, "yyyy-MM-dd");
    return matchesStatus && matchesPriority && matchesDate;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "high":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "in-progress":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "in-progress":
        return <AlertTriangle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
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
          <h1 className="text-3xl font-bold">Job Scheduling</h1>
          <p className="text-muted-foreground">
            Schedule and manage daily technician jobs
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Schedule New Job</DialogTitle>
              <DialogDescription>
                Create a new job assignment for a technician
              </DialogDescription>
            </DialogHeader>
            {/* Add scheduling form here */}
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={statusFilter || "all"}
                    onValueChange={(value) =>
                      setStatusFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={priorityFilter || "all"}
                    onValueChange={(value) =>
                      setPriorityFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">View</label>
                  <Select
                    value={viewMode || "day"}
                    onValueChange={(value: "day" | "week" | "month") =>
                      setViewMode(value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select View" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day View</SelectItem>
                      <SelectItem value="week">Week View</SelectItem>
                      <SelectItem value="month">Month View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Jobs for Selected Date */}
          <Card>
            <CardHeader>
              <CardTitle>
                Jobs for {format(selectedDate, "MMMM d, yyyy")}
              </CardTitle>
              <CardDescription>
                {filteredJobs.length} job(s) scheduled
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No jobs scheduled
                    </h3>
                    <p className="text-muted-foreground">
                      No jobs are scheduled for this date.
                    </p>
                  </div>
                ) : (
                  filteredJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{job.title}</h3>
                              <Badge
                                className={`${getStatusColor(
                                  job.status
                                )} border`}
                              >
                                {getStatusIcon(job.status)}
                                <span className="ml-1 capitalize">
                                  {job.status.replace("-", " ")}
                                </span>
                              </Badge>
                              <Badge
                                className={`${getPriorityColor(
                                  job.priority
                                )} border`}
                              >
                                <span className="capitalize">
                                  {job.priority}
                                </span>
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>Customer: {job.customer}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>Technician: {job.technician}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {job.scheduledTime} ({job.estimatedDuration}{" "}
                                  min)
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{job.location}</span>
                              </div>
                            </div>

                            <p className="text-muted-foreground mt-2">
                              {job.description}
                            </p>

                            {job.requirements.length > 0 && (
                              <div className="mt-2">
                                <span className="text-sm font-medium">
                                  Requirements:{" "}
                                </span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {job.requirements.map((req, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {req}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col space-y-2">
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline" size="sm">
                              Reschedule
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
