import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { storeSession } from "@/lib/auth";
import type { WorkshopRole } from "@/lib/types";
import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, Cog, Loader2, Lock, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { actor } = useActor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!actor) {
        setError("System is initializing. Please wait a moment and try again.");
        return;
      }

      const role = await actor.login(email, password);

      if (!role) {
        setError("Invalid email or password. Please check your credentials.");
        return;
      }

      storeSession({ email, role: role as WorkshopRole });

      if (role === "manager") {
        void navigate({ to: "/manager" });
      } else if (role === "ceo") {
        void navigate({ to: "/ceo" });
      } else {
        void navigate({ to: "/manager" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 40px,
            oklch(0.65 0.2 30) 40px,
            oklch(0.65 0.2 30) 41px
          ), repeating-linear-gradient(
            90deg,
            transparent,
            transparent 40px,
            oklch(0.65 0.2 30) 40px,
            oklch(0.65 0.2 30) 41px
          )`,
        }}
      />

      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-3xl pointer-events-none"
        style={{ background: "oklch(0.65 0.2 30)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative"
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[oklch(0.65_0.2_30_/_0.15)] border border-[oklch(0.65_0.2_30_/_0.3)] mb-4">
            <Cog className="w-8 h-8" style={{ color: "oklch(0.65 0.2 30)" }} />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            DeepM Engineering
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Workshop Monitor</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="h-11 pl-9 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="manager@deepm.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  className="h-11 pl-9 text-base"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30"
              >
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs text-destructive leading-relaxed">
                  {error}
                </p>
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-[oklch(0.65_0.2_30)] hover:bg-[oklch(0.58_0.2_30)] text-white font-medium mt-2"
              disabled={loading || !actor}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : !actor ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Manager or CEO access required
            </p>
          </div>
        </div>
      </motion.div>

      <p className="mt-8 text-xs text-muted-foreground/50">
        © {new Date().getFullYear()} DeepM Engineering Works
      </p>
    </div>
  );
}
