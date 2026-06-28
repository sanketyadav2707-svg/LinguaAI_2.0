import { useState, useEffect, useRef, CSSProperties } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion'; // ADD THIS LINE
import {
  MessageCircle, X, Send, ArrowRight, Check, Zap, Mic, BookOpen,
  Home, Map, Gamepad2, Settings, ChevronRight, Star, Users, Globe,
  Volume2, Brain, Briefcase, Coffee, Code2, LogOut, Bell, Search,
  Menu, Sparkles, ShieldCheck
} from 'lucide-react';
// ─── Brand palette ────────────────────────────────────────────────────────────
const INDIGO = '#6610f2';
const ORANGE = '#fd7e14';

// ─── Types ───────────────────────────────────────────────────────────────────
type Page = 'landing' | 'auth' | 'dashboard';
type AuthMode = 'signup' | 'login';
type DashSection = 'home' | 'roadmap' | 'practice' | 'settings';
type ChatMsg = { role: 'user' | 'ai'; text: string };

// ─── Floating glass letter config ────────────────────────────────────────────
const GLASS_LETTERS = [
  { char: 'A',  x: 8,  y: 12, size: 96,  dur: 18, tx: 12, ty: -18 },
  { char: 'α',  x: 78, y: 8,  size: 80,  dur: 22, tx: -8, ty: 14  },
  { char: 'B',  x: 55, y: 60, size: 112, dur: 20, tx: 10, ty: -12 },
  { char: 'β',  x: 20, y: 70, size: 72,  dur: 16, tx: -14, ty: 10 },
  { char: 'C',  x: 88, y: 40, size: 88,  dur: 24, tx: 8,  ty: -16 },
  { char: '文', x: 42, y: 20, size: 100, dur: 19, tx: -10, ty: 12 },
  { char: 'Д',  x: 68, y: 80, size: 76,  dur: 21, tx: 14, ty: -10 },
  { char: 'γ',  x: 5,  y: 45, size: 68,  dur: 17, tx: -8, ty: 18  },
  { char: '字', x: 90, y: 70, size: 84,  dur: 23, tx: 10, ty: -14 },
  { char: 'Z',  x: 35, y: 88, size: 92,  dur: 15, tx: -12, ty: 8  },
  { char: 'δ',  x: 60, y: 30, size: 64,  dur: 20, tx: 8,  ty: -10 },
  { char: 'Ω',  x: 15, y: 30, size: 78,  dur: 18, tx: -10, ty: 16 },
];

// ─── Pricing plans ────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: 'Basic', price: '₹49', period: '/month',
    description: 'Perfect for casual learners just getting started.',
    color: '#64748b', badge: '',
    features: ['5 lessons / day', 'Text exercises', 'Progress tracking', 'Community forum'],
    missing: ['Voice AI', 'Offline mode', 'Custom roadmap'],
    cta: 'Start Free',
  },
  {
    name: 'Pro', price: '₹99', period: '/month',
    description: 'Full access for serious language learners.',
    color: INDIGO, badge: 'Most Popular',
    features: ['Unlimited lessons', 'Voice AI conversations', 'Custom roadmap', 'Offline mode', 'Advanced analytics', 'Priority support'],
    missing: [] as string[],
    cta: 'Go Pro',
  },
  {
    name: 'Pro Annual', price: '₹999', period: '/year',
    description: 'All Pro features at the best possible value.',
    color: ORANGE, badge: 'Best Value',
    features: ['Everything in Pro', '2 months free', 'Early feature access', 'Dedicated AI tutor', '1-on-1 coach session', 'Certificate of completion'],
    missing: [] as string[],
    cta: 'Best Value',
  },
];

// ─── Dashboard modules ────────────────────────────────────────────────────────
const MODULES = [
  { title: 'Business English',     icon: Briefcase, color: INDIGO,    students: '12.4k', rating: 4.9, level: 'Intermediate', progress: 35 },
  { title: 'Casual Chat',          icon: Coffee,    color: '#10b981', students: '28.1k', rating: 4.8, level: 'Beginner',     progress: 60 },
  { title: 'Tech & Logic',         icon: Code2,     color: ORANGE,    students: '9.7k',  rating: 4.9, level: 'Advanced',     progress: 20 },
  { title: 'Public Speaking',      icon: Volume2,   color: '#ef4444', students: '6.3k',  rating: 4.7, level: 'Intermediate', progress: 45 },
  { title: 'Literature & Culture', icon: BookOpen,  color: '#8b5cf6', students: '5.1k',  rating: 4.8, level: 'All levels',   progress: 15 },
  { title: 'AI Conversations',     icon: Brain,     color: '#06b6d4', students: '18.9k', rating: 5.0, level: 'All levels',   progress: 70 },
];

// ─── Simple fade-in hook ──────────────────────────────────────────────────────
function useFadeIn(delay = 0) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return visible;
}

// ─── Intersection observer hook for scroll animations ────────────────────────
function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

function fadeStyle(visible: boolean, delay = 0, fromY = 20): CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${fromY}px)`,
    transition: `opacity 0.55s ease ${delay}ms, transform 0.55s ease ${delay}ms`,
  };
}

// ─── Inject keyframes once ───────────────────────────────────────────────────
function useGlobalStyles() {
  useEffect(() => {
    const id = 'lingua-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap');

      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { font-family: 'Inter', system-ui, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; background: #fff; color: #111827; margin: 0; }
      ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 9999px; }
      ::selection { background: rgba(102,16,242,0.14); }

      @keyframes floatA { 0%,100%{transform:translateY(0) rotate(0deg) scale(1)} 25%{transform:translateY(-18px) rotate(3deg) scale(1.03)} 50%{transform:translateY(8px) rotate(-2deg) scale(0.97)} 75%{transform:translateY(-10px) rotate(4deg) scale(1.02)} }
      @keyframes floatB { 0%,100%{transform:translateY(0) rotate(0deg) scale(1)} 30%{transform:translateY(-14px) rotate(-3deg) scale(1.04)} 60%{transform:translateY(10px) rotate(2deg) scale(0.98)} }
      @keyframes floatC { 0%,100%{transform:translateY(0) rotate(0deg) scale(1)} 20%{transform:translateY(12px) rotate(2deg) scale(0.97)} 55%{transform:translateY(-16px) rotate(-4deg) scale(1.03)} 80%{transform:translateY(6px) rotate(1deg) scale(1.01)} }
      @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      @keyframes fadeSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      @keyframes scaleIn { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
      @keyframes ripple { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.5);opacity:0} }
      @keyframes barFill { from{width:0} to{width:var(--w)} }
      @keyframes slideInRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
      @keyframes slideOutRight { from{transform:translateX(0)} to{transform:translateX(100%)} }

      .float-a { animation: floatA var(--dur,18s) ease-in-out infinite; }
      .float-b { animation: floatB var(--dur,20s) ease-in-out infinite; }
      .float-c { animation: floatC var(--dur,22s) ease-in-out infinite; }
      .spin-anim { animation: spin 0.9s linear infinite; }
      .pulse-dot { animation: pulse 1.8s ease-in-out infinite; }
      .ripple-ring { animation: ripple 2s ease-out infinite; }
      .bar-fill { animation: barFill 0.9s ease-out forwards; }

      .card-hover { transition: transform 0.22s ease, box-shadow 0.22s ease; }
      .card-hover:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.1) !important; }

      .btn-primary { background: linear-gradient(135deg, ${INDIGO}, ${ORANGE}); color: white; border: none; cursor: pointer; transition: opacity 0.18s ease, transform 0.15s ease; }
      .btn-primary:hover { opacity: 0.9; }
      .btn-primary:active { transform: scale(0.97); }
      .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

      .input-field { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1.5px solid #e5e7eb; font-size: 14px; color: #1f2937; background: white; outline: none; transition: border-color 0.18s, box-shadow 0.18s; font-family: inherit; }
      .input-field::placeholder { color: #9ca3af; }
      .input-field:focus { border-color: ${INDIGO}; box-shadow: 0 0 0 3px rgba(102,16,242,0.12); }

      .sidebar-enter { animation: slideInRight 0.32s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
      .sidebar-exit { animation: slideOutRight 0.28s ease-in forwards; }

      .nav-active { background: linear-gradient(135deg, rgba(102,16,242,0.09), rgba(253,126,20,0.06)); color: ${INDIGO} !important; }
      .toggle-knob { width: 16px; height: 16px; background: white; border-radius: 9999px; box-shadow: 0 1px 3px rgba(0,0,0,0.2); position: absolute; top: 4px; transition: left 0.25s cubic-bezier(0.34,1.56,0.64,1); }
    `;
    document.head.appendChild(style);
  }, []);
}

// ═══════════════════════════════════════════════════════════════════════════════
// UPGRADED GLASS BACKGROUND (Scroll-Linked)
// ═══════════════════════════════════════════════════════════════════════════════
function GlassBackground({ yOffset }: { yOffset: any }) {
  // Select 8 premium characters for the background
  const activeLetters = GLASS_LETTERS.slice(0, 8);
  
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }} aria-hidden="true">
      {activeLetters.map((l, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: `${l.x}%`,
            top: `${l.y}%`,
            y: yOffset, // This connects the letter to the mouse scroll!
          }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: i * 0.1 }}
        >
          <motion.div
            animate={{ 
              y: [0, l.ty, 0], 
              x: [0, l.tx, 0],
              rotate: [0, i % 2 === 0 ? 5 : -5, 0]
            }}
            transition={{ duration: l.dur, repeat: Infinity, ease: "easeInOut" }}
            style={{
              fontSize: l.size,
              fontWeight: 900,
              lineHeight: 1,
              userSelect: 'none',
              padding: '20px',
              borderRadius: '32px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 8px 32px rgba(31, 38, 135, 0.08)',
            }}
          >
            <span style={{
              background: i % 2 === 0 
                ? `linear-gradient(135deg, ${INDIGO}99, ${ORANGE}99)` 
                : `linear-gradient(135deg, ${ORANGE}99, ${INDIGO}99)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {l.char}
            </span>
          </motion.div>
        </motion.div>
      ))}
      <div style={{ position: 'absolute', top: '25%', left: '25%', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${INDIGO}, transparent)`, opacity: 0.05, transform: 'translate(-50%,-50%)' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${ORANGE}, transparent)`, opacity: 0.04, transform: 'translate(50%,50%)' }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════════
const AI_REPLIES: Record<string, string> = {
  price:    'Our plans start at ₹49/month. Pro Annual at ₹999/year gives best value — 2 free months!',
  refund:   'We offer a 7-day money-back guarantee on all paid plans — no questions asked.',
  voice:    'Voice AI is on Pro and Pro Annual. It uses real-time speech recognition for natural conversations.',
  cancel:   'Cancel anytime from Settings. Access continues until the billing period ends.',
  features: 'Pro includes unlimited lessons, Voice AI, custom roadmaps, offline mode, and priority support.',
};

function AISidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'ai', text: "Hi! I'm your LinguaAI assistant. Ask me anything about courses, pricing, or how to get started!" },
  ]);
  const [animating, setAnimating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setAnimating(true);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send() {
    const text = msg.trim();
    if (!text) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setMsg('');
    setTimeout(() => {
      const key = Object.keys(AI_REPLIES).find(k => text.toLowerCase().includes(k));
      const reply = key ? AI_REPLIES[key] : 'Great question! Visit our Help Centre or contact support@linguaai.in for more.';
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    }, 900);
  }

  if (!open && !animating) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.08)' }}
      />
      <aside
        className={open ? 'sidebar-enter' : 'sidebar-exit'}
        onAnimationEnd={() => { if (!open) setAnimating(false); }}
        style={{
          position: 'fixed', right: 0, top: 0, height: '100%', width: 340,
          zIndex: 50, display: 'flex', flexDirection: 'column',
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(24px)',
          borderLeft: '1px solid rgba(0,0,0,0.07)',
          boxShadow: '-8px 0 48px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 9999, background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
          >
            <X size={15} color="#6b7280" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 9999, background: `linear-gradient(135deg, ${INDIGO}, ${ORANGE})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={12} color="white" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase' }}>LinguaAI Assistant</span>
          </div>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 700, color: '#111827', lineHeight: 1.3, margin: 0 }}>
            How can I<br />
            <span style={{ background: `linear-gradient(135deg, ${INDIGO}, ${ORANGE})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              help you?
            </span>
          </p>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '82%', borderRadius: 18, padding: '10px 14px', fontSize: 13, lineHeight: 1.55,
                ...(m.role === 'user'
                  ? { background: `linear-gradient(135deg, ${INDIGO}, ${ORANGE})`, color: 'white', borderBottomRightRadius: 4 }
                  : { background: '#f1f5f9', color: '#374151', borderBottomLeftRadius: 4 }),
                animation: 'fadeSlideUp 0.3s ease forwards',
              }}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px 24px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', borderRadius: 24, padding: '8px 8px 8px 16px', border: `1.5px solid rgba(102,16,242,0.15)` }}>
            <input
              value={msg}
              onChange={e => setMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask about pricing, features…"
              style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 13, color: '#1f2937', outline: 'none', fontFamily: 'inherit' }}
            />
            <button
              onClick={send}
              style={{ width: 32, height: 32, borderRadius: 12, background: `linear-gradient(135deg, ${INDIGO}, ${ORANGE})`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'opacity 0.15s' }}
            >
              <Send size={13} color="white" />
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 8 }}>Powered by LinguaAI · v2.0</p>
        </div>
      </aside>
    </>
  );
}

// ─── Help Button ──────────────────────────────────────────────────────────────
function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="btn-primary"
      style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 49, display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 9999, fontSize: 14, fontWeight: 600, boxShadow: `0 8px 32px rgba(102,16,242,0.32)`, fontFamily: 'inherit' }}
    >
      <MessageCircle size={15} />
      Help
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRICING CARD
// ═══════════════════════════════════════════════════════════════════════════════
function PricingCard({ plan, index, onGetStarted }: { plan: typeof PLANS[0]; index: number; onGetStarted: () => void }) {
  const { ref, inView } = useInView();
  const isCenter = index === 1;
  return (
    <div
      ref={ref}
      className="card-hover"
      style={{
        ...fadeStyle(inView, index * 120),
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        borderRadius: 24, padding: '28px',
        background: 'white',
        border: isCenter ? `2px solid ${plan.color}` : '1px solid #f1f5f9',
        boxShadow: isCenter ? `0 16px 56px rgba(102,16,242,0.12)` : '0 2px 12px rgba(0,0,0,0.04)',
        transform: isCenter ? 'scale(1.04)' : undefined,
      }}
    >
      {plan.badge && (
        <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', borderRadius: 9999, fontSize: 11, fontWeight: 700, color: 'white', background: `linear-gradient(135deg, ${plan.color}, ${index === 1 ? ORANGE : INDIGO})`, whiteSpace: 'nowrap' }}>
          {plan.badge}
        </div>
      )}
      <div style={{ marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 16, background: `${plan.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
          <Zap size={17} color={plan.color} />
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{plan.name}</h3>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>{plan.description}</p>
      </div>
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 46, fontWeight: 900, color: '#111827' }}>{plan.price}</span>
        <span style={{ fontSize: 13, color: '#9ca3af', marginLeft: 4 }}>{plan.period}</span>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {plan.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
            <div style={{ width: 20, height: 20, borderRadius: 9999, background: `${plan.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Check size={10} color={plan.color} />
            </div>
            {f}
          </li>
        ))}
        {plan.missing.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#9ca3af' }}>
            <div style={{ width: 20, height: 20, borderRadius: 9999, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <X size={10} color="#d1d5db" />
            </div>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={onGetStarted}
        className={index > 0 ? 'btn-primary' : ''}
        style={{ width: '100%', padding: '14px', borderRadius: 18, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', ...(index > 0 ? { background: `linear-gradient(135deg, ${plan.color}, ${index === 1 ? ORANGE : INDIGO})`, color: 'white', border: 'none' } : { background: '#f1f5f9', color: '#334155', border: 'none', transition: 'background 0.18s' }) }}
      >
        {plan.cta}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 1 — UPGRADED LANDING WITH EXTENDED FEATURES
// ═══════════════════════════════════════════════════════════════════════════════
function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const v0 = useFadeIn(0);
  const v1 = useFadeIn(100);
  const v2 = useFadeIn(250);
  const v3 = useFadeIn(400);
  const v4 = useFadeIn(640);

  // Track scroll position to move the background letters
  const { scrollYProgress } = useScroll();
  const yOffset = useTransform(scrollYProgress, [0, 1], [0, -600]); 

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'white', overflowX: 'hidden' }}>
      
      {/* Pass the scroll tracking to the background */}
      <GlassBackground yOffset={yOffset} />

      {/* Navbar */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 64px', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 12, background: `linear-gradient(135deg, ${INDIGO}, ${ORANGE})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Globe size={15} color="white" />
          </div>
          <span style={{ fontWeight: 900, fontSize: 20, color: '#111827' }}>Lingua<span style={{ color: INDIGO }}>AI</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 14, color: '#6b7280', fontWeight: 500 }}>
          <a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s' }}>How it Works</a>
          <a href="#features" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s' }}>Features</a>
          <a href="#pricing" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.15s' }}>Pricing</a>
        </div>
        <button onClick={onGetStarted} className="btn-primary" style={{ padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '100px 24px 140px' }}>
        <div style={{ ...fadeStyle(v0, 0), display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', border: '1px solid #f1f5f9', borderRadius: 9999, padding: '8px 16px', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 28, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: 9999, background: ORANGE, display: 'inline-block' }} />
          Powered by next-gen AI · Version 2.0
        </div>

        <h1 style={{ ...fadeStyle(v1, 0, 28), fontSize: 'clamp(40px, 7vw, 76px)', fontWeight: 900, color: '#111827', lineHeight: 1.05, maxWidth: 850, margin: '0 0 24px' }}>
          Stop memorizing.<br />
          <span style={{ background: `linear-gradient(135deg, ${INDIGO} 20%, ${ORANGE})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Start speaking.
          </span>
        </h1>

        <p style={{ ...fadeStyle(v2), fontSize: 20, color: '#6b7280', maxWidth: 600, marginBottom: 40, lineHeight: 1.6 }}>
          Immerse yourself in real-time AI voice conversations, adaptive roadmaps, and gamified challenges. The ultimate one-stop solution for fluency.
        </p>

        <div style={{ ...fadeStyle(v3), display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
          <button onClick={onGetStarted} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 36px', borderRadius: 9999, fontSize: 18, fontWeight: 700, boxShadow: `0 12px 40px rgba(102,16,242,0.3)`, fontFamily: 'inherit' }}>
            Start Learning Free <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* NEW: Extended Features Section (How it works) */}
      <section id="how-it-works" style={{ position: 'relative', zIndex: 10, padding: '100px 24px', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          
          {(() => { const { ref, inView } = useInView(); return (
            <div ref={ref} style={{ ...fadeStyle(inView), textAlign: 'center', marginBottom: 60 }}>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#111827', margin: 0 }}>
                A completely different <br/> learning experience.
              </h2>
            </div>
          ); })()}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
            {[
              { icon: Map, title: '1. Build Your Roadmap', desc: 'Tell the AI your exact goals. Whether it is an IT interview or traveling to Paris, we generate a day-by-day path.', color: INDIGO },
              { icon: Mic, title: '2. Live Voice Immersion', desc: 'Engage in real-time, spontaneous voice chats. Order coffee, negotiate a salary, or survive a zombie apocalypse in your target language.', color: ORANGE },
              { icon: ShieldCheck, title: '3. Zero Human Judgment', desc: 'Make mistakes freely. Our AI gently corrects your grammar and pronunciation without the anxiety of a classroom.', color: '#10b981' },
            ].map((f, i) => {
              const { ref, inView } = useInView();
              return (
                <div key={f.title} ref={ref} style={{ ...fadeStyle(inView, i * 150), background: 'white', borderRadius: 24, padding: 32, border: '1px solid #f1f5f9', boxShadow: '0 12px 32px rgba(0,0,0,0.03)' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                    <f.icon size={28} color={f.color} />
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: '0 0 12px' }}>{f.title}</h3>
                  <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ position: 'relative', zIndex: 10, padding: '100px 24px', background: 'white' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          {(() => { const { ref, inView } = useInView(); return (
            <div ref={ref} style={{ ...fadeStyle(inView), textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', color: INDIGO, textTransform: 'uppercase', margin: '0 0 12px' }}>Transparent Pricing</p>
              <h2 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: '#111827', margin: 0 }}>
                Simple, honest{' '}
                <span style={{ background: `linear-gradient(135deg, ${INDIGO}, ${ORANGE})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>plans.</span>
              </h2>
            </div>
          ); })()}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'center' }}>
            {PLANS.map((plan, i) => <PricingCard key={plan.name} plan={plan} index={i} onGetStarted={onGetStarted} />)}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid #f1f5f9', padding: '40px 64px', background: 'white', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, fontSize: 14, color: '#9ca3af' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg, ${INDIGO}, ${ORANGE})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Globe size={14} color="white" /></div>
          <span style={{ fontWeight: 800, color: '#374151', fontSize: 16 }}>LinguaAI</span>
        </div>
        <p style={{ margin: 0 }}>© 2026 LinguaAI Technologies. All rights reserved.</p>
        <div style={{ display: 'flex', gap: 24, fontWeight: 500 }}>
          {['Privacy', 'Terms', 'Contact'].map(l => <a key={l} href="#" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}>{l}</a>)}
        </div>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE 2 — AUTH
// ═══════════════════════════════════════════════════════════════════════════════
function AuthPage({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const visible = useFadeIn(50);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(onSuccess, 1200);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f8fafc 100%)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 600, height: 600, borderRadius: '50%', background: `radial-gradient(circle, ${INDIGO}, transparent)`, opacity: 0.04, transform: 'translate(-40%,-40%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${ORANGE}, transparent)`, opacity: 0.04, transform: 'translate(40%,40%)', pointerEvents: 'none' }} />

      <div style={{ ...fadeStyle(visible, 0, 24), width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div style={{ background: 'white', borderRadius: 28, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.09)', border: '1px solid #f1f5f9' }}>
          <div style={{ height: 5, background: `linear-gradient(90deg, ${INDIGO}, ${ORANGE})` }} />
          <div style={{ padding: '36px 40px' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: `linear-gradient(135deg, ${INDIGO}, ${ORANGE})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Globe size={16} color="white" /></div>
              <span style={{ fontWeight: 900, fontSize: 20, color: '#111827' }}>Lingua<span style={{ color: INDIGO }}>AI</span></span>
            </div>

            <h2 style={{ fontSize: 30, fontWeight: 900, color: '#111827', margin: '0 0 6px' }}>{mode === 'signup' ? 'Create account' : 'Welcome back'}</h2>
            <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 28px' }}>{mode === 'signup' ? 'Start your fluency journey today.' : 'Sign in to continue learning.'}</p>

            {/* Google */}
            <button
              onClick={() => { setLoading(true); setTimeout(onSuccess, 1000); }}
              disabled={loading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px', borderRadius: 18, border: '1px solid #e5e7eb', background: 'white', fontSize: 14, fontWeight: 600, color: '#374151', cursor: 'pointer', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', fontFamily: 'inherit', transition: 'background 0.15s' }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.08-6.08C34.36 3.03 29.46 1 24 1 14.82 1 7.06 6.48 3.56 14.22l7.06 5.49C12.36 13.19 17.71 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.5 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.68c-.55 2.96-2.2 5.48-4.7 7.17l7.26 5.64C43.38 37.48 46.5 31.45 46.5 24.5z"/>
                <path fill="#FBBC05" d="M10.62 28.29A14.55 14.55 0 0 1 9.5 24c0-1.49.25-2.93.62-4.29L3.06 14.22A23.44 23.44 0 0 0 1 24c0 3.77.9 7.34 2.5 10.49l7.12-6.2z"/>
                <path fill="#34A853" d="M24 47c5.46 0 10.04-1.81 13.38-4.91l-7.26-5.64c-1.81 1.21-4.12 1.94-6.12 1.94-6.29 0-11.64-3.69-13.38-9.1l-7.12 6.2C7.06 41.52 14.82 47 24 47z"/>
              </svg>
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>or with email</span>
              <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {mode === 'signup' && (
                <div style={{ animation: 'fadeSlideUp 0.25s ease forwards' }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Full Name</label>
                  <input className="input-field" type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Alex Johnson" />
                </div>
              )}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Email</label>
                <input className="input-field" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Password</label>
                <input className="input-field" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '14px', borderRadius: 18, fontSize: 14, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}>
                {loading ? (
                  <><span className="spin-anim" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: 9999, display: 'inline-block' }} />{mode === 'signup' ? 'Creating…' : 'Signing in…'}</>
                ) : mode === 'signup' ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: 14, color: '#6b7280', margin: '20px 0 0' }}>
              {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
              <button onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} style={{ color: INDIGO, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontSize: 14 }}>
                {mode === 'signup' ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
function NavItem({ icon: Icon, label, active, onClick }: { icon: React.ElementType; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={active ? 'nav-active' : ''}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 16, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: active ? INDIGO : '#64748b', background: active ? undefined : 'transparent', transition: 'all 0.18s' }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? `linear-gradient(135deg, ${INDIGO}, ${ORANGE})` : '#f1f5f9', flexShrink: 0, transition: 'all 0.18s' }}>
        <Icon size={15} color={active ? 'white' : '#64748b'} />
      </div>
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
      {active && <ChevronRight size={13} color={INDIGO} />}
    </button>
  );
}

function ModuleCard({ mod, index }: { mod: typeof MODULES[0]; index: number }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className="card-hover"
      style={{ ...fadeStyle(inView, index * 70), background: 'white', borderRadius: 20, padding: 20, border: '1px solid #f1f5f9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: `${mod.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <mod.icon size={21} color={mod.color} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 9999, background: `${mod.color}12`, color: mod.color }}>{mod.level}</span>
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>{mod.title}</h3>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Users size={11} />{mod.students} learners</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Star size={11} fill={ORANGE} color={ORANGE} />{mod.rating}</span>
      </div>
      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 9999, overflow: 'hidden' }}>
        {inView && <div className="bar-fill" style={{ '--w': `${mod.progress}%`, height: '100%', background: `linear-gradient(90deg, ${mod.color}, ${mod.color}88)`, borderRadius: 9999, animationDelay: `${index * 0.07 + 0.3}s` } as CSSProperties} />}
      </div>
      <p style={{ fontSize: 11, color: '#9ca3af', margin: '6px 0 0' }}>{mod.progress}% complete</p>
    </div>
  );
}

function HomeSection() {
  const visible = useFadeIn(50);
  return (
    <div>
      <div style={{ ...fadeStyle(visible, 0, 10), borderRadius: 24, padding: '28px', marginBottom: 28, position: 'relative', overflow: 'hidden', background: `linear-gradient(135deg, ${INDIGO} 0%, ${ORANGE} 100%)` }}>
        <div style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 100, fontWeight: 900, color: 'white', opacity: 0.08, userSelect: 'none' }}>AI</div>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 500, margin: '0 0 4px' }}>Good morning,</p>
        <h2 style={{ color: 'white', fontSize: 28, fontWeight: 900, margin: '0 0 10px' }}>Welcome back, Alex!</h2>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, margin: '0 0 20px' }}>You're on a 7-day streak. Keep it up — 15 min today gets you to your goal.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {[{ value: '7', label: 'Day Streak' }, { value: '1,240', label: 'XP Earned' }, { value: 'B1', label: 'Current Level' }].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 16, padding: '8px 16px', textAlign: 'center' }}>
              <p style={{ color: 'white', fontSize: 20, fontWeight: 900, margin: 0 }}>{s.value}</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#111827', margin: 0 }}>Available Modules</h3>
        <button style={{ fontSize: 13, fontWeight: 600, color: INDIGO, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>View all</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {MODULES.map((mod, i) => <ModuleCard key={mod.title} mod={mod} index={i} />)}
      </div>
    </div>
  );
}

function RoadmapSection() {
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('beginner');
  const [lang, setLang] = useState('Spanish');
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);

  const steps = [
    { week: 'Week 1–2', title: 'Foundations',          desc: 'Alphabet, numbers, basic greetings, phonetics.',          color: INDIGO    },
    { week: 'Week 3–4', title: 'Core Vocabulary',      desc: '500 most-used words, present tense verbs.',              color: '#10b981' },
    { week: 'Week 5–6', title: 'Conversational Basics',desc: 'Daily dialogues, questions, and negation.',              color: ORANGE    },
    { week: 'Week 7–8', title: 'Voice Practice',       desc: 'AI voice calls, pronunciation coaching.',                color: '#ef4444' },
    { week: 'Month 3',  title: `Goal: ${goal || '…'}`, desc: 'Contextual immersion aligned to your personal target.',  color: '#8b5cf6' },
  ];

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: '0 0 6px' }}>AI Roadmap Generator</h2>
      <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>Tell us your goal and we'll build a personalised learning path.</p>
      <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f1f5f9', padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Language Goal</label>
          <input className="input-field" value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. Hold a 10-min business meeting in Spanish" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Language</label>
            <select className="input-field" value={lang} onChange={e => setLang(e.target.value)} style={{ cursor: 'pointer' }}>
              {['Spanish', 'French', 'Japanese', 'Mandarin', 'German', 'Italian', 'Arabic'].map(l => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Current Level</label>
            <select className="input-field" value={level} onChange={e => setLevel(e.target.value)} style={{ cursor: 'pointer' }}>
              {['beginner', 'elementary', 'intermediate', 'advanced'].map(l => <option key={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={() => { if (!goal.trim()) return; setLoading(true); setTimeout(() => { setLoading(false); setGenerated(true); }, 1400); }}
          disabled={loading || !goal.trim()}
          className="btn-primary"
          style={{ padding: '14px', borderRadius: 18, fontSize: 14, fontWeight: 700, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {loading ? (<><span className="spin-anim" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: 9999, display: 'inline-block' }} />Generating…</>) : (<><Sparkles size={14} />Generate My Roadmap</>)}
        </button>
      </div>
      {generated && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeSlideUp 0.4s ease forwards' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase', margin: '0 0 8px' }}>Your personalised {lang} path</p>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, background: 'white', borderRadius: 18, border: '1px solid #f1f5f9', padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', animation: `fadeSlideUp 0.4s ease ${i * 0.08}s forwards`, opacity: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9999, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                {i < steps.length - 1 && <div style={{ width: 2, flex: 1, marginTop: 6, background: `${s.color}40`, minHeight: 16 }} />}
              </div>
              <div style={{ paddingBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.week}</span>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '2px 0 4px' }}>{s.title}</h4>
                <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PracticeSection() {
  const [activeMode, setActiveMode] = useState<'puzzle' | 'voice' | null>(null);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const puzzle = { question: 'Which sentence is grammatically correct?', options: ["She don't know the answer.", "She doesn't knows the answer.", "She doesn't know the answer.", "She not know the answer."], correct: 2 };

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: '0 0 6px' }}>Practice Arena</h2>
      <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>Gamified challenges and voice sessions to build real fluency.</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        {[
          { key: 'puzzle' as const, icon: Gamepad2, label: 'Grammar Puzzles', desc: 'Quick-fire challenges', color: INDIGO },
          { key: 'voice'  as const, icon: Mic,      label: 'Voice Chat',      desc: 'Talk with AI tutor',  color: ORANGE },
        ].map(m => (
          <button key={m.key} onClick={() => setActiveMode(m.key)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10, padding: 20, borderRadius: 18, border: activeMode === m.key ? `2px solid ${m.color}` : '1px solid #f1f5f9', background: activeMode === m.key ? `${m.color}06` : 'white', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s' }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, background: `${m.color}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><m.icon size={17} color={m.color} /></div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 2px' }}>{m.label}</p>
              <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{m.desc}</p>
            </div>
          </button>
        ))}
      </div>
      {activeMode === 'puzzle' && (
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f1f5f9', padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', animation: 'fadeSlideUp 0.3s ease forwards' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 9999, background: `${INDIGO}12`, color: INDIGO }}>Grammar</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: ORANGE }}>Score: {score}</span>
          </div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 18px' }}>{puzzle.question}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {puzzle.options.map((opt, i) => {
              let bg = '#f8fafc', border = '#e5e7eb', color = '#374151';
              if (selected !== null) {
                if (i === puzzle.correct) { bg = '#f0fdf4'; border = '#86efac'; color = '#166534'; }
                else if (i === selected) { bg = '#fef2f2'; border = '#fca5a5'; color = '#991b1b'; }
              }
              return (
                <button key={i} onClick={() => { if (selected !== null) return; setSelected(i); if (i === puzzle.correct) setScore(s => s + 10); }} style={{ textAlign: 'left', padding: '12px 16px', borderRadius: 14, border: `1.5px solid ${border}`, background: bg, color, fontSize: 14, fontWeight: 500, cursor: selected !== null ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                  <span style={{ fontWeight: 700, opacity: 0.4, marginRight: 8 }}>{String.fromCharCode(65 + i)}.</span>{opt}
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <button onClick={() => setSelected(null)} className="btn-primary" style={{ width: '100%', marginTop: 14, padding: '13px', borderRadius: 18, fontSize: 14, fontWeight: 700, fontFamily: 'inherit', animation: 'fadeSlideUp 0.25s ease forwards' }}>
              Next Question
            </button>
          )}
        </div>
      )}
      {activeMode === 'voice' && (
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f1f5f9', padding: '36px 24px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', animation: 'fadeSlideUp 0.3s ease forwards' }}>
          <div style={{ position: 'relative', display: 'inline-flex', marginBottom: 20 }}>
            <div className="ripple-ring" style={{ width: 80, height: 80, borderRadius: 9999, background: `${ORANGE}28` }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 9999, background: `linear-gradient(135deg, ${INDIGO}, ${ORANGE})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={22} color="white" />
              </div>
            </div>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: '0 0 8px' }}>Voice AI Ready</h3>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 22px' }}>Your AI tutor will guide a natural conversation in your chosen language.</p>
          <button className="btn-primary" style={{ padding: '13px 32px', borderRadius: 18, fontSize: 14, fontWeight: 700, fontFamily: 'inherit' }}>Start Conversation</button>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '14px 0 0' }}>Available on Pro and Pro Annual plans</p>
        </div>
      )}
    </div>
  );
}

function SettingsSection({ onLogout }: { onLogout: () => void }) {
  const [notifs, setNotifs] = useState(true);
  const [dailyGoal, setDailyGoal] = useState('15');
  return (
    <div style={{ maxWidth: 520 }}>
      <h2 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: '0 0 6px' }}>Settings</h2>
      <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 24px' }}>Manage your preferences and account.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f1f5f9', padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>Profile</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg, ${INDIGO}, ${ORANGE})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 20, fontWeight: 900 }}>A</div>
            <div>
              <p style={{ fontWeight: 700, color: '#111827', margin: '0 0 2px', fontSize: 15 }}>Alex Johnson</p>
              <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 6px' }}>alex@example.com</p>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, background: `${INDIGO}12`, color: INDIGO }}>Pro Plan</span>
            </div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #f1f5f9', padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Preferences</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', margin: '0 0 2px' }}>Daily Reminders</p>
              <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Push notifications for practice streaks</p>
            </div>
            <button onClick={() => setNotifs(n => !n)} style={{ width: 44, height: 24, borderRadius: 9999, background: notifs ? INDIGO : '#e5e7eb', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.25s', flexShrink: 0 }}>
              <div className="toggle-knob" style={{ left: notifs ? 24 : 4 }} />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', margin: '0 0 2px' }}>Daily Goal</p>
              <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Minutes of study per day</p>
            </div>
            <select value={dailyGoal} onChange={e => setDailyGoal(e.target.value)} style={{ padding: '6px 12px', borderRadius: 12, border: '1px solid #e5e7eb', fontSize: 13, color: '#374151', background: 'white', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
              {['5', '10', '15', '30', '60'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #fee2e2', padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>Account</p>
          <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
            <LogOut size={14} />Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard shell ──────────────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [section, setSection] = useState<DashSection>('home');
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const navItems: { key: DashSection; icon: React.ElementType; label: string }[] = [
    { key: 'home',     icon: Home,     label: 'Home'     },
    { key: 'roadmap',  icon: Map,      label: 'Roadmap'  },
    { key: 'practice', icon: Gamepad2, label: 'Practice' },
    { key: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', overflow: 'hidden' }}>
      {/* Mobile overlay */}
      {mobileSidebar && <div onClick={() => setMobileSidebar(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: 20 }} />}

      {/* Sidebar */}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 240, background: 'white', borderRight: '1px solid #f1f5f9', boxShadow: '2px 0 12px rgba(0,0,0,0.04)', zIndex: 30, display: 'flex', flexDirection: 'column', padding: '20px 10px', transform: mobileSidebar ? 'translateX(0)' : undefined, transition: 'transform 0.28s ease' }}
        className={mobileSidebar ? '' : 'md:translate-x-0 -translate-x-full'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 12px', marginBottom: 28 }}>
          <div style={{ width: 32, height: 32, borderRadius: 12, background: `linear-gradient(135deg, ${INDIGO}, ${ORANGE})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Globe size={15} color="white" /></div>
          <span style={{ fontWeight: 900, fontSize: 19, color: '#111827' }}>Lingua<span style={{ color: INDIGO }}>AI</span></span>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => (
            <NavItem key={item.key} icon={item.icon} label={item.label} active={section === item.key} onClick={() => { setSection(item.key); setMobileSidebar(false); }} />
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '14px 8px 0' }}>
          <div style={{ borderRadius: 18, padding: 16, background: `linear-gradient(135deg, ${INDIGO}0d, ${ORANGE}09)` }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1f2937', margin: '0 0 2px' }}>Upgrade to Pro Annual</p>
            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 10px' }}>Save ₹189 with yearly billing</p>
            <button className="btn-primary" style={{ width: '100%', padding: '9px', borderRadius: 12, fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>Upgrade Now</button>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginLeft: 240 }}>
        {/* Topbar */}
        <header style={{ height: 60, background: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0 }}>
          <button onClick={() => setMobileSidebar(s => !s)} style={{ display: 'none', padding: 8, borderRadius: 12, background: '#f1f5f9', border: 'none', cursor: 'pointer' }}>
            <Menu size={16} color="#374151" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f8fafc', borderRadius: 14, padding: '8px 14px', border: '1px solid #f1f5f9', maxWidth: 280, flex: 1 }}>
            <Search size={13} color="#9ca3af" />
            <input placeholder="Search modules…" style={{ background: 'transparent', border: 'none', fontSize: 13, color: '#374151', outline: 'none', fontFamily: 'inherit', flex: 1 }} />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button style={{ position: 'relative', padding: 8, borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <Bell size={16} color="#6b7280" />
              <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: 9999, background: ORANGE, border: '1.5px solid white' }} />
            </button>
            <div style={{ width: 32, height: 32, borderRadius: 12, background: `linear-gradient(135deg, ${INDIGO}, ${ORANGE})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 13, fontWeight: 900 }}>A</div>
          </div>
        </header>

        {/* Content */}
        <main key={section} style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', animation: 'fadeSlideUp 0.25s ease forwards' }}>
          {section === 'home'     && <HomeSection />}
          {section === 'roadmap'  && <RoadmapSection />}
          {section === 'practice' && <PracticeSection />}
          {section === 'settings' && <SettingsSection onLogout={onLogout} />}
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  useGlobalStyles();
  const [page, setPage] = useState<Page>('landing');
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div style={{ animation: 'scaleIn 0.35s ease forwards' }}>
      {page === 'landing'   && <LandingPage   onGetStarted={() => setPage('auth')} />}
      {page === 'auth'      && <AuthPage       onSuccess={() => setPage('dashboard')} />}
      {page === 'dashboard' && <Dashboard      onLogout={() => setPage('landing')} />}

      <HelpButton onClick={() => setHelpOpen(true)} />
      <AISidebar  open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
