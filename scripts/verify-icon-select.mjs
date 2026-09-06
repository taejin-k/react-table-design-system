// Run after pnpm build, with Storybook on :6006. Uses the production JS/CSS too.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const session = `icon-select-${process.pid}`;
const browser = (...args) =>
  execFileSync("agent-browser", ["--session", session, ...args], {
    encoding: "utf8",
    timeout: 30000,
  }).trim();
const evaluate = (code) => JSON.parse(browser("eval", code));
const failures = [];
try {
  browser("open", "http://localhost:6006/iframe.html?id=components-select--search&viewMode=story");
  browser("snapshot", "-i");
  browser("wait", "--fn", "document.querySelector('#storybook-root')?.children.length > 0");
  const names = evaluate(`(async()=>{
    const text = await(await fetch('/src/components/Select/Select.tsx')).text();
    const url=text.match(/from "([^"]*\\/react.js[^"]*)"/)[1];
    const React=(await import(url)).default;
    const {createRoot}=(await import(url.replace(/react.js.*$/,'react-dom_client.js'))).default;
    const names=['Icon','Button','Tag','Checkbox','Radio','Toggle','Label','ErrorMessage','Breadcrumb','Input','TextArea','Tooltip','Popover','Dropdown','Segmented','Illustrations','Flex','Select'];
    const modules=await Promise.all(names.map(n=>import('/src/components/'+n+'/'+n+'.tsx')));
    const source=Object.fromEntries(names.map((n,i)=>[n,modules[i][n]]));
    const built=await import('/dist/index.mjs');
    const host=document.createElement('div');host.style='position:absolute;inset:0;background:white;z-index:999;padding:20px';document.body.append(host);
    const app=document.createElement('div');host.append(app);
    const root=createRoot(app); const e=React.createElement;
    const options=[{value:0,label:'김민준'},{value:'lee',label:'이서연'},{value:'off',label:'비활성',disabled:true}];
    const make=(c,name,text,variant)=>{
      const p={className:'audit-root'};
      switch(name){
        case 'Icon': return e(c.Icon,{...p,icon:variant?'loading':'add',onClick:()=>{window.auditClicks++}});
        case 'Button':return e(c.Button,{...p,variant:variant?'secondary':'primary',disabled:variant===2},text);
        case 'Tag':return e(c.Tag,{...p,color:variant?'primary':'gray'},text);
        case 'Checkbox':return e(c.Checkbox,{...p,label:text,defaultChecked:!variant,partiallyChecked:variant===1,error:variant===1,disabled:variant===2});
        case 'Radio':return e(c.Radio,{...p,label:text,defaultChecked:true,error:variant===1,disabled:variant===2});
        case 'Toggle':return e(c.Toggle,{...p,checked:!!variant,loading:variant===2});
        case 'Label':return e(c.Label,{...p,label:text,required:true});
        case 'ErrorMessage':return e(c.ErrorMessage,{...p,errorMessage:text});
        case 'Breadcrumb':return e(c.Breadcrumb,{...p,items:[{title:'홈',onClick:()=>{}},{title:text}]});
        case 'Input':return e(c.Input,{...p,label:'입력',defaultValue:text,allowClear:true,showCount:true,errorMessage:variant===1?'오류':undefined,disabled:variant===2});
        case 'TextArea':return e(c.TextArea,{...p,label:'내용',defaultValue:text,showCount:true,errorMessage:variant===1?text:undefined,disabled:variant===2});
        case 'Tooltip':return e(c.Tooltip,{...p,title:text},e(c.Button,null,text));
        case 'Popover':return e(c.Popover,{...p,content:text},e(c.Button,null,text));
        case 'Dropdown':return e(c.Dropdown,{...p,menu:{items:[{value:'a',label:text}]}},e(c.Button,null,text));
        case 'Segmented':return e(c.Segmented,{...p,fullWidth:variant===1,vertical:variant===2,options:[{value:'a',label:text},{value:'b',label:'주간',tooltip:'주간 설명'},{value:'c',label:'월간'}]});
        case 'Illustrations':return e(c.Illustrations,{...p,type:variant?'comingSoon':'permission',description:text});
        case 'Flex':return e(c.Flex,{...p,className:'audit-root flex-wrap',gap:8},e(c.Button,null,text),e(c.Button,null,'다음'));
        case 'Select':return e(c.Select,{...p,options,mode:variant===1?'multiple':variant===2?'tags':undefined,defaultValue:variant?[0,'lee']:0,placeholder:text});
      }
    };
    const production=document.createElement('link');production.rel='stylesheet';production.href='/dist/style.css';await new Promise((ok,bad)=>{production.onload=ok;production.onerror=bad;document.head.append(production)});await document.fonts.ready;production.sheet.disabled=true;
    window.audit={e,root,app,host,source,built,make,options,production};window.auditClicks=0;
    return names;
  })()`);
  let count = 0;
  for (const viewport of [390, 1280]) {
    browser("set", "viewport", String(viewport), "900");
    for (const name of names)
      for (const variant of [0, 1, 2]) {
        const text =
          variant === 1
            ? "1234567890".repeat(18)
            : variant === 2
              ? "안녕하세요".repeat(28)
              : "기본 문구";
        const result = evaluate(`(async()=>{
        const a=window.audit;a.app.style.width='320px';
        const captures=[];const errors=[];
        for(const kind of ['source','built']){
          // Disable the loaded CSSStyleSheet, not the link: toggling link.disabled
          // may reload @import fonts and temporarily leave styles unavailable.
          [...document.styleSheets].filter(s=>s!==a.production.sheet).forEach(s=>{s.disabled=kind==='built'});a.production.sheet.disabled=kind!=='built';
          a.root.render(a.e('section',{key:kind+${JSON.stringify(name + variant)}},a.make(a[kind],${JSON.stringify(name)},${JSON.stringify(text)},${variant})));
          await new Promise(r=>setTimeout(r,300));
          await document.fonts.ready;
          await new Promise(requestAnimationFrame);
          const root=a.app.firstElementChild.firstElementChild;
          if(!root.classList.contains('audit-root'))errors.push(kind+' missing root className');
          if(a.app.scrollWidth>a.app.clientWidth+2)errors.push(kind+' overflow '+a.app.scrollWidth);
          if([...a.app.querySelectorAll('*')].some(el=>[...el.attributes].some(at=>at.name.startsWith('aria-'))))errors.push(kind+' ARIA attribute');
          if(${JSON.stringify(name)}==='Flex'&&getComputedStyle(root).flexWrap!=='wrap')errors.push(kind+' Tailwind wrap ignored');
          captures.push([...a.app.querySelectorAll('*')].map(el=>{
            const s=getComputedStyle(el);return [el.tagName,...['display','width','height','padding','gap','color','backgroundColor','borderColor','borderRadius','boxShadow','fontFamily','fontSize','lineHeight','overflow','transitionDuration','flexWrap'].map(p=>s[p])];
          }));
        }
        if(JSON.stringify(captures[0])!==JSON.stringify(captures[1])){
          const i=captures[0].findIndex((x,i)=>JSON.stringify(x)!==JSON.stringify(captures[1][i]));
          errors.push('source/build style mismatch at '+i+': '+JSON.stringify([captures[0][i],captures[1][i]]));
        }
        return {errors};
      })()`);
        count++;
        if (result.errors.length) {
          failures.push({ viewport, name, variant, ...result });
          console.log("FAIL", failures.at(-1));
        }
      }
    console.log(`Checked all 18 components at ${viewport}px`);
  }
  console.log(`${count} source/build comparisons; ${failures.length} failures`);
  assert.equal(failures.length, 0, JSON.stringify(failures, null, 2));
} finally {
  browser("close");
}
