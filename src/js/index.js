import $ from "./util/tiny";
import { init, draw, mouseevents, setCenter, setZoom, resize } from "./map/";
import context from "./util/context";

const canvas = $("#a");
init(canvas[0]);

setCenter(1.984375, 1.890625);
setZoom(15);
resize(400, 400);
draw();
