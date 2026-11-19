import context from "../util/context";
import $ from "../util/tiny";
import { init, draw } from "./draw";
import mouseevents from "./mouseevents";
import { setCenter, setZoom, resized, panTo } from "./controller";
import { latLngToLocalCoord } from "./calc";
import loadingSpinner from "../util/loadingSpinner";
import { delay } from "../util/delay";
import { putMarker, removeMarker } from "./marker";

let fullScreen;

const container = $("#m");
mouseevents(container);

// 地図 (#m)の拡大縮小に連動して中心が移動するように設定されたDIV (#c)
const mapwrapper = $('<div id="c">');
container.Append(mapwrapper);

const canvas = $('<canvas id="a">');
mapwrapper.Append(canvas);

// rtsは国道x号線のような表示を格納するためのDIV
// #txyはタイル座標で配置されたDOMを格納するためのDIV
// #cxyはcanvasのピクセル座標で配置されたDOMを格納するためのDIV
mapwrapper.Append(
  '<div id="rts"></div><div id="txy"></div><div id="cxy"></div>',
);

container.Append(
  '<div id="iw" popover></div><svg id="x"><path d="M5 12h14m-7-7v14" /></svg>',
);

const fs =
  "M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3";
const ss =
  "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3";
const fullScreenBtn = $(`<p id="f"><svg><path d="${ss}"/></svg></p>`).on(
  "click",
  () => {
    const h = fullScreen ? 400 : window.innerHeight - 100;
    const d = fullScreen ? ss : fs;
    $("#f path").attr({ d: d });
    fullScreen = !fullScreen;
    resized(h);
  },
);
container.Append(fullScreenBtn);

const gpsBtn = $(
  `<p id="g"><svg width="24" height="24"><circle cx="12" cy="12" r="10" /><path d="M22 12h-4M6 12H2M12 6V2M12 22v-4" /></svg></p>`,
).on("click", () => {
  loadingSpinner.show();
  removeMarker("here");
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      loadingSpinner.hide();
      const lng = pos.coords.longitude;
      const lat = pos.coords.latitude;
      const [x, y] = latLngToLocalCoord([lng, lat]);
      const dom = $('<span id="here"></span>');
      putMarker("here", x, y, dom);
      panTo(x, y);
      // DEBUG && console.log("GPS lngLat:", lng, lat);
      // var lngLat = [lng, lat];
      // var dom = $('<span id="here" />');
      // putMarker("here", lngLat, dom);
      // panTo(lngLat);
      // loading = 0;
      // updateDOM();
    },
    (e) => {
      loadingSpinner.hide();
      console.log(
        e["code"] == 1
          ? "位置情報の取得が許可されませんでした"
          : "現在地を取得出来ませんでした",
      );
      // loading = 0;
      // updateDOM();
    },
    {
      timeout: 3e3,
    },
  );
});
container.Append(gpsBtn);

const copyright = $(
  `<p id="cr" class="s"><svg><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8v1" /></svg><span>地図データ</span> <a href="//www.gsi.go.jp/" target="_blank" rel="noopener">©国土地理院</a></p>`,
).on("click", () => {
  $("#cr").removeClass("s");
  delay(() => {
    $("#cr").addClass("s");
  }, 5e3);
});

container.Append(copyright);

init(canvas[0]);
setZoom(16);
setCenter(1.983373, 1.8817);
resized(400);

export { draw, mouseevents, setCenter, setZoom, resized, panTo };
