import React, { useState } from 'react';
import { Settings, Shield, User, Bell, Database, Smartphone, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export function PengaturanPage() {
  const [activeTab, setActiveTab] = useState('keamanan');
  
  // Dummy states for toggles
  const [toggles, setToggles] = useState({
    mfa: true,
    sound: true,
    autoLogout: false,
    darkTheme: false
  });

  const handleToggle = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Preferensi berhasil disimpan');
  };

  const tabs = [
    { id: 'profil', label: 'Profil Saya', icon: User },
    { id: 'akses', label: 'Manajemen Akses (RBAC)', icon: Shield },
    { id: 'keamanan', label: 'Keamanan & Sistem', icon: Settings },
    { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
  ];

  return (
    <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Pengaturan & RBAC
          </h1>
          <p className="text-slate-500 mt-1">Konfigurasi sistem, profil pengguna, dan matriks hak akses.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Side Tabs */}
          <div className="w-full md:w-72 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-4 text-sm font-semibold transition-colors border-l-4 text-left ${
                  activeTab === tab.id 
                    ? 'border-primary bg-teal-50 text-teal-700' 
                    : 'border-transparent text-slate-600 hover:bg-slate-50'
                }`}
              >
                <tab.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === tab.id ? 'text-teal-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 min-h-[500px]">
            
            {activeTab === 'keamanan' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Keamanan Akun & Sistem</h2>
                  <p className="text-sm text-slate-500 mt-1">Kelola preferensi keamanan infrastruktur aplikasi.</p>
                </div>
                <hr className="border-slate-100" />
                
                <div className="space-y-4">
                  {/* Toggle 1 */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Smartphone className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">Autentikasi 2 Langkah (MFA)</div>
                        <div className="text-sm text-slate-500">Wajibkan MFA untuk login dari perangkat baru.</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleToggle('mfa')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${toggles.mfa ? 'bg-primary' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${toggles.mfa ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Toggle 2 */}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Database className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">Auto-Logout (Sesi Idle)</div>
                        <div className="text-sm text-slate-500">Otomatis mengakhiri sesi jika tidak ada aktivitas selama 15 menit.</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleToggle('autoLogout')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${toggles.autoLogout ? 'bg-primary' : 'bg-slate-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${toggles.autoLogout ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'akses' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Manajemen Akses (RBAC)</h2>
                    <p className="text-sm text-slate-500 mt-1">Atur peran pengguna dan kendali hak akses ke seluruh modul sistem.</p>
                  </div>
                  <button className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-teal-700 transition-colors">
                    + Tambah Peran
                  </button>
                </div>
                <hr className="border-slate-100" />
                
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse bg-white">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Peran (Role)</th>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Tulis Resep</th>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Dispensing</th>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Ubah Inventori</th>
                        <th className="py-3 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Laporan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { role: 'Administrator', desc: 'Akses tak terbatas ke seluruh sistem', perms: [true, true, true, true] },
                        { role: 'Apoteker', desc: 'Fokus pada dispensing dan inventori', perms: [false, true, true, true] },
                        { role: 'Dokter', desc: 'Pembuatan resep klinis', perms: [true, false, false, true] },
                        { role: 'Asisten Apoteker', desc: 'Dukungan dispensing dasar', perms: [false, true, false, false] }
                      ].map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-5">
                            <div className="font-bold text-slate-900">{r.role}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{r.desc}</div>
                          </td>
                          {r.perms.map((p, j) => (
                            <td key={j} className="py-4 px-5 text-center">
                              <div className={`inline-flex w-6 h-6 rounded-md shadow-sm items-center justify-center ${p ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-300'}`}>
                                {p ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab !== 'keamanan' && activeTab !== 'akses' && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Shield className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">Tab {tabs.find(t => t.id === activeTab)?.label}</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm">Konten ini disimulasikan untuk keperluan antarmuka MVP.</p>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
