type SidebarProps = {
  projects: { id: string; name: string }[];
  currentProjectId: string;
  onSelectProject: (id: string) => void;
  onAddProject: () => void;
};

export default function Sidebar({ projects, currentProjectId, onSelectProject, onAddProject }: SidebarProps) {
  return (
    <aside className="w-64 h-full bg-gray-50 border-r flex flex-col p-4">
      <div className="font-bold text-lg mb-6">Kristian's team</div>
      <nav className="flex-1">
        <ul className="space-y-2">
          <li className="text-gray-700 font-medium">Inbox</li>
          <li className="text-gray-700 font-medium">Overview</li>
        </ul>
        <div className="mt-8">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-400">PROJECTS</div>
            <button
              className="text-gray-400 hover:text-blue-600 p-1 rounded"
              onClick={onAddProject}
              aria-label="Add project"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5"/></svg>
            </button>
          </div>
          <ul className="space-y-1">
            {projects.map((project) => (
              <li
                key={project.id}
                className={`font-semibold cursor-pointer px-2 py-1 rounded ${project.id === currentProjectId ? 'bg-blue-100 text-blue-700' : 'text-gray-900 hover:bg-gray-100'}`}
                onClick={() => onSelectProject(project.id)}
              >
                {project.name}
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="mt-auto text-xs text-gray-400">Your trial ends in 14 days</div>
    </aside>
  );
} 