"use client";

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Technician } from "@/types";
import api from "@/lib/api";
import { ArrowLeft, Star, User, Clock, CheckCircle, Calendar, Award, MapPin, Phone, Mail } from 'lucide-react';

export function TechnicianProfile() {
  const { id } = useParams<{ id: string }>();
  const [technician, setTechnician] = useState<Technician | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchTechnician = async () => {
      try {
        const response = await api.get(`/technicians/${id}`);
        setTechnician(response.data.technician);
      } catch (error) {
        console.error("Failed to fetch technician:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await api.get(`/technicians/${id}/reviews`);
        setReviews(response.data.reviews);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };

    if (id) {
      fetchTechnician();
      fetchReviews();
    }
  }, [id]);

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

  if (!technician) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Technician not found</h2>
        <Link to="/app/technicians">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Technicians
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/app/technicians">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Technicians
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{technician.username}</h1>
          <p className="text-muted-foreground">Technician Profile</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">{technician.username}</CardTitle>
                  <CardDescription>{technician.email}</CardDescription>
                  <Badge
                    className={`${getAvailabilityColor(
                      technician.availability
                    )} border mt-2`}
                  >
                    {getAvailabilityIcon(technician.availability)}
                    <span className="ml-1 capitalize">
                      {technician.availability}
                    </span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Rating */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(technician.rating)
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">
                      {technician.rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Based on {technician.totalReviews} reviews
                  </p>
                </div>

                <Separator />

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{technician.email}</span>
                  </div>
                  {technician.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{technician.phone}</span>
                    </div>
                  )}
                  {technician.address && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{technician.address}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {technician.experience}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Years Experience
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      ${technician.hourlyRate}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Per Hour
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4">
                  <Link
                    to={`/app/appointments/new?technician=${technician.id}`}
                    className="w-full"
                  >
                    <Button
                      className="w-full"
                      disabled={technician.availability !== "available"}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    Send Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Specializations */}
          <Card>
            <CardHeader>
              <CardTitle>Specializations</CardTitle>
              <CardDescription>
                Areas of expertise and technical skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {technician.specialization.map((spec, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {spec}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Certifications */}
          {technician.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Certifications
                </CardTitle>
                <CardDescription>
                  Professional certifications and qualifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {technician.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 border rounded-lg"
                    >
                      <Award className="h-5 w-5 text-primary" />
                      <span className="font-medium">{cert}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>
                Recent feedback from customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground">
                    This technician hasn't received any reviews yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review: any, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "text-yellow-500 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{review.customer}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {review.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
