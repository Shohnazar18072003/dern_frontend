"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Activity,
} from "lucide-react";

interface DashboardStats {
  totalUsers?: number;
  totalRequests?: number;
  totalRevenue?: number;
  activeRequests?: number;
  newUsers?: number;
  newRequests?: number;
  avgResolutionTime?: number;
  satisfactionRating?: number;
  assignedRequests?: number;
  completedRequests?: number;
  avgRating?: number;
  myRequests?: number;
  openRequests?: number;
  resolvedRequests?: number;
  totalSpent?: number;
}

interface SupportRequestAnalytics {
  requestsByDay: Array<{
    _id: { date: string; status: string };
    count: number;
  }>;
  categoryStats: Array<{ _id: string; count: number }>;
  priorityStats: Array<{ _id: string; count: number }>;
  avgResolutionTime: number;
}

interface PerformanceMetrics {
  responseTime: {
    avgResponseTime?: number;
    minResponseTime?: number;
    maxResponseTime?: number;
  };
  satisfaction: {
    avgRating?: number;
    totalRatings?: number;
  };
  technicianPerformance: Array<{
    technicianName: string;
    totalRequests: number;
    resolvedRequests: number;
    resolutionRate: number;
    avgRating: number;
  }>;
}

export function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({});
  const [supportRequestAnalytics, setSupportRequestAnalytics] =
    useState<SupportRequestAnalytics>({
      requestsByDay: [],
      categoryStats: [],
      priorityStats: [],
      avgResolutionTime: 0,
    });
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics>({
      responseTime: {},
      satisfaction: {},
      technicianPerformance: [],
    });

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const dashboardResponse = await axios.get(
        `/api/v1/analytics/dashboard?timeRange=${timeRange}`
      );
      setDashboardStats(dashboardResponse.data.stats);

      // Fetch support request analytics
      const supportResponse = await axios.get(
        `/api/v1/analytics/support-requests?timeRange=${timeRange}`
      );
      setSupportRequestAnalytics(supportResponse.data);

      // Fetch performance metrics
      const performanceResponse = await axios.get(
        `/api/v1/analytics/performance?timeRange=${timeRange}`
      );
      setPerformanceMetrics(performanceResponse.data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData, timeRange]);

  // Transform data for charts
  const transformRequestsByDay = () => {
    const dailyData: {
      [key: string]: {
        date: string;
        total: number;
        resolved: number;
        inProgress: number;
      };
    } = {};

    supportRequestAnalytics.requestsByDay.forEach((item) => {
      const date = item._id.date;
      if (!dailyData[date]) {
        dailyData[date] = { date, total: 0, resolved: 0, inProgress: 0 };
      }

      dailyData[date].total += item.count;
      if (item._id.status === "resolved" || item._id.status === "closed") {
        dailyData[date].resolved += item.count;
      } else if (item._id.status === "in-progress") {
        dailyData[date].inProgress += item.count;
      }
    });

    return Object.values(dailyData).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  };

  const transformCategoryData = () => {
    const total = supportRequestAnalytics.categoryStats.reduce(
      (sum, item) => sum + item.count,
      0
    );
    return supportRequestAnalytics.categoryStats.map((item) => ({
      name: item._id,
      value: Math.round((item.count / total) * 100),
      count: item.count,
    }));
  };

  const transformPriorityData = () => {
    const priorityOrder = ["low", "medium", "high", "urgent"];
    return priorityOrder.map((priority) => {
      const item = supportRequestAnalytics.priorityStats.find(
        (p) => p._id === priority
      );
      return {
        priority: priority.charAt(0).toUpperCase() + priority.slice(1),
        count: item?.count || 0,
        avgTime:
          priority === "urgent"
            ? 2.1
            : priority === "high"
            ? 4.3
            : priority === "medium"
            ? 8.7
            : 15.2,
        target:
          priority === "urgent"
            ? 2.0
            : priority === "high"
            ? 4.0
            : priority === "medium"
            ? 8.0
            : 16.0,
      };
    });
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const dailyRequestsData = transformRequestsByDay();
  const categoryData = transformCategoryData();
  const priorityData = transformPriorityData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Insights and trends to inform management decisions
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                dashboardStats.totalRequests ||
                dashboardStats.myRequests ||
                0
              ).toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {dashboardStats.newRequests || 0} new
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active/Resolved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                dashboardStats.activeRequests ||
                dashboardStats.resolvedRequests ||
                dashboardStats.completedRequests ||
                0
              ).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {dashboardStats.activeRequests ? "Active" : "Resolved"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Resolution
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                dashboardStats.avgResolutionTime ||
                supportRequestAnalytics.avgResolutionTime ||
                0
              ).toFixed(1)}
              h
            </div>
            <div className="text-xs text-muted-foreground">Target: 4.0h</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                dashboardStats.satisfactionRating ||
                dashboardStats.avgRating ||
                performanceMetrics.satisfaction.avgRating ||
                0
              ).toFixed(1)}
              /5
            </div>
            <div className="text-xs text-muted-foreground">
              {performanceMetrics.satisfaction.totalRatings || 0} ratings
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue/Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {(
                dashboardStats.totalRevenue ||
                dashboardStats.totalSpent ||
                0
              ).toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              {dashboardStats.totalRevenue ? "Total Revenue" : "Total Spent"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Users/Response Time
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.totalUsers
                ? dashboardStats.totalUsers.toLocaleString()
                : `${(
                    performanceMetrics.responseTime.avgResponseTime || 0
                  ).toFixed(1)}h`}
            </div>
            <div className="text-xs text-muted-foreground">
              {dashboardStats.totalUsers
                ? `${dashboardStats.newUsers || 0} new`
                : "Avg Response"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Requests Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Requests Trend</CardTitle>
            <CardDescription>
              Support requests and resolution rates over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRequestsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Total Requests"
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Resolved"
                />
                <Line
                  type="monotone"
                  dataKey="inProgress"
                  stroke="#ffc658"
                  strokeWidth={2}
                  name="In Progress"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Requests by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Requests by Category</CardTitle>
            <CardDescription>
              Distribution of support request types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value}%`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Resolution Times by Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Resolution Times by Priority</CardTitle>
            <CardDescription>
              Average resolution time vs targets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgTime" fill="#8884d8" name="Actual (hours)" />
                <Bar dataKey="target" fill="#82ca9d" name="Target (hours)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Technician Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Technician Performance</CardTitle>
            <CardDescription>
              Top performing technicians by resolution rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceMetrics.technicianPerformance
                .slice(0, 5)
                .map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {tech.technicianName}
                      </span>
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${tech.resolutionRate * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {Math.round(tech.resolutionRate * 100)}% (
                      {tech.resolvedRequests}/{tech.totalRequests})
                    </div>
                  </div>
                ))}
              {performanceMetrics.technicianPerformance.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No technician performance data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Request Priority Distribution</CardTitle>
          <CardDescription>
            Breakdown of requests by priority level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {priorityData.map((priority, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-4 border rounded-lg"
              >
                <div className="text-2xl font-bold text-muted-foreground">
                  {priority.count}
                </div>
                <div className="text-sm font-medium">{priority.priority}</div>
                <Badge
                  className={`mt-2 ${
                    priority.priority === "Urgent"
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : priority.priority === "High"
                      ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                      : priority.priority === "Medium"
                      ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      : "bg-green-500/10 text-green-500 border-green-500/20"
                  }`}
                >
                  {priority.avgTime.toFixed(1)}h avg
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
