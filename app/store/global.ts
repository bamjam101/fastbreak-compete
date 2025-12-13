import { differenceInHours, parseISO } from "date-fns";
import { create } from "zustand";

export interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  color?: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
  isAvailable: boolean;
  closedHours?: { start: string; end: string }[];
}

export interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  teams: string[];
}

export interface Game {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  venueId: string;
  startTime: string;
  endTime: string;
  status: "scheduled" | "confirmed" | "conflict";
}

export interface ConstraintViolation {
  type:
    | "team_rest"
    | "venue_conflict"
    | "venue_closed"
    | "travel_time"
    | "scheduling";
  severity: "error" | "warning";
  message: string;
  gameIds: string[];
}

interface AppState {
  // Data
  teams: Team[];
  venues: Venue[];
  tournaments: Tournament[];
  games: Game[];

  // UI State
  sidebarCollapsed: boolean;
  selectedDate: Date;
  selectedGameForSwap: Game | null;
  swapTargetGame: Game | null;

  // Actions
  addTeam: (team: Team) => void;
  addVenue: (venue: Venue) => void;
  addTournament: (tournament: Tournament) => void;
  addGame: (game: Game) => void;
  updateGame: (gameId: string, updates: Partial<Game>) => void;
  deleteGame: (gameId: string) => void;

  toggleSidebar: () => void;
  setSelectedDate: (date: Date) => void;
  selectGameForSwap: (game: Game | null) => void;
  selectSwapTargetGame: (game: Game | null) => void;

  // Swap and validation
  swapGames: (game1Id: string, game2Id: string) => void;
  validateSwap: (game1Id: string, game2Id: string) => ConstraintViolation[];
  getConstraintViolations: (gameId: string) => ConstraintViolation[];
  moveGameToSlot: (
    gameId: string,
    venueId: string,
    newStartTime: string,
    newEndTime: string
  ) => void;
}

// Initial mock data with more teams for realistic conflicts
const initialTeams: Team[] = [
  { id: "1", name: "Lakers", logoUrl: "", color: "#552583" },
  { id: "2", name: "Warriors", logoUrl: "", color: "#1D428A" },
  { id: "3", name: "Celtics", logoUrl: "", color: "#007A33" },
  { id: "4", name: "Heat", logoUrl: "", color: "#98002E" },
  { id: "5", name: "Varsity", logoUrl: "", color: "#003DA5" },
  { id: "6", name: "Tech", logoUrl: "", color: "#B3995D" },
  { id: "7", name: "Thunder", logoUrl: "", color: "#007DC3" },
  { id: "8", name: "Rockets", logoUrl: "", color: "#CE1141" },
  { id: "9", name: "Spurs", logoUrl: "", color: "#C4CED4" },
  { id: "10", name: "Hawks", logoUrl: "", color: "#E03A3E" },
  { id: "11", name: "Bulls", logoUrl: "", color: "#CE1141" },
  { id: "12", name: "Nets", logoUrl: "", color: "#000000" },
];

const initialVenues: Venue[] = [
  {
    id: "1",
    name: "Main Arena",
    address: "123 Main St",
    capacity: 5000,
    isAvailable: true,
  },
  {
    id: "2",
    name: "Practice Court 1",
    address: "456 Oak Ave",
    capacity: 500,
    isAvailable: true,
  },
  {
    id: "3",
    name: "Practice Court 2",
    address: "789 Pine St",
    capacity: 500,
    isAvailable: true,
  },
  {
    id: "4",
    name: "Crypto.com Arena",
    address: "1111 S Figueroa St, Los Angeles",
    capacity: 19000,
    isAvailable: true,
  },
  {
    id: "5",
    name: "TD Garden",
    address: "100 Legends Way, Boston",
    capacity: 19156,
    isAvailable: true,
  },
  {
    id: "6",
    name: "Annex Gym",
    address: "500 Campus Dr",
    capacity: 300,
    isAvailable: true,
  },
];

const initialTournaments: Tournament[] = [
  {
    id: "1",
    name: "U18 Tournament",
    startDate: "2024-10-01",
    endDate: "2024-10-31",
    teams: ["1", "2", "3", "4"],
  },
  {
    id: "2",
    name: "League Match",
    startDate: "2024-10-01",
    endDate: "2024-10-31",
    teams: ["5", "6"],
  },
];

const initialGames: Game[] = [
  // Confirmed games without conflicts
  {
    id: "101",
    tournamentId: "1",
    homeTeamId: "5",
    awayTeamId: "6",
    venueId: "1",
    startTime: "2024-10-17T09:00:00",
    endTime: "2024-10-17T11:00:00",
    status: "confirmed",
  },
  {
    id: "102",
    tournamentId: "1",
    homeTeamId: "1",
    awayTeamId: "2",
    venueId: "4",
    startTime: "2024-10-17T12:00:00",
    endTime: "2024-10-17T13:30:00",
    status: "confirmed",
  },
  {
    id: "103",
    tournamentId: "1",
    homeTeamId: "7",
    awayTeamId: "8",
    venueId: "2",
    startTime: "2024-10-17T13:00:00",
    endTime: "2024-10-17T14:00:00",
    status: "scheduled",
  },
  {
    id: "104",
    tournamentId: "1",
    homeTeamId: "9",
    awayTeamId: "10",
    venueId: "6",
    startTime: "2024-10-17T10:00:00",
    endTime: "2024-10-17T11:00:00",
    status: "scheduled",
  },
  // CONFLICT: Venue double booking - These two games are scheduled at the same venue and time
  {
    id: "105",
    tournamentId: "1",
    homeTeamId: "11",
    awayTeamId: "12",
    venueId: "3",
    startTime: "2024-10-17T10:00:00",
    endTime: "2024-10-17T12:00:00",
    status: "conflict",
  },
  {
    id: "106",
    tournamentId: "1",
    homeTeamId: "3",
    awayTeamId: "4",
    venueId: "3",
    startTime: "2024-10-17T10:30:00",
    endTime: "2024-10-17T12:30:00",
    status: "conflict",
  },
  // CONFLICT: Team rest violation - Lakers play back-to-back with insufficient rest
  {
    id: "107",
    tournamentId: "1",
    homeTeamId: "1",
    awayTeamId: "7",
    venueId: "5",
    startTime: "2024-10-17T14:00:00",
    endTime: "2024-10-17T15:30:00",
    status: "conflict",
  },
  // Additional games for different dates
  {
    id: "108",
    tournamentId: "1",
    homeTeamId: "2",
    awayTeamId: "9",
    venueId: "1",
    startTime: "2024-10-18T09:00:00",
    endTime: "2024-10-18T10:30:00",
    status: "scheduled",
  },
  {
    id: "109",
    tournamentId: "1",
    homeTeamId: "5",
    awayTeamId: "8",
    venueId: "2",
    startTime: "2024-10-18T11:00:00",
    endTime: "2024-10-18T12:30:00",
    status: "scheduled",
  },
  {
    id: "110",
    tournamentId: "1",
    homeTeamId: "6",
    awayTeamId: "11",
    venueId: "4",
    startTime: "2024-10-18T14:00:00",
    endTime: "2024-10-18T15:30:00",
    status: "scheduled",
  },
  {
    id: "111",
    tournamentId: "1",
    homeTeamId: "10",
    awayTeamId: "12",
    venueId: "6",
    startTime: "2024-10-19T10:00:00",
    endTime: "2024-10-19T11:30:00",
    status: "scheduled",
  },
];

export const useGlobalStore = create<AppState>((set, get) => ({
  // Initial state
  teams: initialTeams,
  venues: initialVenues,
  tournaments: initialTournaments,
  games: initialGames,

  sidebarCollapsed: true,
  selectedDate: new Date("2024-10-17"),
  selectedGameForSwap: null,
  swapTargetGame: null,

  // Actions
  addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
  addVenue: (venue) => set((state) => ({ venues: [...state.venues, venue] })),
  addTournament: (tournament) =>
    set((state) => ({ tournaments: [...state.tournaments, tournament] })),
  addGame: (game) => set((state) => ({ games: [...state.games, game] })),

  updateGame: (gameId, updates) =>
    set((state) => ({
      games: state.games.map((game) =>
        game.id === gameId ? { ...game, ...updates } : game
      ),
    })),

  deleteGame: (gameId) =>
    set((state) => ({
      games: state.games.filter((game) => game.id !== gameId),
    })),

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSelectedDate: (date) => set({ selectedDate: date }),
  selectGameForSwap: (game) => set({ selectedGameForSwap: game }),
  selectSwapTargetGame: (game) => set({ swapTargetGame: game }),

  // Swap games
  swapGames: (game1Id, game2Id) => {
    const state = get();
    const game1 = state.games.find((g) => g.id === game1Id);
    const game2 = state.games.find((g) => g.id === game2Id);

    if (!game1 || !game2) return;

    set((state) => ({
      games: state.games.map((game) => {
        if (game.id === game1Id) {
          return {
            ...game,
            venueId: game2.venueId,
            startTime: game2.startTime,
            endTime: game2.endTime,
          };
        }
        if (game.id === game2Id) {
          return {
            ...game,
            venueId: game1.venueId,
            startTime: game1.startTime,
            endTime: game1.endTime,
          };
        }
        return game;
      }),
      selectedGameForSwap: null,
      swapTargetGame: null,
    }));
  },

  // Validate swap
  validateSwap: (game1Id, game2Id) => {
    const state = get();
    const game1 = state.games.find((g) => g.id === game1Id);
    const game2 = state.games.find((g) => g.id === game2Id);

    if (!game1 || !game2) return [];

    const violations: ConstraintViolation[] = [];

    // Create hypothetical swapped games
    const swappedGame1 = {
      ...game1,
      venueId: game2.venueId,
      startTime: game2.startTime,
      endTime: game2.endTime,
    };

    // Check team rest violations for swapped game 1
    const team1Games = state.games.filter(
      (g) =>
        (g.homeTeamId === game1.homeTeamId ||
          g.awayTeamId === game1.homeTeamId ||
          g.homeTeamId === game1.awayTeamId ||
          g.awayTeamId === game1.awayTeamId) &&
        g.id !== game1.id
    );

    for (const otherGame of team1Games) {
      const hoursDiff = Math.abs(
        differenceInHours(
          parseISO(swappedGame1.startTime),
          parseISO(otherGame.endTime)
        )
      );
      if (hoursDiff < 6) {
        const team = state.teams.find(
          (t) => t.id === game1.homeTeamId || t.id === game1.awayTeamId
        );
        violations.push({
          type: "team_rest",
          severity: "error",
          message: `Conflict: ${
            team?.name || "Team"
          } has less than 6 hours rest`,
          gameIds: [game1Id, otherGame.id],
        });
      }
    }

    // Check travel time violation
    const homeTeam = state.teams.find((t) => t.id === game1.homeTeamId);
    const targetVenue = state.venues.find((v) => v.id === game2.venueId);

    if (targetVenue) {
      const hoursDiff = Math.abs(
        differenceInHours(
          parseISO(swappedGame1.startTime),
          parseISO(game1.endTime)
        )
      );

      // Simulate travel time check (if venue is far, e.g., TD Garden to Crypto.com Arena)
      if (
        (game1.venueId === "4" && game2.venueId === "5") ||
        (game1.venueId === "5" && game2.venueId === "4")
      ) {
        if (hoursDiff < 9) {
          violations.push({
            type: "travel_time",
            severity: "error",
            message: `Travel Violation: ${
              homeTeam?.name || "Team"
            } cannot reach ${
              targetVenue.name
            } (TD Garden) within 6 hours of their previous game in Los Angeles.`,
            gameIds: [game1Id, game2Id],
          });
        }
      }
    }

    return violations;
  },

  // Get constraint violations for a specific game
  getConstraintViolations: (gameId) => {
    const state = get();
    const game = state.games.find((g) => g.id === gameId);

    if (!game) return [];

    const violations: ConstraintViolation[] = [];

    // Check for team rest violations
    const teamGames = state.games.filter(
      (g) =>
        (g.homeTeamId === game.homeTeamId ||
          g.awayTeamId === game.homeTeamId ||
          g.homeTeamId === game.awayTeamId ||
          g.awayTeamId === game.awayTeamId) &&
        g.id !== gameId
    );

    for (const otherGame of teamGames) {
      const hoursDiff = Math.abs(
        differenceInHours(parseISO(game.startTime), parseISO(otherGame.endTime))
      );
      if (hoursDiff < 6) {
        violations.push({
          type: "team_rest",
          severity: "error",
          message: `Team has less than 6 hours rest between games`,
          gameIds: [gameId, otherGame.id],
        });
      }
    }

    // Check for venue conflicts
    const venueGames = state.games.filter(
      (g) => g.venueId === game.venueId && g.id !== gameId
    );

    for (const otherGame of venueGames) {
      const game1Start = parseISO(game.startTime);
      const game1End = parseISO(game.endTime);
      const game2Start = parseISO(otherGame.startTime);
      const game2End = parseISO(otherGame.endTime);

      if (
        (game1Start >= game2Start && game1Start < game2End) ||
        (game1End > game2Start && game1End <= game2End) ||
        (game1Start <= game2Start && game1End >= game2End)
      ) {
        violations.push({
          type: "venue_conflict",
          severity: "error",
          message: `Double booked with Maintenance`,
          gameIds: [gameId, otherGame.id],
        });
      }
    }

    return violations;
  },

  // Move game to a specific time slot and venue
  moveGameToSlot: (gameId, venueId, newStartTime, newEndTime) => {
    set((state) => ({
      games: state.games.map((game) =>
        game.id === gameId
          ? {
              ...game,
              venueId,
              startTime: newStartTime,
              endTime: newEndTime,
              status: "scheduled" as const,
            }
          : game
      ),
    }));
  },
}));
