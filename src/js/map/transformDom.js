import { localCoordToPix } from "./calc";

export default (dom, x, y, isPix, t = "") => {
  if (!isPix) {
    [x, y] = localCoordToPix(x, y);
  }
  if (x || t) {
    dom.css({
      willChange: "translate",
      translate: x + "px " + y + "px",
      transition: t,
    });
  } else {
    dom.css({ translate: "", transition: "" });
  }
};
