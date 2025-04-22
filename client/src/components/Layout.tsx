import { ReactNode } from 'react';
import Header from './Header';
import MobileHeader from './MobileHeader';
import MobileNavigation from './MobileNavigation';
import { useMediaQuery } from '@/hooks/use-mobile';

interface LayoutProps {
  children: ReactNode;
  hideHeader?: boolean;
}

const Layout = ({ children, hideHeader = false }: LayoutProps) => {
  const isMobile = useMediaQuery('(max-width: 1024px)');
  
  return (
    <div className="flex flex-col min-h-screen">
      {!hideHeader && (
        <>
          {isMobile ? <MobileHeader /> : <Header />}
        </>
      )}
      <main className="flex-grow">
        {children}
      </main>
      {/* Mobile navigation is handled via the MobileHeader component */}
    </div>
  );
};

export default Layout;
