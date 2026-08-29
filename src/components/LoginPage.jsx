// ═══════════════════════════════════════════
// LoginPage — Quick user selection for demo
// ═══════════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { useStore } from '../store.js';
import { api } from '../api.js';
import { CustomSelect } from './CustomSelect.jsx';

export function LoginPage() {
  const setCurrentUser = useStore(s => s.setCurrentUser);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers().then(res => {
      setUsers(res.data);
      // Default to first pharmacist
      const pharmacist = res.data.find(u => u.role === 'APOTEKER');
      if (pharmacist) setSelectedUser(pharmacist.id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLogin = () => {
    const user = users.find(u => u.id === selectedUser);
    if (user) setCurrentUser(user);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  const userOptions = users.map(u => ({
    value: u.id,
    label: `${u.nama_lengkap} (${u.role})`
  }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/15 rounded-full mix-blend-multiply filter blur-[128px] opacity-70"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-[128px] opacity-70"></div>

      {/* Frosted Login Card */}
      <div className="relative z-10 bg-white/70 backdrop-blur-2xl w-full max-w-md rounded-[24px] shadow-2xl shadow-slate-200/50 border border-white/60 ring-1 ring-slate-900/5 p-10 flex flex-col items-center">
        <div className="flex items-center gap-3.5 mb-10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-primary to-primary-hover flex items-center justify-center shadow-[0_4px_12px_rgba(15,118,110,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <path d="M8 16h6l2-6 4 12 2-6h6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 tracking-tight leading-tight">PharmaXpress</div>
            <div className="text-sm text-slate-500 font-medium">RS Indriati Boyolali</div>
          </div>
        </div>

        <div className="w-full mb-8">
          {loading ? (
            <div className="text-center text-sm text-slate-500 font-medium animate-pulse">Memuat pengguna...</div>
          ) : (
            <CustomSelect
              label="Masuk sebagai"
              value={selectedUser}
              onChange={setSelectedUser}
              options={userOptions}
              placeholder="Pilih pengguna..."
            />
          )}
        </div>

        <button 
          className="w-full relative overflow-hidden bg-primary text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(15,118,110,0.25),inset_0_1px_0_rgba(255,255,255,0.15)] border border-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 ease-fluid disabled:opacity-50 disabled:cursor-not-allowed group"
          onClick={handleLogin} 
          disabled={!selectedUser || loading}
        >
          <span className="relative z-10 drop-shadow-sm">Masuk ke Sistem</span>
        </button>

        <div className="mt-8 text-[11px] tracking-widest text-center text-amber-700 bg-amber-50/80 backdrop-blur-sm px-4 py-2.5 rounded-full font-bold border border-amber-200/60 shadow-sm flex items-center justify-center gap-1.5 uppercase">
          <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Data Sintetis — Simulasi Sistem
        </div>
      </div>
    </div>
  );
}
