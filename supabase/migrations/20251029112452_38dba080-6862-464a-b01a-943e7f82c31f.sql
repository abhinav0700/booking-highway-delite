-- Create profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add user_id to bookings table
ALTER TABLE public.bookings ADD COLUMN user_id uuid REFERENCES public.profiles(id);

-- Update bookings RLS policies
DROP POLICY IF EXISTS "Customers can view their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;

CREATE POLICY "Users can view their own bookings"
  ON public.bookings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create bookings"
  ON public.bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert more experiences with INR prices (converted from USD, ~83x)
INSERT INTO public.experiences (title, description, location, price, duration, category, image_url, rating, reviews_count) VALUES
('Taj Mahal Sunrise Tour', 'Experience the breathtaking beauty of the Taj Mahal at sunrise. Professional guide included with skip-the-line access to this wonder of the world.', 'Agra, India', 4150, '4 hours', 'Cultural', 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80', 4.9, 342),
('Kerala Backwater Houseboat', 'Cruise through the serene backwaters of Kerala on a traditional houseboat. Includes meals and overnight stay with stunning sunset views.', 'Alleppey, Kerala', 12450, '24 hours', 'Adventure', 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80', 4.8, 256),
('Goa Beach Scuba Diving', 'Explore the underwater world of Goa with certified instructors. Equipment provided, suitable for beginners and experienced divers.', 'Goa, India', 5800, '3 hours', 'Adventure', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', 4.7, 189),
('Rajasthan Desert Safari', 'Experience the Thar Desert on camelback, visit local villages, and enjoy traditional Rajasthani dinner under the stars.', 'Jaisalmer, Rajasthan', 6650, '8 hours', 'Adventure', 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800&q=80', 4.8, 298),
('Mumbai Street Food Tour', 'Taste the authentic flavors of Mumbai with a local guide. Visit hidden gems and popular spots for an unforgettable culinary journey.', 'Mumbai, India', 2490, '3 hours', 'Food', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80', 4.9, 412),
('Himalayan Trekking Adventure', 'Multi-day trek through stunning Himalayan landscapes. Includes camping, meals, and experienced mountain guides.', 'Manali, Himachal Pradesh', 16600, '5 days', 'Adventure', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 4.9, 167),
('Varanasi Spiritual Walk', 'Witness the ancient Ganga Aarti ceremony and explore the spiritual heart of India with a knowledgeable local guide.', 'Varanasi, UP', 1650, '2 hours', 'Cultural', 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80', 4.8, 523),
('Jaipur Palace Tour', 'Visit the magnificent forts and palaces of the Pink City including Amber Fort, City Palace, and Hawa Mahal.', 'Jaipur, Rajasthan', 3320, '6 hours', 'Cultural', 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80', 4.7, 387),
('Rishikesh River Rafting', 'Thrilling white water rafting experience on the holy Ganges. Professional safety equipment and guides provided.', 'Rishikesh, Uttarakhand', 2900, '4 hours', 'Adventure', 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&q=80', 4.8, 276),
('Delhi Heritage Walk', 'Explore Old Delhi''s narrow lanes, historical monuments, and vibrant markets. Includes rickshaw ride and chai tasting.', 'Delhi, India', 1850, '3 hours', 'Cultural', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80', 4.6, 298)