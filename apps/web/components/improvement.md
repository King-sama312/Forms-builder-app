# Win98 Window System — Improvement Plan

## Current Problems

### 1. Minimized windows unmount completely (`win98-window.tsx:84`)
```tsx
if (minimized) return null;
```
This is the root cause of nearly all glitches. When minimized:

- The **entire component tree** unmounts — including `<audio>` elements, timers, WebSocket connections, form state, etc.
- Music player audio stops and loses position. When restored, the `<audio>` element re-mounts from scratch (broken seek, lost playlist position).
- `react-rnd` loses its internal DOM state. On restore, a fresh Rnd instance mounts, causing:
  - Position/size glitches (jumps to default, wrong bounds)
  - Drag/resize handlers re-attach with stale closures
  - Occasional `NaN` dimensions or stuck maximized state

### 2. No z-index stacking / focus management
All windows are `zIndex: 50`. There is no concept of:
- Active (focused) vs. inactive window
- Click-to-raise (clicking a window behind another does nothing)
- Visual distinction (title bar color change) for active window

### 3. Windows are URL-bound (Next.js pages)
Each window lives on a separate route (`/music-player`, `/forms`, `/builder/[id]`). Navigating between routes unmounts the previous window entirely. This means:
- You cannot have the music player running while working on a form (they exist on different pages)
- Taskbar "restore" calls `router.push(pathname)` → full page navigation → all other windows destroyed
- The `registerWindow` context is reset on every navigation since it lives in the page tree

### 4. No minimize/restore animation
Win98 fades/minimizes to the taskbar with an animation. The current system just pops in/out.

### 5. `bounds` inconsistency
```tsx
bounds={fixed ? 'window' : 'parent'}
```
- `fixed` is only used by Clippy. Other windows use `'parent'`, but the parent is the desktop content area. Windows can escape the viewport.
- No snap-to-screen-edge behavior.

### 6. Taskbar state vs. actual window state
The `windows-context` tracks `minimized` and `maximized`, but since windows are physically unmounted on minimize, the context state can desync from reality (e.g., a page refresh leaves stale entries).

---

## Recommended Solution: Custom Window Manager (Portal-based)

The current architecture (one URL = one window) fundamentally conflicts with Win98's multi-window paradigm. Rather than patching around it, we should **decouple windows from routes**.

### Architecture

```
DesktopShell
├── WindowManager        ← new: renders all open windows via a portal
│   ├── Win98Window (music-player)
│   ├── Win98Window (form-builder)
│   └── Win98Window (clippy)
├── DesktopIcons
├── Taskbar
└── (page content becomes a "root window" or gets absorbed)
```

### Key Changes

#### A. Portal-based window rendering (`WindowManager`)
- A new `WindowManager` component renders inside `DesktopShell`, mounted **once** at the top level.
- It uses a React portal (`createPortal`) to render all open windows into a dedicated container `<div id="window-layer">`.
- Windows are **never unmounted on minimize** — they are hidden via `display: none` (or `visibility: hidden` + `pointer-events: none`), preserving all child state (audio, timers, inputs, etc.).
- Each window gets a unique ID on creation (not `pathname`).
- Z-index is managed by sorting the window array; the last-focused window gets the highest index.

#### B. Window context overhaul (`windows-context.tsx`)
Replace current implementation with:

```tsx
interface WindowInstance {
  id: string;
  title: string;
  component: React.ReactNode;   // store JSX, not a pathname
  state: 'normal' | 'minimized' | 'maximized';
  prevSize: { width: number; height: number };
  prevPosition: { x: number; y: number };
  zIndex: number;
}

interface WindowManagerContext {
  openWindow: (id: string, title: string, component: React.ReactNode, defaults?: SizePos) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;     // bring to front
  updatePosition: (id: string, pos: Position) => void;
  updateSize: (id: string, size: Size) => void;
  windows: WindowInstance[];
}
```

The provider lives **inside `DesktopShell`** (above the route content), so it survives Next.js page transitions.

#### C. Routes trigger `openWindow` instead of rendering directly
Pages become thin "window openers" that call `openWindow()` from the window context:

```tsx
// app/(desktop)/music-player/page.tsx — rewritten
export default function MusicPlayerPage() {
  const { openWindow, windows } = useWindowManager();

  useEffect(() => {
    const exists = windows.find(w => w.id === 'music-player');
    if (!exists) {
      openWindow('music-player', 'Music Player', <MusicPlayer />, { x: 200, y: 120, width: 400, height: 380 });
    }
  }, []);

  return null; // or an "already opened" indicator
}
```

Alternatively, add an `autoOpen` mechanism: a page provides its window definition via a context, and a layout-level effect handles it.

#### D. Taskbar clicks restore/focus (no navigation)
Taskbar items call `focusWindow(id)` (which restores if minimized and brings to front) instead of `router.push(pathname)`. The pathname mapping is no longer needed.

#### E. Active window visual
- The focused window's title bar gets the active color (`#000080` background, white text).
- Inactive windows have a dark gray title bar (`#808080`).
- Clicking anywhere on a window triggers `focusWindow`.

---

## Implementation Steps (Ordered)

### Phase 1 — Core Framework

1. **Rewrite `windows-context.tsx`** into a full `WindowManager` with the interface above, using `useRef` + `useState` for window registry. Store `ReactNode` references.

2. **Create `WindowManager` component** inside `DesktopShell`:
   - Renders a `<div id="window-layer">` portal container with `position: absolute; inset: 0; pointer-events: none; z-index: 100`.
   - Maps `windows` array to rendered `Win98Window` components.
   - Handles z-index via `pointer-events: auto` on focused window only (or per-window z-index).

3. **Refactor `Win98Window`**:
   - Remove `pathname` dependency.
   - Accept `windowId` from the manager.
   - On minimize: don't return `null` — set `display: none` on the wrapper div. This preserves children in the DOM.
   - Accept `onFocus` callback for z-index raising.
   - Accept `zIndex` prop.
   - Remove use of `react-rnd` `bounds` entirely (let it free-drag within `window-layer`).

### Phase 2 — Window Persistence & Routing

4. **Update `DesktopShell`** to host the `WindowManagerProvider` and the `WindowManager` renderer.

5. **Update each page** (`music-player/page.tsx`, `forms/page.tsx`, `builder/[formId]/page.tsx`, etc.) to use the new `openWindow` pattern instead of rendering `<Win98Window>` directly.

6. **Remove `Win98Window` from page components** — pages just provide content JSX.

7. **Update `Taskbar`** to call `focusWindow(id)` instead of `router.push(pathname)`.

### Phase 3 — Polish

8. **Minimize animation**: Briefly animate the window shrinking toward the taskbar button position before hiding.

9. **Snap-to-edge**: On drag release, snap window to screen edges (like Win98).

10. **Taskbar grouping**: If multiple windows of the same type are open, group them in the taskbar.

11. **Window menu**: Right-click on title bar or taskbar item → context menu (Minimize / Maximize / Close / Move / Size).

12. **Tile / Cascade**: Keyboard shortcuts for arranging windows.

### Phase 4 — Performance

13. **Virtualize hidden windows**: If >10 windows are open and minimized, consider moving their DOM to a detached fragment or serializing their state before truly unmounting. (Likely not needed for this app.)

---

## Why Not Fix `react-rnd`?

`react-rnd` itself is fine for drag/resize. The glitchy behavior is caused by the **unmount/remount cycle** on minimize. Once windows stay mounted, `react-rnd` will retain its internal state and the glitches should disappear. If further issues arise, we can swap to a manual drag implementation (Win98 used a title-bar-drag + resize-handle approach that is simpler than `react-rnd`'s full box model) without changing the rest of the architecture.

---

## Summary

| Problem | Solution |
|---|---|
| Minimize destroys audio/state | Keep windows mounted, hide with CSS |
| Can't have music + forms open | Decouple windows from routes, render via portal |
| Taskbar navigation kills other windows | Taskbar focuses windows, not navigates |
| No z-order / focus | Track focus order, assign z-index per window |
| Windows glitch on restore | Stop unmounting — Rnd keeps its DOM state |
| Stale context on refresh | Manager lives above route level |
