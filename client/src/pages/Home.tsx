import { useState } from 'react';
import Layout from '@/components/Layout';
import MapView from '@/components/MapView';
import RestaurantList from '@/components/RestaurantList';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import AuthModal from '@/components/AuthModal';

const Home = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const handleGetStarted = () => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      toast({
        title: 'Welcome back!',
        description: `Great to see you again, ${user.name}!`,
      });
    }
  };
  
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-blue-600 text-white py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Discover and Dine with Crave</h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Find the perfect restaurant, book your table, and enjoy a seamless dining experience
              with our unique in-restaurant features.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
              <Link href="/explore">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full sm:w-auto border-white text-black hover:bg-white hover:text-primary"
                >
                  Explore Restaurants
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Key Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-8">What Makes Crave Special</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-map-marker-alt text-xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Location-Based Discovery</h3>
              <p className="text-gray-600">
                Find restaurants near you, sorted by distance and view real-time information about crowd levels.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-qrcode text-xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">QR Code Table Management</h3>
              <p className="text-gray-600">
                Scan the QR code at your table to place orders, request service, and personalize your dining experience.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm text-center">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-music text-xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-2">Music Recommendations</h3>
              <p className="text-gray-600">
                Suggest songs to play at the restaurant and vote for music that other diners have recommended.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Nearby Restaurants Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-2">Nearby Restaurants</h2>
            <p className="text-gray-600">Discover great dining options in your area</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <RestaurantList maxItems={6} showFilters={false} />
              <div className="mt-6 text-center">
                <Link href="/explore">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                    View All Restaurants
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-lg overflow-hidden h-[500px] shadow-inner hidden lg:block">
              <div className="p-4 bg-white border-b">
                <h3 className="font-medium">Restaurants Near You</h3>
              </div>
              <div className="h-[456px]">
                <MapView compact={true} />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Web3 Integration Section */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">Web3 Integration</h2>
            <p className="text-lg opacity-80 mb-6">
              Connect with MetaMask for a seamless Web3 experience. Use cryptocurrency for payments, access exclusive NFT benefits, and more.
            </p>
            <Button variant="secondary" className="bg-purple-600 hover:bg-purple-700 border-none">
              <i className="fab fa-ethereum mr-2"></i> Connect Wallet
            </Button>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-12 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">Ready to Experience Crave?</h2>
            <p className="text-lg opacity-90 mb-6">
              Join thousands of diners who are enjoying a better restaurant experience with Crave.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={handleGetStarted}
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </section>
      
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </Layout>
  );
};

export default Home;
