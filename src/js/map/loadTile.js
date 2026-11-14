import { VectorTile } from "../pbf/vectortile";
import load from "../util/load";
import style from "./style";
import $ from "../util/tiny";

export default async (zxy) => {
  return load("/t/" + zxy.join("/"), (d) => {
    const layers = new VectorTile(d).layers;
    const figs = [];
    const signs = [];
    const symbs = [];
    const div = $(`<div id="sign${zxy.join("_")}" class="signs">`);

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
        if (/p|s/.test(prop.Type)) {
          // const cat = geometry.properties["c"];
          // let desc = geometry.properties["t"];
          // if (cat == "bs" && desc) {
          //   desc = desc.replace("S", "西肥バス").replace("W", "昭和バス");
          // }
          if (prop.Type == "p") {
            const sign = $(
              `<span class="sign ${prop.Layer}">${feature.properties["n"]}</span>`,
            ).css({
              "left": geometry.lines[0][0][0] + "px",
              "top": geometry.lines[0][0][1] + "px",
            });
            div.Append(sign);
          }
          // f.push({
          //   coord: geometry.lines[0][0],
          //   txt: feature.properties["n"],
          //   desc,
          //   cat,
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
      if (prop.Type == "p") {
        // signs.push(f);
      } else if (prop.Type == "s") {
        // symbs.push(f);
      } else {
        figs.push({
          path,
          prop,
        });
      }
    }
    return {
      div,
      symbs,
      figs,
    };
  });
};
