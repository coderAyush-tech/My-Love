import { useEffect, useMemo, useRef, useState } from 'react';

const cinematicStages = {
  darkness: 0,
  heartbeat: 1,
  message: 2,
  gift: 3,
  cake: 4,
  wish: 5,
};

function RosePetals({ visible }) {
  const petals = useMemo(() => Array.from({ length: 34 }, (_, index) => ({
    id: index,
    left: `${(index * 29 + 7) % 100}%`,
    delay: `${(index % 11) * -0.65}s`,
    duration: `${7 + (index % 6) * 0.8}s`,
    drift: `${(index % 2 ? 1 : -1) * (35 + (index % 5) * 12)}px`,
    size: `${0.7 + (index % 5) * 0.13}rem`,
  })), []);

  if (!visible) return null;

  return <div className="cinematic-petals" aria-hidden="true">
    {petals.map(petal => <span
      key={petal.id}
      className="cinematic-petal"
      style={{
        left: petal.left,
        animationDelay: petal.delay,
        animationDuration: petal.duration,
        '--petal-drift': petal.drift,
        fontSize: petal.size,
      }}
    >❧</span>)}
  </div>;
}

function CelebrationCake({ onCandlesOut }) {
  const [candlesOut, setCandlesOut] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [micStatus, setMicStatus] = useState('idle');
  const holdFrameRef = useRef(null);
  const micFrameRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const finishTimerRef = useRef(null);

  function stopMicrophone() {
    if (micFrameRef.current) cancelAnimationFrame(micFrameRef.current);
    micFrameRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close().catch(() => {});
    audioContextRef.current = null;
  }

  function extinguishCandles() {
    if (candlesOut) return;
    setCandlesOut(true);
    setHoldProgress(100);
    setMicStatus('success');
    stopMicrophone();
    if (holdFrameRef.current) cancelAnimationFrame(holdFrameRef.current);
    finishTimerRef.current = setTimeout(onCandlesOut, 1300);
  }

  function startHold() {
    if (candlesOut || holdFrameRef.current) return;
    const startedAt = performance.now();
    const update = now => {
      const progress = Math.min(100, ((now - startedAt) / 2200) * 100);
      setHoldProgress(progress);
      if (progress >= 100) {
        holdFrameRef.current = null;
        extinguishCandles();
        return;
      }
      holdFrameRef.current = requestAnimationFrame(update);
    };
    holdFrameRef.current = requestAnimationFrame(update);
  }

  function stopHold() {
    if (holdFrameRef.current) cancelAnimationFrame(holdFrameRef.current);
    holdFrameRef.current = null;
    if (!candlesOut) setHoldProgress(0);
  }

  async function startMicrophone() {
    if (candlesOut || micStatus === 'listening') return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicStatus('unsupported');
      return;
    }

    setMicStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.38;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      let blowFrames = 0;

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      setMicStatus('listening');

      const listen = () => {
        analyser.getByteFrequencyData(data);
        const average = data.reduce((sum, value) => sum + value, 0) / data.length;
        blowFrames = average > 24 ? blowFrames + 1 : Math.max(0, blowFrames - 2);
        if (blowFrames >= 8) {
          extinguishCandles();
          return;
        }
        micFrameRef.current = requestAnimationFrame(listen);
      };
      micFrameRef.current = requestAnimationFrame(listen);
    } catch (error) {
      stopMicrophone();
      setMicStatus('denied');
    }
  }

  useEffect(() => () => {
    if (holdFrameRef.current) cancelAnimationFrame(holdFrameRef.current);
    holdFrameRef.current = null;
    stopMicrophone();
    if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
  }, []);

  const micMessage = {
    idle: 'Mic se blow karo ya button hold karo.',
    requesting: 'Microphone permission ka wait ho raha hai…',
    listening: 'Listening… ab candles ki taraf blow karo.',
    denied: 'Mic available nahi hua—hold button use karo.',
    unsupported: 'Is browser mein mic detection nahi hai—hold button use karo.',
    success: 'Wish received. Candles are out ♡',
  }[micStatus];

  return <div className="birthday-cake-scene">
    <p className="cinematic-kicker">One breath · One wish</p>
    <h2 className="cinematic-cake-title">Make a wish, Babbu.</h2>
    <p className="cinematic-cake-copy">Meri wish har baar bas tumhari khushi hoti hai.</p>

    <div className={`birthday-cake ${candlesOut ? 'birthday-cake-out' : ''}`} aria-label={candlesOut ? 'Birthday candles blown out' : 'Birthday cake with lit candles'}>
      <div className="cake-candles">
        {[0, 1, 2].map(candle => <span className="cake-candle" key={candle}>
          <span className="cake-flame" />
        </span>)}
      </div>
      <div className="cake-layer cake-layer-top"><span className="cake-icing" /></div>
      <div className="cake-layer cake-layer-middle"><span className="cake-icing" /></div>
      <div className="cake-layer cake-layer-bottom"><span className="cake-icing" /></div>
      <div className="cake-plate" />
    </div>

    <p className="cinematic-mic-status" aria-live="polite">{micMessage}</p>
    <div className="cinematic-cake-actions">
      <button type="button" onClick={startMicrophone} disabled={candlesOut || micStatus === 'requesting' || micStatus === 'listening'} className="cinematic-mic-button">
        {micStatus === 'listening' ? 'Listening…' : 'Use microphone'} <span aria-hidden="true">◉</span>
      </button>
      <button
        type="button"
        disabled={candlesOut}
        onPointerDown={event => { event.currentTarget.setPointerCapture?.(event.pointerId); startHold(); }}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        onKeyDown={event => { if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) { event.preventDefault(); startHold(); } }}
        onKeyUp={event => { if (event.key === ' ' || event.key === 'Enter') stopHold(); }}
        className="cinematic-hold-button"
        style={{ '--hold-progress': `${holdProgress * 3.6}deg` }}
      >
        <span>{candlesOut ? 'Candles out ♡' : 'Hold to blow'}</span>
        {!candlesOut && <small>{Math.round(holdProgress)}%</small>}
      </button>
    </div>
    <p className="cinematic-privacy-note">Microphone sirf hawa ki intensity detect karta hai. Audio record ya upload nahi hota.</p>
  </div>;
}

export default function MidnightCinematic({ open, onFinish }) {
  const [stage, setStage] = useState('darkness');

  useEffect(() => {
    if (!open) return undefined;
    setStage('darkness');
    const timers = [
      setTimeout(() => setStage('heartbeat'), 850),
      setTimeout(() => setStage('message'), 2600),
      setTimeout(() => setStage('gift'), 5200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [open]);

  useEffect(() => {
    if (!open || stage !== 'heartbeat') return undefined;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return undefined;
    let audioContext;
    let heartbeatTimer;

    try {
      audioContext = new AudioContext();
      const beat = delay => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(68, audioContext.currentTime + delay);
        gain.gain.setValueAtTime(0.0001, audioContext.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.38, audioContext.currentTime + delay + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + delay + 0.18);
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start(audioContext.currentTime + delay);
        oscillator.stop(audioContext.currentTime + delay + 0.2);
      };
      const heartbeat = () => { beat(0); beat(0.22); };
      audioContext.resume().then(heartbeat).catch(() => {});
      heartbeatTimer = setInterval(heartbeat, 1200);
    } catch (error) {
      return undefined;
    }

    return () => {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (audioContext && audioContext.state !== 'closed') audioContext.close().catch(() => {});
    };
  }, [open, stage]);

  if (!open) return null;

  const stageNumber = cinematicStages[stage];
  const petalsVisible = stageNumber >= cinematicStages.message;

  return <div className={`midnight-cinematic midnight-stage-${stage}`} role="dialog" aria-modal="true" aria-label="Midnight birthday surprise">
    <div className="cinematic-stars" aria-hidden="true" />
    <RosePetals visible={petalsVisible} />

    {stage === 'darkness' && <div className="cinematic-darkness" aria-live="polite">
      <span>Shh… midnight is here.</span>
    </div>}

    {stage === 'heartbeat' && <div className="cinematic-heartbeat" aria-live="polite">
      <span className="cinematic-heart">♥</span>
      <p>Can you feel it?</p>
    </div>}

    {stage === 'message' && <div className="cinematic-midnight-message" aria-live="polite">
      <p className="cinematic-kicker">The wait is over</p>
      <h1>28 August is<br /><em>finally here.</em></h1>
      <p>Tonight, this little world belongs only to you.</p>
    </div>}

    {stage === 'gift' && <div className="cinematic-gift-scene" aria-live="polite">
      <p className="cinematic-kicker">Made with every piece of my heart</p>
      <h2>One gift. Seven chapters. A lifetime of us.</h2>
      <button type="button" onClick={() => setStage('cake')} className="cinematic-gift-button" aria-label="Open your birthday gift">
        <span className="cinematic-gift-lid"><span /></span>
        <span className="cinematic-gift-box"><span /></span>
        <small>Tap to open</small>
      </button>
    </div>}

    {stage === 'cake' && <CelebrationCake onCandlesOut={() => setStage('wish')} />}

    {stage === 'wish' && <div className="cinematic-final-wish" aria-live="polite">
      <span className="cinematic-wish-ring">♡</span>
      <p className="cinematic-kicker">Your wish is safe with me</p>
      <h2>Happy Birthday,<br /><em>my favourite person.</em></h2>
      <p>Ab tumhare liye banayi hui duniya ka har darwaza khul chuka hai.</p>
      <button type="button" onClick={onFinish} className="cinematic-enter-button">Enter your birthday world&nbsp; →</button>
    </div>}
  </div>;
}
