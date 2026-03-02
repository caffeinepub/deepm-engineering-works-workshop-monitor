import { Toaster } from "@/components/ui/sonner";
import CEODashboard from "@/pages/CEODashboard";
import Login from "@/pages/Login";
import ManagerDashboard from "@/pages/ManagerDashboard";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";

const rootRoute = createRootRoute();

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Login,
});

const managerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/manager",
  component: ManagerDashboard,
});

const ceoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ceo",
  component: CEODashboard,
});

const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  managerRoute,
  ceoRoute,
  catchAllRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
