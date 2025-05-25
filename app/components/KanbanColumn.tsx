import { ReactNode, useState, useRef, useEffect } from 'react';

export type KanbanColumnProps = {
  title: string;
  children: ReactNode;
  onRename?: (newTitle: string) => void;
  onDelete?: () => void;
};

export default function KanbanColumn({ title, children, onRename, onDelete }: KanbanColumnProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setNewTitle(title); }, [title]);

  // Dismiss dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(event: Event) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen]);

  const handleRename = () => {
    if (onRename && newTitle.trim()) {
      onRename(newTitle.trim());
    }
    setRenaming(false);
    setMenuOpen(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
    setMenuOpen(false);
  };

  const confirmDelete = () => {
    onDelete?.();
    setShowDeleteConfirm(false);
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between mb-4">
        {renaming ? (
          <input
            className="font-bold text-gray-700 bg-white border-b border-blue-400 focus:outline-none px-1 py-0.5 rounded"
            value={newTitle}
            autoFocus
            onChange={e => setNewTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={e => { if (e.key === 'Enter') handleRename(); }}
            style={{ minWidth: 0, width: '70%' }}
          />
        ) : (
          <h2 className="font-bold text-gray-700 truncate" title={title}>{title}</h2>
        )}
        {/* More icon (three dots) */}
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 ml-2"
          onClick={() => setMenuOpen((open) => !open)}
          tabIndex={-1}
          aria-label="Column options"
        >
          <span className="inline-block w-5 h-5 text-gray-400">
            <svg viewBox="0 0 20 20" fill="currentColor"><circle cx="4" cy="10" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/></svg>
          </span>
        </button>
        {/* Dropdown menu */}
        {menuOpen && (
          <div ref={menuRef} className="absolute top-8 right-0 bg-white border rounded shadow z-20 min-w-[120px]">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => { setRenaming(true); setMenuOpen(false); }}
            >
              Rename
            </button>
            <button
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        )}
      </div>
      {children}
      {/* Confirm delete modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xs shadow-lg relative">
            <h2 className="text-lg font-bold mb-4">Delete Column?</h2>
            <p className="mb-4">Are you sure you want to delete <span className="font-semibold">{title}</span>? This will also delete all tasks in this column.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 