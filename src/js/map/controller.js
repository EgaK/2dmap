import context from "../util/context";
import $ from "../util/tiny";
import { scale } from "./calc";
import { draw } from "./draw";

const setCenter = (x, y) => {
  context.centerX = x;
  context.centerY = y;
  $("#centerx").html(x.toFixed(8));
  $("#centery").html(y.toFixed(8));
  draw();
};

const setZoom = (z) => {
  context.zoom = z;
  context.scaleZ = scale(z);
  $("#zoom").html(z.toFixed(8));
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
};

export { setCenter, setZoom, resize };
