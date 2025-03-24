"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { AlertCircle } from "lucide-react";

type BookingDialogProps = {
  courtId: number;
  availableTimes: string[];
  onBook: (time: string, date: string) => Promise<void>;
};

export function BookingDialog({
  courtId,
  availableTimes,
  onBook,
}: BookingDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0] // Default to today
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!selectedTime) {
      setError("Please select a time slot.");
      setLoading(false);
      return;
    }

    try {
      await onBook(selectedTime, selectedDate);
      setIsOpen(false);
      setSelectedTime("");
      setSelectedDate(new Date().toISOString().split("T")[0]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to book the court.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3">
          Book Now
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Book Court
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-gray-700 dark:text-gray-200">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]} // Prevent past dates
              className="bg-gray-50 dark:bg-gray-700"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className="text-gray-700 dark:text-gray-200">
              Time Slot
            </Label>
            <select
              id="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-gray-900 dark:text-white"
              required
            >
              <option value="">Select a time</option>
              {availableTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={loading}
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
