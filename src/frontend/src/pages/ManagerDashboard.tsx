import Navbar from "@/components/layout/Navbar";
import DailyUpdateTab from "@/components/sections/DailyUpdateTab";
import WorkOrdersSection from "@/components/sections/WorkOrdersSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkOrders } from "@/hooks/useWorkOrders";
import { getStoredSession } from "@/lib/auth";
import type { WorkOrder } from "@/lib/types";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  const workOrders = useWorkOrders();

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

        <Tabs defaultValue="dailyupdate" className="w-full">
          {/* Scrollable horizontal tab bar on mobile */}
          <div className="overflow-x-auto mb-6">
            <TabsList className="h-auto p-1 flex flex-nowrap gap-1 bg-card border border-border w-max min-w-full">
              <TabsTrigger
                value="dailyupdate"
                className="flex-shrink-0 h-10 px-4 whitespace-nowrap data-[state=active]:bg-[oklch(0.55_0.2_145_/_0.15)] data-[state=active]:text-[oklch(0.55_0.2_145)]"
                data-ocid="daily_update.tab"
              >
                <span className="text-xs sm:text-sm font-medium">
                  Daily Report
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="workorders"
                className="flex-shrink-0 h-10 px-4 whitespace-nowrap data-[state=active]:bg-[oklch(0.55_0.2_195_/_0.15)] data-[state=active]:text-[oklch(0.55_0.2_195)]"
                data-ocid="workorders.tab"
              >
                <span className="text-xs sm:text-sm font-medium">
                  Work Orders
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dailyupdate">
            <DailyUpdateTab />
          </TabsContent>

          <TabsContent value="workorders">
            <WorkOrdersSection
              data={workOrders.data}
              loading={workOrders.loading}
              error={workOrders.error}
              onInsert={(data) =>
                workOrders.insert(
                  data as Omit<
                    WorkOrder,
                    "id" | "created_at" | "updated_at"
                  > & {
                    photoFiles?: File[];
                  },
                )
              }
              onUpdate={(id, data) =>
                workOrders.update(
                  id,
                  data as Partial<WorkOrder> & {
                    photoFiles?: File[];
                    keptPhotoUrls?: string[];
                  },
                )
              }
              onDelete={workOrders.remove}
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
