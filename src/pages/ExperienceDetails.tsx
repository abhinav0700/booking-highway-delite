import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin, Clock, Star, Users, ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SlotPicker } from "@/components/SlotPicker";
import { useState } from "react";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";

const ExperienceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const { data: experience, isLoading } = useQuery({
    queryKey: ["experience", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: slots } = useQuery({
    queryKey: ["slots", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("slots")
        .select("*")
        .eq("experience_id", id)
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const handleBookNow = () => {
    if (selectedSlot && experience) {
      navigate(`/checkout/${experience.id}`, {
        state: { slot: selectedSlot, experience },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Experience not found</h2>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Experiences
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Experience Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-card">
              <img
                src={experience.image_url}
                alt={experience.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-4 py-2 rounded-full font-bold text-xl shadow-lg">
                ₹{experience.price} / person
              </div>
            </div>

            {/* Title & Meta */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-4">{experience.title}</h1>
                  <div className="flex items-center gap-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span>{experience.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      <span>{experience.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-accent text-accent" />
                      <span className="font-semibold text-foreground">
                        {experience.rating}
                      </span>
                      <span>({experience.reviews_count} reviews)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="inline-block bg-secondary px-4 py-2 rounded-full text-sm font-medium">
                {experience.category}
              </div>
            </div>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">About this experience</h2>
              <p className="text-muted-foreground leading-relaxed">
                {experience.description}
              </p>
            </Card>

            {/* What's Included */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">What's included</h2>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">✓</span>
                  <span>Professional guide and equipment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">✓</span>
                  <span>Safety briefing and insurance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">✓</span>
                  <span>All necessary equipment provided</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">✓</span>
                  <span>Photos and memories to take home</span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8 shadow-card-hover">
              <h3 className="text-2xl font-bold mb-6">Select Date & Time</h3>

              {slots && slots.length > 0 ? (
                <>
                  <SlotPicker
                    slots={slots}
                    selectedSlot={selectedSlot}
                    onSelectSlot={setSelectedSlot}
                  />

                  {selectedSlot && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-xl">
                      <h4 className="font-semibold mb-2">Selected Slot</h4>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(selectedSlot.date), "MMMM dd, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {selectedSlot.start_time} - {selectedSlot.end_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{selectedSlot.available_spots} spots available</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleBookNow}
                    disabled={!selectedSlot}
                    className="w-full mt-6 h-12 text-base font-semibold"
                    size="lg"
                  >
                    Book Now
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No available slots at the moment. Check back soon!
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetails;
