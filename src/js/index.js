import $ from "./util/tiny";
import { init, draw, mouseevents, setCenter, setZoom, resize } from "./map/";
import context from "./util/context";

const canvas = $("#a");
init(canvas[0]);

$("#resize").on("click", (e) => {
  resize(400, 600);
});
$("#resize2").on("click", (e) => {
  resize(400, 400);
});

setZoom(15);
setCenter(1.984375, 1.890625);
resize(400, 400);
