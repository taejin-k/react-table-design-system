// Run after pnpm build, with Storybook on :6006. Uses the production JS/CSS too.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const session = `table-upload-${process.pid}`;
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
    const names=["Table","Badge","ColorPicker","Avatar","Image","Collapse","Message","Notification","Modal","Drawer","DatePicker","TimePicker","Calendar","Menu","Skeleton","Tabs","Tree","Upload"];
    const modules=await Promise.all(names.map(n=>import('/src/components/'+n+'/'+n+'.tsx')));
    const source=Object.fromEntries(names.map((n,i)=>[n,modules[i][n] ?? modules[i][n.toLowerCase()]]));
    source.Button=(await import('/src/components/Button/Button.tsx')).Button; const built=await import('/dist/index.mjs?audit='+Date.now());
    const host=document.createElement('div');host.style='position:absolute;inset:0;background:white;z-index:999;padding:20px';document.body.append(host);
    // Keep Storybook's unrelated canvas/page scrollbar out of production-CSS comparison.
    document.querySelector('#storybook-root').style.display='none';
    document.documentElement.style.cssText='margin:0;overflow:hidden;scrollbar-gutter:auto';
    document.body.style.cssText='margin:0;overflow:hidden;scrollbar-gutter:auto';
    const app=document.createElement('div');host.append(app);
    const root=createRoot(app); const e=React.createElement;
    const options=[{value:0,label:'김민준'},{value:'lee',label:'이서연'},{value:'off',label:'비활성',disabled:true}];
    const make=(c,name,text,variant)=>{
      const p={className:'audit-root'};
      switch(name){
        case 'Table': return e(c.Table,{...p,columns:[{key:'name',dataIndex:'name',title:text}],dataSource:[{id:'a',name:text}],pagination:false,rowSelection:variant===2?{type:'checkbox'}:undefined});
        case 'Badge':return e(c.Badge,{...p,color:variant?'primary':'success',label:text});
        case 'ColorPicker':return e(c.ColorPicker,{...p,showLabel:true,disabled:variant===2});
        case 'Avatar':return e(c.Avatar,{...p,showLabel:variant===1},text);
        case 'Image':return e(c.Image,{...p,src:'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="40"/%3E',alt:text,width:160,height:100,preview:variant!==2});
        case 'Collapse':return e(c.Collapse,{...p,items:[{key:'a',label:text,children:text}],defaultActiveKey:variant?['a']:[]});
        case 'Message':case 'Notification':return null;
        case 'Modal':return e(c.Modal,{...p,open:true,title:variant?text:'제목',closable:variant!==2},text);
        case 'Drawer':return e(c.Drawer,{...p,open:true,title:'제목',placement:variant===1?'bottom':'right',size:280},text);
        case 'DatePicker':return e(c.DatePicker,{...p,placeholder:text,errorMessage:variant===1?text:undefined,disabled:variant===2});
        case 'TimePicker':return e(c.TimePicker,{...p,placeholder:text,errorMessage:variant===1?text:undefined,disabled:variant===2});
        case 'Calendar':return e(c.Calendar,{...p,fullscreen:variant!==2});
        case 'Menu':return e(c.Menu,{...p,mode:variant?'inline':'vertical',items:[{key:'a',label:text},{key:'b',label:'다음'}]});
        case 'Skeleton':return e(c.Skeleton.Node,{...p,active:!!variant,width:160,height:32});
        case 'Tabs':return e(c.Tabs,{...p,type:variant?'card':'line',onDrag:variant===2?()=>{}:undefined,items:[{key:'a',label:text,children:text},{key:'b',label:'다음',children:'다음'}]});
        case 'Tree':return e(c.Tree,{...p,checkable:!!variant,treeData:[{key:'a',title:text},{key:'b',title:'다음'}]});
        case 'Upload':return e(c.Upload,{...p,listType:variant===1?'picture':'text',draggable:variant===2,defaultFileList:[{uid:'a',name:text}]},e(c.Button,null,'파일 선택'));
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
          a.source.Message.destroy();a.source.Notification.destroy();a.built.message.destroy();a.built.notification.destroy();
          a.root.render(a.e('section',{key:kind+${JSON.stringify(name + variant)}},a.make(a[kind],${JSON.stringify(name)},${JSON.stringify(text)},${variant})));
          const apiName=${JSON.stringify(name)};
          if(apiName==='Message'||apiName==='Notification'){
            const api=a[kind][apiName]??a[kind][apiName.toLowerCase()];
            api.open({className:'audit-root',key:'audit',content:${JSON.stringify(text)},description:${JSON.stringify(text)},duration:0});
          }
          await new Promise(r=>setTimeout(r,420));
          await document.fonts.ready;
          await new Promise(requestAnimationFrame);
          const root=a.app.querySelector('.audit-root')??document.querySelector('.audit-root');
          if(!root)throw Error(kind+' '+apiName+' missing rendered root');
          if(!root.classList.contains('audit-root'))errors.push(kind+' missing root className');
          if(a.app.scrollWidth>a.app.clientWidth+2)errors.push(kind+' overflow '+a.app.scrollWidth);
          if([root,...root.querySelectorAll('*')].some(el=>[...el.attributes].some(at=>at.name.startsWith('aria-'))))errors.push(kind+' ARIA attribute');

          captures.push([root,...root.querySelectorAll('*')].map(el=>{
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
