// ═══════════════════════════════════════════
// SearchModal — Global fuzzy search (Ctrl+K)
// ═══════════════════════════════════════════
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useStore } from '../store.js';

export function SearchModal() {
  const inventory = useStore(s => s.inventory);
  const setSearchOpen = useStore(s => s.setSearchOpen);
  const [query, setQuery] = useState('');
  const [focusIdx, setFocusIdx] = useState(0);
  const inputRef = useRef(null);

  const fuse = useMemo(() => new Fuse(inventory, {
    keys: ['nama_dagang', 'nama_generik', 'zat_aktif', 'kode_obat', 'kode_bpjs'],
    threshold: 0.35,
    distance: 100,
    includeScore: true,
  }), [inventory]);

  const results = useMemo(() => {
    if (!query.trim()) return inventory.slice(0, 15);
    return fuse.search(query).slice(0, 20).map(r => r.item);
  }, [query, fuse, inventory]);

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
      setFocusIdx(Math.min(focusIdx + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIdx(Math.max(focusIdx - 1, 0));
    }
  };

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

        <div className="search-modal__results">
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
