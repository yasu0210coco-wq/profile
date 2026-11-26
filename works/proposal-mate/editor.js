'use strict';
const el = id => document.getElementById(id);
const value = id => el(id).value.trim();
const sample = `【架空の募集】暮らしのアイデアを届けるSNS運用サポート
投稿文の草案と、月ごとの投稿予定の整理をお願いできる方を探しています。

応募時に教えてください。
①自己紹介・就業状況
②SNSの運用経験
③週の作業時間
④応募のきっかけ`;
const marker = /(?:応募(?:方法|項目|事項|時|の際|にあたって|フォーム|テンプレート)|以下.{0,45}(?:添え|記載|回答|教え|応募)|次の.{0,30}(?:回答|教え|添え)|記載.{0,16}応募)/;
const number = /[①-⑳]|(?:^|\s)(?:[（(][\d０-９]+[)）]|[\d０-９]+[.．、:：)）])/g;
function extract(text){
    const lines=text.replace(/\r\n?/g,'\n').replace(number,match=>'\n'+match.trimStart()).split('\n');
    const items=[];
    let active=false;
    for(const raw of lines){
        const line=raw.trim();
        const item=line.match(/^(?:[①-⑳]|[（(][\d０-９]+[)）]|[\d０-９]+[.．、:：)）]|[・●○◆■※*＊\-–])\s*(.+)$/);
        if(active && item){items.push(item[1].trim());continue;}
        if(marker.test(line)){
            active=true;
            const tail=line.match(/[:：]\s*[・●*-]\s*(.+)$/);
            if(tail)items.push(tail[1]);
            continue;
        }
        if(active && line && (items.length || /^【/.test(line)))break;
    }
    return items;
}
let items=[];
function renderItems(){
    const list=el('items');list.replaceChildren();
    items.forEach((text,i)=>{
        const li=document.createElement('li');
        li.innerHTML='<input><div class="ops"><button>上へ</button><button>下へ</button><button>削除</button></div>';
        const input=li.querySelector('input');input.value=text;input.setAttribute('aria-label','応募項目 '+(i+1));input.oninput=()=>{items[i]=input.value;};
        const [up,down,remove]=li.querySelectorAll('button');
        const move=offset=>{[items[i],items[i+offset]]=[items[i+offset],items[i]];renderItems();list.children[i+offset].querySelector('input').focus();};
        up.disabled=i===0;down.disabled=i===items.length-1;up.onclick=()=>move(-1);down.onclick=()=>move(1);remove.onclick=()=>{items.splice(i,1);renderItems();};
        list.append(li);
    });
    el('extracted').textContent=items.length?items.length+'項目。内容と順番を確認してください。':'項目がない場合は、自己紹介・運用実績・稼働条件・締め文の標準構成で作成します。';
}
function readJob(){items=extract(el('job').value);renderItems();}
el('sample').onclick=()=>{el('job').value=sample;readJob();};
el('job').oninput=readJob;
el('add').onclick=()=>{items.push('');renderItems();el('items').lastChild.querySelector('input').focus();};
el('price').onchange=()=>{el('amountLabel').hidden=value('price')!=='amount';};
function introduction(){
    const age=value('age').replace(/^([0-9０-９]+)$/,'$1歳');
    const place=value('place').replace(/在住$/,'');
    const details=[age,place && place+'在住'].filter(Boolean).join('、');
    return 'はじめまして。'+(value('name')||'［名前］')+(details?'（'+details+'）':'')+'と申します。';
}
function priceLine(){
    switch(value('price')){
        case 'range':return '金額は募集条件の範囲でご提案いたします。';
        case 'amount':return '希望額は'+value('amount').replace(/円$/,'')+'円です。';
        default:return '金額は業務内容をご相談のうえ、ご提案いたします。';
    }
}
const fee=/金額|見積|単価|希望額|報酬|料金|予算/;
function answer(title){
    const lines=[];
    if(/自己紹介|名前|氏名|年齢|住まい|居住/.test(title))lines.push([value('name'),value('age'),value('place')].filter(Boolean).join('／')||'［自己紹介を記入］');
    if(/就業|職業|本業|勤務先/.test(title))lines.push('［現在の就業状況を記入］');
    if(/経験|実績|運用歴|スキル|得意|プロフィール/.test(title))lines.push(value('profile')||'［関連する経験を記入］');
    if(/稼働|作業時間|週の|対応可能|返信/.test(title))lines.push(value('hours')||'［稼働条件を記入］');
    if(/きっかけ|動機|応募理由/.test(title))lines.push('［募集文のどの点に関心を持ったか、ご自身の言葉で記入］');
    if(fee.test(title))lines.push(priceLine());
    return lines.filter(Boolean).join('\n')||'［「'+title+'」への回答を記入］';
}
function draft(){
    const requested=items.map(s=>s.trim()).filter(Boolean);
    const sections=[['冒頭',introduction()]];
    if(requested.length){
        requested.forEach(title=>sections.push([title,'【'+title+'】\n'+answer(title)]));
    }else{
        sections.push(['運用・実績','【運用・実績】\n'+(value('profile')||'［運用経験を記入］')],['稼働条件','【稼働条件】\n'+(value('hours')||'［稼働条件を記入］')]);
    }
    const closing='ご検討よろしくお願いいたします。';
    sections.push(['締め文',(requested.some(t=>fee.test(t))?'':priceLine()+'\n')+closing]);
    return sections;
}
const fullText=()=>[...el('sections').querySelectorAll('textarea')].map(t=>t.value).join('\n\n');
function updateCount(){el('count').textContent=Array.from(fullText()).length+'文字';el('feedback').textContent='';}
async function copy(text){
    try{
        if(!navigator.clipboard)throw Error();
        await navigator.clipboard.writeText(text);
    }catch{
        const box=document.createElement('textarea');box.value=text;box.style.position='fixed';document.body.append(box);box.select();
        const ok=document.execCommand('copy');box.remove();
        if(!ok){el('feedback').textContent='コピーできませんでした。下書きの文面を選択してコピーしてください。';return;}
    }
    el('feedback').textContent='コピーしました。';
}
el('generate').onclick=()=>{
    if(value('price')==='amount' && !/^\d+(?:,\d{3})*円?$/.test(value('amount').normalize('NFKC'))){el('notice').textContent='希望額を数字で入力してください。';el('amount').focus();return;}
    el('notice').textContent='';el('sections').replaceChildren();
    draft().forEach(([label,text],i)=>{
        const article=document.createElement('article');
        article.innerHTML='<label></label><textarea></textarea><button>この部分をコピー</button>';
        const field=article.querySelector('textarea');field.id='draft-'+i;field.value=text;field.rows=Math.min(9,Math.max(3,Math.ceil(text.length/28)+1));field.oninput=updateCount;
        const caption=article.querySelector('label');caption.htmlFor=field.id;caption.textContent=label;
        article.querySelector('button').onclick=()=>copy(field.value);el('sections').append(article);
    });
    el('copyAll').disabled=false;updateCount();el('draft').scrollIntoView({block:'start'});
};
el('copyAll').onclick=()=>copy(fullText());
renderItems();
