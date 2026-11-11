import context from "../util/context";
import { scale, transformMatrix } from "./calc";
import loadTile from "./loadTile";

var ctx;
const viewArray = context.viewArray;

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
    ctx.beginPath();
    drawLine(layer.rings, prop.Layer);

    if (isBorder) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#aaa";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    if (isFill) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#000"; // color;
      ctx.stroke();
    }
  }
  ctx.restore();
};

var drawLine = (coords, n) => {
  for (var i = 0; i < coords.length; i++) {
    for (var j = 0; j < coords[i].length; j++) {
      var point = coords[i][j];
      // if (n == "r5") {
      //   console.log("point", i, j, point);
      // }
      var x = point[0];
      var y = point[1];
      if (j == 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
  }
};

export { init, draw };
