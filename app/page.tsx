"use client";
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import KanbanBoard from './components/KanbanBoard';
import AddTaskModal from './components/AddTaskModal';
import { Task, Column } from './types/kanban';
import { DropResult } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';

type Project = {
  id: string;
  name: string;
  description?: string;
  columns: Column[];
  tasks: Task[];
};

const defaultColumns: Column[] = [
  { id: 'todo', title: 'To do', order: 0 },
  { id: 'inprogress', title: 'In progress', order: 1 },
  { id: 'review', title: 'Ready for review', order: 2 },
  { id: 'done', title: 'Done', order: 3 },
];

const defaultProject: Project = {
  id: uuidv4(),
  name: 'Demo project',
  description: '',
  columns: defaultColumns,
  tasks: [
    { id: '1', title: 'E-commerce website design', image: '/kanban1.jpg', columnId: 'inprogress' },
    { id: '2', title: 'Startup landing page update', image: '/kanban2.jpg', columnId: 'review' },
    { id: '3', title: 'Design email newsletter template', columnId: 'done' },
  ],
};

function TaskDetailModal({ task, onClose, onUpdate }: { task: Task | null; onClose: () => void; onUpdate: (task: Task) => void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [image, setImage] = useState<string | undefined>(task?.image);
  const [titleEdit, setTitleEdit] = useState(false);

  useEffect(() => {
    setTitle(task?.title || '');
    setDescription(task?.description || '');
    setImage(task?.image);
    setTitleEdit(false);
    setEditing(false);
  }, [task]);

  if (!task) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => setImage(undefined);

  const handleSave = () => {
    onUpdate({ ...task, title, description, image });
    setEditing(false);
    setTitleEdit(false);
    onClose();
  };

  const handleCancel = () => {
    setTitle(task.title);
    setDescription(task.description || '');
    setImage(task.image);
    setEditing(false);
    setTitleEdit(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
        <button onClick={handleCancel} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">&times;</button>
        {/* Title: inline edit */}
        {titleEdit ? (
          <input
            className="text-xl font-bold mb-2 w-full border-b focus:outline-none"
            value={title}
            autoFocus
            onChange={e => setTitle(e.target.value)}
            onBlur={() => setTitleEdit(false)}
            onKeyDown={e => { if (e.key === 'Enter') setTitleEdit(false); }}
          />
        ) : (
          <h2
            className="text-xl font-bold mb-2 cursor-pointer hover:underline"
            onClick={() => setTitleEdit(true)}
          >
            {title}
          </h2>
        )}
        {/* Image: show with remove button on hover, and upload */}
        <div className="mb-3 w-full h-40 flex items-center justify-center relative group">
          {image ? (
            <>
              <img src={image} alt={title} className="w-full h-40 object-cover rounded" />
              <button
                className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 text-gray-700 opacity-0 group-hover:opacity-100 transition"
                onClick={handleRemoveImage}
                type="button"
              >
                &times;
              </button>
            </>
          ) : (
            <label className="w-full h-40 flex items-center justify-center border-2 border-dashed rounded cursor-pointer text-gray-400">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              + Add image
            </label>
          )}
        </div>
        {/* Description: editable textarea */}
        <textarea
          className="w-full border p-2 rounded mb-2"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
        />
        <div className="flex justify-end gap-2 mt-2">
          <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([defaultProject]);
  const [hydrated, setHydrated] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => projects[0].id);
  const [modalOpen, setModalOpen] = useState(false);
  const [addProjectModal, setAddProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const [editProjectModal, setEditProjectModal] = useState(false);
  const [editProjectName, setEditProjectName] = useState('');
  const [editProjectDescription, setEditProjectDescription] = useState('');
  const [pendingDeleteProject, setPendingDeleteProject] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('kanban-projects');
    if (stored) {
      const loaded = JSON.parse(stored);
      setProjects(
        loaded.map((p: any) => ({
          ...p,
          columns: Array.isArray(p.columns) && p.columns.length > 0 ? p.columns : defaultColumns,
        }))
      );
    }
    setHydrated(true);
  }, []);

  const currentProject = projects.find((p) => p.id === currentProjectId);
  const columns = currentProject ? [...currentProject.columns].sort((a, b) => a.order - b.order) : [];
  const tasks = currentProject ? currentProject.tasks : [];

  const setColumns = (updater: ((columns: Column[]) => Column[]) | Column[]) => {
    setProjects((prev: Project[]) =>
      prev.map((p: Project) =>
        p.id === currentProjectId
          ? { ...p, columns: typeof updater === 'function' ? updater(p.columns) : updater }
          : p
      )
    );
  };

  const handleAddColumn = () => {
    setColumns((cols: Column[]) => [
      ...cols,
      { id: uuidv4(), title: 'Uncategorized', order: cols.length },
    ]);
  };

  const handleAddTask = (task: { title: string; description?: string; image?: string }) => {
    setProjects((prev: Project[]) =>
      prev.map((p: Project) =>
        p.id === currentProjectId
          ? { ...p, tasks: [...p.tasks, { id: Date.now().toString(), title: task.title, description: task.description, image: task.image, columnId: 'todo' }] }
          : p
      )
    );
  };

  const handleUpdateTask = (updated: Task) => {
    setProjects((prev: Project[]) =>
      prev.map((p: Project) =>
        p.id === currentProjectId
          ? { ...p, tasks: p.tasks.map((t: Task) => t.id === updated.id ? updated : t) }
          : p
      )
    );
  };

  const handleDeleteTask = (task: Task) => {
    setPendingDelete(task);
  };
  const confirmDeleteTask = () => {
    if (pendingDelete) {
      setProjects((prev: Project[]) =>
        prev.map((p: Project) =>
          p.id === currentProjectId
            ? { ...p, tasks: p.tasks.filter((t: Task) => t.id !== pendingDelete.id) }
            : p
        )
      );
      setPendingDelete(null);
      if (selectedTask?.id === pendingDelete.id) setSelectedTask(null);
    }
  };
  const cancelDeleteTask = () => setPendingDelete(null);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) {
      return;
    }
    setProjects((prev: Project[]) => {
      const movingTask = prev.find((p: Project) => p.id === currentProjectId)?.tasks.find((t: Task) => t.id === draggableId);
      if (!movingTask) return prev;
      let newTasks = prev.find((p: Project) => p.id === currentProjectId)?.tasks.filter((t: Task) => t.id !== draggableId) || [];
      const destTasks = newTasks.filter((t: Task) => t.columnId === destination.droppableId);
      const before = newTasks.filter((t: Task) => t.columnId !== destination.droppableId);
      const after = [
        ...destTasks.slice(0, destination.index),
        { ...movingTask, columnId: destination.droppableId },
        ...destTasks.slice(destination.index),
      ];
      return [
        ...prev.map((p: Project) =>
          p.id === currentProjectId
            ? { ...p, tasks: [...before, ...after] }
            : p
        ),
      ];
    });
  };

  // Add new project
  const handleAddProject = () => {
    setAddProjectModal(true);
    setNewProjectName('');
  };
  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const newProj = { id: uuidv4(), name: newProjectName.trim(), description: '', columns: defaultColumns, tasks: [] };
    setProjects((prev: Project[]) => [...prev, newProj]);
    setCurrentProjectId(newProj.id);
    setAddProjectModal(false);
  };

  // Edit project
  const handleEditProject = () => {
    if (!currentProject) return;
    setEditProjectName(currentProject.name);
    setEditProjectDescription(currentProject.description || '');
    setEditProjectModal(true);
    setPendingDeleteProject(false);
  };
  const handleSaveProjectEdit = () => {
    setProjects((prev: Project[]) =>
      prev.map((p: Project) =>
        p.id === currentProjectId ? { ...p, name: editProjectName, description: editProjectDescription } : p
      )
    );
    setEditProjectModal(false);
  };
  const handleDeleteProject = () => {
    setPendingDeleteProject(true);
  };
  const confirmDeleteProject = () => {
    setProjects((prev: Project[]) => prev.filter((p: Project) => p.id !== currentProjectId));
    setEditProjectModal(false);
    setPendingDeleteProject(false);
    // Switch to another project or create a new one
    setTimeout(() => {
      if (projects.length > 1) {
        const next = projects.find((p) => p.id !== currentProjectId);
        if (next) setCurrentProjectId(next.id);
      } else {
        const newProj = { id: uuidv4(), name: 'New Project', description: '', columns: defaultColumns, tasks: [] };
        setProjects([newProj]);
        setCurrentProjectId(newProj.id);
      }
    }, 0);
  };
  const cancelDeleteProject = () => setPendingDeleteProject(false);

  const handleRenameColumn = (columnId: string, newTitle: string) => {
    setProjects((prev: Project[]) =>
      prev.map((p: Project) =>
        p.id === currentProjectId
          ? { ...p, columns: p.columns.map(col => col.id === columnId ? { ...col, title: newTitle } : col) }
          : p
      )
    );
  };
  const handleDeleteColumn = (columnId: string) => {
    setProjects((prev: Project[]) =>
      prev.map((p: Project) =>
        p.id === currentProjectId
          ? {
              ...p,
              columns: p.columns.filter(col => col.id !== columnId),
              tasks: p.tasks.filter(task => task.columnId !== columnId),
            }
          : p
      )
    );
  };

  const handleMarkTaskDone = (taskId: string) => {
    setProjects((prev: Project[]) =>
      prev.map((p: Project) =>
        p.id === currentProjectId
          ? { ...p, tasks: p.tasks.map(task => task.id === taskId ? { ...task, done: true } : task) }
          : p
      )
    );
  };

  const handleUndoTaskDone = (taskId: string) => {
    setProjects((prev: Project[]) =>
      prev.map((p: Project) =>
        p.id === currentProjectId
          ? { ...p, tasks: p.tasks.map(task => task.id === taskId ? { ...task, done: false } : task) }
          : p
      )
    );
  };

  if (!hydrated) {
    return (
      <div className="flex h-screen bg-gray-100 animate-pulse">
        <aside className="w-64 h-full bg-gray-50 border-r flex flex-col p-4">
          <div className="font-bold text-lg mb-6 bg-gray-200 h-6 w-32 rounded mb-4"></div>
          <nav className="flex-1">
            <ul className="space-y-2">
              <li className="bg-gray-200 h-4 w-20 rounded"></li>
              <li className="bg-gray-200 h-4 w-24 rounded"></li>
            </ul>
            <div className="mt-8">
              <div className="text-xs text-gray-400 mb-2">PROJECTS</div>
              <ul className="space-y-1">
                <li className="bg-gray-200 h-4 w-28 rounded"></li>
              </ul>
            </div>
          </nav>
          <div className="mt-auto text-xs text-gray-400">Your trial ends in 14 days</div>
        </aside>
        <div className="flex-1 flex flex-col">
          <header className="h-20 flex flex-col justify-center px-8 border-b bg-white">
            <div className="flex items-center gap-2">
              <div className="bg-gray-200 h-7 w-40 rounded"></div>
            </div>
            <div className="bg-gray-100 h-4 w-64 rounded mt-2"></div>
          </header>
          <div className="flex-1 flex flex-col relative p-8">
            <div className="flex gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-1 min-w-[280px] max-w-xs bg-gray-50 rounded-lg p-4 mx-2 flex flex-col gap-2">
                  <div className="bg-gray-200 h-5 w-24 rounded mb-4"></div>
                  <div className="bg-gray-200 h-16 w-full rounded mb-2"></div>
                  <div className="bg-gray-200 h-16 w-full rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        projects={projects}
        currentProjectId={currentProjectId}
        onSelectProject={setCurrentProjectId}
        onAddProject={handleAddProject}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          projectName={currentProject?.name || ''}
          projectDescription={currentProject?.description}
          onEditProject={handleEditProject}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-x-auto">
          <KanbanBoard
            columns={columns}
            tasks={tasks}
            onAddTask={() => setModalOpen(true)}
            onTaskClick={setSelectedTask}
            onDragEnd={handleDragEnd}
            onDeleteTask={handleDeleteTask}
            onAddColumn={handleAddColumn}
            onRenameColumn={handleRenameColumn}
            onDeleteColumn={handleDeleteColumn}
            onMarkTaskDone={handleMarkTaskDone}
            onUndoTaskDone={handleUndoTaskDone}
          />
        </div>
      </div>
      <AddTaskModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={handleAddTask} />
      <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} onUpdate={handleUpdateTask} />
      {/* Speedbump modal for delete confirmation */}
      {pendingDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg relative">
            <h2 className="text-lg font-bold mb-4">Delete Task?</h2>
            <p className="mb-4">Are you sure you want to delete <span className="font-semibold">{pendingDelete.title}</span>? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={cancelDeleteTask} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button onClick={confirmDeleteTask} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Project Modal */}
      {editProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form onSubmit={e => { e.preventDefault(); handleSaveProjectEdit(); }} className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg relative">
            <h2 className="text-lg font-bold mb-4">Edit Project</h2>
            <input
              className="w-full border p-2 rounded mb-3"
              placeholder="Project name"
              value={editProjectName}
              onChange={e => setEditProjectName(e.target.value)}
              autoFocus
              required
            />
            <textarea
              className="w-full border p-2 rounded mb-4"
              placeholder="Description (optional)"
              value={editProjectDescription}
              onChange={e => setEditProjectDescription(e.target.value)}
              rows={3}
            />
            <div className="flex justify-between items-center">
              <button type="button" onClick={handleDeleteProject} className="text-red-600 hover:underline">Delete Project</button>
              <div className="flex gap-2">
                <button type="button" onClick={() => setEditProjectModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </div>
            {/* Speedbump for project deletion */}
            {pendingDeleteProject && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-xs shadow-lg relative">
                  <h2 className="text-lg font-bold mb-4">Delete Project?</h2>
                  <p className="mb-4">Are you sure you want to delete <span className="font-semibold">{editProjectName}</span>? This action cannot be undone.</p>
                  <div className="flex justify-end gap-2">
                    <button onClick={cancelDeleteProject} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                    <button onClick={confirmDeleteProject} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
      {/* Modal for adding a new project */}
      {addProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form onSubmit={e => { e.preventDefault(); handleCreateProject(); }} className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg relative">
            <h2 className="text-lg font-bold mb-4">New Project</h2>
            <input
              className="w-full border p-2 rounded mb-4"
              placeholder="Project name"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              autoFocus
              required
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setAddProjectModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 