import { ReactNode, useEffect, useRef } from 'react';
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
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.tool-card');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`);
        (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`);
      });
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/[0.03] rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/[0.03] rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-600/[0.02] rounded-full blur-[150px]"></div>
      </div>

      {/* Noise Overlay */}
      <div className="noise-overlay"></div>

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-[280px]' : 'w-0'} transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden flex-shrink-0 relative z-10`}>
        <div className="w-[280px] h-full flex flex-col bg-zinc-950/80 backdrop-blur-2xl border-r border-white/[0.04]">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-white/[0.04]">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-zinc-950"></div>
              </div>
              <div>
                <h1 className="text-[15px] font-bold text-white tracking-tight">PDF Master Pro</h1>
                <p className="text-[11px] text-zinc-500 font-medium">Complete PDF Toolkit</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <button
              onClick={() => onToolChange('home')}
              className={`sidebar-item w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left mb-1 ${currentTool === 'home' ? 'active text-white' : 'text-zinc-400'}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentTool === 'home' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-white/[0.03] text-zinc-500'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <span className="text-[13px] font-medium">Dashboard</span>
            </button>

            <div className="my-4 mx-3 h-px bg-white/[0.04]"></div>

            {categories.map(category => (
              <div key={category} className="mb-4">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.1em] px-3.5 mb-2">{category}</p>
                <div className="space-y-0.5">
                  {tools.filter(t => t.category === category).map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => onToolChange(tool.id)}
                      className={`sidebar-item w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-left group ${currentTool === tool.id ? 'active text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[13px] transition-all ${currentTool === tool.id ? 'bg-indigo-500/15' : 'bg-white/[0.02] group-hover:bg-white/[0.05]'}`}>
                        {tool.icon}
                      </div>
                      <span className="text-[13px] font-medium">{tool.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/[0.04]">
            <div className="rounded-xl bg-gradient-to-br from-indigo-500/[0.08] to-purple-500/[0.08] border border-indigo-500/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-md bg-green-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.333 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <span className="text-[11px] font-semibold text-zinc-300">100% Secure</span>
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">All processing done locally. Your files never leave your device.</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main ref={mainRef} className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Top Bar */}
        <header className="h-[60px] flex items-center px-6 gap-4 flex-shrink-0 bg-zinc-950/40 backdrop-blur-xl border-b border-white/[0.04]">
          <button
            onClick={onToggleSidebar}
            className="w-9 h-9 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] flex items-center justify-center transition-all"
          >
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
          
          {currentTool !== 'home' && (
            <div className="flex items-center gap-3 animate-fade-in-up">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/10 flex items-center justify-center text-sm">
                {tools.find(t => t.id === currentTool)?.icon}
              </div>
              <div>
                <h2 className="text-[14px] font-semibold text-white leading-tight">{tools.find(t => t.id === currentTool)?.name}</h2>
                <p className="text-[11px] text-zinc-500">{tools.find(t => t.id === currentTool)?.description}</p>
              </div>
            </div>
          )}

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/[0.07] border border-green-500/10">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-[11px] text-green-400/80 font-medium">All systems operational</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
