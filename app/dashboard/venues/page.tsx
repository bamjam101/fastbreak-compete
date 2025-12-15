"use client";

import { Venue, useGlobalStore } from "@/app/store/global";
import { AddGameDialog, AddVenueDialog, EditVenueDialog } from "@/components/dialogs";
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
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  AlertTriangle,
  Building,
  Calendar,
  CheckCircle,
  Edit,
  MapPin,
  MoreHorizontal,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function VenuesPage() {
  const router = useRouter();
  const { venues, games } = useGlobalStore();
  const [showAddVenue, setShowAddVenue] = useState(false);
  const [showAddGame, setShowAddGame] = useState(false);
  const [showEditVenue, setShowEditVenue] = useState(false);
  const [selectedVenueId, setSelectedVenueId] = useState<string | undefined>();
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // Calculate venue statistics
  const venueStats = useMemo(() => {
    return venues.map((venue) => {
      const venueGames = games.filter((game) => game.venueId === venue.id);
      const upcomingGames = venueGames.filter(
        (game) => new Date(game.startTime) > new Date()
      );
      const todayGames = venueGames.filter(
        (game) =>
          new Date(game.startTime).toDateString() === new Date().toDateString()
      );

      // Calculate utilization (games per day over a week period)
      const utilizationRate = Math.min(
        100,
        Math.round((venueGames.length / 7) * 100)
      );

      // Check for conflicts
      const conflicts = venueGames.filter((game) => {
        const gameStart = new Date(game.startTime);
        const gameEnd = new Date(game.endTime);
        return venueGames.some(
          (otherGame) =>
            otherGame.id !== game.id &&
            new Date(otherGame.startTime) < gameEnd &&
            new Date(otherGame.endTime) > gameStart
        );
      }).length;

      return {
        ...venue,
        totalGames: venueGames.length,
        upcomingGames: upcomingGames.length,
        todayGames: todayGames.length,
        utilizationRate,
        conflicts,
      };
    });
  }, [venues, games]);

  const totalCapacity = venueStats.reduce(
    (acc, venue) => acc + venue.capacity,
    0
  );
  const totalGames = venueStats.reduce(
    (acc, venue) => acc + venue.totalGames,
    0
  );
  const avgUtilization =
    venueStats.length > 0
      ? Math.round(
          venueStats.reduce((acc, venue) => acc + venue.utilizationRate, 0) /
            venueStats.length
        )
      : 0;

  return (
    <div className="h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Venues Management
            </h1>
            <p className="text-slate-600 mt-1">
              Manage tournament venues, track utilization, and monitor capacity
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="text-slate-600"
              onClick={() => toast.info("Export feature coming soon")}
            >
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowAddVenue(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Venue
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
                    Total Venues
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {venues.length}
                  </p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Total Capacity
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {totalCapacity.toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
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
                    {totalGames}
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
                    Avg Utilization
                  </p>
                  <p className="text-3xl font-bold text-orange-900">
                    {avgUtilization}%
                  </p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Venues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venueStats.map((venue) => (
            <Card
              key={venue.id}
              className="hover:shadow-lg transition-all duration-200 border-slate-200"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <Building className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                        {venue.name}
                        {venue.conflicts > 0 && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Venue #{venue.id}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-slate-600"
                    onClick={() => {
                      setSelectedVenue(venue);
                      setShowEditVenue(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="leading-tight">{venue.address}</span>
                </div>

                {/* Capacity & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">
                      Capacity: {venue.capacity.toLocaleString()}
                    </span>
                  </div>
                  <Badge
                    variant={venue.isAvailable ? "default" : "destructive"}
                    className={
                      venue.isAvailable ? "bg-green-100 text-green-800" : ""
                    }
                  >
                    {venue.isAvailable ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Available
                      </>
                    ) : (
                      "Unavailable"
                    )}
                  </Badge>
                </div>

                {/* Utilization */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Utilization</span>
                    <span className="font-semibold text-slate-900">
                      {venue.utilizationRate}%
                    </span>
                  </div>
                  <Progress
                    value={venue.utilizationRate}
                    className={`h-2 ${
                      venue.utilizationRate > 80
                        ? "bg-red-100"
                        : venue.utilizationRate > 60
                        ? "bg-yellow-100"
                        : "bg-green-100"
                    }`}
                  />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-xl font-bold text-slate-900">
                      {venue.totalGames}
                    </div>
                    <div className="text-xs text-slate-600">Total Games</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-900">
                      {venue.todayGames}
                    </div>
                    <div className="text-xs text-blue-600">Today</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-900">
                      {venue.upcomingGames}
                    </div>
                    <div className="text-xs text-purple-600">Upcoming</div>
                  </div>
                </div>

                {/* Conflicts Alert */}
                {venue.conflicts > 0 && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <div className="text-sm">
                        <span className="font-medium text-red-900">
                          {venue.conflicts} scheduling conflicts
                        </span>
                        <div className="text-red-700">
                          Double bookings detected
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedVenueId(venue.id);
                      setShowAddGame(true);
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      toast.info(
                        `${venue.name}: ${venue.totalGames} total games, ${venue.utilizationRate}% utilization, ${venue.conflicts} conflicts`
                      )
                    }
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <AddVenueDialog open={showAddVenue} onOpenChange={setShowAddVenue} />
      <AddGameDialog
        open={showAddGame}
        onOpenChange={(open) => {
          setShowAddGame(open);
          if (!open) setSelectedVenueId(undefined);
        }}
        initialVenueId={selectedVenueId}
      />
      <EditVenueDialog
        open={showEditVenue}
        onOpenChange={(open) => {
          setShowEditVenue(open);
          if (!open) setSelectedVenue(null);
        }}
        venue={selectedVenue}
      />
    </div>
  );
}
