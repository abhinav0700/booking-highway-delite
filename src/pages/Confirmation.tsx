import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Calendar, Clock, MapPin, Users, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, experience, slot } = location.state || {};

  useEffect(() => {
    if (!booking || !experience || !slot) {
      navigate("/");
    }
  }, [booking, experience, slot, navigate]);

  if (!booking || !experience || !slot) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center p-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-success/10 rounded-full mb-4">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground text-lg">
            Your adventure is all set. We've sent a confirmation email to {booking.customer_email}
          </p>
        </div>

        <Card className="p-8 shadow-card-hover">
          {/* Booking Reference */}
          <div className="text-center mb-8 pb-8 border-b border-border">
            <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
            <p className="text-2xl font-mono font-bold">{booking.id.slice(0, 8).toUpperCase()}</p>
          </div>

          {/* Experience Details */}
          <div className="mb-8">
            <img
              src={experience.image_url}
              alt={experience.title}
              className="w-full h-48 object-cover rounded-xl mb-4"
            />
            <h2 className="text-2xl font-bold mb-4">{experience.title}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium text-foreground">{experience.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">
                    {format(new Date(slot.date), "MMMM dd, yyyy")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="font-medium text-foreground">
                    {slot.start_time} - {slot.end_time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Participants</p>
                  <p className="font-medium text-foreground">
                    {booking.number_of_people} {booking.number_of_people > 1 ? 'people' : 'person'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="mb-8 pb-8 border-b border-border">
            <h3 className="font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5" />
                <span>{booking.customer_email}</span>
              </div>
              {booking.customer_phone && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-5 w-5" />
                  <span>{booking.customer_phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4">Payment Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{(booking.total_amount + booking.discount_amount).toFixed(2)}</span>
              </div>
              {booking.discount_amount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Discount ({booking.promo_code})</span>
                  <span>-₹{booking.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-border">
                <span>Total Paid</span>
                <span>₹{booking.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate("/")}
              className="flex-1 h-12"
              size="lg"
            >
              Browse More Experiences
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="flex-1 h-12"
              size="lg"
            >
              Print Confirmation
            </Button>
          </div>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Need help? Contact us at support@bookit.com or call +91 1800 123 4567</p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Confirmation;
