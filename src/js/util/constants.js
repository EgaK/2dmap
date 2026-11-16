const baseTile = {
  baseTileZ: 10,
  baseTileX: 879,
  baseTileY: 410,
  tileSizePixels: 1024,
};

const maxBounds = [
  [0.7, 0.8],
  [2.777, 2.46],
];

const pinPath = {
  // その他 co(City Office),go(Government Office), wf(Welfare facility 福祉施設), cf(culture facility),pf(public facility)
  // バス停
  "bs": "M11 13v7l-4 3h10l-4-3v-7M6 7a6 6 0 1012 0A6 6 0 106 7",
  // 病院
  "hp": "M9.1 14h5.6M12 11.4v5.3M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z",
  // 公園（木）
  "pk": "M12.3 3.3l-6.9 9.5L8 13l-3.5 4.7H20L16.4 13l3 .1zM12.3 11.9l-.1 10",
  // 郵便局
  "po": "M12 14.3v4.6m-3.7-5.1H16m-2.1-3.4H10M3 8.7l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2v-11z",
  // 交番
  "ps": "M2 12a10 10 0 1020 0 10 10 0 10-20 0m9.9-6.1v1.8m-5.2.7l10.9-.1m-9 2.6l-1.9 1.9m9.1-1.9l1.8 1.9m-2.9.7l-5.5 3.3m0-3.3l5.5 3.3",
  // 消防署
  "fs": "M12 22c-4 0-8-3-8-7v0c0-2 1-4 3-5s3-3 3-5L9 2l2 1a17 17 0 018 7 9 9 0 011 5v0l-1 4m-7 3c-2 0-3-1-3-3l2-4 1-1 1 1 2 4c0 2-1 3-3 3z",
  // 駅
  "st": "M7 2h10a5 5 0 015 5v7.5a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm2 12.6a2.1 2.1 0 11-4.2.6 2.1 2.1 0 014.2-.6zm10 0a2.1 2.1 0 11-4.2.6 2.1 2.1 0 014.2-.6zM2.9 8.3h18.5M11.8 2v6.3m2.5 11.3l3 3.2m-7.9-3.3l-3 3.2",
  // 学校
  "sc": "M12.1 7.3v2.6m-5.8.3l11.9-.1m-1.7 1.1l-8.4 6.5m.3-6.4l8.1 6.5M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z",
  // 'ct': consts.markerIcon, //constsを定義する最中で、まだconstがないので
};
// ビルの形
const pinOtherPath =
  "M3 12l6.8-5.5 6.9 5.4v8.6c0 .8-.7 1.5-1.5 1.5H4.5c-.8 0-1.5-.7-1.5-1.5zm4.6 10v-7.7H12V22M6.5 9V1.3h14.9l.2 20.7-7.3.1M10.8 5.3h6.8m-3.7 4.2h3.7";

export { baseTile, maxBounds, pinPath, pinOtherPath };
