import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { SEO } from '../components/common/SEO';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <SEO title="Page Not Found (404)" description="The requested page could not be found on GameVault." />
      <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <div className="text-sm font-mono text-cyan-400 uppercase tracking-widest mb-2 font-bold">
        Error 404
      </div>

      <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display mb-3">
        Page Not Found in Vault
      </h1>

      <p className="text-sm sm:text-base text-slate-400 max-w-md mb-8 leading-relaxed">
        The route you are looking for has either been moved, deleted, or does not exist in the current GameVault index.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link to="/">
          <Button variant="primary" size="md" icon={<Home className="w-4 h-4" />}>
            Return Home
          </Button>
        </Link>
        <Link to="/store">
          <Button variant="secondary" size="md" icon={<ArrowLeft className="w-4 h-4" />}>
            Browse Store
          </Button>
        </Link>
      </div>
    </div>
  );
};
