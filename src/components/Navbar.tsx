import { Link, useLocation } from 'react-router-dom';
import { Plus, Anchor } from 'lucide-react';
import { cn } from '../lib/utils.js';

export default function Navbar() {
  const loc = useLocation();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-cream-100/85 border-b border-cream-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-500 to-ocean-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Anchor size={20} />
          </span>
          <div>
            <div className="font-title text-xl font-bold text-ocean-800 leading-tight">
              拼鱼团 <span className="text-coral-500">🐟</span>
            </div>
            <div className="text-[10px] text-ocean-500 -mt-0.5">弄堂口接龙管理</div>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              loc.pathname === '/' ? 'bg-ocean-100 text-ocean-800' : 'text-ocean-600 hover:bg-cream-200'
            )}
          >
            接龙大厅
          </Link>
          <Link
            to="/create"
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all',
              loc.pathname === '/create'
                ? 'bg-coral-500 text-white shadow-md'
                : 'bg-coral-500 text-white hover:bg-coral-600 shadow hover:shadow-md'
            )}
          >
            <Plus size={16} />
            发起接龙
          </Link>
        </nav>
      </div>
    </header>
  );
}
