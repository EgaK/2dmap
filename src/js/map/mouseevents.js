import { scale } from "./calc";
import context from "../util/context";
import { draw } from "./draw";
import $ from "../util/tiny";
import { setCenter, setZoom } from "./controller";

const v = document.getElementById("zoom");
const view = () => {
  requestAnimationFrame(view);
  v.innerText = `zoom: ${context.zoom.toFixed(2)}, x:${context.centerX.toFixed(8)}, y:${context.centerY.toFixed(8)}`;
};
// view();

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
    .on("mousedown", (e) => {
      const startCenterX = context.centerX;
      const startCenterY = context.centerY;
      const startX = e.offsetX;
      const startY = e.offsetY;
      const fnc = (e) => {
        const x = startCenterX + (startX - e.offsetX) / context.scaleZ;
        const y = startCenterY + (startY - e.offsetY) / context.scaleZ;
        setCenter(x, y);
      };
      container.on("mousemove", fnc).one("mouseup", () => {
        container.off("mousemove", fnc);
      });
    });
};
