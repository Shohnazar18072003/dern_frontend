"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Service } from "@/types";
import api from "@/lib/api";
import {
  Search,
  Clock,
  DollarSign,
  Monitor,
  Shield,
  Wrench,
  Calendar,
} from "lucide-react";

export function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchServices = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (categoryFilter) params.append("category", categoryFilter);

      const response = await api.get(`/services?${params.toString()}`);
      setServices(response.data.services || []);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      // Mock data for demo
      setServices([
        {
          _id: "1",
          name: "Computer Hardware Repair",
          description:
            "Comprehensive hardware diagnosis and repair services for desktops and laptops. Includes component replacement, upgrade installation, and performance optimization.",
          price: 75,
          duration: 120,
          category: "technical",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
        {
          _id: "2",
          name: "Software Installation & Setup",
          description:
            "Professional software installation, configuration, and setup services. Includes operating system installation, application setup, and driver updates.",
          price: 50,
          duration: 90,
          category: "technical",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
        {
          _id: "3",
          name: "Network Configuration",
          description:
            "Complete network setup and configuration services for home and office environments. Includes router setup, WiFi optimization, and security configuration.",
          price: 100,
          duration: 150,
          category: "technical",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
        {
          _id: "4",
          name: "Cybersecurity Consultation",
          description:
            "Expert cybersecurity assessment and consultation services. Includes security audit, threat analysis, and protection strategy development.",
          price: 125,
          duration: 180,
          category: "consultation",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
        {
          _id: "5",
          name: "Data Recovery",
          description:
            "Professional data recovery services for damaged or corrupted storage devices. Includes hard drive recovery, file restoration, and backup setup.",
          price: 150,
          duration: 240,
          category: "technical",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
        {
          _id: "6",
          name: "Business IT Consultation",
          description:
            "Comprehensive IT consultation for businesses. Includes technology assessment, digital transformation planning, and IT strategy development.",
          price: 200,
          duration: 120,
          category: "consultation",
          createdAt: "2024-01-01",
          updatedAt: "2024-01-01",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    fetchServices();
  }, [search, categoryFilter, fetchServices]);

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(search.toLowerCase()) ||
      service.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !categoryFilter || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technical":
        return <Wrench className="h-5 w-5" />;
      case "consultation":
        return <Monitor className="h-5 w-5" />;
      case "legal":
        return <Shield className="h-5 w-5" />;
      default:
        return <Wrench className="h-5 w-5" />;
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Services</h1>
        <p className="text-muted-foreground">
          Professional technical and consultation services available
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
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
              <label className="text-sm font-medium">Category</label>
              <Select
                value={categoryFilter  || "all"}
                defaultValue="all"
                onValueChange={(value) =>
                  setCategoryFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
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
              <label className="text-sm font-medium">&nbsp;</label>
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

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredServices.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No services found</h3>
                <p className="text-muted-foreground text-center">
                  Try adjusting your search criteria to find the services you
                  need.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredServices.map((service) => (
            <Card
              key={service._id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(service.category)}
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                  </div>
                  <Badge
                    className={`${getCategoryColor(service.category)} border`}
                  >
                    <span className="capitalize">{service.category}</span>
                  </Badge>
                </div>
                <CardDescription className="line-clamp-3">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-lg font-bold">
                        ${service.price}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {service.duration} min
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link to="/app/support-requests/new" className="flex-1">
                      <Button className="w-full">Request Service</Button>
                    </Link>
                    <Link to="/app/technicians" className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Calendar className="h-4 w-4 mr-1" />
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Service Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Service Categories</CardTitle>
          <CardDescription>Overview of our service offerings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Wrench className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-semibold">Technical Services</h3>
              <p className="text-sm text-muted-foreground">
                Hardware repair, software installation, network setup, and
                troubleshooting
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <Monitor className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-semibold">Consultation</h3>
              <p className="text-sm text-muted-foreground">
                IT strategy, cybersecurity assessment, and business technology
                planning
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-semibold">Legal Services</h3>
              <p className="text-sm text-muted-foreground">
                Technology law, compliance consulting, and legal documentation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
