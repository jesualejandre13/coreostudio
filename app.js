import { createElement as h, useState, useEffect, useRef, Fragment } from 'react';
import { createRoot } from 'react-dom/client';

// ─── STORAGE ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = "coreo_app_v2";
const loadData = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultData(); } catch { return defaultData(); } };
const saveData = (d) => localStorage.setItem(STORAGE_KEY, JSON.stringify(d));

const defaultData = () => ({
  pasos: [
    { id: "p1", nombre: "Paso Básico", estilo: "Cumbia", tipo: "suelto", descripcion: "Pierna derecha al lado, regresa. Pierna izquierda al lado, regresa. Ritmo 1-2-3-4.", video: "", publicado: true },
    { id: "p2", nombre: "Vuelta Derecha", estilo: "Salsa", tipo: "suelto", descripcion: "En tiempo 1, giro a la derecha sobre el pie izquierdo. Tiempos 2-3 recuperar. Brazos abiertos.", video: "", publicado: true },
    { id: "p3", nombre: "Dile que No", estilo: "Salsa", tipo: "pareja", descripcion: "Líder guía con mano derecha hacia la derecha, seguidora pasa por enfrente. Cuenta: 1-2-3, 5-6-7.", video: "", publicado: true },
    { id: "p4", nombre: "Merengue Base", estilo: "Merengue", tipo: "suelto", descripcion: "Paso lateral izquierda-derecha con cadera. Un paso por tiempo, sin pausa.", video: "", publicado: true },
    { id: "p5", nombre: "Cumbia Lateral", estilo: "Cumbia", tipo: "pareja", descripcion: "Tomados de mano, paso lateral alternado. Líder va a la derecha, seguidora espeja.", video: "", publicado: true },
  ],
  coreos: [],
});

const ESTILOS = ["Cumbia", "Salsa", "Merengue"];
const TIPOS = ["suelto", "pareja"];
const uid = () => Math.random().toString(36).slice(2, 9);
const estiloTag  = (e) => ({ Cumbia: "tag-cumbia", Salsa: "tag-salsa", Merengue: "tag-merengue" }[e] || "tag-cumbia");
const estiloColor = (e) => ({ Cumbia: "#e67e22", Salsa: "#c0392b", Merengue: "#27ae60" }[e] || "#d4a843");
const fmt = (s) => { if (!s || isNaN(s)) return "0:00"; const m = Math.floor(s/60), sec = Math.floor(s%60); return `${m}:${sec.toString().padStart(2,"0")}`; };

// ─── INJECT CSS ───────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
:root{
  --bg:#0e0c0a;--surface:#161210;--card:#1e1a15;--card2:#252019;--border:#2a2318;
  --accent:#d4a843;--adim:rgba(212,168,67,0.12);--red:#c0392b;
  --text:#f0ebe3;--muted:#7a7060;
  --cumbia:#e67e22;--salsa:#c0392b;--merengue:#27ae60;
  --nh:64px;--sb:env(safe-area-inset-bottom,0px);
}
html{height:100%;overflow:hidden;}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);height:100%;overflow:hidden;user-select:none;-webkit-user-select:none;}
#root{height:100vh;display:flex;flex-direction:column;overflow:hidden;}
.screen{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding-bottom:calc(var(--nh) + var(--sb) + 16px);}
.page{padding:18px 14px 6px;max-width:680px;margin:0 auto;}
.bnav{position:fixed;bottom:0;left:0;right:0;height:calc(var(--nh) + var(--sb));padding-bottom:var(--sb);background:var(--surface);border-top:1px solid var(--border);display:flex;z-index:50;}
.ntab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;cursor:pointer;border:none;background:none;color:var(--muted);padding:0;position:relative;}
.ntab:active{background:rgba(255,255,255,0.04);}
.ntab.on{color:var(--accent);}
.nicon{font-size:1.35rem;line-height:1;}
.nlabel{font-size:0.6rem;font-weight:500;letter-spacing:0.04em;}
.nbadge{position:absolute;top:6px;right:calc(50% - 20px);background:var(--accent);color:#0e0c0a;font-size:0.58rem;font-weight:700;border-radius:20px;padding:1px 5px;}
.topbar{display:flex;align-items:center;gap:10px;padding:14px 14px 0;max-width:680px;margin:0 auto;}
.tback{width:38px;height:38px;border-radius:50%;background:var(--card);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:1.1rem;cursor:pointer;color:var(--text);flex-shrink:0;}
.ttitle{font-family:'Playfair Display',serif;font-size:1.1rem;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.ptitle{font-family:'Playfair Display',serif;font-size:1.65rem;margin-bottom:3px;}
.psub{font-size:0.76rem;color:var(--muted);margin-bottom:18px;}
.slabel{font-size:0.63rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);margin:18px 0 9px;display:flex;align-items:center;gap:8px;}
.slabel::after{content:'';flex:1;height:1px;background:var(--border);}
.btn{border:none;border-radius:10px;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500;display:inline-flex;align-items:center;gap:6px;transition:all .15s;white-space:nowrap;}
.btn:active{transform:scale(0.95);}
.bp{background:var(--accent);color:#0e0c0a;font-size:0.88rem;padding:11px 18px;}
.bg{background:var(--card);color:var(--text);border:1px solid var(--border);font-size:0.82rem;padding:10px 14px;}
.bg:active{background:var(--card2);}
.bd{background:var(--red);color:#fff;font-size:0.82rem;padding:10px 14px;}
.bsm{padding:7px 12px;font-size:0.76rem;border-radius:8px;}
.bfull{width:100%;justify-content:center;padding:13px;}
.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:10px;cursor:pointer;}
.card:active{border-color:#3e3630;}
.ctitle{font-size:0.98rem;font-weight:600;margin-bottom:4px;}
.cmeta{font-size:0.74rem;color:var(--muted);display:flex;gap:10px;flex-wrap:wrap;align-items:center;}
.tag{display:inline-block;padding:3px 9px;border-radius:20px;font-size:0.68rem;font-weight:500;}
.tag-cumbia{background:rgba(230,126,34,0.15);color:var(--cumbia);}
.tag-salsa{background:rgba(192,57,43,0.15);color:var(--salsa);}
.tag-merengue{background:rgba(39,174,96,0.15);color:var(--merengue);}
.tag-pareja{background:rgba(142,68,173,0.15);color:#9b59b6;}
.tag-suelto{background:rgba(52,152,219,0.15);color:#3498db;}
.fg{margin-bottom:12px;}
label{display:block;font-size:0.7rem;font-weight:500;color:var(--muted);margin-bottom:5px;letter-spacing:0.06em;text-transform:uppercase;}
input,textarea,select{background:var(--surface);border:1.5px solid var(--border);border-radius:10px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:0.9rem;padding:11px 13px;width:100%;outline:none;transition:border-color .15s;-webkit-appearance:none;}
input:focus,textarea:focus,select:focus{border-color:var(--accent);}
select option{background:#1e1a15;}
textarea{resize:none;line-height:1.6;}
.r2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.empty{text-align:center;padding:44px 20px;color:var(--muted);}
.eicon{font-size:2.6rem;margin-bottom:10px;opacity:.4;}
.etext{font-size:0.82rem;line-height:1.6;}
.mbk{position:fixed;inset:0;background:rgba(0,0,0,0.78);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:flex-end;justify-content:center;}
.modal{background:var(--card);border:1px solid var(--border);border-radius:20px 20px 0 0;width:100%;max-width:680px;max-height:88vh;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:18px 18px calc(18px + var(--sb));animation:sup .24s ease;}
@keyframes sup{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
.mhandle{width:34px;height:4px;background:var(--border);border-radius:2px;margin:0 auto 14px;}
.mtitle{font-family:'Playfair Display',serif;font-size:1.15rem;color:var(--accent);margin-bottom:14px;}
.mfoot{display:flex;gap:8px;margin-top:14px;padding-top:12px;border-top:1px solid var(--border);flex-wrap:wrap;}
.mfoot .btn{flex:1;justify-content:center;min-width:80px;}
.player{background:var(--card2);border:1px solid var(--border);border-radius:16px;padding:14px;margin-bottom:14px;}
.psong{font-size:0.88rem;font-weight:500;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.partist{font-size:0.73rem;color:var(--muted);margin-bottom:10px;}
.pbar-wrap{width:100%;height:6px;background:var(--border);border-radius:3px;cursor:pointer;margin-bottom:5px;position:relative;}
.pbar-fill{height:100%;border-radius:3px;background:var(--accent);pointer-events:none;}
.ptimes{display:flex;justify-content:space-between;font-size:0.66rem;color:var(--muted);margin-bottom:12px;}
.pcontrols{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:12px;}
.playbtn{width:50px;height:50px;border-radius:50%;background:var(--accent);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.25rem;color:#0e0c0a;}
.playbtn:active{transform:scale(0.9);}
.playbtn:disabled{opacity:0.4;}
.skipbtn{width:38px;height:38px;border-radius:50%;background:var(--card);border:1px solid var(--border);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.95rem;color:var(--text);}
.pupload{display:flex;align-items:center;gap:10px;padding:11px 13px;background:var(--surface);border:1.5px dashed var(--border);border-radius:12px;cursor:pointer;color:var(--muted);font-size:0.8rem;}
.pupload:active{border-color:var(--accent);}
.titem{display:flex;gap:10px;align-items:flex-start;padding:11px 12px;background:var(--card);border:1px solid var(--border);border-radius:12px;margin-bottom:8px;}
.tcircle{width:32px;height:32px;border-radius:50%;background:var(--adim);border:1.5px solid var(--accent);color:var(--accent);font-size:0.75rem;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.tbody{flex:1;min-width:0;}
.tlabel{font-size:0.85rem;font-weight:500;margin-bottom:2px;}
.tdesc{font-size:0.73rem;color:var(--muted);margin-bottom:5px;}
.assignbtn{width:100%;padding:8px;background:var(--adim);border:1px dashed var(--accent);border-radius:8px;color:var(--accent);font-size:0.76rem;cursor:pointer;text-align:center;margin-top:5px;}
.passigned{display:flex;align-items:center;gap:7px;padding:6px 9px;background:var(--surface);border-radius:8px;margin-top:5px;font-size:0.78rem;}
.paname{flex:1;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.delbtn{width:24px;height:24px;border-radius:50%;background:rgba(192,57,43,0.15);border:none;color:var(--red);display:flex;align-items:center;justify-content:center;font-size:0.76rem;cursor:pointer;flex-shrink:0;}
.pcard{background:var(--card);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:10px;cursor:pointer;}
.pcard:active{border-color:#3e3630;}
.paccent{height:3px;}
.pthumb{width:100%;aspect-ratio:16/9;background:var(--surface);display:flex;align-items:center;justify-content:center;font-size:2rem;color:var(--muted);overflow:hidden;}
.pthumb img{width:100%;height:100%;object-fit:cover;}
.pbody{padding:11px 13px;}
.chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;margin-bottom:12px;}
.chips::-webkit-scrollbar{display:none;}
.chip{padding:6px 13px;border-radius:20px;white-space:nowrap;border:1px solid var(--border);background:transparent;color:var(--muted);font-size:0.76rem;cursor:pointer;flex-shrink:0;}
.chip.on{border-color:var(--accent);color:var(--accent);background:var(--adim);}
.slist{display:flex;flex-direction:column;gap:5px;max-height:48vh;overflow-y:auto;-webkit-overflow-scrolling:touch;}
.sitem{padding:11px 13px;border-radius:10px;border:1.5px solid var(--border);cursor:pointer;}
.sitem:active{background:var(--card2);}
.sitem.sel{border-color:var(--accent);background:var(--adim);}
.siname{font-size:0.86rem;font-weight:500;margin-bottom:3px;}
.vp{width:100%;aspect-ratio:16/9;background:var(--surface);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:0.78rem;margin-bottom:12px;overflow:hidden;border:1px dashed var(--border);}
.vp img{width:100%;height:100%;object-fit:cover;}
.fab{position:fixed;bottom:calc(var(--nh) + var(--sb) + 14px);right:18px;width:50px;height:50px;border-radius:50%;background:var(--accent);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:1.4rem;color:#0e0c0a;box-shadow:0 4px 18px rgba(212,168,67,0.35);z-index:40;}
.fab:active{transform:scale(0.9);}
@keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fu .22s ease forwards;}
.row{display:flex;gap:8px;align-items:center;}
hr{border:none;border-top:1px solid var(--border);margin:12px 0;}
`;

if (!document.getElementById('coreostudio-css')) {
  const style = document.createElement('style');
  style.id = 'coreostudio-css';
  style.textContent = css;
  document.head.appendChild(style);
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, footer }) =>
  h('div', { className: 'mbk', onClick: e => e.target === e.currentTarget && onClose() },
    h('div', { className: 'modal' },
      h('div', { className: 'mhandle' }),
      h('div', { className: 'mtitle' }, title),
      children,
      footer && h('div', { className: 'mfoot' }, footer)
    )
  );

// ─── AUDIO PLAYER ─────────────────────────────────────────────────────────────
const AudioPlayer = ({ cancion, artista, audioUrl, onUpload }) => {
  const ref = useRef(null);
  const fileRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const a = ref.current; if (!a) return;
    const onT = () => setCur(a.currentTime);
    const onL = () => setDur(a.duration);
    const onE = () => setPlaying(false);
    a.addEventListener('timeupdate', onT);
    a.addEventListener('loadedmetadata', onL);
    a.addEventListener('ended', onE);
    return () => { a.removeEventListener('timeupdate', onT); a.removeEventListener('loadedmetadata', onL); a.removeEventListener('ended', onE); };
  }, [audioUrl]);

  const toggle = () => { const a = ref.current; if (!a || !audioUrl) return; if (playing) { a.pause(); setPlaying(false); } else { a.play(); setPlaying(true); } };
  const seek = (e) => { const a = ref.current; if (!a || !dur) return; const rect = e.currentTarget.getBoundingClientRect(); const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left; a.currentTime = Math.max(0, Math.min(dur, (x / rect.width) * dur)); };
  const skip = (s) => { const a = ref.current; if (!a) return; a.currentTime = Math.max(0, Math.min(dur, a.currentTime + s)); };
  const handleFile = (e) => { const f = e.target.files[0]; if (!f) return; onUpload(f); e.target.value = ''; };
  const pct = dur ? (cur / dur) * 100 : 0;

  return h('div', { className: 'player' },
    audioUrl && h('audio', { ref, src: audioUrl, preload: 'metadata' }),
    h('div', { className: 'psong' }, cancion || 'Sin canción'),
    h('div', { className: 'partist' }, artista || '—'),
    h('div', { className: 'pbar-wrap', onClick: seek, onTouchStart: seek },
      h('div', { className: 'pbar-fill', style: { width: `${pct}%` } })
    ),
    h('div', { className: 'ptimes' }, h('span', null, fmt(cur)), h('span', null, fmt(dur))),
    h('div', { className: 'pcontrols' },
      h('button', { className: 'skipbtn', onClick: () => skip(-10) }, '⏪'),
      h('button', { className: 'playbtn', onClick: toggle, disabled: !audioUrl }, playing ? '⏸' : '▶'),
      h('button', { className: 'skipbtn', onClick: () => skip(10) }, '⏩'),
    ),
    h('div', { className: 'pupload', onClick: () => fileRef.current?.click() },
      h('span', { style: { fontSize: '1.3rem' } }, '🎵'),
      h('span', null, audioUrl ? 'Cambiar canción (MP3, M4A…)' : 'Subir canción desde el celular'),
      h('input', { ref: fileRef, type: 'file', accept: 'audio/*', style: { display: 'none' }, onChange: handleFile })
    )
  );
};

// ─── PANTALLA: COREOGRAFÍAS ───────────────────────────────────────────────────
const PantallaCoreos = ({ data, setData, goToCoreo }) => {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ nombre: '', cancion: '', artista: '', estilo: 'Cumbia', bpm: '' });

  const crear = () => {
    if (!form.nombre.trim()) return;
    const c = { id: uid(), nombre: form.nombre, cancion: form.cancion, artista: form.artista, estilo: form.estilo, bpm: form.bpm, tiempos: [], audioKey: null, creadaEn: new Date().toLocaleDateString('es') };
    const next = { ...data, coreos: [...data.coreos, c] };
    setData(next); saveData(next); setShowNew(false);
    setForm({ nombre: '', cancion: '', artista: '', estilo: 'Cumbia', bpm: '' });
    goToCoreo(c.id);
  };

  const eliminar = (id, e) => {
    e.stopPropagation();
    if (!confirm('¿Eliminar esta coreografía?')) return;
    const next = { ...data, coreos: data.coreos.filter(c => c.id !== id) };
    setData(next); saveData(next);
  };

  return h('div', { className: 'screen' },
    h('div', { className: 'page fu' },
      h('div', { className: 'ptitle' }, 'Coreografías'),
      h('div', { className: 'psub' }, `${data.coreos.length} en tu academia`),
      data.coreos.length === 0
        ? h('div', { className: 'empty' }, h('div', { className: 'eicon' }, '💃'), h('div', { className: 'etext' }, 'Aún no hay coreografías. Toca ＋ para crear la primera.'))
        : data.coreos.map(c =>
            h('div', { key: c.id, className: 'card', onClick: () => goToCoreo(c.id) },
              h('div', { style: { height: 3, background: estiloColor(c.estilo), margin: '-14px -14px 12px', borderRadius: '14px 14px 0 0' } }),
              h('div', { className: 'ctitle' }, c.nombre),
              h('div', { className: 'cmeta' },
                c.cancion && h('span', null, `🎵 ${c.cancion}${c.artista ? ` — ${c.artista}` : ''}`),
                h('span', null, `⏱ ${c.tiempos.length} tiempos`)
              ),
              h('div', { style: { display: 'flex', gap: 6, marginTop: 9, flexWrap: 'wrap' } },
                h('span', { className: `tag ${estiloTag(c.estilo)}` }, c.estilo),
                c.bpm && h('span', { className: 'tag', style: { background: 'rgba(255,255,255,0.05)', color: 'var(--muted)' } }, `${c.bpm} BPM`),
                c.audioKey && h('span', { className: 'tag', style: { background: 'rgba(39,174,96,0.1)', color: '#27ae60' } }, '🎵 Audio')
              ),
              h('div', { style: { display: 'flex', gap: 8, marginTop: 11 } },
                h('button', { className: 'btn bp bsm', style: { flex: 1 }, onClick: e => { e.stopPropagation(); goToCoreo(c.id); } }, 'Abrir →'),
                h('button', { className: 'btn bd bsm', onClick: e => eliminar(c.id, e) }, '🗑')
              )
            )
          )
    ),
    h('button', { className: 'fab', onClick: () => setShowNew(true) }, '＋'),
    showNew && h(Modal, { title: 'Nueva Coreografía', onClose: () => setShowNew(false),
      footer: h(Fragment, null,
        h('button', { className: 'btn bg', onClick: () => setShowNew(false) }, 'Cancelar'),
        h('button', { className: 'btn bp', onClick: crear }, 'Crear')
      )},
      h('div', { className: 'fg' }, h('label', null, 'Nombre *'), h('input', { placeholder: 'Show de verano 2025', value: form.nombre, onChange: e => setForm({ ...form, nombre: e.target.value }) })),
      h('div', { className: 'fg' }, h('label', null, 'Canción'), h('input', { placeholder: 'La Pollera Colorá', value: form.cancion, onChange: e => setForm({ ...form, cancion: e.target.value }) })),
      h('div', { className: 'fg' }, h('label', null, 'Artista'), h('input', { placeholder: 'Wilson Choperena', value: form.artista, onChange: e => setForm({ ...form, artista: e.target.value }) })),
      h('div', { className: 'r2' },
        h('div', { className: 'fg' }, h('label', null, 'Estilo'), h('select', { value: form.estilo, onChange: e => setForm({ ...form, estilo: e.target.value }) }, ESTILOS.map(s => h('option', { key: s }, s)))),
        h('div', { className: 'fg' }, h('label', null, 'B
