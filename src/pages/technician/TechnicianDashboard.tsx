"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SupportRequest, Appointment } from "@/types";
import api from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import {
  Ticket,
  Clock,
  CheckCircle,
  Calendar,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

export function TechnicianDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [recentRequests, setRecentRequests] = useState<SupportRequest[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, requestsResponse, appointmentsResponse] =
        await Promise.all([
          api.get("/technician/dashboard/stats"),
          api.get("/technician/requests?limit=5"),
          api.get("/technician/appointments?status=scheduled&limit=5"),
        ]);

      setStats(statsResponse.data.stats || {});
      setRecentRequests(requestsResponse.data.requests || []);
      setUpcomingAppointments(appointmentsResponse.data.appointments || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      // Mock data for demo
      setStats({
        assignedRequests: 12,
        completedRequests: 45,
        averageRating: 4.8,
        totalEarnings: 3250,
        activeRequests: 3,
        upcomingAppointments: 2,
      });
      setRecentRequests([]);
      setUpcomingAppointments([]);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold">Technician Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.username}! Here's your overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Requests
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeRequests || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently working on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stats.completedRequests || 0}
            </div>
            <p className="text-xs text-muted-foreground">Total completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {stats.averageRating || 0}/5
            </div>
            <p className="text-xs text-muted-foreground">
              Customer satisfaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              ${stats.totalEarnings || 0}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Link to="/app/technician/available">
                <Button className="w-full h-auto py-4 flex flex-col items-center space-y-2">
                  <Ticket className="h-6 w-6" />
                  <span>Available Requests</span>
                  <span className="text-xs opacity-70">Pick up new work</span>
                </Button>
              </Link>

              <Link to="/app/technician/requests">
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex flex-col items-center space-y-2"
                >
                  <Clock className="h-6 w-6" />
                  <span>My Requests</span>
                  <span className="text-xs opacity-70">
                    Manage current work
                  </span>
                </Button>
              </Link>

              <Link to="/app/scheduling">
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex flex-col items-center space-y-2"
                >
                  <Calendar className="h-6 w-6" />
                  <span>Schedule</span>
                  <span className="text-xs opacity-70">View your calendar</span>
                </Button>
              </Link>

              <Link to="/app/inventory">
                <Button
                  variant="outline"
                  className="w-full h-auto py-4 flex flex-col items-center space-y-2"
                >
                  <TrendingUp className="h-6 w-6" />
                  <span>Inventory</span>
                  <span className="text-xs opacity-70">Check parts</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Your recent performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Customer Satisfaction</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">
                    {stats.averageRating || 0}/5
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Completion Rate</span>
                </div>
                <span className="font-medium">98%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Avg. Response Time</span>
                </div>
                <span className="font-medium">2.5 hours</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">This Month</span>
                </div>
                <Badge variant="secondary">+15% from last month</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Requests</CardTitle>
              <Link to="/app/technician/requests">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No recent requests</h3>
                <p className="text-muted-foreground">
                  Check available requests to pick up new work.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentRequests.map((request) => (
                  <div
                    key={request._id}
                    className="flex items-center space-x-4 p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{request.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {request.customer.username}
                      </p>
                    </div>
                    <Badge variant="secondary">{request.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Appointments</CardTitle>
              <Link to="/app/appointments">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No upcoming appointments
                </h3>
                <p className="text-muted-foreground">
                  Your schedule is clear for now.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment._id}
                    className="flex items-center space-x-4 p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {appointment.client.username}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(appointment.startTime)}
                      </p>
                    </div>
                    <Badge variant="outline">{appointment.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts & Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
            Important Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">
                  Urgent Request Pending
                </h4>
                <p className="text-sm text-yellow-700">
                  You have 1 urgent support request that needs immediate
                  attention.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">
                  Appointment Reminder
                </h4>
                <p className="text-sm text-blue-700">
                  You have an appointment with Sarah Wilson in 2 hours.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
