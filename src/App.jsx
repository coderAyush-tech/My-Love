import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AlbumGallery from './components/AlbumGallery';
import BirthdayJourney from './components/BirthdayJourney';
import MidnightCinematic from './components/MidnightCinematic';
import { birthdayConfig } from './data/birthdayConfig';

const API_BASE = 'https://mera-love.onrender.com/api';
const ROMANTIC_MUSIC_URL = birthdayConfig.musicEmbedUrl;
const BIRTHDAY_MUSIC_URL = birthdayConfig.birthdayMusicEmbedUrl;
const MUSIC_TRACKS = { romance: ROMANTIC_MUSIC_URL, birthday: BIRTHDAY_MUSIC_URL };
const ADMIN_TOKEN_KEY = 'adminToken';
const MAX_ALBUM_MEDIA_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_ALBUM_MEDIA_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const emptyCountdown = { days: '00', hours: '00', minutes: '00', seconds: '00' };

function youtubePlayerUrl(source, autoplay) {
  const url = new URL(source);
  url.searchParams.set('autoplay', autoplay ? '1' : '0');
  url.searchParams.set('enablejsapi', '1');
  url.searchParams.set('playsinline', '1');
  return url.toString();
}

function entityId(entity) {
  return entity?.id ?? entity?._id;
}

function albumMedia(album) {
  if (Array.isArray(album?.media)) return album.media;
  if (Array.isArray(album?.items)) return album.items;
  return [];
}

function isVideoMedia(media) {
  return media?.type === 'video'
    || media?.mediaType === 'video'
    || String(media?.mimeType ?? '').startsWith('video/');
}

function albumMediaUrl(albumId, mediaId) {
  return `${API_BASE}/albums/${albumId}/media/${mediaId}/file`;
}

function getStoredAdminToken() {
  if (typeof window === 'undefined') return '';
  return window.sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
}

async function getBackendMessage(response, fallback) {
  try {
    const result = await response.clone().json();
    return typeof result?.message === 'string' && result.message.trim() ? result.message : fallback;
  } catch (error) {
    return fallback;
  }
}

function isAllowedAlbumFile(file) {
  if (ALLOWED_ALBUM_MEDIA_TYPES.has(file.type)) return true;
  return !file.type && /\.(jpe?g|png|webp|gif|mp4|webm|mov)$/i.test(file.name);
}

function CountdownBox({ value, label }) {
  return (
    <div className="countdown-unit">
      <div className="countdown-value">{value}</div>
      <div className="countdown-label">{label}</div>
    </div>
  );
}

function Slideshow({ photos }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const interval = useRef(null);
  const stopAuto = () => interval.current && clearInterval(interval.current);
  const startAuto = useCallback(() => { stopAuto(); if (photos.length) interval.current = setInterval(() => setCurrentIndex(index => (index + 1) % photos.length), 5000); }, [photos.length]);

  useEffect(() => { if (currentIndex >= photos.length) setCurrentIndex(0); startAuto(); return stopAuto; }, [photos, currentIndex, startAuto]);
  const move = (direction) => { stopAuto(); setCurrentIndex(index => photos.length ? (index + direction + photos.length) % photos.length : 0); startAuto(); };

  return <section>
    <div className="memory-slider">
      <div className="memory-slides" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {photos.length ? photos.map(photo => <div className="memory-slide" key={photo.id}><img src={`${API_BASE}/photos/${photo.id}/image`} alt="Memory" /></div>) : <div className="memory-slide empty-memory">Aapki pehli memory ka intezaar hai ♡</div>}
      </div>
      <button onClick={() => move(-1)} aria-label="Previous photo" className="slider-arrow slider-arrow-left">‹</button>
      <button onClick={() => move(1)} aria-label="Next photo" className="slider-arrow slider-arrow-right">›</button>
    </div>
    <div className="slider-dots">{photos.map((photo, index) => <button aria-label={`Show photo ${index + 1}`} onClick={() => { stopAuto(); setCurrentIndex(index); startAuto(); }} key={photo.id} className={`slider-dot ${index === currentIndex ? 'slider-dot-active' : ''}`} />)}</div>
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
    {hearts.map(heart => <span key={heart.id} className="floating-heart" style={{ left: heart.left, bottom: heart.bottom, animationDelay: heart.delay, fontSize: heart.size }}>♥</span>)}
  </div>;
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(() => Boolean(getStoredAdminToken())); const [adminOpen, setAdminOpen] = useState(false); const [pinDialogOpen, setPinDialogOpen] = useState(false); const [pin, setPin] = useState(''); const [pinChecking, setPinChecking] = useState(false);
  const [photos, setPhotos] = useState([]); const [frustrations, setFrustrations] = useState([]);
  const [frustText, setFrustText] = useState(''); const [photoFile, setPhotoFile] = useState(null); const [uploading, setUploading] = useState(false);
  const [albums, setAlbums] = useState([]); const [albumName, setAlbumName] = useState(''); const [albumTargetId, setAlbumTargetId] = useState(''); const [albumFiles, setAlbumFiles] = useState([]);
  const [creatingAlbum, setCreatingAlbum] = useState(false); const [uploadingAlbumMedia, setUploadingAlbumMedia] = useState(false); const [albumUploadProgress, setAlbumUploadProgress] = useState(''); const [albumNotice, setAlbumNotice] = useState('');
  const [countdown, setCountdown] = useState(emptyCountdown); const [isBirthday, setIsBirthday] = useState(false);
  const [surpriseOpen, setSurpriseOpen] = useState(false); const [birthdayJourneyOpen, setBirthdayJourneyOpen] = useState(false); const [cinematicOpen, setCinematicOpen] = useState(false); const [giftOpened, setGiftOpened] = useState(false); const [popup, setPopup] = useState(null); const [flipped, setFlipped] = useState(false); const [musicOn, setMusicOn] = useState(false); const [activeTrack, setActiveTrack] = useState('romance');
  const popupIndex = useRef(0); const targetDate = useRef(null); const photoInputRef = useRef(null); const albumFileInputRef = useRef(null);
  const iframeRef = useRef(null); // YouTube iframe ke liye ref
  const musicOnRef = useRef(false); const activeTrackRef = useRef('romance'); const cinematicTriggeredRef = useRef(false);
  const journeyPhotos = useMemo(() => photos.map(photo => ({ id: photo.id, src: `${API_BASE}/photos/${photo.id}/image` })), [photos]);

  useEffect(() => {
    const [, configuredMonth, configuredDay] = birthdayConfig.birthdayDate.slice(0, 10).split('-').map(Number);

    const update = () => {
      const now = new Date();
      const birthdayThisYear = new Date(now.getFullYear(), configuredMonth - 1, configuredDay, 0, 0, 0, 0);
      const isBirthdayToday = now.getMonth() === configuredMonth - 1 && now.getDate() === configuredDay;

      if (birthdayConfig.devUnlock || isBirthdayToday) {
        targetDate.current = birthdayThisYear;
        setIsBirthday(true);
        setCountdown(emptyCountdown);
        return;
      }

      const nextBirthday = now < birthdayThisYear
        ? birthdayThisYear
        : new Date(now.getFullYear() + 1, configuredMonth - 1, configuredDay, 0, 0, 0, 0);
      const diff = nextBirthday - now;
      targetDate.current = nextBirthday;
      setIsBirthday(false);
      setCountdown({
        days: String(Math.floor(diff / 86400000)).padStart(2, '0'),
        hours: String(Math.floor(diff % 86400000 / 3600000)).padStart(2, '0'),
        minutes: String(Math.floor(diff % 3600000 / 60000)).padStart(2, '0'),
        seconds: String(Math.floor(diff % 60000 / 1000)).padStart(2, '0'),
      });
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const sendMusicCommand = (command) => {
    const playerWindow = iframeRef.current?.contentWindow;
    if (!playerWindow) return;
    playerWindow.postMessage(JSON.stringify({ event: 'command', func: command, args: [] }), '*');
  };

  const playTrack = (track) => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const trackChanged = activeTrackRef.current !== track;
    if (!trackChanged && musicOnRef.current) {
      sendMusicCommand('playVideo');
      return;
    }

    if (trackChanged) {
      iframe.src = youtubePlayerUrl(MUSIC_TRACKS[track], true);
    } else {
      sendMusicCommand('playVideo');
    }
    activeTrackRef.current = track;
    musicOnRef.current = true;
    setActiveTrack(track);
    setMusicOn(true);
  };

  const startMusic = () => playTrack('romance');
  const startBirthdayMusic = () => playTrack('birthday');

  const pauseMusic = () => {
    const iframe = iframeRef.current;
    if (!iframe || !musicOnRef.current) return;
    sendMusicCommand('pauseVideo');
    musicOnRef.current = false;
    setMusicOn(false);
  };

  // YouTube iframe control ke liye toggle function
  const toggleMusic = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    
    if (musicOnRef.current) {
      sendMusicCommand('pauseVideo');
      musicOnRef.current = false;
      setMusicOn(false);
    } else {
      sendMusicCommand('playVideo');
      musicOnRef.current = true;
      setMusicOn(true);
    }
  };

  useEffect(() => {
    const events = ['pointerdown', 'touchstart', 'keydown'];
    const removeGestureListeners = () => events.forEach(eventName => window.removeEventListener(eventName, startOnFirstGesture, true));
    const startOnFirstGesture = (event) => {
      removeGestureListeners();
      if (event.target?.closest?.('[data-music-control]')) return;
      if (!cinematicTriggeredRef.current) startMusic();
    };
    events.forEach(eventName => window.addEventListener(eventName, startOnFirstGesture, { capture: true, passive: true }));
    return removeGestureListeners;
  }, []);

  useEffect(() => {
    if (!isBirthday || cinematicTriggeredRef.current) return;
    cinematicTriggeredRef.current = true;
    pauseMusic();
    setCinematicOpen(true);
  }, [isBirthday]);

  function expireAdminSession() {
    window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setIsAdmin(false);
    setAdminOpen(false);
    setPin('');
    setPinDialogOpen(true);
  }

  async function protectedAdminFetch(url, options = {}, fallbackMessage = 'Request complete nahi hua.') {
    const token = getStoredAdminToken();
    if (!token) {
      expireAdminSession();
      throw new Error('Admin session missing hai. PIN dobara enter karo.');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      const message = await getBackendMessage(response, 'Admin session expire ho gaya. PIN dobara enter karo.');
      expireAdminSession();
      throw new Error(message);
    }

    if (!response.ok) {
      throw new Error(await getBackendMessage(response, fallbackMessage));
    }

    return response;
  }

  // Public API requests keep their existing contract; protected mutations use the admin bearer token.
  const loadPhotos = useCallback(async () => { try { const response = await fetch(`${API_BASE}/photos`); const result = await response.json(); const photoList = Array.isArray(result) ? result : []; setPhotos(photoList); return photoList; } catch (err) { return []; } }, []);
  const loadFrustrations = useCallback(async () => { try { const response = await fetch(`${API_BASE}/frustrations`); const result = await response.json(); const frustrationList = Array.isArray(result) ? result : []; setFrustrations(frustrationList); return frustrationList; } catch (err) { console.error(err); return []; } }, []);
  const loadAlbums = useCallback(async () => { try { const response = await fetch(`${API_BASE}/albums`); if (!response.ok) return []; const result = await response.json(); const albumList = Array.isArray(result) ? result : Array.isArray(result?.albums) ? result.albums : []; setAlbums(albumList); return albumList; } catch (err) { return []; } }, []);
  useEffect(() => { loadPhotos(); loadFrustrations(); const timer = setInterval(() => loadFrustrations(), 15000); return () => clearInterval(timer); }, [loadPhotos, loadFrustrations]);
  useEffect(() => { loadAlbums(); }, [loadAlbums]);
  useEffect(() => { const timer = setInterval(() => { setFrustrations(items => { if (items.length) { const frustration = items[popupIndex.current % items.length]; popupIndex.current++; setFlipped(false); setPopup(frustration); } return items; }); }, 30000); return () => clearInterval(timer); }, []);
  useEffect(() => { if (!popup) return; const timer = setTimeout(() => setPopup(null), 8000); return () => clearTimeout(timer); }, [popup]);

  async function verifyAdminPin() {
    if (pinChecking) return false;
    if (pin.length < 6) {
      alert('Admin PIN minimum 6 characters ka hona chahiye.');
      return false;
    }
    setPinChecking(true);
    try {
      const response = await fetch(`${API_BASE}/admin/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: pin }) });
      const result = await response.json().catch(() => ({}));
      const adminToken = response.headers.get('X-Admin-Token');

      if (response.ok) {
        if (!adminToken) {
          alert('Admin token response header nahi mila. Backend CORS mein Access-Control-Expose-Headers: X-Admin-Token add/check karo.');
          return false;
        }
        window.sessionStorage.setItem(ADMIN_TOKEN_KEY, adminToken);
        setIsAdmin(true);
        setAdminOpen(true);
        setPinDialogOpen(false);
        setPin('');
        setAlbumNotice('Admin session secured hai ♡');
        alert('✅ Admin access granted!');
        loadPhotos();
        loadAlbums();
        return true;
      }

      alert(result.message || '❌ Wrong PIN!');
      return false;
    } catch (err) {
      alert('Error connecting to server!');
      return false;
    } finally { setPinChecking(false); }
  }

  async function uploadPhoto() {
    if (!isAdmin) { expireAdminSession(); return; }
    if (!photoFile || uploading) { if (!photoFile) alert('Select a photo'); return; }
    const formData = new FormData();
    formData.append('file', photoFile);
    setUploading(true);
    try {
      await protectedAdminFetch(`${API_BASE}/photos/upload`, { method: 'POST', body: formData }, 'Photo upload nahi hua.');
      setPhotoFile(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
      alert('Uploaded!');
      loadPhotos();
    } catch (error) {
      alert(error.message);
    } finally { setUploading(false); }
  }

  async function deletePhoto(id) {
    if (!isAdmin) { expireAdminSession(); return; }
    try {
      await protectedAdminFetch(`${API_BASE}/photos/${id}`, { method: 'DELETE' }, 'Photo delete nahi hua.');
      setPhotos(items => items.filter(photo => String(entityId(photo)) !== String(id)));
    } catch (error) { alert(error.message); }
  }

  async function addFrustration() { if (!isAdmin) { alert('Admin access required!'); return; } const text = frustText.trim(); if (!text) { alert('Write something!'); return; } await fetch(`${API_BASE}/frustrations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(text) }); setFrustText(''); await loadFrustrations(); }
  async function deleteFrustration(id) {
    if (!isAdmin) { expireAdminSession(); return; }
    if (!window.confirm('Yeh feeling permanently delete karni hai?')) return;
    try {
      await protectedAdminFetch(`${API_BASE}/frustrations/${id}`, { method: 'DELETE' }, 'Feeling delete nahi hui.');
      setFrustrations(items => items.filter(item => String(entityId(item)) !== String(id)));
      setPopup(current => String(entityId(current)) === String(id) ? null : current);
    } catch (error) { alert(error.message); }
  }
  async function createAlbum() {
    if (!isAdmin) { expireAdminSession(); return; }
    if (creatingAlbum) return;
    const name = albumName.trim();
    if (!name) { setAlbumNotice('Album ka naam likho.'); return; }
    setCreatingAlbum(true); setAlbumNotice('');
    try {
      const response = await protectedAdminFetch(`${API_BASE}/albums`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) }, 'Album create nahi hua.');
      const createdAlbum = await response.json();
      setAlbumName('');
      if (entityId(createdAlbum)) setAlbumTargetId(String(entityId(createdAlbum)));
      await loadAlbums();
      setAlbumNotice(`“${name}” album ready hai ♡`);
    } catch (error) {
      setAlbumNotice(error.message);
    } finally { setCreatingAlbum(false); }
  }
  async function uploadAlbumFiles() {
    if (!isAdmin) { expireAdminSession(); return; }
    if (uploadingAlbumMedia) return;
    if (!albumFiles.length) { setAlbumNotice('Photo ya video select karo.'); return; }
    const invalidFile = albumFiles.find(file => !isAllowedAlbumFile(file));
    if (invalidFile) {
      setAlbumFiles([]);
      if (albumFileInputRef.current) albumFileInputRef.current.value = '';
      setAlbumNotice(`${invalidFile.name} supported photo/video format nahi hai.`);
      return;
    }
    const oversizedFile = albumFiles.find(file => file.size > MAX_ALBUM_MEDIA_SIZE_BYTES);
    if (oversizedFile) {
      setAlbumFiles([]);
      if (albumFileInputRef.current) albumFileInputRef.current.value = '';
      setAlbumNotice(`${oversizedFile.name} 25 MB se badi hai. Chhoti file choose karo.`);
      return;
    }
    if (!albumTargetId) { setAlbumNotice('Pehle album select karo.'); return; }
    setUploadingAlbumMedia(true); setAlbumNotice('');
    try {
      for (let index = 0; index < albumFiles.length; index += 1) {
        setAlbumUploadProgress(`${index + 1}/${albumFiles.length}`);
        const formData = new FormData();
        formData.append('file', albumFiles[index]);
        await protectedAdminFetch(`${API_BASE}/albums/${albumTargetId}/media`, { method: 'POST', body: formData }, `${albumFiles[index].name} upload nahi hua.`);
      }
      setAlbumFiles([]);
      if (albumFileInputRef.current) albumFileInputRef.current.value = '';
      await loadAlbums();
      setAlbumNotice('Saari memories save ho gayi—date automatically add ho gayi ♡');
    } catch (error) {
      setAlbumNotice(error.message);
    } finally { setUploadingAlbumMedia(false); setAlbumUploadProgress(''); }
  }
  async function deleteAlbum(albumId, name) {
    if (!isAdmin) { expireAdminSession(); return; }
    if (!window.confirm(`“${name}” album aur uski saari memories delete karni hain?`)) return;
    try {
      await protectedAdminFetch(`${API_BASE}/albums/${albumId}`, { method: 'DELETE' }, 'Album delete nahi hua.');
      if (String(albumTargetId) === String(albumId)) setAlbumTargetId('');
      setAlbums(items => items.filter(album => String(entityId(album)) !== String(albumId)));
      setAlbumNotice('Album delete ho gaya.');
    } catch (error) { setAlbumNotice(error.message); }
  }
  async function deleteAlbumMedia(albumId, mediaId) {
    if (!isAdmin) { expireAdminSession(); return; }
    if (!window.confirm('Yeh memory album se delete karni hai?')) return;
    try {
      await protectedAdminFetch(`${API_BASE}/albums/${albumId}/media/${mediaId}`, { method: 'DELETE' }, 'Memory delete nahi hui.');
      setAlbums(items => items.map(album => String(entityId(album)) === String(albumId)
        ? { ...album, media: albumMedia(album).filter(media => String(entityId(media)) !== String(mediaId)) }
        : album));
      setAlbumNotice('Memory delete ho gayi.');
    } catch (error) { setAlbumNotice(error.message); }
  }
  function showSurprise() { if (!isBirthday) { alert(`🎂 Birthday is on ${targetDate.current.toLocaleDateString()}! Wait for the special day! 🎂`); return; } pauseMusic(); setCinematicOpen(true); }
  function finishCinematic() { setCinematicOpen(false); startBirthdayMusic(); setBirthdayJourneyOpen(true); }
  function closeBirthdayJourney() { setBirthdayJourneyOpen(false); startMusic(); }

  return (
    <>
      {/* Hidden YouTube Player - sahi tarike se */}
      <iframe
        ref={iframeRef}
        width="1"
        height="1"
        src={youtubePlayerUrl(ROMANTIC_MUSIC_URL, false)}
        allow="autoplay; encrypted-media"
        className="youtube-audio-player"
        aria-hidden="true"
        title="Romantic Background Music"
        onLoad={() => {
          sendMusicCommand(musicOnRef.current ? 'playVideo' : 'pauseVideo');
        }}
      />
      
      <main className="love-app font-sans">
        <div className="love-orb love-orb-left" />
        <div className="love-orb love-orb-right" />
        <FloatingHearts />
        <div className="love-shell">
          <header className="site-topbar glass-panel">
            <div className="brand-lockup">
              <p className="brand-title">MUCCHAR — MERI JAAN</p>
              <span className="brand-subtitle">A little world made only for you</span>
            </div>
            <div className="topbar-actions">
              <button data-music-control onClick={toggleMusic} aria-label={musicOn ? 'Pause music' : 'Play music'} className="topbar-button">
                <span aria-hidden="true">{musicOn ? '♫' : '♪'}</span>
                {musicOn ? activeTrack === 'birthday' ? 'Birthday song playing' : 'Romance playing' : 'Play music'}
              </button>
              <button onClick={() => isAdmin ? setAdminOpen(!adminOpen) : setPinDialogOpen(true)} className="topbar-button">
                <span aria-hidden="true">◇</span> {isAdmin ? 'Admin Zone' : 'Admin Access'}
              </button>
            </div>
          </header>

          <div className="home-top-grid">
            <header className="hero-panel glass-panel">
              <div className="hero-copy">
                <span className="eyebrow">For Babbu, with all my heart</span>
                <h1 className="hero-title">My favourite <span>person.</span></h1>
                <p className="hero-quote">&ldquo;Babu hai na tu mera, gussa kyu karta. Tum ho toh main hoon—aur har janam sirf tumhara rahunga.&rdquo;</p>
                <p className="forever-mark">Forever &amp; Always · ∞</p>
              </div>
            </header>

            <section className="birthday-panel glass-panel">
              <p className="birthday-kicker">28 August · Our special day</p>
              <h2 className="birthday-title">Until your<br />birthday</h2>
              <div className="countdown-grid">
                <CountdownBox value={countdown.days} label="Days" />
                <CountdownBox value={countdown.hours} label="Hours" />
                <CountdownBox value={countdown.minutes} label="Mins" />
                <CountdownBox value={countdown.seconds} label="Secs" />
              </div>
              <p className="birthday-status">{isBirthday ? 'It is finally your day, Babbu. Your seven-part surprise is waiting.' : 'Something beautiful is waiting on the other side of this countdown.'}</p>
              <button disabled={!isBirthday} onClick={showSurprise} className="primary-romance-button">
                {isBirthday ? 'Open your birthday world  →' : 'Surprise locked until birthday  ♡'}
              </button>
            </section>
          </div>

          <div className="home-content-grid">
            <section className="gallery-panel glass-panel">
              <div className="section-heading-row">
                <div>
                  <span className="eyebrow">Our little archive</span>
                  <h2 className="section-title">Moments worth keeping</h2>
                </div>
                <p className="section-note">Every photo lives here, safely.</p>
              </div>
              <Slideshow photos={photos} />
              <div className="love-note-card">
                <span className="love-note-mark">“</span>
                <p>Meri Babbu kyu sochti hai yaar itna... Tumhare bina main thoda toh adhoora hoon, tum ho toh main hoon. Hamesha tumhara rahunga yaar, har janam.<span className="love-signature">Tera hamesha, sirf tera</span></p>
              </div>
              <div className="devotion-strip">
                <strong>Tum mere liye sab kuch ho, Babbu.</strong>
                <span>Love you forever &amp; ever · through every season</span>
              </div>
            </section>

            <aside className="cloud-panel glass-panel">
              <div className="cloud-orbit" aria-hidden="true">♡</div>
              <span className="eyebrow">A safe corner</span>
              <h2 className="section-title">Frustration Cloud</h2>
              <p className="section-note">Har feeling yahan safe hai. Every 30 seconds, one arrives as a 3D note.</p>
              <div className="frustration-list">
                {frustrations.length ? frustrations.slice(0, 5).map(f => {
                  const text = String(f.text ?? '');
                  return <div key={f.id ?? f.createdAt} className="frustration-item">{text.substring(0, 80)}{text.length > 80 ? '...' : ''}<small className="frustration-date">{new Date(f.createdAt).toLocaleString()}</small></div>;
                }) : <div className="empty-frustration">The cloud is quiet right now ♡</div>}
              </div>
            </aside>
          </div>

          <AlbumGallery albums={albums} getMediaUrl={albumMediaUrl} onVideoPlay={pauseMusic} />
        </div>
        {surpriseOpen && <div className="modal-backdrop !z-[3000]"><div className="legacy-surprise-card max-w-lg rounded-[2rem] p-8 text-center [transform:perspective(1000px)_rotateX(2deg)]"><button onClick={() => setGiftOpened(true)} className={`text-7xl transition duration-500 hover:scale-125 hover:rotate-6 ${giftOpened ? 'animate-bounce' : 'animate-pulse'}`}>🎁</button><h2 className="mt-2 font-display text-3xl text-[#ffb6d4]">Happy Birthday, Babbu.</h2>{giftOpened ? <div className="mt-5 grid gap-3 text-left sm:grid-cols-3"><div className="rounded-2xl bg-white/6 p-3 text-center"><div className="text-2xl">💌</div><p className="mt-1 text-sm font-semibold">Love Letter</p><p className="mt-1 text-xs text-[#cfb5c4]">A personal note just for Babbu.</p></div><div className="rounded-2xl bg-white/6 p-3 text-center"><div className="text-2xl">🎵</div><p className="mt-1 text-sm font-semibold">Our Playlist</p><p className="mt-1 text-xs text-[#cfb5c4]">Play your special songs together.</p></div><div className="rounded-2xl bg-white/6 p-3 text-center"><div className="text-2xl">📸</div><p className="mt-1 text-sm font-semibold">Memory Reel</p><p className="mt-1 text-xs text-[#cfb5c4]">Relive every photo and moment.</p></div></div> : <p className="mt-4 leading-relaxed text-[#cfb5c4]">Tap the gift to open three little birthday surprises made with love.</p>}<p className="mt-5 leading-relaxed text-[#ffe3ef]">Meri jaan, tum mere ho. Bhagwan tujhe hamesha khush rakhe. Tu mere liye sabse khaas hai.<br /><br />I love you more than words can say. ♡</p><button onClick={() => setSurpriseOpen(false)} className="primary-romance-button mt-5">Close</button></div></div>}
        <Confetti active={surpriseOpen} />
        {popup && <div className="modal-backdrop !z-[2000]"><button onClick={() => setPopup(null)} aria-label="Close note" className="absolute top-5 right-5 text-3xl text-[#ffb6d4] transition hover:rotate-90">×</button><button onClick={() => setFlipped(!flipped)} className="h-100 w-80 [perspective:1000px]"><div className={`relative h-full w-full rounded-[2rem] transition-transform duration-600 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}><div className="popup-face absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] p-6 text-center [backface-visibility:hidden]"><div className="text-4xl text-[#ff9ac5]">“</div><p className="mt-4 font-display text-xl leading-relaxed">{popup.text}</p><small className="mt-4 text-[#cfb5c4]">{new Date(popup.createdAt).toLocaleString()}</small><span className="mt-6 text-[0.65rem] uppercase tracking-[.18em] text-[#ff9ac5]">Tap to turn</span></div><div className="popup-face absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"><div className="text-4xl text-[#ff9ac5]">♡</div><p className="mt-4 leading-relaxed">Babu gussa kyu kar raha hai?<br /><br />Bachha, saath hu na tere mein phir—hamesha rahunga.</p></div></div></button></div>}
        {pinDialogOpen && <div className="modal-backdrop"><form onSubmit={e => { e.preventDefault(); verifyAdminPin(); }} className="dialog-card"><span className="eyebrow">Private little corner</span><h2 className="mt-2 text-3xl">Admin Access</h2><p className="mt-2 text-sm text-[#cfb5c4]">Enter your Admin PIN (minimum 6 characters).</p><input autoFocus type="password" minLength={6} value={pin} onChange={e => setPin(e.target.value)} className="dialog-input mt-5 p-3 text-center text-xl tracking-[.5em]" aria-label="Admin PIN" /><div className="mt-5 flex gap-3"><button disabled={pinChecking} type="button" onClick={() => { setPinDialogOpen(false); setPin(''); }} className="ghost-button flex-1 disabled:opacity-50">Cancel</button><button disabled={pinChecking || pin.length < 6} type="submit" className="primary-romance-button flex-1">{pinChecking ? 'Checking…' : 'Unlock'}</button></div></form></div>}
        <aside className={`admin-drawer ${adminOpen ? 'admin-drawer-open' : 'admin-drawer-closed'}`}>
          <div className="flex items-center justify-between">
            <div><span className="eyebrow">Private controls</span><h3 className="mt-1 text-3xl">Admin Zone</h3></div>
            <button onClick={() => setAdminOpen(false)} aria-label="Close Admin Zone" className="ghost-button !min-h-10 !w-10 !p-0 text-xl">×</button>
          </div>
          <div className="admin-card">
            <h4 className="font-semibold text-[#ffe3ef]">Upload a memory</h4>
            <p className="mt-1 text-xs text-[#cfb5c4]">The photo will appear in your shared gallery.</p>
            <input ref={photoInputRef} type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} className="admin-file-input" />
            <button disabled={uploading} onClick={uploadPhoto} className="primary-romance-button mt-3 w-full">{uploading ? 'Uploading…' : 'Upload photo  →'}</button>
            <div className="admin-photo-grid">{photos.map(photo => <div className="admin-photo-item" key={photo.id}><img src={`${API_BASE}/photos/${photo.id}/image`} alt="Uploaded" onError={e => { e.currentTarget.src = 'https://placehold.co/70x60/351029/ffb6d4?text=?'; }} /><button onClick={() => deletePhoto(photo.id)} className="delete-photo-button">Delete</button></div>)}</div>
          </div>
          <div className="admin-card admin-album-card">
            <div className="admin-card-heading">
              <div>
                <h4 className="font-semibold text-[#ffe3ef]">Albums</h4>
                <p className="mt-1 text-xs text-[#cfb5c4]">Create a named album, then add photos or videos.</p>
              </div>
              <span aria-hidden="true">▣</span>
            </div>

            <form onSubmit={event => { event.preventDefault(); createAlbum(); }} className="admin-album-create">
              <input
                type="text"
                maxLength="80"
                value={albumName}
                onChange={event => setAlbumName(event.target.value)}
                placeholder="Album name — e.g. NIT Memories"
                className="admin-album-input"
                aria-label="New album name"
              />
              <button disabled={creatingAlbum || !albumName.trim()} type="submit" className="primary-romance-button">
                {creatingAlbum ? 'Creating…' : 'Create album'}
              </button>
            </form>

            <div className="admin-album-upload">
              <label htmlFor="album-select">Choose album</label>
              <select id="album-select" value={albumTargetId} onChange={event => setAlbumTargetId(event.target.value)} className="admin-album-select">
                <option value="">Select an album</option>
                {albums.map(album => <option value={entityId(album)} key={entityId(album)}>{album.name}</option>)}
              </select>
              <input
                ref={albumFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,.mov"
                multiple
                onChange={event => setAlbumFiles(Array.from(event.target.files ?? []))}
                className="admin-file-input"
              />
              {albumFiles.length > 0 && <p className="admin-selected-files">{albumFiles.length} file{albumFiles.length === 1 ? '' : 's'} selected · photos/videos</p>}
              <button disabled={uploadingAlbumMedia || !albumFiles.length} type="button" onClick={uploadAlbumFiles} className="primary-romance-button mt-3 w-full">
                {uploadingAlbumMedia ? `Saving ${albumUploadProgress}…` : 'Save to album  →'}
              </button>
              <p className="admin-auto-date">Date upload ke din backend automatically save karega.</p>
            </div>

            {albumNotice && <p className="admin-album-notice" role="status">{albumNotice}</p>}

            <div className="admin-album-list">
              {albums.map(album => {
                const albumId = entityId(album);
                const mediaItems = albumMedia(album);
                return <section className="admin-album-item" key={albumId}>
                  <header>
                    <div><strong>{album.name}</strong><small>{mediaItems.length} memories</small></div>
                    <button type="button" onClick={() => deleteAlbum(albumId, album.name)} aria-label={`Delete album ${album.name}`}>Delete</button>
                  </header>
                  {mediaItems.length > 0 && <div className="admin-album-media-list">
                    {mediaItems.map(media => {
                      const mediaId = entityId(media);
                      return <div className="admin-album-media" key={mediaId}>
                        {isVideoMedia(media)
                          ? <video src={albumMediaUrl(albumId, mediaId)} muted playsInline preload="metadata" />
                          : <img src={albumMediaUrl(albumId, mediaId)} alt={media.originalName || 'Album memory'} loading="lazy" />}
                        <button type="button" onClick={() => deleteAlbumMedia(albumId, mediaId)} aria-label="Delete this album memory">×</button>
                      </div>;
                    })}
                  </div>}
                </section>;
              })}
            </div>
          </div>
          <div className="admin-card">
            <h4 className="font-semibold text-[#ffe3ef]">Add a feeling</h4>
            <p className="mt-1 text-xs text-[#cfb5c4]">Write anything that should live in the cloud.</p>
            <textarea rows="3" value={frustText} onChange={e => setFrustText(e.target.value)} placeholder="Write frustration or emotion..." className="admin-textarea mt-3 resize-none p-3" />
            <button onClick={addFrustration} className="primary-romance-button mt-3 w-full">Add to cloud  ♡</button>
            {frustrations.length > 0 && <div className="admin-frustration-list">
              {frustrations.map(frustration => {
                const frustrationId = entityId(frustration);
                return <div className="admin-frustration-item" key={frustrationId ?? frustration.createdAt}>
                  <span>{String(frustration.text ?? '').slice(0, 90)}</span>
                  {frustrationId && <button type="button" onClick={() => deleteFrustration(frustrationId)} aria-label="Delete this feeling">Delete</button>}
                </div>;
              })}
            </div>}
          </div>
        </aside>
        <div className="mobile-floating-actions">
          <button data-music-control onClick={toggleMusic} aria-label={musicOn ? 'Pause music' : 'Play music'} className="topbar-button glass-panel">{musicOn ? activeTrack === 'birthday' ? '♫ Birthday' : '♫ Playing' : '♪ Music'}</button>
          <button onClick={() => isAdmin ? setAdminOpen(!adminOpen) : setPinDialogOpen(true)} className="primary-romance-button">{isAdmin ? 'Admin Zone' : 'Admin Access'}</button>
        </div>
      </main>
      <MidnightCinematic open={cinematicOpen} onFinish={finishCinematic} />
      {birthdayJourneyOpen && <BirthdayJourney photos={journeyPhotos} onClose={closeBirthdayJourney} onEnterWorld={startBirthdayMusic} />}
    </>
  );
}
