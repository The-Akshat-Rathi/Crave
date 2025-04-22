import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DishHighlight3DProps {
  dish: {
    id: number;
    name: string;
    description: string;
    price: number;
    image?: string;
    isPopular?: boolean;
  };
}

const DishHighlight3D = ({ dish }: DishHighlight3DProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element
      const y = e.clientY - rect.top; // y position within the element
      
      // Calculate rotation based on mouse position
      // This creates a "3D tilt" effect
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateY = ((x - centerX) / centerX) * 8; // Max 8 degrees rotation
      const rotateX = ((centerY - y) / centerY) * 8; // Reversed for correct tilt direction
      
      // Apply the 3D transformation
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      
      // Create a subtle highlight effect
      const intensity = 0.1;
      const spotlightX = (x / rect.width) * 100;
      const spotlightY = (y / rect.height) * 100;
      card.style.backgroundImage = `radial-gradient(circle at ${spotlightX}% ${spotlightY}%, rgba(255,255,255,${intensity}), transparent)`;
    };
    
    const handleMouseLeave = () => {
      // Reset transformations on mouse leave
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
      card.style.backgroundImage = 'none';
    };
    
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="h-full"
    >
      <Card 
        ref={cardRef}
        className="relative overflow-hidden border-0 rounded-xl shadow-md transition-all duration-300 will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div 
          className="relative h-64 overflow-hidden rounded-t-xl"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${dish.image || 'https://via.placeholder.com/400x300?text=Dish'})`,
              transform: 'translateZ(20px)'
            }}
          />
          {dish.isPopular && (
            <motion.div 
              className="absolute top-3 right-3"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              style={{ transform: 'translateZ(40px)' }}
            >
              <Badge className="bg-primary hover:bg-primary font-medium">
                Popular Choice
              </Badge>
            </motion.div>
          )}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
            style={{ transform: 'translateZ(30px)' }}
          />
          <motion.h3 
            className="absolute bottom-4 left-4 text-white text-xl font-bold"
            style={{ transform: 'translateZ(40px)' }}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {dish.name}
          </motion.h3>
        </div>
        
        <div className="p-4" style={{ transform: 'translateZ(10px)' }}>
          <motion.p 
            className="text-gray-600 mb-3 line-clamp-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            {dish.description}
          </motion.p>
          
          <motion.div 
            className="font-bold text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            ${dish.price.toFixed(2)}
          </motion.div>
        </div>
        
        {/* Animated shine effect */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ repeat: Infinity, duration: 2, repeatDelay: 5 }}
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            transform: 'skewX(-20deg)'
          }}
        />
      </Card>
    </motion.div>
  );
};

export default DishHighlight3D;