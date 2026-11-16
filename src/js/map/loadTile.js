import { VectorTile } from "../pbf/vectortile";
import load from "../util/load";
import style from "./style";
import $ from "../util/tiny";
import { pinPath, pinOtherPath } from "../util/constants";

export default async (zxy) => {
  return load("/t/" + zxy.join("/"), (d) => {
    const layers = new VectorTile(d).layers;
    const figs = [];
    const key = zxy.join("");
    const addrs = $(`<div id="addrs${key}" class="addrs">`);
    const symbs = $(`<div id="symbs${key}" class="symbs">`);
    const roadSigns = {};
    for (let i = style.length; i--;) {
      const prop = style[i];
      const layerName = prop.Layer;
      const layer = layers[layerName];
      if (!layer) continue;
      const path = new Path2D();
      for (let j = 0; j < layer.length; j++) {
        const feature = layer.feature(j);
        const geometry = feature.loadGeometry();
        const name = feature.properties["n"];
        const pointCoord = geometry.lines[0][0];
        const [x, y] = pointCoord;
        if (prop.Type == "p") {
          if (layerName == "rt") {
            if (roadSigns[name]) {
              roadSigns[name].push(pointCoord);
            } else {
              roadSigns[name] = [pointCoord];
            }
          } else {
            const dom = $(
              `<span class="addr ${prop.Layer}">${name}</span>`,
            ).css({
              "left": x + "px",
              "top": y + "px",
            });
            addrs.Append(dom);
          }
        } else if (prop.Type == "s") {
          const cat = geometry.properties["c"];
          let desc = geometry.properties["t"];
          if (cat == "bs" && desc) {
            desc = desc.replace("S", "西肥バス").replace("W", "昭和バス");
          }
          if (cat == "hp" && desc) {
            desc = desc.replace(/\s/g, "科 ");
          }
          const pathd = pinPath[cat] || pinOtherPath;
          const dom = $(
            `<button class="symb"><svg viewBox="0 0 24 24"><path d="${pathd}"/></svg></button>`,
          )
            .css({
              "left": x + "px",
              "top": y + "px",
            })
            .on("click", (e) => {
              const content =
                "<h3>" + name + "</h3>" + (desc ? "<p>" + desc + "</p>" : "");
              $("#iw").html(content);
              $("#iw")[0].showPopover({ source: e.target });
            });
          symbs.Append(dom);
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
      addrs,
      roadSigns,
      symbs,
      figs,
    };
  });
};
