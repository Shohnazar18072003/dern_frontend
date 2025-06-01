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
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
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
  Settings,
  TestTube,
  Loader2,
} from "lucide-react";

interface NotificationSettings {
  emailNotifications: {
    enabled: boolean;
    supportRequests: boolean;
    appointments: boolean;
    messages: boolean;
    systemUpdates: boolean;
    marketing: boolean;
  };
  pushNotifications: {
    enabled: boolean;
    supportRequests: boolean;
    appointments: boolean;
    messages: boolean;
  };
  smsNotifications: {
    enabled: boolean;
    phoneNumber: string;
    urgentOnly: boolean;
  };
  inAppNotifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [testingNotification, setTestingNotification] = useState<string | null>(
    null
  );

  useEffect(() => {
    fetchNotifications();
    fetchNotificationSettings();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/notifications");
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationSettings = async () => {
    try {
      const response = await api.get("/notification-settings");
      setSettings(response.data.settings);
    } catch (error) {
      console.error("Failed to fetch notification settings:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await api.patch(`/notifications/${notificationId}`);
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
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      // Mark all unread notifications as read
      await Promise.all(
        unreadNotifications.map((notification) =>
          api.patch(`/notifications/${notification._id}`)
        )
      );

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId)
      );
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Failed to delete notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const updateNotificationSettings = async (
    updatedSettings: Partial<NotificationSettings>
  ) => {
    try {
      setSettingsLoading(true);
      const response = await api.put("/notification-settings", updatedSettings);
      setSettings(response.data.settings);
      toast.success("Notification settings updated");
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      toast.error("Failed to update notification settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  const testNotification = async (type: "email" | "push") => {
    try {
      setTestingNotification(type);
      await api.post("/notification-settings/test", { type });
      toast.success(`Test ${type} notification sent`);
    } catch (error) {
      console.error(`Failed to send test ${type} notification:`, error);
      toast.error(`Failed to send test ${type} notification`);
    } finally {
      setTestingNotification(null);
    }
  };

  const enablePushNotifications = async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        toast.error("Push notifications are not supported in this browser");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Push notification permission denied");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      await api.post("/notification-settings/push/subscribe", {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode(
              ...new Uint8Array(subscription.getKey("p256dh")!)
            )
          ),
          auth: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))
          ),
        },
      });

      await fetchNotificationSettings();
      toast.success("Push notifications enabled");
    } catch (error) {
      console.error("Failed to enable push notifications:", error);
      toast.error("Failed to enable push notifications");
    }
  };

  const disablePushNotifications = async () => {
    try {
      await api.post("/notification-settings/push/unsubscribe");
      await fetchNotificationSettings();
      toast.success("Push notifications disabled");
    } catch (error) {
      console.error("Failed to disable push notifications:", error);
      toast.error("Failed to disable push notifications");
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
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Notification Settings</DialogTitle>
                <DialogDescription>
                  Manage how you receive notifications
                </DialogDescription>
              </DialogHeader>

              {settings && (
                <div className="space-y-6">
                  {/* Email Notifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Email Notifications
                      </CardTitle>
                      <CardDescription>
                        Receive notifications via email
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-enabled">
                          Enable email notifications
                        </Label>
                        <Switch
                          id="email-enabled"
                          checked={settings.emailNotifications.enabled}
                          onCheckedChange={(checked) =>
                            updateNotificationSettings({
                              emailNotifications: {
                                ...settings.emailNotifications,
                                enabled: checked,
                              },
                            })
                          }
                        />
                      </div>

                      {settings.emailNotifications.enabled && (
                        <div className="space-y-3 pl-4 border-l-2 border-muted">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="email-support">
                              Support requests
                            </Label>
                            <Switch
                              id="email-support"
                              checked={
                                settings.emailNotifications.supportRequests
                              }
                              onCheckedChange={(checked) =>
                                updateNotificationSettings({
                                  emailNotifications: {
                                    ...settings.emailNotifications,
                                    supportRequests: checked,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="email-appointments">
                              Appointments
                            </Label>
                            <Switch
                              id="email-appointments"
                              checked={settings.emailNotifications.appointments}
                              onCheckedChange={(checked) =>
                                updateNotificationSettings({
                                  emailNotifications: {
                                    ...settings.emailNotifications,
                                    appointments: checked,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="email-messages">Messages</Label>
                            <Switch
                              id="email-messages"
                              checked={settings.emailNotifications.messages}
                              onCheckedChange={(checked) =>
                                updateNotificationSettings({
                                  emailNotifications: {
                                    ...settings.emailNotifications,
                                    messages: checked,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="email-system">System updates</Label>
                            <Switch
                              id="email-system"
                              checked={
                                settings.emailNotifications.systemUpdates
                              }
                              onCheckedChange={(checked) =>
                                updateNotificationSettings({
                                  emailNotifications: {
                                    ...settings.emailNotifications,
                                    systemUpdates: checked,
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testNotification("email")}
                          disabled={testingNotification === "email"}
                        >
                          {testingNotification === "email" ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4 mr-2" />
                          )}
                          Test Email
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Push Notifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Push Notifications
                      </CardTitle>
                      <CardDescription>
                        Receive browser push notifications
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-enabled">
                          Enable push notifications
                        </Label>
                        <Switch
                          id="push-enabled"
                          checked={settings.pushNotifications.enabled}
                          onCheckedChange={(checked) =>
                            checked
                              ? enablePushNotifications()
                              : disablePushNotifications()
                          }
                        />
                      </div>

                      {settings.pushNotifications.enabled && (
                        <div className="space-y-3 pl-4 border-l-2 border-muted">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="push-support">
                              Support requests
                            </Label>
                            <Switch
                              id="push-support"
                              checked={
                                settings.pushNotifications.supportRequests
                              }
                              onCheckedChange={(checked) =>
                                updateNotificationSettings({
                                  pushNotifications: {
                                    ...settings.pushNotifications,
                                    supportRequests: checked,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="push-appointments">
                              Appointments
                            </Label>
                            <Switch
                              id="push-appointments"
                              checked={settings.pushNotifications.appointments}
                              onCheckedChange={(checked) =>
                                updateNotificationSettings({
                                  pushNotifications: {
                                    ...settings.pushNotifications,
                                    appointments: checked,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="push-messages">Messages</Label>
                            <Switch
                              id="push-messages"
                              checked={settings.pushNotifications.messages}
                              onCheckedChange={(checked) =>
                                updateNotificationSettings({
                                  pushNotifications: {
                                    ...settings.pushNotifications,
                                    messages: checked,
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testNotification("push")}
                          disabled={
                            testingNotification === "push" ||
                            !settings.pushNotifications.enabled
                          }
                        >
                          {testingNotification === "push" ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <TestTube className="h-4 w-4 mr-2" />
                          )}
                          Test Push
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* SMS Notifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        SMS Notifications
                      </CardTitle>
                      <CardDescription>
                        Receive urgent notifications via SMS
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sms-enabled">
                          Enable SMS notifications
                        </Label>
                        <Switch
                          id="sms-enabled"
                          checked={settings.smsNotifications.enabled}
                          onCheckedChange={(checked) =>
                            updateNotificationSettings({
                              smsNotifications: {
                                ...settings.smsNotifications,
                                enabled: checked,
                              },
                            })
                          }
                        />
                      </div>

                      {settings.smsNotifications.enabled && (
                        <div className="space-y-3 pl-4 border-l-2 border-muted">
                          <div className="space-y-2">
                            <Label htmlFor="phone-number">Phone Number</Label>
                            <Input
                              id="phone-number"
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              value={
                                settings.smsNotifications.phoneNumber || ""
                              }
                              onChange={(e) =>
                                updateNotificationSettings({
                                  smsNotifications: {
                                    ...settings.smsNotifications,
                                    phoneNumber: e.target.value,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="sms-urgent">
                              Urgent notifications only
                            </Label>
                            <Switch
                              id="sms-urgent"
                              checked={settings.smsNotifications.urgentOnly}
                              onCheckedChange={(checked) =>
                                updateNotificationSettings({
                                  smsNotifications: {
                                    ...settings.smsNotifications,
                                    urgentOnly: checked,
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                      )}

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          SMS notifications are currently not available. This
                          feature will be enabled in a future update.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* In-App Notifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        In-App Notifications
                      </CardTitle>
                      <CardDescription>
                        Control in-app notification behavior
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="inapp-enabled">
                          Enable in-app notifications
                        </Label>
                        <Switch
                          id="inapp-enabled"
                          checked={settings.inAppNotifications.enabled}
                          onCheckedChange={(checked) =>
                            updateNotificationSettings({
                              inAppNotifications: {
                                ...settings.inAppNotifications,
                                enabled: checked,
                              },
                            })
                          }
                        />
                      </div>

                      {settings.inAppNotifications.enabled && (
                        <div className="space-y-3 pl-4 border-l-2 border-muted">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="inapp-sound">
                              Sound notifications
                            </Label>
                            <Switch
                              id="inapp-sound"
                              checked={settings.inAppNotifications.sound}
                              onCheckedChange={(checked) =>
                                updateNotificationSettings({
                                  inAppNotifications: {
                                    ...settings.inAppNotifications,
                                    sound: checked,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <Label htmlFor="inapp-desktop">
                              Desktop notifications
                            </Label>
                            <Switch
                              id="inapp-desktop"
                              checked={settings.inAppNotifications.desktop}
                              onCheckedChange={(checked) =>
                                updateNotificationSettings({
                                  inAppNotifications: {
                                    ...settings.inAppNotifications,
                                    desktop: checked,
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
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
    </div>
  );
}
