import { MenuItem } from '@/lib/types';

interface DishItemProps {
  dish: MenuItem;
}

const DishItem = ({ dish }: DishItemProps) => {
  const likedPercentage = dish.popularity || Math.floor(Math.random() * 10) + 85; // Fallback for demo
  
  return (
    <div className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={dish.image} 
          alt={dish.name} 
          className="w-full h-28 object-cover"
        />
        <div className="absolute top-2 right-2 bg-white rounded-full px-1.5 py-0.5 text-xs font-medium">
          <i className="fas fa-fire text-accent"></i> {likedPercentage}% liked
        </div>
      </div>
      <div className="p-3">
        <h4 className="font-medium text-gray-800">{dish.name}</h4>
        <p className="text-gray-500 text-sm">${dish.price?.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default DishItem;
