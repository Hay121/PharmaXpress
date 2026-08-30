import React, { useState, useEffect } from 'react';
import { useStore } from '../store.js';
import { api } from '../api.js';
import { CustomSelect } from './CustomSelect.jsx';
import { EyeIcon, EyeSlashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export function LoginPage() {
  const setCurrentUser = useStore(s => s.setCurrentUser);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState(false);

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
    if (!selectedUser || isSubmitting) return;
    
    setIsSubmitting(true);
    setLoginError(false);
    
    // Simulate network latency & authentication
    setTimeout(() => {
      if (password !== 'admin123') {
        setLoginError(true);
        setIsSubmitting(false);
      } else {
        const user = users.find(u => u.id === selectedUser);
        if (user) setCurrentUser(user);
      }
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  const userOptions = users.map(u => ({
    value: u.id,
    label: `${u.nama_lengkap} (${u.role})`
  }));

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-[url('/bghospital.jpg')] bg-cover bg-center overflow-hidden">
      
      {/* Dark Overlay for Cinematic Contrast */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-brightness-75"></div>

      {/* Glassmorphism Auth Card */}
      <div className="z-10 relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-black/50 border border-white/20 w-full max-w-md p-8 mx-4">
        
        {/* Official Hospital Logo */}
        <img 
          src="/logo-rs.png" 
          alt="Logo RS Indriati" 
          className="h-16 w-auto object-contain mx-auto mb-6 drop-shadow-sm" 
        />
        
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Otentikasi Sistem</h2>
          <p className="text-sm text-slate-500">Silakan masuk untuk mengakses sistem Farmasi.</p>
        </div>

        <div className={`space-y-5 transition-transform duration-200 ${loginError ? 'animate-shake' : ''}`}>
          
          {/* User Select */}
          <div className="w-full">
            {loading ? (
              <div className="text-sm text-slate-500 font-medium animate-pulse h-[42px] flex items-center bg-slate-50 rounded-lg px-4 border border-slate-200">
                Memuat data pengguna...
              </div>
            ) : (
              <CustomSelect
                label="Identitas Pengguna"
                value={selectedUser}
                onChange={(val) => { setSelectedUser(val); setLoginError(false); }}
                options={userOptions}
                placeholder="Pilih pengguna..."
              />
            )}
          </div>

          {/* Password Field */}
          <div className="w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kata Sandi</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan kata sandi (admin123)"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(false); }}
                onKeyDown={handleKeyDown}
                className={`w-full bg-white border ${loginError ? 'border-red-400 ring-4 ring-red-500/10' : 'border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10'} rounded-lg px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all`}
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-4 h-4" />
                ) : (
                  <EyeIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {/* Dynamic Error Message */}
            {loginError && (
              <div className="mt-2 text-sm text-red-600 flex items-center gap-1.5 font-medium animate-in fade-in slide-in-from-top-1">
                <ExclamationTriangleIcon className="w-4 h-4" />
                Kata sandi tidak valid. Silakan coba lagi.
              </div>
            )}
          </div>

        </div>

        <div className="mt-8">
          <button 
            className="w-full relative overflow-hidden bg-primary text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_4px_14px_0_rgba(15,118,110,0.25),inset_0_1px_0_rgba(255,255,255,0.15)] border border-primary/20 hover:bg-primary-hover active:scale-[0.98] transition-all duration-200 ease-fluid disabled:opacity-70 disabled:cursor-not-allowed group flex items-center justify-center gap-2"
            onClick={handleLogin} 
            disabled={!selectedUser || loading || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memverifikasi...
              </>
            ) : (
              <span className="relative z-10 drop-shadow-sm">Masuk ke Sistem</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
