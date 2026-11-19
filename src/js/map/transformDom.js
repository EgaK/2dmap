import { localCoordToPix } from "./calc";

export default (dom, x, y, isPix, t = "") => {
  if (!isPix) {
    [x, y] = localCoordToPix(x, y);
  }
  if (x || t) {
    dom.css({
      // willChange: "transform",
      transform: `translate3d(${x}px,${y}px,0px)`,
      transition: t,
    });
  } else {
    dom.css({ transform: "", transition: "" });
  }
};
