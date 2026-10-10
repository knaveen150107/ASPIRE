import React from 'react';
import { Shield, Database, Cpu, Heart } from 'lucide-react';
import AspireLogo from './AspireLogo';

export const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-slate-950/90 py-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <AspireLogo size="md" className="[&_span:first-child]:text-white [&_span:last-child]:text-slate-400" />
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              AI-Powered Student Placement & Career Intelligence Platform. Discover opportunities, bridge skill gaps, and accelerate hiring.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">AI Intelligence</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-blue-400 cursor-pointer transition-colors">Role Eligibility Engine</span></li>
              <li><span className="hover:text-blue-400 cursor-pointer transition-colors">AI Mock Assessment</span></li>
              <li><span className="hover:text-blue-400 cursor-pointer transition-colors">Skill Gap Radar</span></li>
              <li><span className="hover:text-blue-400 cursor-pointer transition-colors">Career Milestone Roadmaps</span></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Technology Stack</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-1.5"><Cpu className="w-3.5 h-3.5 text-blue-400" /><span>FastAPI REST Framework</span></li>
              <li className="flex items-center space-x-1.5"><Database className="w-3.5 h-3.5 text-emerald-400" /><span>MongoDB Atlas Cluster</span></li>
              <li className="flex items-center space-x-1.5"><Shield className="w-3.5 h-3.5 text-purple-400" /><span>OAuth2 JWT Security</span></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">System Architecture</h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Database Engine:</span>
                <span className="font-semibold text-emerald-400">MongoDB Atlas</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">API Status:</span>
                <span className="font-semibold text-blue-400">REST v1.0.0</span>
              </div>
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} ASPIRE Intelligence Platform. Built for placements & careers.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-slate-400">
              <span>Made with</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>for every aspiring student</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
