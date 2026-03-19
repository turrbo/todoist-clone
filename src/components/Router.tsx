"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import InboxView from "@/components/views/InboxView";
import TodayView from "@/components/views/TodayView";
import UpcomingView from "@/components/views/UpcomingView";
import FiltersView from "@/components/views/FiltersView";
import ProjectView from "@/components/views/ProjectView";
import LabelView from "@/components/views/LabelView";

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
    setPathname(window.location.pathname);

    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState(null, "", path);
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
