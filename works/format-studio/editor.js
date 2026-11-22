const get = id => document.getElementById(id);
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const palettes = {amber:['#30251f','#ae8458','#edc891'],forest:['#15271c','#638166','#c2d2a5'],night:['#101627','#475879','#becdec']};
function render(){
    const [w,h] = get('size').value.split(',').map(Number);
    canvas.width=w; canvas.height=h;
    const colors=palettes[get('palette').value];
    const field=ctx.createLinearGradient(0,h,w,0);
    colors.forEach((color,i)=>field.addColorStop(i/2,color));
    ctx.fillStyle=field;ctx.fillRect(0,0,w,h);
    ctx.save();ctx.translate(w*.76,h*.29);ctx.rotate(-.52);
    for(let i=0;i<19;i++){
        ctx.lineWidth=w*.0016;ctx.strokeStyle='rgba(255,248,221,.4)';
        ctx.beginPath();ctx.ellipse(0,0,w*(.09+i*.015),w*(.23+i*.014),i*.045,0,Math.PI*2);ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle='#fff9e9';
    function fit(value,y,size,family){
        ctx.font=size+'px '+family;
        const available=w*.84;
        if(ctx.measureText(value).width>available) ctx.font=(size*available/ctx.measureText(value).width)+'px '+family;
        ctx.fillText(value,w*.08,y);
    }
    fit(get('title').value,h*.73,w*.145,'Georgia, serif');
    fit(get('tag').value,h*.83,w*.043,'system-ui, sans-serif');
    document.querySelector('output').textContent='';
}
document.querySelector('.controls').addEventListener('input',render);
get('save').onclick=()=>{
    const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='format-studio-'+canvas.width+'x'+canvas.height+'.png';a.click();
    document.querySelector('output').textContent='PNGの保存を開始しました。';
};
render();
