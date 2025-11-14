import { useNavigate } from "react-router-dom";
import { Users, FileText, ClipboardList, TrendingUp, Activity, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // Mock data
  const stats = [
    {
      title: "Total Users",
      value: "2,543",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Total Notes",
      value: "8,234",
      change: "+8.2%",
      trend: "up",
      icon: FileText,
      color: "bg-green-500",
    },
    {
      title: "Active Tests",
      value: "1,892",
      change: "+15.3%",
      trend: "up",
      icon: ClipboardList,
      color: "bg-purple-500",
    },
    {
      title: "Completion Rate",
      value: "87.5%",
      change: "+3.2%",
      trend: "up",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  const recentActivities = [
    { id: 1, user: "Alice Johnson", action: "uploaded new notes", subject: "Machine Learning", time: "5 minutes ago" },
    { id: 2, user: "Bob Smith", action: "completed mock test", subject: "Data Structures", time: "12 minutes ago" },
    { id: 3, user: "Carol Williams", action: "generated AI test", subject: "Web Development", time: "28 minutes ago" },
    { id: 4, user: "David Brown", action: "uploaded new notes", subject: "Database Systems", time: "1 hour ago" },
    { id: 5, user: "Emma Davis", action: "completed mock test", subject: "Algorithms", time: "2 hours ago" },
  ];

  const userDistribution = [
    { role: "Students", count: 2234, percentage: 87.8 },
    { role: "Teachers", count: 267, percentage: 10.5 },
    { role: "Admins", count: 42, percentage: 1.7 },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor platform analytics and user activities</p>
        </div>

        {/* Gift Card Section */}
        <div
          onClick={() => navigate("/rewards")}
          className="mb-8 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.99]"
        >
          <Card className="border-border bg-card rounded-xl shadow-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-card-hover">
            <div className="flex items-center gap-4">
              <img
                src="https://m.media-amazon.com/images/I/71B3o4v7y9L._AC_SL1500_.jpg"
                alt="Amazon Gift Card"
                className="h-20 w-auto rounded-lg shadow-md"
              />
              <div>
                <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                  🎁 Gift Card Reward
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  1 Amazon Gift Card = <span className="font-semibold text-yellow-500">250 Stars</span>
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-muted-foreground text-sm mb-1">Earn stars by sharing approved notes</p>
              <p className="text-primary font-semibold text-lg">Click to Redeem Now!</p>
            </div>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border-border bg-card rounded-xl shadow-card hover:shadow-card-hover transition-base"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color}/10`}>
                    <stat.icon
                      className={`h-6 w-6 text-white`}
                      style={{ color: stat.color.replace("bg-", "") }}
                    />
                  </div>
                  <Badge
                    variant={stat.trend === "up" ? "default" : "secondary"}
                    className="rounded-md bg-green-500/10 text-green-600 border-green-500/20"
                  >
                    {stat.change}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <Card className="lg:col-span-2 border-border bg-card rounded-xl shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>Recent Activities</CardTitle>
              </div>
              <CardDescription>Latest platform activities from users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/5 transition-base"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 mt-1">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.user}</span>{" "}
                        <span className="text-muted-foreground">{activity.action}</span>{" "}
                        <span className="font-medium text-primary">
                          "{activity.subject}"
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Distribution */}
          <Card className="border-border bg-card rounded-xl shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>User Distribution</CardTitle>
              </div>
              <CardDescription>Breakdown by user roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {userDistribution.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.role}</span>
                    <span className="text-muted-foreground">{item.count}</span>
                  </div>
                  <Progress value={item.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">
                    {item.percentage}% of total
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card className="border-border bg-card rounded-xl shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Storage Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Used</span>
                  <span className="font-medium">245 GB / 500 GB</span>
                </div>
                <Progress value={49} className="h-2" />
                <p className="text-xs text-muted-foreground">49% capacity</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card rounded-xl shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">API Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Today</span>
                  <span className="font-medium">45.2K / 100K</span>
                </div>
                <Progress value={45.2} className="h-2" />
                <p className="text-xs text-muted-foreground">45.2% of daily limit</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card rounded-xl shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Current</span>
                  <span className="font-medium">1,234 users</span>
                </div>
                <Progress value={67} className="h-2" />
                <p className="text-xs text-muted-foreground">Peak: 1,856 users</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
