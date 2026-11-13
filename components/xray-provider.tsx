"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { makeFlagStore } from "@/lib/flag-store";
import { applyTheme, INTRO_KEY, XRAY_KEY } from "@/lib/xray";

// X-ray lives in sessionStorage; the intro banner's dismissal in localStorage (SPEC §5).
const xrayStore = makeFlagStore(() => window.sessionStorage, XRAY_KEY);
const introStore = makeFlagStore(() => window.localStorage, INTRO_KEY);

type SiteState = {
  xray: boolean;
  /** True once the banner was dismissed or X-ray was turned on. */
  introSeen: boolean;
  setXray: (on: boolean) => void;
  toggleXray: () => void;
  dismissIntro: () => void;
  /** Opens "Ask my work". Wired up in Milestone 3; a no-op until then. */
  openAsk: () => void;
};

const SiteContext = createContext<SiteState | null>(null);

export function XrayProvider({ children }: { children: ReactNode }) {
  const xray = useSyncExternalStore(xrayStore.subscribe, xrayStore.get, () => false);
  // Server snapshot is "seen", so the banner never renders on the server or during hydration.
  const introSeen = useSyncExternalStore(introStore.subscribe, introStore.get, () => true);

  const setXray = useCallback((on: boolean) => {
    xrayStore.set(on);
    introStore.set(true);
    applyTheme(on);
  }, []);
  const toggleXray = useCallback(() => setXray(!xrayStore.get()), [setXray]);
  const dismissIntro = useCallback(() => introStore.set(true), []);
  const openAsk = useCallback(() => {}, []);

  const value = useMemo(
    () => ({ xray, introSeen, setXray, toggleXray, dismissIntro, openAsk }),
    [xray, introSeen, setXray, toggleXray, dismissIntro, openAsk],
  );
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteState {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside <XrayProvider>");
  return ctx;
}

/** The intro banner and the Nav's "NEW" pill share this rule. */
export function useShowIntro(): boolean {
  const { introSeen, xray } = useSite();
  return !introSeen && !xray;
}
