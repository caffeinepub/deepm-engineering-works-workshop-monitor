import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { clearSession } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { Cog, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";

interface NavbarProps {
  userRole: "manager" | "ceo";
  email: string;
}

export default function Navbar({ userRole, email }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      clearSession();
      void navigate({ to: "/" });
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full h-14 flex items-center px-4 md:px-6 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="flex items-center gap-2 flex-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
            <Cog className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-bold tracking-tight text-foreground">
              DeepM
            </span>
            <span className="text-sm font-light text-muted-foreground ml-1">
              Engineering Works
            </span>
          </div>
          <span className="sm:hidden text-sm font-bold text-foreground">
            DeepM
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={
            userRole === "manager"
              ? "border-[oklch(var(--container-accent))] text-[oklch(var(--container-accent))] text-xs capitalize hidden sm:flex"
              : "border-[oklch(var(--cabin-accent))] text-[oklch(var(--cabin-accent))] text-xs capitalize hidden sm:flex"
          }
        >
          {userRole}
        </Badge>
        <span className="text-xs text-muted-foreground hidden md:block max-w-[140px] truncate">
          {email}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
