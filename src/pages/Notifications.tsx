"use client";

import { useState, useEffect } from "react";
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
import type { Notification } from "@/types";
import api from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  MessageSquare,
  Calendar,
  Ticket,
  AlertTriangle,
} from "lucide-react";

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      // Mock data for demo
      setNotifications([
        {
          _id: "1",
          user: "user1",
          type: "support_request",
          content:
            "Your support request #SR-001 has been assigned to Mike Johnson",
          isRead: false,
          createdAt: "2024-01-20T10:30:00Z",
          updatedAt: "2024-01-20T10:30:00Z",
        },
        {
          _id: "2",
          user: "user1",
          type: "appointment",
          content:
            "Appointment reminder: You have an appointment with Sarah Wilson tomorrow at 2:00 PM",
          isRead: false,
          createdAt: "2024-01-19T15:00:00Z",
          updatedAt: "2024-01-19T15:00:00Z",
        },
        {
          _id: "3",
          user: "user1",
          type: "message",
          content:
            "New message from technician regarding your hardware repair request",
          isRead: true,
          readAt: "2024-01-19T09:15:00Z",
          createdAt: "2024-01-19T09:00:00Z",
          updatedAt: "2024-01-19T09:15:00Z",
        },
        {
          _id: "4",
          user: "user1",
          type: "system",
          content:
            "Your account has been successfully verified. Welcome to Dern Support!",
          isRead: true,
          readAt: "2024-01-18T14:20:00Z",
          createdAt: "2024-01-18T14:00:00Z",
          updatedAt: "2024-01-18T14:20:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId)
      );
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "appointment":
        return <Calendar className="h-5 w-5 text-green-500" />;
      case "support_request":
        return <Ticket className="h-5 w-5 text-orange-500" />;
      case "system":
        return <AlertTriangle className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.isRead;
    if (filter === "read") return notification.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with your latest activities and messages
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === "read" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("read")}
            >
              Read ({notifications.length - unreadCount})
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {filter === "unread"
                  ? "No unread notifications"
                  : "No notifications"}
              </h3>
              <p className="text-muted-foreground text-center">
                {filter === "unread"
                  ? "You're all caught up! No new notifications to read."
                  : "You don't have any notifications yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card
              key={notification._id}
              className={`hover:shadow-md transition-shadow ${
                !notification.isRead ? "border-l-4 border-l-primary" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            !notification.isRead ? "font-medium" : ""
                          }`}
                        >
                          {notification.content}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge
                            variant="secondary"
                            className="text-xs capitalize"
                          >
                            {notification.type.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(notification.createdAt)}
                          </span>
                          {notification.isRead && notification.readAt && (
                            <span className="text-xs text-muted-foreground">
                              • Read {formatDateTime(notification.readAt)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification._id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Manage how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Push Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Receive browser push notifications
                </p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">SMS Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Receive urgent notifications via SMS
                </p>
              </div>
              <Button variant="outline" size="sm">
                Setup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
