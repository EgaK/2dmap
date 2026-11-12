export class VectorTileFeature {
  /**
   * @param {PbfReader} pbf
   * @param {number} end
   * @param {number} extent
   * @param {string[]} keys
   * @param {(number | string | boolean)[]} values
   */
  constructor(pbf, end, extent, keys, values) {
    // Public

    /** @type {Record<string, number | string | boolean>} */
    this.properties = Object.create(null);

    this.extent = extent;
    /** @type {0 | 1 | 2 | 3} */
    this._type = 0;

    /** @type {number | undefined} */
    this.id = undefined;

    /** @private */
    this._pbf = pbf;
    /** @private */
    this._geometry = -1;
    /** @private */
    this._keys = keys;
    /** @private */
    this._values = values;

    while (pbf.pos < end) {
      const tag = pbf.readVarint();
      if (tag === 8) this.id = pbf.readVarint();
      else if (tag === 18) {
        const tagsEnd = pbf.readVarint() + pbf.pos;
        while (pbf.pos < tagsEnd) {
          const key = keys[pbf.readVarint()];
          const value = values[pbf.readVarint()];
          this.properties[key] = value;
        }
      } else if (tag === 24)
        this._type = /** @type {0 | 1 | 2 | 3} */ (pbf.readVarint());
      else if (tag === 34) {
        this._geometry = pbf.pos;
        pbf.skip(tag);
      } else pbf.skip(tag);
    }
  }

  loadGeometry() {
    if (this._geometry < 0) {
      DEVELOP && console.log("feature has no geometry");
      return;
    }
    const pbf = this._pbf;
    pbf.pos = this._geometry;

    const end = pbf.readVarint() + pbf.pos;

    /** @type [][] */
    const lines = [];

    /** @type [] | undefined */
    let line;

    let cmd = 1;
    let length = 0;
    let x = 0;
    let y = 0;

    while (pbf.pos < end) {
      if (length <= 0) {
        const cmdLen = pbf.readVarint();
        cmd = cmdLen & 0x7;
        length = cmdLen >> 3;
        if (length === 0) continue;
      }

      length--;

      if (cmd === 1) {
        // moveTo
        x += pbf.readSVarint();
        y += pbf.readSVarint();
        if (line) lines.push(line);
        line = [[x, y]];
      } else if (cmd === 2) {
        // lineTo
        x += pbf.readSVarint();
        y += pbf.readSVarint();
        if (line) line.push([x, y]);
      } else if (cmd === 7) {
        // Workaround for https://github.com/mapbox/mapnik-vector-tile/issues/90
        if (line) {
          line.push(line[0]); // closePolygon
        }
      } else {
        DEVELOP && console.log(`unknown command ${cmd}`);
        return;
      }
    }

    if (line) lines.push(line);

    return {
      lines,
      properties: this.properties,
    };
  }
}

export class VectorTileLayer {
  /**
   * @param {PbfReader} pbf
   * @param {number} [end]
   */
  constructor(pbf, end) {
    // Public
    this._version = 1;
    this._name = "";
    this.extent = 4096;
    this.length = 0;

    /** @private */
    this._pbf = pbf;

    /** @private
     * @type {string[]} */
    this._keys = [];

    /** @private
     * @type {(number | string | boolean)[]} */
    this._values = [];

    /** @private
     * @type {number[]} */
    this._features = [];

    if (end === undefined) end = pbf.length;
    while (pbf.pos < end) {
      const tag = pbf.readVarint();
      if (tag === 10) this._name = pbf.readString();
      else if (tag === 18) {
        this._features.push(pbf.pos);
        pbf.skip(tag);
      } else if (tag === 26) this._keys.push(pbf.readString());
      else if (tag === 34) this._values.push(readValueMessage(pbf));
      else if (tag === 40) this.extent = pbf.readVarint();
      else if (tag === 120) this._version = pbf.readVarint();
      else pbf.skip(tag);
    }

    this.length = this._features.length;
  }

  /** return feature `i` from this layer as a `VectorTileFeature`
   * @param {number} i
   */
  feature(i) {
    if (i < 0 || i >= this._features.length) {
      DEVELOP && console.log("feature index out of bounds");
      return;
    }

    this._pbf.pos = this._features[i];

    const end = this._pbf.readVarint() + this._pbf.pos;
    return new VectorTileFeature(
      this._pbf,
      end,
      this.extent,
      this._keys,
      this._values,
    );
  }
}

/**
 * @param {PbfReader} pbf
 */
function readValueMessage(pbf) {
  let value = null;
  const end = pbf.readVarint() + pbf.pos;

  while (pbf.pos < end) {
    const tag = pbf.readVarint();
    value =
      tag === 10
        ? pbf.readString()
        : tag === 21
          ? pbf.readFloat()
          : tag === 25
            ? pbf.readDouble()
            : tag === 32
              ? pbf.readVarint(true)
              : tag === 40
                ? pbf.readVarint()
                : tag === 48
                  ? pbf.readSVarint()
                  : tag === 56
                    ? pbf.readBoolean()
                    : (pbf.skip(tag), null);
  }
  if (value == null) {
    DEVELOP && console.log("unknown feature value");
    return;
  }

  return value;
}

export class VectorTile {
  /**
   * @param {PbfReader} pbf
   * @param {number} [end]
   */
  constructor(pbf, end = pbf.length) {
    /** @type {Record<string, VectorTileLayer>} */
    const layers = Object.create(null);
    while (pbf.pos < end) {
      const tag = pbf.readVarint();
      if (tag === 26) {
        const layer = new VectorTileLayer(pbf, pbf.readVarint() + pbf.pos);
        if (layer.length) layers[layer._name] = layer;
      } else pbf.skip(tag);
    }
    this.layers = layers;
  }
}
