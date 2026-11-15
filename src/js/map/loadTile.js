import { VectorTile } from "../pbf/vectortile";
import load from "../util/load";
import style from "./style";
import $ from "../util/tiny";
import { pin, pinOther } from "../util/constants";

export default async (zxy) => {
  return load("/t/" + zxy.join("/"), (d) => {
    const layers = new VectorTile(d).layers;
    const figs = [];
    const signs = $(`<div id="signs${zxy.join("_")}" class="signs">`);
    const symbs = $(`<div id="symbs${zxy.join("_")}" class="symbs">`);

    // const sign = $(`<span class="sign">テストポイント</span>`).css({
    //   "left": "0px",
    //   "top": "0px",
    // });
    // div.Append(sign);

    for (let i = style.length; i--;) {
      const f = [];
      const prop = style[i];
      const name = prop.Layer;
      const layer = layers[name];
      if (!layer) continue;
      // if (name != "w") continue;
      const path = new Path2D();
      for (let j = 0; j < layer.length; j++) {
        const feature = layer.feature(j);
        const geometry = feature.loadGeometry();
        if (prop.Type == "p") {
          const dom = $(
            `<span class="sign ${prop.Layer}">${feature.properties["n"]}</span>`,
          ).css({
            "left": geometry.lines[0][0][0] + "px",
            "top": geometry.lines[0][0][1] + "px",
          });
          signs.Append(dom);
        } else if (prop.Type == "s") {
          const cat = geometry.properties["c"];
          let desc = geometry.properties["t"];
          if (cat == "bs" && desc) {
            desc = desc.replace("S", "西肥バス").replace("W", "昭和バス");
          }
          const pathd = pin[cat] || pinOther;
          const dom = $(
            `<span class="symb"><svg viewBox="0 0 24 24"><path d="${pathd}"/></svg></span>`,
            // `<span class="symb"><img src="/logo96.png" width="24" height="24"></span>`,
          )
            .css({
              "left": geometry.lines[0][0][0] + "px",
              "top": geometry.lines[0][0][1] + "px",
            })
            .on("click", (e) => {
              console.log("txt", feature.properties["n"], desc);
            });
          symbs.Append(dom);
          //   .on("click", (e) => {
          //   var txt =
          //     "<h3>" + t.txt + "</h3>" + (t.desc ? "<p>" + t.desc + "</p>" : "");
          //   infowin($(e.target), txt);
          // });
        } else {
          for (let i = 0; i < geometry.lines.length; i++) {
            const ring = geometry.lines[i];
            if (ring.length == 0) continue;
            path.moveTo(ring[0][0], ring[0][1]);
            for (let j = 1; j < ring.length; j++) {
              path.lineTo(ring[j][0], ring[j][1]);
            }
          }
          if (prop.Type == "f") {
            path.closePath();
          }
        }
      }
      if (!/sp/.test(prop.Type)) {
        figs.push({
          path,
          prop,
        });
      }
    }
    return {
      signs,
      symbs,
      figs,
    };
  });
};
