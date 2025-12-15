"use client";

import { useGlobalStore } from "@/app/store/global";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, parseISO, setHours, setMinutes } from "date-fns";
import {
  AlertTriangle,
  CalendarIcon,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AddGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialVenueId?: string;
  initialDate?: Date;
  initialHour?: number;
}

export function AddGameDialog({
  open,
  onOpenChange,
  initialVenueId,
  initialDate,
  initialHour,
}: AddGameDialogProps) {
  const { addGame, teams, venues, tournaments, games } = useGlobalStore();
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [tournamentId, setTournamentId] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [startHour, setStartHour] = useState("10");
  const [startMinute, setStartMinute] = useState("00");
  const [duration, setDuration] = useState("90"); // minutes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // Initialize with props if provided
  useEffect(() => {
    if (open) {
      if (initialVenueId) setVenueId(initialVenueId);
      if (initialDate) setDate(initialDate);
      if (initialHour !== undefined) setStartHour(initialHour.toString());
    }
  }, [open, initialVenueId, initialDate, initialHour]);

  // Check for conflicts when selection changes
  useEffect(() => {
    if (!date || !venueId || !startHour || !homeTeamId || !awayTeamId) {
      setConflicts([]);
      return;
    }

    const newConflicts: string[] = [];
    const selectedDate = setMinutes(
      setHours(date, parseInt(startHour)),
      parseInt(startMinute)
    );
    const endTime = new Date(
      selectedDate.getTime() + parseInt(duration) * 60000
    );

    // Check venue conflicts
    const venueGames = games.filter((g) => g.venueId === venueId);
    for (const game of venueGames) {
      const gameStart = parseISO(game.startTime);
      const gameEnd = parseISO(game.endTime);

      if (
        (selectedDate >= gameStart && selectedDate < gameEnd) ||
        (endTime > gameStart && endTime <= gameEnd) ||
        (selectedDate <= gameStart && endTime >= gameEnd)
      ) {
        const homeTeam = teams.find((t) => t.id === game.homeTeamId);
        const awayTeam = teams.find((t) => t.id === game.awayTeamId);
        newConflicts.push(
          `Venue conflict: ${awayTeam?.name} vs ${homeTeam?.name} at ${format(
            gameStart,
            "h:mm a"
          )}`
        );
      }
    }

    // Check team conflicts (if either team has another game within 6 hours)
    const teamIds = [homeTeamId, awayTeamId];
    for (const teamId of teamIds) {
      const team = teams.find((t) => t.id === teamId);
      const teamGames = games.filter(
        (g) => g.homeTeamId === teamId || g.awayTeamId === teamId
      );

      for (const game of teamGames) {
        const gameEnd = parseISO(game.endTime);
        const gameStart = parseISO(game.startTime);

        const hoursToStart =
          Math.abs(selectedDate.getTime() - gameEnd.getTime()) / (1000 * 60 * 60);
        const hoursFromEnd =
          Math.abs(endTime.getTime() - gameStart.getTime()) / (1000 * 60 * 60);

        if (hoursToStart < 6 || hoursFromEnd < 6) {
          // Check if it's the same day to be more specific
          if (
            format(gameStart, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
          ) {
            newConflicts.push(
              `Rest warning: ${team?.name} has another game at ${format(
                gameStart,
                "h:mm a"
              )} (less than 6 hours rest)`
            );
          }
        }
      }
    }

    setConflicts(newConflicts);
  }, [
    date,
    venueId,
    startHour,
    startMinute,
    duration,
    homeTeamId,
    awayTeamId,
    games,
    teams,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!homeTeamId || !awayTeamId) {
      toast.error("Please select both teams");
      return;
    }

    if (homeTeamId === awayTeamId) {
      toast.error("Home and away teams must be different");
      return;
    }

    if (!venueId) {
      toast.error("Please select a venue");
      return;
    }

    if (!date) {
      toast.error("Please select a date");
      return;
    }

    if (!tournamentId) {
      toast.error("Please select a tournament");
      return;
    }

    setIsSubmitting(true);

    // Build start and end times
    const startTime = setMinutes(
      setHours(date, parseInt(startHour)),
      parseInt(startMinute)
    );
    const endTime = new Date(startTime.getTime() + parseInt(duration) * 60000);

    // Generate new ID
    const maxId = Math.max(...games.map((g) => parseInt(g.id)), 0);
    const newId = (maxId + 1).toString();

    addGame({
      id: newId,
      tournamentId,
      homeTeamId,
      awayTeamId,
      venueId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: conflicts.length > 0 ? "conflict" : "scheduled",
    });

    const homeTeam = teams.find((t) => t.id === homeTeamId);
    const awayTeam = teams.find((t) => t.id === awayTeamId);
    toast.success(`Game scheduled: ${awayTeam?.name} vs ${homeTeam?.name}`);

    resetForm();
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const resetForm = () => {
    setHomeTeamId("");
    setAwayTeamId("");
    setVenueId("");
    setTournamentId("");
    setDate(undefined);
    setStartHour("10");
    setStartMinute("00");
    setDuration("90");
    setConflicts([]);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // Generate time options
  const hours = Array.from({ length: 14 }, (_, i) => i + 9); // 9 AM to 10 PM
  const minutes = ["00", "15", "30", "45"];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule New Game</DialogTitle>
          <DialogDescription>
            Create a new game by selecting teams, venue, and time.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Tournament Selection */}
            <div className="space-y-2">
              <Label>Tournament</Label>
              <Select value={tournamentId} onValueChange={setTournamentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tournament" />
                </SelectTrigger>
                <SelectContent>
                  {tournaments.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Teams Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Home Team
                </Label>
                <Select value={homeTeamId} onValueChange={setHomeTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem
                        key={team.id}
                        value={team.id}
                        disabled={team.id === awayTeamId}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          {team.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Away Team
                </Label>
                <Select value={awayTeamId} onValueChange={setAwayTeamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem
                        key={team.id}
                        value={team.id}
                        disabled={team.id === homeTeamId}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: team.color }}
                          />
                          {team.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Venue Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Venue
              </Label>
              <Select value={venueId} onValueChange={setVenueId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues
                    .filter((v) => v.isAvailable)
                    .map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name} ({venue.capacity.toLocaleString()} seats)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Start Time
                </Label>
                <div className="flex gap-2">
                  <Select value={startHour} onValueChange={setStartHour}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map((h) => (
                        <SelectItem key={h} value={h.toString()}>
                          {h > 12 ? h - 12 : h} {h >= 12 ? "PM" : "AM"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={startMinute} onValueChange={setStartMinute}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map((m) => (
                        <SelectItem key={m} value={m}>
                          :{m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="150">2.5 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Conflict Warnings */}
            {conflicts.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  Potential Conflicts Detected
                </div>
                <ul className="text-sm text-amber-700 space-y-1 ml-6 list-disc">
                  {conflicts.map((conflict, i) => (
                    <li key={i}>{conflict}</li>
                  ))}
                </ul>
                <p className="text-xs text-amber-600">
                  You can still schedule this game, but it will be marked as
                  having a conflict.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Game"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
