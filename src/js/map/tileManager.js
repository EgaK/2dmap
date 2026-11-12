const MAX_CACHE_SIZE = 100; // 端末のスペックに合わせて調整
const tileCache = new Map();

// タイルの取得（使われたタイルを「最新」の位置に移動する）
function getTile(key) {
  if (!tileCache.has(key)) return null;

  const tile = tileCache.get(key);
  // 一度消して入れ直すことで、Mapの末尾（＝最新）に移動させる
  tileCache.delete(key);
  tileCache.set(key, tile);
  return tile;
}

// タイルの保存（上限を超えたら一番古いタイルを破棄する）
function setTile(key, tileData) {
  if (tileCache.has(key)) {
    tileCache.delete(key);
  } else if (tileCache.size >= MAX_CACHE_SIZE) {
    // keys().next().value で「最も古く挿入されたキー」が取得できる
    const oldestKey = tileCache.keys().next().value;
    tileCache.delete(oldestKey);
  }
  tileCache.set(key, tileData);
}
