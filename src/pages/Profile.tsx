"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { User, Settings, Star } from "lucide-react";

export function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    address: "",
    companyName: "",
    // Technician specific fields
    specialization: [] as string[],
    experience: 0,
    hourlyRate: 0,
    availability: "available",
    certifications: [] as string[],
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        phone: user.phone || "",
        address: user.address || "",
        companyName: user.companyName || "",
        specialization: (user as any).specialization || [],
        experience: (user as any).experience || 0,
        hourlyRate: (user as any).hourlyRate || 0,
        availability: (user as any).availability || "available",
        certifications: (user as any).certifications || [],
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const updateData: any = {
        username: formData.username,
        phone: formData.phone,
        address: formData.address,
      };

      if (user?.accountType === "business") {
        updateData.companyName = formData.companyName;
      }

      await api.put("/auth/profile", updateData);

      // Update technician profile if user is a technician
      if (user?.role === "technician") {
        await api.put("/technicians/profile", {
          specialization: formData.specialization,
          experience: formData.experience,
          hourlyRate: formData.hourlyRate,
          certifications: formData.certifications,
        });

        await api.patch("/technicians/availability", {
          availability: formData.availability,
        });
      }

      setSuccess("Profile updated successfully!");
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleArrayChange = (name: string, value: string) => {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, [name]: items }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold">{user?.username}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge variant="secondary" className="mt-1 capitalize">
                    {user?.role}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">
                    Account Type:
                  </span>
                  <p className="font-medium capitalize">{user?.accountType}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Member Since:
                  </span>
                  <p className="font-medium">
                    {new Date(user?.createdAt || "").toLocaleDateString()}
                  </p>
                </div>
                {user?.role === "technician" && (
                  <>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Rating:
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">
                          {(user as any).rating?.toFixed(1) || "0.0"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ({(user as any).totalReviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Account Information
              </CardTitle>
              <CardDescription>
                Update your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                    {success}
                  </div>
                )}

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Basic Information</h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={2}
                    />
                  </div>

                  {user?.accountType === "business" && (
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                      />
                    </div>
                  )}
                </div>

                {/* Technician Specific Fields */}
                {user?.role === "technician" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      Professional Information
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="experience">Experience (years)</Label>
                        <Input
                          id="experience"
                          name="experience"
                          type="number"
                          min="0"
                          value={formData.experience}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                        <Input
                          id="hourlyRate"
                          name="hourlyRate"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.hourlyRate}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability</Label>
                    <Select
                        name="availability"
                        value={formData.availability || "available"}
                        onValueChange={(value) =>
                            setFormData((prev) => ({
                                ...prev,
                                availability: value,
                            }))
                        }
                    >
                        <SelectTrigger className="w-full" id="availability">
                            <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="busy">Busy</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specializations</Label>
                      <Input
                        id="specialization"
                        placeholder="e.g., Hardware, Software, Networking (comma-separated)"
                        value={formData.specialization.join(", ")}
                        onChange={(e) =>
                          handleArrayChange("specialization", e.target.value)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter your areas of expertise, separated by commas
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="certifications">Certifications</Label>
                      <Input
                        id="certifications"
                        placeholder="e.g., CompTIA A+, CISSP, AWS Certified (comma-separated)"
                        value={formData.certifications.join(", ")}
                        onChange={(e) =>
                          handleArrayChange("certifications", e.target.value)
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        List your professional certifications, separated by
                        commas
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update Profile"}
                  </Button>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
