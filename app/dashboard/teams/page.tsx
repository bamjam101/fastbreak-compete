"use client";

import { useGlobalStore } from "@/app/store/global";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Edit,
  MoreHorizontal,
  Plus,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { useMemo } from "react";

export default function TeamsPage() {
  const { teams, games } = useGlobalStore();

  // Calculate team statistics
  const teamStats = useMemo(() => {
    return teams.map((team) => {
      const teamGames = games.filter(
        (game) => game.homeTeamId === team.id || game.awayTeamId === team.id
      );

      const wins = teamGames.filter((game) => {
        return game.status === "confirmed"; // Assuming confirmed games are completed
      }).length;

      const totalGames = teamGames.length;
      const winRate =
        totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

      const upcomingGames = teamGames.filter(
        (game) => new Date(game.startTime) > new Date()
      ).length;

      return {
        ...team,
        totalGames,
        wins,
        winRate,
        upcomingGames,
      };
    });
  }, [teams, games]);

  return (
    <div className="h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Teams Management
            </h1>
            <p className="text-slate-600 mt-1">
              Manage tournament teams, track performance, and view statistics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-slate-600">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Team
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-linear-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Total Teams
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {teams.length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Active Teams
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {
                      teams.filter(
                        (t) =>
                          (teamStats.find((s) => s.id === t.id)?.totalGames ??
                            0) > 0
                      ).length
                    }
                  </p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Total Games
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {games.length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Avg Win Rate
                  </p>
                  <p className="text-3xl font-bold text-orange-900">
                    {teamStats.length > 0
                      ? Math.round(
                          teamStats.reduce(
                            (acc, team) => acc + team.winRate,
                            0
                          ) / teamStats.length
                        )
                      : 0}
                    %
                  </p>
                </div>
                <Trophy className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamStats.map((team) => (
            <Card
              key={team.id}
              className="hover:shadow-lg transition-all duration-200 border-slate-200"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      style={{ backgroundColor: team.color }}
                    >
                      {team.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-900">
                        {team.name}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Team #{team.id}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Performance Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Win Rate</span>
                    <span className="font-semibold text-slate-900">
                      {team.winRate}%
                    </span>
                  </div>
                  <Progress value={team.winRate} className="h-2" />

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900">
                        {team.totalGames}
                      </div>
                      <div className="text-xs text-slate-600">Total Games</div>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-slate-900">
                        {team.upcomingGames}
                      </div>
                      <div className="text-xs text-slate-600">Upcoming</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Team Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-sm text-slate-600">Active</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(team.winRate / 20)
                            ? "text-yellow-400 fill-current"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Stats
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
