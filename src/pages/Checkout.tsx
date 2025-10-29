import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Tag, Calendar, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import type { User } from "@supabase/supabase-js";

const Checkout = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  const { slot, experience } = location.state || {};

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to complete your booking",
          variant: "destructive",
        });
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });
  }, [navigate, toast]);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    numberOfPeople: 1,
    promoCode: "",
  });

  const [promoApplied, setPromoApplied] = useState<any>(null);
  const [promoError, setPromoError] = useState("");

  // Validate promo code
  const validatePromo = useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error) throw new Error("Invalid promo code");
      
      // Check if promo is still valid
      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        throw new Error("Promo code has expired");
      }

      return data;
    },
    onSuccess: (data) => {
      setPromoApplied(data);
      setPromoError("");
      toast({
        title: "Promo code applied!",
        description: `You saved ${data.discount_type === 'percentage' ? data.discount_value + '%' : '₹' + data.discount_value}`,
      });
    },
    onError: (error: Error) => {
      setPromoError(error.message);
      setPromoApplied(null);
    },
  });

  const createBooking = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");
      
      // Calculate total
      const subtotal = experience.price * formData.numberOfPeople;
      let discount = 0;

      if (promoApplied) {
        if (subtotal < promoApplied.min_purchase) {
          throw new Error(`Minimum purchase of ₹${promoApplied.min_purchase} required`);
        }

        if (promoApplied.discount_type === "percentage") {
          discount = (subtotal * promoApplied.discount_value) / 100;
        } else {
          discount = promoApplied.discount_value;
        }
      }

      const total = subtotal - discount;

      // First, check if slot still has availability
      const { data: currentSlot } = await supabase
        .from("slots")
        .select("available_spots")
        .eq("id", slot.id)
        .single();

      if (!currentSlot || currentSlot.available_spots < formData.numberOfPeople) {
        throw new Error("Not enough spots available");
      }

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          experience_id: experience.id,
          slot_id: slot.id,
          user_id: user.id,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          number_of_people: formData.numberOfPeople,
          promo_code: promoApplied?.code || null,
          discount_amount: discount,
          total_amount: total,
          status: "confirmed",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Update slot availability
      const { error: updateError } = await supabase
        .from("slots")
        .update({
          available_spots: currentSlot.available_spots - formData.numberOfPeople,
        })
        .eq("id", slot.id);

      if (updateError) throw updateError;

      return booking;
    },
    onSuccess: (booking) => {
      navigate("/confirmation", { state: { booking, experience, slot } });
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!experience || !slot) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Invalid booking session</h2>
        <Button onClick={() => navigate("/")}>Back to Home</Button>
      </div>
    );
  }

  const subtotal = experience.price * formData.numberOfPeople;
  let discount = 0;

  if (promoApplied) {
    if (promoApplied.discount_type === "percentage") {
      discount = (subtotal * promoApplied.discount_value) / 100;
    } else {
      discount = promoApplied.discount_value;
    }
  }

  const total = subtotal - discount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createBooking.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Your Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <Label htmlFor="numberOfPeople">Number of People *</Label>
                      <Input
                        id="numberOfPeople"
                        type="number"
                        min="1"
                        max={slot.available_spots}
                        value={formData.numberOfPeople}
                        onChange={(e) => setFormData({ ...formData, numberOfPeople: parseInt(e.target.value) })}
                        required
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Maximum {slot.available_spots} people available
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">Promo Code</h3>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        value={formData.promoCode}
                        onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                        placeholder="Enter promo code"
                        disabled={!!promoApplied}
                      />
                      {promoError && (
                        <p className="text-sm text-destructive mt-1">{promoError}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => validatePromo.mutate(formData.promoCode)}
                      disabled={!formData.promoCode || !!promoApplied || validatePromo.isPending}
                    >
                      {validatePromo.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : promoApplied ? (
                        "Applied"
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                  {promoApplied && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-success">
                      <Tag className="h-4 w-4" />
                      <span>
                        {promoApplied.discount_type === "percentage"
                          ? `${promoApplied.discount_value}% discount applied`
                          : `₹${promoApplied.discount_value} discount applied`}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                  disabled={createBooking.isPending}
                >
                  {createBooking.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Confirm Booking - $${total.toFixed(2)}`
                  )}
                </Button>
              </form>
            </Card>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h3 className="text-xl font-bold mb-6">Booking Summary</h3>

              <div className="space-y-4">
                <div>
                  <img
                    src={experience.image_url}
                    alt={experience.title}
                    className="w-full h-40 object-cover rounded-xl mb-4"
                  />
                  <h4 className="font-semibold text-lg mb-2">{experience.title}</h4>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{experience.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(slot.date), "MMMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{slot.start_time} - {slot.end_time}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      ₹{experience.price} × {formData.numberOfPeople} {formData.numberOfPeople > 1 ? 'people' : 'person'}
                    </span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
