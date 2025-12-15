"use client";

import { useGlobalStore } from "@/app/store/global";
import {
  AddGameDialog,
  AddTeamDialog,
  AddVenueDialog,
} from "@/components/dialogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { format, isThisWeek, parseISO } from "date-fns";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  CheckCircle,
  MapPin,
  PieChart,
  Plus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [showAddGame, setShowAddGame] = useState(false);
  const { games, teams, venues, getConstraintViolations } = useGlobalStore();

  // Analytics calculations
  const totalConflicts = games.reduce((acc, game) => {
    return acc + getConstraintViolations(game.id).length;
  }, 0);

  const thisWeekGames = games.filter((game) =>
    isThisWeek(parseISO(game.startTime))
  );
  const confirmedGames = games.filter(
    (game) => getConstraintViolations(game.id).length === 0
  );
  const conflictedGames = games.filter(
    (game) => getConstraintViolations(game.id).length > 0
  );

  const scheduleHealth =
    games.length > 0
      ? Math.round((confirmedGames.length / games.length) * 100)
      : 0;
  const weeklyUtilization =
    venues.reduce((acc, venue) => {
      const venueGames = thisWeekGames.filter(
        (game) => game.venueId === venue.id
      );
      return acc + venueGames.length * 2; // Assuming 2 hours per game
    }, 0) /
    (venues.length * 7 * 12); // 12 available hours per day

  const upcomingGames = games
    .filter((game) => new Date(game.startTime) > new Date())
    .slice(0, 6);

  // Key metrics
  const metrics = [
    {
      title: "Total Games",
      value: games.length.toString(),
      change: "+12%",
      changeType: "positive",
      icon: Calendar,
      description: "Scheduled games",
    },
    {
      title: "Schedule Health",
      value: `${scheduleHealth}%`,
      change: scheduleHealth > 85 ? "+5%" : "-3%",
      changeType: scheduleHealth > 85 ? "positive" : "negative",
      icon: Activity,
      description: "Games without conflicts",
    },
    {
      title: "Active Teams",
      value: teams.length.toString(),
      change: "+2",
      changeType: "positive",
      icon: Users,
      description: "Participating teams",
    },
    {
      title: "Venue Utilization",
      value: `${Math.round(weeklyUtilization * 100)}%`,
      change: "+8%",
      changeType: "positive",
      icon: MapPin,
      description: "Weekly venue usage",
    },
  ];

  // Venue performance data
  const venuePerformance = venues
    .map((venue) => {
      const venueGames = games.filter((game) => game.venueId === venue.id);
      const venueConflicts = venueGames.reduce(
        (acc, game) => acc + getConstraintViolations(game.id).length,
        0
      );
      return {
        ...venue,
        gameCount: venueGames.length,
        conflictCount: venueConflicts,
        utilizationRate: Math.round((venueGames.length / games.length) * 100),
      };
    })
    .sort((a, b) => b.gameCount - a.gameCount);

  // Recent activity
  const recentActivity = [
    {
      type: "game_scheduled",
      message: "Lakers vs Warriors scheduled for Main Arena",
      time: "2 hours ago",
      icon: Calendar,
    },
    {
      type: "conflict_resolved",
      message: "Team rest conflict resolved for Game #102",
      time: "4 hours ago",
      icon: CheckCircle,
    },
    {
      type: "venue_added",
      message: "New venue 'Practice Court 3' added",
      time: "1 day ago",
      icon: MapPin,
    },
    {
      type: "conflict_detected",
      message: "Double booking detected at TD Garden",
      time: "2 days ago",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="p-6 space-y-8 bg-slate-50 min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Dashboard Overview
          </h1>
          <p className="text-slate-600 mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your sports
            scheduling.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.push("/dashboard/schedule")}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Schedule
          </Button>
          <Button onClick={() => setShowAddGame(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Game
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-slate-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {metric.value}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {metric.changeType === "positive" ? (
                    <ArrowUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <ArrowDown className="h-3 w-3 text-red-600" />
                  )}
                  <span
                    className={`text-xs ${
                      metric.changeType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {metric.change}
                  </span>
                  <span className="text-xs text-slate-500">vs last week</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule Health & Conflicts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Schedule Health
              </CardTitle>
              <CardDescription>
                Overall quality and conflict status of your schedules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {scheduleHealth}%
                  </div>
                  <div className="text-sm text-slate-500">
                    Games without conflicts
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">
                    {totalConflicts}
                  </div>
                  <div className="text-sm text-slate-500">Active conflicts</div>
                </div>
              </div>
              <Progress value={scheduleHealth} className="h-2" />

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {confirmedGames.length}
                    </div>
                    <div className="text-sm text-slate-500">
                      Confirmed Games
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {conflictedGames.length}
                    </div>
                    <div className="text-sm text-slate-500">Need Attention</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Venue Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Venue Performance
              </CardTitle>
              <CardDescription>
                Usage statistics and conflict rates by venue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {venuePerformance.slice(0, 5).map((venue) => (
                  <div
                    key={venue.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {venue.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {venue.gameCount} games • {venue.conflictCount}{" "}
                          conflicts
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">
                        {venue.utilizationRate}%
                      </div>
                      <div className="text-xs text-slate-500">utilization</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Games */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Games
              </CardTitle>
              <CardDescription>
                Next scheduled games with status indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingGames.map((game) => {
                  const homeTeam = teams.find((t) => t.id === game.homeTeamId);
                  const awayTeam = teams.find((t) => t.id === game.awayTeamId);
                  const venue = venues.find((v) => v.id === game.venueId);
                  const violations = getConstraintViolations(game.id);
                  const hasConflict = violations.length > 0;

                  return (
                    <div
                      key={game.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        hasConflict
                          ? "border-red-200 bg-red-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            hasConflict ? "bg-red-500" : "bg-green-500"
                          }`}
                        ></div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {awayTeam?.name} vs {homeTeam?.name}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {venue?.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(
                                parseISO(game.startTime),
                                "MMM d, h:mm a"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      {hasConflict && (
                        <Badge variant="destructive" className="text-xs">
                          {violations.length} Conflict
                          {violations.length > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common scheduling tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => setShowAddGame(true)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule New Game
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => setShowAddTeam(true)}
              >
                <Users className="h-4 w-4 mr-2" />
                Add Team
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => setShowAddVenue(true)}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Add Venue
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push("/dashboard/schedule")}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Resolve Conflicts
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          activity.type === "conflict_resolved"
                            ? "bg-green-100"
                            : activity.type === "conflict_detected"
                            ? "bg-red-100"
                            : "bg-blue-100"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            activity.type === "conflict_resolved"
                              ? "text-green-600"
                              : activity.type === "conflict_detected"
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900">
                          {activity.message}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Scheduling Engine
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-slate-500">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">
                  Conflict Detection
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-slate-500">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Data Sync</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-slate-500">Live</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AddTeamDialog open={showAddTeam} onOpenChange={setShowAddTeam} />
      <AddVenueDialog open={showAddVenue} onOpenChange={setShowAddVenue} />
      <AddGameDialog open={showAddGame} onOpenChange={setShowAddGame} />
    </div>
  );
}
