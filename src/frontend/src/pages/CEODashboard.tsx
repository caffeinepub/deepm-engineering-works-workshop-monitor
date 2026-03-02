import SummaryStats from "@/components/dashboard/SummaryStats";
import Navbar from "@/components/layout/Navbar";
import CabinsSection from "@/components/sections/CabinsSection";
import ContainersSection from "@/components/sections/ContainersSection";
import PaintingSection from "@/components/sections/PaintingSection";
import ParkingSection from "@/components/sections/ParkingSection";
import UnderpartsSection from "@/components/sections/UnderpartsSection";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";
import { getStoredSession } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { Box, Car, Layers, Palette, Wrench } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const sectionConfig = [
  {
    key: "containers",
    label: "Containers",
    icon: Box,
    color: "oklch(0.65 0.2 30)",
    borderColor: "oklch(0.65 0.2 30 / 0.2)",
  },
  {
    key: "cabins",
    label: "Cabins",
    icon: Layers,
    color: "oklch(0.6 0.2 250)",
    borderColor: "oklch(0.6 0.2 250 / 0.2)",
  },
  {
    key: "painting",
    label: "Painting",
    icon: Palette,
    color: "oklch(0.75 0.18 85)",
    borderColor: "oklch(0.75 0.18 85 / 0.2)",
  },
  {
    key: "parking",
    label: "Parking",
    icon: Car,
    color: "oklch(0.65 0.18 145)",
    borderColor: "oklch(0.65 0.18 145 / 0.2)",
  },
  {
    key: "underparts",
    label: "Underparts",
    icon: Wrench,
    color: "oklch(0.6 0.15 55)",
    borderColor: "oklch(0.6 0.15 55 / 0.2)",
  },
] as const;

export default function CEODashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const { containers, cabins, painting, parking, underparts } =
    useRealtimeSync();

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      void navigate({ to: "/" });
      return;
    }
    setEmail(session.email);
    setAuthChecked(true);
  }, [navigate]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar userRole="ceo" email={email} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl space-y-8">
        <div>
          <h1 className="text-xl font-bold text-foreground">CEO Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time workshop status — auto-refreshes every 20 seconds
          </p>
        </div>

        <SummaryStats
          containers={containers.data}
          cabins={cabins.data}
          painting={painting.data}
          parking={parking.data}
          underparts={underparts.data}
        />

        {sectionConfig.map((section, idx) => {
          const sectionData =
            section.key === "containers"
              ? containers
              : section.key === "cabins"
                ? cabins
                : section.key === "painting"
                  ? painting
                  : section.key === "parking"
                    ? parking
                    : underparts;

          const Icon = section.icon;

          return (
            <motion.section
              key={section.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + idx * 0.07 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${section.color}22` }}
                >
                  <Icon className="w-4 h-4" style={{ color: section.color }} />
                </div>
                <div className="min-w-0">
                  <h2
                    className="text-base font-semibold"
                    style={{ color: section.color }}
                  >
                    {section.label}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {sectionData.data.length} record
                    {sectionData.data.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {section.key === "containers" && (
                <ContainersSection
                  data={containers.data}
                  loading={containers.loading}
                  error={containers.error}
                  isReadOnly
                />
              )}
              {section.key === "cabins" && (
                <CabinsSection
                  data={cabins.data}
                  loading={cabins.loading}
                  error={cabins.error}
                  isReadOnly
                />
              )}
              {section.key === "painting" && (
                <PaintingSection
                  data={painting.data}
                  loading={painting.loading}
                  error={painting.error}
                  isReadOnly
                />
              )}
              {section.key === "parking" && (
                <ParkingSection
                  data={parking.data}
                  loading={parking.loading}
                  error={parking.error}
                  isReadOnly
                />
              )}
              {section.key === "underparts" && (
                <UnderpartsSection
                  data={underparts.data}
                  loading={underparts.loading}
                  error={underparts.error}
                  isReadOnly
                />
              )}
            </motion.section>
          );
        })}
      </main>

      <footer className="border-t border-border py-4 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
