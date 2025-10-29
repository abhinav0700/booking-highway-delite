-- Create experiences table
CREATE TABLE public.experiences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create slots table
CREATE TABLE public.slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  available_spots INTEGER NOT NULL,
  total_spots INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  slot_id UUID NOT NULL REFERENCES public.slots(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  number_of_people INTEGER NOT NULL DEFAULT 1,
  promo_code TEXT,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promo_codes table
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Experiences are viewable by everyone" 
ON public.experiences FOR SELECT USING (true);

CREATE POLICY "Slots are viewable by everyone" 
ON public.slots FOR SELECT USING (true);

CREATE POLICY "Promo codes are viewable by everyone" 
ON public.promo_codes FOR SELECT USING (true);

-- Bookings can be created by anyone
CREATE POLICY "Anyone can create bookings" 
ON public.bookings FOR INSERT WITH CHECK (true);

-- Bookings can be viewed by the customer (by email)
CREATE POLICY "Customers can view their own bookings" 
ON public.bookings FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_slots_experience_id ON public.slots(experience_id);
CREATE INDEX idx_slots_date ON public.slots(date);
CREATE INDEX idx_bookings_experience_id ON public.bookings(experience_id);
CREATE INDEX idx_bookings_slot_id ON public.bookings(slot_id);
CREATE INDEX idx_bookings_email ON public.bookings(customer_email);
CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_experiences_updated_at
BEFORE UPDATE ON public.experiences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample experiences
INSERT INTO public.experiences (title, description, location, price, duration, category, image_url, rating, reviews_count) VALUES
('Sunset Kayaking Adventure', 'Paddle through calm waters as the sun sets over the horizon. Perfect for beginners and experienced kayakers alike. Includes all equipment and a professional guide.', 'Maldives', 89.99, '2 hours', 'Water Sports', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop', 4.8, 124),
('Mountain Hiking Experience', 'Explore breathtaking mountain trails with stunning views. Suitable for all fitness levels. Includes lunch and professional guide.', 'Swiss Alps', 120.00, '5 hours', 'Adventure', 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&h=600&fit=crop', 4.9, 89),
('City Food Tour', 'Discover authentic local cuisine on this guided food tour. Visit 5 local restaurants and taste traditional dishes.', 'Tokyo', 75.50, '3 hours', 'Food & Drink', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop', 4.7, 156),
('Wildlife Safari', 'Experience nature up close on this thrilling safari adventure. See exotic animals in their natural habitat with expert guides.', 'Kenya', 299.00, '8 hours', 'Nature', 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=600&fit=crop', 5.0, 203),
('Cooking Class', 'Learn to cook traditional dishes from a local chef. Includes ingredients, recipes, and a delicious meal.', 'Italy', 95.00, '4 hours', 'Food & Drink', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=600&fit=crop', 4.6, 78),
('Scuba Diving', 'Explore vibrant coral reefs and marine life. Perfect for beginners with full training included.', 'Great Barrier Reef', 199.99, '4 hours', 'Water Sports', 'https://images.unsplash.com/photo-1544551763-92ee28e25f6f?w=800&h=600&fit=crop', 4.8, 167);

-- Insert sample promo codes
INSERT INTO public.promo_codes (code, discount_type, discount_value, min_purchase, valid_until, is_active) VALUES
('SAVE10', 'percentage', 10, 50, now() + interval '30 days', true),
('FLAT100', 'fixed', 100, 200, now() + interval '30 days', true),
('SUMMER20', 'percentage', 20, 100, now() + interval '60 days', true);