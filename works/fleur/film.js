const video = document.querySelector('#atmosphere');
const transport = document.querySelector('.transport');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let enabled = !preference.matches;
let visible = false;
function syncFilm() {
    if (enabled && visible && !document.hidden) {
        video.play().catch(() => { transport.textContent = '映像を再生'; });
    } else {
        video.pause();
    }
}
video.addEventListener('playing', () => { transport.textContent = '映像を一時停止'; });
video.addEventListener('pause', () => { transport.textContent = '映像を再生'; });
transport.onclick = () => { enabled = video.paused; syncFilm(); };
preference.addEventListener('change', () => { enabled = !preference.matches; syncFilm(); });
document.addEventListener('visibilitychange', syncFilm);
new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncFilm();
}).observe(video);

const notes = [
    ['Bergamot','dew','朝の光を映す葉先のしずく','ベルガモットと青葉。葉の先に残る朝露のような、みずみずしい立ち上がり。'],
    ['White Lily','lily','光を透かす白いユリの花びら','リリーとネロリ。やわらかな白い花の香りが、体温とともにゆっくり広がります。'],
    ['Cedarwood','bottle','淡い琥珀色の香水瓶','シダーウッドとムスク。乾いた木の温かさが、肌の上に淡く残ります。']
];
const buttons = [...document.querySelectorAll('.choices button')];
buttons.forEach((button, index) => {
    button.onclick = () => {
        const [title, image, alt, copy] = notes[index];
        buttons.forEach(el => el.setAttribute('aria-pressed', String(el === button)));
        document.querySelector('#name').textContent = title;
        document.querySelector('#note').textContent = copy;
        const plate = document.querySelector('#plate');
        plate.src = 'media/' + image + '.jpg';
        plate.alt = alt;
        if (!preference.matches) plate.animate([{opacity:.35,transform:'scale(1.045)'},{opacity:1,transform:'scale(1)'}],{duration:550});
    };
});
