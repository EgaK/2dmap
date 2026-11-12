import { VectorTile } from "../pbf/vectortile";
import load from "../util/load";
import style from "./style";

export default async (zxy) => {
  return load("/t/" + zxy.join("/"), (d) => {
    const layers = new VectorTile(d).layers;
    const figs = [];
    const signs = [];
    const symbs = [];
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
          const cat = geometry.properties["c"];
          let desc = geometry.properties["t"];
          if (cat == "bs" && desc) {
            desc = desc.replace("S", "西肥バス").replace("W", "昭和バス");
          }
          f.push({
            "p": geometry.lines[0][0],
            "t": feature.properties["n"],
            "d": desc,
            "c": cat,
          });
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
        signs.push(f);
      } else if (prop.Type == "s") {
        symbs.push(f);
      } else {
        figs.push({
          path: path,
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
