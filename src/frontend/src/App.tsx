import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Crown, LogOut, Phone, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsAdmin, useSaveProfile, useUserProfile } from "./hooks/useQueries";
import { AdminDashboard } from "./pages/AdminDashboard";
import { LandingPage } from "./pages/LandingPage";
import { MemberDashboard } from "./pages/MemberDashboard";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

function AppContent() {
  const { identity, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const { data: profile } = useUserProfile();
  const saveProfile = useSaveProfile();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const isLoggedIn = !!identity;
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal ? `${principal.slice(0, 10)}...` : "";

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: nameInput.trim() });
      toast.success("Naam save ho gaya!");
      setEditingName(false);
    } catch {
      toast.error("Naam save nahi hua.");
    }
  };

  if (isInitializing || isLoggingIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold/20 border-t-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading YaariWin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-gradient-gold">
              🎰 YaariWin
            </span>
            {isAdmin && (
              <span className="text-xs bg-gold/20 text-gold border border-gold/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3" /> Admin
              </span>
            )}
          </div>
          {isLoggedIn && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingName(!editingName);
                  setNameInput(profile?.name ?? "");
                }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                data-ocid="nav.button"
              >
                <User className="w-3 h-3" />
                <span className="hidden sm:inline">
                  {profile?.name ?? shortPrincipal}
                </span>
              </button>
              <Button
                data-ocid="nav.secondary_button"
                variant="ghost"
                size="sm"
                onClick={clear}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        {/* Name edit bar */}
        <AnimatePresence>
          {editingName && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border"
            >
              <div className="max-w-3xl mx-auto px-4 py-2 flex gap-2">
                <Input
                  data-ocid="profile.input"
                  placeholder="Apna naam daalo"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="h-8 text-sm bg-muted"
                />
                <Button
                  data-ocid="profile.save_button"
                  size="sm"
                  className="bg-gold text-primary-foreground"
                  onClick={handleSaveName}
                >
                  Save
                </Button>
                <Button
                  data-ocid="profile.cancel_button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingName(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LandingPage />
            </motion.div>
          ) : isAdmin ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <AdminDashboard />
            </motion.div>
          ) : (
            <motion.div
              key="member"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <MemberDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 px-4 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span>Contact: 9041725847</span>
          </div>
          <span className="hidden sm:inline">·</span>
          <span>
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster richColors />
    </QueryClientProvider>
  );
}
