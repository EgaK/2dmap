import context from "../util/context";
import { scale, transformMatrix, requiredTiles } from "./calc";
import loadTile from "./loadTile";
import { delay, nextFrame } from "../util/delay";
import $ from "../util/tiny";

var ctx;

const init = (canvas) => {
  ctx = canvas.getContext("2d", { alpha: false });
};

// let timerID = 0;
const t = document.getElementById("time");
const draw = async () => {
  // if (timerID) return;
  // delay(() => {
  //   timerID = 0;
  // }, 17);

  const cx = context.centerX;
  const cy = context.centerY;
  const z = context.zoom;
  const w = context.mapWidth * 2;
  const h = context.mapHeight * 2;
  if (!(cx && cy && z && w && h)) return;

  // timerID = 1;

  ctx.fillStyle = "#f5f0ea";
  ctx.fillRect(0, 0, w, h);
  const tiles = requiredTiles(cx, cy, z, w, h);
  const ids = tiles.map((zxy) => zxy.join(""));
  const nearests = {};
  for (const n of $("#tP")[0].childNodes) {
    if (!ids.includes(n.id.replace(/\D+/, ""))) {
      $(n).Remove();
    }
  }
  for (let i = 0; i < tiles.length; i++) {
    const zxy = tiles[i];
    let { figs, addrs, roadSigns, symbs } = await loadTile(zxy);
    const start = performance.now();
    const mat = transformMatrix(zxy);
    paint(figs, mat);
    const id = zxy.join("");
    if (!$("#addrs" + id).length) {
      $("#tP").Append(addrs);
    } else {
      addrs = $("#addrs" + id);
    }
    if (context.zoom > 17) {
      if (!$("#symbs" + id).length) {
        $("#tP").Append(symbs);
      } else {
        symbs = $("#symbs" + id);
      }
    } else {
      $("#symbs" + id).Remove();
    }

    const cssmat = transformMatrix(zxy, 1);
    const cssmatText = `matrix(${cssmat.join(",")})`;
    const scale = 1 / cssmat[0];

    addrs.css({
      "transform": cssmatText,
    });
    symbs.css({
      "transform": cssmatText,
    });
    $(".addr,.symb").css({
      "transform": `scale(${scale})`,
    });
    // 子供だましだけど重い処理を非同期化
    delay(() => {
      const tileXY = (x, y) => {
        return [(x - cssmat[4]) * scale, (y - cssmat[5]) * scale];
      };
      const center = tileXY(context.mapWidth / 2, context.mapHeight / 2);
      const nw = tileXY(0, 0);
      const se = tileXY(context.mapWidth, context.mapHeight);
      const distance = (pos) => {
        const dx = center[0] - pos[0];
        const dy = center[1] - pos[1];
        return dx * dx + dy * dy;
      };
      for (const name in roadSigns) {
        for (let i = 0; i < roadSigns[name].length; i++) {
          const pos = roadSigns[name][i];
          if (
            nw[0] < pos[0] &&
            pos[0] < se[0] &&
            nw[1] < pos[1] &&
            pos[1] < se[1]
          ) {
            const dist = distance(pos);
            if (nearests[name]) {
              if (dist > nearests[name][0]) continue;
            }
            const x = pos[0] * cssmat[0] + cssmat[4];
            const y = pos[1] * cssmat[0] + cssmat[5];
            const transformTxt = `translate3d(${x}px,${y}px,0px)`;
            nearests[name] = [dist, transformTxt];
          }
        }
      }
      if (i == tiles.length - 1) {
        for (const n of $("#rts")[0].childNodes) {
          if (!Object.keys(nearests).includes(n.id.replace(/^rt/, ""))) {
            $(n).Remove();
          }
        }
        for (const name in nearests) {
          let sign;
          if (!$("#rts #rt" + name).length) {
            sign = $(`<span id="rt${name}" class="rt">${name}</span>`);
            $("#rts").Append(sign);
          } else {
            sign = $("#rt" + name);
          }
          sign.css({ "transform": nearests[name][1] });
        }
      }
    });

    const end = performance.now();
    t.innerText = "地図描画時間：" + ((end - start) * 1e3).toFixed(3) + "μs";
  }
};

const paint = (layers, mat) => {
  ctx.save();
  ctx.setTransform(...mat);

  //マスク
  ctx.beginPath();
  ctx.rect(0, 0, 4096, 4096);
  // ctx.strokeStyle = "#f00";
  // ctx.lineWidth = 10 / mat[0];
  // ctx.stroke();
  ctx.clip();

  for (const layer of layers) {
    const prop = layer.prop;
    const isFill = prop.Type == "f";
    const isBorder = prop.Border;
    const dash = prop.Dash || [];
    const lineWidth = clamp(prop.Width, context.zoom);
    const opacity = prop.OPacity ? clamp(prop.OPacity, context.zoom) : 1;
    // if (prop.Layer == "t") {
    //   console.log("opacity:", opacity);
    // }
    const color = `rgba(${prop.Color} ,${opacity})`;

    ctx.beginPath();
    if (isBorder) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#aaa";
      ctx.lineWidth = 1 / mat[0];
      ctx.stroke(layer.path);
    }
    if (isFill) {
      ctx.fillStyle = color;
      ctx.fill(layer.path);
    } else {
      ctx.setLineDash(dash);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth / mat[0];
      ctx.stroke(layer.path);
      if (prop.Layer == "t") {
        ctx.setLineDash([20, 10]);
        ctx.lineCap = "butt";
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = lineWidth / mat[0] / 2;
        ctx.stroke(layer.path);
      }
      ctx.setLineDash([]);
    }
  }
  ctx.restore();
};

const clamp = (ary, x, b) => {
  b = b || 0;
  if (!Array.isArray(ary)) {
    return ary;
  }
  let z;
  for (let i = 0; i < ary.length; i++) {
    if (x <= ary[i][0]) {
      if (i == 0) {
        return ary[i][1] + b;
      }
      return (
        ary[i - 1][1] +
        ((ary[i][1] - ary[i - 1][1]) * (x - ary[i - 1][0])) /
          (ary[i][0] - ary[i - 1][0]) +
        b
      );
    }
    if (x >= ary[i][0]) {
      z = ary[i][1] + b;
    }
  }
  return z;
};

export { init, draw };
