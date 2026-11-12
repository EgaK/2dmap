import context from "../util/context";
import $ from "../util/tiny";
import { scale, getBounds } from "./calc";
import { maxBounds } from "../util/constants";
import { draw } from "./draw";

const setCenter = (x, y) => {
  const z = context.zoom;
  const w = context.mapWidth;
  const h = context.mapHeight;
  const s = context.scaleZ;

  const b = getBounds(x, y, z, w * 2, h * 2);

  if (b[0][0] < maxBounds[0][0]) {
    x = maxBounds[0][0] + w / (2 * s);
  }
  if (b[1][0] > maxBounds[1][0]) {
    x = maxBounds[1][0] - w / (2 * s);
  }
  if (b[0][1] < maxBounds[0][1]) {
    y = maxBounds[0][1] + h / (2 * s);
  }
  if (b[1][1] > maxBounds[1][1]) {
    y = maxBounds[1][1] - h / (2 * s);
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
  context.scaleZ = scale(z);
  if (DEVELOP) {
    $("#zoom").html(z.toFixed(8));
  }
  draw();
};

const resize = (w, h) => {
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
  const prevScale = context.scaleZ;
  setZoom(z);
  const dx = context.mapWidth / 2 - x;
  const dy = context.mapHeight / 2 - y;
  const newX = context.centerX + dx / context.scaleZ - dx / prevScale;
  const newY = context.centerY + dy / context.scaleZ - dy / prevScale;
  setCenter(newX, newY);
};

export { setCenter, setZoom, resize, zoomAt };
