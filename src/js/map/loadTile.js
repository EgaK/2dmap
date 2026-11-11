import { VectorTile } from "../pbf/vectortile";
import Pbf from "../pbf/pbf";
import style from "./style";

const cache = {};

export default async (zxy) => {
  const id = "t" + zxy.join("|");
  if (cache[id]) {
    return cache[id];
  }
  var d = await fetch("/t/" + zxy.join("/"));
  d = new Pbf(await d.arrayBuffer());
  var layers = new VectorTile(d).layers;
  var figs = [];
  var signs = [];
  var symbs = [];
  for (var i = style.length; i--;) {
    const f = [];
    const prop = style[i];
    const name = prop.Layer;
    const layer = layers[name];
    if (!layer) continue;
    // if (name != "w") continue;
    for (var j = 0; j < layer.length; j++) {
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
        // console.log(geometry.lines);
        f.push(geometry.lines);
      }
    }
    if (prop.Type == "p") {
      signs.push(f);
    } else if (prop.Type == "s") {
      symbs.push(f);
    } else {
      figs.push({
        rings: f[0],
        prop,
      });
    }
  }
  cache[id] = {
    signs,
    symbs,
    figs,
  };
  return cache[id];
};
