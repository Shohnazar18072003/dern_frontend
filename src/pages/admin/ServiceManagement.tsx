"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Service } from "@/types";
import api from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Wrench,
  DollarSign,
  Clock,
} from "lucide-react";
import type { AxiosResponse } from "axios";

interface ServiceFormData {
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

export function ServiceManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    price: 0,
    duration: 60,
    category: "",
  });

  // Reset form data
  const resetForm = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      duration: 60,
      category: "",
    });
    setFormErrors({});
  }, []);

  // Fetch services from API
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (categoryFilter) params.append("category", categoryFilter);

      const response = await api.get(`/services?${params.toString()}`);
      const serviceData = response.data.services || response.data.data || [];
      setServices(Array.isArray(serviceData) ? serviceData : []);
    } catch (error: any) {
      console.error("Failed to fetch services:", error);
      toast.error("Failed to fetch services", {
        description: error.response?.data?.message || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Handle form input changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      if (name === "price" || name === "duration") {
        const numValue =
          name === "price"
            ? Number.parseFloat(value) || 0
            : Number.parseInt(value) || 0;
        setFormData((prev) => ({ ...prev, [name]: numValue }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }

      // Clear error for this field when user types
      setFormErrors((prev) => {
        if (prev[name]) {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        }
        return prev;
      });
    },
    []
  );

  // Handle select changes
  const handleSelectChange = useCallback((value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value === "all" ? "" : value,
    }));

    // Clear error for category field
    setFormErrors((prev) => {
      if (prev.category) {
        const newErrors = { ...prev };
        delete newErrors.category;
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Validate form data
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Service name is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Service description is required";
    }

    if (!formData.price || formData.price <= 0) {
      errors.price = "Price must be greater than 0";
    }

    if (!formData.duration || formData.duration < 15) {
      errors.duration = "Duration must be at least 15 minutes";
    }

    if (!formData.category) {
      errors.category = "Category is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission for creating/editing services
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare service data for API
      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        duration: Number(formData.duration),
        category: formData.category,
      };

      let response: AxiosResponse<any, any>;

      if (selectedService) {
        // Update existing service
        response = await api.put(
          `/services/${selectedService._id}`,
          serviceData
        );
        toast.success("Service updated successfully");

        // Update service in local state
        const updatedService = response.data.service || response.data;
        setServices((prev) =>
          prev.map((service) =>
            service._id === selectedService._id
              ? {
                  ...service,
                  ...updatedService,
                  _id: service._id, // Ensure ID is preserved
                  createdAt: service.createdAt, // Preserve original creation date
                  updatedAt:
                    updatedService.updatedAt || new Date().toISOString(),
                }
              : service
          )
        );

        setIsEditDialogOpen(false);
      } else {
        // Create new service
        response = await api.post("/services", serviceData);
        toast.success("Service created successfully");

        // Add new service to local state
        const newService = response.data.service || response.data;
        const serviceToAdd: Service = {
          _id: newService._id || newService.id || `temp_${Date.now()}`,
          name: newService.name || formData.name,
          description: newService.description || formData.description,
          price: newService.price || formData.price,
          duration: newService.duration || formData.duration,
          category: newService.category || formData.category,
          createdAt: newService.createdAt || new Date().toISOString(),
          updatedAt: newService.updatedAt || new Date().toISOString(),
        };

        setServices((prev) => [...prev, serviceToAdd]);
        setIsCreateDialogOpen(false);
      }

      setSelectedService(null);
      resetForm();
    } catch (error: any) {
      console.error("Failed to save service:", error);
      toast.error(
        selectedService
          ? "Failed to update service"
          : "Failed to create service",
        {
          description: error.response?.data?.message || "An error occurred",
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open edit dialog and populate form with service data
  const openEditDialog = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
    });
    setIsEditDialogOpen(true);
  };

  // Delete service
  const handleDeleteService = async (serviceId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this service? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/services/${serviceId}`);
      setServices((prev) =>
        prev.filter((service) => service._id !== serviceId)
      );
      toast.success("Service deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete service:", error);
      toast.error("Failed to delete service", {
        description: error.response?.data?.message || "An error occurred",
      });
    }
  };

  // Get category color for badge
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "technical":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "consultation":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "legal":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  // Filter services based on search and filters
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      !search ||
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !categoryFilter || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Loading state
  if (loading && services.length === 0) {
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
          <h1 className="text-3xl font-bold">Service Management</h1>
          <p className="text-muted-foreground">
            Manage available services and their pricing
          </p>
        </div>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
              <DialogDescription>
                Add a new service to the platform
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Service Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter service name"
                  required
                />
                {formErrors.name && (
                  <p className="text-sm text-destructive">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter service description"
                  rows={3}
                  required
                />
                {formErrors.description && (
                  <p className="text-sm text-destructive">
                    {formErrors.description}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price ($) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.price && (
                    <p className="text-sm text-destructive">
                      {formErrors.price}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Duration (minutes){" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    min="15"
                    step="15"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.duration && (
                    <p className="text-sm text-destructive">
                      {formErrors.duration}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.category || ""}
                    onValueChange={handleSelectChange}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                      <SelectItem value="legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.category && (
                    <p className="text-sm text-destructive">
                      {formErrors.category}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Service"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categoryFilter || "all"}
                onValueChange={(value) =>
                  setCategoryFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="legal">Legal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Services
            </CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Technical Services
            </CardTitle>
            <Wrench className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {
                services.filter((service) => service.category === "technical")
                  .length
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              $
              {services.length > 0
                ? (
                    services.reduce((sum, s) => sum + s.price, 0) /
                    services.length
                  ).toFixed(0)
                : 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {services.length > 0
                ? Math.round(
                    services.reduce((sum, s) => sum + s.duration, 0) /
                      services.length
                  )
                : 0}
              m
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {filteredServices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No services found</h3>
              <p className="text-muted-foreground text-center">
                No services match your current search criteria.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredServices.map((service) => (
            <Card
              key={service._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <h3 className="text-lg font-semibold">{service.name}</h3>
                      <Badge
                        className={`${getCategoryColor(
                          service.category
                        )} border`}
                      >
                        <span className="capitalize">{service.category}</span>
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mb-4">
                      {service.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Price:</span>
                        <p className="font-medium text-lg">${service.price}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-medium">
                          {service.duration} minutes
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="font-medium">
                          {service.createdAt
                            ? typeof service.createdAt === "string" &&
                              service.createdAt.trim() !== ""
                              ? formatDateTime(service.createdAt)
                              : "N/A"
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Updated:</span>
                        <p className="font-medium">
                          {service.updatedAt
                            ? typeof service.updatedAt === "string" &&
                              service.updatedAt.trim() !== ""
                              ? formatDateTime(service.updatedAt)
                              : "N/A"
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(service)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteService(service._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Service Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedService(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update service information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Service Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter service name"
                required
              />
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter service description"
                rows={3}
                required
              />
              {formErrors.description && (
                <p className="text-sm text-destructive">
                  {formErrors.description}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="edit-price">
                  Price ($) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.price && (
                  <p className="text-sm text-destructive">{formErrors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-duration">
                  Duration (minutes) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-duration"
                  name="duration"
                  type="number"
                  min="15"
                  step="15"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.duration && (
                  <p className="text-sm text-destructive">
                    {formErrors.duration}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.category || ""}
                  onValueChange={handleSelectChange}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p className="text-sm text-destructive">
                    {formErrors.category}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
