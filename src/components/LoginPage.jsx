import React, { useState, useEffect } from 'react';
import { useStore } from '../store.js';
import { api } from '../api.js';
import { CustomSelect } from './CustomSelect.jsx';
import { EyeIcon, EyeSlashIcon, ExclamationTriangleIcon, ChevronDownIcon, BoltIcon, CircleStackIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

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

  const scrollToFeatures = () => {
    const featuresEl = document.getElementById('features-section');
    if (featuresEl) {
      featuresEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      
      {/* ── STEP 1: ASYMMETRICAL HERO SECTION ── */}
      <section className="min-h-screen w-full relative flex flex-col md:flex-row items-center bg-slate-900 bg-[url('/bg-hospital.jpg')] bg-cover bg-center bg-fixed bg-no-repeat bg-blend-overlay">
        
        {/* Dark Moody Overlay */}
        <div className="absolute inset-0 bg-slate-900/70 backdrop-brightness-75 z-0"></div>

        {/* Left Column: The Vision */}
        <div className="w-full md:w-1/2 z-10 px-10 md:px-20 text-left flex flex-col justify-center h-full pt-20 md:pt-0">
          <div className="flex items-center gap-4 mb-8">
            <img src="/logo-rs.png" alt="Logo RS Indriati" className="h-12 w-auto object-contain drop-shadow-sm filter invert brightness-0" />
            <div className="h-8 w-px bg-white/30"></div>
            <div className="text-white/80 font-semibold tracking-widest uppercase text-sm">KARS Accredited</div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight drop-shadow-lg">
            Revolusi Kecepatan<br/>Farmasi.
          </h1>
          <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-lg font-medium">
            PharmaXpress adalah mesin alur kerja farmasi berkinerja tinggi, dirancang secara eksklusif untuk RS Indriati Boyolali guna mengeliminasi latensi dan memaksimalkan keselamatan pasien.
          </p>
        </div>

        {/* Right Column: Floating Auth Card */}
        <div className="w-full md:w-1/2 z-10 flex justify-center items-center p-10 md:p-20 mt-10 md:mt-0">
          {/* Glassmorphism Auth Card */}
          <div className="relative w-full max-w-md p-10 bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl">
            
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight text-center">Otentikasi Sistem</h2>
              <p className="text-sm text-slate-600 text-center mt-2 mb-8 font-medium">Silakan masuk untuk mengakses infrastruktur inti.</p>
            </div>

            <div className={`space-y-5 transition-transform duration-200 ${loginError ? 'animate-shake' : ''}`}>
              
              {/* User Select */}
              <div className="w-full">
                {loading ? (
                  <div className="text-sm text-slate-500 font-medium animate-pulse h-[42px] flex items-center bg-white rounded-lg px-4 border border-slate-200">
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

        {/* ── STEP 2: SCROLL INDICATOR ── */}
        <button 
          onClick={scrollToFeatures}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/50 hover:text-white transition-colors p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
          aria-label="Scroll down to features"
        >
          <ChevronDownIcon className="w-8 h-8 animate-bounce" />
        </button>

      </section>

      {/* ── STEP 3: "ABOUT PHARMAXPRESS" SECTION ── */}
      <section id="features-section" className="min-h-screen bg-slate-50 py-24 px-10 md:px-20 flex flex-col items-center justify-center">
        
        <div className="max-w-5xl w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">Mengapa PharmaXpress?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Infrastruktur farmasi kelas atas yang dirancang untuk mengatasi antrean bottleneck melalui integrasi real-time dan otomasi cerdas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BoltIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">High-Velocity UI</h3>
              <p className="text-slate-600 leading-relaxed">
                Antarmuka nol-latensi dengan navigasi pintasan *keyboard* penuh (Ctrl+K, Alt+N) untuk memasukkan puluhan resep dalam hitungan menit tanpa menyentuh *mouse*.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <CircleStackIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Presisi Stok Real-Time</h3>
              <p className="text-slate-600 leading-relaxed">
                Manajemen inventori *real-time* cerdas. Mencegah kegagalan *out-of-stock* secara diam-diam dan merekomendasikan substitusi farmakologis instan.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheckIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Keamanan Data Pasien</h3>
              <p className="text-slate-600 leading-relaxed">
                Dibangun dengan enkripsi mutakhir dan protokol manajemen data sintetis untuk menjamin kepatuhan penuh terhadap standar akreditasi KARS dan privasi medis.
              </p>
            </div>

          </div>
        </div>
      </section>
      
    </div>
  );
}
