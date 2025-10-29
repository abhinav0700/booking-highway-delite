import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Calendar, Clock, MapPin, Users, Tag } from "lucide-react";
import { format } from "date-fns";
import type { User } from "@supabase/supabase-js";

const MyBookings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          experience:experiences(*),
          slot:slots(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            View and manage your experience bookings
          </p>
        </div>

        {!bookings || bookings.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
            <p className="text-muted-foreground mb-6">
              Start exploring amazing experiences!
            </p>
            <button
              onClick={() => navigate("/")}
              className="text-primary hover:underline"
            >
              Browse Experiences
            </button>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking: any) => (
              <Card key={booking.id} className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Experience Image */}
                  <div className="w-full md:w-48 h-48 flex-shrink-0">
                    <img
                      src={booking.experience.image_url}
                      alt={booking.experience.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-2xl font-bold">
                          {booking.experience.title}
                        </h3>
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.experience.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(booking.slot.date), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {booking.slot.start_time} - {booking.slot.end_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>
                            {booking.number_of_people}{" "}
                            {booking.number_of_people > 1 ? "people" : "person"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Customer Details
                        </p>
                        <p className="font-medium">{booking.customer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.customer_email}
                        </p>
                      </div>

                      <div className="text-right">
                        {booking.promo_code && (
                          <div className="flex items-center gap-2 text-sm text-success mb-2">
                            <Tag className="h-4 w-4" />
                            <span>Promo: {booking.promo_code}</span>
                          </div>
                        )}
                        {booking.discount_amount > 0 && (
                          <p className="text-sm text-muted-foreground line-through">
                            ₹{(booking.total_amount + booking.discount_amount).toFixed(2)}
                          </p>
                        )}
                        <p className="text-2xl font-bold">
                          ₹{booking.total_amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Booked on{" "}
                          {format(new Date(booking.created_at), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
