import { Link } from "react-router-dom";
import { MapPin, Clock, Star } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Experience {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  duration: string;
  category: string;
  image_url: string;
  rating: number;
  reviews_count: number;
}

interface ExperienceCardProps {
  experience: Experience;
}

export const ExperienceCard = ({ experience }: ExperienceCardProps) => {
  return (
    <Link to={`/experience/${experience.id}`}>
      <Card className="overflow-hidden group hover:shadow-card-hover transition-all duration-300 border-0 shadow-card">
        <div className="relative h-64 overflow-hidden">
          <img
            src={experience.image_url}
            alt={experience.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-card opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-sm font-semibold">{experience.category}</span>
          </div>
          <div className="absolute bottom-4 left-4 bg-accent text-accent-foreground px-4 py-2 rounded-full font-bold text-lg shadow-lg">
            ₹{experience.price}
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {experience.title}
          </h3>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {experience.description}
          </p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="line-clamp-1">{experience.location}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{experience.duration}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-semibold">{experience.rating}</span>
            </div>
            <span className="text-muted-foreground text-sm">
              ({experience.reviews_count} reviews)
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
