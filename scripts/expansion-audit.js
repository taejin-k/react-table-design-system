// Browser fixture: evaluate in a local Storybook iframe with agent-browser.
(async () => {
  const source = await (await fetch("/src/components/Collapse/Collapse.tsx")).text();
  const reactUrl = source.match(/from "([^"]*\/react.js[^"]*)"/)[1];
  const React = (await import(reactUrl)).default;
  const clientUrl = reactUrl.replace(/react.js.*$/, "react-dom_client.js");
  const client = await import(clientUrl);
  const { createRoot } = client.default ?? client;
  const { Collapse } = await import("/src/components/Collapse/Collapse.tsx");
  const { Tree } = await import("/src/components/Tree/Tree.tsx");
  const { Menu } = await import("/src/components/Menu/Menu.tsx");
  const { Upload } = await import("/src/components/Upload/Upload.tsx");
  const { ColorPicker } = await import("/src/components/ColorPicker/ColorPicker.tsx");
  const h = React.createElement;
  const host = document.createElement("div");
  host.id = "audit-fixture";
  host.style = "position:fixed;inset:0;background:white;z-index:9999;overflow:auto;padding:20px";
  document.body.append(host);
  const root = createRoot(host);
  window.renderFixture = (kind, open) => {
    const input = () => h("input", { "data-audit-input": "", defaultValue: "last" });
    let element;
    if (kind === "Collapse") {
      element = h(Collapse, {
        activeKey: open ? ["a"] : [],
        items: [
          {
            key: "a",
            label: "Toggle",
            children: h("div", null, h("div", { style: { height: 180 } }, "First"), input()),
          },
        ],
      });
    } else if (kind === "Tree") {
      element = h(Tree, {
        expandedKeys: open ? ["a"] : [],
        treeData: [
          {
            key: "a",
            title: "Tree",
            children: Array.from({ length: 8 }, (_, i) => ({
              key: "c" + i,
              title: i === 7 ? input() : "Child " + i,
            })),
          },
        ],
      });
    } else if (kind === "Menu") {
      element = h(Menu, {
        mode: "inline",
        openKeys: open ? ["a"] : [],
        items: [
          {
            key: "a",
            label: "Menu",
            children: Array.from({ length: 8 }, (_, i) => ({ key: "c" + i, label: "Child " + i })),
          },
        ],
      });
    } else if (kind === "Upload") {
      element = h(Upload, { fileList: open ? [{ uid: "f", name: "file.txt" }] : [] });
    } else if (kind === "ColorPicker") {
      element = h(
        "div",
        { style: { paddingTop: 280 } },
        h(ColorPicker, {
          open: true,
          presets: open
            ? Array.from({ length: 4 }, (_, i) => ({
                label: "Preset " + i,
                colors: ["#123456", "#654321"],
              }))
            : [],
        }),
      );
    }
    root.render(element);
  };
  window.auditExpansion = (kind) => {
    window.expansionSamples = [];
    window.renderFixture(kind, true);
    setTimeout(() => {
      const container =
        host.querySelector('[style*="grid-template-rows"]')?.firstElementChild ??
        host.querySelector("[data-upload-motion-file]");
      const control =
        host.querySelector("input[data-audit-input]") ??
        (kind === "Menu"
          ? [...host.querySelectorAll("button")].at(-1)
          : container.querySelector("[tabindex],button"));
      control.focus();
      const end = performance.now() + 450;
      const sample = () => {
        window.expansionSamples.push({
          scroll: container.scrollTop,
          height: container.getBoundingClientRect().height,
        });
        if (performance.now() < end || window.expansionSamples.length < 15)
          requestAnimationFrame(sample);
      };
      sample();
    }, 30);
    return true;
  };
  window.renderFixture("Collapse", false);
  return true;
})();
