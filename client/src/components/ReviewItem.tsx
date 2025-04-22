import { useQuery } from '@tanstack/react-query';
import { Review, User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { ThumbsUp, MessageSquare } from 'lucide-react';

interface ReviewItemProps {
  review: Review;
}

const ReviewItem = ({ review }: ReviewItemProps) => {
  // Fetch user data for the reviewer
  const { data: reviewer } = useQuery<User>({
    queryKey: [`/api/users/${review.userId}`],
    enabled: !!review.userId,
  });
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffDays = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return format(reviewDate, 'MMM d, yyyy');
    }
  };
  
  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <Avatar className="w-10 h-10 mr-3">
            <AvatarImage 
              src={reviewer?.profileImg} 
              alt={reviewer?.name || 'User'} 
            />
            <AvatarFallback>
              {reviewer?.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium">
              {reviewer?.name || 'Anonymous User'}
            </h4>
            <p className="text-gray-500 text-sm">
              {review.date ? formatDate(new Date(review.date)) : 'Recently'}
            </p>
          </div>
        </div>
        <div className="flex items-center bg-green-50 px-2 py-0.5 rounded text-sm">
          <span className="text-green-700 font-semibold">{review.rating.toFixed(1)}</span>
          <i className="fas fa-star text-green-500 ml-1 text-xs"></i>
        </div>
      </div>
      <p className="text-gray-600">
        {review.comment || 'No comment provided.'}
      </p>
      <div className="flex items-center mt-3 text-sm">
        <button className="flex items-center text-gray-500 hover:text-primary">
          <ThumbsUp size={14} className="mr-1" />
          <span>24</span>
        </button>
        <button className="flex items-center text-gray-500 hover:text-primary ml-4">
          <MessageSquare size={14} className="mr-1" />
          <span>Reply</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewItem;
