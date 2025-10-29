import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Search, Calendar } from "lucide-react";
import { useState } from "react";
import { ExperienceCard } from "@/components/ExperienceCard";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: experiences, isLoading } = useQuery({
    queryKey: ["experiences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("experiences")
        .select("*")
        .order("rating", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredExperiences = experiences?.filter((exp) =>
    exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exp.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Hero Section */}
      <section className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Discover Amazing Experiences
            </h1>
            <p className="text-lg md:text-xl mb-8 text-primary-foreground/90">
              Book unforgettable adventures around the world. From thrilling outdoor activities to cultural food tours.
            </p>
            
            {/* Search Bar */}
            <div className="bg-card rounded-2xl p-2 shadow-card-hover max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search experiences, locations, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-base border-0 focus-visible:ring-0 bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experiences Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Popular Experiences</h2>
            <p className="text-muted-foreground">
              {filteredExperiences?.length || 0} experiences available
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : filteredExperiences && filteredExperiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiences.map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No experiences found</h3>
            <p className="text-muted-foreground">Try adjusting your search</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
