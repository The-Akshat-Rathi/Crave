import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Music } from '@/types/music';
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
import { X, ThumbsUp, Search, Music as MusicIcon } from 'lucide-react';

interface MusicSelectorProps {
  restaurantId: number;
  onClose: () => void;
}

const MusicSelector = ({ restaurantId, onClose }: MusicSelectorProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  
  // Fetch currently playing music
  const { data: currentlyPlaying } = useQuery<Music>({
    queryKey: [`/api/restaurants/${restaurantId}/currently-playing`],
    enabled: !!restaurantId,
  });
  
  // Fetch all music suggestions
  const { data: musicSuggestions } = useQuery<Music[]>({
    queryKey: [`/api/restaurants/${restaurantId}/music`],
    enabled: !!restaurantId,
  });
  
  // Upvote mutation
  const upvoteMutation = useMutation({
    mutationFn: async (musicId: number) => {
      const response = await apiRequest('POST', `/api/music/${musicId}/upvote`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${restaurantId}/music`] });
      toast({
        title: 'Vote recorded',
        description: 'Your vote has been recorded.',
      });
    },
  });
  
  // Add music suggestion mutation
  const addMusicMutation = useMutation({
    mutationFn: async (data: { title: string, artist: string }) => {
      if (!user) throw new Error('You must be logged in to suggest music');
      
      const response = await apiRequest('POST', '/api/music', {
        restaurantId,
        title: data.title,
        artist: data.artist,
        requestedBy: user.id,
        upvotes: 1,
        isPlaying: false,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/restaurants/${restaurantId}/music`] });
      toast({
        title: 'Song suggested',
        description: 'Your song suggestion has been added.',
      });
    },
  });
  
  const handleUpvote = (musicId: number) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please login to vote for music',
        variant: 'destructive',
      });
      return;
    }
    
    upvoteMutation.mutate(musicId);
  };
  
  const handleAddSong = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please login to suggest music',
        variant: 'destructive',
      });
      return;
    }
    
    // In a real app, this would open a search interface to find songs
    // For this demo, we'll use a simple prompt
    const title = prompt('Enter song title:');
    const artist = prompt('Enter artist name:');
    
    if (title && artist) {
      addMusicMutation.mutate({ title, artist });
    }
  };
  
  const genres = ['Jazz', 'Classical', 'Pop', 'Lounge', 'Rock', 'R&B'];
  
  const filteredSuggestions = musicSuggestions?.filter(music => 
    (searchQuery === '' || 
      music.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      music.artist.toLowerCase().includes(searchQuery.toLowerCase())
    ) && (!selectedGenre || true) // In a real app, you would filter by genre
  );
  
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader className="bg-gradient-to-r from-primary to-secondary text-white p-6 -m-6 mb-6 rounded-t-lg">
          <DialogTitle className="text-xl font-bold mb-1">Request Music</DialogTitle>
          <DialogDescription className="text-primary-100">
            Suggest songs to enhance your dining experience
          </DialogDescription>
        </DialogHeader>
        
        {/* Current Playing */}
        {currentlyPlaying && (
          <div className="p-5 border-b">
            <h3 className="text-sm font-medium text-gray-500 mb-3">CURRENTLY PLAYING</h3>
            <div className="flex items-center">
              <div className="w-14 h-14 bg-gray-200 rounded-md overflow-hidden flex-shrink-0 mr-4 flex items-center justify-center">
                <MusicIcon className="text-gray-400" size={24} />
              </div>
              <div className="flex-grow">
                <h4 className="font-medium text-gray-800">{currentlyPlaying.title}</h4>
                <p className="text-gray-500 text-sm">{currentlyPlaying.artist}</p>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center">
                  <div className="w-1 h-5 bg-primary rounded-full animate-pulse"></div>
                  <div className="w-1 h-3 bg-primary mx-1 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-6 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Search Music */}
        <div className="p-5">
          <div className="relative mb-5">
            <Input
              type="text"
              placeholder="Search for songs, artists..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
          </div>
          
          {/* Popular Genres */}
          <h3 className="text-sm font-medium text-gray-500 mb-3">POPULAR GENRES</h3>
          <div className="grid grid-cols-2 gap-2 mb-6">
            {genres.map((genre) => (
              <Button
                key={genre}
                variant={selectedGenre === genre ? "default" : "outline"}
                size="sm"
                className="justify-start"
                onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
              >
                {genre}
              </Button>
            ))}
          </div>
          
          {/* Requested Songs */}
          <h3 className="text-sm font-medium text-gray-500 mb-3">SUGGESTED BY GUESTS</h3>
          <div className="space-y-3 max-h-60 overflow-auto">
            {filteredSuggestions && filteredSuggestions.length > 0 ? (
              filteredSuggestions.map((music) => (
                <div key={music.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0 mr-3 flex items-center justify-center">
                      <MusicIcon className="text-gray-400" size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{music.title}</h4>
                      <p className="text-gray-500 text-xs">{music.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-primary text-white text-xs rounded-full px-2 py-1 mr-3">
                      <ThumbsUp className="mr-1 inline" size={12} /> {music.upvotes}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8 rounded-full"
                      onClick={() => handleUpvote(music.id)}
                      disabled={upvoteMutation.isPending}
                    >
                      <ThumbsUp size={14} />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No music suggestions yet</p>
            )}
          </div>
          
          {/* Add Song Button */}
          <div className="mt-6">
            <Button
              className="w-full"
              onClick={handleAddSong}
              disabled={addMusicMutation.isPending}
            >
              {addMusicMutation.isPending ? 'Adding song...' : (
                <>
                  <i className="fas fa-plus mr-2"></i> Add Song Request
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MusicSelector;
