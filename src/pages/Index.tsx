import { useState, useEffect, useRef } from "react";

const PARTICLES = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.2 + 0.4,
  speed: Math.random() * 0.25 + 0.08,
  opacity: Math.random() * 0.55 + 0.1,
  drift: (Math.random() - 0.5) * 0.18,
}));

const ROW1 = [
  { icon: "⚡", label: "SLA Monitoring", sub: "Real-time breach alerts" },
  { icon: "🔐", label: "Role-Based Access", sub: "Granular permissions" },
  { icon: "📋", label: "Audit Trails", sub: "Immutable logs" },
  { icon: "📊", label: "Analytics", sub: "Performance insights" },
  { icon: "🛡", label: "Compliance", sub: "Regulatory-grade" },
  { icon: "🎫", label: "Ticket Lifecycle", sub: "Full traceability" },
  { icon: "🔔", label: "Smart Alerts", sub: "Instant notifications" },
  { icon: "🏷", label: "Auto-tagging", sub: "AI classification" },
];

const ROW2 = [
  { icon: "👥", label: "Team Management", sub: "Agent performance" },
  { icon: "🗂", label: "Department Queues", sub: "Structured routing" },
  { icon: "📁", label: "Evidence Upload", sub: "File attachments" },
  { icon: "⏱", label: "Time Tracking", sub: "Resolution metrics" },
  { icon: "📈", label: "SLA Reports", sub: "Executive dashboards" },
  { icon: "🔄", label: "Escalation Flow", sub: "Automated routing" },
  { icon: "💬", label: "Internal Notes", sub: "Agent collaboration" },
  { icon: "🧩", label: "Integrations", sub: "API-first design" },
];

export default function Index() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState({});
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef(PARTICLES.map(p => ({ ...p })));
  const sectionRefs = useRef({});
  const cursorTarget = useRef({ x: -100, y: -100 });
  const cursorCurrent = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const onMove = (e) => {
      cursorTarget.current = { x: e.clientX, y: e.clientY };
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", () => setScrollY(window.scrollY));
    return () => { window.removeEventListener("mousemove", onMove); };
  }, []);

  useEffect(() => {
    let frame;
    const animate = () => {
      cursorCurrent.current.x += (cursorTarget.current.x - cursorCurrent.current.x) * 0.1;
      cursorCurrent.current.y += (cursorTarget.current.y - cursorCurrent.current.y) * 0.1;
      setCursorPos({ x: cursorCurrent.current.x, y: cursorCurrent.current.y });
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;
    const resize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };
    window.addEventListener("resize", resize);
    const ps = particlesRef.current;
    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.004;
      ps.forEach(p => {
        p.y -= p.speed * 0.12;
        p.x += p.drift * Math.sin(t + p.id * 0.5);
        if (p.y < -2) p.y = 102;
        if (p.x < -2) p.x = 102;
        if (p.x > 102) p.x = -2;
        const px = (p.x / 100) * w, py = (p.y / 100) * h;
        const rgb = p.id % 3 === 0 ? "130,70,255" : p.id % 3 === 1 ? "255,80,160" : "40,210,255";
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${p.opacity * (0.6 + 0.4 * Math.sin(t * 1.5 + p.id))})`;
        ctx.fill();
      });
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = (ps[i].x - ps[j].x) / 100 * w;
          const dy = (ps[i].y - ps[j].y) / 100 * h;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo((ps[i].x / 100) * w, (ps[i].y / 100) * h);
            ctx.lineTo((ps[j].x / 100) * w, (ps[j].y / 100) * h);
            ctx.strokeStyle = `rgba(120,60,255,${(1 - dist / 110) * 0.07})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", resize); };
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setVisibleSections(p => ({ ...p, [e.target.dataset.section]: true })); });
    }, { threshold: 0.1 });
    Object.values(sectionRefs.current).forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const reg = key => el => { if (el) { sectionRefs.current[key] = el; el.dataset.section = key; } };
  const ox = (mouse.x - 0.5) * 55, oy = (mouse.y - 0.5) * 55;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#03030a;--sf:rgba(255,255,255,0.028);--sfh:rgba(255,255,255,0.055);
          --bd:rgba(255,255,255,0.068);--bdb:rgba(255,255,255,0.14);
          --v:#7c3aed;--vl:#a78bfa;--pk:#ec4899;--cy:#22d3ee;--go:#f59e0b;
          --tx:#f8f7ff;--ts:rgba(248,247,255,0.54);--tm:rgba(248,247,255,0.27);
        }
        html{scroll-behavior:smooth}
        body{background:var(--bg);color:var(--tx);font-family:'DM Sans',sans-serif;overflow-x:hidden;cursor:none;line-height:1.6}
        ::selection{background:rgba(124,58,237,0.38)}

        /* CURSOR */
        .cur-d{position:fixed;z-index:9999;pointer-events:none;width:7px;height:7px;border-radius:50%;background:white;margin:-3.5px 0 0 -3.5px;mix-blend-mode:difference;transition:transform .1s}
        .cur-r{position:fixed;z-index:9998;pointer-events:none;width:38px;height:38px;border-radius:50%;border:1.5px solid rgba(167,139,250,.45);margin:-19px 0 0 -19px;transition:width .3s,height .3s,margin .3s,border-color .3s,background .3s,transform .3s}
        .cur-r.big{width:62px;height:62px;margin:-31px 0 0 -31px;border-color:rgba(167,139,250,.9);background:rgba(124,58,237,.09);transform:rotate(45deg)}

        canvas{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.6}
        body::after{content:'';position:fixed;inset:0;z-index:1;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");opacity:.022}
        .page{position:relative;z-index:2}

        /* NAV */
        .nav{position:fixed;top:0;left:0;right:0;z-index:500;display:flex;align-items:center;justify-content:space-between;padding:22px 52px;transition:all .4s ease}
        .nav.s{padding:13px 52px;background:rgba(3,3,10,.8);backdrop-filter:blur(28px) saturate(180%);border-bottom:1px solid var(--bd)}
        .logo{display:flex;align-items:center;gap:10px;text-decoration:none;font-family:'Cabinet Grotesk',sans-serif;font-weight:800;font-size:17px;color:var(--tx);letter-spacing:-.2px}
        .lgem{width:34px;height:34px;flex-shrink:0}
        .lgem svg{width:100%;height:100%}
        .nc{display:flex;gap:28px;align-items:center}
        .nl{font-size:13.5px;font-weight:500;color:var(--ts);text-decoration:none;transition:color .2s}
        .nl:hover{color:var(--tx)}
        .nr{display:flex;gap:10px;align-items:center}
        .btn{font-family:'Cabinet Grotesk',sans-serif;font-size:13.5px;font-weight:700;padding:9px 22px;border:none;cursor:none;text-decoration:none;display:inline-flex;align-items:center;gap:7px;transition:all .25s ease;letter-spacing:-.1px;white-space:nowrap}
        .bo{background:transparent;border:1px solid var(--bdb);color:var(--ts);border-radius:100px}
        .bo:hover{background:var(--sfh);color:var(--tx)}
        .bg{background:linear-gradient(135deg,#7c3aed,#a855f7,#ec4899);color:white;border-radius:100px;position:relative;overflow:hidden}
        .bg::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#6d28d9,#9333ea,#db2777);opacity:0;transition:opacity .25s}
        .bg:hover::before{opacity:1}
        .bg:hover{box-shadow:0 0 36px rgba(124,58,237,.65),0 0 70px rgba(124,58,237,.22);transform:translateY(-1px)}
        .bg span{position:relative;z-index:1}

        /* HERO */
        .hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:140px 52px 80px;text-align:center;position:relative;overflow:hidden}
        .orb{position:absolute;border-radius:50%;filter:blur(85px);pointer-events:none;transition:transform .06s ease}
        .o1{width:650px;height:650px;background:radial-gradient(circle,rgba(124,58,237,.2),transparent 70%);top:-120px;left:-130px}
        .o2{width:520px;height:520px;background:radial-gradient(circle,rgba(236,72,153,.16),transparent 70%);bottom:-60px;right:-80px}
        .o3{width:380px;height:380px;background:radial-gradient(circle,rgba(34,211,238,.1),transparent 70%);top:45%;right:8%}
        .o4{width:300px;height:300px;background:radial-gradient(circle,rgba(245,158,11,.07),transparent 70%);bottom:20%;left:5%}

        .ring{position:absolute;border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);animation:spn 40s linear infinite}
        .ring::before{content:'';position:absolute;border-radius:50%;top:-5px;left:calc(50% - 5px)}
        .r1{width:740px;height:740px;border:1px solid rgba(124,58,237,.08)}
        .r1::before{width:10px;height:10px;background:var(--vl);box-shadow:0 0 22px 5px rgba(167,139,250,.85)}
        .r2{width:540px;height:540px;border:1px solid rgba(236,72,153,.07);animation-duration:26s;animation-direction:reverse}
        .r2::before{width:7px;height:7px;top:-3.5px;left:calc(50% - 3.5px);background:var(--pk);box-shadow:0 0 16px 4px rgba(236,72,153,.85)}
        .r3{width:380px;height:380px;border:1px solid rgba(34,211,238,.05);animation-duration:18s}
        .r3::before{width:5px;height:5px;top:-2.5px;left:calc(50% - 2.5px);background:var(--cy);box-shadow:0 0 12px 3px rgba(34,211,238,.8)}
        @keyframes spn{to{transform:translate(-50%,-50%) rotate(360deg)}}

        .badge{display:inline-flex;align-items:center;gap:8px;padding:7px 18px 7px 12px;background:rgba(124,58,237,.1);border:1px solid rgba(124,58,237,.26);border-radius:100px;font-size:12.5px;font-weight:500;color:var(--vl);margin-bottom:28px;animation:fu .8s cubic-bezier(.16,1,.3,1) both}
        .bdot{width:6px;height:6px;border-radius:50%;background:var(--vl);animation:pd 2s ease infinite;flex-shrink:0}
        @keyframes pd{0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,.65)}50%{box-shadow:0 0 0 6px rgba(167,139,250,0)}}

        .hh{font-family:'Cabinet Grotesk',sans-serif;font-size:clamp(52px,8.8vw,120px);font-weight:900;line-height:.97;letter-spacing:-3.5px;max-width:940px;animation:fu .9s .1s cubic-bezier(.16,1,.3,1) both}
        .hp{color:var(--tx);display:block}
        .hg{display:block;background:linear-gradient(135deg,#c4b5fd 0%,#f472b6 45%,#38bdf8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:200% 100%;animation:sh 4.5s ease infinite}
        @keyframes sh{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        .hi{font-family:'Instrument Serif',serif;font-style:italic;font-weight:400;font-size:.88em}

        .hs{font-size:17px;line-height:1.75;color:var(--ts);max-width:560px;margin:24px auto 0;font-weight:400;animation:fu .9s .2s cubic-bezier(.16,1,.3,1) both}
        .ha{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:44px;animation:fu .9s .3s cubic-bezier(.16,1,.3,1) both}
        .bhero{padding:14px 38px;font-size:15px}

        .proof{display:flex;align-items:center;gap:18px;margin-top:50px;animation:fu .9s .4s cubic-bezier(.16,1,.3,1) both;color:var(--tm);font-size:13px}
        .pavs{display:flex}
        .pav{width:30px;height:30px;border-radius:50%;border:2px solid var(--bg);margin-left:-8px;font-size:13px;display:flex;align-items:center;justify-content:center}
        .pav:first-child{margin-left:0}
        .pdiv{width:1px;height:18px;background:var(--bd)}
        .pstar{color:#f59e0b;letter-spacing:1px}

        @keyframes fu{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}

        /* ═══════════════════════════
           DUAL MARQUEE SECTION
        ═══════════════════════════ */
        .marquee-section{
          padding:56px 0;
          position:relative;
          overflow:hidden;
        }
        .marquee-section::before{
          content:'';position:absolute;inset:0;
          background:linear-gradient(180deg,rgba(3,3,10,1) 0%,transparent 20%,transparent 80%,rgba(3,3,10,1) 100%);
          z-index:2;pointer-events:none;
        }
        /* Side fades */
        .mq-fade-l,.mq-fade-r{
          position:absolute;top:0;bottom:0;width:200px;z-index:3;pointer-events:none;
        }
        .mq-fade-l{left:0;background:linear-gradient(90deg,rgba(3,3,10,1),transparent)}
        .mq-fade-r{right:0;background:linear-gradient(-90deg,rgba(3,3,10,1),transparent)}

        .mq-label{
          text-align:center;
          font-size:11px;font-weight:700;letter-spacing:4px;text-transform:uppercase;
          color:var(--vl);margin-bottom:32px;position:relative;z-index:4;
          display:flex;align-items:center;justify-content:center;gap:12px;
        }
        .mq-label::before,.mq-label::after{content:'';height:1px;width:48px;background:linear-gradient(90deg,transparent,var(--vl))}
        .mq-label::after{transform:rotate(180deg)}

        .mq-row{
          display:flex;align-items:center;overflow:hidden;position:relative;
          margin-bottom:14px;
        }
        .mq-row:last-child{margin-bottom:0}

        .mq-track{
          display:flex;align-items:center;gap:0;flex-shrink:0;
          will-change:transform;
        }
        .mq-track.left{animation:mq-left 28s linear infinite}
        .mq-track.right{animation:mq-right 32s linear infinite}
        @keyframes mq-left{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes mq-right{from{transform:translateX(-50%)}to{transform:translateX(0)}}

        .mq-card{
          display:inline-flex;align-items:center;gap:12px;
          padding:12px 22px;
          margin:0 8px;
          background:rgba(255,255,255,.028);
          border:1px solid rgba(255,255,255,.07);
          border-radius:14px;
          flex-shrink:0;
          transition:all .3s ease;
          cursor:none;
          position:relative;overflow:hidden;
        }
        .mq-card::before{
          content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,rgba(124,58,237,.08),transparent);
          opacity:0;transition:opacity .3s;
        }
        .mq-card:hover{
          background:rgba(255,255,255,.055);
          border-color:rgba(124,58,237,.3);
          transform:translateY(-2px);
          box-shadow:0 8px 30px rgba(0,0,0,.3);
        }
        .mq-card:hover::before{opacity:1}

        .mq-icon{
          width:36px;height:36px;border-radius:10px;
          display:flex;align-items:center;justify-content:center;
          font-size:16px;flex-shrink:0;
        }
        .mq-icon.v{background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.22)}
        .mq-icon.p{background:rgba(236,72,153,.1);border:1px solid rgba(236,72,153,.18)}
        .mq-icon.c{background:rgba(34,211,238,.08);border:1px solid rgba(34,211,238,.15)}
        .mq-icon.g{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.15)}

        .mq-info{display:flex;flex-direction:column;gap:1px}
        .mq-name{font-family:'Cabinet Grotesk',sans-serif;font-size:13.5px;font-weight:700;color:var(--tx);white-space:nowrap;letter-spacing:-.1px}
        .mq-sub{font-size:11px;color:var(--tm);white-space:nowrap;font-weight:400}

        .mq-sep{
          font-size:20px;color:rgba(124,58,237,.3);margin:0 4px;flex-shrink:0;
          user-select:none;
        }

        /* BENTO */
        .bento-sec{padding:120px 52px;max-width:1200px;margin:0 auto}
        .eyebrow{font-size:11.5px;font-weight:700;letter-spacing:3.5px;text-transform:uppercase;color:var(--vl);display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:14px}
        .eyebrow::before,.eyebrow::after{content:'';height:1px;width:32px;background:linear-gradient(90deg,transparent,var(--vl))}
        .eyebrow::after{transform:rotate(180deg)}
        .stitle{font-family:'Cabinet Grotesk',sans-serif;font-size:clamp(36px,4.5vw,62px);font-weight:900;letter-spacing:-1.5px;line-height:1.05;margin-bottom:60px;text-align:center}

        .bgrid{display:grid;grid-template-columns:repeat(12,1fr);gap:16px}
        .bc{background:var(--sf);border:1px solid var(--bd);border-radius:24px;padding:36px;position:relative;overflow:hidden;transition:all .35s cubic-bezier(.16,1,.3,1);cursor:none}
        .bc::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(124,58,237,.06),transparent 60%);opacity:0;transition:opacity .35s;border-radius:24px}
        .bc:hover{transform:translateY(-5px);border-color:rgba(124,58,237,.28);box-shadow:0 24px 64px rgba(0,0,0,.45)}
        .bc:hover::before{opacity:1}
        .bl{grid-column:span 7}.bm{grid-column:span 5}.bt{grid-column:span 4}

        .ci{width:50px;height:50px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:18px}
        .civ{background:rgba(124,58,237,.13);border:1px solid rgba(124,58,237,.22)}
        .cip{background:rgba(236,72,153,.1);border:1px solid rgba(236,72,153,.17)}
        .cic{background:rgba(34,211,238,.08);border:1px solid rgba(34,211,238,.15)}
        .cig{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.15)}

        .ctag{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:100px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:13px}
        .ctv{background:rgba(124,58,237,.13);color:var(--vl)}
        .ctp{background:rgba(236,72,153,.1);color:#f9a8d4}
        .ctc{background:rgba(34,211,238,.08);color:#67e8f9}

        .ctit{font-family:'Cabinet Grotesk',sans-serif;font-size:22px;font-weight:800;letter-spacing:-.4px;margin-bottom:10px;line-height:1.2}
        .cdesc{font-size:14px;line-height:1.7;color:var(--ts);font-weight:400}
        .cfl{list-style:none;margin-top:20px;display:flex;flex-direction:column;gap:8px}
        .cfl li{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--ts)}
        .fck{width:18px;height:18px;border-radius:50%;background:rgba(124,58,237,.17);border:1px solid rgba(124,58,237,.27);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:9px;color:var(--vl)}

        .cvis{margin-top:22px;border-radius:14px;padding:16px;background:rgba(0,0,0,.28);border:1px solid var(--bd)}
        .mt{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;background:rgba(255,255,255,.03);margin-bottom:7px;border:1px solid transparent;transition:all .2s}
        .mt:last-child{margin-bottom:0}
        .mt:hover{border-color:var(--bd);background:rgba(255,255,255,.05)}
        .td{width:7px;height:7px;border-radius:50%;flex-shrink:0}
        .td.g{background:#10b981;box-shadow:0 0 7px #10b981}
        .td.y{background:#f59e0b;box-shadow:0 0 7px #f59e0b}
        .td.r{background:#ef4444;box-shadow:0 0 7px #ef4444}
        .tt{font-size:12px;color:var(--ts);flex:1}
        .tb{font-size:10px;font-weight:700;padding:2px 8px;border-radius:100px}
        .tbo{background:rgba(34,211,238,.12);color:#67e8f9}
        .tbr{background:rgba(245,158,11,.12);color:#fcd34d}
        .tbc{background:rgba(16,185,129,.12);color:#6ee7b7}

        /* STATS */
        .st-sec{padding:0 52px 120px;max-width:1200px;margin:0 auto}
        .st-grid{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--bd);border-radius:24px;overflow:hidden;background:var(--sf)}
        .si{padding:46px 34px;border-right:1px solid var(--bd);position:relative;overflow:hidden;cursor:none;transition:background .3s}
        .si:last-child{border-right:none}
        .si:hover{background:var(--sfh)}
        .si::before{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--v),var(--pk));transform:scaleX(0);transform-origin:left;transition:transform .4s}
        .si:hover::before{transform:scaleX(1)}
        .sv{font-family:'Cabinet Grotesk',sans-serif;font-size:52px;font-weight:900;letter-spacing:-2px;line-height:1;background:linear-gradient(135deg,var(--tx),rgba(255,255,255,.5));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .sl{font-size:13px;color:var(--tm);margin-top:8px;font-weight:500}
        .sic{font-size:22px;margin-bottom:14px;opacity:.7}

        /* CTA */
        .cta-s{padding:0 52px 120px;max-width:1200px;margin:0 auto}
        .cta-i{border-radius:32px;padding:80px;position:relative;overflow:hidden;background:linear-gradient(135deg,rgba(124,58,237,.14),rgba(236,72,153,.09) 50%,rgba(34,211,238,.07) 100%);border:1px solid rgba(124,58,237,.17);text-align:center}
        .cta-ob{position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none}
        .co1{width:400px;height:400px;background:rgba(124,58,237,.18);top:-100px;left:-100px}
        .co2{width:400px;height:400px;background:rgba(236,72,153,.13);bottom:-100px;right:-100px}
        .cta-t{font-family:'Cabinet Grotesk',sans-serif;font-size:clamp(36px,5vw,64px);font-weight:900;letter-spacing:-2px;line-height:1.05;position:relative;z-index:1;margin-bottom:14px}
        .cta-sub{font-size:16px;color:var(--ts);position:relative;z-index:1;max-width:480px;margin:0 auto 40px}
        .cta-ac{display:flex;align-items:center;justify-content:center;gap:12px;position:relative;z-index:1}

        /* FOOTER */
        .ft{border-top:1px solid var(--bd);padding:28px 52px;display:flex;align-items:center;justify-content:space-between;position:relative;z-index:2}
        .fb{font-family:'Cabinet Grotesk',sans-serif;font-weight:800;font-size:15px;color:var(--tx);display:flex;align-items:center;gap:8px}
        .fc{font-size:12.5px;color:var(--tm)}
        .fls{display:flex;gap:20px}
        .fls a{font-size:13px;color:var(--tm);text-decoration:none;transition:color .2s}
        .fls a:hover{color:var(--tx)}

        /* REVEALS */
        .rv{opacity:0;transform:translateY(30px);transition:all .8s cubic-bezier(.16,1,.3,1)}
        .rv.vis{opacity:1;transform:translateY(0)}
        .d1{transition-delay:.1s}.d2{transition-delay:.2s}.d3{transition-delay:.3s}.d4{transition-delay:.4s}

        @media(max-width:900px){
          .nav,.nav.s{padding:14px 22px}.nc{display:none}
          .hero{padding:110px 22px 80px}
          .bento-sec,.st-sec,.cta-s{padding-left:22px;padding-right:22px}
          .bl,.bm,.bt{grid-column:span 12}
          .st-grid{grid-template-columns:repeat(2,1fr)}
          .cta-i{padding:44px 26px}
          .ft{flex-direction:column;gap:14px;text-align:center;padding:24px}
          .mq-card{padding:10px 16px}
        }
      `}</style>

      <canvas ref={canvasRef} />
      <div className="cur-d" style={{ left: cursorPos.x, top: cursorPos.y }} />
      <div className={`cur-r${hovered ? " big" : ""}`} style={{ left: cursorPos.x, top: cursorPos.y }} />

      <div className="page">

        {/* ── NAV ── */}
        <nav className={`nav${scrollY > 20 ? " s" : ""}`}>
          <a href="#" className="logo" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
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
          </a>
          <div className="nc">
            {["Features","Roles","Pricing","Docs"].map(l => (
              <a key={l} href="#" className="nl" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>{l}</a>
            ))}
          </div>
          <div className="nr">
            <a href="/login" className="btn bo" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>Sign In</a>
            <a href="/signup" className="btn bg" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}><span>Get Started →</span></a>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="hero">
          <div className="orb o1" style={{ transform:`translate(${ox*.5}px,${oy*.5}px)` }}/>
          <div className="orb o2" style={{ transform:`translate(${-ox*.4}px,${-oy*.4}px)` }}/>
          <div className="orb o3" style={{ transform:`translate(${ox*.3}px,${oy*.6}px)` }}/>
          <div className="orb o4" style={{ transform:`translate(${-ox*.25}px,${oy*.35}px)` }}/>
          <div className="ring r1"/><div className="ring r2"/><div className="ring r3"/>

          <div className="badge"><div className="bdot"/>Enterprise Governance Platform</div>
          <h1 className="hh">
            <span className="hp">Customer Support</span>
            <span className="hg"><em className="hi">Governance</em> System</span>
          </h1>
          <p className="hs">A structured, auditable, performance-driven support ecosystem with role-based access, real-time SLA monitoring, and regulatory-grade oversight.</p>
          <div className="ha">
            <a href="/signup" className="btn bg bhero" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}><span>Start Free Trial →</span></a>
            <a href="#features" className="btn bo bhero" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>Explore Features</a>
          </div>
          <div className="proof">
            <div className="pavs">
              {["🧑‍💼","👩‍💻","🧑‍🔬","👩‍🎨","🧑‍🏫"].map((e,i) => (
                <div key={i} className="pav" style={{ background:`hsl(${i*50+200},55%,20%)` }}>{e}</div>
              ))}
            </div>
            <span>50+ enterprise teams</span>
            <div className="pdiv"/>
            <span className="pstar">★★★★★</span>
            <span style={{ color:"rgba(248,247,255,0.4)" }}>4.9/5</span>
          </div>
        </section>

        {/* ══════════════════════════════════
            DUAL OPPOSING MARQUEE SECTION
        ══════════════════════════════════ */}
        <section id="features" className="marquee-section">
          <div className="mq-fade-l"/><div className="mq-fade-r"/>

          <div className="mq-label">Platform Features</div>

          {/* ROW 1 → scrolls LEFT */}
          <div className="mq-row">
            <div className="mq-track left">
              {[...ROW1, ...ROW1].map((item, i) => (
                <div key={i} className="mq-card"
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  <div className={`mq-icon ${["v","p","c","g","v","p","c","g"][i % 8]}`}>{item.icon}</div>
                  <div className="mq-info">
                    <span className="mq-name">{item.label}</span>
                    <span className="mq-sub">{item.sub}</span>
                  </div>
                </div>
              ))}
              {/* Duplicate for seamless loop */}
              {[...ROW1, ...ROW1].map((item, i) => (
                <div key={`d-${i}`} className="mq-card"
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  <div className={`mq-icon ${["v","p","c","g","v","p","c","g"][i % 8]}`}>{item.icon}</div>
                  <div className="mq-info">
                    <span className="mq-name">{item.label}</span>
                    <span className="mq-sub">{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ROW 2 → scrolls RIGHT */}
          <div className="mq-row">
            <div className="mq-track right">
              {[...ROW2, ...ROW2].map((item, i) => (
                <div key={i} className="mq-card"
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  <div className={`mq-icon ${["c","g","v","p","c","g","v","p"][i % 8]}`}>{item.icon}</div>
                  <div className="mq-info">
                    <span className="mq-name">{item.label}</span>
                    <span className="mq-sub">{item.sub}</span>
                  </div>
                </div>
              ))}
              {[...ROW2, ...ROW2].map((item, i) => (
                <div key={`d-${i}`} className="mq-card"
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  <div className={`mq-icon ${["c","g","v","p","c","g","v","p"][i % 8]}`}>{item.icon}</div>
                  <div className="mq-info">
                    <span className="mq-name">{item.label}</span>
                    <span className="mq-sub">{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BENTO ── */}
        <section className="bento-sec" id="roles" ref={reg("bento")}>
          <div className="eyebrow">Platform Capabilities</div>
          <h2 className={`stitle rv${visibleSections?" vis":""}`}>
            Built for every{" "}
            <span style={{ background:"linear-gradient(135deg,#a78bfa,#f472b6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
              stakeholder
            </span>
          </h2>
          <div className="bgrid">
            {/* Large */}
            <div className={`bc bl rv${visibleSections?" vis":""}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
              <div className="ctag ctv">👤 Support Users</div>
              <div className="ctit">Raise, Track & Resolve</div>
              <p className="cdesc">Create detailed tickets with evidence uploads, monitor resolution in real-time, and maintain a full chain-of-custody audit trail.</p>
              <div className="cvis">
                {[{c:"g",t:"Login issue — Account Services",b:"tbc",l:"Closed"},{c:"y",t:"Payment declined — Billing Dept",b:"tbr",l:"In Review"},{c:"r",t:"Data export — Compliance",b:"tbo",l:"Open"}].map((tk,i) => (
                  <div key={i} className="mt">
                    <div className={`td ${tk.c}`}/><span className="tt">{tk.t}</span><span className={`tb ${tk.b}`}>{tk.l}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Medium */}
            <div className={`bc bm rv d1${visibleSections?" vis":""}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
              <div className="ci cip">🎧</div>
              <div className="ctag ctp">Support Agents</div>
              <div className="ctit">Investigate & Resolve</div>
              <p className="cdesc">Smart routing, performance scoring, and department queues keep agents focused and accountable.</p>
              <ul className="cfl">
                {["Smart ticket routing","Performance scoring","Department queues","Escalation workflows"].map((f,i) => (
                  <li key={i}><div className="fck">✓</div>{f}</li>
                ))}
              </ul>
            </div>
            {/* Thirds */}
            <div className={`bc bt rv${visibleSections?" vis":""}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
              <div className="ci cic">🛡</div>
              <div className="ctag ctc">Super Admins</div>
              <div className="ctit">Full Oversight</div>
              <p className="cdesc">SLA dashboards, agent management, compliance logs — complete command of your operations.</p>
            </div>
            <div className={`bc bt rv d1${visibleSections?" vis":""}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
              <div className="ci cig">⚡</div>
              <div className="ctit">SLA Monitoring</div>
              <p className="cdesc">Real-time breach detection and automated escalation.</p>
              <div style={{ marginTop:18,display:"flex",gap:8 }}>
                {[{l:"Response",v:"98.4%",c:"#10b981"},{l:"Resolution",v:"99.2%",c:"#a78bfa"}].map((m,i) => (
                  <div key={i} style={{ padding:"10px 12px",borderRadius:12,background:"rgba(255,255,255,.04)",border:"1px solid var(--bd)",flex:1,textAlign:"center" }}>
                    <div style={{ fontSize:21,fontWeight:800,fontFamily:"'Cabinet Grotesk',sans-serif",color:m.c }}>{m.v}</div>
                    <div style={{ fontSize:11,color:"var(--tm)",marginTop:2 }}>{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`bc bt rv d2${visibleSections?" vis":""}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
              <div style={{ fontSize:28,marginBottom:14 }}>📋</div>
              <div className="ctit">Audit Trails</div>
              <p className="cdesc">Immutable, compliance-grade logs for every action with export capabilities.</p>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="st-sec" ref={reg("stats")}>
          <div className="eyebrow" style={{ marginBottom:36 }}>Live Metrics</div>
          <div className="st-grid">
            {[{i:"🎫",v:"10K+",l:"Tickets Managed"},{i:"✅",v:"99.2%",l:"Resolution Rate"},{i:"⏱",v:"18.5h",l:"Avg Resolution"},{i:"👥",v:"50+",l:"Active Agents"}].map((s,i) => (
              <div key={i} className={`si rv d${i+1}${visibleSections?" vis":""}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
                <div className="sic">{s.i}</div>
                <div className="sv">{s.v}</div>
                <div className="sl">{s.l}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="cta-s" ref={reg("cta")}>
          <div className={`cta-i rv${visibleSections?" vis":""}`}>
            <div className="cta-ob co1"/><div className="cta-ob co2"/>
            <div className="cta-t">
              Ready to govern your<br/>
              <span style={{ background:"linear-gradient(135deg,#c4b5fd,#f472b6,#38bdf8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>
                support operations?
              </span>
            </div>
            <p className="cta-sub">Join 50+ enterprise teams already using SupportDesk for structured, auditable, performance-driven support.</p>
            <div className="cta-ac">
              <a href="/signup" className="btn bg bhero" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}><span>Start Free Trial →</span></a>
              <a href="/login" className="btn bo bhero" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>Sign In</a>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="ft">
          <div className="fb">
            <div style={{ width:20,height:20 }}>
              <svg viewBox="0 0 38 38" fill="none">
                <polygon points="19,2 36,12 36,26 19,36 2,26 2,12" fill="url(#lg2)"/>
                <defs><linearGradient id="lg2" x1="0" y1="0" x2="38" y2="38" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#ec4899"/></linearGradient></defs>
              </svg>
            </div>
            SupportDesk
          </div>
          <div className="fc">© 2024 SupportDesk — Enterprise Customer Support Governance</div>
          <div className="fls">
            {["Privacy","Terms","Docs","Status"].map(l => (
              <a key={l} href="#" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>{l}</a>
            ))}
          </div>
        </footer>

      </div>
    </>
  );
}