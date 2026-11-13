import Pbf from "../pbf/pbf";

const MAX_CACHE_SIZE = 100; // 端末のスペックに合わせて調整

const memo = new Map();
const que = {};

export default (url, fnc, isJSON, force) => {
  return new Promise(async (resolve, reject) => {
    if (memo.has(url) && !force) {
      const d = memo.get(url);
      memo.delete(url);
      memo.set(url, d);
      resolve(d);
      return;
    }
    if (memo.size >= MAX_CACHE_SIZE) {
      // keys().next().value で「最も古く挿入されたキー」が取得できる
      const oldestKey = memo.keys().next().value;
      memo.delete(oldestKey);
    }
    if (que[url]) {
      que[url].push([resolve, reject]);
      return;
    } else {
      que[url] = [[resolve, reject]];
    }
    let d = await fetch(url);
    if (d.ok) {
      d = isJSON ? await d.json() : new Pbf(await d.arrayBuffer());
      d = fnc ? fnc(d) : d;
      memo.set(url, d);
      for (const [resolver] of que[url]) resolver(d);
    } else {
      for (const [, rejector] of que[url]) rejector();
    }
    delete que[url];
  });
};
