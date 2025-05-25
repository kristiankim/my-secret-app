"use client";
import { useRef, useState } from 'react';

type AddTaskModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (task: { title: string; description?: string; image?: string }) => void;
};

export default function AddTaskModal({ open, onClose, onAdd }: AddTaskModalProps) {
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [imageData, setImageData] = useState<string | undefined>(undefined);

  if (!open) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
        setImageData(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(undefined);
      setImageData(undefined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      title: titleRef.current?.value || '',
      description: descRef.current?.value,
      image: imageData,
    });
    setImagePreview(undefined);
    setImageData(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Add New Task</h2>
        <input ref={titleRef} required placeholder="Title" className="w-full border p-2 rounded mb-3" />
        <textarea ref={descRef} placeholder="Description" className="w-full border p-2 rounded mb-3" />
        <input ref={imageRef} type="file" accept="image/*" className="mb-3" onChange={handleImageChange} />
        {imagePreview && (
          <img src={imagePreview} alt="Preview" className="mb-3 w-full h-32 object-cover rounded" />
        )}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
        </div>
      </form>
    </div>
  );
} 