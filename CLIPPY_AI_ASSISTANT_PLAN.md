# Clippy AI Assistant — Implementation Plan

## Overview

Add a Microsoft Clippy-style assistant to the Win98-themed form builder app. Clippy sits in the bottom-right corner as a floating icon, periodically shows random speech bubble messages, and when clicked:

- **Not logged in** → prompts the user to log in
- **Logged in** → opens a chat window where the user can describe a form and have AI generate it

The AI integration uses `z-ai-web-dev-sdk` with GLM-4.5-air. The `.z-ai-config` file is managed separately by you.

---

## Architecture Impact: **Minimal — purely additive, no refactoring needed**

| Area | Impact |
|---|---|
| Database | None — chat history is in-memory (React state) |
| Auth system | None — use existing `useGetUserInfo` to detect login state |
| tRPC routes | None — reuse existing `createForm` + `updateFields` mutations |
| Window management | None — Clippy chat reuses `Win98Window` pattern |
| Existing forms flow | None — AI-generated forms use the same save path as manually-built ones |
| New dependencies | 1: `z-ai-web-dev-sdk` (added to `apps/web`) |

---

## Files to Create / Modify

### 1. `apps/web/components/clippy.tsx` — **NEW** (the core component)

The entire Clippy experience in one component. Contains three states:

```
┌─────────────────────────────────────┐
│  clippy.tsx                         │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ State: idle                     ││
│  │ → Render floating Clippy icon   ││
│  │   (fixed, bottom-right)         ││
│  │ → Periodically show speech      ││
│  │   bubble with random messages   ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ State: unauthenticated-click    ││
│  │ → Clippy says "Log in to use    ││
│  │   me to make forms!"            ││
│  │ → Maybe auto-navigate to /login ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ State: chat-open                ││
│  │ → Win98Window with chat UI      ││
│  │ → Message list + text input     ││
│  │ → "Generate" button calls AI    ││
│  │ → On response, shows form       ││
│  │   preview + "Save Form" button  ││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

#### Details by sub-state:

**Idle state (always visible):**
- Fixed position: `bottom: 40px; right: 16px; z-index: 9998`
- Shows animated Clippy icon (GIF or CSS sprite) inside a small Win98-styled box
- A speech bubble appears above it on a timer (every 15–30s) with random hardcoded messages:
  - "It looks like you're trying to build a form. Would you like help?"
  - "I'm Clippy! Your AI form assistant."
  - "Need a form? Just chat with me!"
  - "Forms made easy — just describe what you want."
  - "Psst... I can build forms while you chill."
- Speech bubble auto-dismisses after ~5s or on click

**Unauthenticated click:**
- When `useGetUserInfo().user` is null/falsy
- Speech bubble shows: "Log in to use me to make forms!" with a link/button to `/login`
- Clippy winks/gestures via CSS animation

**Chat window (authenticated + clicked):**
- Opens a `Win98Window` titled "Clippy — AI Form Assistant" (450×500, centered or near Clippy)
- Reuses `useWindows().registerWindow` so it appears in the taskbar
- Content:
  - Scrollable message area with user messages (right-aligned) and Clippy messages (left-aligned with icon)
  - Text input + Send button at the bottom
  - A "Generate" flow:
    1. User sends a message like *"Make a contact form with name, email, and phone"*
    2. The message goes to `POST /api/ai/generate-form`
    3. AI responds with a structured JSON form definition
    4. Clippy shows a preview of the generated form fields
    5. User clicks "Save Form" → calls `trpc.form.createForm` then `trpc.form.updateFields`
    6. On success, navigates to `/builder/{formId}`

---

### 2. `apps/web/app/api/ai/generate-form/route.ts` — **NEW** (Next.js API route)

```
POST /api/ai/generate-form
Content-Type: application/json

{
  "prompt": "Make a contact form with name, email, phone"
}

Response 200:
{
  "title": "Contact Form",
  "description": "A simple contact form",
  "fields": [
    {
      "type": "text",
      "label": "Name",
      "placeholder": "Enter your name",
      "required": true,
      "order": 0
    },
    {
      "type": "email",
      "label": "Email",
      "placeholder": "Enter your email",
      "required": true,
      "order": 1
    },
    {
      "type": "number",
      "label": "Phone",
      "placeholder": "Enter your phone number",
      "required": false,
      "order": 2
    }
  ]
}
```

Implementation outline:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// .z-ai-config is configured by the user externally

export async function POST(request: NextRequest) {
  const { prompt } = await request.json();

  const zai = await ZAI.create();

  const systemPrompt = `You are a form builder assistant. Given a user's description, generate a form definition.
Respond with valid JSON only (no markdown, no code fences) in this exact shape:
{
  "title": "string (max 55 chars)",
  "description": "string (max 30 chars, optional)",
  "fields": [
    {
      "type": "text|number|email|select|checkbox|textarea|yes_no",
      "label": "string (max 100 chars)",
      "placeholder": "string (optional)",
      "required": boolean,
      "options": ["option1", "option2"] (only for select/checkbox),
      "order": number
    }
  ]
}`;

  const result = await zai.generate({ systemPrompt, userPrompt: prompt });
  const formDefinition = JSON.parse(result.text);

  return NextResponse.json(formDefinition);
}
```

---

### 3. `apps/web/app/(desktop)/layout.tsx` — **MODIFY** (add Clippy)

Add the Clippy component so it renders on all authenticated desktop pages:

```typescript
import { DesktopShell } from '~/components/desktop-shell';
import { WindowsProvider } from '~/components/windows-context';
// ++
import { Clippy } from '~/components/clippy';

export default function DesktopLayout({ children }) {
  return (
    <WindowsProvider>
      <DesktopShell>
        {children}
        {/* ++ */}
        <Clippy />
      </DesktopShell>
    </WindowsProvider>
  );
}
```

---

### 4. `apps/web/package.json` — **MODIFY** (add dependency)

```json
"dependencies": {
  // ...
  "z-ai-web-dev-sdk": "^latest"
}
```

Then run: `pnpm install --filter web`

---

## Data Flow: Chat → Form

```
User: "Make a survey about coffee preferences"
        │
        ▼
POST /api/ai/generate-form  ───→  zai.create() → zai.generate()
        │                                │
        ▼                                ▼
  { title: "Coffee Survey",        GLM-4.5-air
    fields: [...] }                    LLM
        │
        ▼
  Clippy shows preview (in chat)
        │
  User clicks "Save Form"
        │
        ▼
  trpc.form.createForm({ title, description })
        │
        ▼
  trpc.form.updateFields({ formId, fields })
        │
        ▼
  Navigate to /builder/{formId}
```

---

## Component Tree (before vs after)

### Before

```
<WindowsProvider>
  <DesktopShell>
    <DesktopIcons />
    {children}            ← page content
  </DesktopShell>
  <Taskbar />
</WindowsProvider>
```

### After

```
<WindowsProvider>
  <DesktopShell>
    <DesktopIcons />
    {children}
  </DesktopShell>
  <Taskbar />
  <Clippy />              ← NEW: fixed bottom-right
</WindowsProvider>
```

---

## Random Speech Bubble Messages (hardcoded)

```typescript
const TIPS = [
  "It looks like you're trying to build a form. Would you like help?",
  "Hi there! I'm Clippy, your AI form assistant.",
  "Need a form? Just tell me what you want!",
  "Forms made easy — describe and I'll build it.",
  "Psst... I can build forms while you relax.",
  "You can ask me for a contact form, survey, registration, and more!",
  "Don't want to drag and drop? Just chat with me!",
  "I use GLM-4.5-air to understand what you need.",
];
```

---

## Edge Cases & Considerations

| Concern | Solution |
|---|---|
| Chat on public pages (`(public)/forms/[formId]`) | Clippy is only added to `(desktop)/layout.tsx`, not public routes |
| Slow AI response | Show a typing indicator in the chat ("Clippy is thinking..."), set client timeout ~30s |
| AI returns invalid JSON | Parse in try/catch, show "Sorry, I couldn't understand that. Please try rephrasing." |
| Multiple chat windows | Only one Clippy chat window at a time (singleton) — toggle open/close on click |
| Speech bubble during chat | Pause idle speech bubble timer when chat is open |
| Rate limiting / API costs | Add a simple cooldown (disable "Generate" for 2s after each call) |
| `.z-ai-config` not set up | The API route should return a friendly error if the config is missing or env vars aren't set |
| Unauthenticated user clicks Clippy | Show login prompt bubble + optionally auto-navigate to `/login` after 2s |
| Form title/description exceeds DB limits | AI system prompt constrains to 55/30 chars; backend validation already exists |
| Field type mismatch | Map AI output (e.g., "yes_no" → enum-compatible) before calling `updateFields` |

---

## Implementation Order

1. **`z-ai-web-dev-sdk`** — Install the package + create `.z-ai-config` (you handle this)
2. **`route.ts`** — AI API route (returns form JSON from prompt)
3. **`clippy.tsx`** — The full Clippy component (idle → speech bubble → chat → form preview → save)
4. **`layout.tsx`** — Add `<Clippy />` to desktop layout
5. **Verify** — `pnpm dev`, test the full flow

Total new code: **~300–400 lines** across 2 new files + 2 trivial modifications.
