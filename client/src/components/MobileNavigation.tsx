import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  Search,
  Calendar,
  User,
  Settings,
  LogOut,
  Building2,
  X,
} from 'lucide-react';

interface MobileNavigationProps {
  onClose: () => void;
}

const MobileNavigation = ({ onClose }: MobileNavigationProps) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-[85vw] max-w-[300px] sm:max-w-sm p-0">
        <SheetHeader className="bg-gradient-to-r from-primary to-blue-600 text-white p-6">
          <div className="flex justify-between items-center">
            <SheetTitle className="text-white text-xl">Crave</SheetTitle>
            <SheetClose className="rounded-full hover:bg-primary-foreground/20 p-1.5">
              <X className="h-5 w-5" />
            </SheetClose>
          </div>
          
          {user && (
            <div className="flex items-center mt-4 py-2">
              <Avatar className="h-14 w-14 border-2 border-white">
                <AvatarImage src={user.profileImg || undefined} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <p className="font-semibold text-white">{user.name}</p>
                <p className="text-sm text-white/80">{user.email}</p>
              </div>
            </div>
          )}
        </SheetHeader>
        
        <div className="py-4">
          <nav className="space-y-1 px-2">
            <Link href="/">
              <a className="flex items-center space-x-3 rounded-md px-3 py-3 text-gray-700 hover:bg-gray-100">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </a>
            </Link>
            
            <Link href="/explore">
              <a className="flex items-center space-x-3 px-3 py-3 text-gray-700">
                <Search className="h-5 w-5" />
                <span>Explore Restaurants</span>
              </a>
            </Link>
            
            {user && (
              <>
                <Link href="/profile">
                  <a className="flex items-center space-x-3 rounded-md px-3 py-3 text-gray-700 hover:bg-gray-100">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </a>
                </Link>
                
                {user.role === 'restaurant_owner' && (
                  <Link href="/dashboard">
                    <a className="flex items-center space-x-3 rounded-md px-3 py-3 text-gray-700 hover:bg-gray-100">
                      <Building2 className="h-5 w-5" />
                      <span>Restaurant Dashboard</span>
                    </a>
                  </Link>
                )}
                
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center space-x-3 rounded-md px-3 py-3 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Log out</span>
                  </button>
                </div>
              </>
            )}
            
            {!user && (
              <Link href="#" onClick={(e) => { e.preventDefault(); onClose(); }}>
                <a className="flex items-center space-x-3 rounded-md px-3 py-3 text-primary font-semibold hover:bg-primary/10">
                  <User className="h-5 w-5" />
                  <span>Sign In</span>
                </a>
              </Link>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;