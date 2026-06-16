/**
 * Pre-hydration theme init. Runs before paint to set the `.dark` / `.light`
 * class (and color-scheme) on <html> from localStorage or the system pref —
 * no flash, no dependency on a client provider mounting.
 */
const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark';}var d=document.documentElement;d.classList.remove('light','dark');d.classList.add(t);d.style.colorScheme=t;}catch(e){var d=document.documentElement;d.classList.add('dark');d.style.colorScheme='dark';}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />;
}
