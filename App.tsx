import React, { useState, useEffect, useCallback } from "react";
import Navigation from "./components/Navigation";
import Dictionary from "./pages/Dictionary";
import ChatBot from "./pages/ChatBot";
import ImageAnalyzer from "./pages/ImageAnalyzer";
import Contribute from "./pages/Contribute";
import AdminContributions from "./pages/AdminContributions";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDictionary from "./pages/AdminDictionary";
import DictionaryList from "./pages/DictionaryList";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import UserProfile from "./pages/UserProfile";
import { AppRoute, User } from "./types";
import {
  onAuthStateChange,
  signOut as authSignOut,
  createProfileForOAuthUser,
} from "./services/authService";

const AUTH_KEY = "auth_user";

// Map route to hash for URL
const routeToHash = (route: AppRoute): string => `#${route}`;
const hashToRoute = (hash: string): AppRoute => {
  const routeString = hash.replace("#", "") || "dictionary";
  return Object.values(AppRoute).includes(routeString as AppRoute)
    ? (routeString as AppRoute)
    : AppRoute.DICTIONARY;
};

const App: React.FC = () => {
  // Initialize route from URL hash
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() =>
    hashToRoute(window.location.hash)
  );
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Navigate with history management
  const navigateTo = useCallback(
    (route: AppRoute) => {
      if (route !== currentRoute) {
        window.history.pushState({ route }, "", routeToHash(route));
        setCurrentRoute(route);
      }
    },
    [currentRoute]
  );

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const route = event.state?.route || hashToRoute(window.location.hash);
      setCurrentRoute(route);
    };

    window.addEventListener("popstate", handlePopState);

    // Set initial history state
    // IMPORTANT: Do not overwrite hash if it contains Supabase auth tokens!
    const isAuthHash =
      window.location.hash.includes("access_token=") ||
      window.location.hash.includes("error=");

    if (!window.history.state && !isAuthHash) {
      window.history.replaceState(
        { route: currentRoute },
        "",
        routeToHash(currentRoute)
      );
    }

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentRoute]);

  // Listen to auth state changes on mount
  useEffect(() => {
    // First, check localStorage for cached user (faster initial load)
    const savedUser = localStorage.getItem(AUTH_KEY);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }

    // Then set up auth state listener
    const { unsubscribe } = onAuthStateChange(async (supabaseUser, profile) => {
      console.log("Auth state changed:", {
        hasUser: !!supabaseUser,
        hasProfile: !!profile,
        userId: supabaseUser?.id,
      });

      if (supabaseUser) {
        // If user exists but profile is null (e.g., first Google OAuth login)
        // Create a user object from supabase user data
        let userProfile = profile;

        if (!userProfile) {
          console.log("No profile found, creating from Supabase user data");
          // Try to create profile for new OAuth users
          const displayName =
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.user_metadata?.name ||
            supabaseUser.email?.split("@")[0] ||
            "User";

          // Attempt to create profile in database (will fail silently if exists)
          try {
            await createProfileForOAuthUser(
              supabaseUser.id,
              supabaseUser.email || "",
              displayName
            );
          } catch (e) {
            console.log("Could not auto-create profile:", e);
          }
        }

        const newUser: User = {
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          name:
            userProfile?.display_name ||
            supabaseUser.user_metadata?.full_name ||
            supabaseUser.user_metadata?.name ||
            supabaseUser.email?.split("@")[0] ||
            "User",
          role: userProfile?.role === "admin" ? "admin" : "user",
          avatar:
            (userProfile as any)?.avatar_url ||
            supabaseUser.user_metadata?.avatar_url,
        };

        console.log("Setting user:", newUser.name);
        setUser(newUser);
        localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
      } else {
        // Only clear user if explicitly logged out (not on initial load)
        console.log("No supabase user, clearing state");
      }
      setAuthLoading(false);
    });

    // Initial loading timeout
    const timeout = setTimeout(() => setAuthLoading(false), 1000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleLogin = (userData: {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
    avatar?: string;
  }) => {
    const newUser: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      avatar: userData.avatar,
    };
    setUser(newUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
  };

  const handleLogout = async () => {
    await authSignOut();
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    navigateTo(AppRoute.DICTIONARY);
  };

  const handleProfileUpdate = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem(AUTH_KEY, JSON.stringify(updatedUser));
    }
  };

  const renderContent = () => {
    switch (currentRoute) {
      case AppRoute.DICTIONARY:
        return <Dictionary />;
      case AppRoute.CHAT:
        return <ChatBot />;
      case AppRoute.IMAGE_ANALYSIS:
        return <ImageAnalyzer />;
      case AppRoute.CONTRIBUTE:
        return <Contribute />;
      case AppRoute.ADMIN:
        return <AdminContributions setRoute={navigateTo} />;
      case AppRoute.LOGIN:
        return <Login setRoute={navigateTo} onLogin={handleLogin} />;
      case AppRoute.REGISTER:
        return <Register setRoute={navigateTo} onLogin={handleLogin} />;
      case AppRoute.ADMIN_DICTIONARY:
        return <AdminDictionary setRoute={navigateTo} />;
      case AppRoute.DICTIONARY_LIST:
        return <DictionaryList />;
      case AppRoute.ADMIN_DASHBOARD:
        return <AdminDashboard user={user} setRoute={navigateTo} />;
      case AppRoute.ADMIN_USERS:
        return <AdminUsers user={user} setRoute={navigateTo} />;
      case AppRoute.PROFILE:
        return (
          <UserProfile
            user={user}
            setRoute={navigateTo}
            onProfileUpdate={handleProfileUpdate}
            onLogout={handleLogout}
          />
        );
      default:
        return <Dictionary />;
    }
  };

  // Full-screen auth pages (no nav/footer)
  const isAuthPage =
    currentRoute === AppRoute.LOGIN || currentRoute === AppRoute.REGISTER;

  if (isAuthPage) {
    return renderContent();
  }

  return (
    <div className="min-h-screen flex flex-col bg-earth-50 font-sans text-earth-900">
      <Navigation
        currentRoute={currentRoute}
        setRoute={navigateTo}
        user={user}
        onLogout={handleLogout}
      />

      <main className="flex-grow">{renderContent()}</main>

      <footer className="bg-earth-900 text-earth-300 py-6 text-center text-sm">
        <p>
          © {new Date().getFullYear()} Dự án Từ điển Nùng & Miền Trung Việt Nam.
        </p>
        <p className="mt-1 text-earth-400">Gìn giữ Ngôn ngữ & Văn hóa.</p>
      </footer>
    </div>
  );
};

export default App;
