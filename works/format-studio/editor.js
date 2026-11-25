const get = id => document.getElementById(id);
const slides = [
    {heading:'①置く場所の幅と奥行き',body:'棚やシンク下は、内側の寸法を測るのがコツ'},
    {heading:'②出し入れする物の高さ',body:'よく使う物がすっと出せるか確認'},
    {heading:'③通路と扉の開く幅',body:'買ったあとに通せない、を防ぐ'}
];
const palettes = {
    sage:['#f3f3df','#213f32','#b2cd96','#d67148'],
    berry:['#faf0e7','#542b40','#dcb7bd','#ac673b'],
    blue:['#ecf5f8','#1d3853','#a4cee0','#bd653c']
};
function pages(){
    return [
        {heading:get('title').value,body:get('sub').value,kind:'COVER'},
        ...slides.map(s=>({...s,kind:'POINT'})),
        {heading:'まとめ',body:get('closing').value,kind:'RECAP'}
    ];
}
// Fit line breaks and font size together so the preview and PNG always match.
function paragraph(ctx,text,x,y,width,height,size,bold=false){
    let lines;
    for(;;size-=2){
        ctx.font=(bold?'700 ':'400 ')+size+'px sans-serif';
        lines=[];
        for(const part of text.split('\n')){
            let line='';
            for(const ch of part){
                if(line && ctx.measureText(line+ch).width>width){lines.push(line);line='';}
                line+=ch;
            }
            lines.push(line);
        }
        if(lines.length*size*1.4<=height || size<=16)break;
    }
    lines.forEach((line,i)=>ctx.fillText(line,x,y+i*size*1.4,width));
}
function draw(canvas,page,index,total){
    canvas.width=1080; canvas.height=1350;
    const ctx=canvas.getContext('2d');
    const [paper,ink,tint,accent]=palettes[get('theme').value];
    const scale=Number(get('size').value);
    const cover=index===0;
    ctx.fillStyle=cover?ink:paper;ctx.fillRect(0,0,1080,1350);
    ctx.fillStyle=cover?paper:ink;ctx.textBaseline='top';
    ctx.font='bold 32px sans-serif';ctx.fillText(page.kind,78,72);ctx.textAlign='right';ctx.fillText((index+1)+'/'+total,1000,72);ctx.textAlign='left';
    ctx.fillRect(78,138,924,3);
    // Overlapping leaves form a consistent print motif across the set.
    ctx.save();ctx.beginPath();ctx.rect(0,163,1080,300);ctx.clip();
    for(let n=0;n<4;n++){
        ctx.fillStyle=[tint,accent,paper,ink][n];ctx.beginPath();
        ctx.ellipse(640+n*125,340-n*12,155,73,-.64,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();ctx.fillStyle=cover?paper:ink;
    const heading=cover ? page.heading.replace(/([^\n])「/g, '$1\n「') : page.heading;
    paragraph(ctx,heading,78,505,924,350,(cover?105:82)*scale,true);
    paragraph(ctx,page.body,78,875,924,290,51*scale);
    if(page.kind==='RECAP'){
        ctx.fillStyle=ink;ctx.fillRect(0,1200,1080,150);ctx.fillStyle=paper;
        paragraph(ctx,'あとで見返せるように保存してね',78,1246,924,80,42*scale,true);
    }else{ctx.fillStyle=accent;ctx.fillRect(78,1240,128,9);}
}
function refresh(){
    const deck=pages(),strip=get('strip');
    while(strip.children.length>deck.length)strip.lastChild.remove();
    deck.forEach((p,i)=>{
        let fig=strip.children[i];
        if(!fig){fig=document.createElement('figure');fig.append(document.createElement('canvas'),document.createElement('figcaption'));strip.append(fig);}
        draw(fig.firstChild,p,i,deck.length);
        fig.lastChild.textContent=(i+1)+' / '+deck.length+'　'+(i===0?'表紙':i===deck.length-1?'まとめ':'本文');
        fig.firstChild.setAttribute('aria-label',[p.heading,p.body].join('。'));
    });
    get('count').textContent='全'+deck.length+'枚';
    get('add').disabled=deck.length>=7;
    get('status').textContent='';
}
function buildForm(){
    get('pages').replaceChildren();
    slides.forEach((slide,i)=>{
        const box=document.createElement('fieldset');
        box.innerHTML='<legend></legend><label>見出し<input maxlength="80"></label><label>本文（改行・箇条書き可）<textarea maxlength="280"></textarea></label><div class="ops"><button>上へ</button><button>下へ</button><button>削除</button></div>';
        box.querySelector('legend').textContent='本文スライド '+(i+2);
        for(const [key,tag] of [['heading','input'],['body','textarea']]){
            const field=box.querySelector(tag);field.value=slide[key];field.oninput=()=>{slide[key]=field.value;};
        }
        const [up,down,remove]=box.querySelectorAll('button');
        function move(offset){[slides[i],slides[i+offset]]=[slides[i+offset],slides[i]];buildForm();}
        up.disabled=i===0;down.disabled=i===slides.length-1;remove.disabled=slides.length===1;
        up.onclick=()=>move(-1);down.onclick=()=>move(1);remove.onclick=()=>{slides.splice(i,1);buildForm();};
        get('pages').append(box);
    });
    refresh();
}
let pending=0;
get('edit').addEventListener('input',()=>{cancelAnimationFrame(pending);pending=requestAnimationFrame(refresh);});
get('add').onclick=()=>{if(slides.length<5){slides.push({heading:'',body:''});buildForm();get('pages').lastChild.querySelector('input').focus();}};
get('save').onclick=async()=>{
    const button=get('save');button.disabled=true;
    try{
        refresh();
        const zip=new JSZip();
        const files=[...get('strip').querySelectorAll('canvas')].map(canvas=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error()),'image/png')));
        const blobs=await Promise.all(files);
        for(const [i,blob] of blobs.entries())zip.file('slide-'+String(i+1).padStart(2,'0')+'.png',await blob.arrayBuffer());
        const url=URL.createObjectURL(await zip.generateAsync({type:'blob'}));
        const link=document.createElement('a');link.href=url;link.download='carousel-studio.zip';document.body.append(link);link.click();link.remove();
        setTimeout(()=>URL.revokeObjectURL(url),60000);
        get('status').textContent=blobs.length+'枚のPNGをまとめました。';
    }catch{get('status').textContent='保存できませんでした。もう一度お試しください。';}
    finally{button.disabled=false;}
};
buildForm();
