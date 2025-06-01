"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  CalendarIcon,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
  Search,
} from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import api from "@/lib/api";

interface Job {
  _id: string;
  jobId: string;
  title: string;
  description?: string;
  jobType:
    | "maintenance"
    | "installation"
    | "repair"
    | "consultation"
    | "inspection"
    | "emergency";
  priority: "low" | "medium" | "high" | "urgent";
  status: "scheduled" | "in-progress" | "completed" | "cancelled" | "postponed";
  customer: {
    _id: string;
    username: string;
    email: string;
    phone?: string;
  };
  assignedTechnician?: {
    _id: string;
    username: string;
    email: string;
    specialization?: string[];
  };
  scheduledDate: string;
  estimatedDuration: number;
  actualStartTime?: string;
  actualEndTime?: string;
  location: {
    address: string;
    city: string;
    state?: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  requiredSkills?: string[];
  requiredInventory?: Array<{
    item: {
      _id: string;
      itemName: string;
      itemCode: string;
    };
    quantity: number;
  }>;
  serviceType?: {
    _id: string;
    name: string;
    description: string;
    price: number;
  };
  relatedSupportRequest?: string;
  notes?: string;
  completionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface AppUser {
  _id: string;
  username: string;
  email: string;
  role: string;
  specialization?: string[];
}

const jobFormSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  jobType: z.enum([
    "maintenance",
    "installation",
    "repair",
    "consultation",
    "inspection",
    "emergency",
  ]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  customer: z.string().min(1, "Customer is required"),
  assignedTechnician: z.string().optional(),
  scheduledDate: z.date({
    required_error: "Scheduled date is required",
  }),
  estimatedDuration: z.number().min(15, "Duration must be at least 15 minutes"),
  location: z.object({
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }),
  requiredSkills: z.array(z.string()).optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

export function JobScheduling() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<AppUser[]>([]);
  const [technicians, setTechnicians] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      jobType: "maintenance",
      priority: "medium",
      customer: "",
      assignedTechnician: undefined,
      scheduledDate: new Date(),
      estimatedDuration: 60,
      location: {
        address: "",
        city: "",
        state: "",
        zipCode: "",
      },
      requiredSkills: [],
      description: "",
      notes: "",
    },
  });

  const editForm = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      jobType: "maintenance",
      priority: "medium",
      customer: "",
      assignedTechnician: undefined,
      scheduledDate: new Date(),
      estimatedDuration: 60,
      location: {
        address: "",
        city: "",
        state: "",
        zipCode: "",
      },
      requiredSkills: [],
      description: "",
      notes: "",
    },
  });

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      if (jobTypeFilter) params.append("jobType", jobTypeFilter);
      if (searchTerm) params.append("search", searchTerm);

      // Format date for API
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      params.append("date", dateStr);

      const response = await api.get(`/jobs?${params.toString()}`);
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, jobTypeFilter, searchTerm, selectedDate]);

  // Fetch users (customers and technicians)
  const fetchUsers = async () => {
    try {
      const response = await api.get("/auth/users");
      const users = response.data.users || [];

      setCustomers(users.filter((user: AppUser) => user.role === "customer"));
      setTechnicians(
        users.filter((user: AppUser) => user.role === "technician")
      );
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [
    selectedDate,
    statusFilter,
    priorityFilter,
    jobTypeFilter,
    searchTerm,
    fetchJobs,
  ]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const onSubmit = async (values: JobFormValues) => {
    try {
      const jobData = {
        ...values,
        scheduledDate: values.scheduledDate.toISOString(),
        requiredSkills:
          values.requiredSkills?.filter((skill) => skill.trim()) || [],
      };

      await api.post("/jobs", jobData);
      toast.success("Job scheduled successfully");
      setIsCreateDialogOpen(false);
      form.reset();
      fetchJobs();
    } catch (error: any) {
      console.error("Failed to create job:", error);
      toast.error(error.response?.data?.message || "Failed to schedule job");
    }
  };

  const updateJobStatus = async (jobId: string, status: string) => {
    try {
      await api.put(`/jobs/${jobId}`, { status });
      toast.success("Job status updated");
      fetchJobs();
    } catch (error: any) {
      console.error("Failed to update job:", error);
      toast.error(error.response?.data?.message || "Failed to update job");
    }
  };

  const openEditDialog = (job: Job) => {
    setSelectedJob(job);
    editForm.reset({
      title: job.title,
      description: job.description || "",
      jobType: job.jobType,
      priority: job.priority,
      customer: job.customer._id,
      assignedTechnician: job.assignedTechnician?._id || undefined,
      scheduledDate: new Date(job.scheduledDate),
      estimatedDuration: job.estimatedDuration,
      location: {
        address: job.location.address,
        city: job.location.city,
        state: job.location.state || "",
        zipCode: job.location.zipCode || "",
      },
      requiredSkills: job.requiredSkills || [],
      notes: job.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const onEditSubmit = async (values: JobFormValues) => {
    if (!selectedJob) return;

    try {
      const jobData = {
        ...values,
        scheduledDate: values.scheduledDate.toISOString(),
        requiredSkills:
          values.requiredSkills?.filter((skill) => skill.trim()) || [],
      };

      await api.put(`/jobs/${selectedJob.jobId}`, jobData);
      toast.success("Job updated successfully");
      setIsEditDialogOpen(false);
      setSelectedJob(null);
      editForm.reset();
      fetchJobs();
    } catch (error: any) {
      console.error("Failed to update job:", error);
      toast.error(error.response?.data?.message || "Failed to update job");
    }
  };

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
      case "postponed":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
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
            Schedule and manage technician jobs
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Job</DialogTitle>
              <DialogDescription>
                Create a new job assignment for a technician
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter job title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="jobType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="maintenance">
                              Maintenance
                            </SelectItem>
                            <SelectItem value="installation">
                              Installation
                            </SelectItem>
                            <SelectItem value="repair">Repair</SelectItem>
                            <SelectItem value="consultation">
                              Consultation
                            </SelectItem>
                            <SelectItem value="inspection">
                              Inspection
                            </SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="customer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem
                                key={customer._id}
                                value={customer._id}
                              >
                                {customer.username} ({customer.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assignedTechnician"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Technician (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select technician" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unassigned">
                              Unassigned
                            </SelectItem>
                            {technicians.map((technician) => (
                              <SelectItem
                                key={technician._id}
                                value={technician._id}
                              >
                                {technician.username} (
                                {technician.specialization?.join(", ") ||
                                  "General"}
                                )
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scheduled Date</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            value={
                              field.value
                                ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(new Date(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimatedDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="15"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="location.address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location.zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter ZIP code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter job description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any additional notes"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Schedule Job</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Job Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
              <DialogDescription>
                Update job details and assignment
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(onEditSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter job title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="jobType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="maintenance">
                              Maintenance
                            </SelectItem>
                            <SelectItem value="installation">
                              Installation
                            </SelectItem>
                            <SelectItem value="repair">Repair</SelectItem>
                            <SelectItem value="consultation">
                              Consultation
                            </SelectItem>
                            <SelectItem value="inspection">
                              Inspection
                            </SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="customer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer) => (
                              <SelectItem
                                key={customer._id}
                                value={customer._id}
                              >
                                {customer.username} ({customer.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="assignedTechnician"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Technician</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || "unassigned"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select technician" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="unassigned">
                              Unassigned
                            </SelectItem>
                            {technicians.map((technician) => (
                              <SelectItem
                                key={technician._id}
                                value={technician._id}
                              >
                                {technician.username} (
                                {technician.specialization?.join(", ") ||
                                  "General"}
                                )
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Scheduled Date</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            value={
                              field.value
                                ? format(field.value, "yyyy-MM-dd'T'HH:mm")
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(new Date(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="estimatedDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="15"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="location.address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="location.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="location.state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={editForm.control}
                      name="location.zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter ZIP code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter job description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any additional notes"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setSelectedJob(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Update Job</Button>
                </div>
              </form>
            </Form>
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
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={statusFilter || "all"}
                    onValueChange={(value) =>
                      setStatusFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="postponed">Postponed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={priorityFilter || "all"}
                    onValueChange={(value) =>
                      setPriorityFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger>
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
                  <Label>Job Type</Label>
                  <Select
                    value={jobTypeFilter || "all"}
                    onValueChange={(value) =>
                      setJobTypeFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="installation">Installation</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
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
              <CardDescription>{jobs.length} job(s) found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                    <p className="text-muted-foreground">
                      No jobs match your current filters.
                    </p>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <Card
                      key={job._id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold">{job.title}</h3>
                              <Badge className="text-xs">{job.jobId}</Badge>
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
                              <Badge variant="outline" className="capitalize">
                                {job.jobType}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>Customer: {job.customer.username}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  Technician:{" "}
                                  {job.assignedTechnician?.username ||
                                    "Unassigned"}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {format(new Date(job.scheduledDate), "HH:mm")}{" "}
                                  ({job.estimatedDuration} min)
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {job.location.address}, {job.location.city}
                                </span>
                              </div>
                            </div>

                            {job.description && (
                              <p className="text-muted-foreground mt-2">
                                {job.description}
                              </p>
                            )}

                            {job.requiredSkills &&
                              job.requiredSkills.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-sm font-medium">
                                    Required Skills:{" "}
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {job.requiredSkills.map((skill, index) => (
                                      <Badge
                                        key={index}
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>

                          <div className="flex flex-col space-y-2">
                            {job.status === "scheduled" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateJobStatus(job.jobId, "in-progress")
                                }
                              >
                                Start Job
                              </Button>
                            )}
                            {job.status === "in-progress" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateJobStatus(job.jobId, "completed")
                                }
                              >
                                Complete
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(job)}
                            >
                              Edit
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
