import { tools, ToolId } from '../App';

interface HomePageProps {
  onSelectTool: (tool: ToolId) => void;
}

export default function HomePage({ onSelectTool }: HomePageProps) {
  const categories = [...new Set(tools.map(t => t.category))];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 mb-6">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-sm text-indigo-300">100% Free • No Upload • All Local Processing</span>
        </div>
        <h1 className="text-5xl font-bold mb-4">
          <span className="gradient-text">PDF Master Pro</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          The most complete PDF toolkit. Merge, split, compress, convert, rotate, watermark, and more — all processed locally in your browser.
        </p>
        
        {/* Stats */}
        <div className="flex justify-center gap-8 mt-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo-400">12+</p>
            <p className="text-sm text-slate-500">PDF Tools</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">100%</p>
            <p className="text-sm text-slate-500">Private</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-cyan-400">∞</p>
            <p className="text-sm text-slate-500">Free Uses</p>
          </div>
        </div>
      </div>

      {/* Tools Grid by Category */}
      {categories.map(category => (
        <div key={category} className="mb-10">
          <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <span className="w-8 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent rounded"></span>
            {category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.filter(t => t.category === category).map(tool => (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className="tool-card glass-card glow-border rounded-2xl p-6 text-left group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  {tool.icon}
                </div>
                <h3 className="text-white font-semibold mb-1">{tool.name}</h3>
                <p className="text-sm text-slate-400">{tool.description}</p>
                <div className="mt-4 flex items-center gap-1 text-indigo-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Open Tool</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Features Section */}
      <div className="mt-16 glass-card rounded-3xl p-8 glow-border">
        <h2 className="text-2xl font-bold text-center mb-8 gradient-text">Why PDF Master Pro?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-green-500/20">
              🔒
            </div>
            <h3 className="text-white font-semibold mb-2">100% Private</h3>
            <p className="text-sm text-slate-400">All files are processed locally in your browser. Nothing is ever uploaded to any server.</p>
          </div>
          <div className="text-center p-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-blue-500/20">
              ⚡
            </div>
            <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
            <p className="text-sm text-slate-400">No waiting for uploads or server processing. Everything happens instantly in your browser.</p>
          </div>
          <div className="text-center p-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-purple-500/20">
              💎
            </div>
            <h3 className="text-white font-semibold mb-2">Completely Free</h3>
            <p className="text-sm text-slate-400">No limits, no subscriptions, no hidden fees. All tools are free to use forever.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
