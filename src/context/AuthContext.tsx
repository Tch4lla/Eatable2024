import { getCurrentUser } from '@/lib/appwrite/api';
import { IContextType, IUser } from '@/types';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';

export const INITIAL_USER = {
  id: '',
  name: '',
  username: '',
  email: '',
  imageUrl: '',
  bio: '',
};

const INITIAL_STATE = {
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false as boolean,
};

// Create a user cache to avoid unnecessary API calls
const USER_CACHE_KEY = 'eatable_user_cache';
const USER_CACHE_EXPIRY = 1000 * 60 * 15; // 15 minutes

const AuthContext = createContext<IContextType>(INITIAL_STATE);
const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  // Save user to cache — only display-safe fields (no id or email)
  const saveUserToCache = useCallback((userData: IUser) => {
    const cacheData = {
      user: {
        name: userData.name,
        username: userData.username,
        imageUrl: userData.imageUrl,
        bio: userData.bio,
      },
      timestamp: Date.now(),
    };
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cacheData));
  }, []);

  // Get user from cache
  const getUserFromCache = useCallback(() => {
    const cachedData = localStorage.getItem(USER_CACHE_KEY);
    if (!cachedData) return null;

    try {
      const { user, timestamp } = JSON.parse(cachedData);
      // Check if cache is still valid
      if (Date.now() - timestamp < USER_CACHE_EXPIRY) {
        return user;
      }
      // Clear expired cache
      localStorage.removeItem(USER_CACHE_KEY);
      return null;
    } catch (error) {
      console.error('Error parsing user cache:', error);
      localStorage.removeItem(USER_CACHE_KEY);
      return null;
    }
  }, []);

  const checkAuthUser = async () => {
    setIsLoading(true);
    try {
      // Pre-populate display fields from cache while API call runs
      const cachedUser = getUserFromCache();
      if (cachedUser) {
        setUser(prev => ({ ...prev, ...cachedUser }));
        setIsAuthenticated(true);
      }

      // Always fetch full user from API — cache doesn't store id or email
      const currentAccount = await getCurrentUser();
      if (currentAccount) {
        const userData = {
          id: currentAccount.$id,
          name: currentAccount.name,
          username: currentAccount.username,
          email: currentAccount.email,
          imageUrl: currentAccount.imageUrl,
          bio: currentAccount.bio,
        };

        setUser(userData);
        saveUserToCache(userData);
        setIsAuthenticated(true);
        return true;
      } else {
        setUser(INITIAL_USER);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error) {
      console.log('Error in checkAuthUser:', error);
      setUser(INITIAL_USER);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const cookieFallback = localStorage.getItem('cookieFallback');

    if (
      (cookieFallback === '[]' || cookieFallback === null) &&
      window.location.pathname !== '/' &&
      !window.location.pathname.startsWith('/sign-')
    ) {
      navigate('/');
    }

    // checkAuthUser handles cache preview + full API call
    checkAuthUser();
  }, [navigate]);
  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useUserContext = () => useContext(AuthContext);
