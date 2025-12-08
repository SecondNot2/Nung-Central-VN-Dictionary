import React, { useState, useEffect, useCallback } from "react";
import Navigation from "./components/layout/Navigation";
import Dictionary from "./pages/user/Dictionary";
import ChatBot from "./pages/user/ChatBot";
import ImageAnalyzer from "./pages/user/ImageAnalyzer";
import Contribute from "./pages/user/Contribute";
import AdminContributions from "./pages/admin/AdminContributions";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminDictionary from "./pages/admin/AdminDictionary";
import DictionaryList from "./pages/user/DictionaryList";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import UserProfile from "./pages/user/UserProfile";
import MyLibrary from "./pages/user/MyLibrary";
import AdminSuggestions from "./pages/admin/AdminSuggestions";
import AdminReports from "./pages/admin/AdminReports";
import AdminFeedback from "./pages/admin/AdminFeedback";
import NotFound from "./pages/user/NotFound";
import { FeedbackButton } from "./components/feedback";
import { AppRoute, User } from "./types";
import {
  onAuthStateChange,
  signOut as authSignOut,
  createProfileForOAuthUser,
} from "./services/api/authService";
import Footer from "./components/layout/Footer";

const AUTH_KEY = "auth_user";

// Map route to hash for URL
const routeToHash = (route: AppRoute): string => `#${route}`;
const hashToRoute = (hash: string): AppRoute => {
  const routeString = hash.replace("#", "") || "";

  // If no hash, check if there's an invalid pathname (for direct URL access)
  if (!routeString) {
    const pathname = window.location.pathname;
    // If pathname is not root and not index.html, it's an invalid path
    if (pathname !== "/" && pathname !== "/index.html") {
      return AppRoute.NOT_FOUND;
    }
    return AppRoute.DICTIONARY;
  }

  // Check if route exists in AppRoute enum
  if (Object.values(AppRoute).includes(routeString as AppRoute)) {
    return routeString as AppRoute;
  }

  return AppRoute.NOT_FOUND;
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
        return <Dictionary user={user} setRoute={navigateTo} />;
      case AppRoute.CHAT:
        return <ChatBot />;
      case AppRoute.IMAGE_ANALYSIS:
        return <ImageAnalyzer />;
      case AppRoute.CONTRIBUTE:
        return <Contribute user={user} setRoute={navigateTo} />;
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
      case AppRoute.MY_LIBRARY:
        return <MyLibrary user={user} setRoute={navigateTo} />;
      case AppRoute.ADMIN_SUGGESTIONS:
        return <AdminSuggestions user={user} setRoute={navigateTo} />;
      case AppRoute.ADMIN_REPORTS:
        return <AdminReports user={user} setRoute={navigateTo} />;
      case AppRoute.ADMIN_FEEDBACK:
        return <AdminFeedback user={user} setRoute={navigateTo} />;
      case AppRoute.NOT_FOUND:
        return <NotFound setRoute={navigateTo} />;
      default:
        return <Dictionary user={user} setRoute={navigateTo} />;
    }
  };

  // Full-screen pages (no nav/footer)
  const isFullScreenPage =
    currentRoute === AppRoute.LOGIN ||
    currentRoute === AppRoute.REGISTER ||
    currentRoute === AppRoute.NOT_FOUND;

  if (isFullScreenPage) {
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

      {/* Floating Feedback Button */}
      <FeedbackButton user={user} />

      <Footer />
    </div>
  );
};

export default App;
