import context from "../util/context";
import { scale, transformMatrix, requiredTiles } from "./calc";
import loadTile from "./loadTile";
import { delay, nextFrame } from "../util/delay";
import $ from "../util/tiny";

var ctx;

const init = (canvas) => {
  ctx = canvas.getContext("2d", { alpha: false });
};

let timerID = 0;
const t = document.getElementById("time");
const draw = async () => {
  if (timerID) return;
  delay(() => {
    timerID = 0;
  }, 17);

  const cx = context.centerX;
  const cy = context.centerY;
  const z = context.zoom;
  const w = context.mapWidth * 2;
  const h = context.mapHeight * 2;
  if (!(cx && cy && z && w && h)) return;

  timerID = 1;

  ctx.fillStyle = "#f5f0ea";
  ctx.fillRect(0, 0, w, h);
  const tiles = requiredTiles(cx, cy, z, w, h);
  const keys = tiles.map((t) => "sign" + t.join("_"));
  const nearests = {};
  $("#tP")[0].childNodes.forEach((n) => {
    if (!keys.includes(n.id)) {
      $(n).Remove();
    }
  });
  tiles.forEach(async (zxy) => {
    let { figs, div, symbs } = await loadTile(zxy);
    const start = performance.now();
    const mat = transformMatrix(zxy);
    paint(figs, mat);
    const id = "#sign" + zxy.join("_");
    if (!$(id).length) {
      $("#tP").Append(div);
    } else {
      div = $(id);
    }
    const cssmat = transformMatrix(zxy, 1);
    div.css({
      "transform": `matrix(${cssmat.join(",")})`,
    });
    $(id + " .sign").css({ "transform": `scale(${1 / cssmat[0]})` });
    // 子供だましだけど重い処理を非同期化
    delay(() => {
      $("#tP .rt").each((s) => {
        const name = s.innerText;
        const rect = $(s).boundRect();
        const dx = rect.x - context.mapWidth / 2;
        const dy = rect.y - context.mapHeight / 2;
        const dist = dx * dx + dy * dy;
        if (nearests[name]) {
          console.log("dist", dist, nearests[name][0]);

          if (dist > nearests[name][0]) {
            $(s).css({ opacity: 0 });
            return;
          } else {
            $(nearests[name][1]).css({ opacity: 0 });
          }
        }
        $(s).css({ opacity: 1 });
        nearests[name] = [
          dist,
          s,
          rect.x,
          rect.y,
          context.mapWidth / 2,
          context.mapHeight / 2,
        ];
      });
      console.log(nearests);
    });

    const end = performance.now();
    t.innerText = "地図描画時間：" + ((end - start) * 1e3).toFixed(3) + "μs";
  });
};

const paint = (layers, mat) => {
  ctx.save();
  ctx.setTransform(...mat);

  //マスク
  ctx.beginPath();
  ctx.rect(0, 0, 4096, 4096);
  ctx.strokeStyle = "#f00";
  ctx.lineWidth = 10 / mat[0];
  ctx.stroke();
  ctx.clip();

  for (const layer of layers) {
    const prop = layer.prop;
    const isFill = prop.Type == "f";
    const isBorder = prop.Border;
    const dash = prop.Dash || [];
    const lineWidth = clamp(prop.Width, context.zoom);
    const opacity = prop.OPacity ? clamp(prop.OPacity, context.zoom) : 1;
    // if (prop.Layer == "t") {
    //   console.log("opacity:", opacity);
    // }
    const color = `rgba(${prop.Color} ,${opacity})`;

    ctx.beginPath();
    if (isBorder) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#aaa";
      ctx.lineWidth = 1 / mat[0];
      ctx.stroke(layer.path);
    }
    if (isFill) {
      ctx.fillStyle = color;
      ctx.fill(layer.path);
    } else {
      ctx.setLineDash(dash);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth / mat[0];
      ctx.stroke(layer.path);
      if (prop.Layer == "t") {
        ctx.setLineDash([20, 10]);
        ctx.lineCap = "butt";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = lineWidth / mat[0] / 2;
        ctx.stroke(layer.path);
      }
      ctx.setLineDash([]);
    }
  }
  ctx.restore();
};

const clamp = (ary, x, b) => {
  b = b || 0;
  if (!Array.isArray(ary)) {
    return ary;
  }
  let z;
  for (let i = 0; i < ary.length; i++) {
    if (x <= ary[i][0]) {
      if (i == 0) {
        return ary[i][1] + b;
      }
      return (
        ary[i - 1][1] +
        ((ary[i][1] - ary[i - 1][1]) * (x - ary[i - 1][0])) /
          (ary[i][0] - ary[i - 1][0]) +
        b
      );
    }
    if (x >= ary[i][0]) {
      z = ary[i][1] + b;
    }
  }
  return z;
};

export { init, draw };
