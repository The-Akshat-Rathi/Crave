import { useState, useContext } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { LocationContext } from '@/contexts/LocationContext';
import { useMediaQuery } from '@/hooks/use-mobile';
import AuthModal from './AuthModal';
import MobileNavigation from './MobileNavigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Menu, QrCode } from 'lucide-react';
import QRScanner from './QRScanner';

const MobileHeader = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { location, setLocationModalOpen } = useContext(LocationContext);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  const handleLocationClick = () => {
    setLocationModalOpen(true);
  };
  
  if (!isMobile) {
    // Non-mobile header is handled by Header component
    return null;
  }
  
  return (
    <>
      <header className="bg-gradient-to-r from-white to-blue-50 border-b border-blue-100 sticky top-0 z-50 elegant-shadow">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 text-blue-700 hover:bg-blue-50"
              onClick={() => setShowMobileNav(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-gradient">Crave</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            {user && (
              <Button
                variant="outline"
                size="icon"
                className="text-purple-700 border-purple-300 hover:bg-purple-50 h-8 w-8"
                onClick={() => setShowQRScanner(true)}
              >
                <QrCode className="h-4 w-4 text-purple-600" />
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-blue-700 border-blue-300 hover:bg-blue-50"
              onClick={handleLocationClick}
            >
              <MapPin className="mr-1 h-3 w-3 text-blue-600" />
              {location ? (
                <span className="truncate max-w-[80px] text-blue-900">{location}</span>
              ) : (
                'Set location'
              )}
            </Button>
            
            {user ? (
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-8 w-8 rounded-full hover:bg-blue-100"
                onClick={() => navigate('/profile')}
              >
                <Avatar className="h-8 w-8 border-2 border-blue-300">
                  <AvatarImage src={user.profileImg || undefined} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:shadow-md transition-all text-white"
                onClick={() => setShowAuthModal(true)}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>
      
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showMobileNav && <MobileNavigation onClose={() => setShowMobileNav(false)} />}
      {showQRScanner && (
        <QRScanner 
          onClose={() => setShowQRScanner(false)} 
          onSuccess={(tableId, restaurantId) => {
            // Navigate to the restaurant page with the table ID
            navigate(`/restaurants/${restaurantId}?tableId=${tableId}`);
          }} 
        />
      )}
    </>
  );
};

export default MobileHeader;