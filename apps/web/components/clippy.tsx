'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGetUserInfo } from '~/hooks/api/auth';
import { useCreateForm } from '~/hooks/api/form';
import { useWindowManager } from '~/components/windows-context';
import { trpc } from '~/trpc/client';

interface Message {
  role: 'user' | 'clippy';
  text: string;
}

interface GeneratedField {
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
}

interface GeneratedForm {
  title: string;
  description?: string;
  fields: GeneratedField[];
}

type ClippyResponse =
  | { type: 'chat'; text: string }
  | { type: 'form'; title: string; description?: string; fields: GeneratedField[] }
  | { type: 'bulk-forms'; forms: GeneratedForm[] };

type FieldType = 'text' | 'number' | 'email' | 'select' | 'checkbox' | 'textarea' | 'radio';

function sanitizeFieldType(type: string): FieldType {
  switch (type) {
    case 'text': case 'number': case 'email': case 'select': case 'checkbox': case 'textarea': case 'radio':
      return type;
    default:
      return 'text';
  }
}

interface SavedFormInfo {
  id: string;
  title: string;
}

function ClippyChatContent() {
  const router = useRouter();
  const { createFormAsync } = useCreateForm();
  const updateFieldsMutation = trpc.form.updateFields.useMutation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedForms, setGeneratedForms] = useState<GeneratedForm[]>([]);
  const [savingStates, setSavingStates] = useState<Record<number, boolean>>({});
  const [saveErrors, setSaveErrors] = useState<Record<number, string>>({});
  const [savedForms, setSavedForms] = useState<SavedFormInfo[]>([]);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{
      role: 'clippy',
      text: "Hi! I'm Clippy! Tell me what kind of form you want to build and I'll generate it for you! I can even make multiple forms at once!",
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMsg = input.trim();
    setInput('');
    setError('');
    setGeneratedForms([]);
    setSavedForms([]);
    setSaveErrors({});
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsGenerating(true);

    setMessages(prev => [...prev, { role: 'clippy', text: 'Thinking...' }]);

    try {
      const res = await fetch('/api/ai/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate form');
      }

      const data: ClippyResponse = await res.json();

      setMessages(prev => prev.slice(0, -1));

      if (data.type === 'chat') {
        setMessages(prev => [...prev, { role: 'clippy', text: data.text }]);
      } else if (data.type === 'bulk-forms') {
        setGeneratedForms(data.forms);
        setMessages(prev => [...prev, {
          role: 'clippy',
          text: `I've created ${data.forms.length} forms for you! Take a look below and save the ones you like.`,
        }]);
      } else {
        setGeneratedForms([data]);
        setMessages(prev => [...prev, {
          role: 'clippy',
          text: `I've created a form called "${data.title}" with ${data.fields.length} field${data.fields.length === 1 ? '' : 's'}. Take a look below!`,
        }]);
      }
    } catch (err: any) {
      setMessages(prev => prev.slice(0, -1));
      setMessages(prev => [...prev, {
        role: 'clippy',
        text: `Sorry, I couldn't generate that form. ${err.message || 'Please try rephrasing.'}`,
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const doSaveForm = async (form: GeneratedForm, index: number): Promise<string | null> => {
    setSavingStates(prev => ({ ...prev, [index]: true }));
    setSaveErrors(prev => ({ ...prev, [index]: '' }));

    try {
      const result = await createFormAsync({
        title: form.title,
        description: form.description || undefined,
      });
      const formId = (result as any)?.id;
      if (!formId) throw new Error('No form ID returned');

      const fields = form.fields.map((f, i) => ({
        type: sanitizeFieldType(f.type),
        label: f.label,
        placeholder: f.placeholder || undefined,
        required: f.required,
        options: f.options?.length ? f.options : undefined,
        order: f.order ?? i,
      }));

      await updateFieldsMutation.mutateAsync({ formId, fields });

      setSavedForms(prev => [...prev, { id: formId, title: form.title }]);
      return formId;
    } catch (err: any) {
      setSaveErrors(prev => ({ ...prev, [index]: err.message || 'Failed to save' }));
      return null;
    } finally {
      setSavingStates(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleSaveForm = async (form: GeneratedForm, index: number) => {
    const formId = await doSaveForm(form, index);
    if (formId) {
      setMessages(prev => [...prev, {
        role: 'clippy',
        text: `"${form.title}" saved!`,
      }]);
    }
  };

  const handleSaveAll = async () => {
    if (isSavingAll) return;
    setIsSavingAll(true);

    const saved: SavedFormInfo[] = [];

    for (let i = 0; i < generatedForms.length; i++) {
      const form = generatedForms[i];
      if (!form) continue;
      const alreadyDone = savedForms.some(sf => sf.title === form.title);
      if (alreadyDone) {
        const existing = savedForms.find(sf => sf.title === form.title);
        if (existing) saved.push(existing);
        continue;
      }
      const formId = await doSaveForm(form, i);
      if (formId) {
        saved.push({ id: formId, title: form.title });
      }
    }

    setIsSavingAll(false);

    const savedNames = saved.map(s => s.title);
    setMessages(prev => [...prev, {
      role: 'clippy',
      text: savedNames.length > 0
        ? `All done! Here's what was saved:\n${savedNames.map(n => `• ${n}`).join('\n')}`
        : 'Something went wrong. None of the forms could be saved.',
    }]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full gap-2" style={{ fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', Tahoma, Geneva, sans-serif" }}>
      <div className="flex-1 overflow-auto border border-[#808080] bg-white p-2 space-y-2 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-1`}
          >
            {msg.role === 'clippy' && (
              <img
                src="/clippy.png"
                alt="Clippy"
                width={20}
                height={14}
                className="shrink-0 object-contain"
              />
            )}
            <div
              className={`max-w-[75%] px-2 py-1 text-base leading-snug border whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[#000080] text-white border-[#000080]'
                  : msg.text === 'Thinking...'
                  ? 'bg-[#f0f0f0] border-[#808080] italic'
                  : 'bg-[#f0f0f0] border-[#808080]'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {generatedForms.length > 0 && (
        <div className="border border-[#808080] bg-[#ffffcc] p-2 shrink-0 max-h-64 overflow-y-auto space-y-2">
          {generatedForms.map((form, i) => {
            const saved = savedForms.find(sf => sf.title === form.title);
            return (
              <div key={i} className="border border-[#808080] bg-white p-2">
                <p className="text-sm font-bold mb-1">{form.title}</p>
                {form.description && (
                  <p className="text-sm mb-1 text-gray-600">{form.description}</p>
                )}
                <div className="space-y-0.5 mb-2">
                  {form.fields.map((f, j) => (
                    <div key={j} className="text-sm flex gap-1">
                      <span className="font-medium">{f.label}</span>
                      <span className="text-gray-500">({f.type})</span>
                      {f.required && <span className="text-red-600">*</span>}
                    </div>
                  ))}
                </div>
                <div className="flex gap-1">
                  {saved ? (
                    <>
                      <button
                        className="text-sm px-3 py-1 bg-[#c0c0c0] border border-[#808080] cursor-default"
                        disabled
                      >
                        Saved
                      </button>
                      <button
                        className="text-sm px-3 py-1"
                        onClick={() => router.push(`/builder/${saved.id}`)}
                      >
                        Open
                      </button>
                    </>
                  ) : (
                    <button
                      className="text-sm px-3 py-1"
                      onClick={() => handleSaveForm(form, i)}
                      disabled={savingStates[i]}
                    >
                      {savingStates[i] ? 'Saving...' : 'Save'}
                    </button>
                  )}
                </div>
                {saveErrors[i] && (
                  <p className="text-sm text-red-700 mt-1">{saveErrors[i]}</p>
                )}
              </div>
            );
          })}
          {generatedForms.length > 1 && savedForms.length < generatedForms.length && (
            <button
              className="text-sm px-3 py-1 w-full"
              onClick={handleSaveAll}
              disabled={isSavingAll}
            >
              {isSavingAll ? 'Saving All...' : `Save All (${generatedForms.length})`}
            </button>
          )}
          {savedForms.length > 0 && (
            <div className="text-sm border-t border-[#808080] pt-2 mt-2">
              <p className="font-bold mb-1">Saved forms:</p>
              {savedForms.map((sf, i) => (
                <button
                  key={i}
                  className="text-[#0000ff] underline text-sm block"
                  onClick={() => router.push(`/builder/${sf.id}`)}
                >
                  {sf.title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-700">{error}</p>
      )}

      <div className="flex gap-1 shrink-0 items-end">
        <textarea
          className="flex-1 text-base resize-none border border-[#808080] p-1 leading-snug"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the form you want..."
          disabled={isGenerating}
        />
        <button
          className="px-3 py-1 text-base"
          onClick={handleSend}
          disabled={isGenerating || !input.trim()}
        >
          {isGenerating ? '...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

const TIPS = [
  "It looks like you're trying to build a form. Would you like help?",
  "Hi there! I'm Clippy, your AI form assistant.",
  "Need a form? Just tell me what you want!",
  "Forms made easy — describe and I'll build it.",
  "Psst... I can build forms while you relax.",
  "You can ask me for a contact form, survey, registration, and more!",
  "Don't want to drag and drop? Just chat with me!",
  "I can generate multiple forms at once — try asking for a few!",
];

export function Clippy() {
  const router = useRouter();
  const { user } = useGetUserInfo();
  const { openWindow, windows, focusWindow } = useWindowManager();

  const [showBubble, setShowBubble] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState('');
  const [showLoginBubble, setShowLoginBubble] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speechTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loginTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (windows.some(w => w.id === 'clippy-chat')) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      setShowBubble(false);
      setShowLoginBubble(false);
      return;
    }

    const showRandomTip = () => {
      const msg = TIPS[Math.floor(Math.random() * TIPS.length)];
      if (msg) setBubbleMessage(msg);
      setShowBubble(true);
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = setTimeout(() => setShowBubble(false), 5000);
    };

    const firstTip = setTimeout(showRandomTip, 5000);
    timerRef.current = setInterval(showRandomTip, 15000 + Math.random() * 15000);

    return () => {
      clearTimeout(firstTip);
      if (timerRef.current) clearInterval(timerRef.current);
      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
    };
  }, [windows]);

  const handleClippyClick = () => {
    setShowBubble(false);
    setShowLoginBubble(false);
    if (loginTimerRef.current) clearTimeout(loginTimerRef.current);

    if (!user) {
      setShowLoginBubble(true);
      loginTimerRef.current = setTimeout(() => setShowLoginBubble(false), 8000);
    } else {
      const existing = windows.find(w => w.id === 'clippy-chat');
      if (existing) {
        focusWindow('clippy-chat');
      } else {
        openWindow(
          'clippy-chat',
          'Clippy — AI Form Assistant',
          <ClippyChatContent />,
          {
            x: typeof window !== 'undefined' ? window.innerWidth - 490 : 800,
            y: typeof window !== 'undefined' ? window.innerHeight - 580 : 500,
            width: 450,
            height: 500,
          },
          undefined,
          false,
        );
      }
    }
  };

  if (windows.some(w => w.state === 'maximized' && w.id !== 'clippy-chat')) return null;

  return (
    <>
      <div className="fixed bottom-14 right-4 z-99999 flex flex-col items-end gap-1">
        {(showBubble || showLoginBubble) && (
          <div className="relative bg-[#ffffcc] border-2 border-[#000080] rounded px-4 py-3 text-base max-w-64 shadow-[2px_2px_0px_#000]" style={{ fontFamily: "'MS Sans Serif', 'Microsoft Sans Serif', Tahoma, Geneva, sans-serif" }}>
            <div className="absolute -bottom-1.75 right-8 w-3 h-3 bg-[#ffffcc] border-r-2 border-b-2 border-[#000080] rotate-45" />
            <p className="leading-tight">
              {showLoginBubble ? 'Log in to use me to make forms!' : bubbleMessage}
            </p>
            {showLoginBubble && (
              <>
                <button
                  onClick={() => { setShowLoginBubble(false); if (loginTimerRef.current) clearTimeout(loginTimerRef.current); }}
                  className="absolute cursor-pointer p-0"
                  style={{ top: '-3px', right: '-20px', fontSize: '20px', lineHeight: 1, background: 'none', border: 'none', outline: 'none', boxShadow: 'none' }}
                  title="Close"
                >
                  ×
                </button>
                <button
                  className="mt-1 text-[#0000ff] underline text-base block"
                  onClick={e => { e.stopPropagation(); router.push('/login'); }}
                >
                  Go to Login
                </button>
              </>
            )}
          </div>
        )}

        <div
          onClick={handleClippyClick}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClippyClick(); } }}
          role="button"
          tabIndex={0}
          className="cursor-pointer hover:scale-110 transition-transform"
          title="Clippy - AI Form Assistant"
        >
          <img
            src="/clippy.png"
            alt="Clippy"
            width={80}
            height={50}
            className="object-contain"
          />
        </div>
      </div>
    </>
  );
}
