import context from "../util/context";
import { scale, transformMatrix } from "./calc";
import loadTile from "./loadTile";

var ctx;

const init = (canvas) => {
  ctx = canvas.getContext("2d", { alpha: false });
};

const t = document.getElementById("time");

const draw = async () => {
  ctx.fillStyle = "#f5f0ea";
  ctx.fillRect(0, 0, context.mapWidth * 2, context.mapHeight * 2);
  const zxy = [15, 28191, 13180];
  var { figs, signs, symbs } = await loadTile(zxy);
  requestAnimationFrame(() => {
    const start = performance.now();
    paint(figs, zxy);
    const end = performance.now();
    t.innerText = "地図描画時間：" + ((end - start) * 1e3).toFixed(3) + "μs";
  });
};

const paint = (layers, zxy) => {
  ctx.save();
  const mat = transformMatrix(zxy);
  ctx.setTransform(...mat);
  for (const layer of layers) {
    var prop = layer.prop;
    var color = `rgba(${prop.Color} ,1)`;
    var isFill = prop.Type == "f";
    var isBorder = prop.Border;
    var lineWidth = clamp(prop.Width, context.zoom);
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
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000"; // color;
      ctx.lineWidth = lineWidth / mat[0];
      ctx.stroke(layer.path);
    }
  }
  ctx.restore();
};

const clamp = (ary, x, b) => {
  b = b || 0;
  if (!Array.isArray(ary)) {
    return ary;
  }
  var z;
  for (var i = 0; i < ary.length; i++) {
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
