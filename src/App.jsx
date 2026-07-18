import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const API_BASE = 'https://mera-love.onrender.com/api';
// YouTube embed URL - sahi format mein
const YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed/m-w4pd2fSP4?autoplay=1&loop=1&playlist=m-w4pd2fSP4&controls=0&showinfo=0&autohide=1&rel=0';

const emptyCountdown = { days: '00', hours: '00', minutes: '00', seconds: '00' };

function CountdownBox({ value, label }) {
  return <div className="min-w-16 rounded-2xl border border-[#ff9fbd]/70 bg-[#250c22]/70 px-3 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,.12)] sm:min-w-20"><div className="font-mono text-3xl font-bold text-[#ffacd0] sm:text-4xl">{value}</div><div className="mt-1 text-[0.7rem] text-[#ffe7f1]/80">{label}</div></div>;
}

function Slideshow({ photos }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const interval = useRef(null);
  const stopAuto = () => interval.current && clearInterval(interval.current);
  const startAuto = useCallback(() => { stopAuto(); if (photos.length) interval.current = setInterval(() => setCurrentIndex(index => (index + 1) % photos.length), 5000); }, [photos.length]);

  useEffect(() => { if (currentIndex >= photos.length) setCurrentIndex(0); startAuto(); return stopAuto; }, [photos, currentIndex, startAuto]);
  const move = (direction) => { stopAuto(); setCurrentIndex(index => photos.length ? (index + direction + photos.length) % photos.length : 0); startAuto(); };

  return <section className="mb-8">
    <div className="relative overflow-hidden rounded-3xl bg-[#220b20] shadow-[0_18px_45px_rgba(53,5,35,.35)]">
      <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {photos.length ? photos.map(photo => <div className="flex min-w-full items-center justify-center" key={photo.id}><img className="max-h-[400px] w-full object-contain" src={`${API_BASE}/photos/${photo.id}/image`} alt="Memory" /></div>) : <div className="flex min-h-56 min-w-full items-center justify-center text-[#fff5ea]/75">✨ No photos yet ✨</div>}
      </div>
      <button onClick={() => move(-1)} aria-label="Previous photo" className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-2xl hover:bg-black/80">‹</button>
      <button onClick={() => move(1)} aria-label="Next photo" className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-2xl hover:bg-black/80">›</button>
    </div>
    <div className="mt-4 flex justify-center gap-3">{photos.map((photo, index) => <button aria-label={`Show photo ${index + 1}`} onClick={() => { stopAuto(); setCurrentIndex(index); startAuto(); }} key={photo.id} className={`h-2.5 rounded-full transition-all ${index === currentIndex ? 'w-6 bg-[#ff80b5]' : 'w-2.5 bg-[#6d365d]'}`} />)}</div>
  </section>;
}

function Confetti({ active }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current; const ctx = canvas.getContext('2d'); let frame;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    const colors = ['#ffb347', '#ff6b6b', '#44ff44', '#4488ff', '#ffd700', '#ff69b4'];
    const particles = Array.from({ length: 150 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height - canvas.height, size: Math.random() * 8 + 4, speedY: Math.random() * 5 + 3, speedX: (Math.random() - .5) * 2, color: colors[Math.floor(Math.random() * colors.length)], rotation: Math.random() * 360, rotationSpeed: (Math.random() - .5) * 10 }));
    const draw = () => { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation * Math.PI / 180); ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size); ctx.restore(); p.y += p.speedY; p.x += p.speedX; p.rotation += p.rotationSpeed; if (p.y > canvas.height) { p.y = -20; p.x = Math.random() * canvas.width; } if (p.x < -50) p.x = canvas.width + 50; if (p.x > canvas.width + 50) p.x = -50; }); frame = requestAnimationFrame(draw); };
    draw(); return () => { cancelAnimationFrame(frame); ctx.clearRect(0, 0, canvas.width, canvas.height); window.removeEventListener('resize', resize); };
  }, [active]);
  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[3500]" />;
}

function FloatingHearts() {
  const hearts = useMemo(() => Array.from({ length: 30 }, (_, index) => ({
    id: index,
    left: `${Math.random() * 100}%`,
    bottom: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    size: `${Math.random() * 1.5 + .5}rem`,
  })), []);

  return <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
    {hearts.map(heart => <span key={heart.id} className="absolute animate-[bounce_8s_ease-in-out_infinite] text-pink-300/25 drop-shadow-[0_0_10px_rgba(255,132,181,.5)]" style={{ left: heart.left, bottom: heart.bottom, animationDelay: heart.delay, fontSize: heart.size }}>♥</span>)}
  </div>;
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false); const [adminOpen, setAdminOpen] = useState(false); const [pinDialogOpen, setPinDialogOpen] = useState(false); const [pin, setPin] = useState(''); const [pinChecking, setPinChecking] = useState(false);
  const [photos, setPhotos] = useState([]); const [frustrations, setFrustrations] = useState([]);
  const [frustText, setFrustText] = useState(''); const [photoFile, setPhotoFile] = useState(null); const [uploading, setUploading] = useState(false);
  const [countdown, setCountdown] = useState(emptyCountdown); const [isBirthday, setIsBirthday] = useState(false);
  const [surpriseOpen, setSurpriseOpen] = useState(false); const [giftOpened, setGiftOpened] = useState(false); const [popup, setPopup] = useState(null); const [flipped, setFlipped] = useState(false); const [musicOn, setMusicOn] = useState(false);
  const popupIndex = useRef(0); const targetDate = useRef(null); const photoInputRef = useRef(null);
  const iframeRef = useRef(null); // YouTube iframe ke liye ref

  useEffect(() => { const birthday = new Date(new Date().getFullYear(), 7, 28); targetDate.current = new Date() > birthday ? new Date(new Date().getFullYear() + 1, 7, 28) : birthday; const update = () => { const diff = targetDate.current - new Date(); if (diff <= 0) { setIsBirthday(true); setCountdown(emptyCountdown); return; } setCountdown({ days: String(Math.floor(diff / 86400000)).padStart(2, '0'), hours: String(Math.floor(diff % 86400000 / 3600000)).padStart(2, '0'), minutes: String(Math.floor(diff % 3600000 / 60000)).padStart(2, '0'), seconds: String(Math.floor(diff % 60000 / 1000)).padStart(2, '0') }); }; update(); const timer = setInterval(update, 1000); return () => clearInterval(timer); }, []);

  // YouTube iframe control ke liye toggle function
  const toggleMusic = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    
    // Current src ko modify karo
    const currentSrc = iframe.src;
    if (musicOn) {
      // Autoplay band karo
      iframe.src = currentSrc.replace('autoplay=1', 'autoplay=0');
      setMusicOn(false);
    } else {
      // Autoplay on karo
      iframe.src = currentSrc.replace('autoplay=0', 'autoplay=1');
      setMusicOn(true);
    }
  };

  // API requests intentionally match the original implementation.
  const loadPhotos = useCallback(async () => { try { const response = await fetch(`${API_BASE}/photos`); const result = await response.json(); const photoList = Array.isArray(result) ? result : []; setPhotos(photoList); return photoList; } catch (err) { return []; } }, []);
  const loadFrustrations = useCallback(async () => { try { const response = await fetch(`${API_BASE}/frustrations`); const result = await response.json(); const frustrationList = Array.isArray(result) ? result : []; setFrustrations(frustrationList); return frustrationList; } catch (err) { console.error(err); return []; } }, []);
  useEffect(() => { loadPhotos(); loadFrustrations(); const timer = setInterval(() => loadFrustrations(), 15000); return () => clearInterval(timer); }, [loadPhotos, loadFrustrations]);
  useEffect(() => { const timer = setInterval(() => { setFrustrations(items => { if (items.length) { const frustration = items[popupIndex.current % items.length]; popupIndex.current++; setFlipped(false); setPopup(frustration); } return items; }); }, 30000); return () => clearInterval(timer); }, []);
  useEffect(() => { if (!popup) return; const timer = setTimeout(() => setPopup(null), 8000); return () => clearTimeout(timer); }, [popup]);

  async function verifyAdminPin() { if (!pin || pinChecking) return false; setPinChecking(true); try { const response = await fetch(`${API_BASE}/admin/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: pin }) }); const result = await response.json(); if (result.success) { setIsAdmin(true); setAdminOpen(true); setPinDialogOpen(false); setPin(''); alert('✅ Admin access granted!'); loadPhotos(); return true; } alert('❌ Wrong PIN!'); return false; } catch (err) { alert('Error connecting to server!'); return false; } finally { setPinChecking(false); } }
  async function uploadPhoto() { if (!isAdmin) { alert('Admin access required!'); return; } if (!photoFile || uploading) { if (!photoFile) alert('Select a photo'); return; } const formData = new FormData(); formData.append('file', photoFile); setUploading(true); try { await fetch(`${API_BASE}/photos/upload`, { method: 'POST', body: formData }); setPhotoFile(null); if (photoInputRef.current) photoInputRef.current.value = ''; alert('Uploaded!'); loadPhotos(); } finally { setUploading(false); } }
  async function deletePhoto(id) { if (!isAdmin) return; await fetch(`${API_BASE}/photos/${id}`, { method: 'DELETE' }); loadPhotos(); }
  async function addFrustration() { if (!isAdmin) { alert('Admin access required!'); return; } const text = frustText.trim(); if (!text) { alert('Write something!'); return; } await fetch(`${API_BASE}/frustrations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(text) }); setFrustText(''); await loadFrustrations(); }
  function showSurprise() { if (!isBirthday) { alert(`🎂 Birthday is on ${targetDate.current.toLocaleDateString()}! Wait for the special day! 🎂`); return; } setGiftOpened(false); setSurpriseOpen(true); }

  return (
    <>
      {/* Hidden YouTube Player - sahi tarike se */}
      <iframe
        ref={iframeRef}
        width="0"
        height="0"
        src={YOUTUBE_EMBED_URL}
        allow="autoplay; encrypted-media"
        style={{ display: 'none' }}
        title="Romantic Background Music"
      />
      
      {/* Original App Content */}
      <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_15%_10%,rgba(255,157,195,.32),transparent_28%),radial-gradient(circle_at_85%_85%,rgba(173,56,125,.34),transparent_32%),linear-gradient(135deg,#21081f_0%,#4a143d_52%,#180817_100%)] px-3 py-3 font-sans text-[#fff1f7] sm:px-6 sm:py-5">
        <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden before:absolute before:-inset-1/2 before:h-[200%] before:w-[200%] before:bg-[radial-gradient(circle_at_20%_40%,rgba(255,137,188,.16),transparent_50%)] before:animate-[spin_30s_linear_infinite]" />
        <FloatingHearts />
        <div className="relative z-10 mx-auto max-w-[1400px]">
          <section className="mx-auto mb-6 max-w-xl animate-pulse rounded-[2rem] border-2 border-[#ffb347] bg-gradient-to-br from-[#ffb347]/15 to-black/50 p-5 text-center shadow-[0_10px_40px_rgba(255,180,71,.2)] backdrop-blur-xl"><h2 className="mb-4 font-display text-2xl text-[#ffd89b]">🎂 Babbu&apos;s Birthday Countdown 🎁</h2><div className="flex flex-wrap justify-center gap-3"><CountdownBox value={countdown.days} label="Days" /><CountdownBox value={countdown.hours} label="Hours" /><CountdownBox value={countdown.minutes} label="Minutes" /><CountdownBox value={countdown.seconds} label="Seconds" /></div><p className={`mt-4 ${isBirthday ? 'text-xl text-[#ffd700]' : 'text-[#ffd89b]'}`}>{isBirthday ? '🎉🎂 HAPPY BIRTHDAY BABBU! 🎂🎉' : '🎂 28 August - Babbu\'s Special Day! 🎂'}</p><button disabled={!isBirthday} onClick={showSurprise} className={`mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 text-lg font-bold transition ${isBirthday ? 'animate-pulse bg-gradient-to-br from-[#ffb347] to-[#ff8c00] text-[#2c1a1a] hover:scale-105' : 'cursor-not-allowed bg-gradient-to-br from-zinc-600 to-zinc-800 text-white/70 grayscale'}`}>{isBirthday ? '🎁 OPEN SURPRISE NOW! ⭐' : '🎁 Surprise Unlocks on Birthday 🔒'}</button></section>
          <header className="mb-8 rounded-[2rem] border border-[#ffc882]/30 bg-black/40 p-8 text-center backdrop-blur-xl"><h1 className="font-display text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-[#ffd89b] via-[#ffb347] to-[#ff8c00] sm:text-5xl">💖 MUCCHAR – MERI JAAN 💖</h1><p className="mt-3 text-sm sm:text-base">&quot;Babu hai na tu mera gussa kyu karta&quot;</p><p className="mt-4 text-[#ffb347]">♥ Forever &amp; Always ∞</p></header>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"><section className="rounded-[2rem] border border-[#ffc882]/20 bg-[#140c0c]/50 p-5 backdrop-blur-xl"><Slideshow photos={photos} /><div className="mb-4 rounded-3xl border-l-4 border-[#ffb347] bg-gradient-to-br from-[#ffb347]/10 to-black/30 p-6 text-center leading-relaxed"><p>💕 Meri Babbu kyu sochti hai yaar itna...<br /><br />&quot;Tumhare bina main thoda toh adhoora hoon, tum ho toh main hoon. Hamesha tumhara rahunga yaar, har janam.&quot;</p><p className="mt-4 text-[#ffb347]">♥ Tera hamesha, Sirf tera ♥</p></div><div className="rounded-3xl bg-gradient-to-r from-[#3b2626] to-[#1f1414] p-6 text-center"><p className="text-xl">🌹 Tum mere liye sab kuch ho babbu 🌹</p><p className="mt-3">💧✨ Love You Forever &amp; Ever ✨💧</p></div></section>
          <aside className="rounded-[2rem] bg-black/30 p-4"><div className="p-4 text-center"><div className="text-4xl text-[#ffb347]">☁️</div><h3 className="mt-2 text-xl font-semibold">Frustration Cloud</h3><p className="mt-1 text-xs">✨ Every 30 seconds a 3D popup appears ✨</p></div><div className="max-h-75 overflow-y-auto">{frustrations.length ? frustrations.slice(0, 5).map(f => { const text = String(f.text ?? ''); return <div key={f.id ?? f.createdAt} className="my-2 rounded-2xl border-l-3 border-[#ffb347] bg-[#ffb347]/10 p-3 text-sm">💬 {text.substring(0, 80)}{text.length > 80 ? '...' : ''}<br /><small className="text-[#fff5ea]/65">{new Date(f.createdAt).toLocaleString()}</small></div>; }) : <div className="p-4 text-center">✨ No frustrations yet ✨</div>}</div></aside></div>
        </div>
        {surpriseOpen && <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"><div className="max-w-lg animate-[bounce_0.6s] rounded-[2rem] border-2 border-[#ffd700] bg-gradient-to-br from-[#2d1a1a] via-[#1a0c0c] to-[#3b2020] p-8 text-center shadow-[0_0_100px_rgba(255,215,0,.3)] [transform:perspective(1000px)_rotateX(2deg)]"><button onClick={() => setGiftOpened(true)} className={`text-7xl transition duration-500 hover:scale-125 hover:rotate-6 ${giftOpened ? 'animate-bounce' : 'animate-pulse'}`}>🎁</button><h2 className="mt-2 font-display text-3xl text-[#ffd700]">🎉 HAPPY BIRTHDAY BABBU! 🎉</h2>{giftOpened ? <div className="mt-5 grid gap-3 text-left sm:grid-cols-3"><div className="rounded-2xl bg-white/10 p-3 text-center shadow-lg transition hover:-translate-y-2 hover:rotate-1"><div className="text-2xl">💌</div><p className="mt-1 text-sm font-semibold">Love Letter</p><p className="mt-1 text-xs text-[#fff5ea]/75">A personal note just for Babbu.</p></div><div className="rounded-2xl bg-white/10 p-3 text-center shadow-lg transition hover:-translate-y-2 hover:-rotate-1"><div className="text-2xl">🎵</div><p className="mt-1 text-sm font-semibold">Our Playlist</p><p className="mt-1 text-xs text-[#fff5ea]/75">Play your special songs together.</p></div><div className="rounded-2xl bg-white/10 p-3 text-center shadow-lg transition hover:-translate-y-2 hover:rotate-1"><div className="text-2xl">📸</div><p className="mt-1 text-sm font-semibold">Memory Reel</p><p className="mt-1 text-xs text-[#fff5ea]/75">Relive every photo and moment.</p></div></div> : <p className="mt-4 leading-relaxed text-[#fff5ea]/85">Tap the gift to open three little birthday surprises made with love. ✨</p>}<p className="mt-5 leading-relaxed">💖 Meri jaan, tum mere ha hai! 💖<br /><br />Bhagwan tujhe hamesha khush rakhe. Tu mere liye sabse khaas hai!<br /><br />I Love You More Than Words Can Say! ❤️</p><button onClick={() => setSurpriseOpen(false)} className="mt-5 rounded-full bg-gradient-to-r from-[#ffd06b] to-[#ff9f43] px-7 py-3 font-bold text-[#2c1a1a] shadow-lg transition duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_12px_30px_rgba(255,180,71,.45)] active:scale-95">Close ♥</button></div></div>}
        <Confetti active={surpriseOpen} />
        {popup && <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"><button onClick={() => setPopup(null)} className="absolute top-5 right-5 text-3xl">×</button><button onClick={() => setFlipped(!flipped)} className="h-100 w-80 [perspective:1000px]"><div className={`relative h-full w-full rounded-[2rem] transition-transform duration-600 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}><div className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border-2 border-[#ffb347] bg-gradient-to-br from-[#2d1a1a] to-[#1f1010] p-6 text-center [backface-visibility:hidden]"><div className="text-4xl">💬</div><p className="mt-4">❝ {popup.text} ❞</p><small className="mt-4 text-[#fff5ea]/70">{new Date(popup.createdAt).toLocaleString()}</small></div><div className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] border-2 border-[#ff8c00] bg-gradient-to-br from-[#1f1010] to-[#2d1a1a] p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"><div className="text-4xl">♥</div><p className="mt-4">💖 babu gussa kyu kar raha hai<br /><br />bachha sath hu na tere mein phir<br /><br />hamesha rahunga 💖</p></div></div></button></div>}
        {pinDialogOpen && <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"><form onSubmit={e => { e.preventDefault(); verifyAdminPin(); }} className="w-full max-w-sm rounded-3xl border border-[#ffb347] bg-[#1f1010] p-6 shadow-2xl"><h2 className="font-display text-2xl text-[#ffd89b]">🔒 Admin Access</h2><p className="mt-2 text-sm text-[#fff5ea]/70">Enter the 4-digit Admin PIN.</p><input autoFocus inputMode="numeric" maxLength="4" value={pin} onChange={e => setPin(e.target.value)} className="mt-5 w-full rounded-xl border border-[#ffb347]/50 bg-black/40 p-3 text-center text-xl tracking-[.5em] outline-none focus:border-[#ffd700]" aria-label="4-digit Admin PIN" /><div className="mt-5 flex gap-3"><button disabled={pinChecking} type="button" onClick={() => { setPinDialogOpen(false); setPin(''); }} className="flex-1 rounded-full border border-[#ffb347]/50 px-4 py-2 disabled:opacity-50">Cancel</button><button disabled={pinChecking || !pin} type="submit" className="flex-1 rounded-full bg-[#ffb347] px-4 py-2 font-bold text-[#2c1a1a] disabled:cursor-not-allowed disabled:opacity-50">{pinChecking ? 'Checking…' : 'Unlock'}</button></div></form></div>}
        <aside className={`fixed top-0 right-0 z-[1500] h-dvh w-full max-w-[380px] overflow-y-auto border-l-2 border-[#ffb347] bg-[#0a0505]/98 p-6 shadow-[-18px_0_50px_rgba(0,0,0,.35)] backdrop-blur-xl transition-transform duration-500 sm:w-[380px] ${adminOpen ? 'translate-x-0' : 'translate-x-full'}`}><div className="mb-4 flex items-center justify-between"><h3 className="text-xl font-bold">🛡️ Admin Zone</h3><button onClick={() => setAdminOpen(false)} className="text-2xl text-[#ffb347] transition hover:rotate-90 hover:scale-125">×</button></div><div className="mb-6 rounded-2xl bg-white/5 p-4 shadow-inner"><h4 className="font-semibold">📤 Upload Photo</h4><input ref={photoInputRef} type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} className="mt-3 w-full text-sm" /><button disabled={uploading} onClick={uploadPhoto} className="mt-3 w-full rounded-full bg-gradient-to-r from-[#ffd06b] to-[#ff9f43] p-3 font-semibold text-[#2c1a1a] shadow-md transition duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_12px_28px_rgba(255,180,71,.45)] active:translate-y-0 active:scale-95 disabled:cursor-wait disabled:opacity-60">{uploading ? 'Uploading…' : 'Upload Photo ✨'}</button><div className="mt-4 flex flex-wrap gap-2">{photos.map(photo => <div className="w-[70px] text-center" key={photo.id}><img className="h-15 w-full rounded-lg object-cover transition hover:scale-110" src={`${API_BASE}/photos/${photo.id}/image`} alt="Uploaded" onError={e => { e.currentTarget.src = 'https://placehold.co/70x60/4a2e2e/ffc285?text=?'; }} /><button onClick={() => deletePhoto(photo.id)} className="mt-1 rounded-lg bg-[#b33a3a] px-2 py-0.5 text-[10px] transition hover:scale-105 hover:bg-[#e04b4b] active:scale-95">Del</button></div>)}</div></div><div className="rounded-2xl bg-white/5 p-4 shadow-inner"><h4 className="font-semibold">😞 Add Frustration</h4><textarea rows="2" value={frustText} onChange={e => setFrustText(e.target.value)} placeholder="Write frustration/emotion..." className="mt-3 w-full rounded-lg bg-black/30 p-2 outline-none transition focus:scale-[1.01] focus:ring-1 focus:ring-[#ffb347]" /><button onClick={addFrustration} className="mt-3 w-full rounded-lg bg-gradient-to-r from-[#ffd06b] to-[#ff9f43] p-3 font-semibold text-[#2c1a1a] shadow-md transition duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_12px_28px_rgba(255,180,71,.45)] active:translate-y-0 active:scale-95">Add to Cloud ♥</button></div></aside>
        <button onClick={toggleMusic} aria-label={musicOn ? 'Pause romantic music' : 'Play romantic music'} className="fixed bottom-4 left-4 z-[1600] inline-flex items-center gap-2 rounded-full border border-pink-100/30 bg-[#71194f]/85 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(68,5,43,.45)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#9c276d] active:scale-95 sm:bottom-5 sm:left-5">{musicOn ? '♫ Romance playing' : '♪ Play romance'}</button>
        <button onClick={() => isAdmin ? setAdminOpen(!adminOpen) : setPinDialogOpen(true)} className="fixed right-4 bottom-4 z-[1600] rounded-full bg-gradient-to-r from-[#ff8fbc] to-[#e84d91] px-4 py-3 text-sm font-bold text-[#3c082b] shadow-[0_10px_28px_rgba(105,12,66,.45)] transition duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-[0_14px_34px_rgba(255,112,174,.45)] active:scale-95 sm:right-5 sm:bottom-5 sm:px-5">⚙️ Admin Access</button>
      </main>
    </>
  );
}