// Requires Storybook on :6006 and pnpm build. Exercise changing content in open popups.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const reportOnly = process.argv.includes("--report-only");
const session = `dynamic-popup-${process.pid}`;
const browser = (...args) =>
  execFileSync("agent-browser", ["--session", session, ...args], {
    encoding: "utf8",
    timeout: 30000,
  }).trim();
const evaluate = (code) => JSON.parse(browser("eval", code));
const cases = [
  ["Popover", "[data-popover]", 9],
  ["Tooltip", "[data-tooltip]", 9],
  ["Dropdown", "[data-dropdown]", 9],
  ["Select", "[data-select-popup]", 2],
  ["DatePicker", "[data-datepicker-popup]", 2],
  ["RangePicker", "[data-datepicker-range-popup]", 2],
  ["TimePicker", "[data-timepicker-popup]", 2],
  ["ColorPicker", "[data-colorpicker-popup]", 2],
  ["Tooltip", "[data-tooltip]", 9, "bottomLeft"],
  ["Popover", "[data-popover]", 9, "bottomLeft"],
  ["Dropdown", "[data-dropdown]", 9, "bottomLeft"],
  ["Menu", "[data-menu-popup]", 4],
  ["DropdownSubmenu", "[data-dropdown-submenu]", 8],
];
try {
  browser("open", "http://localhost:6006/iframe.html?id=components-table--basic&viewMode=story");
  browser(
    "wait",
    "--fn",
    "!!document.querySelector('#storybook-root table') && document.body.classList.contains('sb-show-main')",
  );
  browser("snapshot", "-i");
  browser("set", "viewport", "1280", "800");
  evaluate(`(async()=>{
    const text=await(await fetch('/src/components/Popover/Popover.tsx')).text();
    const url=text.match(/from "([^"]*\\/react.js[^"]*)"/)[1];
    const React=(await import(url)).default;
    const {createRoot}=(await import(url.replace(/react.js.*$/,'react-dom_client.js'))).default;
    const source=await import('/src/index.ts');
    const built=await import('/dist/index.mjs?audit='+Date.now());
    document.querySelector('#storybook-root').style.display='none';
    document.documentElement.style.cssText='margin:0;overflow:hidden;scrollbar-gutter:auto';
    document.body.style.cssText='margin:0;overflow:hidden;scrollbar-gutter:auto';
    const host=document.createElement('div');document.body.append(host);
    const production=document.createElement('link');production.rel='stylesheet';production.href='/dist/style.css';
    await new Promise((ok,bad)=>{production.onload=ok;production.onerror=bad;document.head.append(production)});
    production.sheet.disabled=true;
    window.popupAudit={React,e:React.createElement,root:createRoot(host),source,built,production};
    return true;
  })()`);
  let checked = 0;
  for (const kind of reportOnly ? ["source"] : ["source", "built"])
    for (const [name, selector, gap, placement = "topLeft"] of cases) {
      const id = `${kind}/${name}/${placement}`;
      evaluate(`(async()=>{
        const a=window.popupAudit,{e,React}=a,c=a[${JSON.stringify(kind)}];
        [...document.styleSheets].filter(s=>s!==a.production.sheet).forEach(s=>s.disabled=${kind === "built"});
        a.production.sheet.disabled=${kind !== "built"};
        function ResizingContent(){const [large,setLarge]=React.useState(true);a.change=setLarge;return e('div',{style:{height:large?300:80,width:150}},'Dynamic content');}
        function Fixture(){
          const [large,setLarge]=React.useState(true);a.change=setLarge;
          const base={defaultOpen:true,placement:${JSON.stringify(placement)}};
          const target=e('button',{type:'button'},'Target');
          let popup;
          switch(${JSON.stringify(name)}){
            case 'Popover': popup=e(c.Popover,{...base,content:e(ResizingContent)},target);break;
            case 'Tooltip': popup=e(c.Tooltip,{...base,title:e(ResizingContent)},target);break;
            case 'Dropdown': popup=e(c.Dropdown,{...base,menu:{items:Array.from({length:large?8:2},(_,i)=>({value:i,label:'Item '+i}))}},target);break;
            case 'Select': {
              const options=Array.from({length:4},(_,i)=>({label:'Item '+i,value:i}));
              popup=e(c.Select,{...base,showSearch:true,listHeight:400,options:large?options.map(o=>({label:'Group '+o.value,options:[o]})):[{label:'Group',options}]});break;
            }
            case 'DatePicker':popup=e(c.DatePicker,{...base,picker:large?'date':'month'});break;
            case 'RangePicker':popup=e(c.DatePicker.RangePicker,{...base,picker:large?'date':'month'});break;
            case 'TimePicker':popup=e(c.TimePicker,{...base,showNow:large});break;
            case 'ColorPicker':popup=e(c.ColorPicker,{...base,presets:large?[{label:'Presets',colors:['#ff0000','#00ff00','#0000ff']}]:[]});break;
            case 'Menu':popup=e(c.Menu,{defaultOpenKeys:['parent'],items:[{key:'parent',label:'Parent',children:[{key:'child',label:e('span',{style:{display:'inline-block',width:large?400:100}},'Child')}]}]});break;
            case 'DropdownSubmenu':popup=e(c.Dropdown,{...base,placement:'bottomLeft',menu:{items:[{value:'parent',label:'Parent',children:[{value:'child',label:large?'Long label '.repeat(10):'Child'}]}]}},target);break;
          }
          return e('section',{'data-popup-audit-host':'',style:{position:'fixed',top:${name === "Menu" || name === "DropdownSubmenu" ? 150 : 550},left:${name === "DropdownSubmenu" ? 900 : name === "Menu" ? 700 : 300},width:600}},popup);
        }
        a.root.render(e(Fixture,{key:${JSON.stringify(id)}}));
        await new Promise(r=>setTimeout(r,450));
        if(${JSON.stringify(name)}==='DropdownSubmenu'){
          document.querySelector('[data-dropdown-submenu]').style.width='400px';
          [...document.querySelectorAll('[data-dropdown] button')].find(b=>b.textContent==='Parent').click();
          await new Promise(r=>setTimeout(r,350));
        }
        a.popup=document.querySelector(${JSON.stringify(selector)});
        if(!a.popup)throw new Error('Missing popup: '+${JSON.stringify(id)});
        const host=document.querySelector('[data-popup-audit-host]');
        a.anchor=host.querySelector('[data-wizard-floating-trigger]')||host.firstElementChild;
        if(${JSON.stringify(name)}==='Menu')a.anchor=host.querySelector('li');
        if(${JSON.stringify(name)}==='DropdownSubmenu')a.anchor=a.popup.parentElement;
        if(${JSON.stringify(name)}==='DropdownSubmenu'){
          const change=a.change;
          a.change=large=>{a.popup.style.width=large?'400px':'150px';change(large);};
        }
        return true;
      })()`);
      browser("snapshot", "-i");
      for (const large of [false, true, false, true]) {
        const result = evaluate(`(async()=>{
          const a=window.popupAudit,frames=[];
          const sample=()=>{
            const p=a.popup,r=p.getBoundingClientRect(),anchor=a.anchor.getBoundingClientRect();
            frames.push({gap:${name === "Menu" || name === "DropdownSubmenu" ? "anchor.left-r.right" : "anchor.top-r.bottom"},height:r.height,same:p===document.querySelector(${JSON.stringify(selector)})});
          };
          // ResizeObserver runs after layout and before paint. Observe after the
          // component's observer to catch coordinates still awaiting a React commit.
          const observer=new ResizeObserver(sample);observer.observe(a.popup);
          a.change(${large});
          for(let i=0;i<10;i++){
            await new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)));
          }
          sample();
          observer.disconnect();
          return frames;
        })()`);
        const bad = result.filter((f) => !f.same || Math.abs(f.gap - gap) > 1);
        if (reportOnly) console.log(JSON.stringify({ id, large, bad, stable: result.at(-1) }));
        else assert.deepEqual(bad, [], `${id}/${large}: content changed before position`);
        checked++;
      }
      if (!reportOnly) console.log(`PASS ${id}: shrink/grow without stale coordinates`);
    }
  if (!reportOnly) assert.equal(browser("errors"), "", "Browser runtime errors");
  console.log(`${checked} dynamic content cases checked.`);
} finally {
  browser("close");
}
