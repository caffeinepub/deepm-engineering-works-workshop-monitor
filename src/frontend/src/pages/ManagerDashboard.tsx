import Navbar from "@/components/layout/Navbar";
import CabinsSection from "@/components/sections/CabinsSection";
import ContainersSection from "@/components/sections/ContainersSection";
import PaintingSection from "@/components/sections/PaintingSection";
import ParkingSection from "@/components/sections/ParkingSection";
import UnderpartsSection from "@/components/sections/UnderpartsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCabins } from "@/hooks/useCabins";
import { useContainers } from "@/hooks/useContainers";
import { usePainting } from "@/hooks/usePainting";
import { useParking } from "@/hooks/useParking";
import { useUnderparts } from "@/hooks/useUnderparts";
import { getStoredSession } from "@/lib/auth";
import type {
  Cabin,
  Container,
  Painting,
  Parking,
  Underpart,
} from "@/lib/types";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  const containers = useContainers();
  const cabins = useCabins();
  const painting = usePainting();
  const parking = useParking();
  const underparts = useUnderparts();

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      void navigate({ to: "/" });
      return;
    }
    if (session.role === "ceo") {
      void navigate({ to: "/ceo" });
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
      <Navbar userRole="manager" email={email} />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">
            Workshop Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage all workshop operations
          </p>
        </div>

        <Tabs defaultValue="containers" className="w-full">
          {/* Scrollable horizontal tab bar on mobile */}
          <div className="overflow-x-auto mb-6">
            <TabsList className="h-auto p-1 flex flex-nowrap gap-1 bg-card border border-border w-max min-w-full">
              <TabsTrigger
                value="containers"
                className="flex-shrink-0 h-10 px-4 whitespace-nowrap data-[state=active]:bg-[oklch(0.65_0.2_30_/_0.15)] data-[state=active]:text-[oklch(0.65_0.2_30)]"
              >
                <span className="text-xs sm:text-sm font-medium">
                  Containers
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="cabins"
                className="flex-shrink-0 h-10 px-4 whitespace-nowrap data-[state=active]:bg-[oklch(0.6_0.2_250_/_0.15)] data-[state=active]:text-[oklch(0.6_0.2_250)]"
              >
                <span className="text-xs sm:text-sm font-medium">Cabins</span>
              </TabsTrigger>
              <TabsTrigger
                value="painting"
                className="flex-shrink-0 h-10 px-4 whitespace-nowrap data-[state=active]:bg-[oklch(0.75_0.18_85_/_0.15)] data-[state=active]:text-[oklch(0.75_0.18_85)]"
              >
                <span className="text-xs sm:text-sm font-medium">Painting</span>
              </TabsTrigger>
              <TabsTrigger
                value="parking"
                className="flex-shrink-0 h-10 px-4 whitespace-nowrap data-[state=active]:bg-[oklch(0.65_0.18_145_/_0.15)] data-[state=active]:text-[oklch(0.65_0.18_145)]"
              >
                <span className="text-xs sm:text-sm font-medium">Parking</span>
              </TabsTrigger>
              <TabsTrigger
                value="underparts"
                className="flex-shrink-0 h-10 px-4 whitespace-nowrap data-[state=active]:bg-[oklch(0.6_0.15_55_/_0.15)] data-[state=active]:text-[oklch(0.6_0.15_55)]"
              >
                <span className="text-xs sm:text-sm font-medium">
                  Underparts
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="containers">
            <ContainersSection
              data={containers.data}
              loading={containers.loading}
              error={containers.error}
              onInsert={(data) =>
                containers.insert(
                  data as Omit<
                    Container,
                    "id" | "created_at" | "updated_at"
                  > & {
                    photoFiles?: File[];
                  },
                )
              }
              onUpdate={(id, data) =>
                containers.update(
                  id,
                  data as Partial<Container> & {
                    photoFiles?: File[];
                    keptPhotoUrls?: string[];
                  },
                )
              }
              onDelete={containers.remove}
            />
          </TabsContent>

          <TabsContent value="cabins">
            <CabinsSection
              data={cabins.data}
              loading={cabins.loading}
              error={cabins.error}
              onInsert={(data) =>
                cabins.insert(
                  data as Omit<Cabin, "id" | "created_at" | "updated_at"> & {
                    photoFiles?: File[];
                  },
                )
              }
              onUpdate={(id, data) =>
                cabins.update(
                  id,
                  data as Partial<Cabin> & {
                    photoFiles?: File[];
                    keptPhotoUrls?: string[];
                  },
                )
              }
              onDelete={cabins.remove}
            />
          </TabsContent>

          <TabsContent value="painting">
            <PaintingSection
              data={painting.data}
              loading={painting.loading}
              error={painting.error}
              onInsert={(data) =>
                painting.insert(
                  data as Omit<Painting, "id" | "created_at" | "updated_at"> & {
                    photoFiles?: File[];
                  },
                )
              }
              onUpdate={(id, data) =>
                painting.update(
                  id,
                  data as Partial<Painting> & {
                    photoFiles?: File[];
                    keptPhotoUrls?: string[];
                  },
                )
              }
              onDelete={painting.remove}
            />
          </TabsContent>

          <TabsContent value="parking">
            <ParkingSection
              data={parking.data}
              loading={parking.loading}
              error={parking.error}
              onInsert={(data) =>
                parking.insert(
                  data as Omit<Parking, "id" | "created_at" | "updated_at"> & {
                    photoFiles?: File[];
                  },
                )
              }
              onUpdate={(id, data) =>
                parking.update(
                  id,
                  data as Partial<Parking> & {
                    photoFiles?: File[];
                    keptPhotoUrls?: string[];
                  },
                )
              }
              onDelete={parking.remove}
            />
          </TabsContent>

          <TabsContent value="underparts">
            <UnderpartsSection
              data={underparts.data}
              loading={underparts.loading}
              error={underparts.error}
              onInsert={(data) =>
                underparts.insert(
                  data as Omit<
                    Underpart,
                    "id" | "created_at" | "updated_at"
                  > & {
                    photoFiles?: File[];
                  },
                )
              }
              onUpdate={(id, data) =>
                underparts.update(
                  id,
                  data as Partial<Underpart> & {
                    photoFiles?: File[];
                    keptPhotoUrls?: string[];
                  },
                )
              }
              onDelete={underparts.remove}
            />
          </TabsContent>
        </Tabs>
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
