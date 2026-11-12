import { scale } from "./calc";
import context from "../util/context";
import $ from "../util/tiny";
import { setCenter, setZoom, zoomAt } from "./controller";
import { delay } from "../util/delay";

export default (container) => {
  container = $(container);
  let tapped;
  let tx, ty;

  container
    .on(
      "wheel",
      (e) => {
        e.preventDefault();

        let dz = e.deltaY;
        dz = dz > 5 ? 5 : dz < -5 ? -5 : dz;
        let z = context.zoom - dz / 100;
        zoomAt(e.offsetX, e.offsetY, z);
      },
      { passive: false },
    )
    .on("mousedown touchstart", (e) => {
      e.preventDefault();
      const startCenterX = context.centerX;
      const startCenterY = context.centerY;
      let prevDist;
      const isTouch = (e) => {
        return /^t/.test(e.type);
      };
      const c = isTouch(e) ? e.touches[0] : e;
      const isGesture = (e) => {
        return isTouch(e) && e.touches.length > 1;
      };
      var dist = (e) => {
        const touches = e.touches;
        const x1 = touches[0].clientX;
        const y1 = touches[0].clientY;
        const x2 = touches[1].clientX;
        const y2 = touches[1].clientY;
        return [
          Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2),
          [(x1 + x2) / 2, (y1 + y2) / 2],
        ];
      };

      const startX = c.clientX;
      const startY = c.clientY;
      const fnc = (e) => {
        e.preventDefault();
        if (isGesture(e)) {
          if (prevDist) {
            const d = prevDist / dist(e)[0];
            const z = context.zoom + (1 - d) / 3;
            const x = dist(e)[1][0];
            const y = dist(e)[1][1];
            zoomAt(x, y, z);
          }
          prevDist = dist(e)[0];
        } else {
          const c = isTouch(e) ? e.touches[0] : e;
          const x = startCenterX + (startX - c.clientX) / context.scaleZ;
          const y = startCenterY + (startY - c.clientY) / context.scaleZ;
          setCenter(x, y);
        }
      };
      container.on("mousemove touchmove", fnc).one("mouseup touchend", () => {
        container.off("mousemove touchmove", fnc);
      });
    })
    .on("touchstart", (e) => {
      if (e.touches.length > 1) {
        tapped = false;
        return;
      }
      if (!tapped) {
        tapped = true;
        tx = e.touches[0].clientX;
        ty = e.touches[0].clientY;
        delay(() => {
          tapped = false;
        }, 350);
      } else if (
        Math.abs((tx - e.touches[0].clientX) * (ty - e.touches[0].clientY)) <
        100
      ) {
        // e.preventDefault();
        tapped = false;
        container.fire("dblclick", {
          detail: [e.touches[0].clientX, e.touches[0].clientY],
        });
      }
    })
    .on("dblclick", (e) => {
      let x, y;
      if (e.detail.length) {
        x = e.detail[0];
        y = e.detail[1];
      } else {
        x = e.clientX;
        y = e.clientY;
      }
      const rect = container.boundRect();
      x = x - rect.left;
      y = y - rect.top;
      const z = context.zoom + 1;
      zoomAt(x, y, z);
    });
};
