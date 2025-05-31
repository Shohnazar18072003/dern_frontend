"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DashboardStats } from "@/types";
import api from "@/lib/api";
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Wrench,
} from "lucide-react";

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/support-requests/dashboard/stats");
      setStats(response.data.stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatsCards = () => {
    if (user?.role === "admin") {
      return [
        {
          title: "Total Requests",
          value: stats.totalRequests || 0,
          icon: Ticket,
          description: "All support requests",
        },
        {
          title: "Open Requests",
          value: stats.openRequests || 0,
          icon: Clock,
          description: "Awaiting assignment",
        },
        {
          title: "In Progress",
          value: stats.inProgressRequests || 0,
          icon: Wrench,
          description: "Being worked on",
        },
        {
          title: "Resolved",
          value: stats.resolvedRequests || 0,
          icon: CheckCircle,
          description: "Successfully completed",
        },
        {
          title: "Urgent",
          value: stats.urgentRequests || 0,
          icon: AlertTriangle,
          description: "High priority requests",
        },
        {
          title: "Total Customers",
          value: stats.totalCustomers || 0,
          icon: Users,
          description: "Registered customers",
        },
      ];
    }

    if (user?.role === "technician") {
      return [
        {
          title: "Assigned Requests",
          value: stats.assignedRequests || 0,
          icon: Ticket,
          description: "Your total assignments",
        },
        {
          title: "Active Requests",
          value: stats.activeRequests || 0,
          icon: Clock,
          description: "Currently working on",
        },
        {
          title: "Completed",
          value: stats.completedRequests || 0,
          icon: CheckCircle,
          description: "Successfully resolved",
        },
        {
          title: "Available",
          value: stats.availableRequests || 0,
          icon: AlertTriangle,
          description: "Unassigned requests",
        },
      ];
    }

    // Customer
    return [
      {
        title: "My Requests",
        value: stats.myRequests || 0,
        icon: Ticket,
        description: "Total support requests",
      },
      {
        title: "Open",
        value: stats.openRequests || 0,
        icon: Clock,
        description: "Awaiting response",
      },
      {
        title: "In Progress",
        value: stats.inProgressRequests || 0,
        icon: Wrench,
        description: "Being worked on",
      },
      {
        title: "Resolved",
        value: stats.resolvedRequests || 0,
        icon: CheckCircle,
        description: "Successfully completed",
      },
    ];
  };

  const statsCards = getStatsCards();

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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.username}
          </p>
        </div>
        <Badge variant="secondary" className="capitalize">
          {user?.role}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for your role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user?.role === "customer" && (
              <>
                <a
                  href="/support-requests/new"
                  className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <Ticket className="h-8 w-8 mr-3 text-primary" />
                  <div>
                    <h3 className="font-medium">Create Support Request</h3>
                    <p className="text-sm text-muted-foreground">
                      Get help with your issue
                    </p>
                  </div>
                </a>
                <a
                  href="/technicians"
                  className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <Users className="h-8 w-8 mr-3 text-primary" />
                  <div>
                    <h3 className="font-medium">Find Technicians</h3>
                    <p className="text-sm text-muted-foreground">
                      Browse available experts
                    </p>
                  </div>
                </a>
              </>
            )}

            {user?.role === "technician" && (
              <>
                <a
                  href="/technician/available"
                  className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <Ticket className="h-8 w-8 mr-3 text-primary" />
                  <div>
                    <h3 className="font-medium">Available Requests</h3>
                    <p className="text-sm text-muted-foreground">
                      Pick up new work
                    </p>
                  </div>
                </a>
                <a
                  href="/technician/requests"
                  className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <Wrench className="h-8 w-8 mr-3 text-primary" />
                  <div>
                    <h3 className="font-medium">My Requests</h3>
                    <p className="text-sm text-muted-foreground">
                      Manage assigned work
                    </p>
                  </div>
                </a>
              </>
            )}

            {user?.role === "admin" && (
              <>
                <a
                  href="/app/admin/users"
                  className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <Users className="h-8 w-8 mr-3 text-primary" />
                  <div>
                    <h3 className="font-medium">Manage Users</h3>
                    <p className="text-sm text-muted-foreground">
                      User administration
                    </p>
                  </div>
                </a>
                <a
                  href="/app/admin/services"
                  className="flex items-center p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <Wrench className="h-8 w-8 mr-3 text-primary" />
                  <div>
                    <h3 className="font-medium">Manage Services</h3>
                    <p className="text-sm text-muted-foreground">
                      Service configuration
                    </p>
                  </div>
                </a>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
