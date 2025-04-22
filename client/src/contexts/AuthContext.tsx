import { createContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, 
  User as FirebaseUser 
} from 'firebase/auth';
import { User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { auth, logOut, handleRedirectResult as firebaseHandleRedirect } from '@/lib/firebase';

// Define global types for window
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (userData: Partial<User>) => Promise<User>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<User>;
  loginWithMetaMask: () => Promise<User>;
  handleRedirectResult: () => Promise<any>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {
    throw new Error('Not implemented');
  },
  register: async () => {
    throw new Error('Not implemented');
  },
  logout: async () => {
    throw new Error('Not implemented');
  },
  loginWithGoogle: async () => {
    throw new Error('Not implemented');
  },
  loginWithMetaMask: async () => {
    throw new Error('Not implemented');
  },
  handleRedirectResult: async () => {
    throw new Error('Not implemented');
  },
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  // Set a default dummy user
  const [user, setUser] = useState<User | null>({
    id: 1,
    username: "demouser",
    name: "Demo User",
    email: "demo@example.com",
    role: "customer",
    profileImg: ""
  });
  const [loading, setLoading] = useState(false);

  // No auth checks needed
  useEffect(() => {}, []);

  const fetchUserData = async (firebaseUser: FirebaseUser, token: string): Promise<User> => {
    try {
      // Check if the user exists in our database
      const response = await apiRequest(`/api/users/firebase/${firebaseUser.uid}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response as User;
    } catch (error) {
      // User doesn't exist in our database, create them
      const newUser = {
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        username: firebaseUser.email?.split('@')[0] || `user_${Date.now()}`,
        firebaseUid: firebaseUser.uid,
        profileImg: firebaseUser.photoURL,
        role: 'customer',
      };

      const createdUser = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(newUser),
      });

      return createdUser as User;
    }
  };

  const login = async (identifier: string, password: string): Promise<User> => {
    try {
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          username: identifier, // Can be email or username
          password 
        }),
      });

      if (!response) {
        throw new Error('Invalid credentials');
      }

      const userData = response as User;
      if (!userData.id) {
        throw new Error('Invalid response from server');
      }

      setUser(userData);
      return userData;
    } catch (error: any) {
      const message = error.message || 'Login failed. Please check your credentials.';
      console.error('Login error:', message);
      throw new Error(message);
    }
  };

  const register = async (userData: Partial<User>): Promise<User> => {
    try {
      const response = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      setUser(response as User);
      return response as User;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (): Promise<User> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      const userData = await fetchUserData(result.user, token);

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const loginWithMetaMask = async (): Promise<User> => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your MetaMask and try again.');
      }

      const walletAddress = accounts[0];
      console.log('Connected with wallet:', walletAddress);

      // Authenticate with our API using the wallet address
      const response = await apiRequest('/api/auth/wallet', {
        method: 'POST',
        body: JSON.stringify({ walletAddress }),
      });

      // Add MetaMask account change listener
      window.ethereum.on('accountsChanged', async (newAccounts: string[]) => {
        if (newAccounts.length === 0) {
          // User disconnected their wallet
          await logout();
        } else {
          // User switched accounts - log them in with the new account
          try {
            const newWalletAddress = newAccounts[0];
            const userData = await apiRequest('/api/auth/wallet', {
              method: 'POST',
              body: JSON.stringify({ walletAddress: newWalletAddress }),
            });
            setUser(userData as User);
          } catch (error) {
            console.error('Error handling account change:', error);
            await logout();
          }
        }
      });

      setUser(response as User);
      return response as User;
    } catch (error: any) {
      console.error('MetaMask login error:', error);
      // Format the error message for better user experience
      if (error.code === 4001) {
        throw new Error('You rejected the connection request. Please approve the MetaMask connection to continue.');
      }
      throw error;
    }
  };

  const handleRedirectResult = async () => {
    try {
      const result = await firebaseHandleRedirect();
      if (result && result.user) {
        const token = await result.user.getIdToken();
        const userData = await fetchUserData(result.user, token);
        setUser(userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error handling redirect:', error);
      return null;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    loginWithGoogle,
    loginWithMetaMask,
    handleRedirectResult,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};