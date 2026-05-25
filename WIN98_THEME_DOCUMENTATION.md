# Windows 98 Theme Documentation

This document outlines all components and files related to the Windows 98 theme implementation in the Forms Builder application.

## Core Theme Files

### 1. Win98 Window Component
**File:** `apps/web/components/win98-window.tsx`
- Base component for creating draggable, resizable windows with classic Windows 98 styling
- Uses `react-rnd` for resize and drag functionality
- Features:
  - Title bar with minimize/maximize/close buttons
  - Classic gray background (`#c0c0c0`)
  - Window controls styling
  - Configurable default position and size
  - Callback handlers for close events

### 2. Desktop Background & Global Styles
**File:** `apps/web/app/globals.css`
- Imports the `98.css` library for base Windows 98 styling
- Defines `.win98-desktop` class:
  - Background color: `#008080` (teal)
  - Subtle white dot pattern for desktop texture
- Custom scrollbar styling to match Windows 98 aesthetics
- Desktop icon styles:
  - Size: 75px width
  - Hover effect: dotted white border
  - Active effect: navy blue background
  - Text styling with shadow for visibility
- Taskbar active item styling

### 3. Boot Screen
**File:** `apps/web/components/boot-screen.tsx`
- Simulates Windows 98 boot sequence on first load
- Features:
  - Blue background (`#000080`)
  - "Windows 98" and "Microsoft" text
  - Progress bar at bottom
  - 5-second boot animation
  - Triggers completion callback when finished

### 4. Desktop Icons
**File:** `apps/web/components/desktop-icons.tsx`
- Displays clickable icons on the desktop
- Current icons:
  - My Forms: Navigates to `/forms`
  - Login: Navigates to `/login`
  - Register: Navigates to `/signup`
- Uses SVG icons for each item
- Implements double-click to activate (mimicking Windows behavior)

### 5. Taskbar
**File:** `apps/web/components/taskbar.tsx`
- Implements the Windows 98 taskbar at bottom of screen
- Features:
  - Start button with Windows flag logo
  - Active application indicators
  - System tray with user info and clock
  - Start menu toggle functionality
  - Taskbar item styling (inset/outset borders for active/inactive states)
  - Real-time clock display

### 6. Start Menu
**File:** `apps/web/components/start-menu.tsx`
- Classic Windows 98 style start menu
- Appears when Start button is clicked
- Contains:
  - Vertical "Windows 98" label on sidebar
  - Menu items:
    - My Forms (navigates to forms)
    - Login/Register (conditional based on auth state)
    - Log Off (when authenticated)
    - Shut Down (navigates to home)
  - Classic hover and active styling
  - Mouse leave auto-close functionality

## Page-Level Usage

Several pages utilize the Win98Window component to create application dialogs:

### 1. Home Page
**File:** `apps/web/app/page.tsx`
- Shows boot screen on first visit
- Displays welcome window after boot
- Welcome window includes:
  - Personalized greeting
  - Login/Register links (when not authenticated)
  - System information (Next.js, tRPC, Windows 98 Theme)

### 2. Forms Listing
**File:** `apps/web/app/forms/page.tsx`
- Displays forms in a Win98Window
- Standard window positioning

### 3. Authentication Pages
**Files:**
- `apps/web/app/(auth)/login/page.tsx`
- `apps/web/app/(auth)/signup/page.tsx`
- Both use Win98Window for login and registration forms
- Standard window positioning with close handling

### 4. Form Builder
**File:** `apps/web/components/form/form-builder.tsx`
- Main form editing interface
- Features:
  - Menu bar with Forms, Save, and Preview buttons
  - Field editor integration
  - Status bar showing field count and form description
  - Positioned at (60, 40) with size 640x480

### 5. Form Preview
**File:** `apps/web/components/form/form-preview.tsx`
- Form preview and submission interface
- Two window states:
  - Preview window (480x520 at position 100,60)
  - Submission received window (360x200 at position 200,150)
- Includes form validation and submission handling
- Cancel/Submit buttons in status bar

### 6. Form Builder Routes
**Files:**
- `apps/web/app/builder/[formId]/page.tsx`
- `apps/web/app/builder/[formId]/preview/page.tsx`
- Both routes render the FormBuilder and FormPreview components respectively

## Implementation Pattern

The Windows 98 theme follows a consistent pattern:

1. **Layout Foundation**: The `RootLayout` in `apps/web/app/layout.tsx` establishes:
   - `.win98-desktop` container covering full viewport
   - Desktop workspace area (above taskbar)
   - Permanent taskbar at bottom
   - DesktopIcons component for desktop shortcuts

2. **Window Management**: All dialogs and main interfaces use the `Win98Window` component which provides:
   - Consistent visual styling
   - Drag-and-resize functionality
   - Standard window controls
   - Configurable positioning and sizing

3. **Navigation**: Desktop icons, taskbar, and start menu provide multiple ways to navigate:
   - Desktop icons for primary applications
   - Taskbar for open applications and system info
   - Start menu for comprehensive navigation

## Styling Details

Key CSS classes and styles used throughout the theme:

- `.win98-desktop`: Main desktop container with teal background and dot pattern
- `.desktop-icon`: Icon styling with hover/active states
- `.taskbar-item-active`: Active taskbar item styling
- Custom scrollbars: Matching Windows 98 gray colors with 3D button effects
- Color palette:
  - Window background: `#c0c0c0` (light gray)
  - Title bar: Darker gray with blue indicator
  - Desktop: `#008080` (teal)
  - Taskbar: Various gray shades with 3D effects
  - Menu items: `#000080` (navy blue) background

## Component Dependencies

The theme relies on these key dependencies:
- `react-rnd`: For window resizing and dragging
- `98.css`: Base Windows 98 CSS styling
- Next.js navigation hooks: `useRouter`, `usePathname`
- React: State management and effects

## Extensibility

To add new Windows 98 styled components:
1. Use `Win98Window` as a wrapper for dialogs and main interfaces
2. Follow the existing styling patterns in `globals.css`
3. Use SVG icons consistent with the existing desktop icons
4. Implement taskbar items in the Taskbar component for new routes
5. Add start menu items in the StartMenu component as needed

The theme is designed to be modular, allowing individual components to be updated or replaced while maintaining the overall Windows 98 aesthetic.