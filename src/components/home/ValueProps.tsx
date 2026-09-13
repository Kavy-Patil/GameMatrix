import React from 'react';
import { Zap, ShieldCheck, Gamepad2, RefreshCw } from 'lucide-react';

export const ValueProps: React.FC = () => {
  const props = [
    {
      icon: <Zap className="w-6 h-6 text-cyan-400" />,
      title: 'Instant Digital Access',
      description: 'Streamlined activation workflow directly mapped to your target platform launcher.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      title: 'Curated Catalog Quality',
      description: 'Strict verification standards ensure every release is high-fidelity, tested, and authentic.',
    },
    {
      icon: <Gamepad2 className="w-6 h-6 text-purple-400" />,
      title: 'Cross-Ecosystem Simplicity',
      description: 'Find Steam, Epic Games, Rockstar, and DRM-free titles organized seamlessly in one place.',
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-amber-400" />,
      title: 'Active Library Tracking',
      description: 'Personalized local wishlist lets you save titles and organize your PC gaming backlog for enquiry.',
    },
  ];

  return (
    <section className="py-16 border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {props.map((item, index) => (
            <div
              key={index}
              className="flex flex-col p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 transition-all hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-1.5 font-display">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
