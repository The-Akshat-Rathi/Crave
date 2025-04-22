import { useState } from 'react';
import { Restaurant } from '@/lib/types';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Plus, Minus, UmbrellaIcon, HomeIcon, WineIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface TableBookingProps {
  restaurant: Restaurant;
  onClose: () => void;
}

const TableBooking = ({ restaurant, onClose }: TableBookingProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState('7:00 PM');
  const [guests, setGuests] = useState(2);
  const [seatingPreference, setSeatingPreference] = useState('outdoor');
  const [specialRequests, setSpecialRequests] = useState('');
  
  const bookTableMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/reservations', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/reservations`] });
      toast({
        title: 'Reservation confirmed',
        description: `Your table at ${restaurant.name} is booked for ${format(date!, 'PPP')} at ${time}`,
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Booking failed',
        description: error instanceof Error ? error.message : 'Please try again later',
        variant: 'destructive',
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please login to book a table',
        variant: 'destructive',
      });
      return;
    }
    
    if (!date) {
      toast({
        title: 'Date required',
        description: 'Please select a date for your reservation',
        variant: 'destructive',
      });
      return;
    }
    
    bookTableMutation.mutate({
      userId: user.id,
      restaurantId: restaurant.id,
      date: date.toISOString(),
      time,
      guests,
      status: 'pending',
      specialRequests,
    });
  };
  
  const decreaseGuests = () => {
    if (guests > 1) {
      setGuests(guests - 1);
    }
  };
  
  const increaseGuests = () => {
    if (guests < 20) {
      setGuests(guests + 1);
    }
  };
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader className="bg-primary text-white p-6 -m-6 mb-6 rounded-t-lg">
          <DialogTitle className="text-xl font-bold">Reserve a Table</DialogTitle>
          <DialogDescription className="text-primary-100">{restaurant.name}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Time</label>
              <select 
                className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              >
                <option>7:00 PM</option>
                <option>7:30 PM</option>
                <option>8:00 PM</option>
                <option>8:30 PM</option>
                <option>9:00 PM</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Number of Guests</label>
            <div className="flex justify-between items-center border rounded-lg overflow-hidden">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="p-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-none h-auto"
                onClick={decreaseGuests}
              >
                <Minus size={16} />
              </Button>
              <span className="text-center flex-grow font-medium">{guests} Guests</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="p-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-none h-auto"
                onClick={increaseGuests}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Seating Preference</label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={seatingPreference === 'outdoor' ? 'default' : 'outline'}
                className={`flex flex-col items-center p-3 h-auto`}
                onClick={() => setSeatingPreference('outdoor')}
              >
                <UmbrellaIcon className="mb-1" size={18} />
                <span className="block text-xs">Outdoor</span>
              </Button>
              <Button
                type="button"
                variant={seatingPreference === 'indoor' ? 'default' : 'outline'}
                className={`flex flex-col items-center p-3 h-auto`}
                onClick={() => setSeatingPreference('indoor')}
              >
                <HomeIcon className="mb-1" size={18} />
                <span className="block text-xs">Indoor</span>
              </Button>
              <Button
                type="button"
                variant={seatingPreference === 'bar' ? 'default' : 'outline'}
                className={`flex flex-col items-center p-3 h-auto`}
                onClick={() => setSeatingPreference('bar')}
              >
                <WineIcon className="mb-1" size={18} />
                <span className="block text-xs">Bar</span>
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Special Requests</label>
            <Textarea
              className="w-full p-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary h-24"
              placeholder="Any special requests or dietary requirements?"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            />
          </div>

          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-medium mb-2">Add Advance Order (Optional)</label>
            <Button
              type="button"
              variant="outline"
              className="w-full p-3 border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 h-auto"
            >
              <Plus size={16} className="mr-2" /> Add items to your reservation
            </Button>
          </div>

          <p className="text-sm text-gray-500 mb-6">Your table will be held for 15 minutes after the reservation time.</p>

          <Button
            type="submit"
            className="w-full py-3"
            disabled={bookTableMutation.isPending}
          >
            {bookTableMutation.isPending ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              'Confirm Reservation'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TableBooking;
