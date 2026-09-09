import { tools, ToolId } from '../App';

interface HomePageProps {
  onSelectTool: (tool: ToolId) => void;
}

export default function HomePage({ onSelectTool }: HomePageProps) {
  const categories = [...new Set(tools.map(t => t.category))];

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Hero Section */}
      <div className="text-center mb-12 sm:mb-16 pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] mb-6 sm:mb-8 backdrop-blur-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-[11px] sm:text-[12px] text-zinc-400 font-medium">Trusted by 50,000+ professionals worldwide</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6 leading-[1.1]">
          <span className="text-white">Every PDF tool</span>
          <br />
          <span className="gradient-text-accent">you'll ever need</span>
        </h1>
        
        <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-light px-4">
          The most powerful PDF toolkit. Merge, split, compress, convert, and more — all processed securely in your browser.
        </p>
        
        {/* Stats */}
        <div className="flex justify-center gap-6 sm:gap-8 md:gap-12 mt-8 sm:mt-10 md:mt-12">
          {[
            { value: '12+', label: 'PDF Tools', color: 'text-indigo-400' },
            { value: '100%', label: 'Private', color: 'text-purple-400' },
            { value: '0', label: 'Server Uploads', color: 'text-cyan-400' },
          ].map((stat, i) => (
            <div key={i} className="text-center px-2">
              <p className={`text-2xl sm:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] sm:text-[12px] text-zinc-500 font-medium mt-0.5 sm:mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="mb-12 sm:mb-16">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"></div>
          <h2 className="text-[11px] sm:text-[13px] font-bold text-zinc-500 uppercase tracking-[0.15em] whitespace-nowrap">All Tools</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 stagger-children">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="tool-card glass-card-hover rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 text-left group relative overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}></div>
              
              <div className="relative">
                <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-[18px] sm:text-[20px] mb-3 sm:mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  {tool.icon}
                </div>
                
                <h3 className="text-white font-semibold text-[14px] sm:text-[15px] mb-1">{tool.name}</h3>
                <p className="text-[12px] sm:text-[13px] text-zinc-500 leading-relaxed line-clamp-2">{tool.description}</p>
                
                <div className="mt-3 sm:mt-4 md:mt-5 flex items-center gap-1.5 sm:gap-2 text-indigo-400/70 group-hover:text-indigo-400 transition-all duration-300">
                  <span className="text-[11px] sm:text-[12px] font-semibold">Open Tool</span>
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="mb-12 sm:mb-16">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"></div>
          <h2 className="text-[11px] sm:text-[13px] font-bold text-zinc-500 uppercase tracking-[0.15em] whitespace-nowrap">Why Choose Us</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              icon: (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.333 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              ),
              title: 'Enterprise Security',
              description: 'Military-grade privacy. Your files are processed entirely in your browser — nothing is ever uploaded.',
              gradient: 'from-green-500 to-emerald-600',
            },
            {
              icon: (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              ),
              title: 'Lightning Fast',
              description: 'No waiting for uploads or server processing. Everything happens instantly using WebAssembly technology.',
              gradient: 'from-blue-500 to-indigo-600',
            },
            {
              icon: (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
              ),
              title: 'Unlimited & Free',
              description: 'No limits, no subscriptions, no hidden fees. Professional-grade tools available to everyone, forever.',
              gradient: 'from-purple-500 to-pink-600',
            },
          ].map((feature, i) => (
            <div key={i} className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-white/[0.04]">
              <div className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-3 sm:mb-4 shadow-lg`}>
                {feature.icon}
              </div>
              <h3 className="text-white font-semibold text-[14px] sm:text-[15px] mb-1.5 sm:mb-2">{feature.title}</h3>
              <p className="text-[12px] sm:text-[13px] text-zinc-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl glass-card border border-white/[0.04] p-6 sm:p-8 md:p-10 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/[0.05] via-purple-600/[0.03] to-transparent"></div>
        <div className="relative">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">Ready to transform your PDFs?</h2>
          <p className="text-zinc-400 text-[13px] sm:text-[14px] mb-4 sm:mb-6 max-w-md mx-auto px-4">Start using our professional PDF tools right now. No signup required.</p>
          <button
            onClick={() => onSelectTool('merge')}
            className="btn-primary px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-white font-semibold text-[13px] sm:text-[14px] inline-flex items-center gap-2"
          >
            <span>Get Started Free</span>
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
