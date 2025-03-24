// src/app/courts/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "../../../lib/supabase";
import { Navigation } from "../../../components/Navigation";
import { Footer } from "../../../components/Footer";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { MapPin, Clock, Phone, Trash2, AlertCircle } from "lucide-react";
import { BookingDialog } from "../../../components/BookingDialog";
import { BookingsList } from "../../../components/BookingList";

// Define Court type
type Court = {
  id: number;
  name: string;
  location: string;
  availableTimes: string[];
  amenities: string[];
  pricePerHour: string;
  color: string;
  rating: number;
  reviews: number;
  description?: string;
  city?: string;
  contactNumber?: string;
  created_by?: string;
  images: string[];
};

// Extend type for edit form to include newImageFile
type EditCourt = Partial<Court> & { newImageFile?: File | null };

export default function CourtOverview() {
  const { id } = useParams();
  const router = useRouter();
  const [court, setCourt] = useState<Court | null>(null);
  const [bookedTimes, setBookedTimes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editCourt, setEditCourt] = useState<EditCourt>({});

  useEffect(() => {
    const fetchCourtAndUser = async () => {
      try {
        // Fetch current user
        const { data: userData, error: userError } =
          await supabase.auth.getUser();
        if (userError) {
          console.error("Error fetching user:", userError.message);
        } else if (userData.user) {
          setCurrentUserId(userData.user.id);
        }

        // Fetch court data
        const { data: courtData, error: courtError } = await supabase
          .from("courts")
          .select("*")
          .eq("id", id)
          .single();

        if (courtError) {
          throw new Error("Failed to fetch court: " + courtError.message);
        }

        if (!courtData) {
          throw new Error("Court not found");
        }

        const court: Court = {
          id: courtData.id,
          name: courtData.name,
          location: courtData.location,
          availableTimes: courtData.available_times || [],
          amenities: courtData.amenities || [],
          pricePerHour: courtData.price_per_hour,
          color: courtData.color,
          rating: courtData.rating,
          reviews: courtData.reviews,
          description: courtData.description,
          city: courtData.city,
          contactNumber: courtData.contact_number,
          created_by: courtData.created_by,
          images: courtData.images || [],
        };

        setCourt(court);
        setEditCourt(court);

        // Fetch existing bookings for today to filter available times
        const today = new Date().toISOString().split("T")[0];
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("court_bookings")
          .select("booking_time")
          .eq("court_id", id)
          .eq("booking_date", today);

        if (bookingsError) {
          console.error("Error fetching bookings:", bookingsError.message);
        } else {
          setBookedTimes(
            new Set(bookingsData?.map((b) => b.booking_time) || [])
          );
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        console.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCourtAndUser();
  }, [id]);

  const handleDeleteCourt = async () => {
    if (!court || !currentUserId || court.created_by !== currentUserId) return;

    if (!confirm(`Are you sure you want to delete "${court.name}"?`)) return;

    try {
      const { error } = await supabase
        .from("courts")
        .delete()
        .eq("id", court.id)
        .eq("created_by", currentUserId);

      if (error) {
        throw new Error("Failed to delete court: " + error.message);
      }

      router.push("/courts");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error(errorMessage);
      setError(errorMessage);
    }
  };

  const handleEditCourt = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!editCourt.name) {
      setError("Court name is required.");
      setLoading(false);
      return;
    }
    if (!editCourt.location) {
      setError("Court location is required.");
      setLoading(false);
      return;
    }
    if (!editCourt.pricePerHour) {
      setError("Price per hour is required.");
      setLoading(false);
      return;
    }

    try {
      let imageUrl = editCourt.images?.[0] || court!.images[0] || "";
      if (editCourt.newImageFile) {
        const fileExt = editCourt.newImageFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("court-images")
          .upload(fileName, editCourt.newImageFile);

        if (uploadError) {
          throw new Error("Failed to upload image: " + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from("court-images")
          .getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }

      const updatedData: Court = {
        id: court!.id,
        name: editCourt.name || court!.name,
        location: editCourt.location || court!.location,
        availableTimes: editCourt.availableTimes || court!.availableTimes,
        amenities: editCourt.amenities || court!.amenities,
        pricePerHour: editCourt.pricePerHour || court!.pricePerHour,
        color: editCourt.color || court!.color,
        rating: court!.rating,
        reviews: court!.reviews,
        description: editCourt.description || court!.description,
        city: editCourt.city !== undefined ? editCourt.city : court!.city,
        contactNumber:
          editCourt.contactNumber !== undefined
            ? editCourt.contactNumber
            : court!.contactNumber,
        created_by: court!.created_by,
        images: imageUrl ? [imageUrl] : editCourt.images || court!.images,
      };

      const { error: updateError } = await supabase
        .from("courts")
        .update(updatedData)
        .eq("id", court!.id)
        .eq("created_by", currentUserId);

      if (updateError) {
        throw new Error("Failed to update court: " + updateError.message);
      }

      setCourt(updatedData);
      setEditCourt(updatedData);
      setIsEditDialogOpen(false);
      setError("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Edit error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBookCourt = async (time: string, date: string) => {
    if (!currentUserId) {
      throw new Error("You must be signed in to book a court.");
    }

    if (
      bookedTimes.has(time) &&
      date === new Date().toISOString().split("T")[0]
    ) {
      throw new Error("This time slot is already booked for today.");
    }

    const { error } = await supabase.from("court_bookings").insert({
      court_id: court!.id,
      user_id: currentUserId,
      booking_time: time,
      booking_date: date,
    });

    if (error) {
      if (error.code === "23505") {
        throw new Error("This time slot is already booked.");
      }
      throw new Error("Failed to book court: " + error.message);
    }

    if (date === new Date().toISOString().split("T")[0]) {
      setBookedTimes((prev) => new Set([...prev, time]));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  if (error || !court) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-red-600 dark:text-red-300">
          {error || "Court not found"}
        </p>
      </div>
    );
  }

  const canEditOrDelete = currentUserId && court.created_by === currentUserId;
  const availableTimesToday = court.availableTimes.filter(
    (time) => !bookedTimes.has(time)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navigation />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {court.images && court.images.length > 0 ? (
            <Image
              src={court.images[0]}
              alt={`${court.name} image`}
              width={1200}
              height={256}
              className="w-full h-64 rounded-t-xl object-cover"
              priority={true}
            />
          ) : (
            <div
              className="w-full h-64 rounded-t-xl"
              style={{ backgroundColor: court.color }}
            />
          )}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {court.name}
              </h1>
              {canEditOrDelete && (
                <div className="flex gap-2">
                  <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Edit Court
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 p-6 rounded-xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
                          Edit Court
                        </DialogTitle>
                      </DialogHeader>

                      {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg p-4 flex items-start">
                          <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                          <p>{error}</p>
                        </div>
                      )}

                      <form onSubmit={handleEditCourt} className="space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            Name
                          </Label>
                          <Input
                            id="name"
                            value={editCourt.name || ""}
                            onChange={(e) =>
                              setEditCourt({
                                ...editCourt,
                                name: e.target.value,
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="location"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            Location
                          </Label>
                          <Input
                            id="location"
                            value={editCourt.location || ""}
                            onChange={(e) =>
                              setEditCourt({
                                ...editCourt,
                                location: e.target.value,
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="city"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            City
                          </Label>
                          <Input
                            id="city"
                            value={editCourt.city || ""}
                            onChange={(e) =>
                              setEditCourt({
                                ...editCourt,
                                city: e.target.value,
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="description"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            Description
                          </Label>
                          <Textarea
                            id="description"
                            value={editCourt.description || ""}
                            onChange={(e) =>
                              setEditCourt({
                                ...editCourt,
                                description: e.target.value,
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="pricePerHour"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            Price Per Hour
                          </Label>
                          <Input
                            id="pricePerHour"
                            value={editCourt.pricePerHour || ""}
                            onChange={(e) =>
                              setEditCourt({
                                ...editCourt,
                                pricePerHour: e.target.value,
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="availableTimes"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            Available Times (comma-separated)
                          </Label>
                          <Input
                            id="availableTimes"
                            value={editCourt.availableTimes?.join(", ") || ""}
                            onChange={(e) =>
                              setEditCourt({
                                ...editCourt,
                                availableTimes: e.target.value
                                  .split(",")
                                  .map((t) => t.trim()),
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="amenities"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            Amenities (comma-separated)
                          </Label>
                          <Input
                            id="amenities"
                            value={editCourt.amenities?.join(", ") || ""}
                            onChange={(e) =>
                              setEditCourt({
                                ...editCourt,
                                amenities: e.target.value
                                  .split(",")
                                  .map((a) => a.trim()),
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="color"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            Color
                          </Label>
                          <Input
                            id="color"
                            type="color"
                            value={editCourt.color || ""}
                            onChange={(e) =>
                              setEditCourt({
                                ...editCourt,
                                color: e.target.value,
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="contactNumber"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            Contact Number
                          </Label>
                          <Input
                            id="contactNumber"
                            value={editCourt.contactNumber || ""}
                            onChange={(e) =>
                              setEditCourt({
                                ...editCourt,
                                contactNumber: e.target.value,
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="image"
                            className="text-gray-700 dark:text-gray-200"
                          >
                            Image
                          </Label>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setEditCourt({
                                ...editCourt,
                                newImageFile: e.target.files?.[0] || null,
                              })
                            }
                            className="bg-gray-50 dark:bg-gray-700"
                          />
                          {editCourt.images?.[0] && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Current image:{" "}
                              {editCourt.images[0].substring(0, 30)}...
                            </p>
                          )}
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            onClick={() => setIsEditDialogOpen(false)}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={loading}
                          >
                            {loading ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteCourt}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Court
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
              <MapPin className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
              {court.location}, {court.city}
            </div>
            {court.contactNumber && (
              <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                <Phone className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                {court.contactNumber}
              </div>
            )}
            <p className="text-gray-700 dark:text-gray-200 mb-6">
              {court.description || "No description available."}
            </p>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Available Times
              </h2>
              <div className="flex flex-wrap gap-2">
                {court.availableTimes.length > 0 ? (
                  court.availableTimes.map((time, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`py-1 border-gray-300 dark:border-gray-600 ${
                        bookedTimes.has(time)
                          ? "text-gray-400 dark:text-gray-500 bg-gray-200 dark:bg-gray-700"
                          : "text-gray-700 dark:text-gray-300"
                      } flex items-center`}
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      {time}
                      {bookedTimes.has(time) && " (Booked)"}
                    </Badge>
                  ))
                ) : (
                  <Badge
                    variant="outline"
                    className="py-1 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
                  >
                    No times available
                  </Badge>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Amenities
              </h2>
              <div className="flex flex-wrap gap-2">
                {court.amenities.length > 0 ? (
                  court.amenities.map((amenity, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                      {amenity}
                    </Badge>
                  ))
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  >
                    No amenities listed
                  </Badge>
                )}
              </div>
            </div>

            {canEditOrDelete && <BookingsList courtId={court.id} />}

            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-gray-900 dark:text-white font-bold text-2xl">
                  {court.pricePerHour}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                  per hour
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="text-gray-800 dark:text-white font-medium">
                  {court.rating}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                  ({court.reviews} reviews)
                </span>
              </div>
            </div>

            <BookingDialog
              courtId={court.id}
              availableTimes={availableTimesToday}
              onBook={handleBookCourt}
            />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
