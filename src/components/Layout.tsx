import { ReactNode } from 'react';
import { tools, ToolId } from '../App';

interface LayoutProps {
  children: ReactNode;
  currentTool: ToolId;
  onToolChange: (tool: ToolId) => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Layout({ children, currentTool, onToolChange, sidebarOpen, onToggleSidebar }: LayoutProps) {
  const categories = [...new Set(tools.map(t => t.category))];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0`}>
        <div className="w-72 h-full glass-card border-r border-indigo-500/20 flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/30">
                📋
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">PDF Master Pro</h1>
                <p className="text-xs text-slate-400">Complete PDF Toolkit</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-4">
            <button
              onClick={() => onToolChange('home')}
              className={`sidebar-item w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left ${currentTool === 'home' ? 'active bg-indigo-500/15 border-r-3 border-indigo-500' : 'text-slate-300'}`}
            >
              <span className="text-xl">🏠</span>
              <span className="font-medium">Home</span>
            </button>

            {categories.map(category => (
              <div key={category}>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-2">{category}</p>
                <div className="space-y-1">
                  {tools.filter(t => t.category === category).map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => onToolChange(tool.id)}
                      className={`sidebar-item w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm ${currentTool === tool.id ? 'active bg-indigo-500/15 border-r-3 border-indigo-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      <span>{tool.icon}</span>
                      <span>{tool.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-indigo-500/20">
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-xs text-slate-400">All processing done locally</p>
              <p className="text-xs text-indigo-400 font-medium mt-1">🔒 100% Private & Secure</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 glass-card border-b border-indigo-500/20 flex items-center px-6 gap-4 flex-shrink-0">
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          
          {currentTool !== 'home' && (
            <div className="flex items-center gap-2">
              <span className="text-xl">{tools.find(t => t.id === currentTool)?.icon}</span>
              <h2 className="text-lg font-semibold text-white">{tools.find(t => t.id === currentTool)?.name}</h2>
            </div>
          )}

          <div className="ml-auto flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
              <span className="text-xs text-green-400 font-medium">● All Systems Online</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
