import { useState, useContext } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { LocationContext } from '@/contexts/LocationContext';
import { useMediaQuery } from '@/hooks/use-mobile';
import AuthModal from './AuthModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Menu, User, LogOut, QrCode, ScanLine } from 'lucide-react';
import QRScanner from './QRScanner';

const Header = () => {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { location, setLocationModalOpen } = useContext(LocationContext);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  const handleLocationClick = () => {
    setLocationModalOpen(true);
  };
  
  if (isMobile) {
    // Mobile header is handled by MobileHeader component
    return null;
  }
  
  return (
    <header className="bg-gradient-to-r from-white to-blue-50 border-b border-blue-100 sticky top-0 z-50 elegant-shadow">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-gradient">Crave</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-blue-900 hover:text-blue-600 font-medium">
              Home
            </Link>
            <Link href="/explore" className="text-blue-900 hover:text-blue-600 font-medium">
              Explore
            </Link>
            {user?.role === 'restaurant_owner' && (
              <Link href="/dashboard" className="text-blue-900 hover:text-blue-600 font-medium">
                Dashboard
              </Link>
            )}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <Button
              variant="outline"
              size="sm"
              className="text-purple-700 border-purple-300 hover:bg-purple-50"
              onClick={() => setShowQRScanner(true)}
            >
              <QrCode className="mr-2 h-4 w-4 text-purple-600" />
              Scan QR
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="text-blue-700 border-blue-300 hover:bg-blue-50"
            onClick={handleLocationClick}
          >
            <MapPin className="mr-2 h-4 w-4 text-blue-600" />
            {location || 'Set location'}
          </Button>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-blue-100">
                  <Avatar className="h-9 w-9 border-2 border-blue-300">
                    <AvatarImage src={user.profileImg || undefined} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 elegant-shadow">
                <div className="flex items-center justify-start p-3 border-b border-blue-100">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-blue-900">{user.name}</p>
                    <p className="text-sm text-blue-600">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="w-full flex items-center cursor-pointer hover:bg-blue-50">
                    <User className="mr-2 h-4 w-4 text-blue-700" />
                    <span className="text-blue-900">Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 cursor-pointer hover:bg-red-50" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-blue-800 hover:shadow-md transition-all"
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
      
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showQRScanner && (
        <QRScanner 
          onClose={() => setShowQRScanner(false)} 
          onSuccess={(tableId, restaurantId) => {
            // Navigate to the restaurant page with the table ID
            navigate(`/restaurants/${restaurantId}?tableId=${tableId}`);
          }} 
        />
      )}
    </header>
  );
};

export default Header;