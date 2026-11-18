import context from "../util/context";
import $ from "../util/tiny";
import { init, draw } from "./draw";
import mouseevents from "./mouseevents";
import { setCenter, setZoom, resized, panTo } from "./controller";

const container = $("#m");
mouseevents(container);

const canvas = $('<canvas id="a">');
container.Append(canvas);
container.Append(
  '<div id="rts"></div><div id="tP"></div><div id="iw" popover></div><svg id="x"><path d="M5 12h14m-7-7v14" /></svg>',
);

init(canvas[0]);
setZoom(16);
setCenter(1.983373, 1.8817);
resized(400);

export { draw, mouseevents, setCenter, setZoom, resized, panTo };
