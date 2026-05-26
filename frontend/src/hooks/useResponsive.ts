import { useState, useEffect, useCallback } from 'react';

// ─── Breakpoint Definitions ─────────────────────────────────────────────────
export const BREAKPOINTS = {
  xs:  320,   // tiny phones
  sm:  480,   // phones
  md:  768,   // tablets portrait
  lg:  1024,  // tablets landscape / small laptops
  xl:  1280,  // desktops
  '2xl': 1536, // large desktops
  '3xl': 1920, // 1080p and above
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

export interface ResponsiveState {
  width: number;
  height: number;

  // Named breakpoints (true = screen is AT LEAST this wide)
  isXs:  boolean;
  isSm:  boolean;
  isMd:  boolean;
  isLg:  boolean;
  isXl:  boolean;
  is2xl: boolean;
  is3xl: boolean;

  // Convenient device categories
  isMobile:  boolean;   // < 768
  isTablet:  boolean;   // 768–1023
  isDesktop: boolean;   // >= 1024
  isWide:    boolean;   // >= 1536

  // Layout decisions
  sidebarWidth: number;        // px — computed sidebar width
  sidebarCollapsed: boolean;   // icon-only mode (768–1023)
  sidebarHidden: boolean;      // off-canvas mobile (< 768)
  headerHeight: number;        // px
  contentPadding: string;      // CSS shorthand
  gridCols: number;            // suggested grid columns for cards

  // Typography scale
  scaleRatio: number;          // 0..1, 1 = full desktop size
}

function compute(w: number, h: number): ResponsiveState {
  const isXs  = w >= BREAKPOINTS.xs;
  const isSm  = w >= BREAKPOINTS.sm;
  const isMd  = w >= BREAKPOINTS.md;
  const isLg  = w >= BREAKPOINTS.lg;
  const isXl  = w >= BREAKPOINTS.xl;
  const is2xl = w >= BREAKPOINTS['2xl'];
  const is3xl = w >= BREAKPOINTS['3xl'];

  const isMobile  = !isMd;
  const isTablet  = isMd && !isLg;
  const isDesktop = isLg;
  const isWide    = is2xl;

  // Sidebar sizing
  let sidebarWidth    = 280;
  let sidebarCollapsed= false;
  let sidebarHidden   = false;

  if (isMobile) {
    sidebarHidden    = true;
    sidebarCollapsed = false;
    sidebarWidth     = 280;
  } else if (isTablet) {
    sidebarCollapsed = true;
    sidebarHidden    = false;
    sidebarWidth     = 72;
  } else if (isDesktop && !isXl) {
    sidebarWidth     = 240;
  } else if (is2xl) {
    sidebarWidth     = 300;
  } else {
    sidebarWidth     = 280;
  }

  // Header
  const headerHeight = isMobile ? 64 : 72;

  // Content padding
  let contentPadding = '1.5rem';
  if (isMobile)      contentPadding = '1rem';
  else if (isTablet) contentPadding = '1.25rem';
  else if (is2xl)    contentPadding = '2rem';
  else if (is3xl)    contentPadding = '2.5rem';

  // Grid columns for stat/card grids
  let gridCols = 1;
  if (isSm)       gridCols = 2;
  if (isLg)       gridCols = 3;
  if (is2xl)      gridCols = 4;

  // Typography/space scale: 0.85 on mobile → 1.0 on desktop → 1.05 on ultrawide
  let scaleRatio = 0.85;
  if (isMd)  scaleRatio = 0.9;
  if (isLg)  scaleRatio = 0.95;
  if (isXl)  scaleRatio = 1.0;
  if (is2xl) scaleRatio = 1.0;
  if (is3xl) scaleRatio = 1.05;

  return {
    width: w, height: h,
    isXs, isSm, isMd, isLg, isXl, is2xl, is3xl,
    isMobile, isTablet, isDesktop, isWide,
    sidebarWidth, sidebarCollapsed, sidebarHidden,
    headerHeight, contentPadding, gridCols, scaleRatio,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>(() =>
    compute(window.innerWidth, window.innerHeight)
  );

  const handleResize = useCallback(() => {
    setState(compute(window.innerWidth, window.innerHeight));
  }, []);

  useEffect(() => {
    // Prefer ResizeObserver on <html> for pixel-perfect updates
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => {
        setState(compute(window.innerWidth, window.innerHeight));
      });
      ro.observe(document.documentElement);
      return () => ro.disconnect();
    }
    // Fallback
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return state;
}

// ─── CSS Variable Injector ────────────────────────────────────────────────────
// Call once at app root to keep :root CSS vars in sync
export function applyCSSResponsiveVars(state: ResponsiveState) {
  const root = document.documentElement;
  root.style.setProperty('--sidebar-width',    `${state.sidebarWidth}px`);
  root.style.setProperty('--header-height',    `${state.headerHeight}px`);
  root.style.setProperty('--content-padding',  state.contentPadding);
  root.style.setProperty('--scale-ratio',      String(state.scaleRatio));
  // Fluid font scale (clamp between 14px and 16px)
  const base = Math.max(14, Math.min(16, 14 + (state.scaleRatio - 0.85) / 0.2 * 2));
  root.style.setProperty('--font-base',        `${base.toFixed(2)}px`);
}
