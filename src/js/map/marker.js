import $ from "../util/tiny";
import context from "../util/context";
import transformDom from "./transformDom";

const putMarker = (id, x, y, dom) => {
  if (context.markers[id]) {
    return context.markers[id];
  }
  $("#cxy").Append(dom);
  transformDom(dom, x, y);
  const marker = {
    id,
    x,
    y,
    dom,
  };
  context.markers[id] = marker;
  return marker;
};

const removeMarker = (id) => {
  var marker = context.markers[id];
  marker && marker.dom.Remove();
  delete context.markers[id];
  // markersArray = markersArray.filter((i) => i != id);
};

export { putMarker, removeMarker };
