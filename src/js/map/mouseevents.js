import { scale } from "./calc";
import context from "../util/context";
import { draw } from "./draw";
import $ from "../util/tiny";
import { setCenter, setZoom } from "./controller";

export default (container) => {
  container = $(container);

  container
    .on(
      "wheel",
      (e) => {
        e.preventDefault();

        // 基準ズーム(z=10)の「タイル1枚の幅」を現在の画面ピクセル数に換算したスケール
        const oldScale = context.scaleZ;

        var dz = e.deltaY;
        dz = dz > 5 ? 5 : dz < -5 ? -5 : dz;
        var z = context.zoom - dz / 100;
        z = Math.max(10, Math.min(z, 20));
        if (context.zoom == z) return;

        setZoom(z);

        const dx = context.mapWidth / 2 - e.offsetX;
        const dy = context.mapHeight / 2 - e.offsetY;

        const x = context.centerX + dx / context.scaleZ - dx / oldScale;
        const y = context.centerY + dy / context.scaleZ - dy / oldScale;

        setCenter(x, y);
      },
      { passive: false },
    )
    .on("mousedown touchstart", (e) => {
      e.preventDefault();
      const startCenterX = context.centerX;
      const startCenterY = context.centerY;
      const isTouch = (e) => {
        return /^t/.test(e.type);
      };
      const c = isTouch(e) ? e.touches[0] : e;
      const startX = c.clientX;
      const startY = c.clientY;
      const fnc = (e) => {
        e.preventDefault();
        const c = isTouch(e) ? e.touches[0] : e;
        const x = startCenterX + (startX - c.clientX) / context.scaleZ;
        const y = startCenterY + (startY - c.clientY) / context.scaleZ;
        setCenter(x, y);
      };
      container.on("mousemove touchmove", fnc).one("mouseup touchend", () => {
        container.off("mousemove touchmove", fnc);
      });
    });
};
