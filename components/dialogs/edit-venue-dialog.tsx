"use client";

import { Venue, useGlobalStore } from "@/app/store/global";
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
import { Switch } from "@/components/ui/switch";
import { Building, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EditVenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venue: Venue | null;
}

export function EditVenueDialog({
  open,
  onOpenChange,
  venue,
}: EditVenueDialogProps) {
  const { venues } = useGlobalStore();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (venue && open) {
      setName(venue.name);
      setAddress(venue.address);
      setCapacity(venue.capacity.toString());
      setIsAvailable(venue.isAvailable);
    }
  }, [venue, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!venue) return;

    if (!name.trim()) {
      toast.error("Please enter a venue name");
      return;
    }

    if (!address.trim()) {
      toast.error("Please enter an address");
      return;
    }

    const capacityNum = parseInt(capacity);
    if (!capacity || isNaN(capacityNum) || capacityNum <= 0) {
      toast.error("Please enter a valid capacity");
      return;
    }

    if (
      venues.some(
        (v) =>
          v.id !== venue.id &&
          v.name.toLowerCase() === name.trim().toLowerCase()
      )
    ) {
      toast.error("A venue with this name already exists");
      return;
    }

    setIsSubmitting(true);

    // Update venue in store
    const store = useGlobalStore.getState();
    const updatedVenues = store.venues.map((v) =>
      v.id === venue.id
        ? {
            ...v,
            name: name.trim(),
            address: address.trim(),
            capacity: capacityNum,
            isAvailable,
          }
        : v
    );
    useGlobalStore.setState({ venues: updatedVenues });

    toast.success(`Venue "${name.trim()}" updated successfully`);
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!venue) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Venue</DialogTitle>
          <DialogDescription>
            Update venue information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="venue-name">Venue Name</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="venue-name"
                  placeholder="Enter venue name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue-address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="venue-address"
                  placeholder="Enter full address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue-capacity">Capacity</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="venue-capacity"
                  type="number"
                  placeholder="Maximum capacity"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="pl-10"
                  min="1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="venue-available">Available for booking</Label>
                <p className="text-sm text-slate-500">
                  Can this venue be booked for events?
                </p>
              </div>
              <Switch
                id="venue-available"
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
            </div>

            {/* Preview */}
            <div className="rounded-lg border bg-slate-50 p-4 space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase">
                Preview
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                  <Building className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {name || "Venue Name"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {address || "Address"} •{" "}
                    {capacity
                      ? `${parseInt(capacity).toLocaleString()} seats`
                      : "Capacity"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
