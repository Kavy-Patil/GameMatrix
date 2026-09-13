import React from 'react';
import { Compass, MousePointerClick, MessageSquarePlus, UserCheck, KeyRound, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    step: '01',
    title: 'Browse',
    description: 'Explore the available game catalog with deep filters across platforms, genres, and developer showcases.',
    icon: Compass,
    accent: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30',
  },
  {
    step: '02',
    title: 'Choose',
    description: 'Open the game you are interested in, review verified system specs, screenshots, and compatible launcher editions.',
    icon: MousePointerClick,
    accent: 'from-purple-500/20 to-indigo-500/10 text-purple-400 border-purple-500/30',
  },
  {
    step: '03',
    title: 'Enquire',
    description: 'Submit a booking/enquiry request with your preferred contact channel (WhatsApp, Email, or Phone).',
    icon: MessageSquarePlus,
    accent: 'from-teal-500/20 to-emerald-500/10 text-teal-400 border-teal-500/30',
  },
  {
    step: '04',
    title: 'Confirm',
    description: 'We manually contact you to confirm the request, answer specific edition questions, and verify compatibility.',
    icon: UserCheck,
    accent: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
  },
  {
    step: '05',
    title: 'Complete',
    description: 'Payment and delivery are arranged manually with our support desk. No automated charges or unknown recurring fees.',
    icon: KeyRound,
    accent: 'from-rose-500/20 to-pink-500/10 text-rose-400 border-rose-500/30',
  },
];

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 border-t border-white/[0.06] relative scroll-mt-20">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-widest mb-3">
            Transparent Workflow
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
            HOW GAMEVAULT WORKS
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
            GameVault is a curated digital showcase with manual enquiry handling. Final confirmation, payment, and digital key delivery are arranged directly with you.
          </p>
        </div>

        {/* 5 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative p-6 rounded-2xl bg-[#0f1423]/90 border border-white/[0.08] hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800 group-hover:text-cyan-400 transition-colors">
                      Step {item.step}
                    </span>
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br border flex items-center justify-center ${item.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white font-display mb-2 group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Phase {index + 1} of 5</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Callout */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-purple-950/30 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-base font-bold text-white">
              Ready to find your next favorite title?
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Browse through our 70 verified PC titles and submit an enquiry in seconds.
            </p>
          </div>
          <Link
            to="/store"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all shrink-0"
          >
            BROWSE STORE CATALOG
          </Link>
        </div>
      </div>
    </section>
  );
};
