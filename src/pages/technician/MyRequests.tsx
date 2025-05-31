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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SupportRequest } from "@/types";
import api from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import {
  Search,
  Filter,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";

export function MyRequests() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const fetchMyRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);

      const response = await api.get(
        `/technician/my-requests?${params.toString()}`
      );
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error("Failed to fetch my requests:", error);
      // Mock data for demo
      setRequests([
        {
          _id: "1",
          requestId: "SR-001",
          title: "Computer hardware repair",
          description: "Replace faulty motherboard and upgrade RAM",
          category: "technical-support",
          priority: "high",
          status: "in-progress",
          customer: {
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
          assignedTechnician: {
            _id: "2",
            id: "2",
            username: "Current User",
            email: "tech@example.com",
            role: "technician",
            accountType: "individual",
            phone: "+1234567891",
            address: "456 Tech Ave",
            isActive: true,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          tags: ["hardware", "motherboard", "ram"],
          isUrgent: false,
          attachments: [],
          lastActivity: "2024-01-20T14:15:00Z",
          createdAt: "2024-01-18T10:30:00Z",
          updatedAt: "2024-01-20T14:15:00Z",
        },
        {
          _id: "2",
          requestId: "SR-003",
          title: "Software installation and configuration",
          description:
            "Install and configure new accounting software for small business",
          category: "technical-support",
          priority: "medium",
          status: "pending-customer",
          customer: {
            _id: "3",
            id: "3",
            username: "Small Business Inc",
            email: "admin@smallbiz.com",
            role: "customer",
            accountType: "business",
            phone: "+1234567892",
            address: "789 Business Blvd",
            companyName: "Small Business Inc",
            isActive: true,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          assignedTechnician: {
            _id: "2",
            id: "2",
            username: "Current User",
            email: "tech@example.com",
            role: "technician",
            accountType: "individual",
            phone: "+1234567891",
            address: "456 Tech Ave",
            isActive: true,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          tags: ["software", "installation", "business"],
          isUrgent: false,
          attachments: [],
          lastActivity: "2024-01-20T16:30:00Z",
          createdAt: "2024-01-19T09:00:00Z",
          updatedAt: "2024-01-20T16:30:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchMyRequests();
  }, [fetchMyRequests]);

  const updateRequestStatus = async (
    requestId: string,
    newStatus: SupportRequest["status"]
  ) => {
    try {
      await api.patch(`/technician/requests/${requestId}/status`, {
        status: newStatus,
      });
      setRequests((prev) =>
        prev.map((request) =>
          request._id === requestId
            ? { ...request, status: newStatus }
            : request
        )
      );
    } catch (error) {
      console.error("Failed to update request status:", error);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(search.toLowerCase()) ||
      request.description.toLowerCase().includes(search.toLowerCase()) ||
      request.customer.username.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || request.status === statusFilter;
    const matchesPriority =
      !priorityFilter || request.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "pending-customer":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "resolved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "closed":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in-progress":
        return <Clock className="h-4 w-4" />;
      case "pending-customer":
        return <AlertTriangle className="h-4 w-4" />;
      case "resolved":
      case "closed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
        <h1 className="text-3xl font-bold">My Requests</h1>
        <p className="text-muted-foreground">
          Manage your assigned support requests
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
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
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="pending-customer">
                    Pending Customer
                  </SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={priorityFilter || "all"}
                defaultValue="all"
                onValueChange={(value) =>
                  setPriorityFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a priority" />
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
              <label className="text-sm font-medium">&nbsp;</label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setPriorityFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assigned
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {requests.filter((r) => r.status === "in-progress").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Customer
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {requests.filter((r) => r.status === "pending-customer").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {requests.filter((r) => r.status === "resolved").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Requests */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No assigned requests</h3>
              <p className="text-muted-foreground text-center mb-4">
                You don't have any assigned requests matching your filters.
              </p>
              <Link to="/app/technician/available">
                <Button>Browse Available Requests</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card
              key={request._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Link
                        to={`/app/support-requests/${request.requestId}`}
                        className="text-lg font-semibold hover:text-primary transition-colors"
                      >
                        {request.title}
                      </Link>
                      <Badge
                        className={`${getStatusColor(request.status)} border`}
                      >
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">
                          {request.status.replace("-", " ")}
                        </span>
                      </Badge>
                      <Badge
                        className={`${getPriorityColor(
                          request.priority
                        )} border`}
                      >
                        <span className="capitalize">{request.priority}</span>
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {request.description}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {request.customer.username}
                      </span>
                      <span>#{request.requestId}</span>
                      <span className="capitalize">
                        {request.category.replace("-", " ")}
                      </span>
                      <span>{formatDateTime(request.createdAt)}</span>
                    </div>

                    {request.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {request.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {request.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{request.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Link to={`/app/support-requests/${request.requestId}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </Link>

                    {request.status === "in-progress" && (
                      <Select
                        value=""
                        onValueChange={(value) =>
                          updateRequestStatus(
                            request._id,
                            value as SupportRequest["status"]
                          )
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Update Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending-customer">
                            Pending Customer
                          </SelectItem>
                          <SelectItem value="resolved">
                            Mark Resolved
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}

                    {request.status === "pending-customer" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateRequestStatus(request._id, "in-progress")
                        }
                      >
                        Resume Work
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
