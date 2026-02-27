import { useState, useEffect, useRef, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ─── Particle config (static, outside component to avoid re-creation) ───────
const PARTICLES = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.8 + 0.4,
  speed: Math.random() * 0.22 + 0.07,
  opacity: Math.random() * 0.5 + 0.1,
  drift: (Math.random() - 0.5) * 0.15,
}));

const STRENGTH_LABELS = ['', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

const STATS = [
  { v: '10K+', l: 'Tickets resolved' },
  { v: '99.2%', l: 'SLA compliance' },
  { v: '50+', l: 'Active agents' },
];

function calcStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const SignupPage = () => {
  // ─── Auth + routing (from File 1) ────────────────────────────────────────
  const { signup, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated (from File 1)
  if (isAuthenticated && user) {
    if (user.role === 'superadmin') { navigate('/superadmin/dashboard'); return null; }
    if (user.role === 'agent')      { navigate('/agent/dashboard');      return null; }
    navigate('/dashboard');
    return null;
  }

  // ─── Form state ──────────────────────────────────────────────────────────
  // Split into first/last for the two-column UI, joined for the API call
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [focused,   setFocused]   = useState('');
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [hovered,   setHovered]   = useState(false);

  const canvasRef  = useRef(null);
  const animRef    = useRef(null);
  const psRef      = useRef(PARTICLES.map(p => ({ ...p })));
  const curTarget  = useRef({ x: -100, y: -100 });
  const curCurrent = useRef({ x: -100, y: -100 });

  const strength = calcStrength(password);

  // ─── Custom cursor ───────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = e => { curTarget.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', onMove);
    let frame;
    const loop = () => {
      curCurrent.current.x += (curTarget.current.x - curCurrent.current.x) * 0.11;
      curCurrent.current.y += (curTarget.current.y - curCurrent.current.y) * 0.11;
      setCursorPos({ x: curCurrent.current.x, y: curCurrent.current.y });
      frame = requestAnimationFrame(loop);
    };
    loop();
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(frame); };
  }, []);

  // ─── Particle canvas ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    const resize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };
    window.addEventListener('resize', resize);
    const ps = psRef.current;
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.004;
      ps.forEach(p => {
        p.y -= p.speed * 0.1; p.x += p.drift * Math.sin(t + p.id * 0.5);
        if (p.y < -2) p.y = 102; if (p.x < -2) p.x = 102; if (p.x > 102) p.x = -2;
        const px = (p.x / 100) * w, py = (p.y / 100) * h;
        const rgb = p.id % 3 === 0 ? '130,70,255' : p.id % 3 === 1 ? '255,80,160' : '40,210,255';
        ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${p.opacity * (0.6 + 0.4 * Math.sin(t * 1.5 + p.id))})`; ctx.fill();
      });
      for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
        const dx = (ps[i].x - ps[j].x) / 100 * w, dy = (ps[i].y - ps[j].y) / 100 * h;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.beginPath(); ctx.moveTo((ps[i].x / 100) * w, (ps[i].y / 100) * h);
          ctx.lineTo((ps[j].x / 100) * w, (ps[j].y / 100) * h);
          ctx.strokeStyle = `rgba(120,60,255,${(1 - d / 100) * 0.07})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);

  // ─── Submit handler (validation from File 1 + API call from File 1) ──────
  const handleSubmit = async e => {
    e.preventDefault();

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    // Frontend validation (mirrors backend rules from File 1)
    if (fullName.length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      toast.error('Invalid email address');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[a-z]/.test(password)) {
      toast.error('Password must contain at least one lowercase letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      toast.error('Password must contain at least one number');
      return;
    }

    setLoading(true);
    // Actual API call via AuthContext (from File 1)
    const success = await signup(fullName, email, password);
    setLoading(false);

    if (success) {
      toast.success('Account created successfully! Please login.');
      navigate('/login');           // react-router navigation (from File 1)
    } else {
      toast.error('Signup failed. Please check your input or try again.');
    }
  };

  const hi = val => () => setHovered(val);

  const rules = [
    { ok: password.length >= 8,   label: '8+ chars' },
    { ok: /[A-Z]/.test(password), label: 'Uppercase' },
    { ok: /[a-z]/.test(password), label: 'Lowercase' },
    { ok: /[0-9]/.test(password), label: 'Number' },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#03030a;
          --sf:rgba(255,255,255,0.035);--sfh:rgba(255,255,255,0.06);
          --bd:rgba(255,255,255,0.072);--bdb:rgba(255,255,255,0.15);
          --bdf:rgba(124,58,237,0.6);
          --v:#7c3aed;--vl:#a78bfa;--pk:#ec4899;--cy:#22d3ee;
          --tx:#f8f7ff;--ts:rgba(248,247,255,0.54);--tm:rgba(248,247,255,0.28);
        }
        html,body{height:100%;overflow:hidden}
        @media(max-width:860px){html,body{overflow:auto}}
        body{background:var(--bg);color:var(--tx);font-family:'DM Sans',sans-serif;cursor:none;line-height:1.6}
        ::selection{background:rgba(124,58,237,.35)}

        /* ── Custom cursor ── */
        .cd{position:fixed;z-index:9999;pointer-events:none;width:7px;height:7px;border-radius:50%;
            background:#fff;margin:-3.5px 0 0 -3.5px;mix-blend-mode:difference}
        .cr{position:fixed;z-index:9998;pointer-events:none;width:36px;height:36px;border-radius:50%;
            border:1.5px solid rgba(167,139,250,.44);margin:-18px 0 0 -18px;
            transition:width .28s,height .28s,margin .28s,border-color .28s,background .28s}
        .cr.big{width:56px;height:56px;margin:-28px 0 0 -28px;
                border-color:rgba(167,139,250,.9);background:rgba(124,58,237,.09)}

        canvas{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.52}
        body::after{content:'';position:fixed;inset:0;z-index:1;pointer-events:none;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity:.022}

        .wrap{position:relative;z-index:2;min-height:100vh;display:flex}

        /* ── Form side ── */
        .form-side{
          width:58%;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          padding:48px 72px;position:relative;overflow:hidden;
          border-right:1px solid var(--bd);
        }
        @media(max-width:860px){.form-side{width:100%;border-right:none;padding:40px 24px}}

        .form-orb{position:absolute;width:480px;height:480px;border-radius:50%;filter:blur(110px);
          pointer-events:none;
          background:radial-gradient(circle,rgba(124,58,237,.1),transparent 70%);
          top:50%;left:50%;transform:translate(-50%,-50%)}

        .form-card{width:100%;max-width:560px;position:relative;z-index:2;
          animation:fu .8s cubic-bezier(.16,1,.3,1) both}
        @keyframes fu{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}

        .card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:40px}
        .brand{display:flex;align-items:center;gap:10px;text-decoration:none;
          font-family:'Cabinet Grotesk',sans-serif;font-weight:800;font-size:17px;color:var(--tx)}
        .lgem{width:32px;height:32px;flex-shrink:0}.lgem svg{width:100%;height:100%}

        /* back-link now uses react-router <Link> but same class */
        .back-link{font-size:13px;color:var(--tm);text-decoration:none;
          display:flex;align-items:center;gap:6px;transition:color .2s}
        .back-link:hover{color:var(--ts)}

        .form-eyebrow{font-size:11px;font-weight:700;letter-spacing:3.5px;text-transform:uppercase;
          color:var(--vl);margin-bottom:10px;display:flex;align-items:center;gap:8px}
        .form-eyebrow::before{content:'';width:20px;height:1px;background:var(--vl)}
        .form-title{font-family:'Cabinet Grotesk',sans-serif;font-size:clamp(28px,3vw,38px);
          font-weight:900;letter-spacing:-1.2px;line-height:1.08;margin-bottom:6px}
        .form-sub{font-size:14px;color:var(--ts);margin-bottom:28px;font-weight:400}

        .social-row{display:flex;gap:10px;margin-bottom:20px}
        .social-btn{flex:1;padding:12px 16px;border-radius:12px;background:var(--sf);
          border:1px solid var(--bd);cursor:none;font-family:'DM Sans',sans-serif;
          font-size:13.5px;font-weight:600;color:var(--ts);display:flex;align-items:center;
          justify-content:center;gap:9px;transition:all .22s ease}
        .social-btn:hover{background:var(--sfh);border-color:var(--bdb);color:var(--tx);transform:translateY(-1px)}
        .s-ico{width:20px;height:20px;flex-shrink:0;display:flex;align-items:center;justify-content:center}

        .divider{display:flex;align-items:center;gap:12px;margin-bottom:24px;color:var(--tm);font-size:12px}
        .divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--bd)}

        .field-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        @media(max-width:500px){.field-row{grid-template-columns:1fr}}

        .field{margin-bottom:16px}
        .field-label{font-size:12px;font-weight:700;color:var(--ts);letter-spacing:.3px;
          margin-bottom:7px;display:flex;align-items:center;gap:5px;transition:color .2s}
        .field-label.on{color:var(--vl)}
        .req{color:var(--pk);font-size:11px}

        .shell{position:relative;display:flex;align-items:center;
          background:rgba(255,255,255,.04);border:1.5px solid var(--bd);
          border-radius:12px;transition:all .24s ease;overflow:hidden}
        .shell::before{content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,rgba(124,58,237,.07),transparent);opacity:0;transition:opacity .24s}
        .shell.on{border-color:var(--bdf);background:rgba(124,58,237,.05);
          box-shadow:0 0 0 3px rgba(124,58,237,.12)}
        .shell.on::before{opacity:1}

        .shell-ico{width:40px;display:flex;align-items:center;justify-content:center;font-size:15px;z-index:1;flex-shrink:0}
        .ifield{flex:1;background:transparent;border:none;outline:none;
          font-family:'DM Sans',sans-serif;font-size:14px;font-weight:400;
          color:var(--tx);padding:13px 12px 13px 0;z-index:1}
        .ifield::placeholder{color:var(--tm)}
        .pw-eye{width:40px;display:flex;align-items:center;justify-content:center;
          cursor:none;font-size:14px;z-index:1;opacity:.45;flex-shrink:0;transition:opacity .2s;
          background:none;border:none}
        .pw-eye:hover{opacity:1}

        .strength-wrap{margin-top:9px}
        .s-bars{display:flex;gap:4px;margin-bottom:5px}
        .s-bar{height:3px;border-radius:100px;flex:1;background:rgba(255,255,255,.08);transition:background .38s ease}
        .s-text{font-size:11.5px;font-weight:600;margin-bottom:8px}
        .rules{display:flex;flex-wrap:wrap;gap:6px}
        .rule{display:flex;align-items:center;gap:4px;font-size:11px;padding:3px 9px;
          border-radius:100px;transition:all .3s;font-weight:500}
        .rule.ok{background:rgba(34,197,94,.12);color:#4ade80;border:1px solid rgba(34,197,94,.2)}
        .rule.no{background:rgba(255,255,255,.04);color:var(--tm);border:1px solid var(--bd)}
        .rdot{width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0}

        .terms-row{display:flex;align-items:flex-start;gap:10px;margin:18px 0 20px;cursor:none}
        .chk-wrap{width:18px;height:18px;border-radius:5px;border:1.5px solid var(--bdb);
          background:rgba(255,255,255,.04);flex-shrink:0;display:flex;align-items:center;
          justify-content:center;margin-top:1px;transition:all .2s;cursor:none}
        .chk-wrap.checked{background:var(--v);border-color:var(--v)}
        .terms-txt{font-size:12.5px;color:var(--ts);line-height:1.55}
        .terms-txt a{color:var(--vl);text-decoration:none;font-weight:600}
        .terms-txt a:hover{text-decoration:underline}

        .sub{width:100%;padding:15px;font-family:'Cabinet Grotesk',sans-serif;
          font-size:15.5px;font-weight:700;letter-spacing:-.1px;
          border:none;border-radius:13px;cursor:none;
          background:linear-gradient(135deg,#7c3aed,#a855f7,#ec4899);
          color:#fff;position:relative;overflow:hidden;
          transition:all .25s ease;display:flex;align-items:center;justify-content:center;gap:8px}
        .sub::before{content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,#6d28d9,#9333ea,#db2777);opacity:0;transition:opacity .25s}
        .sub:not(:disabled):hover::before{opacity:1}
        .sub:not(:disabled):hover{box-shadow:0 0 36px rgba(124,58,237,.65),0 0 70px rgba(124,58,237,.2);transform:translateY(-1px)}
        .sub:disabled{opacity:.5}
        .sub span{position:relative;z-index:1;display:flex;align-items:center;gap:8px}
        .spin{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;
          border-radius:50%;animation:rot .7s linear infinite;flex-shrink:0}
        @keyframes rot{to{transform:rotate(360deg)}}

        .signin-row{text-align:center;margin-top:20px;font-size:13.5px;color:var(--tm)}
        .signin-row a{color:var(--vl);font-weight:700;text-decoration:none}
        .signin-row a:hover{text-decoration:underline}

        /* ── Brand side ── */
        .brand-side{
          flex:1;display:flex;flex-direction:column;justify-content:space-between;
          padding:44px 52px;position:relative;overflow:hidden;
        }
        @media(max-width:860px){.brand-side{display:none}}

        .bo{position:absolute;border-radius:50%;filter:blur(72px);pointer-events:none}
        .bo1{width:520px;height:520px;background:radial-gradient(circle,rgba(124,58,237,.22),transparent 70%);top:-160px;right:-160px}
        .bo2{width:380px;height:380px;background:radial-gradient(circle,rgba(236,72,153,.16),transparent 70%);bottom:-80px;left:-60px}
        .bo3{width:260px;height:260px;background:radial-gradient(circle,rgba(34,211,238,.1),transparent 70%);top:50%;left:20%}

        .bgrid{position:absolute;inset:0;pointer-events:none;
          background-image:linear-gradient(rgba(124,58,237,.04) 1px,transparent 1px),
                           linear-gradient(90deg,rgba(124,58,237,.04) 1px,transparent 1px);
          background-size:48px 48px;
          mask-image:radial-gradient(ellipse 70% 80% at 50% 50%,black,transparent)}

        .ring{position:absolute;border-radius:50%;top:50%;left:50%;
          transform:translate(-50%,-50%);animation:spn 38s linear infinite}
        .ring::before{content:'';position:absolute;border-radius:50%;top:-5px;left:calc(50% - 5px)}
        .r1{width:420px;height:420px;border:1px solid rgba(124,58,237,.1)}
        .r1::before{width:9px;height:9px;background:var(--vl);box-shadow:0 0 18px 4px rgba(167,139,250,.85)}
        .r2{width:290px;height:290px;border:1px solid rgba(236,72,153,.08);
            animation-duration:24s;animation-direction:reverse}
        .r2::before{width:6px;height:6px;top:-3px;left:calc(50% - 3px);
            background:var(--pk);box-shadow:0 0 14px 3px rgba(236,72,153,.85)}
        @keyframes spn{to{transform:translate(-50%,-50%) rotate(360deg)}}

        .b-top{position:relative;z-index:2}
        .b-badge{display:inline-flex;align-items:center;gap:7px;padding:6px 14px 6px 10px;
          background:rgba(124,58,237,.1);border:1px solid rgba(124,58,237,.26);
          border-radius:100px;font-size:12px;font-weight:500;color:var(--vl);margin-bottom:28px}
        .b-dot{width:6px;height:6px;border-radius:50%;background:var(--vl);
          animation:pd 2s ease infinite;flex-shrink:0}
        @keyframes pd{0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,.6)}50%{box-shadow:0 0 0 6px rgba(167,139,250,0)}}
        .b-title{font-family:'Cabinet Grotesk',sans-serif;font-size:clamp(30px,3vw,46px);
          font-weight:900;letter-spacing:-1.5px;line-height:1.06;margin-bottom:16px;position:relative;z-index:2}
        .b-title .gr{background:linear-gradient(135deg,#c4b5fd,#f472b6,#38bdf8);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          background-size:200% 100%;animation:sh 4s ease infinite}
        @keyframes sh{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        .b-it{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;font-size:.9em}
        .b-sub{font-size:14.5px;color:var(--ts);line-height:1.72;max-width:340px;margin-bottom:36px;position:relative;z-index:2}

        .pills{display:flex;flex-direction:column;gap:10px;position:relative;z-index:2}
        .pill{display:flex;align-items:center;gap:12px;padding:13px 16px;
          background:rgba(255,255,255,.028);border:1px solid rgba(255,255,255,.068);
          border-radius:14px;transition:all .3s ease;cursor:none}
        .pill:hover{background:rgba(255,255,255,.05);border-color:rgba(124,58,237,.28);transform:translateX(4px)}
        .pill-ico{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
        .pv{background:rgba(124,58,237,.14);border:1px solid rgba(124,58,237,.22)}
        .pp{background:rgba(236,72,153,.1);border:1px solid rgba(236,72,153,.18)}
        .pc{background:rgba(34,211,238,.08);border:1px solid rgba(34,211,238,.15)}
        .pill-t{font-size:13px;font-weight:700;color:var(--tx);line-height:1.3}
        .pill-s{font-size:11.5px;color:var(--tm);font-weight:400}

        .b-stats{display:flex;align-items:center;gap:0;position:relative;z-index:2}
        .b-stat-v{font-family:'Cabinet Grotesk',sans-serif;font-size:26px;font-weight:900;
          letter-spacing:-1px;background:linear-gradient(135deg,var(--tx),rgba(255,255,255,.5));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .b-stat-l{font-size:11.5px;color:var(--tm);font-weight:500;margin-top:2px}
        .sep{width:1px;height:36px;background:var(--bd);margin:0 24px}
      `}</style>

      {/* Custom cursor dots */}
      <div className="cd" style={{ left: cursorPos.x, top: cursorPos.y }} />
      <div className={`cr${hovered ? ' big' : ''}`} style={{ left: cursorPos.x, top: cursorPos.y }} />

      {/* Particle canvas */}
      <canvas ref={canvasRef} />

      <div className="wrap">

        {/* ════════════════════ FORM SIDE (LEFT) ════════════════════ */}
        <section className="form-side">
          <div className="form-orb" />

          <div className="form-card">
            {/* Header row: brand + back link */}
            <div className="card-top">
              {/* react-router Link for SPA navigation */}
              <Link to="/" className="brand" onMouseEnter={hi(true)} onMouseLeave={hi(false)}>
                <div className="lgem">
                  <svg viewBox="0 0 38 38" fill="none">
                    <polygon points="19,2 36,12 36,26 19,36 2,26 2,12" fill="url(#lg1)"/>
                    <polygon points="19,2 36,12 19,20" fill="rgba(255,255,255,0.16)"/>
                    <polygon points="19,2 2,12 19,20" fill="rgba(255,255,255,0.06)"/>
                    <defs>
                      <linearGradient id="lg1" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                        <stop offset="0%"   stopColor="#7c3aed"/>
                        <stop offset="55%"  stopColor="#a855f7"/>
                        <stop offset="100%" stopColor="#ec4899"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                SupportDesk
              </Link>

              {/* react-router Link — replaces <a href="/login"> */}
              
            </div>

            <div className="form-eyebrow">New Account</div>
            <h1 className="form-title">Create your account</h1>
            <p className="form-sub">Start managing support tickets with enterprise-grade governance.</p>

            {/* Social sign-up buttons (UI only — connect OAuth via AuthContext if needed) */}
            <div className="social-row">
              <button className="social-btn" type="button" onMouseEnter={hi(true)} onMouseLeave={hi(false)}>
                <div className="s-ico">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                Continue with Google
              </button>
              <button className="social-btn" type="button" onMouseEnter={hi(true)} onMouseLeave={hi(false)}>
                <div className="s-ico">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#f25022" d="M1 1h10v10H1z"/>
                    <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                    <path fill="#7fba00" d="M1 13h10v10H1z"/>
                    <path fill="#ffb900" d="M13 13h10v10H13z"/>
                  </svg>
                </div>
                Continue with Microsoft
              </button>
            </div>

            <div className="divider">or sign up with email</div>

            {/* ── Main form — calls handleSubmit which uses AuthContext.signup() ── */}
            <form onSubmit={handleSubmit}>
              {/* Split name fields (joined into fullName inside handleSubmit) */}
              <div className="field-row">
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className={`field-label${focused === 'fname' ? ' on' : ''}`}>
                    First Name <span className="req">*</span>
                  </div>
                  <div className={`shell${focused === 'fname' ? ' on' : ''}`}>
                    <div className="shell-ico">👤</div>
                    <input
                      className="ifield"
                      placeholder="John"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      onFocus={() => setFocused('fname')}
                      onBlur={() => setFocused('')}
                      required
                      autoComplete="given-name"
                      onMouseEnter={hi(true)}
                      onMouseLeave={hi(false)}
                    />
                  </div>
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <div className={`field-label${focused === 'lname' ? ' on' : ''}`}>
                    Last Name <span className="req">*</span>
                  </div>
                  <div className={`shell${focused === 'lname' ? ' on' : ''}`}>
                    <div className="shell-ico">👤</div>
                    <input
                      className="ifield"
                      placeholder="Doe"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      onFocus={() => setFocused('lname')}
                      onBlur={() => setFocused('')}
                      required
                      autoComplete="family-name"
                      onMouseEnter={hi(true)}
                      onMouseLeave={hi(false)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ height: 16 }} />

              {/* Email */}
              <div className="field">
                <div className={`field-label${focused === 'email' ? ' on' : ''}`}>
                  Work Email <span className="req">*</span>
                </div>
                <div className={`shell${focused === 'email' ? ' on' : ''}`}>
                  <div className="shell-ico">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(248,247,255,0.4)' }}>
                      <rect width="20" height="16" x="2" y="4" rx="2"/>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>
                  <input
                    className="ifield"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    required
                    autoComplete="email"
                    onMouseEnter={hi(true)}
                    onMouseLeave={hi(false)}
                  />
                </div>
              </div>

              {/* Password + strength meter */}
              <div className="field">
                <div className={`field-label${focused === 'pw' ? ' on' : ''}`}>
                  Password <span className="req">*</span>
                </div>
                <div className={`shell${focused === 'pw' ? ' on' : ''}`}>
                  <div className="shell-ico">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(248,247,255,0.4)' }}>
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    className="ifield"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('pw')}
                    onBlur={() => setFocused('')}
                    required
                    autoComplete="new-password"
                    onMouseEnter={hi(true)}
                    onMouseLeave={hi(false)}
                  />
                  <button type="button" className="pw-eye"
                    onClick={() => setShowPw(v => !v)}
                    onMouseEnter={hi(true)} onMouseLeave={hi(false)}>
                    {showPw
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>

                {/* Strength indicator — only when user has started typing */}
                {password.length > 0 && (
                  <div className="strength-wrap">
                    <div className="s-bars">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="s-bar" style={{
                          background: i <= strength ? STRENGTH_COLORS[strength] : undefined,
                          transition: `background .38s ease ${i * 0.04}s`,
                        }} />
                      ))}
                    </div>
                    <div className="s-text" style={{ color: STRENGTH_COLORS[strength] }}>
                      {STRENGTH_LABELS[strength]}
                    </div>
                    <div className="rules">
                      {rules.map((r, i) => (
                        <div key={i} className={`rule ${r.ok ? 'ok' : 'no'}`}>
                          <div className="rdot" />
                          {r.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Terms checkbox */}
              <div className="terms-row" onMouseEnter={hi(true)} onMouseLeave={hi(false)}>
                <div className="chk-wrap checked">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="terms-txt">
                  I agree to the{' '}
                  {/* These can be <Link> components if you have route pages for them */}
                  <a href="#" onMouseEnter={hi(true)} onMouseLeave={hi(false)}>Terms of Service</a> and{' '}
                  <a href="#" onMouseEnter={hi(true)} onMouseLeave={hi(false)}>Privacy Policy</a>
                </div>
              </div>

              {/* Submit — disabled while API call is in flight */}
              <button type="submit" className="sub" disabled={loading}
                onMouseEnter={hi(true)} onMouseLeave={hi(false)}>
                <span>
                  {loading
                    ? <><div className="spin" /> Creating account…</>
                    : <>Create Account &nbsp;→</>
                  }
                </span>
              </button>
            </form>

            {/* "Already have an account?" — react-router Link (from File 1) */}
            <div className="signin-row">
              Already have an account?{' '}
              <Link to="/login" onMouseEnter={hi(true)} onMouseLeave={hi(false)}>Sign in</Link>
            </div>
          </div>
        </section>

        {/* ════════════════════ BRAND SIDE (RIGHT) ════════════════════ */}
        <aside className="brand-side">
          <div className="bo bo1" /><div className="bo bo2" /><div className="bo bo3" />
          <div className="bgrid" />
          <div className="ring r1" /><div className="ring r2" />

          <div className="b-top">
            <div className="b-badge"><div className="b-dot" />Enterprise Platform</div>
            <h2 className="b-title">
              Support,<br />
              <span className="gr"><em className="b-it">governed</em> right</span>
            </h2>
            <p className="b-sub">
              A structured, auditable, performance-driven support ecosystem built for teams that care about quality.
            </p>
            <div className="pills">
              {[
                { c: 'pv', icon: '🔐', t: 'Role-Based Access',       s: 'Granular, scoped permissions' },
                { c: 'pp', icon: '📋', t: 'Immutable Audit Trails',   s: 'Every action is logged' },
                { c: 'pc', icon: '⚡', t: 'Real-Time SLA Monitoring', s: 'Zero breaches, always' },
              ].map((p, i) => (
                <div key={i} className="pill" onMouseEnter={hi(true)} onMouseLeave={hi(false)}>
                  <div className={`pill-ico ${p.c}`}>{p.icon}</div>
                  <div>
                    <div className="pill-t">{p.t}</div>
                    <div className="pill-s">{p.s}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="b-stats">
            {STATS.map((s, i) => (
              <Fragment key={i}>
                <div>
                  <div className="b-stat-v">{s.v}</div>
                  <div className="b-stat-l">{s.l}</div>
                </div>
                {i < STATS.length - 1 && <div className="sep" />}
              </Fragment>
            ))}
          </div>
        </aside>

      </div>
    </>
  );
};

export default SignupPage;