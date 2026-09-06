// Requires Storybook on :6006 and agent-browser. This mounts real source components,
// then checks layout in Chromium (jsdom does not measure CSS overflow).
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const session = `long-text-${process.pid}`;
const browser = (...args) =>
  execFileSync("agent-browser", ["--session", session, ...args], {
    encoding: "utf8",
    timeout: 20000,
  }).trim();
const evaluate = (code) => JSON.parse(browser("eval", code));
const failures = [];
let checked = 0;
try {
  browser("open", "http://localhost:6006/iframe.html?id=components-select--search&viewMode=story");
  browser("snapshot", "-i");
  const names = evaluate(`(async () => {
    const source = await (await fetch('/src/components/Tabs/Tabs.tsx')).text();
    const reactUrl = source.match(/from "([^"]*\\/react.js[^"]*)"/)[1];
    const React = (await import(reactUrl)).default;
    const { createRoot } = (await import(reactUrl.replace(/react.js.*$/, 'react-dom_client.js'))).default;
    const names = ['Select','Dropdown','Segmented','Tabs','Menu','ColorPicker','DatePicker','Upload','Modal','Drawer','Table'];
    const modules = await Promise.all(names.map(n => import('/src/components/'+n+'/'+n+'.tsx')));
    const c = Object.fromEntries(names.map((n,i) => [n,modules[i][n]]));
    const e = React.createElement;
    const host = document.createElement('div');
    host.style = 'position:absolute;inset:0;background:white;z-index:900;padding:16px;min-height:100vh';
    document.body.append(host);
    const root = createRoot(host);
    const table = props => e(c.Table, { columns:[{title:'Name',dataIndex:'name'}],dataSource:[],pagination:false,...props });
    const dropdown = items => e(c.Dropdown, {open:true,menu:{items}}, e('button',null,'Open'));
    const cases = [
      ['Select.option',t=>e(c.Select,{open:true,value:'a',options:[{label:t,value:'a'}]}),'[data-select-popup]'],
      ['Select.group',t=>e(c.Select,{open:true,options:[{label:t,options:[{label:'Option',value:'a'}]}]}),'[data-select-popup]'],
      ['Select.empty',t=>e(c.Select,{open:true,options:[],notFoundContent:t}),'[data-select-popup]'],
      ['Select.placeholder',t=>e(c.Select,{mode:'multiple',options:[],placeholder:t})],
      ['Dropdown.option',t=>dropdown([{label:t,value:'a'}]),'[data-dropdown]'],
      ['Dropdown.group',t=>dropdown([{label:t,value:'g',type:'group',children:[{label:'Option',value:'a'}]}]),'[data-dropdown]'],
      ['Dropdown.extra',t=>dropdown([{label:'Option',value:'a',extra:t}]),'[data-dropdown]'],
      ['Dropdown.submenu',t=>dropdown([{label:'Submenu',value:'g',children:[{label:t,value:'a'}]}]),'[data-dropdown-submenu]','submenu'],
      ['Segmented.default',t=>e(c.Segmented,{options:[{value:'a',label:t},{value:'b',label:'주간'},{value:'c',label:'월간'}]})],
      ['Segmented.tooltip',t=>e(c.Segmented,{options:[{value:'a',label:t,tooltip:'Tip'},{value:'b',label:'주간'}]})],
      ['Segmented.full',t=>e(c.Segmented,{fullWidth:true,options:[{value:'a',label:t},{value:'b',label:'주간'}]})],
      ['Tabs.indicator',t=>e(c.Tabs,{items:[{key:'a',label:t,children:'Body'}]})],
      ['Menu.group',t=>e(c.Menu,{items:[{key:'g',type:'group',label:t,children:[{key:'a',label:'Option'}]}]})],
      ['Menu.extra',t=>e(c.Menu,{items:[{key:'a',label:'Option',extra:t}]})],
      ['Menu.popup',t=>e(c.Menu,{defaultOpenKeys:['g'],items:[{key:'g',label:'Open',children:[{key:'a',label:t}]}]}),'[data-menu-popup]'],
      ['ColorPicker.preset',t=>e(c.ColorPicker,{open:true,presets:[{label:t,colors:['#123456']}]}),'[data-colorpicker-popup]'],
      ['DatePicker.placeholder',t=>e(c.DatePicker,{placeholder:t})],
      ['Upload.Dragger',t=>e(c.Upload.Dragger,null,t)],
      ['Modal.footer',t=>e(c.Modal,{open:true,width:320,footer:()=>t},'Body'),'[data-modal-panel]'],
      ['Modal.buttons',t=>e(c.Modal,{open:true,width:320,confirmText:t,cancelText:t},'Body'),'[data-modal-panel]'],
      ['Drawer.footer',t=>e(c.Drawer,{open:true,size:320,footer:t},'Body'),'[data-drawer-panel]'],
      ['Drawer.extra',t=>e(c.Drawer,{open:true,size:320,title:'Title',extra:t},'Body'),'[data-drawer-panel]'],
      ['Table.cells',t=>table({columns:[{title:t,dataIndex:'name',width:160},{title:'Other',dataIndex:'other',width:160}],dataSource:[{id:'a',name:t,other:'Other'}]})],
      ['Table.empty',t=>table({locale:{emptyText:t}})],
      ['Table.loading',t=>table({loading:{spinning:true,text:t}})],
      ['Table.filter.group',t=>table({columns:[{title:'Name',dataIndex:'name',filters:[{label:t,value:'g',children:[{label:'Option',value:'a'}]}]}]}),'[data-table-filter-motion]','filter'],
      ['Table.filter.empty',t=>table({columns:[{title:'Name',dataIndex:'name',filterSearch:true,filters:[{label:'Option',value:'a'}]}],locale:{filterEmptyText:t}}),'[data-table-filter-motion]','search'],
      ['Table.filter.reset',t=>table({columns:[{title:'Name',dataIndex:'name',filters:[{label:'Option',value:'a'}]}],locale:{filterReset:t}}),'[data-table-filter-motion]','filter'],
      ['Table.filter.confirm',t=>table({columns:[{title:'Name',dataIndex:'name',filters:[{label:'Option',value:'a'}]}],locale:{filterConfirm:t}}),'[data-table-filter-motion]','filter'],
      ['Table.filter.actions',t=>table({columns:[{title:'Name',dataIndex:'name',filters:[{label:'Option',value:'a'}]}],locale:{filterReset:t,filterConfirm:t}}),'[data-table-filter-motion]','filter'],
      ['Table.total',t=>table({dataSource:[{id:'a',name:'Name'}],pagination:{showTotal:()=>t}})],
    ];
    window.longTextAudit = { root,e,cases };
    return cases.map(x=>x[0]);
  })()`).filter((name) => !process.argv[2] || name.startsWith(process.argv[2]));

  for (const viewport of [390, 1280]) {
    browser("set", "viewport", String(viewport), "900");
    for (const [language, text] of [
      ["short", "보통 이름"],
      ["numbers", "1234567890".repeat(12)],
      ["english", "adfafsdafdsfdsfsdfsdfsfsfsdfsdf".repeat(4)],
      ["korean", "안녕하세요".repeat(24)],
    ]) {
      for (const name of names) {
        const result = evaluate(`(async()=>{
          const {root,e,cases} = window.longTextAudit;
          const [id,make,selector,action] = cases.find(x=>x[0]===${JSON.stringify(name)});
          root.render(e('section',{key:id+${JSON.stringify(language)},id:'long-text-case',style:{width:320,paddingTop:24}},make(${JSON.stringify(text)})));
          await new Promise(r=>setTimeout(r,420));
          if(action){
            const button = action==='submenu' ? Array.from(document.querySelectorAll('[data-dropdown] button')).find(x=>x.textContent==='Submenu') : document.querySelector('[data-table-filter]');
            button.click(); await new Promise(r=>setTimeout(r,280));
            if(action==='search'){
              const input = document.querySelector('[data-table-filter-motion] input');
              Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'zzzzz');
              input.dispatchEvent(new Event('input',{bubbles:true}));
              await new Promise(r=>setTimeout(r,280));
            }
          }
          const el = document.querySelector(selector || '#long-text-case');
          if(!el) return {error:'missing root'};
          const rect = el.getBoundingClientRect();
          const errors = [];
          if(rect.left < -1 || rect.right > document.documentElement.clientWidth+1) errors.push('outside viewport');
          if(el.scrollWidth > el.clientWidth+2) errors.push('root overflow '+el.scrollWidth+'/'+el.clientWidth);
          // Single-line option rows must fit; a clipped parent must not conceal the check/icon.
          if(id.startsWith('Select.') || id.startsWith('Dropdown.') || id.startsWith('Menu.') || id==='Modal.buttons' || id.startsWith('Segmented.')) {
            for(const x of el.querySelectorAll('button,label')) {
              if(getComputedStyle(x).visibility==='hidden') continue;
              const b=x.getBoundingClientRect();
              if(b.width && (b.left<rect.left-1 || b.right>rect.right+1)) errors.push('control outside root');
            }
          }
          if(id==='Table.cells') for(const x of el.querySelectorAll('td,th')) if(x.scrollWidth>x.clientWidth+2) errors.push('cell overflow');
          if(['Table.filter.reset','Table.filter.confirm','Table.filter.actions'].includes(id)) {
            const [reset,confirm]=el.querySelectorAll('button');
            const a=reset.getBoundingClientRect(),b=confirm.getBoundingClientRect();
            if(a.right>b.left-7 || a.left<rect.left || b.right>rect.right-7) errors.push('filter actions overlap or overflow');
            const shortButton=id==='Table.filter.reset'?confirm:id==='Table.filter.confirm'?reset:null;
            const label=shortButton?.querySelector('span');
            if(label && label.scrollWidth>label.clientWidth+1) errors.push('short action clipped');
          }
          if(id.startsWith('Segmented.')) for(const x of el.querySelectorAll('[data-segmented-label]')) if(['주간','월간'].includes(x.textContent) && x.scrollWidth>x.clientWidth+1) errors.push('short choice clipped');
          // Wrapping text must be readable, not merely hidden by an ancestor overflow rule.
          for(const x of el.querySelectorAll('span.whitespace-pre-line')) {
            const range=document.createRange();range.selectNodeContents(x);
            for(const r of range.getClientRects()) if(r.width && (r.left<rect.left-1 || r.right>rect.right+1)) errors.push('text outside root');
          }
          if(id==='Table.total') {
            const total=el.querySelector('nav>span');const b=total.getBoundingClientRect();
            if(b.left<rect.left-1 || b.right>rect.right+1) errors.push('total outside root');
          }
          if(id==='Tabs.indicator') {
            const indicator=el.querySelector('[data-tabs-indicator]');const b=indicator.getBoundingClientRect();
            if(b.left<rect.left-1 || b.right>rect.right+1) errors.push('indicator outside root');
          }
          return {errors:[...new Set(errors)],width:Math.round(rect.width),right:rect.right,viewport:document.documentElement.clientWidth};
        })()`);
        checked++;
        if (result.error || result.errors.length) {
          failures.push({ viewport, language, name, ...result });
          console.log("FAIL", failures.at(-1));
        }
      }
      console.log(`Checked ${viewport}px / ${language}`);
    }
  }
  console.log(`${checked} layout cases checked; ${failures.length} failures`);
  assert.equal(failures.length, 0, JSON.stringify(failures, null, 2));
} finally {
  browser("close");
}
