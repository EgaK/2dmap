import { baseTile } from "../util/constants";
import context from "../util/context";
const { baseTileZ, baseTileX, baseTileY, tileSizePixels } = baseTile;

const scale = (z) => {
  return Math.pow(2, z - baseTileZ) * (tileSizePixels / 2);
};

const pixToLocalCoord = (x, y, cx, cy, z, w, h) => {
  const s = scale(z) * 2;
  x = w / 2 - x;
  y = h / 2 - y;
  return [cx - x / s, cy - y / s];
};

const coordToTile = (x, y, z) => {
  z = z >= 15 ? 15 : z >= 13 ? 13 : 10;
  const s = Math.pow(2, z - baseTileZ);
  const tileX = ~~((baseTileX + x) * s);
  const tileY = ~~((baseTileY + y) * s);
  return [z, tileX, tileY];
};

const getBounds = (cx, cy, z, w, h) => {
  return [
    pixToLocalCoord(0, 0, cx, cy, z, w, h),
    pixToLocalCoord(w, h, cx, cy, z, w, h),
  ];
};

var requiredTiles = (cx, cy, z, w, h) => {
  var b = getBounds(cx, cy, z, w, h);
  var nw = coordToTile(...b[0], z);
  var se = coordToTile(...b[1], z);
  var ts = [];
  for (var i = nw[1]; i <= se[1]; i++) {
    for (var j = nw[2]; j <= se[2]; j++) {
      ts.push([nw[0], i, j]);
    }
  }
  return ts;
};

const transformMatrix = (zxy) => {
  const [z, x, y] = zxy;
  // 現在のズーム値で、z値のタイルの4096の座標を1024の座標に変換する
  const scale = Math.pow(2, context.zoom - z) / 4;
  const s = Math.pow(2, z - baseTileZ);
  const shiftX =
    context.mapWidth - ((baseTileX + context.centerX) * s - x) * 4096 * scale;
  const shiftY =
    context.mapHeight - ((baseTileY + context.centerY) * s - y) * 4096 * scale;

  return [scale, 0, 0, scale, shiftX, shiftY];
};

const latLngToLocalCoord = (lngLat) => {};

export { scale, transformMatrix, requiredTiles, getBounds };
