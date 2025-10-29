import { format, parseISO } from "date-fns";
import { Calendar, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  available_spots: number;
  total_spots: number;
}

interface SlotPickerProps {
  slots: Slot[];
  selectedSlot: Slot | null;
  onSelectSlot: (slot: Slot) => void;
}

export const SlotPicker = ({ slots, selectedSlot, onSelectSlot }: SlotPickerProps) => {
  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  return (
    <ScrollArea className="h-96 pr-4">
      <div className="space-y-4">
        {Object.entries(slotsByDate).map(([date, dateSlots]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-3 text-sm font-semibold">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{format(parseISO(date), "EEEE, MMMM dd, yyyy")}</span>
            </div>
            
            <div className="space-y-2">
              {dateSlots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                const isSoldOut = slot.available_spots === 0;

                return (
                  <button
                    key={slot.id}
                    onClick={() => !isSoldOut && onSelectSlot(slot)}
                    disabled={isSoldOut}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 transition-all text-left",
                      "hover:border-primary hover:shadow-md",
                      isSelected && "border-primary bg-primary/5 shadow-md",
                      !isSelected && !isSoldOut && "border-border",
                      isSoldOut && "opacity-50 cursor-not-allowed border-border"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {slot.start_time} - {slot.end_time}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        {isSoldOut ? (
                          <span className="text-destructive font-semibold">Sold Out</span>
                        ) : (
                          <>
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className={cn(
                              "font-medium",
                              slot.available_spots < 3 && "text-accent"
                            )}>
                              {slot.available_spots} left
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
