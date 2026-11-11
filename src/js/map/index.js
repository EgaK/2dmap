import context from "../util/context";
import { init, draw } from "./draw";
import mouseevents from "./mouseevents";
import { setCenter, setZoom, resize } from "./controller";

const conteiner = document.getElementById("m");
mouseevents(conteiner);

export { init, draw, mouseevents, setCenter, setZoom, resize };
