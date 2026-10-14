// Where the island goes. Pure function so it can be unit-tested without Electron.
export const WINDOW = { width: 720, height: 660 };
export const GUESSED_NOTCH = 190, NOTCHED_MENU_BAR = 30;
export function placeIsland(display, { forceFloating = false } = {}) {
  const { bounds, workArea } = display; const menuBar = Math.max(0, workArea.y - bounds.y);
  const notched = !forceFloating && display.internal !== false && menuBar >= NOTCHED_MENU_BAR;
  const width = Math.min(WINDOW.width, bounds.width), height = Math.min(WINDOW.height, Math.max(240, bounds.height - 80));
  const x = Math.round(bounds.x + (bounds.width - width) / 2);
  return { window: { x, y: bounds.y, width, height }, notch: notched ? { width: GUESSED_NOTCH, height: menuBar } : null, floating: !notched };
}
/** Prefer the built-in (notched) display; never follow the pointer between displays. */
export function homeDisplay(displays, primary) { return displays.find((d) => d.internal && placeIsland(d).notch) ?? primary; }
