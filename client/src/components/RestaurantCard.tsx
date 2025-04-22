import { Link } from 'wouter';
import { Star, Clock, MapPin, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RestaurantWithDistance } from '@/lib/types';
import { motion } from 'framer-motion';

interface RestaurantCardProps {
  restaurant: RestaurantWithDistance;
  variant?: 'default' | 'compact';
}

const RestaurantCard = ({ restaurant, variant = 'default' }: RestaurantCardProps) => {
  const isCompact = variant === 'compact';

  // Format distance with proper unit (km or m)
  const formatDistance = (distance?: number) => {
    if (!distance) return 'Unknown distance';
    return distance < 1 
      ? `${Math.round(distance * 1000)} m` 
      : `${distance.toFixed(1)} km`;
  };

  // Animations
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        ease: "easeOut" 
      }
    },
    hover: { 
      y: -5,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      transition: { 
        duration: 0.3,
        ease: "easeInOut" 
      }
    }
  };
  
  const imageVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.3 }
    }
  };
  
  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        delay: 0.2,
        duration: 0.3,
        ease: "backOut" 
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className="h-full"
    >
      <Card className={`restaurant-card overflow-hidden ${isCompact ? 'h-full' : 'h-auto'} border-0 elegant-shadow bg-white/90 backdrop-blur-sm`}>
        <div className="relative overflow-hidden rounded-t-lg">
          <motion.div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-blue-900/40 z-10" />
          <motion.img 
            variants={imageVariants}
            src={Array.isArray(restaurant.images) && restaurant.images.length > 0 ? restaurant.images[0] : 'https://via.placeholder.com/400x250?text=Restaurant'} 
            alt={restaurant.name}
            className={`w-full object-cover ${isCompact ? 'h-36' : 'h-48'}`}
          />
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="z-20"
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full h-8 w-8 shadow-md"
              onClick={(e) => {
                e.preventDefault();
                // Handle favorite toggle
              }}
            >
              <Bookmark className={`h-4 w-4 ${restaurant.isFavorite ? 'fill-blue-600 text-blue-600' : 'text-blue-500'}`} />
            </Button>
          </motion.div>
          {restaurant.discount && (
            <motion.div
              variants={badgeVariants}
              className="absolute bottom-3 left-3 z-20"
            >
              <Badge className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 shadow-sm">
                {restaurant.discount}
              </Badge>
            </motion.div>
          )}
        </div>
        
        <CardContent className={`${isCompact ? 'p-4' : 'p-5'}`}>
          <div className="flex justify-between items-start mb-2">
            <Link href={`/restaurant/${restaurant.id}`}>
              <motion.h3 
                whileHover={{ color: "#4169E1" }}
                className={`font-bold ${isCompact ? 'text-base' : 'text-lg'} cursor-pointer text-blue-900`}
              >
                {restaurant.name}
              </motion.h3>
            </Link>
            <motion.div 
              className="flex items-center bg-blue-50 px-2 py-1 rounded-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="text-sm font-medium text-blue-900">{restaurant.rating || '0.0'}</span>
            </motion.div>
          </div>
          
          <p className={`text-blue-700 line-clamp-1 ${isCompact ? 'text-xs mb-3' : 'text-sm mb-4'}`}>
            {restaurant.cuisine}
          </p>
          
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
            <motion.div 
              className="flex items-center text-blue-600"
              whileHover={{ scale: 1.05 }}
            >
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium`}>
                {formatDistance(restaurant.distance)}
              </span>
            </motion.div>
            
            {restaurant.deliveryTime && (
              <motion.div 
                className="flex items-center text-blue-600"
                whileHover={{ scale: 1.05 }}
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium`}>
                  {restaurant.deliveryTime}
                </span>
              </motion.div>
            )}
            
            {restaurant.crowdLevel && (
              <motion.div whileHover={{ scale: 1.05 }}>
                <Badge variant="outline" className={`
                  ${restaurant.crowdLevel === 'low' ? 'border-green-300 bg-green-50 text-green-700' : 
                   restaurant.crowdLevel === 'moderate' ? 'border-amber-300 bg-amber-50 text-amber-700' : 
                   'border-red-300 bg-red-50 text-red-700'}
                  ${isCompact ? 'text-xs' : 'text-sm'} font-medium shadow-sm`}
                >
                  {restaurant.crowdLevel === 'low' ? 'Not Busy' : 
                  restaurant.crowdLevel === 'moderate' ? 'Moderate' : 'Busy'}
                </Badge>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RestaurantCard;