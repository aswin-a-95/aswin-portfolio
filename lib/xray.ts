export const XRAY_KEY = "xray";
export const INTRO_KEY = "intro-seen";

/**
 * Runs in <head> before first paint so a reload in X-ray never flashes the light theme.
 * `?xray=1` turns X-ray on for the session (SPEC §5). Written as a string so it can be
 * inlined and unit-tested against fake globals.
 */
export const THEME_INIT_SCRIPT = `try{var p=new URLSearchParams(location.search);if(p.get('${XRAY_KEY}')==='1')sessionStorage.setItem('${XRAY_KEY}','1');if(sessionStorage.getItem('${XRAY_KEY}')==='1')document.documentElement.setAttribute('data-theme','xray')}catch(e){}`;

export function applyTheme(on: boolean): void {
  const root = document.documentElement;
  if (on) root.setAttribute("data-theme", "xray");
  else root.removeAttribute("data-theme");
}
