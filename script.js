const contactForm = document.getElementById('contact-form');
if (contactForm) {
    const submitBtn = document.getElementById('contact-submit-btn');
    const btnLabel = submitBtn.querySelector('.btn-label');
    const errorBox = document.getElementById('contact-form-error');
    const successBox = document.getElementById('contact-form-success');
    const defaultLabelHTML = btnLabel.innerHTML;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        errorBox.hidden = true;
        submitBtn.disabled = true;
        btnLabel.textContent = '送信中...';

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(contactForm)
            });

            if (response.ok) {
                contactForm.reset();
                contactForm.hidden = true;
                successBox.hidden = false;
            } else {
                errorBox.textContent = '送信に失敗しました。時間をおいて再度お試しください。';
                errorBox.hidden = false;
            }
        } catch (error) {
            errorBox.textContent = '送信に失敗しました。時間をおいて再度お試しください。';
            errorBox.hidden = false;
        } finally {
            submitBtn.disabled = false;
            btnLabel.innerHTML = defaultLabelHTML;
        }
    });
}

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const canvas = document.querySelector('#flower');
const ctx = canvas.getContext('2d');
const toggle = document.querySelector('#motion');
let moving = !reduced.matches;
let visible = true;
let tick = 0;
let time = 0;
let previous = 0;

function flower(x, y, size, angle, phase) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(size, size * .90);
    for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate(i * Math.PI / 3 + Math.sin(phase + i) * .025);
        const length = .90 + .12 * Math.cos(i * 2);
        ctx.scale(1, length);
        const silk = ctx.createLinearGradient(-.28, -.8, .28, -.35);
        for (const [position, color] of [[0,'#827851'],[.20,'#d5cda4'],[.48,'#fffbe4'],[.58,'#fff9d9'],[.66,'#d5c394'],[1,'#746744']]) silk.addColorStop(position,color);
        ctx.fillStyle = silk;
        ctx.beginPath();
        ctx.moveTo(0,.04);
        ctx.bezierCurveTo(-.18,-.19,-.35,-.50,-.21,-.76);
        ctx.bezierCurveTo(-.14,-.91,.04,-.95,.08,-1.12);
        ctx.bezierCurveTo(.12,-.89,.38,-.69,.22,-.42);
        ctx.bezierCurveTo(.14,-.21,.06,-.10,0,.04);
        ctx.fill();
        ctx.strokeStyle = '#ac956642';
        ctx.lineWidth = .004;
        for (let n=-3;n<=3;n++) {
            ctx.beginPath();
            ctx.moveTo(0,-.06);
            ctx.bezierCurveTo(n*.019,-.36,n*.082,-.73,.077,-1.06);
            ctx.stroke();
        }
        ctx.restore();
    }
    for(let i=0;i<6;i++){
        const dx=Math.sin(i*1.4)*.18, dy=-.12-i*.032;
        ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(dx*.25,-.13,dx,dy);
        ctx.lineWidth=.012;ctx.strokeStyle='#bc9438';ctx.stroke();
        ctx.fillStyle='#a96c19';ctx.beginPath();ctx.ellipse(dx,dy,.036,.014,i*.48,0,2*Math.PI);ctx.fill();
    }
    ctx.restore();
}

function draw(now=0){
    cancelAnimationFrame(tick);
    if(previous && moving) time+=Math.min(now-previous,60)*.00045;
    previous=now;
    const w=canvas.clientWidth,h=canvas.clientHeight,d=Math.min(devicePixelRatio,w<=720?1.25:2);
    if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){
        canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);
    }
    ctx.setTransform(d,0,0,d,0,0);
    ctx.clearRect(0,0,w,h);
    const narrow=w<=720, x=w*(narrow?.77:.73), y=h*(narrow?.24:.49), size=Math.min(w*(narrow?.17:.20),h*.37);
    for(let i=0;i<38;i++){
        const px=w*((Math.sin(i*913.2)*435.8)%1+1)%w;
        const py=((i*.618+time*.007)%1)*h;
        ctx.fillStyle='rgba(252,222,160,'+(.10+.10*Math.sin(i+time))+')';
        ctx.beginPath();ctx.arc(px,py,1+i%3,0,2*Math.PI);ctx.fill();
    }
    flower(x+size*.78,y-size*.67,size*.35,1.4,time);
    flower(x,y,size,-.48+.045*Math.sin(time),time);
    flower(x+size*.7,y+size*.64,size*.43,.5,time+.7);
    toggle.textContent=moving?'演出を停止':'演出を再生';
    toggle.setAttribute('aria-label',toggle.textContent);
    if(moving && visible && !document.hidden) tick=requestAnimationFrame(draw);
}
toggle.onclick=()=>{moving=!moving;previous=0;draw()};
reduced.addEventListener('change',()=>{moving=!reduced.matches;draw()});
new ResizeObserver(()=>draw()).observe(canvas);
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;previous=0;draw()}).observe(canvas);
document.addEventListener('visibilitychange',()=>{previous=0;draw()});

document.querySelector('#ratio').onchange=event=>{
    document.querySelector('#frame').style.aspectRatio=event.target.value;
};
const play = document.querySelector('#play');
const film = document.querySelector('#campaign-film');
play.onclick = async () => {
    if (!film.paused) return film.pause();
    if (film.ended) film.currentTime = 0;
    try { await film.play(); } catch { play.textContent = '再生を再試行'; }
};
film.addEventListener('playing', () => { play.textContent = '広告を一時停止'; });
film.addEventListener('pause', () => { play.textContent = '広告を再開'; });
film.addEventListener('ended', () => { play.textContent = 'もう一度再生'; });

document.addEventListener('click', event => {
    const current = event.target.closest('details');
    document.querySelectorAll('details[open]').forEach(panel => {
        if (panel !== current) panel.open = false;
    });
});

const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) {
        if (entry.isIntersecting) {
            entry.target.classList.add('arrived');
            reveal.unobserve(entry.target);
        }
    }
});
document.querySelectorAll('.work-detail-card, .duo article, section > h2').forEach(el => reveal.observe(el));

const services = {design:'デザイン・Web制作',motion:'広告動画',app:'アプリ開発'};
const requestedService = services[new URLSearchParams(location.search).get('service')];
if (requestedService) document.querySelector('#service').value = requestedService;

const rail = document.querySelector('.rail');
const sequence = rail.querySelector('.sequence');
const duplicate = sequence.cloneNode(true);
duplicate.setAttribute('aria-hidden','true');
duplicate.querySelectorAll('a').forEach(link=>link.tabIndex=-1);
rail.querySelector('.track').append(duplicate);
let railPaused = reduced.matches || matchMedia("(max-width: 720px)").matches;
let railVisible = false;
let railTask = 0;
let railTime = 0;
let position = 0;
let hovering = false;
let touching = false;
function labelRail(){
    document.querySelector('#railPause').textContent=railPaused?'一覧を再生':'一覧を停止';
}
function runRail(now){
    if(railTime) position+=Math.min(60,now-railTime)*.035;
    position%=sequence.offsetWidth;
    rail.scrollLeft=position;
    railTime=now;
    railTask=requestAnimationFrame(runRail);
}
function syncRail(){
    cancelAnimationFrame(railTask);
    railTime=0;
    position=rail.scrollLeft;
    if(railVisible && !document.hidden && !railPaused && !hovering && !touching && !rail.contains(document.activeElement)){
        railTask=requestAnimationFrame(runRail);
    }
    labelRail();
}
document.querySelector('#railPause').onclick=()=>{railPaused=!railPaused;syncRail()};
function stepRail(direction){
    const step=sequence.children[1].offsetLeft-sequence.children[0].offsetLeft;
    const width=sequence.offsetWidth;
    rail.scrollLeft=(rail.scrollLeft + direction*step + width)%width;
    syncRail();
}
document.querySelector('#back').onclick=()=>stepRail(-1);
document.querySelector('#forward').onclick=()=>stepRail(1);
rail.addEventListener('pointerenter',e=>{hovering=e.pointerType==='mouse';syncRail()});
rail.addEventListener('pointerleave',()=>{hovering=false;syncRail()});
rail.addEventListener('touchstart',()=>{touching=true;syncRail()},{passive:true});
rail.addEventListener('touchend',()=>{touching=false;syncRail()},{passive:true});
rail.addEventListener('touchcancel',()=>{touching=false;syncRail()});
rail.addEventListener('focusin',syncRail);
rail.addEventListener('focusout',()=>requestAnimationFrame(syncRail));
reduced.addEventListener('change',()=>{railPaused=reduced.matches;syncRail()});
document.addEventListener('visibilitychange',syncRail);
new IntersectionObserver(([e])=>{railVisible=e.isIntersecting;syncRail()}).observe(rail);
labelRail();
