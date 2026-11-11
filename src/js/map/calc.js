import { baseTile } from "../util/constants";
import context from "../util/context";
const { baseTileZ, baseTileX, baseTileY, tileSizePixels } = baseTile;

const scale = (z) => {
  return Math.pow(2, z - baseTileZ) * (tileSizePixels / 2);
};

const zxy2center = (zxy) => {
  // const scale = Math.pow(2, zxy[0]);
  const zoomDiff = zxy[0] - baseTileZ;
  const shiftedBaseX = baseTileX * Math.pow(2, zoomDiff);
  const shiftedBaseY = baseTileY * Math.pow(2, zoomDiff);

  // 基準タイルから「描画対象のタイル」までの、そのズーム(tileZ)における枚数差（整数）
  const localTileX = zxy[1] + 0.5 - shiftedBaseX;
  const localTileY = zxy[2] + 0.5 - shiftedBaseY;

  // それを基準ズーム（z=10）のタイル枚数単位の距離にリスケールする（桁落ちしない）
  const tileScaleFromBase = 1.0 / Math.pow(2, zoomDiff);
  const tileLocalWorldX = localTileX * tileScaleFromBase;
  const tileLocalWorldY = localTileY * tileScaleFromBase;
  return [tileLocalWorldX, tileLocalWorldY];
};

const transformMatrix = (zxy) => {
  const [z, x, y] = zxy;
  const scale = Math.pow(2, context.zoom - z) / 4;
  const s = Math.pow(2, z - baseTileZ);
  const shiftX =
    context.mapWidth - ((baseTileX + context.centerX) * s - x) * 4096 * scale;
  const shiftY =
    context.mapHeight - ((baseTileY + context.centerY) * s - y) * 4096 * scale;

  return [scale, 0, 0, scale, shiftX, shiftY];
};
export { scale, zxy2center, transformMatrix };
