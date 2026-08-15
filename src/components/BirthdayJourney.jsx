import { useEffect, useMemo, useRef, useState } from 'react';
import { birthdayConfig } from '../data/birthdayConfig';
import { memories } from '../data/memories';
import { loveReasons } from '../data/loveReasons';
import { letters } from '../data/letters';
import { quizQuestions } from '../data/quizQuestions';

const chapters = [
  ['Our Story', 'The Story I Never Want to End'], ['Little Things', 'Things I Love About You'], ['Open When', "Letters For The Days I Can't Be Beside You"],
  ['Our Movie', 'Our Little Movie'], ['Our Quiz', 'How Well Do You Remember Us?'], ['Hold My Heart', 'A Forever Kind Of Unlock'], ['Final Letter', 'One Last Thing'],
];

function Intro({ onEnter }) {
  return <div className="journey-intro">
    <div className="journey-intro-card">
      <span className="eyebrow">A birthday universe, made for one</span>
      <h1 className="journey-intro-title">28 August is <em>finally here.</em></h1>
      <p className="journey-intro-copy">I&apos;ve been waiting for this moment. Seven little pieces of my heart are waiting on the other side.</p>
      <button onClick={onEnter} className="primary-romance-button">Enter our world&nbsp; →</button>
    </div>
  </div>;
}

function StoryTimeline() { const [selected, setSelected] = useState(0); const memory = memories[selected]; return <section><h3 className="journey-heading">The Story I Never Want to End ❤️</h3><div className="mt-8 grid gap-5 lg:grid-cols-[220px_1fr]"><div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col">{memories.map((item, index) => <button key={item.title} onClick={() => setSelected(index)} className={`min-w-36 rounded-2xl border p-3 text-left transition ${selected === index ? 'border-pink-300 bg-pink-300/15 text-pink-100' : 'border-white/10 bg-black/15 text-pink-100/65 hover:bg-white/10'}`}><small>{item.date}</small><span className="mt-1 block font-semibold">{item.title}</span></button>)}</div><div className="overflow-hidden rounded-3xl border border-pink-100/15 bg-black/20 shadow-2xl"><div className="grid min-h-64 sm:grid-cols-2"><div className="min-h-52 bg-[radial-gradient(circle_at_center,rgba(255,160,200,.28),transparent_60%),#2b1028]"><img src={memory.image} alt={memory.title} className="h-full w-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} /></div><div className="flex flex-col justify-center p-6"><p className="text-sm text-pink-200/60">{memory.date}</p><h4 className="mt-2 font-display text-3xl text-pink-100">{memory.title}</h4><p className="mt-4 leading-relaxed text-pink-50/80">{memory.description}</p></div></div></div></div></section>; }

function LoveCards() {
  const [open, setOpen] = useState(null);

  return <section>
    <h3 className="journey-heading">Little Things About You That Own My Heart</h3>
    <p className="mt-4 max-w-2xl text-pink-100/65">Tumhari har chhoti aadat—tumhara pyaar, gussa aur bachpana—meri duniya ka favourite hissa hai.</p>
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {loveReasons.map((reason, index) => <button
        key={reason.title}
        type="button"
        aria-pressed={open === index}
        onClick={() => setOpen(open === index ? null : index)}
        className="group min-h-40 text-left [perspective:1000px] transition duration-300 hover:-translate-y-1"
      >
        <span className={`relative block h-full min-h-40 w-full rounded-3xl shadow-lg transition-transform duration-500 [transform-style:preserve-3d] ${open === index ? '[transform:rotateY(180deg)]' : ''}`}>
          <span className="absolute inset-0 rounded-3xl border border-pink-100/15 bg-black/20 p-4 [backface-visibility:hidden] group-hover:border-pink-200/35 group-hover:bg-pink-200/8">
            <span className="block text-xs uppercase tracking-[.2em] text-pink-200/55">Tap to reveal</span>
            <span className="mt-5 block font-display text-lg text-pink-50">{reason.title}</span>
            <span className="absolute right-4 bottom-4 text-xl text-pink-200/45">♡</span>
          </span>
          <span className="absolute inset-0 rounded-3xl border border-pink-200/30 bg-gradient-to-br from-pink-300/25 to-purple-500/20 p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <span className="block text-xs uppercase tracking-[.2em] text-pink-200/70">Sirf tumhare liye</span>
            <span className="mt-3 block text-sm leading-relaxed text-pink-50/90">{reason.message}</span>
          </span>
        </span>
      </button>)}
    </div>
  </section>;
}

function Letters() { const [letter, setLetter] = useState(null); return <section><h3 className="journey-heading">Letters For The Days I Can&apos;t Be Beside You 💌</h3><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{letters.map((item, index) => <button key={item.title} onClick={() => setLetter(index)} className="group rounded-3xl border border-pink-100/15 bg-gradient-to-br from-[#4a143e]/80 to-[#220c22]/90 p-5 text-left shadow-lg transition duration-500 hover:-translate-y-2 hover:rotate-1"><span className="text-3xl transition group-hover:-translate-y-1">✉</span><p className="mt-5 font-display text-xl text-pink-100">{item.title}</p><p className="mt-2 text-sm text-pink-100/55">A little piece of me, saved for you.</p></button>)}</div>{letter !== null && <div className="mt-6 rounded-3xl border border-pink-200/25 bg-[#2a0d29]/90 p-6 shadow-[0_0_45px_rgba(255,118,180,.16)]"><button onClick={() => setLetter(null)} className="float-right text-pink-200/70 hover:text-pink-100">Close ×</button><h4 className="font-display text-2xl text-pink-100">{letters[letter].title}</h4><p className="mt-5 whitespace-pre-wrap leading-relaxed text-pink-50/85">{letters[letter].message}</p></div>}</section>; }

function Movie({ photos }) {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const total = photos.length;

  useEffect(() => {
    if (!playing || total < 2) return undefined;
    const timer = setInterval(() => setCurrent(index => (index + 1) % total), 3800);
    return () => clearInterval(timer);
  }, [playing, total]);

  useEffect(() => {
    if (current >= total) setCurrent(0);
  }, [current, total]);

  const move = direction => {
    if (!total) return;
    setCurrent(index => (index + direction + total) % total);
  };

  const getOffset = index => {
    if (!total) return 0;
    let offset = index - current;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    return offset;
  };

  return <section>
    <span className="eyebrow">Every frame is a piece of us</span>
    <h3 className="journey-heading mt-2">Our Little Movie</h3>
    <p className="mt-4 max-w-2xl text-pink-100/65">Saari yaadein, ek-ek karke—jaise dil apni favourite moments dobara jee raha ho.</p>

    {total ? <div className="movie-shell mt-8">
      <div className="movie-stage">
        <div className="movie-ambient" style={{ backgroundImage: `url(${photos[current]?.src})` }} />
        <div className="movie-vignette" />
        {photos.map((photo, index) => {
          const offset = getOffset(index);
          const distance = Math.abs(offset);
          const visible = distance <= 2;
          return <button
            type="button"
            key={photo.id ?? photo.src}
            aria-label={`Show memory ${index + 1}`}
            aria-current={index === current ? 'true' : undefined}
            onClick={() => setCurrent(index)}
            className="movie-slide"
            style={{
              zIndex: 20 - distance,
              opacity: visible ? 1 - distance * 0.25 : 0,
              pointerEvents: visible ? 'auto' : 'none',
              transform: `translateX(${offset * 26}%) translateZ(${-distance * 130}px) rotateY(${offset * -14}deg) scale(${1 - distance * 0.1})`,
            }}
          >
            <img src={photo.src} alt={`Our memory ${index + 1}`} loading={index === current ? 'eager' : 'lazy'} />
            <span className="movie-slide-shine" />
          </button>;
        })}
        <div className="movie-caption">
          <span>Memory {String(current + 1).padStart(2, '0')}</span>
          <strong>Our story, still being written.</strong>
        </div>
      </div>

      <div className="movie-controls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous memory" className="movie-control-button">←</button>
        <button type="button" onClick={() => setPlaying(value => !value)} aria-label={playing ? 'Pause memories' : 'Play memories'} className="movie-play-button">{playing ? 'Pause' : 'Play'} <span>{playing ? 'Ⅱ' : '▶'}</span></button>
        <button type="button" onClick={() => move(1)} aria-label="Next memory" className="movie-control-button">→</button>
      </div>

      <div className="movie-progress" aria-label={`${current + 1} of ${total} memories`}>
        {photos.map((photo, index) => <button type="button" key={photo.id ?? photo.src} onClick={() => setCurrent(index)} aria-label={`Go to memory ${index + 1}`} className={index === current ? 'movie-progress-dot movie-progress-dot-active' : 'movie-progress-dot'} />)}
      </div>
    </div> : <div className="movie-empty mt-8">
      <span className="text-4xl">◇</span>
      <h4 className="mt-4 font-display text-2xl text-pink-100">Our movie is waiting for its first frame.</h4>
      <p className="mt-2 text-sm text-pink-100/60">Admin Zone se photos upload karte hi saari memories yahan automatically aa jayengi.</p>
    </div>}
  </section>;
}

function Quiz() { const [answer, setAnswer] = useState(null); const [index, setIndex] = useState(0); const [score, setScore] = useState(0); const done = index >= quizQuestions.length; const question = quizQuestions[index]; const choose = option => { if (answer !== null) return; const right = option === question.correctAnswer; setAnswer(right); if (right) setScore(value => value + 1); setTimeout(() => { setIndex(value => value + 1); setAnswer(null); }, 950); }; return <section><h3 className="journey-heading">How Well Do You Remember Us? ❤️</h3>{done ? <div className="mt-8 rounded-3xl bg-pink-200/10 p-8 text-center"><p className="text-3xl">{Array.from({ length: quizQuestions.length }, (_, i) => i < score ? '❤️' : '🤍').join(' ')}</p><p className="mt-5 font-display text-2xl text-pink-100">You don&apos;t need a perfect score.<br />You&apos;re already my favourite answer. ❤️</p></div> : <div className="mt-8 rounded-3xl border border-pink-100/15 bg-black/20 p-6"><p className="text-sm text-pink-200/55">Question {index + 1} of {quizQuestions.length}</p><h4 className="mt-3 font-display text-2xl text-pink-100">{question.question}</h4><div className="mt-6 grid gap-3">{question.options.map((option, optionIndex) => <button key={option} onClick={() => choose(optionIndex)} className={`rounded-2xl border p-4 text-left transition ${answer === null ? 'border-white/10 bg-white/5 hover:border-pink-200/40 hover:bg-pink-200/10' : optionIndex === question.correctAnswer ? 'border-emerald-300/50 bg-emerald-300/15' : 'border-white/10 bg-white/5'}`}>{option}</button>)}</div><p className="mt-5 text-sm text-pink-100/60">{answer === true ? 'A perfect little memory. ❤️' : answer === false ? 'Still cute — we will make more memories.' : ''}</p></div>}</section>; }

function HoldHeart() { const [progress, setProgress] = useState(0); const [complete, setComplete] = useState(false); const timer = useRef(null); const start = () => { if (complete) return; const startAt = Date.now(); timer.current = setInterval(() => { const value = Math.min(100, ((Date.now() - startAt) / 5000) * 100); setProgress(value); if (value >= 100) { clearInterval(timer.current); setComplete(true); } }, 30); }; const stop = () => { if (timer.current) clearInterval(timer.current); if (!complete) setProgress(0); }; useEffect(() => () => clearInterval(timer.current), []); return <section className="text-center"><h3 className="journey-heading">There&apos;s one thing you can&apos;t unlock with just a click...</h3>{complete ? <div className="mx-auto mt-9 max-w-3xl rounded-3xl border border-pink-200/25 bg-pink-200/10 p-6 text-left shadow-[0_22px_70px_rgba(10,0,13,.32)] sm:p-9"><p className="text-center font-display text-4xl leading-tight text-pink-100">You didn&apos;t just unlock my heart.<br /><span className="text-[#ff9ac5]">You became its home.</span></p><p className="mt-7 whitespace-pre-line font-display text-lg leading-[1.9] text-pink-50/85">{birthdayConfig.holdHeartMessage}</p><p className="mt-7 text-center text-xs font-semibold uppercase tracking-[.2em] text-pink-200/65">Chosen every day · Loved without conditions</p></div> : <><button onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} className="relative mt-10 grid h-48 w-48 touch-none place-items-center rounded-full border-4 border-pink-200/40 bg-[radial-gradient(circle,rgba(255,179,210,.45),rgba(155,27,103,.35)_45%,rgba(30,7,28,.9)_72%)] shadow-[0_0_55px_rgba(255,123,183,.35)] transition" style={{ transform: `scale(${1 + progress / 300})` }}><span className="absolute inset-2 rounded-full border-4 border-pink-100 transition" style={{ clipPath: `inset(${100 - progress}% 0 0 0)` }} /><span className="font-display text-2xl text-pink-50">Hold My Heart ❤️<small className="mt-2 block text-sm">{Math.round(progress)}%</small></span></button><p className="mt-7 text-pink-100/65">Press and hold for five seconds.</p>{progress > 0 && progress < 100 && <p className="mt-2 text-sm text-pink-200">Don&apos;t let go yet... 🥺</p>}</>}</section>; }

function FinalLetter({ onCelebrate }) { const [secret, setSecret] = useState(false); return <section className="text-center"><p className="journey-heading mx-auto max-w-2xl">There was one last thing I wanted to tell you...<br /><span className="text-pink-100/70">I could build a thousand pages...<br />But none of them could explain what you mean to me.</span></p><div className="mx-auto mt-9 max-w-2xl rounded-[2rem] border border-pink-100/20 bg-[#2a0e29]/85 p-7 text-left shadow-[0_20px_80px_rgba(0,0,0,.35)]"><h3 className="font-display text-4xl italic text-pink-100">To My Favourite Person ❤️</h3><p className="mt-6 whitespace-pre-wrap font-display text-lg leading-relaxed text-pink-50/85">{birthdayConfig.finalLetter}</p><p className="mt-8 text-center font-display text-3xl text-pink-100">Happy Birthday, My Love ❤️</p></div><button onClick={onCelebrate} className="mt-8 rounded-full bg-gradient-to-r from-pink-300 to-rose-400 px-7 py-3 font-semibold text-[#4a0d34] transition hover:-translate-y-1 hover:scale-105">One Last Surprise 🎁</button>{secret && <div className="mx-auto mt-6 max-w-xl text-pink-100/75"><p>This page doesn&apos;t end today.</p><p>This is our little corner of the internet.</p><p>And as long as you&apos;re in my life, our story keeps getting new chapters. ❤️</p><p className="mt-4 font-display text-3xl">To be continued... ∞ ❤️</p></div>}<button onClick={() => setSecret(!secret)} className="mt-8 block w-full text-xs text-pink-100/40 hover:text-pink-100/80">psst... there&apos;s one more thing 👀</button></section>; }

export default function BirthdayJourney({ photos = [], onClose, onEnterWorld }) {
  const [entered, setEntered] = useState(false);
  const [chapter, setChapter] = useState(null);
  const [celebrated, setCelebrated] = useState(false);
  const Content = useMemo(() => [StoryTimeline, LoveCards, Letters, () => <Movie photos={photos} />, Quiz, HoldHeart, () => <FinalLetter onCelebrate={() => setCelebrated(true)} />][chapter], [chapter, photos]);

  if (!entered) return <Intro onEnter={() => { setEntered(true); onEnterWorld?.(); }} />;

  return <div className="birthday-journey">
    <div className="journey-container">
      <div className="journey-topbar">
        <p className="journey-brand">7 Pieces of My Heart</p>
        <button onClick={onClose} className="ghost-button">Return to our page</button>
      </div>

      {celebrated ? <div className="journey-celebration"><div className="journey-celebration-inner">
        <span className="eyebrow">The easiest choice life made for me</span>
        <h2>Somehow, life brought me to <span className="text-[#ff9ac5]">you.</span></h2>
        <p className="mt-6 text-xl text-[#cfb5c4]">Happy Birthday, {birthdayConfig.partnerName} ♡</p>
        <div className="mt-9 text-2xl tracking-[.5em] text-[#ff9ac5]">✦ ♡ ✦ ♡ ✦</div>
      </div></div> : <>
        {chapter === null ? <div className="journey-hub">
          <span className="eyebrow">Seven chapters of us</span>
          <h1 className="journey-hub-title">Pieces of my <em>heart.</em></h1>
          <p className="journey-hub-copy">Seven small doors. Seven chapters of us. Open them slowly, in any order your heart wants.</p>
          <div className="journey-grid">{chapters.map(([label, subtitle], index) => <button key={label} onClick={() => setChapter(index)} className="journey-card">
            <span className="journey-piece-number">PIECE {String(index + 1).padStart(2, '0')}</span>
            <p className="journey-card-title">{label}</p>
            <p className="journey-card-copy">{subtitle}</p>
          </button>)}</div>
        </div> : <div className="journey-content">
          <button onClick={() => setChapter(null)} className="journey-back-button">← All seven pieces</button>
          <Content />
        </div>}
      </>}
    </div>
  </div>;
}
