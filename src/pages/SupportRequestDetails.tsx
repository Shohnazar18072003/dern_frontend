"use client";

import type React from "react";

import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SupportRequest, Message } from "@/types";
import api from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import {
  ArrowLeft,
  Send,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
} from "lucide-react";

export function SupportRequestDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [request, setRequest] = useState<SupportRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const fetchRequest = useCallback(async () => {
    try {
      const response = await api.get(`/support-requests/${id}`);
      setRequest(response.data.request);
    } catch (error) {
      console.error("Failed to fetch request:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await api.get(`/support-requests/${id}/messages`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchRequest();
      fetchMessages();
    }
  }, [fetchMessages, fetchRequest, id]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    try {
      await api.post(`/support-requests/${id}/messages`, {
        content: newMessage,
        messageType: "text",
      });
      setNewMessage("");
      fetchMessages();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  const submitRating = async () => {
    try {
      await api.post(`/support-requests/${id}/rating`, {
        rating,
        feedback,
      });
      fetchRequest();
    } catch (error) {
      console.error("Failed to submit rating:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <Clock className="h-4 w-4" />;
      case "in-progress":
        return <AlertTriangle className="h-4 w-4" />;
      case "resolved":
      case "closed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "in-progress":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "resolved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "closed":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
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

  if (!request) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Request not found</h2>
        <Button onClick={() => navigate("/support-requests")}>
          Back to Requests
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/support-requests")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Requests
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{request.title}</h1>
          <p className="text-muted-foreground">Request #{request.requestId}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Request Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Request Details</CardTitle>
                <div className="flex space-x-2">
                  <Badge className={`${getStatusColor(request.status)} border`}>
                    {getStatusIcon(request.status)}
                    <span className="ml-1 capitalize">
                      {request.status.replace("-", " ")}
                    </span>
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {request.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{request.description}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-1">Category</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {request.category.replace("-", " ")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Created</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(request.createdAt)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Customer</h4>
                    <p className="text-sm text-muted-foreground">
                      {request.customer.username}
                    </p>
                  </div>
                  {request.assignedTechnician && (
                    <div>
                      <h4 className="font-medium mb-1">Assigned Technician</h4>
                      <p className="text-sm text-muted-foreground">
                        {request.assignedTechnician.username}
                      </p>
                    </div>
                  )}
                </div>

                {request.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {request.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Communication history for this request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.sender._id === user?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender._id === user?.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <User className="h-3 w-3" />
                        <span className="text-xs font-medium">
                          {message.sender.username}
                        </span>
                        <span className="text-xs opacity-70">
                          {formatDateTime(message.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Send Message Form */}
              <form onSubmit={sendMessage} className="mt-4 flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={sendingMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Rating Section */}
          {user?.role === "customer" &&
            (request.status === "resolved" || request.status === "closed") &&
            !request.customerSatisfaction && (
              <Card>
                <CardHeader>
                  <CardTitle>Rate This Support</CardTitle>
                  <CardDescription>
                    Help us improve by rating your experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Rating
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`p-1 ${
                              star <= rating
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }`}
                          >
                            <Star className="h-6 w-6 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Feedback (optional)
                      </label>
                      <Textarea
                        placeholder="Share your experience..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Button onClick={submitRating} disabled={rating === 0}>
                      Submit Rating
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {user?.role === "technician" && !request.assignedTechnician && (
                <Button className="w-full">Assign to Me</Button>
              )}
              {user?.role === "admin" && (
                <>
                  <Button variant="outline" className="w-full">
                    Assign Technician
                  </Button>
                  <Button variant="outline" className="w-full">
                    Update Status
                  </Button>
                </>
              )}
              <Button variant="outline" className="w-full">
                Export Details
              </Button>
            </CardContent>
          </Card>

          {request.customerSatisfaction && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= request.customerSatisfaction!.rating
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium">
                      {request.customerSatisfaction.rating}/5
                    </span>
                  </div>
                  {request.customerSatisfaction.feedback && (
                    <p className="text-sm text-muted-foreground">
                      {request.customerSatisfaction.feedback}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
