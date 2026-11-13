import $ from "./util/tiny";
import {
  init,
  draw,
  mouseevents,
  setCenter,
  setZoom,
  resized,
  panTo,
} from "./map/";
import { localCoordToPix, pixToLocalCoord } from "./map/calc";
import context from "./util/context";

const canvas = $("#a");
init(canvas[0]);
setZoom(15);
setCenter(1.983373, 1.8817);
resized(400);

$("#resize").on("click", (e) => {
  $("#m").css({
    height: "600px",
  });
  resized(600);
});
$("#resize2").on("click", (e) => {
  $("#m").css({
    height: "400px",
  });
  resized(400);
});
$("#pan").on("click", (e) => {
  const x = Math.random() * 1.6 + 0.8;
  const y = Math.random() * 1.6 + 0.8;
  console.log("random panTo:", x, y);
  panTo(x, y);
});

// $("#m").on("click", (e) => {
//   let [x, y] = pixToLocalCoord(e.offsetX, e.offsetY);
//   // setCenter(x, y);
//   panTo(x, y);
//   console.log("map clicked:", x, y, e.offsetX, e.offsetY);
// });
