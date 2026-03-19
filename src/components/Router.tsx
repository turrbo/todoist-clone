"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import InboxView from "@/components/views/InboxView";
import TodayView from "@/components/views/TodayView";
import UpcomingView from "@/components/views/UpcomingView";
import FiltersView from "@/components/views/FiltersView";
import ProjectView from "@/components/views/ProjectView";
import LabelView from "@/components/views/LabelView";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

function stripBasePath(path: string): string {
  if (BASE_PATH && path.startsWith(BASE_PATH)) {
    const stripped = path.slice(BASE_PATH.length);
    return stripped || "/";
  }
  return path || "/";
}

interface RouterContextType {
  pathname: string;
  navigate: (path: string) => void;
}

const RouterContext = createContext<RouterContextType>({
  pathname: "/",
  navigate: () => {},
});

export function useRouter() {
  return useContext(RouterContext);
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState("/");

  useEffect(() => {
    setPathname(stripBasePath(window.location.pathname));

    const handlePopState = () => {
      setPathname(stripBasePath(window.location.pathname));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    const fullPath = BASE_PATH + path;
    window.history.pushState(null, "", fullPath);
    setPathname(path);
  }, []);

  return (
    <RouterContext.Provider value={{ pathname, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export default function AppRouter() {
  const { pathname } = useRouter();

  if (pathname === "/" || pathname === "") {
    return <InboxView />;
  }
  if (pathname === "/today") {
    return <TodayView />;
  }
  if (pathname === "/upcoming") {
    return <UpcomingView />;
  }
  if (pathname === "/filters") {
    return <FiltersView />;
  }
  if (pathname.startsWith("/project/")) {
    const id = pathname.replace("/project/", "");
    return <ProjectView projectId={id} />;
  }
  if (pathname.startsWith("/label/")) {
    const id = pathname.replace("/label/", "");
    return <LabelView labelId={id} />;
  }

  return <InboxView />;
}
