'use client';

import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';

type MenuKey = 'file' | 'edit' | 'format' | null;

interface MenuAction {
  label: string;
  action: () => void;
  disabled?: boolean;
}

export interface NotepadHandle {
  requestClose: () => void;
}

export const Notepad = forwardRef<NotepadHandle, { onClose?: () => void }>(function Notepad({ onClose }, ref) {
  const [text, setText] = useState('');
  const [filename, setFilename] = useState('Untitled');
  const [dirty, setDirty] = useState(false);
  const [wordWrap, setWordWrap] = useState(true);
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [undoStack, setUndoStack] = useState<string[]>(['']);
  const [undoIndex, setUndoIndex] = useState(0);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onYes: () => void;
    onNo: () => void;
    onCancel?: () => void;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const pushUndo = useCallback((val: string) => {
    setUndoStack(prev => {
      const next = prev.slice(0, undoIndex + 1);
      next.push(val);
      if (next.length > 50) next.shift();
      return next;
    });
    setUndoIndex(prev => Math.min(prev + 1, 49));
  }, [undoIndex]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    if (!dirty) setDirty(true);
    pushUndo(val);
  }, [dirty, pushUndo]);

  const updateCursorPosition = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const val = ta.value;
    const pos = ta.selectionStart;
    const before = val.substring(0, pos);
    const lines = before.split('\n');
    setCursorLine(lines.length);
    setCursorCol((lines[lines.length - 1]?.length ?? 0) + 1);
  }, []);

  const handleSelect = useCallback(() => {
    updateCursorPosition();
  }, [updateCursorPosition]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (undoIndex > 0) {
        const newIdx = undoIndex - 1;
        setUndoIndex(newIdx);
        setText(undoStack[newIdx] ?? '');
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      if (undoIndex < undoStack.length - 1) {
        const newIdx = undoIndex + 1;
        setUndoIndex(newIdx);
        setText(undoStack[newIdx] ?? '');
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    setTimeout(updateCursorPosition, 0);
  }, [undoIndex, undoStack, updateCursorPosition]);

  const startNew = useCallback(() => {
    if (dirty) {
      setConfirmDialog({
        message: `Do you want to save changes to ${filename}?`,
        onYes: () => {
          handleSave();
          resetDocument();
          setConfirmDialog(null);
        },
        onNo: () => {
          resetDocument();
          setConfirmDialog(null);
        },
        onCancel: () => setConfirmDialog(null),
      });
    } else {
      resetDocument();
    }
  }, [dirty, filename]);

  const resetDocument = useCallback(() => {
    setText('');
    setFilename('Untitled');
    setDirty(false);
    setUndoStack(['']);
    setUndoIndex(0);
    setCursorLine(1);
    setCursorCol(1);
  }, []);

  const handleSave = useCallback(() => {
    if (filename === 'Untitled') {
      handleSaveAs();
      return;
    }
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDirty(false);
  }, [text, filename]);

  const handleSaveAs = useCallback(() => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.txt') ? filename : `${filename}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDirty(false);
  }, [text, filename]);

  const handleOpen = useCallback(() => {
    if (dirty) {
      setConfirmDialog({
        message: `Do you want to save changes to ${filename}?`,
        onYes: () => {
          handleSave();
          setConfirmDialog(null);
          fileInputRef.current?.click();
        },
        onNo: () => {
          setConfirmDialog(null);
          fileInputRef.current?.click();
        },
        onCancel: () => setConfirmDialog(null),
      });
    } else {
      fileInputRef.current?.click();
    }
  }, [dirty, filename]);

  const handleFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name.replace(/\.txt$/i, '') || 'Untitled');

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setText(content);
      setDirty(false);
      setUndoStack([content]);
      setUndoIndex(0);
      setCursorLine(1);
      setCursorCol(1);
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.name.endsWith('.txt')) return;

    if (dirty) {
      setConfirmDialog({
        message: `Do you want to save changes to ${filename}?`,
        onYes: () => {
          handleSave();
          setConfirmDialog(null);
          loadDroppedFile(file);
        },
        onNo: () => {
          setConfirmDialog(null);
          loadDroppedFile(file);
        },
        onCancel: () => setConfirmDialog(null),
      });
    } else {
      loadDroppedFile(file);
    }
  }, [dirty, filename]);

  const loadDroppedFile = useCallback((file: File) => {
    setFilename(file.name.replace(/\.txt$/i, '') || 'Untitled');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setText(content);
      setDirty(false);
      setUndoStack([content]);
      setUndoIndex(0);
      setCursorLine(1);
      setCursorCol(1);
    };
    reader.readAsText(file);
  }, []);

  const handleExit = useCallback(() => {
    if (dirty) {
      setConfirmDialog({
        message: `Do you want to save changes to ${filename}?`,
        onYes: () => {
          handleSave();
          setConfirmDialog(null);
          onClose?.();
        },
        onNo: () => {
          setConfirmDialog(null);
          onClose?.();
        },
        onCancel: () => setConfirmDialog(null),
      });
    } else {
      onClose?.();
    }
  }, [dirty, filename, onClose]);

  const handleEditAction = useCallback((action: 'undo' | 'cut' | 'copy' | 'paste' | 'selectAll') => {
    const ta = textareaRef.current;
    if (!ta) return;

    switch (action) {
      case 'undo':
        if (undoIndex > 0) {
          const newIdx = undoIndex - 1;
          setUndoIndex(newIdx);
          setText(undoStack[newIdx] ?? '');
        }
        break;
      case 'cut':
        document.execCommand('cut');
        break;
      case 'copy':
        document.execCommand('copy');
        break;
      case 'paste':
        navigator.clipboard.readText().then(clipText => {
          const start = ta.selectionStart;
          const end = ta.selectionEnd;
          const newVal = text.substring(0, start) + clipText + text.substring(end);
          setText(newVal);
          setDirty(true);
          pushUndo(newVal);
        });
        break;
      case 'selectAll':
        ta.select();
        break;
    }
  }, [undoIndex, undoStack, text, pushUndo]);

  const handleCut = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = text.substring(start, end);
    if (selected) {
      navigator.clipboard.writeText(selected);
      const newVal = text.substring(0, start) + text.substring(end);
      setText(newVal);
      setDirty(true);
      pushUndo(newVal);
    }
  }, [text, pushUndo]);

  const handleCopy = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = text.substring(start, end);
    if (selected) {
      navigator.clipboard.writeText(selected);
    }
  }, [text]);

  const handlePaste = useCallback(async () => {
    const ta = textareaRef.current;
    if (!ta) return;
    try {
      const clipText = await navigator.clipboard.readText();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = text.substring(0, start) + clipText + text.substring(end);
      setText(newVal);
      setDirty(true);
      pushUndo(newVal);
    } catch {}
  }, [text, pushUndo]);

  useImperativeHandle(ref, () => ({
    requestClose: () => handleExit(),
  }), [handleExit]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuBar: Record<string, { label: string; items: MenuAction[] }> = {
    file: {
      label: 'File',
      items: [
        { label: 'New', action: startNew },
        { label: 'Open...', action: handleOpen },
        { label: 'Save', action: handleSave },
        { label: 'Save As...', action: handleSaveAs },
        { label: '----------------', action: () => {} },
        { label: 'Exit', action: handleExit },
      ],
    },
    edit: {
      label: 'Edit',
      items: [
        { label: 'Undo', action: () => handleEditAction('undo'), disabled: undoIndex <= 0 },
        { label: '----------------', action: () => {} },
        { label: 'Cut', action: handleCut },
        { label: 'Copy', action: handleCopy },
        { label: 'Paste', action: handlePaste },
        { label: 'Select All', action: () => handleEditAction('selectAll') },
      ],
    },
    format: {
      label: 'Format',
      items: [
        { label: `${wordWrap ? '✓ ' : '  '}Word Wrap`, action: () => { setWordWrap(prev => !prev); setOpenMenu(null); } },
      ],
    },
  };

  const title = `${filename}${dirty ? ' *' : ''} - Notepad`;

  if (confirmDialog) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#c0c0c0] select-none">
        <div className="text-center mb-4 max-w-[300px]">
          <div className="text-3xl mb-2">📝</div>
          <div className="text-xs font-bold mb-1">Notepad</div>
          <div className="text-xs">{confirmDialog.message}</div>
        </div>
        <div className="flex gap-2">
          <button className="win98-btn px-3 py-0.5 text-xs" onClick={confirmDialog.onYes}>Yes</button>
          <button className="win98-btn px-3 py-0.5 text-xs" onClick={confirmDialog.onNo}>No</button>
          {confirmDialog.onCancel && (
            <button className="win98-btn px-3 py-0.5 text-xs" onClick={confirmDialog.onCancel}>Cancel</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] font-[Tahoma,Arial,sans-serif] text-xs select-none">
      <div className="flex items-center gap-2 px-2 py-1 border-b border-[#808080] text-xs font-bold truncate shrink-0 bg-gradient-to-r from-[#000080] to-[#1084d0] text-white">
        {title}
      </div>

      <div ref={menuRef} className="flex border-b border-[#808080] bg-[#c0c0c0] shrink-0" style={{ borderStyle: 'outset' }}>
        {Object.entries(menuBar).map(([key, menu]) => (
          <div key={key} className="relative">
            <button
              className={`px-2 py-0.5 text-xs ${openMenu === key ? 'bg-[#000080] text-white' : 'hover:bg-[#000080] hover:text-white'}`}
              onMouseDown={(e) => {
                e.stopPropagation();
                setOpenMenu(openMenu === key ? null : key as MenuKey);
              }}
              onMouseEnter={() => {
                if (openMenu !== null) setOpenMenu(key as MenuKey);
              }}
            >
              {menu.label}
            </button>
            {openMenu === key && (
              <div
                className="absolute left-0 top-full z-50 bg-[#c0c0c0] border-2 min-w-[160px] shadow-md"
                style={{ borderStyle: 'outset' }}
              >
                {menu.items.map((item, idx) => (
                  item.label.startsWith('---') ? (
                    <div key={idx} className="border-t border-[#808080] my-0.5 mx-2" />
                  ) : (
                    <button
                      key={idx}
                      className={`w-full text-left px-4 py-0.5 text-xs flex items-center gap-2 ${item.disabled ? 'text-[#808080]' : 'hover:bg-[#000080] hover:text-white'}`}
                      onClick={() => {
                        if (!item.disabled) item.action();
                        setOpenMenu(null);
                      }}
                      disabled={item.disabled}
                    >
                      {item.label}
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="flex-1 overflow-hidden bg-white"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onClick={updateCursorPosition}
          spellCheck={false}
          className="w-full h-full resize-none border-none outline-none p-1 text-sm leading-tight"
          style={{
            fontFamily: '"Courier New", "Lucida Console", monospace',
            whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
            overflowWrap: wordWrap ? 'break-word' : 'normal',
          }}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        className="hidden"
        onChange={handleFileSelected}
      />

      <div className="flex items-center px-2 py-0.5 border-t border-[#808080] bg-[#c0c0c0] text-xs shrink-0 gap-4">
        <span>Ln {cursorLine}, Col {cursorCol}</span>
      </div>
    </div>
  );
});
