import React, { useEffect } from 'react';
import { Shield, ExternalLink } from 'lucide-react';

/**
 * Dedicated Redirect Bridge to Standalone Admin Portal
 * The admin control portal is decoupled from the customer site and runs exclusively
 * at /admin-portal/ to preserve security, role isolation, and dedicated portal workflows.
 */
export default function AdminDashboard() {
  useEffect(() => {
    // Automatically redirect to dedicated admin portal
    window.location.replace('/admin-portal/index.html');
  }, []);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-stone-50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E6DFD3] shadow-lg text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-[#4A2511] text-amber-300 flex items-center justify-center mx-auto shadow-md">
          <Shield className="w-8 h-8" />
        </div>
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#4A2511]">Shringar Admin Portal</h2>
          <p className="text-xs text-stone-500 mt-1">
            Redirecting to the standalone Operations & Executive Control Console…
          </p>
        </div>
        <div className="pt-2">
          <a
            href="/admin-portal/index.html"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-[#4A2511] hover:bg-[#34180A] text-[#FDFBF7] font-serif font-bold text-xs uppercase tracking-wider transition shadow"
          >
            <span>Open Dedicated Admin Portal</span>
            <ExternalLink className="w-4 h-4 text-amber-300" />
          </a>
        </div>
      </div>
    </div>
  );
}
