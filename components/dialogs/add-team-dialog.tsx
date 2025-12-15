"use client";

import { useGlobalStore } from "@/app/store/global";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

interface AddTeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TEAM_COLORS = [
  "#552583", // Purple
  "#1D428A", // Blue
  "#007A33", // Green
  "#98002E", // Maroon
  "#003DA5", // Royal Blue
  "#B3995D", // Gold
  "#007DC3", // Sky Blue
  "#CE1141", // Red
  "#C4CED4", // Silver
  "#E03A3E", // Bright Red
  "#000000", // Black
  "#F58426", // Orange
];

export function AddTeamDialog({ open, onOpenChange }: AddTeamDialogProps) {
  const { addTeam, teams } = useGlobalStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(TEAM_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a team name");
      return;
    }

    if (teams.some((t) => t.name.toLowerCase() === name.trim().toLowerCase())) {
      toast.error("A team with this name already exists");
      return;
    }

    setIsSubmitting(true);

    // Generate a new ID
    const maxId = Math.max(...teams.map((t) => parseInt(t.id)), 0);
    const newId = (maxId + 1).toString();

    addTeam({
      id: newId,
      name: name.trim(),
      color,
      logoUrl: "",
    });

    toast.success(`Team "${name.trim()}" added successfully`);
    setName("");
    setColor(TEAM_COLORS[0]);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    setName("");
    setColor(TEAM_COLORS[0]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Team</DialogTitle>
          <DialogDescription>
            Create a new team to participate in tournaments and games.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                placeholder="Enter team name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Team Color</Label>
              <div className="flex flex-wrap gap-2">
                {TEAM_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      color === c
                        ? "ring-2 ring-offset-2 ring-slate-900 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
                style={{ backgroundColor: color }}
              >
                {name.charAt(0).toUpperCase() || "T"}
              </div>
              <div>
                <p className="font-medium text-slate-900">
                  {name || "Team Name"}
                </p>
                <p className="text-sm text-slate-500">Preview</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Team"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
