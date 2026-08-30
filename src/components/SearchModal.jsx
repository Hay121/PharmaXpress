// ═══════════════════════════════════════════
// SearchModal — Global fuzzy search (Ctrl+K)
// ═══════════════════════════════════════════
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useStore } from '../store.js';

export function SearchModal() {
  const inventory = useStore(s => s.inventory);
  const setSearchOpen = useStore(s => s.setSearchOpen);
  const [query, setQuery] = useState('');
  const [focusIdx, setFocusIdx] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const results = useMemo(() => {
    if (!query.trim()) return inventory.slice(0, 15);
    const lowerQ = query.toLowerCase();
    return inventory.filter(d => 
      (d.nama_dagang && d.nama_dagang.toLowerCase().includes(lowerQ)) ||
      (d.nama_generik && d.nama_generik.toLowerCase().includes(lowerQ)) ||
      (d.kode_obat && d.kode_obat.toLowerCase().includes(lowerQ)) ||
      (d.kode_bpjs && d.kode_bpjs.toLowerCase().includes(lowerQ)) ||
      (d.zat_aktif && d.zat_aktif.toLowerCase().includes(lowerQ))
    ).slice(0, 20);
  }, [query, inventory]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setFocusIdx(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setSearchOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIdx(prev => {
        const next = Math.min(prev + 1, results.length - 1);
        scrollToItem(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIdx(prev => {
        const next = Math.max(prev - 1, 0);
        scrollToItem(next);
        return next;
      });
    }
  };

  const scrollToItem = useCallback((idx) => {
    const container = resultsRef.current;
    if (!container) return;
    const items = container.querySelectorAll('.search-result');
    if (items[idx]) {
      items[idx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, []);

  const stockColor = (stok) => {
    if (stok <= 0) return '--out';
    if (stok <= 20) return '--low';
    return '--ok';
  };

  return (
    <div className="search-overlay" onClick={() => setSearchOpen(false)}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-modal__input-wrap">
          <span className="search-modal__icon">🔍</span>
          <input
            ref={inputRef}
            className="search-modal__input"
            type="text"
            placeholder="Cari obat (nama, generik, kode)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd style={{ fontSize: 10, padding: '2px 6px', background: 'var(--bg-elevated)', borderRadius: 3, border: '1px solid var(--border)', color: 'var(--text-tertiary)' }}>
            Esc
          </kbd>
        </div>

        <div className="search-modal__results" ref={resultsRef}>
          {results.length === 0 ? (
            <div className="search-modal__empty">
              Tidak ada hasil untuk "{query}"
            </div>
          ) : (
            results.map((drug, idx) => (
              <div
                key={drug.id}
                className={`search-result ${idx === focusIdx ? '--focused' : ''}`}
                onMouseEnter={() => setFocusIdx(idx)}
              >
                <div className="search-result__info">
                  <div className="search-result__name">
                    {drug.nama_dagang} {drug.kekuatan_dosis}
                  </div>
                  <div className="search-result__detail">
                    {drug.nama_generik || drug.zat_aktif} · {drug.bentuk_sediaan} · {drug.kode_obat}
                    {drug.lokasi_rak && ` · ${drug.lokasi_rak}`}
                    {drug.kode_bpjs && ` · BPJS: ${drug.kode_bpjs}`}
                  </div>
                </div>
                <div className={`search-result__stock ${stockColor(drug.stok_saat_ini)}`}>
                  {drug.stok_saat_ini} {drug.satuan?.toLowerCase()}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="search-modal__footer">
          <span>↑↓ navigasi</span>
          <span>· Esc tutup</span>
          <span style={{ marginLeft: 'auto', color: 'var(--text-tertiary)' }}>
            {inventory.length} obat terdaftar
          </span>
        </div>
      </div>
    </div>
  );
}
