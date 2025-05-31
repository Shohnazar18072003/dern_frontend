"use client";

import { useState, useEffect } from "react";
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
  TrendingDown,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
} from "lucide-react";

export function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [loading, setLoading] = useState(true);

  // Mock data
  const [analyticsData] = useState({
    overview: {
      totalRequests: 1247,
      resolvedRequests: 1089,
      avgResolutionTime: 4.2,
      customerSatisfaction: 4.7,
      revenue: 45680,
      activeCustomers: 342,
    },
    trends: {
      requestsTrend: 12.5,
      resolutionTrend: -8.3,
      satisfactionTrend: 5.2,
      revenueTrend: 18.7,
    },
  });

  const requestsByCategory = [
    { name: "Hardware", value: 35, count: 437 },
    { name: "Software", value: 28, count: 349 },
    { name: "Network", value: 18, count: 224 },
    { name: "Security", value: 12, count: 150 },
    { name: "Other", value: 7, count: 87 },
  ];

  const monthlyRequests = [
    { month: "Jan", requests: 98, resolved: 89, revenue: 3200 },
    { month: "Feb", requests: 112, resolved: 105, revenue: 3800 },
    { month: "Mar", requests: 125, resolved: 118, revenue: 4200 },
    { month: "Apr", requests: 108, resolved: 102, revenue: 3900 },
    { month: "May", requests: 134, resolved: 128, revenue: 4600 },
    { month: "Jun", requests: 145, resolved: 138, revenue: 5100 },
  ];

  const resolutionTimes = [
    { priority: "Urgent", avgTime: 2.1, target: 2.0 },
    { priority: "High", avgTime: 4.3, target: 4.0 },
    { priority: "Medium", avgTime: 8.7, target: 8.0 },
    { priority: "Low", avgTime: 15.2, target: 16.0 },
  ];

  const topIssues = [
    { issue: "Slow computer performance", count: 89, trend: "up" },
    { issue: "Email configuration", count: 76, trend: "down" },
    { issue: "Network connectivity", count: 65, trend: "up" },
    { issue: "Software installation", count: 54, trend: "stable" },
    { issue: "Hardware failure", count: 43, trend: "down" },
  ];

  const customerSatisfactionData = [
    { rating: "5 Stars", count: 687, percentage: 62 },
    { rating: "4 Stars", count: 298, percentage: 27 },
    { rating: "3 Stars", count: 89, percentage: 8 },
    { rating: "2 Stars", count: 22, percentage: 2 },
    { rating: "1 Star", count: 11, percentage: 1 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  }, [timeRange]);

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
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Insights and trends to inform management decisions
          </p>
        </div>
        <Select
          value={timeRange || "all"}
          defaultValue="all"
          onValueChange={(value) => setTimeRange(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
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
              {analyticsData.overview.totalRequests.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />+
              {analyticsData.trends.requestsTrend}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.resolvedRequests.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              {analyticsData.trends.resolutionTrend}%
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
              {analyticsData.overview.avgResolutionTime}h
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
              {analyticsData.overview.customerSatisfaction}/5
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />+
              {analyticsData.trends.satisfactionTrend}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analyticsData.overview.revenue.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />+
              {analyticsData.trends.revenueTrend}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.overview.activeCustomers}
            </div>
            <div className="text-xs text-muted-foreground">This month</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Requests Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Requests Trend</CardTitle>
            <CardDescription>
              Support requests and resolution rates over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRequests}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="requests"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="resolved"
                  stroke="#82ca9d"
                  strokeWidth={2}
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
                  data={requestsByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {requestsByCategory.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
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
              <BarChart data={resolutionTimes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgTime" fill="#8884d8" name="Actual" />
                <Bar dataKey="target" fill="#82ca9d" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Satisfaction */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Satisfaction</CardTitle>
            <CardDescription>
              Rating distribution from customer feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customerSatisfactionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{item.rating}</span>
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.count} ({item.percentage}%)
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Top Issues</CardTitle>
          <CardDescription>
            Most common problems reported by customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topIssues.map((issue, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl font-bold text-muted-foreground">
                    #{index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{issue.issue}</h3>
                    <p className="text-sm text-muted-foreground">
                      {issue.count} reports
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {issue.trend === "up" && (
                    <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Trending Up
                    </Badge>
                  )}
                  {issue.trend === "down" && (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Trending Down
                    </Badge>
                  )}
                  {issue.trend === "stable" && (
                    <Badge variant="secondary">Stable</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
