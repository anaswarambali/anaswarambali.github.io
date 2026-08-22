(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ============================================================
     NAV — scroll state, active link, mobile toggle
  ============================================================ */
  const nav = document.getElementById('nav');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');
  const scrollProgress = document.getElementById('scrollProgress');
  const sections = [...document.querySelectorAll('main section[id]')];
  const linkMap = new Map([...document.querySelectorAll('[data-nav]')].map(a => [a.getAttribute('href').slice(1), a]));

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

  function onScroll(){
    nav.classList.toggle('scrolled', window.scrollY > 24);
    const doc = document.documentElement;
    const pct = (window.scrollY / (doc.scrollHeight - window.innerHeight)) * 100;
    scrollProgress.style.width = Math.min(100, Math.max(0, pct)) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        linkMap.forEach(a => a.classList.remove('active'));
        const link = linkMap.get(e.target.id);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  sections.forEach(s => navObserver.observe(s));

  /* ============================================================
     REVEAL ON SCROLL
  ============================================================ */
  const revealEls = document.querySelectorAll('.reveal, .reveal-up');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        e.target.classList.add('in');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ============================================================
     HERO CLOCK (UTC)
  ============================================================ */
  const heroClock = document.getElementById('heroClock');
  function tickClock(){
    const now = new Date();
    const h = String(now.getUTCHours()).padStart(2,'0');
    const m = String(now.getUTCMinutes()).padStart(2,'0');
    const s = String(now.getUTCSeconds()).padStart(2,'0');
    heroClock.textContent = `${h}:${m}:${s} UTC`;
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ============================================================
     CYCLING KEYWORDS
  ============================================================ */
  const cycleWords = ['Network Architecture','Infrastructure','Cybersecurity','Network Security','Systems Engineering'];
  const cycleEl = document.getElementById('cycleWord');
  let cycleIdx = 0;
  setInterval(() => {
    cycleIdx = (cycleIdx + 1) % cycleWords.length;
    cycleEl.style.opacity = 0;
    cycleEl.style.transform = 'translateY(6px)';
    setTimeout(() => {
      cycleEl.textContent = cycleWords[cycleIdx];
      cycleEl.style.transition = 'opacity .4s ease, transform .4s ease';
      cycleEl.style.opacity = 1;
      cycleEl.style.transform = 'translateY(0)';
    }, 250);
  }, 2400);

  /* ============================================================
     COUNT-UP NUMBERS
  ============================================================ */
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      counterObserver.unobserve(e.target);
      const target = parseFloat(e.target.dataset.count);
      const suffix = e.target.dataset.suffix || '';
      const isDecimal = !Number.isInteger(target);
      const dur = 1200;
      const start = performance.now();
      function step(now){
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = target * eased;
        e.target.textContent = (isDecimal ? val.toFixed(1) : Math.round(val)) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  counters.forEach(c => counterObserver.observe(c));

  /* ============================================================
     MAGNETIC BUTTONS
  ============================================================ */
  if (!reduceMotion && matchMedia('(hover: hover)').matches){
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width/2;
        const y = e.clientY - r.top - r.height/2;
        btn.style.transform = `translate(${x*0.18}px, ${y*0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ============================================================
     PARTICLE FIELD (ambient background)
  ============================================================ */
  const particleCanvas = document.getElementById('particles');
  const pctx = particleCanvas.getContext('2d');
  let particles = [];
  function sizeParticles(){
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = document.documentElement.scrollHeight;
  }
  function initParticles(){
    const count = Math.min(70, Math.floor(window.innerWidth / 22));
    particles = Array.from({length: count}, () => ({
      x: Math.random() * particleCanvas.width,
      y: Math.random() * particleCanvas.height,
      r: Math.random() * 1.4 + 0.4,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      a: Math.random() * 0.5 + 0.15
    }));
  }
  function drawParticles(){
    pctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    pctx.fillStyle = '#00e5ff';
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = particleCanvas.width; if (p.x > particleCanvas.width) p.x = 0;
      if (p.y < 0) p.y = particleCanvas.height; if (p.y > particleCanvas.height) p.y = 0;
      pctx.globalAlpha = p.a;
      pctx.beginPath();
      pctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      pctx.fill();
    });
    pctx.globalAlpha = 1;
    if (!reduceMotion) requestAnimationFrame(drawParticles);
  }
  if (!reduceMotion){
    sizeParticles(); initParticles(); drawParticles();
    window.addEventListener('resize', () => { sizeParticles(); initParticles(); });
  }

  /* ============================================================
     HERO CANVAS — floating network nodes + connections
  ============================================================ */
  const heroCanvas = document.getElementById('topoCanvas');
  const hctx = heroCanvas.getContext('2d');
  let heroNodes = [];
  function sizeHero(){
    const hero = document.getElementById('hero');
    heroCanvas.width = hero.clientWidth;
    heroCanvas.height = hero.clientHeight;
  }
  function initHero(){
    const count = Math.min(46, Math.floor(heroCanvas.width / 34));
    heroNodes = Array.from({length: count}, () => ({
      x: Math.random() * heroCanvas.width,
      y: Math.random() * heroCanvas.height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.8 + 1.2
    }));
  }
  function drawHero(){
    hctx.clearRect(0,0,heroCanvas.width, heroCanvas.height);
    const maxDist = Math.min(180, heroCanvas.width / 5);
    heroNodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > heroCanvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > heroCanvas.height) n.vy *= -1;
    });
    for (let i = 0; i < heroNodes.length; i++){
      for (let j = i+1; j < heroNodes.length; j++){
        const a = heroNodes[i], b = heroNodes[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < maxDist){
          hctx.strokeStyle = `rgba(0,229,255,${0.14 * (1 - dist/maxDist)})`;
          hctx.lineWidth = 1;
          hctx.beginPath();
          hctx.moveTo(a.x,a.y); hctx.lineTo(b.x,b.y);
          hctx.stroke();
        }
      }
    }
    heroNodes.forEach(n => {
      hctx.beginPath();
      hctx.fillStyle = 'rgba(0,229,255,0.55)';
      hctx.shadowColor = 'rgba(0,229,255,0.8)';
      hctx.shadowBlur = 6;
      hctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
      hctx.fill();
      hctx.shadowBlur = 0;
    });
    if (!reduceMotion) requestAnimationFrame(drawHero);
  }
  sizeHero(); initHero(); drawHero();
  window.addEventListener('resize', () => { sizeHero(); initHero(); });

  /* ============================================================
     NETWORK TOPOLOGY DIAGRAM (SVG)
  ============================================================ */
  const topoData = [
    { id:'internet', label:'Internet', x:80, y:280, title:'Internet', desc:'Upstream connectivity and the perimeter boundary where the trusted network ends.' },
    { id:'firewall', label:'Firewall', x:270, y:280, title:'Firewall', desc:'Palo Alto / SonicWall policy enforcement — the first line of access control and threat inspection.' },
    { id:'core', label:'Core Switch', x:470, y:280, title:'Core Network', desc:'High-speed backbone routing traffic between every distribution segment.' },
    { id:'dist1', label:'Distribution', x:670, y:150, title:'VLAN Segmentation', desc:'Distribution-layer switching that enforces VLAN boundaries between departments and services.' },
    { id:'dist2', label:'Distribution', x:670, y:410, title:'VLAN Segmentation', desc:'A second distribution path providing redundancy and isolated broadcast domains.' },
    { id:'access1', label:'Access Switch', x:880, y:90, title:'Access Layer', desc:'Edge switching where endpoint devices physically connect to the network.' },
    { id:'servers', label:'Servers', x:880, y:230, title:'Server Infrastructure', desc:'Proxmox virtualization, TrueNAS/Synology storage and core application services.' },
    { id:'wifi', label:'Wi-Fi APs', x:880, y:370, title:'Wireless Network', desc:'Enterprise access points delivering segmented, roaming-ready wireless coverage.' },
    { id:'monitor', label:'Monitoring', x:880, y:490, title:'Monitoring', desc:'Zabbix, Grafana and Prometheus watching every layer above for faults and drift.' },
    { id:'users1', label:'End Users', x:1100, y:90, title:'End Users', desc:'Wired endpoints on the access layer — workstations, printers and IoT devices.' },
    { id:'users2', label:'End Users', x:1100, y:370, title:'End Users', desc:'Wireless clients authenticated and segmented onto the appropriate VLAN.' },
  ];
  const topoEdges = [
    ['internet','firewall'], ['firewall','core'],
    ['core','dist1'], ['core','dist2'],
    ['dist1','access1'], ['dist1','servers'],
    ['dist2','wifi'], ['dist2','monitor'],
    ['access1','users1'], ['wifi','users2'],
  ];
  const svgNS = 'http://www.w3.org/2000/svg';
  const topoSvg = document.getElementById('topoSvg');
  const topoTooltip = document.getElementById('topoTooltip');

  function buildTopology(){
    const byId = Object.fromEntries(topoData.map(n => [n.id, n]));
    const edgesGroup = document.createElementNS(svgNS, 'g');
    const packetsGroup = document.createElementNS(svgNS, 'g');
    const nodesGroup = document.createElementNS(svgNS, 'g');

    topoEdges.forEach(([a,b], i) => {
      const na = byId[a], nb = byId[b];
      const path = document.createElementNS(svgNS, 'path');
      const midX = (na.x + nb.x) / 2;
      const d = `M ${na.x} ${na.y} C ${midX} ${na.y}, ${midX} ${nb.y}, ${nb.x} ${nb.y}`;
      path.setAttribute('d', d);
      path.setAttribute('class', 'topo-edge');
      path.setAttribute('id', `edge-${i}`);
      edgesGroup.appendChild(path);

      if (!reduceMotion){
        const packet = document.createElementNS(svgNS, 'circle');
        packet.setAttribute('r', 2.6);
        packet.setAttribute('class', 'topo-packet');
        const anim = document.createElementNS(svgNS, 'animateMotion');
        anim.setAttribute('dur', `${2.4 + (i % 4) * 0.6}s`);
        anim.setAttribute('repeatCount', 'indefinite');
        anim.setAttribute('begin', `${(i % 5) * 0.4}s`);
        const mpath = document.createElementNS(svgNS, 'mpath');
        mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', `#edge-${i}`);
        mpath.setAttribute('href', `#edge-${i}`);
        anim.appendChild(mpath);
        packet.appendChild(anim);
        packetsGroup.appendChild(packet);
      }
    });

    topoData.forEach(n => {
      const g = document.createElementNS(svgNS, 'g');
      g.setAttribute('class', 'topo-node');
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('aria-label', n.title);

      const glow = document.createElementNS(svgNS, 'circle');
      glow.setAttribute('cx', n.x); glow.setAttribute('cy', n.y); glow.setAttribute('r', 16);
      glow.setAttribute('fill', 'rgba(0,229,255,0.06)');

      const core = document.createElementNS(svgNS, 'circle');
      core.setAttribute('cx', n.x); core.setAttribute('cy', n.y); core.setAttribute('r', 7);
      core.setAttribute('class', 'node-core');
      core.setAttribute('fill', '#0a0e16');
      core.setAttribute('stroke', '#00e5ff');
      core.setAttribute('stroke-width', '1.6');

      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', n.x);
      label.setAttribute('y', n.y + 26);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('class', 'topo-label');
      label.textContent = n.label;

      g.appendChild(glow); g.appendChild(core); g.appendChild(label);
      nodesGroup.appendChild(g);

      function showTip(clientEvent){
        const wrapRect = topoSvg.closest('.topo-wrap').getBoundingClientRect();
        const svgRect = topoSvg.getBoundingClientRect();
        const scaleX = svgRect.width / 1200;
        const scaleY = svgRect.height / 560;
        const px = (svgRect.left - wrapRect.left) + n.x * scaleX;
        const py = (svgRect.top - wrapRect.top) + n.y * scaleY;
        topoTooltip.style.left = px + 'px';
        topoTooltip.style.top = py + 'px';
        topoTooltip.querySelector('.topo-tooltip-title').textContent = n.title;
        topoTooltip.querySelector('.topo-tooltip-body').textContent = n.desc;
        topoTooltip.classList.add('show');
        g.classList.add('active');
      }
      function hideTip(){
        topoTooltip.classList.remove('show');
        g.classList.remove('active');
      }
      g.addEventListener('mouseenter', showTip);
      g.addEventListener('mouseleave', hideTip);
      g.addEventListener('focus', showTip);
      g.addEventListener('blur', hideTip);
      g.addEventListener('click', showTip);
    });

    topoSvg.appendChild(edgesGroup);
    topoSvg.appendChild(packetsGroup);
    topoSvg.appendChild(nodesGroup);
  }
  buildTopology();

  /* ============================================================
     PROJECT CARD EXPAND
  ============================================================ */
  document.querySelectorAll('[data-expand]').forEach(card => {
    const btn = card.querySelector('.project-expand');
    btn.addEventListener('click', () => {
      const willExpand = !card.classList.contains('expanded');
      card.classList.toggle('expanded');
      btn.setAttribute('aria-expanded', String(willExpand));
      btn.querySelector('span:last-child') && (btn.lastChild.textContent = willExpand ? 'Close' : ' details');
      btn.firstChild.textContent = willExpand ? 'Hide details' : 'View details ';
    });
  });

  /* ============================================================
     TERMINAL TYPING SEQUENCE
  ============================================================ */
  const terminalLines = [
    { t:'$ scan --target internal-network --mode full', c:'var(--text-1)' },
    { t:'[OK] perimeter firewall policy ................ enforced', c:'var(--green)' },
    { t:'[OK] VLAN segmentation ......................... verified', c:'var(--green)' },
    { t:'[OK] access control lists ...................... hardened', c:'var(--green)' },
    { t:'[WARN] legacy service exposed on internal segment', c:'var(--amber)' },
    { t:'[FIX] isolated host, applied patch, closed port', c:'var(--green)' },
    { t:'[OK] VAPT review ............................... passed', c:'var(--green)' },
    { t:'$ status: infrastructure hardened', c:'var(--cyan)' },
  ];
  const terminalBody = document.getElementById('terminalBody');
  let terminalStarted = false;
  function runTerminal(){
    if (terminalStarted) return;
    terminalStarted = true;
    terminalBody.innerHTML = '';
    let delay = 0;
    terminalLines.forEach((line, i) => {
      delay += 480;
      setTimeout(() => {
        const div = document.createElement('div');
        div.className = 'terminal-line';
        div.style.color = line.c;
        div.textContent = line.t;
        if (i === terminalLines.length - 1){
          const caret = document.createElement('span');
          caret.className = 'terminal-caret';
          div.appendChild(caret);
        }
        terminalBody.appendChild(div);
      }, delay);
    });
  }
  new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) runTerminal(); });
  }, { threshold: 0.3 }).observe(document.getElementById('security'));

  /* ============================================================
     SKILLS RADIAL MAP
  ============================================================ */
  const skillsData = {
    id:'core', label:'Anaswar', x:500, y:310,
    children:[
      { id:'net', label:'Network Engineering', x:500, y:110, tech:['Routing & Switching','VLAN / STP','Palo Alto','SonicWall'] },
      { id:'infra', label:'Infrastructure', x:790, y:190, tech:['Proxmox','TrueNAS','Synology','Windows Server'] },
      { id:'sysadmin', label:'Systems Administration', x:850, y:440, tech:['Zentyal','SharePoint','NocoBase','Vendor Mgmt'] },
      { id:'cyber', label:'Cybersecurity', x:640, y:570, tech:['VAPT','Security Hardening','Risk Assessment'] },
      { id:'netsec', label:'Network Security', x:360, y:570, tech:['Firewall Policy','Segmentation','ACLs'] },
      { id:'mon', label:'Monitoring', x:150, y:440, tech:['Zabbix','Grafana','Prometheus'] },
      { id:'virt', label:'Virtualization', x:210, y:190, tech:['Proxmox Clusters','Backup & DR','Storage Pools'] },
    ]
  };
  const skillsSvg = document.getElementById('skillsSvg');
  const skillsDetail = document.getElementById('skillsDetail');

  function buildSkills(){
    const linksGroup = document.createElementNS(svgNS, 'g');
    const nodesGroup = document.createElementNS(svgNS, 'g');

    skillsData.children.forEach((child, i) => {
      const link = document.createElementNS(svgNS, 'line');
      link.setAttribute('x1', skillsData.x); link.setAttribute('y1', skillsData.y);
      link.setAttribute('x2', child.x); link.setAttribute('y2', child.y);
      link.setAttribute('class', 'skill-link');
      link.setAttribute('id', `slink-${i}`);
      linksGroup.appendChild(link);
    });

    // core node
    const coreG = document.createElementNS(svgNS, 'g');
    const coreGlow = document.createElementNS(svgNS, 'circle');
    coreGlow.setAttribute('cx', skillsData.x); coreGlow.setAttribute('cy', skillsData.y); coreGlow.setAttribute('r', 42);
    coreGlow.setAttribute('fill', 'rgba(0,229,255,0.06)');
    const coreCircle = document.createElementNS(svgNS, 'circle');
    coreCircle.setAttribute('cx', skillsData.x); coreCircle.setAttribute('cy', skillsData.y); coreCircle.setAttribute('r', 26);
    coreCircle.setAttribute('fill', '#0a0e16'); coreCircle.setAttribute('stroke', '#00e5ff'); coreCircle.setAttribute('stroke-width', '1.8');
    const coreLabel = document.createElementNS(svgNS, 'text');
    coreLabel.setAttribute('x', skillsData.x); coreLabel.setAttribute('y', skillsData.y + 5);
    coreLabel.setAttribute('class', 'skill-label'); coreLabel.textContent = 'AA';
    coreG.appendChild(coreGlow); coreG.appendChild(coreCircle); coreG.appendChild(coreLabel);
    nodesGroup.appendChild(coreG);

    skillsData.children.forEach((child, i) => {
      const g = document.createElementNS(svgNS, 'g');
      g.setAttribute('class', 'skill-node');
      g.setAttribute('tabindex', '0');
      g.setAttribute('role', 'button');
      g.setAttribute('data-idx', i);

      const circle = document.createElementNS(svgNS, 'circle');
      circle.setAttribute('cx', child.x); circle.setAttribute('cy', child.y); circle.setAttribute('r', 15);
      circle.setAttribute('fill', '#0a0e16'); circle.setAttribute('stroke', '#7c8cff'); circle.setAttribute('stroke-width', '1.6');

      const label = document.createElementNS(svgNS, 'text');
      const words = child.label.split(' ');
      const line1 = words.slice(0, Math.ceil(words.length/2)).join(' ');
      const line2 = words.slice(Math.ceil(words.length/2)).join(' ');
      label.setAttribute('x', child.x);
      label.setAttribute('y', child.y - 24);
      label.setAttribute('class', 'skill-label-sub');
      label.textContent = line1 + (line2 ? ' ' + line2 : '');

      g.appendChild(circle); g.appendChild(label);
      nodesGroup.appendChild(g);

      function activate(){
        document.querySelectorAll('.skill-node').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.skill-link').forEach(l => l.classList.remove('active'));
        g.classList.add('active');
        document.getElementById(`slink-${i}`).classList.add('active');
        skillsDetail.innerHTML = `<span class="mono skills-detail-title">${child.label}</span>` +
          child.tech.map(t => `<span class="skills-detail-chip">${t}</span>`).join('');
      }
      g.addEventListener('click', activate);
      g.addEventListener('focus', activate);
      g.addEventListener('mouseenter', activate);
    });

    skillsSvg.appendChild(linksGroup);
    skillsSvg.appendChild(nodesGroup);
  }
  buildSkills();

})();
