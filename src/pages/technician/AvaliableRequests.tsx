"use client";

import { useState, useEffect, useCallback } from "react";
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
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export function AvailableRequests() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const fetchAvailableRequests = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append("status", "open");
      if (search) params.append("search", search);
      if (categoryFilter) params.append("category", categoryFilter);
      if (priorityFilter) params.append("priority", priorityFilter);

      const response = await api.get(
        `/technician/available-requests?${params.toString()}`
      );
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error("Failed to fetch available requests:", error);
      // Mock data for demo
      setRequests([
        {
          _id: "1",
          requestId: "SR-001",
          title: "Computer won't start after power outage",
          description:
            "Desktop computer not turning on after yesterday's power outage. No lights or fans spinning.",
          category: "technical-support",
          priority: "high",
          status: "open",
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
          tags: ["hardware", "power", "desktop"],
          isUrgent: false,
          createdAt: "2024-01-20T10:30:00Z",
          updatedAt: "2024-01-20T10:30:00Z",
          attachments: [],
          lastActivity: "2024-01-20T10:30:00Z",
        },
        {
          _id: "2",
          requestId: "SR-002",
          title: "Network connectivity issues in office",
          description:
            "Multiple computers in the office losing internet connection intermittently.",
          category: "technical-support",
          priority: "urgent",
          status: "open",
          customer: {
            _id: "2",
            id: "2",
            username: "ABC Corporation",
            email: "it@abc-corp.com",
            role: "customer",
            accountType: "business",
            phone: "+1234567891",
            address: "456 Business Ave",
            companyName: "ABC Corporation",
            isActive: true,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01",
          },
          tags: ["network", "office", "connectivity"],
          isUrgent: true,
          createdAt: "2024-01-20T14:15:00Z",
          updatedAt: "2024-01-20T14:15:00Z",
          attachments: [],
          lastActivity: "2024-01-20T14:15:00Z",
        },
      ]);
      setLoading(false);
    }
  }, [search, categoryFilter, priorityFilter]);

  useEffect(() => {
    fetchAvailableRequests();
  }, [search, categoryFilter, priorityFilter, fetchAvailableRequests]);

  const assignRequest = async (requestId: string) => {
    try {
      await api.post(`/technician/assign-request/${requestId}`);
      setRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );
    } catch (error) {
      console.error("Failed to assign request:", error);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.title.toLowerCase().includes(search.toLowerCase()) ||
      request.description.toLowerCase().includes(search.toLowerCase()) ||
      request.customer.username.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !categoryFilter || request.category === categoryFilter;
    const matchesPriority =
      !priorityFilter || request.priority === priorityFilter;
    return matchesSearch && matchesCategory && matchesPriority;
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4" />;
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
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
      <div>
        <h1 className="text-3xl font-bold">Available Requests</h1>
        <p className="text-muted-foreground">
          Pick up new support requests to work on
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
              <label className="text-sm font-medium">Category</label>
              <Select
                value={categoryFilter || "all"}
                defaultValue="all"
                onValueChange={(value) =>
                  setCategoryFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="technical-support">
                    Technical Support
                  </SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="account-issues">Account Issues</SelectItem>
                  <SelectItem value="feature-request">
                    Feature Request
                  </SelectItem>
                  <SelectItem value="bug-report">Bug Report</SelectItem>
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
                  setCategoryFilter("");
                  setPriorityFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Requests */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No available requests
              </h3>
              <p className="text-muted-foreground text-center">
                All requests have been assigned or no requests match your
                filters.
              </p>
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
                      <h3 className="text-lg font-semibold">{request.title}</h3>
                      <Badge
                        className={`${getPriorityColor(
                          request.priority
                        )} border`}
                      >
                        {getPriorityIcon(request.priority)}
                        <span className="ml-1 capitalize">
                          {request.priority}
                        </span>
                      </Badge>
                      {request.isUrgent && (
                        <Badge variant="destructive" className="text-xs">
                          URGENT
                        </Badge>
                      )}
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
                    <Button onClick={() => assignRequest(request._id)}>
                      Assign to Me
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
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
