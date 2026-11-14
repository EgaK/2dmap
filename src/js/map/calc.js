import { baseTile } from "../util/constants";
import context from "../util/context";
const { baseTileZ, baseTileX, baseTileY, tileSizePixels } = baseTile;

const scale = (z) => {
  return Math.pow(2, z - baseTileZ) * (tileSizePixels / 2);
};

const pixToLocalCoord = (x, y) => {
  const cx = context.centerX;
  const cy = context.centerY;
  const w = context.mapWidth;
  const h = context.mapHeight;
  const s = context.scale;
  x = w / 2 - x;
  y = h / 2 - y;
  return [cx - x / s, cy - y / s];
};

const localCoordToPix = (x, y) => {
  const cx = context.centerX;
  const cy = context.centerY;
  const w = context.mapWidth;
  const h = context.mapHeight;
  const s = context.scale;
  x = (x - cx) * s + w / 2;
  y = (y - cy) * s + h / 2;
  return [x, y];
};

const localCoordToTile = (x, y, z) => {
  z = z >= 15 ? 15 : z >= 13 ? 13 : 10;
  const s = Math.pow(2, z - baseTileZ);
  const tileX = ~~((baseTileX + x) * s);
  const tileY = ~~((baseTileY + y) * s);
  return [z, tileX, tileY];
};

const getBounds = () => {
  const w = context.mapWidth;
  const h = context.mapHeight;

  return [pixToLocalCoord(0, 0), pixToLocalCoord(w, h)];
};

const isInBounds = (x, y) => {
  const b = getBounds();
  return x > b[0][0] && x < b[1][0] && y > b[0][1] && y < b[1][1];
};

const requiredTiles = () => {
  const z = context.zoom;

  const b = getBounds();
  const nw = localCoordToTile(...b[0], z);
  const se = localCoordToTile(...b[1], z);
  const ts = [];
  for (let i = nw[1]; i <= se[1]; i++) {
    for (let j = nw[2]; j <= se[2]; j++) {
      ts.push([nw[0], i, j]);
    }
  }
  return ts;
};

const transformMatrix = (zxy, scaleRatio = 2) => {
  const [z, x, y] = zxy;
  // 現在のズーム値で、z値のタイルの4096の座標を1024の座標に変換する
  const scale = Math.pow(2, context.zoom - z) / (8 / scaleRatio);
  const s = Math.pow(2, z - baseTileZ);
  const shiftX =
    context.mapWidth / (2 / scaleRatio) -
    ((baseTileX + context.centerX) * s - x) * 4096 * scale;
  const shiftY =
    context.mapHeight / (2 / scaleRatio) -
    ((baseTileY + context.centerY) * s - y) * 4096 * scale;

  return [scale, 0, 0, scale, shiftX, shiftY];
};

const n = 1024; // Math.pow(2, baseTileZ);

const latLngToLocalCoord = (lngLat) => {
  const [lng, lat] = lngLat;
  const latRad = (lat * Math.PI) / 180;

  const worldTileX = ((lng + 180) / 360) * n;
  const worldTileY =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  const x = worldTileX - baseTileX;
  const y = worldTileY - baseTileY;
  return [x, y];
};

const localCoordToLngLat = (x, y) => {
  const worldTileX = baseTileX + x;
  const worldTileY = baseTileY + y;

  // 経度・緯度へ逆変換
  const lng = (worldTileX / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * worldTileY) / n)));
  const lat = (latRad * 180) / Math.PI;

  return [lng, lat];
};

export {
  scale,
  transformMatrix,
  requiredTiles,
  getBounds,
  isInBounds,
  latLngToLocalCoord,
  localCoordToLngLat,
  pixToLocalCoord,
  localCoordToPix,
};
