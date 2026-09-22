const menu = document.querySelector('.menu');
const links = document.querySelector('.nav-links');
menu?.addEventListener('click', () => {
  const open = links.classList.toggle('mobile-open');
  menu.setAttribute('aria-expanded', String(open));
});
links?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  links.classList.remove('mobile-open');
  menu?.setAttribute('aria-expanded', 'false');
}));

const obs = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) e.target.classList.add('visible');
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(x => obs.observe(x));

// Count-up stats.
const countObs = new IntersectionObserver(entries => entries.forEach(entry => {
  if (!entry.isIntersecting) return;
  const el = entry.target;
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const end = Number(el.dataset.count || 0), suffix = el.dataset.suffix || '';
  const duration = 900, start = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(end * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}), { threshold: .7 });
document.querySelectorAll('[data-count]').forEach(x => countObs.observe(x));

// Mouse-follow glow and subtle 3D tilt.
const glow = document.querySelector('.cursor-glow');
let mx = -100, my = -100;
window.addEventListener('pointermove', e => {
  mx = e.clientX; my = e.clientY;
  if (glow) glow.style.transform = `translate3d(${mx - 170}px,${my - 170}px,0)`;
});

document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('pointermove', e => {
    if (window.innerWidth < 900) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(900px) rotateX(${y * -4}deg) rotateY(${x * 5}deg) translateY(-4px)`;
  });
  card.addEventListener('pointerleave', () => card.style.transform = '');
});

// Magnetic buttons.
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('pointermove', e => {
    if (window.innerWidth < 900) return;
    const r = btn.getBoundingClientRect();
    btn.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.12}px)`;
  });
  btn.addEventListener('pointerleave', () => btn.style.transform = '');
});

// Lightweight animated neural background.
const canvas = document.getElementById('aiCanvas');
const ctx = canvas?.getContext('2d');
const points = [];
function resizeCanvas(){ if(!canvas) return; canvas.width=innerWidth*devicePixelRatio; canvas.height=innerHeight*devicePixelRatio; canvas.style.width=innerWidth+'px'; canvas.style.height=innerHeight+'px'; ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); }
function seed(){ points.length=0; const n=Math.min(55, Math.floor(innerWidth/25)); for(let i=0;i<n;i++) points.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:Math.random()*1.6+.5}); }
function draw(){
  if(!ctx) return;
  ctx.clearRect(0,0,innerWidth,innerHeight);
  for(const p of points){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>innerWidth)p.vx*=-1;if(p.y<0||p.y>innerHeight)p.vy*=-1;}
  for(let i=0;i<points.length;i++) for(let j=i+1;j<points.length;j++){
    const a=points[i],b=points[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy);
    if(d<145){ctx.strokeStyle=`rgba(67,145,255,${(1-d/145)*.14})`;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  }
  for(const p of points){ctx.fillStyle='rgba(91,164,255,.42)';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}
  requestAnimationFrame(draw);
}
resizeCanvas(); seed(); draw();
window.addEventListener('resize',()=>{resizeCanvas();seed();});


// Real contact form: sends submissions through FormSubmit without leaving the portfolio page.
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const sendMessageBtn = document.getElementById('sendMessageBtn');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const honey = contactForm.querySelector('[name="_honey"]');
    if (honey && honey.value.trim()) return;

    const original = sendMessageBtn.innerHTML;
    sendMessageBtn.disabled = true;
    sendMessageBtn.innerHTML = '<span>Sending...</span><span aria-hidden="true">↗</span>';
    formStatus.className = 'form-status';
    formStatus.textContent = 'Sending your message...';

    try {
      const response = await fetch('https://formsubmit.co/ajax/abhinaymakkena2004@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(contactForm)))
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) throw new Error(data.message || 'Unable to send');

      contactForm.reset();
      formStatus.className = 'form-status success';
      formStatus.textContent = 'Message sent successfully. Thank you!';
    } catch (error) {
      formStatus.className = 'form-status error';
      formStatus.textContent = 'Could not send right now. Please try again or email me directly.';
    } finally {
      sendMessageBtn.disabled = false;
      sendMessageBtn.innerHTML = original;
    }
  });
}
