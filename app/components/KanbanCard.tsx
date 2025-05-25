import { useState, MouseEvent, useRef, useEffect } from 'react';

type KanbanCardProps = {
  title: string;
  image?: string;
  description?: string;
  onClick?: () => void;
  onDelete?: () => void;
  done?: boolean;
  onMarkDone?: () => void;
  onUndo?: () => void;
};

export default function KanbanCard({ title, image, description, onClick, onDelete, done, onMarkDone, onUndo }: KanbanCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMenuClick = (e: MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((open) => !open);
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    onDelete?.();
  };

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

  return (
    <div
      className={`relative bg-white rounded-lg shadow p-4 mb-4 cursor-pointer hover:ring-2 ring-blue-400 group flex flex-col transition-all duration-200 ${done ? 'opacity-50' : ''}`}
      onClick={onClick}
      ref={menuRef}
      style={{ minHeight: 120 }}
    >
      {/* More icon (three dots) */}
      <button
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 z-10"
        onClick={handleMenuClick}
        tabIndex={-1}
        aria-label="More options"
      >
        <span className="inline-block w-5 h-5 text-gray-400">
          <svg viewBox="0 0 20 20" fill="currentColor"><circle cx="4" cy="10" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/></svg>
        </span>
      </button>
      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute top-8 right-2 bg-white border rounded shadow z-20 min-w-[100px]">
          <button
            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}
      {image && <img src={image} alt={title} className="rounded mb-2 w-full h-24 object-cover" />}
      <div className={`font-semibold text-gray-900 ${done ? 'line-through' : ''}`}>{title}</div>
      {description && <div className="text-gray-500 text-sm mt-1">{description}</div>}
      {/* Mark as done or Undo button */}
      {done ? (
        <button
          className="mt-auto px-3 py-1 bg-gray-100 text-gray-700 rounded shadow hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={e => { e.stopPropagation(); onUndo?.(); }}
          type="button"
        >
          Undo
        </button>
      ) : (
        <button
          className="mt-auto px-3 py-1 bg-green-100 text-green-700 rounded shadow hover:bg-green-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={e => { e.stopPropagation(); onMarkDone?.(); }}
          type="button"
        >
          Mark as done
        </button>
      )}
    </div>
  );
} 