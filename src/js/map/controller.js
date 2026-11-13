import context from "../util/context";
import $ from "../util/tiny";
import { scale, getBounds, isInBounds } from "./calc";
import { maxBounds } from "../util/constants";
import { draw } from "./draw";
import transformDom from "./transformDom";
import { delay } from "../util/delay";

const setCenter = (x, y) => {
  const s = context.scale;
  const hw = context.mapWidth / (2 * s);
  const hh = context.mapHeight / (2 * s);

  // getBoundsで現在の領域をとってきて比較しても意味ないよ
  // ちゃんと新しいxyでmaxBounds越えたかどうかを判定する

  if (x - hw < maxBounds[0][0]) {
    x = maxBounds[0][0] + hw;
  }
  if (x + hw > maxBounds[1][0]) {
    x = maxBounds[1][0] - hw;
  }
  if (y - hh < maxBounds[0][1]) {
    y = maxBounds[0][1] + hh;
  }
  if (y + hh > maxBounds[1][1]) {
    y = maxBounds[1][1] - hh;
  }
  if (context.centerX == x && context.centerY == y) return;
  context.centerX = x;
  context.centerY = y;
  if (DEVELOP) {
    $("#centerx").html(x.toFixed(8));
    $("#centery").html(y.toFixed(8));
  }
  draw();
};

const setZoom = (z) => {
  z = Math.max(10, Math.min(z, 20));
  if (context.zoom == z) return;
  context.zoom = z;
  context.scale = scale(z);
  if (DEVELOP) {
    $("#zoom").html(z.toFixed(8));
  }
  draw();
};

const resized = (h) => {
  const w = $("#m").boundRect().width;
  context.mapWidth = w;
  context.mapHeight = h;
  const canvas = $("#a");
  $("#a").css({
    width: context.mapWidth + "px",
    height: context.mapHeight + "px",
  });
  canvas[0].width = w * 2;
  canvas[0].height = h * 2;
  draw();
};

const zoomAt = (x, y, z) => {
  const prevScale = context.scale;
  setZoom(z);
  const dx = context.mapWidth / 2 - x;
  const dy = context.mapHeight / 2 - y;
  const newX = context.centerX + dx / context.scale - dx / prevScale;
  const newY = context.centerY + dy / context.scale - dy / prevScale;
  setCenter(newX, newY);
};

let panID;
const panTo = (x, y) => {
  const b = maxBounds;
  if (x < b[0][0] || x > b[1][0] || y < b[0][1] || y > b[1][1]) {
    return;
  }

  clearTimeout(panID);
  let dx = -(x - context.centerX) * context.scale;
  let dy = -(y - context.centerY) * context.scale;
  const target = $("#a, #tP");

  if (isInBounds(x, y)) {
    transformDom(target, dx, dy, 1, ".5s");
    panID = delay(() => {
      setCenter(x, y);
      draw();
      transformDom(target);
    }, 500);
  } else {
    const ratio = dx / dy;
    dx = Math.abs(ratio) > 1 ? context.mapWidth : context.mapWidth * ratio;
    dy = Math.abs(ratio) < 1 ? context.mapHeight : context.mapHeight * ratio;
    transformDom(target, dx, dy, 1, ".3s ease-in");
    panID = delay(() => {
      setCenter(x, y);
      draw();
      transformDom(target, -dx, -dy, 1, "");
      delay(() => {
        transformDom(target, 0, 0, 1, ".3s ease-out");
      }, 20);
      panID = delay(() => {
        transformDom(target);
      }, 300);
    }, 300);
  }
};

export { setCenter, setZoom, resized, zoomAt, panTo };
