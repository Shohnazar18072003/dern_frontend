"use client";
import { useCallback } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
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
import type { Technician } from "@/types";
import api from "@/lib/api";
import { Search, Star, User, Clock, CheckCircle } from "lucide-react";

export function Technicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");

  const fetchTechnicians = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("query", search);
      if (specializationFilter)
        params.append("specialization", specializationFilter);
      if (availabilityFilter) params.append("availability", availabilityFilter);

      const endpoint = search ? "/technicians/search" : "/technicians";
      const response = await api.get(`${endpoint}?${params.toString()}`);
      setTechnicians(response.data.technicians);
    } catch (error) {
      console.error("Failed to fetch technicians:", error);
    } finally {
      setLoading(false);
    }
  }, [search, specializationFilter, availabilityFilter]);

  useEffect(() => {
    fetchTechnicians();
  }, [search, specializationFilter, availabilityFilter, fetchTechnicians]);

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "busy":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "offline":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case "available":
        return <CheckCircle className="h-4 w-4" />;
      case "busy":
        return <Clock className="h-4 w-4" />;
      case "offline":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
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
        <h1 className="text-3xl font-bold">Technicians</h1>
        <p className="text-muted-foreground">
          Find and connect with our expert technicians
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Find Technicians</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search technicians..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Specialization</label>
              <Select
                value={specializationFilter || "all"}
                defaultValue="all"
                onValueChange={(value) =>
                  setSpecializationFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="software">Software</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="web-development">
                    Web Development
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Availability</label>
              <Select
                value={availabilityFilter || "all"}
                defaultValue="all"
                onValueChange={(value) => setAvailabilityFilter(value === "all" ? "" : value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Availability</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technicians Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {technicians.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">
                    No technicians found
                  </h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          technicians.map((technician) => (
            <Card
              key={technician.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {technician.username}
                      </CardTitle>
                      <CardDescription>{technician.email}</CardDescription>
                    </div>
                  </div>
                  <Badge
                    className={`${getAvailabilityColor(
                      technician.availability
                    )} border`}
                  >
                    {getAvailabilityIcon(technician.availability)}
                    <span className="ml-1 capitalize">
                      {technician.availability}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(technician.rating)
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {technician.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({technician.totalReviews} reviews)
                    </span>
                  </div>

                  {/* Experience and Rate */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Experience:</span>
                      <p className="font-medium">
                        {technician.experience} years
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rate:</span>
                      <p className="font-medium">
                        ${technician.hourlyRate}/hour
                      </p>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Specializations:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {technician.specialization
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
                      {technician.specialization.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{technician.specialization.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Certifications */}
                  {technician.certifications.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Certifications:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {technician.certifications
                          .slice(0, 2)
                          .map((cert, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {cert}
                            </Badge>
                          ))}
                        {technician.certifications.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{technician.certifications.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Link
                      to={`/technicians/${technician.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                    <Link
                      to={`/appointments/new?technician=${technician.id}`}
                      className="flex-1"
                    >
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={technician.availability !== "available"}
                      >
                        Book Appointment
                      </Button>
                    </Link>
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
