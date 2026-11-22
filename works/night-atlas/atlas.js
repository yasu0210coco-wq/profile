const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const choices = [...document.querySelectorAll('.choice')];
const hues = [210, 270, 162];
const captions = ['青白い光が尾根を縫い、遠くの星が流れていきます。','薄紫の星雲を横切る光が、ゆるやかな弧を描きます。','緑色の光が波打つ、静かな岸辺の夜空です。'];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let selected = 0, phase = 0, previous = 0, task = 0, running = !reduced.matches;
function paint(stamp) {
    cancelAnimationFrame(task);
    if (running && previous) phase += Math.min(50,stamp-previous)/1000;
    previous = stamp;
    const w = canvas.clientWidth, h = canvas.clientHeight, d = Math.min(devicePixelRatio,2);
    if (canvas.width !== Math.round(w*d) || canvas.height !== Math.round(h*d)) {
        canvas.width = Math.round(w*d); canvas.height = Math.round(h*d);
    }
    ctx.setTransform(d,0,0,d,0,0);
    const hue = hues[selected];
    const glow = ctx.createRadialGradient(w*.68,h*.48,0,w*.68,h*.48,w*.82);
    glow.addColorStop(0,'hsl('+hue+' 72% 17%)'); glow.addColorStop(.45,'#070b24'); glow.addColorStop(1,'#01030a');
    ctx.fillStyle=glow; ctx.fillRect(0,0,w,h);
    for(let i=1;i<=220;i++){
        const x=((i*.61803398875 + .035*Math.sin(i*12.2))%1)*w;
        const y=((i*.41421356237 + .071*Math.cos(i*4.13))%1)*h;
        ctx.globalAlpha=.48+.30*Math.sin(i+phase);
        ctx.fillStyle='#deefff';ctx.beginPath();ctx.arc(x,y,i%11===0?1.6:.8,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    const bolt = new Path2D();
    for(let j=0;j<=200;j++){
        const y=j/200;
        const x=.68+.055*Math.sin(y*9+phase*.5+selected)+.028*Math.sin(y*19-phase*.32)+.007*Math.sin(y*88+phase)+.004*Math.sin(y*239+phase*.82);
        if(!j) bolt.moveTo(x*w,0); else bolt.lineTo(x*w,y*h);
    }
    ctx.lineJoin='round';ctx.shadowColor='hsl('+hue+' 100% 62%)';
    for(const [width,alpha,blur] of [[18,.10,28],[7,.48,14],[2.4,1,7]]){
        ctx.lineWidth=width;ctx.shadowBlur=blur;ctx.strokeStyle='hsla('+hue+' 100% '+(width<3?'92%':'62%')+' / '+alpha+')';ctx.stroke(bolt);
    }
    ctx.shadowBlur=0;
    if(running && !document.hidden) task=requestAnimationFrame(paint);
}
function update(){
    previous=0;document.querySelector('#pause').textContent=running?'動きを止める':'動きを再生';
    document.querySelector('#reading').textContent=captions[selected];
    choices.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)));
    paint(0);
}
choices.forEach((b,i)=>b.onclick=()=>{selected=i;update()});
document.querySelector('#pause').onclick=()=>{running=!running;update()};
reduced.addEventListener('change',()=>{running=!reduced.matches;update()});
document.addEventListener('visibilitychange',update);
new ResizeObserver(update).observe(canvas);
update();
