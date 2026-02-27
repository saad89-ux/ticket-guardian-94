import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const PARTICLES = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 1.8 + 0.4,
  speed: Math.random() * 0.22 + 0.07,
  opacity: Math.random() * 0.5 + 0.1,
  drift: (Math.random() - 0.5) * 0.15,
}));

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [shake, setShake] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const psRef = useRef(PARTICLES.map(p => ({ ...p })));
  const curTarget = useRef({ x: -100, y: -100 });
  const curCurrent = useRef({ x: -100, y: -100 });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'superadmin') navigate('/superadmin/dashboard');
      else if (user.role === 'agent') navigate('/agent/dashboard');
      else navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  /* ── smooth cursor ── */
  useEffect(() => {
    const onMove = (e: MouseEvent) => { 
      curTarget.current = { x: e.clientX, y: e.clientY }; 
    };
    window.addEventListener('mousemove', onMove);
    let frame: number;
    const loop = () => {
      curCurrent.current.x += (curTarget.current.x - curCurrent.current.x) * 0.11;
      curCurrent.current.y += (curTarget.current.y - curCurrent.current.y) * 0.11;
      setCursorPos({ x: curCurrent.current.x, y: curCurrent.current.y });
      frame = requestAnimationFrame(loop);
    };
    loop();
    return () => { 
      window.removeEventListener('mousemove', onMove); 
      cancelAnimationFrame(frame); 
    };
  }, []);

  /* ── canvas particles ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; 
    canvas.height = h;
    
    const resize = () => { 
      w = window.innerWidth; 
      h = window.innerHeight; 
      canvas.width = w; 
      canvas.height = h; 
    };
    window.addEventListener('resize', resize);
    
    const ps = psRef.current;
    let t = 0;
    
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.004;
      
      ps.forEach(p => {
        p.y -= p.speed * 0.1; 
        p.x += p.drift * Math.sin(t + p.id * 0.5);
        if (p.y < -2) p.y = 102; 
        if (p.x < -2) p.x = 102; 
        if (p.x > 102) p.x = -2;
        
        const px = (p.x / 100) * w, py = (p.y / 100) * h;
        const rgb = p.id % 3 === 0 ? '130,70,255' : p.id % 3 === 1 ? '255,80,160' : '40,210,255';
        
        ctx.beginPath(); 
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${p.opacity * (0.6 + 0.4 * Math.sin(t * 1.5 + p.id))})`;
        ctx.fill();
      });
      
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = (ps[i].x - ps[j].x) / 100 * w, dy = (ps[i].y - ps[j].y) / 100 * h;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath(); 
            ctx.moveTo((ps[i].x / 100) * w, (ps[i].y / 100) * h);
            ctx.lineTo((ps[j].x / 100) * w, (ps[j].y / 100) * h);
            ctx.strokeStyle = `rgba(120,60,255,${(1 - d / 100) * 0.07})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      
      animRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => { 
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize); 
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast.success('Login successful!');
        // Navigation is handled by the useEffect above
        // But we can also trigger it here for immediate feedback
        if (user?.role === 'superadmin') {
          navigate('/superadmin/dashboard');
        } else if (user?.role === 'agent') {
          navigate('/agent/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error('Invalid credentials or account.');
        setShake(true);
        setTimeout(() => setShake(false), 600);
      }
    } catch (error) {
      toast.error('An error occurred during login.');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  const hi = (v: boolean) => () => setHovered(v);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#03030a;
          --sf:rgba(255,255,255,0.035);--sfh:rgba(255,255,255,0.062);
          --bd:rgba(255,255,255,0.072);--bdb:rgba(255,255,255,0.15);
          --bdf:rgba(124,58,237,0.6);
          --v:#7c3aed;--vl:#a78bfa;--pk:#ec4899;--cy:#22d3ee;
          --tx:#f8f7ff;--ts:rgba(248,247,255,0.54);--tm:rgba(248,247,255,0.28);
        }
        html,body{height:100%;overflow:hidden}
        @media(max-width:860px){html,body{overflow:auto}}
        body{background:var(--bg);color:var(--tx);font-family:'DM Sans',sans-serif;cursor:none;line-height:1.6}
        ::selection{background:rgba(124,58,237,.35)}

        /* ── cursor ── */
        .cd{position:fixed;z-index:9999;pointer-events:none;width:7px;height:7px;border-radius:50%;background:#fff;margin:-3.5px 0 0 -3.5px;mix-blend-mode:difference}
        .cr{position:fixed;z-index:9998;pointer-events:none;width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(167,139,250,.44);margin:-18px 0 0 -18px;transition:width .28s,height .28s,margin .28s,border-color .28s,background .28s}
        .cr.big{width:56px;height:56px;margin:-28px 0 0 -28px;border-color:rgba(167,139,250,.9);background:rgba(124,58,237,.09)}

        canvas{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.52}
        body::after{content:'';position:fixed;inset:0;z-index:1;pointer-events:none;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          opacity:.022}

        /* ── wrap ── */
        .wrap{position:relative;z-index:2;min-height:100vh;display:flex}

        /* ══════════════════════════════
           FORM SIDE — LEFT (58%)
        ══════════════════════════════ */
        .form-side{
          width:58%;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          padding:48px 80px;
          position:relative;overflow:hidden;
          border-right:1px solid var(--bd);
        }
        @media(max-width:860px){.form-side{width:100%;border-right:none;padding:40px 24px}}

        /* ambient glow behind form */
        .form-orb{position:absolute;width:500px;height:500px;border-radius:50%;filter:blur(110px);pointer-events:none;
          background:radial-gradient(circle,rgba(124,58,237,.09),transparent 70%);
          top:50%;left:50%;transform:translate(-50%,-50%)}

        /* card */
        .form-card{
          width:100%;max-width:520px;
          position:relative;z-index:2;
          animation:fu .8s cubic-bezier(.16,1,.3,1) both;
        }
        .form-card.shake{animation:shake .5s cubic-bezier(.36,.07,.19,.97) both}
        @keyframes fu{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shake{0%,100%{transform:translateX(0)}15%{transform:translateX(-8px)}30%{transform:translateX(7px)}45%{transform:translateX(-6px)}60%{transform:translateX(5px)}75%{transform:translateX(-3px)}90%{transform:translateX(2px)}}

        /* top bar */
        .card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:44px}
        .brand{display:flex;align-items:center;gap:10px;text-decoration:none;
          font-family:'Cabinet Grotesk',sans-serif;font-weight:800;font-size:17px;color:var(--tx)}
        .lgem{width:32px;height:32px;flex-shrink:0}.lgem svg{width:100%;height:100%}
        .signup-link{font-size:13px;color:var(--tm);text-decoration:none;display:flex;align-items:center;gap:5px;transition:color .2s}
        .signup-link:hover{color:var(--ts)}
        .signup-link span{padding:5px 13px;border:1px solid var(--bd);border-radius:100px;transition:all .2s;font-size:12.5px;font-weight:600;color:var(--ts)}
        .signup-link:hover span{border-color:var(--bdb);color:var(--tx);background:var(--sfh)}

        /* eyebrow, title */
        .form-eyebrow{font-size:11px;font-weight:700;letter-spacing:3.5px;text-transform:uppercase;
          color:var(--vl);margin-bottom:10px;display:flex;align-items:center;gap:8px}
        .form-eyebrow::before{content:'';width:20px;height:1px;background:var(--vl)}
        .form-title{font-family:'Cabinet Grotesk',sans-serif;font-size:clamp(28px,3vw,40px);
          font-weight:900;letter-spacing:-1.2px;line-height:1.06;margin-bottom:6px}
        .form-sub{font-size:14px;color:var(--ts);margin-bottom:30px;font-weight:400}

        /* social */
        .social-row{display:flex;gap:10px;margin-bottom:20px}
        .s-btn{flex:1;padding:12px 16px;border-radius:12px;background:var(--sf);
          border:1px solid var(--bd);cursor:none;font-family:'DM Sans',sans-serif;
          font-size:13.5px;font-weight:600;color:var(--ts);display:flex;align-items:center;
          justify-content:center;gap:9px;transition:all .22s ease}
        .s-btn:hover{background:var(--sfh);border-color:var(--bdb);color:var(--tx);transform:translateY(-1px)}

        /* divider */
        .div{display:flex;align-items:center;gap:12px;margin-bottom:24px;color:var(--tm);font-size:12px}
        .div::before,.div::after{content:'';flex:1;height:1px;background:var(--bd)}

        /* field */
        .field{margin-bottom:18px}
        .flabel{font-size:12px;font-weight:700;color:var(--ts);letter-spacing:.3px;
          margin-bottom:7px;display:flex;align-items:center;justify-content:space-between;transition:color .2s}
        .flabel.on{color:var(--vl)}
        .flabel a{font-size:11.5px;color:var(--vl);text-decoration:none;font-weight:600;opacity:.8;transition:opacity .2s}
        .flabel a:hover{opacity:1;text-decoration:underline}

        .shell{position:relative;display:flex;align-items:center;
          background:rgba(255,255,255,.04);border:1.5px solid var(--bd);
          border-radius:13px;transition:all .24s ease;overflow:hidden}
        .shell::before{content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,rgba(124,58,237,.07),transparent);
          opacity:0;transition:opacity .24s}
        .shell.on{border-color:var(--bdf);background:rgba(124,58,237,.05);
          box-shadow:0 0 0 3px rgba(124,58,237,.12)}
        .shell.on::before{opacity:1}

        .sico{width:42px;display:flex;align-items:center;justify-content:center;z-index:1;flex-shrink:0}
        .ifield{flex:1;background:transparent;border:none;outline:none;
          font-family:'DM Sans',sans-serif;font-size:14.5px;font-weight:400;
          color:var(--tx);padding:14px 12px 14px 0;z-index:1}
        .ifield::placeholder{color:var(--tm)}
        .eye-btn{width:42px;display:flex;align-items:center;justify-content:center;
          cursor:none;z-index:1;opacity:.42;flex-shrink:0;transition:opacity .2s;background:none;border:none}
        .eye-btn:hover{opacity:1}

        /* remember row */
        .remember-row{display:flex;align-items:center;justify-content:space-between;margin:4px 0 22px}
        .chk-row{display:flex;align-items:center;gap:9px;cursor:none}
        .chk{width:17px;height:17px;border-radius:5px;border:1.5px solid var(--bdb);
          background:rgba(255,255,255,.04);flex-shrink:0;display:flex;align-items:center;
          justify-content:center;transition:all .2s;cursor:none}
        .chk.on{background:var(--v);border-color:var(--v)}
        .chk-label{font-size:12.5px;color:var(--ts);font-weight:500}
        .forgot{font-size:12.5px;color:var(--vl);text-decoration:none;font-weight:600;opacity:.8;transition:opacity .2s}
        .forgot:hover{opacity:1;text-decoration:underline}

        /* submit */
        .sub{width:100%;padding:15px;font-family:'Cabinet Grotesk',sans-serif;
          font-size:15.5px;font-weight:700;letter-spacing:-.1px;border:none;border-radius:13px;cursor:none;
          background:linear-gradient(135deg,#7c3aed,#a855f7,#ec4899);color:#fff;
          position:relative;overflow:hidden;transition:all .25s ease;
          display:flex;align-items:center;justify-content:center;gap:8px}
        .sub::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#6d28d9,#9333ea,#db2777);opacity:0;transition:opacity .25s}
        .sub:not(:disabled):hover::before{opacity:1}
        .sub:not(:disabled):hover{box-shadow:0 0 36px rgba(124,58,237,.65),0 0 72px rgba(124,58,237,.2);transform:translateY(-1px)}
        .sub:disabled{opacity:.5}
        .sub span{position:relative;z-index:1;display:flex;align-items:center;gap:8px}
        .spin{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:rot .7s linear infinite;flex-shrink:0}
        @keyframes rot{to{transform:rotate(360deg)}}

        /* loading bar */
        .load-bar{height:2px;border-radius:100px;background:linear-gradient(90deg,var(--v),var(--pk),var(--cy));
          width:0;transition:width 1.5s ease;margin-bottom:20px;opacity:0}
        .load-bar.go{width:100%;opacity:1}

        /* bottom link */
        .bot-link{text-align:center;margin-top:20px;font-size:13.5px;color:var(--tm)}
        .bot-link a{color:var(--vl);font-weight:700;text-decoration:none}
        .bot-link a:hover{text-decoration:underline}

        /* ══════════════════════════════
           BRAND SIDE — RIGHT
        ══════════════════════════════ */
        .brand-side{
          flex:1;display:flex;flex-direction:column;justify-content:space-between;
          padding:44px 52px;position:relative;overflow:hidden;
        }
        @media(max-width:860px){.brand-side{display:none}}

        .bo{position:absolute;border-radius:50%;filter:blur(72px);pointer-events:none}
        .bo1{width:540px;height:540px;background:radial-gradient(circle,rgba(124,58,237,.22),transparent 70%);top:-180px;right:-180px}
        .bo2{width:380px;height:380px;background:radial-gradient(circle,rgba(236,72,153,.15),transparent 70%);bottom:-80px;left:-60px}
        .bo3{width:260px;height:260px;background:radial-gradient(circle,rgba(34,211,238,.09),transparent 70%);top:50%;left:25%}

        .bgrid{position:absolute;inset:0;pointer-events:none;
          background-image:linear-gradient(rgba(124,58,237,.04) 1px,transparent 1px),
                           linear-gradient(90deg,rgba(124,58,237,.04) 1px,transparent 1px);
          background-size:48px 48px;
          mask-image:radial-gradient(ellipse 70% 80% at 50% 50%,black,transparent)}

        .ring{position:absolute;border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);animation:spn 38s linear infinite}
        .ring::before{content:'';position:absolute;border-radius:50%;top:-5px;left:calc(50% - 5px)}
        .r1{width:420px;height:420px;border:1px solid rgba(124,58,237,.1)}
        .r1::before{width:9px;height:9px;background:var(--vl);box-shadow:0 0 18px 4px rgba(167,139,250,.85)}
        .r2{width:290px;height:290px;border:1px solid rgba(236,72,153,.08);animation-duration:24s;animation-direction:reverse}
        .r2::before{width:6px;height:6px;top:-3px;left:calc(50% - 3px);background:var(--pk);box-shadow:0 0 14px 3px rgba(236,72,153,.85)}
        .r3{width:170px;height:170px;border:1px solid rgba(34,211,238,.06);animation-duration:16s}
        .r3::before{width:5px;height:5px;top:-2.5px;left:calc(50% - 2.5px);background:var(--cy);box-shadow:0 0 12px 3px rgba(34,211,238,.8)}
        @keyframes spn{to{transform:translate(-50%,-50%) rotate(360deg)}}

        /* brand content */
        .b-top{position:relative;z-index:2}
        .b-badge{display:inline-flex;align-items:center;gap:7px;padding:6px 14px 6px 10px;
          background:rgba(124,58,237,.1);border:1px solid rgba(124,58,237,.26);
          border-radius:100px;font-size:12px;font-weight:500;color:var(--vl);margin-bottom:28px}
        .b-dot{width:6px;height:6px;border-radius:50%;background:var(--vl);animation:pd 2s ease infinite;flex-shrink:0}
        @keyframes pd{0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,.6)}50%{box-shadow:0 0 0 6px rgba(167,139,250,0)}}

        .b-title{font-family:'Cabinet Grotesk',sans-serif;font-size:clamp(30px,3vw,48px);
          font-weight:900;letter-spacing:-1.5px;line-height:1.05;margin-bottom:16px;position:relative;z-index:2}
        .gr{background:linear-gradient(135deg,#c4b5fd,#f472b6,#38bdf8);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          background-size:200% 100%;animation:sh 4s ease infinite}
        @keyframes sh{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        .b-it{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;font-size:.9em}
        .b-sub{font-size:14.5px;color:var(--ts);line-height:1.72;max-width:340px;margin-bottom:36px;position:relative;z-index:2}

        /* feature list */
        .pills{display:flex;flex-direction:column;gap:11px;position:relative;z-index:2}
        .pill{display:flex;align-items:center;gap:12px;padding:14px 17px;
          background:rgba(255,255,255,.028);border:1px solid rgba(255,255,255,.068);
          border-radius:14px;transition:all .3s ease;cursor:none}
        .pill:hover{background:rgba(255,255,255,.05);border-color:rgba(124,58,237,.28);transform:translateX(4px)}
        .pill-ico{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
        .pv{background:rgba(124,58,237,.14);border:1px solid rgba(124,58,237,.22)}
        .pp{background:rgba(236,72,153,.1);border:1px solid rgba(236,72,153,.18)}
        .pc{background:rgba(34,211,238,.08);border:1px solid rgba(34,211,238,.15)}
        .pill-t{font-size:13px;font-weight:700;color:var(--tx);line-height:1.3}
        .pill-s{font-size:11.5px;color:var(--tm);font-weight:400}

        /* bottom stats */
        .b-bottom{position:relative;z-index:2}
        .b-stats{display:flex;gap:0;border:1px solid var(--bd);border-radius:16px;overflow:hidden;background:rgba(255,255,255,.02)}
        .b-stat{flex:1;padding:18px 20px;border-right:1px solid var(--bd);position:relative;transition:background .25s}
        .b-stat:last-child{border-right:none}
        .b-stat:hover{background:rgba(255,255,255,.04)}
        .b-stat::before{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,var(--v),var(--pk));transform:scaleX(0);transform-origin:left;transition:transform .35s}
        .b-stat:hover::before{transform:scaleX(1)}
        .bsv{font-family:'Cabinet Grotesk',sans-serif;font-size:24px;font-weight:900;
          letter-spacing:-1px;background:linear-gradient(135deg,var(--tx),rgba(255,255,255,.5));
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .bsl{font-size:11px;color:var(--tm);font-weight:500;margin-top:2px}
      `}</style>

      <canvas ref={canvasRef} />
      <div className="cd" style={{ left: cursorPos.x, top: cursorPos.y }} />
      <div className={`cr${hovered ? ' big' : ''}`} style={{ left: cursorPos.x, top: cursorPos.y }} />

      <div className="wrap">

        {/* ═══════════════════════════════════════
            FORM SIDE — LEFT (wider, 58%)
        ═══════════════════════════════════════ */}
        <section className="form-side">
          <div className="form-orb" />

          <div className={`form-card${shake ? ' shake' : ''}`}>

            {/* top bar: brand + sign-up pill */}
            <div className="card-top">
              <Link to="/" className="brand" onMouseEnter={hi(true)} onMouseLeave={hi(false)}>
                <div className="lgem">
                  <svg viewBox="0 0 38 38" fill="none">
                    <polygon points="19,2 36,12 36,26 19,36 2,26 2,12" fill="url(#lg1)"/>
                    <polygon points="19,2 36,12 19,20" fill="rgba(255,255,255,0.16)"/>
                    <polygon points="19,2 2,12 19,20" fill="rgba(255,255,255,0.06)"/>
                    <defs>
                      <linearGradient id="lg1" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#7c3aed"/><stop offset="55%" stopColor="#a855f7"/><stop offset="100%" stopColor="#ec4899"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                SupportDesk
              </Link>
              
            </div>

            {/* loading bar */}
            <div className={`load-bar${loading ? ' go' : ''}`} />

            <div className="form-eyebrow">Welcome back</div>
            <h1 className="form-title">Sign in to your account</h1>
            <p className="form-sub">Enter your credentials to access your support dashboard.</p>

            {/* SSO */}
            <div className="social-row">
              <button className="s-btn" onMouseEnter={hi(true)} onMouseLeave={hi(false)} type="button">
                <svg viewBox="0 0 24 24" width="18" height="18" style={{ flexShrink:0 }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              <button className="s-btn" onMouseEnter={hi(true)} onMouseLeave={hi(false)} type="button">
                <svg viewBox="0 0 24 24" width="18" height="18" style={{ flexShrink:0 }}>
                  <path fill="#f25022" d="M1 1h10v10H1z"/><path fill="#00a4ef" d="M13 1h10v10H13z"/>
                  <path fill="#7fba00" d="M1 13h10v10H1z"/><path fill="#ffb900" d="M13 13h10v10H13z"/>
                </svg>
                Continue with Microsoft
              </button>
            </div>

            <div className="div">or sign in with email</div>

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div className="field">
                <div className={`flabel${focused === 'email' ? ' on' : ''}`}>
                  <span>Email Address</span>
                </div>
                <div className={`shell${focused === 'email' ? ' on' : ''}`}>
                  <div className="sico">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color:'rgba(248,247,255,0.38)' }}>
                      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </div>
                  <input className="ifield" type="email" placeholder="you@company.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                    required autoComplete="email"
                    onMouseEnter={hi(true)} onMouseLeave={hi(false)} />
                </div>
              </div>

              {/* Password */}
              <div className="field">
                <div className={`flabel${focused === 'pw' ? ' on' : ''}`}>
                  <span>Password</span>
                  <Link to="/forgot-password" onMouseEnter={hi(true)} onMouseLeave={hi(false)}>
                    Forgot password?
                  </Link>
                </div>
                <div className={`shell${focused === 'pw' ? ' on' : ''}`}>
                  <div className="sico">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color:'rgba(248,247,255,0.38)' }}>
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input className="ifield"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('pw')} onBlur={() => setFocused('')}
                    required autoComplete="current-password"
                    onMouseEnter={hi(true)} onMouseLeave={hi(false)} />
                  <button type="button" className="eye-btn"
                    onClick={() => setShowPw(v => !v)}
                    onMouseEnter={hi(true)} onMouseLeave={hi(false)}>
                    {showPw
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color:'rgba(248,247,255,0.55)' }}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color:'rgba(248,247,255,0.55)' }}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="remember-row">
                <div className="chk-row" onMouseEnter={hi(true)} onMouseLeave={hi(false)} onClick={() => setRememberMe(!rememberMe)}>
                  <div className={`chk${rememberMe ? ' on' : ''}`}>
                    {rememberMe && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="chk-label">Remember me for 30 days</span>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="sub" disabled={loading}
                onMouseEnter={hi(true)} onMouseLeave={hi(false)}>
                <span>
                  {loading
                    ? <><div className="spin"/>Signing in…</>
                    : <>Sign In &nbsp;→</>
                  }
                </span>
              </button>
            </form>

            <div className="bot-link">
              Don't have an account?{' '}
              <Link to="/signup" onMouseEnter={hi(true)} onMouseLeave={hi(false)}>Create one free</Link>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            BRAND SIDE — RIGHT
        ═══════════════════════════════════════ */}
        <aside className="brand-side">
          <div className="bo bo1"/><div className="bo bo2"/><div className="bo bo3"/>
          <div className="bgrid"/>
          <div className="ring r1"/><div className="ring r2"/><div className="ring r3"/>

          <div className="b-top">
            <div className="b-badge"><div className="b-dot"/>Enterprise Platform</div>
            <h2 className="b-title">
              Support,<br/>
              <span className="gr"><em className="b-it">governed</em> right</span>
            </h2>
            <p className="b-sub">
              Role-based access, real-time SLA monitoring, and complete audit trails — all in one powerful governance system.
            </p>
            <div className="pills">
              {[
                { c:'pv', icon:'🔐', t:'Role-Based Access Control',   s:'Scoped, secure permissions' },
                { c:'pp', icon:'📋', t:'Immutable Audit Trails',       s:'Every action is logged' },
                { c:'pc', icon:'⚡', t:'Real-Time SLA Monitoring',     s:'Zero breaches, guaranteed' },
              ].map((p,i) => (
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

          {/* stats row */}
          <div className="b-bottom">
            <div className="b-stats">
              {[{v:'10K+',l:'Tickets resolved'},{v:'99.2%',l:'SLA compliance'},{v:'18.5h',l:'Avg resolution'},{v:'50+',l:'Active agents'}].map((s,i) => (
                <div key={i} className="b-stat" onMouseEnter={hi(true)} onMouseLeave={hi(false)}>
                  <div className="bsv">{s.v}</div>
                  <div className="bsl">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </>
  );
}