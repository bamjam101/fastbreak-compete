"use client";

import { useGlobalStore } from "@/app/store/global";
import { AddGameDialog } from "@/components/dialogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import {
  addDays,
  format,
  getHours,
  getMinutes,
  isSameDay,
  isToday,
  parseISO,
  startOfWeek,
} from "date-fns";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Shuffle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function SchedulePage() {
  const {
    games,
    teams,
    venues,
    selectedDate,
    setSelectedDate,
    getConstraintViolations,
    updateGame,
  } = useGlobalStore();
  const [groupBy, setGroupBy] = useState<"venue" | "time">("venue");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddGame, setShowAddGame] = useState(false);
  const [initialVenueId, setInitialVenueId] = useState<string | undefined>();
  const [initialHour, setInitialHour] = useState<number | undefined>();

  // Time slots for timeline (9 AM to 10 PM)
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 9;
    return {
      time: `${hour.toString().padStart(2, "0")}:00`,
      label: hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`,
      hour24: hour,
    };
  });

  // Week navigation
  const currentWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = addDays(selectedDate, direction === "prev" ? -7 : 7);
    setSelectedDate(newDate);
  };

  // Filter games by current week and search term
  const weekGames = useMemo(() => {
    return games.filter((game) => {
      const gameDate = parseISO(game.startTime);
      const weekEnd = addDays(currentWeekStart, 6);
      const isInWeek = gameDate >= currentWeekStart && gameDate <= weekEnd;

      if (!isInWeek) return false;

      // Apply search filter
      if (searchTerm.trim()) {
        const search = searchTerm.toLowerCase();
        const homeTeam = teams.find((t) => t.id === game.homeTeamId);
        const awayTeam = teams.find((t) => t.id === game.awayTeamId);
        const venue = venues.find((v) => v.id === game.venueId);
        const hasConflict = getConstraintViolations(game.id).length > 0;

        const matchesTeam =
          homeTeam?.name.toLowerCase().includes(search) ||
          awayTeam?.name.toLowerCase().includes(search);
        const matchesVenue = venue?.name.toLowerCase().includes(search);
        const matchesConflict =
          search === "conflict" || search === "conflicts"
            ? hasConflict
            : false;
        const matchesGameId = game.id.includes(search);

        return matchesTeam || matchesVenue || matchesConflict || matchesGameId;
      }

      return true;
    });
  }, [games, currentWeekStart, searchTerm, teams, venues, getConstraintViolations]);

  // Handler for clicking empty slot to add game
  const handleAddGameAtSlot = (venueId: string, hour: number) => {
    setInitialVenueId(venueId);
    setInitialHour(hour);
    setShowAddGame(true);
  };

  // Helper function to get venue color
  const getVenueColor = (venueId: string) => {
    const colors = [
      "bg-indigo-100 border-indigo-500 text-indigo-700",
      "bg-emerald-100 border-emerald-500 text-emerald-700",
      "bg-amber-100 border-amber-500 text-amber-700",
      "bg-rose-100 border-rose-500 text-rose-700",
      "bg-purple-100 border-purple-500 text-purple-700",
      "bg-blue-100 border-blue-500 text-blue-700",
    ];
    const index = venues.findIndex((v) => v.id === venueId);
    return colors[index % colors.length];
  };

  // Handle drag and drop
  const handleOnDragEnd = (result: {
    draggableId: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    source: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    destination: any;
  }) => {
    if (!result.destination) return;

    const sourceGameId = result.draggableId;
    const targetInfo = result.destination.droppableId.split("-");

    if (targetInfo.length !== 3) return;

    const [prefix, venueId, timeSlot] = targetInfo;
    if (prefix !== "venue") return;

    const sourceGame = games.find((g) => g.id === sourceGameId);
    if (!sourceGame) return;

    // Calculate new time based on time slot
    const selectedDate = parseISO(sourceGame.startTime);
    const newHour = parseInt(timeSlot);
    const gameDate = new Date(selectedDate);
    gameDate.setHours(newHour, 0, 0, 0);

    // Calculate end time (assuming 1.5 hour duration)
    const endDate = new Date(gameDate);
    endDate.setHours(newHour + 1, 30, 0, 0);

    const newStartTime = gameDate.toISOString();
    const newEndTime = endDate.toISOString();

    // Update the game with new venue and time
    updateGame(sourceGameId, {
      venueId: venueId,
      startTime: newStartTime,
      endTime: newEndTime,
      status: "scheduled",
    });

    const targetVenue = venues.find((v) => v.id === venueId);
    const homeTeam = teams.find((t) => t.id === sourceGame.homeTeamId);
    const awayTeam = teams.find((t) => t.id === sourceGame.awayTeamId);
    toast.success(
      `Moved ${awayTeam?.name} vs ${homeTeam?.name} to ${targetVenue?.name} at ${format(gameDate, "h:mm a")}`
    );
  };

  // Get current time indicator position
  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentHour = getHours(now);
    const currentMinute = getMinutes(now);

    if (currentHour < 9 || currentHour > 22) return null;

    const topPercent =
      (((currentHour - 9) * 60 + currentMinute) / (14 * 60)) * 100;
    return topPercent;
  };

  const currentTimePosition = getCurrentTimePosition();

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Events Scheduler
            </h1>
            <p className="text-slate-600 mt-1">
              Manage games and resolve conflicts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search teams, venues, or conflicts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <Select
              value={groupBy}
              onValueChange={(value: typeof groupBy) => setGroupBy(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="venue">Group by Venue</SelectItem>
                <SelectItem value="time">Group by Time</SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setInitialVenueId(undefined);
                setInitialHour(undefined);
                setShowAddGame(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white border-b border-slate-200 p-6">
        <div className="flex max-md:flex-col gap-8 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateWeek("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-semibold text-slate-900">
              {format(currentWeekStart, "MMM d")} -{" "}
              {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateWeek("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Day tabs */}
          <div className="flex items-center gap-1">
            {weekDays.map((day, index) => {
              const isSelected = isSameDay(day, selectedDate);
              const dayGames = weekGames.filter((game) =>
                isSameDay(parseISO(game.startTime), day)
              );
              const conflictCount = dayGames.filter(
                (game) => getConstraintViolations(game.id).length > 0
              ).length;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center p-2 md:p-4 rounded-xl text-sm transition-all relative ${
                    isSelected
                      ? "bg-slate-800 text-white shadow-lg transform -translate-y-1"
                      : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200"
                  }`}
                >
                  <span className="font-bold">{format(day, "d")}</span>
                  <span className="text-xs uppercase tracking-wide">
                    {format(day, "EEE")}
                  </span>
                  {conflictCount > 0 && (
                    <div
                      title="Conflicts"
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    >
                      {conflictCount}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <div className="flex-1 overflow-auto p-6">
          <div className="min-w-250 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Grid Header */}
            <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
              <div className="py-3 px-4 text-center border-r border-slate-200">
                <span className="text-xs font-medium text-slate-500">
                  GMT-5
                </span>
              </div>
              {venues.slice(0, 5).map((venue, index) => (
                <div
                  key={venue.id}
                  className="py-3 px-4 border-r border-slate-200 last:border-r-0 flex items-center justify-center space-x-2"
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${getVenueColor(
                      venue.id
                    )}`}
                  >
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 truncate">
                    {venue.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Grid Body */}
            <div className="grid grid-cols-6 relative">
              {/* Current Time Indicator */}
              {currentTimePosition !== null && isToday(selectedDate) && (
                <div
                  className="absolute w-full border-t-2 border-blue-500 z-20 flex items-center pointer-events-none"
                  style={{ top: `${currentTimePosition * 2}px` }}
                >
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-r font-bold -mt-2">
                    {format(new Date(), "HH:mm")}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 -ml-1"></div>
                  <div className="flex-1 border-t border-dashed border-blue-500/50"></div>
                </div>
              )}

              {/* Time slots */}
              {timeSlots.map((slot, slotIndex) => (
                <div key={`slot-${slotIndex}`} className="contents">
                  {/* Time column */}
                  <div className="min-h-32 border-b border-slate-100 border-r flex justify-center pt-2">
                    <span className="text-xs text-slate-400">{slot.time}</span>
                  </div>

                  {/* Venue columns */}
                  {venues.slice(0, 5).map((venue) => {
                    const slotGames = weekGames.filter((game) => {
                      if (game.venueId !== venue.id) return false;
                      if (!isSameDay(parseISO(game.startTime), selectedDate))
                        return false;
                      const gameHour = getHours(parseISO(game.startTime));
                      return gameHour === slot.hour24;
                    });

                    return (
                      <Droppable
                        key={`venue-${venue.id}-${slot.hour24}`}
                        droppableId={`venue-${venue.id}-${slot.hour24}`}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`min-h-32 border-b border-slate-100 border-r border-slate-200 last:border-r-0 relative p-1 transition-colors group ${
                              snapshot.isDraggingOver
                                ? "bg-blue-50"
                                : "hover:bg-slate-50"
                            }`}
                          >
                            {slotGames.length === 0 && (
                              <button
                                onClick={() =>
                                  handleAddGameAtSlot(venue.id, slot.hour24)
                                }
                                className="hidden group-hover:flex w-8 h-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-5"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            )}

                            {slotGames.map((game, gameIndex) => {
                              const violations = getConstraintViolations(
                                game.id
                              );
                              const hasConflict = violations.length > 0;
                              const homeTeam = teams.find(
                                (t) => t.id === game.homeTeamId
                              );
                              const awayTeam = teams.find(
                                (t) => t.id === game.awayTeamId
                              );

                              return (
                                <Draggable
                                  key={game.id}
                                  draggableId={game.id}
                                  index={gameIndex}
                                >
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`w-full min-h-24 rounded-lg shadow-sm p-3 cursor-move transition-all relative z-10 ${
                                        hasConflict
                                          ? "bg-red-50 border border-red-200 border-l-4 border-l-red-600"
                                          : `${getVenueColor(
                                              venue.id
                                            )} border-l-4`
                                      } ${
                                        snapshot.isDragging
                                          ? "shadow-lg rotate-2 scale-105 z-50"
                                          : "hover:shadow-md hover:z-20"
                                      }`}
                                    >
                                      <div className="flex flex-col justify-between h-full">
                                        <div>
                                          {hasConflict && (
                                            <div className="flex items-center space-x-1 mb-1">
                                              <AlertCircle className="h-3 w-3 text-red-600" />
                                              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
                                                Conflict
                                              </span>
                                            </div>
                                          )}
                                          <h4 className="text-sm font-bold text-slate-800 leading-tight">
                                            {awayTeam?.name} vs {homeTeam?.name}
                                          </h4>
                                          <p className="text-xs text-slate-600 mt-1">
                                            Game #{game.id}
                                          </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                          <span className="text-xs font-mono text-slate-500">
                                            {format(
                                              parseISO(game.startTime),
                                              "HH:mm"
                                            )}{" "}
                                            -{" "}
                                            {format(
                                              parseISO(game.endTime),
                                              "HH:mm"
                                            )}
                                          </span>
                                          {hasConflict && (
                                            <div className="flex items-center space-x-1">
                                              <Shuffle className="h-3 w-3 text-red-600" />
                                              <span className="text-xs text-red-600 font-bold">
                                                SWAP
                                              </span>
                                            </div>
                                          )}
                                          {game.status === "confirmed" && (
                                            <Badge className="bg-green-500 text-white text-xs">
                                              CONFIRMED
                                            </Badge>
                                          )}
                                        </div>

                                        {hasConflict && (
                                          <div className="mt-1 text-xs text-red-700">
                                            {violations[0]?.message}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DragDropContext>

      {/* Add Game Dialog */}
      <AddGameDialog
        open={showAddGame}
        onOpenChange={(open) => {
          setShowAddGame(open);
          if (!open) {
            setInitialVenueId(undefined);
            setInitialHour(undefined);
          }
        }}
        initialVenueId={initialVenueId}
        initialDate={selectedDate}
        initialHour={initialHour}
      />
    </div>
  );
}
