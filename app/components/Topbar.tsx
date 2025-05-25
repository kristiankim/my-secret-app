type TopbarProps = {
  projectName: string;
  projectDescription?: string;
  onEditProject: () => void;
};

export default function Topbar({ projectName, projectDescription, onEditProject }: TopbarProps) {
  return (
    <header className="h-20 flex flex-col justify-center px-8 border-b bg-white">
      <div className="flex items-center gap-2">
        <div className="text-xl font-semibold">{projectName}</div>
        <button
          className="text-gray-400 hover:text-blue-600 p-1 rounded"
          onClick={onEditProject}
          aria-label="Edit project"
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16.474 5.408a2.5 2.5 0 1 1 3.536 3.536L7.5 21H3v-4.5L16.474 5.408Z"/></svg>
        </button>
      </div>
      {projectDescription && (
        <div className="text-gray-500 text-sm mt-1">{projectDescription}</div>
      )}
    </header>
  );
} 