"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/jszip/dist/jszip.min.js
var require_jszip_min = __commonJS({
  "node_modules/jszip/dist/jszip.min.js"(exports, module2) {
    !(function(e) {
      if ("object" == typeof exports && "undefined" != typeof module2) module2.exports = e();
      else if ("function" == typeof define && define.amd) define([], e);
      else {
        ("undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : this).JSZip = e();
      }
    })(function() {
      return (function s(a, o, h) {
        function u(r, e2) {
          if (!o[r]) {
            if (!a[r]) {
              var t = "function" == typeof require && require;
              if (!e2 && t) return t(r, true);
              if (l) return l(r, true);
              var n = new Error("Cannot find module '" + r + "'");
              throw n.code = "MODULE_NOT_FOUND", n;
            }
            var i = o[r] = { exports: {} };
            a[r][0].call(i.exports, function(e3) {
              var t2 = a[r][1][e3];
              return u(t2 || e3);
            }, i, i.exports, s, a, o, h);
          }
          return o[r].exports;
        }
        for (var l = "function" == typeof require && require, e = 0; e < h.length; e++) u(h[e]);
        return u;
      })({ 1: [function(e, t, r) {
        "use strict";
        var d = e("./utils"), c = e("./support"), p = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        r.encode = function(e2) {
          for (var t2, r2, n, i, s, a, o, h = [], u = 0, l = e2.length, f = l, c2 = "string" !== d.getTypeOf(e2); u < e2.length; ) f = l - u, n = c2 ? (t2 = e2[u++], r2 = u < l ? e2[u++] : 0, u < l ? e2[u++] : 0) : (t2 = e2.charCodeAt(u++), r2 = u < l ? e2.charCodeAt(u++) : 0, u < l ? e2.charCodeAt(u++) : 0), i = t2 >> 2, s = (3 & t2) << 4 | r2 >> 4, a = 1 < f ? (15 & r2) << 2 | n >> 6 : 64, o = 2 < f ? 63 & n : 64, h.push(p.charAt(i) + p.charAt(s) + p.charAt(a) + p.charAt(o));
          return h.join("");
        }, r.decode = function(e2) {
          var t2, r2, n, i, s, a, o = 0, h = 0, u = "data:";
          if (e2.substr(0, u.length) === u) throw new Error("Invalid base64 input, it looks like a data url.");
          var l, f = 3 * (e2 = e2.replace(/[^A-Za-z0-9+/=]/g, "")).length / 4;
          if (e2.charAt(e2.length - 1) === p.charAt(64) && f--, e2.charAt(e2.length - 2) === p.charAt(64) && f--, f % 1 != 0) throw new Error("Invalid base64 input, bad content length.");
          for (l = c.uint8array ? new Uint8Array(0 | f) : new Array(0 | f); o < e2.length; ) t2 = p.indexOf(e2.charAt(o++)) << 2 | (i = p.indexOf(e2.charAt(o++))) >> 4, r2 = (15 & i) << 4 | (s = p.indexOf(e2.charAt(o++))) >> 2, n = (3 & s) << 6 | (a = p.indexOf(e2.charAt(o++))), l[h++] = t2, 64 !== s && (l[h++] = r2), 64 !== a && (l[h++] = n);
          return l;
        };
      }, { "./support": 30, "./utils": 32 }], 2: [function(e, t, r) {
        "use strict";
        var n = e("./external"), i = e("./stream/DataWorker"), s = e("./stream/Crc32Probe"), a = e("./stream/DataLengthProbe");
        function o(e2, t2, r2, n2, i2) {
          this.compressedSize = e2, this.uncompressedSize = t2, this.crc32 = r2, this.compression = n2, this.compressedContent = i2;
        }
        o.prototype = { getContentWorker: function() {
          var e2 = new i(n.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new a("data_length")), t2 = this;
          return e2.on("end", function() {
            if (this.streamInfo.data_length !== t2.uncompressedSize) throw new Error("Bug : uncompressed data size mismatch");
          }), e2;
        }, getCompressedWorker: function() {
          return new i(n.Promise.resolve(this.compressedContent)).withStreamInfo("compressedSize", this.compressedSize).withStreamInfo("uncompressedSize", this.uncompressedSize).withStreamInfo("crc32", this.crc32).withStreamInfo("compression", this.compression);
        } }, o.createWorkerFrom = function(e2, t2, r2) {
          return e2.pipe(new s()).pipe(new a("uncompressedSize")).pipe(t2.compressWorker(r2)).pipe(new a("compressedSize")).withStreamInfo("compression", t2);
        }, t.exports = o;
      }, { "./external": 6, "./stream/Crc32Probe": 25, "./stream/DataLengthProbe": 26, "./stream/DataWorker": 27 }], 3: [function(e, t, r) {
        "use strict";
        var n = e("./stream/GenericWorker");
        r.STORE = { magic: "\0\0", compressWorker: function() {
          return new n("STORE compression");
        }, uncompressWorker: function() {
          return new n("STORE decompression");
        } }, r.DEFLATE = e("./flate");
      }, { "./flate": 7, "./stream/GenericWorker": 28 }], 4: [function(e, t, r) {
        "use strict";
        var n = e("./utils");
        var o = (function() {
          for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
            e2 = r2;
            for (var n2 = 0; n2 < 8; n2++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
            t2[r2] = e2;
          }
          return t2;
        })();
        t.exports = function(e2, t2) {
          return void 0 !== e2 && e2.length ? "string" !== n.getTypeOf(e2) ? (function(e3, t3, r2, n2) {
            var i = o, s = n2 + r2;
            e3 ^= -1;
            for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3[a])];
            return -1 ^ e3;
          })(0 | t2, e2, e2.length, 0) : (function(e3, t3, r2, n2) {
            var i = o, s = n2 + r2;
            e3 ^= -1;
            for (var a = n2; a < s; a++) e3 = e3 >>> 8 ^ i[255 & (e3 ^ t3.charCodeAt(a))];
            return -1 ^ e3;
          })(0 | t2, e2, e2.length, 0) : 0;
        };
      }, { "./utils": 32 }], 5: [function(e, t, r) {
        "use strict";
        r.base64 = false, r.binary = false, r.dir = false, r.createFolders = true, r.date = null, r.compression = null, r.compressionOptions = null, r.comment = null, r.unixPermissions = null, r.dosPermissions = null;
      }, {}], 6: [function(e, t, r) {
        "use strict";
        var n = null;
        n = "undefined" != typeof Promise ? Promise : e("lie"), t.exports = { Promise: n };
      }, { lie: 37 }], 7: [function(e, t, r) {
        "use strict";
        var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Uint32Array, i = e("pako"), s = e("./utils"), a = e("./stream/GenericWorker"), o = n ? "uint8array" : "array";
        function h(e2, t2) {
          a.call(this, "FlateWorker/" + e2), this._pako = null, this._pakoAction = e2, this._pakoOptions = t2, this.meta = {};
        }
        r.magic = "\b\0", s.inherits(h, a), h.prototype.processChunk = function(e2) {
          this.meta = e2.meta, null === this._pako && this._createPako(), this._pako.push(s.transformTo(o, e2.data), false);
        }, h.prototype.flush = function() {
          a.prototype.flush.call(this), null === this._pako && this._createPako(), this._pako.push([], true);
        }, h.prototype.cleanUp = function() {
          a.prototype.cleanUp.call(this), this._pako = null;
        }, h.prototype._createPako = function() {
          this._pako = new i[this._pakoAction]({ raw: true, level: this._pakoOptions.level || -1 });
          var t2 = this;
          this._pako.onData = function(e2) {
            t2.push({ data: e2, meta: t2.meta });
          };
        }, r.compressWorker = function(e2) {
          return new h("Deflate", e2);
        }, r.uncompressWorker = function() {
          return new h("Inflate", {});
        };
      }, { "./stream/GenericWorker": 28, "./utils": 32, pako: 38 }], 8: [function(e, t, r) {
        "use strict";
        function A(e2, t2) {
          var r2, n2 = "";
          for (r2 = 0; r2 < t2; r2++) n2 += String.fromCharCode(255 & e2), e2 >>>= 8;
          return n2;
        }
        function n(e2, t2, r2, n2, i2, s2) {
          var a, o, h = e2.file, u = e2.compression, l = s2 !== O.utf8encode, f = I.transformTo("string", s2(h.name)), c = I.transformTo("string", O.utf8encode(h.name)), d = h.comment, p = I.transformTo("string", s2(d)), m = I.transformTo("string", O.utf8encode(d)), _ = c.length !== h.name.length, g = m.length !== d.length, b = "", v = "", y = "", w = h.dir, k = h.date, x = { crc32: 0, compressedSize: 0, uncompressedSize: 0 };
          t2 && !r2 || (x.crc32 = e2.crc32, x.compressedSize = e2.compressedSize, x.uncompressedSize = e2.uncompressedSize);
          var S = 0;
          t2 && (S |= 8), l || !_ && !g || (S |= 2048);
          var z = 0, C = 0;
          w && (z |= 16), "UNIX" === i2 ? (C = 798, z |= (function(e3, t3) {
            var r3 = e3;
            return e3 || (r3 = t3 ? 16893 : 33204), (65535 & r3) << 16;
          })(h.unixPermissions, w)) : (C = 20, z |= (function(e3) {
            return 63 & (e3 || 0);
          })(h.dosPermissions)), a = k.getUTCHours(), a <<= 6, a |= k.getUTCMinutes(), a <<= 5, a |= k.getUTCSeconds() / 2, o = k.getUTCFullYear() - 1980, o <<= 4, o |= k.getUTCMonth() + 1, o <<= 5, o |= k.getUTCDate(), _ && (v = A(1, 1) + A(B(f), 4) + c, b += "up" + A(v.length, 2) + v), g && (y = A(1, 1) + A(B(p), 4) + m, b += "uc" + A(y.length, 2) + y);
          var E = "";
          return E += "\n\0", E += A(S, 2), E += u.magic, E += A(a, 2), E += A(o, 2), E += A(x.crc32, 4), E += A(x.compressedSize, 4), E += A(x.uncompressedSize, 4), E += A(f.length, 2), E += A(b.length, 2), { fileRecord: R.LOCAL_FILE_HEADER + E + f + b, dirRecord: R.CENTRAL_FILE_HEADER + A(C, 2) + E + A(p.length, 2) + "\0\0\0\0" + A(z, 4) + A(n2, 4) + f + b + p };
        }
        var I = e("../utils"), i = e("../stream/GenericWorker"), O = e("../utf8"), B = e("../crc32"), R = e("../signature");
        function s(e2, t2, r2, n2) {
          i.call(this, "ZipFileWorker"), this.bytesWritten = 0, this.zipComment = t2, this.zipPlatform = r2, this.encodeFileName = n2, this.streamFiles = e2, this.accumulate = false, this.contentBuffer = [], this.dirRecords = [], this.currentSourceOffset = 0, this.entriesCount = 0, this.currentFile = null, this._sources = [];
        }
        I.inherits(s, i), s.prototype.push = function(e2) {
          var t2 = e2.meta.percent || 0, r2 = this.entriesCount, n2 = this._sources.length;
          this.accumulate ? this.contentBuffer.push(e2) : (this.bytesWritten += e2.data.length, i.prototype.push.call(this, { data: e2.data, meta: { currentFile: this.currentFile, percent: r2 ? (t2 + 100 * (r2 - n2 - 1)) / r2 : 100 } }));
        }, s.prototype.openedSource = function(e2) {
          this.currentSourceOffset = this.bytesWritten, this.currentFile = e2.file.name;
          var t2 = this.streamFiles && !e2.file.dir;
          if (t2) {
            var r2 = n(e2, t2, false, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
            this.push({ data: r2.fileRecord, meta: { percent: 0 } });
          } else this.accumulate = true;
        }, s.prototype.closedSource = function(e2) {
          this.accumulate = false;
          var t2 = this.streamFiles && !e2.file.dir, r2 = n(e2, t2, true, this.currentSourceOffset, this.zipPlatform, this.encodeFileName);
          if (this.dirRecords.push(r2.dirRecord), t2) this.push({ data: (function(e3) {
            return R.DATA_DESCRIPTOR + A(e3.crc32, 4) + A(e3.compressedSize, 4) + A(e3.uncompressedSize, 4);
          })(e2), meta: { percent: 100 } });
          else for (this.push({ data: r2.fileRecord, meta: { percent: 0 } }); this.contentBuffer.length; ) this.push(this.contentBuffer.shift());
          this.currentFile = null;
        }, s.prototype.flush = function() {
          for (var e2 = this.bytesWritten, t2 = 0; t2 < this.dirRecords.length; t2++) this.push({ data: this.dirRecords[t2], meta: { percent: 100 } });
          var r2 = this.bytesWritten - e2, n2 = (function(e3, t3, r3, n3, i2) {
            var s2 = I.transformTo("string", i2(n3));
            return R.CENTRAL_DIRECTORY_END + "\0\0\0\0" + A(e3, 2) + A(e3, 2) + A(t3, 4) + A(r3, 4) + A(s2.length, 2) + s2;
          })(this.dirRecords.length, r2, e2, this.zipComment, this.encodeFileName);
          this.push({ data: n2, meta: { percent: 100 } });
        }, s.prototype.prepareNextSource = function() {
          this.previous = this._sources.shift(), this.openedSource(this.previous.streamInfo), this.isPaused ? this.previous.pause() : this.previous.resume();
        }, s.prototype.registerPrevious = function(e2) {
          this._sources.push(e2);
          var t2 = this;
          return e2.on("data", function(e3) {
            t2.processChunk(e3);
          }), e2.on("end", function() {
            t2.closedSource(t2.previous.streamInfo), t2._sources.length ? t2.prepareNextSource() : t2.end();
          }), e2.on("error", function(e3) {
            t2.error(e3);
          }), this;
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (!this.previous && this._sources.length ? (this.prepareNextSource(), true) : this.previous || this._sources.length || this.generatedError ? void 0 : (this.end(), true));
        }, s.prototype.error = function(e2) {
          var t2 = this._sources;
          if (!i.prototype.error.call(this, e2)) return false;
          for (var r2 = 0; r2 < t2.length; r2++) try {
            t2[r2].error(e2);
          } catch (e3) {
          }
          return true;
        }, s.prototype.lock = function() {
          i.prototype.lock.call(this);
          for (var e2 = this._sources, t2 = 0; t2 < e2.length; t2++) e2[t2].lock();
        }, t.exports = s;
      }, { "../crc32": 4, "../signature": 23, "../stream/GenericWorker": 28, "../utf8": 31, "../utils": 32 }], 9: [function(e, t, r) {
        "use strict";
        var u = e("../compressions"), n = e("./ZipFileWorker");
        r.generateWorker = function(e2, a, t2) {
          var o = new n(a.streamFiles, t2, a.platform, a.encodeFileName), h = 0;
          try {
            e2.forEach(function(e3, t3) {
              h++;
              var r2 = (function(e4, t4) {
                var r3 = e4 || t4, n3 = u[r3];
                if (!n3) throw new Error(r3 + " is not a valid compression method !");
                return n3;
              })(t3.options.compression, a.compression), n2 = t3.options.compressionOptions || a.compressionOptions || {}, i = t3.dir, s = t3.date;
              t3._compressWorker(r2, n2).withStreamInfo("file", { name: e3, dir: i, date: s, comment: t3.comment || "", unixPermissions: t3.unixPermissions, dosPermissions: t3.dosPermissions }).pipe(o);
            }), o.entriesCount = h;
          } catch (e3) {
            o.error(e3);
          }
          return o;
        };
      }, { "../compressions": 3, "./ZipFileWorker": 8 }], 10: [function(e, t, r) {
        "use strict";
        function n() {
          if (!(this instanceof n)) return new n();
          if (arguments.length) throw new Error("The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.");
          this.files = /* @__PURE__ */ Object.create(null), this.comment = null, this.root = "", this.clone = function() {
            var e2 = new n();
            for (var t2 in this) "function" != typeof this[t2] && (e2[t2] = this[t2]);
            return e2;
          };
        }
        (n.prototype = e("./object")).loadAsync = e("./load"), n.support = e("./support"), n.defaults = e("./defaults"), n.version = "3.10.1", n.loadAsync = function(e2, t2) {
          return new n().loadAsync(e2, t2);
        }, n.external = e("./external"), t.exports = n;
      }, { "./defaults": 5, "./external": 6, "./load": 11, "./object": 15, "./support": 30 }], 11: [function(e, t, r) {
        "use strict";
        var u = e("./utils"), i = e("./external"), n = e("./utf8"), s = e("./zipEntries"), a = e("./stream/Crc32Probe"), l = e("./nodejsUtils");
        function f(n2) {
          return new i.Promise(function(e2, t2) {
            var r2 = n2.decompressed.getContentWorker().pipe(new a());
            r2.on("error", function(e3) {
              t2(e3);
            }).on("end", function() {
              r2.streamInfo.crc32 !== n2.decompressed.crc32 ? t2(new Error("Corrupted zip : CRC32 mismatch")) : e2();
            }).resume();
          });
        }
        t.exports = function(e2, o) {
          var h = this;
          return o = u.extend(o || {}, { base64: false, checkCRC32: false, optimizedBinaryString: false, createFolders: false, decodeFileName: n.utf8decode }), l.isNode && l.isStream(e2) ? i.Promise.reject(new Error("JSZip can't accept a stream when loading a zip file.")) : u.prepareContent("the loaded zip file", e2, true, o.optimizedBinaryString, o.base64).then(function(e3) {
            var t2 = new s(o);
            return t2.load(e3), t2;
          }).then(function(e3) {
            var t2 = [i.Promise.resolve(e3)], r2 = e3.files;
            if (o.checkCRC32) for (var n2 = 0; n2 < r2.length; n2++) t2.push(f(r2[n2]));
            return i.Promise.all(t2);
          }).then(function(e3) {
            for (var t2 = e3.shift(), r2 = t2.files, n2 = 0; n2 < r2.length; n2++) {
              var i2 = r2[n2], s2 = i2.fileNameStr, a2 = u.resolve(i2.fileNameStr);
              h.file(a2, i2.decompressed, { binary: true, optimizedBinaryString: true, date: i2.date, dir: i2.dir, comment: i2.fileCommentStr.length ? i2.fileCommentStr : null, unixPermissions: i2.unixPermissions, dosPermissions: i2.dosPermissions, createFolders: o.createFolders }), i2.dir || (h.file(a2).unsafeOriginalName = s2);
            }
            return t2.zipComment.length && (h.comment = t2.zipComment), h;
          });
        };
      }, { "./external": 6, "./nodejsUtils": 14, "./stream/Crc32Probe": 25, "./utf8": 31, "./utils": 32, "./zipEntries": 33 }], 12: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("../stream/GenericWorker");
        function s(e2, t2) {
          i.call(this, "Nodejs stream input adapter for " + e2), this._upstreamEnded = false, this._bindStream(t2);
        }
        n.inherits(s, i), s.prototype._bindStream = function(e2) {
          var t2 = this;
          (this._stream = e2).pause(), e2.on("data", function(e3) {
            t2.push({ data: e3, meta: { percent: 0 } });
          }).on("error", function(e3) {
            t2.isPaused ? this.generatedError = e3 : t2.error(e3);
          }).on("end", function() {
            t2.isPaused ? t2._upstreamEnded = true : t2.end();
          });
        }, s.prototype.pause = function() {
          return !!i.prototype.pause.call(this) && (this._stream.pause(), true);
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (this._upstreamEnded ? this.end() : this._stream.resume(), true);
        }, t.exports = s;
      }, { "../stream/GenericWorker": 28, "../utils": 32 }], 13: [function(e, t, r) {
        "use strict";
        var i = e("readable-stream").Readable;
        function n(e2, t2, r2) {
          i.call(this, t2), this._helper = e2;
          var n2 = this;
          e2.on("data", function(e3, t3) {
            n2.push(e3) || n2._helper.pause(), r2 && r2(t3);
          }).on("error", function(e3) {
            n2.emit("error", e3);
          }).on("end", function() {
            n2.push(null);
          });
        }
        e("../utils").inherits(n, i), n.prototype._read = function() {
          this._helper.resume();
        }, t.exports = n;
      }, { "../utils": 32, "readable-stream": 16 }], 14: [function(e, t, r) {
        "use strict";
        t.exports = { isNode: "undefined" != typeof Buffer, newBufferFrom: function(e2, t2) {
          if (Buffer.from && Buffer.from !== Uint8Array.from) return Buffer.from(e2, t2);
          if ("number" == typeof e2) throw new Error('The "data" argument must not be a number');
          return new Buffer(e2, t2);
        }, allocBuffer: function(e2) {
          if (Buffer.alloc) return Buffer.alloc(e2);
          var t2 = new Buffer(e2);
          return t2.fill(0), t2;
        }, isBuffer: function(e2) {
          return Buffer.isBuffer(e2);
        }, isStream: function(e2) {
          return e2 && "function" == typeof e2.on && "function" == typeof e2.pause && "function" == typeof e2.resume;
        } };
      }, {}], 15: [function(e, t, r) {
        "use strict";
        function s(e2, t2, r2) {
          var n2, i2 = u.getTypeOf(t2), s2 = u.extend(r2 || {}, f);
          s2.date = s2.date || /* @__PURE__ */ new Date(), null !== s2.compression && (s2.compression = s2.compression.toUpperCase()), "string" == typeof s2.unixPermissions && (s2.unixPermissions = parseInt(s2.unixPermissions, 8)), s2.unixPermissions && 16384 & s2.unixPermissions && (s2.dir = true), s2.dosPermissions && 16 & s2.dosPermissions && (s2.dir = true), s2.dir && (e2 = g(e2)), s2.createFolders && (n2 = _(e2)) && b.call(this, n2, true);
          var a2 = "string" === i2 && false === s2.binary && false === s2.base64;
          r2 && void 0 !== r2.binary || (s2.binary = !a2), (t2 instanceof c && 0 === t2.uncompressedSize || s2.dir || !t2 || 0 === t2.length) && (s2.base64 = false, s2.binary = true, t2 = "", s2.compression = "STORE", i2 = "string");
          var o2 = null;
          o2 = t2 instanceof c || t2 instanceof l ? t2 : p.isNode && p.isStream(t2) ? new m(e2, t2) : u.prepareContent(e2, t2, s2.binary, s2.optimizedBinaryString, s2.base64);
          var h2 = new d(e2, o2, s2);
          this.files[e2] = h2;
        }
        var i = e("./utf8"), u = e("./utils"), l = e("./stream/GenericWorker"), a = e("./stream/StreamHelper"), f = e("./defaults"), c = e("./compressedObject"), d = e("./zipObject"), o = e("./generate"), p = e("./nodejsUtils"), m = e("./nodejs/NodejsStreamInputAdapter"), _ = function(e2) {
          "/" === e2.slice(-1) && (e2 = e2.substring(0, e2.length - 1));
          var t2 = e2.lastIndexOf("/");
          return 0 < t2 ? e2.substring(0, t2) : "";
        }, g = function(e2) {
          return "/" !== e2.slice(-1) && (e2 += "/"), e2;
        }, b = function(e2, t2) {
          return t2 = void 0 !== t2 ? t2 : f.createFolders, e2 = g(e2), this.files[e2] || s.call(this, e2, null, { dir: true, createFolders: t2 }), this.files[e2];
        };
        function h(e2) {
          return "[object RegExp]" === Object.prototype.toString.call(e2);
        }
        var n = { load: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, forEach: function(e2) {
          var t2, r2, n2;
          for (t2 in this.files) n2 = this.files[t2], (r2 = t2.slice(this.root.length, t2.length)) && t2.slice(0, this.root.length) === this.root && e2(r2, n2);
        }, filter: function(r2) {
          var n2 = [];
          return this.forEach(function(e2, t2) {
            r2(e2, t2) && n2.push(t2);
          }), n2;
        }, file: function(e2, t2, r2) {
          if (1 !== arguments.length) return e2 = this.root + e2, s.call(this, e2, t2, r2), this;
          if (h(e2)) {
            var n2 = e2;
            return this.filter(function(e3, t3) {
              return !t3.dir && n2.test(e3);
            });
          }
          var i2 = this.files[this.root + e2];
          return i2 && !i2.dir ? i2 : null;
        }, folder: function(r2) {
          if (!r2) return this;
          if (h(r2)) return this.filter(function(e3, t3) {
            return t3.dir && r2.test(e3);
          });
          var e2 = this.root + r2, t2 = b.call(this, e2), n2 = this.clone();
          return n2.root = t2.name, n2;
        }, remove: function(r2) {
          r2 = this.root + r2;
          var e2 = this.files[r2];
          if (e2 || ("/" !== r2.slice(-1) && (r2 += "/"), e2 = this.files[r2]), e2 && !e2.dir) delete this.files[r2];
          else for (var t2 = this.filter(function(e3, t3) {
            return t3.name.slice(0, r2.length) === r2;
          }), n2 = 0; n2 < t2.length; n2++) delete this.files[t2[n2].name];
          return this;
        }, generate: function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, generateInternalStream: function(e2) {
          var t2, r2 = {};
          try {
            if ((r2 = u.extend(e2 || {}, { streamFiles: false, compression: "STORE", compressionOptions: null, type: "", platform: "DOS", comment: null, mimeType: "application/zip", encodeFileName: i.utf8encode })).type = r2.type.toLowerCase(), r2.compression = r2.compression.toUpperCase(), "binarystring" === r2.type && (r2.type = "string"), !r2.type) throw new Error("No output type specified.");
            u.checkSupport(r2.type), "darwin" !== r2.platform && "freebsd" !== r2.platform && "linux" !== r2.platform && "sunos" !== r2.platform || (r2.platform = "UNIX"), "win32" === r2.platform && (r2.platform = "DOS");
            var n2 = r2.comment || this.comment || "";
            t2 = o.generateWorker(this, r2, n2);
          } catch (e3) {
            (t2 = new l("error")).error(e3);
          }
          return new a(t2, r2.type || "string", r2.mimeType);
        }, generateAsync: function(e2, t2) {
          return this.generateInternalStream(e2).accumulate(t2);
        }, generateNodeStream: function(e2, t2) {
          return (e2 = e2 || {}).type || (e2.type = "nodebuffer"), this.generateInternalStream(e2).toNodejsStream(t2);
        } };
        t.exports = n;
      }, { "./compressedObject": 2, "./defaults": 5, "./generate": 9, "./nodejs/NodejsStreamInputAdapter": 12, "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31, "./utils": 32, "./zipObject": 35 }], 16: [function(e, t, r) {
        "use strict";
        t.exports = e("stream");
      }, { stream: void 0 }], 17: [function(e, t, r) {
        "use strict";
        var n = e("./DataReader");
        function i(e2) {
          n.call(this, e2);
          for (var t2 = 0; t2 < this.data.length; t2++) e2[t2] = 255 & e2[t2];
        }
        e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
          return this.data[this.zero + e2];
        }, i.prototype.lastIndexOfSignature = function(e2) {
          for (var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.length - 4; 0 <= s; --s) if (this.data[s] === t2 && this.data[s + 1] === r2 && this.data[s + 2] === n2 && this.data[s + 3] === i2) return s - this.zero;
          return -1;
        }, i.prototype.readAndCheckSignature = function(e2) {
          var t2 = e2.charCodeAt(0), r2 = e2.charCodeAt(1), n2 = e2.charCodeAt(2), i2 = e2.charCodeAt(3), s = this.readData(4);
          return t2 === s[0] && r2 === s[1] && n2 === s[2] && i2 === s[3];
        }, i.prototype.readData = function(e2) {
          if (this.checkOffset(e2), 0 === e2) return [];
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./DataReader": 18 }], 18: [function(e, t, r) {
        "use strict";
        var n = e("../utils");
        function i(e2) {
          this.data = e2, this.length = e2.length, this.index = 0, this.zero = 0;
        }
        i.prototype = { checkOffset: function(e2) {
          this.checkIndex(this.index + e2);
        }, checkIndex: function(e2) {
          if (this.length < this.zero + e2 || e2 < 0) throw new Error("End of data reached (data length = " + this.length + ", asked index = " + e2 + "). Corrupted zip ?");
        }, setIndex: function(e2) {
          this.checkIndex(e2), this.index = e2;
        }, skip: function(e2) {
          this.setIndex(this.index + e2);
        }, byteAt: function() {
        }, readInt: function(e2) {
          var t2, r2 = 0;
          for (this.checkOffset(e2), t2 = this.index + e2 - 1; t2 >= this.index; t2--) r2 = (r2 << 8) + this.byteAt(t2);
          return this.index += e2, r2;
        }, readString: function(e2) {
          return n.transformTo("string", this.readData(e2));
        }, readData: function() {
        }, lastIndexOfSignature: function() {
        }, readAndCheckSignature: function() {
        }, readDate: function() {
          var e2 = this.readInt(4);
          return new Date(Date.UTC(1980 + (e2 >> 25 & 127), (e2 >> 21 & 15) - 1, e2 >> 16 & 31, e2 >> 11 & 31, e2 >> 5 & 63, (31 & e2) << 1));
        } }, t.exports = i;
      }, { "../utils": 32 }], 19: [function(e, t, r) {
        "use strict";
        var n = e("./Uint8ArrayReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
          this.checkOffset(e2);
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./Uint8ArrayReader": 21 }], 20: [function(e, t, r) {
        "use strict";
        var n = e("./DataReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.byteAt = function(e2) {
          return this.data.charCodeAt(this.zero + e2);
        }, i.prototype.lastIndexOfSignature = function(e2) {
          return this.data.lastIndexOf(e2) - this.zero;
        }, i.prototype.readAndCheckSignature = function(e2) {
          return e2 === this.readData(4);
        }, i.prototype.readData = function(e2) {
          this.checkOffset(e2);
          var t2 = this.data.slice(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./DataReader": 18 }], 21: [function(e, t, r) {
        "use strict";
        var n = e("./ArrayReader");
        function i(e2) {
          n.call(this, e2);
        }
        e("../utils").inherits(i, n), i.prototype.readData = function(e2) {
          if (this.checkOffset(e2), 0 === e2) return new Uint8Array(0);
          var t2 = this.data.subarray(this.zero + this.index, this.zero + this.index + e2);
          return this.index += e2, t2;
        }, t.exports = i;
      }, { "../utils": 32, "./ArrayReader": 17 }], 22: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("../support"), s = e("./ArrayReader"), a = e("./StringReader"), o = e("./NodeBufferReader"), h = e("./Uint8ArrayReader");
        t.exports = function(e2) {
          var t2 = n.getTypeOf(e2);
          return n.checkSupport(t2), "string" !== t2 || i.uint8array ? "nodebuffer" === t2 ? new o(e2) : i.uint8array ? new h(n.transformTo("uint8array", e2)) : new s(n.transformTo("array", e2)) : new a(e2);
        };
      }, { "../support": 30, "../utils": 32, "./ArrayReader": 17, "./NodeBufferReader": 19, "./StringReader": 20, "./Uint8ArrayReader": 21 }], 23: [function(e, t, r) {
        "use strict";
        r.LOCAL_FILE_HEADER = "PK", r.CENTRAL_FILE_HEADER = "PK", r.CENTRAL_DIRECTORY_END = "PK", r.ZIP64_CENTRAL_DIRECTORY_LOCATOR = "PK\x07", r.ZIP64_CENTRAL_DIRECTORY_END = "PK", r.DATA_DESCRIPTOR = "PK\x07\b";
      }, {}], 24: [function(e, t, r) {
        "use strict";
        var n = e("./GenericWorker"), i = e("../utils");
        function s(e2) {
          n.call(this, "ConvertWorker to " + e2), this.destType = e2;
        }
        i.inherits(s, n), s.prototype.processChunk = function(e2) {
          this.push({ data: i.transformTo(this.destType, e2.data), meta: e2.meta });
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 25: [function(e, t, r) {
        "use strict";
        var n = e("./GenericWorker"), i = e("../crc32");
        function s() {
          n.call(this, "Crc32Probe"), this.withStreamInfo("crc32", 0);
        }
        e("../utils").inherits(s, n), s.prototype.processChunk = function(e2) {
          this.streamInfo.crc32 = i(e2.data, this.streamInfo.crc32 || 0), this.push(e2);
        }, t.exports = s;
      }, { "../crc32": 4, "../utils": 32, "./GenericWorker": 28 }], 26: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("./GenericWorker");
        function s(e2) {
          i.call(this, "DataLengthProbe for " + e2), this.propName = e2, this.withStreamInfo(e2, 0);
        }
        n.inherits(s, i), s.prototype.processChunk = function(e2) {
          if (e2) {
            var t2 = this.streamInfo[this.propName] || 0;
            this.streamInfo[this.propName] = t2 + e2.data.length;
          }
          i.prototype.processChunk.call(this, e2);
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 27: [function(e, t, r) {
        "use strict";
        var n = e("../utils"), i = e("./GenericWorker");
        function s(e2) {
          i.call(this, "DataWorker");
          var t2 = this;
          this.dataIsReady = false, this.index = 0, this.max = 0, this.data = null, this.type = "", this._tickScheduled = false, e2.then(function(e3) {
            t2.dataIsReady = true, t2.data = e3, t2.max = e3 && e3.length || 0, t2.type = n.getTypeOf(e3), t2.isPaused || t2._tickAndRepeat();
          }, function(e3) {
            t2.error(e3);
          });
        }
        n.inherits(s, i), s.prototype.cleanUp = function() {
          i.prototype.cleanUp.call(this), this.data = null;
        }, s.prototype.resume = function() {
          return !!i.prototype.resume.call(this) && (!this._tickScheduled && this.dataIsReady && (this._tickScheduled = true, n.delay(this._tickAndRepeat, [], this)), true);
        }, s.prototype._tickAndRepeat = function() {
          this._tickScheduled = false, this.isPaused || this.isFinished || (this._tick(), this.isFinished || (n.delay(this._tickAndRepeat, [], this), this._tickScheduled = true));
        }, s.prototype._tick = function() {
          if (this.isPaused || this.isFinished) return false;
          var e2 = null, t2 = Math.min(this.max, this.index + 16384);
          if (this.index >= this.max) return this.end();
          switch (this.type) {
            case "string":
              e2 = this.data.substring(this.index, t2);
              break;
            case "uint8array":
              e2 = this.data.subarray(this.index, t2);
              break;
            case "array":
            case "nodebuffer":
              e2 = this.data.slice(this.index, t2);
          }
          return this.index = t2, this.push({ data: e2, meta: { percent: this.max ? this.index / this.max * 100 : 0 } });
        }, t.exports = s;
      }, { "../utils": 32, "./GenericWorker": 28 }], 28: [function(e, t, r) {
        "use strict";
        function n(e2) {
          this.name = e2 || "default", this.streamInfo = {}, this.generatedError = null, this.extraStreamInfo = {}, this.isPaused = true, this.isFinished = false, this.isLocked = false, this._listeners = { data: [], end: [], error: [] }, this.previous = null;
        }
        n.prototype = { push: function(e2) {
          this.emit("data", e2);
        }, end: function() {
          if (this.isFinished) return false;
          this.flush();
          try {
            this.emit("end"), this.cleanUp(), this.isFinished = true;
          } catch (e2) {
            this.emit("error", e2);
          }
          return true;
        }, error: function(e2) {
          return !this.isFinished && (this.isPaused ? this.generatedError = e2 : (this.isFinished = true, this.emit("error", e2), this.previous && this.previous.error(e2), this.cleanUp()), true);
        }, on: function(e2, t2) {
          return this._listeners[e2].push(t2), this;
        }, cleanUp: function() {
          this.streamInfo = this.generatedError = this.extraStreamInfo = null, this._listeners = [];
        }, emit: function(e2, t2) {
          if (this._listeners[e2]) for (var r2 = 0; r2 < this._listeners[e2].length; r2++) this._listeners[e2][r2].call(this, t2);
        }, pipe: function(e2) {
          return e2.registerPrevious(this);
        }, registerPrevious: function(e2) {
          if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
          this.streamInfo = e2.streamInfo, this.mergeStreamInfo(), this.previous = e2;
          var t2 = this;
          return e2.on("data", function(e3) {
            t2.processChunk(e3);
          }), e2.on("end", function() {
            t2.end();
          }), e2.on("error", function(e3) {
            t2.error(e3);
          }), this;
        }, pause: function() {
          return !this.isPaused && !this.isFinished && (this.isPaused = true, this.previous && this.previous.pause(), true);
        }, resume: function() {
          if (!this.isPaused || this.isFinished) return false;
          var e2 = this.isPaused = false;
          return this.generatedError && (this.error(this.generatedError), e2 = true), this.previous && this.previous.resume(), !e2;
        }, flush: function() {
        }, processChunk: function(e2) {
          this.push(e2);
        }, withStreamInfo: function(e2, t2) {
          return this.extraStreamInfo[e2] = t2, this.mergeStreamInfo(), this;
        }, mergeStreamInfo: function() {
          for (var e2 in this.extraStreamInfo) Object.prototype.hasOwnProperty.call(this.extraStreamInfo, e2) && (this.streamInfo[e2] = this.extraStreamInfo[e2]);
        }, lock: function() {
          if (this.isLocked) throw new Error("The stream '" + this + "' has already been used.");
          this.isLocked = true, this.previous && this.previous.lock();
        }, toString: function() {
          var e2 = "Worker " + this.name;
          return this.previous ? this.previous + " -> " + e2 : e2;
        } }, t.exports = n;
      }, {}], 29: [function(e, t, r) {
        "use strict";
        var h = e("../utils"), i = e("./ConvertWorker"), s = e("./GenericWorker"), u = e("../base64"), n = e("../support"), a = e("../external"), o = null;
        if (n.nodestream) try {
          o = e("../nodejs/NodejsStreamOutputAdapter");
        } catch (e2) {
        }
        function l(e2, o2) {
          return new a.Promise(function(t2, r2) {
            var n2 = [], i2 = e2._internalType, s2 = e2._outputType, a2 = e2._mimeType;
            e2.on("data", function(e3, t3) {
              n2.push(e3), o2 && o2(t3);
            }).on("error", function(e3) {
              n2 = [], r2(e3);
            }).on("end", function() {
              try {
                var e3 = (function(e4, t3, r3) {
                  switch (e4) {
                    case "blob":
                      return h.newBlob(h.transformTo("arraybuffer", t3), r3);
                    case "base64":
                      return u.encode(t3);
                    default:
                      return h.transformTo(e4, t3);
                  }
                })(s2, (function(e4, t3) {
                  var r3, n3 = 0, i3 = null, s3 = 0;
                  for (r3 = 0; r3 < t3.length; r3++) s3 += t3[r3].length;
                  switch (e4) {
                    case "string":
                      return t3.join("");
                    case "array":
                      return Array.prototype.concat.apply([], t3);
                    case "uint8array":
                      for (i3 = new Uint8Array(s3), r3 = 0; r3 < t3.length; r3++) i3.set(t3[r3], n3), n3 += t3[r3].length;
                      return i3;
                    case "nodebuffer":
                      return Buffer.concat(t3);
                    default:
                      throw new Error("concat : unsupported type '" + e4 + "'");
                  }
                })(i2, n2), a2);
                t2(e3);
              } catch (e4) {
                r2(e4);
              }
              n2 = [];
            }).resume();
          });
        }
        function f(e2, t2, r2) {
          var n2 = t2;
          switch (t2) {
            case "blob":
            case "arraybuffer":
              n2 = "uint8array";
              break;
            case "base64":
              n2 = "string";
          }
          try {
            this._internalType = n2, this._outputType = t2, this._mimeType = r2, h.checkSupport(n2), this._worker = e2.pipe(new i(n2)), e2.lock();
          } catch (e3) {
            this._worker = new s("error"), this._worker.error(e3);
          }
        }
        f.prototype = { accumulate: function(e2) {
          return l(this, e2);
        }, on: function(e2, t2) {
          var r2 = this;
          return "data" === e2 ? this._worker.on(e2, function(e3) {
            t2.call(r2, e3.data, e3.meta);
          }) : this._worker.on(e2, function() {
            h.delay(t2, arguments, r2);
          }), this;
        }, resume: function() {
          return h.delay(this._worker.resume, [], this._worker), this;
        }, pause: function() {
          return this._worker.pause(), this;
        }, toNodejsStream: function(e2) {
          if (h.checkSupport("nodestream"), "nodebuffer" !== this._outputType) throw new Error(this._outputType + " is not supported by this method");
          return new o(this, { objectMode: "nodebuffer" !== this._outputType }, e2);
        } }, t.exports = f;
      }, { "../base64": 1, "../external": 6, "../nodejs/NodejsStreamOutputAdapter": 13, "../support": 30, "../utils": 32, "./ConvertWorker": 24, "./GenericWorker": 28 }], 30: [function(e, t, r) {
        "use strict";
        if (r.base64 = true, r.array = true, r.string = true, r.arraybuffer = "undefined" != typeof ArrayBuffer && "undefined" != typeof Uint8Array, r.nodebuffer = "undefined" != typeof Buffer, r.uint8array = "undefined" != typeof Uint8Array, "undefined" == typeof ArrayBuffer) r.blob = false;
        else {
          var n = new ArrayBuffer(0);
          try {
            r.blob = 0 === new Blob([n], { type: "application/zip" }).size;
          } catch (e2) {
            try {
              var i = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              i.append(n), r.blob = 0 === i.getBlob("application/zip").size;
            } catch (e3) {
              r.blob = false;
            }
          }
        }
        try {
          r.nodestream = !!e("readable-stream").Readable;
        } catch (e2) {
          r.nodestream = false;
        }
      }, { "readable-stream": 16 }], 31: [function(e, t, s) {
        "use strict";
        for (var o = e("./utils"), h = e("./support"), r = e("./nodejsUtils"), n = e("./stream/GenericWorker"), u = new Array(256), i = 0; i < 256; i++) u[i] = 252 <= i ? 6 : 248 <= i ? 5 : 240 <= i ? 4 : 224 <= i ? 3 : 192 <= i ? 2 : 1;
        u[254] = u[254] = 1;
        function a() {
          n.call(this, "utf-8 decode"), this.leftOver = null;
        }
        function l() {
          n.call(this, "utf-8 encode");
        }
        s.utf8encode = function(e2) {
          return h.nodebuffer ? r.newBufferFrom(e2, "utf-8") : (function(e3) {
            var t2, r2, n2, i2, s2, a2 = e3.length, o2 = 0;
            for (i2 = 0; i2 < a2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o2 += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
            for (t2 = h.uint8array ? new Uint8Array(o2) : new Array(o2), i2 = s2 = 0; s2 < o2; i2++) 55296 == (64512 & (r2 = e3.charCodeAt(i2))) && i2 + 1 < a2 && 56320 == (64512 & (n2 = e3.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
            return t2;
          })(e2);
        }, s.utf8decode = function(e2) {
          return h.nodebuffer ? o.transformTo("nodebuffer", e2).toString("utf-8") : (function(e3) {
            var t2, r2, n2, i2, s2 = e3.length, a2 = new Array(2 * s2);
            for (t2 = r2 = 0; t2 < s2; ) if ((n2 = e3[t2++]) < 128) a2[r2++] = n2;
            else if (4 < (i2 = u[n2])) a2[r2++] = 65533, t2 += i2 - 1;
            else {
              for (n2 &= 2 === i2 ? 31 : 3 === i2 ? 15 : 7; 1 < i2 && t2 < s2; ) n2 = n2 << 6 | 63 & e3[t2++], i2--;
              1 < i2 ? a2[r2++] = 65533 : n2 < 65536 ? a2[r2++] = n2 : (n2 -= 65536, a2[r2++] = 55296 | n2 >> 10 & 1023, a2[r2++] = 56320 | 1023 & n2);
            }
            return a2.length !== r2 && (a2.subarray ? a2 = a2.subarray(0, r2) : a2.length = r2), o.applyFromCharCode(a2);
          })(e2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2));
        }, o.inherits(a, n), a.prototype.processChunk = function(e2) {
          var t2 = o.transformTo(h.uint8array ? "uint8array" : "array", e2.data);
          if (this.leftOver && this.leftOver.length) {
            if (h.uint8array) {
              var r2 = t2;
              (t2 = new Uint8Array(r2.length + this.leftOver.length)).set(this.leftOver, 0), t2.set(r2, this.leftOver.length);
            } else t2 = this.leftOver.concat(t2);
            this.leftOver = null;
          }
          var n2 = (function(e3, t3) {
            var r3;
            for ((t3 = t3 || e3.length) > e3.length && (t3 = e3.length), r3 = t3 - 1; 0 <= r3 && 128 == (192 & e3[r3]); ) r3--;
            return r3 < 0 ? t3 : 0 === r3 ? t3 : r3 + u[e3[r3]] > t3 ? r3 : t3;
          })(t2), i2 = t2;
          n2 !== t2.length && (h.uint8array ? (i2 = t2.subarray(0, n2), this.leftOver = t2.subarray(n2, t2.length)) : (i2 = t2.slice(0, n2), this.leftOver = t2.slice(n2, t2.length))), this.push({ data: s.utf8decode(i2), meta: e2.meta });
        }, a.prototype.flush = function() {
          this.leftOver && this.leftOver.length && (this.push({ data: s.utf8decode(this.leftOver), meta: {} }), this.leftOver = null);
        }, s.Utf8DecodeWorker = a, o.inherits(l, n), l.prototype.processChunk = function(e2) {
          this.push({ data: s.utf8encode(e2.data), meta: e2.meta });
        }, s.Utf8EncodeWorker = l;
      }, { "./nodejsUtils": 14, "./stream/GenericWorker": 28, "./support": 30, "./utils": 32 }], 32: [function(e, t, a) {
        "use strict";
        var o = e("./support"), h = e("./base64"), r = e("./nodejsUtils"), u = e("./external");
        function n(e2) {
          return e2;
        }
        function l(e2, t2) {
          for (var r2 = 0; r2 < e2.length; ++r2) t2[r2] = 255 & e2.charCodeAt(r2);
          return t2;
        }
        e("setimmediate"), a.newBlob = function(t2, r2) {
          a.checkSupport("blob");
          try {
            return new Blob([t2], { type: r2 });
          } catch (e2) {
            try {
              var n2 = new (self.BlobBuilder || self.WebKitBlobBuilder || self.MozBlobBuilder || self.MSBlobBuilder)();
              return n2.append(t2), n2.getBlob(r2);
            } catch (e3) {
              throw new Error("Bug : can't construct the Blob.");
            }
          }
        };
        var i = { stringifyByChunk: function(e2, t2, r2) {
          var n2 = [], i2 = 0, s2 = e2.length;
          if (s2 <= r2) return String.fromCharCode.apply(null, e2);
          for (; i2 < s2; ) "array" === t2 || "nodebuffer" === t2 ? n2.push(String.fromCharCode.apply(null, e2.slice(i2, Math.min(i2 + r2, s2)))) : n2.push(String.fromCharCode.apply(null, e2.subarray(i2, Math.min(i2 + r2, s2)))), i2 += r2;
          return n2.join("");
        }, stringifyByChar: function(e2) {
          for (var t2 = "", r2 = 0; r2 < e2.length; r2++) t2 += String.fromCharCode(e2[r2]);
          return t2;
        }, applyCanBeUsed: { uint8array: (function() {
          try {
            return o.uint8array && 1 === String.fromCharCode.apply(null, new Uint8Array(1)).length;
          } catch (e2) {
            return false;
          }
        })(), nodebuffer: (function() {
          try {
            return o.nodebuffer && 1 === String.fromCharCode.apply(null, r.allocBuffer(1)).length;
          } catch (e2) {
            return false;
          }
        })() } };
        function s(e2) {
          var t2 = 65536, r2 = a.getTypeOf(e2), n2 = true;
          if ("uint8array" === r2 ? n2 = i.applyCanBeUsed.uint8array : "nodebuffer" === r2 && (n2 = i.applyCanBeUsed.nodebuffer), n2) for (; 1 < t2; ) try {
            return i.stringifyByChunk(e2, r2, t2);
          } catch (e3) {
            t2 = Math.floor(t2 / 2);
          }
          return i.stringifyByChar(e2);
        }
        function f(e2, t2) {
          for (var r2 = 0; r2 < e2.length; r2++) t2[r2] = e2[r2];
          return t2;
        }
        a.applyFromCharCode = s;
        var c = {};
        c.string = { string: n, array: function(e2) {
          return l(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return c.string.uint8array(e2).buffer;
        }, uint8array: function(e2) {
          return l(e2, new Uint8Array(e2.length));
        }, nodebuffer: function(e2) {
          return l(e2, r.allocBuffer(e2.length));
        } }, c.array = { string: s, array: n, arraybuffer: function(e2) {
          return new Uint8Array(e2).buffer;
        }, uint8array: function(e2) {
          return new Uint8Array(e2);
        }, nodebuffer: function(e2) {
          return r.newBufferFrom(e2);
        } }, c.arraybuffer = { string: function(e2) {
          return s(new Uint8Array(e2));
        }, array: function(e2) {
          return f(new Uint8Array(e2), new Array(e2.byteLength));
        }, arraybuffer: n, uint8array: function(e2) {
          return new Uint8Array(e2);
        }, nodebuffer: function(e2) {
          return r.newBufferFrom(new Uint8Array(e2));
        } }, c.uint8array = { string: s, array: function(e2) {
          return f(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return e2.buffer;
        }, uint8array: n, nodebuffer: function(e2) {
          return r.newBufferFrom(e2);
        } }, c.nodebuffer = { string: s, array: function(e2) {
          return f(e2, new Array(e2.length));
        }, arraybuffer: function(e2) {
          return c.nodebuffer.uint8array(e2).buffer;
        }, uint8array: function(e2) {
          return f(e2, new Uint8Array(e2.length));
        }, nodebuffer: n }, a.transformTo = function(e2, t2) {
          if (t2 = t2 || "", !e2) return t2;
          a.checkSupport(e2);
          var r2 = a.getTypeOf(t2);
          return c[r2][e2](t2);
        }, a.resolve = function(e2) {
          for (var t2 = e2.split("/"), r2 = [], n2 = 0; n2 < t2.length; n2++) {
            var i2 = t2[n2];
            "." === i2 || "" === i2 && 0 !== n2 && n2 !== t2.length - 1 || (".." === i2 ? r2.pop() : r2.push(i2));
          }
          return r2.join("/");
        }, a.getTypeOf = function(e2) {
          return "string" == typeof e2 ? "string" : "[object Array]" === Object.prototype.toString.call(e2) ? "array" : o.nodebuffer && r.isBuffer(e2) ? "nodebuffer" : o.uint8array && e2 instanceof Uint8Array ? "uint8array" : o.arraybuffer && e2 instanceof ArrayBuffer ? "arraybuffer" : void 0;
        }, a.checkSupport = function(e2) {
          if (!o[e2.toLowerCase()]) throw new Error(e2 + " is not supported by this platform");
        }, a.MAX_VALUE_16BITS = 65535, a.MAX_VALUE_32BITS = -1, a.pretty = function(e2) {
          var t2, r2, n2 = "";
          for (r2 = 0; r2 < (e2 || "").length; r2++) n2 += "\\x" + ((t2 = e2.charCodeAt(r2)) < 16 ? "0" : "") + t2.toString(16).toUpperCase();
          return n2;
        }, a.delay = function(e2, t2, r2) {
          setImmediate(function() {
            e2.apply(r2 || null, t2 || []);
          });
        }, a.inherits = function(e2, t2) {
          function r2() {
          }
          r2.prototype = t2.prototype, e2.prototype = new r2();
        }, a.extend = function() {
          var e2, t2, r2 = {};
          for (e2 = 0; e2 < arguments.length; e2++) for (t2 in arguments[e2]) Object.prototype.hasOwnProperty.call(arguments[e2], t2) && void 0 === r2[t2] && (r2[t2] = arguments[e2][t2]);
          return r2;
        }, a.prepareContent = function(r2, e2, n2, i2, s2) {
          return u.Promise.resolve(e2).then(function(n3) {
            return o.blob && (n3 instanceof Blob || -1 !== ["[object File]", "[object Blob]"].indexOf(Object.prototype.toString.call(n3))) && "undefined" != typeof FileReader ? new u.Promise(function(t2, r3) {
              var e3 = new FileReader();
              e3.onload = function(e4) {
                t2(e4.target.result);
              }, e3.onerror = function(e4) {
                r3(e4.target.error);
              }, e3.readAsArrayBuffer(n3);
            }) : n3;
          }).then(function(e3) {
            var t2 = a.getTypeOf(e3);
            return t2 ? ("arraybuffer" === t2 ? e3 = a.transformTo("uint8array", e3) : "string" === t2 && (s2 ? e3 = h.decode(e3) : n2 && true !== i2 && (e3 = (function(e4) {
              return l(e4, o.uint8array ? new Uint8Array(e4.length) : new Array(e4.length));
            })(e3))), e3) : u.Promise.reject(new Error("Can't read the data of '" + r2 + "'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?"));
          });
        };
      }, { "./base64": 1, "./external": 6, "./nodejsUtils": 14, "./support": 30, setimmediate: 54 }], 33: [function(e, t, r) {
        "use strict";
        var n = e("./reader/readerFor"), i = e("./utils"), s = e("./signature"), a = e("./zipEntry"), o = e("./support");
        function h(e2) {
          this.files = [], this.loadOptions = e2;
        }
        h.prototype = { checkSignature: function(e2) {
          if (!this.reader.readAndCheckSignature(e2)) {
            this.reader.index -= 4;
            var t2 = this.reader.readString(4);
            throw new Error("Corrupted zip or bug: unexpected signature (" + i.pretty(t2) + ", expected " + i.pretty(e2) + ")");
          }
        }, isSignature: function(e2, t2) {
          var r2 = this.reader.index;
          this.reader.setIndex(e2);
          var n2 = this.reader.readString(4) === t2;
          return this.reader.setIndex(r2), n2;
        }, readBlockEndOfCentral: function() {
          this.diskNumber = this.reader.readInt(2), this.diskWithCentralDirStart = this.reader.readInt(2), this.centralDirRecordsOnThisDisk = this.reader.readInt(2), this.centralDirRecords = this.reader.readInt(2), this.centralDirSize = this.reader.readInt(4), this.centralDirOffset = this.reader.readInt(4), this.zipCommentLength = this.reader.readInt(2);
          var e2 = this.reader.readData(this.zipCommentLength), t2 = o.uint8array ? "uint8array" : "array", r2 = i.transformTo(t2, e2);
          this.zipComment = this.loadOptions.decodeFileName(r2);
        }, readBlockZip64EndOfCentral: function() {
          this.zip64EndOfCentralSize = this.reader.readInt(8), this.reader.skip(4), this.diskNumber = this.reader.readInt(4), this.diskWithCentralDirStart = this.reader.readInt(4), this.centralDirRecordsOnThisDisk = this.reader.readInt(8), this.centralDirRecords = this.reader.readInt(8), this.centralDirSize = this.reader.readInt(8), this.centralDirOffset = this.reader.readInt(8), this.zip64ExtensibleData = {};
          for (var e2, t2, r2, n2 = this.zip64EndOfCentralSize - 44; 0 < n2; ) e2 = this.reader.readInt(2), t2 = this.reader.readInt(4), r2 = this.reader.readData(t2), this.zip64ExtensibleData[e2] = { id: e2, length: t2, value: r2 };
        }, readBlockZip64EndOfCentralLocator: function() {
          if (this.diskWithZip64CentralDirStart = this.reader.readInt(4), this.relativeOffsetEndOfZip64CentralDir = this.reader.readInt(8), this.disksCount = this.reader.readInt(4), 1 < this.disksCount) throw new Error("Multi-volumes zip are not supported");
        }, readLocalFiles: function() {
          var e2, t2;
          for (e2 = 0; e2 < this.files.length; e2++) t2 = this.files[e2], this.reader.setIndex(t2.localHeaderOffset), this.checkSignature(s.LOCAL_FILE_HEADER), t2.readLocalPart(this.reader), t2.handleUTF8(), t2.processAttributes();
        }, readCentralDir: function() {
          var e2;
          for (this.reader.setIndex(this.centralDirOffset); this.reader.readAndCheckSignature(s.CENTRAL_FILE_HEADER); ) (e2 = new a({ zip64: this.zip64 }, this.loadOptions)).readCentralPart(this.reader), this.files.push(e2);
          if (this.centralDirRecords !== this.files.length && 0 !== this.centralDirRecords && 0 === this.files.length) throw new Error("Corrupted zip or bug: expected " + this.centralDirRecords + " records in central dir, got " + this.files.length);
        }, readEndOfCentral: function() {
          var e2 = this.reader.lastIndexOfSignature(s.CENTRAL_DIRECTORY_END);
          if (e2 < 0) throw !this.isSignature(0, s.LOCAL_FILE_HEADER) ? new Error("Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html") : new Error("Corrupted zip: can't find end of central directory");
          this.reader.setIndex(e2);
          var t2 = e2;
          if (this.checkSignature(s.CENTRAL_DIRECTORY_END), this.readBlockEndOfCentral(), this.diskNumber === i.MAX_VALUE_16BITS || this.diskWithCentralDirStart === i.MAX_VALUE_16BITS || this.centralDirRecordsOnThisDisk === i.MAX_VALUE_16BITS || this.centralDirRecords === i.MAX_VALUE_16BITS || this.centralDirSize === i.MAX_VALUE_32BITS || this.centralDirOffset === i.MAX_VALUE_32BITS) {
            if (this.zip64 = true, (e2 = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR)) < 0) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory locator");
            if (this.reader.setIndex(e2), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_LOCATOR), this.readBlockZip64EndOfCentralLocator(), !this.isSignature(this.relativeOffsetEndOfZip64CentralDir, s.ZIP64_CENTRAL_DIRECTORY_END) && (this.relativeOffsetEndOfZip64CentralDir = this.reader.lastIndexOfSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.relativeOffsetEndOfZip64CentralDir < 0)) throw new Error("Corrupted zip: can't find the ZIP64 end of central directory");
            this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir), this.checkSignature(s.ZIP64_CENTRAL_DIRECTORY_END), this.readBlockZip64EndOfCentral();
          }
          var r2 = this.centralDirOffset + this.centralDirSize;
          this.zip64 && (r2 += 20, r2 += 12 + this.zip64EndOfCentralSize);
          var n2 = t2 - r2;
          if (0 < n2) this.isSignature(t2, s.CENTRAL_FILE_HEADER) || (this.reader.zero = n2);
          else if (n2 < 0) throw new Error("Corrupted zip: missing " + Math.abs(n2) + " bytes.");
        }, prepareReader: function(e2) {
          this.reader = n(e2);
        }, load: function(e2) {
          this.prepareReader(e2), this.readEndOfCentral(), this.readCentralDir(), this.readLocalFiles();
        } }, t.exports = h;
      }, { "./reader/readerFor": 22, "./signature": 23, "./support": 30, "./utils": 32, "./zipEntry": 34 }], 34: [function(e, t, r) {
        "use strict";
        var n = e("./reader/readerFor"), s = e("./utils"), i = e("./compressedObject"), a = e("./crc32"), o = e("./utf8"), h = e("./compressions"), u = e("./support");
        function l(e2, t2) {
          this.options = e2, this.loadOptions = t2;
        }
        l.prototype = { isEncrypted: function() {
          return 1 == (1 & this.bitFlag);
        }, useUTF8: function() {
          return 2048 == (2048 & this.bitFlag);
        }, readLocalPart: function(e2) {
          var t2, r2;
          if (e2.skip(22), this.fileNameLength = e2.readInt(2), r2 = e2.readInt(2), this.fileName = e2.readData(this.fileNameLength), e2.skip(r2), -1 === this.compressedSize || -1 === this.uncompressedSize) throw new Error("Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)");
          if (null === (t2 = (function(e3) {
            for (var t3 in h) if (Object.prototype.hasOwnProperty.call(h, t3) && h[t3].magic === e3) return h[t3];
            return null;
          })(this.compressionMethod))) throw new Error("Corrupted zip : compression " + s.pretty(this.compressionMethod) + " unknown (inner file : " + s.transformTo("string", this.fileName) + ")");
          this.decompressed = new i(this.compressedSize, this.uncompressedSize, this.crc32, t2, e2.readData(this.compressedSize));
        }, readCentralPart: function(e2) {
          this.versionMadeBy = e2.readInt(2), e2.skip(2), this.bitFlag = e2.readInt(2), this.compressionMethod = e2.readString(2), this.date = e2.readDate(), this.crc32 = e2.readInt(4), this.compressedSize = e2.readInt(4), this.uncompressedSize = e2.readInt(4);
          var t2 = e2.readInt(2);
          if (this.extraFieldsLength = e2.readInt(2), this.fileCommentLength = e2.readInt(2), this.diskNumberStart = e2.readInt(2), this.internalFileAttributes = e2.readInt(2), this.externalFileAttributes = e2.readInt(4), this.localHeaderOffset = e2.readInt(4), this.isEncrypted()) throw new Error("Encrypted zip are not supported");
          e2.skip(t2), this.readExtraFields(e2), this.parseZIP64ExtraField(e2), this.fileComment = e2.readData(this.fileCommentLength);
        }, processAttributes: function() {
          this.unixPermissions = null, this.dosPermissions = null;
          var e2 = this.versionMadeBy >> 8;
          this.dir = !!(16 & this.externalFileAttributes), 0 == e2 && (this.dosPermissions = 63 & this.externalFileAttributes), 3 == e2 && (this.unixPermissions = this.externalFileAttributes >> 16 & 65535), this.dir || "/" !== this.fileNameStr.slice(-1) || (this.dir = true);
        }, parseZIP64ExtraField: function() {
          if (this.extraFields[1]) {
            var e2 = n(this.extraFields[1].value);
            this.uncompressedSize === s.MAX_VALUE_32BITS && (this.uncompressedSize = e2.readInt(8)), this.compressedSize === s.MAX_VALUE_32BITS && (this.compressedSize = e2.readInt(8)), this.localHeaderOffset === s.MAX_VALUE_32BITS && (this.localHeaderOffset = e2.readInt(8)), this.diskNumberStart === s.MAX_VALUE_32BITS && (this.diskNumberStart = e2.readInt(4));
          }
        }, readExtraFields: function(e2) {
          var t2, r2, n2, i2 = e2.index + this.extraFieldsLength;
          for (this.extraFields || (this.extraFields = {}); e2.index + 4 < i2; ) t2 = e2.readInt(2), r2 = e2.readInt(2), n2 = e2.readData(r2), this.extraFields[t2] = { id: t2, length: r2, value: n2 };
          e2.setIndex(i2);
        }, handleUTF8: function() {
          var e2 = u.uint8array ? "uint8array" : "array";
          if (this.useUTF8()) this.fileNameStr = o.utf8decode(this.fileName), this.fileCommentStr = o.utf8decode(this.fileComment);
          else {
            var t2 = this.findExtraFieldUnicodePath();
            if (null !== t2) this.fileNameStr = t2;
            else {
              var r2 = s.transformTo(e2, this.fileName);
              this.fileNameStr = this.loadOptions.decodeFileName(r2);
            }
            var n2 = this.findExtraFieldUnicodeComment();
            if (null !== n2) this.fileCommentStr = n2;
            else {
              var i2 = s.transformTo(e2, this.fileComment);
              this.fileCommentStr = this.loadOptions.decodeFileName(i2);
            }
          }
        }, findExtraFieldUnicodePath: function() {
          var e2 = this.extraFields[28789];
          if (e2) {
            var t2 = n(e2.value);
            return 1 !== t2.readInt(1) ? null : a(this.fileName) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
          }
          return null;
        }, findExtraFieldUnicodeComment: function() {
          var e2 = this.extraFields[25461];
          if (e2) {
            var t2 = n(e2.value);
            return 1 !== t2.readInt(1) ? null : a(this.fileComment) !== t2.readInt(4) ? null : o.utf8decode(t2.readData(e2.length - 5));
          }
          return null;
        } }, t.exports = l;
      }, { "./compressedObject": 2, "./compressions": 3, "./crc32": 4, "./reader/readerFor": 22, "./support": 30, "./utf8": 31, "./utils": 32 }], 35: [function(e, t, r) {
        "use strict";
        function n(e2, t2, r2) {
          this.name = e2, this.dir = r2.dir, this.date = r2.date, this.comment = r2.comment, this.unixPermissions = r2.unixPermissions, this.dosPermissions = r2.dosPermissions, this._data = t2, this._dataBinary = r2.binary, this.options = { compression: r2.compression, compressionOptions: r2.compressionOptions };
        }
        var s = e("./stream/StreamHelper"), i = e("./stream/DataWorker"), a = e("./utf8"), o = e("./compressedObject"), h = e("./stream/GenericWorker");
        n.prototype = { internalStream: function(e2) {
          var t2 = null, r2 = "string";
          try {
            if (!e2) throw new Error("No output type specified.");
            var n2 = "string" === (r2 = e2.toLowerCase()) || "text" === r2;
            "binarystring" !== r2 && "text" !== r2 || (r2 = "string"), t2 = this._decompressWorker();
            var i2 = !this._dataBinary;
            i2 && !n2 && (t2 = t2.pipe(new a.Utf8EncodeWorker())), !i2 && n2 && (t2 = t2.pipe(new a.Utf8DecodeWorker()));
          } catch (e3) {
            (t2 = new h("error")).error(e3);
          }
          return new s(t2, r2, "");
        }, async: function(e2, t2) {
          return this.internalStream(e2).accumulate(t2);
        }, nodeStream: function(e2, t2) {
          return this.internalStream(e2 || "nodebuffer").toNodejsStream(t2);
        }, _compressWorker: function(e2, t2) {
          if (this._data instanceof o && this._data.compression.magic === e2.magic) return this._data.getCompressedWorker();
          var r2 = this._decompressWorker();
          return this._dataBinary || (r2 = r2.pipe(new a.Utf8EncodeWorker())), o.createWorkerFrom(r2, e2, t2);
        }, _decompressWorker: function() {
          return this._data instanceof o ? this._data.getContentWorker() : this._data instanceof h ? this._data : new i(this._data);
        } };
        for (var u = ["asText", "asBinary", "asNodeBuffer", "asUint8Array", "asArrayBuffer"], l = function() {
          throw new Error("This method has been removed in JSZip 3.0, please check the upgrade guide.");
        }, f = 0; f < u.length; f++) n.prototype[u[f]] = l;
        t.exports = n;
      }, { "./compressedObject": 2, "./stream/DataWorker": 27, "./stream/GenericWorker": 28, "./stream/StreamHelper": 29, "./utf8": 31 }], 36: [function(e, l, t) {
        (function(t2) {
          "use strict";
          var r, n, e2 = t2.MutationObserver || t2.WebKitMutationObserver;
          if (e2) {
            var i = 0, s = new e2(u), a = t2.document.createTextNode("");
            s.observe(a, { characterData: true }), r = function() {
              a.data = i = ++i % 2;
            };
          } else if (t2.setImmediate || void 0 === t2.MessageChannel) r = "document" in t2 && "onreadystatechange" in t2.document.createElement("script") ? function() {
            var e3 = t2.document.createElement("script");
            e3.onreadystatechange = function() {
              u(), e3.onreadystatechange = null, e3.parentNode.removeChild(e3), e3 = null;
            }, t2.document.documentElement.appendChild(e3);
          } : function() {
            setTimeout(u, 0);
          };
          else {
            var o = new t2.MessageChannel();
            o.port1.onmessage = u, r = function() {
              o.port2.postMessage(0);
            };
          }
          var h = [];
          function u() {
            var e3, t3;
            n = true;
            for (var r2 = h.length; r2; ) {
              for (t3 = h, h = [], e3 = -1; ++e3 < r2; ) t3[e3]();
              r2 = h.length;
            }
            n = false;
          }
          l.exports = function(e3) {
            1 !== h.push(e3) || n || r();
          };
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}], 37: [function(e, t, r) {
        "use strict";
        var i = e("immediate");
        function u() {
        }
        var l = {}, s = ["REJECTED"], a = ["FULFILLED"], n = ["PENDING"];
        function o(e2) {
          if ("function" != typeof e2) throw new TypeError("resolver must be a function");
          this.state = n, this.queue = [], this.outcome = void 0, e2 !== u && d(this, e2);
        }
        function h(e2, t2, r2) {
          this.promise = e2, "function" == typeof t2 && (this.onFulfilled = t2, this.callFulfilled = this.otherCallFulfilled), "function" == typeof r2 && (this.onRejected = r2, this.callRejected = this.otherCallRejected);
        }
        function f(t2, r2, n2) {
          i(function() {
            var e2;
            try {
              e2 = r2(n2);
            } catch (e3) {
              return l.reject(t2, e3);
            }
            e2 === t2 ? l.reject(t2, new TypeError("Cannot resolve promise with itself")) : l.resolve(t2, e2);
          });
        }
        function c(e2) {
          var t2 = e2 && e2.then;
          if (e2 && ("object" == typeof e2 || "function" == typeof e2) && "function" == typeof t2) return function() {
            t2.apply(e2, arguments);
          };
        }
        function d(t2, e2) {
          var r2 = false;
          function n2(e3) {
            r2 || (r2 = true, l.reject(t2, e3));
          }
          function i2(e3) {
            r2 || (r2 = true, l.resolve(t2, e3));
          }
          var s2 = p(function() {
            e2(i2, n2);
          });
          "error" === s2.status && n2(s2.value);
        }
        function p(e2, t2) {
          var r2 = {};
          try {
            r2.value = e2(t2), r2.status = "success";
          } catch (e3) {
            r2.status = "error", r2.value = e3;
          }
          return r2;
        }
        (t.exports = o).prototype.finally = function(t2) {
          if ("function" != typeof t2) return this;
          var r2 = this.constructor;
          return this.then(function(e2) {
            return r2.resolve(t2()).then(function() {
              return e2;
            });
          }, function(e2) {
            return r2.resolve(t2()).then(function() {
              throw e2;
            });
          });
        }, o.prototype.catch = function(e2) {
          return this.then(null, e2);
        }, o.prototype.then = function(e2, t2) {
          if ("function" != typeof e2 && this.state === a || "function" != typeof t2 && this.state === s) return this;
          var r2 = new this.constructor(u);
          this.state !== n ? f(r2, this.state === a ? e2 : t2, this.outcome) : this.queue.push(new h(r2, e2, t2));
          return r2;
        }, h.prototype.callFulfilled = function(e2) {
          l.resolve(this.promise, e2);
        }, h.prototype.otherCallFulfilled = function(e2) {
          f(this.promise, this.onFulfilled, e2);
        }, h.prototype.callRejected = function(e2) {
          l.reject(this.promise, e2);
        }, h.prototype.otherCallRejected = function(e2) {
          f(this.promise, this.onRejected, e2);
        }, l.resolve = function(e2, t2) {
          var r2 = p(c, t2);
          if ("error" === r2.status) return l.reject(e2, r2.value);
          var n2 = r2.value;
          if (n2) d(e2, n2);
          else {
            e2.state = a, e2.outcome = t2;
            for (var i2 = -1, s2 = e2.queue.length; ++i2 < s2; ) e2.queue[i2].callFulfilled(t2);
          }
          return e2;
        }, l.reject = function(e2, t2) {
          e2.state = s, e2.outcome = t2;
          for (var r2 = -1, n2 = e2.queue.length; ++r2 < n2; ) e2.queue[r2].callRejected(t2);
          return e2;
        }, o.resolve = function(e2) {
          if (e2 instanceof this) return e2;
          return l.resolve(new this(u), e2);
        }, o.reject = function(e2) {
          var t2 = new this(u);
          return l.reject(t2, e2);
        }, o.all = function(e2) {
          var r2 = this;
          if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
          var n2 = e2.length, i2 = false;
          if (!n2) return this.resolve([]);
          var s2 = new Array(n2), a2 = 0, t2 = -1, o2 = new this(u);
          for (; ++t2 < n2; ) h2(e2[t2], t2);
          return o2;
          function h2(e3, t3) {
            r2.resolve(e3).then(function(e4) {
              s2[t3] = e4, ++a2 !== n2 || i2 || (i2 = true, l.resolve(o2, s2));
            }, function(e4) {
              i2 || (i2 = true, l.reject(o2, e4));
            });
          }
        }, o.race = function(e2) {
          var t2 = this;
          if ("[object Array]" !== Object.prototype.toString.call(e2)) return this.reject(new TypeError("must be an array"));
          var r2 = e2.length, n2 = false;
          if (!r2) return this.resolve([]);
          var i2 = -1, s2 = new this(u);
          for (; ++i2 < r2; ) a2 = e2[i2], t2.resolve(a2).then(function(e3) {
            n2 || (n2 = true, l.resolve(s2, e3));
          }, function(e3) {
            n2 || (n2 = true, l.reject(s2, e3));
          });
          var a2;
          return s2;
        };
      }, { immediate: 36 }], 38: [function(e, t, r) {
        "use strict";
        var n = {};
        (0, e("./lib/utils/common").assign)(n, e("./lib/deflate"), e("./lib/inflate"), e("./lib/zlib/constants")), t.exports = n;
      }, { "./lib/deflate": 39, "./lib/inflate": 40, "./lib/utils/common": 41, "./lib/zlib/constants": 44 }], 39: [function(e, t, r) {
        "use strict";
        var a = e("./zlib/deflate"), o = e("./utils/common"), h = e("./utils/strings"), i = e("./zlib/messages"), s = e("./zlib/zstream"), u = Object.prototype.toString, l = 0, f = -1, c = 0, d = 8;
        function p(e2) {
          if (!(this instanceof p)) return new p(e2);
          this.options = o.assign({ level: f, method: d, chunkSize: 16384, windowBits: 15, memLevel: 8, strategy: c, to: "" }, e2 || {});
          var t2 = this.options;
          t2.raw && 0 < t2.windowBits ? t2.windowBits = -t2.windowBits : t2.gzip && 0 < t2.windowBits && t2.windowBits < 16 && (t2.windowBits += 16), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new s(), this.strm.avail_out = 0;
          var r2 = a.deflateInit2(this.strm, t2.level, t2.method, t2.windowBits, t2.memLevel, t2.strategy);
          if (r2 !== l) throw new Error(i[r2]);
          if (t2.header && a.deflateSetHeader(this.strm, t2.header), t2.dictionary) {
            var n2;
            if (n2 = "string" == typeof t2.dictionary ? h.string2buf(t2.dictionary) : "[object ArrayBuffer]" === u.call(t2.dictionary) ? new Uint8Array(t2.dictionary) : t2.dictionary, (r2 = a.deflateSetDictionary(this.strm, n2)) !== l) throw new Error(i[r2]);
            this._dict_set = true;
          }
        }
        function n(e2, t2) {
          var r2 = new p(t2);
          if (r2.push(e2, true), r2.err) throw r2.msg || i[r2.err];
          return r2.result;
        }
        p.prototype.push = function(e2, t2) {
          var r2, n2, i2 = this.strm, s2 = this.options.chunkSize;
          if (this.ended) return false;
          n2 = t2 === ~~t2 ? t2 : true === t2 ? 4 : 0, "string" == typeof e2 ? i2.input = h.string2buf(e2) : "[object ArrayBuffer]" === u.call(e2) ? i2.input = new Uint8Array(e2) : i2.input = e2, i2.next_in = 0, i2.avail_in = i2.input.length;
          do {
            if (0 === i2.avail_out && (i2.output = new o.Buf8(s2), i2.next_out = 0, i2.avail_out = s2), 1 !== (r2 = a.deflate(i2, n2)) && r2 !== l) return this.onEnd(r2), !(this.ended = true);
            0 !== i2.avail_out && (0 !== i2.avail_in || 4 !== n2 && 2 !== n2) || ("string" === this.options.to ? this.onData(h.buf2binstring(o.shrinkBuf(i2.output, i2.next_out))) : this.onData(o.shrinkBuf(i2.output, i2.next_out)));
          } while ((0 < i2.avail_in || 0 === i2.avail_out) && 1 !== r2);
          return 4 === n2 ? (r2 = a.deflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === l) : 2 !== n2 || (this.onEnd(l), !(i2.avail_out = 0));
        }, p.prototype.onData = function(e2) {
          this.chunks.push(e2);
        }, p.prototype.onEnd = function(e2) {
          e2 === l && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = o.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
        }, r.Deflate = p, r.deflate = n, r.deflateRaw = function(e2, t2) {
          return (t2 = t2 || {}).raw = true, n(e2, t2);
        }, r.gzip = function(e2, t2) {
          return (t2 = t2 || {}).gzip = true, n(e2, t2);
        };
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/deflate": 46, "./zlib/messages": 51, "./zlib/zstream": 53 }], 40: [function(e, t, r) {
        "use strict";
        var c = e("./zlib/inflate"), d = e("./utils/common"), p = e("./utils/strings"), m = e("./zlib/constants"), n = e("./zlib/messages"), i = e("./zlib/zstream"), s = e("./zlib/gzheader"), _ = Object.prototype.toString;
        function a(e2) {
          if (!(this instanceof a)) return new a(e2);
          this.options = d.assign({ chunkSize: 16384, windowBits: 0, to: "" }, e2 || {});
          var t2 = this.options;
          t2.raw && 0 <= t2.windowBits && t2.windowBits < 16 && (t2.windowBits = -t2.windowBits, 0 === t2.windowBits && (t2.windowBits = -15)), !(0 <= t2.windowBits && t2.windowBits < 16) || e2 && e2.windowBits || (t2.windowBits += 32), 15 < t2.windowBits && t2.windowBits < 48 && 0 == (15 & t2.windowBits) && (t2.windowBits |= 15), this.err = 0, this.msg = "", this.ended = false, this.chunks = [], this.strm = new i(), this.strm.avail_out = 0;
          var r2 = c.inflateInit2(this.strm, t2.windowBits);
          if (r2 !== m.Z_OK) throw new Error(n[r2]);
          this.header = new s(), c.inflateGetHeader(this.strm, this.header);
        }
        function o(e2, t2) {
          var r2 = new a(t2);
          if (r2.push(e2, true), r2.err) throw r2.msg || n[r2.err];
          return r2.result;
        }
        a.prototype.push = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h = this.strm, u = this.options.chunkSize, l = this.options.dictionary, f = false;
          if (this.ended) return false;
          n2 = t2 === ~~t2 ? t2 : true === t2 ? m.Z_FINISH : m.Z_NO_FLUSH, "string" == typeof e2 ? h.input = p.binstring2buf(e2) : "[object ArrayBuffer]" === _.call(e2) ? h.input = new Uint8Array(e2) : h.input = e2, h.next_in = 0, h.avail_in = h.input.length;
          do {
            if (0 === h.avail_out && (h.output = new d.Buf8(u), h.next_out = 0, h.avail_out = u), (r2 = c.inflate(h, m.Z_NO_FLUSH)) === m.Z_NEED_DICT && l && (o2 = "string" == typeof l ? p.string2buf(l) : "[object ArrayBuffer]" === _.call(l) ? new Uint8Array(l) : l, r2 = c.inflateSetDictionary(this.strm, o2)), r2 === m.Z_BUF_ERROR && true === f && (r2 = m.Z_OK, f = false), r2 !== m.Z_STREAM_END && r2 !== m.Z_OK) return this.onEnd(r2), !(this.ended = true);
            h.next_out && (0 !== h.avail_out && r2 !== m.Z_STREAM_END && (0 !== h.avail_in || n2 !== m.Z_FINISH && n2 !== m.Z_SYNC_FLUSH) || ("string" === this.options.to ? (i2 = p.utf8border(h.output, h.next_out), s2 = h.next_out - i2, a2 = p.buf2string(h.output, i2), h.next_out = s2, h.avail_out = u - s2, s2 && d.arraySet(h.output, h.output, i2, s2, 0), this.onData(a2)) : this.onData(d.shrinkBuf(h.output, h.next_out)))), 0 === h.avail_in && 0 === h.avail_out && (f = true);
          } while ((0 < h.avail_in || 0 === h.avail_out) && r2 !== m.Z_STREAM_END);
          return r2 === m.Z_STREAM_END && (n2 = m.Z_FINISH), n2 === m.Z_FINISH ? (r2 = c.inflateEnd(this.strm), this.onEnd(r2), this.ended = true, r2 === m.Z_OK) : n2 !== m.Z_SYNC_FLUSH || (this.onEnd(m.Z_OK), !(h.avail_out = 0));
        }, a.prototype.onData = function(e2) {
          this.chunks.push(e2);
        }, a.prototype.onEnd = function(e2) {
          e2 === m.Z_OK && ("string" === this.options.to ? this.result = this.chunks.join("") : this.result = d.flattenChunks(this.chunks)), this.chunks = [], this.err = e2, this.msg = this.strm.msg;
        }, r.Inflate = a, r.inflate = o, r.inflateRaw = function(e2, t2) {
          return (t2 = t2 || {}).raw = true, o(e2, t2);
        }, r.ungzip = o;
      }, { "./utils/common": 41, "./utils/strings": 42, "./zlib/constants": 44, "./zlib/gzheader": 47, "./zlib/inflate": 49, "./zlib/messages": 51, "./zlib/zstream": 53 }], 41: [function(e, t, r) {
        "use strict";
        var n = "undefined" != typeof Uint8Array && "undefined" != typeof Uint16Array && "undefined" != typeof Int32Array;
        r.assign = function(e2) {
          for (var t2 = Array.prototype.slice.call(arguments, 1); t2.length; ) {
            var r2 = t2.shift();
            if (r2) {
              if ("object" != typeof r2) throw new TypeError(r2 + "must be non-object");
              for (var n2 in r2) r2.hasOwnProperty(n2) && (e2[n2] = r2[n2]);
            }
          }
          return e2;
        }, r.shrinkBuf = function(e2, t2) {
          return e2.length === t2 ? e2 : e2.subarray ? e2.subarray(0, t2) : (e2.length = t2, e2);
        };
        var i = { arraySet: function(e2, t2, r2, n2, i2) {
          if (t2.subarray && e2.subarray) e2.set(t2.subarray(r2, r2 + n2), i2);
          else for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
        }, flattenChunks: function(e2) {
          var t2, r2, n2, i2, s2, a;
          for (t2 = n2 = 0, r2 = e2.length; t2 < r2; t2++) n2 += e2[t2].length;
          for (a = new Uint8Array(n2), t2 = i2 = 0, r2 = e2.length; t2 < r2; t2++) s2 = e2[t2], a.set(s2, i2), i2 += s2.length;
          return a;
        } }, s = { arraySet: function(e2, t2, r2, n2, i2) {
          for (var s2 = 0; s2 < n2; s2++) e2[i2 + s2] = t2[r2 + s2];
        }, flattenChunks: function(e2) {
          return [].concat.apply([], e2);
        } };
        r.setTyped = function(e2) {
          e2 ? (r.Buf8 = Uint8Array, r.Buf16 = Uint16Array, r.Buf32 = Int32Array, r.assign(r, i)) : (r.Buf8 = Array, r.Buf16 = Array, r.Buf32 = Array, r.assign(r, s));
        }, r.setTyped(n);
      }, {}], 42: [function(e, t, r) {
        "use strict";
        var h = e("./common"), i = true, s = true;
        try {
          String.fromCharCode.apply(null, [0]);
        } catch (e2) {
          i = false;
        }
        try {
          String.fromCharCode.apply(null, new Uint8Array(1));
        } catch (e2) {
          s = false;
        }
        for (var u = new h.Buf8(256), n = 0; n < 256; n++) u[n] = 252 <= n ? 6 : 248 <= n ? 5 : 240 <= n ? 4 : 224 <= n ? 3 : 192 <= n ? 2 : 1;
        function l(e2, t2) {
          if (t2 < 65537 && (e2.subarray && s || !e2.subarray && i)) return String.fromCharCode.apply(null, h.shrinkBuf(e2, t2));
          for (var r2 = "", n2 = 0; n2 < t2; n2++) r2 += String.fromCharCode(e2[n2]);
          return r2;
        }
        u[254] = u[254] = 1, r.string2buf = function(e2) {
          var t2, r2, n2, i2, s2, a = e2.length, o = 0;
          for (i2 = 0; i2 < a; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), o += r2 < 128 ? 1 : r2 < 2048 ? 2 : r2 < 65536 ? 3 : 4;
          for (t2 = new h.Buf8(o), i2 = s2 = 0; s2 < o; i2++) 55296 == (64512 & (r2 = e2.charCodeAt(i2))) && i2 + 1 < a && 56320 == (64512 & (n2 = e2.charCodeAt(i2 + 1))) && (r2 = 65536 + (r2 - 55296 << 10) + (n2 - 56320), i2++), r2 < 128 ? t2[s2++] = r2 : (r2 < 2048 ? t2[s2++] = 192 | r2 >>> 6 : (r2 < 65536 ? t2[s2++] = 224 | r2 >>> 12 : (t2[s2++] = 240 | r2 >>> 18, t2[s2++] = 128 | r2 >>> 12 & 63), t2[s2++] = 128 | r2 >>> 6 & 63), t2[s2++] = 128 | 63 & r2);
          return t2;
        }, r.buf2binstring = function(e2) {
          return l(e2, e2.length);
        }, r.binstring2buf = function(e2) {
          for (var t2 = new h.Buf8(e2.length), r2 = 0, n2 = t2.length; r2 < n2; r2++) t2[r2] = e2.charCodeAt(r2);
          return t2;
        }, r.buf2string = function(e2, t2) {
          var r2, n2, i2, s2, a = t2 || e2.length, o = new Array(2 * a);
          for (r2 = n2 = 0; r2 < a; ) if ((i2 = e2[r2++]) < 128) o[n2++] = i2;
          else if (4 < (s2 = u[i2])) o[n2++] = 65533, r2 += s2 - 1;
          else {
            for (i2 &= 2 === s2 ? 31 : 3 === s2 ? 15 : 7; 1 < s2 && r2 < a; ) i2 = i2 << 6 | 63 & e2[r2++], s2--;
            1 < s2 ? o[n2++] = 65533 : i2 < 65536 ? o[n2++] = i2 : (i2 -= 65536, o[n2++] = 55296 | i2 >> 10 & 1023, o[n2++] = 56320 | 1023 & i2);
          }
          return l(o, n2);
        }, r.utf8border = function(e2, t2) {
          var r2;
          for ((t2 = t2 || e2.length) > e2.length && (t2 = e2.length), r2 = t2 - 1; 0 <= r2 && 128 == (192 & e2[r2]); ) r2--;
          return r2 < 0 ? t2 : 0 === r2 ? t2 : r2 + u[e2[r2]] > t2 ? r2 : t2;
        };
      }, { "./common": 41 }], 43: [function(e, t, r) {
        "use strict";
        t.exports = function(e2, t2, r2, n) {
          for (var i = 65535 & e2 | 0, s = e2 >>> 16 & 65535 | 0, a = 0; 0 !== r2; ) {
            for (r2 -= a = 2e3 < r2 ? 2e3 : r2; s = s + (i = i + t2[n++] | 0) | 0, --a; ) ;
            i %= 65521, s %= 65521;
          }
          return i | s << 16 | 0;
        };
      }, {}], 44: [function(e, t, r) {
        "use strict";
        t.exports = { Z_NO_FLUSH: 0, Z_PARTIAL_FLUSH: 1, Z_SYNC_FLUSH: 2, Z_FULL_FLUSH: 3, Z_FINISH: 4, Z_BLOCK: 5, Z_TREES: 6, Z_OK: 0, Z_STREAM_END: 1, Z_NEED_DICT: 2, Z_ERRNO: -1, Z_STREAM_ERROR: -2, Z_DATA_ERROR: -3, Z_BUF_ERROR: -5, Z_NO_COMPRESSION: 0, Z_BEST_SPEED: 1, Z_BEST_COMPRESSION: 9, Z_DEFAULT_COMPRESSION: -1, Z_FILTERED: 1, Z_HUFFMAN_ONLY: 2, Z_RLE: 3, Z_FIXED: 4, Z_DEFAULT_STRATEGY: 0, Z_BINARY: 0, Z_TEXT: 1, Z_UNKNOWN: 2, Z_DEFLATED: 8 };
      }, {}], 45: [function(e, t, r) {
        "use strict";
        var o = (function() {
          for (var e2, t2 = [], r2 = 0; r2 < 256; r2++) {
            e2 = r2;
            for (var n = 0; n < 8; n++) e2 = 1 & e2 ? 3988292384 ^ e2 >>> 1 : e2 >>> 1;
            t2[r2] = e2;
          }
          return t2;
        })();
        t.exports = function(e2, t2, r2, n) {
          var i = o, s = n + r2;
          e2 ^= -1;
          for (var a = n; a < s; a++) e2 = e2 >>> 8 ^ i[255 & (e2 ^ t2[a])];
          return -1 ^ e2;
        };
      }, {}], 46: [function(e, t, r) {
        "use strict";
        var h, c = e("../utils/common"), u = e("./trees"), d = e("./adler32"), p = e("./crc32"), n = e("./messages"), l = 0, f = 4, m = 0, _ = -2, g = -1, b = 4, i = 2, v = 8, y = 9, s = 286, a = 30, o = 19, w = 2 * s + 1, k = 15, x = 3, S = 258, z = S + x + 1, C = 42, E = 113, A = 1, I = 2, O = 3, B = 4;
        function R(e2, t2) {
          return e2.msg = n[t2], t2;
        }
        function T(e2) {
          return (e2 << 1) - (4 < e2 ? 9 : 0);
        }
        function D(e2) {
          for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
        }
        function F(e2) {
          var t2 = e2.state, r2 = t2.pending;
          r2 > e2.avail_out && (r2 = e2.avail_out), 0 !== r2 && (c.arraySet(e2.output, t2.pending_buf, t2.pending_out, r2, e2.next_out), e2.next_out += r2, t2.pending_out += r2, e2.total_out += r2, e2.avail_out -= r2, t2.pending -= r2, 0 === t2.pending && (t2.pending_out = 0));
        }
        function N(e2, t2) {
          u._tr_flush_block(e2, 0 <= e2.block_start ? e2.block_start : -1, e2.strstart - e2.block_start, t2), e2.block_start = e2.strstart, F(e2.strm);
        }
        function U(e2, t2) {
          e2.pending_buf[e2.pending++] = t2;
        }
        function P(e2, t2) {
          e2.pending_buf[e2.pending++] = t2 >>> 8 & 255, e2.pending_buf[e2.pending++] = 255 & t2;
        }
        function L(e2, t2) {
          var r2, n2, i2 = e2.max_chain_length, s2 = e2.strstart, a2 = e2.prev_length, o2 = e2.nice_match, h2 = e2.strstart > e2.w_size - z ? e2.strstart - (e2.w_size - z) : 0, u2 = e2.window, l2 = e2.w_mask, f2 = e2.prev, c2 = e2.strstart + S, d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
          e2.prev_length >= e2.good_match && (i2 >>= 2), o2 > e2.lookahead && (o2 = e2.lookahead);
          do {
            if (u2[(r2 = t2) + a2] === p2 && u2[r2 + a2 - 1] === d2 && u2[r2] === u2[s2] && u2[++r2] === u2[s2 + 1]) {
              s2 += 2, r2++;
              do {
              } while (u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && u2[++s2] === u2[++r2] && s2 < c2);
              if (n2 = S - (c2 - s2), s2 = c2 - S, a2 < n2) {
                if (e2.match_start = t2, o2 <= (a2 = n2)) break;
                d2 = u2[s2 + a2 - 1], p2 = u2[s2 + a2];
              }
            }
          } while ((t2 = f2[t2 & l2]) > h2 && 0 != --i2);
          return a2 <= e2.lookahead ? a2 : e2.lookahead;
        }
        function j(e2) {
          var t2, r2, n2, i2, s2, a2, o2, h2, u2, l2, f2 = e2.w_size;
          do {
            if (i2 = e2.window_size - e2.lookahead - e2.strstart, e2.strstart >= f2 + (f2 - z)) {
              for (c.arraySet(e2.window, e2.window, f2, f2, 0), e2.match_start -= f2, e2.strstart -= f2, e2.block_start -= f2, t2 = r2 = e2.hash_size; n2 = e2.head[--t2], e2.head[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
              for (t2 = r2 = f2; n2 = e2.prev[--t2], e2.prev[t2] = f2 <= n2 ? n2 - f2 : 0, --r2; ) ;
              i2 += f2;
            }
            if (0 === e2.strm.avail_in) break;
            if (a2 = e2.strm, o2 = e2.window, h2 = e2.strstart + e2.lookahead, u2 = i2, l2 = void 0, l2 = a2.avail_in, u2 < l2 && (l2 = u2), r2 = 0 === l2 ? 0 : (a2.avail_in -= l2, c.arraySet(o2, a2.input, a2.next_in, l2, h2), 1 === a2.state.wrap ? a2.adler = d(a2.adler, o2, l2, h2) : 2 === a2.state.wrap && (a2.adler = p(a2.adler, o2, l2, h2)), a2.next_in += l2, a2.total_in += l2, l2), e2.lookahead += r2, e2.lookahead + e2.insert >= x) for (s2 = e2.strstart - e2.insert, e2.ins_h = e2.window[s2], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + 1]) & e2.hash_mask; e2.insert && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[s2 + x - 1]) & e2.hash_mask, e2.prev[s2 & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = s2, s2++, e2.insert--, !(e2.lookahead + e2.insert < x)); ) ;
          } while (e2.lookahead < z && 0 !== e2.strm.avail_in);
        }
        function Z(e2, t2) {
          for (var r2, n2; ; ) {
            if (e2.lookahead < z) {
              if (j(e2), e2.lookahead < z && t2 === l) return A;
              if (0 === e2.lookahead) break;
            }
            if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 !== r2 && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2)), e2.match_length >= x) if (n2 = u._tr_tally(e2, e2.strstart - e2.match_start, e2.match_length - x), e2.lookahead -= e2.match_length, e2.match_length <= e2.max_lazy_match && e2.lookahead >= x) {
              for (e2.match_length--; e2.strstart++, e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart, 0 != --e2.match_length; ) ;
              e2.strstart++;
            } else e2.strstart += e2.match_length, e2.match_length = 0, e2.ins_h = e2.window[e2.strstart], e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + 1]) & e2.hash_mask;
            else n2 = u._tr_tally(e2, 0, e2.window[e2.strstart]), e2.lookahead--, e2.strstart++;
            if (n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
          }
          return e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
        }
        function W(e2, t2) {
          for (var r2, n2, i2; ; ) {
            if (e2.lookahead < z) {
              if (j(e2), e2.lookahead < z && t2 === l) return A;
              if (0 === e2.lookahead) break;
            }
            if (r2 = 0, e2.lookahead >= x && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), e2.prev_length = e2.match_length, e2.prev_match = e2.match_start, e2.match_length = x - 1, 0 !== r2 && e2.prev_length < e2.max_lazy_match && e2.strstart - r2 <= e2.w_size - z && (e2.match_length = L(e2, r2), e2.match_length <= 5 && (1 === e2.strategy || e2.match_length === x && 4096 < e2.strstart - e2.match_start) && (e2.match_length = x - 1)), e2.prev_length >= x && e2.match_length <= e2.prev_length) {
              for (i2 = e2.strstart + e2.lookahead - x, n2 = u._tr_tally(e2, e2.strstart - 1 - e2.prev_match, e2.prev_length - x), e2.lookahead -= e2.prev_length - 1, e2.prev_length -= 2; ++e2.strstart <= i2 && (e2.ins_h = (e2.ins_h << e2.hash_shift ^ e2.window[e2.strstart + x - 1]) & e2.hash_mask, r2 = e2.prev[e2.strstart & e2.w_mask] = e2.head[e2.ins_h], e2.head[e2.ins_h] = e2.strstart), 0 != --e2.prev_length; ) ;
              if (e2.match_available = 0, e2.match_length = x - 1, e2.strstart++, n2 && (N(e2, false), 0 === e2.strm.avail_out)) return A;
            } else if (e2.match_available) {
              if ((n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1])) && N(e2, false), e2.strstart++, e2.lookahead--, 0 === e2.strm.avail_out) return A;
            } else e2.match_available = 1, e2.strstart++, e2.lookahead--;
          }
          return e2.match_available && (n2 = u._tr_tally(e2, 0, e2.window[e2.strstart - 1]), e2.match_available = 0), e2.insert = e2.strstart < x - 1 ? e2.strstart : x - 1, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : e2.last_lit && (N(e2, false), 0 === e2.strm.avail_out) ? A : I;
        }
        function M(e2, t2, r2, n2, i2) {
          this.good_length = e2, this.max_lazy = t2, this.nice_length = r2, this.max_chain = n2, this.func = i2;
        }
        function H() {
          this.strm = null, this.status = 0, this.pending_buf = null, this.pending_buf_size = 0, this.pending_out = 0, this.pending = 0, this.wrap = 0, this.gzhead = null, this.gzindex = 0, this.method = v, this.last_flush = -1, this.w_size = 0, this.w_bits = 0, this.w_mask = 0, this.window = null, this.window_size = 0, this.prev = null, this.head = null, this.ins_h = 0, this.hash_size = 0, this.hash_bits = 0, this.hash_mask = 0, this.hash_shift = 0, this.block_start = 0, this.match_length = 0, this.prev_match = 0, this.match_available = 0, this.strstart = 0, this.match_start = 0, this.lookahead = 0, this.prev_length = 0, this.max_chain_length = 0, this.max_lazy_match = 0, this.level = 0, this.strategy = 0, this.good_match = 0, this.nice_match = 0, this.dyn_ltree = new c.Buf16(2 * w), this.dyn_dtree = new c.Buf16(2 * (2 * a + 1)), this.bl_tree = new c.Buf16(2 * (2 * o + 1)), D(this.dyn_ltree), D(this.dyn_dtree), D(this.bl_tree), this.l_desc = null, this.d_desc = null, this.bl_desc = null, this.bl_count = new c.Buf16(k + 1), this.heap = new c.Buf16(2 * s + 1), D(this.heap), this.heap_len = 0, this.heap_max = 0, this.depth = new c.Buf16(2 * s + 1), D(this.depth), this.l_buf = 0, this.lit_bufsize = 0, this.last_lit = 0, this.d_buf = 0, this.opt_len = 0, this.static_len = 0, this.matches = 0, this.insert = 0, this.bi_buf = 0, this.bi_valid = 0;
        }
        function G(e2) {
          var t2;
          return e2 && e2.state ? (e2.total_in = e2.total_out = 0, e2.data_type = i, (t2 = e2.state).pending = 0, t2.pending_out = 0, t2.wrap < 0 && (t2.wrap = -t2.wrap), t2.status = t2.wrap ? C : E, e2.adler = 2 === t2.wrap ? 0 : 1, t2.last_flush = l, u._tr_init(t2), m) : R(e2, _);
        }
        function K(e2) {
          var t2 = G(e2);
          return t2 === m && (function(e3) {
            e3.window_size = 2 * e3.w_size, D(e3.head), e3.max_lazy_match = h[e3.level].max_lazy, e3.good_match = h[e3.level].good_length, e3.nice_match = h[e3.level].nice_length, e3.max_chain_length = h[e3.level].max_chain, e3.strstart = 0, e3.block_start = 0, e3.lookahead = 0, e3.insert = 0, e3.match_length = e3.prev_length = x - 1, e3.match_available = 0, e3.ins_h = 0;
          })(e2.state), t2;
        }
        function Y(e2, t2, r2, n2, i2, s2) {
          if (!e2) return _;
          var a2 = 1;
          if (t2 === g && (t2 = 6), n2 < 0 ? (a2 = 0, n2 = -n2) : 15 < n2 && (a2 = 2, n2 -= 16), i2 < 1 || y < i2 || r2 !== v || n2 < 8 || 15 < n2 || t2 < 0 || 9 < t2 || s2 < 0 || b < s2) return R(e2, _);
          8 === n2 && (n2 = 9);
          var o2 = new H();
          return (e2.state = o2).strm = e2, o2.wrap = a2, o2.gzhead = null, o2.w_bits = n2, o2.w_size = 1 << o2.w_bits, o2.w_mask = o2.w_size - 1, o2.hash_bits = i2 + 7, o2.hash_size = 1 << o2.hash_bits, o2.hash_mask = o2.hash_size - 1, o2.hash_shift = ~~((o2.hash_bits + x - 1) / x), o2.window = new c.Buf8(2 * o2.w_size), o2.head = new c.Buf16(o2.hash_size), o2.prev = new c.Buf16(o2.w_size), o2.lit_bufsize = 1 << i2 + 6, o2.pending_buf_size = 4 * o2.lit_bufsize, o2.pending_buf = new c.Buf8(o2.pending_buf_size), o2.d_buf = 1 * o2.lit_bufsize, o2.l_buf = 3 * o2.lit_bufsize, o2.level = t2, o2.strategy = s2, o2.method = r2, K(e2);
        }
        h = [new M(0, 0, 0, 0, function(e2, t2) {
          var r2 = 65535;
          for (r2 > e2.pending_buf_size - 5 && (r2 = e2.pending_buf_size - 5); ; ) {
            if (e2.lookahead <= 1) {
              if (j(e2), 0 === e2.lookahead && t2 === l) return A;
              if (0 === e2.lookahead) break;
            }
            e2.strstart += e2.lookahead, e2.lookahead = 0;
            var n2 = e2.block_start + r2;
            if ((0 === e2.strstart || e2.strstart >= n2) && (e2.lookahead = e2.strstart - n2, e2.strstart = n2, N(e2, false), 0 === e2.strm.avail_out)) return A;
            if (e2.strstart - e2.block_start >= e2.w_size - z && (N(e2, false), 0 === e2.strm.avail_out)) return A;
          }
          return e2.insert = 0, t2 === f ? (N(e2, true), 0 === e2.strm.avail_out ? O : B) : (e2.strstart > e2.block_start && (N(e2, false), e2.strm.avail_out), A);
        }), new M(4, 4, 8, 4, Z), new M(4, 5, 16, 8, Z), new M(4, 6, 32, 32, Z), new M(4, 4, 16, 16, W), new M(8, 16, 32, 32, W), new M(8, 16, 128, 128, W), new M(8, 32, 128, 256, W), new M(32, 128, 258, 1024, W), new M(32, 258, 258, 4096, W)], r.deflateInit = function(e2, t2) {
          return Y(e2, t2, v, 15, 8, 0);
        }, r.deflateInit2 = Y, r.deflateReset = K, r.deflateResetKeep = G, r.deflateSetHeader = function(e2, t2) {
          return e2 && e2.state ? 2 !== e2.state.wrap ? _ : (e2.state.gzhead = t2, m) : _;
        }, r.deflate = function(e2, t2) {
          var r2, n2, i2, s2;
          if (!e2 || !e2.state || 5 < t2 || t2 < 0) return e2 ? R(e2, _) : _;
          if (n2 = e2.state, !e2.output || !e2.input && 0 !== e2.avail_in || 666 === n2.status && t2 !== f) return R(e2, 0 === e2.avail_out ? -5 : _);
          if (n2.strm = e2, r2 = n2.last_flush, n2.last_flush = t2, n2.status === C) if (2 === n2.wrap) e2.adler = 0, U(n2, 31), U(n2, 139), U(n2, 8), n2.gzhead ? (U(n2, (n2.gzhead.text ? 1 : 0) + (n2.gzhead.hcrc ? 2 : 0) + (n2.gzhead.extra ? 4 : 0) + (n2.gzhead.name ? 8 : 0) + (n2.gzhead.comment ? 16 : 0)), U(n2, 255 & n2.gzhead.time), U(n2, n2.gzhead.time >> 8 & 255), U(n2, n2.gzhead.time >> 16 & 255), U(n2, n2.gzhead.time >> 24 & 255), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 255 & n2.gzhead.os), n2.gzhead.extra && n2.gzhead.extra.length && (U(n2, 255 & n2.gzhead.extra.length), U(n2, n2.gzhead.extra.length >> 8 & 255)), n2.gzhead.hcrc && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending, 0)), n2.gzindex = 0, n2.status = 69) : (U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 0), U(n2, 9 === n2.level ? 2 : 2 <= n2.strategy || n2.level < 2 ? 4 : 0), U(n2, 3), n2.status = E);
          else {
            var a2 = v + (n2.w_bits - 8 << 4) << 8;
            a2 |= (2 <= n2.strategy || n2.level < 2 ? 0 : n2.level < 6 ? 1 : 6 === n2.level ? 2 : 3) << 6, 0 !== n2.strstart && (a2 |= 32), a2 += 31 - a2 % 31, n2.status = E, P(n2, a2), 0 !== n2.strstart && (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), e2.adler = 1;
          }
          if (69 === n2.status) if (n2.gzhead.extra) {
            for (i2 = n2.pending; n2.gzindex < (65535 & n2.gzhead.extra.length) && (n2.pending !== n2.pending_buf_size || (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending !== n2.pending_buf_size)); ) U(n2, 255 & n2.gzhead.extra[n2.gzindex]), n2.gzindex++;
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), n2.gzindex === n2.gzhead.extra.length && (n2.gzindex = 0, n2.status = 73);
          } else n2.status = 73;
          if (73 === n2.status) if (n2.gzhead.name) {
            i2 = n2.pending;
            do {
              if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                s2 = 1;
                break;
              }
              s2 = n2.gzindex < n2.gzhead.name.length ? 255 & n2.gzhead.name.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
            } while (0 !== s2);
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.gzindex = 0, n2.status = 91);
          } else n2.status = 91;
          if (91 === n2.status) if (n2.gzhead.comment) {
            i2 = n2.pending;
            do {
              if (n2.pending === n2.pending_buf_size && (n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), F(e2), i2 = n2.pending, n2.pending === n2.pending_buf_size)) {
                s2 = 1;
                break;
              }
              s2 = n2.gzindex < n2.gzhead.comment.length ? 255 & n2.gzhead.comment.charCodeAt(n2.gzindex++) : 0, U(n2, s2);
            } while (0 !== s2);
            n2.gzhead.hcrc && n2.pending > i2 && (e2.adler = p(e2.adler, n2.pending_buf, n2.pending - i2, i2)), 0 === s2 && (n2.status = 103);
          } else n2.status = 103;
          if (103 === n2.status && (n2.gzhead.hcrc ? (n2.pending + 2 > n2.pending_buf_size && F(e2), n2.pending + 2 <= n2.pending_buf_size && (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), e2.adler = 0, n2.status = E)) : n2.status = E), 0 !== n2.pending) {
            if (F(e2), 0 === e2.avail_out) return n2.last_flush = -1, m;
          } else if (0 === e2.avail_in && T(t2) <= T(r2) && t2 !== f) return R(e2, -5);
          if (666 === n2.status && 0 !== e2.avail_in) return R(e2, -5);
          if (0 !== e2.avail_in || 0 !== n2.lookahead || t2 !== l && 666 !== n2.status) {
            var o2 = 2 === n2.strategy ? (function(e3, t3) {
              for (var r3; ; ) {
                if (0 === e3.lookahead && (j(e3), 0 === e3.lookahead)) {
                  if (t3 === l) return A;
                  break;
                }
                if (e3.match_length = 0, r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++, r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
              }
              return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
            })(n2, t2) : 3 === n2.strategy ? (function(e3, t3) {
              for (var r3, n3, i3, s3, a3 = e3.window; ; ) {
                if (e3.lookahead <= S) {
                  if (j(e3), e3.lookahead <= S && t3 === l) return A;
                  if (0 === e3.lookahead) break;
                }
                if (e3.match_length = 0, e3.lookahead >= x && 0 < e3.strstart && (n3 = a3[i3 = e3.strstart - 1]) === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3]) {
                  s3 = e3.strstart + S;
                  do {
                  } while (n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && n3 === a3[++i3] && i3 < s3);
                  e3.match_length = S - (s3 - i3), e3.match_length > e3.lookahead && (e3.match_length = e3.lookahead);
                }
                if (e3.match_length >= x ? (r3 = u._tr_tally(e3, 1, e3.match_length - x), e3.lookahead -= e3.match_length, e3.strstart += e3.match_length, e3.match_length = 0) : (r3 = u._tr_tally(e3, 0, e3.window[e3.strstart]), e3.lookahead--, e3.strstart++), r3 && (N(e3, false), 0 === e3.strm.avail_out)) return A;
              }
              return e3.insert = 0, t3 === f ? (N(e3, true), 0 === e3.strm.avail_out ? O : B) : e3.last_lit && (N(e3, false), 0 === e3.strm.avail_out) ? A : I;
            })(n2, t2) : h[n2.level].func(n2, t2);
            if (o2 !== O && o2 !== B || (n2.status = 666), o2 === A || o2 === O) return 0 === e2.avail_out && (n2.last_flush = -1), m;
            if (o2 === I && (1 === t2 ? u._tr_align(n2) : 5 !== t2 && (u._tr_stored_block(n2, 0, 0, false), 3 === t2 && (D(n2.head), 0 === n2.lookahead && (n2.strstart = 0, n2.block_start = 0, n2.insert = 0))), F(e2), 0 === e2.avail_out)) return n2.last_flush = -1, m;
          }
          return t2 !== f ? m : n2.wrap <= 0 ? 1 : (2 === n2.wrap ? (U(n2, 255 & e2.adler), U(n2, e2.adler >> 8 & 255), U(n2, e2.adler >> 16 & 255), U(n2, e2.adler >> 24 & 255), U(n2, 255 & e2.total_in), U(n2, e2.total_in >> 8 & 255), U(n2, e2.total_in >> 16 & 255), U(n2, e2.total_in >> 24 & 255)) : (P(n2, e2.adler >>> 16), P(n2, 65535 & e2.adler)), F(e2), 0 < n2.wrap && (n2.wrap = -n2.wrap), 0 !== n2.pending ? m : 1);
        }, r.deflateEnd = function(e2) {
          var t2;
          return e2 && e2.state ? (t2 = e2.state.status) !== C && 69 !== t2 && 73 !== t2 && 91 !== t2 && 103 !== t2 && t2 !== E && 666 !== t2 ? R(e2, _) : (e2.state = null, t2 === E ? R(e2, -3) : m) : _;
        }, r.deflateSetDictionary = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h2, u2, l2 = t2.length;
          if (!e2 || !e2.state) return _;
          if (2 === (s2 = (r2 = e2.state).wrap) || 1 === s2 && r2.status !== C || r2.lookahead) return _;
          for (1 === s2 && (e2.adler = d(e2.adler, t2, l2, 0)), r2.wrap = 0, l2 >= r2.w_size && (0 === s2 && (D(r2.head), r2.strstart = 0, r2.block_start = 0, r2.insert = 0), u2 = new c.Buf8(r2.w_size), c.arraySet(u2, t2, l2 - r2.w_size, r2.w_size, 0), t2 = u2, l2 = r2.w_size), a2 = e2.avail_in, o2 = e2.next_in, h2 = e2.input, e2.avail_in = l2, e2.next_in = 0, e2.input = t2, j(r2); r2.lookahead >= x; ) {
            for (n2 = r2.strstart, i2 = r2.lookahead - (x - 1); r2.ins_h = (r2.ins_h << r2.hash_shift ^ r2.window[n2 + x - 1]) & r2.hash_mask, r2.prev[n2 & r2.w_mask] = r2.head[r2.ins_h], r2.head[r2.ins_h] = n2, n2++, --i2; ) ;
            r2.strstart = n2, r2.lookahead = x - 1, j(r2);
          }
          return r2.strstart += r2.lookahead, r2.block_start = r2.strstart, r2.insert = r2.lookahead, r2.lookahead = 0, r2.match_length = r2.prev_length = x - 1, r2.match_available = 0, e2.next_in = o2, e2.input = h2, e2.avail_in = a2, r2.wrap = s2, m;
        }, r.deflateInfo = "pako deflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./messages": 51, "./trees": 52 }], 47: [function(e, t, r) {
        "use strict";
        t.exports = function() {
          this.text = 0, this.time = 0, this.xflags = 0, this.os = 0, this.extra = null, this.extra_len = 0, this.name = "", this.comment = "", this.hcrc = 0, this.done = false;
        };
      }, {}], 48: [function(e, t, r) {
        "use strict";
        t.exports = function(e2, t2) {
          var r2, n, i, s, a, o, h, u, l, f, c, d, p, m, _, g, b, v, y, w, k, x, S, z, C;
          r2 = e2.state, n = e2.next_in, z = e2.input, i = n + (e2.avail_in - 5), s = e2.next_out, C = e2.output, a = s - (t2 - e2.avail_out), o = s + (e2.avail_out - 257), h = r2.dmax, u = r2.wsize, l = r2.whave, f = r2.wnext, c = r2.window, d = r2.hold, p = r2.bits, m = r2.lencode, _ = r2.distcode, g = (1 << r2.lenbits) - 1, b = (1 << r2.distbits) - 1;
          e: do {
            p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = m[d & g];
            t: for (; ; ) {
              if (d >>>= y = v >>> 24, p -= y, 0 === (y = v >>> 16 & 255)) C[s++] = 65535 & v;
              else {
                if (!(16 & y)) {
                  if (0 == (64 & y)) {
                    v = m[(65535 & v) + (d & (1 << y) - 1)];
                    continue t;
                  }
                  if (32 & y) {
                    r2.mode = 12;
                    break e;
                  }
                  e2.msg = "invalid literal/length code", r2.mode = 30;
                  break e;
                }
                w = 65535 & v, (y &= 15) && (p < y && (d += z[n++] << p, p += 8), w += d & (1 << y) - 1, d >>>= y, p -= y), p < 15 && (d += z[n++] << p, p += 8, d += z[n++] << p, p += 8), v = _[d & b];
                r: for (; ; ) {
                  if (d >>>= y = v >>> 24, p -= y, !(16 & (y = v >>> 16 & 255))) {
                    if (0 == (64 & y)) {
                      v = _[(65535 & v) + (d & (1 << y) - 1)];
                      continue r;
                    }
                    e2.msg = "invalid distance code", r2.mode = 30;
                    break e;
                  }
                  if (k = 65535 & v, p < (y &= 15) && (d += z[n++] << p, (p += 8) < y && (d += z[n++] << p, p += 8)), h < (k += d & (1 << y) - 1)) {
                    e2.msg = "invalid distance too far back", r2.mode = 30;
                    break e;
                  }
                  if (d >>>= y, p -= y, (y = s - a) < k) {
                    if (l < (y = k - y) && r2.sane) {
                      e2.msg = "invalid distance too far back", r2.mode = 30;
                      break e;
                    }
                    if (S = c, (x = 0) === f) {
                      if (x += u - y, y < w) {
                        for (w -= y; C[s++] = c[x++], --y; ) ;
                        x = s - k, S = C;
                      }
                    } else if (f < y) {
                      if (x += u + f - y, (y -= f) < w) {
                        for (w -= y; C[s++] = c[x++], --y; ) ;
                        if (x = 0, f < w) {
                          for (w -= y = f; C[s++] = c[x++], --y; ) ;
                          x = s - k, S = C;
                        }
                      }
                    } else if (x += f - y, y < w) {
                      for (w -= y; C[s++] = c[x++], --y; ) ;
                      x = s - k, S = C;
                    }
                    for (; 2 < w; ) C[s++] = S[x++], C[s++] = S[x++], C[s++] = S[x++], w -= 3;
                    w && (C[s++] = S[x++], 1 < w && (C[s++] = S[x++]));
                  } else {
                    for (x = s - k; C[s++] = C[x++], C[s++] = C[x++], C[s++] = C[x++], 2 < (w -= 3); ) ;
                    w && (C[s++] = C[x++], 1 < w && (C[s++] = C[x++]));
                  }
                  break;
                }
              }
              break;
            }
          } while (n < i && s < o);
          n -= w = p >> 3, d &= (1 << (p -= w << 3)) - 1, e2.next_in = n, e2.next_out = s, e2.avail_in = n < i ? i - n + 5 : 5 - (n - i), e2.avail_out = s < o ? o - s + 257 : 257 - (s - o), r2.hold = d, r2.bits = p;
        };
      }, {}], 49: [function(e, t, r) {
        "use strict";
        var I = e("../utils/common"), O = e("./adler32"), B = e("./crc32"), R = e("./inffast"), T = e("./inftrees"), D = 1, F = 2, N = 0, U = -2, P = 1, n = 852, i = 592;
        function L(e2) {
          return (e2 >>> 24 & 255) + (e2 >>> 8 & 65280) + ((65280 & e2) << 8) + ((255 & e2) << 24);
        }
        function s() {
          this.mode = 0, this.last = false, this.wrap = 0, this.havedict = false, this.flags = 0, this.dmax = 0, this.check = 0, this.total = 0, this.head = null, this.wbits = 0, this.wsize = 0, this.whave = 0, this.wnext = 0, this.window = null, this.hold = 0, this.bits = 0, this.length = 0, this.offset = 0, this.extra = 0, this.lencode = null, this.distcode = null, this.lenbits = 0, this.distbits = 0, this.ncode = 0, this.nlen = 0, this.ndist = 0, this.have = 0, this.next = null, this.lens = new I.Buf16(320), this.work = new I.Buf16(288), this.lendyn = null, this.distdyn = null, this.sane = 0, this.back = 0, this.was = 0;
        }
        function a(e2) {
          var t2;
          return e2 && e2.state ? (t2 = e2.state, e2.total_in = e2.total_out = t2.total = 0, e2.msg = "", t2.wrap && (e2.adler = 1 & t2.wrap), t2.mode = P, t2.last = 0, t2.havedict = 0, t2.dmax = 32768, t2.head = null, t2.hold = 0, t2.bits = 0, t2.lencode = t2.lendyn = new I.Buf32(n), t2.distcode = t2.distdyn = new I.Buf32(i), t2.sane = 1, t2.back = -1, N) : U;
        }
        function o(e2) {
          var t2;
          return e2 && e2.state ? ((t2 = e2.state).wsize = 0, t2.whave = 0, t2.wnext = 0, a(e2)) : U;
        }
        function h(e2, t2) {
          var r2, n2;
          return e2 && e2.state ? (n2 = e2.state, t2 < 0 ? (r2 = 0, t2 = -t2) : (r2 = 1 + (t2 >> 4), t2 < 48 && (t2 &= 15)), t2 && (t2 < 8 || 15 < t2) ? U : (null !== n2.window && n2.wbits !== t2 && (n2.window = null), n2.wrap = r2, n2.wbits = t2, o(e2))) : U;
        }
        function u(e2, t2) {
          var r2, n2;
          return e2 ? (n2 = new s(), (e2.state = n2).window = null, (r2 = h(e2, t2)) !== N && (e2.state = null), r2) : U;
        }
        var l, f, c = true;
        function j(e2) {
          if (c) {
            var t2;
            for (l = new I.Buf32(512), f = new I.Buf32(32), t2 = 0; t2 < 144; ) e2.lens[t2++] = 8;
            for (; t2 < 256; ) e2.lens[t2++] = 9;
            for (; t2 < 280; ) e2.lens[t2++] = 7;
            for (; t2 < 288; ) e2.lens[t2++] = 8;
            for (T(D, e2.lens, 0, 288, l, 0, e2.work, { bits: 9 }), t2 = 0; t2 < 32; ) e2.lens[t2++] = 5;
            T(F, e2.lens, 0, 32, f, 0, e2.work, { bits: 5 }), c = false;
          }
          e2.lencode = l, e2.lenbits = 9, e2.distcode = f, e2.distbits = 5;
        }
        function Z(e2, t2, r2, n2) {
          var i2, s2 = e2.state;
          return null === s2.window && (s2.wsize = 1 << s2.wbits, s2.wnext = 0, s2.whave = 0, s2.window = new I.Buf8(s2.wsize)), n2 >= s2.wsize ? (I.arraySet(s2.window, t2, r2 - s2.wsize, s2.wsize, 0), s2.wnext = 0, s2.whave = s2.wsize) : (n2 < (i2 = s2.wsize - s2.wnext) && (i2 = n2), I.arraySet(s2.window, t2, r2 - n2, i2, s2.wnext), (n2 -= i2) ? (I.arraySet(s2.window, t2, r2 - n2, n2, 0), s2.wnext = n2, s2.whave = s2.wsize) : (s2.wnext += i2, s2.wnext === s2.wsize && (s2.wnext = 0), s2.whave < s2.wsize && (s2.whave += i2))), 0;
        }
        r.inflateReset = o, r.inflateReset2 = h, r.inflateResetKeep = a, r.inflateInit = function(e2) {
          return u(e2, 15);
        }, r.inflateInit2 = u, r.inflate = function(e2, t2) {
          var r2, n2, i2, s2, a2, o2, h2, u2, l2, f2, c2, d, p, m, _, g, b, v, y, w, k, x, S, z, C = 0, E = new I.Buf8(4), A = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
          if (!e2 || !e2.state || !e2.output || !e2.input && 0 !== e2.avail_in) return U;
          12 === (r2 = e2.state).mode && (r2.mode = 13), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, f2 = o2, c2 = h2, x = N;
          e: for (; ; ) switch (r2.mode) {
            case P:
              if (0 === r2.wrap) {
                r2.mode = 13;
                break;
              }
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (2 & r2.wrap && 35615 === u2) {
                E[r2.check = 0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0), l2 = u2 = 0, r2.mode = 2;
                break;
              }
              if (r2.flags = 0, r2.head && (r2.head.done = false), !(1 & r2.wrap) || (((255 & u2) << 8) + (u2 >> 8)) % 31) {
                e2.msg = "incorrect header check", r2.mode = 30;
                break;
              }
              if (8 != (15 & u2)) {
                e2.msg = "unknown compression method", r2.mode = 30;
                break;
              }
              if (l2 -= 4, k = 8 + (15 & (u2 >>>= 4)), 0 === r2.wbits) r2.wbits = k;
              else if (k > r2.wbits) {
                e2.msg = "invalid window size", r2.mode = 30;
                break;
              }
              r2.dmax = 1 << k, e2.adler = r2.check = 1, r2.mode = 512 & u2 ? 10 : 12, l2 = u2 = 0;
              break;
            case 2:
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (r2.flags = u2, 8 != (255 & r2.flags)) {
                e2.msg = "unknown compression method", r2.mode = 30;
                break;
              }
              if (57344 & r2.flags) {
                e2.msg = "unknown header flags set", r2.mode = 30;
                break;
              }
              r2.head && (r2.head.text = u2 >> 8 & 1), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 3;
            case 3:
              for (; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              r2.head && (r2.head.time = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, E[2] = u2 >>> 16 & 255, E[3] = u2 >>> 24 & 255, r2.check = B(r2.check, E, 4, 0)), l2 = u2 = 0, r2.mode = 4;
            case 4:
              for (; l2 < 16; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              r2.head && (r2.head.xflags = 255 & u2, r2.head.os = u2 >> 8), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0, r2.mode = 5;
            case 5:
              if (1024 & r2.flags) {
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.length = u2, r2.head && (r2.head.extra_len = u2), 512 & r2.flags && (E[0] = 255 & u2, E[1] = u2 >>> 8 & 255, r2.check = B(r2.check, E, 2, 0)), l2 = u2 = 0;
              } else r2.head && (r2.head.extra = null);
              r2.mode = 6;
            case 6:
              if (1024 & r2.flags && (o2 < (d = r2.length) && (d = o2), d && (r2.head && (k = r2.head.extra_len - r2.length, r2.head.extra || (r2.head.extra = new Array(r2.head.extra_len)), I.arraySet(r2.head.extra, n2, s2, d, k)), 512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, r2.length -= d), r2.length)) break e;
              r2.length = 0, r2.mode = 7;
            case 7:
              if (2048 & r2.flags) {
                if (0 === o2) break e;
                for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.name += String.fromCharCode(k)), k && d < o2; ) ;
                if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
              } else r2.head && (r2.head.name = null);
              r2.length = 0, r2.mode = 8;
            case 8:
              if (4096 & r2.flags) {
                if (0 === o2) break e;
                for (d = 0; k = n2[s2 + d++], r2.head && k && r2.length < 65536 && (r2.head.comment += String.fromCharCode(k)), k && d < o2; ) ;
                if (512 & r2.flags && (r2.check = B(r2.check, n2, d, s2)), o2 -= d, s2 += d, k) break e;
              } else r2.head && (r2.head.comment = null);
              r2.mode = 9;
            case 9:
              if (512 & r2.flags) {
                for (; l2 < 16; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (u2 !== (65535 & r2.check)) {
                  e2.msg = "header crc mismatch", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.head && (r2.head.hcrc = r2.flags >> 9 & 1, r2.head.done = true), e2.adler = r2.check = 0, r2.mode = 12;
              break;
            case 10:
              for (; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              e2.adler = r2.check = L(u2), l2 = u2 = 0, r2.mode = 11;
            case 11:
              if (0 === r2.havedict) return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, 2;
              e2.adler = r2.check = 1, r2.mode = 12;
            case 12:
              if (5 === t2 || 6 === t2) break e;
            case 13:
              if (r2.last) {
                u2 >>>= 7 & l2, l2 -= 7 & l2, r2.mode = 27;
                break;
              }
              for (; l2 < 3; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              switch (r2.last = 1 & u2, l2 -= 1, 3 & (u2 >>>= 1)) {
                case 0:
                  r2.mode = 14;
                  break;
                case 1:
                  if (j(r2), r2.mode = 20, 6 !== t2) break;
                  u2 >>>= 2, l2 -= 2;
                  break e;
                case 2:
                  r2.mode = 17;
                  break;
                case 3:
                  e2.msg = "invalid block type", r2.mode = 30;
              }
              u2 >>>= 2, l2 -= 2;
              break;
            case 14:
              for (u2 >>>= 7 & l2, l2 -= 7 & l2; l2 < 32; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if ((65535 & u2) != (u2 >>> 16 ^ 65535)) {
                e2.msg = "invalid stored block lengths", r2.mode = 30;
                break;
              }
              if (r2.length = 65535 & u2, l2 = u2 = 0, r2.mode = 15, 6 === t2) break e;
            case 15:
              r2.mode = 16;
            case 16:
              if (d = r2.length) {
                if (o2 < d && (d = o2), h2 < d && (d = h2), 0 === d) break e;
                I.arraySet(i2, n2, s2, d, a2), o2 -= d, s2 += d, h2 -= d, a2 += d, r2.length -= d;
                break;
              }
              r2.mode = 12;
              break;
            case 17:
              for (; l2 < 14; ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (r2.nlen = 257 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ndist = 1 + (31 & u2), u2 >>>= 5, l2 -= 5, r2.ncode = 4 + (15 & u2), u2 >>>= 4, l2 -= 4, 286 < r2.nlen || 30 < r2.ndist) {
                e2.msg = "too many length or distance symbols", r2.mode = 30;
                break;
              }
              r2.have = 0, r2.mode = 18;
            case 18:
              for (; r2.have < r2.ncode; ) {
                for (; l2 < 3; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.lens[A[r2.have++]] = 7 & u2, u2 >>>= 3, l2 -= 3;
              }
              for (; r2.have < 19; ) r2.lens[A[r2.have++]] = 0;
              if (r2.lencode = r2.lendyn, r2.lenbits = 7, S = { bits: r2.lenbits }, x = T(0, r2.lens, 0, 19, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                e2.msg = "invalid code lengths set", r2.mode = 30;
                break;
              }
              r2.have = 0, r2.mode = 19;
            case 19:
              for (; r2.have < r2.nlen + r2.ndist; ) {
                for (; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (b < 16) u2 >>>= _, l2 -= _, r2.lens[r2.have++] = b;
                else {
                  if (16 === b) {
                    for (z = _ + 2; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    if (u2 >>>= _, l2 -= _, 0 === r2.have) {
                      e2.msg = "invalid bit length repeat", r2.mode = 30;
                      break;
                    }
                    k = r2.lens[r2.have - 1], d = 3 + (3 & u2), u2 >>>= 2, l2 -= 2;
                  } else if (17 === b) {
                    for (z = _ + 3; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    l2 -= _, k = 0, d = 3 + (7 & (u2 >>>= _)), u2 >>>= 3, l2 -= 3;
                  } else {
                    for (z = _ + 7; l2 < z; ) {
                      if (0 === o2) break e;
                      o2--, u2 += n2[s2++] << l2, l2 += 8;
                    }
                    l2 -= _, k = 0, d = 11 + (127 & (u2 >>>= _)), u2 >>>= 7, l2 -= 7;
                  }
                  if (r2.have + d > r2.nlen + r2.ndist) {
                    e2.msg = "invalid bit length repeat", r2.mode = 30;
                    break;
                  }
                  for (; d--; ) r2.lens[r2.have++] = k;
                }
              }
              if (30 === r2.mode) break;
              if (0 === r2.lens[256]) {
                e2.msg = "invalid code -- missing end-of-block", r2.mode = 30;
                break;
              }
              if (r2.lenbits = 9, S = { bits: r2.lenbits }, x = T(D, r2.lens, 0, r2.nlen, r2.lencode, 0, r2.work, S), r2.lenbits = S.bits, x) {
                e2.msg = "invalid literal/lengths set", r2.mode = 30;
                break;
              }
              if (r2.distbits = 6, r2.distcode = r2.distdyn, S = { bits: r2.distbits }, x = T(F, r2.lens, r2.nlen, r2.ndist, r2.distcode, 0, r2.work, S), r2.distbits = S.bits, x) {
                e2.msg = "invalid distances set", r2.mode = 30;
                break;
              }
              if (r2.mode = 20, 6 === t2) break e;
            case 20:
              r2.mode = 21;
            case 21:
              if (6 <= o2 && 258 <= h2) {
                e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, R(e2, c2), a2 = e2.next_out, i2 = e2.output, h2 = e2.avail_out, s2 = e2.next_in, n2 = e2.input, o2 = e2.avail_in, u2 = r2.hold, l2 = r2.bits, 12 === r2.mode && (r2.back = -1);
                break;
              }
              for (r2.back = 0; g = (C = r2.lencode[u2 & (1 << r2.lenbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (g && 0 == (240 & g)) {
                for (v = _, y = g, w = b; g = (C = r2.lencode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                u2 >>>= v, l2 -= v, r2.back += v;
              }
              if (u2 >>>= _, l2 -= _, r2.back += _, r2.length = b, 0 === g) {
                r2.mode = 26;
                break;
              }
              if (32 & g) {
                r2.back = -1, r2.mode = 12;
                break;
              }
              if (64 & g) {
                e2.msg = "invalid literal/length code", r2.mode = 30;
                break;
              }
              r2.extra = 15 & g, r2.mode = 22;
            case 22:
              if (r2.extra) {
                for (z = r2.extra; l2 < z; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.length += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
              }
              r2.was = r2.length, r2.mode = 23;
            case 23:
              for (; g = (C = r2.distcode[u2 & (1 << r2.distbits) - 1]) >>> 16 & 255, b = 65535 & C, !((_ = C >>> 24) <= l2); ) {
                if (0 === o2) break e;
                o2--, u2 += n2[s2++] << l2, l2 += 8;
              }
              if (0 == (240 & g)) {
                for (v = _, y = g, w = b; g = (C = r2.distcode[w + ((u2 & (1 << v + y) - 1) >> v)]) >>> 16 & 255, b = 65535 & C, !(v + (_ = C >>> 24) <= l2); ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                u2 >>>= v, l2 -= v, r2.back += v;
              }
              if (u2 >>>= _, l2 -= _, r2.back += _, 64 & g) {
                e2.msg = "invalid distance code", r2.mode = 30;
                break;
              }
              r2.offset = b, r2.extra = 15 & g, r2.mode = 24;
            case 24:
              if (r2.extra) {
                for (z = r2.extra; l2 < z; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                r2.offset += u2 & (1 << r2.extra) - 1, u2 >>>= r2.extra, l2 -= r2.extra, r2.back += r2.extra;
              }
              if (r2.offset > r2.dmax) {
                e2.msg = "invalid distance too far back", r2.mode = 30;
                break;
              }
              r2.mode = 25;
            case 25:
              if (0 === h2) break e;
              if (d = c2 - h2, r2.offset > d) {
                if ((d = r2.offset - d) > r2.whave && r2.sane) {
                  e2.msg = "invalid distance too far back", r2.mode = 30;
                  break;
                }
                p = d > r2.wnext ? (d -= r2.wnext, r2.wsize - d) : r2.wnext - d, d > r2.length && (d = r2.length), m = r2.window;
              } else m = i2, p = a2 - r2.offset, d = r2.length;
              for (h2 < d && (d = h2), h2 -= d, r2.length -= d; i2[a2++] = m[p++], --d; ) ;
              0 === r2.length && (r2.mode = 21);
              break;
            case 26:
              if (0 === h2) break e;
              i2[a2++] = r2.length, h2--, r2.mode = 21;
              break;
            case 27:
              if (r2.wrap) {
                for (; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 |= n2[s2++] << l2, l2 += 8;
                }
                if (c2 -= h2, e2.total_out += c2, r2.total += c2, c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, a2 - c2) : O(r2.check, i2, c2, a2 - c2)), c2 = h2, (r2.flags ? u2 : L(u2)) !== r2.check) {
                  e2.msg = "incorrect data check", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.mode = 28;
            case 28:
              if (r2.wrap && r2.flags) {
                for (; l2 < 32; ) {
                  if (0 === o2) break e;
                  o2--, u2 += n2[s2++] << l2, l2 += 8;
                }
                if (u2 !== (4294967295 & r2.total)) {
                  e2.msg = "incorrect length check", r2.mode = 30;
                  break;
                }
                l2 = u2 = 0;
              }
              r2.mode = 29;
            case 29:
              x = 1;
              break e;
            case 30:
              x = -3;
              break e;
            case 31:
              return -4;
            case 32:
            default:
              return U;
          }
          return e2.next_out = a2, e2.avail_out = h2, e2.next_in = s2, e2.avail_in = o2, r2.hold = u2, r2.bits = l2, (r2.wsize || c2 !== e2.avail_out && r2.mode < 30 && (r2.mode < 27 || 4 !== t2)) && Z(e2, e2.output, e2.next_out, c2 - e2.avail_out) ? (r2.mode = 31, -4) : (f2 -= e2.avail_in, c2 -= e2.avail_out, e2.total_in += f2, e2.total_out += c2, r2.total += c2, r2.wrap && c2 && (e2.adler = r2.check = r2.flags ? B(r2.check, i2, c2, e2.next_out - c2) : O(r2.check, i2, c2, e2.next_out - c2)), e2.data_type = r2.bits + (r2.last ? 64 : 0) + (12 === r2.mode ? 128 : 0) + (20 === r2.mode || 15 === r2.mode ? 256 : 0), (0 == f2 && 0 === c2 || 4 === t2) && x === N && (x = -5), x);
        }, r.inflateEnd = function(e2) {
          if (!e2 || !e2.state) return U;
          var t2 = e2.state;
          return t2.window && (t2.window = null), e2.state = null, N;
        }, r.inflateGetHeader = function(e2, t2) {
          var r2;
          return e2 && e2.state ? 0 == (2 & (r2 = e2.state).wrap) ? U : ((r2.head = t2).done = false, N) : U;
        }, r.inflateSetDictionary = function(e2, t2) {
          var r2, n2 = t2.length;
          return e2 && e2.state ? 0 !== (r2 = e2.state).wrap && 11 !== r2.mode ? U : 11 === r2.mode && O(1, t2, n2, 0) !== r2.check ? -3 : Z(e2, t2, n2, n2) ? (r2.mode = 31, -4) : (r2.havedict = 1, N) : U;
        }, r.inflateInfo = "pako inflate (from Nodeca project)";
      }, { "../utils/common": 41, "./adler32": 43, "./crc32": 45, "./inffast": 48, "./inftrees": 50 }], 50: [function(e, t, r) {
        "use strict";
        var D = e("../utils/common"), F = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0], N = [16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78], U = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577, 0, 0], P = [16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 25, 25, 26, 26, 27, 27, 28, 28, 29, 29, 64, 64];
        t.exports = function(e2, t2, r2, n, i, s, a, o) {
          var h, u, l, f, c, d, p, m, _, g = o.bits, b = 0, v = 0, y = 0, w = 0, k = 0, x = 0, S = 0, z = 0, C = 0, E = 0, A = null, I = 0, O = new D.Buf16(16), B = new D.Buf16(16), R = null, T = 0;
          for (b = 0; b <= 15; b++) O[b] = 0;
          for (v = 0; v < n; v++) O[t2[r2 + v]]++;
          for (k = g, w = 15; 1 <= w && 0 === O[w]; w--) ;
          if (w < k && (k = w), 0 === w) return i[s++] = 20971520, i[s++] = 20971520, o.bits = 1, 0;
          for (y = 1; y < w && 0 === O[y]; y++) ;
          for (k < y && (k = y), b = z = 1; b <= 15; b++) if (z <<= 1, (z -= O[b]) < 0) return -1;
          if (0 < z && (0 === e2 || 1 !== w)) return -1;
          for (B[1] = 0, b = 1; b < 15; b++) B[b + 1] = B[b] + O[b];
          for (v = 0; v < n; v++) 0 !== t2[r2 + v] && (a[B[t2[r2 + v]]++] = v);
          if (d = 0 === e2 ? (A = R = a, 19) : 1 === e2 ? (A = F, I -= 257, R = N, T -= 257, 256) : (A = U, R = P, -1), b = y, c = s, S = v = E = 0, l = -1, f = (C = 1 << (x = k)) - 1, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
          for (; ; ) {
            for (p = b - S, _ = a[v] < d ? (m = 0, a[v]) : a[v] > d ? (m = R[T + a[v]], A[I + a[v]]) : (m = 96, 0), h = 1 << b - S, y = u = 1 << x; i[c + (E >> S) + (u -= h)] = p << 24 | m << 16 | _ | 0, 0 !== u; ) ;
            for (h = 1 << b - 1; E & h; ) h >>= 1;
            if (0 !== h ? (E &= h - 1, E += h) : E = 0, v++, 0 == --O[b]) {
              if (b === w) break;
              b = t2[r2 + a[v]];
            }
            if (k < b && (E & f) !== l) {
              for (0 === S && (S = k), c += y, z = 1 << (x = b - S); x + S < w && !((z -= O[x + S]) <= 0); ) x++, z <<= 1;
              if (C += 1 << x, 1 === e2 && 852 < C || 2 === e2 && 592 < C) return 1;
              i[l = E & f] = k << 24 | x << 16 | c - s | 0;
            }
          }
          return 0 !== E && (i[c + E] = b - S << 24 | 64 << 16 | 0), o.bits = k, 0;
        };
      }, { "../utils/common": 41 }], 51: [function(e, t, r) {
        "use strict";
        t.exports = { 2: "need dictionary", 1: "stream end", 0: "", "-1": "file error", "-2": "stream error", "-3": "data error", "-4": "insufficient memory", "-5": "buffer error", "-6": "incompatible version" };
      }, {}], 52: [function(e, t, r) {
        "use strict";
        var i = e("../utils/common"), o = 0, h = 1;
        function n(e2) {
          for (var t2 = e2.length; 0 <= --t2; ) e2[t2] = 0;
        }
        var s = 0, a = 29, u = 256, l = u + 1 + a, f = 30, c = 19, _ = 2 * l + 1, g = 15, d = 16, p = 7, m = 256, b = 16, v = 17, y = 18, w = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0], k = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13], x = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7], S = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15], z = new Array(2 * (l + 2));
        n(z);
        var C = new Array(2 * f);
        n(C);
        var E = new Array(512);
        n(E);
        var A = new Array(256);
        n(A);
        var I = new Array(a);
        n(I);
        var O, B, R, T = new Array(f);
        function D(e2, t2, r2, n2, i2) {
          this.static_tree = e2, this.extra_bits = t2, this.extra_base = r2, this.elems = n2, this.max_length = i2, this.has_stree = e2 && e2.length;
        }
        function F(e2, t2) {
          this.dyn_tree = e2, this.max_code = 0, this.stat_desc = t2;
        }
        function N(e2) {
          return e2 < 256 ? E[e2] : E[256 + (e2 >>> 7)];
        }
        function U(e2, t2) {
          e2.pending_buf[e2.pending++] = 255 & t2, e2.pending_buf[e2.pending++] = t2 >>> 8 & 255;
        }
        function P(e2, t2, r2) {
          e2.bi_valid > d - r2 ? (e2.bi_buf |= t2 << e2.bi_valid & 65535, U(e2, e2.bi_buf), e2.bi_buf = t2 >> d - e2.bi_valid, e2.bi_valid += r2 - d) : (e2.bi_buf |= t2 << e2.bi_valid & 65535, e2.bi_valid += r2);
        }
        function L(e2, t2, r2) {
          P(e2, r2[2 * t2], r2[2 * t2 + 1]);
        }
        function j(e2, t2) {
          for (var r2 = 0; r2 |= 1 & e2, e2 >>>= 1, r2 <<= 1, 0 < --t2; ) ;
          return r2 >>> 1;
        }
        function Z(e2, t2, r2) {
          var n2, i2, s2 = new Array(g + 1), a2 = 0;
          for (n2 = 1; n2 <= g; n2++) s2[n2] = a2 = a2 + r2[n2 - 1] << 1;
          for (i2 = 0; i2 <= t2; i2++) {
            var o2 = e2[2 * i2 + 1];
            0 !== o2 && (e2[2 * i2] = j(s2[o2]++, o2));
          }
        }
        function W(e2) {
          var t2;
          for (t2 = 0; t2 < l; t2++) e2.dyn_ltree[2 * t2] = 0;
          for (t2 = 0; t2 < f; t2++) e2.dyn_dtree[2 * t2] = 0;
          for (t2 = 0; t2 < c; t2++) e2.bl_tree[2 * t2] = 0;
          e2.dyn_ltree[2 * m] = 1, e2.opt_len = e2.static_len = 0, e2.last_lit = e2.matches = 0;
        }
        function M(e2) {
          8 < e2.bi_valid ? U(e2, e2.bi_buf) : 0 < e2.bi_valid && (e2.pending_buf[e2.pending++] = e2.bi_buf), e2.bi_buf = 0, e2.bi_valid = 0;
        }
        function H(e2, t2, r2, n2) {
          var i2 = 2 * t2, s2 = 2 * r2;
          return e2[i2] < e2[s2] || e2[i2] === e2[s2] && n2[t2] <= n2[r2];
        }
        function G(e2, t2, r2) {
          for (var n2 = e2.heap[r2], i2 = r2 << 1; i2 <= e2.heap_len && (i2 < e2.heap_len && H(t2, e2.heap[i2 + 1], e2.heap[i2], e2.depth) && i2++, !H(t2, n2, e2.heap[i2], e2.depth)); ) e2.heap[r2] = e2.heap[i2], r2 = i2, i2 <<= 1;
          e2.heap[r2] = n2;
        }
        function K(e2, t2, r2) {
          var n2, i2, s2, a2, o2 = 0;
          if (0 !== e2.last_lit) for (; n2 = e2.pending_buf[e2.d_buf + 2 * o2] << 8 | e2.pending_buf[e2.d_buf + 2 * o2 + 1], i2 = e2.pending_buf[e2.l_buf + o2], o2++, 0 === n2 ? L(e2, i2, t2) : (L(e2, (s2 = A[i2]) + u + 1, t2), 0 !== (a2 = w[s2]) && P(e2, i2 -= I[s2], a2), L(e2, s2 = N(--n2), r2), 0 !== (a2 = k[s2]) && P(e2, n2 -= T[s2], a2)), o2 < e2.last_lit; ) ;
          L(e2, m, t2);
        }
        function Y(e2, t2) {
          var r2, n2, i2, s2 = t2.dyn_tree, a2 = t2.stat_desc.static_tree, o2 = t2.stat_desc.has_stree, h2 = t2.stat_desc.elems, u2 = -1;
          for (e2.heap_len = 0, e2.heap_max = _, r2 = 0; r2 < h2; r2++) 0 !== s2[2 * r2] ? (e2.heap[++e2.heap_len] = u2 = r2, e2.depth[r2] = 0) : s2[2 * r2 + 1] = 0;
          for (; e2.heap_len < 2; ) s2[2 * (i2 = e2.heap[++e2.heap_len] = u2 < 2 ? ++u2 : 0)] = 1, e2.depth[i2] = 0, e2.opt_len--, o2 && (e2.static_len -= a2[2 * i2 + 1]);
          for (t2.max_code = u2, r2 = e2.heap_len >> 1; 1 <= r2; r2--) G(e2, s2, r2);
          for (i2 = h2; r2 = e2.heap[1], e2.heap[1] = e2.heap[e2.heap_len--], G(e2, s2, 1), n2 = e2.heap[1], e2.heap[--e2.heap_max] = r2, e2.heap[--e2.heap_max] = n2, s2[2 * i2] = s2[2 * r2] + s2[2 * n2], e2.depth[i2] = (e2.depth[r2] >= e2.depth[n2] ? e2.depth[r2] : e2.depth[n2]) + 1, s2[2 * r2 + 1] = s2[2 * n2 + 1] = i2, e2.heap[1] = i2++, G(e2, s2, 1), 2 <= e2.heap_len; ) ;
          e2.heap[--e2.heap_max] = e2.heap[1], (function(e3, t3) {
            var r3, n3, i3, s3, a3, o3, h3 = t3.dyn_tree, u3 = t3.max_code, l2 = t3.stat_desc.static_tree, f2 = t3.stat_desc.has_stree, c2 = t3.stat_desc.extra_bits, d2 = t3.stat_desc.extra_base, p2 = t3.stat_desc.max_length, m2 = 0;
            for (s3 = 0; s3 <= g; s3++) e3.bl_count[s3] = 0;
            for (h3[2 * e3.heap[e3.heap_max] + 1] = 0, r3 = e3.heap_max + 1; r3 < _; r3++) p2 < (s3 = h3[2 * h3[2 * (n3 = e3.heap[r3]) + 1] + 1] + 1) && (s3 = p2, m2++), h3[2 * n3 + 1] = s3, u3 < n3 || (e3.bl_count[s3]++, a3 = 0, d2 <= n3 && (a3 = c2[n3 - d2]), o3 = h3[2 * n3], e3.opt_len += o3 * (s3 + a3), f2 && (e3.static_len += o3 * (l2[2 * n3 + 1] + a3)));
            if (0 !== m2) {
              do {
                for (s3 = p2 - 1; 0 === e3.bl_count[s3]; ) s3--;
                e3.bl_count[s3]--, e3.bl_count[s3 + 1] += 2, e3.bl_count[p2]--, m2 -= 2;
              } while (0 < m2);
              for (s3 = p2; 0 !== s3; s3--) for (n3 = e3.bl_count[s3]; 0 !== n3; ) u3 < (i3 = e3.heap[--r3]) || (h3[2 * i3 + 1] !== s3 && (e3.opt_len += (s3 - h3[2 * i3 + 1]) * h3[2 * i3], h3[2 * i3 + 1] = s3), n3--);
            }
          })(e2, t2), Z(s2, u2, e2.bl_count);
        }
        function X(e2, t2, r2) {
          var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
          for (0 === a2 && (h2 = 138, u2 = 3), t2[2 * (r2 + 1) + 1] = 65535, n2 = 0; n2 <= r2; n2++) i2 = a2, a2 = t2[2 * (n2 + 1) + 1], ++o2 < h2 && i2 === a2 || (o2 < u2 ? e2.bl_tree[2 * i2] += o2 : 0 !== i2 ? (i2 !== s2 && e2.bl_tree[2 * i2]++, e2.bl_tree[2 * b]++) : o2 <= 10 ? e2.bl_tree[2 * v]++ : e2.bl_tree[2 * y]++, s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4));
        }
        function V(e2, t2, r2) {
          var n2, i2, s2 = -1, a2 = t2[1], o2 = 0, h2 = 7, u2 = 4;
          for (0 === a2 && (h2 = 138, u2 = 3), n2 = 0; n2 <= r2; n2++) if (i2 = a2, a2 = t2[2 * (n2 + 1) + 1], !(++o2 < h2 && i2 === a2)) {
            if (o2 < u2) for (; L(e2, i2, e2.bl_tree), 0 != --o2; ) ;
            else 0 !== i2 ? (i2 !== s2 && (L(e2, i2, e2.bl_tree), o2--), L(e2, b, e2.bl_tree), P(e2, o2 - 3, 2)) : o2 <= 10 ? (L(e2, v, e2.bl_tree), P(e2, o2 - 3, 3)) : (L(e2, y, e2.bl_tree), P(e2, o2 - 11, 7));
            s2 = i2, u2 = (o2 = 0) === a2 ? (h2 = 138, 3) : i2 === a2 ? (h2 = 6, 3) : (h2 = 7, 4);
          }
        }
        n(T);
        var q = false;
        function J(e2, t2, r2, n2) {
          P(e2, (s << 1) + (n2 ? 1 : 0), 3), (function(e3, t3, r3, n3) {
            M(e3), n3 && (U(e3, r3), U(e3, ~r3)), i.arraySet(e3.pending_buf, e3.window, t3, r3, e3.pending), e3.pending += r3;
          })(e2, t2, r2, true);
        }
        r._tr_init = function(e2) {
          q || ((function() {
            var e3, t2, r2, n2, i2, s2 = new Array(g + 1);
            for (n2 = r2 = 0; n2 < a - 1; n2++) for (I[n2] = r2, e3 = 0; e3 < 1 << w[n2]; e3++) A[r2++] = n2;
            for (A[r2 - 1] = n2, n2 = i2 = 0; n2 < 16; n2++) for (T[n2] = i2, e3 = 0; e3 < 1 << k[n2]; e3++) E[i2++] = n2;
            for (i2 >>= 7; n2 < f; n2++) for (T[n2] = i2 << 7, e3 = 0; e3 < 1 << k[n2] - 7; e3++) E[256 + i2++] = n2;
            for (t2 = 0; t2 <= g; t2++) s2[t2] = 0;
            for (e3 = 0; e3 <= 143; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
            for (; e3 <= 255; ) z[2 * e3 + 1] = 9, e3++, s2[9]++;
            for (; e3 <= 279; ) z[2 * e3 + 1] = 7, e3++, s2[7]++;
            for (; e3 <= 287; ) z[2 * e3 + 1] = 8, e3++, s2[8]++;
            for (Z(z, l + 1, s2), e3 = 0; e3 < f; e3++) C[2 * e3 + 1] = 5, C[2 * e3] = j(e3, 5);
            O = new D(z, w, u + 1, l, g), B = new D(C, k, 0, f, g), R = new D(new Array(0), x, 0, c, p);
          })(), q = true), e2.l_desc = new F(e2.dyn_ltree, O), e2.d_desc = new F(e2.dyn_dtree, B), e2.bl_desc = new F(e2.bl_tree, R), e2.bi_buf = 0, e2.bi_valid = 0, W(e2);
        }, r._tr_stored_block = J, r._tr_flush_block = function(e2, t2, r2, n2) {
          var i2, s2, a2 = 0;
          0 < e2.level ? (2 === e2.strm.data_type && (e2.strm.data_type = (function(e3) {
            var t3, r3 = 4093624447;
            for (t3 = 0; t3 <= 31; t3++, r3 >>>= 1) if (1 & r3 && 0 !== e3.dyn_ltree[2 * t3]) return o;
            if (0 !== e3.dyn_ltree[18] || 0 !== e3.dyn_ltree[20] || 0 !== e3.dyn_ltree[26]) return h;
            for (t3 = 32; t3 < u; t3++) if (0 !== e3.dyn_ltree[2 * t3]) return h;
            return o;
          })(e2)), Y(e2, e2.l_desc), Y(e2, e2.d_desc), a2 = (function(e3) {
            var t3;
            for (X(e3, e3.dyn_ltree, e3.l_desc.max_code), X(e3, e3.dyn_dtree, e3.d_desc.max_code), Y(e3, e3.bl_desc), t3 = c - 1; 3 <= t3 && 0 === e3.bl_tree[2 * S[t3] + 1]; t3--) ;
            return e3.opt_len += 3 * (t3 + 1) + 5 + 5 + 4, t3;
          })(e2), i2 = e2.opt_len + 3 + 7 >>> 3, (s2 = e2.static_len + 3 + 7 >>> 3) <= i2 && (i2 = s2)) : i2 = s2 = r2 + 5, r2 + 4 <= i2 && -1 !== t2 ? J(e2, t2, r2, n2) : 4 === e2.strategy || s2 === i2 ? (P(e2, 2 + (n2 ? 1 : 0), 3), K(e2, z, C)) : (P(e2, 4 + (n2 ? 1 : 0), 3), (function(e3, t3, r3, n3) {
            var i3;
            for (P(e3, t3 - 257, 5), P(e3, r3 - 1, 5), P(e3, n3 - 4, 4), i3 = 0; i3 < n3; i3++) P(e3, e3.bl_tree[2 * S[i3] + 1], 3);
            V(e3, e3.dyn_ltree, t3 - 1), V(e3, e3.dyn_dtree, r3 - 1);
          })(e2, e2.l_desc.max_code + 1, e2.d_desc.max_code + 1, a2 + 1), K(e2, e2.dyn_ltree, e2.dyn_dtree)), W(e2), n2 && M(e2);
        }, r._tr_tally = function(e2, t2, r2) {
          return e2.pending_buf[e2.d_buf + 2 * e2.last_lit] = t2 >>> 8 & 255, e2.pending_buf[e2.d_buf + 2 * e2.last_lit + 1] = 255 & t2, e2.pending_buf[e2.l_buf + e2.last_lit] = 255 & r2, e2.last_lit++, 0 === t2 ? e2.dyn_ltree[2 * r2]++ : (e2.matches++, t2--, e2.dyn_ltree[2 * (A[r2] + u + 1)]++, e2.dyn_dtree[2 * N(t2)]++), e2.last_lit === e2.lit_bufsize - 1;
        }, r._tr_align = function(e2) {
          P(e2, 2, 3), L(e2, m, z), (function(e3) {
            16 === e3.bi_valid ? (U(e3, e3.bi_buf), e3.bi_buf = 0, e3.bi_valid = 0) : 8 <= e3.bi_valid && (e3.pending_buf[e3.pending++] = 255 & e3.bi_buf, e3.bi_buf >>= 8, e3.bi_valid -= 8);
          })(e2);
        };
      }, { "../utils/common": 41 }], 53: [function(e, t, r) {
        "use strict";
        t.exports = function() {
          this.input = null, this.next_in = 0, this.avail_in = 0, this.total_in = 0, this.output = null, this.next_out = 0, this.avail_out = 0, this.total_out = 0, this.msg = "", this.state = null, this.data_type = 2, this.adler = 0;
        };
      }, {}], 54: [function(e, t, r) {
        (function(e2) {
          !(function(r2, n) {
            "use strict";
            if (!r2.setImmediate) {
              var i, s, t2, a, o = 1, h = {}, u = false, l = r2.document, e3 = Object.getPrototypeOf && Object.getPrototypeOf(r2);
              e3 = e3 && e3.setTimeout ? e3 : r2, i = "[object process]" === {}.toString.call(r2.process) ? function(e4) {
                process.nextTick(function() {
                  c(e4);
                });
              } : (function() {
                if (r2.postMessage && !r2.importScripts) {
                  var e4 = true, t3 = r2.onmessage;
                  return r2.onmessage = function() {
                    e4 = false;
                  }, r2.postMessage("", "*"), r2.onmessage = t3, e4;
                }
              })() ? (a = "setImmediate$" + Math.random() + "$", r2.addEventListener ? r2.addEventListener("message", d, false) : r2.attachEvent("onmessage", d), function(e4) {
                r2.postMessage(a + e4, "*");
              }) : r2.MessageChannel ? ((t2 = new MessageChannel()).port1.onmessage = function(e4) {
                c(e4.data);
              }, function(e4) {
                t2.port2.postMessage(e4);
              }) : l && "onreadystatechange" in l.createElement("script") ? (s = l.documentElement, function(e4) {
                var t3 = l.createElement("script");
                t3.onreadystatechange = function() {
                  c(e4), t3.onreadystatechange = null, s.removeChild(t3), t3 = null;
                }, s.appendChild(t3);
              }) : function(e4) {
                setTimeout(c, 0, e4);
              }, e3.setImmediate = function(e4) {
                "function" != typeof e4 && (e4 = new Function("" + e4));
                for (var t3 = new Array(arguments.length - 1), r3 = 0; r3 < t3.length; r3++) t3[r3] = arguments[r3 + 1];
                var n2 = { callback: e4, args: t3 };
                return h[o] = n2, i(o), o++;
              }, e3.clearImmediate = f;
            }
            function f(e4) {
              delete h[e4];
            }
            function c(e4) {
              if (u) setTimeout(c, 0, e4);
              else {
                var t3 = h[e4];
                if (t3) {
                  u = true;
                  try {
                    !(function(e5) {
                      var t4 = e5.callback, r3 = e5.args;
                      switch (r3.length) {
                        case 0:
                          t4();
                          break;
                        case 1:
                          t4(r3[0]);
                          break;
                        case 2:
                          t4(r3[0], r3[1]);
                          break;
                        case 3:
                          t4(r3[0], r3[1], r3[2]);
                          break;
                        default:
                          t4.apply(n, r3);
                      }
                    })(t3);
                  } finally {
                    f(e4), u = false;
                  }
                }
              }
            }
            function d(e4) {
              e4.source === r2 && "string" == typeof e4.data && 0 === e4.data.indexOf(a) && c(+e4.data.slice(a.length));
            }
          })("undefined" == typeof self ? void 0 === e2 ? this : e2 : self);
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {});
      }, {}] }, {}, [10])(10);
    });
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ZoomMapPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian29 = require("obsidian");

// src/map.ts
var import_obsidian21 = require("obsidian");

// src/markerStore.ts
var import_obsidian = require("obsidian");
function generateId(prefix = "m") {
  const s = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${s}`;
}
function sanitizeMarkerFileDataForSave(data) {
  var _a, _b;
  const out = { ...data };
  const deleted = sanitizeDeletedUndoEntries(out.deleted);
  delete out.image;
  delete out.deleted;
  const du = (_b = (_a = out.measurement) == null ? void 0 : _a.displayUnit) != null ? _b : "";
  if (out.measurement && du) {
    if (du === "auto-metric") out.measurement.displayUnit = "km";
    else if (du === "auto-imperial") out.measurement.displayUnit = "mi";
  }
  if (deleted == null ? void 0 : deleted.length) out.deleted = deleted;
  return out;
}
function isRecord(x) {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}
function sanitizeIndex(x) {
  const n = typeof x === "number" ? x : Number(x);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}
function sanitizeDeletedIndexedMarker(x) {
  if (!isRecord(x) || !isRecord(x.marker)) return null;
  const index = sanitizeIndex(x.index);
  if (index === null) return null;
  return {
    marker: x.marker,
    index
  };
}
function sanitizeDeletedIndexedDrawing(x) {
  if (!isRecord(x) || !isRecord(x.drawing)) return null;
  const index = sanitizeIndex(x.index);
  if (index === null) return null;
  return {
    drawing: x.drawing,
    index
  };
}
function sanitizeDeletedUndoPayload(payload) {
  if (!isRecord(payload) || typeof payload.kind !== "string") return null;
  switch (payload.kind) {
    case "marker": {
      if (!isRecord(payload.marker)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      return {
        kind: "marker",
        marker: payload.marker,
        index
      };
    }
    case "drawing": {
      if (!isRecord(payload.drawing)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      return {
        kind: "drawing",
        drawing: payload.drawing,
        index
      };
    }
    case "grid": {
      if (!isRecord(payload.grid)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      return {
        kind: "grid",
        grid: payload.grid,
        index
      };
    }
    case "text-layer": {
      if (!isRecord(payload.layer)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      return {
        kind: "text-layer",
        layer: payload.layer,
        index
      };
    }
    case "text-box": {
      if (typeof payload.layerId !== "string" || !isRecord(payload.box)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      return {
        kind: "text-box",
        layerId: payload.layerId,
        box: payload.box,
        index
      };
    }
    case "marker-layer": {
      if (!isRecord(payload.layer)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      const mode = payload.mode === "move" || payload.mode === "delete-markers" ? payload.mode : null;
      if (!mode) return null;
      const markers = Array.isArray(payload.markers) ? payload.markers.map(sanitizeDeletedIndexedMarker).filter((x) => !!x) : void 0;
      const movedMarkerIds = Array.isArray(payload.movedMarkerIds) ? payload.movedMarkerIds.filter((x) => typeof x === "string" && !!x.trim()) : void 0;
      return {
        kind: "marker-layer",
        layer: payload.layer,
        index,
        mode,
        targetId: typeof payload.targetId === "string" && payload.targetId.trim() ? payload.targetId : void 0,
        markers: (markers == null ? void 0 : markers.length) ? markers : void 0,
        movedMarkerIds: (movedMarkerIds == null ? void 0 : movedMarkerIds.length) ? movedMarkerIds : void 0
      };
    }
    case "draw-layer": {
      if (!isRecord(payload.layer)) return null;
      const index = sanitizeIndex(payload.index);
      if (index === null) return null;
      const drawings = Array.isArray(payload.drawings) ? payload.drawings.map(sanitizeDeletedIndexedDrawing).filter((x) => !!x) : [];
      return {
        kind: "draw-layer",
        layer: payload.layer,
        index,
        drawings
      };
    }
    default:
      return null;
  }
}
function sanitizeDeletedUndoEntries(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return void 0;
  const out = entries.map((entry) => {
    if (!isRecord(entry)) return null;
    const payload = sanitizeDeletedUndoPayload(entry.payload);
    if (!payload) return null;
    return {
      id: typeof entry.id === "string" && entry.id.trim() ? entry.id : generateId("undo"),
      label: typeof entry.label === "string" && entry.label.trim() ? entry.label : "Deleted item",
      createdAt: typeof entry.createdAt === "string" && entry.createdAt.trim() ? entry.createdAt : (/* @__PURE__ */ new Date(0)).toISOString(),
      payload
    };
  }).filter((x) => !!x).slice(0, 3);
  return out.length ? out : void 0;
}
var MarkerStore = class {
  constructor(app, sourcePath, markersFilePath) {
    this.app = app;
    this.sourcePath = sourcePath;
    this.markersFilePath = (0, import_obsidian.normalizePath)(markersFilePath);
  }
  getPath() {
    return this.markersFilePath;
  }
  serialize(data) {
    return JSON.stringify(sanitizeMarkerFileDataForSave(data), null, 2);
  }
  async ensureExists(initialImagePath, size, markerLayerNames) {
    const abs = this.getFileByPath(this.markersFilePath);
    if (abs) return;
    const baseLayers = markerLayerNames && markerLayerNames.length > 0 ? markerLayerNames.map((name, idx) => ({
      id: idx === 0 ? "default" : generateId("layer"),
      name: name || "Layer",
      visible: true,
      locked: false
    })) : [{ id: "default", name: "Default", visible: true, locked: false }];
    const data = {
      size,
      layers: baseLayers,
      markers: [],
      bases: initialImagePath ? [initialImagePath] : [],
      overlays: [],
      activeBase: initialImagePath != null ? initialImagePath : "",
      measurement: {
        metersPerPixel: void 0,
        scales: {},
        customUnitId: void 0,
        customUnitPxPerUnit: {},
        travelTimePresetIds: [],
        travelDaysEnabled: false,
        travelDayPresetId: void 0
      },
      frame: void 0,
      pinSizeOverrides: {},
      grids: [],
      panClamp: true,
      drawLayers: [],
      drawings: [],
      secondScreen: {},
      textLayers: []
    };
    await this.create(this.serialize(data));
    new import_obsidian.Notice(`Created marker file: ${this.markersFilePath}`, 2500);
  }
  async load() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
    const f = this.getFileByPath(this.markersFilePath);
    if (!f) throw new Error(`Marker file missing: ${this.markersFilePath}`);
    const raw = await this.app.vault.read(f);
    const parsed = JSON.parse(raw);
    if (!parsed.layers || parsed.layers.length === 0) {
      parsed.layers = [
        { id: "default", name: "Default", visible: true, locked: false }
      ];
    }
    parsed.layers = parsed.layers.map((l) => {
      var _a2;
      return {
        id: l.id,
        name: (_a2 = l.name) != null ? _a2 : "Layer",
        visible: typeof l.visible === "boolean" ? l.visible : true,
        locked: !!l.locked,
        boundBase: typeof l.boundBase === "string" && l.boundBase.trim() ? l.boundBase : void 0
      };
    });
    (_a = parsed.markers) != null ? _a : parsed.markers = [];
    (_b = parsed.bases) != null ? _b : parsed.bases = parsed.image ? [parsed.image] : [];
    if (!parsed.activeBase) {
      const firstBase = parsed.bases[0];
      const firstPath = typeof firstBase === "string" ? firstBase : isBaseImage(firstBase) ? firstBase.path : "";
      parsed.activeBase = parsed.activeBase || parsed.image || firstPath || "";
    }
    (_c = parsed.overlays) != null ? _c : parsed.overlays = [];
    (_d = parsed.measurement) != null ? _d : parsed.measurement = {
      displayUnit: "km",
      metersPerPixel: void 0,
      scales: {}
    };
    (_f = (_e = parsed.measurement).scales) != null ? _f : _e.scales = {};
    {
      const raw2 = (_g = parsed.measurement.displayUnit) != null ? _g : "";
      if (raw2 === "auto-metric") parsed.measurement.displayUnit = "km";
      else if (raw2 === "auto-imperial") parsed.measurement.displayUnit = "mi";
      else if (raw2 !== "m" && raw2 !== "km" && raw2 !== "mi" && raw2 !== "ft" && raw2 !== "custom") {
        parsed.measurement.displayUnit = "km";
      }
    }
    (_i = (_h = parsed.measurement).customUnitPxPerUnit) != null ? _i : _h.customUnitPxPerUnit = {};
    if (!Array.isArray(parsed.measurement.travelTimePresetIds)) {
      parsed.measurement.travelTimePresetIds = [];
    }
    if (typeof parsed.measurement.travelDaysEnabled !== "boolean") {
      parsed.measurement.travelDaysEnabled = false;
    }
    if (typeof parsed.measurement.travelDayPresetId !== "string" || !parsed.measurement.travelDayPresetId.trim()) {
      delete parsed.measurement.travelDayPresetId;
    }
    (_j = parsed.pinSizeOverrides) != null ? _j : parsed.pinSizeOverrides = {};
    if (typeof parsed.panClamp !== "boolean") {
      parsed.panClamp = true;
    }
    (_k = parsed.drawLayers) != null ? _k : parsed.drawLayers = [];
    (_l = parsed.drawings) != null ? _l : parsed.drawings = [];
    (_m = parsed.grids) != null ? _m : parsed.grids = [];
    parsed.grids = parsed.grids.map((g) => {
      var _a2;
      return {
        id: g.id,
        name: (_a2 = g.name) != null ? _a2 : "Grid",
        visible: typeof g.visible === "boolean" ? g.visible : true,
        boundBase: typeof g.boundBase === "string" && g.boundBase.trim() ? g.boundBase : void 0,
        shape: g.shape === "hex" ? "hex" : "square",
        color: typeof g.color === "string" && g.color.trim() ? g.color : "#ffffff",
        width: Number.isFinite(g.width) && g.width > 0 ? g.width : 1,
        opacity: Number.isFinite(g.opacity) ? Math.min(Math.max(g.opacity, 0), 1) : 0.5,
        spacing: Number.isFinite(g.spacing) && g.spacing > 1 ? g.spacing : 64,
        offsetX: Number.isFinite(g.offsetX) ? g.offsetX : 0,
        offsetY: Number.isFinite(g.offsetY) ? g.offsetY : 0,
        playerScreen: g.playerScreen === "player-only" || g.playerScreen === "gm-only" ? g.playerScreen : "both"
      };
    });
    (_n = parsed.textLayers) != null ? _n : parsed.textLayers = [];
    parsed.textLayers = parsed.textLayers.map((layer) => {
      var _a2;
      const legacy = layer;
      const boxes = Array.isArray(layer.boxes) ? layer.boxes : [];
      const migratedLegacyBox = boxes.length === 0 ? buildLegacyTextBoxFromLayer(legacy) : null;
      return {
        id: layer.id,
        name: (_a2 = layer.name) != null ? _a2 : "Text layer",
        visible: typeof layer.visible === "boolean" ? layer.visible : true,
        locked: !!layer.locked,
        boundBase: typeof layer.boundBase === "string" && layer.boundBase.trim() ? layer.boundBase : void 0,
        autoFlow: typeof layer.autoFlow === "boolean" ? layer.autoFlow : void 0,
        allowAngledBaselines: typeof layer.allowAngledBaselines === "boolean" ? layer.allowAngledBaselines : void 0,
        style: layer.style,
        boxes: boxes.length > 0 ? boxes : migratedLegacyBox ? [migratedLegacyBox] : []
      };
    });
    (_o = parsed.secondScreen) != null ? _o : parsed.secondScreen = {};
    if (!Array.isArray(parsed.secondScreen.markerLayerIds)) delete parsed.secondScreen.markerLayerIds;
    if (!Array.isArray(parsed.secondScreen.drawLayerIds)) delete parsed.secondScreen.drawLayerIds;
    if (!Array.isArray(parsed.secondScreen.textLayerIds)) delete parsed.secondScreen.textLayerIds;
    if (typeof parsed.secondScreen.notePath !== "string" || !parsed.secondScreen.notePath.trim()) {
      delete parsed.secondScreen.notePath;
    }
    if (typeof parsed.secondScreen.showGrids !== "boolean") {
      parsed.secondScreen.showGrids = true;
      delete parsed.secondScreen.notePath;
    }
    if (typeof parsed.secondScreen.markersPath !== "string" || !parsed.secondScreen.markersPath.trim()) {
      delete parsed.secondScreen.markersPath;
    }
    (_p = parsed.deleted) != null ? _p : parsed.deleted = [];
    parsed.deleted = ((_q = sanitizeDeletedUndoEntries(parsed.deleted)) != null ? _q : []).slice(0, 3);
    return parsed;
  }
  async save(data) {
    const f = this.getFileByPath(this.markersFilePath);
    const content = this.serialize(data);
    if (!f) {
      await this.create(content);
    } else {
      await this.app.vault.modify(f, content);
    }
  }
  async wouldChange(data) {
    const f = this.getFileByPath(this.markersFilePath);
    const next = this.serialize(data);
    if (!f) return true;
    const cur = await this.app.vault.read(f);
    return cur !== next;
  }
  async addMarker(data, m) {
    data.markers.push(m);
    await this.save(data);
    return data;
  }
  async updateLayers(data, layers) {
    data.layers = layers.map((l) => ({ ...l, locked: !!l.locked }));
    await this.save(data);
    return data;
  }
  getFileByPath(path) {
    const af = this.app.vault.getAbstractFileByPath(path);
    return af instanceof import_obsidian.TFile ? af : null;
  }
  async ensureFolderExists(path) {
    if (!path) return;
    if (this.app.vault.getAbstractFileByPath(path)) return;
    try {
      await this.app.vault.createFolder(path);
    } catch (err) {
      if (this.app.vault.getAbstractFileByPath(path)) return;
      throw err;
    }
  }
  async create(content) {
    const dir = this.markersFilePath.split("/").slice(0, -1).join("/");
    await this.ensureFolderExists(dir);
    try {
      await this.app.vault.create(this.markersFilePath, content);
    } catch (err) {
      if (this.getFileByPath(this.markersFilePath)) return;
      throw err;
    }
  }
};
function buildLegacyTextBoxFromLayer(layer) {
  const rect = normalizeLegacyRect(layer.rect);
  const lines = normalizeLegacyLines(layer.lines);
  const finalRect = rect != null ? rect : deriveRectFromLegacyLines(lines);
  if (!finalRect) return null;
  const mode = layer.mode === "auto" ? "auto" : "custom";
  return {
    id: generateId("tbox"),
    name: typeof layer.name === "string" && layer.name.trim() ? `${layer.name} box` : "Text box",
    mode,
    rect: finalRect,
    lines,
    auto: mode === "auto" ? layer.auto : void 0,
    sourceDrawingId: typeof layer.sourceDrawingId === "string" && layer.sourceDrawingId.trim() ? layer.sourceDrawingId : void 0,
    sourceDrawingKind: layer.sourceDrawingKind === "polygon" || layer.sourceDrawingKind === "polyline" || layer.sourceDrawingKind === "rect" || layer.sourceDrawingKind === "circle" ? layer.sourceDrawingKind : void 0,
    style: layer.style,
    locked: typeof layer.locked === "boolean" ? layer.locked : void 0,
    autoFlow: typeof layer.autoFlow === "boolean" ? layer.autoFlow : void 0,
    allowAngledBaselines: typeof layer.allowAngledBaselines === "boolean" ? layer.allowAngledBaselines : void 0
  };
}
function normalizeLegacyRect(rect) {
  if (!rect) return null;
  if (!Number.isFinite(rect.x0) || !Number.isFinite(rect.y0) || !Number.isFinite(rect.x1) || !Number.isFinite(rect.y1)) {
    return null;
  }
  return {
    x0: rect.x0,
    y0: rect.y0,
    x1: rect.x1,
    y1: rect.y1
  };
}
function normalizeLegacyLines(lines) {
  if (!Array.isArray(lines)) return [];
  return lines.filter((ln) => {
    return !!ln && Number.isFinite(ln.x0) && Number.isFinite(ln.y0) && Number.isFinite(ln.x1) && Number.isFinite(ln.y1);
  });
}
function deriveRectFromLegacyLines(lines) {
  if (!lines.length) return null;
  const xs = lines.flatMap((ln) => [ln.x0, ln.x1]);
  const ys = lines.flatMap((ln) => [ln.y0, ln.y1]);
  return {
    x0: Math.min(...xs),
    y0: Math.min(...ys),
    x1: Math.max(...xs),
    y1: Math.max(...ys)
  };
}
function isBaseImage(x) {
  return !!x && typeof x === "object" && "path" in x && typeof x.path === "string";
}

// src/markerEditor.ts
var import_obsidian2 = require("obsidian");
function tintSvgMarkup(svg, color) {
  var _a;
  const c = color.trim();
  if (!c) return svg;
  try {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    const root = doc.querySelector("svg");
    if (!root) return svg;
    const inner = (_a = root.querySelector("#zm-inner")) != null ? _a : root;
    const base = root.querySelector("#zm-base");
    const outline = root.querySelector("#zm-outline");
    const shapes = inner.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse");
    let touched = false;
    shapes.forEach((el) => {
      var _a2, _b;
      if (base && base.contains(el)) return;
      if (outline && outline.contains(el)) return;
      const styleFill = (_a2 = el.style) == null ? void 0 : _a2.fill;
      const styleStroke = (_b = el.style) == null ? void 0 : _b.stroke;
      const fillAttr = el.getAttribute("fill");
      const strokeAttr = el.getAttribute("stroke");
      const hasFill = typeof styleFill === "string" && styleFill && styleFill.toLowerCase() !== "none" || typeof fillAttr === "string" && fillAttr && fillAttr.toLowerCase() !== "none";
      const hasStroke = typeof styleStroke === "string" && styleStroke && styleStroke.toLowerCase() !== "none" || typeof strokeAttr === "string" && strokeAttr && strokeAttr.toLowerCase() !== "none";
      if (hasFill) {
        el.style.fill = c;
        el.setAttribute("fill", c);
        touched = true;
      }
      if (hasStroke) {
        el.style.stroke = c;
        el.setAttribute("stroke", c);
        touched = true;
      }
    });
    if (!touched) {
      inner.setAttribute("fill", c);
    }
    return new XMLSerializer().serializeToString(root);
  } catch (e) {
    return svg;
  }
}
var MarkerEditorModal = class extends import_obsidian2.Modal {
  constructor(app, plugin, data, marker, onResult) {
    var _a;
    super(app);
    this.suggestionsEl = null;
    this.allSuggestions = [];
    this.filteredSuggestions = [];
    this.selectedSuggestionIndex = -1;
    this.plugin = plugin;
    this.data = data;
    this.marker = { type: (_a = marker.type) != null ? _a : "pin", ...marker };
    this.onResult = onResult;
  }
  findSwapPresetById(id) {
    var _a, _b, _c;
    const cols = (_a = this.plugin.settings.baseCollections) != null ? _a : [];
    for (const col of cols) {
      const list = (_c = (_b = col == null ? void 0 : col.include) == null ? void 0 : _b.swapPins) != null ? _c : [];
      const found = list.find((sp) => (sp == null ? void 0 : sp.id) === id);
      if (found && Array.isArray(found.frames)) return found;
    }
    return null;
  }
  normalizeSwapFrameIndex(m, preset) {
    const rawIndex = typeof m.swapIndex === "number" ? m.swapIndex : 0;
    const count = preset.frames.length || 1;
    return (rawIndex % count + count) % count;
  }
  cleanupSwapLinks() {
    if (this.marker.type !== "swap") return;
    const links = this.marker.swapLinks;
    if (!links || typeof links !== "object") {
      delete this.marker.swapLinks;
      return;
    }
    for (const k of Object.keys(links)) {
      const v = links[Number(k)];
      if (typeof v !== "string" || !v.trim()) delete links[Number(k)];
    }
    if (Object.keys(links).length === 0) delete this.marker.swapLinks;
  }
  buildLinkSuggestions() {
    var _a, _b, _c, _d;
    const files = this.app.vault.getFiles().filter((f) => {
      var _a2;
      return ((_a2 = f.extension) == null ? void 0 : _a2.toLowerCase()) === "md";
    });
    const suggestions = [];
    const active = this.app.workspace.getActiveFile();
    const fromPath = (_c = (_b = active == null ? void 0 : active.path) != null ? _b : (_a = files[0]) == null ? void 0 : _a.path) != null ? _c : "";
    for (const file of files) {
      const baseLink = this.app.metadataCache.fileToLinktext(file, fromPath);
      suggestions.push({ label: baseLink, value: baseLink });
      const cache = this.app.metadataCache.getCache(file.path);
      const headings = (_d = cache == null ? void 0 : cache.headings) != null ? _d : [];
      for (const h of headings) {
        const headingName = h.heading;
        const full = `${baseLink}#${headingName}`;
        suggestions.push({
          label: `${baseLink} \u203A ${headingName}`,
          value: full
        });
      }
    }
    this.allSuggestions = suggestions;
  }
  showLinkSuggestions() {
    if (!this.suggestionsEl) return;
    this.suggestionsEl.classList.remove("is-hidden");
  }
  hideLinkSuggestions() {
    if (!this.suggestionsEl) return;
    this.suggestionsEl.classList.add("is-hidden");
    this.suggestionsEl.empty();
    this.filteredSuggestions = [];
    this.selectedSuggestionIndex = -1;
  }
  updateLinkSuggestions(input) {
    if (!this.suggestionsEl) return;
    const query = input.trim().toLowerCase();
    this.suggestionsEl.empty();
    this.filteredSuggestions = [];
    this.selectedSuggestionIndex = -1;
    if (!query) {
      this.hideLinkSuggestions();
      return;
    }
    const maxItems = 20;
    const matches = this.allSuggestions.filter(
      (s) => s.value.toLowerCase().includes(query) || s.label.toLowerCase().includes(query)
    ).slice(0, maxItems);
    if (matches.length === 0) {
      this.hideLinkSuggestions();
      return;
    }
    this.filteredSuggestions = matches;
    this.showLinkSuggestions();
    matches.forEach((s, i) => {
      const row = this.suggestionsEl.createDiv({
        cls: "zoommap-link-suggestion-item"
      });
      row.setText(s.label);
      if (i === 0) {
        row.classList.add("is-selected");
        this.selectedSuggestionIndex = 0;
      }
      row.addEventListener("mousedown", (ev) => {
        ev.preventDefault();
        this.applyLinkSuggestion(i);
      });
    });
  }
  moveLinkSuggestionSelection(delta) {
    if (!this.suggestionsEl) return;
    const n = this.filteredSuggestions.length;
    if (n === 0) return;
    let idx = this.selectedSuggestionIndex;
    if (idx < 0) idx = 0;
    idx = (idx + delta + n) % n;
    this.selectedSuggestionIndex = idx;
    const rows = this.suggestionsEl.querySelectorAll(
      ".zoommap-link-suggestion-item"
    );
    rows.forEach((row, i) => {
      if (i === idx) row.classList.add("is-selected");
      else row.classList.remove("is-selected");
    });
    const sel = rows[idx];
    if (sel) sel.scrollIntoView({ block: "nearest" });
  }
  applyLinkSuggestion(index) {
    if (!this.linkInput) return;
    if (index < 0 || index >= this.filteredSuggestions.length) return;
    const s = this.filteredSuggestions[index];
    this.linkInput.setValue(s.value);
    this.marker.link = s.value;
    this.hideLinkSuggestions();
    this.linkInput.inputEl.focus();
    const len = s.value.length;
    this.linkInput.inputEl.setSelectionRange(len, len);
  }
  zoomFactorToPercentString(f) {
    if (typeof f !== "number" || !Number.isFinite(f) || f <= 0) return "";
    return String(Math.round(f * 100));
  }
  parseZoomPercentInput(input) {
    let s = input.trim();
    if (!s) return void 0;
    if (s.endsWith("%")) s = s.slice(0, -1).trim();
    s = s.replace(",", ".");
    const n = Number(s);
    if (!Number.isFinite(n) || n <= 0) return void 0;
    return n / 100;
  }
  normalizeZoomRange() {
    let min = this.marker.minZoom;
    let max = this.marker.maxZoom;
    if (typeof min !== "number" || !Number.isFinite(min) || min <= 0) {
      min = void 0;
    }
    if (typeof max !== "number" || !Number.isFinite(max) || max <= 0) {
      max = void 0;
    }
    if (min === void 0 && max === void 0) {
      delete this.marker.minZoom;
      delete this.marker.maxZoom;
      return;
    }
    if (min !== void 0 && max !== void 0 && min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }
    if (min !== void 0) this.marker.minZoom = min;
    else delete this.marker.minZoom;
    if (max !== void 0) this.marker.maxZoom = max;
    else delete this.marker.maxZoom;
  }
  onOpen() {
    var _a, _b, _c, _d, _e;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", {
      text: this.marker.type === "sticker" ? "Edit sticker" : "Edit marker"
    });
    if (this.marker.type !== "sticker") {
      if (this.marker.type === "swap") {
        contentEl.createEl("h3", { text: "Swap pin (this marker only)" });
        const preset = this.marker.swapKey ? this.findSwapPresetById(this.marker.swapKey) : null;
        if (!preset) {
          contentEl.createEl("div", { text: "Swap preset not found. Cannot edit per-frame links." });
        } else {
          const idx = this.normalizeSwapFrameIndex(this.marker, preset);
          contentEl.createEl("div", { text: `Preset: ${preset.name} \u2022 Current frame: ${idx + 1}/${preset.frames.length}` });
          const overrides = (_b = (_a = this.marker).swapLinks) != null ? _b : _a.swapLinks = {};
          preset.frames.forEach((fr, i) => {
            var _a2, _b2;
            const presetLink = ((_a2 = fr.link) != null ? _a2 : "").trim();
            const iconDefault = (_b2 = this.plugin.getIconDefaultLink(fr.iconKey)) != null ? _b2 : "";
            const fallback = presetLink || iconDefault;
            const desc = fallback ? `Default: ${fallback}` : "Default: (none)";
            new import_obsidian2.Setting(contentEl).setName(`Frame ${i + 1}: ${fr.iconKey}`).setDesc(desc).addText((t) => {
              var _a3;
              t.setPlaceholder("Override link (optional)");
              t.setValue((_a3 = overrides[i]) != null ? _a3 : "");
              t.onChange((v) => {
                const s = v.trim();
                if (s) overrides[i] = s;
                else delete overrides[i];
                if (Object.keys(overrides).length === 0) {
                  delete this.marker.swapLinks;
                } else {
                  this.marker.swapLinks = overrides;
                }
              });
            });
          });
          new import_obsidian2.Setting(contentEl).setName("Clear all overrides").setDesc("Removes per-frame overrides from this marker (falls back to preset/icon defaults).").addButton((b) => {
            b.setButtonText("Clear").onClick(() => {
              delete this.marker.swapLinks;
              this.close();
              this.onResult({ action: "save", marker: this.marker, dataChanged: false });
            });
          });
        }
      } else {
        const linkSetting = new import_obsidian2.Setting(contentEl).setName("Link").setDesc("Wiki link (without [[ ]]). Supports note and note#heading.");
        linkSetting.addText((t) => {
          var _a2;
          this.linkInput = t;
          t.setPlaceholder("Folder/note or note#heading").setValue((_a2 = this.marker.link) != null ? _a2 : "").onChange((v) => {
            this.marker.link = v.trim();
            this.updateLinkSuggestions(v);
          });
          const wrapper = t.inputEl.parentElement;
          if (wrapper instanceof HTMLElement) {
            wrapper.classList.add("zoommap-link-input-wrapper");
            this.suggestionsEl = wrapper.createDiv({
              cls: "zoommap-link-suggestions is-hidden"
            });
          }
          this.buildLinkSuggestions();
          t.inputEl.addEventListener("keydown", (ev) => {
            if (!this.suggestionsEl) return;
            if (this.suggestionsEl.classList.contains("is-hidden")) return;
            if (ev.key === "ArrowDown") {
              ev.preventDefault();
              this.moveLinkSuggestionSelection(1);
            } else if (ev.key === "ArrowUp") {
              ev.preventDefault();
              this.moveLinkSuggestionSelection(-1);
            } else if (ev.key === "Enter") {
              if (this.selectedSuggestionIndex >= 0) {
                ev.preventDefault();
                this.applyLinkSuggestion(this.selectedSuggestionIndex);
              }
            } else if (ev.key === "Escape") {
              this.hideLinkSuggestions();
            }
          });
          t.inputEl.addEventListener("blur", () => {
            window.setTimeout(() => this.hideLinkSuggestions(), 150);
          });
        });
      }
      new import_obsidian2.Setting(contentEl).setName("Tooltip always on").setDesc("Show the tooltip even if this marker has a link.").addToggle((tg) => {
        tg.setValue(!!this.marker.tooltipAlwaysOn).onChange((on) => {
          if (on) {
            this.marker.tooltipAlwaysOn = true;
          } else {
            delete this.marker.tooltipAlwaysOn;
          }
        });
      });
      let labelPosSetting = null;
      let labelOffsetXSetting = null;
      let labelOffsetYSetting = null;
      const toggleLabelExtras = () => {
        const on = !!this.marker.tooltipLabelAlways;
        labelPosSetting == null ? void 0 : labelPosSetting.settingEl.toggle(on);
        labelOffsetXSetting == null ? void 0 : labelOffsetXSetting.settingEl.toggle(on);
        labelOffsetYSetting == null ? void 0 : labelOffsetYSetting.settingEl.toggle(on);
      };
      new import_obsidian2.Setting(contentEl).setName("Tooltip label always visible").setDesc("Renders the tooltip text as a label on the map (useful for village names).").addToggle((tg) => {
        tg.setValue(!!this.marker.tooltipLabelAlways).onChange((on) => {
          if (on) {
            this.marker.tooltipLabelAlways = true;
            if (!this.marker.tooltipLabelPosition) this.marker.tooltipLabelPosition = "below";
          } else {
            delete this.marker.tooltipLabelAlways;
          }
          toggleLabelExtras();
        });
      });
      labelPosSetting = new import_obsidian2.Setting(contentEl).setName("Tooltip label position").setDesc("Where to place the always-visible label relative to the pin anchor.").addDropdown((d) => {
        var _a2;
        d.addOption("below", "Below pin");
        d.addOption("above", "Above pin");
        d.setValue((_a2 = this.marker.tooltipLabelPosition) != null ? _a2 : "below");
        d.onChange((v) => {
          this.marker.tooltipLabelPosition = v === "above" ? "above" : "below";
        });
      });
      labelOffsetXSetting = new import_obsidian2.Setting(contentEl).setName("Label offset X (px)").addText((t) => {
        t.inputEl.type = "number";
        t.setPlaceholder("0");
        t.setValue(
          typeof this.marker.tooltipLabelOffsetX === "number" ? String(this.marker.tooltipLabelOffsetX) : "0"
        );
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (!Number.isFinite(n)) {
            delete this.marker.tooltipLabelOffsetX;
            return;
          }
          this.marker.tooltipLabelOffsetX = n;
        });
      });
      labelOffsetYSetting = new import_obsidian2.Setting(contentEl).setName("Label offset y (px)").setDesc("Positive moves the label down, negative moves it up.").addText((t) => {
        t.inputEl.type = "number";
        t.setPlaceholder("0");
        t.setValue(
          typeof this.marker.tooltipLabelOffsetY === "number" ? String(this.marker.tooltipLabelOffsetY) : "0"
        );
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (!Number.isFinite(n)) {
            delete this.marker.tooltipLabelOffsetY;
            return;
          }
          this.marker.tooltipLabelOffsetY = n;
        });
      });
      toggleLabelExtras();
      new import_obsidian2.Setting(contentEl).setName("Tooltip").addTextArea((a) => {
        var _a2;
        a.setPlaceholder("Optional tooltip text");
        a.inputEl.rows = 3;
        a.setValue((_a2 = this.marker.tooltip) != null ? _a2 : "");
        a.onChange((v) => {
          this.marker.tooltip = v;
        });
      });
      const zoomRow = new import_obsidian2.Setting(contentEl).setName("Zoom range (optional)").setDesc("(in %)");
      zoomRow.addText((t) => {
        t.setPlaceholder("Min (%)");
        t.setValue(this.zoomFactorToPercentString(this.marker.minZoom));
        t.onChange((v) => {
          const factor = this.parseZoomPercentInput(v);
          if (typeof factor === "number") this.marker.minZoom = factor;
          else delete this.marker.minZoom;
        });
      });
      zoomRow.addText((t) => {
        t.setPlaceholder("Max (%)");
        t.setValue(this.zoomFactorToPercentString(this.marker.maxZoom));
        t.onChange((v) => {
          const factor = this.parseZoomPercentInput(v);
          if (typeof factor === "number") this.marker.maxZoom = factor;
          else delete this.marker.maxZoom;
        });
      });
      new import_obsidian2.Setting(contentEl).setName("Scale like sticker").setDesc("Pin scales with the map (no inverse wrapper).").addToggle((tg) => {
        tg.setValue(!!this.marker.scaleLikeSticker).onChange((on) => {
          if (on) this.marker.scaleLikeSticker = true;
          else delete this.marker.scaleLikeSticker;
        });
      });
      if (this.marker.type !== "swap") {
        new import_obsidian2.Setting(contentEl).setName("Icon").setDesc("To set up new icons go to settings.").addDropdown((d) => {
          var _a2, _b2;
          const sortedIcons = [...(_a2 = this.plugin.settings.icons) != null ? _a2 : []].sort(
            (a, b) => {
              var _a3, _b3;
              return String((_a3 = a.key) != null ? _a3 : "").localeCompare(String((_b3 = b.key) != null ? _b3 : ""), void 0, {
                sensitivity: "base",
                numeric: true
              });
            }
          );
          for (const icon of sortedIcons) d.addOption(icon.key, icon.key);
          d.setValue((_b2 = this.marker.iconKey) != null ? _b2 : this.plugin.settings.defaultIconKey);
          d.onChange((v) => {
            this.marker.iconKey = v;
            updatePreview();
          });
        });
      }
      const colorRow = new import_obsidian2.Setting(contentEl).setName("Icon color").setDesc("Overrides the icon color for this marker (SVG icons only).");
      let colorTextEl;
      const colorPickerEl = colorRow.controlEl.createEl("input", {
        attr: {
          type: "color",
          style: "margin-left:8px; vertical-align: middle;"
        }
      });
      colorRow.addText((t) => {
        var _a2;
        t.setPlaceholder("#d23c3c");
        t.setValue((_a2 = this.marker.iconColor) != null ? _a2 : "");
        colorTextEl = t.inputEl;
        t.onChange((v) => {
          const c = v.trim();
          this.marker.iconColor = c || void 0;
          updatePreview();
        });
      });
      const existing = this.marker.iconColor;
      if (existing && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(existing)) {
        if (existing.length === 4) {
          const r = existing[1];
          const g = existing[2];
          const b = existing[3];
          colorPickerEl.value = `#${r}${r}${g}${g}${b}${b}`;
        } else {
          colorPickerEl.value = existing;
        }
      }
      colorPickerEl.oninput = () => {
        const c = colorPickerEl.value;
        colorTextEl.value = c;
        this.marker.iconColor = c;
        updatePreview();
      };
    }
    let newLayerName = "";
    const isExistingMarker = ((_c = this.data.markers) != null ? _c : []).some(
      (m) => m.id === this.marker.id
    );
    if (this.plugin.settings.preferActiveLayerInEditor && !isExistingMarker) {
      const active = (_e = (_d = this.data.layers.find((l) => l.visible && !l.locked)) != null ? _d : this.data.layers.find((l) => l.visible)) != null ? _e : this.data.layers[0];
      if (active) {
        this.marker.layer = active.id;
      }
    }
    new import_obsidian2.Setting(contentEl).setName("Layer").setDesc("Choose an existing layer or type a new name.").addDropdown((d) => {
      var _a2, _b2, _c2, _d2, _e2, _f;
      for (const l of this.data.layers) d.addOption(l.name, l.name);
      const current = (_f = (_e2 = (_c2 = (_a2 = this.data.layers.find((l) => l.id === this.marker.layer)) == null ? void 0 : _a2.name) != null ? _c2 : (_b2 = this.data.layers.find((l) => l.visible && !l.locked)) == null ? void 0 : _b2.name) != null ? _e2 : (_d2 = this.data.layers.find((l) => l.visible)) == null ? void 0 : _d2.name) != null ? _f : this.data.layers[0].name;
      d.setValue(current).onChange((v) => {
        const lyr = this.data.layers.find((l) => l.name === v);
        if (lyr) this.marker.layer = lyr.id;
      });
    }).addText(
      (t) => t.setPlaceholder("Create new layer (optional)").onChange((v) => {
        newLayerName = v.trim();
      })
    );
    if (this.marker.type === "sticker") {
      new import_obsidian2.Setting(contentEl).setName("Size").addText((t) => {
        var _a2;
        t.setPlaceholder("64");
        t.setValue(String((_a2 = this.marker.stickerSize) != null ? _a2 : 64));
        t.onChange((v) => {
          const n = Number(v);
          if (Number.isFinite(n) && n > 0) {
            this.marker.stickerSize = Math.round(n);
            updatePreview();
          }
        });
      });
    }
    new import_obsidian2.Setting(contentEl).setName("Size override (px)").setDesc("Overrides the icon default size and the map-wide pin size override for this marker only.").addText((t) => {
      t.setPlaceholder("Use icon default");
      t.inputEl.type = "number";
      t.setValue(
        typeof this.marker.sizeOverride === "number" && Number.isFinite(this.marker.sizeOverride) ? String(this.marker.sizeOverride) : ""
      );
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n) && n > 0) this.marker.sizeOverride = Math.round(n);
        else delete this.marker.sizeOverride;
      });
    });
    const preview = contentEl.createDiv({ cls: "zoommap-modal-preview" });
    preview.createSpan({ text: "Preview:" });
    const img = preview.createEl("img");
    const resolvePreview = () => {
      var _a2, _b2, _c2, _d2, _e2, _f;
      if (this.marker.type === "sticker") {
        let url2 = (_a2 = this.marker.stickerPath) != null ? _a2 : "";
        if (url2 && !url2.startsWith("data:")) {
          const file = this.app.vault.getAbstractFileByPath(url2);
          if (file instanceof import_obsidian2.TFile) {
            url2 = this.app.vault.getResourcePath(file);
          }
        }
        const size2 = Math.max(1, Math.round((_b2 = this.marker.stickerSize) != null ? _b2 : 64));
        return {
          url: url2,
          size: size2
        };
      }
      if (this.marker.type === "swap" && this.marker.swapKey) {
        const preset = this.findSwapPresetById(this.marker.swapKey);
        if (preset && preset.frames.length) {
          const idx = this.normalizeSwapFrameIndex(this.marker, preset);
          const frame = preset.frames[idx];
          const key = (frame == null ? void 0 : frame.iconKey) || this.plugin.settings.defaultIconKey;
          const baseIcon2 = (_c2 = this.plugin.settings.icons.find((i) => i.key === key)) != null ? _c2 : this.plugin.builtinIcon();
          const size2 = typeof this.marker.sizeOverride === "number" && Number.isFinite(this.marker.sizeOverride) && this.marker.sizeOverride > 0 ? Math.round(this.marker.sizeOverride) : baseIcon2.size;
          let url2 = baseIcon2.pathOrDataUrl;
          const color2 = (_d2 = this.marker.iconColor) == null ? void 0 : _d2.trim();
          if (color2 && url2 && url2.startsWith("data:image/svg+xml")) {
            const comma = url2.indexOf(",");
            if (comma >= 0) {
              try {
                const header = url2.slice(0, comma + 1);
                const payload = url2.slice(comma + 1);
                const svg = decodeURIComponent(payload);
                const tinted = tintSvgMarkup(svg, color2);
                url2 = header + encodeURIComponent(tinted);
              } catch (e) {
              }
            }
          }
          if (url2 && !url2.startsWith("data:")) {
            const file = this.app.vault.getAbstractFileByPath(url2);
            if (file instanceof import_obsidian2.TFile) url2 = this.app.vault.getResourcePath(file);
          }
          return { url: url2, size: size2 };
        }
      }
      const baseIcon = (_e2 = this.plugin.settings.icons.find(
        (i) => {
          var _a3;
          return i.key === ((_a3 = this.marker.iconKey) != null ? _a3 : this.plugin.settings.defaultIconKey);
        }
      )) != null ? _e2 : this.plugin.builtinIcon();
      const size = typeof this.marker.sizeOverride === "number" && Number.isFinite(this.marker.sizeOverride) && this.marker.sizeOverride > 0 ? Math.round(this.marker.sizeOverride) : baseIcon.size;
      let url = baseIcon.pathOrDataUrl;
      const color = (_f = this.marker.iconColor) == null ? void 0 : _f.trim();
      if (color && url && url.startsWith("data:image/svg+xml")) {
        const idx = url.indexOf(",");
        if (idx >= 0) {
          try {
            const header = url.slice(0, idx + 1);
            const payload = url.slice(idx + 1);
            const svg = decodeURIComponent(payload);
            const tinted = tintSvgMarkup(svg, color);
            url = header + encodeURIComponent(tinted);
          } catch (e) {
          }
        }
      }
      if (url && !url.startsWith("data:")) {
        const file = this.app.vault.getAbstractFileByPath(url);
        if (file instanceof import_obsidian2.TFile) {
          url = this.app.vault.getResourcePath(file);
        }
      }
      return { url, size };
    };
    const updatePreview = () => {
      const { url, size } = resolvePreview();
      img.src = url || "";
      img.style.width = `${size}px`;
      img.style.height = `${size}px`;
    };
    updatePreview();
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const btnSave = footer.createEl("button", { text: "Save" });
    const btnDelete = footer.createEl("button", {
      text: this.marker.type === "sticker" ? "Delete sticker" : "Delete marker"
    });
    const btnCancel = footer.createEl("button", { text: "Cancel" });
    btnSave.addEventListener("click", () => {
      let dataChanged = false;
      if (newLayerName) {
        const exists = this.data.layers.find((l) => l.name === newLayerName);
        if (!exists) {
          const id = `layer_${Math.random().toString(36).slice(2, 8)}`;
          this.data.layers.push({
            id,
            name: newLayerName,
            visible: true
          });
          this.marker.layer = id;
          dataChanged = true;
        }
      }
      if (this.marker.type !== "sticker") {
        this.normalizeZoomRange();
        if (typeof this.marker.minZoom !== "number") delete this.marker.minZoom;
        if (typeof this.marker.maxZoom !== "number") delete this.marker.maxZoom;
        if (!this.marker.scaleLikeSticker) delete this.marker.scaleLikeSticker;
        if (!this.marker.iconColor) delete this.marker.iconColor;
        if (!this.marker.tooltipAlwaysOn) delete this.marker.tooltipAlwaysOn;
        if (!this.marker.tooltipLabelAlways) delete this.marker.tooltipLabelAlways;
        if (this.marker.tooltipLabelAlways && !this.marker.tooltipLabelPosition) this.marker.tooltipLabelPosition = "below";
        if (!this.marker.tooltipLabelAlways) delete this.marker.tooltipLabelPosition;
        if (typeof this.marker.sizeOverride !== "number" || !Number.isFinite(this.marker.sizeOverride) || this.marker.sizeOverride <= 0) delete this.marker.sizeOverride;
        const normOffset = (x) => {
          if (typeof x !== "number" || !Number.isFinite(x)) return void 0;
          if (Math.abs(x) < 1e-9) return void 0;
          return x;
        };
        const ox = normOffset(this.marker.tooltipLabelOffsetX);
        const oy = normOffset(this.marker.tooltipLabelOffsetY);
        if (ox === void 0) delete this.marker.tooltipLabelOffsetX;
        else this.marker.tooltipLabelOffsetX = ox;
        if (oy === void 0) delete this.marker.tooltipLabelOffsetY;
        else this.marker.tooltipLabelOffsetY = oy;
      }
      if (this.marker.type === "swap") {
        this.cleanupSwapLinks();
      }
      this.close();
      this.onResult({
        action: "save",
        marker: this.marker,
        dataChanged
      });
    });
    btnDelete.addEventListener("click", () => {
      this.close();
      this.onResult({ action: "delete" });
    });
    btnCancel.addEventListener("click", () => {
      this.close();
      this.onResult({ action: "cancel" });
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/scaleCalibrateModal.ts
var import_obsidian3 = require("obsidian");
var ScaleCalibrateModal = class extends import_obsidian3.Modal {
  constructor(app, pxDistance, onOk, options) {
    super(app);
    this.inputValue = "1";
    this.unit = "km";
    this.pxDistance = pxDistance;
    this.onOk = onOk;
    this.options = options != null ? options : {};
    if (this.options.initialUnit) this.unit = this.options.initialUnit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Calibrate scale" });
    contentEl.createEl("div", {
      text: `Measured pixel distance: ${this.pxDistance.toFixed(1)} px`
    });
    new import_obsidian3.Setting(contentEl).setName("Real world length").addText((t) => {
      t.setPlaceholder("Example 2");
      t.setValue(this.inputValue);
      t.onChange((v) => {
        this.inputValue = v.trim();
      });
    }).addDropdown((d) => {
      var _a, _b, _c;
      d.addOption("m", "Meters");
      d.addOption("km", "Kilometers");
      d.addOption("mi", "Miles");
      d.addOption("ft", "Feet");
      const customUnits = ((_a = this.options.customUnits) != null ? _a : []).filter((u) => !!u && typeof u.id === "string" && u.id.trim().length > 0).slice().sort((a, b) => {
        var _a2, _b2;
        return ((_a2 = a.name) != null ? _a2 : a.id).localeCompare((_b2 = b.name) != null ? _b2 : b.id);
      });
      for (const u of customUnits) {
        const base = ((_b = u.name) != null ? _b : "").trim() || "Custom unit";
        const abbr = ((_c = u.abbreviation) != null ? _c : "").trim();
        const label = abbr ? `${base} (${abbr})` : base;
        d.addOption(`custom:${u.id}`, label);
      }
      const hasOption = (v) => Array.from(d.selectEl.options).some((o) => o.value === v);
      const initial = hasOption(String(this.unit)) ? String(this.unit) : "km";
      d.setValue(initial);
      d.onChange((v) => {
        this.unit = v;
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const ok = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    ok.addEventListener("click", () => {
      const val = Number(this.inputValue.replace(",", "."));
      if (!Number.isFinite(val) || val <= 0 || this.pxDistance <= 0) {
        this.close();
        return;
      }
      if (typeof this.unit === "string" && this.unit.startsWith("custom:")) {
        const id = this.unit.slice("custom:".length).trim();
        const pxPerUnit = this.pxDistance / val;
        this.close();
        this.onOk({
          unit: this.unit,
          customUnitId: id,
          pixelsPerUnit: pxPerUnit
        });
        return;
      }
      const meters = this.toMeters(val, this.unit);
      const mpp = meters / this.pxDistance;
      this.close();
      this.onOk({
        unit: this.unit,
        metersPerPixel: mpp
      });
    });
    cancel.addEventListener("click", () => this.close());
  }
  toMeters(v, u) {
    switch (u) {
      case "km":
        return v * 1e3;
      case "mi":
        return v * 1609.344;
      case "ft":
        return v * 0.3048;
      case "m":
      default:
        return v;
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/inlineStore.ts
var import_obsidian4 = require("obsidian");
var NoteMarkerStore = class {
  constructor(app, notePath, mapId, insertAfterLine) {
    this.app = app;
    this.notePath = notePath;
    this.mapId = mapId;
    this.insertAfterLine = insertAfterLine;
  }
  getPath() {
    return this.notePath;
  }
  headerLine() {
    return `ZOOMMAP-DATA id=${this.mapId}`;
  }
  footerLine() {
    return `/ZOOMMAP-DATA`;
  }
  async readNote() {
    const af = this.app.vault.getAbstractFileByPath(this.notePath);
    if (!(af instanceof import_obsidian4.TFile)) throw new Error(`Note not found: ${this.notePath}`);
    const text = await this.app.vault.read(af);
    return { file: af, text };
  }
  findBlock(text) {
    const header = this.headerLine();
    const footer = this.footerLine();
    const hIdx = text.indexOf(header);
    if (hIdx < 0) return null;
    const headerLineStart = text.lastIndexOf("\n", hIdx) + 1;
    const headerLineEnd = text.indexOf("\n", hIdx);
    const headerEnd = headerLineEnd === -1 ? text.length : headerLineEnd;
    const jsonStart = headerEnd + 1;
    const fIdx = text.indexOf(footer, jsonStart);
    if (fIdx < 0) return null;
    const footerLineStart = text.lastIndexOf("\n", fIdx) + 1;
    const footerLineEnd = text.indexOf("\n", fIdx);
    const endExclusive = footerLineEnd === -1 ? text.length : footerLineEnd + 1;
    const jsonEnd = footerLineStart - 1;
    return {
      start: headerLineStart,
      end: endExclusive,
      jsonStart,
      jsonEnd: Math.max(jsonStart, jsonEnd)
    };
  }
  async ensureExists(initialImagePath, size, markerLayerNames) {
    const { file } = await this.readNote();
    const baseLayers = markerLayerNames && markerLayerNames.length > 0 ? markerLayerNames.map((name, idx) => ({
      id: idx === 0 ? "default" : `layer_${idx}`,
      name: name || "Layer",
      visible: true,
      locked: false
    })) : [{ id: "default", name: "Default", visible: true, locked: false }];
    const data = {
      size,
      layers: baseLayers,
      markers: [],
      bases: initialImagePath ? [initialImagePath] : [],
      overlays: [],
      activeBase: initialImagePath != null ? initialImagePath : "",
      measurement: {
        displayUnit: "km",
        metersPerPixel: void 0,
        scales: {},
        customUnitId: void 0,
        customUnitPxPerUnit: {},
        travelTimePresetIds: [],
        travelDaysEnabled: false,
        travelDayPresetId: void 0
      },
      frame: void 0,
      pinSizeOverrides: {},
      grids: [],
      panClamp: true,
      drawLayers: [],
      drawings: [],
      textLayers: [],
      secondScreen: { showGrids: true }
    };
    const payload = JSON.stringify(sanitizeMarkerFileDataForSave(data), null, 2);
    const header = this.headerLine();
    const footer = this.footerLine();
    const block = `
%%
${header}
${payload}
${footer}
%%
`;
    await this.app.vault.process(file, (text) => {
      if (this.findBlock(text)) return text;
      let insertAt = text.length;
      if (typeof this.insertAfterLine === "number") {
        const lines = text.split("\n");
        const before = lines.slice(0, this.insertAfterLine + 1).join("\n");
        insertAt = before.length;
      }
      return text.slice(0, insertAt) + block + text.slice(insertAt);
    });
  }
  async load() {
    const { text } = await this.readNote();
    const blk = this.findBlock(text);
    if (!blk) throw new Error("Inline marker block not found.");
    const raw = text.slice(blk.jsonStart, blk.jsonEnd + 1).trim();
    return JSON.parse(raw);
  }
  async save(data) {
    const { file } = await this.readNote();
    const header = this.headerLine();
    const footer = this.footerLine();
    const payload = JSON.stringify(sanitizeMarkerFileDataForSave(data), null, 2);
    await this.app.vault.process(file, (text) => {
      const blk = this.findBlock(text);
      const replacement = `${header}
${payload}
${footer}
`;
      if (blk) {
        return text.slice(0, blk.start) + replacement + text.slice(blk.end);
      } else {
        return `${text}
%%
${header}
${payload}
${footer}
%%
`;
      }
    });
  }
  async wouldChange(data) {
    try {
      const cur = await this.load();
      const a = JSON.stringify(sanitizeMarkerFileDataForSave(cur), null, 2);
      const b = JSON.stringify(sanitizeMarkerFileDataForSave(data), null, 2);
      return a !== b;
    } catch (e) {
      return true;
    }
  }
};

// src/drawingEditorModal.ts
var import_obsidian6 = require("obsidian");

// src/markdownFileSuggest.ts
var import_obsidian5 = require("obsidian");
var MarkdownFileSuggestModal = class extends import_obsidian5.FuzzySuggestModal {
  constructor(app, onChoose) {
    super(app);
    this.appRef = app;
    this.onChoose = onChoose;
    this.files = this.appRef.vault.getFiles().filter((f) => {
      var _a;
      return ((_a = f.extension) == null ? void 0 : _a.toLowerCase()) === "md";
    }).sort((a, b) => a.path.localeCompare(b.path));
    this.setPlaceholder("Choose note\u2026");
  }
  getItems() {
    return this.files;
  }
  getItemText(item) {
    return item.path;
  }
  onChooseItem(item) {
    this.onChoose(item);
  }
};

// src/drawingEditorModal.ts
var DrawingEditorModal = class extends import_obsidian6.Modal {
  constructor(app, drawing, drawLayers, onResult) {
    var _a, _b, _c;
    super(app);
    this.allLinkSuggestions = [];
    this.original = drawing;
    this.drawLayers = Array.isArray(drawLayers) ? drawLayers.map((l) => ({ id: l.id, name: l.name })) : [];
    this.working = JSON.parse(JSON.stringify(drawing));
    this.onResult = onResult;
    (_b = (_a = this.working).style) != null ? _b : _a.style = {
      strokeColor: "#ff0000",
      strokeWidth: 2
    };
    if (this.working.layerId && !this.drawLayers.some((l) => l.id === this.working.layerId)) {
      this.drawLayers.unshift({ id: this.working.layerId, name: "Current layer" });
    }
    const s = this.working.style;
    const isPolyline = this.working.kind === "polyline";
    if (!s.strokeColor) s.strokeColor = "#ff0000";
    if (!Number.isFinite(s.strokeWidth) || s.strokeWidth <= 0) s.strokeWidth = 2;
    if (typeof s.strokeOpacity !== "number") s.strokeOpacity = 1;
    if (isPolyline) {
      if (typeof s.arrowEnd !== "boolean") s.arrowEnd = true;
      if (typeof s.distanceLabel !== "boolean") s.distanceLabel = true;
      delete s.fillColor;
      delete s.fillOpacity;
      delete s.fillPattern;
      delete s.fillPatternAngle;
      delete s.fillPatternSpacing;
      delete s.fillPatternStrokeWidth;
      delete s.fillPatternOpacity;
      return;
    }
    if (!s.fillColor) s.fillColor = "#ff0000";
    if (typeof s.fillOpacity !== "number") s.fillOpacity = 0.15;
    if (!s.fillPattern) s.fillPattern = s.fillColor ? "solid" : "none";
    if (typeof s.fillPatternAngle !== "number") s.fillPatternAngle = 45;
    if (typeof s.fillPatternSpacing !== "number" || s.fillPatternSpacing <= 0) {
      s.fillPatternSpacing = 8;
    }
    if (typeof s.fillPatternStrokeWidth !== "number" || s.fillPatternStrokeWidth <= 0) {
      s.fillPatternStrokeWidth = 1;
    }
    if (typeof s.fillPatternOpacity !== "number") {
      s.fillPatternOpacity = (_c = s.fillOpacity) != null ? _c : 0.15;
    }
  }
  onOpen() {
    var _a, _b, _c, _d;
    const { contentEl } = this;
    contentEl.empty();
    const canBeRegion = this.working.kind !== "polyline";
    const isPolyline = this.working.kind === "polyline";
    this.buildLinkSuggestions();
    contentEl.createEl("h2", { text: isPolyline ? "Edit polyline" : "Edit drawing" });
    const style = this.working.style;
    if (!isPolyline) {
      new import_obsidian6.Setting(contentEl).setName("Label").addText((t) => {
        var _a2;
        t.setPlaceholder("Label");
        t.setValue((_a2 = style.label) != null ? _a2 : "");
        t.inputEl.classList.add("zoommap-drawing-editor__label-input");
        t.onChange((v) => {
          style.label = v.trim() || void 0;
        });
      });
    }
    this.renderLayerSetting(contentEl);
    const strokeHeading = contentEl.createDiv({
      cls: "zoommap-drawing-editor__section-heading"
    });
    strokeHeading.textContent = "Stroke";
    const strokePatternSetting = new import_obsidian6.Setting(contentEl).setName("Pattern");
    strokePatternSetting.addDropdown((dd) => {
      dd.addOption("solid", "Solid");
      dd.addOption("dashed", "Dashed");
      dd.addOption("dotted", "Dotted");
      const dash = style.strokeDash;
      let current = "solid";
      if (Array.isArray(dash) && dash.length > 0) {
        current = dash[0] <= 3 ? "dotted" : "dashed";
      }
      dd.setValue(current);
      dd.onChange((v) => {
        if (v === "solid") {
          style.strokeDash = void 0;
        } else if (v === "dashed") {
          style.strokeDash = [8, 4];
        } else {
          style.strokeDash = [2, 4];
        }
      });
    });
    const strokeColorSetting = new import_obsidian6.Setting(contentEl).setName("Color");
    const strokeColorText = strokeColorSetting.controlEl.createEl("input", {
      type: "text"
    });
    strokeColorText.classList.add("zoommap-drawing-editor__color-text");
    strokeColorText.value = (_a = style.strokeColor) != null ? _a : "#ff0000";
    const strokeColorPicker = strokeColorSetting.controlEl.createEl("input", {
      type: "color"
    });
    strokeColorPicker.classList.add("zoommap-drawing-editor__color-picker");
    strokeColorPicker.value = this.normalizeHex((_b = style.strokeColor) != null ? _b : "#ff0000");
    strokeColorText.oninput = () => {
      const val = strokeColorText.value.trim() || "#ff0000";
      style.strokeColor = val;
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
        strokeColorPicker.value = this.normalizeHex(val);
      }
    };
    strokeColorPicker.oninput = () => {
      const hex = strokeColorPicker.value;
      strokeColorText.value = hex;
      style.strokeColor = hex;
    };
    new import_obsidian6.Setting(contentEl).setName("Width").addText((t) => {
      var _a2;
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setValue(String((_a2 = style.strokeWidth) != null ? _a2 : 2));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n > 0) {
          style.strokeWidth = n;
        }
      });
    });
    new import_obsidian6.Setting(contentEl).setName("Opacity").addText((t) => {
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("100");
      t.setValue(this.toPercent(style.strokeOpacity, 100));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) {
          style.strokeOpacity = void 0;
          return;
        }
        const clamped = this.clamp(n, 0, 100);
        style.strokeOpacity = clamped / 100;
      });
    });
    if (isPolyline) {
      new import_obsidian6.Setting(contentEl).setName("Arrow at end").addToggle((tg) => {
        tg.setValue(!!style.arrowEnd).onChange((on) => {
          style.arrowEnd = on ? true : void 0;
        });
      });
      new import_obsidian6.Setting(contentEl).setName("Distance label").setDesc("Uses the current map scale + unit settings.").addToggle((tg) => {
        tg.setValue(!!style.distanceLabel).onChange((on) => {
          style.distanceLabel = on ? true : void 0;
        });
      });
      const footer2 = contentEl.createDiv({ cls: "zoommap-modal-footer" });
      const saveBtn2 = footer2.createEl("button", { text: "Save" });
      const deleteBtn2 = footer2.createEl("button", { text: "Delete" });
      const cancelBtn2 = footer2.createEl("button", { text: "Cancel" });
      saveBtn2.onclick = () => {
        this.normalizeStyle(this.working);
        this.working.id = this.original.id;
        this.working.kind = this.original.kind;
        this.working.rect = this.original.rect;
        this.working.circle = this.original.circle;
        this.working.polygon = this.original.polygon;
        this.working.polyline = this.original.polyline;
        this.close();
        this.onResult({ action: "save", drawing: this.working });
      };
      deleteBtn2.onclick = () => {
        this.close();
        this.onResult({ action: "delete" });
      };
      cancelBtn2.onclick = () => {
        this.close();
        this.onResult({ action: "cancel" });
      };
      return;
    }
    const fillHeading = contentEl.createDiv({
      cls: "zoommap-drawing-editor__section-heading"
    });
    fillHeading.textContent = "Fill";
    const fillPatternSetting = new import_obsidian6.Setting(contentEl).setName("Pattern");
    fillPatternSetting.addDropdown((dd) => {
      var _a2;
      dd.addOption("none", "None");
      dd.addOption("solid", "Solid");
      dd.addOption("striped", "Striped");
      dd.addOption("cross", "Cross");
      dd.addOption("wavy", "Wavy");
      const current = (_a2 = style.fillPattern) != null ? _a2 : style.fillColor ? "solid" : "none";
      dd.setValue(current);
      dd.onChange((v) => {
        const kind = v;
        style.fillPattern = kind;
      });
    });
    const fillColorSetting = new import_obsidian6.Setting(contentEl).setName("Base color");
    const fillColorText = fillColorSetting.controlEl.createEl("input", {
      type: "text"
    });
    fillColorText.classList.add("zoommap-drawing-editor__color-text");
    fillColorText.value = (_c = style.fillColor) != null ? _c : "#ff0000";
    const fillColorPicker = fillColorSetting.controlEl.createEl("input", {
      type: "color"
    });
    fillColorPicker.classList.add("zoommap-drawing-editor__color-picker");
    fillColorPicker.value = this.normalizeHex((_d = style.fillColor) != null ? _d : "#ff0000");
    fillColorText.oninput = () => {
      const val = fillColorText.value.trim();
      if (!val) {
        style.fillColor = void 0;
        return;
      }
      style.fillColor = val;
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
        fillColorPicker.value = this.normalizeHex(val);
      }
    };
    fillColorPicker.oninput = () => {
      const hex = fillColorPicker.value;
      fillColorText.value = hex;
      style.fillColor = hex;
    };
    new import_obsidian6.Setting(contentEl).setName("Base opacity").addText((t) => {
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("15");
      t.setValue(this.toPercent(style.fillOpacity, ""));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) {
          style.fillOpacity = void 0;
          return;
        }
        const clamped = this.clamp(n, 0, 100);
        style.fillOpacity = clamped / 100;
      });
    });
    new import_obsidian6.Setting(contentEl).setName("Spacing").addText((t) => {
      var _a2;
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("8");
      t.setValue(String((_a2 = style.fillPatternSpacing) != null ? _a2 : 8));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n) || n <= 0) {
          style.fillPatternSpacing = void 0;
          return;
        }
        style.fillPatternSpacing = n;
      });
    });
    new import_obsidian6.Setting(contentEl).setName("Angle").addText((t) => {
      var _a2;
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("45");
      t.setValue(String((_a2 = style.fillPatternAngle) != null ? _a2 : 45));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) {
          style.fillPatternAngle = void 0;
          return;
        }
        style.fillPatternAngle = n;
      });
    });
    new import_obsidian6.Setting(contentEl).setName("Line width").addText((t) => {
      var _a2;
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("1");
      t.setValue(String((_a2 = style.fillPatternStrokeWidth) != null ? _a2 : 1));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n) || n <= 0) {
          style.fillPatternStrokeWidth = void 0;
          return;
        }
        style.fillPatternStrokeWidth = n;
      });
    });
    new import_obsidian6.Setting(contentEl).setName("Pattern opacity").addText((t) => {
      t.inputEl.type = "number";
      t.inputEl.classList.add("zoommap-drawing-editor__num-input");
      t.setPlaceholder("15");
      t.setValue(this.toPercent(style.fillPatternOpacity, ""));
      t.onChange((v) => {
        const n = Number(v);
        if (!Number.isFinite(n)) {
          style.fillPatternOpacity = void 0;
          return;
        }
        const clamped = this.clamp(n, 0, 100);
        style.fillPatternOpacity = clamped / 100;
      });
    });
    if (canBeRegion) {
      const regionHeading = contentEl.createDiv({
        cls: "zoommap-drawing-editor__section-heading"
      });
      regionHeading.textContent = "Region interaction";
      let regionLinkInput = null;
      new import_obsidian6.Setting(contentEl).setName("Region link").setDesc("Optional wiki link that opens when the region is clicked.").addText((t) => {
        var _a2;
        t.setPlaceholder("Note or note#heading");
        t.setValue((_a2 = style.regionLink) != null ? _a2 : "");
        regionLinkInput = t.inputEl;
        t.onChange((v) => {
          style.regionLink = v.trim() || void 0;
        });
        this.attachLinkAutocomplete(
          t.inputEl,
          () => {
            var _a3;
            return (_a3 = style.regionLink) != null ? _a3 : "";
          },
          (val) => {
            style.regionLink = val.trim() || void 0;
            t.inputEl.value = val;
          }
        );
      }).addButton((b) => {
        b.setButtonText("Pick\u2026").onClick(() => {
          new MarkdownFileSuggestModal(this.app, (file) => {
            var _a2;
            const active = this.app.workspace.getActiveFile();
            const fromPath = (_a2 = active == null ? void 0 : active.path) != null ? _a2 : file.path;
            const link = this.app.metadataCache.fileToLinktext(file, fromPath);
            style.regionLink = link;
            if (regionLinkInput) regionLinkInput.value = link;
          }).open();
        });
      });
      new import_obsidian6.Setting(contentEl).setName("Region tooltip").setDesc("Optional tooltip shown when hovering the region.").addTextArea((a) => {
        var _a2;
        a.inputEl.rows = 3;
        a.setPlaceholder("Region tooltip");
        a.setValue((_a2 = style.regionTooltip) != null ? _a2 : "");
        a.onChange((v) => {
          style.regionTooltip = v.trim() || void 0;
        });
      });
      new import_obsidian6.Setting(contentEl).setName("Hover preview popover").setDesc("If disabled, the region link stays clickable but no hover preview popover is opened.").addToggle((tg) => {
        tg.setValue(style.regionHoverPreview !== false).onChange((on) => {
          style.regionHoverPreview = on ? true : false;
        });
      });
      new import_obsidian6.Setting(contentEl).setName("Hide visual shape").setDesc("Makes the shape invisible, but keeps the region interactive for tooltip/link.").addToggle((tg) => {
        tg.setValue(!!style.regionInvisible).onChange((on) => {
          style.regionInvisible = on ? true : void 0;
        });
      });
    }
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const deleteBtn = footer.createEl("button", { text: "Delete" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      this.normalizeStyle(this.working);
      this.working.id = this.original.id;
      this.working.kind = this.original.kind;
      this.working.rect = this.original.rect;
      this.working.circle = this.original.circle;
      this.working.polygon = this.original.polygon;
      this.working.polyline = this.original.polyline;
      this.close();
      this.onResult({ action: "save", drawing: this.working });
    };
    deleteBtn.onclick = () => {
      this.close();
      this.onResult({ action: "delete" });
    };
    cancelBtn.onclick = () => {
      this.close();
      this.onResult({ action: "cancel" });
    };
  }
  onClose() {
    this.contentEl.empty();
  }
  normalizeHex(v) {
    if (!v.startsWith("#")) return v;
    if (v.length === 4) {
      const r = v[1];
      const g = v[2];
      const b = v[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return v;
  }
  buildLinkSuggestions() {
    var _a, _b, _c, _d;
    const files = this.app.vault.getFiles().filter((f) => {
      var _a2;
      return ((_a2 = f.extension) == null ? void 0 : _a2.toLowerCase()) === "md";
    });
    const suggestions = [];
    const active = this.app.workspace.getActiveFile();
    const fromPath = (_c = (_b = active == null ? void 0 : active.path) != null ? _b : (_a = files[0]) == null ? void 0 : _a.path) != null ? _c : "";
    for (const file of files) {
      const base = this.app.metadataCache.fileToLinktext(file, fromPath);
      suggestions.push({ label: base, value: base });
      const cache = this.app.metadataCache.getCache(file.path);
      const headings = (_d = cache == null ? void 0 : cache.headings) != null ? _d : [];
      for (const h of headings) {
        const heading = h.heading;
        const full = `${base}#${heading}`;
        suggestions.push({
          label: `${base} \u203A ${heading}`,
          value: full
        });
      }
    }
    this.allLinkSuggestions = suggestions;
  }
  attachLinkAutocomplete(input, getValue, setValue) {
    const wrapper = input.parentElement;
    if (!(wrapper instanceof HTMLElement)) return;
    wrapper.classList.add("zoommap-link-input-wrapper");
    const listEl = wrapper.createDiv({
      cls: "zoommap-link-suggestions is-hidden"
    });
    const hide = () => listEl.classList.add("is-hidden");
    const show = () => listEl.classList.remove("is-hidden");
    const update = (query) => {
      const q = query.trim().toLowerCase();
      listEl.empty();
      if (!q) {
        hide();
        return;
      }
      const matches = this.allLinkSuggestions.filter(
        (s) => s.value.toLowerCase().includes(q) || s.label.toLowerCase().includes(q)
      ).slice(0, 20);
      if (!matches.length) {
        hide();
        return;
      }
      show();
      for (const s of matches) {
        const row = listEl.createDiv({
          cls: "zoommap-link-suggestion-item"
        });
        row.setText(s.label);
        row.addEventListener("mousedown", (ev) => {
          ev.preventDefault();
          setValue(s.value);
          hide();
        });
      }
    };
    input.addEventListener("input", () => update(input.value));
    input.addEventListener("focus", () => update(getValue()));
    input.addEventListener("blur", () => {
      window.setTimeout(hide, 150);
    });
    hide();
  }
  renderLayerSetting(container) {
    if (!this.drawLayers.length) return;
    new import_obsidian6.Setting(container).setName("Draw layer").setDesc("Choose the draw layer for this drawing.").addDropdown((dd) => {
      var _a, _b;
      for (const layer of this.drawLayers) {
        dd.addOption(layer.id, layer.name || layer.id);
      }
      const fallback = (_b = (_a = this.drawLayers[0]) == null ? void 0 : _a.id) != null ? _b : this.working.layerId;
      dd.setValue(this.working.layerId || fallback);
      dd.onChange((v) => {
        this.working.layerId = v;
      });
    });
  }
  clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }
  toPercent(value, fallback) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      return String(fallback);
    }
    return String(Math.round(value * 100));
  }
  normalizeStyle(drawing) {
    var _a, _b;
    const style = drawing.style;
    if (!style.strokeColor) style.strokeColor = "#ff0000";
    if (!Number.isFinite(style.strokeWidth) || style.strokeWidth <= 0) {
      style.strokeWidth = 2;
    }
    if (typeof style.strokeOpacity === "number") {
      style.strokeOpacity = this.clamp(style.strokeOpacity, 0, 1);
      if (style.strokeOpacity === 1) delete style.strokeOpacity;
    }
    if (drawing.kind === "polyline") {
      if (!style.arrowEnd) delete style.arrowEnd;
      if (!style.distanceLabel) delete style.distanceLabel;
      delete style.fillPattern;
      delete style.fillColor;
      delete style.fillOpacity;
      delete style.fillPatternSpacing;
      delete style.fillPatternAngle;
      delete style.fillPatternStrokeWidth;
      delete style.fillPatternOpacity;
      delete style.label;
      delete style.regionLink;
      delete style.regionTooltip;
      delete style.regionInvisible;
      delete style.regionHoverPreview;
      return;
    }
    const pattern = (_a = style.fillPattern) != null ? _a : style.fillColor ? "solid" : "none";
    style.fillPattern = pattern;
    if (style.regionHoverPreview !== false) {
      style.regionHoverPreview = true;
    }
    if (pattern === "none") {
    } else if (pattern === "solid") {
      if (!style.fillColor) style.fillColor = "#ff0000";
      if (!Number.isFinite(style.fillOpacity)) style.fillOpacity = 0.15;
      delete style.fillPatternSpacing;
      delete style.fillPatternAngle;
      delete style.fillPatternStrokeWidth;
      delete style.fillPatternOpacity;
    } else {
      if (!style.fillColor) style.fillColor = "#ff0000";
      if (!Number.isFinite(style.fillOpacity)) style.fillOpacity = 0.15;
      if (!Number.isFinite(style.fillPatternSpacing) || style.fillPatternSpacing <= 0) {
        style.fillPatternSpacing = 8;
      }
      if (!Number.isFinite(style.fillPatternAngle)) {
        style.fillPatternAngle = 45;
      }
      if (!Number.isFinite(style.fillPatternStrokeWidth) || style.fillPatternStrokeWidth <= 0) {
        style.fillPatternStrokeWidth = 1;
      }
      if (!Number.isFinite(style.fillPatternOpacity)) {
        style.fillPatternOpacity = (_b = style.fillOpacity) != null ? _b : 0.15;
      }
      style.fillPatternOpacity = this.clamp(style.fillPatternOpacity, 0, 1);
    }
  }
};

// src/iconFileSuggest.ts
var import_obsidian7 = require("obsidian");
var ImageFileSuggestModal = class extends import_obsidian7.FuzzySuggestModal {
  constructor(app, onChoose) {
    super(app);
    this.appRef = app;
    this.onChoose = onChoose;
    const exts = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "svg", "webp"]);
    this.files = this.appRef.vault.getFiles().filter((f) => {
      var _a;
      const m = (_a = f.extension) == null ? void 0 : _a.toLowerCase();
      return exts.has(m);
    });
    this.setPlaceholder("Choose image file\u2026");
  }
  getItems() {
    return this.files;
  }
  getItemText(item) {
    return item.path;
  }
  onChooseItem(item) {
    this.onChoose(item);
  }
};

// src/namePrompt.ts
var import_obsidian8 = require("obsidian");
var NamePromptModal = class extends import_obsidian8.Modal {
  constructor(app, title, defaultName, onOk) {
    super(app);
    this.titleStr = title;
    this.value = defaultName;
    this.onOk = onOk;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.titleStr });
    new import_obsidian8.Setting(contentEl).setName("Name").addText((t) => {
      t.setPlaceholder("Layer name");
      t.setValue(this.value);
      t.onChange((v) => this.value = v);
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const ok = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Skip" });
    ok.onclick = () => {
      this.close();
      this.onOk(this.value.trim());
    };
    cancel.onclick = () => {
      this.close();
      this.onOk("");
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/layerManageModals.ts
var import_obsidian9 = require("obsidian");
var RenameLayerModal = class extends import_obsidian9.Modal {
  constructor(app, layer, onDone) {
    var _a;
    super(app);
    this.value = "";
    this.layer = layer;
    this.onDone = onDone;
    this.value = (_a = layer.name) != null ? _a : "";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Rename layer" });
    new import_obsidian9.Setting(contentEl).setName("New name").addText((t) => {
      t.setValue(this.value);
      t.onChange((v) => this.value = v.trim());
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const save = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    save.onclick = () => {
      const name = this.value || this.layer.name;
      this.close();
      this.onDone(name);
    };
    cancel.onclick = () => this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};
var DeleteLayerModal = class extends import_obsidian9.Modal {
  constructor(app, layer, targets, hasMarkers, onDone) {
    var _a, _b;
    super(app);
    this.mode = "delete-markers";
    this.targetId = "";
    this.layer = layer;
    this.targets = targets;
    this.hasMarkers = hasMarkers;
    this.onDone = onDone;
    this.targetId = (_b = (_a = targets[0]) == null ? void 0 : _a.id) != null ? _b : "";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Delete layer" });
    const canMove = this.targets.length > 0;
    const actionSetting = new import_obsidian9.Setting(contentEl).setName("Action");
    actionSetting.addDropdown((d) => {
      d.addOption("delete-markers", "Delete markers");
      if (canMove) d.addOption("move", "Move to layer");
      d.setValue(this.mode);
      d.onChange((v) => {
        this.mode = v;
        targetSetting.settingEl.toggle(this.mode === "move");
      });
    });
    const targetSetting = new import_obsidian9.Setting(contentEl).setName("Target layer").addDropdown((d) => {
      for (const t of this.targets) d.addOption(t.id, t.name);
      d.setValue(this.targetId);
      d.onChange((v) => this.targetId = v);
    });
    targetSetting.settingEl.toggle(this.mode === "move");
    if (!this.hasMarkers) {
      new import_obsidian9.Setting(contentEl).setDesc("This layer has no markers.");
    }
    if (!canMove) {
      new import_obsidian9.Setting(contentEl).setDesc("No other layer available to move markers.");
    }
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const confirm = footer.createEl("button", { text: "Confirm" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    confirm.onclick = () => {
      if (this.mode === "move") {
        if (!this.targetId) {
          this.close();
          return;
        }
        this.close();
        this.onDone({ mode: "move", targetId: this.targetId });
      } else {
        this.close();
        this.onDone({ mode: "delete-markers" });
      }
    };
    cancel.onclick = () => this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/pinSizeEditorModal.ts
var import_obsidian10 = require("obsidian");
var PinSizeEditorModal = class extends import_obsidian10.Modal {
  constructor(app, rows, onSave, focusIconKey) {
    super(app);
    this.inputs = /* @__PURE__ */ new Map();
    this.rows = rows;
    this.onSave = onSave;
    this.focusIconKey = focusIconKey;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Pin sizes for this map" });
    const info = contentEl.createEl("div", {
      text: "Set per-map sizes for pin icons. Leave the override empty to use the global default size from settings."
    });
    info.addClass("zoommap-pin-size-info");
    const list = contentEl.createDiv({ cls: "zoommap-pin-size-list" });
    for (const row of this.rows) {
      const r = list.createDiv({ cls: "zoommap-pin-size-row" });
      const img = r.createEl("img", { cls: "zoommap-pin-size-icon" });
      img.src = row.imgUrl;
      r.createEl("code", { text: row.iconKey, cls: "zoommap-pin-size-key" });
      r.createEl("span", {
        text: `${row.baseSize}px default`,
        cls: "zoommap-pin-size-base"
      });
      const overrideInput = r.createEl("input", {
        type: "number",
        cls: "zoommap-pin-size-input"
      });
      overrideInput.placeholder = String(row.baseSize);
      if (typeof row.override === "number" && row.override > 0 && row.override !== row.baseSize) {
        overrideInput.value = String(row.override);
      }
      r.createEl("span", {
        text: "Pixels on this map",
        cls: "zoommap-pin-size-label"
      });
      this.inputs.set(row.iconKey, overrideInput);
    }
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      const result = {};
      for (const row of this.rows) {
        const input = this.inputs.get(row.iconKey);
        if (!input) continue;
        const raw = input.value.trim();
        if (!raw) {
          result[row.iconKey] = void 0;
          continue;
        }
        const n = Number(raw);
        if (!Number.isFinite(n) || n <= 0) {
          result[row.iconKey] = void 0;
          continue;
        }
        if (Math.abs(n - row.baseSize) < 1e-4) {
          result[row.iconKey] = void 0;
        } else {
          result[row.iconKey] = Math.round(n);
        }
      }
      this.close();
      this.onSave(result);
    };
    cancelBtn.onclick = () => {
      this.close();
    };
    if (this.focusIconKey) {
      const input = this.inputs.get(this.focusIconKey);
      if (input) {
        window.setTimeout(() => {
          input.focus();
          input.select();
        }, 0);
      }
    }
  }
  onClose() {
    this.contentEl.empty();
    this.inputs.clear();
  }
};

// src/viewEditorModal.ts
var import_obsidian11 = require("obsidian");
var ViewEditorModal = class extends import_obsidian11.Modal {
  constructor(app, initial, onResult, opts) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    super(app);
    this.markersInputEl = null;
    this.cfg = JSON.parse(JSON.stringify(initial));
    this.onResult = onResult;
    this.onPreview = opts == null ? void 0 : opts.onPreview;
    if (!this.cfg.imageBases || this.cfg.imageBases.length === 0) {
      this.cfg.imageBases = [{ path: "", name: "" }];
    }
    (_b = (_a = this.cfg).overlays) != null ? _b : _a.overlays = [];
    (_d = (_c = this.cfg).markerLayers) != null ? _d : _c.markerLayers = ["Default"];
    (_e = this.cfg).width || (_e.width = "100%");
    (_f = this.cfg).height || (_f.height = "480px");
    (_g = this.cfg).renderMode || (_g.renderMode = "dom");
    (_h = this.cfg).resizeHandle || (_h.resizeHandle = "right");
    if (typeof this.cfg.viewportFrame !== "string") this.cfg.viewportFrame = "";
    (_j = (_i = this.cfg).viewportFrameInsets) != null ? _j : _i.viewportFrameInsets = {
      unit: "framePx",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    };
  }
  factorToPercentString(f) {
    if (typeof f !== "number" || !Number.isFinite(f) || f <= 0) return "";
    return String(Math.round(f * 100));
  }
  percentInputToFactor(input, fallback) {
    let s = input.trim();
    if (!s) return fallback;
    if (s.endsWith("%")) s = s.slice(0, -1).trim();
    s = s.replace(",", ".");
    const n = Number(s);
    if (!Number.isFinite(n) || n <= 0) return fallback;
    return n / 100;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("zoommap-view-editor");
    contentEl.createEl("h2", { text: "Edit view" });
    contentEl.createEl("h3", { text: "Base images" });
    const basesWrap = contentEl.createDiv({ cls: "zoommap-view-editor-section" });
    const renderBases = () => {
      basesWrap.empty();
      this.cfg.imageBases.forEach((b, idx) => {
        var _a, _b;
        const row = basesWrap.createDiv({ cls: "zoommap-view-editor-row" });
        const pathInput = row.createEl("input", {
          type: "text"
        });
        pathInput.addClass("zoommap-view-editor-input", "zoommap-view-editor-input-path");
        pathInput.placeholder = idx === 0 ? "Path to base image (required)" : "Path to additional base image";
        pathInput.value = (_a = b.path) != null ? _a : "";
        pathInput.oninput = () => {
          this.cfg.imageBases[idx].path = pathInput.value.trim();
          this.autoFillMarkersPathFromFirstBase();
        };
        const pickBtn = row.createEl("button", { text: "Pick\u2026" });
        pickBtn.addClass("zoommap-view-editor-button");
        pickBtn.onclick = () => {
          new ImageFileSuggestModal(this.app, (file) => {
            this.cfg.imageBases[idx].path = file.path;
            pathInput.value = file.path;
            this.autoFillMarkersPathFromFirstBase();
          }).open();
        };
        const nameInput = row.createEl("input", { type: "text" });
        nameInput.addClass("zoommap-view-editor-input", "zoommap-view-editor-input-name");
        nameInput.placeholder = "Optional display name";
        nameInput.value = (_b = b.name) != null ? _b : "";
        nameInput.oninput = () => {
          this.cfg.imageBases[idx].name = nameInput.value.trim() || void 0;
        };
        if (this.cfg.imageBases.length > 1) {
          const delBtn = row.createEl("button", { text: "\u2715" });
          delBtn.addClass("zoommap-view-editor-button", "zoommap-view-editor-button-delete");
          delBtn.onclick = () => {
            this.cfg.imageBases.splice(idx, 1);
            if (this.cfg.imageBases.length === 0) {
              this.cfg.imageBases.push({ path: "", name: "" });
            }
            renderBases();
          };
        }
      });
      const addBtn = basesWrap.createEl("button", { text: "Add base" });
      addBtn.addClass("zoommap-view-editor-button");
      addBtn.onclick = () => {
        this.cfg.imageBases.push({ path: "", name: "" });
        renderBases();
      };
    };
    renderBases();
    contentEl.createEl("h3", { text: "Overlays" });
    const overlaysWrap = contentEl.createDiv({ cls: "zoommap-view-editor-section" });
    const renderOverlays = () => {
      overlaysWrap.empty();
      this.cfg.overlays.forEach((o, idx) => {
        var _a, _b;
        const row = overlaysWrap.createDiv({ cls: "zoommap-view-editor-row" });
        const pathInput = row.createEl("input", { type: "text" });
        pathInput.addClass("zoommap-view-editor-input", "zoommap-view-editor-input-path");
        pathInput.placeholder = "Path to overlay image";
        pathInput.value = (_a = o.path) != null ? _a : "";
        pathInput.oninput = () => {
          this.cfg.overlays[idx].path = pathInput.value.trim();
        };
        const pickBtn = row.createEl("button", { text: "Pick\u2026" });
        pickBtn.addClass("zoommap-view-editor-button");
        pickBtn.onclick = () => {
          new ImageFileSuggestModal(this.app, (file) => {
            this.cfg.overlays[idx].path = file.path;
            pathInput.value = file.path;
          }).open();
        };
        const nameInput = row.createEl("input", { type: "text" });
        nameInput.addClass("zoommap-view-editor-input", "zoommap-view-editor-input-name");
        nameInput.placeholder = "Optional name";
        nameInput.value = (_b = o.name) != null ? _b : "";
        nameInput.oninput = () => {
          this.cfg.overlays[idx].name = nameInput.value.trim() || void 0;
        };
        const visLabel = row.createEl("label", { cls: "zoommap-view-editor-checkbox-label" });
        const visInput = visLabel.createEl("input", { type: "checkbox" });
        visInput.checked = !!o.visible;
        visInput.onchange = () => {
          this.cfg.overlays[idx].visible = visInput.checked;
        };
        visLabel.appendText("Visible");
        const delBtn = row.createEl("button", { text: "\u2715" });
        delBtn.addClass("zoommap-view-editor-button", "zoommap-view-editor-button-delete");
        delBtn.onclick = () => {
          this.cfg.overlays.splice(idx, 1);
          renderOverlays();
        };
      });
      const addBtn = overlaysWrap.createEl("button", { text: "Add overlay" });
      addBtn.addClass("zoommap-view-editor-button");
      addBtn.onclick = () => {
        this.cfg.overlays.push({ path: "", name: "", visible: true });
        renderOverlays();
      };
    };
    renderOverlays();
    contentEl.createEl("h3", { text: "Marker JSON" });
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Markers").setDesc("Optional. If empty, <firstBase>.markers.json is used.").addText((t) => {
      var _a;
      t.setPlaceholder("Path to markers.json");
      t.setValue((_a = this.cfg.markersPath) != null ? _a : "");
      this.markersInputEl = t.inputEl;
      t.onChange((v) => {
        this.cfg.markersPath = v.trim();
      });
    }).addButton(
      (b) => b.setButtonText("Use first base").onClick(() => {
        var _a;
        this.autoFillMarkersPathFromFirstBase(true);
        if (this.markersInputEl) this.markersInputEl.value = (_a = this.cfg.markersPath) != null ? _a : "";
      })
    );
    contentEl.createEl("h3", { text: "Marker layers (names)" });
    const layersWrap = contentEl.createDiv({ cls: "zoommap-view-editor-section" });
    const renderLayers = () => {
      layersWrap.empty();
      if (!this.cfg.markerLayers || this.cfg.markerLayers.length === 0) {
        this.cfg.markerLayers = ["Default"];
      }
      this.cfg.markerLayers.forEach((name, idx) => {
        const row = layersWrap.createDiv({ cls: "zoommap-view-editor-row" });
        const input = row.createEl("input", { type: "text" });
        input.addClass("zoommap-view-editor-input");
        input.placeholder = idx === 0 ? "Default" : "Layer name";
        input.value = name;
        input.oninput = () => {
          this.cfg.markerLayers[idx] = input.value.trim();
        };
        if (this.cfg.markerLayers.length > 1) {
          const delBtn = row.createEl("button", { text: "\u2715" });
          delBtn.addClass("zoommap-view-editor-button", "zoommap-view-editor-button-delete");
          delBtn.onclick = () => {
            this.cfg.markerLayers.splice(idx, 1);
            renderLayers();
          };
        }
      });
      const addBtn = layersWrap.createEl("button", { text: "Add layer" });
      addBtn.addClass("zoommap-view-editor-button");
      addBtn.onclick = () => {
        this.cfg.markerLayers.push("Layer");
        renderLayers();
      };
    };
    renderLayers();
    contentEl.createEl("h3", { text: "View & layout" });
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Render mode").setDesc("Prefer canvas for larger SVG maps.").addDropdown((d) => {
      var _a;
      d.addOption("dom", "DOM");
      d.addOption("canvas", "Canvas");
      d.setValue((_a = this.cfg.renderMode) != null ? _a : "dom");
      d.onChange((v) => {
        this.cfg.renderMode = v;
      });
    });
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Min zoom (%)").addText((t) => {
      t.setPlaceholder("25");
      t.setValue(this.factorToPercentString(this.cfg.minZoom));
      t.inputEl.classList.add("zoommap-view-editor-input--short");
      t.onChange((v) => {
        this.cfg.minZoom = this.percentInputToFactor(v, 0.25);
      });
    });
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Max zoom (%)").addText((t) => {
      t.setPlaceholder("200");
      t.setValue(this.factorToPercentString(this.cfg.maxZoom));
      t.inputEl.classList.add("zoommap-view-editor-input--short");
      t.onChange((v) => {
        this.cfg.maxZoom = this.percentInputToFactor(v, 8);
      });
    });
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Wrap").addDropdown((d) => {
      d.addOption("false", "False");
      d.addOption("true", "True");
      d.setValue(this.cfg.wrap ? "true" : "false");
      d.onChange((v) => {
        this.cfg.wrap = v === "true";
      });
    });
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Responsive").addDropdown((d) => {
      d.addOption("false", "False");
      d.addOption("true", "True");
      d.setValue(this.cfg.responsive ? "true" : "false");
      d.onChange((v) => {
        this.cfg.responsive = v === "true";
      });
    });
    const widthSetting = new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Width");
    widthSetting.addToggle((tg) => {
      tg.setValue(this.cfg.useWidth).onChange((on) => {
        this.cfg.useWidth = on;
      });
    });
    widthSetting.addText((t) => {
      var _a;
      t.setPlaceholder("100% or 640px");
      t.setValue((_a = this.cfg.width) != null ? _a : "");
      t.inputEl.classList.add("zoommap-view-editor-input--short");
      t.onChange((v) => {
        this.cfg.width = v.trim();
      });
    });
    {
      const hint = widthSetting.controlEl.createDiv({ cls: "zoommap-info-icon" });
      (0, import_obsidian11.setIcon)(hint, "info");
      hint.setAttr(
        "title",
        "Check to store a fixed width in YAML. Leave both unchecked to resize the map freely; each new size will be saved automatically in markers.json."
      );
    }
    const heightSetting = new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Height");
    heightSetting.addToggle((tg) => {
      tg.setValue(this.cfg.useHeight).onChange((on) => {
        this.cfg.useHeight = on;
      });
    });
    heightSetting.addText((t) => {
      var _a;
      t.setPlaceholder("480px");
      t.setValue((_a = this.cfg.height) != null ? _a : "");
      t.inputEl.classList.add("zoommap-view-editor-input--short");
      t.onChange((v) => {
        this.cfg.height = v.trim();
      });
    });
    {
      const hint = heightSetting.controlEl.createDiv({ cls: "zoommap-info-icon" });
      (0, import_obsidian11.setIcon)(hint, "info");
      hint.setAttr(
        "title",
        "Check to store a fixed height in YAML. Leave both unchecked to resize the map freely; each new size will be saved automatically in markers.json."
      );
    }
    let handleSetting = null;
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Resizable").addToggle((tg) => {
      tg.setValue(!!this.cfg.resizable).onChange((on) => {
        this.cfg.resizable = on;
        handleSetting == null ? void 0 : handleSetting.settingEl.toggle(on);
      });
    });
    handleSetting = new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Resize handle").addDropdown((d) => {
      var _a;
      d.addOption("native", "Native");
      d.addOption("left", "Left");
      d.addOption("right", "Right");
      d.addOption("both", "Both");
      d.setValue((_a = this.cfg.resizeHandle) != null ? _a : "native");
      d.onChange((v) => {
        this.cfg.resizeHandle = v;
      });
    });
    handleSetting.settingEl.toggle(!!this.cfg.resizable);
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Align").addDropdown((d) => {
      var _a;
      d.addOption("", "(none)");
      d.addOption("left", "Left");
      d.addOption("center", "Center");
      d.addOption("right", "Right");
      d.setValue((_a = this.cfg.align) != null ? _a : "");
      d.onChange((v) => {
        this.cfg.align = v || void 0;
      });
    });
    new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("ID = optional").setDesc("Stable identifier if you store markers inline in the note.").addText((t) => {
      var _a;
      t.setPlaceholder("Map-world-1");
      t.setValue((_a = this.cfg.id) != null ? _a : "");
      t.onChange((v) => {
        const val = v.trim();
        this.cfg.id = val.length ? val : void 0;
      });
    });
    contentEl.createEl("h3", { text: "Viewport frame" });
    let frameInputEl = null;
    const insets = this.cfg.viewportFrameInsets;
    const frameSetting = new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Frame image (optional)").setDesc("Drawn above the map. Supports overhang.");
    frameSetting.addText((t) => {
      var _a;
      t.setPlaceholder("Path to frame image.");
      t.setValue((_a = this.cfg.viewportFrame) != null ? _a : "");
      frameInputEl = t.inputEl;
      t.onChange((v) => {
        const s = v.trim();
        this.cfg.viewportFrame = s.length ? s : void 0;
      });
    });
    frameSetting.addButton(
      (b) => b.setButtonText("Pick\u2026").onClick(() => {
        new ImageFileSuggestModal(this.app, (file) => {
          this.cfg.viewportFrame = file.path;
          if (frameInputEl) frameInputEl.value = file.path;
        }).open();
      })
    );
    frameSetting.addButton(
      (b) => b.setButtonText("Clear").onClick(() => {
        this.cfg.viewportFrame = void 0;
        if (frameInputEl) frameInputEl.value = "";
      })
    );
    frameSetting.addButton(
      (b) => b.setButtonText("Update viewport").onClick(() => {
        if (!this.onPreview) {
          new import_obsidian11.Notice("No active map preview available.", 2e3);
          return;
        }
        this.onPreview(JSON.parse(JSON.stringify(this.cfg)));
        new import_obsidian11.Notice("Viewport updated (preview).", 1200);
      })
    );
    const unitSetting = new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName("Viewport insets unit").setDesc("Framepx = values in the frame image pixel space. Percent = 0..100 of the outer box.");
    unitSetting.addDropdown((d) => {
      d.addOption("framePx", "Framepx");
      d.addOption("percent", "Percent");
      d.setValue(insets.unit);
      d.onChange((v) => {
        insets.unit = v === "percent" ? "percent" : "framePx";
      });
    });
    const insetRow = (label, key) => {
      new import_obsidian11.Setting(contentEl).setClass("zoommap-view-editor-row").setName(`Inset ${label}`).addText((t) => {
        var _a;
        t.inputEl.type = "number";
        t.inputEl.classList.add("zoommap-view-editor-input--short");
        t.setPlaceholder("0");
        t.setValue(String((_a = insets[key]) != null ? _a : 0));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (!Number.isFinite(n) || n < 0) return;
          insets[key] = Math.round(n);
        });
      });
    };
    insetRow("Top", "top");
    insetRow("Right", "right");
    insetRow("Bottom", "bottom");
    insetRow("Left", "left");
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      var _a, _b, _c;
      const first = (_b = (_a = this.cfg.imageBases[0]) == null ? void 0 : _a.path) == null ? void 0 : _b.trim();
      if (!first) {
        new import_obsidian11.Notice("Please select at least one base image.", 2500);
        return;
      }
      this.normalizeZoomRange();
      this.autoFillMarkersPathFromFirstBase();
      const frame = ((_c = this.cfg.viewportFrame) != null ? _c : "").trim();
      this.cfg.viewportFrame = frame.length ? frame : void 0;
      if (!this.cfg.viewportFrame) {
        this.cfg.viewportFrameInsets = void 0;
      }
      this.close();
      this.onResult({ action: "save", config: this.cfg });
    };
    cancelBtn.onclick = () => {
      this.close();
      this.onResult({ action: "cancel" });
    };
  }
  onClose() {
    this.contentEl.empty();
    this.markersInputEl = null;
  }
  normalizeZoomRange() {
    let { minZoom, maxZoom } = this.cfg;
    if (!Number.isFinite(minZoom) || minZoom <= 0) minZoom = 0.25;
    if (!Number.isFinite(maxZoom) || maxZoom <= 0) maxZoom = 8;
    if (minZoom > maxZoom) [minZoom, maxZoom] = [maxZoom, minZoom];
    this.cfg.minZoom = minZoom;
    this.cfg.maxZoom = maxZoom;
  }
  autoFillMarkersPathFromFirstBase(force = false) {
    var _a, _b;
    const first = (_b = (_a = this.cfg.imageBases[0]) == null ? void 0 : _a.path) == null ? void 0 : _b.trim();
    if (!first) return;
    if (!force && this.cfg.markersPath && this.cfg.markersPath.trim().length > 0) {
      return;
    }
    const dot = first.lastIndexOf(".");
    const base = dot >= 0 ? first.slice(0, dot) : first;
    this.cfg.markersPath = `${base}.markers.json`;
  }
};

// src/collectionsModals.ts
var import_obsidian12 = require("obsidian");
function deepClone(x) {
  if (typeof structuredClone === "function") return structuredClone(x);
  const json = JSON.stringify(x);
  return JSON.parse(json);
}
var CollectionEditorModal = class extends import_obsidian12.Modal {
  constructor(app, plugin, collection, onDone) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    super(app);
    this.plugin = plugin;
    this.original = collection;
    this.working = deepClone(collection);
    this.working.bindings = (_a = this.working.bindings) != null ? _a : { basePaths: [] };
    this.working.bindings.basePaths = (_b = this.working.bindings.basePaths) != null ? _b : [];
    this.working.include = (_c = this.working.include) != null ? _c : {
      pinKeys: [],
      favorites: [],
      stickers: [],
      swapPins: [],
      pingPins: []
    };
    this.working.include.pinKeys = (_d = this.working.include.pinKeys) != null ? _d : [];
    this.working.include.favorites = (_e = this.working.include.favorites) != null ? _e : [];
    this.working.include.stickers = (_f = this.working.include.stickers) != null ? _f : [];
    this.working.include.swapPins = (_g = this.working.include.swapPins) != null ? _g : [];
    this.working.include.pingPins = (_h = this.working.include.pingPins) != null ? _h : [];
    this.onDone = onDone;
  }
  onOpen() {
    const { contentEl } = this;
    this.modalEl.addClass("zoommap-modal--wide");
    contentEl.empty();
    contentEl.createEl("h2", { text: "Edit collection" });
    new import_obsidian12.Setting(contentEl).setName("Name").addText((t) => {
      var _a;
      t.setValue((_a = this.working.name) != null ? _a : "");
      t.onChange((v) => {
        this.working.name = v.trim();
      });
    });
    contentEl.createEl("h3", { text: "Bindings (base images)" });
    const pathsWrap = contentEl.createDiv();
    const renderPaths = () => {
      pathsWrap.empty();
      if (!this.working.bindings.basePaths.length) {
        pathsWrap.createEl("div", { text: "No base images bound." });
      } else {
        this.working.bindings.basePaths.forEach((p, idx) => {
          const row = pathsWrap.createDiv({
            cls: "zoommap-collection-base-row"
          });
          const code = row.createEl("code", { text: p });
          code.addClass("zoommap-collection-base-path");
          const rm = row.createEl("button", { text: "Remove" });
          rm.onclick = () => {
            this.working.bindings.basePaths.splice(idx, 1);
            renderPaths();
          };
        });
      }
      const addBtn = pathsWrap.createEl("button", { text: "Add base image\u2026" });
      addBtn.onclick = () => {
        new ImageFileSuggestModal(this.app, (file) => {
          const path = file.path;
          if (!this.working.bindings.basePaths.includes(path)) {
            this.working.bindings.basePaths.push(path);
            renderPaths();
          }
        }).open();
      };
    };
    renderPaths();
    contentEl.createEl("h3", { text: "Pins (from icon library)" });
    const pinWrap = contentEl.createDiv();
    const renderPins = () => {
      var _a, _b;
      pinWrap.empty();
      pinWrap.createDiv({
        cls: "zoommap-collection-pin-hint",
        text: "Select pins from the icon library:"
      });
      const selected = new Set((_a = this.working.include.pinKeys) != null ? _a : []);
      const lib = ((_b = this.plugin.settings.icons) != null ? _b : []).filter((ico) => ico.inCollections !== false || selected.has(ico.key)).sort((a, b) => {
        var _a2, _b2;
        return String((_a2 = a.key) != null ? _a2 : "").localeCompare(String((_b2 = b.key) != null ? _b2 : ""), void 0, { sensitivity: "base", numeric: true });
      });
      if (lib.length === 0) {
        const none = pinWrap.createEl("div", {
          text: "No icons in library yet."
        });
        none.addClass("zoommap-muted");
      } else {
        const list = pinWrap.createDiv({ cls: "zoommap-collection-pin-grid" });
        lib.forEach((ico) => {
          var _a2;
          const cell = list.createDiv({ cls: "zoommap-collection-pin-cell" });
          const cb = cell.createEl("input", { type: "checkbox" });
          cb.checked = this.working.include.pinKeys.includes(ico.key);
          cb.onchange = () => {
            const arr = this.working.include.pinKeys;
            if (cb.checked) {
              if (!arr.includes(ico.key)) arr.push(ico.key);
            } else {
              const i = arr.indexOf(ico.key);
              if (i >= 0) arr.splice(i, 1);
            }
          };
          const img = cell.createEl("img");
          img.addClass("zoommap-collection-pin-icon");
          const src = (_a2 = ico.pathOrDataUrl) != null ? _a2 : "";
          if (typeof src === "string") {
            if (src.startsWith("data:")) {
              img.src = src;
            } else if (src) {
              const f = this.app.vault.getAbstractFileByPath(src);
              if (f instanceof import_obsidian12.TFile) {
                img.src = this.app.vault.getResourcePath(f);
              }
            }
          }
          const label = cell.createEl("span", { text: ico.key });
          label.addClass("zoommap-collection-pin-label");
        });
      }
    };
    renderPins();
    contentEl.createEl("h3", { text: "Favorites (presets)" });
    const favWrap = contentEl.createDiv();
    const renderFavs = () => {
      favWrap.empty();
      const list = this.working.include.favorites;
      if (list.length === 0) {
        const none = favWrap.createEl("div", {
          text: "No favorites in this collection."
        });
        none.addClass("zoommap-muted");
      }
      list.forEach((p, idx) => {
        var _a, _b, _c, _d, _e;
        const row = favWrap.createDiv({ cls: "zoommap-collection-fav-row" });
        const name = row.createEl("input", { type: "text" });
        name.value = (_a = p.name) != null ? _a : "";
        name.oninput = () => {
          p.name = name.value.trim();
        };
        const iconSel = row.createEl("select");
        const addOpt = (val, labelText) => {
          const o = iconSel.ownerDocument.createElement("option");
          o.value = val;
          o.textContent = labelText;
          iconSel.appendChild(o);
        };
        addOpt("", "(default)");
        {
          const pool = ((_b = this.plugin.settings.icons) != null ? _b : []).filter((ico) => {
            var _a2;
            return ico.inCollections !== false || ico.key === ((_a2 = p.iconKey) != null ? _a2 : "");
          }).sort((a, b) => {
            var _a2, _b2;
            return String((_a2 = a.key) != null ? _a2 : "").localeCompare(String((_b2 = b.key) != null ? _b2 : ""), void 0, { sensitivity: "base", numeric: true });
          });
          pool.forEach((ico) => addOpt(ico.key, ico.key));
        }
        iconSel.value = (_c = p.iconKey) != null ? _c : "";
        iconSel.onchange = () => {
          p.iconKey = iconSel.value || void 0;
        };
        const layer = row.createEl("input", { type: "text" });
        layer.placeholder = "Layer (optional)";
        layer.value = (_d = p.layerName) != null ? _d : "";
        layer.oninput = () => {
          p.layerName = layer.value.trim() || void 0;
        };
        const ed = row.createEl("input", { type: "checkbox" });
        ed.checked = !!p.openEditor;
        ed.onchange = () => {
          p.openEditor = ed.checked;
        };
        const link = row.createEl("input", { type: "text" });
        link.placeholder = "Link template (optional)";
        link.value = (_e = p.linkTemplate) != null ? _e : "";
        link.oninput = () => {
          p.linkTemplate = link.value.trim() || void 0;
        };
        const del2 = row.createEl("button", { text: "Delete" });
        del2.onclick = () => {
          this.working.include.favorites.splice(idx, 1);
          renderFavs();
        };
      });
      const add = favWrap.createEl("button", { text: "Add favorite" });
      add.onclick = () => {
        const p = {
          name: `Favorite ${this.working.include.favorites.length + 1}`,
          openEditor: false
        };
        this.working.include.favorites.push(p);
        renderFavs();
      };
    };
    renderFavs();
    contentEl.createEl("h3", { text: "Stickers" });
    const stickerWrap = contentEl.createDiv();
    const renderStickers = () => {
      stickerWrap.empty();
      const list = this.working.include.stickers;
      if (list.length === 0) {
        const none = stickerWrap.createEl("div", {
          text: "No stickers in this collection."
        });
        none.addClass("zoommap-muted");
      }
      list.forEach((s, idx) => {
        var _a, _b, _c, _d;
        const row = stickerWrap.createDiv({
          cls: "zoommap-collection-sticker-row"
        });
        const name = row.createEl("input", { type: "text" });
        name.value = (_a = s.name) != null ? _a : "";
        name.oninput = () => {
          s.name = name.value.trim();
        };
        const path = row.createEl("input", { type: "text" });
        path.placeholder = "Image path or data URL";
        path.value = (_b = s.imagePath) != null ? _b : "";
        path.oninput = () => {
          s.imagePath = path.value.trim();
        };
        const size = row.createEl("input", { type: "number" });
        size.value = String((_c = s.size) != null ? _c : 64);
        size.oninput = () => {
          const n = Number(size.value);
          if (Number.isFinite(n) && n > 0) s.size = Math.round(n);
        };
        const layer = row.createEl("input", { type: "text" });
        layer.placeholder = "Layer (optional)";
        layer.value = (_d = s.layerName) != null ? _d : "";
        layer.oninput = () => {
          s.layerName = layer.value.trim() || void 0;
        };
        const pick = row.createEl("button", { text: "Pick\u2026" });
        pick.onclick = () => {
          new ImageFileSuggestModal(this.app, (file) => {
            s.imagePath = file.path;
            renderStickers();
          }).open();
        };
        const del2 = row.createEl("button", { text: "Delete" });
        del2.onclick = () => {
          this.working.include.stickers.splice(idx, 1);
          renderStickers();
        };
      });
      const add = stickerWrap.createEl("button", { text: "Add sticker" });
      add.onclick = () => {
        const s = {
          name: `Sticker ${this.working.include.stickers.length + 1}`,
          imagePath: "",
          size: 64,
          openEditor: false
        };
        this.working.include.stickers.push(s);
        renderStickers();
      };
    };
    renderStickers();
    contentEl.createEl("h3", { text: "Swap pins" });
    const swapWrap = contentEl.createDiv();
    const renderSwaps = () => {
      var _a, _b;
      swapWrap.empty();
      const swaps = (_b = (_a = this.working.include).swapPins) != null ? _b : _a.swapPins = [];
      if (swaps.length === 0) {
        const none = swapWrap.createEl("div", {
          text: "No swap pins in this collection."
        });
        none.addClass("zoommap-muted");
      }
      swaps.forEach((sp, idx) => {
        var _a2;
        const row = swapWrap.createDiv({
          cls: "zoommap-collection-sticker-row"
        });
        const name = row.createEl("input", { type: "text" });
        name.value = (_a2 = sp.name) != null ? _a2 : "";
        name.oninput = () => {
          sp.name = name.value.trim();
        };
        const editBtn = row.createEl("button", { text: "Edit\u2026" });
        editBtn.onclick = () => {
          this.openSwapFramesEditor(sp);
        };
        const delBtn = row.createEl("button", { text: "Delete" });
        delBtn.onclick = () => {
          swaps.splice(idx, 1);
          renderSwaps();
        };
      });
      const add = swapWrap.createEl("button", { text: "Add swap pin" });
      add.onclick = () => {
        const id = `swp-${Math.random().toString(36).slice(2, 8)}`;
        const sp = {
          id,
          name: `Swap pin ${swaps.length + 1}`,
          frames: []
        };
        swaps.push(sp);
        renderSwaps();
      };
    };
    renderSwaps();
    contentEl.createEl("h3", { text: "Party pins" });
    const pingWrap = contentEl.createDiv();
    const renderPings = () => {
      var _a, _b;
      pingWrap.empty();
      const pings = (_b = (_a = this.working.include).pingPins) != null ? _b : _a.pingPins = [];
      if (pings.length === 0) {
        pingWrap.createEl("div", { text: "No party pins in this collection." }).addClass("zoommap-muted");
      }
      pings.forEach((pp, idx) => {
        var _a2;
        const row = pingWrap.createDiv({ cls: "zoommap-collection-sticker-row" });
        const name = row.createEl("input", { type: "text" });
        name.value = (_a2 = pp.name) != null ? _a2 : "";
        name.oninput = () => {
          pp.name = name.value.trim();
        };
        const editBtn = row.createEl("button", { text: "Edit\u2026" });
        editBtn.onclick = () => {
          new PingPresetEditorModal(this.app, this.plugin, pp, (updated) => {
            Object.assign(pp, updated);
            renderPings();
          }).open();
        };
        const delBtn = row.createEl("button", { text: "Delete" });
        delBtn.onclick = () => {
          pings.splice(idx, 1);
          renderPings();
        };
      });
      const addBtn = pingWrap.createEl("button", { text: "Add party pin" });
      addBtn.onclick = () => {
        var _a2, _b2;
        const id = `ping-${Math.random().toString(36).slice(2, 8)}`;
        const pp = {
          id,
          name: `Ping ${pings.length + 1}`,
          iconKey: void 0,
          layerName: "Pings",
          distances: [2, 5, 10],
          unit: "km",
          customUnitId: void 0,
          travelPackId: (_b2 = ((_a2 = this.plugin.settings.travelRulesPacks) != null ? _a2 : [])[0]) == null ? void 0 : _b2.id,
          noteFolder: "ZoomMap/Pings",
          filterTags: [],
          filterProps: {},
          relatedLookup: "tags",
          searchLayersMode: "all",
          searchLayerNames: [],
          sections: {
            bases: true,
            related: true,
            tooltips: true,
            travelTimes: true
          },
          refreshSourceNoteOnUpdate: true
        };
        pings.push(pp);
        renderPings();
      };
    };
    renderPings();
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const save = footer.createEl("button", { text: "Save" });
    save.onclick = async () => {
      this.original.name = this.working.name;
      this.original.bindings = deepClone(this.working.bindings);
      this.original.include = deepClone(this.working.include);
      await this.plugin.saveSettings();
      this.close();
      this.onDone({ updated: true, deleted: false });
    };
    const del = footer.createEl("button", { text: "Delete" });
    del.onclick = () => {
      this.close();
      this.onDone({ updated: false, deleted: true });
    };
    const cancel = footer.createEl("button", { text: "Cancel" });
    cancel.onclick = () => {
      this.close();
      this.onDone({ updated: false, deleted: false });
    };
  }
  openSwapFramesEditor(preset) {
    const modal = new SwapFramesEditorModal(
      this.app,
      this.plugin,
      preset,
      (updated) => {
        preset.name = updated.name;
        preset.frames = updated.frames;
        preset.defaultHud = updated.defaultHud;
        preset.defaultScaleLikeSticker = updated.defaultScaleLikeSticker;
        preset.hoverPopover = updated.hoverPopover;
        preset.layerName = updated.layerName;
      }
    );
    modal.open();
  }
  onClose() {
    this.contentEl.empty();
  }
};
var SwapFramesEditorModal = class extends import_obsidian12.Modal {
  constructor(app, plugin, preset, onSave) {
    super(app);
    this.allLinkSuggestions = [];
    this.plugin = plugin;
    this.working = JSON.parse(JSON.stringify(preset));
    this.onSave = onSave;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Swap pin" });
    this.buildLinkSuggestions();
    new import_obsidian12.Setting(contentEl).setName("Name").addText((t) => {
      var _a;
      t.setValue((_a = this.working.name) != null ? _a : "");
      t.onChange((v) => {
        this.working.name = v.trim() || this.working.name;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Marker layer name (optional)").setDesc("If set: newly placed swap pins will be created in this marker layer (created if missing).").addText((t) => {
      var _a;
      t.setPlaceholder("Layer");
      t.setValue((_a = this.working.layerName) != null ? _a : "");
      t.onChange((v) => {
        this.working.layerName = v.trim() || void 0;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Place as hud pin by default").addToggle((tg) => {
      tg.setValue(!!this.working.defaultHud).onChange((on) => {
        this.working.defaultHud = on || void 0;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Scale like sticker by default").addToggle((tg) => {
      tg.setValue(!!this.working.defaultScaleLikeSticker).onChange((on) => {
        this.working.defaultScaleLikeSticker = on || void 0;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Hover opens popover automatically").setDesc("If enabled, hovering this swap pin shows a preview without ctrl/cmd.").addToggle((tg) => {
      tg.setValue(!!this.working.hoverPopover).onChange((on) => {
        this.working.hoverPopover = on || void 0;
      });
    });
    const list = contentEl.createDiv();
    const render = () => {
      var _a, _b;
      list.empty();
      const frames = (_b = (_a = this.working).frames) != null ? _b : _a.frames = [];
      if (frames.length === 0) {
        const none = list.createEl("div", { text: "No frames yet." });
        none.addClass("zoommap-muted");
      }
      frames.forEach((fr, idx) => {
        var _a2, _b2;
        const row = list.createDiv({
          cls: "zoommap-collection-sticker-row"
        });
        const iconSel = row.createEl("select");
        const icons = ((_a2 = this.plugin.settings.icons) != null ? _a2 : []).filter((ico) => ico.inCollections !== false || ico.key === fr.iconKey).sort((a, b) => {
          var _a3, _b3;
          return String((_a3 = a.key) != null ? _a3 : "").localeCompare(String((_b3 = b.key) != null ? _b3 : ""), void 0, { sensitivity: "base", numeric: true });
        });
        icons.forEach((ico) => {
          const opt = iconSel.ownerDocument.createElement("option");
          opt.value = ico.key;
          opt.textContent = ico.key;
          iconSel.appendChild(opt);
        });
        iconSel.value = fr.iconKey;
        iconSel.onchange = () => {
          fr.iconKey = iconSel.value;
        };
        const link = row.createEl("input", { type: "text" });
        link.placeholder = "Optional link";
        link.value = (_b2 = fr.link) != null ? _b2 : "";
        link.oninput = () => {
          fr.link = link.value.trim() || void 0;
        };
        this.attachLinkAutocomplete(
          link,
          () => {
            var _a3;
            return (_a3 = fr.link) != null ? _a3 : "";
          },
          (val) => {
            fr.link = val.trim() || void 0;
            link.value = val;
          }
        );
        const del = row.createEl("button", { text: "Delete" });
        del.onclick = () => {
          frames.splice(idx, 1);
          render();
        };
      });
      const add = list.createEl("button", { text: "Add frame" });
      add.onclick = () => {
        var _a2, _b2, _c;
        const firstKey = (_c = (_b2 = (_a2 = this.plugin.settings.icons) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.key) != null ? _c : "";
        const frame = { iconKey: firstKey };
        frames.push(frame);
        render();
      };
    };
    render();
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      this.close();
      this.onSave(this.working);
    };
    cancelBtn.onclick = () => this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
  buildLinkSuggestions() {
    var _a, _b, _c, _d;
    const files = this.app.vault.getFiles().filter((f) => {
      var _a2;
      return ((_a2 = f.extension) == null ? void 0 : _a2.toLowerCase()) === "md";
    });
    const suggestions = [];
    const active = this.app.workspace.getActiveFile();
    const fromPath = (_c = (_b = active == null ? void 0 : active.path) != null ? _b : (_a = files[0]) == null ? void 0 : _a.path) != null ? _c : "";
    for (const file of files) {
      const base = this.app.metadataCache.fileToLinktext(file, fromPath);
      suggestions.push({ label: base, value: base });
      const cache = this.app.metadataCache.getCache(file.path);
      const headings = (_d = cache == null ? void 0 : cache.headings) != null ? _d : [];
      for (const h of headings) {
        const heading = h.heading;
        const full = `${base}#${heading}`;
        suggestions.push({
          label: `${base} \u203A ${heading}`,
          value: full
        });
      }
    }
    this.allLinkSuggestions = suggestions;
  }
  attachLinkAutocomplete(input, getValue, setValue) {
    const wrapper = input.parentElement;
    if (!(wrapper instanceof HTMLElement)) return;
    wrapper.classList.add("zoommap-link-input-wrapper");
    const listEl = wrapper.createDiv({
      cls: "zoommap-link-suggestions is-hidden"
    });
    const hide = () => listEl.classList.add("is-hidden");
    const show = () => listEl.classList.remove("is-hidden");
    const update = (query) => {
      const q = query.trim().toLowerCase();
      listEl.empty();
      if (!q) {
        hide();
        return;
      }
      const matches = this.allLinkSuggestions.filter(
        (s) => s.value.toLowerCase().includes(q) || s.label.toLowerCase().includes(q)
      ).slice(0, 20);
      if (!matches.length) {
        hide();
        return;
      }
      show();
      for (const s of matches) {
        const row = listEl.createDiv({
          cls: "zoommap-link-suggestion-item"
        });
        row.setText(s.label);
        row.addEventListener("mousedown", (ev) => {
          ev.preventDefault();
          setValue(s.value);
          hide();
        });
      }
    };
    input.addEventListener("input", () => update(input.value));
    input.addEventListener("blur", () => {
      window.setTimeout(hide, 150);
    });
    hide();
  }
};
var PingPresetEditorModal = class extends import_obsidian12.Modal {
  constructor(app, plugin, preset, onSave) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    super(app);
    this.plugin = plugin;
    this.working = deepClone(preset);
    this.onSave = onSave;
    (_b = (_a = this.working).relatedLookup) != null ? _b : _a.relatedLookup = "tags";
    (_d = (_c = this.working).searchLayersMode) != null ? _d : _c.searchLayersMode = "all";
    (_f = (_e = this.working).searchLayerNames) != null ? _f : _e.searchLayerNames = [];
    (_h = (_g = this.working).sections) != null ? _h : _g.sections = {};
  }
  onOpen() {
    var _a, _b, _c;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Party preset" });
    new import_obsidian12.Setting(contentEl).setName("Name").addText((t) => {
      var _a2;
      t.setValue((_a2 = this.working.name) != null ? _a2 : "");
      t.onChange((v) => {
        this.working.name = v.trim();
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Icon").addDropdown((d) => {
      var _a2, _b2;
      d.addOption("", "(default)");
      {
        const pool = ((_a2 = this.plugin.settings.icons) != null ? _a2 : []).filter((ico) => {
          var _a3;
          return ico.inCollections !== false || ico.key === ((_a3 = this.working.iconKey) != null ? _a3 : "");
        }).sort((a, b) => {
          var _a3, _b3;
          return String((_a3 = a.key) != null ? _a3 : "").localeCompare(String((_b3 = b.key) != null ? _b3 : ""), void 0, { sensitivity: "base", numeric: true });
        });
        for (const ico of pool) d.addOption(ico.key, ico.key);
      }
      d.setValue((_b2 = this.working.iconKey) != null ? _b2 : "");
      d.onChange((v) => {
        this.working.iconKey = v || void 0;
      });
    });
    contentEl.createEl("h3", { text: "Generated sections" });
    const sec = (_b = (_a = this.working).sections) != null ? _b : _a.sections = {};
    new import_obsidian12.Setting(contentEl).setName("Base table (embedded base)").addToggle((tg) => {
      tg.setValue(sec.bases !== false).onChange((on) => {
        sec.bases = on ? true : false;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Related notes section (tags/backlinks)").addToggle((tg) => {
      tg.setValue(sec.related !== false).onChange((on) => {
        sec.related = on ? true : false;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Unlinked markers section").addToggle((tg) => {
      tg.setValue(sec.tooltips !== false).onChange((on) => {
        sec.tooltips = on ? true : false;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Travel times table").addToggle((tg) => {
      tg.setValue(sec.travelTimes !== false).onChange((on) => {
        sec.travelTimes = on ? true : false;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Refresh source note after update").setDesc("Experimental. Re-renders the note that contains the map/dashboard after this party pin updates.").addToggle((tg) => {
      tg.setValue(this.working.refreshSourceNoteOnUpdate !== false).onChange((on) => {
        this.working.refreshSourceNoteOnUpdate = on ? true : false;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Related notes lookup").setDesc("Expands the search starting from the in-range linked notes.").addDropdown((d) => {
      var _a2;
      d.addOption("off", "Off");
      d.addOption("backlinks", "Backlinks (notes linking to the in-range note)");
      d.addOption("tags", "Tags (notes with matching tags)");
      d.setValue((_a2 = this.working.relatedLookup) != null ? _a2 : "tags");
      d.onChange((v) => {
        if (v === "off" || v === "tags" || v === "backlinks") {
          this.working.relatedLookup = v;
        } else {
          this.working.relatedLookup = "tags";
        }
      });
    });
    let customLayersSetting = null;
    const renderCustomLayersSetting = () => {
      var _a2;
      if (!customLayersSetting) return;
      customLayersSetting.settingEl.toggle(((_a2 = this.working.searchLayersMode) != null ? _a2 : "all") === "custom");
    };
    new import_obsidian12.Setting(contentEl).setName("Search markers in layers").setDesc("Limits which marker layers are considered when scanning for in-range markers. Custom uses layer *names* (comma separated).").addDropdown((d) => {
      var _a2;
      d.addOption("all", "All layers");
      d.addOption("self", "Only the party pin's layer");
      d.addOption("custom", "Custom list");
      d.setValue((_a2 = this.working.searchLayersMode) != null ? _a2 : "all");
      d.onChange((v) => {
        if (v === "all" || v === "self" || v === "custom") {
          this.working.searchLayersMode = v;
        } else {
          this.working.searchLayersMode = "all";
        }
        renderCustomLayersSetting();
      });
    });
    customLayersSetting = new import_obsidian12.Setting(contentEl).setName("Layer names (comma separated)").setDesc('Example: "npc, shops, quests". If empty, all layers are searched.').addText((t) => {
      var _a2;
      t.setPlaceholder("Npc, shops");
      t.setValue(((_a2 = this.working.searchLayerNames) != null ? _a2 : []).join(", "));
      t.onChange((v) => {
        const arr = v.split(",").map((s) => s.trim()).filter(Boolean);
        this.working.searchLayerNames = arr;
      });
    });
    renderCustomLayersSetting();
    new import_obsidian12.Setting(contentEl).setName("Layer name (optional)").addText((t) => {
      var _a2;
      t.setPlaceholder("Pings");
      t.setValue((_a2 = this.working.layerName) != null ? _a2 : "");
      t.onChange((v) => {
        this.working.layerName = v.trim() || void 0;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Scale like sticker (default)").setDesc("If enabled, newly created party pins will scale with the map (no inverse wrapper).").addToggle((tg) => {
      tg.setValue(!!this.working.defaultScaleLikeSticker).onChange((on) => {
        this.working.defaultScaleLikeSticker = on ? true : void 0;
      });
    });
    const packs = (_c = this.plugin.settings.travelRulesPacks) != null ? _c : [];
    new import_obsidian12.Setting(contentEl).setName("Travel pack").setDesc("Used to select custom units for party radius.").addDropdown((d) => {
      var _a2;
      d.addOption("", "(none)");
      for (const p of packs) d.addOption(p.id, p.name || p.id);
      d.setValue((_a2 = this.working.travelPackId) != null ? _a2 : "");
      d.onChange((v) => {
        this.working.travelPackId = v || void 0;
        this.renderUnitSetting();
      });
    });
    contentEl.createEl("div", { text: "" });
    this.renderUnitSetting();
    new import_obsidian12.Setting(contentEl).setName("Distances (comma separated)").setDesc("Example: 2, 5, 10").addText((t) => {
      var _a2;
      t.setValue(((_a2 = this.working.distances) != null ? _a2 : []).join(", "));
      t.onChange((v) => {
        const nums = v.split(",").map((s) => Number(s.trim().replace(",", "."))).filter((n) => Number.isFinite(n) && n > 0);
        this.working.distances = nums.length ? nums : [2, 5, 10];
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Party note folder").setDesc("Vault folder where party pin notes are created.").addText((t) => {
      var _a2;
      t.setPlaceholder("Zoommap/pings");
      t.setValue((_a2 = this.working.noteFolder) != null ? _a2 : "");
      t.onChange((v) => {
        this.working.noteFolder = v.trim() || void 0;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Filter tags (optional, comma separated)").setDesc("These tags are applied as or filter in the embedded bases view.").addText((t) => {
      var _a2;
      t.setPlaceholder("Npc, shop, questgiver");
      t.setValue(((_a2 = this.working.filterTags) != null ? _a2 : []).join(", "));
      t.onChange((v) => {
        const tags = v.split(",").map((s) => s.trim().replace(/^#/, "")).filter(Boolean);
        this.working.filterTags = tags;
      });
    });
    new import_obsidian12.Setting(contentEl).setName("Filter properties (optional)").setDesc("One line per key=value, multiple values with | or ,").addTextArea((a) => {
      var _a2;
      const props = (_a2 = this.working.filterProps) != null ? _a2 : {};
      a.setValue(
        Object.entries(props).map(([k, v]) => {
          var _a3;
          const vals = Array.isArray(v) ? v : [String(v != null ? v : "")];
          const cleaned = vals.map((s) => String(s).trim()).filter(Boolean);
          return cleaned.length > 1 ? `${k}=${cleaned.join(" | ")}` : `${k}=${(_a3 = cleaned[0]) != null ? _a3 : ""}`;
        }).filter((ln) => ln.trim().length > 0).join("\n")
      );
      a.onChange((v) => {
        const next = {};
        for (const line of v.split("\n")) {
          const s = line.trim();
          if (!s) continue;
          const i = s.indexOf("=");
          if (i < 1) continue;
          const k = s.slice(0, i).trim();
          const raw = s.slice(i + 1).trim();
          if (!k || !raw) continue;
          const vals = raw.split(/[|,]/g).map((x) => x.trim()).filter(Boolean);
          if (vals.length === 1) next[k] = vals[0];
          else if (vals.length > 1) next[k] = vals;
        }
        this.working.filterProps = next;
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    footer.createEl("button", { text: "Save" }).onclick = () => {
      this.close();
      this.onSave(this.working);
    };
    footer.createEl("button", { text: "Cancel" }).onclick = () => this.close();
  }
  renderUnitSetting() {
    var _a, _b;
    const { contentEl } = this;
    const existing = contentEl.querySelector(".zm-ping-unit-setting");
    existing == null ? void 0 : existing.remove();
    const wrap = contentEl.createDiv({ cls: "zm-ping-unit-setting" });
    const pack = ((_a = this.plugin.settings.travelRulesPacks) != null ? _a : []).find((p) => p.id === this.working.travelPackId);
    const customs = ((_b = pack == null ? void 0 : pack.customUnits) != null ? _b : []).slice().sort((a, b) => {
      var _a2, _b2;
      return ((_a2 = a.name) != null ? _a2 : a.id).localeCompare((_b2 = b.name) != null ? _b2 : b.id);
    });
    const setting = new import_obsidian12.Setting(wrap).setName("Unit");
    setting.addDropdown((d) => {
      var _a2;
      d.addOption("m", "M");
      d.addOption("km", "Km");
      d.addOption("mi", "Mi");
      d.addOption("ft", "Ft");
      for (const cu of customs) {
        const label = cu.abbreviation ? `${cu.name} (${cu.abbreviation})` : cu.name;
        d.addOption(`custom:${cu.id}`, label);
      }
      const cur = this.working.unit === "custom" ? `custom:${(_a2 = this.working.customUnitId) != null ? _a2 : ""}` : this.working.unit;
      const has = Array.from(d.selectEl.options).some((o) => o.value === cur);
      d.setValue(has ? cur : "km");
      d.onChange((v) => {
        if (v.startsWith("custom:")) {
          this.working.unit = "custom";
          this.working.customUnitId = v.slice("custom:".length) || void 0;
        } else {
          if (v === "m" || v === "km" || v === "mi" || v === "ft") {
            this.working.unit = v;
          } else {
            this.working.unit = "km";
          }
          this.working.customUnitId = void 0;
        }
      });
    });
  }
};

// src/svgRasterExportModal.ts
var import_obsidian13 = require("obsidian");
function fileStem(path) {
  var _a;
  const name = (_a = path.split("/").pop()) != null ? _a : path;
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(0, dot) : name;
}
function folderOf(path) {
  const i = path.lastIndexOf("/");
  return i >= 0 ? path.slice(0, i) : "";
}
var SvgRasterExportModal = class extends import_obsidian13.Modal {
  constructor(app, opts, onDone) {
    var _a;
    super(app);
    this.quality = 0.92;
    this.outPath = "";
    this.baseName = "";
    this.moveMarkersJson = false;
    this.suppressAutoDefaults = false;
    this.opts = opts;
    this.onDone = onDone;
    this.longEdge = (_a = opts.defaultLongEdge) != null ? _a : 8192;
    this.quality = typeof opts.defaultQuality === "number" ? opts.defaultQuality : 0.92;
    const dir = folderOf(opts.svgPath);
    const stem = fileStem(opts.svgPath);
    this.baseName = `${stem} (${this.longEdge / 1024}k)`;
    this.outPath = (0, import_obsidian13.normalizePath)(`${dir}/${stem}-${this.longEdge / 1024}k.webp`);
  }
  onOpen() {
    this.render();
  }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Export SVG as webp base" });
    contentEl.createEl("div", { text: `SVG: ${this.opts.svgPath}` });
    new import_obsidian13.Setting(contentEl).setName("Long edge").setDesc("Target size for the longer side of the image.").addDropdown((d) => {
      d.addOption("4096", "4k (4096px)");
      d.addOption("8192", "8k (8192px)");
      d.addOption("12288", "12k (12288px)");
      d.setValue(String(this.longEdge));
      d.onChange((v) => {
        this.longEdge = Number(v);
        if (!this.suppressAutoDefaults) {
          const dir = folderOf(this.opts.svgPath);
          const stem = fileStem(this.opts.svgPath);
          this.baseName = `${stem} (${this.longEdge / 1024}k)`;
          this.outPath = (0, import_obsidian13.normalizePath)(`${dir}/${stem}-${this.longEdge / 1024}k.webp`);
        }
        this.render();
      });
    });
    new import_obsidian13.Setting(contentEl).setName("Webp quality").setDesc("0.0\u20131.0 (higher = better quality, larger file).").addText((t) => {
      t.setPlaceholder("0.92");
      t.setValue(String(this.quality));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n)) this.quality = Math.min(1, Math.max(0.1, n));
      });
    });
    new import_obsidian13.Setting(contentEl).setName("New base name (optional)").addText((t) => {
      t.setValue(this.baseName);
      t.onChange((v) => {
        this.suppressAutoDefaults = true;
        this.baseName = v.trim();
      });
    });
    new import_obsidian13.Setting(contentEl).setName("Output path").setDesc("Will be created in the vault (webp). If it exists, a suffix will be added.").addText((t) => {
      t.setValue(this.outPath);
      t.onChange((v) => {
        this.suppressAutoDefaults = true;
        this.outPath = (0, import_obsidian13.normalizePath)(v.trim());
      });
    });
    new import_obsidian13.Setting(contentEl).setName("Move markers.json to exported base").setDesc("Renames the current markers.json to <exported>.markers.json. WARNING: other maps using the same markers file must be updated manually.").addToggle((tg) => tg.setValue(this.moveMarkersJson).onChange((v) => this.moveMarkersJson = v));
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const exportBtn = footer.createEl("button", { text: "Export" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    exportBtn.onclick = () => {
      if (!this.outPath) {
        new import_obsidian13.Notice("Output path is empty.", 2500);
        return;
      }
      this.close();
      this.onDone({
        action: "export",
        result: {
          longEdge: this.longEdge,
          quality: this.quality,
          outPath: this.outPath,
          baseName: this.baseName || void 0,
          moveMarkersJson: this.moveMarkersJson
        }
      });
    };
    cancelBtn.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/swapLinksEditorModal.ts
var import_obsidian14 = require("obsidian");
function deepClone2(x) {
  if (typeof structuredClone === "function") return structuredClone(x);
  return JSON.parse(JSON.stringify(x));
}
function normalizeFrameIndex(rawIndex, count) {
  const n = Math.max(1, count);
  return (rawIndex % n + n) % n;
}
var SwapLinksEditorModal = class extends import_obsidian14.Modal {
  constructor(app, plugin, marker, preset, onDone) {
    var _a;
    super(app);
    this.workingLinks = {};
    this.allSuggestions = [];
    this.inputs = /* @__PURE__ */ new Map();
    this.plugin = plugin;
    this.marker = marker;
    this.preset = preset;
    this.onDone = onDone;
    this.workingLinks = deepClone2((_a = marker.swapLinks) != null ? _a : {});
  }
  onOpen() {
    var _a, _b;
    const { contentEl } = this;
    contentEl.empty();
    this.inputs.clear();
    contentEl.createEl("h2", { text: "Swap links (this pin only)" });
    const rawIndex = typeof this.marker.swapIndex === "number" ? this.marker.swapIndex : 0;
    const idx = normalizeFrameIndex(rawIndex, this.preset.frames.length);
    contentEl.createEl("div", { text: `Preset: ${this.preset.name} \u2022 Current frame: ${idx + 1}/${this.preset.frames.length}` });
    this.buildLinkSuggestions();
    contentEl.createEl("h3", { text: "Per-frame link overrides" });
    contentEl.createEl("div", {
      text: "Leave a field empty to fall back to the preset link (or the icon default link)."
    }).addClass("zoommap-muted");
    for (let i = 0; i < this.preset.frames.length; i += 1) {
      const fr = this.preset.frames[i];
      const presetLink = ((_a = fr.link) != null ? _a : "").trim();
      const iconDefault = (_b = this.plugin.getIconDefaultLink(fr.iconKey)) != null ? _b : "";
      const fallback = presetLink || iconDefault;
      const desc = fallback ? `Default: ${fallback}` : "Default: (none)";
      const row = new import_obsidian14.Setting(contentEl).setName(`Frame ${i + 1}: ${fr.iconKey}`).setDesc(desc);
      const iconImg = row.controlEl.createEl("img", { cls: "zoommap-settings__icon-preview" });
      iconImg.src = this.resolveIconUrl(fr.iconKey);
      row.addText((t) => {
        var _a2;
        t.setPlaceholder("Override link (optional)");
        t.setValue((_a2 = this.workingLinks[i]) != null ? _a2 : "");
        const input = t.inputEl;
        this.inputs.set(i, input);
        this.attachLinkAutocomplete(
          input,
          () => input.value,
          (val) => {
            input.value = val;
            this.setOverride(i, val);
          }
        );
        t.onChange((v) => {
          this.setOverride(i, v);
        });
      });
    }
    new import_obsidian14.Setting(contentEl).setName("Clear overrides").setDesc("Removes per-frame overrides from this pin.").addButton((b) => {
      b.setButtonText("Clear").onClick(() => {
        this.workingLinks = {};
        for (const input of this.inputs.values()) {
          input.value = "";
        }
        new import_obsidian14.Notice("Overrides cleared (not saved yet).", 1200);
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      const cleaned = this.cleanedOverrides(this.workingLinks);
      this.close();
      this.onDone({ action: "save", swapLinks: Object.keys(cleaned).length ? cleaned : void 0 });
    };
    cancelBtn.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }
  onClose() {
    this.contentEl.empty();
    this.inputs.clear();
  }
  setOverride(frameIndex, raw) {
    const s = (raw != null ? raw : "").trim();
    if (s) this.workingLinks[frameIndex] = s;
    else delete this.workingLinks[frameIndex];
  }
  cleanedOverrides(raw) {
    const out = {};
    for (const [k, v] of Object.entries(raw)) {
      const idx = Number(k);
      const s = (v != null ? v : "").trim();
      if (!Number.isFinite(idx)) continue;
      if (!s) continue;
      out[idx] = s;
    }
    return out;
  }
  resolveIconUrl(iconKey) {
    var _a, _b, _c;
    const icon = (_b = ((_a = this.plugin.settings.icons) != null ? _a : []).find((i) => i.key === iconKey)) != null ? _b : this.plugin.builtinIcon();
    let src = (_c = icon.pathOrDataUrl) != null ? _c : "";
    if (typeof src !== "string") return "";
    if (src.startsWith("data:")) return src;
    const af = this.app.vault.getAbstractFileByPath(src);
    if (af instanceof import_obsidian14.TFile) return this.app.vault.getResourcePath(af);
    return src;
  }
  buildLinkSuggestions() {
    var _a, _b, _c, _d;
    const files = this.app.vault.getFiles().filter((f) => {
      var _a2;
      return ((_a2 = f.extension) == null ? void 0 : _a2.toLowerCase()) === "md";
    });
    const suggestions = [];
    const active = this.app.workspace.getActiveFile();
    const fromPath = (_c = (_b = active == null ? void 0 : active.path) != null ? _b : (_a = files[0]) == null ? void 0 : _a.path) != null ? _c : "";
    for (const file of files) {
      const baseLink = this.app.metadataCache.fileToLinktext(file, fromPath);
      suggestions.push({ label: baseLink, value: baseLink });
      const cache = this.app.metadataCache.getCache(file.path);
      const headings = (_d = cache == null ? void 0 : cache.headings) != null ? _d : [];
      for (const h of headings) {
        const headingName = h.heading;
        const full = `${baseLink}#${headingName}`;
        suggestions.push({ label: `${baseLink} \u203A ${headingName}`, value: full });
      }
    }
    this.allSuggestions = suggestions;
  }
  attachLinkAutocomplete(input, getValue, setValue) {
    const wrapper = input.parentElement;
    if (!(wrapper instanceof HTMLElement)) return;
    wrapper.classList.add("zoommap-link-input-wrapper");
    const listEl = wrapper.createDiv({ cls: "zoommap-link-suggestions is-hidden" });
    const hide = () => listEl.classList.add("is-hidden");
    const show = () => listEl.classList.remove("is-hidden");
    let raf = null;
    const update = (query) => {
      const q = query.trim().toLowerCase();
      listEl.empty();
      if (!q) {
        hide();
        return;
      }
      const matches = this.allSuggestions.filter((s) => s.value.toLowerCase().includes(q) || s.label.toLowerCase().includes(q)).slice(0, 20);
      if (!matches.length) {
        hide();
        return;
      }
      show();
      for (const s of matches) {
        const row = listEl.createDiv({ cls: "zoommap-link-suggestion-item" });
        row.setText(s.label);
        row.addEventListener("mousedown", (ev) => {
          ev.preventDefault();
          setValue(s.value);
          hide();
          input.focus();
          const len = s.value.length;
          input.setSelectionRange(len, len);
        });
      }
    };
    const schedule = () => {
      if (raf !== null) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => {
        raf = null;
        update(getValue());
      });
    };
    input.addEventListener("input", schedule);
    input.addEventListener("focus", schedule);
    input.addEventListener("blur", () => window.setTimeout(hide, 150));
  }
};

// src/measureTerrainModal.ts
var import_obsidian15 = require("obsidian");
var MeasureTerrainModal = class extends import_obsidian15.Modal {
  constructor(app, terrains, segments, onSave) {
    super(app);
    this.terrains = terrains;
    this.segments = segments;
    this.onSave = onSave;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Measure terrains" });
    this.segments.forEach((seg, idx) => {
      new import_obsidian15.Setting(contentEl).setName(`Segment ${idx + 1}`).setDesc(seg.label).addDropdown((d) => {
        for (const t of this.terrains) {
          d.addOption(t.id, `${t.name} (${t.factor}\xD7)`);
        }
        d.setValue(seg.terrainId);
        d.onChange((v) => {
          seg.terrainId = v;
        });
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      this.close();
      this.onSave(this.segments);
    };
    cancelBtn.onclick = () => this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/gridEditorModal.ts
var import_obsidian16 = require("obsidian");
function deepClone3(x) {
  if (typeof structuredClone === "function") return structuredClone(x);
  return JSON.parse(JSON.stringify(x));
}
function normalizeHex(v) {
  const s = v.trim();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) return s;
  if (s.length === 4) {
    const r = s[1];
    const g = s[2];
    const b = s[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return s;
}
var GridEditorModal = class extends import_obsidian16.Modal {
  constructor(app, grid, onDone) {
    var _a, _b;
    super(app);
    this.working = deepClone3(grid);
    this.onDone = onDone;
    this.working.name = (_a = this.working.name) != null ? _a : "Grid";
    this.working.visible = this.working.visible !== false;
    this.working.shape = this.working.shape === "hex" ? "hex" : "square";
    this.working.color = ((_b = this.working.color) != null ? _b : "").trim() || "#ffffff";
    this.working.width = Number.isFinite(this.working.width) && this.working.width > 0 ? this.working.width : 1;
    this.working.opacity = Number.isFinite(this.working.opacity) ? Math.min(1, Math.max(0, this.working.opacity)) : 0.5;
    this.working.spacing = Number.isFinite(this.working.spacing) && this.working.spacing > 1 ? this.working.spacing : 64;
    this.working.offsetX = Number.isFinite(this.working.offsetX) ? this.working.offsetX : 0;
    this.working.offsetY = Number.isFinite(this.working.offsetY) ? this.working.offsetY : 0;
    this.working.playerScreen = this.working.playerScreen === "player-only" || this.working.playerScreen === "gm-only" ? this.working.playerScreen : "both";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Grid" });
    new import_obsidian16.Setting(contentEl).setName("Name").addText((t) => {
      var _a;
      t.setValue((_a = this.working.name) != null ? _a : "");
      t.onChange((v) => {
        this.working.name = v.trim() || "Grid";
      });
    });
    new import_obsidian16.Setting(contentEl).setName("Visible").addToggle((tg) => {
      tg.setValue(!!this.working.visible).onChange((on) => {
        this.working.visible = on;
      });
    });
    new import_obsidian16.Setting(contentEl).setName("Show on").setDesc("Controls whether the grid is visible for gm, player screen, or both.").addDropdown((d) => {
      var _a;
      d.addOption("both", "Gm + player screen");
      d.addOption("gm-only", "Gm only");
      d.addOption("player-only", "Player screen only");
      d.setValue((_a = this.working.playerScreen) != null ? _a : "both");
      d.onChange((v) => {
        this.working.playerScreen = v === "gm-only" || v === "player-only" ? v : "both";
      });
    });
    new import_obsidian16.Setting(contentEl).setName("Shape").addDropdown((d) => {
      d.addOption("square", "Square");
      d.addOption("hex", "Hex");
      d.setValue(this.working.shape);
      d.onChange((v) => {
        this.working.shape = v === "hex" ? "hex" : "square";
      });
    });
    const colorRow = new import_obsidian16.Setting(contentEl).setName("Grid color").setDesc("SVG stroke color.");
    let colorTextEl;
    const picker = colorRow.controlEl.createEl("input", {
      attr: { type: "color", style: "margin-left:8px; vertical-align: middle;" }
    });
    colorRow.addText((t) => {
      t.setPlaceholder("#ffffff");
      t.setValue(this.working.color);
      colorTextEl = t.inputEl;
      t.onChange((v) => {
        this.working.color = v.trim() || "#ffffff";
        const hex = normalizeHex(this.working.color);
        if (/^#([0-9a-f]{6})$/i.test(hex)) picker.value = hex;
      });
    });
    {
      const hex = normalizeHex(this.working.color);
      if (/^#([0-9a-f]{6})$/i.test(hex)) picker.value = hex;
    }
    picker.oninput = () => {
      this.working.color = picker.value;
      colorTextEl.value = picker.value;
    };
    new import_obsidian16.Setting(contentEl).setName("Line width (px)").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.working.width));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n) && n > 0) this.working.width = n;
      });
    });
    new import_obsidian16.Setting(contentEl).setName("Opacity (%)").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(Math.round(this.working.opacity * 100)));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (!Number.isFinite(n)) return;
        const clamped = Math.min(100, Math.max(0, n));
        this.working.opacity = clamped / 100;
      });
    });
    new import_obsidian16.Setting(contentEl).setName("Spacing / cell size (px)").setDesc("Square: cell size. Hex: hex width.").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.working.spacing));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n) && n > 1) this.working.spacing = n;
      });
    });
    new import_obsidian16.Setting(contentEl).setName("Offset X / y (px)").setDesc("Absolute anchor in image pixels. For precise alignment use the live alignment command in the map menu.").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.working.offsetX));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n)) this.working.offsetX = n;
      });
    }).addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.working.offsetY));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n)) this.working.offsetY = n;
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const save = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    save.onclick = () => {
      var _a, _b;
      this.working.name = ((_a = this.working.name) == null ? void 0 : _a.trim()) || "Grid";
      this.working.color = ((_b = this.working.color) == null ? void 0 : _b.trim()) || "#ffffff";
      if (!Number.isFinite(this.working.width) || this.working.width <= 0) this.working.width = 1;
      if (!Number.isFinite(this.working.spacing) || this.working.spacing <= 1) this.working.spacing = 64;
      this.working.opacity = Math.min(1, Math.max(0, this.working.opacity));
      this.close();
      this.onDone({ action: "save", grid: this.working });
    };
    cancel.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/switchPinModal.ts
var import_obsidian17 = require("obsidian");
var SwitchPinModal = class extends import_obsidian17.Modal {
  constructor(app, plugin, initial, onDone) {
    var _a, _b, _c;
    super(app);
    this.plugin = plugin;
    this.bases = ((_a = initial.bases) != null ? _a : []).filter((b) => !!b && typeof b.path === "string" && b.path.trim().length > 0);
    const defaultIcon = ((_b = initial.iconKey) != null ? _b : "").trim() || this.plugin.settings.defaultIconKey;
    const rotate = !!initial.rotate;
    this.value = {
      iconKey: defaultIcon,
      rotate,
      switchBase: rotate ? void 0 : (_c = initial.switchBase) != null ? _c : "",
      scaleLikeSticker: !!initial.scaleLikeSticker,
      placeAsHudPin: !!initial.placeAsHudPin
    };
    this.onDone = onDone;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Switch pin" });
    new import_obsidian17.Setting(contentEl).setName("Icon").addDropdown((d) => {
      var _a;
      const sorted = [...(_a = this.plugin.settings.icons) != null ? _a : []].sort(
        (a, b) => {
          var _a2, _b;
          return String((_a2 = a.key) != null ? _a2 : "").localeCompare(String((_b = b.key) != null ? _b : ""), void 0, { sensitivity: "base", numeric: true });
        }
      );
      for (const ico of sorted) {
        if (!(ico == null ? void 0 : ico.key)) continue;
        d.addOption(ico.key, ico.key);
      }
      d.setValue(this.value.iconKey);
      d.onChange((v) => {
        this.value.iconKey = v;
      });
    });
    let baseSetting = null;
    const toggleBaseRow = () => {
      baseSetting == null ? void 0 : baseSetting.settingEl.toggle(!this.value.rotate);
    };
    new import_obsidian17.Setting(contentEl).setName("Rotate (cycle bases)").setDesc("If enabled, right click cycles through all base images.").addToggle((tg) => {
      tg.setValue(this.value.rotate);
      tg.onChange((on) => {
        this.value.rotate = on;
        if (on) this.value.switchBase = void 0;
        toggleBaseRow();
      });
    });
    baseSetting = new import_obsidian17.Setting(contentEl).setName("Switch to base").setDesc("If rotate is disabled, right click switches to this base.").addDropdown((d) => {
      var _a, _b, _c;
      d.addOption("", "(none)");
      for (const b of this.bases) {
        const label = ((_a = b.name) != null ? _a : "").trim() || ((_b = b.path.split("/").pop()) != null ? _b : b.path);
        d.addOption(b.path, label);
      }
      const cur = ((_c = this.value.switchBase) != null ? _c : "").trim();
      const has = Array.from(d.selectEl.options).some((o) => o.value === cur);
      d.setValue(has ? cur : "");
      d.onChange((v) => {
        const s = (v != null ? v : "").trim();
        this.value.switchBase = s.length ? s : void 0;
      });
    });
    toggleBaseRow();
    new import_obsidian17.Setting(contentEl).setName("Scale like sticker").setDesc("Pin scales with the map (no inverse wrapper).").addToggle((tg) => {
      tg.setValue(this.value.scaleLikeSticker);
      tg.onChange((on) => {
        this.value.scaleLikeSticker = on;
      });
    });
    new import_obsidian17.Setting(contentEl).setName("Place as hud pin").setDesc("Places the pin in viewport space (stays fixed in the window).").addToggle((tg) => {
      tg.setValue(this.value.placeAsHudPin);
      tg.onChange((on) => {
        this.value.placeAsHudPin = on;
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const save = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    save.onclick = () => {
      this.close();
      this.onDone({ action: "save", value: this.value });
    };
    cancel.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/textBoxConfigModal.ts
var import_obsidian18 = require("obsidian");
function deepClone4(x) {
  if (typeof structuredClone === "function") return structuredClone(x);
  return JSON.parse(JSON.stringify(x));
}
function normalizeHex2(v) {
  const s = v.trim();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s)) return s;
  if (s.length === 4) {
    const r = s[1];
    const g = s[2];
    const b = s[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return s;
}
function collectLoadedFontFamilies(doc) {
  const out = /* @__PURE__ */ new Set();
  try {
    const fs = doc.fonts;
    if (fs && typeof fs.forEach === "function") {
      fs.forEach((ff) => {
        var _a;
        const fam = String((_a = ff.family) != null ? _a : "").replace(/["']/g, "").trim();
        if (fam) out.add(fam);
      });
    }
  } catch (e) {
  }
  return [...out].sort((a, b) => a.localeCompare(b));
}
function buildFontOptions(doc) {
  const options = [];
  const seen = /* @__PURE__ */ new Set();
  const add = (value, label) => {
    if (seen.has(value)) return;
    seen.add(value);
    options.push({ value, label });
  };
  add("var(--font-text)", "Theme text (default)");
  add("var(--font-interface)", "Theme interface");
  add("var(--font-monospace)", "Theme monospace");
  add("system-ui", "System UI");
  add("sans-serif", "Sans-serif");
  add("serif", "Serif");
  add("monospace", "Monospace");
  for (const fam of collectLoadedFontFamilies(doc)) add(`${fam}, var(--font-text)`, fam);
  return options;
}
var TextBoxConfigModal = class extends import_obsidian18.Modal {
  constructor(app, box, onDone) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    super(app);
    this.working = deepClone4(box);
    this.working.style = this.normalizeStyle(this.working.style);
    (_b = (_a = this.working).autoFlow) != null ? _b : _a.autoFlow = true;
    (_d = (_c = this.working).allowAngledBaselines) != null ? _d : _c.allowAngledBaselines = false;
    (_f = (_e = this.working).locked) != null ? _f : _e.locked = false;
    if (this.working.mode === "auto") {
      (_h = (_g = this.working).auto) != null ? _h : _g.auto = {
        lineGapPx: 18,
        padLeft: 0,
        padRight: 0,
        padTop: 4,
        padBottom: 4
      };
    }
    this.onDone = onDone;
  }
  onOpen() {
    var _a, _b, _c, _d;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Text box settings" });
    new import_obsidian18.Setting(contentEl).setName("Name").addText((t) => {
      var _a2;
      t.setValue((_a2 = this.working.name) != null ? _a2 : "");
      t.onChange((v) => {
        this.working.name = v.trim() || this.working.name;
      });
    });
    new import_obsidian18.Setting(contentEl).setName("Lock text box").setDesc("Prevents editing and moving this box.").addToggle((tg) => {
      tg.setValue(!!this.working.locked).onChange((on) => {
        this.working.locked = on;
      });
    });
    new import_obsidian18.Setting(contentEl).setName("Auto-flow between baselines").setDesc("If disabled: each baseline keeps its own text.").addToggle((tg) => {
      tg.setValue(this.working.autoFlow !== false).onChange((on) => {
        this.working.autoFlow = on;
      });
    });
    new import_obsidian18.Setting(contentEl).setName("Allow angled baselines").setDesc("If enabled: baselines snap horizontal by default, hold ctrl for free angle.").addToggle((tg) => {
      tg.setValue(!!this.working.allowAngledBaselines).onChange((on) => {
        this.working.allowAngledBaselines = on;
      });
    });
    new import_obsidian18.Setting(contentEl).setName("Mode").setDesc(this.working.mode === "auto" ? "Automatic baselines" : "Custom baselines").addText((t) => {
      t.setValue(this.working.mode);
      t.inputEl.disabled = true;
    });
    contentEl.createEl("h3", { text: "Font" });
    const fontOptions = buildFontOptions(contentEl.ownerDocument);
    const knownValues = new Set(fontOptions.map((o) => o.value));
    const CUSTOM = "__custom__";
    const currentFamily = (_b = (_a = this.working.style) == null ? void 0 : _a.fontFamily) != null ? _b : "var(--font-text)";
    const initialSelect = knownValues.has(currentFamily) ? currentFamily : CUSTOM;
    let customSetting = null;
    let customInputEl = null;
    new import_obsidian18.Setting(contentEl).setName("Font family").addDropdown((dd) => {
      for (const opt of fontOptions) dd.addOption(opt.value, opt.label);
      dd.addOption(CUSTOM, "Custom\u2026");
      dd.setValue(initialSelect);
      dd.onChange((v) => {
        if (v === CUSTOM) {
          customSetting == null ? void 0 : customSetting.settingEl.toggle(true);
          return;
        }
        this.working.style.fontFamily = v;
        if (customInputEl) customInputEl.value = v;
        customSetting == null ? void 0 : customSetting.settingEl.toggle(false);
      });
    });
    customSetting = new import_obsidian18.Setting(contentEl).setName("Custom font-family").setDesc("CSS font-family value, e.g. Caveat, var(--font-text).");
    customSetting.addText((t) => {
      t.setPlaceholder("Caveat, var(--font-text)");
      t.setValue(currentFamily);
      customInputEl = t.inputEl;
      t.onChange((v) => {
        this.working.style.fontFamily = v.trim() || "var(--font-text)";
      });
    });
    customSetting.settingEl.toggle(initialSelect === CUSTOM);
    new import_obsidian18.Setting(contentEl).setName("Font size (px)").addText((t) => {
      var _a2, _b2;
      t.inputEl.type = "number";
      t.setValue(String((_b2 = (_a2 = this.working.style) == null ? void 0 : _a2.fontSize) != null ? _b2 : 14));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n > 1) this.working.style.fontSize = n;
      });
    });
    const colorRow = new import_obsidian18.Setting(contentEl).setName("Color");
    let colorTextEl;
    const picker = colorRow.controlEl.createEl("input", {
      attr: { type: "color", style: "margin-left:8px; vertical-align: middle;" }
    });
    colorRow.addText((t) => {
      var _a2, _b2;
      t.setPlaceholder("#000000");
      t.setValue((_b2 = (_a2 = this.working.style) == null ? void 0 : _a2.color) != null ? _b2 : "var(--text-normal)");
      colorTextEl = t.inputEl;
      t.onChange((v) => {
        this.working.style.color = v.trim() || "var(--text-normal)";
        const hex = normalizeHex2(this.working.style.color);
        if (/^#([0-9a-f]{6})$/i.test(hex)) picker.value = hex;
      });
    });
    {
      const hex = normalizeHex2((_d = (_c = this.working.style) == null ? void 0 : _c.color) != null ? _d : "");
      if (/^#([0-9a-f]{6})$/i.test(hex)) picker.value = hex;
    }
    picker.oninput = () => {
      this.working.style.color = picker.value;
      colorTextEl.value = picker.value;
    };
    new import_obsidian18.Setting(contentEl).setName("Font weight").addText((t) => {
      var _a2, _b2;
      t.setPlaceholder("400");
      t.setValue((_b2 = (_a2 = this.working.style) == null ? void 0 : _a2.fontWeight) != null ? _b2 : "");
      t.onChange((v) => {
        const s = v.trim();
        this.working.style.fontWeight = s || void 0;
      });
    });
    new import_obsidian18.Setting(contentEl).setName("Italic").addToggle((tg) => {
      var _a2;
      tg.setValue(!!((_a2 = this.working.style) == null ? void 0 : _a2.italic)).onChange((on) => {
        this.working.style.italic = on ? true : void 0;
      });
    });
    new import_obsidian18.Setting(contentEl).setName("Letter spacing (px)").addText((t) => {
      var _a2;
      t.inputEl.type = "number";
      const v = (_a2 = this.working.style) == null ? void 0 : _a2.letterSpacing;
      t.setPlaceholder("0");
      t.setValue(typeof v === "number" ? String(v) : "");
      t.onChange((raw) => {
        const s = raw.trim();
        if (!s) {
          this.working.style.letterSpacing = void 0;
          return;
        }
        const n = Number(s);
        if (Number.isFinite(n)) this.working.style.letterSpacing = n;
      });
    });
    contentEl.createEl("h3", { text: "Layout" });
    new import_obsidian18.Setting(contentEl).setName("Line height (px)").setDesc("Height of each input line box. Leave empty to auto-calc from font size.").addText((t) => {
      var _a2;
      t.inputEl.type = "number";
      const v = (_a2 = this.working.style) == null ? void 0 : _a2.lineHeight;
      t.setPlaceholder("Auto");
      t.setValue(typeof v === "number" ? String(v) : "");
      t.onChange((raw) => {
        const s = raw.trim();
        if (!s) {
          this.working.style.lineHeight = void 0;
          return;
        }
        const n = Number(s);
        if (Number.isFinite(n) && n > 1) this.working.style.lineHeight = n;
      });
    });
    new import_obsidian18.Setting(contentEl).setName("Text padding left / right (px)").addText((t) => {
      var _a2, _b2;
      t.inputEl.type = "number";
      t.setPlaceholder("0");
      t.setValue(String((_b2 = (_a2 = this.working.style) == null ? void 0 : _a2.padLeft) != null ? _b2 : 0));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n >= 0) this.working.style.padLeft = n;
      });
    }).addText((t) => {
      var _a2, _b2;
      t.inputEl.type = "number";
      t.setPlaceholder("0");
      t.setValue(String((_b2 = (_a2 = this.working.style) == null ? void 0 : _a2.padRight) != null ? _b2 : 0));
      t.onChange((v) => {
        const n = Number(v);
        if (Number.isFinite(n) && n >= 0) this.working.style.padRight = n;
      });
    });
    const canConfigureAuto = this.working.mode === "auto" && this.working.sourceDrawingKind !== "polyline";
    if (canConfigureAuto) {
      contentEl.createEl("h3", { text: "Automatic baselines" });
      new import_obsidian18.Setting(contentEl).setName("Line gap (px)").addText((t) => {
        var _a2, _b2;
        t.inputEl.type = "number";
        t.setValue(String((_b2 = (_a2 = this.working.auto) == null ? void 0 : _a2.lineGapPx) != null ? _b2 : 18));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n) && n > 1) this.working.auto.lineGapPx = n;
        });
      });
      new import_obsidian18.Setting(contentEl).setName("Box inset left / right (px)").setDesc("Shrinks the usable auto-baseline width inside the text box.").addText((t) => {
        var _a2, _b2;
        t.inputEl.type = "number";
        t.setValue(String((_b2 = (_a2 = this.working.auto) == null ? void 0 : _a2.padLeft) != null ? _b2 : 0));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n) && n >= 0) this.working.auto.padLeft = n;
        });
      }).addText((t) => {
        var _a2, _b2;
        t.inputEl.type = "number";
        t.setValue(String((_b2 = (_a2 = this.working.auto) == null ? void 0 : _a2.padRight) != null ? _b2 : 0));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n) && n >= 0) this.working.auto.padRight = n;
        });
      });
      new import_obsidian18.Setting(contentEl).setName("Box inset top / bottom (px)").setDesc("Shrinks the usable auto-baseline height inside the text box.").addText((t) => {
        var _a2, _b2;
        t.inputEl.type = "number";
        t.setValue(String((_b2 = (_a2 = this.working.auto) == null ? void 0 : _a2.padTop) != null ? _b2 : 4));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n) && n >= 0) this.working.auto.padTop = n;
        });
      }).addText((t) => {
        var _a2, _b2;
        t.inputEl.type = "number";
        t.setValue(String((_b2 = (_a2 = this.working.auto) == null ? void 0 : _a2.padBottom) != null ? _b2 : 4));
        t.onChange((v) => {
          const n = Number(String(v).replace(",", "."));
          if (Number.isFinite(n) && n >= 0) this.working.auto.padBottom = n;
        });
      });
    }
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    footer.createEl("button", { text: "Save" }).onclick = () => {
      this.working.style = this.normalizeStyle(this.working.style);
      this.close();
      this.onDone({ action: "save", box: this.working });
    };
    footer.createEl("button", { text: "Cancel" }).onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }
  defaultStyle() {
    return {
      fontFamily: "var(--font-text)",
      fontSize: 14,
      color: "var(--text-normal)",
      fontWeight: "400",
      baselineOffset: 0,
      padLeft: 0,
      padRight: 0
    };
  }
  normalizeStyle(style) {
    var _a, _b;
    const s = { ...this.defaultStyle(), ...style != null ? style : {} };
    s.fontFamily = ((_a = s.fontFamily) != null ? _a : "").trim() || "var(--font-text)";
    s.color = ((_b = s.color) != null ? _b : "").trim() || "var(--text-normal)";
    if (!Number.isFinite(s.fontSize) || s.fontSize <= 1) s.fontSize = 14;
    if (typeof s.lineHeight === "number" && (!Number.isFinite(s.lineHeight) || s.lineHeight <= 1)) {
      delete s.lineHeight;
    }
    if (typeof s.padLeft !== "number" || !Number.isFinite(s.padLeft) || s.padLeft < 0) s.padLeft = 0;
    if (typeof s.padRight !== "number" || !Number.isFinite(s.padRight) || s.padRight < 0) s.padRight = 0;
    if (typeof s.italic !== "boolean") delete s.italic;
    if (typeof s.letterSpacing === "number" && !Number.isFinite(s.letterSpacing)) delete s.letterSpacing;
    if (s.fontWeight != null) {
      const fw = String(s.fontWeight).trim();
      s.fontWeight = fw.length ? fw : void 0;
    }
    return s;
  }
};

// src/secondScreenLayersModal.ts
var import_obsidian19 = require("obsidian");
var SecondScreenLayersModal = class extends import_obsidian19.Modal {
  constructor(app, input, onDone) {
    super(app);
    this.showGrids = true;
    this.input = input;
    this.onDone = onDone;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    this.showGrids = !!this.input.showGrids;
    contentEl.createEl("h2", { text: "Second screen layers" });
    contentEl.createEl("div", {
      text: "Choose which layers should be visible when the map is sent to the second screen."
    });
    this.renderSection(contentEl, "Marker layers", this.input.markerLayers);
    this.renderSection(contentEl, "Draw layers", this.input.drawLayers);
    this.renderSection(contentEl, "Text layers", this.input.textLayers);
    contentEl.createEl("h3", { text: "Grids" });
    new import_obsidian19.Setting(contentEl).setName("Show grids on second screen").setDesc("Includes grid overlays in the player screen note.").addToggle((tg) => {
      tg.setValue(this.showGrids).onChange((on) => this.showGrids = on);
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const save = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    save.onclick = () => {
      this.close();
      this.onDone({
        action: "save",
        markerLayerIds: this.input.markerLayers.filter((x) => x.selected).map((x) => x.id),
        drawLayerIds: this.input.drawLayers.filter((x) => x.selected).map((x) => x.id),
        textLayerIds: this.input.textLayers.filter((x) => x.selected).map((x) => x.id),
        showGrids: this.showGrids
      });
    };
    cancel.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }
  onClose() {
    this.contentEl.empty();
  }
  renderSection(parent, title, items) {
    parent.createEl("h3", { text: title });
    const actions = parent.createDiv({ cls: "zoommap-modal-footer" });
    const selectAll = actions.createEl("button", { text: "All" });
    const selectNone = actions.createEl("button", { text: "None" });
    const list = parent.createDiv();
    const rerender = () => {
      list.empty();
      if (items.length === 0) {
        list.createEl("div", { text: "None." }).addClass("zoommap-muted");
        return;
      }
      for (const item of items) {
        const row = list.createDiv({ cls: "zoommap-collection-base-row" });
        const cb = row.createEl("input", { type: "checkbox" });
        cb.checked = item.selected;
        cb.onchange = () => {
          item.selected = cb.checked;
        };
        row.createEl("span", { text: item.name || "(unnamed)" });
      }
    };
    selectAll.onclick = () => {
      items.forEach((x) => x.selected = true);
      rerender();
    };
    selectNone.onclick = () => {
      items.forEach((x) => x.selected = false);
      rerender();
    };
    rerender();
  }
};

// src/dicePinModal.ts
var import_obsidian20 = require("obsidian");
var DEFAULT_DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];
function clampInt(n, min, max) {
  const v = Math.round(n);
  return Math.min(max, Math.max(min, v));
}
function toFormula(rolls) {
  const parts = (rolls != null ? rolls : []).filter((r) => r && Number.isFinite(r.count) && Number.isFinite(r.sides) && r.count > 0 && r.sides > 0).map((r) => `${Math.round(r.count)}d${Math.round(r.sides)}`);
  return parts.length ? parts.join(" + ") : "1d20";
}
var DicePinModal = class extends import_obsidian20.Modal {
  constructor(app, plugin, initial, onDone) {
    var _a, _b, _c, _d;
    super(app);
    this.plugin = plugin;
    this.onDone = onDone;
    const icons = (_a = this.plugin.settings.icons) != null ? _a : [];
    const defaultIconKey = ((_b = initial.iconKey) != null ? _b : "").trim() || this.plugin.settings.defaultIconKey || ((_d = (_c = icons[0]) == null ? void 0 : _c.key) != null ? _d : "pinRed");
    const rollsRaw = Array.isArray(initial.rolls) ? initial.rolls : [{ count: 1, sides: 20 }];
    const rolls = rollsRaw.map((r) => {
      var _a2, _b2;
      return {
        count: clampInt(Number((_a2 = r.count) != null ? _a2 : 1), 1, 999),
        sides: clampInt(Number((_b2 = r.sides) != null ? _b2 : 20), 2, 1e3)
      };
    }).filter((r) => r.count > 0 && r.sides > 0);
    this.value = {
      iconKey: defaultIconKey,
      rolls: rolls.length ? rolls : [{ count: 1, sides: 20 }],
      render3d: !!initial.render3d,
      scaleLikeSticker: !!initial.scaleLikeSticker,
      placeAsHudPin: !!initial.placeAsHudPin
    };
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Dice pin" });
    new import_obsidian20.Setting(contentEl).setName("Icon").addDropdown((d) => {
      var _a;
      const sorted = [...(_a = this.plugin.settings.icons) != null ? _a : []].map((i) => {
        var _a2;
        return (_a2 = i == null ? void 0 : i.key) != null ? _a2 : "";
      }).filter((k) => k.trim().length > 0).sort((a, b) => a.localeCompare(b, void 0, { sensitivity: "base", numeric: true }));
      for (const key of sorted) d.addOption(key, key);
      d.setValue(this.value.iconKey);
      d.onChange((v) => this.value.iconKey = v);
    });
    new import_obsidian20.Setting(contentEl).setName("Graphical roll (3d)").setDesc("Uses dice roller\u2019s dice view (if installed).").addToggle((tg) => {
      tg.setValue(this.value.render3d);
      tg.onChange((on) => this.value.render3d = on);
    });
    new import_obsidian20.Setting(contentEl).setName("Scale like sticker").setDesc("Pin scales with the map (no inverse wrapper).").addToggle((tg) => {
      tg.setValue(this.value.scaleLikeSticker);
      tg.onChange((on) => this.value.scaleLikeSticker = on);
    });
    new import_obsidian20.Setting(contentEl).setName("Place as hud pin").setDesc("Places the pin in viewport space (stays fixed in the window).").addToggle((tg) => {
      tg.setValue(this.value.placeAsHudPin);
      tg.onChange((on) => this.value.placeAsHudPin = on);
    });
    const formulaRow = new import_obsidian20.Setting(contentEl).setName("Formula");
    const formulaEl = formulaRow.controlEl.createEl("code");
    formulaEl.setText(toFormula(this.value.rolls));
    contentEl.createEl("h3", { text: "Dice" });
    const list = contentEl.createDiv({ cls: "zoommap-dice-list" });
    const render = () => {
      var _a;
      list.empty();
      for (let i = 0; i < this.value.rolls.length; i += 1) {
        const r = this.value.rolls[i];
        const row = list.createDiv({ cls: "zoommap-dice-row" });
        const countEl = row.createEl("input", { type: "number" });
        countEl.value = String((_a = r.count) != null ? _a : 1);
        countEl.min = "1";
        countEl.max = "999";
        countEl.oninput = () => {
          const n = Number(countEl.value);
          r.count = clampInt(Number.isFinite(n) ? n : 1, 1, 999);
          countEl.value = String(r.count);
          formulaEl.setText(toFormula(this.value.rolls));
        };
        const sidesEl = row.createEl("select");
        for (const s of DEFAULT_DICE_SIDES) {
          const opt = sidesEl.ownerDocument.createElement("option");
          opt.value = String(s);
          opt.textContent = `d${s}`;
          sidesEl.appendChild(opt);
        }
        const hasCurrent = Array.from(sidesEl.options).some((o) => Number(o.value) === r.sides);
        if (!hasCurrent) {
          const opt = sidesEl.ownerDocument.createElement("option");
          opt.value = String(r.sides);
          opt.textContent = `d${r.sides}`;
          sidesEl.appendChild(opt);
        }
        sidesEl.value = String(r.sides);
        sidesEl.onchange = () => {
          r.sides = clampInt(Number(sidesEl.value), 2, 1e3);
          formulaEl.setText(toFormula(this.value.rolls));
        };
        const del = row.createEl("button", { text: "Delete" });
        del.onclick = () => {
          this.value.rolls.splice(i, 1);
          if (this.value.rolls.length === 0) this.value.rolls.push({ count: 1, sides: 20 });
          formulaEl.setText(toFormula(this.value.rolls));
          render();
        };
      }
      const add = list.createEl("button", { text: "Add die" });
      add.onclick = () => {
        this.value.rolls.push({ count: 1, sides: 20 });
        formulaEl.setText(toFormula(this.value.rolls));
        render();
      };
    };
    render();
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const save = footer.createEl("button", { text: "Save" });
    const cancel = footer.createEl("button", { text: "Cancel" });
    save.onclick = () => {
      var _a, _b;
      const cleaned = ((_a = this.value.rolls) != null ? _a : []).map((r) => {
        var _a2, _b2;
        return {
          count: clampInt(Number((_a2 = r.count) != null ? _a2 : 1), 1, 999),
          sides: clampInt(Number((_b2 = r.sides) != null ? _b2 : 20), 2, 1e3)
        };
      }).filter((r) => r.count > 0 && r.sides > 0);
      if (!cleaned.length) cleaned.push({ count: 1, sides: 20 });
      this.close();
      this.onDone({
        action: "save",
        value: {
          iconKey: ((_b = this.value.iconKey) != null ? _b : "").trim(),
          rolls: cleaned,
          render3d: !!this.value.render3d,
          scaleLikeSticker: !!this.value.scaleLikeSticker,
          placeAsHudPin: !!this.value.placeAsHudPin
        }
      });
    };
    cancel.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/map.ts
var PING_TOOLTIP_BEGIN = "<!-- ZOOMMAP-PING-TOOLTIP:BEGIN -->";
var PING_TOOLTIP_END = "<!-- ZOOMMAP-PING-TOOLTIP:END -->";
var PING_RELATED_BEGIN = "<!-- ZOOMMAP-PING-RELATED:BEGIN -->";
var PING_RELATED_END = "<!-- ZOOMMAP-PING-RELATED:END -->";
var PING_TRAVEL_BEGIN = "<!-- ZOOMMAP-PING-TRAVEL:BEGIN -->";
var PING_TRAVEL_END = "<!-- ZOOMMAP-PING-TRAVEL:END -->";
function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}
function basename(p) {
  const idx = p.lastIndexOf("/");
  return idx >= 0 ? p.slice(idx + 1) : p;
}
function setCssProps(el, props) {
  for (const [key, value] of Object.entries(props)) {
    if (value === null) el.style.removeProperty(key);
    else el.style.setProperty(key, value);
  }
}
function cloneForUndo(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
function insertAtClamped(arr, index, item) {
  arr.splice(Math.max(0, Math.min(index, arr.length)), 0, item);
}
function stableStringify(value) {
  const seen = /* @__PURE__ */ new WeakSet();
  const norm = (v) => {
    if (v && typeof v === "object") {
      if (seen.has(v)) return null;
      seen.add(v);
      if (Array.isArray(v)) return v.map(norm);
      const obj = v;
      const out = {};
      for (const k of Object.keys(obj).sort()) out[k] = norm(obj[k]);
      return out;
    }
    return v;
  };
  return JSON.stringify(norm(value));
}
function stableEqual(a, b) {
  return stableStringify(a) === stableStringify(b);
}
function isImageBitmapLike(x) {
  return typeof x === "object" && x !== null && "close" in x && typeof x.close === "function";
}
function isNodeLike(x) {
  return typeof x === "object" && x !== null && "nodeType" in x;
}
function isHtmlImageElementLike(x) {
  return typeof x === "object" && x !== null && x.tagName === "IMG";
}
function isSvgDataUrl(src) {
  return typeof src === "string" && src.startsWith("data:image/svg+xml");
}
function diceRollsToFormula(rolls) {
  const parts = (rolls != null ? rolls : []).filter((r) => r && Number.isFinite(r.count) && Number.isFinite(r.sides) && r.count > 0 && r.sides > 0).map((r) => `${Math.round(r.count)}d${Math.round(r.sides)}`);
  return parts.length ? parts.join(" + ") : "1d20";
}
function localRollDice(rolls) {
  const rs = (rolls != null ? rolls : []).filter((r) => r && Number.isFinite(r.count) && Number.isFinite(r.sides) && r.count > 0 && r.sides > 1);
  const cleaned = rs.length ? rs : [{ count: 1, sides: 20 }];
  const per = [];
  let total = 0;
  for (const r of cleaned) {
    const n = Math.max(1, Math.round(r.count));
    const s = Math.max(2, Math.round(r.sides));
    const vals = [];
    for (let i = 0; i < n; i += 1) {
      const v = 1 + Math.floor(Math.random() * s);
      vals.push(v);
      total += v;
    }
    per.push(`${n}d${s}=[${vals.join(", ")}]`);
  }
  return { total, details: per.join(" + ") };
}
function formatDiceApiResult(x) {
  if (x == null) return "";
  if (typeof x === "string") return x;
  if (typeof x === "number" || typeof x === "boolean" || typeof x === "bigint") return String(x);
  if (x instanceof Error) return x.message || "Error";
  try {
    return JSON.stringify(x);
  } catch (e) {
    return "";
  }
}
function splitQuotePrefix(line) {
  const len = line.length;
  let i = 0;
  while (i < len && (line[i] === " " || line[i] === "	")) i++;
  if (i >= len || line[i] !== ">") return { prefix: "", rest: line };
  while (i < len && line[i] === ">") {
    i++;
    if (i < len && (line[i] === " " || line[i] === "	")) i++;
    let j = i;
    while (j < len && (line[j] === " " || line[j] === "	")) j++;
    if (j < len && line[j] === ">") {
      i = j;
      continue;
    }
    break;
  }
  return { prefix: line.slice(0, i), rest: line.slice(i) };
}
function stripQuotePrefix(line) {
  return splitQuotePrefix(line).rest;
}
function tintSvgMarkupLocal(svg, color) {
  var _a;
  const c = color.trim();
  if (!c) return svg;
  try {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    const root = doc.querySelector("svg");
    if (!root) return svg;
    const inner = (_a = root.querySelector("#zm-inner")) != null ? _a : root;
    const base = root.querySelector("#zm-base");
    const outline = root.querySelector("#zm-outline");
    const shapes = inner.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse");
    let touched = false;
    shapes.forEach((el) => {
      var _a2, _b;
      if (base && base.contains(el)) return;
      if (outline && outline.contains(el)) return;
      const styleFill = (_a2 = el.style) == null ? void 0 : _a2.fill;
      const styleStroke = (_b = el.style) == null ? void 0 : _b.stroke;
      const fillAttr = el.getAttribute("fill");
      const strokeAttr = el.getAttribute("stroke");
      const hasFill = typeof styleFill === "string" && styleFill && styleFill.toLowerCase() !== "none" || typeof fillAttr === "string" && fillAttr && fillAttr.toLowerCase() !== "none";
      const hasStroke = typeof styleStroke === "string" && styleStroke && styleStroke.toLowerCase() !== "none" || typeof strokeAttr === "string" && strokeAttr && strokeAttr.toLowerCase() !== "none";
      if (hasFill) {
        el.style.fill = c;
        el.setAttribute("fill", c);
        touched = true;
      }
      if (hasStroke) {
        el.style.stroke = c;
        el.setAttribute("stroke", c);
        touched = true;
      }
    });
    if (!touched) {
      inner.setAttribute("fill", c);
    }
    return new XMLSerializer().serializeToString(root);
  } catch (e) {
    return svg;
  }
}
function getMinZoom(m) {
  return m.minZoom;
}
function getMaxZoom(m) {
  return m.maxZoom;
}
function isScaleLikeSticker(m) {
  return !!m.scaleLikeSticker;
}
var MapInstance = class extends import_obsidian21.Component {
  constructor(app, plugin, el, cfg) {
    var _a, _b;
    super();
    this.drawEditDrawingId = null;
    this.drawEditMode = null;
    this.drawEditPointIndex = null;
    this.drawEditHandleKind = null;
    this.drawEditPointerId = null;
    this.drawEditOriginalDrawing = null;
    this.gridAlignId = null;
    this.gridAlignPreview = null;
    this.gridAlignOriginalSpacing = null;
    this.zoomHudTimer = null;
    this.initialLayoutDone = false;
    this.initialViewApplied = false;
    this.lastGoodView = null;
    this.overlayMap = /* @__PURE__ */ new Map();
    this.baseCanvas = null;
    this.ctx = null;
    this.baseSource = null;
    this.overlaySources = /* @__PURE__ */ new Map();
    this.overlayLoading = /* @__PURE__ */ new Map();
    // Session-cache tracking (per map instance)
    this.acquiredSessionPaths = /* @__PURE__ */ new Set();
    this.baseIsSvg = false;
    this.svgRasterScale = 1;
    // actual bitmapWidth / logicalWidth for current baseSource
    // Per-note SVG base raster cache (kept while note/tab stays open)
    this.svgBaseCache = /* @__PURE__ */ new Map();
    this.svgUpgradeInFlight = /* @__PURE__ */ new Map();
    // Safety cap (avoid extreme allocations)
    this.svgRasterMaxSidePx = 8192;
    this.textMode = null;
    this.activeTextLayerId = null;
    this.activeTextBoxId = null;
    this.textDrawStart = null;
    this.textDrawPreview = null;
    this.textLineStart = null;
    this.textLinePreview = null;
    this.textInputs = /* @__PURE__ */ new Map();
    this.textDirty = false;
    this.textSaveTimer = null;
    this.textOutsideCleanup = null;
    this.textMoveDragging = false;
    this.textMovePointerId = null;
    this.textDrawBoxMode = "custom";
    this.textMoveStart = null;
    this.textMoveOrig = null;
    this.textMeasureSpan = null;
    // Ping pins (notes + Bases)
    this.pingUpdateTimer = null;
    this.imgW = 0;
    this.imgH = 0;
    this.vw = 0;
    this.vh = 0;
    this.scale = 1;
    this.tx = 0;
    this.ty = 0;
    this.draggingView = false;
    this.lastPos = { x: 0, y: 0 };
    this.draggingMarkerId = null;
    this.dragAnchorOffset = null;
    this.dragMoved = false;
    this.suppressClickMarkerId = null;
    this.tooltipEl = null;
    this.tooltipHideTimer = null;
    this.drawingHoverAnchorEl = null;
    this.frameLayerEl = null;
    this.viewportFrameEl = null;
    this.frameNaturalW = 0;
    this.frameNaturalH = 0;
    this.ignoreNextModify = false;
    this.ro = null;
    this.calloutMo = null;
    this.ready = false;
    this.openMenu = null;
    this.suppressContextMenuOnce = false;
    this.draggingViewButton = null;
    // Measurement state
    this.measuring = false;
    this.measurePts = [];
    this.measurePreview = null;
    this.measureSegTerrainIds = [];
    // Calibration state
    this.calibrating = false;
    this.calibPts = [];
    this.calibPreview = null;
    // Drawing state
    this.drawingMode = null;
    this.drawingActiveLayerId = null;
    this.drawRectStart = null;
    this.drawCircleCenter = null;
    this.drawPolygonPoints = [];
    this.viewDragDist = 0;
    this.viewDragMoved = false;
    this.suppressTextClickOnce = false;
    this.panRAF = null;
    this.panAccDx = 0;
    this.panAccDy = 0;
    this.activePointers = /* @__PURE__ */ new Map();
    this.pinchActive = false;
    this.pinchStartScale = 1;
    this.pinchStartDist = 0;
    this.pinchPrevCenter = null;
    this.touchGestureCandidate = false;
    this.touchGestureLocked = false;
    this.touchGestureStartX = 0;
    this.touchGestureStartY = 0;
    this.touchGestureLockThresholdPx = 8;
    this.touchGestureEdgeGuardPx = 28;
    this.lastTouchTapTs = 0;
    this.lastTouchTapClient = null;
    this.touchDoubleTapMs = 350;
    this.touchDoubleTapDistPx = 24;
    this.currentBasePath = null;
    this.frameSaveTimer = null;
    this.userResizing = false;
    this.yamlAppliedOnce = false;
    this.secondScreenViewSaveTimer = null;
    this.applyingSecondScreenView = false;
    this.tintedSvgCache = /* @__PURE__ */ new Map();
    this.onNativeTouchStart = (e) => {
      if (!this.canUseNativeTouchCapture()) return;
      if (this.shouldIgnoreNativeTouchCapture(e.target)) return;
      if (e.touches.length <= 0) return;
      const first = e.touches[0];
      const vpRect = this.viewportEl.getBoundingClientRect();
      const x = first.clientX - vpRect.left;
      const y = first.clientY - vpRect.top;
      this.touchGestureStartX = x;
      this.touchGestureStartY = y;
      this.touchGestureCandidate = true;
      this.touchGestureLocked = false;
      const nearEdgeX = x <= this.touchGestureEdgeGuardPx || x >= vpRect.width - this.touchGestureEdgeGuardPx;
      if (e.touches.length >= 2 || nearEdgeX) {
        this.touchGestureLocked = true;
        this.touchGestureCandidate = false;
        e.preventDefault();
      }
      e.stopPropagation();
    };
    this.onNativeTouchMove = (e) => {
      if (!this.canUseNativeTouchCapture()) return;
      if (!this.touchGestureCandidate && !this.touchGestureLocked) return;
      if (e.touches.length <= 0) {
        this.resetNativeTouchCapture();
        return;
      }
      const first = e.touches[0];
      if (!this.touchGestureLocked) {
        if (e.touches.length >= 2) {
          this.touchGestureLocked = true;
          this.touchGestureCandidate = false;
        } else {
          const vpRect = this.viewportEl.getBoundingClientRect();
          const x = first.clientX - vpRect.left;
          const y = first.clientY - vpRect.top;
          const dx = x - this.touchGestureStartX;
          const dy = y - this.touchGestureStartY;
          if (Math.hypot(dx, dy) >= this.touchGestureLockThresholdPx) {
            this.touchGestureLocked = true;
            this.touchGestureCandidate = false;
          }
        }
      }
      if (this.touchGestureLocked) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    this.onNativeTouchEnd = (e) => {
      if (e.touches.length === 0) {
        this.resetNativeTouchCapture();
      }
    };
    this.saveDataSoon = /* @__PURE__ */ (() => {
      let t = null;
      return () => new Promise((resolve) => {
        if (t) window.clearTimeout(t);
        t = window.setTimeout(() => {
          t = null;
          void (async () => {
            if (this.data) {
              const would = await this.store.wouldChange(this.data);
              if (would) {
                this.ignoreNextModify = true;
                await this.store.save(this.data);
              }
            }
            resolve();
          })();
        }, 200);
      });
    })();
    this.app = app;
    this.plugin = plugin;
    this.el = el;
    this.cfg = cfg;
    if (this.cfg.storageMode === "note") {
      const id = (_b = this.cfg.mapId) != null ? _b : `map-${(_a = this.cfg.sectionStart) != null ? _a : 0}`;
      this.store = new NoteMarkerStore(app, cfg.sourcePath, id, this.cfg.sectionEnd);
    } else {
      this.store = new MarkerStore(app, cfg.sourcePath, cfg.markersPath);
    }
  }
  getSvgRasterMaxScale() {
    var _a;
    return (_a = this.plugin.settings.svgRasterMaxScale) != null ? _a : 8;
  }
  ensureMarkerLayersByNames(names) {
    var _a, _b;
    if (!this.data) return;
    const list = (names != null ? names : []).map((s) => (s != null ? s : "").trim()).filter(Boolean);
    if (list.length === 0) return;
    (_b = (_a = this.data).layers) != null ? _b : _a.layers = [{ id: "default", name: "Default", visible: true, locked: false }];
    const existingByName = new Set(this.data.layers.map((l) => {
      var _a2;
      return ((_a2 = l.name) != null ? _a2 : "").trim();
    }));
    for (const name of list) {
      if (existingByName.has(name)) continue;
      const id = generateId("layer");
      this.data.layers.push({ id, name, visible: true, locked: false });
      existingByName.add(name);
    }
  }
  stripYamlScalar(s) {
    const t = s.trim();
    if (t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'")) {
      return t.slice(1, -1);
    }
    return t;
  }
  isPlainObject(val) {
    return typeof val === "object" && val !== null && !Array.isArray(val);
  }
  parseZoommapYamlFromBlock(lines, blk) {
    const raw = lines.slice(blk.start + 1, blk.end).map((ln) => stripQuotePrefix(ln)).join("\n");
    try {
      const parsed = (0, import_obsidian21.parseYaml)(raw);
      return this.isPlainObject(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  }
  firstBasePathFromYaml(obj) {
    const bases = obj["imageBases"];
    if (!Array.isArray(bases) || bases.length === 0) return "";
    const first = bases[0];
    if (typeof first === "string") return first.trim();
    if (this.isPlainObject(first) && typeof first["path"] === "string") return String(first["path"]).trim();
    return "";
  }
  scalarString(obj, key) {
    const v = obj[key];
    return typeof v === "string" ? v.trim() : "";
  }
  computeEffectiveImageFromYaml(obj) {
    return this.scalarString(obj, "image") || this.firstBasePathFromYaml(obj);
  }
  computeEffectiveMarkersFromYaml(obj) {
    const m = this.scalarString(obj, "markers");
    if (m) return m;
    const img = this.computeEffectiveImageFromYaml(obj);
    return img ? `${img}.markers.json` : "";
  }
  findAllZoommapBlocks(lines) {
    const blocks = [];
    for (let i = 0; i < lines.length; i++) {
      const ln = stripQuotePrefix(lines[i]).trimStart().toLowerCase();
      if (!ln.startsWith("```zoommap")) continue;
      let j = i + 1;
      while (j < lines.length && !stripQuotePrefix(lines[j]).trimStart().startsWith("```")) j++;
      if (j >= lines.length) break;
      blocks.push({ start: i, end: j });
      i = j;
    }
    return blocks;
  }
  async upsertYamlMarkersPath(newMarkersPath) {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian21.TFile)) return false;
    let foundBlock = false;
    let didChange = false;
    await this.app.vault.process(af, (text) => {
      var _a, _b;
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return text;
      foundBlock = true;
      const blkPrefix = splitQuotePrefix((_a = lines[blk.start]) != null ? _a : "").prefix;
      const content = lines.slice(blk.start + 1, blk.end);
      const keyRe = /^(\s*)markers\s*:\s*(.*)$/i;
      let keyIdx = -1;
      let keyIndent = "";
      let keyPrefix = blkPrefix;
      for (let i = 0; i < content.length; i++) {
        const info = splitQuotePrefix(content[i]);
        const m = keyRe.exec(info.rest);
        if (m) {
          keyIdx = i;
          keyIndent = (_b = m[1]) != null ? _b : "";
          keyPrefix = info.prefix || blkPrefix;
          break;
        }
      }
      const newLine = `${keyPrefix}${keyIndent}markers: ${JSON.stringify(newMarkersPath)}`;
      const out = content.slice();
      if (keyIdx >= 0) {
        if (out[keyIdx] !== newLine) {
          out[keyIdx] = newLine;
          didChange = true;
        }
      } else {
        const indent = this.detectYamlKeyIndent(out);
        out.push(`${blkPrefix}${indent}markers: ${JSON.stringify(newMarkersPath)}`);
        didChange = true;
      }
      if (!didChange) return text;
      return [
        ...lines.slice(0, blk.start + 1),
        ...out,
        ...lines.slice(blk.end)
      ].join("\n");
    });
    return foundBlock && didChange;
  }
  computeMarkersPathForBase(basePath) {
    return (0, import_obsidian21.normalizePath)(`${basePath}.markers.json`);
  }
  async ensureFolderForPath(path) {
    const dir = (0, import_obsidian21.normalizePath)(path).split("/").slice(0, -1).join("/");
    if (dir && !this.app.vault.getAbstractFileByPath(dir)) {
      await this.app.vault.createFolder(dir);
    }
  }
  async moveCurrentMarkersFileToBase(newBasePath) {
    if (this.cfg.storageMode !== "json") {
      throw new Error("Cannot move markers.json when storage mode is 'note'.");
    }
    const oldMarkersPath = (0, import_obsidian21.normalizePath)(this.store.getPath());
    const oldAf = this.app.vault.getAbstractFileByPath(oldMarkersPath);
    if (!(oldAf instanceof import_obsidian21.TFile)) {
      throw new Error(`Current markers.json not found: ${oldMarkersPath}`);
    }
    await this.saveDataSoon();
    const wanted = this.computeMarkersPathForBase(newBasePath);
    await this.ensureFolderForPath(wanted);
    let finalPath = (0, import_obsidian21.normalizePath)(wanted);
    const base = finalPath.slice(0, -".markers.json".length);
    let i = 1;
    while (this.app.vault.getAbstractFileByPath(finalPath)) {
      finalPath = (0, import_obsidian21.normalizePath)(`${base}-${i}.markers.json`);
      i++;
    }
    await this.app.vault.rename(oldAf, finalPath);
    return finalPath;
  }
  readYamlScalarFromBlock(blockLines, key) {
    var _a;
    const re = new RegExp(`^\\s*${key}\\s*:\\s*(.+)\\s*$`, "i");
    for (const ln of blockLines) {
      const rest = stripQuotePrefix(ln);
      const m = re.exec(rest);
      if (m) return this.stripYamlScalar((_a = m[1]) != null ? _a : "");
    }
    return null;
  }
  findZoommapBlockForThisMap(lines) {
    var _a, _b, _c;
    const wantId = ((_a = this.cfg.mapId) != null ? _a : "").trim();
    const wantMarkers = this.cfg.storageMode === "json" ? (0, import_obsidian21.normalizePath)((_b = this.cfg.markersPath) != null ? _b : "") : "";
    const wantImage = (0, import_obsidian21.normalizePath)((_c = this.cfg.imagePath) != null ? _c : "");
    const all = this.findAllZoommapBlocks(lines);
    if (wantId) {
      let found = null;
      let dupCount = 0;
      for (const blk of all) {
        const y = this.parseZoommapYamlFromBlock(lines, blk);
        if (!y) continue;
        const id = this.scalarString(y, "id");
        if (id !== wantId) continue;
        if (!found) found = blk;
        else dupCount++;
      }
      if (found) {
        if (dupCount > 0) {
          console.warn(
            "Zoom Map: duplicate zoommap id detected in note.",
            { id: wantId, duplicates: dupCount + 1, sourcePath: this.cfg.sourcePath }
          );
        }
        return found;
      }
    }
    if (typeof this.cfg.sectionStart === "number") {
      const blk = this.findZoommapBlock(lines, this.cfg.sectionStart);
      if (blk) return blk;
    }
    let best = null;
    for (const blk of all) {
      const y = this.parseZoommapYamlFromBlock(lines, blk);
      if (!y) continue;
      const image = this.computeEffectiveImageFromYaml(y);
      const markers = this.computeEffectiveMarkersFromYaml(y);
      if (!best && wantMarkers && markers && (0, import_obsidian21.normalizePath)(markers) === wantMarkers) {
        best = blk;
        continue;
      }
      if (!best && wantImage && image && (0, import_obsidian21.normalizePath)(image) === wantImage) {
        best = blk;
      }
    }
    return best;
  }
  openViewEditorFromMap() {
    var _a, _b, _c, _d, _e, _f;
    if (!this.data) return;
    const bases = this.getBasesNormalized();
    const overlays = (_a = this.data.overlays) != null ? _a : [];
    const rect = this.viewportEl.getBoundingClientRect();
    const curW = Math.round(rect.width || 0);
    const curH = Math.round(rect.height || 0);
    const cfg = {
      imageBases: bases.map((b) => ({ path: b.path, name: b.name })),
      overlays: overlays.map((o) => ({
        path: o.path,
        name: o.name,
        visible: o.visible
      })),
      markersPath: this.cfg.storageMode === "json" ? this.cfg.markersPath : "",
      renderMode: this.cfg.renderMode,
      minZoom: this.cfg.minZoom,
      maxZoom: this.cfg.maxZoom,
      wrap: !!this.cfg.wrap,
      responsive: !!this.cfg.responsive,
      width: curW > 0 ? `${curW}px` : (_b = this.cfg.width) != null ? _b : "",
      height: curH > 0 ? `${curH}px` : (_c = this.cfg.height) != null ? _c : "",
      useWidth: !!this.cfg.widthFromYaml,
      useHeight: !!this.cfg.heightFromYaml,
      resizable: !!this.cfg.resizable,
      resizeHandle: (_d = this.cfg.resizeHandle) != null ? _d : "right",
      align: this.cfg.align,
      markerLayers: this.data.layers.map((l) => {
        var _a2;
        return (_a2 = l.name) != null ? _a2 : "Layer";
      }),
      id: this.cfg.mapId,
      viewportFrame: (_e = this.cfg.viewportFrame) != null ? _e : "",
      viewportFrameInsets: (_f = this.cfg.viewportFrameInsets) != null ? _f : {
        unit: "framePx",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    };
    const modal = new ViewEditorModal(this.app, cfg, (res) => {
      if (res.action !== "save" || !res.config) return;
      void this.applyViewEditorResult(res.config);
    }, {
      onPreview: (previewCfg) => {
        this.previewViewportFrameFromViewEditor({
          viewportFrame: previewCfg.viewportFrame,
          viewportFrameInsets: previewCfg.viewportFrameInsets
        });
      }
    });
    modal.open();
  }
  applyInitialView(zoom, center) {
    const z = clamp(zoom, this.cfg.minZoom, this.cfg.maxZoom);
    const r = this.viewportEl.getBoundingClientRect();
    this.vw = r.width;
    this.vh = r.height;
    if (this.vw < 2 || this.vh < 2) {
      return;
    }
    if (!this.imgW || !this.imgH || !this.vw || !this.vh) {
      this.fitToView();
      return;
    }
    const worldX = center.x * this.imgW;
    const worldY = center.y * this.imgH;
    const tx = this.vw / 2 - worldX * z;
    const ty = this.vh / 2 - worldY * z;
    this.applyTransform(z, tx, ty);
    this.initialViewApplied = true;
    this.captureViewIfVisible();
    this.renderDrawingEditHandles();
  }
  applyInitialViewRect(rect) {
    const r = this.viewportEl.getBoundingClientRect();
    this.vw = r.width;
    this.vh = r.height;
    if (this.vw < 2 || this.vh < 2) return;
    if (!this.imgW || !this.imgH) {
      this.fitToView();
      return;
    }
    const worldW = Math.abs(rect.right - rect.left) * this.imgW;
    const worldH = Math.abs(rect.bottom - rect.top) * this.imgH;
    if (!Number.isFinite(worldW) || !Number.isFinite(worldH) || worldW <= 0 || worldH <= 0) {
      this.fitToView();
      return;
    }
    const center = {
      x: (rect.left + rect.right) / 2,
      y: (rect.top + rect.bottom) / 2
    };
    const zoomX = this.vw / worldW;
    const zoomY = this.vh / worldH;
    const z = clamp(Math.max(zoomX, zoomY), this.cfg.minZoom, this.cfg.maxZoom);
    const worldX = center.x * this.imgW;
    const worldY = center.y * this.imgH;
    const tx = this.vw / 2 - worldX * z;
    const ty = this.vh / 2 - worldY * z;
    this.applyTransform(z, tx, ty);
    this.initialViewApplied = true;
    this.captureViewIfVisible();
    this.renderDrawingEditHandles();
  }
  captureViewIfVisible() {
    if (!this.imgW || !this.imgH) return;
    const r = this.viewportEl.getBoundingClientRect();
    const vw = r.width || 0;
    const vh = r.height || 0;
    if (vw < 2 || vh < 2) return;
    const worldX = (vw / 2 - this.tx) / this.scale;
    const worldY = (vh / 2 - this.ty) / this.scale;
    this.lastGoodView = {
      scale: this.scale,
      center: {
        x: clamp(worldX / this.imgW, 0, 1),
        y: clamp(worldY / this.imgH, 0, 1)
      }
    };
  }
  pushDeleteUndo(payload, label) {
    if (!this.data) return;
    const clonedPayload = cloneForUndo(payload);
    const entry = {
      id: generateId("undo"),
      label: label.trim() || "Deleted item",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      payload: clonedPayload
    };
    const prev = Array.isArray(this.data.deleted) ? this.data.deleted : [];
    this.data.deleted = [entry, ...prev].slice(0, 3);
  }
  getLatestDeleteUndoLabel() {
    var _a, _b, _c;
    const label = (_c = (_b = (_a = this.data) == null ? void 0 : _a.deleted) == null ? void 0 : _b[0]) == null ? void 0 : _c.label;
    return typeof label === "string" && label.trim() ? label : null;
  }
  async ensurePingNoteFileForMarker(ping, preset) {
    var _a, _b, _c, _d, _e, _f, _g;
    const notePath = ((_a = ping.pingNotePath) != null ? _a : "").trim();
    if (!notePath) return null;
    const existing = this.app.vault.getAbstractFileByPath(notePath);
    if (existing instanceof import_obsidian21.TFile) return existing;
    await this.ensureFolderForPath(notePath);
    const radius = (_b = ping.pingRadius) != null ? _b : 0;
    const unit = (_c = ping.pingRadiusUnit) != null ? _c : "km";
    const customUnitId = ping.pingRadiusCustomUnitId;
    const unitLabel = this.pingUnitLabel(unit, customUnitId);
    const distLabel = this.formatPingDistanceLabel(radius, unit, customUnitId);
    const dummyPreset = preset != null ? preset : { id: "", name: "", distances: [], unit: "km" };
    const sections = (_d = preset == null ? void 0 : preset.sections) != null ? _d : {};
    const includeBases = sections.bases !== false;
    const includeTooltips = sections.tooltips !== false;
    const includeRelated = sections.related !== false;
    const includeTravel = sections.travelTimes !== false;
    const fm = {
      zoommapPing: true,
      zoommapPingId: ping.id,
      zoommapPingMapId: (_e = this.cfg.mapId) != null ? _e : "",
      zoommapPingSourcePath: this.cfg.sourcePath,
      zoommapPingSourceFileName: basename(this.cfg.sourcePath),
      zoommapPingBase: this.getActiveBasePath(),
      zoommapPingRadius: radius,
      zoommapPingUnit: unit,
      zoommapPingCustomUnitId: unit === "custom" ? customUnitId : void 0,
      zoommapPingPresetId: (_f = ping.pingPresetId) != null ? _f : "",
      zoommapPingPresetName: (_g = preset == null ? void 0 : preset.name) != null ? _g : "",
      zoommapPingInRangePaths: [],
      zoommapPingDistances: {},
      zoommapPingUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    const frontmatter = `---
${(0, import_obsidian21.stringifyYaml)(fm).trimEnd()}
---

`;
    const md = frontmatter + this.buildPingNoteText("", {
      defaultTitle: `# Party pin: ${(preset == null ? void 0 : preset.name) || "Party"} (${distLabel})`,
      baseYamlFallback: this.buildPingBaseYaml(dummyPreset, unitLabel),
      tooltipBody: "*(none)*",
      relatedBody: "*(none)*",
      travelBody: "*(none)*",
      includeBases,
      includeTooltips,
      includeRelated,
      includeTravel
    });
    return this.app.vault.create(notePath, md);
  }
  async undoLastDelete() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
    if (!((_b = (_a = this.data) == null ? void 0 : _a.deleted) == null ? void 0 : _b.length)) return;
    const [entry, ...rest] = this.data.deleted;
    const payload = entry.payload;
    let changed = false;
    this.stopTextEdit(false);
    this.finishTextBoxMove(false);
    this.stopEditDrawingGeometry(false);
    this.closeMenu();
    switch (payload.kind) {
      case "marker": {
        (_d = (_c = this.data).markers) != null ? _d : _c.markers = [];
        insertAtClamped(this.data.markers, payload.index, cloneForUndo(payload.marker));
        changed = true;
        break;
      }
      case "drawing": {
        (_f = (_e = this.data).drawings) != null ? _f : _e.drawings = [];
        insertAtClamped(this.data.drawings, payload.index, cloneForUndo(payload.drawing));
        changed = true;
        break;
      }
      case "grid": {
        (_h = (_g = this.data).grids) != null ? _h : _g.grids = [];
        insertAtClamped(this.data.grids, payload.index, cloneForUndo(payload.grid));
        changed = true;
        break;
      }
      case "text-layer": {
        (_j = (_i = this.data).textLayers) != null ? _j : _i.textLayers = [];
        insertAtClamped(this.data.textLayers, payload.index, cloneForUndo(payload.layer));
        changed = true;
        break;
      }
      case "text-box": {
        const layer = ((_k = this.data.textLayers) != null ? _k : []).find((l) => l.id === payload.layerId);
        if (layer) {
          (_l = layer.boxes) != null ? _l : layer.boxes = [];
          insertAtClamped(layer.boxes, payload.index, cloneForUndo(payload.box));
          changed = true;
        }
        break;
      }
      case "marker-layer": {
        (_n = (_m = this.data).layers) != null ? _n : _m.layers = [];
        if (!((_o = this.data.layers) != null ? _o : []).some((l) => l.id === payload.layer.id)) {
          insertAtClamped(this.data.layers, payload.index, cloneForUndo(payload.layer));
        }
        if (payload.mode === "delete-markers") {
          (_q = (_p = this.data).markers) != null ? _q : _p.markers = [];
          for (const item of (_r = payload.markers) != null ? _r : []) {
            insertAtClamped(this.data.markers, item.index, cloneForUndo(item.marker));
          }
        } else {
          const moved = new Set((_s = payload.movedMarkerIds) != null ? _s : []);
          for (const marker of (_t = this.data.markers) != null ? _t : []) {
            if (moved.has(marker.id)) marker.layer = payload.layer.id;
          }
        }
        changed = true;
        break;
      }
      case "draw-layer": {
        (_v = (_u = this.data).drawLayers) != null ? _v : _u.drawLayers = [];
        if (!((_w = this.data.drawLayers) != null ? _w : []).some((l) => l.id === payload.layer.id)) {
          insertAtClamped(this.data.drawLayers, payload.index, cloneForUndo(payload.layer));
        }
        (_y = (_x = this.data).drawings) != null ? _y : _x.drawings = [];
        for (const item of (_z = payload.drawings) != null ? _z : []) {
          insertAtClamped(this.data.drawings, item.index, cloneForUndo(item.drawing));
        }
        changed = true;
        break;
      }
    }
    if (!changed) return;
    this.data.deleted = rest;
    this.renderAll();
    await this.saveDataSoon();
    this.schedulePingUpdate();
    new import_obsidian21.Notice(`Undo: ${entry.label}`, 1400);
  }
  async saveDefaultViewToYaml() {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian21.TFile)) {
      new import_obsidian21.Notice("Source note not found.", 2500);
      return;
    }
    const z = this.scale;
    if (!this.imgW || !this.imgH || !Number.isFinite(z) || z <= 0) {
      new import_obsidian21.Notice("Cannot store default view (image not ready).", 2500);
      return;
    }
    const r = this.viewportEl.getBoundingClientRect();
    const vw = r.width || this.vw || 1;
    const vh = r.height || this.vh || 1;
    const centerScreenX = vw / 2;
    const centerScreenY = vh / 2;
    const worldX = (centerScreenX - this.tx) / z;
    const worldY = (centerScreenY - this.ty) / z;
    const cx = Math.min(Math.max(worldX / this.imgW, 0), 1);
    const cy = Math.min(Math.max(worldY / this.imgH, 0), 1);
    const zoom = z;
    let foundBlock = false;
    let didChange = false;
    await this.app.vault.process(af, (text) => {
      var _a, _b;
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return text;
      foundBlock = true;
      const blkPrefix = splitQuotePrefix((_a = lines[blk.start]) != null ? _a : "").prefix;
      const content = lines.slice(blk.start + 1, blk.end);
      const keyRe = /^(\s*)view\s*:/;
      let keyIdx = -1;
      let keyIndent = "";
      let keyPrefix = blkPrefix;
      for (let i = 0; i < content.length; i++) {
        const info = splitQuotePrefix(content[i]);
        const m = keyRe.exec(info.rest);
        if (m) {
          keyIdx = i;
          keyIndent = (_b = m[1]) != null ? _b : "";
          keyPrefix = info.prefix || blkPrefix;
          break;
        }
      }
      const viewLines = [
        `${keyPrefix}${keyIndent}view:`,
        `${keyPrefix}${keyIndent}  zoom: ${zoom.toFixed(4)}`,
        `${keyPrefix}${keyIndent}  centerX: ${cx.toFixed(6)}`,
        `${keyPrefix}${keyIndent}  centerY: ${cy.toFixed(6)}`
      ];
      const isNextTopLevelKey = (ln) => {
        var _a2, _b2;
        const rest = stripQuotePrefix(ln);
        const trimmed = rest.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith("#")) return false;
        const spaces = (_b2 = (_a2 = /^\s*/.exec(rest)) == null ? void 0 : _a2[0].length) != null ? _b2 : 0;
        return spaces <= keyIndent.length && /^[A-Za-z0-9_-]+\s*:/.test(trimmed);
      };
      let newContent;
      if (keyIdx >= 0) {
        let end = keyIdx + 1;
        while (end < content.length && !isNextTopLevelKey(content[end])) end++;
        newContent = [
          ...content.slice(0, keyIdx),
          ...viewLines,
          ...content.slice(end)
        ];
      } else {
        const indent = this.detectYamlKeyIndent(content);
        const pfx = blkPrefix;
        const vLines = [
          `${pfx}${indent}view:`,
          `${pfx}${indent}  zoom: ${zoom.toFixed(4)}`,
          `${pfx}${indent}  centerX: ${cx.toFixed(6)}`,
          `${pfx}${indent}  centerY: ${cy.toFixed(6)}`
        ];
        newContent = [...content, ...vLines];
      }
      if (newContent.join("\n") !== content.join("\n")) didChange = true;
      return [
        ...lines.slice(0, blk.start + 1),
        ...newContent,
        ...lines.slice(blk.end)
      ].join("\n");
    });
    if (!foundBlock) {
      new import_obsidian21.Notice("Could not locate zoommap block (embedded/callout?).", 3500);
      return;
    }
    if (!didChange) {
      new import_obsidian21.Notice("Default view unchanged (already up to date).", 2e3);
      return;
    }
    new import_obsidian21.Notice("Default view stored in YAML.", 2e3);
  }
  async deleteDefaultViewFromYaml() {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian21.TFile)) {
      new import_obsidian21.Notice("Source note not found.", 2500);
      return;
    }
    let foundBlock = false;
    let didChange = false;
    await this.app.vault.process(af, (text) => {
      var _a, _b;
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return text;
      foundBlock = true;
      const blkPrefix = splitQuotePrefix((_a = lines[blk.start]) != null ? _a : "").prefix;
      const content = lines.slice(blk.start + 1, blk.end);
      const keyRe = /^(\s*)view\s*:/i;
      let keyIdx = -1;
      let keyIndent = "";
      for (let i = 0; i < content.length; i++) {
        const info = splitQuotePrefix(content[i]);
        const m = keyRe.exec(info.rest);
        if (m) {
          keyIdx = i;
          keyIndent = (_b = m[1]) != null ? _b : "";
          break;
        }
      }
      if (keyIdx < 0) return text;
      const isNextTopLevelKey = (ln) => {
        var _a2, _b2;
        const rest = stripQuotePrefix(ln);
        const trimmed = rest.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith("#")) return false;
        const spaces = (_b2 = (_a2 = /^\s*/.exec(rest)) == null ? void 0 : _a2[0].length) != null ? _b2 : 0;
        return spaces <= keyIndent.length && /^[A-Za-z0-9_-]+\s*:/.test(trimmed);
      };
      let end = keyIdx + 1;
      while (end < content.length && !isNextTopLevelKey(content[end])) end++;
      const newContent = [
        ...content.slice(0, keyIdx),
        ...content.slice(end)
      ];
      if (newContent.join("\n") !== content.join("\n")) didChange = true;
      return [
        ...lines.slice(0, blk.start + 1),
        ...newContent.map((ln) => blkPrefix ? blkPrefix + stripQuotePrefix(ln) : ln),
        ...lines.slice(blk.end)
      ].join("\n");
    });
    if (!foundBlock) {
      new import_obsidian21.Notice("Could not locate zoommap block (embedded/callout?).", 3500);
      return;
    }
    if (!didChange) {
      new import_obsidian21.Notice("No default view found in YAML.", 2e3);
      return;
    }
    new import_obsidian21.Notice("Default view removed from YAML.", 2e3);
  }
  async applyViewEditorResult(cfg) {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian21.TFile)) {
      new import_obsidian21.Notice("Source note not found.", 3e3);
      return;
    }
    const buildYaml = (pluginCfg) => this.plugin.buildYamlFromViewConfig(pluginCfg);
    let foundBlock = false;
    let didChange = false;
    await this.app.vault.process(af, (text) => {
      var _a, _b;
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return text;
      foundBlock = true;
      const blkPrefix = splitQuotePrefix((_a = lines[blk.start]) != null ? _a : "").prefix;
      const existingObj = (_b = this.parseZoommapYamlFromBlock(lines, blk)) != null ? _b : {};
      const nextYamlStr = buildYaml(cfg);
      let nextObj = {};
      try {
        const parsed = (0, import_obsidian21.parseYaml)(nextYamlStr);
        if (this.isPlainObject(parsed)) nextObj = parsed;
      } catch (e) {
        nextObj = {};
      }
      const merged = { ...existingObj, ...nextObj };
      const managedKeys = [
        "image",
        "imageBases",
        "imageOverlays",
        "markers",
        "markerLayers",
        "minZoom",
        "maxZoom",
        "wrap",
        "responsive",
        "width",
        "height",
        "resizable",
        "resizeHandle",
        "render",
        "align",
        "id",
        "viewportFrame",
        "viewportFrameInsets"
      ];
      for (const k of managedKeys) {
        if (!(k in nextObj) && k in merged) {
          delete merged[k];
        }
      }
      const mergedYamlStr = (0, import_obsidian21.stringifyYaml)(merged).trimEnd();
      const yamlLinesRaw = mergedYamlStr.split("\n");
      const yamlLines = blkPrefix ? yamlLinesRaw.map((ln) => `${blkPrefix}${ln}`) : yamlLinesRaw;
      const before = lines.slice(blk.start + 1, blk.end).join("\n");
      const after = yamlLines.join("\n");
      if (before !== after) didChange = true;
      return [
        ...lines.slice(0, blk.start + 1),
        ...yamlLines,
        ...lines.slice(blk.end)
      ].join("\n");
    });
    if (!foundBlock) {
      new import_obsidian21.Notice("Could not locate zoommap block (embedded/callout?).", 3500);
      return;
    }
    if (!didChange) {
      new import_obsidian21.Notice("No changes to apply.", 2e3);
      return;
    }
    try {
      this.ensureMarkerLayersByNames(cfg.markerLayers);
      await this.saveDataSoon();
      this.renderMarkersOnly();
    } catch (e) {
      console.warn("Failed to apply markerLayers to marker store", e);
    }
    new import_obsidian21.Notice("View updated.", 2500);
  }
  getScreenDisplayPlugin() {
    var _a, _b;
    const registry = (_b = (_a = this.app.plugins) == null ? void 0 : _a.plugins) != null ? _b : {};
    const raw = registry["ttrpg-tools-screen"];
    if (!raw || typeof raw.sendNoteByPath !== "function" || typeof raw.sendMarkdownWithFog !== "function") return null;
    return {
      sendNoteByPath: raw.sendNoteByPath.bind(raw),
      sendMarkdownWithFog: raw.sendMarkdownWithFog.bind(raw),
      sendZoomMap: typeof raw.sendZoomMap === "function" ? raw.sendZoomMap.bind(raw) : void 0
    };
  }
  isSecondScreenPlayerView() {
    return this.cfg.screenRole === "player";
  }
  isSecondScreenControllerView() {
    return this.cfg.screenRole === "controller";
  }
  getRevealedMarkerIdSet() {
    var _a, _b;
    const ids = (_b = (_a = this.data) == null ? void 0 : _a.secondScreen) == null ? void 0 : _b.revealedMarkerIds;
    return new Set(Array.isArray(ids) ? ids : []);
  }
  secondScreenFeatureEnabled() {
    return !!this.plugin.settings.enableSecondScreen;
  }
  ensureSecondScreenConfig() {
    var _a, _b;
    if (!this.data) throw new Error("Map data not loaded.");
    (_b = (_a = this.data).secondScreen) != null ? _b : _a.secondScreen = {};
    return this.data.secondScreen;
  }
  getSecondScreenSelectedIds() {
    var _a, _b, _c;
    if (!this.data) {
      return {
        markerLayerIds: /* @__PURE__ */ new Set(),
        drawLayerIds: /* @__PURE__ */ new Set(),
        textLayerIds: /* @__PURE__ */ new Set()
      };
    }
    const sec = this.ensureSecondScreenConfig();
    const markerLayerIds = Array.isArray(sec.markerLayerIds) ? new Set(sec.markerLayerIds) : new Set(((_a = this.data.layers) != null ? _a : []).map((l) => l.id));
    const drawLayerIds = Array.isArray(sec.drawLayerIds) ? new Set(sec.drawLayerIds) : new Set(((_b = this.data.drawLayers) != null ? _b : []).map((l) => l.id));
    const textLayerIds = Array.isArray(sec.textLayerIds) ? new Set(sec.textLayerIds) : new Set(((_c = this.data.textLayers) != null ? _c : []).map((l) => l.id));
    return { markerLayerIds, drawLayerIds, textLayerIds };
  }
  openSecondScreenLayersModal() {
    var _a, _b, _c, _d, _e, _f;
    if (!this.data) return;
    const sec = this.ensureSecondScreenConfig();
    const markerSelected = Array.isArray(sec.markerLayerIds) ? new Set(sec.markerLayerIds) : new Set(((_a = this.data.layers) != null ? _a : []).map((l) => l.id));
    const drawSelected = Array.isArray(sec.drawLayerIds) ? new Set(sec.drawLayerIds) : new Set(((_b = this.data.drawLayers) != null ? _b : []).map((l) => l.id));
    const textSelected = Array.isArray(sec.textLayerIds) ? new Set(sec.textLayerIds) : new Set(((_c = this.data.textLayers) != null ? _c : []).map((l) => l.id));
    new SecondScreenLayersModal(
      this.app,
      {
        markerLayers: ((_d = this.data.layers) != null ? _d : []).map((l) => {
          var _a2;
          return {
            id: l.id,
            name: (_a2 = l.name) != null ? _a2 : "Layer",
            selected: markerSelected.has(l.id)
          };
        }),
        drawLayers: ((_e = this.data.drawLayers) != null ? _e : []).map((l) => {
          var _a2;
          return {
            id: l.id,
            name: (_a2 = l.name) != null ? _a2 : "Draw layer",
            selected: drawSelected.has(l.id)
          };
        }),
        textLayers: ((_f = this.data.textLayers) != null ? _f : []).map((l) => {
          var _a2;
          return {
            id: l.id,
            name: (_a2 = l.name) != null ? _a2 : "Text layer",
            selected: textSelected.has(l.id)
          };
        }),
        showGrids: sec.showGrids !== false
      },
      (res) => {
        if (res.action !== "save" || !this.data) return;
        const cfg = this.ensureSecondScreenConfig();
        cfg.markerLayerIds = res.markerLayerIds;
        cfg.showGrids = res.showGrids;
        cfg.drawLayerIds = res.drawLayerIds;
        cfg.textLayerIds = res.textLayerIds;
        void this.saveDataSoon();
        new import_obsidian21.Notice("Player screen layer setup saved.", 1200);
      }
    ).open();
  }
  async readMarkerFileDataFromPath(path) {
    try {
      const af = this.app.vault.getAbstractFileByPath((0, import_obsidian21.normalizePath)(path));
      if (!(af instanceof import_obsidian21.TFile)) return null;
      const raw = await this.app.vault.read(af);
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }
  mergeSecondScreenSnapshotWithExisting(snapshot, existing) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t;
    if (!existing) {
      (_a = snapshot.secondScreen) != null ? _a : snapshot.secondScreen = {};
      (_c = (_b = snapshot.secondScreen).revealedMarkerIds) != null ? _c : _b.revealedMarkerIds = [];
      return snapshot;
    }
    const existingSecond = (_d = existing.secondScreen) != null ? _d : {};
    snapshot.secondScreen = {
      ...(_e = snapshot.secondScreen) != null ? _e : {},
      revealedMarkerIds: Array.isArray(existingSecond.revealedMarkerIds) ? [...existingSecond.revealedMarkerIds] : [],
      view: existingSecond.view,
      fogMaskPath: existingSecond.fogMaskPath,
      fogVersion: existingSecond.fogVersion,
      notePath: (_g = (_f = snapshot.secondScreen) == null ? void 0 : _f.notePath) != null ? _g : existingSecond.notePath,
      markersPath: (_i = (_h = snapshot.secondScreen) == null ? void 0 : _h.markersPath) != null ? _i : existingSecond.markersPath,
      markerLayerIds: (_k = (_j = snapshot.secondScreen) == null ? void 0 : _j.markerLayerIds) != null ? _k : existingSecond.markerLayerIds,
      drawLayerIds: (_m = (_l = snapshot.secondScreen) == null ? void 0 : _l.drawLayerIds) != null ? _m : existingSecond.drawLayerIds,
      textLayerIds: (_o = (_n = snapshot.secondScreen) == null ? void 0 : _n.textLayerIds) != null ? _o : existingSecond.textLayerIds,
      showGrids: (_q = (_p = snapshot.secondScreen) == null ? void 0 : _p.showGrids) != null ? _q : existingSecond.showGrids
    };
    const existingMarkers = new Map(((_r = existing.markers) != null ? _r : []).map((m) => [m.id, m]));
    snapshot.markers = ((_s = snapshot.markers) != null ? _s : []).map((fresh) => {
      const old = existingMarkers.get(fresh.id);
      if (!old) return fresh;
      const merged = {
        ...fresh,
        x: old.x,
        y: old.y,
        anchorSpace: old.anchorSpace,
        hudX: old.hudX,
        hudY: old.hudY,
        hudModeX: old.hudModeX,
        hudModeY: old.hudModeY,
        hudLastWidth: old.hudLastWidth,
        hudLastHeight: old.hudLastHeight
      };
      if (typeof old.swapIndex === "number") merged.swapIndex = old.swapIndex;
      return merged;
    });
    const existingBasePaths = new Set(
      ((_t = snapshot.bases) != null ? _t : []).map((b) => typeof b === "string" ? b : b.path)
    );
    if (existing.activeBase && existingBasePaths.has(existing.activeBase)) {
      snapshot.activeBase = existing.activeBase;
    }
    return snapshot;
  }
  async buildSecondScreenSnapshot(playerMarkersPath, notePath) {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!this.data) throw new Error("Map data not loaded.");
    const snapshot = JSON.parse(
      JSON.stringify(sanitizeMarkerFileDataForSave(this.data))
    );
    const sec = this.ensureSecondScreenConfig();
    const { markerLayerIds, drawLayerIds, textLayerIds } = this.getSecondScreenSelectedIds();
    snapshot.layers = ((_a = snapshot.layers) != null ? _a : []).map((l) => ({
      ...l,
      visible: markerLayerIds.has(l.id),
      locked: false
    }));
    snapshot.markers = ((_b = snapshot.markers) != null ? _b : []).filter((m) => markerLayerIds.has(m.layer));
    snapshot.drawLayers = ((_c = snapshot.drawLayers) != null ? _c : []).map((l) => ({
      ...l,
      visible: drawLayerIds.has(l.id),
      locked: false
    }));
    snapshot.drawings = ((_d = snapshot.drawings) != null ? _d : []).filter((d) => drawLayerIds.has(d.layerId));
    const showGrids = sec.showGrids !== false;
    snapshot.grids = showGrids ? ((_e = snapshot.grids) != null ? _e : []).filter((g) => g.visible !== false && g.playerScreen !== "gm-only") : [];
    snapshot.textLayers = ((_f = snapshot.textLayers) != null ? _f : []).filter((t) => textLayerIds.has(t.id));
    (_g = snapshot.secondScreen) != null ? _g : snapshot.secondScreen = {};
    snapshot.secondScreen.notePath = notePath;
    snapshot.secondScreen.markersPath = playerMarkersPath;
    snapshot.secondScreen.markerLayerIds = [...markerLayerIds];
    snapshot.secondScreen.drawLayerIds = [...drawLayerIds];
    snapshot.secondScreen.textLayerIds = [...textLayerIds];
    snapshot.secondScreen.showGrids = sec.showGrids !== false;
    const existing = await this.readMarkerFileDataFromPath(playerMarkersPath);
    return this.mergeSecondScreenSnapshotWithExisting(snapshot, existing);
  }
  getCurrentViewForSecondScreen() {
    if (!this.imgW || !this.imgH) return null;
    const r = this.viewportEl.getBoundingClientRect();
    const vw = r.width || this.vw || 0;
    const vh = r.height || this.vh || 0;
    if (vw < 2 || vh < 2) return null;
    const worldX = (vw / 2 - this.tx) / this.scale;
    const worldY = (vh / 2 - this.ty) / this.scale;
    return {
      zoom: this.scale,
      centerX: clamp(worldX / this.imgW, 0, 1),
      centerY: clamp(worldY / this.imgH, 0, 1)
    };
  }
  getCurrentViewRectForSecondScreen() {
    if (!this.imgW || !this.imgH) return null;
    const r = this.viewportEl.getBoundingClientRect();
    const vw = r.width || this.vw || 0;
    const vh = r.height || this.vh || 0;
    if (vw < 2 || vh < 2) return null;
    return {
      left: (0 - this.tx) / this.scale / this.imgW,
      top: (0 - this.ty) / this.scale / this.imgH,
      right: (vw - this.tx) / this.scale / this.imgW,
      bottom: (vh - this.ty) / this.scale / this.imgH
    };
  }
  getCurrentOuterAspectForSecondScreen() {
    const r = this.el.getBoundingClientRect();
    const w = r.width || 0;
    const h = r.height || 0;
    if (w < 2 || h < 2) return null;
    return w / h;
  }
  buildSecondScreenNoteContent(markersPath, role) {
    var _a;
    const view = this.getCurrentViewForSecondScreen();
    const viewRect = this.getCurrentViewRectForSecondScreen();
    const aspect = this.getCurrentOuterAspectForSecondScreen();
    const padPx = 32;
    const availW = `var(--ttrpg-screen-avail-w, calc(100vw - ${padPx}px))`;
    const availH = `var(--ttrpg-screen-avail-h, calc(100vh - ${padPx}px))`;
    const width = aspect && Number.isFinite(aspect) && aspect > 0 ? `min(${availW}, calc(${availH} * ${aspect.toFixed(6)}))` : availW;
    const height = aspect && Number.isFinite(aspect) && aspect > 0 ? `min(calc(${availW} / ${aspect.toFixed(6)}), ${availH})` : availH;
    const yaml = {
      image: this.getActiveBasePath(),
      markers: markersPath,
      minZoom: this.cfg.minZoom,
      maxZoom: this.cfg.maxZoom,
      width,
      height,
      align: "center",
      resizable: false,
      responsive: false,
      wrap: false,
      render: this.cfg.renderMode,
      displayOnly: role === "player",
      screenRole: role
    };
    if ((_a = this.cfg.viewportFrame) == null ? void 0 : _a.trim()) {
      yaml.viewportFrame = this.cfg.viewportFrame.trim();
    }
    if (this.cfg.viewportFrameInsets) {
      yaml.viewportFrameInsets = {
        unit: this.cfg.viewportFrameInsets.unit,
        top: this.cfg.viewportFrameInsets.top,
        right: this.cfg.viewportFrameInsets.right,
        bottom: this.cfg.viewportFrameInsets.bottom,
        left: this.cfg.viewportFrameInsets.left
      };
    }
    if (view) {
      yaml.view = {
        zoom: Number(view.zoom.toFixed(4)),
        centerX: Number(view.centerX.toFixed(6)),
        centerY: Number(view.centerY.toFixed(6)),
        ...viewRect ? {
          left: Number(viewRect.left.toFixed(6)),
          top: Number(viewRect.top.toFixed(6)),
          right: Number(viewRect.right.toFixed(6)),
          bottom: Number(viewRect.bottom.toFixed(6)),
          fit: "cover"
        } : {}
      };
    }
    return `\`\`\`zoommap
${(0, import_obsidian21.stringifyYaml)(yaml).trimEnd()}
\`\`\`
`;
  }
  async sendToSecondScreen(useFog = false) {
    var _a, _b, _c, _d, _e;
    if (!this.data) return;
    if (!this.secondScreenFeatureEnabled()) {
      new import_obsidian21.Notice("Player screen integration is disabled in preferences.", 2500);
      return;
    }
    const screen = this.getScreenDisplayPlugin();
    if (!screen) {
      new import_obsidian21.Notice("Player screen plugin not found or not enabled.", 3500);
      return;
    }
    const folder = (0, import_obsidian21.normalizePath)(
      ((_a = this.plugin.settings.secondScreenFolder) != null ? _a : "ZoomMap/SecondScreen").trim() || "ZoomMap/SecondScreen"
    );
    const sec = this.ensureSecondScreenConfig();
    const stemBase = ((_b = this.cfg.mapId) == null ? void 0 : _b.trim()) || basename(this.getActiveBasePath()).replace(/\.[^.]+$/, "") || "map";
    const safeStem = this.sanitizeFileName(`${stemBase}-screen`);
    const notePath = (0, import_obsidian21.normalizePath)((_c = sec.notePath) != null ? _c : `${folder}/${safeStem}.md`);
    const markersPath = (0, import_obsidian21.normalizePath)((_d = sec.markersPath) != null ? _d : `${folder}/${safeStem}.markers.json`);
    await this.ensureFolderForPath(notePath);
    await this.ensureFolderForPath(markersPath);
    const snapshot = await this.buildSecondScreenSnapshot(markersPath, notePath);
    const json = JSON.stringify(sanitizeMarkerFileDataForSave(snapshot), null, 2);
    const screenMarkdown = this.buildSecondScreenNoteContent(markersPath, "player");
    const controllerMarkdown = this.buildSecondScreenNoteContent(markersPath, "controller");
    const markerAf = this.app.vault.getAbstractFileByPath(markersPath);
    if (markerAf instanceof import_obsidian21.TFile) {
      await this.app.vault.modify(markerAf, json);
    } else {
      await this.app.vault.create(markersPath, json);
    }
    const noteAf = this.app.vault.getAbstractFileByPath(notePath);
    if (noteAf instanceof import_obsidian21.TFile) {
      await this.app.vault.modify(noteAf, screenMarkdown);
    } else {
      await this.app.vault.create(notePath, screenMarkdown);
    }
    const fogKey = `zoommap-secondscreen:${markersPath}`;
    sec.notePath = notePath;
    sec.markersPath = markersPath;
    await this.saveDataSoon();
    if (screen.sendZoomMap) {
      await screen.sendZoomMap({
        title: ((_e = this.cfg.mapId) == null ? void 0 : _e.trim()) || basename(this.getActiveBasePath()),
        screenMarkdown,
        controllerMarkdown,
        sourcePath: notePath,
        sourceMarkersPath: this.store.getPath(),
        playerMarkersPath: markersPath,
        playerNotePath: notePath,
        mapId: this.cfg.mapId,
        fogKey: useFog ? fogKey : void 0
      });
    } else if (useFog) {
      await screen.sendMarkdownWithFog(screenMarkdown, notePath, fogKey);
    } else {
      await screen.sendNoteByPath(notePath);
    }
  }
  hasViewportFrame() {
    return typeof this.cfg.viewportFrame === "string" && this.cfg.viewportFrame.trim().length > 0;
  }
  getOuterSizePx() {
    const w = this.el.clientWidth || this.el.getBoundingClientRect().width || 1;
    const h = this.el.clientHeight || this.el.getBoundingClientRect().height || 1;
    return { w, h };
  }
  clampInsetsToMinInner(outerW, outerH, insets) {
    const minInnerW = 64;
    const minInnerH = 64;
    let { t, r, b, l } = insets;
    const maxSumX = Math.max(0, outerW - minInnerW);
    const sumX = l + r;
    if (sumX > maxSumX && sumX > 0) {
      const k = maxSumX / sumX;
      l *= k;
      r *= k;
    }
    const maxSumY = Math.max(0, outerH - minInnerH);
    const sumY = t + b;
    if (sumY > maxSumY && sumY > 0) {
      const k = maxSumY / sumY;
      t *= k;
      b *= k;
    }
    return {
      t: Math.max(0, Math.round(t)),
      r: Math.max(0, Math.round(r)),
      b: Math.max(0, Math.round(b)),
      l: Math.max(0, Math.round(l))
    };
  }
  computeViewportInsetsPx(outerW, outerH) {
    if (!this.hasViewportFrame() || !this.cfg.viewportFrameInsets) {
      return { t: 0, r: 0, b: 0, l: 0 };
    }
    const spec = this.cfg.viewportFrameInsets;
    if (spec.unit === "percent") {
      const t = outerH * (spec.top / 100);
      const b = outerH * (spec.bottom / 100);
      const l = outerW * (spec.left / 100);
      const r = outerW * (spec.right / 100);
      return this.clampInsetsToMinInner(outerW, outerH, { t, r, b, l });
    }
    if (this.frameNaturalW > 0 && this.frameNaturalH > 0) {
      const sx = outerW / this.frameNaturalW;
      const sy = outerH / this.frameNaturalH;
      const t = spec.top * sy;
      const b = spec.bottom * sy;
      const l = spec.left * sx;
      const r = spec.right * sx;
      return this.clampInsetsToMinInner(outerW, outerH, { t, r, b, l });
    }
    return { t: 0, r: 0, b: 0, l: 0 };
  }
  applyViewportInset() {
    const { w, h } = this.getOuterSizePx();
    const { t, r, b, l } = this.computeViewportInsetsPx(w, h);
    this.viewportEl.style.inset = `${t}px ${r}px ${b}px ${l}px`;
    if (this.hudClipEl) {
      this.hudClipEl.style.inset = `${t}px ${r}px ${b}px ${l}px`;
    }
  }
  async loadViewportFrameNaturalSize() {
    const img = this.viewportFrameEl;
    if (!img) return;
    try {
      await img.decode();
    } catch (e) {
    }
    this.frameNaturalW = img.naturalWidth || 0;
    this.frameNaturalH = img.naturalHeight || 0;
  }
  previewViewportFrameFromViewEditor(cfg) {
    void this.previewViewportFrameFromViewEditorAsync(cfg);
  }
  async previewViewportFrameFromViewEditorAsync(cfg) {
    var _a, _b, _c, _d;
    const nextFrame = ((_a = cfg.viewportFrame) != null ? _a : "").trim();
    this.cfg.viewportFrame = nextFrame.length ? nextFrame : void 0;
    this.cfg.viewportFrameInsets = cfg.viewportFrameInsets;
    const wantFrame = typeof this.cfg.viewportFrame === "string" && this.cfg.viewportFrame.trim().length > 0;
    this.el.classList.toggle("zm-root--framepad", wantFrame);
    if (!wantFrame) {
      (_b = this.viewportFrameEl) == null ? void 0 : _b.remove();
      this.viewportFrameEl = null;
      (_c = this.frameLayerEl) == null ? void 0 : _c.remove();
      this.frameLayerEl = null;
      this.frameNaturalW = 0;
      this.frameNaturalH = 0;
      this.applyViewportInset();
      this.onResize();
      return;
    }
    if (!this.frameLayerEl) {
      this.frameLayerEl = this.el.createDiv({ cls: "zm-frame-layer" });
    }
    if (!this.viewportFrameEl) {
      const img = this.frameLayerEl.createEl("img", { cls: "zm-viewport-frame" });
      img.decoding = "async";
      img.draggable = false;
      this.viewportFrameEl = img;
    }
    const src = this.resolveResourceUrl(this.cfg.viewportFrame.trim());
    if (this.viewportFrameEl.src !== src) {
      this.viewportFrameEl.src = src;
    }
    if (((_d = this.cfg.viewportFrameInsets) == null ? void 0 : _d.unit) === "framePx") {
      await this.loadViewportFrameNaturalSize();
    }
    this.applyViewportInset();
    this.onResize();
  }
  getOwnerDocument() {
    return this.el.ownerDocument;
  }
  getOwnerWindow() {
    var _a;
    return (_a = this.getOwnerDocument().defaultView) != null ? _a : window;
  }
  getOwnerBody() {
    return this.getOwnerDocument().body;
  }
  getSourcePath() {
    return this.cfg.sourcePath;
  }
  getMapId() {
    var _a;
    return (_a = this.cfg.mapId) != null ? _a : "";
  }
  async buildShareExportContext() {
    var _a, _b;
    if (!this.data) return null;
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian21.TFile)) return null;
    const text = await this.app.vault.read(af);
    const lines = text.split("\n");
    const blk = this.findZoommapBlockForThisMap(lines);
    if (!blk) return null;
    const yamlLines = lines.slice(blk.start + 1, blk.end).map((ln) => stripQuotePrefix(ln));
    const yamlRaw = yamlLines.join("\n").trimEnd();
    let yamlObject = null;
    try {
      const parsed = (0, import_obsidian21.parseYaml)(yamlRaw);
      if (this.isPlainObject(parsed)) yamlObject = parsed;
    } catch (e) {
      yamlObject = null;
    }
    return {
      sourcePath: this.cfg.sourcePath,
      mapId: (_a = this.cfg.mapId) != null ? _a : "",
      storageMode: (_b = this.cfg.storageMode) != null ? _b : "json",
      markersPath: this.cfg.markersPath,
      yamlBlock: `\`\`\`zoommap
${yamlRaw}
\`\`\``,
      yamlRaw,
      yamlObject,
      markerData: cloneForUndo(sanitizeMarkerFileDataForSave(this.data))
    };
  }
  captureRestoreState() {
    if (!this.imgW || !this.imgH) return null;
    this.captureViewIfVisible();
    const view = this.lastGoodView;
    if (!view) return null;
    return {
      activeBase: this.getActiveBasePath(),
      scale: view.scale,
      center: { ...view.center }
    };
  }
  updateZoomControlsVisibility() {
    if (!this.zoomControlsEl) return;
    const show = !!this.plugin.settings.showZoomButtonsHud && !this.cfg.responsive;
    this.zoomControlsEl.classList.toggle("zm-hidden", !show);
  }
  refreshMarkdownViewKeepingScroll(view) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    try {
      const scroll = (_c = (_b = (_a = view.currentMode) == null ? void 0 : _a.getScroll) == null ? void 0 : _b.call(_a)) != null ? _c : 0;
      if (view.getMode() === "preview") {
        (_e = (_d = view.previewMode) == null ? void 0 : _d.rerender) == null ? void 0 : _e.call(_d, true);
        (_g = (_f = view.previewMode) == null ? void 0 : _f.applyScroll) == null ? void 0 : _g.call(_f, scroll);
        return;
      }
      const data = view.getViewData();
      view.setViewData(data, false);
      (_i = (_h = view.currentMode) == null ? void 0 : _h.applyScroll) == null ? void 0 : _i.call(_h, scroll);
    } catch (err) {
      console.warn("Zoom Map: failed to refresh markdown view", err);
    }
  }
  async refreshOpenMarkdownViewsForPaths(paths) {
    const wanted = new Set(
      paths.map((p) => (0, import_obsidian21.normalizePath)((p != null ? p : "").trim())).filter((p) => p.length > 0)
    );
    if (wanted.size === 0) return;
    const leaves = this.app.workspace.getLeavesOfType("markdown");
    for (const leaf of leaves) {
      if (leaf.isDeferred) continue;
      if (!(leaf.view instanceof import_obsidian21.MarkdownView)) continue;
      const file = leaf.view.file;
      if (!(file instanceof import_obsidian21.TFile)) continue;
      const filePath = (0, import_obsidian21.normalizePath)(file.path);
      if (!wanted.has(filePath)) continue;
      this.refreshMarkdownViewKeepingScroll(leaf.view);
    }
  }
  asElement(target) {
    if (!target || typeof target !== "object") return null;
    if ("closest" in target) return target;
    return null;
  }
  startDraw(kind) {
    var _a;
    if (!this.plugin.settings.enableDrawing) {
      new import_obsidian21.Notice("Drawing tools are disabled in the plugin preferences.", 2e3);
      return;
    }
    if (!this.data) return;
    const layers = (_a = this.data.drawLayers) != null ? _a : [];
    const visible = layers.find((l) => l.visible);
    if (layers.length === 0) {
      new import_obsidian21.Notice(
        "No draw layers exist yet. Create one under image layers \u2192 draw layers \u2192 add draw layer\u2026",
        6e3
      );
      return;
    }
    if (!visible) {
      new import_obsidian21.Notice(
        "No draw layer is active. Enable a draw layer under image layers \u2192 draw layers.",
        6e3
      );
      return;
    }
    this.drawingMode = kind;
    this.drawingActiveLayerId = visible.id;
    this.drawRectStart = null;
    this.drawCircleCenter = null;
    this.drawPolygonPoints = [];
    this.measuring = false;
    this.calibrating = false;
    if (this.drawDraftLayer) {
      this.drawDraftLayer.innerHTML = "";
    }
    if (kind === "rect") {
      new import_obsidian21.Notice(
        "Draw rectangle: click start point, move the mouse, click end point. Press esc to cancel.",
        5e3
      );
    } else if (kind === "circle") {
      new import_obsidian21.Notice(
        "Draw circle: click center, move the mouse, click radius point. Press esc to cancel.",
        5e3
      );
    } else if (kind === "polyline") {
      new import_obsidian21.Notice(
        "Draw polyline: click to add points, move the mouse for preview, double-click or right-click to finish. Press esc to cancel.",
        7e3
      );
    } else if (kind === "polygon") {
      new import_obsidian21.Notice(
        "Draw polygon: click to add points, move the mouse for preview, double-click or right-click to finish. Press esc to cancel.",
        7e3
      );
    }
  }
  isCanvas() {
    return this.cfg.renderMode === "canvas";
  }
  updateSvgBaseFlag(path) {
    const isSvg = typeof path === "string" && path.toLowerCase().endsWith(".svg");
    this.baseIsSvg = isSvg;
    this.el.classList.toggle("zm-root--svg-base", isSvg);
  }
  async applySwitchPin(m) {
    var _a, _b, _c;
    if (!this.data) return;
    if (m.type !== "switch") return;
    const bases = this.getBasesNormalized();
    if (!bases.length) return;
    const current = this.getActiveBasePath();
    const rotate = !!m.switchRotate || !(typeof m.switchBase === "string" && m.switchBase.trim().length > 0);
    if (rotate) {
      const idx = bases.findIndex((b) => b.path === current);
      const next = (_a = bases[((idx >= 0 ? idx : 0) + 1) % bases.length]) == null ? void 0 : _a.path;
      if (next) await this.setActiveBase(next);
      return;
    }
    const target = ((_b = m.switchBase) != null ? _b : "").trim();
    if (!target) return;
    const exists = bases.some((b) => b.path === target);
    if (exists) {
      await this.setActiveBase(target);
    } else {
      const idx = bases.findIndex((b) => b.path === current);
      const next = (_c = bases[((idx >= 0 ? idx : 0) + 1) % bases.length]) == null ? void 0 : _c.path;
      if (next) await this.setActiveBase(next);
    }
  }
  openSwitchPinModal(opts, onDone) {
    const modal = new SwitchPinModal(
      this.app,
      this.plugin,
      {
        bases: opts.basePaths,
        iconKey: opts.initialIconKey,
        rotate: opts.initialRotate,
        switchBase: opts.initialSwitchBase,
        scaleLikeSticker: opts.initialScaleLikeSticker,
        placeAsHudPin: opts.initialHud
      },
      onDone
    );
    modal.open();
  }
  onPluginSettingsChanged() {
    this.applyGlobalHoverPopoverStyleVars();
    this.applyMeasureStyle();
    this.updateZoomControlsVisibility();
  }
  onload() {
    this.plugin.registerMapInstance(this);
    void this.bootstrap().catch((err) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(err);
      new import_obsidian21.Notice(`Zoom Map error: ${msg}`, 6e3);
    });
  }
  onunload() {
    var _a, _b, _c;
    this.plugin.unregisterMapInstance(this);
    if (this.zoomHudTimer !== null) {
      window.clearTimeout(this.zoomHudTimer);
      this.zoomHudTimer = null;
    }
    this.tintedSvgCache.clear();
    (_a = this.tooltipEl) == null ? void 0 : _a.remove();
    (_b = this.ro) == null ? void 0 : _b.disconnect();
    (_c = this.calloutMo) == null ? void 0 : _c.disconnect();
    this.closeMenu();
    this.disposeBitmaps();
    for (const byLod of this.svgBaseCache.values()) {
      for (const bmp of byLod.values()) {
        try {
          bmp.close();
        } catch (e) {
        }
      }
      byLod.clear();
    }
    this.svgBaseCache.clear();
    this.svgUpgradeInFlight.clear();
  }
  collectAncestorCallouts() {
    var _a;
    const out = [];
    let cur = this.el;
    while (cur) {
      const callout = (_a = cur.closest) == null ? void 0 : _a.call(cur, ".callout");
      if (callout && callout instanceof HTMLElement) {
        if (!out.includes(callout)) out.push(callout);
        cur = callout.parentElement;
      } else {
        break;
      }
    }
    return out;
  }
  scheduleTryApplyInitialViewFromCallout() {
    var _a;
    if (this.cfg.responsive) return;
    if (!this.cfg.initialViewRect && (!this.cfg.initialZoom || !this.cfg.initialCenter)) return;
    if (this.initialViewApplied) return;
    const callouts = this.collectAncestorCallouts();
    if (callouts.length === 0) return;
    const tryApply = () => {
      if (this.initialViewApplied) return;
      if (callouts.some((c) => c.classList.contains("is-collapsed"))) return;
      const r = this.viewportEl.getBoundingClientRect();
      if ((r.width || 0) < 2 || (r.height || 0) < 2) return;
      if (this.cfg.initialViewRect) {
        this.applyInitialViewRect(this.cfg.initialViewRect);
      } else {
        this.applyInitialView(this.cfg.initialZoom, this.cfg.initialCenter);
      }
      if (this.isCanvas()) this.renderCanvas();
      this.renderMarkersOnly();
    };
    (_a = this.calloutMo) == null ? void 0 : _a.disconnect();
    this.calloutMo = new MutationObserver(() => {
      window.requestAnimationFrame(() => tryApply());
    });
    for (const c of callouts) {
      this.calloutMo.observe(c, { attributes: true, attributeFilter: ["class"] });
    }
    window.requestAnimationFrame(() => tryApply());
  }
  async bootstrap() {
    var _a, _b, _c, _d, _e, _f, _g;
    this.el.classList.add("zm-root");
    this.el.classList.toggle("zm-root--framepad", this.hasViewportFrame());
    this.applyGlobalHoverPopoverStyleVars();
    if (this.isCanvas()) this.el.classList.add("zm-root--canvas-mode");
    if (this.cfg.responsive) this.el.classList.add("zm-root--responsive");
    if (this.cfg.responsive) {
      setCssProps(this.el, {
        width: "100%",
        height: "auto"
      });
    } else {
      setCssProps(this.el, {
        width: (_a = this.cfg.width) != null ? _a : null,
        height: (_b = this.cfg.height) != null ? _b : null
      });
    }
    if (!this.cfg.responsive && this.cfg.resizable) {
      if (this.cfg.resizeHandle === "native") {
        this.el.classList.add("resizable-native");
      } else {
        this.el.classList.add("resizable-custom");
        if (this.cfg.resizeHandle === "left" || this.cfg.resizeHandle === "both") {
          const gripL = this.el.createDiv({ cls: "zm-grip zm-grip-left" });
          this.installGrip(gripL, "left");
        }
        if (this.cfg.resizeHandle === "right" || this.cfg.resizeHandle === "both" || !this.cfg.resizeHandle) {
          const gripR = this.el.createDiv({ cls: "zm-grip zm-grip-right" });
          this.installGrip(gripR, "right");
        }
      }
    }
    if (this.cfg.align === "center") this.el.classList.add("zm-align-center");
    if (this.cfg.align === "left" && this.cfg.wrap) this.el.classList.add("zm-float-left");
    if (this.cfg.align === "right" && this.cfg.wrap) this.el.classList.add("zm-float-right");
    ((_c = this.cfg.extraClasses) != null ? _c : []).forEach((c) => this.el.classList.add(c));
    this.viewportEl = this.el.createDiv({ cls: "zm-viewport" });
    this.applyViewportInset();
    this.clipEl = this.viewportEl.createDiv({ cls: "zm-clip" });
    if (this.isCanvas()) {
      this.baseCanvas = this.clipEl.createEl("canvas", { cls: "zm-canvas" });
      this.ctx = this.baseCanvas.getContext("2d");
    }
    this.worldEl = this.clipEl.createDiv({ cls: "zm-world" });
    this.imgEl = this.worldEl.createEl("img", { cls: "zm-image" });
    this.overlaysEl = this.worldEl.createDiv({ cls: "zm-overlays" });
    this.setupGridOverlay();
    this.markersEl = this.worldEl.createDiv({ cls: "zm-markers" });
    if (this.hasViewportFrame()) {
      this.frameLayerEl = this.el.createDiv({ cls: "zm-frame-layer" });
      const img = this.frameLayerEl.createEl("img", { cls: "zm-viewport-frame" });
      img.decoding = "async";
      img.draggable = false;
      img.src = this.resolveResourceUrl(this.cfg.viewportFrame.trim());
      this.viewportFrameEl = img;
      if (this.plugin.imageCache) {
        const f = this.resolveTFile(this.cfg.viewportFrame.trim(), this.cfg.sourcePath);
        if (f && !this.acquiredSessionPaths.has(f.path)) {
          void this.plugin.imageCache.acquire(f).then(() => {
            this.acquiredSessionPaths.add(f.path);
          }).catch(() => {
          });
        }
      }
    }
    this.hudClipEl = this.el.createDiv({ cls: "zm-hud-clip" });
    this.applyViewportInset();
    this.hudMarkersEl = this.hudClipEl.createDiv({ cls: "zm-hud-markers" });
    this.measureHud = this.hudClipEl.createDiv({ cls: "zm-measure-hud" });
    this.drawEditHudEl = this.hudClipEl.createDiv({ cls: "zm-draw-edit" });
    this.zoomHud = this.hudClipEl.createDiv({ cls: "zm-zoom-hud" });
    this.zoomControlsEl = this.hudClipEl.createDiv({ cls: "zm-zoom-controls" });
    this.zoomOutBtn = this.zoomControlsEl.createEl("button", {
      cls: "zm-zoom-btn",
      text: "\u2212"
    });
    this.zoomOutBtn.setAttr("aria-label", "Zoom out");
    this.zoomOutBtn.setAttr("title", "Zoom out");
    this.zoomInBtn = this.zoomControlsEl.createEl("button", {
      cls: "zm-zoom-btn",
      text: "+"
    });
    this.zoomInBtn.setAttr("aria-label", "Zoom in");
    this.zoomInBtn.setAttr("title", "Zoom in");
    this.registerDomEvent(this.zoomOutBtn, "click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const r = this.viewportEl.getBoundingClientRect();
      this.zoomAt(r.width / 2, r.height / 2, 1 / 1.2);
    });
    const ownerWindow = this.getOwnerWindow();
    this.registerDomEvent(this.viewportEl, "wheel", (e) => {
      const t = this.asElement(e.target);
      if (t == null ? void 0 : t.closest(".popover")) return;
      if (this.cfg.responsive) return;
      if (t == null ? void 0 : t.closest(".zm-zoom-controls")) return;
      e.preventDefault();
      e.stopPropagation();
      this.onWheel(e);
    });
    this.registerDomEvent(this.zoomInBtn, "click", (e) => {
      if (this.cfg.responsive) return;
      e.preventDefault();
      e.stopPropagation();
      const r = this.viewportEl.getBoundingClientRect();
      this.zoomAt(r.width / 2, r.height / 2, 1.2);
    });
    this.registerDomEvent(this.viewportEl, "pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.closeMenu();
      this.onPointerDownViewport(e);
    });
    this.registerDomEvent(ownerWindow, "pointermove", (e) => this.onPointerMove(e));
    this.registerDomEvent(ownerWindow, "pointerup", (e) => {
      if (this.activePointers.has(e.pointerId)) this.activePointers.delete(e.pointerId);
      if (this.pinchActive && this.activePointers.size < 2) this.endPinch();
      e.preventDefault();
      this.onPointerUp(e);
    });
    this.registerDomEvent(ownerWindow, "pointercancel", (e) => {
      if (this.activePointers.has(e.pointerId)) this.activePointers.delete(e.pointerId);
      if (this.pinchActive && this.activePointers.size < 2) this.endPinch();
    });
    const touchCaptureOpts = {
      passive: false,
      capture: true
    };
    this.viewportEl.addEventListener("touchstart", this.onNativeTouchStart, touchCaptureOpts);
    this.viewportEl.addEventListener("touchmove", this.onNativeTouchMove, touchCaptureOpts);
    this.viewportEl.addEventListener("touchend", this.onNativeTouchEnd, touchCaptureOpts);
    this.viewportEl.addEventListener("touchcancel", this.onNativeTouchEnd, touchCaptureOpts);
    this.register(() => {
      this.viewportEl.removeEventListener("touchstart", this.onNativeTouchStart, touchCaptureOpts);
      this.viewportEl.removeEventListener("touchmove", this.onNativeTouchMove, touchCaptureOpts);
      this.viewportEl.removeEventListener("touchend", this.onNativeTouchEnd, touchCaptureOpts);
      this.viewportEl.removeEventListener("touchcancel", this.onNativeTouchEnd, touchCaptureOpts);
    });
    this.registerDomEvent(this.viewportEl, "dblclick", (e) => {
      if (this.cfg.responsive) return;
      e.preventDefault();
      e.stopPropagation();
      this.closeMenu();
      this.onDblClickViewport(e);
    });
    this.registerDomEvent(this.viewportEl, "click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onClickViewport(e);
    });
    this.registerDomEvent(this.viewportEl, "contextmenu", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.onContextMenuViewport(e);
    });
    this.registerDomEvent(ownerWindow, "keydown", (e) => {
      if (this.gridAlignId) {
        if (this.isGridAlignIncreaseKey(e)) {
          e.preventDefault();
          e.stopPropagation();
          this.adjustGridAlignSpacing(1);
          return;
        }
        if (this.isGridAlignDecreaseKey(e)) {
          e.preventDefault();
          e.stopPropagation();
          this.adjustGridAlignSpacing(-1);
          return;
        }
      }
      if (e.key !== "Escape") return;
      if (this.textMode === "move") {
        this.finishTextBoxMove(false);
        this.textMode = null;
        this.activeTextLayerId = null;
        this.activeTextBoxId = null;
        this.renderTextDraft();
        this.renderTextLayers();
        this.closeMenu();
        return;
      }
      if (this.drawEditDrawingId) {
        this.stopEditDrawingGeometry(false);
        this.closeMenu();
        return;
      }
      if (this.textMode === "edit") {
        this.stopTextEdit(true);
        this.closeMenu();
        return;
      }
      if (this.textMode === "draw-box" || this.textMode === "draw-lines") {
        this.textMode = null;
        this.activeTextLayerId = null;
        this.activeTextBoxId = null;
        this.textDrawStart = null;
        this.textDrawPreview = null;
        this.textLineStart = null;
        this.textLinePreview = null;
        this.renderTextDraft();
        this.renderTextLayers();
        this.closeMenu();
        return;
      }
      if (this.drawingMode) {
        this.drawingMode = null;
        this.drawingActiveLayerId = null;
        this.drawRectStart = null;
        this.drawCircleCenter = null;
        this.drawPolygonPoints = [];
        if (this.drawDraftLayer) this.drawDraftLayer.innerHTML = "";
        this.closeMenu();
        return;
      }
      if (this.gridAlignId) {
        this.stopGridAlignMode(false);
        this.closeMenu();
        new import_obsidian21.Notice("Grid alignment cancelled.", 1200);
        return;
      }
      if (this.calibrating) {
        this.calibrating = false;
        this.calibPts = [];
        this.calibPreview = null;
        this.renderCalibrate();
        new import_obsidian21.Notice("Calibration cancelled.", 900);
      } else if (this.measuring) {
        this.measuring = false;
        this.measurePreview = null;
        this.updateMeasureHud();
      }
      this.closeMenu();
    });
    this.registerEvent(
      this.app.vault.on("modify", (f) => {
        if (!(f instanceof import_obsidian21.TFile)) return;
        if (f.path !== this.store.getPath()) return;
        if (this.ignoreNextModify) {
          this.ignoreNextModify = false;
          return;
        }
        void this.reloadMarkers();
      })
    );
    await this.loadInitialBase(this.cfg.imagePath);
    if (this.cfg.responsive) this.updateResponsiveAspectRatio();
    if (this.viewportFrameEl && ((_d = this.cfg.viewportFrameInsets) == null ? void 0 : _d.unit) === "framePx") {
      await this.loadViewportFrameNaturalSize();
      this.applyViewportInset();
    } else {
      this.applyViewportInset();
    }
    await this.store.ensureExists(
      this.cfg.imagePath,
      { w: this.imgW, h: this.imgH },
      this.cfg.yamlMarkerLayers
    );
    this.data = await this.store.load();
    const pendingRestore = this.cfg.mapId ? this.plugin.consumeMapRestore(this.cfg.sourcePath, this.cfg.mapId) : null;
    if ((pendingRestore == null ? void 0 : pendingRestore.activeBase) && this.data) {
      if (this.getBasesNormalized().some((b) => b.path === pendingRestore.activeBase)) {
        this.data.activeBase = pendingRestore.activeBase;
      }
    }
    await this.applyYamlOnFirstLoad();
    if (this.cfg.yamlMetersPerPixel && this.getMetersPerPixel() === void 0) {
      this.ensureMeasurement();
      const base = this.getActiveBasePath();
      if ((_e = this.data) == null ? void 0 : _e.measurement) {
        this.data.measurement.metersPerPixel = this.cfg.yamlMetersPerPixel;
        this.data.measurement.scales[base] = this.cfg.yamlMetersPerPixel;
        if (await this.store.wouldChange(this.data)) {
          this.ignoreNextModify = true;
          await this.store.save(this.data);
        }
      }
    }
    if (this.data) {
      if (!((_f = this.data.size) == null ? void 0 : _f.w) || !((_g = this.data.size) == null ? void 0 : _g.h)) {
        this.data.size = { w: this.imgW, h: this.imgH };
        if (await this.store.wouldChange(this.data)) {
          this.ignoreNextModify = true;
          await this.store.save(this.data);
        }
      }
      if (this.shouldUseSavedFrame() && this.data.frame && this.data.frame.w > 0 && this.data.frame.h > 0) {
        setCssProps(this.el, { width: `${this.data.frame.w}px`, height: `${this.data.frame.h}px` });
      }
    }
    this.ro = new ResizeObserver(() => this.onResize());
    this.ro.observe(this.el);
    this.register(() => {
      var _a2;
      return (_a2 = this.ro) == null ? void 0 : _a2.disconnect();
    });
    if (pendingRestore && !this.cfg.responsive) {
      this.applyInitialView(pendingRestore.scale, pendingRestore.center);
    } else if (this.cfg.responsive) {
      this.fitToView();
    } else if (this.cfg.initialViewRect) {
      this.applyInitialViewRect(this.cfg.initialViewRect);
    } else if (this.cfg.initialZoom && this.cfg.initialCenter) {
      this.applyInitialView(this.cfg.initialZoom, this.cfg.initialCenter);
    } else {
      this.fitToView();
    }
    if (this.isSecondScreenPlayerView() || this.isSecondScreenControllerView()) {
      this.applySecondScreenViewFromData();
    }
    if (pendingRestore && !this.cfg.responsive) {
      this.captureViewIfVisible();
    }
    this.scheduleTryApplyInitialViewFromCallout();
    await this.applyActiveBaseAndOverlays();
    this.setupMeasureOverlay();
    this.setupDrawOverlay();
    this.setupTextOverlay();
    this.applyMeasureStyle();
    this.renderAll();
    this.ready = true;
    this.updateZoomControlsVisibility();
  }
  updateResponsiveAspectRatio() {
    if (!this.imgW || !this.imgH) return;
    this.el.style.aspectRatio = `${this.imgW} / ${this.imgH}`;
  }
  disposeBitmaps() {
    const cache = this.plugin.imageCache;
    if (cache) {
      for (const p of this.acquiredSessionPaths) {
        cache.release(p);
      }
      this.acquiredSessionPaths.clear();
      this.baseSource = null;
      this.overlaySources.clear();
      this.overlayLoading.clear();
      return;
    }
    try {
      if (this.baseSource && isImageBitmapLike(this.baseSource)) this.baseSource.close();
    } catch (error) {
      console.error("Zoom Map: failed to dispose base bitmap", error);
    }
    this.baseSource = null;
    for (const src of this.overlaySources.values()) {
      try {
        if (isImageBitmapLike(src)) src.close();
      } catch (error) {
        console.error("Zoom Map: failed to dispose overlay bitmap", error);
      }
    }
    this.overlaySources.clear();
    this.overlayLoading.clear();
  }
  async loadBitmapFromPath(path) {
    const f = this.resolveTFile(path, this.cfg.sourcePath);
    if (!f) return null;
    const url = this.app.vault.getResourcePath(f);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    try {
      await img.decode();
    } catch (e) {
    }
    try {
      return await createImageBitmap(img);
    } catch (e) {
      return null;
    }
  }
  async loadBaseSourceByPath(path) {
    this.updateSvgBaseFlag(path);
    if (this.isCanvas() && this.baseIsSvg) {
      const bmp1 = await this.ensureSvgLod(path, 1);
      if (!bmp1) throw new Error(`Failed to load SVG base: ${path}`);
      this.baseSource = bmp1;
      this.svgRasterScale = bmp1.width / this.imgW;
      this.currentBasePath = path;
      return;
    }
    const cache = this.plugin.imageCache;
    if (cache) {
      const f = this.resolveTFile(path, this.cfg.sourcePath);
      if (!f) throw new Error(`Image not found: ${path}`);
      if (!this.acquiredSessionPaths.has(f.path)) {
        await cache.acquire(f);
        this.acquiredSessionPaths.add(f.path);
      }
      const src = await cache.acquire(f);
      cache.release(f.path);
      this.baseSource = src;
      if (isImageBitmapLike(src)) {
        this.imgW = src.width;
        this.imgH = src.height;
      } else if (isHtmlImageElementLike(src)) {
        this.imgW = src.naturalWidth;
        this.imgH = src.naturalHeight;
      }
      this.currentBasePath = path;
      return;
    }
    const bmp = await this.loadBitmapFromPath(path);
    if (!bmp) throw new Error(`Failed to load image: ${path}`);
    this.baseSource = bmp;
    this.imgW = bmp.width;
    this.imgH = bmp.height;
    this.currentBasePath = path;
  }
  async loadBaseImageByPath(path) {
    this.updateSvgBaseFlag(path);
    const imgFile = this.resolveTFile(path, this.cfg.sourcePath);
    if (!imgFile) throw new Error(`Image not found: ${path}`);
    const url = this.app.vault.getResourcePath(imgFile);
    await new Promise((resolve, reject) => {
      this.imgEl.onload = () => {
        this.imgW = this.imgEl.naturalWidth;
        this.imgH = this.imgEl.naturalHeight;
        resolve();
      };
      this.imgEl.onerror = () => reject(new Error("Failed to load image."));
      this.imgEl.src = url;
    });
    this.currentBasePath = path;
  }
  async loadInitialBase(path) {
    this.updateSvgBaseFlag(path);
    if (this.isCanvas()) await this.loadBaseSourceByPath(path);
    else await this.loadBaseImageByPath(path);
  }
  async loadCanvasSourceFromPath(path) {
    const f = this.resolveTFile(path, this.cfg.sourcePath);
    if (!f) return null;
    const url = this.app.vault.getResourcePath(f);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    try {
      await img.decode();
    } catch (e) {
    }
    try {
      return await createImageBitmap(img);
    } catch (e) {
      return img;
    }
  }
  clampRasterDims(w, h) {
    let clamped = false;
    let W = Math.max(1, Math.round(w));
    let H = Math.max(1, Math.round(h));
    const maxSide = this.svgRasterMaxSidePx;
    if (W > maxSide || H > maxSide) {
      clamped = true;
      const k = Math.min(maxSide / W, maxSide / H);
      W = Math.max(1, Math.round(W * k));
      H = Math.max(1, Math.round(H * k));
    }
    return { w: W, h: H, clamped };
  }
  getSvgCache(path) {
    let byLod = this.svgBaseCache.get(path);
    if (!byLod) {
      byLod = /* @__PURE__ */ new Map();
      this.svgBaseCache.set(path, byLod);
    }
    return byLod;
  }
  getSvgInflight(path) {
    let byLod = this.svgUpgradeInFlight.get(path);
    if (!byLod) {
      byLod = /* @__PURE__ */ new Map();
      this.svgUpgradeInFlight.set(path, byLod);
    }
    return byLod;
  }
  evictSvgLods(path, keep) {
    const byLod = this.svgBaseCache.get(path);
    if (!byLod) return;
    for (const [lod, bmp] of byLod.entries()) {
      if (keep.includes(lod)) continue;
      try {
        bmp.close();
      } catch (e) {
      }
      byLod.delete(lod);
    }
  }
  pickDesiredSvgLod(scale) {
    const max = this.getSvgRasterMaxScale();
    if (scale < 1.35) return 1;
    if (scale < 2.8) return Math.min(2, max);
    if (scale < 5.6) return Math.min(4, max);
    return Math.min(8, max);
  }
  async loadSvgBitmapAtLod(path, lod) {
    const f = this.resolveTFile(path, this.cfg.sourcePath);
    if (!f) return null;
    const url = this.app.vault.getResourcePath(f);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    try {
      await img.decode();
    } catch (e) {
    }
    const logicalW = img.naturalWidth || 0;
    const logicalH = img.naturalHeight || 0;
    if (logicalW <= 0 || logicalH <= 0) return null;
    this.imgW = logicalW;
    this.imgH = logicalH;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const targetW = logicalW * lod * dpr;
    const targetH = logicalH * lod * dpr;
    const dims = this.clampRasterDims(targetW, targetH);
    try {
      const opts = {
        resizeWidth: dims.w,
        resizeHeight: dims.h,
        resizeQuality: "high"
      };
      const bmp = await createImageBitmap(img, opts);
      return bmp;
    } catch (e) {
      try {
        return await createImageBitmap(img);
      } catch (e2) {
        return null;
      }
    }
  }
  async ensureSvgLod(path, lod) {
    const byLod = this.getSvgCache(path);
    const cached = byLod.get(lod);
    if (cached) return cached;
    const inflight = this.getSvgInflight(path);
    const running = inflight.get(lod);
    if (running) return running;
    const p = this.loadSvgBitmapAtLod(path, lod).then((bmp) => {
      inflight.delete(lod);
      if (bmp) byLod.set(lod, bmp);
      return bmp;
    }).catch(() => {
      inflight.delete(lod);
      return null;
    });
    inflight.set(lod, p);
    return p;
  }
  async maybeUpgradeSvgBaseForCurrentZoom() {
    var _a, _b;
    if (!this.isCanvas()) return;
    if (!this.baseIsSvg) return;
    const path = (_a = this.currentBasePath) != null ? _a : this.getActiveBasePath();
    if (!path) return;
    const desired = this.pickDesiredSvgLod(this.scale);
    const byLod = this.getSvgCache(path);
    const have = (_b = [8, 4, 2, 1].find((l) => byLod.has(l))) != null ? _b : 0;
    if (have >= desired) return;
    const bmp = await this.ensureSvgLod(path, desired);
    if (!bmp) return;
    this.baseSource = bmp;
    this.svgRasterScale = bmp.width / this.imgW;
    this.evictSvgLods(path, [desired]);
    if (this.ready) {
      this.renderCanvas();
      this.renderMarkersOnly();
    }
  }
  closeCanvasSource(src) {
    try {
      if (isImageBitmapLike(src)) src.close();
    } catch (error) {
      console.error("Zoom Map: failed to dispose canvas source", error);
    }
  }
  async ensureOverlayLoaded(path) {
    var _a, _b, _c;
    const cache = this.plugin.imageCache;
    if (cache) {
      if (this.overlaySources.has(path)) return (_a = this.overlaySources.get(path)) != null ? _a : null;
      const f = this.resolveTFile(path, this.cfg.sourcePath);
      if (!f) return null;
      if (!this.acquiredSessionPaths.has(f.path)) {
        await cache.acquire(f);
        this.acquiredSessionPaths.add(f.path);
      }
      const src = await cache.acquire(f);
      cache.release(f.path);
      this.overlaySources.set(path, src);
      return src;
    }
    if (this.overlaySources.has(path)) return (_b = this.overlaySources.get(path)) != null ? _b : null;
    if (this.overlayLoading.has(path)) return (_c = this.overlayLoading.get(path)) != null ? _c : null;
    const p = this.loadCanvasSourceFromPath(path).then((res) => {
      this.overlayLoading.delete(path);
      if (res) this.overlaySources.set(path, res);
      return res;
    }).catch((err) => {
      this.overlayLoading.delete(path);
      console.warn("Zoom Map: overlay load failed", path, err);
      return null;
    });
    this.overlayLoading.set(path, p);
    return p;
  }
  async ensureVisibleOverlaysLoaded() {
    var _a;
    if (!this.data) return;
    const keepAll = !!this.plugin.settings.enableSessionImageCache && !!this.plugin.settings.keepOverlaysLoaded;
    const wantVisible = new Set(
      ((_a = this.data.overlays) != null ? _a : []).filter((o) => keepAll || o.visible).map((o) => o.path)
    );
    for (const [path, src] of this.overlaySources) {
      if (!wantVisible.has(path)) {
        this.overlaySources.delete(path);
        this.closeCanvasSource(src);
      }
    }
    for (const path of wantVisible) {
      if (!this.overlaySources.has(path)) await this.ensureOverlayLoaded(path);
    }
  }
  renderCanvas() {
    var _a, _b;
    if (!this.isCanvas()) return;
    if (!this.baseCanvas || !this.ctx || !this.baseSource) return;
    const r = this.viewportEl.getBoundingClientRect();
    this.vw = r.width;
    this.vh = r.height;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const pxW = Math.max(1, Math.round(this.vw * dpr));
    const pxH = Math.max(1, Math.round(this.vh * dpr));
    if (this.baseCanvas.width !== pxW || this.baseCanvas.height !== pxH) {
      this.baseCanvas.width = pxW;
      this.baseCanvas.height = pxH;
      this.baseCanvas.style.width = `${this.vw}px`;
      this.baseCanvas.style.height = `${this.vh}px`;
    }
    const ctx = this.ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.vw, this.vh);
    ctx.translate(this.tx, this.ty);
    ctx.scale(this.scale, this.scale);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = this.scale < 0.18 ? "low" : "medium";
    if (this.baseIsSvg && this.baseSource instanceof ImageBitmap) {
      const srcW = this.baseSource.width;
      const srcH = this.baseSource.height;
      if (srcW !== this.imgW || srcH !== this.imgH) {
        ctx.drawImage(this.baseSource, 0, 0, srcW, srcH, 0, 0, this.imgW, this.imgH);
      } else {
        ctx.drawImage(this.baseSource, 0, 0);
      }
    } else {
      ctx.drawImage(this.baseSource, 0, 0);
    }
    if ((_b = (_a = this.data) == null ? void 0 : _a.overlays) == null ? void 0 : _b.length) {
      for (const o of this.data.overlays) {
        if (!o.visible) continue;
        const src = this.overlaySources.get(o.path);
        if (src) ctx.drawImage(src, 0, 0);
      }
    }
  }
  setupMeasureOverlay() {
    const doc = this.getOwnerDocument();
    this.measureEl = this.worldEl.createDiv({ cls: "zm-measure" });
    this.measureSvg = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.measureSvg.classList.add("zm-measure__svg");
    this.measureSvg.setAttribute("width", String(this.imgW));
    this.measureSvg.setAttribute("height", String(this.imgH));
    this.measureEl.appendChild(this.measureSvg);
    this.measurePath = doc.createElementNS("http://www.w3.org/2000/svg", "path");
    this.measurePath.classList.add("zm-measure__path");
    this.measureSvg.appendChild(this.measurePath);
    this.measureDots = doc.createElementNS("http://www.w3.org/2000/svg", "g");
    this.measureSvg.appendChild(this.measureDots);
    this.calibPath = doc.createElementNS("http://www.w3.org/2000/svg", "path");
    this.calibPath.classList.add("zm-measure__path", "zm-measure__dash");
    this.measureSvg.appendChild(this.calibPath);
    this.calibDots = doc.createElementNS("http://www.w3.org/2000/svg", "g");
    this.measureSvg.appendChild(this.calibDots);
    this.updateMeasureHud();
  }
  setupGridOverlay() {
    const ns = "http://www.w3.org/2000/svg";
    const doc = this.getOwnerDocument();
    this.gridEl = this.worldEl.createDiv({ cls: "zm-mapgrid" });
    this.gridSvg = doc.createElementNS(ns, "svg");
    this.gridSvg.classList.add("zm-mapgrid__svg");
    this.gridSvg.setAttribute("width", String(this.imgW));
    this.gridSvg.setAttribute("height", String(this.imgH));
    this.gridEl.appendChild(this.gridSvg);
    this.gridStaticLayer = doc.createElementNS(ns, "g");
    this.gridSvg.appendChild(this.gridStaticLayer);
  }
  getGridById(id) {
    var _a, _b, _c;
    return (_c = ((_b = (_a = this.data) == null ? void 0 : _a.grids) != null ? _b : []).find((g) => g.id === id)) != null ? _c : null;
  }
  isGridAlignIncreaseKey(e) {
    return e.key === "+" || e.code === "NumpadAdd" || e.key === "=" && e.shiftKey;
  }
  isGridAlignDecreaseKey(e) {
    return e.key === "-" || e.code === "NumpadSubtract";
  }
  adjustGridAlignSpacing(delta) {
    if (!this.gridAlignId) return;
    const grid = this.getGridById(this.gridAlignId);
    if (!grid) return;
    const current = Number.isFinite(grid.spacing) && grid.spacing > 1 ? grid.spacing : 64;
    const next = Math.max(2, Math.round(current + delta));
    if (next === current) return;
    grid.spacing = next;
    this.renderGrids();
  }
  setupDrawOverlay() {
    const ns = "http://www.w3.org/2000/svg";
    const doc = this.getOwnerDocument();
    this.drawEl = this.worldEl.createDiv({ cls: "zm-draw" });
    this.drawHitboxesEl = this.worldEl.createDiv({ cls: "zm-draw-hitboxes" });
    this.drawSvg = doc.createElementNS(ns, "svg");
    this.drawSvg.classList.add("zm-draw__svg");
    this.drawSvg.setAttribute("width", String(this.imgW));
    this.drawSvg.setAttribute("height", String(this.imgH));
    this.drawEl.appendChild(this.drawSvg);
    this.drawDefs = doc.createElementNS(ns, "defs");
    this.drawSvg.appendChild(this.drawDefs);
    this.drawStaticLayer = doc.createElementNS(ns, "g");
    this.drawSvg.appendChild(this.drawStaticLayer);
    this.drawDraftLayer = doc.createElementNS(ns, "g");
    this.drawSvg.appendChild(this.drawDraftLayer);
  }
  buildSquareGridPath(spacing, anchorX, anchorY) {
    const step = Math.max(2, spacing);
    let d = "";
    const startX = anchorX + Math.floor((0 - anchorX) / step) * step;
    for (let x = startX; x <= this.imgW; x += step) {
      d += `M ${x} 0 L ${x} ${this.imgH} `;
    }
    const startY = anchorY + Math.floor((0 - anchorY) / step) * step;
    for (let y = startY; y <= this.imgH; y += step) {
      d += `M 0 ${y} L ${this.imgW} ${y} `;
    }
    return d.trim();
  }
  buildHexGridPath(spacing, anchorX, anchorY) {
    const hexWidth = Math.max(8, spacing);
    const r = hexWidth / 2;
    const hexHeight = Math.sqrt(3) * r;
    const dx = 1.5 * r;
    const dy = hexHeight;
    const round = (n) => Math.round(n * 100) / 100;
    let d = "";
    const startCol = Math.floor((0 - anchorX) / dx) - 3;
    const endCol = Math.ceil((this.imgW - anchorX) / dx) + 3;
    for (let ci = startCol; ci <= endCol; ci += 1) {
      const cx = anchorX + ci * dx;
      const parity = (ci % 2 + 2) % 2;
      const baseCy = anchorY + (parity ? dy / 2 : 0);
      const startRow = Math.floor((0 - baseCy) / dy) - 3;
      const endRow = Math.ceil((this.imgH - baseCy) / dy) + 3;
      for (let ri = startRow; ri <= endRow; ri += 1) {
        const cy = baseCy + ri * dy;
        if (cx + r < 0 || cx - r > this.imgW || cy + hexHeight / 2 < 0 || cy - hexHeight / 2 > this.imgH) {
          continue;
        }
        const pts = [
          [round(cx + r), round(cy)],
          [round(cx + r / 2), round(cy - hexHeight / 2)],
          [round(cx - r / 2), round(cy - hexHeight / 2)],
          [round(cx - r), round(cy)],
          [round(cx - r / 2), round(cy + hexHeight / 2)],
          [round(cx + r / 2), round(cy + hexHeight / 2)]
        ];
        d += `M ${pts[0][0]} ${pts[0][1]} L ${pts[1][0]} ${pts[1][1]} L ${pts[2][0]} ${pts[2][1]} L ${pts[3][0]} ${pts[3][1]} L ${pts[4][0]} ${pts[4][1]} L ${pts[5][0]} ${pts[5][1]} Z `;
      }
    }
    return d.trim();
  }
  renderGrids() {
    var _a, _b, _c, _d;
    if (!this.gridSvg || !this.gridStaticLayer) return;
    this.gridSvg.setAttribute("width", String(this.imgW));
    this.gridSvg.setAttribute("height", String(this.imgH));
    this.gridStaticLayer.innerHTML = "";
    if (!this.plugin.settings.enableGrid) return;
    if (!this.data) return;
    const activeBase = this.getActiveBasePath();
    const isPlayerView = !!this.cfg.displayOnly;
    const ns = "http://www.w3.org/2000/svg";
    const doc = this.getOwnerDocument();
    for (const grid of (_a = this.data.grids) != null ? _a : []) {
      const isPreview = this.gridAlignId === grid.id;
      if (!isPreview && !grid.visible) continue;
      if (!isPreview && grid.boundBase && grid.boundBase !== activeBase) continue;
      if (!isPreview) {
        const target = (_b = grid.playerScreen) != null ? _b : "both";
        if (!isPlayerView && target === "player-only") continue;
        if (isPlayerView && target === "gm-only") continue;
      }
      const spacing = Math.max(2, Number(grid.spacing) || 64);
      const anchorX = isPreview && this.gridAlignPreview ? this.gridAlignPreview.x : Number.isFinite(grid.offsetX) ? grid.offsetX : 0;
      const anchorY = isPreview && this.gridAlignPreview ? this.gridAlignPreview.y : Number.isFinite(grid.offsetY) ? grid.offsetY : 0;
      const d = grid.shape === "hex" ? this.buildHexGridPath(spacing, anchorX, anchorY) : this.buildSquareGridPath(spacing, anchorX, anchorY);
      if (!d) continue;
      const path = doc.createElementNS(ns, "path");
      path.classList.add("zm-mapgrid__path");
      path.setAttribute("d", d);
      path.setAttribute("stroke", ((_c = grid.color) != null ? _c : "#ffffff").trim() || "#ffffff");
      path.setAttribute("stroke-width", String(Math.max(0.25, Number(grid.width) || 1)));
      path.setAttribute("stroke-opacity", String(
        isPreview ? Math.min(1, Math.max(0.1, ((_d = grid.opacity) != null ? _d : 0.5) * 0.9 + 0.1)) : Math.min(1, Math.max(0, Number(grid.opacity) || 0))
      ));
      path.setAttribute("fill", "none");
      path.setAttribute("pointer-events", "none");
      if (isPreview) {
        path.setAttribute("stroke-dasharray", "8 6");
      }
      this.gridStaticLayer.appendChild(path);
    }
  }
  addGridInteractive() {
    var _a, _b;
    if (!this.data) return;
    const draft = {
      id: generateId("grid"),
      name: `Grid ${((_b = (_a = this.data.grids) == null ? void 0 : _a.length) != null ? _b : 0) + 1}`,
      visible: true,
      shape: "square",
      color: "#ffffff",
      width: 1,
      opacity: 0.5,
      spacing: 64,
      offsetX: 0,
      offsetY: 0,
      playerScreen: "both"
    };
    new GridEditorModal(this.app, draft, (res) => {
      var _a2, _b2;
      if (!this.data) return;
      if (res.action !== "save") return;
      (_b2 = (_a2 = this.data).grids) != null ? _b2 : _a2.grids = [];
      this.data.grids.push(res.grid);
      void this.saveDataSoon();
      this.renderGrids();
      new import_obsidian21.Notice("Grid added.", 1200);
    }).open();
  }
  openGridEditor(grid) {
    new GridEditorModal(this.app, grid, (res) => {
      var _a;
      if (!this.data) return;
      if (res.action !== "save") return;
      const idx = ((_a = this.data.grids) != null ? _a : []).findIndex((g) => g.id === grid.id);
      if (idx < 0) return;
      this.data.grids[idx] = res.grid;
      void this.saveDataSoon();
      this.renderGrids();
    }).open();
  }
  startGridAlignMode(gridId) {
    const grid = this.getGridById(gridId);
    if (!grid) return;
    this.stopTextEdit(true);
    this.finishTextBoxMove(false);
    this.stopEditDrawingGeometry(true);
    this.measuring = false;
    this.calibrating = false;
    this.drawingMode = null;
    this.textMode = null;
    this.gridAlignId = gridId;
    this.gridAlignOriginalSpacing = Number.isFinite(grid.spacing) && grid.spacing > 1 ? grid.spacing : 64;
    this.gridAlignPreview = {
      x: Number.isFinite(grid.offsetX) ? grid.offsetX : 0,
      y: Number.isFinite(grid.offsetY) ? grid.offsetY : 0
    };
    this.renderGrids();
    new import_obsidian21.Notice(
      "Grid alignment: move the mouse and click to set the anchor. Press + / - to change spacing. Press esc to cancel.",
      6e3
    );
  }
  stopGridAlignMode(commit) {
    if (!this.gridAlignId) return;
    const grid = this.getGridById(this.gridAlignId);
    if (commit && grid && this.gridAlignPreview) {
      grid.offsetX = this.gridAlignPreview.x;
      grid.offsetY = this.gridAlignPreview.y;
      void this.saveDataSoon();
    } else if (!commit && grid && this.gridAlignOriginalSpacing !== null) {
      grid.spacing = this.gridAlignOriginalSpacing;
    }
    this.gridAlignId = null;
    this.gridAlignPreview = null;
    this.gridAlignOriginalSpacing = null;
    this.renderGrids();
  }
  getDrawingById(id) {
    var _a, _b;
    const list = (_b = (_a = this.data) == null ? void 0 : _a.drawings) != null ? _b : [];
    for (const d of list) {
      if (d.id === id) return d;
    }
    return null;
  }
  applyGlobalHoverPopoverStyleVars() {
    this.plugin.applyGlobalHoverPopoverSettings();
  }
  getEditableDrawingPoints(d) {
    if (d.kind === "polygon" && Array.isArray(d.polygon)) return d.polygon;
    if (d.kind === "polyline" && Array.isArray(d.polyline)) return d.polyline;
    return null;
  }
  getEditableDrawingMode(d) {
    if (d.kind === "polygon" || d.kind === "polyline") return "points";
    if (d.kind === "rect") return "rect";
    if (d.kind === "circle") return "circle";
    return null;
  }
  startEditDrawingGeometry(d) {
    const mode = this.getEditableDrawingMode(d);
    if (!mode) {
      new import_obsidian21.Notice("This drawing cannot be edited right now.", 2500);
      return;
    }
    this.stopTextEdit(true);
    this.finishTextBoxMove(false);
    this.stopEditDrawingGeometry(true);
    this.measuring = false;
    this.calibrating = false;
    this.drawingMode = null;
    this.drawRectStart = null;
    this.drawCircleCenter = null;
    this.drawPolygonPoints = [];
    if (this.drawDraftLayer) this.drawDraftLayer.innerHTML = "";
    this.drawEditDrawingId = d.id;
    this.drawEditMode = mode;
    this.drawEditPointIndex = null;
    this.drawEditHandleKind = null;
    this.drawEditPointerId = null;
    this.drawEditOriginalDrawing = JSON.parse(JSON.stringify(d));
    this.renderDrawings();
    this.renderDrawingEditHandles();
    if (mode === "points") {
      new import_obsidian21.Notice("Edit points: drag handles, drag green midpoint handles to add points, ctrl/cmd-click a point to delete it. Press esc to cancel.", 6e3);
    } else if (mode === "rect") {
      new import_obsidian21.Notice("Edit rectangle: drag corner handles. Press esc to cancel.", 4e3);
    } else {
      new import_obsidian21.Notice("Edit circle: drag center or radius handle. Press esc to cancel.", 4e3);
    }
  }
  stopEditDrawingGeometry(commit) {
    if (!this.drawEditDrawingId) return;
    const d = this.getDrawingById(this.drawEditDrawingId);
    if (!commit && d && this.drawEditOriginalDrawing) {
      d.rect = this.drawEditOriginalDrawing.rect ? { ...this.drawEditOriginalDrawing.rect } : void 0;
      d.circle = this.drawEditOriginalDrawing.circle ? { ...this.drawEditOriginalDrawing.circle } : void 0;
      d.polygon = this.drawEditOriginalDrawing.polygon ? this.drawEditOriginalDrawing.polygon.map((p) => ({ x: p.x, y: p.y })) : void 0;
      d.polyline = this.drawEditOriginalDrawing.polyline ? this.drawEditOriginalDrawing.polyline.map((p) => ({ x: p.x, y: p.y })) : void 0;
    }
    if (commit && d) {
      delete d.bakedPath;
      delete d.bakedWidth;
      delete d.bakedHeight;
    }
    this.drawEditDrawingId = null;
    this.drawEditMode = null;
    this.drawEditPointIndex = null;
    this.drawEditHandleKind = null;
    this.drawEditPointerId = null;
    this.drawEditOriginalDrawing = null;
    if (commit) void this.saveDataSoon();
    this.renderDrawings();
    this.renderDrawingEditHandles();
  }
  insertPointIntoEditedDrawing(segmentIndex, p) {
    if (!this.drawEditDrawingId) return null;
    const d = this.getDrawingById(this.drawEditDrawingId);
    if (!d) return null;
    const pts = this.getEditableDrawingPoints(d);
    if (!pts) return null;
    const insertAt = clamp(segmentIndex + 1, 0, pts.length);
    pts.splice(insertAt, 0, {
      x: clamp(p.x, 0, 1),
      y: clamp(p.y, 0, 1)
    });
    return insertAt;
  }
  deletePointFromEditedDrawing(pointIndex) {
    if (!this.drawEditDrawingId) return;
    const d = this.getDrawingById(this.drawEditDrawingId);
    if (!d) return;
    const pts = this.getEditableDrawingPoints(d);
    if (!pts) return;
    const minPoints = d.kind === "polygon" ? 3 : 2;
    if (pts.length <= minPoints) {
      new import_obsidian21.Notice(`This ${d.kind} needs at least ${minPoints} points.`, 2e3);
      return;
    }
    pts.splice(pointIndex, 1);
    if (this.drawEditPointIndex === pointIndex) this.drawEditPointIndex = null;
    else if (this.drawEditPointIndex !== null && this.drawEditPointIndex > pointIndex) this.drawEditPointIndex -= 1;
    this.renderDrawings();
    this.renderDrawingEditHandles();
  }
  updateEditedDrawingHandleFromClient(clientX, clientY) {
    if (!this.drawEditDrawingId) return;
    const d = this.getDrawingById(this.drawEditDrawingId);
    if (!d) return;
    const vpRect = this.viewportEl.getBoundingClientRect();
    const vx = clientX - vpRect.left;
    const vy = clientY - vpRect.top;
    const wx = (vx - this.tx) / this.scale;
    const wy = (vy - this.ty) / this.scale;
    const nx = clamp(wx / this.imgW, 0, 1);
    const ny = clamp(wy / this.imgH, 0, 1);
    if (this.drawEditMode === "points") {
      const pts = this.getEditableDrawingPoints(d);
      if (!pts || this.drawEditPointIndex === null) return;
      if (this.drawEditPointIndex < 0 || this.drawEditPointIndex >= pts.length) return;
      pts[this.drawEditPointIndex].x = nx;
      pts[this.drawEditPointIndex].y = ny;
    } else if (this.drawEditMode === "rect" && d.rect) {
      const key = this.drawEditHandleKind;
      if (key === "x0y0") {
        d.rect.x0 = nx;
        d.rect.y0 = ny;
      } else if (key === "x1y0") {
        d.rect.x1 = nx;
        d.rect.y0 = ny;
      } else if (key === "x1y1") {
        d.rect.x1 = nx;
        d.rect.y1 = ny;
      } else if (key === "x0y1") {
        d.rect.x0 = nx;
        d.rect.y1 = ny;
      }
    } else if (this.drawEditMode === "circle" && d.circle) {
      const key = this.drawEditHandleKind;
      if (key === "center") {
        d.circle.cx = nx;
        d.circle.cy = ny;
      } else if (key === "radius") {
        const cxPx = d.circle.cx * this.imgW;
        const cyPx = d.circle.cy * this.imgH;
        const px = nx * this.imgW;
        const py = ny * this.imgH;
        const rPx = Math.hypot(px - cxPx, py - cyPx);
        d.circle.r = Math.max(1 / Math.max(this.imgW, this.imgH), rPx / Math.max(this.imgW, this.imgH));
      }
    }
    this.renderDrawings();
    this.renderDrawingEditHandles();
  }
  isEditedDrawingCurrentlyVisible(d) {
    var _a, _b;
    if (!d.visible) return false;
    const layer = ((_b = (_a = this.data) == null ? void 0 : _a.drawLayers) != null ? _b : []).find((l) => l.id === d.layerId);
    if (!layer || !layer.visible) return false;
    const activeBase = this.getActiveBasePath();
    if (layer.boundBase && layer.boundBase !== activeBase) return false;
    return true;
  }
  renderDrawingEditHandles() {
    if (!this.drawEditHudEl) return;
    this.drawEditHudEl.empty();
    if (!this.drawEditDrawingId || !this.data || !this.drawEditMode) return;
    const d = this.getDrawingById(this.drawEditDrawingId);
    if (!d) return;
    if (!this.isEditedDrawingCurrentlyVisible(d)) return;
    const startDrag = (pointIndex, handleKind, pointerId) => {
      this.drawEditPointIndex = pointIndex;
      this.drawEditHandleKind = handleKind;
      this.drawEditPointerId = pointerId;
      this.plugin.setActiveMap(this);
      this.renderDrawingEditHandles();
    };
    if (this.drawEditMode === "points") {
      const pts = this.getEditableDrawingPoints(d);
      if (!pts || pts.length === 0) return;
      for (let i = 0; i < pts.length; i += 1) {
        const p = pts[i];
        const sx = this.tx + p.x * this.imgW * this.scale;
        const sy = this.ty + p.y * this.imgH * this.scale;
        const h = this.drawEditHudEl.createDiv({ cls: "zm-draw-handle" });
        if (this.drawEditPointIndex === i) h.classList.add("zm-draw-handle--active");
        h.style.left = `${sx}px`;
        h.style.top = `${sy}px`;
        h.title = "Drag to move. Ctrl/Cmd + click to delete.";
        h.addEventListener("pointerdown", (e) => {
          if (e.button === 0 && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            e.stopPropagation();
            this.deletePointFromEditedDrawing(i);
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          startDrag(i, "point", e.pointerId);
        });
      }
      const segCount = d.kind === "polygon" ? pts.length : Math.max(0, pts.length - 1);
      for (let i = 0; i < segCount; i += 1) {
        const a = pts[i];
        const b = pts[(i + 1) % pts.length];
        if (!a || !b) continue;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const sx = this.tx + mx * this.imgW * this.scale;
        const sy = this.ty + my * this.imgH * this.scale;
        const h = this.drawEditHudEl.createDiv({ cls: "zm-draw-handle zm-draw-handle--add" });
        h.style.left = `${sx}px`;
        h.style.top = `${sy}px`;
        h.title = "Drag to insert a new point.";
        h.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const inserted = this.insertPointIntoEditedDrawing(i, { x: mx, y: my });
          if (inserted === null) return;
          startDrag(inserted, "point", e.pointerId);
          this.renderDrawings();
          this.renderDrawingEditHandles();
        });
      }
      return;
    }
    if (this.drawEditMode === "rect" && d.rect) {
      const corners = [
        { key: "x0y0", x: d.rect.x0, y: d.rect.y0 },
        { key: "x1y0", x: d.rect.x1, y: d.rect.y0 },
        { key: "x1y1", x: d.rect.x1, y: d.rect.y1 },
        { key: "x0y1", x: d.rect.x0, y: d.rect.y1 }
      ];
      for (const c of corners) {
        const sx = this.tx + c.x * this.imgW * this.scale;
        const sy = this.ty + c.y * this.imgH * this.scale;
        const h = this.drawEditHudEl.createDiv({ cls: "zm-draw-handle" });
        if (this.drawEditHandleKind === c.key) h.classList.add("zm-draw-handle--active");
        h.style.left = `${sx}px`;
        h.style.top = `${sy}px`;
        h.title = "Drag to resize rectangle.";
        h.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          startDrag(null, c.key, e.pointerId);
        });
      }
      return;
    }
    if (this.drawEditMode === "circle" && d.circle) {
      const cxPx = d.circle.cx * this.imgW;
      const cyPx = d.circle.cy * this.imgH;
      const rPx = d.circle.r * Math.max(this.imgW, this.imgH);
      const handles = [
        {
          key: "center",
          cls: "zm-draw-handle zm-draw-handle--center",
          xPx: cxPx,
          yPx: cyPx,
          title: "Drag to move circle center."
        },
        {
          key: "radius",
          cls: "zm-draw-handle zm-draw-handle--radius",
          xPx: cxPx + rPx,
          yPx: cyPx,
          title: "Drag to change circle radius."
        }
      ];
      for (const c of handles) {
        const sx = this.tx + c.xPx * this.scale;
        const sy = this.ty + c.yPx * this.scale;
        const h = this.drawEditHudEl.createDiv({ cls: c.cls });
        if (this.drawEditHandleKind === c.key) h.classList.add("zm-draw-handle--active");
        h.style.left = `${sx}px`;
        h.style.top = `${sy}px`;
        h.title = c.title;
        h.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          e.stopPropagation();
          startDrag(null, c.key, e.pointerId);
        });
      }
    }
  }
  getTextLayerById(id) {
    var _a, _b;
    if (!id || !this.data) return null;
    return (_b = ((_a = this.data.textLayers) != null ? _a : []).find((l) => l.id === id)) != null ? _b : null;
  }
  getTextBoxById(layerId, boxId) {
    var _a, _b;
    const layer = this.getTextLayerById(layerId);
    if (!layer || !boxId) return null;
    const box = (_b = ((_a = layer.boxes) != null ? _a : []).find((b) => b.id === boxId)) != null ? _b : null;
    if (!box) return null;
    return { layer, box };
  }
  isTextLayerVisible(layer) {
    return layer.visible !== false;
  }
  getTextBoxStyle(box, layer) {
    var _a;
    const style = this.normalizeTextLayerStyle((_a = box.style) != null ? _a : layer == null ? void 0 : layer.style);
    if (!box.style) box.style = { ...style };
    return style;
  }
  isTextBoxLocked(box, layer) {
    if (typeof box.locked === "boolean") return box.locked;
    return !!(layer == null ? void 0 : layer.locked);
  }
  isTextBoxAutoFlow(box, layer) {
    if (typeof box.autoFlow === "boolean") return box.autoFlow;
    return (layer == null ? void 0 : layer.autoFlow) !== false;
  }
  isTextBoxAllowAngled(box, layer) {
    if (typeof box.allowAngledBaselines === "boolean") return box.allowAngledBaselines;
    return !!(layer == null ? void 0 : layer.allowAngledBaselines);
  }
  defaultTextBoxAutoConfig() {
    return {
      lineGapPx: Math.round(this.defaultTextLayerStyle().fontSize * 1.35),
      padLeft: 0,
      padRight: 0,
      padTop: 4,
      padBottom: 4
    };
  }
  buildAutoTextBoxLines(rect, style, autoCfg, existing) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
    const minX = Math.min(rect.x0, rect.x1) * this.imgW;
    const maxX = Math.max(rect.x0, rect.x1) * this.imgW;
    const minY = Math.min(rect.y0, rect.y1) * this.imgH;
    const maxY = Math.max(rect.y0, rect.y1) * this.imgH;
    const padLeft = Math.max(0, (_a = autoCfg.padLeft) != null ? _a : 0);
    const padRight = Math.max(0, (_b = autoCfg.padRight) != null ? _b : 0);
    const padTop = Math.max(0, (_c = autoCfg.padTop) != null ? _c : 0);
    const padBottom = Math.max(0, (_d = autoCfg.padBottom) != null ? _d : 0);
    const x0Px = minX + padLeft;
    const x1Px = maxX - padRight;
    const usableTop = minY + padTop;
    const usableBottom = maxY - padBottom;
    const fontSize = style.fontSize;
    const lineH = Number.isFinite(autoCfg.lineGapPx) && autoCfg.lineGapPx > 1 ? autoCfg.lineGapPx : typeof style.lineHeight === "number" && style.lineHeight > 1 ? style.lineHeight : Math.round(fontSize * 1.35);
    const leading = Math.max(0, lineH - fontSize);
    const ascent = Math.round(fontSize * 0.8);
    const rise = ascent + Math.round(leading / 2);
    const out = [];
    let y = usableTop + rise;
    let idx = 0;
    while (y <= usableBottom) {
      out.push({
        id: (_f = (_e = existing == null ? void 0 : existing[idx]) == null ? void 0 : _e.id) != null ? _f : generateId("tln"),
        x0: x0Px / this.imgW,
        y0: y / this.imgH,
        x1: x1Px / this.imgW,
        y1: y / this.imgH,
        text: (_h = (_g = existing == null ? void 0 : existing[idx]) == null ? void 0 : _g.text) != null ? _h : ""
      });
      y += lineH;
      idx += 1;
    }
    if (out.length === 0) {
      const fallbackY = (minY + maxY) / 2;
      out.push({
        id: (_j = (_i = existing == null ? void 0 : existing[0]) == null ? void 0 : _i.id) != null ? _j : generateId("tln"),
        x0: x0Px / this.imgW,
        y0: fallbackY / this.imgH,
        x1: x1Px / this.imgW,
        y1: fallbackY / this.imgH,
        text: (_l = (_k = existing == null ? void 0 : existing[0]) == null ? void 0 : _k.text) != null ? _l : ""
      });
    }
    return out;
  }
  regenerateAutoTextBoxLines(layer, box) {
    var _a;
    if (box.mode !== "auto") return;
    if (box.sourceDrawingKind === "polyline") return;
    box.style = this.getTextBoxStyle(box, layer);
    (_a = box.auto) != null ? _a : box.auto = this.defaultTextBoxAutoConfig();
    box.lines = this.buildAutoTextBoxLines(box.rect, box.style, box.auto, box.lines);
  }
  ensureTextData() {
    var _a, _b, _c, _d, _e;
    if (!this.data) return;
    (_b = (_a = this.data).textLayers) != null ? _b : _a.textLayers = [];
    for (const layer of this.data.textLayers) {
      (_c = layer.boxes) != null ? _c : layer.boxes = [];
      if (typeof layer.visible !== "boolean") layer.visible = true;
      const legacyStyle = this.normalizeTextLayerStyle(layer.style);
      for (const box of layer.boxes) {
        box.style = this.normalizeTextLayerStyle((_d = box.style) != null ? _d : legacyStyle);
        if (typeof box.autoFlow !== "boolean" && typeof layer.autoFlow === "boolean") {
          box.autoFlow = layer.autoFlow;
        }
        if (typeof box.allowAngledBaselines !== "boolean" && typeof layer.allowAngledBaselines === "boolean") {
          box.allowAngledBaselines = layer.allowAngledBaselines;
        }
        if (typeof box.locked !== "boolean" && typeof layer.locked === "boolean") {
          box.locked = layer.locked;
        }
        if (box.mode === "auto") (_e = box.auto) != null ? _e : box.auto = this.defaultTextBoxAutoConfig();
      }
    }
  }
  defaultTextLayerStyle() {
    return {
      fontFamily: "var(--font-text)",
      fontSize: 14,
      color: "var(--text-normal)",
      fontWeight: "400",
      baselineOffset: 0,
      padLeft: 0,
      padRight: 0
    };
  }
  normalizeTextLayerStyle(style) {
    var _a, _b, _c, _d, _e, _f, _g;
    const s = { ...this.defaultTextLayerStyle(), ...style != null ? style : {} };
    s.fontFamily = ((_a = s.fontFamily) != null ? _a : "").trim() || "var(--font-text)";
    s.color = ((_b = s.color) != null ? _b : "").trim() || "var(--text-normal)";
    if (!Number.isFinite(s.fontSize) || s.fontSize <= 1) s.fontSize = 14;
    if (!Number.isFinite((_c = s.baselineOffset) != null ? _c : 0)) s.baselineOffset = 0;
    if (!Number.isFinite((_d = s.padLeft) != null ? _d : 0) || ((_e = s.padLeft) != null ? _e : 0) < 0) s.padLeft = 0;
    if (!Number.isFinite((_f = s.padRight) != null ? _f : 0) || ((_g = s.padRight) != null ? _g : 0) < 0) s.padRight = 0;
    if (typeof s.italic !== "boolean") delete s.italic;
    if (typeof s.letterSpacing !== "number" || !Number.isFinite(s.letterSpacing)) {
      delete s.letterSpacing;
    }
    if (s.fontWeight != null) {
      const fw = String(s.fontWeight).trim();
      s.fontWeight = fw.length ? fw : void 0;
    }
    return s;
  }
  openTextBoxConfigModal(layer, box) {
    box.style = this.getTextBoxStyle(box, layer);
    new TextBoxConfigModal(this.app, box, (res) => {
      var _a, _b, _c;
      if (res.action !== "save" || !this.data) return;
      const target = ((_a = layer.boxes) != null ? _a : []).find((b) => b.id === box.id);
      if (!target) return;
      target.name = res.box.name;
      target.auto = res.box.auto;
      target.style = this.normalizeTextLayerStyle((_c = (_b = res.box.style) != null ? _b : target.style) != null ? _c : layer.style);
      target.autoFlow = res.box.autoFlow !== false;
      target.allowAngledBaselines = !!res.box.allowAngledBaselines;
      target.locked = !!res.box.locked;
      if (target.mode === "auto" && target.sourceDrawingKind !== "polyline") {
        this.regenerateAutoTextBoxLines(layer, target);
      }
      void this.saveDataSoon();
      this.renderTextLayers();
    }).open();
  }
  setupTextOverlay() {
    const ns = "http://www.w3.org/2000/svg";
    const doc = this.getOwnerDocument();
    this.textSvgWrap = this.worldEl.createDiv({ cls: "zm-text" });
    this.textSvg = doc.createElementNS(ns, "svg");
    this.textSvg.classList.add("zm-text__svg");
    this.textSvg.setAttribute("width", String(this.imgW));
    this.textSvg.setAttribute("height", String(this.imgH));
    this.textSvgWrap.appendChild(this.textSvg);
    this.textGuidesLayer = doc.createElementNS(ns, "g");
    this.textSvg.appendChild(this.textGuidesLayer);
    this.textDraftLayer = doc.createElementNS(ns, "g");
    this.textSvg.appendChild(this.textDraftLayer);
    this.textTextLayer = doc.createElementNS(ns, "g");
    this.textSvg.appendChild(this.textTextLayer);
    this.textHitEl = this.worldEl.createDiv({ cls: "zm-text-hitboxes" });
    this.textEditEl = this.worldEl.createDiv({ cls: "zm-text-edit" });
    this.updateTextHitboxInteractivity();
    this.textMeasureSpan = this.viewportEl.createEl("span", { cls: "zm-text-measure" });
  }
  updateTextHitboxInteractivity() {
    if (!this.textHitEl) return;
    const passive = this.measuring || this.calibrating;
    this.textHitEl.classList.toggle("zm-text-hitboxes--passive", passive);
  }
  renderTextLayers() {
    var _a, _b, _c, _d, _e, _f;
    if (!this.data || !this.textSvg) return;
    const enabled = !!this.plugin.settings.enableTextLayers;
    this.ensureTextData();
    if (!enabled) {
      this.textGuidesLayer.innerHTML = "";
      this.textDraftLayer.innerHTML = "";
      this.textTextLayer.innerHTML = "";
      this.textHitEl.empty();
      this.stopTextEdit(false);
      return;
    }
    this.textSvg.setAttribute("width", String(this.imgW));
    this.textSvg.setAttribute("height", String(this.imgH));
    this.textGuidesLayer.innerHTML = "";
    this.textTextLayer.innerHTML = "";
    this.textHitEl.empty();
    this.updateTextHitboxInteractivity();
    const ns = "http://www.w3.org/2000/svg";
    const doc = this.getOwnerDocument();
    const abs = (nx, ny) => ({ x: nx * this.imgW, y: ny * this.imgH });
    const rectAbs = (r) => {
      const x = Math.min(r.x0, r.x1) * this.imgW;
      const y = Math.min(r.y0, r.y1) * this.imgH;
      const w = Math.abs(r.x1 - r.x0) * this.imgW;
      const h = Math.abs(r.y1 - r.y0) * this.imgH;
      return { x, y, w, h };
    };
    const layers = (_a = this.data.textLayers) != null ? _a : [];
    for (const layer of layers) {
      if (!this.isTextLayerVisible(layer)) continue;
      const activeBase = this.getActiveBasePath();
      if (layer.boundBase && layer.boundBase !== activeBase) continue;
      const boxes = (_b = layer.boxes) != null ? _b : [];
      for (const box of boxes) {
        const r = rectAbs(box.rect);
        const hb = this.textHitEl.createDiv({ cls: "zm-text-hitbox" });
        hb.dataset.layerId = layer.id;
        hb.dataset.boxId = box.id;
        hb.style.left = `${r.x}px`;
        hb.style.top = `${r.y}px`;
        hb.style.width = `${r.w}px`;
        hb.style.height = `${r.h}px`;
        hb.ondragstart = (ev) => ev.preventDefault();
        const moveActive = this.textMode === "move" && this.activeTextLayerId === layer.id && this.activeTextBoxId === box.id;
        if (moveActive) hb.classList.add("zm-text-hitbox--move");
        else hb.classList.remove("zm-text-hitbox--move");
        hb.addEventListener("pointerdown", (e) => {
          if (!this.data) return;
          if (e.button !== 0) return;
          if (!this.plugin.settings.enableTextLayers) return;
          if (this.isTextBoxLocked(box, layer)) return;
          if (!(this.textMode === "move" && this.activeTextLayerId === layer.id && this.activeTextBoxId === box.id)) return;
          e.preventDefault();
          e.stopPropagation();
          this.plugin.setActiveMap(this);
          const p = this.mouseEventToWorldNorm(e);
          this.startTextBoxMove(layer.id, box.id, p, e.pointerId, hb);
        });
        hb.addEventListener("dblclick", (e) => {
          if (this.drawingMode) {
            e.preventDefault();
            e.stopPropagation();
            this.onDblClickViewport(e);
            return;
          }
          e.stopPropagation();
        });
        hb.addEventListener("click", (e) => {
          if (this.drawingMode) {
            e.preventDefault();
            e.stopPropagation();
            this.handleDrawClick(e);
            return;
          }
          e.stopPropagation();
          if (this.suppressTextClickOnce) return;
          if (this.textMode === "move" && this.activeTextLayerId === layer.id && this.activeTextBoxId === box.id) {
            return;
          }
          if (this.textMode === "draw-lines" && this.activeTextLayerId === layer.id && this.activeTextBoxId === box.id) {
            this.onTextDrawLineClick(layer, box, e);
            return;
          }
          this.onTextBoxClick(layer, box, e);
        });
        hb.addEventListener("contextmenu", (e) => {
          if (this.measuring || this.calibrating) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          this.forwardContextMenuPastTextHitbox(e);
        });
        const showNow = (this.textMode === "draw-lines" || this.textMode === "move") && this.activeTextLayerId === layer.id && this.activeTextBoxId === box.id;
        if (showNow) {
          const rect = doc.createElementNS(ns, "rect");
          rect.classList.add("zm-text-guide-rect");
          rect.classList.add("zm-text-guide--active");
          rect.setAttribute("x", String(r.x));
          rect.setAttribute("y", String(r.y));
          rect.setAttribute("width", String(r.w));
          rect.setAttribute("height", String(r.h));
          this.textGuidesLayer.appendChild(rect);
          for (const ln of (_c = box.lines) != null ? _c : []) {
            const a = abs(ln.x0, ln.y0);
            const b = abs(ln.x1, ln.y1);
            const line = doc.createElementNS(ns, "line");
            line.classList.add("zm-text-guide-line");
            line.classList.add("zm-text-guide--active");
            line.setAttribute("x1", String(a.x));
            line.setAttribute("y1", String(a.y));
            line.setAttribute("x2", String(b.x));
            line.setAttribute("y2", String(b.y));
            this.textGuidesLayer.appendChild(line);
          }
        }
        const isEditingThis = this.textMode === "edit" && this.activeTextLayerId === layer.id && this.activeTextBoxId === box.id;
        if (isEditingThis) continue;
        const st = this.getTextBoxStyle(box, layer);
        for (const ln of (_d = box.lines) != null ? _d : []) {
          const txt = ((_e = ln.text) != null ? _e : "").trimEnd();
          if (!txt) continue;
          const a = abs(ln.x0, ln.y0);
          const b = abs(ln.x1, ln.y1);
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const angleDeg = Math.atan2(dy, dx) * 180 / Math.PI;
          const padLeft = (_f = st.padLeft) != null ? _f : 0;
          const x = a.x + padLeft;
          const y = a.y;
          const t = doc.createElementNS(ns, "text");
          t.setAttribute("x", String(x));
          t.setAttribute("y", String(y));
          t.textContent = txt;
          t.style.fill = st.color;
          t.style.fontFamily = st.fontFamily;
          t.style.fontSize = `${st.fontSize}px`;
          if (st.fontWeight) t.style.fontWeight = st.fontWeight;
          if (st.italic) t.classList.add("zm-text-italic");
          if (typeof st.letterSpacing === "number") t.style.letterSpacing = `${st.letterSpacing}px`;
          if (Math.abs(angleDeg) > 0.01) {
            t.setAttribute("transform", `rotate(${angleDeg} ${x} ${y})`);
          }
          this.textTextLayer.appendChild(t);
        }
      }
    }
    this.renderTextDraft();
  }
  renderTextDraft() {
    if (!this.textDraftLayer) return;
    this.textDraftLayer.innerHTML = "";
    const doc = this.getOwnerDocument();
    const enabled = !!this.plugin.settings.enableTextLayers;
    if (!enabled) return;
    const ns = "http://www.w3.org/2000/svg";
    const abs = (nx, ny) => ({ x: nx * this.imgW, y: ny * this.imgH });
    if (this.textMode === "draw-box" && this.textDrawStart && this.textDrawPreview) {
      const a = abs(this.textDrawStart.x, this.textDrawStart.y);
      const b = abs(this.textDrawPreview.x, this.textDrawPreview.y);
      const x = Math.min(a.x, b.x);
      const y = Math.min(a.y, b.y);
      const w = Math.abs(a.x - b.x);
      const h = Math.abs(a.y - b.y);
      const rect = doc.createElementNS(ns, "rect");
      rect.classList.add("zm-text-guide-rect");
      rect.classList.add("zm-text-guide--active");
      rect.setAttribute("x", String(x));
      rect.setAttribute("y", String(y));
      rect.setAttribute("width", String(w));
      rect.setAttribute("height", String(h));
      this.textDraftLayer.appendChild(rect);
    }
    if (this.textMode === "draw-lines" && this.textLineStart && this.textLinePreview) {
      const a = abs(this.textLineStart.x, this.textLineStart.y);
      const b = abs(this.textLinePreview.x, this.textLinePreview.y);
      const line = doc.createElementNS(ns, "line");
      line.classList.add("zm-text-guide-draft");
      line.classList.add("zm-text-guide--active");
      line.setAttribute("x1", String(a.x));
      line.setAttribute("y1", String(a.y));
      line.setAttribute("x2", String(b.x));
      line.setAttribute("y2", String(b.y));
      this.textDraftLayer.appendChild(line);
    }
  }
  onTextBoxClick(layer, box, ev) {
    var _a;
    if (!this.data) return;
    if (!this.plugin.settings.enableTextLayers) return;
    if (this.isTextBoxLocked(box, layer)) {
      new import_obsidian21.Notice("Text box is locked.", 1500);
      return;
    }
    const lines = (_a = box.lines) != null ? _a : [];
    if (lines.length === 0) {
      new import_obsidian21.Notice("No baselines in this text box yet. Use 'draw lines' first.", 3e3);
      return;
    }
    const p = this.mouseEventToWorldNorm(ev);
    this.startTextEdit(layer.id, box.id, p);
  }
  mouseEventToWorldNorm(ev) {
    const vpRect = this.viewportEl.getBoundingClientRect();
    const vx = ev.clientX - vpRect.left;
    const vy = ev.clientY - vpRect.top;
    const wx = (vx - this.tx) / this.scale;
    const wy = (vy - this.ty) / this.scale;
    return {
      x: clamp(wx / this.imgW, 0, 1),
      y: clamp(wy / this.imgH, 0, 1)
    };
  }
  clampTextBoxDelta(rect, dx, dy) {
    const minX = Math.min(rect.x0, rect.x1);
    const maxX = Math.max(rect.x0, rect.x1);
    const minY = Math.min(rect.y0, rect.y1);
    const maxY = Math.max(rect.y0, rect.y1);
    const dxClamped = clamp(dx, -minX, 1 - maxX);
    const dyClamped = clamp(dy, -minY, 1 - maxY);
    return { dx: dxClamped, dy: dyClamped };
  }
  startTextBoxMove(layerId, boxId, start, pointerId, host) {
    var _a, _b;
    const found = this.getTextBoxById(layerId, boxId);
    if (!found) return;
    const { layer, box } = found;
    if (layer.visible === false) layer.visible = true;
    this.stopTextEdit(true);
    this.finishTextBoxMove(false);
    this.measuring = false;
    this.calibrating = false;
    this.drawingMode = null;
    this.textMode = "move";
    this.activeTextLayerId = layerId;
    this.activeTextBoxId = boxId;
    this.textMoveDragging = true;
    this.textMovePointerId = pointerId;
    this.textMoveStart = start;
    this.textMoveOrig = {
      rect: { ...box.rect },
      lines: ((_a = box.lines) != null ? _a : []).map((ln) => ({ ...ln }))
    };
    host.classList.add("zm-text-hitbox--dragging");
    this.getOwnerBody().classList.add("zm-cursor-move-grabbing");
    (_b = host.setPointerCapture) == null ? void 0 : _b.call(host, pointerId);
  }
  updateTextBoxMove(cur) {
    var _a;
    if (!this.data) return;
    if (!this.textMoveDragging || !this.textMoveStart || !this.textMoveOrig || !this.activeTextLayerId || !this.activeTextBoxId) return;
    const found = this.getTextBoxById(this.activeTextLayerId, this.activeTextBoxId);
    if (!found) return;
    const { layer, box } = found;
    if (this.isTextBoxLocked(box, layer)) return;
    const dxRaw = cur.x - this.textMoveStart.x;
    const dyRaw = cur.y - this.textMoveStart.y;
    const { dx, dy } = this.clampTextBoxDelta(this.textMoveOrig.rect, dxRaw, dyRaw);
    box.rect = {
      x0: this.textMoveOrig.rect.x0 + dx,
      y0: this.textMoveOrig.rect.y0 + dy,
      x1: this.textMoveOrig.rect.x1 + dx,
      y1: this.textMoveOrig.rect.y1 + dy
    };
    const srcLines = this.textMoveOrig.lines;
    (_a = box.lines) != null ? _a : box.lines = [];
    if (box.lines.length !== srcLines.length) {
      const byId = new Map(box.lines.map((ln) => [ln.id, ln]));
      box.lines = srcLines.map((s) => {
        const existing = byId.get(s.id);
        return existing != null ? existing : { ...s };
      });
    }
    for (let i = 0; i < srcLines.length; i += 1) {
      const s = srcLines[i];
      const ln = box.lines[i];
      ln.x0 = s.x0 + dx;
      ln.y0 = s.y0 + dy;
      ln.x1 = s.x1 + dx;
      ln.y1 = s.y1 + dy;
    }
    this.renderTextLayers();
  }
  finishTextBoxMove(commit) {
    var _a;
    if (!this.textMoveDragging) return;
    this.textMoveDragging = false;
    this.textMovePointerId = null;
    this.textMoveStart = null;
    this.textMoveOrig = null;
    this.getOwnerBody().classList.remove("zm-cursor-move-grabbing");
    (_a = this.textHitEl) == null ? void 0 : _a.querySelectorAll(".zm-text-hitbox--dragging").forEach((el) => el.classList.remove("zm-text-hitbox--dragging"));
    if (commit) {
      void this.saveDataSoon();
    }
  }
  startTextEdit(layerId, boxId, focus) {
    var _a, _b, _c, _d, _e, _f;
    if (!this.data) return;
    this.measuring = false;
    this.calibrating = false;
    this.drawingMode = null;
    this.finishTextBoxMove(false);
    this.stopTextEdit(true);
    this.textMode = "edit";
    this.activeTextLayerId = layerId;
    this.activeTextBoxId = boxId;
    this.textDirty = false;
    const found = this.getTextBoxById(layerId, boxId);
    if (!found) return;
    const { layer, box } = found;
    if (this.isTextBoxLocked(box, layer)) return;
    (_a = box.lines) != null ? _a : box.lines = [];
    if (typeof box.autoFlow !== "boolean") box.autoFlow = this.isTextBoxAutoFlow(box, layer);
    if (typeof box.allowAngledBaselines !== "boolean") box.allowAngledBaselines = this.isTextBoxAllowAngled(box, layer);
    box.style = this.getTextBoxStyle(box, layer);
    this.textEditEl.empty();
    this.textInputs.clear();
    const st = box.style;
    const sorted = [...(_b = box.lines) != null ? _b : []].sort((a, b) => {
      const ay = (a.y0 + a.y1) / 2;
      const by = (b.y0 + b.y1) / 2;
      return ay - by || a.x0 - b.x0;
    });
    box.lines = sorted;
    for (let i = 0; i < box.lines.length; i += 1) {
      const ln = box.lines[i];
      const ax0 = ln.x0 * this.imgW;
      const ay0 = ln.y0 * this.imgH;
      const ax1 = ln.x1 * this.imgW;
      const ay1 = ln.y1 * this.imgH;
      const dx = ax1 - ax0;
      const dy = ay1 - ay0;
      const len = Math.max(1, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const fontSize = st.fontSize;
      const lineH = typeof st.lineHeight === "number" && st.lineHeight > 1 ? st.lineHeight : Math.round(fontSize * 1.35);
      const leading = Math.max(0, lineH - fontSize);
      const ascent = Math.round(fontSize * 0.8);
      const rise = ascent + Math.round(leading / 2);
      const ux = dx / len;
      const uy = dy / len;
      const nx = -uy;
      const ny = ux;
      const row = this.textEditEl.createDiv({ cls: "zm-text-line" });
      row.style.left = `${ax0 - nx * rise}px`;
      row.style.top = `${ay0 - ny * rise}px`;
      row.style.width = `${len}px`;
      row.style.height = `${lineH}px`;
      row.style.transform = `rotate(${angle}deg)`;
      const input = row.createEl("input", { cls: "zm-text-input" });
      input.type = "text";
      input.value = (_c = ln.text) != null ? _c : "";
      input.style.height = `${lineH}px`;
      input.style.lineHeight = `${lineH}px`;
      input.style.fontFamily = st.fontFamily;
      input.style.fontSize = `${st.fontSize}px`;
      input.style.color = st.color;
      if (st.fontWeight) input.style.fontWeight = st.fontWeight;
      if (st.italic) input.classList.add("zm-text-italic");
      if (typeof st.letterSpacing === "number") input.style.letterSpacing = `${st.letterSpacing}px`;
      input.style.paddingLeft = `${(_d = st.padLeft) != null ? _d : 0}px`;
      input.style.paddingRight = `${(_e = st.padRight) != null ? _e : 0}px`;
      input.addEventListener("pointerdown", (e) => e.stopPropagation());
      input.addEventListener("click", (e) => e.stopPropagation());
      input.addEventListener("dblclick", (e) => e.stopPropagation());
      input.addEventListener("contextmenu", (e) => e.stopPropagation());
      input.addEventListener("keydown", (e) => {
        var _a2, _b2;
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          this.stopTextEdit(true);
          return;
        }
        if (e.key === "Backspace" && this.isTextBoxAutoFlow(box, layer)) {
          const selStart = (_a2 = input.selectionStart) != null ? _a2 : 0;
          const selEnd = (_b2 = input.selectionEnd) != null ? _b2 : selStart;
          if (selStart === 0 && selEnd === 0 && i > 0) {
            e.preventDefault();
            e.stopPropagation();
            const prev = this.getTextInputByIndex(i - 1);
            if (!prev) return;
            const joinPos = prev.value.length;
            prev.focus();
            prev.setSelectionRange(joinPos, joinPos);
            this.textDirty = true;
            this.reflowTextBox(box, st, i - 1, { advanceFocus: false });
            this.scheduleTextSave();
            window.setTimeout(() => {
              if (this.textMode !== "edit") return;
              const pos = Math.min(joinPos, prev.value.length);
              prev.focus();
              prev.setSelectionRange(pos, pos);
            }, 0);
            return;
          }
        }
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          const next = this.getTextInputByIndex(i + 1);
          next == null ? void 0 : next.focus();
          return;
        }
        if (e.key === "ArrowDown") {
          const next = this.getTextInputByIndex(i + 1);
          if (next) {
            e.preventDefault();
            next.focus();
          }
          return;
        }
        if (e.key === "ArrowUp") {
          const prev = this.getTextInputByIndex(i - 1);
          if (prev) {
            e.preventDefault();
            prev.focus();
          }
          return;
        }
      });
      input.addEventListener("input", () => {
        var _a2, _b2, _c2;
        if (this.isTextBoxLocked(box, layer)) {
          input.value = (_a2 = ln.text) != null ? _a2 : "";
          new import_obsidian21.Notice("Text box is locked.", 1200);
          return;
        }
        if (!this.isTextBoxAutoFlow(box, layer)) {
          ln.text = input.value;
          this.textDirty = true;
          this.scheduleTextSave();
          return;
        }
        const selStart = (_b2 = input.selectionStart) != null ? _b2 : input.value.length;
        const selEnd = (_c2 = input.selectionEnd) != null ? _c2 : selStart;
        const hasSelection = selEnd !== selStart;
        const atEnd = !hasSelection && selStart === input.value.length;
        ln.text = input.value;
        this.textDirty = true;
        const move = this.reflowTextBox(box, st, i, { advanceFocus: atEnd });
        this.scheduleTextSave();
        if (move.advance) {
          window.setTimeout(() => {
            if (this.textMode !== "edit") return;
            const next = this.getTextInputByIndex(move.advance.toIndex);
            if (!next) return;
            next.focus();
            const pos = Math.min(move.advance.caret, next.value.length);
            next.setSelectionRange(pos, pos);
          }, 0);
        }
      });
      this.textInputs.set(ln.id, input);
    }
    this.installTextOutsideClickHandler();
    if (focus) {
      this.focusNearestBaseline(box, focus);
    } else {
      (_f = this.getTextInputByIndex(0)) == null ? void 0 : _f.focus();
    }
    this.renderTextLayers();
  }
  stopTextEdit(save) {
    var _a;
    if (this.textMode !== "edit") return;
    this.textMode = null;
    this.activeTextLayerId = null;
    this.activeTextBoxId = null;
    this.textInputs.clear();
    this.textEditEl.empty();
    (_a = this.textOutsideCleanup) == null ? void 0 : _a.call(this);
    this.textOutsideCleanup = null;
    if (save) {
      this.flushTextSaveNow();
    } else {
      if (this.textSaveTimer !== null) {
        window.clearTimeout(this.textSaveTimer);
        this.textSaveTimer = null;
      }
      this.textDirty = false;
    }
    this.renderTextLayers();
  }
  installTextOutsideClickHandler() {
    var _a;
    (_a = this.textOutsideCleanup) == null ? void 0 : _a.call(this);
    this.textOutsideCleanup = null;
    const doc = this.el.ownerDocument;
    const handler = (ev) => {
      if (this.textMode !== "edit") return;
      const t = ev.target;
      if (!isNodeLike(t)) return;
      if (this.textEditEl.contains(t)) return;
      if (t instanceof Element && t.closest(".zm-text-hitbox")) return;
      if (this.activeTextLayerId && this.activeTextBoxId) {
        const hb = this.textHitEl.querySelector(
          `.zm-text-hitbox[data-layer-id="${this.activeTextLayerId}"][data-box-id="${this.activeTextBoxId}"]`
        );
        if (hb && hb.contains(t)) return;
      }
      this.stopTextEdit(true);
    };
    doc.addEventListener("pointerdown", handler, { capture: true });
    this.textOutsideCleanup = () => {
      doc.removeEventListener("pointerdown", handler, true);
    };
  }
  getTextInputByIndex(index) {
    var _a, _b;
    const found = this.getTextBoxById(this.activeTextLayerId, this.activeTextBoxId);
    if (!found) return null;
    const ln = (_a = found.box.lines) == null ? void 0 : _a[index];
    if (!ln) return null;
    return (_b = this.textInputs.get(ln.id)) != null ? _b : null;
  }
  focusNearestBaseline(box, p) {
    var _a, _b;
    if (!((_a = box.lines) == null ? void 0 : _a.length)) return;
    const py = p.y;
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < box.lines.length; i += 1) {
      const ln = box.lines[i];
      const y = (ln.y0 + ln.y1) / 2;
      const d = Math.abs(y - py);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    (_b = this.getTextInputByIndex(bestIdx)) == null ? void 0 : _b.focus();
  }
  scheduleTextSave(delayMs = 900) {
    if (!this.data) return;
    if (this.textSaveTimer !== null) window.clearTimeout(this.textSaveTimer);
    this.textSaveTimer = window.setTimeout(() => {
      this.textSaveTimer = null;
      if (!this.textDirty) return;
      void this.saveDataSoon().then(() => {
        this.textDirty = false;
      });
    }, delayMs);
  }
  flushTextSaveNow() {
    if (!this.data) return;
    if (this.textSaveTimer !== null) {
      window.clearTimeout(this.textSaveTimer);
      this.textSaveTimer = null;
    }
    if (!this.textDirty) return;
    void this.saveDataSoon().then(() => {
      this.textDirty = false;
    });
  }
  measureTextWidthPx(style, text) {
    var _a, _b;
    const span = this.textMeasureSpan;
    if (!span) return text.length * ((_a = style.fontSize) != null ? _a : 14);
    span.style.fontFamily = style.fontFamily;
    span.style.fontSize = `${style.fontSize}px`;
    span.style.fontWeight = (_b = style.fontWeight) != null ? _b : "400";
    span.style.letterSpacing = typeof style.letterSpacing === "number" ? `${style.letterSpacing}px` : "normal";
    span.textContent = text || "";
    return span.getBoundingClientRect().width;
  }
  lineCapacityPx(style, ln) {
    var _a, _b;
    const ax0 = ln.x0 * this.imgW;
    const ay0 = ln.y0 * this.imgH;
    const ax1 = ln.x1 * this.imgW;
    const ay1 = ln.y1 * this.imgH;
    const len = Math.hypot(ax1 - ax0, ay1 - ay0);
    const cap = len - ((_a = style.padLeft) != null ? _a : 0) - ((_b = style.padRight) != null ? _b : 0);
    return Math.max(10, cap);
  }
  splitToFit(style, ln, text) {
    const cap = this.lineCapacityPx(style, ln);
    const st = style;
    if (this.measureTextWidthPx(st, text) <= cap) {
      return { fit: text, rest: "", overflowed: false, boundaryOnly: false };
    }
    for (let i = text.length - 1; i >= 0; i -= 1) {
      if (text[i] !== " ") continue;
      const left = text.slice(0, i).trimEnd();
      const right = text.slice(i + 1).trimStart();
      if (!left) continue;
      if (this.measureTextWidthPx(st, left) <= cap) {
        return { fit: left, rest: right, overflowed: true, boundaryOnly: right.length === 0 };
      }
    }
    let lo = 0;
    let hi = text.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      const left = text.slice(0, mid);
      if (this.measureTextWidthPx(st, left) <= cap) lo = mid;
      else hi = mid - 1;
    }
    const fit = text.slice(0, lo).trimEnd();
    const rest = text.slice(lo).trimStart();
    return { fit, rest, overflowed: true, boundaryOnly: false };
  }
  pullWord(text) {
    var _a, _b;
    const s = text.trimStart();
    if (!s) return null;
    const m = /^(\S+)\s*(.*)$/.exec(s);
    if (!m) return null;
    return { word: (_a = m[1]) != null ? _a : "", rest: (_b = m[2]) != null ? _b : "" };
  }
  reflowTextBox(box, style, startIndex, opts) {
    var _a, _b, _c, _d, _e;
    if (!((_a = box.lines) == null ? void 0 : _a.length)) return {};
    let advance;
    for (let i = startIndex; i < box.lines.length; i += 1) {
      const ln = box.lines[i];
      const txt = (_b = ln.text) != null ? _b : "";
      const { fit, rest, overflowed, boundaryOnly } = this.splitToFit(style, ln, txt);
      if (!overflowed) {
        ln.text = fit;
        continue;
      }
      ln.text = fit;
      const next = box.lines[i + 1];
      if (!next) {
        new import_obsidian21.Notice("No more baselines in this text box.", 1500);
        continue;
      }
      if (rest) {
        const nextTxt = ((_c = next.text) != null ? _c : "").trimStart();
        next.text = (rest + (nextTxt ? " " + nextTxt : "")).trimEnd();
      }
      if (!advance && i === startIndex && (opts == null ? void 0 : opts.advanceFocus)) {
        advance = { toIndex: i + 1, caret: boundaryOnly ? 0 : rest.length };
      }
    }
    for (let i = startIndex; i < box.lines.length - 1; i += 1) {
      const cur = box.lines[i];
      const next = box.lines[i + 1];
      if (!next) continue;
      while (true) {
        const pick = this.pullWord((_d = next.text) != null ? _d : "");
        if (!pick) break;
        const candidate = ((_e = cur.text) != null ? _e : "").trimEnd();
        const joined = candidate ? `${candidate} ${pick.word}` : pick.word;
        if (this.measureTextWidthPx(style, joined) <= this.lineCapacityPx(style, cur)) {
          cur.text = joined;
          next.text = pick.rest.trimStart();
        } else {
          break;
        }
      }
    }
    this.syncInputsFromBox(box);
    return { advance };
  }
  syncInputsFromBox(box) {
    var _a, _b, _c, _d;
    const active = this.el.ownerDocument.activeElement;
    for (const ln of (_a = box.lines) != null ? _a : []) {
      const input = this.textInputs.get(ln.id);
      if (!input) continue;
      const want = (_b = ln.text) != null ? _b : "";
      if (input.value === want) continue;
      if (active === input) {
        const selStart = (_c = input.selectionStart) != null ? _c : want.length;
        const selEnd = (_d = input.selectionEnd) != null ? _d : want.length;
        input.value = want;
        const s = Math.min(selStart, want.length);
        const e = Math.min(selEnd, want.length);
        input.setSelectionRange(s, e);
      } else {
        input.value = want;
      }
    }
  }
  onTextDrawLineClick(layer, box, ev) {
    var _a;
    if (!this.data) return;
    if (this.isTextBoxLocked(box, layer)) {
      new import_obsidian21.Notice("Text box is locked.", 1500);
      return;
    }
    const p = this.mouseEventToWorldNorm(ev);
    if (!this.textLineStart) {
      this.textLineStart = p;
      this.textLinePreview = p;
      this.renderTextDraft();
      return;
    }
    const a = this.textLineStart;
    const b = p;
    const rect = box.rect;
    const minX = Math.min(rect.x0, rect.x1);
    const maxX = Math.max(rect.x0, rect.x1);
    const minY = Math.min(rect.y0, rect.y1);
    const maxY = Math.max(rect.y0, rect.y1);
    let x0 = a.x;
    let y0 = a.y;
    let x1 = b.x;
    let y1 = b.y;
    const allowAngled = this.isTextBoxAllowAngled(box, layer);
    const freeAngle = allowAngled && ev.ctrlKey;
    if (!freeAngle) {
      const y = (y0 + y1) / 2;
      y0 = y;
      y1 = y;
    }
    if (x1 < x0) {
      [x0, x1] = [x1, x0];
      [y0, y1] = [y1, y0];
    }
    x0 = clamp(x0, minX, maxX);
    x1 = clamp(x1, minX, maxX);
    y0 = clamp(y0, minY, maxY);
    y1 = clamp(y1, minY, maxY);
    const pxLen = Math.hypot((x1 - x0) * this.imgW, (y1 - y0) * this.imgH);
    if (pxLen < 6) {
      new import_obsidian21.Notice("Baseline too short.", 1200);
      this.textLineStart = null;
      this.textLinePreview = null;
      this.renderTextDraft();
      return;
    }
    (_a = box.lines) != null ? _a : box.lines = [];
    box.lines.push({
      id: generateId("tln"),
      x0,
      y0,
      x1,
      y1,
      text: ""
    });
    box.lines.sort((u, v) => {
      const uy = (u.y0 + u.y1) / 2;
      const vy = (v.y0 + v.y1) / 2;
      return uy - vy || u.x0 - v.x0;
    });
    this.textLineStart = null;
    this.textLinePreview = null;
    void this.saveDataSoon();
    this.renderTextLayers();
  }
  startDrawNewTextBox(layerId, mode) {
    if (!this.data) return;
    if (!this.plugin.settings.enableTextLayers) {
      new import_obsidian21.Notice("Text layers are disabled in preferences.", 2500);
      return;
    }
    const layer = this.getTextLayerById(layerId);
    if (!layer) return;
    if (layer.locked) {
      new import_obsidian21.Notice("Text layer is locked.", 1500);
      return;
    }
    this.stopTextEdit(true);
    this.finishTextBoxMove(false);
    this.measuring = false;
    this.calibrating = false;
    this.drawingMode = null;
    this.textMode = "draw-box";
    this.activeTextLayerId = layerId;
    this.activeTextBoxId = null;
    this.textDrawBoxMode = mode;
    this.textDrawStart = null;
    this.textDrawPreview = null;
    new import_obsidian21.Notice(`Draw ${mode} text box: drag to create the box. Press esc to cancel.`, 4500);
  }
  finishDrawNewTextBox() {
    var _a, _b, _c;
    if (!this.data || !this.textDrawStart || !this.textDrawPreview) return;
    const layer = this.getTextLayerById(this.activeTextLayerId);
    if (!layer) return;
    const a = this.textDrawStart;
    const b = this.textDrawPreview;
    const rect = {
      x0: a.x,
      y0: a.y,
      x1: b.x,
      y1: b.y
    };
    const pxW = Math.abs(rect.x1 - rect.x0) * this.imgW;
    const pxH = Math.abs(rect.y1 - rect.y0) * this.imgH;
    if (pxW < 12 || pxH < 12) {
      new import_obsidian21.Notice("Text box too small.", 1500);
      return;
    }
    const box = {
      id: generateId("tbox"),
      name: `Text box ${((_b = (_a = layer.boxes) == null ? void 0 : _a.length) != null ? _b : 0) + 1}`,
      mode: this.textDrawBoxMode,
      rect,
      lines: [],
      style: this.normalizeTextLayerStyle(layer.style),
      autoFlow: true,
      allowAngledBaselines: false,
      locked: false
    };
    if (box.mode === "auto") {
      box.auto = this.defaultTextBoxAutoConfig();
      box.lines = this.buildAutoTextBoxLines(box.rect, box.style, box.auto);
    }
    (_c = layer.boxes) != null ? _c : layer.boxes = [];
    layer.boxes.push(box);
    this.textMode = null;
    this.textDrawStart = null;
    this.textDrawPreview = null;
    this.renderTextLayers();
    void this.saveDataSoon();
    if (box.mode === "custom") {
      this.textMode = "draw-lines";
      this.activeTextLayerId = layer.id;
      this.activeTextBoxId = box.id;
      this.renderTextLayers();
      new import_obsidian21.Notice("Draw baselines: click start + end. Hold ctrl for free angle (if enabled). Esc to exit.", 6e3);
      return;
    }
    this.openTextBoxConfigModal(layer, box);
  }
  renderMeasure() {
    if (!this.measureSvg) return;
    const doc = this.getOwnerDocument();
    this.measureSvg.setAttribute("width", String(this.imgW));
    this.updateTextHitboxInteractivity();
    this.measureSvg.setAttribute("height", String(this.imgH));
    const pts = [...this.measurePts];
    if (this.measuring && this.measurePreview) pts.push(this.measurePreview);
    const toAbs = (p) => ({ x: p.x * this.imgW, y: p.y * this.imgH });
    let d = "";
    pts.forEach((p, i) => {
      const a = toAbs(p);
      d += i === 0 ? `M ${a.x} ${a.y}` : ` L ${a.x} ${a.y}`;
    });
    this.measurePath.setAttribute("d", d);
    while (this.measureDots.firstChild) this.measureDots.removeChild(this.measureDots.firstChild);
    for (const p of this.measurePts) {
      const a = toAbs(p);
      const c = doc.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", String(a.x));
      c.setAttribute("cy", String(a.y));
      c.setAttribute("r", "4");
      c.classList.add("zm-measure__dot");
      this.measureDots.appendChild(c);
    }
    this.updateMeasureHud();
  }
  renderCalibrate() {
    if (!this.measureSvg) return;
    this.updateTextHitboxInteractivity();
    const doc = this.getOwnerDocument();
    const toAbs = (p) => ({ x: p.x * this.imgW, y: p.y * this.imgH });
    const pts = [...this.calibPts];
    if (this.calibrating && this.calibPts.length === 1 && this.calibPreview) pts.push(this.calibPreview);
    let d = "";
    pts.forEach((p, i) => {
      const a = toAbs(p);
      d += i === 0 ? `M ${a.x} ${a.y}` : ` L ${a.x} ${a.y}`;
    });
    this.calibPath.setAttribute("d", d);
    while (this.calibDots.firstChild) this.calibDots.removeChild(this.calibDots.firstChild);
    for (const p of this.calibPts) {
      const a = toAbs(p);
      const c = doc.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", String(a.x));
      c.setAttribute("cy", String(a.y));
      c.setAttribute("r", "4");
      c.classList.add("zm-measure__dot");
      this.calibDots.appendChild(c);
    }
  }
  clearMeasure() {
    this.measurePts = [];
    this.measurePreview = null;
    this.measureSegTerrainIds = [];
    this.renderMeasure();
  }
  ensureMeasureProTerrainIds() {
    var _a, _b;
    if (!this.plugin.settings.enableMeasurePro) return;
    const want = Math.max(0, this.measurePts.length - 1);
    const terrains = this.plugin.getActiveTerrains();
    const def = (_b = (_a = terrains[0]) == null ? void 0 : _a.id) != null ? _b : "";
    while (this.measureSegTerrainIds.length < want) this.measureSegTerrainIds.push(def);
    if (this.measureSegTerrainIds.length > want) this.measureSegTerrainIds.length = want;
  }
  terrainFactor(id) {
    if (!id) return 1;
    const t = this.plugin.getActiveTerrains().find((x) => x.id === id);
    return t ? t.factor : 1;
  }
  computeMeasureSegmentsMeters(includePreview) {
    var _a, _b, _c;
    const mpp = this.getMetersPerPixel();
    if (!mpp) return null;
    const pts = [...this.measurePts];
    const terrains = [...this.measureSegTerrainIds];
    if (includePreview && this.measurePreview && pts.length >= 1) {
      pts.push(this.measurePreview);
      terrains.push((_b = (_a = terrains[terrains.length - 1]) != null ? _a : terrains[0]) != null ? _b : "");
    }
    if (pts.length < 2) return null;
    const out = [];
    for (let i = 1; i < pts.length; i += 1) {
      const a = pts[i - 1];
      const b = pts[i];
      const dx = (b.x - a.x) * this.imgW;
      const dy = (b.y - a.y) * this.imgH;
      const px = Math.hypot(dx, dy);
      out.push({ meters: px * mpp, terrainId: (_c = terrains[i - 1]) != null ? _c : "" });
    }
    return out;
  }
  openMeasureTerrainModal() {
    var _a, _b, _c, _d;
    if (!this.plugin.settings.enableMeasurePro) return;
    if (this.measurePts.length < 2) {
      new import_obsidian21.Notice("Measure terrains: add at least 2 points first.", 2500);
      return;
    }
    const terrains = this.plugin.getActiveTerrains();
    if (terrains.length === 0) {
      new import_obsidian21.Notice("No terrains configured. Add terrains in settings \u2192 travel rules.", 4500);
      return;
    }
    this.ensureMeasureProTerrainIds();
    const unit = (_c = (_b = (_a = this.data) == null ? void 0 : _a.measurement) == null ? void 0 : _b.displayUnit) != null ? _c : "auto-metric";
    const mpp = this.getMetersPerPixel();
    if (!mpp && unit !== "custom") {
      new import_obsidian21.Notice("Scale is not calibrated.", 2500);
      return;
    }
    const segments = [];
    for (let i = 1; i < this.measurePts.length; i += 1) {
      const a = this.measurePts[i - 1];
      const b = this.measurePts[i];
      const dx = (b.x - a.x) * this.imgW;
      const dy = (b.y - a.y) * this.imgH;
      const px = Math.hypot(dx, dy);
      const label = unit === "custom" ? this.formatCustomDistanceFromPixels(px) : this.formatDistance(px * mpp);
      segments.push({
        label,
        terrainId: (_d = this.measureSegTerrainIds[i - 1]) != null ? _d : terrains[0].id
      });
    }
    new MeasureTerrainModal(this.app, terrains, segments, (res) => {
      this.measureSegTerrainIds = res.map((s) => s.terrainId);
      this.updateMeasureHud();
    }).open();
  }
  toggleMeasureFromCommand() {
    if (!this.ready) return;
    if (this.calibrating) {
      this.calibrating = false;
      this.calibPts = [];
      this.calibPreview = null;
      this.renderCalibrate();
    }
    this.measuring = !this.measuring;
    if (!this.measuring) {
      this.measurePreview = null;
    }
    this.updateMeasureHud();
    this.renderMeasure();
  }
  clearMeasurementFromCommand() {
    if (!this.ready) return;
    this.clearMeasure();
  }
  getMetersPerPixel() {
    var _a;
    const base = this.getActiveBasePath();
    const m = (_a = this.data) == null ? void 0 : _a.measurement;
    if (!m) return void 0;
    if (m.scales && base in m.scales) return m.scales[base];
    return m.metersPerPixel;
  }
  ensureMeasurement() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    if (!this.data) return;
    (_b = (_a = this.data).measurement) != null ? _b : _a.measurement = {
      displayUnit: "km",
      metersPerPixel: void 0,
      scales: {},
      travelTimePresetIds: []
    };
    (_d = (_c = this.data.measurement).scales) != null ? _d : _c.scales = {};
    (_f = (_e = this.data.measurement).displayUnit) != null ? _f : _e.displayUnit = "km";
    (_h = (_g = this.data.measurement).travelTimePresetIds) != null ? _h : _g.travelTimePresetIds = [];
    (_j = (_i = this.data.measurement).customUnitPxPerUnit) != null ? _j : _i.customUnitPxPerUnit = {};
  }
  getCustomPxPerUnit(customUnitId) {
    var _a, _b, _c;
    const base = this.getActiveBasePath();
    const map = (_c = (_b = (_a = this.data) == null ? void 0 : _a.measurement) == null ? void 0 : _b.customUnitPxPerUnit) == null ? void 0 : _c[base];
    const v = map == null ? void 0 : map[customUnitId];
    return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : void 0;
  }
  async applyCustomUnitCalibration(customUnitId, pxPerUnit) {
    var _a, _b, _c;
    if (!this.data) return;
    this.ensureMeasurement();
    const base = this.getActiveBasePath();
    const meas = this.data.measurement;
    if (!meas) return;
    (_a = meas.customUnitPxPerUnit) != null ? _a : meas.customUnitPxPerUnit = {};
    (_c = (_b = meas.customUnitPxPerUnit)[base]) != null ? _c : _b[base] = {};
    meas.customUnitPxPerUnit[base][customUnitId] = pxPerUnit;
    meas.displayUnit = "custom";
    meas.customUnitId = customUnitId;
    if (await this.store.wouldChange(this.data)) {
      this.ignoreNextModify = true;
      await this.store.save(this.data);
    }
    this.schedulePingUpdate();
  }
  updateMeasureHud() {
    var _a, _b, _c;
    if (!this.measureHud) return;
    const px = this.computeDistancePixels();
    const meters = this.computeDistanceMeters();
    const unit = (_c = (_b = (_a = this.data) == null ? void 0 : _a.measurement) == null ? void 0 : _b.displayUnit) != null ? _c : "km";
    if (this.measuring || this.measurePts.length >= 2) {
      let distTxt = "No scale";
      if (unit === "custom") {
        distTxt = px != null ? this.formatCustomDistanceFromPixels(px) : "No distance";
      } else {
        distTxt = meters != null ? this.formatDistance(meters) : "No scale";
      }
      const lines = [`Distance: ${distTxt}`];
      if (meters != null) {
        const segments = this.plugin.settings.enableMeasurePro ? this.computeMeasureSegmentsMeters(this.measuring && !!this.measurePreview) : null;
        const tt = segments ? this.computeTravelTimeLinesBySegments(segments) : this.computeTravelTimeLines(meters);
        if (tt.length) lines.push(...tt);
      }
      this.measureHud.textContent = lines.join("\n");
      this.measureHud.classList.add("zm-measure-hud-visible");
    } else {
      this.measureHud.classList.remove("zm-measure-hud-visible");
    }
  }
  computeDistanceMeters() {
    if (!this.data) return null;
    if (this.measurePts.length < 2 && !(this.measuring && this.measurePts.length >= 1 && this.measurePreview)) return null;
    const pts = [...this.measurePts];
    if (this.measuring && this.measurePreview) pts.push(this.measurePreview);
    let px = 0;
    for (let i = 1; i < pts.length; i += 1) {
      const a = pts[i - 1];
      const b = pts[i];
      const dx = (b.x - a.x) * this.imgW;
      const dy = (b.y - a.y) * this.imgH;
      px += Math.hypot(dx, dy);
    }
    const mpp = this.getMetersPerPixel();
    if (!mpp) return null;
    return px * mpp;
  }
  computeDistancePixels() {
    if (!this.data) return null;
    if (this.measurePts.length < 2 && !(this.measuring && this.measurePts.length >= 1 && this.measurePreview)) return null;
    const pts = [...this.measurePts];
    if (this.measuring && this.measurePreview) pts.push(this.measurePreview);
    let px = 0;
    for (let i = 1; i < pts.length; i += 1) {
      const a = pts[i - 1];
      const b = pts[i];
      const dx = (b.x - a.x) * this.imgW;
      const dy = (b.y - a.y) * this.imgH;
      px += Math.hypot(dx, dy);
    }
    return px;
  }
  formatCustomDistanceFromPixels(px) {
    var _a, _b, _c, _d, _e;
    const meas = (_a = this.data) == null ? void 0 : _a.measurement;
    const defs = this.plugin.getActiveCustomUnits();
    if (!meas || defs.length === 0) return "No custom units";
    const id = (_b = meas.customUnitId) != null ? _b : defs[0].id;
    const def = (_c = defs.find((d) => d.id === id)) != null ? _c : defs[0];
    if (!def) return "No custom units";
    const pxPerUnit = this.getCustomPxPerUnit(def.id);
    const label = ((_d = def.abbreviation) != null ? _d : "").trim() || ((_e = def.name) != null ? _e : "").trim() || "u";
    if (!pxPerUnit) return `No calibration (${label})`;
    const val = px / pxPerUnit;
    const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
    return `${round(val, 2)} ${label}`;
  }
  formatDistance(m) {
    var _a, _b, _c, _d;
    const meas = (_a = this.data) == null ? void 0 : _a.measurement;
    const unit = (_b = meas == null ? void 0 : meas.displayUnit) != null ? _b : "km";
    const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;
    if (unit === "custom") {
      const defs = this.plugin.getActiveCustomUnits();
      if (defs.length === 0) {
        return `${round(m, 2)} u`;
      }
      const activeId = meas == null ? void 0 : meas.customUnitId;
      const def = (_d = (_c = activeId && defs.find((d) => d.id === activeId)) != null ? _c : defs[0]) != null ? _d : null;
      if (!def) {
        return `${round(m, 2)} u`;
      }
      const val = m / (def.metersPerUnit || 1);
      const label = typeof def.abbreviation === "string" && def.abbreviation.trim() || typeof def.name === "string" && def.name.trim() || "u";
      return `${round(val, 2)} ${label}`;
    }
    switch (unit) {
      case "m":
        return `${Math.round(m)} m`;
      case "km":
        return `${round(m / 1e3, 3)} km`;
      case "mi":
        return `${round(m / 1609.344, 3)} mi`;
      case "ft":
        return `${Math.round(m / 0.3048)} ft`;
      default:
        return `${round(m / 1e3, 3)} km`;
    }
  }
  travelDistanceToMeters(value, unit, customUnitId) {
    var _a, _b, _c;
    if (!Number.isFinite(value) || value <= 0) return null;
    switch (unit) {
      case "km":
        return value * 1e3;
      case "mi":
        return value * 1609.344;
      case "ft":
        return value * 0.3048;
      case "custom": {
        const defs = this.plugin.getActiveCustomUnits();
        const id = (_c = customUnitId ? (_a = defs.find((d) => d.id === customUnitId)) == null ? void 0 : _a.id : void 0) != null ? _c : (_b = defs[0]) == null ? void 0 : _b.id;
        if (!id) return null;
        const pxPerUnit = this.getCustomPxPerUnit(id);
        const mpp = this.getMetersPerPixel();
        if (!pxPerUnit || !mpp) return null;
        return value * (pxPerUnit * mpp);
      }
      case "m":
      default:
        return value;
    }
  }
  formatTravelTimeNumber(v) {
    const abs = Math.abs(v);
    const decimals = abs < 10 ? 2 : abs < 100 ? 1 : 0;
    const p = 10 ** decimals;
    return String(Math.round(v * p) / p);
  }
  getSelectedTravelPerDayPreset() {
    var _a, _b, _c, _d, _e, _f, _g;
    const info = (_b = (_a = this.plugin).getActiveTravelPerDayPresets) == null ? void 0 : _b.call(_a);
    const presets = (_c = info == null ? void 0 : info.presets) != null ? _c : [];
    const note = (info == null ? void 0 : info.multipleEnabled) ? `Multiple travel packs enabled; using "${(_d = info.packName) != null ? _d : "first enabled"}".` : void 0;
    if (!presets.length) return { preset: null, note };
    const selectedId = ((_g = (_f = (_e = this.data) == null ? void 0 : _e.measurement) == null ? void 0 : _f.travelDayPresetId) != null ? _g : "").trim();
    const picked = selectedId ? presets.find((p) => p.id === selectedId) : void 0;
    return { preset: picked != null ? picked : presets[0], note };
  }
  computeTravelTimeLines(distanceMeters) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const selected = new Set((_c = (_b = (_a = this.data) == null ? void 0 : _a.measurement) == null ? void 0 : _b.travelTimePresetIds) != null ? _c : []);
    if (selected.size === 0) return [];
    const presets = this.plugin.getActiveTravelTimePresets();
    const out = [];
    const perDaySel = this.getSelectedTravelPerDayPreset();
    const perDayPreset = perDaySel.preset;
    const perDayValue = (_d = perDayPreset == null ? void 0 : perDayPreset.value) != null ? _d : null;
    const perDayUnit = ((_e = perDayPreset == null ? void 0 : perDayPreset.unit) != null ? _e : "").trim();
    const perDayName = ((_f = perDayPreset == null ? void 0 : perDayPreset.name) != null ? _f : "").trim();
    const showDays = !!((_h = (_g = this.data) == null ? void 0 : _g.measurement) == null ? void 0 : _h.travelDaysEnabled);
    for (const p of presets) {
      if (!(p == null ? void 0 : p.id) || !selected.has(p.id)) continue;
      const name = ((_i = p.name) != null ? _i : "").trim();
      const unit = ((_j = p.timeUnit) != null ? _j : "").trim();
      if (!name || !unit) continue;
      if (!Number.isFinite(p.timeValue) || p.timeValue <= 0) continue;
      const refMeters = this.travelDistanceToMeters(
        p.distanceValue,
        p.distanceUnit,
        p.distanceCustomUnitId
      );
      if (!refMeters) continue;
      const t = distanceMeters / refMeters * p.timeValue;
      out.push(`Time (${name}): ${this.formatTravelTimeNumber(t)} ${unit}`);
      if (!showDays) continue;
      if (perDaySel.note) out.push(`Travel days: ${perDaySel.note}`);
      if (!perDayValue || !perDayUnit) {
        out.push("Travel days: not configured (set per-day unit/value in settings)");
        continue;
      }
      const presetUnitNorm = unit.trim().toLowerCase();
      const perDayUnitNorm = perDayUnit.trim().toLowerCase();
      if (presetUnitNorm !== perDayUnitNorm) {
        out.push(`Travel days: unit mismatch (preset: ${unit}, max: ${perDayUnit})`);
        continue;
      }
      const total = t;
      const fullDays = Math.floor(total / perDayValue);
      const rest = total - fullDays * perDayValue;
      const restAbs = Math.abs(rest);
      const label = perDayName ? ` (${perDayName})` : "";
      if (restAbs < 1e-6) {
        out.push(`Travel days${label} (${perDayValue} ${perDayUnit}/day): ${fullDays}d`);
      } else if (fullDays <= 0) {
        out.push(
          `Travel days${label} (${perDayValue} ${perDayUnit}/day): 0d + ${this.formatTravelTimeNumber(rest)} ${unit}`
        );
      } else {
        out.push(
          `Travel days${label} (${perDayValue} ${perDayUnit}/day): ${fullDays}d + ${this.formatTravelTimeNumber(rest)} ${unit}`
        );
      }
    }
    return out;
  }
  computeTravelTimeLinesBySegments(segments) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const selected = new Set((_c = (_b = (_a = this.data) == null ? void 0 : _a.measurement) == null ? void 0 : _b.travelTimePresetIds) != null ? _c : []);
    if (selected.size === 0) return [];
    const presets = this.plugin.getActiveTravelTimePresets();
    const out = [];
    const perDaySel = this.getSelectedTravelPerDayPreset();
    const perDayPreset = perDaySel.preset;
    const perDayValue = (_d = perDayPreset == null ? void 0 : perDayPreset.value) != null ? _d : null;
    const perDayUnit = ((_e = perDayPreset == null ? void 0 : perDayPreset.unit) != null ? _e : "").trim();
    const perDayName = ((_f = perDayPreset == null ? void 0 : perDayPreset.name) != null ? _f : "").trim();
    const showDays = !!((_h = (_g = this.data) == null ? void 0 : _g.measurement) == null ? void 0 : _h.travelDaysEnabled);
    for (const p of presets) {
      if (!(p == null ? void 0 : p.id) || !selected.has(p.id)) continue;
      const name = ((_i = p.name) != null ? _i : "").trim();
      const unit = ((_j = p.timeUnit) != null ? _j : "").trim();
      if (!name || !unit) continue;
      if (!Number.isFinite(p.timeValue) || p.timeValue <= 0) continue;
      const refMeters = this.travelDistanceToMeters(
        p.distanceValue,
        p.distanceUnit,
        p.distanceCustomUnitId
      );
      if (!refMeters) continue;
      let t = 0;
      for (const seg of segments) {
        const f = this.terrainFactor(seg.terrainId);
        t += seg.meters / refMeters * p.timeValue / (f > 0 ? f : 1);
      }
      out.push(`Time (${name}): ${this.formatTravelTimeNumber(t)} ${unit}`);
      if (!showDays) continue;
      if (perDaySel.note) out.push(`Travel days: ${perDaySel.note}`);
      if (!perDayValue || !perDayUnit) {
        out.push("Travel days: not configured (set per-day unit/value in settings)");
        continue;
      }
      const presetUnitNorm = unit.trim().toLowerCase();
      const perDayUnitNorm = perDayUnit.trim().toLowerCase();
      if (presetUnitNorm !== perDayUnitNorm) {
        out.push(`Travel days: unit mismatch (preset: ${unit}, max: ${perDayUnit})`);
        continue;
      }
      const total = t;
      const fullDays = Math.floor(total / perDayValue);
      const rest = total - fullDays * perDayValue;
      const restAbs = Math.abs(rest);
      const label = perDayName ? ` (${perDayName})` : "";
      if (restAbs < 1e-6) {
        out.push(`Travel days${label} (${perDayValue} ${perDayUnit}/day): ${fullDays}d`);
      } else if (fullDays <= 0) {
        out.push(
          `Travel days${label} (${perDayValue} ${perDayUnit}/day): 0d + ${this.formatTravelTimeNumber(rest)} ${unit}`
        );
      } else {
        out.push(
          `Travel days${label} (${perDayValue} ${perDayUnit}/day): ${fullDays}d + ${this.formatTravelTimeNumber(rest)} ${unit}`
        );
      }
    }
    return out;
  }
  resolveTFile(pathOrWiki, from) {
    const byPath = this.app.vault.getAbstractFileByPath(pathOrWiki);
    if (byPath instanceof import_obsidian21.TFile) return byPath;
    const dest = this.app.metadataCache.getFirstLinkpathDest(pathOrWiki, from);
    return dest instanceof import_obsidian21.TFile ? dest : null;
  }
  resolveResourceUrl(pathOrData) {
    if (!pathOrData) return "";
    if (pathOrData.startsWith("data:")) return pathOrData;
    const f = this.resolveTFile(pathOrData, this.cfg.sourcePath);
    if (f) return this.app.vault.getResourcePath(f);
    return pathOrData;
  }
  onResize() {
    if (!this.ready || !this.data) return;
    const oldRect = this.viewportEl.getBoundingClientRect();
    const oldVw = oldRect.width || this.vw || 0;
    const oldVh = oldRect.height || this.vh || 0;
    if (oldVw >= 2 && oldVh >= 2) {
      this.captureViewIfVisible();
    }
    this.applyViewportInset();
    const r = this.viewportEl.getBoundingClientRect();
    const newVw = r.width || 0;
    const newVh = r.height || 0;
    this.vw = newVw;
    this.vh = newVh;
    if (newVw < 2 || newVh < 2) {
      return;
    }
    this.updateHudPinsForResize(r);
    if (this.cfg.responsive) {
      this.fitToView();
      if (this.isCanvas()) this.renderCanvas();
      this.renderMarkersOnly();
      this.renderDrawingEditHandles();
      return;
    }
    if (oldVw < 2 || oldVh < 2) {
      if (!this.initialViewApplied) {
        if (this.cfg.initialViewRect) {
          this.applyInitialViewRect(this.cfg.initialViewRect);
        } else if (this.cfg.initialZoom && this.cfg.initialCenter) {
          this.applyInitialView(this.cfg.initialZoom, this.cfg.initialCenter);
        } else {
          this.fitToView();
        }
        this.initialViewApplied = true;
      } else if (this.lastGoodView) {
        this.applyInitialView(this.lastGoodView.scale, this.lastGoodView.center);
      } else {
        this.applyTransform(this.scale, this.tx, this.ty);
      }
      if (this.isCanvas()) this.renderCanvas();
      this.renderMarkersOnly();
      this.renderDrawingEditHandles();
      return;
    }
    const worldCx = (oldVw / 2 - this.tx) / this.scale;
    const worldCy = (oldVh / 2 - this.ty) / this.scale;
    const txNew = this.vw / 2 - worldCx * this.scale;
    const tyNew = this.vh / 2 - worldCy * this.scale;
    this.applyTransform(this.scale, txNew, tyNew, true);
    this.renderMarkersOnly();
    this.renderDrawingEditHandles();
    if (this.shouldUseSavedFrame() && this.cfg.resizable && this.cfg.resizeHandle === "native" && !this.userResizing) {
      if (!this.initialLayoutDone) this.initialLayoutDone = true;
      else if (this.isFrameVisibleEnough()) this.requestPersistFrame();
    }
  }
  onWheel(e) {
    var _a;
    if (!this.ready) return;
    const factor = (_a = this.plugin.settings.wheelZoomFactor) != null ? _a : 1.1;
    const step = Math.pow(factor, e.deltaY < 0 ? 1 : -1);
    const vpRect = this.viewportEl.getBoundingClientRect();
    const cx = clamp(e.clientX - vpRect.left, 0, this.vw);
    const cy = clamp(e.clientY - vpRect.top, 0, this.vh);
    this.zoomAt(cx, cy, step);
  }
  panButtonMatches(e) {
    var _a;
    const want = (_a = this.plugin.settings.panMouseButton) != null ? _a : "left";
    if (want === "middle") return e.button === 1;
    if (want === "right") return e.button === 2;
    return e.button === 0;
  }
  onPointerDownViewport(e) {
    var _a;
    if (!this.ready) return;
    if (this.gridAlignId) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (this.textMode === "draw-box") {
      if (e.button !== 0) return;
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      this.textDrawStart = { x: clamp(wx / this.imgW, 0, 1), y: clamp(wy / this.imgH, 0, 1) };
      this.textDrawPreview = this.textDrawStart;
      this.renderTextDraft();
      return;
    }
    this.plugin.setActiveMap(this);
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const captureTarget = this.asElement(e.target);
    (_a = captureTarget == null ? void 0 : captureTarget.setPointerCapture) == null ? void 0 : _a.call(captureTarget, e.pointerId);
    const tgt = this.asElement(e.target);
    if (tgt == null ? void 0 : tgt.closest(".zm-marker")) return;
    if (this.cfg.responsive) return;
    if (this.activePointers.size === 2) {
      this.startPinch();
      return;
    }
    if (this.drawingMode) {
      return;
    }
    if (this.pinchActive) return;
    if (!this.panButtonMatches(e)) return;
    this.draggingView = true;
    this.draggingViewButton = e.button;
    this.lastPos = { x: e.clientX, y: e.clientY };
    this.viewDragDist = 0;
    this.viewDragMoved = false;
  }
  onPointerMove(e) {
    var _a, _b, _c;
    if (!this.ready) return;
    if (this.gridAlignId) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      this.gridAlignPreview = { x: clamp(wx, 0, this.imgW), y: clamp(wy, 0, this.imgH) };
      this.renderGrids();
      return;
    }
    if (this.textMoveDragging) {
      e.preventDefault();
      e.stopPropagation();
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      const p = { x: clamp(wx / this.imgW, 0, 1), y: clamp(wy / this.imgH, 0, 1) };
      this.updateTextBoxMove(p);
      return;
    }
    if (this.drawEditPointerId !== null && e.pointerId === this.drawEditPointerId) {
      e.preventDefault();
      e.stopPropagation();
      this.updateEditedDrawingHandleFromClient(e.clientX, e.clientY);
      return;
    }
    if (this.drawEditDrawingId) {
      this.renderDrawingEditHandles();
    }
    if (e.pointerType === "touch") {
      if (this.draggingView || this.pinchActive) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    if (this.textMode === "draw-box" && this.textDrawStart) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      this.textDrawPreview = { x: clamp(wx / this.imgW, 0, 1), y: clamp(wy / this.imgH, 0, 1) };
      this.renderTextDraft();
      return;
    }
    if (this.textMode === "draw-lines" && this.textLineStart) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      this.textLinePreview = { x: clamp(wx / this.imgW, 0, 1), y: clamp(wy / this.imgH, 0, 1) };
      this.renderTextDraft();
      return;
    }
    if (this.updateDrawPreview(e)) {
      return;
    }
    if (this.activePointers.has(e.pointerId)) {
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    if (this.pinchActive) {
      this.updatePinch();
      return;
    }
    if (this.draggingMarkerId && this.data) {
      const m = this.data.markers.find((mm) => mm.id === this.draggingMarkerId);
      if (!m) return;
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const off = (_a = this.dragAnchorOffset) != null ? _a : { dx: 0, dy: 0 };
      if (m.anchorSpace === "viewport") {
        const vw = vpRect.width || 1;
        const vh = vpRect.height || 1;
        const leftScreen = vx - off.dx;
        const topScreen = vy - off.dy;
        const prevX = (_b = m.hudX) != null ? _b : leftScreen;
        const prevY = (_c = m.hudY) != null ? _c : topScreen;
        m.hudX = leftScreen;
        m.hudY = topScreen;
        m.hudLastWidth = vw;
        m.hudLastHeight = vh;
        m.x = vw > 0 ? leftScreen / vw : 0;
        m.y = vh > 0 ? topScreen / vh : 0;
        const movedEnough = Math.hypot(leftScreen - prevX, topScreen - prevY) > 1;
        if (movedEnough) this.dragMoved = true;
      } else {
        const wx = (vx - this.tx) / this.scale;
        const wy = (vy - this.ty) / this.scale;
        const nx = clamp((wx - off.dx) / this.imgW, 0, 1);
        const ny = clamp((wy - off.dy) / this.imgH, 0, 1);
        const movedEnough = Math.hypot(
          (nx - m.x) * this.imgW,
          (ny - m.y) * this.imgH
        ) > 1;
        if (movedEnough) this.dragMoved = true;
        m.x = nx;
        m.y = ny;
      }
      this.renderMarkersOnly();
      return;
    }
    if (this.measuring) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      this.measurePreview = {
        x: clamp(wx / this.imgW, 0, 1),
        y: clamp(wy / this.imgH, 0, 1)
      };
      this.renderMeasure();
    }
    if (this.calibrating && this.calibPts.length === 1) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      this.calibPreview = {
        x: clamp(wx / this.imgW, 0, 1),
        y: clamp(wy / this.imgH, 0, 1)
      };
      this.renderCalibrate();
    }
    if (!this.draggingView) return;
    const dx = e.clientX - this.lastPos.x;
    const dy = e.clientY - this.lastPos.y;
    this.viewDragDist += Math.hypot(dx, dy);
    if (this.viewDragDist > 4) this.viewDragMoved = true;
    if (this.draggingViewButton === 2 && this.viewDragMoved) {
      this.suppressContextMenuOnce = true;
    }
    this.lastPos = { x: e.clientX, y: e.clientY };
    this.panAccDx += dx;
    this.panAccDy += dy;
    this.requestPanFrame();
  }
  onPointerUp(e) {
    var _a;
    if (this.drawEditPointerId !== null && (!e || e.pointerId === this.drawEditPointerId)) {
      this.drawEditPointerId = null;
      this.drawEditPointIndex = null;
      void this.saveDataSoon();
      this.renderDrawings();
      this.renderDrawingEditHandles();
      return;
    }
    if (this.textMoveDragging) {
      this.finishTextBoxMove(true);
      return;
    }
    if (this.textMode === "draw-box" && this.textDrawStart && this.textDrawPreview) {
      this.finishDrawNewTextBox();
      return;
    }
    if (e) {
      this.handleTouchTapOnPointerUp(e);
    }
    if (this.draggingMarkerId) {
      const draggedId = this.draggingMarkerId;
      const wasMoved = this.dragMoved;
      if (wasMoved && this.data) {
        const m = this.data.markers.find((mm) => mm.id === draggedId);
        if (m && m.anchorSpace === "viewport") {
          const vpRect = this.viewportEl.getBoundingClientRect();
          this.classifyHudMetaFromCurrentPosition(m, vpRect);
        }
        this.suppressClickMarkerId = draggedId;
        window.setTimeout(() => {
          this.suppressClickMarkerId = null;
        }, 0);
        void this.saveDataSoon();
        this.schedulePingUpdate();
      }
      const host = (_a = this.markersEl.querySelector(`.zm-marker[data-id="${draggedId}"]`)) != null ? _a : this.hudMarkersEl.querySelector(`.zm-marker[data-id="${draggedId}"]`);
      if (host) host.classList.remove("zm-marker--dragging");
    }
    this.draggingMarkerId = null;
    this.dragAnchorOffset = null;
    this.dragMoved = false;
    this.getOwnerBody().classList.remove("zm-cursor-grabbing");
    this.draggingView = false;
    this.draggingViewButton = null;
    this.panAccDx = 0;
    this.panAccDy = 0;
    if (this.panRAF != null) {
      cancelAnimationFrame(this.panRAF);
      this.panRAF = null;
    }
    if (this.viewDragMoved) {
      this.suppressTextClickOnce = true;
      window.setTimeout(() => {
        this.suppressTextClickOnce = false;
      }, 0);
    }
    this.viewDragMoved = false;
    this.viewDragDist = 0;
  }
  startPinch() {
    const pts = this.getTwoPointers();
    if (!pts) return;
    this.pinchActive = true;
    this.pinchStartScale = this.scale;
    this.pinchPrevCenter = this.mid(pts[0], pts[1]);
    this.pinchStartDist = this.dist(pts[0], pts[1]);
    this.resetTouchDoubleTapState();
    this.draggingView = false;
    this.draggingMarkerId = null;
    this.measuring = false;
    this.calibrating = false;
  }
  updatePinch() {
    const pts = this.getTwoPointers();
    if (!pts || !this.pinchActive) return;
    const center = this.mid(pts[0], pts[1]);
    const curDist = this.dist(pts[0], pts[1]);
    if (this.pinchStartDist <= 0) return;
    const targetScale = clamp(this.pinchStartScale * (curDist / this.pinchStartDist), this.cfg.minZoom, this.cfg.maxZoom);
    const vpRect = this.viewportEl.getBoundingClientRect();
    const cx = clamp(center.x - vpRect.left, 0, this.vw);
    const cy = clamp(center.y - vpRect.top, 0, this.vh);
    const factor = targetScale / this.scale;
    if (Math.abs(factor - 1) > 1e-3) this.zoomAt(cx, cy, factor);
    if (this.pinchPrevCenter) {
      const dx = center.x - this.pinchPrevCenter.x;
      const dy = center.y - this.pinchPrevCenter.y;
      if (Math.abs(dx) + Math.abs(dy) > 0.5) this.panBy(dx, dy);
    }
    this.pinchPrevCenter = center;
  }
  endPinch() {
    this.pinchActive = false;
    this.pinchPrevCenter = null;
    this.pinchStartDist = 0;
  }
  getTwoPointers() {
    if (this.activePointers.size !== 2) return null;
    const it = Array.from(this.activePointers.values());
    return [it[0], it[1]];
  }
  dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  mid(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }
  canUseNativeTouchCapture() {
    if (!this.ready) return false;
    if (this.cfg.responsive) return false;
    return true;
  }
  resetNativeTouchCapture() {
    this.touchGestureCandidate = false;
    this.touchGestureLocked = false;
    this.touchGestureStartX = 0;
    this.touchGestureStartY = 0;
  }
  shouldIgnoreNativeTouchCapture(target) {
    const el = target instanceof Element ? target : null;
    if (!el) return false;
    return !!el.closest(
      [
        ".popover",
        ".hover-popover",
        ".zm-menu",
        ".zm-submenu",
        ".zm-tooltip",
        ".suggestion-container",
        ".modal",
        "input",
        "textarea",
        "select",
        "button",
        ".zm-text-input"
      ].join(", ")
    );
  }
  resetTouchDoubleTapState() {
    this.lastTouchTapTs = 0;
    this.lastTouchTapClient = null;
  }
  handleTouchTapOnPointerUp(e) {
    if (e.pointerType !== "touch") return;
    const target = e.target;
    if (!(target instanceof Element)) {
      this.resetTouchDoubleTapState();
      return;
    }
    const targetEl = target;
    if (!targetEl || !this.viewportEl.contains(targetEl)) {
      this.resetTouchDoubleTapState();
      return;
    }
    if (targetEl.closest(".zm-marker") || targetEl.closest(".popover") || targetEl.closest(".hover-popover") || targetEl.closest(".zm-menu") || targetEl.closest(".zm-submenu") || targetEl.closest(".zm-tooltip")) {
      this.resetTouchDoubleTapState();
      return;
    }
    if (this.draggingMarkerId || this.viewDragMoved || this.pinchActive || this.calibrating || this.drawingMode || this.textMode === "draw-box" || this.textMode === "draw-lines" || this.textMode === "move") {
      this.resetTouchDoubleTapState();
      return;
    }
    const now = Date.now();
    const prev = this.lastTouchTapClient;
    const isDoubleTap = !!prev && now - this.lastTouchTapTs <= this.touchDoubleTapMs && Math.hypot(prev.x - e.clientX, prev.y - e.clientY) <= this.touchDoubleTapDistPx;
    if (!isDoubleTap) {
      this.lastTouchTapTs = now;
      this.lastTouchTapClient = { x: e.clientX, y: e.clientY };
      return;
    }
    this.resetTouchDoubleTapState();
    this.handleTouchDoubleTapAction(e.clientX, e.clientY);
  }
  handleTouchDoubleTapAction(clientX, clientY) {
    if (!this.ready) return;
    if (this.measuring) {
      this.measuring = false;
      this.clearMeasure();
      this.updateMeasureHud();
      new import_obsidian21.Notice("Measurement cleared.", 1200);
      return;
    }
    if (this.cfg.displayOnly) return;
    if (this.textMode === "edit") return;
    const vpRect = this.viewportEl.getBoundingClientRect();
    const vx = clientX - vpRect.left;
    const vy = clientY - vpRect.top;
    const wx = (vx - this.tx) / this.scale;
    const wy = (vy - this.ty) / this.scale;
    const nx = clamp(wx / this.imgW, 0, 1);
    const ny = clamp(wy / this.imgH, 0, 1);
    this.addMarkerInteractive(nx, ny);
  }
  onDblClickViewport(e) {
    if (!this.ready) return;
    if (this.gridAlignId) {
      return;
    }
    if ((this.drawingMode === "polygon" || this.drawingMode === "polyline") && this.drawPolygonPoints.length >= 2) {
      if (this.drawingMode === "polyline") this.finishPolylineDrawing();
      else this.finishPolygonDrawing();
      return;
    }
    if (this.measuring) {
      this.measuring = false;
      this.measurePreview = null;
      this.updateMeasureHud();
      return;
    }
    if (e.target instanceof HTMLElement && e.target.closest(".zm-marker")) return;
    const vpRect = this.viewportEl.getBoundingClientRect();
    const cx = e.clientX - vpRect.left;
    const cy = e.clientY - vpRect.top;
    this.zoomAt(cx, cy, 1.5);
  }
  onClickViewport(e) {
    var _a;
    if (!this.ready) return;
    if (this.gridAlignId) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      this.gridAlignPreview = {
        x: clamp(wx, 0, this.imgW),
        y: clamp(wy, 0, this.imgH)
      };
      this.stopGridAlignMode(true);
      return;
    }
    if (this.handleDrawClick(e)) {
      return;
    }
    if (this.calibrating) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      const p = {
        x: clamp(wx / this.imgW, 0, 1),
        y: clamp(wy / this.imgH, 0, 1)
      };
      this.calibPts.push(p);
      if (this.calibPts.length === 2) {
        const pxDist = Math.hypot(
          (this.calibPts[1].x - this.calibPts[0].x) * this.imgW,
          (this.calibPts[1].y - this.calibPts[0].y) * this.imgH
        );
        const meas = (_a = this.data) == null ? void 0 : _a.measurement;
        const customDefs = this.plugin.getActiveCustomUnits();
        let initialUnit = "km";
        if ((meas == null ? void 0 : meas.displayUnit) === "custom" && typeof meas.customUnitId === "string" && meas.customUnitId.trim()) {
          initialUnit = `custom:${meas.customUnitId}`;
        } else if ((meas == null ? void 0 : meas.displayUnit) === "m" || (meas == null ? void 0 : meas.displayUnit) === "km" || (meas == null ? void 0 : meas.displayUnit) === "mi" || (meas == null ? void 0 : meas.displayUnit) === "ft") {
          initialUnit = meas.displayUnit;
        }
        new ScaleCalibrateModal(
          this.app,
          pxDist,
          (result) => {
            void (async () => {
              var _a2, _b, _c;
              if (typeof result.metersPerPixel === "number") {
                await this.applyScaleCalibration(result.metersPerPixel);
                this.ensureMeasurement();
                if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
                  if (result.unit === "m" || result.unit === "km" || result.unit === "mi" || result.unit === "ft") {
                    this.data.measurement.displayUnit = result.unit;
                    delete this.data.measurement.customUnitId;
                    await this.saveDataSoon();
                  }
                }
                new import_obsidian21.Notice(`Scale set: ${result.metersPerPixel.toFixed(6)} m/px`, 2e3);
              } else if (result.customUnitId && typeof result.pixelsPerUnit === "number") {
                await this.applyCustomUnitCalibration(result.customUnitId, result.pixelsPerUnit);
                const defs = this.plugin.getActiveCustomUnits();
                const def = defs.find((d) => d.id === result.customUnitId);
                const label = ((_c = (_b = def == null ? void 0 : def.abbreviation) != null ? _b : def == null ? void 0 : def.name) != null ? _c : result.customUnitId).trim();
                new import_obsidian21.Notice(`Unit scale set: ${result.pixelsPerUnit.toFixed(3)} px/${label}`, 2500);
              }
              this.updateMeasureHud();
            })();
            this.calibrating = false;
            this.calibPts = [];
            this.calibPreview = null;
            this.renderCalibrate();
          },
          {
            initialUnit,
            customUnits: customDefs.map((u) => ({ id: u.id, name: u.name, abbreviation: u.abbreviation }))
          }
        ).open();
      }
      this.renderCalibrate();
      return;
    }
    if (this.measuring) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      const p = {
        x: clamp(wx / this.imgW, 0, 1),
        y: clamp(wy / this.imgH, 0, 1)
      };
      this.measurePts.push(p);
      this.renderMeasure();
      return;
    }
    if (this.cfg.displayOnly) return;
    if (e.shiftKey) {
      const vpRect = this.viewportEl.getBoundingClientRect();
      const vx = e.clientX - vpRect.left;
      const vy = e.clientY - vpRect.top;
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      const nx = clamp(wx / this.imgW, 0, 1);
      const ny = clamp(wy / this.imgH, 0, 1);
      this.addMarkerInteractive(nx, ny);
    }
  }
  getLayerById(id) {
    var _a;
    return (_a = this.data) == null ? void 0 : _a.layers.find((l) => l.id === id);
  }
  getPreferredNewMarkerLayerId() {
    var _a, _b, _c, _d, _e, _f;
    if (!this.data || !this.data.layers || this.data.layers.length === 0) {
      return "default";
    }
    const prefer = !!this.plugin.settings.preferActiveLayerInEditor;
    if (prefer) {
      return (_d = (_c = (_a = this.data.layers.find((l) => l.visible && !l.locked)) == null ? void 0 : _a.id) != null ? _c : (_b = this.data.layers.find((l) => l.visible)) == null ? void 0 : _b.id) != null ? _d : this.data.layers[0].id;
    }
    return (_f = (_e = this.data.layers.find((l) => l.visible)) == null ? void 0 : _e.id) != null ? _f : this.data.layers[0].id;
  }
  getLayerState(layer) {
    if (!layer.visible) return "hidden";
    return layer.locked ? "locked" : "visible";
  }
  advanceLayerState(layer) {
    const cur = this.getLayerState(layer);
    let next;
    if (cur === "hidden") {
      layer.visible = true;
      layer.locked = false;
      next = "visible";
    } else if (cur === "visible") {
      layer.visible = true;
      layer.locked = true;
      next = "locked";
    } else {
      layer.visible = false;
      layer.locked = false;
      next = "hidden";
    }
    return next;
  }
  isLayerLocked(layerId) {
    const l = this.getLayerById(layerId);
    return !!(l && l.visible && l.locked);
  }
  async applyBoundBaseVisibility() {
    var _a;
    if (!this.data) return;
    const active = this.getActiveBasePath();
    let changed = false;
    for (const l of this.data.layers) {
      if (!l.boundBase) continue;
      const want = l.boundBase === active;
      if (l.visible !== want) {
        l.visible = want;
        changed = true;
      }
    }
    for (const dl of (_a = this.data.drawLayers) != null ? _a : []) {
      if (!dl.boundBase) continue;
      const want = dl.boundBase === active;
      if (dl.visible !== want) {
        dl.visible = want;
        changed = true;
      }
    }
    if (changed) {
      this.renderMarkersOnly();
      this.renderDrawings();
      this.renderTextLayers();
      await this.saveDataSoon();
    }
  }
  /* ===== Collections helpers ===== */
  getActiveBasePath() {
    var _a, _b, _c;
    if (!this.data) return this.cfg.imagePath;
    return (_c = (_b = this.data.activeBase) != null ? _b : (_a = this.getBasesNormalized()[0]) == null ? void 0 : _a.path) != null ? _c : this.cfg.imagePath;
  }
  getCollectionsSplitForActive() {
    var _a;
    const all = ((_a = this.plugin.settings.baseCollections) != null ? _a : []).filter(Boolean);
    const active = this.getActiveBasePath();
    const matches = (c) => {
      var _a2, _b;
      return ((_b = (_a2 = c.bindings) == null ? void 0 : _a2.basePaths) != null ? _b : []).some((p) => p === active);
    };
    const isGlobal = (c) => {
      var _a2, _b;
      return !c.bindings || ((_b = (_a2 = c.bindings.basePaths) == null ? void 0 : _a2.length) != null ? _b : 0) === 0;
    };
    const matched = all.filter(matches);
    const globals = all.filter(isGlobal);
    return { matched, globals };
  }
  computeCollectionSets() {
    const { matched, globals } = this.getCollectionsSplitForActive();
    const pinsBase = [...new Set(matched.flatMap((c) => {
      var _a, _b;
      return (_b = (_a = c.include) == null ? void 0 : _a.pinKeys) != null ? _b : [];
    }))];
    const favsBase = [];
    matched.forEach(
      (c) => {
        var _a, _b;
        return ((_b = (_a = c.include) == null ? void 0 : _a.favorites) != null ? _b : []).forEach((f) => favsBase.push(f));
      }
    );
    const stickersBase = [];
    matched.forEach(
      (c) => {
        var _a, _b;
        return ((_b = (_a = c.include) == null ? void 0 : _a.stickers) != null ? _b : []).forEach((s) => stickersBase.push(s));
      }
    );
    const pinsGlobal = [...new Set(globals.flatMap((c) => {
      var _a, _b;
      return (_b = (_a = c.include) == null ? void 0 : _a.pinKeys) != null ? _b : [];
    }))];
    const favsGlobal = [];
    globals.forEach(
      (c) => {
        var _a, _b;
        return ((_b = (_a = c.include) == null ? void 0 : _a.favorites) != null ? _b : []).forEach((f) => favsGlobal.push(f));
      }
    );
    const stickersGlobal = [];
    globals.forEach(
      (c) => {
        var _a, _b;
        return ((_b = (_a = c.include) == null ? void 0 : _a.stickers) != null ? _b : []).forEach((s) => stickersGlobal.push(s));
      }
    );
    const swapBase = [];
    matched.forEach(
      (c) => {
        var _a, _b;
        return ((_b = (_a = c.include) == null ? void 0 : _a.swapPins) != null ? _b : []).forEach((sp) => swapBase.push(sp));
      }
    );
    const swapGlobal = [];
    globals.forEach(
      (c) => {
        var _a, _b;
        return ((_b = (_a = c.include) == null ? void 0 : _a.swapPins) != null ? _b : []).forEach((sp) => swapGlobal.push(sp));
      }
    );
    const pingBase = [];
    matched.forEach(
      (c) => {
        var _a, _b;
        return ((_b = (_a = c.include) == null ? void 0 : _a.pingPins) != null ? _b : []).forEach((pp) => pingBase.push(pp));
      }
    );
    const pingGlobal = [];
    globals.forEach(
      (c) => {
        var _a, _b;
        return ((_b = (_a = c.include) == null ? void 0 : _a.pingPins) != null ? _b : []).forEach((pp) => pingGlobal.push(pp));
      }
    );
    return {
      pinsBase,
      pinsGlobal,
      favsBase,
      favsGlobal,
      stickersBase,
      stickersGlobal,
      swapBase,
      swapGlobal,
      pingBase,
      pingGlobal
    };
  }
  findSwapPresetById(id) {
    var _a, _b, _c;
    const cols = (_a = this.plugin.settings.baseCollections) != null ? _a : [];
    for (const col of cols) {
      const list = (_c = (_b = col.include) == null ? void 0 : _b.swapPins) != null ? _c : [];
      const found = list.find((sp) => sp.id === id);
      if (found) return found;
    }
    return void 0;
  }
  findPingPresetById(id) {
    var _a, _b, _c;
    const cols = (_a = this.plugin.settings.baseCollections) != null ? _a : [];
    for (const col of cols) {
      const list = (_c = (_b = col.include) == null ? void 0 : _b.pingPins) != null ? _c : [];
      const found = list.find((pp) => pp.id === id);
      if (found) return found;
    }
    return void 0;
  }
  getSwapFrameForMarker(m) {
    if (m.type !== "swap" || !m.swapKey) return null;
    const preset = this.findSwapPresetById(m.swapKey);
    if (!preset || !preset.frames.length) return null;
    const rawIndex = typeof m.swapIndex === "number" ? m.swapIndex : 0;
    const count = preset.frames.length;
    const idx = (rawIndex % count + count) % count;
    return preset.frames[idx];
  }
  worldNormToViewportPx(nx, ny) {
    return {
      x: this.tx + nx * this.imgW * this.scale,
      y: this.ty + ny * this.imgH * this.scale
    };
  }
  viewportPxToWorldNorm(hx, hy) {
    return {
      x: clamp((hx - this.tx) / this.scale / this.imgW, 0, 1),
      y: clamp((hy - this.ty) / this.scale / this.imgH, 0, 1)
    };
  }
  getPingPresetsSplitForActive() {
    const { pingBase, pingGlobal } = this.computeCollectionSets();
    return { pingBase, pingGlobal };
  }
  getSwapEffectiveLink(m) {
    var _a, _b, _c;
    if (m.type !== "swap") return m.link;
    if (!m.swapKey) return m.link;
    const preset = this.findSwapPresetById(m.swapKey);
    if (!preset || !preset.frames.length) return m.link;
    const rawIndex = typeof m.swapIndex === "number" ? m.swapIndex : 0;
    const count = preset.frames.length;
    const idx = (rawIndex % count + count) % count;
    const override = (_a = m.swapLinks) == null ? void 0 : _a[idx];
    if (typeof override === "string" && override.trim()) return override.trim();
    const frame = preset.frames[idx];
    const presetLink = ((_b = frame == null ? void 0 : frame.link) != null ? _b : "").trim();
    if (presetLink) return presetLink;
    const iconKey = ((_c = frame == null ? void 0 : frame.iconKey) != null ? _c : "").trim();
    if (iconKey) return this.plugin.getIconDefaultLink(iconKey);
    return m.link;
  }
  advanceSwapPin(m) {
    if (m.type !== "swap" || !m.swapKey) return;
    const preset = this.findSwapPresetById(m.swapKey);
    if (!preset || !preset.frames.length) return;
    const rawIndex = typeof m.swapIndex === "number" ? m.swapIndex : 0;
    const next = rawIndex + 1;
    const count = preset.frames.length;
    m.swapIndex = (next % count + count) % count;
  }
  addSwapPinHere(preset, vx, vy) {
    if (!this.data) return;
    let layerId = this.getPreferredNewMarkerLayerId();
    if (preset.layerName) {
      const found = this.data.layers.find((l) => l.name === preset.layerName);
      if (found) layerId = found.id;
      else {
        const id = generateId("layer");
        this.data.layers.push({ id, name: preset.layerName, visible: true, locked: false });
        layerId = id;
      }
    }
    const isHud = !!preset.defaultHud;
    const scaleLike = !!preset.defaultScaleLikeSticker;
    const marker = {
      id: generateId("marker"),
      type: "swap",
      layer: layerId,
      x: 0,
      y: 0,
      swapKey: preset.id,
      swapIndex: 0
    };
    if (isHud) {
      marker.anchorSpace = "viewport";
      marker.hudX = vx;
      marker.hudY = vy;
      this.classifyHudMetaFromCurrentPosition(
        marker,
        this.viewportEl.getBoundingClientRect()
      );
    } else {
      const wx = (vx - this.tx) / this.scale;
      const wy = (vy - this.ty) / this.scale;
      marker.x = clamp(wx / this.imgW, 0, 1);
      marker.y = clamp(wy / this.imgH, 0, 1);
    }
    if (scaleLike) marker.scaleLikeSticker = true;
    this.data.markers.push(marker);
    void this.saveDataSoon();
    this.renderMarkersOnly();
    new import_obsidian21.Notice("Swap pin added.", 900);
  }
  async rollDiceMarker(m) {
    var _a;
    if (!this.data) return;
    if (m.type !== "dice") return;
    const rolls = (_a = m.diceRolls) != null ? _a : [{ count: 1, sides: 20 }];
    const formula = diceRollsToFormula(rolls);
    const want3d = !!m.diceRender3d;
    const w = window;
    const api = w.DiceRoller;
    if (want3d) {
      const ws = this.app.workspace;
      if (ws && typeof ws.trigger === "function") {
        try {
          ws.trigger("dice-roller:render-dice", `${formula}|render`);
          return;
        } catch (e) {
        }
      }
    }
    if (api && typeof api.parseDice === "function") {
      try {
        const res = await api.parseDice(formula, this.cfg.sourcePath);
        new import_obsidian21.Notice(`Roll: ${formula}
Result: ${formatDiceApiResult(res == null ? void 0 : res.result)}`.trim(), 5e3);
        return;
      } catch (e) {
      }
    }
    const local = localRollDice(rolls);
    new import_obsidian21.Notice(`Roll: ${formula}
${local.details}
Total: ${local.total}`, 6e3);
  }
  addDicePinHere(nx, ny, vx, vy) {
    if (!this.data) return;
    const iconKey = this.plugin.settings.defaultIconKey;
    const layerId = this.getPreferredNewMarkerLayerId();
    new DicePinModal(
      this.app,
      this.plugin,
      {
        iconKey,
        rolls: [{ count: 1, sides: 20 }],
        render3d: false,
        scaleLikeSticker: !!this.plugin.settings.defaultScaleLikeSticker,
        placeAsHudPin: false
      },
      (res) => {
        if (!this.data) return;
        if (res.action !== "save") return;
        const marker = {
          id: generateId("dice"),
          type: "dice",
          x: nx,
          y: ny,
          layer: layerId,
          iconKey: res.value.iconKey,
          diceRolls: res.value.rolls,
          diceRender3d: res.value.render3d ? true : void 0,
          scaleLikeSticker: res.value.scaleLikeSticker ? true : void 0,
          tooltip: diceRollsToFormula(res.value.rolls)
        };
        if (res.value.placeAsHudPin && typeof vx === "number" && typeof vy === "number") {
          marker.anchorSpace = "viewport";
          marker.hudX = vx;
          marker.hudY = vy;
          this.classifyHudMetaFromCurrentPosition(
            marker,
            this.viewportEl.getBoundingClientRect()
          );
        }
        this.data.markers.push(marker);
        void this.saveDataSoon();
        this.renderMarkersOnly();
        new import_obsidian21.Notice("Dice pin added.", 900);
      }
    ).open();
  }
  getPreferredTextLayer() {
    var _a, _b;
    if (!this.data) return null;
    const activeBase = this.getActiveBasePath();
    const current = this.getTextLayerById(this.activeTextLayerId);
    if (current && this.isTextLayerVisible(current) && (!current.boundBase || current.boundBase === activeBase)) {
      return current;
    }
    return (_b = ((_a = this.data.textLayers) != null ? _a : []).find((l) => this.isTextLayerVisible(l) && (!l.boundBase || l.boundBase === activeBase))) != null ? _b : null;
  }
  drawingToTextBoxRect(d) {
    if (d.kind === "rect" && d.rect) {
      return { ...d.rect };
    }
    if (d.kind === "polyline" && d.polyline && d.polyline.length >= 2) {
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const p of d.polyline) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      }
      const padX = 8 / this.imgW;
      const padY = 8 / this.imgH;
      return {
        x0: clamp(minX - padX, 0, 1),
        y0: clamp(minY - padY, 0, 1),
        x1: clamp(maxX + padX, 0, 1),
        y1: clamp(maxY + padY, 0, 1)
      };
    }
    return null;
  }
  polylineToBaselines(points) {
    const out = [];
    for (let i = 1; i < points.length; i += 1) {
      const a = points[i - 1];
      const b = points[i];
      const dxPx = (b.x - a.x) * this.imgW;
      const dyPx = (b.y - a.y) * this.imgH;
      const angleDeg = Math.atan2(dyPx, dxPx) * 180 / Math.PI;
      const start = angleDeg > 90 || angleDeg < -90 ? b : a;
      const end = angleDeg > 90 || angleDeg < -90 ? a : b;
      out.push({
        id: generateId("tln"),
        x0: start.x,
        y0: start.y,
        x1: end.x,
        y1: end.y,
        text: ""
      });
    }
    return out;
  }
  applyDrawingAsTextBox(d, mode) {
    var _a;
    if (!this.data) return;
    const layer = this.getPreferredTextLayer();
    if (!layer) {
      new import_obsidian21.Notice("Create a visible text layer first.", 2500);
      return;
    }
    const rect = this.drawingToTextBoxRect(d);
    if (!rect) {
      new import_obsidian21.Notice("This drawing cannot be converted to a text box.", 2500);
      return;
    }
    const box = {
      id: generateId("tbox"),
      name: `${d.kind} text box`,
      mode,
      rect,
      lines: [],
      style: this.normalizeTextLayerStyle(layer.style),
      autoFlow: true,
      allowAngledBaselines: false,
      locked: false,
      sourceDrawingId: d.id,
      sourceDrawingKind: d.kind
    };
    if (d.kind === "polyline" && d.polyline) {
      box.lines = this.polylineToBaselines(d.polyline);
    } else if (mode === "auto") {
      box.auto = this.defaultTextBoxAutoConfig();
      box.lines = this.buildAutoTextBoxLines(rect, box.style, box.auto);
    }
    (_a = layer.boxes) != null ? _a : layer.boxes = [];
    layer.boxes.push(box);
    void this.saveDataSoon();
    this.renderTextLayers();
  }
  buildMeasureMenuItems() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q;
    const meas = (_a = this.data) == null ? void 0 : _a.measurement;
    const currentUnit = (_b = meas == null ? void 0 : meas.displayUnit) != null ? _b : "km";
    const currentCustomId = meas == null ? void 0 : meas.customUnitId;
    const unitItems = [
      {
        label: "m",
        checked: currentUnit === "m",
        action: () => {
          var _a2;
          this.ensureMeasurement();
          if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
            this.data.measurement.displayUnit = "m";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      },
      {
        label: "km",
        checked: currentUnit === "km",
        action: () => {
          var _a2;
          this.ensureMeasurement();
          if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
            this.data.measurement.displayUnit = "km";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      },
      {
        label: "mi",
        checked: currentUnit === "mi",
        action: () => {
          var _a2;
          this.ensureMeasurement();
          if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
            this.data.measurement.displayUnit = "mi";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      },
      {
        label: "ft",
        checked: currentUnit === "ft",
        action: () => {
          var _a2;
          this.ensureMeasurement();
          if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
            this.data.measurement.displayUnit = "ft";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      }
    ];
    const customDefs = this.plugin.getActiveCustomUnits();
    if (customDefs.length > 0) {
      unitItems.push({ type: "separator" });
      for (const def of customDefs) {
        const isActive = currentUnit === "custom" && currentCustomId === def.id;
        unitItems.push({
          label: def.abbreviation ? `${def.name} (${def.abbreviation})` : def.name,
          checked: isActive,
          action: () => {
            var _a2;
            this.ensureMeasurement();
            if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
              this.data.measurement.displayUnit = "custom";
              this.data.measurement.customUnitId = def.id;
              void this.saveDataSoon();
              this.updateMeasureHud();
            }
            this.closeMenu();
          }
        });
      }
    }
    const travelPresets = this.plugin.getActiveTravelTimePresets();
    const selectedTravel = new Set((_e = (_d = (_c = this.data) == null ? void 0 : _c.measurement) == null ? void 0 : _d.travelTimePresetIds) != null ? _e : []);
    const travelTimeItems = [];
    const perDayInfo = (_g = (_f = this.plugin).getActiveTravelPerDayPresets) == null ? void 0 : _g.call(_f);
    const perDayPresets = (_h = perDayInfo == null ? void 0 : perDayInfo.presets) != null ? _h : [];
    const selectedPerDayId = ((_k = (_j = (_i = this.data) == null ? void 0 : _i.measurement) == null ? void 0 : _j.travelDayPresetId) != null ? _k : "").trim();
    const effectiveId = selectedPerDayId && perDayPresets.some((p) => p.id === selectedPerDayId) ? selectedPerDayId : (_m = (_l = perDayPresets[0]) == null ? void 0 : _l.id) != null ? _m : "";
    travelTimeItems.push({
      label: "Show travel days",
      mark: ((_o = (_n = this.data) == null ? void 0 : _n.measurement) == null ? void 0 : _o.travelDaysEnabled) ? "check" : "x",
      markColor: ((_q = (_p = this.data) == null ? void 0 : _p.measurement) == null ? void 0 : _q.travelDaysEnabled) ? "var(--text-accent)" : "var(--text-muted)",
      action: (rowEl) => {
        var _a2;
        this.ensureMeasurement();
        if (!((_a2 = this.data) == null ? void 0 : _a2.measurement)) return;
        const next = !this.data.measurement.travelDaysEnabled;
        this.data.measurement.travelDaysEnabled = next;
        void this.saveDataSoon();
        this.updateMeasureHud();
        const chk = rowEl.querySelector(".zm-menu__check");
        if (chk) {
          chk.textContent = next ? "\u2713" : "\xD7";
          chk.style.color = next ? "var(--text-accent)" : "var(--text-muted)";
        }
      },
      checked: false
    });
    travelTimeItems.push({
      label: "Max travel time",
      children: perDayPresets.length ? perDayPresets.map((tpd) => ({
        label: tpd.name || tpd.id,
        checked: effectiveId === tpd.id,
        action: (rowEl) => {
          var _a2;
          this.ensureMeasurement();
          if (!((_a2 = this.data) == null ? void 0 : _a2.measurement)) return;
          this.data.measurement.travelDayPresetId = tpd.id;
          void this.saveDataSoon();
          this.updateMeasureHud();
          const menu = rowEl.parentElement;
          menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => c.textContent = "");
          const chk = rowEl.querySelector(".zm-menu__check");
          if (chk) chk.textContent = "\u2713";
        }
      })) : [{ label: "(No max travel time presets configured)", action: () => new import_obsidian21.Notice("Configure max travel time presets in settings \u2192 travel rules.", 3500) }]
    });
    travelTimeItems.push({ type: "separator" });
    if (travelPresets.length) {
      travelTimeItems.push(
        ...travelPresets.map((p) => ({
          label: p.name || p.id,
          checked: selectedTravel.has(p.id),
          action: (rowEl) => {
            var _a2, _b2, _c2;
            this.ensureMeasurement();
            if (!((_a2 = this.data) == null ? void 0 : _a2.measurement)) return;
            const arr = (_c2 = (_b2 = this.data.measurement).travelTimePresetIds) != null ? _c2 : _b2.travelTimePresetIds = [];
            const i = arr.indexOf(p.id);
            if (i >= 0) arr.splice(i, 1);
            else arr.push(p.id);
            void this.saveDataSoon();
            this.updateMeasureHud();
            const chk = rowEl.querySelector(".zm-menu__check");
            if (chk) chk.textContent = i >= 0 ? "" : "\u2713";
          }
        }))
      );
    } else {
      travelTimeItems.push({
        label: "(No travel presets configured)",
        action: () => new import_obsidian21.Notice("Configure presets in settings \u2192 travel rules.", 3e3)
      });
    }
    return [
      {
        label: this.measuring ? "Stop measuring" : "Start measuring",
        action: () => {
          this.measuring = !this.measuring;
          if (!this.measuring) this.measurePreview = null;
          this.updateMeasureHud();
          this.renderMeasure();
          this.closeMenu();
        }
      },
      {
        label: "Clear measurement",
        action: () => this.clearMeasure()
      },
      {
        label: "Remove last point",
        action: () => {
          if (this.measurePts.length > 0) {
            this.measurePts.pop();
            if (this.measureSegTerrainIds.length > 0) this.measureSegTerrainIds.pop();
            this.renderMeasure();
          }
        }
      },
      ...this.plugin.settings.enableMeasurePro ? [
        {
          label: "Terrains\u2026",
          action: () => {
            this.openMeasureTerrainModal();
            this.closeMenu();
          }
        }
      ] : [],
      ...this.plugin.settings.enableDrawing ? [
        {
          label: "Save measurement as polyline\u2026",
          action: () => {
            this.saveMeasurementAsPolyline();
            this.closeMenu();
          }
        }
      ] : [],
      { type: "separator" },
      { label: "Unit", children: unitItems },
      { label: "Travel time", children: travelTimeItems },
      { type: "separator" },
      {
        label: this.calibrating ? "Stop calibration" : "Calibrate scale\u2026",
        action: () => {
          if (this.calibrating) {
            this.calibrating = false;
            this.calibPts = [];
            this.calibPreview = null;
            this.renderCalibrate();
          } else {
            this.calibrating = true;
            this.calibPts = [];
            this.calibPreview = null;
            this.renderCalibrate();
            new import_obsidian21.Notice("Calibration: click two points.", 1500);
          }
          this.closeMenu();
        }
      }
    ];
  }
  openMeasureOnlyContextMenu(clientX, clientY) {
    this.closeMenu();
    this.openMenu = new ZMMenu(this.el.ownerDocument);
    this.openMenu.open(clientX, clientY, this.buildMeasureMenuItems());
    const doc = this.getOwnerDocument();
    const outside = (event) => {
      if (!this.openMenu) return;
      const t = event.target;
      if (t instanceof HTMLElement && this.openMenu.contains(t)) return;
      this.closeMenu();
    };
    const keyClose = (event) => {
      if (event.key === "Escape") this.closeMenu();
    };
    const rightClickClose = () => this.closeMenu();
    doc.addEventListener("pointerdown", outside, { capture: true });
    doc.addEventListener("contextmenu", rightClickClose, { capture: true });
    doc.addEventListener("keydown", keyClose, { capture: true });
    this.register(() => {
      doc.removeEventListener("pointerdown", outside, true);
      doc.removeEventListener("contextmenu", rightClickClose, true);
      doc.removeEventListener("keydown", keyClose, true);
    });
  }
  onContextMenuViewport(e) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
    if (!this.ready || !this.data) return;
    this.closeMenu();
    if (this.cfg.displayOnly) return;
    if (this.measuring || this.calibrating) {
      e.preventDefault();
      e.stopPropagation();
      this.openMeasureOnlyContextMenu(e.clientX, e.clientY);
      return;
    }
    if (this.gridAlignId) {
      this.stopGridAlignMode(false);
      return;
    }
    if (((_a = this.plugin.settings.panMouseButton) != null ? _a : "left") === "right" && this.suppressContextMenuOnce) {
      this.suppressContextMenuOnce = false;
      return;
    }
    if ((this.drawingMode === "polygon" || this.drawingMode === "polyline") && this.drawPolygonPoints.length >= 2) {
      e.preventDefault();
      e.stopPropagation();
      if (this.drawingMode === "polyline") this.finishPolylineDrawing();
      else this.finishPolygonDrawing();
      return;
    }
    const vpRect = this.viewportEl.getBoundingClientRect();
    const vx = e.clientX - vpRect.left;
    const vy = e.clientY - vpRect.top;
    const wx = (vx - this.tx) / this.scale;
    const wy = (vy - this.ty) / this.scale;
    const nx = clamp(wx / this.imgW, 0, 1);
    const ny = clamp(wy / this.imgH, 0, 1);
    const bases = this.getBasesNormalized();
    const baseItems = bases.map((b) => {
      var _a2;
      return {
        label: (_a2 = b.name) != null ? _a2 : basename(b.path),
        checked: this.getActiveBasePath() === b.path,
        action: (rowEl) => {
          void this.setActiveBase(b.path).then(() => {
            const submenu = rowEl.parentElement;
            const rows = submenu == null ? void 0 : submenu.querySelectorAll(".zm-menu__item");
            rows == null ? void 0 : rows.forEach((r) => {
              const c = r.querySelector(".zm-menu__check");
              if (c) c.textContent = "";
            });
            const chk = rowEl.querySelector(".zm-menu__check");
            if (chk) chk.textContent = "\u2713";
          }).catch((err) => {
            console.error("Set base failed:", err);
            new import_obsidian21.Notice("Failed to set base image.", 2500);
          });
        }
      };
    });
    const overlayItems = ((_b = this.data.overlays) != null ? _b : []).map((o) => {
      var _a2;
      return {
        label: (_a2 = o.name) != null ? _a2 : basename(o.path),
        checked: !!o.visible,
        action: (rowEl) => {
          o.visible = !o.visible;
          void this.saveDataSoon();
          void this.updateOverlayVisibility();
          const chk = rowEl.querySelector(".zm-menu__check");
          if (chk) chk.textContent = o.visible ? "\u2713" : "";
        }
      };
    });
    const meas = this.data.measurement;
    const currentUnit = (_c = meas == null ? void 0 : meas.displayUnit) != null ? _c : "km";
    const currentCustomId = meas == null ? void 0 : meas.customUnitId;
    const unitItems = [
      {
        label: "m",
        checked: currentUnit === "m",
        action: () => {
          var _a2;
          this.ensureMeasurement();
          if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
            this.data.measurement.displayUnit = "m";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      },
      {
        label: "km",
        checked: currentUnit === "km",
        action: () => {
          var _a2;
          this.ensureMeasurement();
          if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
            this.data.measurement.displayUnit = "km";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      },
      {
        label: "mi",
        checked: currentUnit === "mi",
        action: () => {
          var _a2;
          this.ensureMeasurement();
          if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
            this.data.measurement.displayUnit = "mi";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      },
      {
        label: "ft",
        checked: currentUnit === "ft",
        action: () => {
          var _a2;
          this.ensureMeasurement();
          if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
            this.data.measurement.displayUnit = "ft";
            delete this.data.measurement.customUnitId;
            void this.saveDataSoon();
            this.updateMeasureHud();
          }
          this.closeMenu();
        }
      }
    ];
    const customDefs = this.plugin.getActiveCustomUnits();
    if (customDefs.length > 0) {
      unitItems.push({ type: "separator" });
      for (const def of customDefs) {
        const isActive = currentUnit === "custom" && currentCustomId === def.id;
        unitItems.push({
          label: def.abbreviation ? `${def.name} (${def.abbreviation})` : def.name,
          checked: isActive,
          action: () => {
            var _a2;
            this.ensureMeasurement();
            if ((_a2 = this.data) == null ? void 0 : _a2.measurement) {
              this.data.measurement.displayUnit = "custom";
              this.data.measurement.customUnitId = def.id;
              void this.saveDataSoon();
              this.updateMeasureHud();
            }
            this.closeMenu();
          }
        });
      }
    }
    const {
      pinsBase,
      pinsGlobal,
      favsBase,
      favsGlobal,
      stickersBase,
      stickersGlobal,
      swapBase,
      swapGlobal,
      pingBase,
      pingGlobal
    } = this.computeCollectionSets();
    const pinItemFromKey = (key) => {
      const info = this.getIconInfo(key);
      if (!info) return null;
      return {
        label: key || "(pin)",
        iconUrl: info.imgUrl,
        iconRotationDeg: info.rotationDeg,
        action: () => {
          this.placePinAt(key, nx, ny);
          this.closeMenu();
        }
      };
    };
    const pinsBaseMenu = pinsBase.map(pinItemFromKey).filter((x) => !!x);
    const pinsGlobalMenu = pinsGlobal.map(pinItemFromKey).filter((x) => !!x);
    const favItems = (arr) => arr.map((p) => {
      const icon = this.getIconInfo(p.iconKey);
      return {
        label: p.name || "(favorite)",
        iconUrl: icon.imgUrl,
        iconRotationDeg: icon.rotationDeg,
        action: () => {
          this.placePresetAt(p, nx, ny);
          this.closeMenu();
        }
      };
    });
    const favsBaseMenu = favItems(favsBase);
    const favsGlobalMenu = favItems(favsGlobal);
    const stickerItems = (arr) => arr.map((sp) => ({
      label: sp.name || "(sticker)",
      iconUrl: this.resolveResourceUrl(sp.imagePath),
      action: () => {
        this.placeStickerPresetAt(sp, nx, ny);
        this.closeMenu();
      }
    }));
    const stickersBaseMenu = stickerItems(stickersBase);
    const stickersGlobalMenu = stickerItems(stickersGlobal);
    const allSwapPresets = [...swapBase, ...swapGlobal];
    const addHereChildren = [
      {
        label: "Default (open editor)",
        action: () => {
          this.addMarkerInteractive(nx, ny);
          this.closeMenu();
        }
      }
    ];
    if (favsBaseMenu.length) {
      addHereChildren.push({ type: "separator" });
      addHereChildren.push({ label: "Favorites (base)", children: favsBaseMenu });
    }
    if (pinsBaseMenu.length) {
      addHereChildren.push({ type: "separator" });
      addHereChildren.push({ label: "Pins (base)", children: pinsBaseMenu });
    }
    if (pinsGlobalMenu.length) {
      addHereChildren.push({ label: "Pins (global)", children: pinsGlobalMenu });
    }
    const items = [];
    if (favsGlobalMenu.length) {
      addHereChildren.push({ type: "separator" });
      addHereChildren.push({ label: "Favorites (global)", children: favsGlobalMenu });
    }
    if (stickersBaseMenu.length) {
      addHereChildren.push({ type: "separator" });
      addHereChildren.push({
        label: "Stickers (base)",
        children: stickersBaseMenu
      });
    }
    if (stickersGlobalMenu.length) {
      addHereChildren.push({
        label: "Stickers (global)",
        children: stickersGlobalMenu
      });
    }
    addHereChildren.push(
      { type: "separator" },
      {
        label: "Add HUD pin here",
        action: () => {
          this.addHudPin(vx, vy);
          this.closeMenu();
        }
      }
    );
    addHereChildren.push({
      label: "Add base switch pin here\u2026",
      action: () => {
        if (!this.data) return;
        const bases2 = this.getBasesNormalized();
        if (!bases2.length) {
          new import_obsidian21.Notice("No base images configured.", 2500);
          return;
        }
        const iconKey = this.plugin.settings.defaultIconKey;
        const initialScaleLike = this.plugin.settings.defaultScaleLikeSticker ? true : false;
        this.openSwitchPinModal(
          {
            basePaths: bases2,
            initialIconKey: iconKey,
            initialRotate: true,
            initialSwitchBase: void 0,
            initialScaleLikeSticker: initialScaleLike,
            initialHud: false
          },
          (res) => {
            var _a2;
            if (!this.data) return;
            if (res.action !== "save" || !res.value) return;
            const marker = {
              id: generateId("swb"),
              type: "switch",
              layer: this.getPreferredNewMarkerLayerId(),
              x: nx,
              y: ny,
              iconKey: res.value.iconKey,
              switchRotate: res.value.rotate ? true : void 0,
              switchBase: res.value.rotate ? void 0 : (_a2 = res.value.switchBase) != null ? _a2 : void 0,
              scaleLikeSticker: res.value.scaleLikeSticker ? true : void 0
            };
            if (res.value.placeAsHudPin) {
              marker.anchorSpace = "viewport";
              marker.hudX = vx;
              marker.hudY = vy;
              this.classifyHudMetaFromCurrentPosition(marker, this.viewportEl.getBoundingClientRect());
            }
            this.data.markers.push(marker);
            void this.saveDataSoon();
            this.renderMarkersOnly();
            new import_obsidian21.Notice("Switch pin added.", 900);
          }
        );
        this.closeMenu();
      }
    });
    {
      const allPings = [...pingBase, ...pingGlobal].filter(Boolean);
      const buildDistanceItems = (pp) => {
        const vals = Array.isArray(pp.distances) && pp.distances.length ? pp.distances : [2, 5, 10];
        return vals.filter((n) => Number.isFinite(n) && n > 0).map((n) => ({
          label: this.formatPingDistanceLabel(n, pp.unit, pp.customUnitId),
          action: () => {
            void this.addPingPinAt(pp, nx, ny, n);
            this.closeMenu();
          }
        }));
      };
      if (allPings.length === 1) {
        addHereChildren.push(
          { type: "separator" },
          {
            label: `Party pin (${allPings[0].name || "Party"})`,
            children: buildDistanceItems(allPings[0])
          }
        );
      } else if (allPings.length > 1) {
        addHereChildren.push(
          { type: "separator" },
          {
            label: "Party pin",
            children: allPings.map((pp) => ({
              label: pp.name || "(party)",
              children: buildDistanceItems(pp)
            }))
          }
        );
      }
    }
    if (allSwapPresets.length === 1) {
      const sp = allSwapPresets[0];
      addHereChildren.push({
        label: "Add swap pin here",
        action: () => {
          this.addSwapPinHere(sp, vx, vy);
          this.closeMenu();
        }
      });
    } else if (allSwapPresets.length > 1) {
      addHereChildren.push({
        label: "Add swap pin here",
        children: allSwapPresets.map((sp) => ({
          label: sp.name || "(swap pin)",
          action: () => {
            this.addSwapPinHere(sp, vx, vy);
            this.closeMenu();
          }
        }))
      });
    }
    addHereChildren.push(
      { type: "separator" },
      {
        label: "Add dice pin here\u2026",
        action: () => {
          this.addDicePinHere(nx, ny, vx, vy);
          this.closeMenu();
        }
      }
    );
    items.push(
      { label: "Add marker here", children: addHereChildren }
    );
    if (favsBaseMenu.length) {
      items.push({ label: "Favorites (base)", children: favsBaseMenu });
    }
    const layerChildren = this.data.layers.map((layer) => {
      const state = this.getLayerState(layer);
      const { mark, color } = this.triStateIndicator(state);
      const label = layer.name + (layer.boundBase ? " (bound)" : "");
      return {
        label,
        mark,
        markColor: color,
        action: (rowEl) => {
          const next = this.advanceLayerState(layer);
          void this.saveDataSoon();
          this.renderMarkersOnly();
          const chk = rowEl.querySelector(".zm-menu__check");
          if (chk) {
            const m = this.triStateIndicator(next);
            chk.textContent = this.symbolForMark(m.mark);
            if (m.color) chk.style.color = m.color;
            else chk.removeAttribute("style");
          }
        }
      };
    });
    const labelForBase = (p) => {
      var _a2;
      const b = bases.find((bb) => bb.path === p);
      return b ? (_a2 = b.name) != null ? _a2 : basename(b.path) : basename(p);
    };
    const bindLayerSubmenus = this.data.layers.map((l) => {
      const suffix = l.boundBase ? ` \u2192 ${labelForBase(l.boundBase)}` : " \u2192 None";
      return {
        label: `Bind "${l.name}" to base${suffix}`,
        children: [
          {
            label: "None",
            checked: !l.boundBase,
            action: (rowEl) => {
              l.boundBase = void 0;
              void this.saveDataSoon();
              const menu = rowEl.parentElement;
              menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => c.textContent = "");
              const chk = rowEl.querySelector(".zm-menu__check");
              if (chk) chk.textContent = "\u2713";
            }
          },
          { type: "separator" },
          ...bases.map((b) => {
            var _a2;
            return {
              label: (_a2 = b.name) != null ? _a2 : basename(b.path),
              checked: l.boundBase === b.path,
              action: (rowEl) => {
                l.boundBase = b.path;
                void this.applyBoundBaseVisibility();
                void this.saveDataSoon();
                const menu = rowEl.parentElement;
                menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => c.textContent = "");
                const chk = rowEl.querySelector(".zm-menu__check");
                if (chk) chk.textContent = "\u2713";
              }
            };
          })
        ]
      };
    });
    const drawLayers = (_d = this.data.drawLayers) != null ? _d : [];
    const drawLayerChildren = drawLayers.map((dl) => ({
      label: dl.name,
      checked: !!dl.visible,
      action: (rowEl) => {
        dl.visible = !dl.visible;
        void this.saveDataSoon();
        this.renderDrawings();
        const chk = rowEl.querySelector(".zm-menu__check");
        if (chk) chk.textContent = dl.visible ? "\u2713" : "";
      }
    }));
    const bindDrawLayerSubmenus = drawLayers.map((dl) => {
      const suffix = dl.boundBase ? ` \u2192 ${labelForBase(dl.boundBase)}` : " \u2192 None";
      return {
        label: `Bind "${dl.name}" to base${suffix}`,
        children: [
          {
            label: "None",
            checked: !dl.boundBase,
            action: (rowEl) => {
              dl.boundBase = void 0;
              void this.saveDataSoon();
              const menu = rowEl.parentElement;
              menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => c.textContent = "");
              rowEl.querySelector(".zm-menu__check").textContent = "\u2713";
            }
          },
          { type: "separator" },
          ...bases.map((b) => {
            var _a2;
            return {
              label: (_a2 = b.name) != null ? _a2 : basename(b.path),
              checked: dl.boundBase === b.path,
              action: (rowEl) => {
                dl.boundBase = b.path;
                void this.applyBoundBaseVisibility();
                void this.saveDataSoon();
                const menu = rowEl.parentElement;
                menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => c.textContent = "");
                rowEl.querySelector(".zm-menu__check").textContent = "\u2713";
              }
            };
          })
        ]
      };
    });
    if (this.plugin.settings.enableDrawing) {
      drawLayerChildren.push(
        { type: "separator" },
        { label: "Bind draw layer to base", children: bindDrawLayerSubmenus },
        { type: "separator" },
        {
          label: "Rename draw layer\u2026",
          children: drawLayers.map((dl) => ({
            label: dl.name,
            action: () => {
              const baseName = dl.name || "Draw layer";
              new NamePromptModal(
                this.app,
                "Rename draw layer",
                baseName,
                (value) => {
                  const name = (value || baseName).trim() || baseName;
                  dl.name = name;
                  void this.saveDataSoon();
                }
              ).open();
            }
          }))
        },
        {
          label: "Delete draw layer\u2026",
          children: drawLayers.map((dl) => ({
            label: dl.name,
            action: () => {
              var _a2;
              if (!this.data) return;
              const count = ((_a2 = this.data.drawings) != null ? _a2 : []).filter(
                (d) => d.layerId === dl.id
              ).length;
              const msg = count > 0 ? `Delete draw layer "${dl.name}" and ${count} drawings on it?` : `Delete draw layer "${dl.name}"?`;
              new ConfirmModal(this.app, "Delete draw layer", msg, () => {
                var _a3, _b2, _c2, _d2;
                if (!this.data) return;
                this.pushDeleteUndo(
                  {
                    kind: "draw-layer",
                    layer: cloneForUndo(dl),
                    index: ((_a3 = this.data.drawLayers) != null ? _a3 : []).findIndex((l) => l.id === dl.id),
                    drawings: ((_b2 = this.data.drawings) != null ? _b2 : []).map((drawing, index) => ({ drawing, index })).filter((x) => x.drawing.layerId === dl.id).map((x) => ({
                      drawing: cloneForUndo(x.drawing),
                      index: x.index
                    }))
                  },
                  `Delete draw layer: ${dl.name}`
                );
                this.data.drawLayers = ((_c2 = this.data.drawLayers) != null ? _c2 : []).filter(
                  (l) => l.id !== dl.id
                );
                this.data.drawings = ((_d2 = this.data.drawings) != null ? _d2 : []).filter(
                  (d) => d.layerId !== dl.id
                );
                void this.saveDataSoon();
                this.renderDrawings();
              }).open();
            }
          }))
        },
        {
          label: "Add draw layer\u2026",
          action: () => {
            if (!this.data) return;
            const baseName = "Draw layer";
            new NamePromptModal(
              this.app,
              "Name for draw layer",
              baseName,
              (value) => {
                var _a2, _b2;
                if (!this.data) return;
                const name = (value || baseName).trim() || baseName;
                const id = generateId("draw");
                (_b2 = (_a2 = this.data).drawLayers) != null ? _b2 : _a2.drawLayers = [];
                this.data.drawLayers.push({
                  id,
                  name,
                  visible: true,
                  locked: false
                });
                void this.saveDataSoon();
                this.renderDrawings();
              }
            ).open();
          }
        }
      );
    }
    const imageLayersChildren = [
      { label: "Base", children: baseItems },
      { label: "Overlays", children: overlayItems }
    ];
    if (this.isActiveBaseSvg()) {
      imageLayersChildren.push(
        { type: "separator" },
        {
          label: "Export active SVG base as WebP\u2026",
          action: () => {
            this.closeMenu();
            this.openSvgExportModal();
          }
        }
      );
    }
    imageLayersChildren.push(
      { type: "separator" },
      {
        label: "Delete base\u2026",
        children: bases.map((b) => {
          var _a2;
          return {
            label: (_a2 = b.name) != null ? _a2 : basename(b.path),
            action: () => {
              this.closeMenu();
              this.confirmDeleteBase(b.path);
            }
          };
        })
      },
      {
        label: "Delete overlay\u2026",
        children: ((_e = this.data.overlays) != null ? _e : []).length > 0 ? ((_f = this.data.overlays) != null ? _f : []).map((o) => {
          var _a2;
          return {
            label: (_a2 = o.name) != null ? _a2 : basename(o.path),
            action: () => {
              this.closeMenu();
              this.confirmDeleteOverlay(o.path);
            }
          };
        }) : [
          {
            label: "(No overlays)",
            action: () => {
              this.closeMenu();
            }
          }
        ]
      },
      { type: "separator" },
      {
        label: "Add layer",
        children: [
          { label: "Base\u2026", action: () => this.promptAddLayer("base") },
          { label: "Overlay\u2026", action: () => this.promptAddLayer("overlay") }
        ]
      }
    );
    const measureMenuItems = this.buildMeasureMenuItems();
    items.push(
      { type: "separator" },
      { label: "Image layers", children: imageLayersChildren },
      {
        label: "Measure",
        children: measureMenuItems
      },
      {
        label: "Marker layers",
        children: [
          ...layerChildren,
          { type: "separator" },
          { label: "Bind layer to base", children: bindLayerSubmenus },
          { type: "separator" },
          {
            label: "Rename layer\u2026",
            children: this.data.layers.map((l) => ({
              label: l.name,
              action: () => {
                new RenameLayerModal(this.app, l, (newName) => {
                  void this.renameMarkerLayer(l, newName);
                }).open();
              }
            }))
          },
          {
            label: "Delete layer\u2026",
            children: this.data.layers.map((l) => ({
              label: l.name,
              action: () => {
                const others = this.data.layers.filter((x) => x.id !== l.id);
                if (others.length === 0) {
                  new import_obsidian21.Notice("Cannot delete the last layer.", 2e3);
                  return;
                }
                const hasMarkers = this.data.markers.some(
                  (m) => m.layer === l.id
                );
                new DeleteLayerModal(
                  this.app,
                  l,
                  others,
                  hasMarkers,
                  (decision) => {
                    void this.deleteMarkerLayer(l, decision);
                  }
                ).open();
              }
            }))
          }
        ]
      }
    );
    if (this.plugin.settings.enableTextLayers && this.data) {
      this.ensureTextData();
      const stopTextInteractionForLayer = (layerId) => {
        if (this.textMode === "edit" && this.activeTextLayerId === layerId) {
          this.stopTextEdit(false);
        }
        if (this.textMode === "move" && this.activeTextLayerId === layerId) {
          this.finishTextBoxMove(false);
          this.textMode = null;
          this.activeTextLayerId = null;
          this.activeTextBoxId = null;
        }
        if ((this.textMode === "draw-lines" || this.textMode === "draw-box") && this.activeTextLayerId === layerId) {
          this.textMode = null;
          this.activeTextLayerId = null;
          this.activeTextBoxId = null;
          this.textLineStart = null;
          this.textLinePreview = null;
          this.renderTextDraft();
        }
      };
      const textLayerItems = ((_g = this.data.textLayers) != null ? _g : []).map((tl) => {
        var _a2;
        const boxChildren = ((_a2 = tl.boxes) != null ? _a2 : []).map((box) => {
          const boxLocked = this.isTextBoxLocked(box, tl);
          return {
            label: box.name || "(text box)",
            children: [
              {
                label: "Edit box\u2026",
                action: () => {
                  this.closeMenu();
                  this.openTextBoxConfigModal(tl, box);
                }
              },
              {
                label: "Move",
                checked: this.textMode === "move" && this.activeTextLayerId === tl.id && this.activeTextBoxId === box.id,
                action: (rowEl) => {
                  if (boxLocked) {
                    new import_obsidian21.Notice("Text box is locked.", 1500);
                    return;
                  }
                  const isOn = this.textMode === "move" && this.activeTextLayerId === tl.id && this.activeTextBoxId === box.id;
                  if (isOn) {
                    this.finishTextBoxMove(true);
                    this.textMode = null;
                    this.activeTextLayerId = null;
                    this.activeTextBoxId = null;
                  } else {
                    this.stopTextEdit(true);
                    this.finishTextBoxMove(false);
                    this.textMode = "move";
                    this.activeTextLayerId = tl.id;
                    this.activeTextBoxId = box.id;
                    new import_obsidian21.Notice("Move mode: drag the text box to move it. Toggle move again to stop.", 4e3);
                  }
                  this.renderTextDraft();
                  this.renderTextLayers();
                  const chk = rowEl.querySelector(".zm-menu__check");
                  if (chk) chk.textContent = isOn ? "" : "\u2713";
                }
              },
              {
                label: "Delete box",
                action: () => {
                  var _a3, _b2;
                  this.pushDeleteUndo(
                    {
                      kind: "text-box",
                      layerId: tl.id,
                      box: cloneForUndo(box),
                      index: ((_a3 = tl.boxes) != null ? _a3 : []).findIndex((b) => b.id === box.id)
                    },
                    `Delete text box: ${box.name || "Text box"}`
                  );
                  tl.boxes = ((_b2 = tl.boxes) != null ? _b2 : []).filter((b) => b.id !== box.id);
                  if (this.textMode === "edit" && this.activeTextLayerId === tl.id && this.activeTextBoxId === box.id) {
                    this.stopTextEdit(false);
                  }
                  if (this.textMode === "move" && this.activeTextLayerId === tl.id && this.activeTextBoxId === box.id) {
                    this.finishTextBoxMove(false);
                    this.textMode = null;
                    this.activeTextLayerId = null;
                    this.activeTextBoxId = null;
                  }
                  void this.saveDataSoon();
                  this.renderTextLayers();
                  this.closeMenu();
                }
              }
            ]
          };
        });
        return {
          label: tl.name || "(text layer)",
          children: [
            {
              label: "State",
              children: [
                {
                  label: "Visible",
                  checked: this.isTextLayerVisible(tl),
                  action: (rowEl) => {
                    tl.visible = !this.isTextLayerVisible(tl);
                    if (!tl.visible) stopTextInteractionForLayer(tl.id);
                    void this.saveDataSoon();
                    this.renderTextLayers();
                    const chk = rowEl.querySelector(".zm-menu__check");
                    if (chk) chk.textContent = tl.visible ? "\u2713" : "";
                  }
                },
                {
                  label: "Locked",
                  checked: !!tl.locked,
                  action: (rowEl) => {
                    tl.locked = !tl.locked;
                    if (tl.locked) stopTextInteractionForLayer(tl.id);
                    void this.saveDataSoon();
                    this.renderTextLayers();
                    const chk = rowEl.querySelector(".zm-menu__check");
                    if (chk) chk.textContent = tl.locked ? "\u2713" : "";
                  }
                }
              ]
            },
            {
              label: "Add text box",
              children: [
                {
                  label: "Custom",
                  action: () => {
                    this.startDrawNewTextBox(tl.id, "custom");
                    this.closeMenu();
                  }
                },
                {
                  label: "Auto",
                  action: () => {
                    this.startDrawNewTextBox(tl.id, "auto");
                    this.closeMenu();
                  }
                }
              ]
            },
            {
              label: `Bind to base${tl.boundBase ? ` \u2192 ${labelForBase(tl.boundBase)}` : " \u2192 None"}`,
              children: [
                {
                  label: "None",
                  checked: !tl.boundBase,
                  action: (rowEl) => {
                    tl.boundBase = void 0;
                    void this.saveDataSoon();
                    this.renderTextLayers();
                    const menu = rowEl.parentElement;
                    menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => {
                      c.textContent = "";
                    });
                    const chk = rowEl.querySelector(".zm-menu__check");
                    if (chk) chk.textContent = "\u2713";
                  }
                },
                { type: "separator" },
                ...bases.map((b) => {
                  var _a3;
                  return {
                    label: (_a3 = b.name) != null ? _a3 : basename(b.path),
                    checked: tl.boundBase === b.path,
                    action: (rowEl) => {
                      tl.boundBase = b.path;
                      void this.saveDataSoon();
                      this.renderTextLayers();
                      const menu = rowEl.parentElement;
                      menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => {
                        c.textContent = "";
                      });
                      const chk = rowEl.querySelector(".zm-menu__check");
                      if (chk) chk.textContent = "\u2713";
                    }
                  };
                })
              ]
            },
            ...boxChildren.length ? [{ type: "separator" }, ...boxChildren] : []
          ]
        };
      });
      const deleteChildren = ((_h = this.data.textLayers) != null ? _h : []).length > 0 ? ((_i = this.data.textLayers) != null ? _i : []).map((tl) => ({
        label: tl.name || "(text layer)",
        action: () => {
          new ConfirmModal(
            this.app,
            "Delete text layer",
            `Delete text layer "${tl.name || tl.id}"? This cannot be undone.`,
            () => {
              var _a2, _b2;
              if (!this.data) return;
              this.pushDeleteUndo(
                {
                  kind: "text-layer",
                  layer: cloneForUndo(tl),
                  index: ((_a2 = this.data.textLayers) != null ? _a2 : []).findIndex((x) => x.id === tl.id)
                },
                `Delete text layer: ${tl.name || tl.id}`
              );
              if (this.textMode === "edit" && this.activeTextLayerId === tl.id) {
                this.stopTextEdit(false);
              }
              if (this.textMode === "move" && this.activeTextLayerId === tl.id) {
                this.finishTextBoxMove(false);
                this.textMode = null;
                this.activeTextLayerId = null;
                this.activeTextBoxId = null;
              }
              this.data.textLayers = ((_b2 = this.data.textLayers) != null ? _b2 : []).filter((x) => x.id !== tl.id);
              void this.saveDataSoon();
              this.renderTextLayers();
            }
          ).open();
          this.closeMenu();
        }
      })) : [{ label: "(No text layers)", action: () => this.closeMenu() }];
      items.push(
        { type: "separator" },
        {
          label: "Text layers",
          children: [
            ...textLayerItems,
            { type: "separator" },
            {
              label: "Add text layer\u2026",
              action: () => {
                var _a2, _b2;
                if (!this.data) return;
                const idx = ((_b2 = (_a2 = this.data.textLayers) == null ? void 0 : _a2.length) != null ? _b2 : 0) + 1;
                const defaultName = `Text layer ${idx}`;
                new NamePromptModal(
                  this.app,
                  "Name for text layer",
                  defaultName,
                  (value) => {
                    var _a3, _b3;
                    if (!this.data) return;
                    const name = (value || defaultName).trim() || defaultName;
                    (_b3 = (_a3 = this.data).textLayers) != null ? _b3 : _a3.textLayers = [];
                    this.data.textLayers.push({
                      id: generateId("txt"),
                      name,
                      visible: true,
                      boxes: []
                    });
                    void this.saveDataSoon();
                    this.renderTextLayers();
                  }
                ).open();
                this.closeMenu();
              }
            },
            {
              label: "Delete layer\u2026",
              children: deleteChildren
            }
          ]
        }
      );
    }
    if (this.plugin.settings.enableDrawing) {
      items.push(
        { type: "separator" },
        {
          label: "Draw",
          children: [
            {
              label: "Draw layers",
              children: drawLayerChildren
            },
            { type: "separator" },
            {
              label: "Rectangle",
              action: () => {
                this.startDraw("rect");
                this.closeMenu();
              }
            },
            {
              label: "Circle",
              action: () => {
                this.startDraw("circle");
                this.closeMenu();
              }
            },
            {
              label: "Polyline",
              action: () => {
                this.startDraw("polyline");
                this.closeMenu();
              }
            },
            {
              label: "Polygon",
              action: () => {
                this.startDraw("polygon");
                this.closeMenu();
              }
            }
          ]
        }
      );
    }
    items.push(
      { type: "separator" },
      {
        label: "Options",
        children: [
          {
            label: "Pin sizes for this map\u2026",
            action: () => {
              this.openPinSizeEditor();
              this.closeMenu();
            }
          },
          {
            label: "Allow panning beyond image",
            checked: !((_k = (_j = this.data) == null ? void 0 : _j.panClamp) != null ? _k : true),
            action: async (rowEl) => {
              var _a2;
              if (!this.data) return;
              const current = (_a2 = this.data.panClamp) != null ? _a2 : true;
              this.data.panClamp = !current;
              await this.saveDataSoon();
              this.applyTransform(this.scale, this.tx, this.ty);
              const chk = rowEl.querySelector(".zm-menu__check");
              if (chk) chk.textContent = this.data.panClamp ? "" : "\u2713";
            }
          },
          {
            label: "Edit view\u2026",
            action: () => {
              this.closeMenu();
              this.openViewEditorFromMap();
            }
          },
          {
            label: "Set default view here",
            action: () => {
              void this.saveDefaultViewToYaml();
              this.closeMenu();
            }
          },
          {
            label: "Delete default view",
            action: () => {
              void this.deleteDefaultViewFromYaml();
              this.closeMenu();
            }
          },
          {
            label: "Export map package\u2026",
            action: () => {
              this.closeMenu();
              this.plugin.openExportMapBundleModal(this);
            }
          },
          ...this.secondScreenFeatureEnabled() ? [
            {
              label: "Player screen layers\u2026",
              action: () => {
                this.closeMenu();
                this.openSecondScreenLayersModal();
              }
            }
          ] : []
        ]
      }
    );
    if (this.plugin.settings.enableGrid) {
      const grids = (_l = this.data.grids) != null ? _l : [];
      const gridItems = [
        {
          label: "Add grid\u2026",
          action: () => {
            this.closeMenu();
            this.addGridInteractive();
          }
        }
      ];
      if (grids.length > 0) {
        gridItems.push({ type: "separator" });
        for (const g of grids) {
          gridItems.push({
            label: `${g.name || "Grid"}${g.boundBase ? ` \u2192 ${labelForBase(g.boundBase)}` : ""}`,
            children: [
              {
                label: "Visible",
                checked: !!g.visible,
                action: (rowEl) => {
                  g.visible = !g.visible;
                  void this.saveDataSoon();
                  this.renderGrids();
                  const chk = rowEl.querySelector(".zm-menu__check");
                  if (chk) chk.textContent = g.visible ? "\u2713" : "";
                }
              },
              {
                label: "Edit grid\u2026",
                action: () => {
                  this.closeMenu();
                  this.openGridEditor(g);
                }
              },
              {
                label: "Align offset live\u2026",
                action: () => {
                  this.closeMenu();
                  this.startGridAlignMode(g.id);
                }
              },
              {
                label: "Bind to base",
                children: [
                  {
                    label: "None",
                    checked: !g.boundBase,
                    action: (rowEl) => {
                      g.boundBase = void 0;
                      void this.saveDataSoon();
                      this.renderGrids();
                      const menu = rowEl.parentElement;
                      menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => c.textContent = "");
                      const chk = rowEl.querySelector(".zm-menu__check");
                      if (chk) chk.textContent = "\u2713";
                    }
                  },
                  { type: "separator" },
                  ...bases.map((b) => {
                    var _a2;
                    return {
                      label: (_a2 = b.name) != null ? _a2 : basename(b.path),
                      checked: g.boundBase === b.path,
                      action: (rowEl) => {
                        g.boundBase = b.path;
                        void this.saveDataSoon();
                        this.renderGrids();
                        const menu = rowEl.parentElement;
                        menu == null ? void 0 : menu.querySelectorAll(".zm-menu__check").forEach((c) => c.textContent = "");
                        const chk = rowEl.querySelector(".zm-menu__check");
                        if (chk) chk.textContent = "\u2713";
                      }
                    };
                  })
                ]
              },
              {
                label: "Delete grid",
                action: () => {
                  var _a2, _b2, _c2;
                  this.pushDeleteUndo(
                    {
                      kind: "grid",
                      grid: cloneForUndo(g),
                      index: ((_b2 = (_a2 = this.data) == null ? void 0 : _a2.grids) != null ? _b2 : []).findIndex((x) => x.id === g.id)
                    },
                    `Delete grid: ${g.name || "Grid"}`
                  );
                  if (!this.data) return;
                  this.data.grids = ((_c2 = this.data.grids) != null ? _c2 : []).filter((x) => x.id !== g.id);
                  if (this.gridAlignId === g.id) this.stopGridAlignMode(false);
                  void this.saveDataSoon();
                  this.renderGrids();
                  this.closeMenu();
                }
              }
            ]
          });
        }
      }
      items.push({ type: "separator" }, { label: "Grid", children: gridItems });
    }
    if (this.secondScreenFeatureEnabled()) {
      items.push(
        { type: "separator" },
        {
          label: "Display on screen",
          children: [
            {
              label: "Normal",
              action: () => {
                this.closeMenu();
                void this.sendToSecondScreen(false);
              }
            },
            {
              label: "Fog of war",
              action: () => {
                this.closeMenu();
                void this.sendToSecondScreen(true);
              }
            }
          ]
        }
      );
    }
    if (!this.cfg.responsive) {
      items.push(
        { type: "separator" },
        { label: "Zoom +", action: () => this.zoomAt(vx, vy, 1.2) },
        { label: "Zoom \u2212", action: () => this.zoomAt(vx, vy, 1 / 1.2) },
        { label: "Fit to window", action: () => this.fitToView() },
        {
          label: "Reset view",
          action: () => this.applyTransform(
            1,
            (this.vw - this.imgW) / 2,
            (this.vh - this.imgH) / 2
          )
        }
      );
    }
    {
      const ptsCount = this.measurePts.length + (this.measuring && this.measurePreview ? 1 : 0);
      if (ptsCount >= 2) {
        const unit = (_o = (_n = (_m = this.data) == null ? void 0 : _m.measurement) == null ? void 0 : _n.displayUnit) != null ? _o : "auto-metric";
        const px = this.computeDistancePixels();
        const meters = this.computeDistanceMeters();
        const distLabel = (() => {
          if (unit === "custom") {
            if (px == null) return "Distance: (no distance)";
            return `Distance: ${this.formatCustomDistanceFromPixels(px)}`;
          }
          if (meters == null) return "Distance: (no scale)";
          return `Distance: ${this.formatDistance(meters)}`;
        })();
        items.push({ type: "separator" }, { label: distLabel });
      }
    }
    const undoLabel = this.getLatestDeleteUndoLabel();
    if (undoLabel) {
      items.push({ type: "separator" });
      items.push({
        label: `Undo delete: ${undoLabel}`,
        action: () => {
          this.closeMenu();
          void this.undoLastDelete();
        }
      });
    }
    this.openMenu = new ZMMenu(this.el.ownerDocument);
    this.openMenu.open(e.clientX, e.clientY, items);
    const doc = this.el.ownerDocument;
    const outside = (ev) => {
      if (!this.openMenu) return;
      const t = ev.target;
      if (t instanceof Node && this.openMenu.contains(t)) return;
      this.closeMenu();
    };
    const keyClose = (ev) => {
      if (ev.key === "Escape") this.closeMenu();
    };
    const rightClickClose = () => this.closeMenu();
    doc.addEventListener("pointerdown", outside, { capture: true });
    doc.addEventListener("contextmenu", rightClickClose, { capture: true });
    doc.addEventListener("keydown", keyClose, { capture: true });
    this.register(() => {
      doc.removeEventListener("pointerdown", outside, true);
      doc.removeEventListener("contextmenu", rightClickClose, true);
      doc.removeEventListener("keydown", keyClose, true);
    });
  }
  forwardContextMenuPastTextHitbox(ev) {
    var _a, _b;
    const doc = this.el.ownerDocument;
    const stack = typeof doc.elementsFromPoint === "function" ? doc.elementsFromPoint(ev.clientX, ev.clientY) : [];
    for (const el of stack) {
      if (el.closest(".zm-text-hitbox")) continue;
      const drawEl = el.closest(".zm-draw__shape");
      if (drawEl instanceof SVGElement) {
        const id = (_b = (_a = drawEl.dataset.id) != null ? _a : drawEl.getAttribute("data-id")) != null ? _b : "";
        if (id) {
          const drawing = this.getDrawingById(id);
          if (drawing) {
            this.onDrawingContextMenu(ev, drawing);
            return;
          }
        }
      }
      const markerEl = el.closest(".zm-marker");
      if (markerEl instanceof HTMLElement) {
        markerEl.dispatchEvent(
          new MouseEvent("contextmenu", {
            bubbles: true,
            cancelable: true,
            clientX: ev.clientX,
            clientY: ev.clientY,
            button: 2,
            buttons: 2,
            ctrlKey: ev.ctrlKey,
            shiftKey: ev.shiftKey,
            altKey: ev.altKey,
            metaKey: ev.metaKey
          })
        );
        return;
      }
      if (el === this.viewportEl || this.viewportEl.contains(el)) {
        this.onContextMenuViewport(ev);
        return;
      }
    }
    this.onContextMenuViewport(ev);
  }
  closeMenu() {
    if (this.openMenu) {
      this.openMenu.destroy();
      this.openMenu = null;
    }
  }
  isActiveBaseSvg() {
    const p = this.getActiveBasePath();
    return typeof p === "string" && p.toLowerCase().endsWith(".svg");
  }
  async getSvgIntrinsicSize(svgPath) {
    var _a, _b, _c;
    const af = this.app.vault.getAbstractFileByPath(svgPath);
    if (!(af instanceof import_obsidian21.TFile)) return null;
    try {
      const raw = await this.app.vault.read(af);
      const doc = new DOMParser().parseFromString(raw, "image/svg+xml");
      const el = doc.querySelector("svg");
      if (!el) return null;
      const wAttr = (_a = el.getAttribute("width")) != null ? _a : "";
      const hAttr = (_b = el.getAttribute("height")) != null ? _b : "";
      const vbAttr = (_c = el.getAttribute("viewBox")) != null ? _c : "";
      const parseLen = (s) => {
        const m = /^([0-9.+-eE]+)\s*(px)?\s*$/.exec(s.trim());
        if (!m) return Number.NaN;
        return Number(m[1]);
      };
      const w = parseLen(wAttr);
      const h = parseLen(hAttr);
      if (Number.isFinite(w) && Number.isFinite(h) && w > 0 && h > 0) {
        return { w, h };
      }
      const vb = vbAttr.trim().split(/[\s,]+/).map((x) => Number(x));
      if (vb.length === 4 && vb.every((n) => Number.isFinite(n))) {
        const vw = vb[2];
        const vh = vb[3];
        if (vw > 0 && vh > 0) return { w: vw, h: vh };
      }
    } catch (e) {
    }
    return null;
  }
  async exportActiveSvgBaseToWebp(longEdge, quality, outPath) {
    const svgPath = this.getActiveBasePath();
    if (!svgPath.toLowerCase().endsWith(".svg")) {
      throw new Error("Active base is not an SVG.");
    }
    const f = this.resolveTFile(svgPath, this.cfg.sourcePath);
    if (!f) throw new Error(`SVG not found: ${svgPath}`);
    const url = this.app.vault.getResourcePath(f);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    try {
      await img.decode();
    } catch (e) {
    }
    let w0 = img.naturalWidth || 0;
    let h0 = img.naturalHeight || 0;
    if (w0 <= 0 || h0 <= 0) {
      const intrinsic = await this.getSvgIntrinsicSize(svgPath);
      if (!intrinsic) {
        throw new Error("SVG has no intrinsic size (missing width/height and viewBox).");
      }
      w0 = intrinsic.w;
      h0 = intrinsic.h;
    }
    const scale = longEdge / Math.max(w0, h0);
    const w = Math.max(1, Math.round(w0 * scale));
    const h = Math.max(1, Math.round(h0 * scale));
    const maxSide = 16384;
    if (w > maxSide || h > maxSide) {
      throw new Error(`Target size too large (${w}\xD7${h}). Try 8k.`);
    }
    const canvas = this.getOwnerDocument().createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No canvas context.");
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const q = Math.min(1, Math.max(0.1, quality));
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => b ? resolve(b) : reject(new Error("toBlob failed")),
        "image/webp",
        q
      );
    });
    const dir = outPath.split("/").slice(0, -1).join("/");
    if (dir && !this.app.vault.getAbstractFileByPath(dir)) {
      await this.app.vault.createFolder(dir);
    }
    let finalPath = (0, import_obsidian21.normalizePath)(outPath);
    const lower = finalPath.toLowerCase();
    const base = lower.endsWith(".webp") ? finalPath.slice(0, -5) : finalPath;
    let i = 1;
    while (this.app.vault.getAbstractFileByPath(finalPath)) {
      finalPath = (0, import_obsidian21.normalizePath)(`${base}-${i}.webp`);
      i++;
    }
    await this.app.vault.adapter.writeBinary(finalPath, await blob.arrayBuffer());
    return finalPath;
  }
  openSvgExportModal() {
    if (!this.data) return;
    const svgPath = this.getActiveBasePath();
    if (!svgPath.toLowerCase().endsWith(".svg")) return;
    new SvgRasterExportModal(
      this.app,
      {
        svgPath,
        sourcePath: this.cfg.sourcePath,
        defaultLongEdge: 8192,
        defaultQuality: 0.92
      },
      (res) => {
        void this.handleSvgExportResult(res);
      }
    ).open();
  }
  async handleSvgExportResult(res) {
    if (res.action !== "export" || !res.result) return;
    try {
      new import_obsidian21.Notice("Exporting SVG\u2026 (this may take a moment)", 4e3);
      const out = await this.exportActiveSvgBaseToWebp(
        res.result.longEdge,
        res.result.quality,
        res.result.outPath
      );
      await this.addBaseByPath(out, res.result.baseName);
      await this.setActiveBase(out);
      if (res.result.moveMarkersJson) {
        if (this.cfg.storageMode !== "json") {
          new import_obsidian21.Notice("Cannot move markers.json when storage mode is 'note'.", 6e3);
        } else {
          await this.saveDataSoon();
          const newMarkersPath = await this.moveCurrentMarkersFileToBase(out);
          this.cfg.markersPath = newMarkersPath;
          this.store = new MarkerStore(this.app, this.cfg.sourcePath, newMarkersPath);
          const ok = await this.upsertYamlMarkersPath(newMarkersPath);
          if (!ok) {
            new import_obsidian21.Notice("Exported and moved markers.json, but YAML could not be updated.", 6e3);
          } else {
            new import_obsidian21.Notice(
              "Markers.json moved to the exported base. Important: other maps using the old markers.json must be updated manually.",
              9e3
            );
          }
        }
      }
      new import_obsidian21.Notice(`Exported: ${out}`, 3e3);
    } catch (e) {
      console.error(e);
      new import_obsidian21.Notice(`SVG export failed: ${e instanceof Error ? e.message : String(e)}`, 6e3);
    }
  }
  triStateIndicator(state) {
    if (state === "visible") return { mark: "check" };
    if (state === "locked") return { mark: "x", color: "var(--text-error, #d23c3c)" };
    return { mark: "minus", color: "var(--text-muted)" };
  }
  symbolForMark(mark) {
    switch (mark) {
      case "x":
        return "\xD7";
      case "minus":
        return "\u2013";
      default:
        return "\u2713";
    }
  }
  applySecondScreenViewFromData() {
    var _a, _b;
    if (!((_b = (_a = this.data) == null ? void 0 : _a.secondScreen) == null ? void 0 : _b.view)) return false;
    const v = this.data.secondScreen.view;
    if (!Number.isFinite(v.scale) || !Number.isFinite(v.tx) || !Number.isFinite(v.ty)) {
      return false;
    }
    this.applyingSecondScreenView = true;
    try {
      this.applyTransform(v.scale, v.tx, v.ty);
    } finally {
      this.applyingSecondScreenView = false;
    }
    return true;
  }
  persistSecondScreenViewSoon(delayMs = 250) {
    if (!this.isSecondScreenControllerView()) return;
    if (!this.ready || !this.data) return;
    if (this.applyingSecondScreenView) return;
    if (this.secondScreenViewSaveTimer !== null) {
      window.clearTimeout(this.secondScreenViewSaveTimer);
    }
    this.secondScreenViewSaveTimer = window.setTimeout(() => {
      var _a, _b;
      this.secondScreenViewSaveTimer = null;
      if (!this.data) return;
      (_b = (_a = this.data).secondScreen) != null ? _b : _a.secondScreen = {};
      this.data.secondScreen.view = {
        activeBase: this.getActiveBasePath(),
        scale: this.scale,
        tx: this.tx,
        ty: this.ty
      };
      void this.saveDataSoon();
    }, delayMs);
  }
  applyTransform(scale, tx, ty, render = true) {
    var _a, _b;
    const prevScale = this.scale;
    const s = clamp(scale, this.cfg.minZoom, this.cfg.maxZoom);
    const scaledW = this.imgW * s;
    const scaledH = this.imgH * s;
    const clampPan = (_b = (_a = this.data) == null ? void 0 : _a.panClamp) != null ? _b : true;
    if (clampPan) {
      const minTx = this.vw - scaledW;
      const maxTx = 0;
      const minTy = this.vh - scaledH;
      const maxTy = 0;
      if (scaledW <= this.vw) {
        tx = (this.vw - scaledW) / 2;
      } else {
        tx = clamp(tx, minTx, maxTx);
      }
      if (scaledH <= this.vh) {
        ty = (this.vh - scaledH) / 2;
      } else {
        ty = clamp(ty, minTy, maxTy);
      }
    }
    const txr = Math.round(tx);
    const tyr = Math.round(ty);
    this.scale = s;
    this.tx = txr;
    this.ty = tyr;
    this.worldEl.style.transform = `translate3d(${this.tx}px, ${this.ty}px, 0) scale3d(${this.scale}, ${this.scale}, 1)`;
    if (render) {
      if (prevScale !== s) {
        this.showZoomHud();
        this.updateMarkerInvScaleOnly();
        this.updateMarkerZoomVisibilityOnly();
        this.renderDrawingEditHandles();
        void this.maybeUpgradeSvgBaseForCurrentZoom();
      }
      this.renderMeasure();
      this.renderCalibrate();
      if (this.isCanvas()) this.renderCanvas();
      this.renderDrawingEditHandles();
    }
    this.persistSecondScreenViewSoon();
  }
  panBy(dx, dy) {
    this.applyTransform(this.scale, this.tx + dx, this.ty + dy);
  }
  zoomAt(cx, cy, factor) {
    const sOld = this.scale;
    const sNew = clamp(sOld * factor, this.cfg.minZoom, this.cfg.maxZoom);
    const wx = (cx - this.tx) / sOld;
    const wy = (cy - this.ty) / sOld;
    const txNew = cx - wx * sNew;
    const tyNew = cy - wy * sNew;
    this.applyTransform(sNew, txNew, tyNew);
  }
  fitToView() {
    const r = this.viewportEl.getBoundingClientRect();
    this.vw = r.width;
    this.vh = r.height;
    if (this.vw < 2 || this.vh < 2) {
      return;
    }
    if (!this.imgW || !this.imgH) return;
    const s = Math.min(this.vw / this.imgW, this.vh / this.imgH);
    const scale = clamp(s, this.cfg.minZoom, this.cfg.maxZoom);
    const tx = (this.vw - this.imgW * scale) / 2;
    const ty = (this.vh - this.imgH * scale) / 2;
    this.applyTransform(scale, tx, ty);
    this.initialViewApplied = true;
    this.captureViewIfVisible();
  }
  updateMarkerInvScaleOnly() {
    const invScale = this.cfg.responsive ? 1 : 1 / this.scale;
    const updateContainer = (root) => {
      if (!root) return;
      const invs = root.querySelectorAll(".zm-marker-inv");
      invs.forEach((el) => {
        el.style.transform = `scale(${invScale})`;
      });
    };
    updateContainer(this.markersEl);
    updateContainer(this.hudMarkersEl);
  }
  updateMarkerZoomVisibilityOnly() {
    const s = this.scale;
    const updateContainer = (root) => {
      if (!root) return;
      const nodes = root.querySelectorAll(".zm-marker");
      nodes.forEach((el) => {
        const minStr = el.dataset.minz;
        const maxStr = el.dataset.maxz;
        const hasMin = typeof minStr === "string" && minStr.length > 0;
        const hasMax = typeof maxStr === "string" && maxStr.length > 0;
        const min = hasMin ? Number.parseFloat(minStr) : void 0;
        const max = hasMax ? Number.parseFloat(maxStr) : void 0;
        const visible = (!hasMin || Number.isFinite(min) && s >= min) && (!hasMax || Number.isFinite(max) && s <= max);
        if (visible) el.classList.remove("zm-hidden");
        else el.classList.add("zm-hidden");
      });
    };
    updateContainer(this.markersEl);
    updateContainer(this.hudMarkersEl);
  }
  getBasesNormalized() {
    var _a, _b, _c;
    const raw = (_b = (_a = this.data) == null ? void 0 : _a.bases) != null ? _b : [];
    const out = [];
    for (const it of raw) {
      if (typeof it === "string") out.push({ path: it });
      else if (it && typeof it === "object") {
        const obj = it;
        if (typeof obj.path === "string") out.push({ path: obj.path, name: obj.name });
      }
    }
    if (out.length === 0 && ((_c = this.data) == null ? void 0 : _c.image)) out.push({ path: this.data.image });
    return out;
  }
  addMarkerInteractive(nx, ny) {
    if (!this.data) return;
    const layerId = this.getPreferredNewMarkerLayerId();
    const iconKey = this.plugin.settings.defaultIconKey;
    const defaultLink = this.getIconDefaultLink(iconKey);
    const draft = {
      id: generateId("marker"),
      x: nx,
      y: ny,
      layer: layerId,
      link: defaultLink != null ? defaultLink : "",
      iconKey,
      tooltip: "",
      scaleLikeSticker: this.plugin.settings.defaultScaleLikeSticker ? true : void 0
    };
    const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, (res) => {
      if (res.action === "save" && res.marker && this.data) {
        this.data.markers.push(res.marker);
        void this.saveDataSoon();
        new import_obsidian21.Notice("Marker added.", 900);
        this.renderMarkersOnly();
        this.schedulePingUpdate();
      }
    });
    modal.open();
  }
  placePinAt(iconKey, nx, ny) {
    if (!this.data) return;
    const layerId = this.getPreferredNewMarkerLayerId();
    const defaultLink = this.getIconDefaultLink(iconKey);
    const draft = {
      id: generateId("marker"),
      x: nx,
      y: ny,
      layer: layerId,
      link: defaultLink != null ? defaultLink : "",
      iconKey,
      tooltip: ""
    };
    const openEditor = !!this.plugin.settings.pinPlaceOpensEditor;
    if (openEditor) {
      const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, (res) => {
        if (res.action === "save" && res.marker && this.data) {
          this.data.markers.push(res.marker);
          void this.saveDataSoon();
          this.renderMarkersOnly();
          new import_obsidian21.Notice("Marker added.", 900);
        }
      });
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian21.Notice("Marker added.", 900);
      this.schedulePingUpdate();
    }
  }
  addHudPin(hx, hy) {
    if (!this.data) return;
    const layerId = this.getPreferredNewMarkerLayerId();
    const vpRect = this.viewportEl.getBoundingClientRect();
    const iconKey = this.plugin.settings.defaultIconKey;
    const defaultLink = this.getIconDefaultLink(iconKey);
    const draft = {
      id: generateId("marker"),
      x: 0,
      y: 0,
      layer: layerId,
      link: defaultLink != null ? defaultLink : "",
      iconKey,
      tooltip: "",
      anchorSpace: "viewport"
    };
    draft.hudX = hx;
    draft.hudY = hy;
    this.classifyHudMetaFromCurrentPosition(draft, vpRect);
    const openEditor = !!this.plugin.settings.pinPlaceOpensEditor;
    if (openEditor) {
      const modal = new MarkerEditorModal(
        this.app,
        this.plugin,
        this.data,
        draft,
        (res) => {
          if (res.action === "save" && res.marker && this.data) {
            this.data.markers.push(res.marker);
            void this.saveDataSoon();
            this.renderMarkersOnly();
            new import_obsidian21.Notice("Hud pin added.", 900);
          }
        }
      );
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian21.Notice("Hud pin added.", 900);
    }
  }
  placePresetAt(p, nx, ny, overrideLayerId) {
    var _a, _b, _c;
    if (!this.data) return;
    let layerId = this.data.layers[0].id;
    if (overrideLayerId) {
      layerId = overrideLayerId;
    } else if (p.layerName) {
      const found = this.data.layers.find((l) => l.name === p.layerName);
      if (found) layerId = found.id;
      else {
        const id = generateId("layer");
        this.data.layers.push({ id, name: p.layerName, visible: true, locked: false });
        layerId = id;
      }
    } else {
      layerId = this.getPreferredNewMarkerLayerId();
    }
    const draft = {
      id: generateId("marker"),
      x: nx,
      y: ny,
      layer: layerId,
      link: (_a = p.linkTemplate) != null ? _a : "",
      iconKey: (_b = p.iconKey) != null ? _b : this.plugin.settings.defaultIconKey,
      tooltip: (_c = p.tooltip) != null ? _c : "",
      scaleLikeSticker: this.plugin.settings.defaultScaleLikeSticker ? true : void 0
    };
    if (p.openEditor) {
      const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, (res) => {
        if (res.action === "save" && res.marker && this.data) {
          this.data.markers.push(res.marker);
          void this.saveDataSoon();
          this.renderMarkersOnly();
          new import_obsidian21.Notice("Marker added (favorite).", 900);
        }
      });
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian21.Notice("Marker added (favorite).", 900);
      this.schedulePingUpdate();
    }
  }
  placeStickerPresetAt(p, nx, ny) {
    var _a;
    if (!this.data) return;
    let layerId = this.getPreferredNewMarkerLayerId();
    if (p.layerName) {
      const found = this.data.layers.find((l) => l.name === p.layerName);
      if (found) layerId = found.id;
      else {
        const id = generateId("layer");
        this.data.layers.push({ id, name: p.layerName, visible: true, locked: false });
        layerId = id;
      }
    }
    const draft = {
      id: generateId("marker"),
      type: "sticker",
      x: nx,
      y: ny,
      layer: layerId,
      stickerPath: p.imagePath,
      stickerSize: Math.max(1, Math.round((_a = p.size) != null ? _a : 64))
    };
    if (p.openEditor) {
      const modal = new MarkerEditorModal(this.app, this.plugin, this.data, draft, (res) => {
        if (res.action === "save" && res.marker && this.data) {
          this.data.markers.push(res.marker);
          void this.saveDataSoon();
          this.renderMarkersOnly();
          new import_obsidian21.Notice("Sticker added.", 900);
        }
      });
      modal.open();
    } else {
      this.data.markers.push(draft);
      void this.saveDataSoon();
      this.renderMarkersOnly();
      new import_obsidian21.Notice("Sticker added.", 900);
      this.schedulePingUpdate();
    }
  }
  deleteMarker(m) {
    var _a;
    if (!this.data) return;
    const index = this.data.markers.findIndex((mm) => mm.id === m.id);
    if (index < 0) return;
    this.pushDeleteUndo(
      {
        kind: "marker",
        marker: cloneForUndo(m),
        index
      },
      `Delete ${(_a = m.type) != null ? _a : "marker"}`
    );
    void this.deletePingNoteIfOwned(m);
    this.data.markers.splice(index, 1);
    void this.saveDataSoon();
    this.renderMarkersOnly();
    new import_obsidian21.Notice("Marker deleted.", 900);
    this.schedulePingUpdate();
  }
  // ===== Ping pins =====
  sanitizeFileName(s) {
    return (s != null ? s : "").replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim();
  }
  findCustomUnitDef(id) {
    var _a, _b;
    const packs = (_a = this.plugin.settings.travelRulesPacks) != null ? _a : [];
    for (const p of packs) {
      const found = ((_b = p.customUnits) != null ? _b : []).find((u) => u.id === id);
      if (found) return found;
    }
    return void 0;
  }
  pingUnitLabel(unit, customUnitId) {
    if (unit !== "custom") return unit;
    if (!customUnitId) return "u";
    const def = this.findCustomUnitDef(customUnitId);
    return ((def == null ? void 0 : def.abbreviation) || (def == null ? void 0 : def.name) || "u").trim() || "u";
  }
  formatPingDistanceLabel(value, unit, customUnitId) {
    return `${value} ${this.pingUnitLabel(unit, customUnitId)}`;
  }
  getEffectivePxPerCustomUnit(customUnitId) {
    const direct = this.getCustomPxPerUnit(customUnitId);
    if (direct) return direct;
    const def = this.findCustomUnitDef(customUnitId);
    const mpp = this.getMetersPerPixel();
    if (!def || !mpp) return void 0;
    if (!Number.isFinite(def.metersPerUnit) || def.metersPerUnit <= 0) return void 0;
    return def.metersPerUnit / mpp;
  }
  pingToPixels(value, unit, customUnitId) {
    if (!Number.isFinite(value) || value <= 0) return null;
    if (unit === "custom") {
      if (!customUnitId) return null;
      const pxPerUnit = this.getEffectivePxPerCustomUnit(customUnitId);
      if (!pxPerUnit) return null;
      return value * pxPerUnit;
    }
    const mpp = this.getMetersPerPixel();
    if (!mpp) return null;
    const meters = unit === "km" ? value * 1e3 : unit === "mi" ? value * 1609.344 : unit === "ft" ? value * 0.3048 : value;
    return meters / mpp;
  }
  pingDistanceFromPixels(px, unit, customUnitId) {
    if (!Number.isFinite(px) || px < 0) return null;
    if (unit === "custom") {
      if (!customUnitId) return null;
      const pxPerUnit = this.getEffectivePxPerCustomUnit(customUnitId);
      if (!pxPerUnit) return null;
      return px / pxPerUnit;
    }
    const mpp = this.getMetersPerPixel();
    if (!mpp) return null;
    const meters = px * mpp;
    if (unit === "km") return meters / 1e3;
    if (unit === "mi") return meters / 1609.344;
    if (unit === "ft") return meters / 0.3048;
    return meters;
  }
  // --- Party pin: expand tags to related notes --------------------------------
  normalizeTagForIndex(tag) {
    return (tag != null ? tag : "").trim().replace(/^#/, "").toLowerCase();
  }
  collectTagsForFile(file) {
    var _a, _b, _c;
    const out = /* @__PURE__ */ new Map();
    const add = (raw) => {
      const t = (raw != null ? raw : "").trim();
      if (!t) return;
      const withHash = t.startsWith("#") ? t : `#${t}`;
      const norm = this.normalizeTagForIndex(withHash);
      if (!norm) return;
      if (!out.has(norm)) out.set(norm, withHash);
    };
    const cache = this.app.metadataCache.getFileCache(file);
    for (const tc of (_a = cache == null ? void 0 : cache.tags) != null ? _a : []) add(tc.tag);
    const fm = (_b = cache == null ? void 0 : cache.frontmatter) != null ? _b : {};
    const fmTags = (_c = fm["tags"]) != null ? _c : fm["tag"];
    if (typeof fmTags === "string") {
      fmTags.split(/[, ]+/).map((s) => s.trim()).filter(Boolean).forEach(add);
    } else if (Array.isArray(fmTags)) {
      for (const x of fmTags) if (typeof x === "string") add(x);
    }
    return out;
  }
  fileMatchesPartyFilters(file, preset) {
    var _a, _b, _c, _d;
    if (!preset) return true;
    const wantTagNorms = ((_a = preset.filterTags) != null ? _a : []).map((t) => this.normalizeTagForIndex(t)).filter(Boolean);
    if (wantTagNorms.length) {
      const tags = this.collectTagsForFile(file);
      const hasAny = wantTagNorms.some((t) => tags.has(t));
      if (!hasAny) return false;
    }
    const props = (_b = preset.filterProps) != null ? _b : {};
    if (props && Object.keys(props).length) {
      const fm = (_d = (_c = this.app.metadataCache.getFileCache(file)) == null ? void 0 : _c.frontmatter) != null ? _d : {};
      const matchScalar = (x, want) => {
        if (typeof x === "string") return x.trim() === want;
        if (typeof x === "number" || typeof x === "boolean") return String(x).trim() === want;
        return false;
      };
      const clauses = Object.entries(props).flatMap(([kRaw, vRaw]) => {
        const key = (kRaw != null ? kRaw : "").trim();
        if (!key) return [];
        const wants = (Array.isArray(vRaw) ? vRaw.join(" | ") : String(vRaw != null ? vRaw : "")).split(/[|,]/g).map((s) => s.trim()).filter(Boolean);
        if (wants.length === 0) return [];
        return [{ key, wants }];
      });
      if (clauses.length) {
        const matchesAny = clauses.some(({ key, wants }) => {
          const have = fm[key];
          if (have == null) return false;
          const matchesWants = (x) => wants.some((w) => matchScalar(x, w));
          if (Array.isArray(have)) return have.some((x) => matchesWants(x));
          return matchesWants(have);
        });
        if (!matchesAny) return false;
      }
    }
    return true;
  }
  resolvePingSearchLayerIds(ping, preset) {
    var _a, _b, _c;
    if (!this.data) return null;
    const mode = (_a = preset == null ? void 0 : preset.searchLayersMode) != null ? _a : "all";
    if (mode === "self") {
      return /* @__PURE__ */ new Set([ping.layer]);
    }
    if (mode === "custom") {
      const names = ((_b = preset == null ? void 0 : preset.searchLayerNames) != null ? _b : []).map((s) => (s != null ? s : "").trim()).filter(Boolean);
      if (names.length === 0) return null;
      const ids = new Set(
        ((_c = this.data.layers) != null ? _c : []).filter((l) => {
          var _a2;
          return names.includes(((_a2 = l.name) != null ? _a2 : "").trim());
        }).map((l) => l.id)
      );
      if (ids.size === 0) return null;
      return ids;
    }
    return null;
  }
  buildTagIndexForTags(want) {
    const index = /* @__PURE__ */ new Map();
    if (want.size === 0) return index;
    const files = this.app.vault.getFiles().filter((f) => {
      var _a;
      return ((_a = f.extension) == null ? void 0 : _a.toLowerCase()) === "md";
    });
    for (const f of files) {
      const tags = this.collectTagsForFile(f);
      for (const norm of tags.keys()) {
        if (!want.has(norm)) continue;
        const arr = index.get(norm);
        if (arr) arr.push(f);
        else index.set(norm, [f]);
      }
    }
    return index;
  }
  backlinkPathsFromResolvedLinks(target) {
    const out = [];
    const mcAny = this.app.metadataCache;
    const rl = mcAny.resolvedLinks;
    if (!rl) return out;
    const addIfLinksTo = (srcPath, dests) => {
      if (!srcPath || srcPath === target.path) return;
      if (dests && typeof dests === "object") {
        if (dests instanceof Map) {
          if (dests.has(target.path)) out.push(srcPath);
          return;
        }
        const obj = dests;
        if (Object.prototype.hasOwnProperty.call(obj, target.path)) out.push(srcPath);
      }
    };
    if (rl instanceof Map) {
      for (const [srcPath, dests] of rl.entries()) {
        if (typeof srcPath !== "string") continue;
        addIfLinksTo(srcPath, dests);
      }
      return out;
    }
    if (typeof rl === "object") {
      for (const [srcPath, dests] of Object.entries(rl)) {
        addIfLinksTo(srcPath, dests);
      }
    }
    return out;
  }
  getBacklinkSourcePaths(target) {
    return this.backlinkPathsFromResolvedLinks(target);
  }
  buildTagIndex() {
    const index = /* @__PURE__ */ new Map();
    const files = this.app.vault.getFiles().filter((f) => {
      var _a;
      return ((_a = f.extension) == null ? void 0 : _a.toLowerCase()) === "md";
    });
    for (const f of files) {
      const tags = this.collectTagsForFile(f);
      for (const norm of tags.keys()) {
        const arr = index.get(norm);
        if (arr) arr.push(f);
        else index.set(norm, [f]);
      }
    }
    return index;
  }
  formatWikiLink(file, fromPath) {
    const linktext = this.app.metadataCache.fileToLinktext(file, fromPath);
    return `[[${linktext}]]`;
  }
  escapeTableCell(s) {
    return (s != null ? s : "").replace(/\|/g, "\\|");
  }
  splitFrontmatterBlock(text) {
    const m = /^---\n[\s\S]*?\n(?:---|\.\.\.)\n/.exec(text);
    if (!m) return { frontmatter: "", rest: text };
    return { frontmatter: m[0], rest: text.slice(m[0].length) };
  }
  extractFirstMarkdownHeading(text) {
    const m = /^#\s+.*$/m.exec(text);
    return m ? m[0] : null;
  }
  extractFirstCodeFenceBlock(text, lang) {
    const lines = text.split("\n");
    const open = "```" + lang;
    let start = -1;
    for (let i = 0; i < lines.length; i += 1) {
      if (lines[i].trimStart().startsWith(open)) {
        start = i;
        break;
      }
    }
    if (start < 0) return null;
    let end = start + 1;
    while (end < lines.length && !lines[end].trimStart().startsWith("```")) end += 1;
    if (end >= lines.length) return null;
    return lines.slice(start, end + 1).join("\n").trimEnd();
  }
  openLinkInNewTab(link) {
    const leaf = this.app.workspace.getLeaf("tab");
    const anyLeaf = leaf;
    if (typeof anyLeaf.openLinkText === "function") {
      void anyLeaf.openLinkText(link, this.cfg.sourcePath);
      return;
    }
    const anyWs = this.app.workspace;
    try {
      void anyWs.openLinkText(link, this.cfg.sourcePath, true);
    } catch (e) {
      void this.app.workspace.openLinkText(link, this.cfg.sourcePath);
    }
  }
  buildPingNoteText(prevText, opts) {
    var _a, _b;
    const { frontmatter, rest } = this.splitFrontmatterBlock(prevText);
    const title = ((_a = this.extractFirstMarkdownHeading(rest)) != null ? _a : opts.defaultTitle).trimEnd();
    const baseBlock = opts.includeBases ? (_b = this.extractFirstCodeFenceBlock(rest, "base")) != null ? _b : `\`\`\`base
${opts.baseYamlFallback.trimEnd()}
\`\`\`` : "";
    const relatedSection = opts.includeRelated ? `${PING_RELATED_BEGIN}
${opts.relatedBody.trimEnd()}
${PING_RELATED_END}` : "";
    const travelSection = opts.includeTravel ? `## Travel times
${PING_TRAVEL_BEGIN}
${opts.travelBody.trimEnd()}
${PING_TRAVEL_END}` : "";
    const tooltipSection = opts.includeTooltips ? `## In-range markers without note
${PING_TOOLTIP_BEGIN}
${opts.tooltipBody.trimEnd()}
${PING_TOOLTIP_END}` : "";
    const parts = [
      `${frontmatter}${title}`,
      relatedSection,
      travelSection,
      tooltipSection,
      baseBlock
    ].filter((s) => (s != null ? s : "").trim().length > 0);
    return `${parts.join("\n\n").trimEnd()}
`;
  }
  async upsertPingRelatedSection(file, body) {
    await this.app.vault.process(file, (text) => {
      const a = text.indexOf(PING_RELATED_BEGIN);
      const b = text.indexOf(PING_RELATED_END);
      if (a >= 0 && b > a) {
        const before = text.slice(0, a + PING_RELATED_BEGIN.length);
        const after = text.slice(b);
        return `${before}
${body}
${after}`;
      }
      return text;
    });
  }
  schedulePingUpdate(delayMs = 900) {
    var _a;
    if (!this.data) return;
    if (!((_a = this.data.markers) == null ? void 0 : _a.some((m) => m.type === "ping"))) return;
    if (this.pingUpdateTimer !== null) window.clearTimeout(this.pingUpdateTimer);
    this.pingUpdateTimer = window.setTimeout(() => {
      this.pingUpdateTimer = null;
      void this.updateAllPingNotes();
    }, delayMs);
  }
  async updateAllPingNotes() {
    if (!this.data) return;
    const pings = this.data.markers.filter((m) => m.type === "ping");
    for (const p of pings) {
      try {
        await this.updatePingNoteForMarker(p);
      } catch (e) {
        console.warn("Ping update failed", e);
      }
    }
  }
  buildPingBaseYaml(preset, unitLabel) {
    var _a, _b;
    const andFilters = [
      "list(this.zoommapPingInRangePaths).contains(file.path)",
      'file.ext == "md"'
    ];
    const tags = ((_a = preset.filterTags) != null ? _a : []).map((t) => (t != null ? t : "").trim()).filter(Boolean);
    if (tags.length) {
      andFilters.push({
        or: tags.map((t) => `file.hasTag("${t.replace(/^#/, "")}")`)
      });
    }
    const props = (_b = preset.filterProps) != null ? _b : {};
    const propClauses = [];
    for (const [kRaw, vRaw] of Object.entries(props)) {
      const k = (kRaw != null ? kRaw : "").trim();
      if (!k) continue;
      const wants = (Array.isArray(vRaw) ? vRaw.join(" | ") : String(vRaw != null ? vRaw : "")).split(/[|,]/g).map((s) => s.trim()).filter(Boolean);
      if (wants.length === 0) continue;
      for (const v of wants) {
        propClauses.push(
          `note["${k.replace(/"/g, '\\"')}"] == "${v.replace(/"/g, '\\"')}"`
        );
      }
    }
    if (propClauses.length) andFilters.push({ or: propClauses });
    const baseObj = {
      filters: { and: andFilters },
      formulas: {
        ping_link: "file.asLink()",
        distance: `this.zoommapPingDistances[file.path]`,
        distance_label: `if(formula.distance, formula.distance.toString() + " ${unitLabel}", "")`
      },
      views: [
        {
          type: "table",
          name: "In range",
          order: ["formula.ping_link", "formula.distance_label", "file.tags"]
        }
      ]
    };
    return (0, import_obsidian21.stringifyYaml)(baseObj).trimEnd();
  }
  buildPingTravelTimesTable(fromPath, inRangeFiles, metersByPath) {
    var _a;
    const presets = this.plugin.getActiveTravelTimePresets();
    if (!presets.length) return "*(none)*";
    const locs = inRangeFiles.map((x) => ({ file: x.file, meters: metersByPath[x.file.path] })).filter((x) => typeof x.meters === "number" && Number.isFinite(x.meters) && x.meters >= 0);
    if (!locs.length) return "*(no calibrated scale)*";
    const header = ["Mode", ...locs.map((l) => this.formatWikiLink(l.file, fromPath))];
    const rows = [];
    rows.push(`| ${header.map((c) => this.escapeTableCell(c)).join(" | ")} |`);
    rows.push(`| ${header.map(() => "---").join(" | ")} |`);
    for (const p of presets) {
      const refMeters = this.travelDistanceToMeters(p.distanceValue, p.distanceUnit, p.distanceCustomUnitId);
      const name = p.name || p.id;
      const unit = ((_a = p.timeUnit) != null ? _a : "").trim() || "h";
      const cells = [name];
      for (const loc of locs) {
        if (!refMeters || !Number.isFinite(refMeters) || refMeters <= 0) {
          cells.push("-");
          continue;
        }
        const t = loc.meters / refMeters * p.timeValue;
        cells.push(`${this.formatTravelTimeNumber(t)} ${unit}`);
      }
      rows.push(`| ${cells.map((c) => this.escapeTableCell(c)).join(" | ")} |`);
    }
    return rows.join("\n").trimEnd();
  }
  async addPingPinAt(preset, nx, ny, distanceValue) {
    var _a, _b, _c, _d, _e;
    if (!this.data) return;
    const unit = (_a = preset.unit) != null ? _a : "km";
    const customUnitId = preset.customUnitId;
    if (unit === "custom" && (!customUnitId || !customUnitId.trim())) {
      new import_obsidian21.Notice("Party preset uses a custom unit but no customunitid is set.", 4e3);
      return;
    }
    const radiusPx = this.pingToPixels(distanceValue, unit, customUnitId);
    if (radiusPx == null) {
      new import_obsidian21.Notice("Cannot create party pin: map scale is not calibrated for this unit.", 5e3);
      return;
    }
    let layerId = this.getPreferredNewMarkerLayerId();
    if (preset.layerName) {
      const found = this.data.layers.find((l) => l.name === preset.layerName);
      if (found) layerId = found.id;
      else {
        const id = generateId("layer");
        this.data.layers.push({ id, name: preset.layerName, visible: true, locked: false });
        layerId = id;
      }
    }
    const iconKey = (_b = preset.iconKey) != null ? _b : this.plugin.settings.defaultIconKey;
    const distanceLabel = this.formatPingDistanceLabel(distanceValue, unit, customUnitId);
    const marker = {
      id: generateId("ping"),
      type: "ping",
      x: nx,
      y: ny,
      layer: layerId,
      iconKey,
      tooltip: preset.name ? `Party: ${preset.name} (${distanceLabel})` : `Party (${distanceLabel})`,
      pingPresetId: preset.id,
      pingRadius: distanceValue,
      pingRadiusUnit: unit,
      pingRadiusCustomUnitId: unit === "custom" ? customUnitId : void 0,
      scaleLikeSticker: preset.defaultScaleLikeSticker ? true : void 0
    };
    const folder = ((_c = preset.noteFolder) != null ? _c : "ZoomMap/Pings").trim() || "ZoomMap/Pings";
    const baseName = this.sanitizeFileName(`Party - ${preset.name || "Party"} - ${distanceLabel} - ${marker.id}`);
    let outPath = (0, import_obsidian21.normalizePath)(`${folder}/${baseName}.md`);
    await this.ensureFolderForPath(outPath);
    let i = 1;
    while (this.app.vault.getAbstractFileByPath(outPath)) {
      outPath = (0, import_obsidian21.normalizePath)(`${folder}/${baseName}-${i}.md`);
      i++;
    }
    const unitLabel = this.pingUnitLabel(unit, customUnitId);
    const baseYaml = this.buildPingBaseYaml(preset, unitLabel);
    const sections = (_d = preset.sections) != null ? _d : {};
    const includeBases = sections.bases !== false;
    const includeTooltips = sections.tooltips !== false;
    const includeRelated = sections.related !== false;
    const includeTravel = sections.travelTimes !== false;
    const fm = {
      zoommapPing: true,
      zoommapPingId: marker.id,
      zoommapPingMapId: (_e = this.cfg.mapId) != null ? _e : "",
      zoommapPingSourcePath: this.cfg.sourcePath,
      zoommapPingSourceFileName: basename(this.cfg.sourcePath),
      zoommapPingBase: this.getActiveBasePath(),
      zoommapPingRadius: distanceValue,
      zoommapPingUnit: unit,
      zoommapPingCustomUnitId: unit === "custom" ? customUnitId : void 0,
      zoommapPingPresetId: preset.id,
      zoommapPingPresetName: preset.name,
      zoommapPingInRangePaths: [],
      zoommapPingDistances: {},
      zoommapPingUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    const frontmatter = `---
${(0, import_obsidian21.stringifyYaml)(fm).trimEnd()}
---

`;
    const defaultTitle = `# Party pin: ${preset.name || "Party"} (${distanceLabel})`;
    const relatedBody = "*(none)*";
    const tooltipBody = "*(none)*";
    const travelBody = "*(none)*";
    const baseYamlFallback = baseYaml;
    const md = frontmatter + this.buildPingNoteText("", {
      defaultTitle,
      baseYamlFallback,
      tooltipBody,
      relatedBody,
      travelBody,
      includeBases,
      includeTooltips,
      includeRelated,
      includeTravel
    });
    const file = await this.app.vault.create(outPath, md);
    marker.pingNotePath = file.path;
    marker.link = this.app.metadataCache.fileToLinktext(file, this.cfg.sourcePath);
    this.data.markers.push(marker);
    await this.saveDataSoon();
    this.renderMarkersOnly();
    await this.updatePingNoteForMarker(marker);
    new import_obsidian21.Notice("Party pin created.", 1200);
  }
  async updatePingNoteForMarker(ping) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    if (!this.data) return;
    if (ping.type !== "ping") return;
    const preset = ping.pingPresetId ? this.findPingPresetById(ping.pingPresetId) : void 0;
    const af = await this.ensurePingNoteFileForMarker(ping, preset);
    if (!(af instanceof import_obsidian21.TFile)) return;
    const radius = (_a = ping.pingRadius) != null ? _a : 0;
    const unit = (_b = ping.pingRadiusUnit) != null ? _b : "km";
    const customUnitId = ping.pingRadiusCustomUnitId;
    const radiusPx = this.pingToPixels(radius, unit, customUnitId);
    if (radiusPx == null) return;
    const allowedLayerIds = this.resolvePingSearchLayerIds(ping, preset);
    const inRangePaths = /* @__PURE__ */ new Set();
    const distances = {};
    const metersByPath = {};
    const tooltipMap = /* @__PURE__ */ new Map();
    const mpp = this.getMetersPerPixel();
    for (const m of this.data.markers) {
      if (m.id === ping.id) continue;
      if (m.anchorSpace === "viewport") continue;
      if (m.type === "ping") continue;
      if (allowedLayerIds && !allowedLayerIds.has(m.layer)) continue;
      const dx = (m.x - ping.x) * this.imgW;
      const dy = (m.y - ping.y) * this.imgH;
      const pxDist = Math.hypot(dx, dy);
      if (pxDist > radiusPx) continue;
      const distVal = this.pingDistanceFromPixels(pxDist, unit, customUnitId);
      const dist = distVal == null ? 0 : Math.round(distVal * 100) / 100;
      const link = ((_c = m.link) != null ? _c : "").trim();
      if (link) {
        const f = this.resolveTFile(link, this.cfg.sourcePath);
        if (!f) continue;
        inRangePaths.add(f.path);
        const prev2 = distances[f.path];
        if (prev2 == null || dist < prev2) distances[f.path] = dist;
        if (typeof mpp === "number") {
          const meters = pxDist * mpp;
          const prevM = metersByPath[f.path];
          if (prevM == null || meters < prevM) metersByPath[f.path] = meters;
        }
        continue;
      }
      const tip = ((_d = m.tooltip) != null ? _d : "").trim();
      if (!tip) continue;
      const prev = tooltipMap.get(tip);
      if (prev == null || dist < prev) tooltipMap.set(tip, dist);
    }
    const listSorted = Array.from(inRangePaths).sort((a, b) => a.localeCompare(b));
    const distancesSorted = Object.fromEntries(
      Object.entries(distances).sort((a, b) => a[0].localeCompare(b[0]))
    );
    let fmChanged = false;
    await this.app.fileManager.processFrontMatter(af, (fm) => {
      var _a2, _b2;
      const set = (key, value) => {
        const cur = fm[key];
        if (!stableEqual(cur, value)) {
          fm[key] = value;
          fmChanged = true;
        }
      };
      const del = (key) => {
        if (Object.prototype.hasOwnProperty.call(fm, key)) {
          delete fm[key];
          fmChanged = true;
        }
      };
      set("zoommapPing", true);
      set("zoommapPingId", ping.id);
      set("zoommapPingMapId", (_a2 = this.cfg.mapId) != null ? _a2 : "");
      set("zoommapPingSourcePath", this.cfg.sourcePath);
      set("zoommapPingSourceFileName", basename(this.cfg.sourcePath));
      set("zoommapPingBase", this.getActiveBasePath());
      set("zoommapPingRadius", radius);
      set("zoommapPingUnit", unit);
      if (unit === "custom") set("zoommapPingCustomUnitId", customUnitId);
      else del("zoommapPingCustomUnitId");
      set("zoommapPingPresetId", (_b2 = ping.pingPresetId) != null ? _b2 : "");
      set("zoommapPingInRangePaths", listSorted);
      set("zoommapPingDistances", distancesSorted);
      if (fmChanged) {
        set("zoommapPingUpdated", (/* @__PURE__ */ new Date()).toISOString());
      }
    });
    const unitLabel = this.pingUnitLabel(unit, customUnitId);
    const tooltipsSorted = Array.from(tooltipMap.entries()).sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
    const tooltipLines = tooltipsSorted.length === 0 ? ["*(none)*"] : tooltipsSorted.map(([txt, d]) => `- ${txt} (${d} ${unitLabel})`);
    const relatedMode = (_e = preset == null ? void 0 : preset.relatedLookup) != null ? _e : "tags";
    const sections = (_f = preset == null ? void 0 : preset.sections) != null ? _f : {};
    const includeBases = sections.bases !== false;
    const includeTooltips = sections.tooltips !== false;
    const includeRelated = sections.related !== false;
    const includeTravel = sections.travelTimes !== false;
    let relatedBody = "";
    const inRangeFiles = listSorted.map((p) => this.app.vault.getAbstractFileByPath(p)).filter((x) => x instanceof import_obsidian21.TFile).map((file) => {
      var _a2;
      return { file, dist: (_a2 = distances[file.path]) != null ? _a2 : 0 };
    }).filter(({ file }) => this.fileMatchesPartyFilters(file, preset)).sort((a, b) => a.dist - b.dist || a.file.path.localeCompare(b.file.path));
    try {
      if (!includeRelated) {
        relatedBody = "*(disabled)*";
      } else if (relatedMode === "off") {
        relatedBody = "*(disabled)*";
      } else if (relatedMode === "backlinks") {
        const maxPerNote = 50;
        const blocks = [];
        if (inRangeFiles.length === 0) {
          relatedBody = "*(none)*";
        } else {
          for (const c of inRangeFiles) {
            const pinLabel = `${this.formatWikiLink(c.file, af.path)} (${c.dist} ${unitLabel})`;
            const lines = [];
            lines.push(`| ${pinLabel} | Backlinks |`);
            lines.push("| --- | --- |");
            const sourcePaths = this.getBacklinkSourcePaths(c.file);
            const sources = sourcePaths.map((p) => this.app.vault.getAbstractFileByPath(p)).filter((x) => x instanceof import_obsidian21.TFile).filter((f) => f.path !== c.file.path && f.path !== af.path).sort((a, b) => a.basename.localeCompare(b.basename, void 0, { sensitivity: "base" }));
            const slice = sources.slice(0, maxPerNote);
            const rest = sources.length - slice.length;
            const links = slice.map((f) => this.formatWikiLink(f, af.path));
            const cell = links.length ? links.join("<br>") + (rest > 0 ? `<br>\u2026 +${rest} more` : "") : "*(none)*";
            lines.push(`| Backlinks | ${cell} |`);
            blocks.push(lines.join("\n"));
          }
          relatedBody = blocks.join("\n\n").trim() || "*(none)*";
        }
      } else {
        const excludeTagNorms = new Set(
          ((_g = preset == null ? void 0 : preset.filterTags) != null ? _g : []).map((t) => this.normalizeTagForIndex(t)).filter(Boolean)
        );
        const candidates = inRangeFiles.map(({ file, dist }) => {
          const tags = this.collectTagsForFile(file);
          for (const ex of excludeTagNorms) tags.delete(ex);
          const norms = [...tags.keys()].sort((aa, bb) => {
            var _a2, _b2;
            const aTag = (_a2 = tags.get(aa)) != null ? _a2 : aa;
            const bTag = (_b2 = tags.get(bb)) != null ? _b2 : bb;
            return aTag.localeCompare(bTag, void 0, { sensitivity: "base" });
          });
          return { file, dist, tags, norms };
        }).filter((c) => c.norms.length > 0);
        if (candidates.length === 0) {
          relatedBody = "*(none)*";
        } else {
          const wantNorms = /* @__PURE__ */ new Set();
          for (const c of candidates) for (const n of c.norms) wantNorms.add(n);
          const tagIndex = this.buildTagIndexForTags(wantNorms);
          const maxPerTag = 50;
          const tables = [];
          for (const c of candidates) {
            const pinLabel = `${this.formatWikiLink(c.file, af.path)} (${c.dist} ${unitLabel})`;
            const lines = [];
            lines.push(`| ${pinLabel} | Notes with tag |`);
            lines.push("| --- | --- |");
            for (const norm of c.norms) {
              const displayTag = (_h = c.tags.get(norm)) != null ? _h : `#${norm}`;
              const matches = ((_i = tagIndex.get(norm)) != null ? _i : []).filter((f) => f.path !== c.file.path && f.path !== af.path).sort((a, b) => a.basename.localeCompare(b.basename, void 0, { sensitivity: "base" }));
              const slice = matches.slice(0, maxPerTag);
              const rest = matches.length - slice.length;
              const links = slice.map((f) => this.formatWikiLink(f, af.path));
              const cell = links.length ? links.join("<br>") + (rest > 0 ? `<br>\u2026 +${rest} more` : "") : "*(none)*";
              lines.push(`| ${this.escapeTableCell(displayTag)} | ${cell} |`);
            }
            tables.push(lines.join("\n"));
          }
          relatedBody = tables.join("\n\n").trim() || "*(none)*";
        }
      }
    } catch (e) {
      console.warn("Zoom Map: related section build failed", e);
      relatedBody = "*(error building related section)*";
    }
    if (!relatedBody.trim()) {
      relatedBody = "*(none)*";
    }
    const dummyPreset = preset != null ? preset : { id: "", name: "", distances: [], unit: "km" };
    const baseYamlFallback = this.buildPingBaseYaml(dummyPreset, unitLabel);
    const distLabel = this.formatPingDistanceLabel(radius, unit, customUnitId);
    const defaultTitle = `# Party pin: ${(preset == null ? void 0 : preset.name) || "Party"} (${distLabel})`;
    const travelBody = includeTravel ? this.buildPingTravelTimesTable(af.path, inRangeFiles, metersByPath) : "*(disabled)*";
    const tooltipBody = includeTooltips ? tooltipLines.join("\n") : "*(disabled)*";
    await this.app.vault.process(af, (text) => {
      const next = this.buildPingNoteText(text, {
        defaultTitle,
        baseYamlFallback,
        relatedBody,
        travelBody,
        tooltipBody,
        includeBases,
        includeTooltips,
        includeRelated,
        includeTravel
      });
      return next === text ? text : next;
    });
    const shouldRefreshSourceNote = (preset == null ? void 0 : preset.refreshSourceNoteOnUpdate) !== false;
    if (!shouldRefreshSourceNote) return;
    this.plugin.snapshotMapsForSourceNote(this.cfg.sourcePath);
    await this.refreshOpenMarkdownViewsForPaths([this.cfg.sourcePath]);
  }
  async deletePingNoteIfOwned(m) {
    var _a, _b;
    if (m.type !== "ping") return;
    const p = ((_a = m.pingNotePath) != null ? _a : "").trim();
    if (!p) return;
    const af = this.app.vault.getAbstractFileByPath(p);
    if (!(af instanceof import_obsidian21.TFile)) return;
    const fm = (_b = this.app.metadataCache.getFileCache(af)) == null ? void 0 : _b.frontmatter;
    const owner = fm == null ? void 0 : fm.zoommapPingId;
    if (owner !== m.id) return;
    try {
      await this.app.fileManager.trashFile(af, true);
    } catch (e) {
      console.warn("Failed to trash ping note", e);
    }
  }
  openPinSizeEditor(focusIconKey) {
    var _a, _b, _c, _d, _e;
    if (!this.data) return;
    const usedKeys = /* @__PURE__ */ new Set();
    for (const m of this.data.markers) {
      if (m.type === "sticker") continue;
      if (m.type === "swap" && m.swapKey) {
        const preset = this.findSwapPresetById(m.swapKey);
        if ((_a = preset == null ? void 0 : preset.frames) == null ? void 0 : _a.length) {
          for (const fr of preset.frames) {
            const k = ((_b = fr == null ? void 0 : fr.iconKey) != null ? _b : "").trim();
            if (k) usedKeys.add(k);
          }
        }
        if (m.iconKey) usedKeys.add(m.iconKey);
        continue;
      }
      const key = ((_c = m.iconKey) != null ? _c : this.plugin.settings.defaultIconKey).trim();
      if (key) usedKeys.add(key);
    }
    if (usedKeys.size === 0) {
      new import_obsidian21.Notice("No pins on this map yet.", 2e3);
      return;
    }
    const rows = [];
    for (const key of usedKeys) {
      const profile = (_d = this.plugin.settings.icons.find((i) => i.key === key)) != null ? _d : this.plugin.builtinIcon();
      const baseSize = profile.size;
      const override = (_e = this.data.pinSizeOverrides) == null ? void 0 : _e[key];
      const imgUrl = this.resolveResourceUrl(profile.pathOrDataUrl);
      rows.push({
        iconKey: key,
        baseSize,
        override,
        imgUrl
      });
    }
    rows.sort((a, b) => a.iconKey.localeCompare(b.iconKey));
    const modal = new PinSizeEditorModal(
      this.app,
      rows,
      (updated) => {
        if (!this.data) return;
        const allowed = new Set(rows.map((r) => r.iconKey));
        const next = {};
        for (const key of allowed) {
          const val = updated[key];
          if (typeof val === "number" && Number.isFinite(val) && val > 0) {
            next[key] = val;
          }
        }
        if (Object.keys(next).length > 0) {
          this.data.pinSizeOverrides = next;
        } else {
          delete this.data.pinSizeOverrides;
        }
        void this.saveDataSoon();
        this.renderMarkersOnly();
      },
      focusIconKey != null ? focusIconKey : void 0
    );
    modal.open();
  }
  getTintedSvgDataUrl(baseDataUrl, color) {
    const key = `${baseDataUrl}||${color}`;
    const cached = this.tintedSvgCache.get(key);
    if (cached) return cached;
    const idx = baseDataUrl.indexOf(",");
    if (idx < 0) return baseDataUrl;
    const header = baseDataUrl.slice(0, idx + 1);
    const payload = baseDataUrl.slice(idx + 1);
    let svg;
    try {
      svg = decodeURIComponent(payload);
    } catch (e) {
      return baseDataUrl;
    }
    const tinted = tintSvgMarkupLocal(svg, color);
    const out = header + encodeURIComponent(tinted);
    this.tintedSvgCache.set(key, out);
    return out;
  }
  canDrawingUseRegion(d) {
    return d.kind === "polygon" || d.kind === "rect" || d.kind === "circle";
  }
  showDrawingTooltip(clientX, clientY, body, title) {
    var _a, _b;
    const text = (body != null ? body : "").trim();
    const head = (title != null ? title : "").trim();
    if (!text && !head) return;
    if (!this.tooltipEl) {
      this.tooltipEl = this.hudClipEl.createDiv({ cls: "zm-tooltip" });
      this.tooltipEl.addEventListener("mouseenter", () => this.cancelHideTooltip());
      this.tooltipEl.addEventListener("mouseleave", () => this.hideTooltipSoon());
    }
    this.tooltipEl.style.maxWidth = `${(_a = this.plugin.settings.hoverMaxWidth) != null ? _a : 360}px`;
    this.tooltipEl.style.maxHeight = `${(_b = this.plugin.settings.hoverMaxHeight) != null ? _b : 260}px`;
    this.cancelHideTooltip();
    this.tooltipEl.empty();
    if (head) this.tooltipEl.createEl("div", { cls: "zm-tooltip__title", text: head });
    if (text) this.tooltipEl.createEl("div", { cls: "zm-tooltip__body", text });
    this.positionTooltip(clientX, clientY);
    this.tooltipEl.classList.add("zm-tooltip-visible");
  }
  onDrawingRegionEnter(ev, d) {
    var _a, _b;
    if (this.measuring || this.calibrating) return;
    const tooltip = ((_b = (_a = d.style) == null ? void 0 : _a.regionTooltip) != null ? _b : "").trim();
    if (!tooltip) return;
    this.showDrawingTooltip(ev.clientX, ev.clientY, tooltip);
  }
  triggerDrawingRegionHoverPopover(ev, d, targetEl) {
    var _a, _b, _c;
    if (this.measuring || this.calibrating) return;
    const link = ((_b = (_a = d.style) == null ? void 0 : _a.regionLink) != null ? _b : "").trim();
    if (!link) return;
    if (((_c = d.style) == null ? void 0 : _c.regionHoverPreview) === false) return;
    const forcePopover = this.plugin.settings.forcePopoverWithoutModKey === true;
    const wantsPopover = forcePopover || ev.ctrlKey || ev.metaKey;
    if (!wantsPopover) return;
    this.applyGlobalHoverPopoverStyleVars();
    const eventForPopover = forcePopover ? new MouseEvent("mousemove", {
      clientX: ev.clientX,
      clientY: ev.clientY,
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      metaKey: true
    }) : ev;
    const hoverTarget = targetEl instanceof HTMLElement ? targetEl : this.getDrawingHoverAnchor(ev.clientX, ev.clientY);
    this.app.workspace.trigger("hover-link", {
      event: eventForPopover,
      source: "zoom-map",
      hoverParent: this,
      targetEl: hoverTarget,
      linktext: link,
      sourcePath: this.cfg.sourcePath
    });
  }
  getDrawingHoverAnchor(clientX, clientY) {
    if (!this.drawingHoverAnchorEl) {
      this.drawingHoverAnchorEl = this.hudClipEl.createDiv();
      this.drawingHoverAnchorEl.setAttr("aria-hidden", "true");
      setCssProps(this.drawingHoverAnchorEl, {
        position: "absolute",
        width: "2px",
        height: "2px",
        pointerEvents: "none",
        opacity: "0",
        transform: "translate(-1px, -1px)",
        left: "0px",
        top: "0px"
      });
    }
    const rect = this.hudClipEl.getBoundingClientRect();
    this.drawingHoverAnchorEl.style.left = `${clientX - rect.left}px`;
    this.drawingHoverAnchorEl.style.top = `${clientY - rect.top}px`;
    return this.drawingHoverAnchorEl;
  }
  openDrawingRegionLink(d, opts) {
    var _a, _b;
    const link = ((_b = (_a = d.style) == null ? void 0 : _a.regionLink) != null ? _b : "").trim();
    if (!link) return;
    if (opts == null ? void 0 : opts.newTab) {
      this.openLinkInNewTab(link);
      return;
    }
    void this.app.workspace.openLinkText(link, this.cfg.sourcePath);
  }
  renderDrawings() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    if (!this.drawSvg || !this.drawStaticLayer || !this.drawDefs) return;
    this.drawSvg.setAttribute("width", String(this.imgW));
    this.drawSvg.setAttribute("height", String(this.imgH));
    while (this.drawStaticLayer.firstChild) {
      this.drawStaticLayer.removeChild(this.drawStaticLayer.firstChild);
    }
    while (this.drawDefs.firstChild) {
      this.drawDefs.removeChild(this.drawDefs.firstChild);
    }
    (_a = this.drawHitboxesEl) == null ? void 0 : _a.empty();
    if (!this.data || !Array.isArray(this.data.drawings) || this.data.drawings.length === 0) {
      return;
    }
    const visibleDrawLayers = new Set(
      ((_b = this.data.drawLayers) != null ? _b : []).filter((l) => l.visible).map((l) => l.id)
    );
    const toAbs = (nx, ny) => ({
      x: nx * this.imgW,
      y: ny * this.imgH
    });
    const ns = "http://www.w3.org/2000/svg";
    const doc = this.getOwnerDocument();
    for (const d of this.data.drawings) {
      if (!d.visible) continue;
      if (!visibleDrawLayers.has(d.layerId)) continue;
      const style = (_c = d.style) != null ? _c : {};
      const regionLink = ((_d = style.regionLink) != null ? _d : "").trim();
      const regionTooltip = ((_e = style.regionTooltip) != null ? _e : "").trim();
      const regionInvisible = !!style.regionInvisible;
      const interactiveRegion = this.canDrawingUseRegion(d) && (regionInvisible || !!regionLink || !!regionTooltip);
      let shape = null;
      let minX = 0;
      let minY = 0;
      let width = 0;
      let height = 0;
      let polylineLenPx = 0;
      let polylineMid = null;
      if (d.kind === "circle" && d.circle) {
        const { cx, cy, r } = d.circle;
        const c = toAbs(cx, cy);
        const radius = r * Math.max(this.imgW, this.imgH);
        minX = c.x - radius;
        minY = c.y - radius;
        width = radius * 2;
        height = radius * 2;
        const circ = doc.createElementNS(ns, "circle");
        circ.setAttribute("cx", String(c.x));
        circ.setAttribute("cy", String(c.y));
        circ.setAttribute("r", String(radius));
        shape = circ;
      } else if (d.kind === "rect" && d.rect) {
        const { x0, y0, x1, y1 } = d.rect;
        const a = toAbs(x0, y0);
        const b = toAbs(x1, y1);
        const x = Math.min(a.x, b.x);
        const y = Math.min(a.y, b.y);
        const w = Math.abs(a.x - b.x);
        const h = Math.abs(a.y - b.y);
        minX = x;
        minY = y;
        width = w;
        height = h;
        const rEl = doc.createElementNS(ns, "rect");
        rEl.setAttribute("x", String(x));
        rEl.setAttribute("y", String(y));
        rEl.setAttribute("width", String(w));
        rEl.setAttribute("height", String(h));
        shape = rEl;
      } else if (d.kind === "polygon" && d.polygon && d.polygon.length >= 2) {
        const path = doc.createElementNS(ns, "path");
        let dAttr = "";
        let minPx = Infinity;
        let minPy = Infinity;
        let maxPx = -Infinity;
        let maxPy = -Infinity;
        d.polygon.forEach((p, idx) => {
          const a = toAbs(p.x, p.y);
          dAttr += idx === 0 ? `M ${a.x} ${a.y}` : ` L ${a.x} ${a.y}`;
          minPx = Math.min(minPx, a.x);
          maxPx = Math.max(maxPx, a.x);
          minPy = Math.min(minPy, a.y);
          maxPy = Math.max(maxPy, a.y);
        });
        dAttr += " Z";
        path.setAttribute("d", dAttr);
        shape = path;
        if (Number.isFinite(minPx) && Number.isFinite(maxPx) && Number.isFinite(minPy) && Number.isFinite(maxPy)) {
          minX = minPx;
          minY = minPy;
          width = maxPx - minPx;
          height = maxPy - minPy;
        }
      } else if (d.kind === "polyline" && d.polyline && d.polyline.length >= 2) {
        const path = doc.createElementNS(ns, "path");
        let dAttr = "";
        let minPx = Infinity;
        let minPy = Infinity;
        let maxPx = -Infinity;
        let maxPy = -Infinity;
        const absPts = d.polyline.map((p) => toAbs(p.x, p.y));
        for (let i = 0; i < absPts.length; i += 1) {
          const a = absPts[i];
          dAttr += i === 0 ? `M ${a.x} ${a.y}` : ` L ${a.x} ${a.y}`;
          minPx = Math.min(minPx, a.x);
          maxPx = Math.max(maxPx, a.x);
          minPy = Math.min(minPy, a.y);
          maxPy = Math.max(maxPy, a.y);
        }
        for (let i = 1; i < absPts.length; i += 1) {
          polylineLenPx += Math.hypot(absPts[i].x - absPts[i - 1].x, absPts[i].y - absPts[i - 1].y);
        }
        if (polylineLenPx > 0) {
          const target = polylineLenPx / 2;
          let acc = 0;
          for (let i = 1; i < absPts.length; i += 1) {
            const p0 = absPts[i - 1];
            const p1 = absPts[i];
            const seg = Math.hypot(p1.x - p0.x, p1.y - p0.y);
            if (acc + seg >= target && seg > 0) {
              const t = (target - acc) / seg;
              const x = p0.x + (p1.x - p0.x) * t;
              const y = p0.y + (p1.y - p0.y) * t;
              const angleDeg = Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
              polylineMid = { x, y, angleDeg };
              break;
            }
            acc += seg;
          }
        }
        path.setAttribute("d", dAttr);
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");
        shape = path;
        if (Number.isFinite(minPx) && Number.isFinite(maxPx) && Number.isFinite(minPy) && Number.isFinite(maxPy)) {
          minX = minPx;
          minY = minPy;
          width = maxPx - minPx;
          height = maxPy - minPy;
        }
      }
      if (!shape || width <= 0 || height <= 0) continue;
      const handleCtx = (ev) => {
        this.hideTooltipSoon(0);
        if (this.measuring || this.calibrating) {
          return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        this.onDrawingContextMenu(ev, d);
      };
      const patternKind = d.kind === "polyline" ? "none" : (_f = style.fillPattern) != null ? _f : style.fillColor ? "solid" : "none";
      if (!regionInvisible && (patternKind === "striped" || patternKind === "cross" || patternKind === "wavy")) {
        const af = d.bakedPath ? this.app.vault.getAbstractFileByPath(d.bakedPath) : null;
        if (!d.bakedPath || !(af instanceof import_obsidian21.TFile)) {
          void this.bakePatternSvgToFile(d, {
            minX,
            minY,
            width,
            height
          });
        }
      }
      let patternHref = null;
      if (!regionInvisible && (patternKind === "striped" || patternKind === "cross" || patternKind === "wavy")) {
        if (d.bakedPath) {
          const af = this.app.vault.getAbstractFileByPath(d.bakedPath);
          if (af instanceof import_obsidian21.TFile) {
            const url = this.app.vault.getResourcePath(af);
            patternHref = url;
          } else {
            console.warn("ZoomMap: baked SVG file not found", {
              id: d.id,
              bakedPath: d.bakedPath
            });
          }
        }
      }
      if (!regionInvisible && patternHref) {
        const img = doc.createElementNS(ns, "image");
        img.setAttribute("href", patternHref);
        img.setAttribute("x", String(minX));
        img.setAttribute("y", String(minY));
        img.setAttribute("width", String(width));
        img.setAttribute("height", String(height));
        img.classList.add("zm-draw__shape");
        img.dataset.id = d.id;
        img.addEventListener("contextmenu", handleCtx);
        this.drawStaticLayer.appendChild(img);
      } else if (!regionInvisible && patternKind !== "none") {
        const fillColor = (_g = style.fillColor) != null ? _g : "none";
        const fillOp = typeof style.fillOpacity === "number" ? Math.min(Math.max(style.fillOpacity, 0), 1) : 0.15;
        const fillShape = shape.cloneNode(false);
        fillShape.classList.add("zm-draw__shape");
        fillShape.dataset.id = d.id;
        fillShape.setAttribute("fill", fillColor);
        fillShape.setAttribute("fill-opacity", String(fillOp));
        fillShape.setAttribute("stroke", "none");
        fillShape.addEventListener("contextmenu", handleCtx);
        this.drawStaticLayer.appendChild(fillShape);
      }
      const strokeColor = ((_h = style.strokeColor) != null ? _h : "#ff0000").trim() || "#ff0000";
      const strokeWidth = Number.isFinite(style.strokeWidth) && style.strokeWidth > 0 ? style.strokeWidth : 2;
      const strokeOpacity = typeof style.strokeOpacity === "number" ? Math.min(Math.max(style.strokeOpacity, 0), 1) : 1;
      const outline = shape;
      outline.classList.add("zm-draw__shape");
      outline.dataset.id = d.id;
      outline.setAttribute("fill", "none");
      outline.setAttribute("stroke", strokeColor);
      outline.setAttribute("stroke-width", String(strokeWidth));
      if (strokeOpacity < 1) {
        outline.setAttribute("stroke-opacity", String(strokeOpacity));
      } else {
        outline.removeAttribute("stroke-opacity");
      }
      if (Array.isArray(style.strokeDash) && style.strokeDash.length > 0) {
        outline.setAttribute("stroke-dasharray", style.strokeDash.join(" "));
      } else {
        outline.removeAttribute("stroke-dasharray");
      }
      if (d.kind === "polyline" && style.arrowEnd) {
        const markerId = `zm-arrow-${d.id}`;
        const marker = doc.createElementNS(ns, "marker");
        marker.setAttribute("id", markerId);
        marker.setAttribute("viewBox", "0 0 10 10");
        marker.setAttribute("refX", "10");
        marker.setAttribute("refY", "5");
        marker.setAttribute("markerWidth", "6");
        marker.setAttribute("markerHeight", "6");
        marker.setAttribute("orient", "auto");
        marker.setAttribute("markerUnits", "strokeWidth");
        const ap = doc.createElementNS(ns, "path");
        ap.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
        ap.setAttribute("fill", strokeColor);
        marker.appendChild(ap);
        this.drawDefs.appendChild(marker);
        outline.setAttribute("marker-end", `url(#${markerId})`);
      } else {
        outline.removeAttribute("marker-end");
      }
      if (!regionInvisible) {
        outline.addEventListener("contextmenu", handleCtx);
        this.drawStaticLayer.appendChild(outline);
        if (d.kind === "polyline" && style.distanceLabel && polylineMid && polylineLenPx > 0) {
          const txt = this.formatPolylineDistance(polylineLenPx);
          if (txt) {
            const tEl = doc.createElementNS(ns, "text");
            tEl.classList.add("zm-draw__label");
            tEl.setAttribute("x", String(polylineMid.x));
            tEl.setAttribute("y", String(polylineMid.y));
            tEl.setAttribute("text-anchor", "middle");
            tEl.setAttribute("dominant-baseline", "middle");
            tEl.setAttribute("fill", strokeColor);
            let ang = polylineMid.angleDeg;
            if (ang > 90 || ang < -90) ang += 180;
            while (ang > 180) ang -= 360;
            while (ang < -180) ang += 360;
            if (Math.abs(ang) > 0.01) {
              tEl.setAttribute("transform", `rotate(${ang} ${polylineMid.x} ${polylineMid.y})`);
            }
            tEl.textContent = txt;
            this.drawStaticLayer.appendChild(tEl);
          }
        }
      }
      if (interactiveRegion && this.drawHitboxesEl) {
        const hit = this.drawHitboxesEl.createDiv({ cls: "zm-draw-hitbox" });
        hit.dataset.id = d.id;
        hit.style.left = `${minX}px`;
        hit.style.top = `${minY}px`;
        hit.style.width = `${width}px`;
        hit.style.height = `${height}px`;
        if (d.kind === "circle") {
          hit.classList.add("zm-draw-hitbox--circle");
        } else if (d.kind === "polygon" && ((_i = d.polygon) == null ? void 0 : _i.length)) {
          const pts = d.polygon.map((p) => {
            const ax = p.x * this.imgW;
            const ay = p.y * this.imgH;
            const px = (ax - minX) / width * 100;
            const py = (ay - minY) / height * 100;
            return `${px}% ${py}%`;
          });
          hit.style.clipPath = `polygon(${pts.join(", ")})`;
        } else {
          hit.style.removeProperty("clip-path");
        }
        hit.addEventListener("mouseenter", (ev) => {
          this.triggerDrawingRegionHoverPopover(ev, d, hit);
          this.onDrawingRegionEnter(ev, d);
        });
        hit.addEventListener("mousemove", (ev) => {
          var _a2, _b2, _c2;
          const forcePopover = this.plugin.settings.forcePopoverWithoutModKey === true;
          if (!forcePopover && (ev.ctrlKey || ev.metaKey)) {
            this.triggerDrawingRegionHoverPopover(ev, d, hit);
          }
          if (((_b2 = (_a2 = d.style) == null ? void 0 : _a2.regionTooltip) != null ? _b2 : "").trim() && ((_c2 = this.tooltipEl) == null ? void 0 : _c2.classList.contains("zm-tooltip-visible"))) {
            this.positionTooltip(ev.clientX, ev.clientY);
          }
        });
        hit.addEventListener("mouseleave", () => {
          this.hideTooltipSoon();
        });
        hit.addEventListener("click", (ev) => {
          if (this.measuring || this.calibrating) return;
          if (!regionLink) return;
          ev.preventDefault();
          ev.stopPropagation();
          this.openDrawingRegionLink(d);
        });
        hit.addEventListener("mousedown", (ev) => {
          if (ev.button !== 1) return;
          if (!this.plugin.settings.middleClickOpensLinkInNewTab) return;
          if (!regionLink) return;
          ev.preventDefault();
          ev.stopPropagation();
        });
        hit.addEventListener("auxclick", (ev) => {
          if (ev.button !== 1) return;
          if (!this.plugin.settings.middleClickOpensLinkInNewTab) return;
          if (!regionLink) return;
          ev.preventDefault();
          ev.stopPropagation();
          this.openDrawingRegionLink(d, { newTab: true });
        });
        hit.addEventListener("contextmenu", handleCtx);
      }
    }
    this.renderDrawingEditHandles();
  }
  formatPolylineDistance(px) {
    var _a, _b, _c;
    const unit = (_c = (_b = (_a = this.data) == null ? void 0 : _a.measurement) == null ? void 0 : _b.displayUnit) != null ? _c : "auto-metric";
    if (unit === "custom") return this.formatCustomDistanceFromPixels(px);
    const mpp = this.getMetersPerPixel();
    if (!mpp) return null;
    return this.formatDistance(px * mpp);
  }
  buildPatternSvgMarkup(d, box) {
    var _a, _b, _c;
    const style = (_a = d.style) != null ? _a : {};
    const patternKind = (_b = style.fillPattern) != null ? _b : style.fillColor ? "solid" : "none";
    if (patternKind === "none" || patternKind === "solid") return null;
    const { minX, minY, width, height } = box;
    const maxX = minX + width;
    const maxY = minY + height;
    const toAbs = (nx, ny) => ({
      x: nx * this.imgW,
      y: ny * this.imgH
    });
    let clipBody = "";
    if (d.kind === "circle" && d.circle) {
      const { cx, cy, r } = d.circle;
      const c = toAbs(cx, cy);
      const radius = r * Math.max(this.imgW, this.imgH);
      clipBody = `<circle cx="${c.x}" cy="${c.y}" r="${radius}" />`;
    } else if (d.kind === "rect" && d.rect) {
      const { x0, y0, x1, y1 } = d.rect;
      const a = toAbs(x0, y0);
      const b = toAbs(x1, y1);
      const x = Math.min(a.x, b.x);
      const y = Math.min(a.y, b.y);
      const w = Math.abs(a.x - b.x);
      const h = Math.abs(a.y - b.y);
      clipBody = `<rect x="${x}" y="${y}" width="${w}" height="${h}" />`;
    } else if (d.kind === "polygon" && d.polygon && d.polygon.length >= 2) {
      let pathD = "";
      d.polygon.forEach((p, idx) => {
        const a = toAbs(p.x, p.y);
        pathD += idx === 0 ? `M ${a.x} ${a.y}` : ` L ${a.x} ${a.y}`;
      });
      pathD += " Z";
      clipBody = `<path d="${pathD}" />`;
    } else {
      return null;
    }
    const fillColor = (_c = style.fillColor) != null ? _c : "#ff0000";
    const fillOpacity = typeof style.fillOpacity === "number" ? Math.min(Math.max(style.fillOpacity, 0), 1) : 0.15;
    const spacing = typeof style.fillPatternSpacing === "number" && style.fillPatternSpacing > 0 ? style.fillPatternSpacing : 8;
    const rawAngle = typeof style.fillPatternAngle === "number" ? style.fillPatternAngle : 45;
    const angle = (rawAngle % 360 + 360) % 360;
    const strokeWidth = typeof style.fillPatternStrokeWidth === "number" && style.fillPatternStrokeWidth > 0 ? style.fillPatternStrokeWidth : 1;
    const patternOpacity = typeof style.fillPatternOpacity === "number" ? Math.min(Math.max(style.fillPatternOpacity, 0), 1) : fillOpacity;
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;
    let stripeContent = "";
    if (patternKind === "striped" || patternKind === "wavy") {
      for (let x = minX - width; x <= maxX + width; x += spacing) {
        if (patternKind === "striped") {
          const xf = x.toFixed(2);
          stripeContent += `<line x1="${xf}" y1="${(minY - height).toFixed(
            2
          )}" x2="${xf}" y2="${(maxY + height).toFixed(2)}" />`;
        } else {
          const xf = x.toFixed(2);
          const amp = height / 6;
          const segments = 8;
          let dPath = `M ${xf} ${minY.toFixed(2)}`;
          for (let i = 1; i <= segments; i += 1) {
            const t = i / segments;
            const y = minY + t * height;
            const midY = minY + (t - 0.5 / segments) * height;
            const dir = i % 2 === 0 ? -1 : 1;
            const ctrlX = x + dir * amp;
            dPath += ` C ${ctrlX.toFixed(2)} ${midY.toFixed(
              2
            )} ${ctrlX.toFixed(2)} ${midY.toFixed(2)} ${xf} ${y.toFixed(2)}`;
          }
          stripeContent += `<path d="${dPath}" />`;
        }
      }
    } else if (patternKind === "cross") {
      for (let x = minX - width; x <= maxX + width; x += spacing) {
        const xf = x.toFixed(2);
        stripeContent += `<line x1="${xf}" y1="${(minY - height).toFixed(
          2
        )}" x2="${xf}" y2="${(maxY + height).toFixed(2)}" />`;
      }
      for (let y = minY - height; y <= maxY + height; y += spacing) {
        const yf = y.toFixed(2);
        stripeContent += `<line x1="${(minX - width).toFixed(
          2
        )}" y1="${yf}" x2="${(maxX + width).toFixed(2)}" y2="${yf}" />`;
      }
    }
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${width}" height="${height}"
     viewBox="${minX} ${minY} ${width} ${height}">
  <defs>
    <clipPath id="clip">
      ${clipBody}
    </clipPath>
  </defs>
  <g clip-path="url(#clip)">
    <rect x="${minX}" y="${minY}" width="${width}" height="${height}"
          fill="${fillColor}" fill-opacity="${fillOpacity}" />
    <g stroke="${fillColor}"
       stroke-width="${strokeWidth}"
       stroke-opacity="${patternOpacity}"
       fill="none"
       transform="rotate(${angle} ${centerX} ${centerY})">
      ${stripeContent}
    </g>
  </g>
</svg>`;
    return svg;
  }
  async bakePatternSvgToFile(d, box) {
    var _a;
    const svg = this.buildPatternSvgMarkup(d, box);
    if (!svg) return;
    const vault = this.app.vault;
    const folder = "ZoomMap/draw-overlays";
    if (!vault.getAbstractFileByPath(folder)) {
      await vault.createFolder(folder);
    }
    const mapId = (_a = this.cfg.mapId) != null ? _a : this.cfg.sourcePath.replace(/[\\/]/g, "_").replace(/[^\w.-]/g, "_");
    const fileName = `${mapId}-${d.id}.svg`;
    const fullPath = `${folder}/${fileName}`;
    const existing = vault.getAbstractFileByPath(fullPath);
    if (existing instanceof import_obsidian21.TFile) {
      await vault.modify(existing, svg);
    } else {
      await vault.create(fullPath, svg);
    }
    d.bakedPath = fullPath;
    d.bakedWidth = box.width;
    d.bakedHeight = box.height;
    await this.saveDataSoon();
    if (this.ready) {
      this.renderDrawings();
    }
  }
  async deleteDrawing(d) {
    var _a, _b;
    if (!this.data) return;
    const index = ((_a = this.data.drawings) != null ? _a : []).findIndex((x) => x.id === d.id);
    if (index < 0) return;
    this.pushDeleteUndo(
      {
        kind: "drawing",
        drawing: cloneForUndo(d),
        index
      },
      `Delete ${d.kind}`
    );
    if (this.drawEditDrawingId === d.id) {
      this.drawEditDrawingId = null;
      this.drawEditMode = null;
      this.drawEditPointIndex = null;
      this.drawEditHandleKind = null;
      this.drawEditPointerId = null;
      this.drawEditOriginalDrawing = null;
    }
    if (d.bakedPath) {
      const af = this.app.vault.getAbstractFileByPath(d.bakedPath);
      if (af instanceof import_obsidian21.TFile) {
        try {
          await this.app.fileManager.trashFile(af, true);
        } catch (err) {
          console.error("Zoom Map: failed to delete baked SVG", d.bakedPath, err);
        }
      }
    }
    this.data.drawings = ((_b = this.data.drawings) != null ? _b : []).filter((x) => x.id !== d.id);
    await this.saveDataSoon();
    this.renderDrawings();
    new import_obsidian21.Notice("Drawing deleted.", 900);
  }
  onDrawingContextMenu(ev, d) {
    if (this.measuring || this.calibrating) {
      ev.preventDefault();
      ev.stopPropagation();
      this.openMeasureOnlyContextMenu(ev.clientX, ev.clientY);
      return;
    }
    this.closeMenu();
    const canApplyTextBox = d.kind === "rect" || d.kind === "polyline";
    const canEditGeometry = d.kind === "polygon" || d.kind === "polyline" || d.kind === "rect" || d.kind === "circle";
    const items = [
      {
        label: "Edit drawing\u2026",
        action: () => {
          var _a;
          this.closeMenu();
          if (!this.data) return;
          const modal = new DrawingEditorModal(
            this.app,
            d,
            (_a = this.data.drawLayers) != null ? _a : [],
            (res) => {
              var _a2;
              this.stopEditDrawingGeometry(true);
              if (!this.data) return;
              if (res.action === "save" && res.drawing) {
                const updated = res.drawing;
                const idx = ((_a2 = this.data.drawings) != null ? _a2 : []).findIndex(
                  (x) => x.id === d.id
                );
                if (idx >= 0 && this.data.drawings) {
                  this.data.drawings[idx].layerId = updated.layerId;
                  this.data.drawings[idx].style = updated.style;
                  this.data.drawings[idx].visible = updated.visible;
                  this.data.drawings[idx].rect = updated.rect;
                  this.data.drawings[idx].circle = updated.circle;
                  this.data.drawings[idx].polygon = updated.polygon;
                  this.data.drawings[idx].polyline = updated.polyline;
                  delete this.data.drawings[idx].bakedPath;
                  delete this.data.drawings[idx].bakedWidth;
                  delete this.data.drawings[idx].bakedHeight;
                }
                void this.saveDataSoon();
                this.renderDrawings();
              } else if (res.action === "delete") {
                void this.deleteDrawing(d);
              }
            }
          );
          modal.open();
        }
      },
      ...canEditGeometry ? [
        {
          label: this.drawEditDrawingId === d.id ? "Stop editing points" : d.kind === "polygon" || d.kind === "polyline" ? "Edit points\u2026" : "Edit shape\u2026",
          action: () => {
            this.closeMenu();
            if (this.drawEditDrawingId === d.id) {
              this.stopEditDrawingGeometry(true);
            } else {
              this.stopEditDrawingGeometry(true);
              this.startEditDrawingGeometry(d);
            }
          }
        }
      ] : [],
      ...this.plugin.settings.enableTextLayers && canApplyTextBox ? [
        {
          label: "Apply text box",
          children: [
            {
              label: "Custom",
              action: () => {
                this.closeMenu();
                this.applyDrawingAsTextBox(d, "custom");
              }
            },
            {
              label: "Auto",
              action: () => {
                this.closeMenu();
                this.applyDrawingAsTextBox(d, "auto");
              }
            }
          ]
        }
      ] : [],
      {
        label: "Delete drawing",
        action: () => {
          void this.deleteDrawing(d);
        }
      }
    ];
    this.openMenu = new ZMMenu(this.el.ownerDocument);
    this.openMenu.open(ev.clientX, ev.clientY, items);
    const doc = this.getOwnerDocument();
    const outside = (event) => {
      if (!this.openMenu) return;
      const t = event.target;
      if (t instanceof HTMLElement && this.openMenu.contains(t)) return;
      this.closeMenu();
    };
    const keyClose = (event) => {
      if (event.key === "Escape") this.closeMenu();
    };
    const rightClickClose = () => this.closeMenu();
    doc.addEventListener("pointerdown", outside, { capture: true });
    doc.addEventListener("contextmenu", rightClickClose, { capture: true });
    doc.addEventListener("keydown", keyClose, { capture: true });
    this.register(() => {
      doc.removeEventListener("pointerdown", outside, true);
      doc.removeEventListener("contextmenu", rightClickClose, true);
      doc.removeEventListener("keydown", keyClose, true);
    });
  }
  getOrCreateDefaultDrawLayer() {
    var _a, _b, _c;
    if (!this.data) {
      throw new Error("No marker data loaded");
    }
    (_b = (_a = this.data).drawLayers) != null ? _b : _a.drawLayers = [];
    let layer = (_c = this.data.drawLayers.find((l) => l.visible)) != null ? _c : this.data.drawLayers[0];
    if (!layer) {
      layer = {
        id: generateId("draw"),
        name: "Draw",
        visible: true,
        locked: false
      };
      this.data.drawLayers.push(layer);
    }
    return layer;
  }
  handleDrawClick(e) {
    var _a, _b, _c;
    if (!this.drawingMode) return false;
    if (!this.data) return false;
    const vpRect = this.viewportEl.getBoundingClientRect();
    const vx = e.clientX - vpRect.left;
    const vy = e.clientY - vpRect.top;
    const wx = (vx - this.tx) / this.scale;
    const wy = (vy - this.ty) / this.scale;
    const nx = clamp(wx / this.imgW, 0, 1);
    const ny = clamp(wy / this.imgH, 0, 1);
    const layerId = (_a = this.drawingActiveLayerId) != null ? _a : this.getOrCreateDefaultDrawLayer().id;
    if ((this.drawingMode === "polygon" || this.drawingMode === "polyline") && e.detail > 1) {
      return true;
    }
    if (this.drawingMode === "rect") {
      if (!this.drawRectStart) {
        this.drawRectStart = { x: nx, y: ny };
        return true;
      }
      const start = this.drawRectStart;
      const draft = {
        id: generateId("draw"),
        layerId,
        kind: "rect",
        visible: true,
        rect: { x0: start.x, y0: start.y, x1: nx, y1: ny },
        style: {
          strokeColor: "#ff0000",
          strokeWidth: 2,
          fillColor: "#ff0000",
          fillOpacity: 0.15
        }
      };
      this.drawingMode = null;
      this.drawingActiveLayerId = null;
      this.drawRectStart = null;
      this.drawCircleCenter = null;
      this.drawPolygonPoints = [];
      if (this.drawDraftLayer) {
        this.drawDraftLayer.innerHTML = "";
      }
      const modal = new DrawingEditorModal(
        this.app,
        draft,
        (_b = this.data.drawLayers) != null ? _b : [],
        (res) => {
          var _a2, _b2;
          if (!this.data) return;
          if (res.action === "save" && res.drawing) {
            (_b2 = (_a2 = this.data).drawings) != null ? _b2 : _a2.drawings = [];
            this.data.drawings.push(res.drawing);
            void this.saveDataSoon();
            this.renderDrawings();
          }
        }
      );
      modal.open();
      return true;
    }
    if (this.drawingMode === "circle") {
      if (!this.drawCircleCenter) {
        this.drawCircleCenter = { x: nx, y: ny };
        return true;
      }
      const center = this.drawCircleCenter;
      const radiusNorm = Math.hypot(nx - center.x, ny - center.y);
      const draft = {
        id: generateId("draw"),
        layerId,
        kind: "circle",
        visible: true,
        circle: { cx: center.x, cy: center.y, r: radiusNorm },
        style: {
          strokeColor: "#ff0000",
          strokeWidth: 2,
          fillColor: "#ff0000",
          fillOpacity: 0.15
        }
      };
      this.drawingMode = null;
      this.drawingActiveLayerId = null;
      this.drawRectStart = null;
      this.drawCircleCenter = null;
      this.drawPolygonPoints = [];
      if (this.drawDraftLayer) {
        this.drawDraftLayer.innerHTML = "";
      }
      const modal = new DrawingEditorModal(
        this.app,
        draft,
        (_c = this.data.drawLayers) != null ? _c : [],
        (res) => {
          var _a2, _b2;
          if (!this.data) return;
          if (res.action === "save" && res.drawing) {
            (_b2 = (_a2 = this.data).drawings) != null ? _b2 : _a2.drawings = [];
            this.data.drawings.push(res.drawing);
            void this.saveDataSoon();
            this.renderDrawings();
          }
        }
      );
      modal.open();
      return true;
    }
    if (this.drawingMode === "polygon") {
      this.drawPolygonPoints.push({ x: nx, y: ny });
      return true;
    }
    if (this.drawingMode === "polyline") {
      this.drawPolygonPoints.push({ x: nx, y: ny });
      return true;
    }
    return false;
  }
  finishPolygonDrawing() {
    var _a, _b;
    if (!this.drawingMode || this.drawingMode !== "polygon") return;
    if (!this.data) return;
    if (this.drawPolygonPoints.length < 2) return;
    const layerId = (_a = this.drawingActiveLayerId) != null ? _a : this.getOrCreateDefaultDrawLayer().id;
    const points = [...this.drawPolygonPoints];
    const draft = {
      id: generateId("draw"),
      layerId,
      kind: "polygon",
      visible: true,
      polygon: points,
      style: {
        strokeColor: "#ff0000",
        strokeWidth: 2,
        fillColor: "#ff0000",
        fillOpacity: 0.15
      }
    };
    this.drawingMode = null;
    this.drawingActiveLayerId = null;
    this.drawRectStart = null;
    this.drawCircleCenter = null;
    this.drawPolygonPoints = [];
    if (this.drawDraftLayer) {
      this.drawDraftLayer.innerHTML = "";
    }
    const modal = new DrawingEditorModal(
      this.app,
      draft,
      (_b = this.data.drawLayers) != null ? _b : [],
      (res) => {
        var _a2, _b2;
        if (!this.data) return;
        if (res.action === "save" && res.drawing) {
          (_b2 = (_a2 = this.data).drawings) != null ? _b2 : _a2.drawings = [];
          this.data.drawings.push(res.drawing);
          void this.saveDataSoon();
          this.renderDrawings();
        }
      }
    );
    modal.open();
  }
  finishPolylineDrawing() {
    var _a, _b;
    if (!this.drawingMode || this.drawingMode !== "polyline") return;
    if (!this.data) return;
    if (this.drawPolygonPoints.length < 2) return;
    const layerId = (_a = this.drawingActiveLayerId) != null ? _a : this.getOrCreateDefaultDrawLayer().id;
    const points = [...this.drawPolygonPoints];
    const draft = {
      id: generateId("draw"),
      layerId,
      kind: "polyline",
      visible: true,
      polyline: points,
      style: {
        strokeColor: "#ff0000",
        strokeWidth: 2,
        arrowEnd: true,
        distanceLabel: false
      }
    };
    this.drawingMode = null;
    this.drawingActiveLayerId = null;
    this.drawRectStart = null;
    this.drawCircleCenter = null;
    this.drawPolygonPoints = [];
    if (this.drawDraftLayer) {
      this.drawDraftLayer.innerHTML = "";
    }
    const modal = new DrawingEditorModal(
      this.app,
      draft,
      (_b = this.data.drawLayers) != null ? _b : [],
      (res) => {
        var _a2, _b2;
        if (!this.data) return;
        if (res.action === "save" && res.drawing) {
          (_b2 = (_a2 = this.data).drawings) != null ? _b2 : _a2.drawings = [];
          this.data.drawings.push(res.drawing);
          void this.saveDataSoon();
          this.renderDrawings();
        }
      }
    );
    modal.open();
  }
  updateDrawPreview(e) {
    if (!this.drawingMode) return false;
    if (!this.drawDraftLayer) return false;
    const doc = this.getOwnerDocument();
    const vpRect = this.viewportEl.getBoundingClientRect();
    const vx = e.clientX - vpRect.left;
    const vy = e.clientY - vpRect.top;
    const wx = (vx - this.tx) / this.scale;
    const wy = (vy - this.ty) / this.scale;
    const nx = clamp(wx / this.imgW, 0, 1);
    const ny = clamp(wy / this.imgH, 0, 1);
    this.drawDraftLayer.innerHTML = "";
    if (this.drawingMode === "rect") {
      if (!this.drawRectStart) return false;
      const start = this.drawRectStart;
      const x0 = start.x * this.imgW;
      const y0 = start.y * this.imgH;
      const x1 = nx * this.imgW;
      const y1 = ny * this.imgH;
      const x = Math.min(x0, x1);
      const y = Math.min(y0, y1);
      const w = Math.abs(x0 - x1);
      const h = Math.abs(y0 - y1);
      const r = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
      r.setAttribute("x", String(x));
      r.setAttribute("y", String(y));
      r.setAttribute("width", String(w));
      r.setAttribute("height", String(h));
      r.classList.add("zm-draw__shape");
      r.setAttribute("stroke", "#ff0000");
      r.setAttribute("stroke-width", "2");
      r.setAttribute("fill", "none");
      this.drawDraftLayer.appendChild(r);
      return true;
    }
    if (this.drawingMode === "circle") {
      if (!this.drawCircleCenter) return false;
      const cx = this.drawCircleCenter.x * this.imgW;
      const cy = this.drawCircleCenter.y * this.imgH;
      const px = nx * this.imgW;
      const py = ny * this.imgH;
      const radius = Math.hypot(px - cx, py - cy);
      const c = doc.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", String(cx));
      c.setAttribute("cy", String(cy));
      c.setAttribute("r", String(radius));
      c.classList.add("zm-draw__shape");
      c.setAttribute("stroke", "#ff0000");
      c.setAttribute("stroke-width", "2");
      c.setAttribute("fill", "none");
      this.drawDraftLayer.appendChild(c);
      return true;
    }
    if (this.drawingMode === "polygon") {
      if (this.drawPolygonPoints.length === 0) return false;
      const all = [...this.drawPolygonPoints, { x: nx, y: ny }];
      const path = doc.createElementNS("http://www.w3.org/2000/svg", "path");
      let dAttr = "";
      all.forEach((p, idx) => {
        const ax = p.x * this.imgW;
        const ay = p.y * this.imgH;
        dAttr += idx === 0 ? `M ${ax} ${ay}` : ` L ${ax} ${ay}`;
      });
      path.setAttribute("d", dAttr);
      path.classList.add("zm-draw__shape");
      path.setAttribute("stroke", "#ff0000");
      path.setAttribute("stroke-width", "2");
      path.setAttribute("fill", "none");
      this.drawDraftLayer.appendChild(path);
      return true;
    }
    if (this.drawingMode === "polyline") {
      if (this.drawPolygonPoints.length === 0) return false;
      const all = [...this.drawPolygonPoints, { x: nx, y: ny }];
      const path = doc.createElementNS("http://www.w3.org/2000/svg", "path");
      let dAttr = "";
      all.forEach((p, idx) => {
        const ax = p.x * this.imgW;
        const ay = p.y * this.imgH;
        dAttr += idx === 0 ? `M ${ax} ${ay}` : ` L ${ax} ${ay}`;
      });
      path.setAttribute("d", dAttr);
      path.classList.add("zm-draw__shape");
      path.setAttribute("stroke", "#ff0000");
      path.setAttribute("stroke-width", "2");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      this.drawDraftLayer.appendChild(path);
      return true;
    }
    return false;
  }
  saveMeasurementAsPolyline() {
    var _a, _b, _c;
    if (!this.plugin.settings.enableDrawing) return;
    if (!this.data) return;
    if (this.measurePts.length < 2) {
      new import_obsidian21.Notice("No measurement to save (need at least 2 points).", 2500);
      return;
    }
    const layerId = this.getOrCreateDefaultDrawLayer().id;
    const points = this.measurePts.map((p) => ({ x: p.x, y: p.y }));
    const draft = {
      id: generateId("draw"),
      layerId,
      kind: "polyline",
      visible: true,
      polyline: points,
      style: {
        strokeColor: (_a = this.plugin.settings.measureLineColor) != null ? _a : "#ff0000",
        strokeWidth: (_b = this.plugin.settings.measureLineWidth) != null ? _b : 2,
        arrowEnd: true,
        distanceLabel: true
      }
    };
    new DrawingEditorModal(
      this.app,
      draft,
      (_c = this.data.drawLayers) != null ? _c : [],
      (res) => {
        var _a2, _b2;
        if (!this.data) return;
        if (res.action === "save" && res.drawing) {
          (_b2 = (_a2 = this.data).drawings) != null ? _b2 : _a2.drawings = [];
          this.data.drawings.push(res.drawing);
          void this.saveDataSoon();
          this.renderDrawings();
          new import_obsidian21.Notice("Saved as polyline.", 1200);
        }
      }
    ).open();
  }
  renderAll() {
    this.worldEl.style.width = `${this.imgW}px`;
    this.worldEl.style.height = `${this.imgH}px`;
    this.overlaysEl.style.width = `${this.imgW}px`;
    this.overlaysEl.style.height = `${this.imgH}px`;
    this.gridEl.style.width = `${this.imgW}px`;
    this.gridEl.style.height = `${this.imgH}px`;
    this.markersEl.style.width = `${this.imgW}px`;
    this.markersEl.style.height = `${this.imgH}px`;
    if (this.measureEl) {
      this.measureEl.style.width = `${this.imgW}px`;
      this.measureEl.style.height = `${this.imgH}px`;
    }
    if (this.drawEl) {
      this.drawEl.style.width = `${this.imgW}px`;
      this.drawEl.style.height = `${this.imgH}px`;
    }
    if (this.drawHitboxesEl) {
      this.drawHitboxesEl.style.width = `${this.imgW}px`;
      this.drawHitboxesEl.style.height = `${this.imgH}px`;
    }
    if (this.textSvgWrap) {
      this.textSvgWrap.style.width = `${this.imgW}px`;
      this.textSvgWrap.style.height = `${this.imgH}px`;
    }
    if (this.textHitEl) {
      this.textHitEl.style.width = `${this.imgW}px`;
      this.textHitEl.style.height = `${this.imgH}px`;
    }
    if (this.textEditEl) {
      this.textEditEl.style.width = `${this.imgW}px`;
      this.textEditEl.style.height = `${this.imgH}px`;
    }
    this.renderGrids();
    this.markersEl.empty();
    this.renderMarkersOnly();
    this.renderMeasure();
    this.renderDrawingEditHandles();
    this.renderCalibrate();
    this.updateZoomControlsVisibility();
    this.renderDrawings();
    if (this.isCanvas()) this.renderCanvas();
    this.renderTextLayers();
  }
  renderMarkersOnly() {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!this.data) return;
    const s = this.scale;
    this.markersEl.empty();
    if (this.hudMarkersEl) this.hudMarkersEl.empty();
    const visibleLayers = new Set(
      this.data.layers.filter((l) => l.visible).map((l) => l.id)
    );
    const isPlayerView = this.isSecondScreenPlayerView();
    const isControllerView = this.isSecondScreenControllerView();
    const revealedMarkerIds = this.getRevealedMarkerIdSet();
    const rank = (m) => m.type === "sticker" ? 0 : 1;
    const toRender = this.data.markers.filter((m) => visibleLayers.has(m.layer)).filter((m) => {
      if (!isPlayerView) return true;
      return revealedMarkerIds.has(m.id);
    }).sort((a, b) => rank(a) - rank(b));
    const applyIconStyles = (imgEl, info) => {
      if (info.rotationDeg) imgEl.style.transform = `rotate(${info.rotationDeg}deg)`;
      else imgEl.style.removeProperty("transform");
      if (info.shadowFilter) imgEl.style.filter = info.shadowFilter;
      else imgEl.style.removeProperty("filter");
    };
    const vpRect = this.viewportEl.getBoundingClientRect();
    const vw = vpRect.width || 1;
    const vh = vpRect.height || 1;
    for (const m of toRender) {
      const isHud = m.anchorSpace === "viewport";
      const container = isHud ? this.hudMarkersEl : this.markersEl;
      if (!container) continue;
      let leftScreen;
      let topScreen;
      if (isHud) {
        const hx = (_b = m.hudX) != null ? _b : ((_a = m.x) != null ? _a : 0.5) * vw;
        const hy = (_d = m.hudY) != null ? _d : ((_c = m.y) != null ? _c : 0.5) * vh;
        leftScreen = hx;
        topScreen = hy;
      } else {
        leftScreen = m.x * this.imgW;
        topScreen = m.y * this.imgH;
      }
      const hostClasses = ["zm-marker"];
      if (isHud) hostClasses.push("zm-hud-marker");
      const host = container.createDiv({ cls: hostClasses.join(" ") });
      host.dataset.id = m.id;
      host.style.left = `${leftScreen}px`;
      host.style.top = `${topScreen}px`;
      host.style.zIndex = m.type === "sticker" ? "5" : "10";
      host.ondragstart = (ev) => ev.preventDefault();
      if (m.type !== "sticker") {
        const minZ = getMinZoom(m);
        const maxZ = getMaxZoom(m);
        if (typeof minZ === "number") host.dataset.minz = String(minZ);
        if (typeof maxZ === "number") host.dataset.maxz = String(maxZ);
        const visibleByZoom = (minZ === void 0 || Number.isFinite(minZ) && s >= minZ) && (maxZ === void 0 || Number.isFinite(maxZ) && s <= maxZ);
        if (!visibleByZoom) host.classList.add("zm-hidden");
      }
      if (this.isLayerLocked(m.layer)) host.classList.add("zm-marker--locked");
      if (isControllerView && !revealedMarkerIds.has(m.id)) {
        host.classList.add("zm-marker--player-hidden");
      }
      let icon;
      if (m.type === "sticker") {
        const size = Math.max(1, Math.round((_e = m.stickerSize) != null ? _e : 64));
        const anch = host.createDiv({ cls: "zm-marker-anchor" });
        anch.style.transform = `translate(${-size / 2}px, ${-size / 2}px)`;
        icon = anch.createEl("img", { cls: "zm-marker-icon" });
        icon.src = this.resolveResourceUrl((_f = m.stickerPath) != null ? _f : "");
        icon.style.width = `${size}px`;
        icon.draggable = false;
        anch.appendChild(icon);
      } else {
        const scaleLike = isScaleLikeSticker(m);
        let effectiveKey = m.iconKey;
        if (m.type === "swap") {
          const frame = this.getSwapFrameForMarker(m);
          if (frame == null ? void 0 : frame.iconKey) {
            effectiveKey = frame.iconKey;
          }
        }
        const info = this.getIconInfo(effectiveKey, m.sizeOverride);
        let imgUrl = info.imgUrl;
        const markerColor = (_g = m.iconColor) == null ? void 0 : _g.trim();
        if (markerColor && isSvgDataUrl(imgUrl)) {
          imgUrl = this.getTintedSvgDataUrl(imgUrl, markerColor);
        }
        if (isHud) {
          const anch = host.createDiv({ cls: "zm-marker-anchor" });
          anch.style.transform = `translate(${-info.anchorX}px, ${-info.anchorY}px)`;
          icon = anch.createEl("img", { cls: "zm-marker-icon" });
          icon.src = imgUrl;
          icon.style.width = `${info.size}px`;
          icon.draggable = false;
          applyIconStyles(icon, info);
          if (info.rotationDeg) {
            icon.style.transform = `rotate(${info.rotationDeg}deg)`;
          }
          anch.appendChild(icon);
        } else if (scaleLike) {
          const anch = host.createDiv({ cls: "zm-marker-anchor" });
          anch.style.transform = `translate(${-info.anchorX}px, ${-info.anchorY}px)`;
          icon = anch.createEl("img", { cls: "zm-marker-icon" });
          icon.src = imgUrl;
          icon.style.width = `${info.size}px`;
          icon.draggable = false;
          applyIconStyles(icon, info);
          if (info.rotationDeg) {
            icon.style.transform = `rotate(${info.rotationDeg}deg)`;
          }
          anch.appendChild(icon);
        } else {
          const inv = host.createDiv({ cls: "zm-marker-inv" });
          const invScale = this.cfg.responsive ? 1 : 1 / s;
          inv.style.transform = `scale(${invScale})`;
          const anch = inv.createDiv({ cls: "zm-marker-anchor" });
          anch.style.transform = `translate(${-info.anchorX}px, ${-info.anchorY}px)`;
          icon = anch.createEl("img", { cls: "zm-marker-icon" });
          icon.src = imgUrl;
          icon.style.width = `${info.size}px`;
          icon.draggable = false;
          applyIconStyles(icon, info);
          if (info.rotationDeg) {
            icon.style.transform = `rotate(${info.rotationDeg}deg)`;
          }
          anch.appendChild(icon);
        }
      }
      if (m.type !== "sticker" && !!m.tooltipLabelAlways && typeof m.tooltip === "string" && m.tooltip.trim().length > 0) {
        const effectiveKey = (() => {
          var _a2;
          if (m.type === "swap") {
            const fr = this.getSwapFrameForMarker(m);
            if (fr == null ? void 0 : fr.iconKey) return fr.iconKey;
          }
          return (_a2 = m.iconKey) != null ? _a2 : this.plugin.settings.defaultIconKey;
        })();
        const info = this.getIconInfo(effectiveKey, m.sizeOverride);
        const scaleLike = isScaleLikeSticker(m);
        const pos = m.tooltipLabelPosition === "above" ? "above" : "below";
        const gap = 6;
        const offX = typeof m.tooltipLabelOffsetX === "number" && Number.isFinite(m.tooltipLabelOffsetX) ? m.tooltipLabelOffsetX : 0;
        const offY = typeof m.tooltipLabelOffsetY === "number" && Number.isFinite(m.tooltipLabelOffsetY) ? m.tooltipLabelOffsetY : 0;
        const xOff = info.size / 2 - info.anchorX + offX;
        const yOffBase = pos === "above" ? -(info.anchorY + gap) : info.size - info.anchorY + gap;
        const yOff = yOffBase + offY;
        let parent = host;
        if (!isHud && !scaleLike) {
          const invScale = this.cfg.responsive ? 1 : 1 / s;
          let inv = host.querySelector(".zm-marker-inv");
          if (!inv) {
            inv = host.createDiv({ cls: "zm-marker-inv zm-marker-inv--label" });
            inv.style.transform = `scale(${invScale})`;
          }
          parent = inv;
        }
        const label = parent.createDiv({ cls: "zm-marker-label" });
        label.textContent = m.tooltip.trim();
        label.style.left = `${xOff}px`;
        label.style.top = `${yOff}px`;
        label.style.transform = pos === "above" ? "translate(-50%, -100%)" : "translate(-50%, 0)";
      }
      if (!this.cfg.displayOnly) {
        if (m.type !== "sticker") {
          host.addEventListener(
            "mouseenter",
            (ev) => this.onMarkerEnter(ev, m, host)
          );
          host.addEventListener("mouseleave", () => this.hideTooltipSoon());
        }
        host.addEventListener("click", (ev) => {
          if (this.measuring || this.calibrating) return;
          ev.stopPropagation();
          if (this.suppressClickMarkerId === m.id || this.dragMoved) return;
          if (m.type === "sticker") return;
          if (m.type === "switch") return;
          if (m.type === "dice") {
            void this.rollDiceMarker(m);
            return;
          }
          this.openMarkerLink(m);
        });
        host.addEventListener("mousedown", (ev) => {
          if (ev.button !== 1) return;
          if (!this.plugin.settings.middleClickOpensLinkInNewTab) return;
          if (this.measuring || this.calibrating) return;
          if (m.type === "sticker") return;
          ev.preventDefault();
          ev.stopPropagation();
        });
        host.addEventListener("auxclick", (ev) => {
          if (ev.button !== 1) return;
          if (!this.plugin.settings.middleClickOpensLinkInNewTab) return;
          if (this.measuring || this.calibrating) return;
          ev.preventDefault();
          ev.stopPropagation();
          if (this.suppressClickMarkerId === m.id || this.dragMoved) return;
          if (m.type === "sticker") return;
          this.openMarkerLink(m, { newTab: true });
        });
        host.addEventListener("pointerdown", (e) => {
          var _a2;
          if (this.measuring || this.calibrating) return;
          if (e.button === 1 && this.plugin.settings.middleClickOpensLinkInNewTab) {
            if (m.type === "sticker") return;
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          e.stopPropagation();
          if (e.button !== 0) return;
          if (this.isLayerLocked(m.layer)) return;
          this.hideTooltipSoon(0);
          this.plugin.setActiveMap(this);
          this.draggingMarkerId = m.id;
          this.dragMoved = false;
          const vpRectNow = this.viewportEl.getBoundingClientRect();
          const vx = e.clientX - vpRectNow.left;
          const vy = e.clientY - vpRectNow.top;
          if (isHud) {
            this.dragAnchorOffset = {
              dx: vx - leftScreen,
              dy: vy - topScreen
            };
          } else {
            const wxPointer = (vx - this.tx) / this.scale;
            const wyPointer = (vy - this.ty) / this.scale;
            const markerWx = m.x * this.imgW;
            const markerWy = m.y * this.imgH;
            this.dragAnchorOffset = {
              dx: wxPointer - markerWx,
              dy: wyPointer - markerWy
            };
          }
          host.classList.add("zm-marker--dragging");
          this.getOwnerBody().classList.add("zm-cursor-grabbing");
          (_a2 = host.setPointerCapture) == null ? void 0 : _a2.call(host, e.pointerId);
          e.preventDefault();
        });
        host.addEventListener("pointerup", () => {
          if (this.draggingMarkerId === m.id) {
            host.classList.remove("zm-marker--dragging");
            this.getOwnerBody().classList.remove("zm-cursor-grabbing");
          }
        });
        host.addEventListener("contextmenu", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          if (this.measuring || this.calibrating) {
            this.openMeasureOnlyContextMenu(ev.clientX, ev.clientY);
            return;
          }
          this.closeMenu();
          if (m.type === "switch") {
            if (!ev.altKey) {
              void this.applySwitchPin(m);
              return;
            }
            const items2 = this.applyPlayerRevealItems([
              {
                label: "Switch base now",
                action: () => {
                  this.closeMenu();
                  void this.applySwitchPin(m);
                }
              },
              {
                label: "Edit switch pin\u2026",
                action: () => {
                  var _a2;
                  this.closeMenu();
                  if (!this.data) return;
                  const bases = this.getBasesNormalized();
                  if (!bases.length) {
                    new import_obsidian21.Notice("No base images configured.", 2500);
                    return;
                  }
                  this.openSwitchPinModal(
                    {
                      basePaths: bases,
                      initialIconKey: ((_a2 = m.iconKey) != null ? _a2 : this.plugin.settings.defaultIconKey).trim() || this.plugin.settings.defaultIconKey,
                      initialRotate: !!m.switchRotate || !(typeof m.switchBase === "string" && m.switchBase.trim().length > 0),
                      initialSwitchBase: m.switchBase,
                      initialScaleLikeSticker: !!m.scaleLikeSticker,
                      initialHud: m.anchorSpace === "viewport"
                    },
                    (res) => {
                      var _a3, _b2, _c2;
                      if (!this.data) return;
                      if (res.action !== "save" || !res.value) return;
                      m.iconKey = res.value.iconKey;
                      if (res.value.rotate) {
                        m.switchRotate = true;
                        delete m.switchBase;
                      } else {
                        delete m.switchRotate;
                        m.switchBase = ((_a3 = res.value.switchBase) != null ? _a3 : "").trim() || void 0;
                      }
                      if (res.value.scaleLikeSticker) m.scaleLikeSticker = true;
                      else delete m.scaleLikeSticker;
                      if (res.value.placeAsHudPin) {
                        if (m.anchorSpace !== "viewport") {
                          m.anchorSpace = "viewport";
                          m.hudX = (_b2 = m.hudX) != null ? _b2 : 0;
                          m.hudY = (_c2 = m.hudY) != null ? _c2 : 0;
                          this.classifyHudMetaFromCurrentPosition(m, this.viewportEl.getBoundingClientRect());
                        }
                      } else {
                        delete m.anchorSpace;
                        delete m.hudX;
                        delete m.hudY;
                        delete m.hudModeX;
                        delete m.hudModeY;
                        delete m.hudLastWidth;
                        delete m.hudLastHeight;
                      }
                      void this.saveDataSoon();
                      this.renderMarkersOnly();
                    }
                  );
                }
              },
              {
                label: "Delete switch pin",
                action: () => {
                  this.closeMenu();
                  this.deleteMarker(m);
                }
              }
            ], m);
            this.openMenu = new ZMMenu(this.el.ownerDocument);
            this.openMenu.open(ev.clientX, ev.clientY, items2);
            return;
          }
          if (m.type === "dice") {
            const items2 = this.applyPlayerRevealItems([
              {
                label: "Roll dice",
                action: () => {
                  this.closeMenu();
                  void this.rollDiceMarker(m);
                }
              },
              {
                label: "Edit dice pin\u2026",
                action: () => {
                  var _a2, _b2;
                  this.closeMenu();
                  if (!this.data) return;
                  new DicePinModal(
                    this.app,
                    this.plugin,
                    {
                      iconKey: ((_a2 = m.iconKey) != null ? _a2 : this.plugin.settings.defaultIconKey).trim(),
                      rolls: (_b2 = m.diceRolls) != null ? _b2 : [{ count: 1, sides: 20 }],
                      scaleLikeSticker: !!m.scaleLikeSticker,
                      placeAsHudPin: m.anchorSpace === "viewport",
                      render3d: !!m.diceRender3d
                    },
                    (res) => {
                      var _a3, _b3, _c2;
                      if (!this.data) return;
                      if (res.action !== "save") return;
                      m.type = "dice";
                      m.iconKey = res.value.iconKey;
                      m.diceRolls = res.value.rolls;
                      if (res.value.render3d) m.diceRender3d = true;
                      else delete m.diceRender3d;
                      if (res.value.scaleLikeSticker) m.scaleLikeSticker = true;
                      else delete m.scaleLikeSticker;
                      const wantHud = !!res.value.placeAsHudPin;
                      const isHud2 = m.anchorSpace === "viewport";
                      const vpRect2 = this.viewportEl.getBoundingClientRect();
                      if (wantHud && !isHud2) {
                        const pos = this.worldNormToViewportPx(m.x, m.y);
                        m.anchorSpace = "viewport";
                        m.hudX = pos.x;
                        m.hudY = pos.y;
                        this.classifyHudMetaFromCurrentPosition(m, vpRect2);
                      } else if (!wantHud && isHud2) {
                        const hx = typeof m.hudX === "number" ? m.hudX : ((_a3 = m.x) != null ? _a3 : 0.5) * (vpRect2.width || 1);
                        const hy = typeof m.hudY === "number" ? m.hudY : ((_b3 = m.y) != null ? _b3 : 0.5) * (vpRect2.height || 1);
                        const world = this.viewportPxToWorldNorm(hx, hy);
                        m.x = world.x;
                        m.y = world.y;
                        delete m.anchorSpace;
                        delete m.hudX;
                        delete m.hudY;
                        delete m.hudModeX;
                        delete m.hudModeY;
                        delete m.hudLastWidth;
                        delete m.hudLastHeight;
                      }
                      if (!m.tooltip || m.tooltip.trim() === diceRollsToFormula((_c2 = m.diceRolls) != null ? _c2 : [])) {
                        m.tooltip = diceRollsToFormula(res.value.rolls);
                      }
                      void this.saveDataSoon();
                      this.renderMarkersOnly();
                    }
                  ).open();
                }
              },
              {
                label: "Delete dice pin",
                action: () => {
                  this.closeMenu();
                  this.deleteMarker(m);
                }
              }
            ], m);
            this.openMenu = new ZMMenu(this.el.ownerDocument);
            this.openMenu.open(ev.clientX, ev.clientY, items2);
            return;
          }
          if (m.type === "ping") {
            const items2 = this.applyPlayerRevealItems([
              {
                label: "Open party note",
                action: () => {
                  this.closeMenu();
                  this.openMarkerLink(m);
                }
              },
              {
                label: "Recalculate party",
                action: () => {
                  this.closeMenu();
                  void this.updatePingNoteForMarker(m).then(() => {
                    new import_obsidian21.Notice("Party note updated.", 1200);
                  });
                }
              },
              {
                label: "Delete party pin",
                action: () => {
                  this.closeMenu();
                  this.deleteMarker(m);
                }
              }
            ], m);
            this.openMenu = new ZMMenu(this.el.ownerDocument);
            this.openMenu.open(ev.clientX, ev.clientY, items2);
            return;
          }
          if (m.type === "swap") {
            const preset = m.swapKey ? this.findSwapPresetById(m.swapKey) : void 0;
            if (!preset) return;
            if (!ev.altKey) {
              this.advanceSwapPin(m);
              void this.saveDataSoon();
              this.renderMarkersOnly();
              return;
            }
            const items2 = this.applyPlayerRevealItems([
              {
                label: "Edit swap pin links\u2026 ",
                action: () => {
                  this.closeMenu();
                  if (!this.data) return;
                  new SwapLinksEditorModal(
                    this.app,
                    this.plugin,
                    m,
                    preset,
                    (res) => {
                      if (res.action !== "save") return;
                      if (!this.data) return;
                      if (res.swapLinks && Object.keys(res.swapLinks).length > 0) {
                        m.swapLinks = res.swapLinks;
                      } else {
                        delete m.swapLinks;
                      }
                      void this.saveDataSoon();
                      this.renderMarkersOnly();
                    }
                  ).open();
                }
              },
              {
                label: "Pin sizes for this map\u2026",
                action: () => {
                  var _a2, _b2;
                  this.closeMenu();
                  const fr = this.getSwapFrameForMarker(m);
                  const key = ((_b2 = (_a2 = fr == null ? void 0 : fr.iconKey) != null ? _a2 : m.iconKey) != null ? _b2 : this.plugin.settings.defaultIconKey).trim();
                  this.openPinSizeEditor(key);
                }
              },
              {
                label: "Edit swap preset\u2026",
                action: () => {
                  this.closeMenu();
                  new SwapFramesEditorModal(
                    this.app,
                    this.plugin,
                    preset,
                    (updated) => {
                      preset.name = updated.name;
                      preset.frames = updated.frames;
                      preset.defaultHud = updated.defaultHud;
                      preset.defaultScaleLikeSticker = updated.defaultScaleLikeSticker;
                      preset.hoverPopover = updated.hoverPopover;
                      preset.layerName = updated.layerName;
                      void this.plugin.saveSettings();
                      this.renderMarkersOnly();
                    }
                  ).open();
                }
              },
              {
                label: "Delete swap pin",
                action: () => {
                  this.closeMenu();
                  this.deleteMarker(m);
                }
              }
            ], m);
            this.openMenu = new ZMMenu(this.el.ownerDocument);
            this.openMenu.open(ev.clientX, ev.clientY, items2);
            const doc2 = this.getOwnerDocument();
            const outside2 = (event) => {
              if (!this.openMenu) return;
              const t = event.target;
              if (t instanceof HTMLElement && this.openMenu.contains(t)) return;
              this.closeMenu();
            };
            const keyClose2 = (event) => {
              if (event.key === "Escape") this.closeMenu();
            };
            const rightClickClose2 = () => this.closeMenu();
            doc2.addEventListener("pointerdown", outside2, {
              capture: true
            });
            doc2.addEventListener("contextmenu", rightClickClose2, {
              capture: true
            });
            doc2.addEventListener("keydown", keyClose2, { capture: true });
            this.register(() => {
              doc2.removeEventListener("pointerdown", outside2, true);
              doc2.removeEventListener("contextmenu", rightClickClose2, true);
              doc2.removeEventListener("keydown", keyClose2, true);
            });
            return;
          }
          const items = this.applyPlayerRevealItems([
            {
              label: m.type === "sticker" ? "Edit sticker" : "Edit marker",
              action: () => {
                if (!this.data) return;
                const modal = new MarkerEditorModal(
                  this.app,
                  this.plugin,
                  this.data,
                  m,
                  (res) => {
                    if (res.action === "save" && res.marker && this.data) {
                      const idx = this.data.markers.findIndex(
                        (mm) => mm.id === m.id
                      );
                      if (idx >= 0) this.data.markers[idx] = res.marker;
                      void this.saveDataSoon();
                      this.renderMarkersOnly();
                    } else if (res.action === "delete") {
                      this.deleteMarker(m);
                    }
                  }
                );
                this.closeMenu();
                modal.open();
              }
            },
            {
              label: m.type === "sticker" ? "Delete sticker" : "Delete marker",
              action: () => {
                this.deleteMarker(m);
                this.closeMenu();
              }
            }
          ], m);
          if (m.type !== "sticker") {
            items.push({
              label: "Pin sizes for this map\u2026",
              action: () => {
                var _a2;
                const key = (_a2 = m.iconKey) != null ? _a2 : this.plugin.settings.defaultIconKey;
                this.openPinSizeEditor(key);
                this.closeMenu();
              }
            });
          }
          this.openMenu = new ZMMenu(this.el.ownerDocument);
          this.openMenu.open(ev.clientX, ev.clientY, items);
          const doc = this.getOwnerDocument();
          const outside = (event) => {
            if (!this.openMenu) return;
            const t = event.target;
            if (t instanceof HTMLElement && this.openMenu.contains(t))
              return;
            this.closeMenu();
          };
          const keyClose = (event) => {
            if (event.key === "Escape") this.closeMenu();
          };
          const rightClickClose = () => this.closeMenu();
          doc.addEventListener("pointerdown", outside, { capture: true });
          doc.addEventListener("contextmenu", rightClickClose, { capture: true });
          doc.addEventListener("keydown", keyClose, { capture: true });
          this.register(() => {
            doc.removeEventListener("pointerdown", outside, true);
            doc.removeEventListener("contextmenu", rightClickClose, true);
            doc.removeEventListener("keydown", keyClose, true);
          });
        });
      }
    }
  }
  buildPlayerRevealMenuItems(m) {
    if (!this.isSecondScreenControllerView()) return [];
    if (!this.data) return [];
    const revealed = this.getRevealedMarkerIdSet();
    const isRevealed = revealed.has(m.id);
    return [
      {
        label: isRevealed ? "Hide from players" : "Reveal to players",
        action: () => {
          this.toggleMarkerRevealedForPlayers(m.id);
          this.closeMenu();
        }
      }
    ];
  }
  toggleMarkerRevealedForPlayers(markerId) {
    var _a, _b, _c;
    if (!this.data) return;
    (_b = (_a = this.data).secondScreen) != null ? _b : _a.secondScreen = {};
    const current = new Set((_c = this.data.secondScreen.revealedMarkerIds) != null ? _c : []);
    if (current.has(markerId)) current.delete(markerId);
    else current.add(markerId);
    this.data.secondScreen.revealedMarkerIds = [...current].sort();
    void this.saveDataSoon();
    this.renderMarkersOnly();
  }
  applyPlayerRevealItems(items, m) {
    const reveal = this.buildPlayerRevealMenuItems(m);
    if (!reveal.length) return items;
    return [
      ...reveal,
      { type: "separator" },
      ...items
    ];
  }
  onMarkerEnter(ev, m, hostEl) {
    if (m.type === "sticker") return;
    if (this.measuring || this.calibrating) return;
    let link;
    let hoverOverride = false;
    if (m.type === "swap") {
      link = this.getSwapEffectiveLink(m);
      if (m.swapKey) {
        const preset = this.findSwapPresetById(m.swapKey);
        hoverOverride = !!(preset == null ? void 0 : preset.hoverPopover);
      }
    } else {
      link = m.link;
    }
    const hasTooltipText = !!m.tooltip && m.tooltip.trim().length > 0;
    const wantLinkNameTooltip = !!this.plugin.settings.showLinkFileNameInTooltip && !!link;
    const wantInternalTooltip = hasTooltipText && (!!m.tooltipAlwaysOn || !link) || wantLinkNameTooltip;
    if (link) {
      const workspace = this.app.workspace;
      const forcePopover = this.plugin.settings.forcePopoverWithoutModKey === true || hoverOverride === true;
      this.applyGlobalHoverPopoverStyleVars();
      const eventForPopover = forcePopover ? new MouseEvent("mousemove", {
        clientX: ev.clientX,
        clientY: ev.clientY,
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
        metaKey: true
      }) : ev;
      workspace.trigger("hover-link", {
        event: eventForPopover,
        source: "zoom-map",
        hoverParent: this,
        targetEl: hostEl,
        linktext: link,
        sourcePath: this.cfg.sourcePath
      });
      if (wantInternalTooltip) {
        const title = wantLinkNameTooltip ? this.getLinkDisplayName(link) : void 0;
        this.showInternalTooltip(ev, m, { title });
      }
      return;
    }
    if (wantInternalTooltip) {
      this.showInternalTooltip(ev, m);
    }
  }
  getLinkDisplayName(link) {
    var _a;
    const f = this.resolveTFile(link, this.cfg.sourcePath);
    if (f) return f.basename;
    const raw = (_a = (link != null ? link : "").split("#")[0]) != null ? _a : "";
    return basename(raw);
  }
  showInternalTooltip(ev, m, opts) {
    var _a, _b, _c, _d;
    if (!this.ready) return;
    const text = ((_a = m.tooltip) != null ? _a : "").trim();
    const title = ((_b = opts == null ? void 0 : opts.title) != null ? _b : "").trim();
    if (!text && !title) return;
    if (!this.tooltipEl) {
      this.tooltipEl = this.hudClipEl.createDiv({ cls: "zm-tooltip" });
      this.tooltipEl.addEventListener(
        "mouseenter",
        () => this.cancelHideTooltip()
      );
      this.tooltipEl.addEventListener(
        "mouseleave",
        () => this.hideTooltipSoon()
      );
    }
    this.tooltipEl.style.maxWidth = `${(_c = this.plugin.settings.hoverMaxWidth) != null ? _c : 360}px`;
    this.tooltipEl.style.maxHeight = `${(_d = this.plugin.settings.hoverMaxHeight) != null ? _d : 260}px`;
    this.cancelHideTooltip();
    this.tooltipEl.empty();
    if (title) this.tooltipEl.createEl("div", { cls: "zm-tooltip__title", text: title });
    if (text) this.tooltipEl.createEl("div", { cls: "zm-tooltip__body", text });
    this.positionTooltip(ev.clientX, ev.clientY);
    this.tooltipEl.classList.add("zm-tooltip-visible");
  }
  positionTooltip(clientX, clientY) {
    if (!this.tooltipEl) return;
    const pad = 12;
    const vpRect = this.hudClipEl.getBoundingClientRect();
    let x = clientX - vpRect.left + pad;
    let y = clientY - vpRect.top + pad;
    const rect = this.tooltipEl.getBoundingClientRect();
    const vw = vpRect.width;
    const vh = vpRect.height;
    if (x + rect.width > vw) x = clientX - vpRect.left - rect.width - pad;
    if (x < 0) x = pad;
    if (y + rect.height > vh) y = clientY - vpRect.top - rect.height - pad;
    if (y < 0) y = pad;
    setCssProps(this.tooltipEl, { left: `${x}px`, top: `${y}px` });
  }
  hideTooltipSoon(delay = 150) {
    if (!this.tooltipEl) return;
    this.cancelHideTooltip();
    this.tooltipHideTimer = window.setTimeout(() => {
      var _a;
      (_a = this.tooltipEl) == null ? void 0 : _a.classList.remove("zm-tooltip-visible");
    }, delay);
  }
  cancelHideTooltip() {
    if (this.tooltipHideTimer !== null) {
      window.clearTimeout(this.tooltipHideTimer);
      this.tooltipHideTimer = null;
    }
  }
  getIconInfo(iconKey, sizeOverride) {
    var _a, _b, _c, _d, _e;
    const key = iconKey != null ? iconKey : this.plugin.settings.defaultIconKey;
    const profile = (_a = this.plugin.settings.icons.find((i) => i.key === key)) != null ? _a : this.plugin.builtinIcon();
    const baseSize = profile.size;
    const overrideSize = typeof sizeOverride === "number" && Number.isFinite(sizeOverride) && sizeOverride > 0 ? Math.round(sizeOverride) : (_c = (_b = this.data) == null ? void 0 : _b.pinSizeOverrides) == null ? void 0 : _c[key];
    const size = overrideSize && Number.isFinite(overrideSize) && overrideSize > 0 ? overrideSize : baseSize;
    const imgUrl = this.resolveResourceUrl(profile.pathOrDataUrl);
    const rotationDeg = (_d = profile.rotationDeg) != null ? _d : 0;
    const shadowFilter = profile.shadowEnabled ? `drop-shadow(${Number.isFinite(profile.shadowOffsetXPx) ? profile.shadowOffsetXPx : 2}px ${Number.isFinite(profile.shadowOffsetYPx) ? profile.shadowOffsetYPx : 2}px ${Number.isFinite(profile.shadowBlurPx) ? Math.max(0, profile.shadowBlurPx) : 6}px ${((_e = profile.shadowColor) != null ? _e : "#000000").trim() || "#000000"})` : "";
    return {
      imgUrl,
      size,
      anchorX: profile.anchorX,
      anchorY: profile.anchorY,
      rotationDeg,
      shadowFilter
    };
  }
  getIconDefaultLink(iconKey) {
    const key = iconKey != null ? iconKey : this.plugin.settings.defaultIconKey;
    const icon = this.plugin.settings.icons.find((i) => i.key === key);
    const raw = icon == null ? void 0 : icon.defaultLink;
    if (!raw) return void 0;
    const trimmed = raw.trim();
    return trimmed.length ? trimmed : void 0;
  }
  classifyHudMetaFromCurrentPosition(m, vpRect) {
    var _a, _b;
    const W = vpRect.width || 1;
    const H = vpRect.height || 1;
    const centerX = W / 2;
    const centerY = H / 2;
    const eps = 1;
    let hudX = (_a = m.hudX) != null ? _a : 0;
    let hudY = (_b = m.hudY) != null ? _b : 0;
    let modeX;
    if (Math.abs(hudX - centerX) <= eps) {
      modeX = "center";
      hudX = centerX;
    } else if (hudX > centerX) {
      modeX = "right";
    } else {
      modeX = "left";
    }
    let modeY;
    if (Math.abs(hudY - centerY) <= eps) {
      modeY = "center";
      hudY = centerY;
    } else if (hudY > centerY) {
      modeY = "bottom";
    } else {
      modeY = "top";
    }
    m.anchorSpace = "viewport";
    m.hudX = hudX;
    m.hudY = hudY;
    m.hudModeX = modeX;
    m.hudModeY = modeY;
    m.hudLastWidth = W;
    m.hudLastHeight = H;
    m.x = W > 0 ? hudX / W : 0;
    m.y = H > 0 ? hudY / H : 0;
  }
  updateHudPinsForResize(vpRect) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
    if (!this.data) return;
    const W = vpRect.width || 1;
    const H = vpRect.height || 1;
    const centerX = W / 2;
    const centerY = H / 2;
    for (const m of this.data.markers) {
      if (m.anchorSpace !== "viewport") continue;
      if (!Number.isFinite((_a = m.hudLastWidth) != null ? _a : NaN) || !Number.isFinite((_b = m.hudLastHeight) != null ? _b : NaN)) {
        if (typeof m.hudX !== "number" || typeof m.hudY !== "number") {
          const approxX = ((_c = m.x) != null ? _c : 0.5) * W;
          const approxY = ((_d = m.y) != null ? _d : 0.5) * H;
          m.hudX = approxX;
          m.hudY = approxY;
        }
        this.classifyHudMetaFromCurrentPosition(m, vpRect);
        continue;
      }
      const lastW = (_e = m.hudLastWidth) != null ? _e : W;
      const lastH = (_f = m.hudLastHeight) != null ? _f : H;
      const dW = W - lastW;
      const dH = H - lastH;
      let hudX = (_h = m.hudX) != null ? _h : ((_g = m.x) != null ? _g : 0.5) * W;
      let hudY = (_j = m.hudY) != null ? _j : ((_i = m.y) != null ? _i : 0.5) * H;
      const modeX = (_k = m.hudModeX) != null ? _k : "center";
      if (modeX === "left") {
      } else if (modeX === "right") {
        hudX += dW;
        if (hudX <= centerX) {
          hudX = centerX;
          m.hudModeX = "center";
        }
      } else {
        hudX = centerX;
      }
      const modeY = (_l = m.hudModeY) != null ? _l : "center";
      if (modeY === "top") {
      } else if (modeY === "bottom") {
        hudY += dH;
        if (hudY <= centerY) {
          hudY = centerY;
          m.hudModeY = "center";
        }
      } else {
        hudY = centerY;
      }
      m.hudX = hudX;
      m.hudY = hudY;
      m.hudLastWidth = W;
      m.hudLastHeight = H;
      m.x = W > 0 ? hudX / W : 0;
      m.y = H > 0 ? hudY / H : 0;
    }
  }
  openMarkerLink(m, opts) {
    var _a;
    const link = (_a = this.getSwapEffectiveLink(m)) == null ? void 0 : _a.trim();
    if (!link) return;
    if (opts == null ? void 0 : opts.newTab) {
      this.openLinkInNewTab(link);
      return;
    }
    void this.app.workspace.openLinkText(link, this.cfg.sourcePath);
  }
  async setActiveBase(path) {
    if (!this.data) return;
    if (this.currentBasePath === path && this.imgW > 0 && this.imgH > 0) return;
    this.updateSvgBaseFlag(path);
    this.data.activeBase = path;
    if (this.isCanvas()) {
      await this.loadBaseSourceByPath(path);
    } else {
      const file = this.resolveTFile(path, this.cfg.sourcePath);
      if (!file) {
        new import_obsidian21.Notice(`Base image not found: ${path}`);
        return;
      }
      const url = this.app.vault.getResourcePath(file);
      await new Promise((resolve, reject) => {
        this.imgEl.onload = () => {
          this.imgW = this.imgEl.naturalWidth;
          this.imgH = this.imgEl.naturalHeight;
          resolve();
        };
        this.imgEl.onerror = () => reject(new Error("Failed to load image."));
        this.imgEl.src = url;
      });
      this.currentBasePath = path;
    }
    if (this.cfg.responsive) this.updateResponsiveAspectRatio();
    this.renderAll();
    if (this.cfg.responsive) this.fitToView();
    else this.applyTransform(this.scale, this.tx, this.ty);
    await this.applyBoundBaseVisibility();
    void this.saveDataSoon();
    this.persistSecondScreenViewSoon();
    if (!this.isCanvas()) this.updateOverlaySizes();
    else this.renderCanvas();
  }
  async applyActiveBaseAndOverlays() {
    await this.setActiveBase(this.getActiveBasePath());
    if (this.isCanvas()) {
      await this.ensureVisibleOverlaysLoaded();
      this.renderCanvas();
    } else {
      this.buildOverlayElements();
      this.updateOverlaySizes();
      await this.updateOverlayVisibility();
    }
  }
  buildOverlayElements() {
    var _a;
    if (this.isCanvas()) return;
    this.overlayMap.clear();
    this.overlaysEl.empty();
    if (!this.data) return;
    for (const o of (_a = this.data.overlays) != null ? _a : []) {
      const f = this.resolveTFile(o.path, this.cfg.sourcePath);
      if (!f) continue;
      const url = this.app.vault.getResourcePath(f);
      const el = this.overlaysEl.createEl("img", { cls: "zm-overlay-image" });
      el.decoding = "async";
      el.loading = "eager";
      el.draggable = false;
      el.src = url;
      if (!o.visible) el.classList.add("zm-overlay-hidden");
      this.overlayMap.set(o.path, el);
    }
  }
  updateOverlaySizes() {
    if (this.isCanvas()) return;
    this.overlaysEl.style.width = `${this.imgW}px`;
    this.overlaysEl.style.height = `${this.imgH}px`;
  }
  async updateOverlayVisibility() {
    var _a;
    if (!this.data) return;
    if (this.isCanvas()) {
      await this.ensureVisibleOverlaysLoaded();
      this.renderCanvas();
      return;
    }
    for (const o of (_a = this.data.overlays) != null ? _a : []) {
      const el = this.overlayMap.get(o.path);
      if (!el) continue;
      if (o.visible) el.classList.remove("zm-overlay-hidden");
      else el.classList.add("zm-overlay-hidden");
    }
  }
  async reloadMarkers() {
    try {
      const loaded = await this.store.load();
      this.data = loaded;
      if (!this.ready) return;
      await this.applyActiveBaseAndOverlays();
      this.renderMarkersOnly();
      this.renderGrids();
      this.renderMeasure();
      this.renderCalibrate();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      new import_obsidian21.Notice(`Failed to reload markers: ${message}`);
      return;
    }
    if (this.isSecondScreenPlayerView()) {
      this.applySecondScreenViewFromData();
    }
  }
  installGrip(grip, side) {
    let startW = 0;
    let startH = 0;
    let startX = 0;
    let startY = 0;
    const minW = 220;
    const minH = 220;
    const onMove = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let w = startW + (side === "right" ? dx : -dx);
      let h = startH + dy;
      if (w < minW) w = minW;
      if (h < minH) h = minH;
      this.el.style.width = `${w}px`;
      this.el.style.height = `${h}px`;
      this.onResize();
    };
    const onUp = () => {
      const ownerWindow = this.getOwnerWindow();
      ownerWindow.removeEventListener("pointermove", onMove);
      ownerWindow.removeEventListener("pointerup", onUp, true);
      this.getOwnerBody().classList.remove("zm-cursor-resize-nwse", "zm-cursor-resize-nesw");
      this.userResizing = false;
      if (this.shouldUseSavedFrame() && this.cfg.resizable) void this.persistFrameNow();
    };
    grip.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = this.el.getBoundingClientRect();
      startW = rect.width;
      startH = rect.height;
      startX = e.clientX;
      startY = e.clientY;
      const ownerWindow = this.getOwnerWindow();
      if (side === "right") this.getOwnerBody().classList.add("zm-cursor-resize-nwse");
      else this.getOwnerBody().classList.add("zm-cursor-resize-nesw");
      this.userResizing = true;
      ownerWindow.addEventListener("pointermove", onMove);
      ownerWindow.addEventListener("pointerup", onUp, true);
    });
  }
  shouldUseSavedFrame() {
    var _a, _b;
    return !!this.cfg.resizable && !(((_a = this.cfg.widthFromYaml) != null ? _a : false) || ((_b = this.cfg.heightFromYaml) != null ? _b : false)) && !this.cfg.responsive;
  }
  isFrameVisibleEnough(minPx = 48) {
    var _a;
    if (!((_a = this.el) == null ? void 0 : _a.isConnected)) return false;
    if (this.el.offsetParent === null) return false;
    const rect = this.el.getBoundingClientRect();
    return rect.width >= minPx && rect.height >= minPx;
  }
  requestPersistFrame(delay = 500) {
    if (this.frameSaveTimer) window.clearTimeout(this.frameSaveTimer);
    this.frameSaveTimer = window.setTimeout(() => {
      this.frameSaveTimer = null;
      void this.persistFrameNow();
    }, delay);
  }
  persistFrameNow() {
    if (this.cfg.responsive) return;
    if (!this.data || !this.shouldUseSavedFrame()) return;
    if (!this.isFrameVisibleEnough(48)) return;
    const rr = this.el.getBoundingClientRect();
    const wNow = Math.round(rr.width);
    const hNow = Math.round(rr.height);
    if (wNow < 48 || hNow < 48) return;
    const prev = this.data.frame;
    const tol = 1;
    if (prev && Math.abs(wNow - prev.w) <= tol && Math.abs(hNow - prev.h) <= tol) return;
    const w = prev && Math.abs(wNow - prev.w) <= tol ? prev.w : wNow;
    const h = prev && Math.abs(hNow - prev.h) <= tol ? prev.h : hNow;
    if (w !== (prev == null ? void 0 : prev.w) || h !== (prev == null ? void 0 : prev.h)) {
      this.data.frame = { w, h };
      void this.saveDataSoon();
    }
  }
  applyMeasureStyle() {
    var _a, _b;
    const color = ((_a = this.plugin.settings.measureLineColor) != null ? _a : "var(--text-accent)").trim();
    const widthPx = Math.max(1, (_b = this.plugin.settings.measureLineWidth) != null ? _b : 2);
    setCssProps(this.el, {
      "--zm-measure-color": color,
      "--zm-measure-width": `${widthPx}px`
    });
  }
  showZoomHud() {
    if (!this.zoomHud) return;
    const percent = Math.round(this.scale * 100);
    this.zoomHud.textContent = `Zoom: ${percent}%`;
    this.zoomHud.classList.add("zm-zoom-hud-visible");
    if (this.zoomHudTimer !== null) {
      window.clearTimeout(this.zoomHudTimer);
    }
    this.zoomHudTimer = window.setTimeout(() => {
      var _a;
      (_a = this.zoomHud) == null ? void 0 : _a.classList.remove("zm-zoom-hud-visible");
      this.zoomHudTimer = null;
    }, 1e3);
  }
  requestPanFrame() {
    if (this.panRAF != null) return;
    this.panRAF = window.requestAnimationFrame(() => {
      this.panRAF = null;
      if (this.panAccDx !== 0 || this.panAccDy !== 0) {
        this.applyTransform(this.scale, this.tx + this.panAccDx, this.ty + this.panAccDy);
        this.panAccDx = 0;
        this.panAccDy = 0;
      }
    });
  }
  async applyYamlOnFirstLoad() {
    var _a, _b;
    if (this.yamlAppliedOnce) return;
    this.yamlAppliedOnce = true;
    const yb = (_a = this.cfg.yamlBases) != null ? _a : [];
    const yo = (_b = this.cfg.yamlOverlays) != null ? _b : [];
    const overlaysProvided = await this.isYamlKeyPresent("imageOverlays");
    if (yb.length === 0 && yo.length === 0 && !overlaysProvided) return;
    const changed = this.syncYamlLayers(yb, yo, void 0, overlaysProvided);
    if (changed && this.data && await this.store.wouldChange(this.data)) {
      this.ignoreNextModify = true;
      await this.store.save(this.data);
    }
  }
  async isYamlKeyPresent(key) {
    try {
      const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
      if (!(af instanceof import_obsidian21.TFile)) return false;
      const text = await this.app.vault.read(af);
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return false;
      const keyLower = key.toLowerCase();
      return lines.slice(blk.start + 1, blk.end).some((ln) => stripQuotePrefix(ln).trimStart().toLowerCase().startsWith(`${keyLower}:`));
    } catch (e) {
      return false;
    }
  }
  async replaceYamlScalarIfEquals(key, oldValue, newValue) {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian21.TFile)) return false;
    let foundBlock = false;
    const stripQuotes = (s) => {
      const t = s.trim();
      if (t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'")) {
        return t.slice(1, -1);
      }
      return t;
    };
    await this.app.vault.process(af, (text) => {
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return text;
      foundBlock = true;
      const content = lines.slice(blk.start + 1, blk.end);
      let changed = false;
      const keyRe = /^(\s*)image\s*:\s*(.*)$/i;
      const out = content.map((ln) => {
        var _a, _b;
        const info = splitQuotePrefix(ln);
        const m = keyRe.exec(info.rest);
        if (!m) return ln;
        const indent = (_a = m[1]) != null ? _a : "";
        const rhs = (_b = m[2]) != null ? _b : "";
        const val = stripQuotes(rhs);
        if (val === oldValue) {
          changed = true;
          return `${info.prefix}${indent}image: ${JSON.stringify(newValue)}`;
        }
        return ln;
      });
      if (!changed) return text;
      if (af.path === this.store.getPath()) {
        this.ignoreNextModify = true;
      }
      return [
        ...lines.slice(0, blk.start + 1),
        ...out,
        ...lines.slice(blk.end)
      ].join("\n");
    });
    return foundBlock;
  }
  syncYamlLayers(yamlBases, yamlOverlays, yamlImage, overlaysProvided = false) {
    var _a;
    if (!this.data) return false;
    let changed = false;
    if (yamlBases && yamlBases.length > 0) {
      const prevActive = this.getActiveBasePath();
      const newBases = yamlBases.map((b) => ({ path: b.path, name: b.name }));
      const newPaths = new Set(newBases.map((b) => b.path));
      let newActive = prevActive;
      if (yamlImage && newPaths.has(yamlImage)) newActive = yamlImage;
      if (!newPaths.has(newActive)) newActive = newBases[0].path;
      this.data.bases = newBases;
      this.data.activeBase = newActive;
      changed = true;
    }
    if (overlaysProvided || yamlOverlays && yamlOverlays.length > 0) {
      const prev = new Map(((_a = this.data.overlays) != null ? _a : []).map((o) => [o.path, o]));
      const next = (yamlOverlays != null ? yamlOverlays : []).map((o) => {
        var _a2, _b;
        return {
          path: o.path,
          name: o.name,
          visible: typeof o.visible === "boolean" ? o.visible : (_b = (_a2 = prev.get(o.path)) == null ? void 0 : _a2.visible) != null ? _b : false
        };
      });
      this.data.overlays = next;
      changed = true;
    }
    return changed;
  }
  async applyScaleCalibration(metersPerPixel) {
    if (!this.data) return;
    this.ensureMeasurement();
    const base = this.getActiveBasePath();
    if (!this.data.measurement) return;
    this.data.measurement.metersPerPixel = metersPerPixel;
    this.data.measurement.scales[base] = metersPerPixel;
    if (await this.store.wouldChange(this.data)) {
      this.ignoreNextModify = true;
      await this.store.save(this.data);
    }
    this.schedulePingUpdate();
  }
  promptAddLayer(kind) {
    new ImageFileSuggestModal(this.app, (file) => {
      const base = file.name.replace(/\.[^.]+$/, "");
      const title = kind === "base" ? "Name for base layer" : "Name for overlay";
      new NamePromptModal(this.app, title, base, (name) => {
        if (kind === "base") void this.addBaseByPath(file.path, name);
        else void this.addOverlayByPath(file.path, name);
      }).open();
    }).open();
  }
  async addBaseByPath(path, name) {
    var _a;
    if (!this.data) return;
    const exists = this.getBasesNormalized().some((b) => b.path === path);
    if (exists) {
      new import_obsidian21.Notice("Base already exists.", 1500);
      return;
    }
    this.data.bases = (_a = this.data.bases) != null ? _a : [];
    this.data.bases.push({ path, name: (name != null ? name : "") || void 0 });
    await this.saveDataSoon();
    void this.appendLayerToYaml("base", path, name != null ? name : "");
    new import_obsidian21.Notice("Base added.", 1200);
  }
  async addOverlayByPath(path, name) {
    var _a;
    if (!this.data) return;
    this.data.overlays = (_a = this.data.overlays) != null ? _a : [];
    if (this.data.overlays.some((o) => o.path === path)) {
      new import_obsidian21.Notice("Overlay already exists.", 1500);
      return;
    }
    this.data.overlays.push({ path, name: (name != null ? name : "") || void 0, visible: true });
    await this.saveDataSoon();
    if (this.isCanvas()) {
      await this.ensureOverlayLoaded(path);
      this.renderCanvas();
    } else {
      this.buildOverlayElements();
      this.updateOverlaySizes();
      await this.updateOverlayVisibility();
    }
    void this.appendLayerToYaml("overlay", path, name != null ? name : "");
    new import_obsidian21.Notice("Overlay added.", 1200);
  }
  confirmDeleteBase(path) {
    var _a, _b;
    if (!this.data) return;
    const bases = this.getBasesNormalized();
    if (bases.length <= 1) {
      new import_obsidian21.Notice("Cannot delete the last base image.", 2500);
      return;
    }
    const label = (_b = (_a = bases.find((b) => b.path === path)) == null ? void 0 : _a.name) != null ? _b : basename(path);
    new ConfirmModal(
      this.app,
      "Delete base image",
      `Remove base "${label}" from this map?`,
      () => {
        void this.deleteBaseByPath(path);
      }
    ).open();
  }
  async deleteBaseByPath(path) {
    var _a, _b, _c, _d, _e, _f;
    if (!this.data) return;
    const basesBefore = this.getBasesNormalized();
    if (basesBefore.length <= 1) {
      new import_obsidian21.Notice("Cannot delete the last base image.", 2500);
      return;
    }
    const idx = basesBefore.findIndex((b) => b.path === path);
    if (idx < 0) return;
    const wasActive = this.getActiveBasePath() === path;
    this.data.bases = ((_a = this.data.bases) != null ? _a : []).filter((it) => {
      if (typeof it === "string") return it !== path;
      if (it && typeof it === "object" && "path" in it) {
        const p = it.path;
        return typeof p !== "string" || p !== path;
      }
      return true;
    });
    if ((_b = this.data.measurement) == null ? void 0 : _b.scales) {
      delete this.data.measurement.scales[path];
    }
    for (const l of this.data.layers) {
      if (l.boundBase === path) l.boundBase = void 0;
    }
    let newActive = null;
    if (wasActive) {
      const basesAfter = this.getBasesNormalized();
      const pick = Math.min(idx, basesAfter.length - 1);
      newActive = (_f = (_e = (_c = basesAfter[pick]) == null ? void 0 : _c.path) != null ? _e : (_d = basesAfter[0]) == null ? void 0 : _d.path) != null ? _f : null;
      if (newActive) {
        await this.setActiveBase(newActive);
      }
    } else {
      await this.saveDataSoon();
    }
    await this.removeFromYamlList("imageBases", path);
    if (newActive) {
      await this.replaceYamlScalarIfEquals("image", path, newActive);
    }
    new import_obsidian21.Notice("Base removed.", 1200);
  }
  confirmDeleteOverlay(path) {
    var _a, _b;
    if (!this.data) return;
    const o = ((_a = this.data.overlays) != null ? _a : []).find((x) => x.path === path);
    const label = (_b = o == null ? void 0 : o.name) != null ? _b : basename(path);
    new ConfirmModal(
      this.app,
      "Delete overlay",
      `Remove overlay "${label}" from this map?`,
      () => {
        void this.deleteOverlayByPath(path);
      }
    ).open();
  }
  async deleteOverlayByPath(path) {
    var _a, _b, _c;
    if (!this.data) return;
    const prevCount = ((_a = this.data.overlays) != null ? _a : []).length;
    this.data.overlays = ((_b = this.data.overlays) != null ? _b : []).filter((o) => o.path !== path);
    if (((_c = this.data.overlays) != null ? _c : []).length === prevCount) return;
    await this.saveDataSoon();
    if (this.isCanvas()) {
      await this.ensureVisibleOverlaysLoaded();
      this.renderCanvas();
    } else {
      this.buildOverlayElements();
      this.updateOverlaySizes();
      await this.updateOverlayVisibility();
    }
    await this.removeFromYamlList("imageOverlays", path);
    new import_obsidian21.Notice("Overlay removed.", 1200);
  }
  async appendLayerToYaml(kind, path, name) {
    try {
      const key = kind === "base" ? "imageBases" : "imageOverlays";
      const ok = await this.updateYamlList(key, path, { name });
      if (!ok) new import_obsidian21.Notice("Added, but YAML could not be updated.", 2500);
    } catch (err) {
      console.error("Zoom Map: failed to update YAML", err);
      new import_obsidian21.Notice("Added, but YAML update failed.", 2500);
    }
  }
  async updateYamlList(key, newPath, opts) {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian21.TFile)) return false;
    let foundBlock = false;
    await this.app.vault.process(af, (text) => {
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return text;
      foundBlock = true;
      const content = lines.slice(blk.start + 1, blk.end);
      const patched = this.patchYamlList(content, key, newPath, opts);
      if (!patched.changed) return text;
      if (af.path === this.store.getPath()) {
        this.ignoreNextModify = true;
      }
      return [
        ...lines.slice(0, blk.start + 1),
        ...patched.out,
        ...lines.slice(blk.end)
      ].join("\n");
    });
    return foundBlock;
  }
  async removeFromYamlList(key, removePath) {
    const af = this.app.vault.getAbstractFileByPath(this.cfg.sourcePath);
    if (!(af instanceof import_obsidian21.TFile)) return false;
    let foundBlock = false;
    await this.app.vault.process(af, (text) => {
      const lines = text.split("\n");
      const blk = this.findZoommapBlockForThisMap(lines);
      if (!blk) return text;
      foundBlock = true;
      const content = lines.slice(blk.start + 1, blk.end);
      const patched = this.patchYamlListRemove(content, key, removePath);
      if (!patched.changed) return text;
      if (af.path === this.store.getPath()) {
        this.ignoreNextModify = true;
      }
      return [
        ...lines.slice(0, blk.start + 1),
        ...patched.out,
        ...lines.slice(blk.end)
      ].join("\n");
    });
    return foundBlock;
  }
  patchYamlListRemove(contentLines, key, removePath) {
    var _a, _b, _c, _d, _e, _f;
    const out = contentLines.slice();
    const keyRe = new RegExp(`^(\\s*)${key}\\s*:(.*)$`);
    let keyIdx = -1;
    let keyIndent = "";
    let keyPrefix = "";
    for (let i = 0; i < out.length; i++) {
      const info = splitQuotePrefix(out[i]);
      const m = keyRe.exec(info.rest);
      if (m) {
        keyIdx = i;
        keyIndent = (_a = m[1]) != null ? _a : "";
        keyPrefix = info.prefix;
        break;
      }
    }
    if (keyIdx < 0) return { changed: false, out };
    const isNextTopLevelKey = (ln) => {
      var _a2, _b2;
      const rest = stripQuotePrefix(ln);
      const trimmed = rest.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith("#")) return false;
      const spaces = (_b2 = (_a2 = /^\s*/.exec(rest)) == null ? void 0 : _a2[0].length) != null ? _b2 : 0;
      return spaces <= keyIndent.length && /^[A-Za-z0-9_-]+\s*:/.exec(trimmed) !== null;
    };
    let regionEnd = keyIdx + 1;
    while (regionEnd < out.length && !isNextTopLevelKey(out[regionEnd])) regionEnd++;
    const region = out.slice(keyIdx + 1, regionEnd);
    const stripQuotes = (s) => {
      const t = s.trim();
      if (t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'")) {
        return t.slice(1, -1);
      }
      return t;
    };
    const removed = [];
    let changed = false;
    for (let i = 0; i < region.length; i++) {
      const line = region[i];
      const trimmed = line.trimStart();
      if (!trimmed.startsWith("-")) {
        removed.push(line);
        continue;
      }
      const afterDash = trimmed.slice(1).trimStart();
      const objMatch = /^path\s*:\s*(.+)$/.exec(afterDash);
      if (objMatch) {
        const rawVal2 = stripQuotes((_b = objMatch[1]) != null ? _b : "");
        if (rawVal2 === removePath) {
          changed = true;
          const baseIndent = (_d = (_c = /^\s*/.exec(line)) == null ? void 0 : _c[0].length) != null ? _d : 0;
          let j = i + 1;
          while (j < region.length) {
            const next = region[j];
            const nextIndent = (_f = (_e = /^\s*/.exec(next)) == null ? void 0 : _e[0].length) != null ? _f : 0;
            const nextTrim = next.trimStart();
            if (nextTrim.startsWith("-") && nextIndent === baseIndent) break;
            if (nextTrim && nextIndent <= baseIndent) break;
            j++;
          }
          i = j - 1;
          continue;
        }
        removed.push(line);
        continue;
      }
      const rawVal = stripQuotes(afterDash);
      if (rawVal === removePath) {
        changed = true;
        continue;
      }
      removed.push(line);
    }
    const nextOut = [
      ...out.slice(0, keyIdx + 1),
      ...removed,
      ...out.slice(regionEnd)
    ];
    const remainingItems = removed.some((ln) => ln.trimStart().startsWith("-"));
    if (!remainingItems) {
      nextOut[keyIdx] = `${keyPrefix}${keyIndent}${key}: []`;
    }
    return { changed, out: nextOut };
  }
  findZoommapBlock(lines, approxLine) {
    let result = null;
    for (let i = 0; i < lines.length; i++) {
      const ln = stripQuotePrefix(lines[i]).trimStart().toLowerCase();
      if (ln.startsWith("```zoommap")) {
        let j = i + 1;
        while (j < lines.length && !stripQuotePrefix(lines[j]).trimStart().startsWith("```")) j++;
        if (j >= lines.length) break;
        const block = { start: i, end: j };
        if (typeof approxLine === "number" && i <= approxLine && approxLine <= j) return block;
        result != null ? result : result = block;
        i = j;
      }
    }
    return result;
  }
  patchYamlList(contentLines, key, path, opts) {
    var _a, _b, _c, _d;
    const out = contentLines.slice();
    const keyRe = new RegExp(`^(\\s*)${key}\\s*:(.*)$`);
    let keyIdx = -1;
    let keyIndent = "";
    let after = "";
    let keyPrefix = "";
    for (let i = 0; i < out.length; i++) {
      const info = splitQuotePrefix(out[i]);
      const m = keyRe.exec(info.rest);
      if (m) {
        keyIdx = i;
        keyIndent = (_a = m[1]) != null ? _a : "";
        after = ((_b = m[2]) != null ? _b : "").trim();
        keyPrefix = info.prefix;
        break;
      }
    }
    const jsonQuoted = JSON.stringify(path);
    const nm = (_c = opts == null ? void 0 : opts.name) != null ? _c : "";
    const itemLines = [];
    const itemIndent = `${keyIndent}  `;
    itemLines.push(`${keyPrefix}${itemIndent}- path: ${jsonQuoted}`);
    itemLines.push(`${keyPrefix}${itemIndent}  name: ${JSON.stringify(nm)}`);
    if (keyIdx >= 0) {
      if (/^\[\s*\]$/.exec(after)) out[keyIdx] = `${keyPrefix}${keyIndent}${key}:`;
      let insertAt = keyIdx + 1;
      let scan = keyIdx + 1;
      const isNextTopLevelKey = (ln) => {
        var _a2, _b2;
        const rest = stripQuotePrefix(ln);
        const trimmed = rest.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith("#")) return false;
        const spaces = (_b2 = (_a2 = /^\s*/.exec(rest)) == null ? void 0 : _a2[0].length) != null ? _b2 : 0;
        return spaces <= keyIndent.length && /^[A-Za-z0-9_-]+\s*:/.exec(trimmed) !== null;
      };
      while (scan < out.length && !isNextTopLevelKey(out[scan])) scan++;
      insertAt = scan;
      const region = out.slice(keyIdx + 1, insertAt).join("\n");
      const esc = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const dupObj = new RegExp(`-\\s*path\\s*:\\s*["']?${esc}["']?`);
      const dupStr = new RegExp(`-\\s*["']?${esc}["']?\\s*$`);
      if (dupObj.exec(region) || dupStr.exec(region)) {
        return { changed: false, out };
      }
      out.splice(insertAt, 0, ...itemLines);
      return { changed: true, out };
    }
    const blockPrefix = (_d = out.map((ln) => splitQuotePrefix(ln).prefix).find((p) => p.length > 0)) != null ? _d : "";
    const defaultIndent = this.detectYamlKeyIndent(out);
    out.push(`${blockPrefix}${defaultIndent}${key}:`);
    const itemIndent2 = `${defaultIndent}  `;
    out.push(`${blockPrefix}${itemIndent2}- path: ${jsonQuoted}`);
    out.push(`${blockPrefix}${itemIndent2}  name: ${JSON.stringify(nm)}`);
    return { changed: true, out };
  }
  detectYamlKeyIndent(lines) {
    var _a;
    for (const ln of lines) {
      const m = /^(\s*)[A-Za-z0-9_-]+\s*:/.exec(stripQuotePrefix(ln));
      if (m) return (_a = m[1]) != null ? _a : "";
    }
    return "";
  }
  async renameMarkerLayer(layer, newName) {
    if (!this.data) return;
    const exists = this.data.layers.some((l) => l !== layer && l.name === newName);
    const finalName = exists ? `${newName} (${Math.random().toString(36).slice(2, 4)})` : newName;
    layer.name = finalName;
    await this.saveDataSoon();
    this.renderMarkersOnly();
    new import_obsidian21.Notice("Layer renamed.", 1e3);
  }
  async deleteMarkerLayer(layer, decision) {
    if (!this.data) return;
    const others = this.data.layers.filter((l) => l.id !== layer.id);
    if (others.length === 0) {
      new import_obsidian21.Notice("Cannot delete the last layer.", 2e3);
      return;
    }
    const layerIndex = this.data.layers.findIndex((l) => l.id === layer.id);
    const affectedMarkers = this.data.markers.map((marker, index) => ({ marker, index })).filter((x) => x.marker.layer === layer.id);
    this.pushDeleteUndo(
      decision.mode === "move" ? {
        kind: "marker-layer",
        layer: cloneForUndo(layer),
        index: layerIndex,
        mode: "move",
        targetId: decision.targetId,
        movedMarkerIds: affectedMarkers.map((x) => x.marker.id)
      } : {
        kind: "marker-layer",
        layer: cloneForUndo(layer),
        index: layerIndex,
        mode: "delete-markers",
        markers: affectedMarkers.map((x) => ({ marker: cloneForUndo(x.marker), index: x.index }))
      },
      `Delete marker layer: ${layer.name}`
    );
    if (decision.mode === "move") {
      const targetId = decision.targetId;
      if (!targetId || targetId === layer.id) {
        new import_obsidian21.Notice("Invalid target layer.", 1500);
        return;
      }
      for (const m of this.data.markers) if (m.layer === layer.id) m.layer = targetId;
    } else {
      const removed = this.data.markers.filter((m) => m.layer === layer.id);
      for (const m of removed) {
        await this.deletePingNoteIfOwned(m);
      }
      this.data.markers = this.data.markers.filter((m) => m.layer !== layer.id);
    }
    this.data.layers = this.data.layers.filter((l) => l.id !== layer.id);
    await this.saveDataSoon();
    this.renderMarkersOnly();
    new import_obsidian21.Notice("Layer deleted.", 1e3);
    this.schedulePingUpdate();
  }
};
var ConfirmModal = class extends import_obsidian21.Modal {
  constructor(app, titleText, messageText, onConfirm, opts) {
    var _a, _b;
    super(app);
    this.titleText = titleText;
    this.messageText = messageText;
    this.onConfirm = onConfirm;
    this.confirmText = (_a = opts == null ? void 0 : opts.confirmText) != null ? _a : "Confirm";
    this.cancelText = (_b = opts == null ? void 0 : opts.cancelText) != null ? _b : "Cancel";
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: this.titleText });
    contentEl.createEl("div", { text: this.messageText });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const confirm = footer.createEl("button", { text: this.confirmText });
    const cancel = footer.createEl("button", { text: this.cancelText });
    confirm.onclick = () => {
      this.close();
      this.onConfirm();
    };
    cancel.onclick = () => this.close();
  }
  onClose() {
    this.contentEl.empty();
  }
};
var ZMMenu = class {
  constructor(doc) {
    this.submenus = [];
    this.items = [];
    this.doc = doc;
    this.root = this.doc.body.createDiv({ cls: "zm-menu" });
    this.root.addEventListener("contextmenu", (e) => e.stopPropagation());
  }
  open(clientX, clientY, items) {
    this.items = items;
    this.buildList(this.root, this.items);
    this.position(this.root, clientX, clientY, "right");
  }
  destroy() {
    this.submenus.forEach((el) => el.remove());
    this.submenus = [];
    this.root.remove();
  }
  contains(el) {
    return this.root.contains(el) || this.submenus.some((s) => s.contains(el));
  }
  buildList(container, items) {
    var _a;
    container.empty();
    for (const it of items) {
      if (it.type === "separator") {
        container.createDiv({ cls: "zm-menu__sep" });
        continue;
      }
      if (!it.label) continue;
      const row = container.createDiv({ cls: "zm-menu__item" });
      const label = row.createDiv({ cls: "zm-menu__label" });
      if (it.iconUrl) {
        const imgLeft = label.createEl("img", { cls: "zm-menu__icon" });
        imgLeft.src = it.iconUrl;
        const deg = typeof it.iconRotationDeg === "number" && Number.isFinite(it.iconRotationDeg) ? it.iconRotationDeg : 0;
        if (deg) imgLeft.style.transform = `rotate(${deg}deg)`;
        else imgLeft.style.removeProperty("transform");
        label.appendChild(this.doc.createTextNode(" "));
      }
      label.appendText(it.label);
      const right = row.createDiv({ cls: "zm-menu__right" });
      if ((_a = it.children) == null ? void 0 : _a.length) {
        const arrow = right.createDiv({ cls: "zm-menu__arrow" });
        arrow.setText("\u25B6");
        let submenuEl = null;
        const openSub = () => {
          var _a2;
          if (submenuEl) return;
          submenuEl = this.doc.body.createDiv({ cls: "zm-submenu" });
          this.submenus.push(submenuEl);
          this.buildList(submenuEl, it.children);
          const rect = row.getBoundingClientRect();
          const win = (_a2 = this.doc.defaultView) != null ? _a2 : window;
          const pref = rect.right + 260 < win.innerWidth ? "right" : "left";
          const x = pref === "right" ? rect.right : rect.left;
          const y = rect.top;
          this.position(submenuEl, x, y, pref);
        };
        const closeSub = () => {
          if (!submenuEl) return;
          submenuEl.remove();
          this.submenus = this.submenus.filter((s) => s !== submenuEl);
          submenuEl = null;
        };
        row.addEventListener("mouseenter", openSub);
        row.addEventListener("mouseleave", (e) => {
          const to = e.relatedTarget;
          if (submenuEl && !(to instanceof Node && submenuEl.contains(to))) closeSub();
        });
      } else {
        const chk = right.createDiv({ cls: "zm-menu__check" });
        if (it.mark) {
          chk.setText(this.symbolForMark(it.mark));
          if (it.markColor) chk.style.color = it.markColor;
        } else if (typeof it.checked === "boolean") {
          chk.setText(it.checked ? "\u2713" : "");
        }
        if (!it.action) {
          row.classList.add("zm-menu__item--info");
        }
        row.addEventListener("click", () => {
          if (!it.action) return;
          try {
            void Promise.resolve(it.action(row, this)).catch(
              (err) => console.error("Menu item action failed:", err)
            );
          } catch (err) {
            console.error("Menu item action failed:", err);
          }
        });
      }
    }
  }
  symbolForMark(mark) {
    switch (mark) {
      case "x":
        return "\xD7";
      case "minus":
        return "\u2013";
      default:
        return "\u2713";
    }
  }
  position(el, clientX, clientY, prefer) {
    var _a;
    const pad = 6;
    const rect = el.getBoundingClientRect();
    let x = clientX;
    let y = clientY;
    const win = (_a = this.doc.defaultView) != null ? _a : window;
    const vw = win.innerWidth;
    const vh = win.innerHeight;
    if (prefer === "right") {
      if (clientX + rect.width + pad > vw) x = Math.max(pad, vw - rect.width - pad);
    } else {
      x = clientX - rect.width;
      if (x < pad) x = pad;
    }
    if (clientY + rect.height + pad > vh) y = Math.max(pad, vh - rect.height - pad);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }
};

// src/jsonFileSuggest.ts
var import_obsidian22 = require("obsidian");
var JsonFileSuggestModal = class extends import_obsidian22.FuzzySuggestModal {
  constructor(app, onChoose) {
    super(app);
    this.appRef = app;
    this.onChoose = onChoose;
    this.files = this.appRef.vault.getFiles().filter((f) => {
      var _a;
      return ((_a = f.extension) == null ? void 0 : _a.toLowerCase()) === "json";
    });
    this.setPlaceholder("Choose JSON file\u2026");
  }
  getItems() {
    return this.files;
  }
  getItemText(item) {
    return item.path;
  }
  onChooseItem(item) {
    this.onChoose(item);
  }
};

// src/faIconPickerModal.ts
var import_obsidian23 = require("obsidian");
var FaIconPickerModal = class extends import_obsidian23.Modal {
  constructor(app, folder, onChoose) {
    super(app);
    this.files = [];
    this.currentMatches = [];
    this.listEl = null;
    this.gridEl = null;
    this.statusEl = null;
    this.searchInput = null;
    this.selected = null;
    this.selectedEl = null;
    this.addButton = null;
    this.renderedCount = 0;
    this.desiredRenderCount = 0;
    this.renderToken = 0;
    this.isRendering = false;
    this.searchDebounceTimer = null;
    this.currentQuery = "";
    this.initialVisibleLimit = 30;
    this.searchResultLimit = 50;
    this.scrollLoadStep = 30;
    this.renderChunkSize = 12;
    this.debounceMs = 180;
    this.scrollThresholdPx = 120;
    this.folder = (0, import_obsidian23.normalizePath)(folder);
    this.onChoose = onChoose;
  }
  collectFiles() {
    var _a;
    const result = [];
    const root = this.app.vault.getAbstractFileByPath(this.folder);
    if (!(root instanceof import_obsidian23.TFolder)) {
      console.warn(`Zoom Map: SVG icon folder not found: ${this.folder}`);
      this.files = [];
      return;
    }
    const stack = [root];
    while (stack.length > 0) {
      const current = stack.pop();
      for (const child of current.children) {
        if (child instanceof import_obsidian23.TFolder) {
          stack.push(child);
        } else if (child instanceof import_obsidian23.TFile) {
          if (((_a = child.extension) == null ? void 0 : _a.toLowerCase()) === "svg") {
            result.push(child);
          }
        }
      }
    }
    result.sort((a, b) => a.path.localeCompare(b.path));
    this.files = result;
  }
  getMatches(filter) {
    const q = filter.trim().toLowerCase();
    const files = Array.isArray(this.files) ? this.files : [];
    const matches = files.filter((f) => {
      if (!q) return true;
      const name = f.name.toLowerCase();
      const path = f.path.toLowerCase();
      return name.includes(q) || path.includes(q);
    });
    return q ? matches.slice(0, this.searchResultLimit) : matches;
  }
  scheduleRender(filter) {
    if (this.searchDebounceTimer !== null) {
      window.clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
    this.searchDebounceTimer = window.setTimeout(() => {
      this.searchDebounceTimer = null;
      this.renderList(filter);
    }, this.debounceMs);
  }
  renderList(filter) {
    if (!this.listEl) return;
    this.currentQuery = filter.trim();
    this.currentMatches = this.getMatches(this.currentQuery);
    this.renderToken += 1;
    this.renderedCount = 0;
    this.desiredRenderCount = 0;
    this.isRendering = false;
    this.gridEl = null;
    this.statusEl = null;
    this.listEl.empty();
    const selectedStillVisible = this.selected !== null && this.currentMatches.some((f) => {
      var _a;
      return f.path === ((_a = this.selected) == null ? void 0 : _a.path);
    });
    if (!selectedStillVisible) {
      this.selected = null;
      if (this.addButton) this.addButton.disabled = true;
    } else if (this.addButton) {
      this.addButton.disabled = false;
    }
    if (this.selectedEl) {
      this.selectedEl.classList.remove("is-selected");
    }
    this.selectedEl = null;
    if (this.currentMatches.length === 0) {
      this.listEl.createEl("div", {
        text: "No SVG icons found in this folder."
      });
      return;
    }
    this.statusEl = this.listEl.createDiv({ cls: "zoommap-muted" });
    this.gridEl = this.listEl.createDiv({ cls: "zoommap-fa-picker-grid" });
    this.updateStatus();
    this.queueRenderTo(this.initialVisibleLimit);
  }
  updateStatus() {
    if (!this.statusEl) return;
    const total = this.currentMatches.length;
    const rendered = this.renderedCount;
    const searching = this.currentQuery.length > 0;
    if (searching) {
      const limited = total >= this.searchResultLimit;
      if (rendered < total) {
        this.statusEl.setText(
          limited ? `Showing ${rendered} of max. ${this.searchResultLimit} search results. Scroll to load more.` : `Showing ${rendered} of ${total} search results. Scroll to load more.`
        );
      } else {
        this.statusEl.setText(
          limited ? `Showing max. ${this.searchResultLimit} search results.` : `Showing ${total} search results.`
        );
      }
      return;
    }
    if (rendered < total) {
      this.statusEl.setText(`Showing ${rendered} of ${total} icons. Scroll to load more or use search.`);
    } else {
      this.statusEl.setText(`Showing ${total} icons.`);
    }
  }
  queueRenderTo(targetCount) {
    this.desiredRenderCount = Math.min(
      this.currentMatches.length,
      Math.max(this.desiredRenderCount, targetCount)
    );
    if (!this.gridEl || this.isRendering) return;
    this.isRendering = true;
    const token = this.renderToken;
    const step = () => {
      if (token !== this.renderToken) {
        this.isRendering = false;
        return;
      }
      if (!this.gridEl) {
        this.isRendering = false;
        return;
      }
      const maxTarget = Math.min(this.desiredRenderCount, this.currentMatches.length);
      const end = Math.min(this.renderedCount + this.renderChunkSize, maxTarget);
      for (let i = this.renderedCount; i < end; i += 1) {
        this.appendCell(this.currentMatches[i]);
      }
      this.renderedCount = end;
      this.updateStatus();
      if (this.renderedCount < maxTarget) {
        window.requestAnimationFrame(step);
        return;
      }
      this.isRendering = false;
      this.maybeLoadMoreFromScroll();
    };
    window.requestAnimationFrame(step);
  }
  appendCell(file) {
    if (!this.gridEl) return;
    const cell = this.gridEl.createDiv({ cls: "zoommap-fa-picker-cell" });
    const img = cell.createEl("img", { cls: "zoommap-fa-picker-icon" });
    img.decoding = "async";
    img.loading = "lazy";
    img.src = this.app.vault.getResourcePath(file);
    cell.createDiv({
      cls: "zoommap-fa-picker-label",
      text: file.name.replace(/\.svg$/i, "")
    });
    if (this.selected && this.selected.path === file.path) {
      this.selectedEl = cell;
      cell.classList.add("is-selected");
    }
    cell.onclick = () => {
      this.selected = file;
      if (this.selectedEl && this.selectedEl !== cell) {
        this.selectedEl.classList.remove("is-selected");
      }
      this.selectedEl = cell;
      cell.classList.add("is-selected");
      if (this.addButton) this.addButton.disabled = false;
    };
  }
  maybeLoadMoreFromScroll() {
    if (!this.listEl) return;
    if (this.currentMatches.length === 0) return;
    if (this.desiredRenderCount >= this.currentMatches.length) return;
    const nearBottom = this.listEl.scrollTop + this.listEl.clientHeight >= this.listEl.scrollHeight - this.scrollThresholdPx;
    if (!nearBottom) return;
    this.queueRenderTo(this.desiredRenderCount + this.scrollLoadStep);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("zoommap-fa-picker");
    this.collectFiles();
    contentEl.createEl("h2", { text: "Pick SVG icon" });
    if (!Array.isArray(this.files) || this.files.length === 0) {
      contentEl.createEl("div", {
        text: "No SVG icons found in the configured folder."
      });
      return;
    }
    const searchRow = contentEl.createDiv({ cls: "zoommap-fa-picker-search" });
    this.searchInput = searchRow.createEl("input", {
      type: "text",
      placeholder: "Search by name or path\u2026"
    });
    this.listEl = contentEl.createDiv({ cls: "zoommap-fa-picker-list" });
    this.listEl.addEventListener("scroll", () => {
      this.maybeLoadMoreFromScroll();
    });
    const footer = contentEl.createDiv({
      cls: "zoommap-fa-picker-footer zoommap-modal-footer"
    });
    this.addButton = footer.createEl("button", { text: "Add" });
    this.addButton.disabled = true;
    this.addButton.textContent = "Add";
    this.addButton.onclick = () => {
      if (!this.selected) return;
      this.onChoose(this.selected);
    };
    const backButton = footer.createEl("button", { text: "Back" });
    backButton.onclick = () => this.close();
    this.searchInput.addEventListener("input", () => {
      var _a, _b;
      this.scheduleRender((_b = (_a = this.searchInput) == null ? void 0 : _a.value) != null ? _b : "");
    });
    this.renderList("");
  }
  onClose() {
    this.contentEl.empty();
    if (this.searchDebounceTimer !== null) {
      window.clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
    this.renderToken += 1;
    this.listEl = null;
    this.gridEl = null;
    this.statusEl = null;
    this.searchInput = null;
    this.files = [];
    this.currentMatches = [];
    this.selected = null;
    this.selectedEl = null;
    this.addButton = null;
    this.isRendering = false;
  }
};

// src/preferencesModal.ts
var import_obsidian24 = require("obsidian");
var PreferencesModal = class extends import_obsidian24.Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Preferences" });
    contentEl.createEl("h3", { text: "Session image cache" });
    let mbInput = null;
    let keepOverlayToggle = null;
    let hybridToggle = null;
    const applyEnabledState = () => {
      const on = !!this.plugin.settings.enableSessionImageCache;
      if (mbInput) mbInput.disabled = !on;
      if (keepOverlayToggle) keepOverlayToggle.disabled = !on;
      if (hybridToggle) hybridToggle.disabled = !on;
    };
    new import_obsidian24.Setting(contentEl).setName("Enable session image cache").setDesc("Caches decoded images across the entire Obsidian session (ref-counted, evicts only when near limit).").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.enableSessionImageCache).onChange(async (value) => {
        this.plugin.settings.enableSessionImageCache = value;
        await this.plugin.saveSettings();
        applyEnabledState();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Cache size in megabyte").setDesc("Maximum memory used for cached decoded images. Default: 512 megabyte.").addText((t) => {
      var _a;
      t.inputEl.type = "number";
      t.setValue(String((_a = this.plugin.settings.sessionImageCacheMb) != null ? _a : 512));
      mbInput = t.inputEl;
      t.onChange(async (v) => {
        const n = Number(String(v).replace(",", "."));
        if (!Number.isFinite(n) || n <= 0) return;
        this.plugin.settings.sessionImageCacheMb = Math.round(n);
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Keep overlays loaded").setDesc("When enabled, all overlays of an open map are kept in the session cache (even if hidden).").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.keepOverlaysLoaded).onChange(async (value) => {
        this.plugin.settings.keepOverlaysLoaded = value;
        await this.plugin.saveSettings();
      });
      keepOverlayToggle = toggle.toggleEl;
    });
    new import_obsidian24.Setting(contentEl).setName("Hybrid render: canvas images + DOM markers").setDesc("When enabled (and cache is enabled), maps will use canvas rendering for base/overlay images while markers stay DOM. Useful for fast image redraw on weaker devices.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.preferCanvasImagesWhenCaching).onChange(async (value) => {
        this.plugin.settings.preferCanvasImagesWhenCaching = value;
        await this.plugin.saveSettings();
      });
      hybridToggle = toggle.toggleEl;
    });
    contentEl.createEl("h3", { text: "Other preferences" });
    new import_obsidian24.Setting(contentEl).setName("Show linked file name on hover").setDesc("Shows the linked note\u2019s filename inside the map tooltip. Useful when linked notes are still empty.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.showLinkFileNameInTooltip).onChange(async (value) => {
        this.plugin.settings.showLinkFileNameInTooltip = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Show zoom +/- buttons on maps").setDesc("Displays small hud buttons for zooming in and out.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.showZoomButtonsHud).onChange(async (value) => {
        this.plugin.settings.showZoomButtonsHud = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Middle click pins opens linked note in new tab").setDesc("When enabled: middle click on a pin opens its linked note in a new tab.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.middleClickOpensLinkInNewTab).onChange(async (value) => {
        this.plugin.settings.middleClickOpensLinkInNewTab = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Max SVG raster scale").setDesc("Controls the maximum raster lod for SVG base images. Higher = sharper at high zoom, but more RAM and slower upgrades.").addDropdown((d) => {
      var _a;
      d.addOption("2", "2\xD7 (low-end)");
      d.addOption("4", "4\xD7 (balanced)");
      d.addOption("8", "8\xD7 (high quality)");
      const cur = String((_a = this.plugin.settings.svgRasterMaxScale) != null ? _a : 8);
      d.setValue(cur);
      d.onChange(async (v) => {
        const n = Number(v);
        this.plugin.settings.svgRasterMaxScale = n === 2 || n === 4 || n === 8 ? n : 8;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Settings UI: show preview for image icons").setDesc("Shows a small preview thumbnail for non-SVG image icons in the icon library list.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.showImageIconPreviewInSettings).onChange(async (value) => {
        this.plugin.settings.showImageIconPreviewInSettings = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Enable text layers").setDesc("Enables text boxes with baselines and inline typing on maps.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.enableTextLayers).onChange(async (value) => {
        this.plugin.settings.enableTextLayers = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Enable grids").setDesc("Enables SVG grid overlays, grid editing and grid menu entries on maps.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.enableGrid).onChange(async (value) => {
        this.plugin.settings.enableGrid = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Enable measure pro (terrain segments)").setDesc("Allows assigning terrain factors per measurement segment for travel time.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.enableMeasurePro).onChange(async (value) => {
        this.plugin.settings.enableMeasurePro = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName('Pins: "scale like sticker" by default').setDesc('When enabled, new pins will have "scale like sticker" enabled in the marker editor.').addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.defaultScaleLikeSticker).onChange(async (value) => {
        this.plugin.settings.defaultScaleLikeSticker = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Prefer first active layer for new markers").setDesc("When enabled, markers default to the first visible unlocked layer, whether created or placed.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.preferActiveLayerInEditor).onChange(async (value) => {
        this.plugin.settings.preferActiveLayerInEditor = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Enable drawing tools").setDesc("When enabled, the draw menu and draw layers become available on maps.").addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.enableDrawing).onChange(async (value) => {
        this.plugin.settings.enableDrawing = value;
        await this.plugin.saveSettings();
      });
    });
    contentEl.createEl("h3", { text: "Second screen" });
    let folderInput = null;
    const applySecondScreenState = () => {
      const on = !!this.plugin.settings.enableSecondScreen;
      if (folderInput) folderInput.disabled = !on;
    };
    new import_obsidian24.Setting(contentEl).setName("Enable second screen integration").setDesc('Enables "send to screen" integration with the plugin "ttrpg tools: screen display".').addToggle((toggle) => {
      toggle.setValue(!!this.plugin.settings.enableSecondScreen).onChange(async (value) => {
        this.plugin.settings.enableSecondScreen = value;
        await this.plugin.saveSettings();
        applySecondScreenState();
      });
    });
    new import_obsidian24.Setting(contentEl).setName("Second screen note folder").setDesc("Folder where temporary map notes and marker snapshots for the second screen are written.").addText((t) => {
      var _a;
      t.setPlaceholder("Zoommap/secondscreen");
      t.setValue((_a = this.plugin.settings.secondScreenFolder) != null ? _a : "ZoomMap/SecondScreen");
      folderInput = t.inputEl;
      t.onChange(async (v) => {
        this.plugin.settings.secondScreenFolder = v.trim() || "ZoomMap/SecondScreen";
        await this.plugin.saveSettings();
      });
    });
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const closeBtn = footer.createEl("button", { text: "Close" });
    closeBtn.onclick = () => this.close();
    applyEnabledState();
    applySecondScreenState();
  }
  onClose() {
    this.contentEl.empty();
  }
};

// src/iconOutlineModal.ts
var import_obsidian25 = require("obsidian");
var IconOutlineModal = class extends import_obsidian25.Modal {
  constructor(app, plugin, icon, onApplied) {
    super(app);
    this.svgSource = null;
    // Base options
    this.baseEnabled = false;
    this.baseKind = "icon";
    this.baseIconKey = "";
    this.baseScalePct = 130;
    this.baseFill = "#ffffff";
    this.baseStroke = "#000000";
    this.baseStrokeWidth = 0;
    this.baseStrokeOpacity = 1;
    this.innerOffsetYPx = 0;
    this.innerOffsetXPx = 0;
    this.outlineColor = "#000000";
    this.outlineWidth = 2;
    this.outlineOpacity = 1;
    this.shadowEnabled = false;
    this.shadowColor = "#000000";
    this.shadowBlurPx = 6;
    this.shadowOffsetXPx = 2;
    this.shadowOffsetYPx = 2;
    this.plugin = plugin;
    this.icon = icon;
    this.onApplied = onApplied;
  }
  isSvgIconProfile(i) {
    var _a;
    const src = ((_a = i.pathOrDataUrl) != null ? _a : "").toLowerCase();
    return src.startsWith("data:image/svg+xml") || src.endsWith(".svg");
  }
  async loadSvgFromIconKey(iconKey) {
    var _a, _b, _c;
    const ico = (_b = ((_a = this.plugin.settings.icons) != null ? _a : []).find((i) => i.key === iconKey)) != null ? _b : null;
    if (!ico) return null;
    const src = (_c = ico.pathOrDataUrl) != null ? _c : "";
    if (!src || typeof src !== "string") return null;
    if (src.startsWith("data:image/svg+xml")) {
      const idx = src.indexOf(",");
      if (idx < 0) return null;
      try {
        return decodeURIComponent(src.slice(idx + 1));
      } catch (e) {
        return null;
      }
    }
    if (src.toLowerCase().endsWith(".svg")) {
      const af = this.app.vault.getAbstractFileByPath(src);
      if (af instanceof import_obsidian25.TFile) {
        try {
          return await this.app.vault.read(af);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  }
  parseSvgRoot(svg) {
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      return svgEl;
    } catch (e) {
      return null;
    }
  }
  extractViewBox(svg) {
    var _a;
    const svgEl = this.parseSvgRoot(svg);
    if (!svgEl) return null;
    const vb = ((_a = svgEl.getAttribute("viewBox")) != null ? _a : "").trim();
    const parts = vb.split(/[\s,]+/).map((x) => Number(x));
    if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
      return { minX: parts[0], minY: parts[1], w: parts[2], h: parts[3] };
    }
    return null;
  }
  stripOuterSvg(svg) {
    var _a, _b;
    const svgEl = this.parseSvgRoot(svg);
    if (!svgEl) return null;
    const vb = ((_a = svgEl.getAttribute("viewBox")) != null ? _a : "").trim();
    const inner = (_b = svgEl.innerHTML) != null ? _b : "";
    return { inner, viewBox: vb || void 0 };
  }
  readPersistedMeta(svg) {
    var _a, _b, _c;
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const root = doc.querySelector("svg");
      if (!root) return;
      const getNum = (k) => {
        const v = root.getAttribute(k);
        if (v == null) return null;
        const n = Number(String(v).replace(",", "."));
        return Number.isFinite(n) ? n : null;
      };
      const getStr = (k) => {
        const v = root.getAttribute(k);
        return typeof v === "string" && v.trim().length ? v.trim() : null;
      };
      const baseIcon = getStr("data-zm-base-icon");
      if (baseIcon) {
        this.baseEnabled = true;
        this.baseIconKey = baseIcon;
      }
      const baseScale = getNum("data-zm-base-scale");
      if (baseScale != null && baseScale >= 10 && baseScale <= 1e3) this.baseScalePct = Math.round(baseScale);
      const baseFill = getStr("data-zm-base-fill");
      if (baseFill) this.baseFill = baseFill;
      const baseStroke = getStr("data-zm-base-stroke");
      if (baseStroke) this.baseStroke = baseStroke;
      const baseSw = getNum("data-zm-base-sw");
      if (baseSw != null && baseSw >= 0) this.baseStrokeWidth = baseSw;
      const baseSo = getNum("data-zm-base-so");
      if (baseSo != null) this.baseStrokeOpacity = Math.min(1, Math.max(0, baseSo));
      const dx = getNum("data-zm-inner-dx");
      if (dx != null) this.innerOffsetXPx = Math.max(-500, Math.min(500, dx));
      const dy = getNum("data-zm-inner-dy");
      if (dy != null) this.innerOffsetYPx = Math.max(-500, Math.min(500, dy));
      const oc = getStr("data-zm-outline-color");
      if (oc) this.outlineColor = oc;
      const ow = getNum("data-zm-outline-width");
      if (ow != null && ow >= 0) this.outlineWidth = ow;
      const oo = getNum("data-zm-outline-opacity");
      if (oo != null) this.outlineOpacity = Math.min(1, Math.max(0, oo));
      if (!oc && ow == null && oo == null) {
        const ol = root.querySelector("#zm-outline");
        if (ol instanceof SVGElement) {
          const sc = ((_a = ol.getAttribute("stroke")) != null ? _a : "").trim();
          if (sc) this.outlineColor = sc;
          const sw = Number(String((_b = ol.getAttribute("stroke-width")) != null ? _b : "").replace(",", "."));
          if (Number.isFinite(sw) && sw >= 0) this.outlineWidth = sw;
          const so = Number(String((_c = ol.getAttribute("stroke-opacity")) != null ? _c : "").replace(",", "."));
          if (Number.isFinite(so)) this.outlineOpacity = Math.min(1, Math.max(0, so));
        }
      }
    } catch (e) {
    }
  }
  writePersistedMeta(svg) {
    var _a, _b, _c;
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const root = doc.querySelector("svg");
      if (!root) return svg;
      root.setAttribute("data-zm-outline-color", this.outlineColor);
      root.setAttribute("data-zm-outline-width", String(this.outlineWidth));
      root.setAttribute("data-zm-outline-opacity", String(this.outlineOpacity));
      if (this.baseEnabled) {
        root.setAttribute("data-zm-base-icon", ((_a = this.baseIconKey) != null ? _a : "").trim());
        root.setAttribute("data-zm-base-scale", String(this.baseScalePct));
        root.setAttribute("data-zm-base-fill", this.baseFill);
        root.setAttribute("data-zm-base-stroke", this.baseStroke);
        root.setAttribute("data-zm-base-sw", String(this.baseStrokeWidth));
        root.setAttribute("data-zm-base-so", String(this.baseStrokeOpacity));
      } else {
        root.removeAttribute("data-zm-base-icon");
        root.removeAttribute("data-zm-base-scale");
        root.removeAttribute("data-zm-base-fill");
        root.removeAttribute("data-zm-base-stroke");
        root.removeAttribute("data-zm-base-sw");
        root.removeAttribute("data-zm-base-so");
      }
      root.setAttribute("data-zm-inner-dx", String((_b = this.innerOffsetXPx) != null ? _b : 0));
      root.setAttribute("data-zm-inner-dy", String((_c = this.innerOffsetYPx) != null ? _c : 0));
      return new XMLSerializer().serializeToString(root);
    } catch (e) {
      return svg;
    }
  }
  onOpen() {
    void this.renderAsync();
  }
  onClose() {
    this.contentEl.empty();
    this.svgSource = null;
  }
  parseViewBoxString(vb) {
    const parts = (vb != null ? vb : "").trim().split(/[\s,]+/).map((x) => Number(x));
    if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
    const [minX, minY, w, h] = parts;
    if (w <= 0 || h <= 0) return null;
    return { minX, minY, w, h };
  }
  getOrigViewBox(svgEl) {
    var _a, _b;
    const orig = (_b = (_a = svgEl.getAttribute("data-zm-orig-viewbox")) != null ? _a : svgEl.getAttribute("viewBox")) != null ? _b : "";
    return this.parseViewBoxString(orig);
  }
  applyViewBoxPaddingAbsolute(svg, pad) {
    var _a, _b;
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) return svg;
      const origStr = (_b = (_a = svgEl.getAttribute("data-zm-orig-viewbox")) != null ? _a : svgEl.getAttribute("viewBox")) != null ? _b : "";
      const orig = this.parseViewBoxString(origStr);
      if (!orig) return svg;
      if (!svgEl.getAttribute("data-zm-orig-viewbox")) {
        svgEl.setAttribute("data-zm-orig-viewbox", `${orig.minX} ${orig.minY} ${orig.w} ${orig.h}`);
      }
      const p = Math.max(0, Number(pad) || 0);
      const minX = orig.minX - p;
      const minY = orig.minY - p;
      const w = orig.w + 2 * p;
      const h = orig.h + 2 * p;
      svgEl.setAttribute("viewBox", `${minX} ${minY} ${w} ${h}`);
      return new XMLSerializer().serializeToString(svgEl);
    } catch (e) {
      return svg;
    }
  }
  async renderAsync() {
    var _a, _b, _c, _d, _e;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "SVG outline" });
    const svg = await this.loadSvgSource();
    if (!svg) {
      contentEl.createEl("div", {
        text: "This icon is not an SVG or could not be loaded."
      });
      return;
    }
    this.svgSource = svg;
    this.baseEnabled = /id="zm-base"/i.test(svg);
    this.baseKind = "icon";
    this.baseIconKey = this.baseIconKey || "";
    this.baseScalePct = 130;
    this.baseFill = "#ffffff";
    this.baseStroke = "#000000";
    this.baseStrokeWidth = 0;
    this.baseStrokeOpacity = 1;
    this.innerOffsetYPx = 0;
    this.innerOffsetXPx = 0;
    this.outlineColor = "#000000";
    this.outlineWidth = 2;
    this.shadowEnabled = !!this.icon.shadowEnabled;
    this.shadowColor = ((_a = this.icon.shadowColor) != null ? _a : "#000000").trim() || "#000000";
    this.shadowBlurPx = typeof this.icon.shadowBlurPx === "number" && Number.isFinite(this.icon.shadowBlurPx) ? this.icon.shadowBlurPx : 6;
    this.shadowOffsetXPx = typeof this.icon.shadowOffsetXPx === "number" && Number.isFinite(this.icon.shadowOffsetXPx) ? this.icon.shadowOffsetXPx : 2;
    this.shadowOffsetYPx = typeof this.icon.shadowOffsetYPx === "number" && Number.isFinite(this.icon.shadowOffsetYPx) ? this.icon.shadowOffsetYPx : 2;
    this.outlineOpacity = 1;
    this.readPersistedMeta(svg);
    const strokeMatch = /stroke="([^"]+)"/i.exec(svg);
    const widthMatch = /stroke-width="([^"]+)"/i.exec(svg);
    const opacityMatch = /stroke-opacity="([^"]+)"/i.exec(svg);
    let defaultColor = this.outlineColor || (strokeMatch == null ? void 0 : strokeMatch[1]) || "#000000";
    if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(defaultColor)) {
      defaultColor = "#000000";
    }
    let defaultWidth = this.outlineWidth;
    if (!Number.isFinite(defaultWidth)) {
      defaultWidth = Number((_c = (_b = widthMatch == null ? void 0 : widthMatch[1]) == null ? void 0 : _b.replace(",", ".")) != null ? _c : "2");
    }
    if (!Number.isFinite(defaultWidth) || defaultWidth < 0) defaultWidth = 2;
    let defaultOpacity = this.outlineOpacity;
    if (!Number.isFinite(defaultOpacity)) {
      defaultOpacity = Number((_e = (_d = opacityMatch == null ? void 0 : opacityMatch[1]) == null ? void 0 : _d.replace(",", ".")) != null ? _e : "1");
      if (!Number.isFinite(defaultOpacity)) defaultOpacity = 1;
      if (defaultOpacity > 1.001) defaultOpacity = defaultOpacity / 100;
      defaultOpacity = Math.min(1, Math.max(0, defaultOpacity));
    }
    const colorSetting = new import_obsidian25.Setting(contentEl).setName("Outline color");
    this.colorText = colorSetting.controlEl.createEl("input", {
      type: "text"
    });
    this.colorText.classList.add("zoommap-drawing-editor__color-text");
    this.colorText.value = defaultColor;
    this.outlineColor = defaultColor;
    this.colorPicker = colorSetting.controlEl.createEl("input", {
      type: "color"
    });
    this.colorPicker.classList.add("zoommap-drawing-editor__color-picker");
    this.colorPicker.value = this.normalizeHex(defaultColor);
    this.colorText.oninput = () => {
      const val = this.colorText.value.trim();
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
        this.colorPicker.value = this.normalizeHex(val);
      }
      this.outlineColor = val || "#000000";
    };
    this.colorPicker.oninput = () => {
      const hex = this.colorPicker.value;
      this.colorText.value = hex;
      this.outlineColor = hex;
    };
    const widthSetting = new import_obsidian25.Setting(contentEl).setName("Stroke width");
    this.widthInput = widthSetting.controlEl.createEl("input", {
      type: "number"
    });
    this.widthInput.classList.add("zoommap-drawing-editor__num-input");
    this.widthInput.min = "0";
    this.widthInput.step = "0.5";
    this.widthInput.value = String(defaultWidth);
    this.outlineWidth = defaultWidth;
    const opacitySetting = new import_obsidian25.Setting(contentEl).setName("Opacity (%)");
    this.opacityInput = opacitySetting.controlEl.createEl("input", {
      type: "number"
    });
    this.opacityInput.classList.add("zoommap-drawing-editor__num-input");
    this.opacityInput.min = "0";
    this.opacityInput.max = "100";
    this.opacityInput.step = "5";
    this.opacityInput.value = String(Math.round(defaultOpacity * 100));
    this.outlineOpacity = defaultOpacity;
    contentEl.createEl("h3", { text: "SVG base (background)" });
    let kindSetting = null;
    let scaleSetting = null;
    let fillSetting = null;
    let strokeSetting = null;
    let innerOffsetSetting = null;
    let innerOffsetXSetting = null;
    new import_obsidian25.Setting(contentEl).setName("Add base").setDesc("Adds a background shape under the icon (separate color, optional outline).").addToggle((tg) => {
      tg.setValue(this.baseEnabled).onChange((on) => {
        this.baseEnabled = on;
        kindSetting == null ? void 0 : kindSetting.settingEl.toggle(on);
        scaleSetting == null ? void 0 : scaleSetting.settingEl.toggle(on);
        fillSetting == null ? void 0 : fillSetting.settingEl.toggle(on);
        strokeSetting == null ? void 0 : strokeSetting.settingEl.toggle(on);
        innerOffsetSetting == null ? void 0 : innerOffsetSetting.settingEl.toggle(on);
        innerOffsetXSetting == null ? void 0 : innerOffsetXSetting.settingEl.toggle(on);
      });
    });
    kindSetting = new import_obsidian25.Setting(contentEl).setName("Base shape").setDesc("Use existing SVG icon as the base.").addDropdown((d) => {
      var _a2, _b2, _c2;
      const svgIcons = ((_a2 = this.plugin.settings.icons) != null ? _a2 : []).filter((i) => this.isSvgIconProfile(i)).slice().sort((a, b) => {
        var _a3, _b3;
        return String((_a3 = a.key) != null ? _a3 : "").localeCompare(String((_b3 = b.key) != null ? _b3 : ""), void 0, { sensitivity: "base", numeric: true });
      });
      for (const ico of svgIcons) {
        d.addOption(`icon:${ico.key}`, ico.key);
      }
      const fallback = (_c2 = (_b2 = svgIcons[0]) == null ? void 0 : _b2.key) != null ? _c2 : "";
      const curKey = (this.baseIconKey || fallback).trim();
      this.baseIconKey = curKey;
      d.setValue(curKey ? `icon:${curKey}` : "");
      d.onChange((v) => {
        if (v.startsWith("icon:")) this.baseIconKey = v.slice("icon:".length);
      });
    });
    scaleSetting = new import_obsidian25.Setting(contentEl).setName("Base scale (%)").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.baseScalePct));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n) && n >= 50 && n <= 400) this.baseScalePct = Math.round(n);
      });
    });
    fillSetting = new import_obsidian25.Setting(contentEl).setName("Base fill");
    {
      const txt = fillSetting.controlEl.createEl("input", { type: "text" });
      txt.classList.add("zoommap-drawing-editor__color-text");
      txt.value = this.baseFill;
      const pick = fillSetting.controlEl.createEl("input", { type: "color" });
      pick.classList.add("zoommap-drawing-editor__color-picker");
      pick.value = this.normalizeHex(this.baseFill);
      txt.oninput = () => {
        const val = txt.value.trim() || "#ffffff";
        this.baseFill = val;
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) pick.value = this.normalizeHex(val);
      };
      pick.oninput = () => {
        this.baseFill = pick.value;
        txt.value = pick.value;
      };
    }
    strokeSetting = new import_obsidian25.Setting(contentEl).setName("Base outline");
    {
      const strokeTxt = strokeSetting.controlEl.createEl("input", { type: "text" });
      strokeTxt.classList.add("zoommap-drawing-editor__color-text");
      strokeTxt.value = this.baseStroke;
      const strokePick = strokeSetting.controlEl.createEl("input", { type: "color" });
      strokePick.classList.add("zoommap-drawing-editor__color-picker");
      strokePick.value = this.normalizeHex(this.baseStroke);
      const w = strokeSetting.controlEl.createEl("input", { type: "number" });
      w.classList.add("zoommap-drawing-editor__num-input");
      w.min = "0";
      w.value = String(this.baseStrokeWidth);
      w.title = "Stroke width";
      const op = strokeSetting.controlEl.createEl("input", { type: "number" });
      op.classList.add("zoommap-drawing-editor__num-input");
      op.value = String(Math.round(this.baseStrokeOpacity * 100));
      op.title = "Opacity (%)";
      strokeTxt.oninput = () => {
        const val = strokeTxt.value.trim() || "#000000";
        this.baseStroke = val;
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) strokePick.value = this.normalizeHex(val);
      };
      strokePick.oninput = () => {
        this.baseStroke = strokePick.value;
        strokeTxt.value = strokePick.value;
      };
      w.oninput = () => {
        const n = Number(String(w.value).replace(",", "."));
        if (Number.isFinite(n) && n >= 0) this.baseStrokeWidth = n;
      };
      op.oninput = () => {
        const n = Number(String(op.value).replace(",", "."));
        if (!Number.isFinite(n)) return;
        const clamped = Math.min(100, Math.max(0, n));
        this.baseStrokeOpacity = clamped / 100;
      };
    }
    innerOffsetXSetting = new import_obsidian25.Setting(contentEl).setName("Icon offset X (px)").setDesc("Moves the actual icon relative to the base. Negative = left, positive = right.").addText((t) => {
      var _a2;
      t.inputEl.type = "number";
      t.setPlaceholder("0");
      t.setValue(String((_a2 = this.innerOffsetXPx) != null ? _a2 : 0));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (!Number.isFinite(n)) return;
        this.innerOffsetXPx = Math.max(-500, Math.min(500, n));
      });
    });
    innerOffsetSetting = new import_obsidian25.Setting(contentEl).setName("Icon offset y (px)").setDesc("Moves the actual icon relative to the base. Negative = up, positive = down.").addText((t) => {
      var _a2;
      t.inputEl.type = "number";
      t.setPlaceholder("0");
      t.setValue(String((_a2 = this.innerOffsetYPx) != null ? _a2 : 0));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (!Number.isFinite(n)) return;
        this.innerOffsetYPx = Math.max(-500, Math.min(500, n));
      });
    });
    kindSetting.settingEl.toggle(this.baseEnabled);
    scaleSetting.settingEl.toggle(this.baseEnabled);
    fillSetting.settingEl.toggle(this.baseEnabled);
    contentEl.createEl("h3", { text: "Shadow" });
    let shadowColorSetting = null;
    let shadowBlurSetting = null;
    let shadowOffsetXSetting = null;
    let shadowOffsetYSetting = null;
    const toggleShadowRows = () => {
      const on = !!this.shadowEnabled;
      shadowColorSetting == null ? void 0 : shadowColorSetting.settingEl.toggle(on);
      shadowBlurSetting == null ? void 0 : shadowBlurSetting.settingEl.toggle(on);
      shadowOffsetXSetting == null ? void 0 : shadowOffsetXSetting.settingEl.toggle(on);
      shadowOffsetYSetting == null ? void 0 : shadowOffsetYSetting.settingEl.toggle(on);
    };
    new import_obsidian25.Setting(contentEl).setName("Enable shadow").addToggle((tg) => {
      tg.setValue(this.shadowEnabled).onChange((on) => {
        this.shadowEnabled = on;
        toggleShadowRows();
      });
    });
    shadowColorSetting = new import_obsidian25.Setting(contentEl).setName("Shadow color");
    {
      const txt = shadowColorSetting.controlEl.createEl("input", { type: "text" });
      txt.classList.add("zoommap-drawing-editor__color-text");
      txt.value = this.shadowColor;
      const pick = shadowColorSetting.controlEl.createEl("input", { type: "color" });
      pick.classList.add("zoommap-drawing-editor__color-picker");
      pick.value = this.normalizeHex(this.shadowColor);
      txt.oninput = () => {
        const val = txt.value.trim() || "#000000";
        this.shadowColor = val;
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) pick.value = this.normalizeHex(val);
      };
      pick.oninput = () => {
        this.shadowColor = pick.value;
        txt.value = pick.value;
      };
    }
    shadowBlurSetting = new import_obsidian25.Setting(contentEl).setName("Shadow blur (px)").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.shadowBlurPx));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n) && n >= 0) this.shadowBlurPx = n;
      });
    });
    shadowOffsetXSetting = new import_obsidian25.Setting(contentEl).setName("Shadow offset x (px)").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.shadowOffsetXPx));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n)) this.shadowOffsetXPx = n;
      });
    });
    shadowOffsetYSetting = new import_obsidian25.Setting(contentEl).setName("Shadow offset y (px)").addText((t) => {
      t.inputEl.type = "number";
      t.setValue(String(this.shadowOffsetYPx));
      t.onChange((v) => {
        const n = Number(String(v).replace(",", "."));
        if (Number.isFinite(n)) this.shadowOffsetYPx = n;
      });
    });
    toggleShadowRows();
    strokeSetting.settingEl.toggle(this.baseEnabled);
    innerOffsetSetting.settingEl.toggle(this.baseEnabled);
    innerOffsetXSetting.settingEl.toggle(this.baseEnabled);
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      void this.applyAndSave();
    };
    cancelBtn.onclick = () => this.close();
  }
  async loadSvgSource() {
    const src = this.icon.pathOrDataUrl;
    if (!src || typeof src !== "string") return null;
    if (src.startsWith("data:image/svg+xml")) {
      const idx = src.indexOf(",");
      if (idx < 0) return null;
      try {
        return decodeURIComponent(src.slice(idx + 1));
      } catch (e) {
        return null;
      }
    }
    if (src.toLowerCase().endsWith(".svg")) {
      const af = this.app.vault.getAbstractFileByPath(src);
      if (af instanceof import_obsidian25.TFile) {
        return this.app.vault.read(af);
      }
    }
    return null;
  }
  async applyAndSave() {
    var _a, _b, _c;
    if (!this.svgSource) {
      new import_obsidian25.Notice("SVG content not loaded.", 2e3);
      return;
    }
    if (this.baseEnabled) {
      const k = ((_a = this.baseIconKey) != null ? _a : "").trim();
      const svgIcons = ((_b = this.plugin.settings.icons) != null ? _b : []).filter((i) => this.isSvgIconProfile(i));
      const exists = svgIcons.some((i) => i.key === k);
      if (!k || !exists) {
        new import_obsidian25.Notice("Please choose a base icon (SVG) from the library.", 3e3);
        return;
      }
    }
    const color = this.colorText.value.trim() || "#000000";
    let width = Number(this.widthInput.value.replace(",", "."));
    if (!Number.isFinite(width) || width < 0) width = 2;
    let opacity = Number(this.opacityInput.value.replace(",", "."));
    if (!Number.isFinite(opacity)) opacity = 100;
    if (opacity > 1.001) opacity = opacity / 100;
    opacity = Math.min(1, Math.max(0, opacity));
    if (this.shadowEnabled) {
      this.icon.shadowEnabled = true;
      this.icon.shadowColor = ((_c = this.shadowColor) != null ? _c : "").trim() || "#000000";
      this.icon.shadowBlurPx = Math.max(0, Number(this.shadowBlurPx) || 0);
      this.icon.shadowOffsetXPx = Number.isFinite(this.shadowOffsetXPx) ? this.shadowOffsetXPx : 2;
      this.icon.shadowOffsetYPx = Number.isFinite(this.shadowOffsetYPx) ? this.shadowOffsetYPx : 2;
    } else {
      delete this.icon.shadowEnabled;
      delete this.icon.shadowColor;
      delete this.icon.shadowBlurPx;
      delete this.icon.shadowOffsetXPx;
      delete this.icon.shadowOffsetYPx;
    }
    this.outlineColor = color;
    this.outlineWidth = width;
    this.outlineOpacity = opacity;
    const updatedSvg = this.applyOutline(
      this.svgSource,
      color,
      width,
      opacity
    );
    const dataUrl = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(updatedSvg);
    this.icon.pathOrDataUrl = dataUrl;
    await this.plugin.saveSettings();
    if (this.onApplied) {
      this.onApplied(dataUrl);
    }
    this.close();
  }
  applyOutline(svg, color, width, opacity) {
    var _a, _b, _c, _d, _e;
    let s = this.removeExistingZmOutline(svg);
    s = this.removeExistingZmBase(s);
    const outlinePad = Math.max(0, width) * 2;
    const basePad = this.baseEnabled ? this.computeBasePadFromOrigViewBox(s) : 0;
    const offsetPad = Math.max(Math.abs((_a = this.innerOffsetXPx) != null ? _a : 0), Math.abs((_b = this.innerOffsetYPx) != null ? _b : 0));
    const pad = Math.max(outlinePad, basePad, offsetPad);
    s = this.applyViewBoxPaddingAbsolute(s, pad);
    const openMatch = /<svg[^>]*>/i.exec(s);
    const closeIndex = s.lastIndexOf("</svg>");
    if (!openMatch || closeIndex < 0) {
      return s;
    }
    const openTag = openMatch[0];
    const openEnd = ((_c = openMatch.index) != null ? _c : 0) + openTag.length;
    const inner = s.slice(openEnd, closeIndex);
    const baseGroup = this.baseEnabled ? this.buildBaseGroup(s) : "";
    const dx = Number((_d = this.innerOffsetXPx) != null ? _d : 0);
    const dy = Number((_e = this.innerOffsetYPx) != null ? _e : 0);
    const hasOffset = Number.isFinite(dx) && dx !== 0 || Number.isFinite(dy) && dy !== 0;
    const tr = hasOffset ? ` transform="translate(${dx} ${dy})"` : "";
    const outlineEnabled = Number.isFinite(width) && width > 0 && Number.isFinite(opacity) && opacity > 0;
    let outlineGroup = "";
    if (outlineEnabled) {
      const outlineInner = this.stripFillAndStrokeForOutline(inner);
      outlineGroup = `<g id="zm-outline"${tr} fill="none" stroke="${color}" stroke-width="${width}" stroke-opacity="${opacity}" vector-effect="non-scaling-stroke">` + outlineInner + `</g>`;
    }
    const innerGroup = `<g id="zm-inner"${tr}>${inner}</g>`;
    const newInner = baseGroup + outlineGroup + innerGroup;
    const merged = s.slice(0, openEnd) + newInner + s.slice(closeIndex);
    return this.writePersistedMeta(merged);
  }
  removeExistingZmBase(svg) {
    var _a;
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) return svg;
      (_a = svgEl.querySelector("#zm-base")) == null ? void 0 : _a.remove();
      return new XMLSerializer().serializeToString(svgEl);
    } catch (e) {
      return svg;
    }
  }
  computeBasePadFromOrigViewBox(svg) {
    const svgEl = this.parseSvgRoot(svg);
    if (!svgEl) return 0;
    const orig = this.getOrigViewBox(svgEl);
    if (!orig) return 0;
    const baseScale = (this.baseScalePct || 100) / 100;
    const halfMin = Math.min(orig.w, orig.h) / 2;
    const r = halfMin * baseScale;
    const extra = Math.max(0, r - halfMin);
    const strokePad = Math.max(0, this.baseStrokeWidth || 0) * 2;
    return extra + strokePad;
  }
  buildBaseGroup(svg) {
    var _a, _b, _c, _d;
    const svgEl = this.parseSvgRoot(svg);
    if (!svgEl) return "";
    const orig = this.getOrigViewBox(svgEl);
    if (!orig) return "";
    const minX = orig.minX, minY = orig.minY, w = orig.w, h = orig.h;
    const cx = minX + w / 2;
    const cy = minY + h / 2;
    const halfMin = Math.min(w, h) / 2;
    const r = halfMin * ((this.baseScalePct || 100) / 100);
    const fill = this.baseFill || "#ffffff";
    const stroke = this.baseStroke || "#000000";
    const sw = Math.max(0, Number(this.baseStrokeWidth) || 0);
    const so = Math.min(1, Math.max(0, Number(this.baseStrokeOpacity) || 0));
    if (this.baseKind === "icon" && this.baseIconKey) {
      const ico = ((_a = this.plugin.settings.icons) != null ? _a : []).find((i) => i.key === this.baseIconKey);
      const src = (_b = ico == null ? void 0 : ico.pathOrDataUrl) != null ? _b : "";
      if (typeof src === "string" && src.startsWith("data:image/svg+xml")) {
        const idx = src.indexOf(",");
        if (idx >= 0) {
          try {
            const baseSvg = decodeURIComponent(src.slice(idx + 1));
            const stripped = this.stripOuterSvg(baseSvg);
            const vb2 = (_c = stripped == null ? void 0 : stripped.viewBox) != null ? _c : "0 0 24 24";
            const p2 = vb2.trim().split(/[\s,]+/).map((x) => Number(x));
            if (p2.length === 4 && p2.every((n) => Number.isFinite(n))) {
              const bw = p2[2], bh = p2[3];
              const target = 2 * r;
              const k = target / Math.max(1, Math.max(bw, bh));
              const tx = cx - bw * k / 2;
              const ty = cy - bh * k / 2;
              const inner = (_d = stripped == null ? void 0 : stripped.inner) != null ? _d : "";
              return `<g id="zm-base" fill="none">
  <g transform="translate(${tx} ${ty}) scale(${k})"
     fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${so}">
    ${inner}
  </g>
</g>`;
            }
          } catch (e) {
          }
        }
      }
    }
    return "";
  }
  removeExistingZmOutline(svg) {
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) return svg;
      const oldOutline = svgEl.querySelector("#zm-outline");
      oldOutline == null ? void 0 : oldOutline.remove();
      const oldInner = svgEl.querySelector("#zm-inner");
      if (oldInner) {
        const frag = doc.createDocumentFragment();
        while (oldInner.firstChild) frag.appendChild(oldInner.firstChild);
        oldInner.replaceWith(frag);
      }
      return new XMLSerializer().serializeToString(svgEl);
    } catch (e) {
      return svg;
    }
  }
  applyViewBoxPaddingFromOriginal(svg, strokeWidth) {
    var _a;
    try {
      const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      if (!svgEl) return svg;
      const orig = (_a = svgEl.getAttribute("data-zm-orig-viewbox")) != null ? _a : svgEl.getAttribute("viewBox");
      if (!orig) return svg;
      if (!svgEl.getAttribute("data-zm-orig-viewbox")) {
        svgEl.setAttribute("data-zm-orig-viewbox", orig);
      }
      const parts = orig.trim().split(/[\s,]+/).map((x) => Number(x));
      if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return svg;
      const [minX, minY, w, h] = parts;
      if (w <= 0 || h <= 0) return svg;
      const pad = strokeWidth * 2;
      const newMinX = minX - pad;
      const newMinY = minY - pad;
      const newW = w + pad * 2;
      const newH = h + pad * 2;
      svgEl.setAttribute("viewBox", `${newMinX} ${newMinY} ${newW} ${newH}`);
      return new XMLSerializer().serializeToString(svgEl);
    } catch (e) {
      return svg;
    }
  }
  stripFillAndStrokeForOutline(src) {
    let s = src;
    s = s.replace(/fill="[^"]*"/gi, "");
    s = s.replace(/stroke="[^"]*"/gi, "");
    s = s.replace(/stroke-width="[^"]*"/gi, "");
    s = s.replace(/stroke-opacity="[^"]*"/gi, "");
    s = s.replace(/style="([^"]*)"/gi, (_m, style) => {
      let st = style;
      st = st.replace(/(?:^|;)\s*fill\s*:[^;]*/gi, "");
      st = st.replace(/(?:^|;)\s*stroke\s*:[^;]*/gi, "");
      st = st.replace(/(?:^|;)\s*stroke-width\s*:[^;]*/gi, "");
      st = st.replace(/(?:^|;)\s*stroke-opacity\s*:[^;]*/gi, "");
      st = st.replace(/;;+/g, ";").replace(/^;/, "").replace(/;$/, "").trim();
      if (!st) return "";
      return `style="${st}"`;
    });
    return s;
  }
  normalizeHex(v) {
    if (!v.startsWith("#")) return v;
    if (v.length === 4) {
      const r = v[1];
      const g = v[2];
      const b = v[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return v;
  }
};

// src/imageCache.ts
function isImageBitmapLike2(x) {
  return typeof x === "object" && x !== null && "close" in x && typeof x.close === "function";
}
function approxBytesForSource(src) {
  var _a, _b;
  if (isImageBitmapLike2(src)) return src.width * src.height * 4;
  const w = (_a = src.naturalWidth) != null ? _a : 0;
  const h = (_b = src.naturalHeight) != null ? _b : 0;
  if (w > 0 && h > 0) return w * h * 4;
  return 0;
}
var ImageCache = class {
  constructor(app, maxBytes) {
    this.startEvictRatio = 0.9;
    // start evicting above 90%
    this.targetEvictRatio = 0.8;
    // evict down to 80% (free ~10% headroom)
    this.entries = /* @__PURE__ */ new Map();
    this.refs = /* @__PURE__ */ new Map();
    this.loading = /* @__PURE__ */ new Map();
    this.app = app;
    this.maxBytes = Math.max(64 * 1024 * 1024, maxBytes);
  }
  setMaxBytes(maxBytes) {
    this.maxBytes = Math.max(64 * 1024 * 1024, maxBytes);
    this.evictIfNeeded();
  }
  getMaxBytes() {
    return this.maxBytes;
  }
  getRefCount(path) {
    var _a;
    return (_a = this.refs.get(path)) != null ? _a : 0;
  }
  getTotalBytes() {
    let total = 0;
    for (const e of this.entries.values()) total += e.bytes;
    return total;
  }
  clear() {
    for (const [path, e] of this.entries) {
      this.closeEntry(path, e);
    }
    this.entries.clear();
    this.refs.clear();
    this.loading.clear();
  }
  /**
   * Acquire a cached image for the session.
   * - Increments refcount (must be paired with release()).
   * - Loads and decodes at most once per session (per path), unless evicted.
   */
  async acquire(file) {
    var _a;
    const key = file.path;
    this.refs.set(key, ((_a = this.refs.get(key)) != null ? _a : 0) + 1);
    const existing = this.entries.get(key);
    if (existing) {
      existing.lastUsed = Date.now();
      return existing.src;
    }
    const inflight = this.loading.get(key);
    if (inflight) return inflight;
    const p = this.loadSource(file).then((src) => {
      const bytes = approxBytesForSource(src);
      this.entries.set(key, { src, bytes, lastUsed: Date.now() });
      this.loading.delete(key);
      this.evictIfNeeded();
      return src;
    }).catch((err) => {
      this.loading.delete(key);
      this.release(key);
      throw err;
    });
    this.loading.set(key, p);
    return p;
  }
  /**
   * Release a previously acquired image path.
   * Eviction can only happen when refcount == 0 AND cache is above the high watermark.
   */
  release(path) {
    var _a;
    const cur = (_a = this.refs.get(path)) != null ? _a : 0;
    if (cur <= 1) this.refs.delete(path);
    else this.refs.set(path, cur - 1);
    this.evictIfNeeded();
  }
  async loadSource(file) {
    const url = this.app.vault.getResourcePath(file);
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    try {
      await img.decode();
    } catch (e) {
    }
    try {
      return await createImageBitmap(img);
    } catch (e) {
      return img;
    }
  }
  evictIfNeeded() {
    const total = this.getTotalBytes();
    const start = this.maxBytes * this.startEvictRatio;
    if (total <= start) return;
    const target = this.maxBytes * this.targetEvictRatio;
    let curTotal = total;
    const candidates = [...this.entries.entries()].filter(([path]) => {
      var _a;
      return ((_a = this.refs.get(path)) != null ? _a : 0) === 0;
    }).sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    for (const [path, e] of candidates) {
      if (curTotal <= target) break;
      curTotal -= e.bytes;
      this.closeEntry(path, e);
      this.entries.delete(path);
    }
  }
  closeEntry(path, e) {
    try {
      if (isImageBitmapLike2(e.src)) e.src.close();
    } catch (error) {
      console.warn("Zoom Map: failed to close cached image", { path, error });
    }
  }
};

// src/mapShare.ts
var import_jszip = __toESM(require_jszip_min());
var import_obsidian27 = require("obsidian");

// src/folderSuggest.ts
var import_obsidian26 = require("obsidian");
var FolderSuggestModal = class extends import_obsidian26.FuzzySuggestModal {
  constructor(app, onChoose) {
    super(app);
    this.appRef = app;
    this.onChoose = onChoose;
    this.folders = this.appRef.vault.getAllLoadedFiles().filter((f) => f instanceof import_obsidian26.TFolder).sort((a, b) => a.path.localeCompare(b.path));
    this.setPlaceholder("Choose folder\u2026");
  }
  getItems() {
    return this.folders;
  }
  getItemText(item) {
    return item.path;
  }
  onChooseItem(item) {
    this.onChoose(item);
  }
};

// src/mapShare.ts
var BUNDLE_JSON_PATH = "zoommap-bundle.json";
function deepClone5(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
function stableStringify2(value) {
  const seen = /* @__PURE__ */ new WeakSet();
  const norm = (v) => {
    if (v && typeof v === "object") {
      if (seen.has(v)) return null;
      seen.add(v);
      if (Array.isArray(v)) return v.map(norm);
      const out = {};
      for (const key of Object.keys(v).sort()) {
        out[key] = norm(v[key]);
      }
      return out;
    }
    return v;
  };
  return JSON.stringify(norm(value));
}
function folderOf2(path) {
  const idx = path.lastIndexOf("/");
  return idx >= 0 ? path.slice(0, idx) : "";
}
function basename2(path) {
  const idx = path.lastIndexOf("/");
  return idx >= 0 ? path.slice(idx + 1) : path;
}
function fileStem2(path) {
  const name = basename2(path);
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(0, idx) : name;
}
function sanitizeFileName(name) {
  return (name != null ? name : "").replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, " ").trim();
}
function sanitizePathSegment(seg) {
  const cleaned = sanitizeFileName(seg).replace(/^\.+$/, "_");
  return cleaned || "_";
}
function safeRelativePath(originalPath) {
  const parts = (0, import_obsidian27.normalizePath)(originalPath).split("/").map((p) => p.trim()).filter((p) => p.length > 0 && p !== "." && p !== "..").map(sanitizePathSegment);
  return parts.length ? parts.join("/") : sanitizePathSegment(basename2(originalPath || "item"));
}
function joinRoot(root, originalPath) {
  const rel = safeRelativePath(originalPath);
  return (0, import_obsidian27.normalizePath)(`${root}/${rel}`);
}
function toArrayBuffer(bytes) {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  );
}
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function isBundleAssetKind(value) {
  return value === "base" || value === "overlay" || value === "frame" || value === "sticker" || value === "drawing" || value === "linked-note";
}
function isBundleAssetEntry(value) {
  return isRecord2(value) && isBundleAssetKind(value.kind) && typeof value.originalPath === "string" && typeof value.zipPath === "string";
}
function isZoomMapBundleV1(value) {
  return isRecord2(value) && value.version === 1 && typeof value.exportedAt === "string" && typeof value.bundleName === "string" && isRecord2(value.map) && Array.isArray(value.assets) && value.assets.every(isBundleAssetEntry);
}
function mimeFromPath(path) {
  var _a, _b;
  const ext = (_b = (_a = basename2(path).split(".").pop()) == null ? void 0 : _a.toLowerCase()) != null ? _b : "";
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}
function arrayBufferToBase64(buf) {
  const bytes = new Uint8Array(buf);
  const chunkSize = 32768;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return safeBtoa(binary);
}
function dataUrlFromBytes(path, buf) {
  return `data:${mimeFromPath(path)};base64,${arrayBufferToBase64(buf)}`;
}
function safeBtoa(binary) {
  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(binary);
  }
  const maybeBuffer = globalThis.Buffer;
  if (maybeBuffer && typeof maybeBuffer.from === "function") {
    return maybeBuffer.from(binary, "binary").toString("base64");
  }
  throw new Error("No base64 encoder available in this runtime.");
}
function isDataUrl(value) {
  return typeof value === "string" && value.startsWith("data:");
}
function normalizeBases(raw) {
  const out = [];
  for (const item of raw != null ? raw : []) {
    if (typeof item === "string") {
      out.push({ path: item });
    } else if (item && typeof item === "object" && "path" in item) {
      const path = item.path;
      const name = item.name;
      if (typeof path === "string" && path.trim()) {
        out.push({
          path,
          name: typeof name === "string" && name.trim() ? name : void 0
        });
      }
    }
  }
  return out;
}
function normalizeOverlays(raw) {
  return (raw != null ? raw : []).map((o) => ({
    path: o.path,
    visible: o.visible !== false,
    name: o.name
  }));
}
function splitRawLink(raw) {
  const trimmed = (raw != null ? raw : "").trim();
  const pipeIdx = trimmed.indexOf("|");
  const left = pipeIdx >= 0 ? trimmed.slice(0, pipeIdx) : trimmed;
  const alias = pipeIdx >= 0 ? trimmed.slice(pipeIdx + 1) : void 0;
  const hashIdx = left.indexOf("#");
  if (hashIdx >= 0) {
    return {
      path: left.slice(0, hashIdx).trim(),
      anchor: left.slice(hashIdx + 1).trim() || void 0,
      alias: (alias == null ? void 0 : alias.trim()) || void 0
    };
  }
  return {
    path: left.trim(),
    alias: (alias == null ? void 0 : alias.trim()) || void 0
  };
}
function buildRawLink(base, anchor, alias) {
  let out = base;
  if (anchor) out += `#${anchor}`;
  if (alias) out += `|${alias}`;
  return out;
}
function quoteAwareInsertionText(editor, codeBlock, inlineBlock) {
  var _a, _b;
  const cursor = editor.getCursor();
  const line = (_a = editor.getLine(cursor.line)) != null ? _a : "";
  const m = /^(\s*(?:>\s*)+)/.exec(line);
  const quotePrefix = (_b = m == null ? void 0 : m[1]) != null ? _b : "";
  const normalizedCode = `${codeBlock.trimEnd()}
`;
  const normalizedInline = inlineBlock ? `${inlineBlock.trimEnd()}
` : "";
  if (!quotePrefix) {
    return normalizedInline ? `${normalizedCode}
${normalizedInline}` : normalizedCode;
  }
  const cursorAfterPrefix = cursor.ch >= quotePrefix.length;
  const quotedCode = normalizedCode.split("\n").map((ln, idx) => {
    if (idx === normalizedCode.split("\n").length - 1 && ln === "") return "";
    if (idx === 0 && cursorAfterPrefix) return ln;
    return `${quotePrefix}${ln}`;
  }).join("\n").trimEnd() + "\n";
  return normalizedInline ? `${quotedCode}
${normalizedInline}` : quotedCode;
}
function buildInlineStorageBlock(mapId, data) {
  const payload = JSON.stringify(sanitizeMarkerFileDataForSave(data), null, 2);
  return [
    "%%",
    `ZOOMMAP-DATA id=${mapId}`,
    payload,
    "/ZOOMMAP-DATA",
    "%%",
    ""
  ].join("\n");
}
function downloadZip(filename, bytes) {
  const blob = new Blob([bytes], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
async function deleteVaultPathIfExists(app, path) {
  const existing = app.vault.getAbstractFileByPath((0, import_obsidian27.normalizePath)(path));
  if (!(existing instanceof import_obsidian27.TFile)) return;
  await app.fileManager.trashFile(existing, false);
}
async function ensureFolderPathExists(app, folder) {
  const normalized = (0, import_obsidian27.normalizePath)(folder).trim();
  if (!normalized) return;
  const parts = normalized.split("/").filter(Boolean);
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!app.vault.getAbstractFileByPath(current)) {
      await app.vault.createFolder(current);
    }
  }
}
async function uniqueVaultPath(app, desiredPath, reserved) {
  const normalized = (0, import_obsidian27.normalizePath)(desiredPath);
  if (!app.vault.getAbstractFileByPath(normalized) && !(reserved == null ? void 0 : reserved.has(normalized))) {
    reserved == null ? void 0 : reserved.add(normalized);
    return normalized;
  }
  const dir = folderOf2(normalized);
  const base = basename2(normalized);
  const dot = base.lastIndexOf(".");
  const stem = dot >= 0 ? base.slice(0, dot) : base;
  const ext = dot >= 0 ? base.slice(dot) : "";
  let i = 1;
  while (true) {
    const candidate = (0, import_obsidian27.normalizePath)(`${dir}/${stem}-${i}${ext}`);
    if (!app.vault.getAbstractFileByPath(candidate) && !(reserved == null ? void 0 : reserved.has(candidate))) {
      reserved == null ? void 0 : reserved.add(candidate);
      return candidate;
    }
    i += 1;
  }
}
async function readVaultBinary(app, file) {
  const vaultAny = app.vault;
  if (typeof vaultAny.readBinary === "function") {
    const raw = await vaultAny.readBinary(file);
    return raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  }
  const adapterAny = app.vault.adapter;
  if (typeof adapterAny.readBinary === "function") {
    const raw = await adapterAny.readBinary(file.path);
    return raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  }
  throw new Error(`Cannot read binary file: ${file.path}`);
}
async function writeVaultBinary(app, path, bytes) {
  const normalized = (0, import_obsidian27.normalizePath)(path);
  await ensureFolderPathExists(app, folderOf2(normalized));
  const existing = app.vault.getAbstractFileByPath(normalized);
  const buf = toArrayBuffer(bytes);
  const vaultAny = app.vault;
  if (existing instanceof import_obsidian27.TFile && typeof vaultAny.modifyBinary === "function") {
    await vaultAny.modifyBinary(existing, buf);
    return;
  }
  if (!(existing instanceof import_obsidian27.TFile) && typeof vaultAny.createBinary === "function") {
    await vaultAny.createBinary(normalized, buf);
    return;
  }
  const adapterAny = app.vault.adapter;
  if (typeof adapterAny.writeBinary === "function") {
    await adapterAny.writeBinary(normalized, buf);
    return;
  }
  throw new Error(`Cannot write binary file: ${normalized}`);
}
async function writeVaultText(app, path, text) {
  const normalized = (0, import_obsidian27.normalizePath)(path);
  await ensureFolderPathExists(app, folderOf2(normalized));
  const existing = app.vault.getAbstractFileByPath(normalized);
  if (existing instanceof import_obsidian27.TFile) {
    await app.vault.modify(existing, text);
  } else {
    await app.vault.create(normalized, text);
  }
}
function resolveFile(app, pathOrLink, fromPath) {
  const trimmed = (pathOrLink != null ? pathOrLink : "").trim();
  if (!trimmed) return null;
  const byPath = app.vault.getAbstractFileByPath(trimmed);
  if (byPath instanceof import_obsidian27.TFile) return byPath;
  const dest = app.metadataCache.getFirstLinkpathDest(trimmed, fromPath);
  return dest instanceof import_obsidian27.TFile ? dest : null;
}
function normalizeIconSignature(icon) {
  const copy = deepClone5(icon);
  delete copy.key;
  return stableStringify2(copy);
}
function normalizeSwapSignature(preset) {
  const copy = deepClone5(preset);
  delete copy.id;
  return stableStringify2(copy);
}
function normalizePingSignature(preset) {
  const copy = deepClone5(preset);
  delete copy.id;
  return stableStringify2(copy);
}
function normalizeStickerSignature(preset) {
  return stableStringify2(preset);
}
function uniqueCollectionItemId(prefix, taken, desired) {
  let candidate = (desired != null ? desired : "").trim();
  if (!candidate || taken.has(candidate)) candidate = `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
  while (taken.has(candidate)) {
    candidate = `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
  }
  taken.add(candidate);
  return candidate;
}
function bundleUsesCustomUnits(data) {
  var _a, _b;
  if (((_a = data.measurement) == null ? void 0 : _a.displayUnit) === "custom") return true;
  if (((_b = data.markers) != null ? _b : []).some((m) => m.pingRadiusUnit === "custom")) return true;
  return false;
}
function isCustomFontValue(value) {
  const v = (value != null ? value : "").trim().toLowerCase();
  if (!v) return false;
  if (v.startsWith("var(")) return false;
  if (v === "system-ui" || v === "sans-serif" || v === "serif" || v === "monospace") return false;
  if (v.includes("var(--font-")) return false;
  return true;
}
function collectCustomFonts(data) {
  var _a, _b;
  const out = /* @__PURE__ */ new Set();
  const addStyle = (style) => {
    var _a2;
    const family = ((_a2 = style == null ? void 0 : style.fontFamily) != null ? _a2 : "").trim();
    if (family && isCustomFontValue(family)) out.add(family);
  };
  for (const layer of (_a = data.textLayers) != null ? _a : []) {
    addStyle(layer.style);
    for (const box of (_b = layer.boxes) != null ? _b : []) addStyle(box.style);
  }
  return [...out].sort((a, b) => a.localeCompare(b));
}
function ensureCollectionArrays(col) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
  (_a = col.bindings) != null ? _a : col.bindings = { basePaths: [] };
  (_c = (_b = col.bindings).basePaths) != null ? _c : _b.basePaths = [];
  (_d = col.include) != null ? _d : col.include = {
    pinKeys: [],
    favorites: [],
    stickers: [],
    swapPins: [],
    pingPins: []
  };
  (_f = (_e = col.include).pinKeys) != null ? _f : _e.pinKeys = [];
  (_h = (_g = col.include).favorites) != null ? _h : _g.favorites = [];
  (_j = (_i = col.include).stickers) != null ? _j : _i.stickers = [];
  (_l = (_k = col.include).swapPins) != null ? _l : _k.swapPins = [];
  (_n = (_m = col.include).pingPins) != null ? _n : _m.pingPins = [];
}
function createSyntheticStickerPresets(data) {
  var _a, _b;
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const marker of (_a = data.markers) != null ? _a : []) {
    if (marker.type !== "sticker" || !marker.stickerPath) continue;
    const preset = {
      name: fileStem2(marker.stickerPath) || "Sticker",
      imagePath: marker.stickerPath,
      size: Math.max(1, Math.round((_b = marker.stickerSize) != null ? _b : 64)),
      openEditor: false
    };
    const sig = normalizeStickerSignature(preset);
    if (seen.has(sig)) continue;
    seen.add(sig);
    out.push(preset);
  }
  return out;
}
function findSwapPreset(plugin, id) {
  var _a, _b, _c;
  const cols = (_a = plugin.settings.baseCollections) != null ? _a : [];
  for (const col of cols) {
    const found = ((_c = (_b = col.include) == null ? void 0 : _b.swapPins) != null ? _c : []).find((sp) => sp.id === id);
    if (found) return deepClone5(found);
  }
  return null;
}
function findPingPreset(plugin, id) {
  var _a, _b, _c;
  const cols = (_a = plugin.settings.baseCollections) != null ? _a : [];
  for (const col of cols) {
    const found = ((_c = (_b = col.include) == null ? void 0 : _b.pingPins) != null ? _c : []).find((pp) => pp.id === id);
    if (found) return deepClone5(found);
  }
  return null;
}
function findIconLike(plugin, key) {
  var _a;
  const existing = ((_a = plugin.settings.icons) != null ? _a : []).find((i) => i.key === key);
  if (existing) return deepClone5(existing);
  const builtin = plugin.builtinIcon();
  return {
    ...deepClone5(builtin),
    key: key || builtin.key,
    inCollections: true
  };
}
async function serializeIconForBundle(app, plugin, sourcePath, iconKey) {
  var _a;
  const icon = findIconLike(plugin, iconKey);
  const src = (_a = icon.pathOrDataUrl) != null ? _a : "";
  if (isDataUrl(src)) return icon;
  const file = resolveFile(app, src, sourcePath);
  if (!file) return icon;
  const bytes = await readVaultBinary(app, file);
  return {
    ...icon,
    pathOrDataUrl: dataUrlFromBytes(file.path, toArrayBuffer(bytes))
  };
}
function collectUsedCollectionSubset(plugin, data, bundleName) {
  var _a, _b, _c, _d, _e, _f;
  const pinKeys = /* @__PURE__ */ new Set();
  const swapPins = [];
  const pingPins = [];
  const seenSwap = /* @__PURE__ */ new Set();
  const seenPing = /* @__PURE__ */ new Set();
  for (const marker of (_a = data.markers) != null ? _a : []) {
    if (marker.type !== "sticker") {
      const key = ((_c = (_b = marker.iconKey) != null ? _b : plugin.settings.defaultIconKey) != null ? _c : "").trim();
      if (key) pinKeys.add(key);
    }
    if (marker.type === "swap" && marker.swapKey && !seenSwap.has(marker.swapKey)) {
      const preset = findSwapPreset(plugin, marker.swapKey);
      if (preset) {
        swapPins.push(preset);
        seenSwap.add(marker.swapKey);
        for (const frame of (_d = preset.frames) != null ? _d : []) {
          const key = ((_e = frame.iconKey) != null ? _e : "").trim();
          if (key) pinKeys.add(key);
        }
      }
    }
    if (marker.type === "ping" && marker.pingPresetId && !seenPing.has(marker.pingPresetId)) {
      const preset = findPingPreset(plugin, marker.pingPresetId);
      if (preset) {
        pingPins.push(preset);
        seenPing.add(marker.pingPresetId);
        const key = ((_f = preset.iconKey) != null ? _f : "").trim();
        if (key) pinKeys.add(key);
      }
    }
  }
  return {
    suggestedName: `Imported ${bundleName}`,
    pinKeys: [...pinKeys].sort((a, b) => a.localeCompare(b)),
    favorites: [],
    stickers: createSyntheticStickerPresets(data),
    swapPins,
    pingPins
  };
}
function collectUsedIconKeys(plugin, data, subset, fallbackDefaultIconKey) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const keys = /* @__PURE__ */ new Set();
  let needsFallbackDefault = false;
  for (const marker of (_a = data.markers) != null ? _a : []) {
    if (marker.type === "sticker") continue;
    const key = ((_b = marker.iconKey) != null ? _b : "").trim();
    if (key) keys.add(key);
    else needsFallbackDefault = true;
  }
  for (const key of subset.pinKeys) {
    if (key.trim()) keys.add(key.trim());
  }
  for (const preset of (_c = subset.swapPins) != null ? _c : []) {
    for (const frame of (_d = preset.frames) != null ? _d : []) {
      const key = ((_e = frame.iconKey) != null ? _e : "").trim();
      if (key) keys.add(key);
    }
  }
  for (const preset of (_f = subset.pingPins) != null ? _f : []) {
    const key = ((_g = preset.iconKey) != null ? _g : "").trim();
    if (key) keys.add(key);
  }
  const defaultKey = ((_h = fallbackDefaultIconKey != null ? fallbackDefaultIconKey : plugin.settings.defaultIconKey) != null ? _h : "").trim();
  if (needsFallbackDefault && defaultKey) keys.add(defaultKey);
  return [...keys].sort((a, b) => a.localeCompare(b));
}
function collectConfiguredAssetPaths(ctx) {
  var _a, _b, _c;
  const markerData = ctx.markerData;
  const basePaths = normalizeBases(markerData.bases).map((b) => b.path);
  const overlayPaths = normalizeOverlays(markerData.overlays).map((o) => o.path);
  const stickerPaths = ((_a = markerData.markers) != null ? _a : []).filter((m) => m.type === "sticker" && typeof m.stickerPath === "string").map((m) => m.stickerPath);
  const drawingPaths = ((_b = markerData.drawings) != null ? _b : []).map((d) => {
    var _a2;
    return (_a2 = d.bakedPath) != null ? _a2 : "";
  }).filter((p) => !!p);
  let framePath;
  const yamlObj = (_c = ctx.yamlObject) != null ? _c : {};
  const vp = yamlObj["viewportFrame"];
  if (typeof vp === "string" && vp.trim() && !isDataUrl(vp)) framePath = vp.trim();
  return {
    basePaths,
    overlayPaths,
    framePath,
    stickerPaths,
    drawingPaths
  };
}
function collectDirectResolvedNoteLinks(app, file) {
  var _a, _b, _c;
  const resolvedLinks = {};
  const notePaths = /* @__PURE__ */ new Set();
  const cache = thisSafeFileCache(app, file);
  const rawLinks = /* @__PURE__ */ new Set();
  for (const entry of (_a = cache == null ? void 0 : cache.links) != null ? _a : []) {
    const raw = typeof entry.link === "string" ? entry.link.trim() : "";
    if (raw) rawLinks.add(raw);
  }
  for (const entry of (_b = cache == null ? void 0 : cache.embeds) != null ? _b : []) {
    const raw = typeof entry.link === "string" ? entry.link.trim() : "";
    if (raw) rawLinks.add(raw);
  }
  for (const raw of rawLinks) {
    const resolved = resolveFile(app, raw, file.path);
    if (!(resolved instanceof import_obsidian27.TFile)) continue;
    if (((_c = resolved.extension) == null ? void 0 : _c.toLowerCase()) !== "md") continue;
    resolvedLinks[raw] = resolved.path;
    notePaths.add(resolved.path);
  }
  return { resolvedLinks, notePaths };
}
function thisSafeFileCache(app, file) {
  var _a;
  return (_a = app.metadataCache.getFileCache(file)) != null ? _a : null;
}
function collectRecursiveLinkedNotes(app, seedPaths) {
  var _a;
  const linkedNotePaths = /* @__PURE__ */ new Set();
  const noteResolvedLinks = {};
  const queue = [...seedPaths];
  while (queue.length > 0) {
    const path = queue.shift();
    if (!path || linkedNotePaths.has(path)) continue;
    const af = app.vault.getAbstractFileByPath(path);
    if (!(af instanceof import_obsidian27.TFile)) continue;
    if (((_a = af.extension) == null ? void 0 : _a.toLowerCase()) !== "md") continue;
    linkedNotePaths.add(af.path);
    const direct = collectDirectResolvedNoteLinks(app, af);
    if (Object.keys(direct.resolvedLinks).length > 0) {
      noteResolvedLinks[af.path] = direct.resolvedLinks;
    }
    for (const childPath of direct.notePaths) {
      if (!linkedNotePaths.has(childPath)) queue.push(childPath);
    }
  }
  return { linkedNotePaths, noteResolvedLinks };
}
async function prepareExportData(app, plugin, ctx, options) {
  const markerData = deepClone5(sanitizeMarkerFileDataForSave(ctx.markerData));
  const subset = collectUsedCollectionSubset(plugin, markerData, options.zipName);
  const fallbackDefaultIconKey = ctx.yamlObject && typeof ctx.yamlObject.defaultIconKey === "string" ? ctx.yamlObject.defaultIconKey : void 0;
  const icons = [];
  for (const key of collectUsedIconKeys(plugin, markerData, subset, fallbackDefaultIconKey)) {
    icons.push(await serializeIconForBundle(app, plugin, ctx.sourcePath, key));
  }
  const seedLinks = collectResolvedLinksForExport(
    app,
    ctx,
    markerData,
    icons,
    subset,
    options.includeLinkedNotes
  );
  const recursive = options.includeLinkedNotes ? collectRecursiveLinkedNotes(app, seedLinks.linkedNotePaths) : { linkedNotePaths: /* @__PURE__ */ new Set(), noteResolvedLinks: {} };
  return {
    markerData,
    subset,
    icons,
    resolvedLinks: seedLinks.resolvedLinks,
    linkedNotePaths: recursive.linkedNotePaths,
    noteResolvedLinks: recursive.noteResolvedLinks
  };
}
function buildZipAssetPath(kind, originalPath) {
  return `${kind}/${safeRelativePath(originalPath)}`;
}
function parseBundleSummary(bundle) {
  var _a, _b, _c, _d, _e;
  const data = bundle.map.markerData;
  return [
    `Storage: ${bundle.map.storageMode}`,
    `Bases: ${normalizeBases(data.bases).length}`,
    `Overlays: ${((_a = data.overlays) != null ? _a : []).length}`,
    `Markers: ${((_b = data.markers) != null ? _b : []).length}`,
    `Drawings: ${((_c = data.drawings) != null ? _c : []).length}`,
    `Text layers: ${((_d = data.textLayers) != null ? _d : []).length}`,
    `Icons: ${((_e = bundle.icons) != null ? _e : []).length}`,
    `Linked notes: ${bundle.assets.filter((a) => a.kind === "linked-note").length}`
  ];
}
function stripWikiLinkToText(raw) {
  var _a;
  const parsed = splitRawLink(raw);
  if ((_a = parsed.alias) == null ? void 0 : _a.trim()) return parsed.alias.trim();
  const path = parsed.path.trim();
  if (path) return path;
  return raw.trim();
}
function extractMarkdownHrefTarget(rawHref) {
  const trimmed = rawHref.trim();
  if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
    return trimmed.slice(1, -1).trim();
  }
  const spaceIdx = trimmed.search(/\s/);
  return spaceIdx >= 0 ? trimmed.slice(0, spaceIdx).trim() : trimmed;
}
function isExternalHref(href) {
  const v = href.trim().toLowerCase();
  return v.startsWith("http://") || v.startsWith("https://") || v.startsWith("mailto:") || v.startsWith("ftp://");
}
function rewriteImportedNoteText(app, text, originalSourcePath, sourceResolvedLinks, notePathMap, targetNotePath, stripUnresolved) {
  const resolvedLookup = sourceResolvedLinks != null ? sourceResolvedLinks : {};
  const rewriteViaImportedPath = (rawLink, fallbackText) => {
    var _a, _b;
    const resolvedOriginalPath = (_b = (_a = resolvedLookup[rawLink.trim()]) != null ? _a : resolvedLookup[extractMarkdownHrefTarget(rawLink)]) != null ? _b : resolvedLookup[splitRawLink(rawLink).path];
    if (!resolvedOriginalPath) return stripUnresolved ? fallbackText : null;
    const importedPath = notePathMap.get(resolvedOriginalPath);
    if (!importedPath) return stripUnresolved ? fallbackText : null;
    const af = app.vault.getAbstractFileByPath(importedPath);
    if (!(af instanceof import_obsidian27.TFile)) return stripUnresolved ? fallbackText : null;
    const parsed = splitRawLink(rawLink);
    const linktext = app.metadataCache.fileToLinktext(af, targetNotePath);
    return buildRawLink(linktext, parsed.anchor, parsed.alias);
  };
  let out = text.replace(/\[\[([^[\]]+)\]\]/g, (full, inner) => {
    const raw = inner.trim();
    const rewritten = rewriteViaImportedPath(raw, stripWikiLinkToText(raw));
    if (rewritten === null) return full;
    if (rewritten === stripWikiLinkToText(raw) && stripUnresolved) return rewritten;
    return `[[${rewritten}]]`;
  });
  out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (full, label, hrefRaw) => {
    const target = extractMarkdownHrefTarget(hrefRaw);
    if (!target || isExternalHref(target)) return full;
    const rewritten = rewriteViaImportedPath(target, label);
    if (rewritten === null) return full;
    if (rewritten === label && stripUnresolved) return label;
    return `[[${buildRawLink(rewritten, void 0, label)}]]`;
  });
  return out;
}
function buildExportSummaryLines(storageMode, prepared) {
  var _a, _b, _c, _d;
  const markerData = prepared.markerData;
  return [
    `Storage: ${storageMode}`,
    `Bases: ${normalizeBases(markerData.bases).length}`,
    `Overlays: ${((_a = markerData.overlays) != null ? _a : []).length}`,
    `Markers: ${((_b = markerData.markers) != null ? _b : []).length}`,
    `Drawings: ${((_c = markerData.drawings) != null ? _c : []).length}`,
    `Text layers: ${((_d = markerData.textLayers) != null ? _d : []).length}`,
    `Icons: ${prepared.icons.length}`,
    `Linked notes: ${prepared.linkedNotePaths.size}`
  ];
}
function addResolvedLink(app, resolvedLinks, includedNotePaths, rawLink, fromPath, includeLinkedNotes) {
  var _a;
  const raw = (rawLink != null ? rawLink : "").trim();
  if (!raw) return;
  const parsed = splitRawLink(raw);
  if (!parsed.path) return;
  const file = resolveFile(app, parsed.path, fromPath);
  if (!(file instanceof import_obsidian27.TFile)) return;
  resolvedLinks[raw] = file.path;
  if (includeLinkedNotes && ((_a = file.extension) == null ? void 0 : _a.toLowerCase()) === "md") {
    includedNotePaths.add(file.path);
  }
}
function collectResolvedLinksForExport(app, ctx, markerData, icons, subset, includeLinkedNotes) {
  var _a, _b, _c;
  const resolvedLinks = {};
  const linkedNotePaths = /* @__PURE__ */ new Set();
  if (!includeLinkedNotes) {
    return { resolvedLinks, linkedNotePaths };
  }
  for (const m of (_a = markerData.markers) != null ? _a : []) {
    addResolvedLink(app, resolvedLinks, linkedNotePaths, m.link, ctx.sourcePath, true);
    if (m.swapLinks) {
      for (const raw of Object.values(m.swapLinks)) {
        addResolvedLink(app, resolvedLinks, linkedNotePaths, raw, ctx.sourcePath, true);
      }
    }
  }
  for (const sp of (_b = subset.swapPins) != null ? _b : []) {
    for (const fr of (_c = sp.frames) != null ? _c : []) {
      addResolvedLink(app, resolvedLinks, linkedNotePaths, fr.link, ctx.sourcePath, true);
    }
  }
  for (const ico of icons != null ? icons : []) {
    addResolvedLink(app, resolvedLinks, linkedNotePaths, ico.defaultLink, ctx.sourcePath, true);
  }
  return { resolvedLinks, linkedNotePaths };
}
function rewriteLinkIfImported(app, rawLink, resolvedLinks, notePathMap, targetNotePath) {
  const raw = (rawLink != null ? rawLink : "").trim();
  if (!raw) return rawLink;
  const resolvedPath = resolvedLinks[raw];
  if (!resolvedPath) return raw;
  const importedPath = notePathMap.get(resolvedPath);
  if (!importedPath) return raw;
  const file = app.vault.getAbstractFileByPath(importedPath);
  if (!(file instanceof import_obsidian27.TFile)) return raw;
  const parsed = splitRawLink(raw);
  const linktext = app.metadataCache.fileToLinktext(file, targetNotePath);
  return buildRawLink(linktext, parsed.anchor, parsed.alias);
}
function remapBaseBoundPath(path, basePathMap) {
  var _a;
  if (!path) return void 0;
  return (_a = basePathMap.get(path)) != null ? _a : path;
}
function remapBaseKeyedRecord(value, basePathMap) {
  var _a;
  if (!value) return value;
  const out = {};
  for (const [key, val] of Object.entries(value)) {
    out[(_a = basePathMap.get(key)) != null ? _a : key] = val;
  }
  return out;
}
function patchMarkerDataPaths(app, data, filePathMap, notePathMap, resolvedLinks, targetNotePath, defaultIconKeyMap) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const out = deepClone5(data);
  const basePathMap = /* @__PURE__ */ new Map();
  out.bases = normalizeBases(out.bases).map((b) => {
    var _a2;
    const nextPath = (_a2 = filePathMap.get(b.path)) != null ? _a2 : b.path;
    basePathMap.set(b.path, nextPath);
    return { ...b, path: nextPath };
  });
  if (out.activeBase) out.activeBase = (_a = filePathMap.get(out.activeBase)) != null ? _a : out.activeBase;
  out.overlays = normalizeOverlays(out.overlays).map((o) => {
    var _a2;
    return {
      ...o,
      path: (_a2 = filePathMap.get(o.path)) != null ? _a2 : o.path
    };
  });
  out.layers = ((_b = out.layers) != null ? _b : []).map((l) => ({
    ...l,
    boundBase: remapBaseBoundPath(l.boundBase, basePathMap)
  }));
  out.drawLayers = ((_c = out.drawLayers) != null ? _c : []).map((l) => ({
    ...l,
    boundBase: remapBaseBoundPath(l.boundBase, basePathMap)
  }));
  out.grids = ((_d = out.grids) != null ? _d : []).map((g) => ({
    ...g,
    boundBase: remapBaseBoundPath(g.boundBase, basePathMap)
  }));
  out.textLayers = ((_e = out.textLayers) != null ? _e : []).map((layer) => ({
    ...layer,
    boundBase: remapBaseBoundPath(layer.boundBase, basePathMap)
  }));
  if (out.measurement) {
    out.measurement.scales = (_f = remapBaseKeyedRecord(out.measurement.scales, basePathMap)) != null ? _f : {};
    out.measurement.customUnitPxPerUnit = (_g = remapBaseKeyedRecord(out.measurement.customUnitPxPerUnit, basePathMap)) != null ? _g : {};
  }
  out.drawings = ((_h = out.drawings) != null ? _h : []).map((d) => {
    var _a2;
    return {
      ...d,
      bakedPath: d.bakedPath ? (_a2 = filePathMap.get(d.bakedPath)) != null ? _a2 : d.bakedPath : d.bakedPath
    };
  });
  out.markers = ((_i = out.markers) != null ? _i : []).map((m) => {
    var _a2, _b2, _c2, _d2, _e2;
    const next = { ...m };
    if (next.iconKey && defaultIconKeyMap.has(next.iconKey)) {
      next.iconKey = defaultIconKeyMap.get(next.iconKey);
    }
    if (next.link) {
      next.link = (_a2 = rewriteLinkIfImported(
        app,
        next.link,
        resolvedLinks,
        notePathMap,
        targetNotePath
      )) != null ? _a2 : next.link;
    }
    if (next.swapLinks) {
      const rewritten = {};
      for (const [idxRaw, rawLink] of Object.entries(next.swapLinks)) {
        const idx = Number(idxRaw);
        rewritten[idx] = (_b2 = rewriteLinkIfImported(
          app,
          rawLink,
          resolvedLinks,
          notePathMap,
          targetNotePath
        )) != null ? _b2 : rawLink;
      }
      next.swapLinks = rewritten;
    }
    if (next.type === "sticker" && next.stickerPath) {
      next.stickerPath = (_c2 = filePathMap.get(next.stickerPath)) != null ? _c2 : next.stickerPath;
    }
    if (next.switchBase) {
      next.switchBase = (_d2 = basePathMap.get(next.switchBase)) != null ? _d2 : next.switchBase;
    }
    if (next.pingNotePath) {
      next.pingNotePath = (_e2 = notePathMap.get(next.pingNotePath)) != null ? _e2 : next.pingNotePath;
    }
    return next;
  });
  delete out.secondScreen;
  return out;
}
function remapCollectionSubset(app, subset, iconKeyMap, filePathMap, notePathMap, resolvedLinks, targetNotePath, notesRoot) {
  const out = deepClone5(subset);
  out.pinKeys = out.pinKeys.map((k) => {
    var _a;
    return (_a = iconKeyMap.get(k)) != null ? _a : k;
  });
  out.stickers = out.stickers.map((s) => {
    var _a;
    return {
      ...s,
      imagePath: (_a = filePathMap.get(s.imagePath)) != null ? _a : s.imagePath
    };
  });
  out.swapPins = out.swapPins.map((sp) => {
    var _a;
    return {
      ...sp,
      frames: ((_a = sp.frames) != null ? _a : []).map((fr) => {
        var _a2, _b;
        return {
          ...fr,
          iconKey: (_a2 = iconKeyMap.get(fr.iconKey)) != null ? _a2 : fr.iconKey,
          link: (_b = rewriteLinkIfImported(
            app,
            fr.link,
            resolvedLinks,
            notePathMap,
            targetNotePath
          )) != null ? _b : fr.link
        };
      })
    };
  });
  out.pingPins = out.pingPins.map((pp) => {
    var _a;
    return {
      ...pp,
      iconKey: pp.iconKey ? (_a = iconKeyMap.get(pp.iconKey)) != null ? _a : pp.iconKey : pp.iconKey,
      noteFolder: notesRoot
    };
  });
  return out;
}
async function buildBundleBytes(app, plugin, ctx, options, preparedInput) {
  var _a, _b;
  const prepared = preparedInput != null ? preparedInput : await prepareExportData(app, plugin, ctx, options);
  const markerData = prepared.markerData;
  const subset = prepared.subset;
  const icons = prepared.icons;
  const configured = collectConfiguredAssetPaths(ctx);
  const assetPaths = /* @__PURE__ */ new Map();
  for (const p of configured.basePaths) if (p && !isDataUrl(p)) assetPaths.set(p, "base");
  for (const p of configured.overlayPaths) if (p && !isDataUrl(p)) assetPaths.set(p, "overlay");
  for (const p of configured.stickerPaths) if (p && !isDataUrl(p)) assetPaths.set(p, "sticker");
  for (const p of configured.drawingPaths) if (p && !isDataUrl(p)) assetPaths.set(p, "drawing");
  if (configured.framePath && !isDataUrl(configured.framePath)) {
    assetPaths.set(configured.framePath, "frame");
  }
  const assets = [];
  for (const [originalPath, kind] of assetPaths) {
    assets.push({
      kind,
      originalPath,
      zipPath: buildZipAssetPath(kind, originalPath)
    });
  }
  for (const notePath of prepared.linkedNotePaths) {
    assets.push({
      kind: "linked-note",
      originalPath: notePath,
      zipPath: buildZipAssetPath("linked-note", notePath)
    });
  }
  const bundle = {
    version: 1,
    exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
    bundleName: options.zipName,
    map: {
      sourcePath: ctx.sourcePath,
      mapId: ctx.mapId || void 0,
      storageMode: ctx.storageMode,
      markersPath: ctx.markersPath,
      yamlBlock: ctx.yamlBlock,
      yamlRaw: ctx.yamlRaw,
      yamlObject: ctx.yamlObject,
      markerData,
      defaultIconKey: plugin.settings.defaultIconKey
    },
    icons,
    collectionSubset: subset,
    assets,
    noteResolvedLinks: prepared.noteResolvedLinks,
    resolvedLinks: prepared.resolvedLinks,
    warnings: {
      hasDrawings: ((_a = markerData.drawings) != null ? _a : []).length > 0,
      hasTextLayers: ((_b = markerData.textLayers) != null ? _b : []).length > 0,
      customFonts: collectCustomFonts(markerData),
      usesCustomUnits: bundleUsesCustomUnits(markerData)
    }
  };
  const zip = new import_jszip.default();
  zip.file(BUNDLE_JSON_PATH, JSON.stringify(bundle, null, 2));
  for (const asset of assets) {
    const file = app.vault.getAbstractFileByPath(asset.originalPath);
    if (!(file instanceof import_obsidian27.TFile)) continue;
    if (asset.kind === "linked-note") {
      zip.file(asset.zipPath, await app.vault.read(file));
    } else {
      zip.file(asset.zipPath, await readVaultBinary(app, file));
    }
  }
  return zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
    compressionOptions: { level: 6 }
  });
}
async function loadBundleFromFile(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const zip = await import_jszip.default.loadAsync(bytes);
  const meta = zip.file(BUNDLE_JSON_PATH);
  if (!meta) throw new Error("Bundle manifest not found.");
  const parsedUnknown = JSON.parse(await meta.async("string"));
  if (!isZoomMapBundleV1(parsedUnknown)) {
    throw new Error("Unsupported or invalid map bundle.");
  }
  const parsed = parsedUnknown;
  return { zip, bundle: parsed };
}
function nextUniqueMapId(editor, baseId) {
  const content = editor.getValue();
  const seed = sanitizeFileName((baseId != null ? baseId : "").trim()) || `map-${Date.now().toString(36)}`;
  let candidate = seed;
  let i = 1;
  while (content.includes(`ZOOMMAP-DATA id=${candidate}`) || new RegExp(`(^|\\n)\\s*id\\s*:\\s*["']?${candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']?(\\n|$)`, "m").test(content)) {
    candidate = `${seed}-${i}`;
    i += 1;
  }
  return candidate;
}
function existingCollectionOptions(plugin) {
  var _a;
  return ((_a = plugin.settings.baseCollections) != null ? _a : []).map((c) => ({
    id: c.id,
    name: c.name || "(unnamed collection)"
  }));
}
function ensureImportedIcons(app, plugin, icons, resolvedLinks, notePathMap, targetNotePath) {
  var _a;
  const keyMap = /* @__PURE__ */ new Map();
  let changed = false;
  const all = [...(_a = plugin.settings.icons) != null ? _a : []];
  const existingByKey = new Map(all.map((i) => [i.key, i]));
  for (const importedRaw of icons != null ? icons : []) {
    const imported = deepClone5(importedRaw);
    imported.defaultLink = rewriteLinkIfImported(
      app,
      imported.defaultLink,
      resolvedLinks,
      notePathMap,
      targetNotePath
    );
    const current = existingByKey.get(imported.key);
    if (current) {
      if (normalizeIconSignature(current) === normalizeIconSignature(imported)) {
        keyMap.set(importedRaw.key, current.key);
        continue;
      }
      let nextKey = imported.key;
      let i = 1;
      while (existingByKey.has(nextKey)) {
        nextKey = `${imported.key}-${i}`;
        i += 1;
      }
      imported.key = nextKey;
    }
    existingByKey.set(imported.key, imported);
    all.push(imported);
    keyMap.set(importedRaw.key, imported.key);
    changed = true;
  }
  if (changed) plugin.settings.icons = all;
  return { changed, keyMap };
}
function importCollectionSubset(plugin, subset, mode, importedBasePaths, mergeCollectionId, newCollectionName) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
  const warnings = [];
  const swapIdMap = /* @__PURE__ */ new Map();
  const pingIdMap = /* @__PURE__ */ new Map();
  if (!subset) {
    return { changed: false, warnings, swapIdMap, pingIdMap };
  }
  const needsCollection = ((_b = (_a = subset.swapPins) == null ? void 0 : _a.length) != null ? _b : 0) > 0 || ((_d = (_c = subset.pingPins) == null ? void 0 : _c.length) != null ? _d : 0) > 0;
  if (mode === "none") {
    if (needsCollection) {
      warnings.push("Collections were skipped. Swap pins and party pins may not work until their presets are imported.");
    }
    return { changed: false, warnings, swapIdMap, pingIdMap };
  }
  const collections = (_f = (_e = plugin.settings).baseCollections) != null ? _f : _e.baseCollections = [];
  let target;
  let changed = false;
  if (mode === "merge") {
    target = collections.find((c) => c.id === mergeCollectionId);
    if (!target) {
      warnings.push("Selected collection not found. Imported subset was added as a new collection instead.");
    }
  }
  if (!target) {
    target = {
      id: `col-${Math.random().toString(36).slice(2, 8)}`,
      name: (newCollectionName != null ? newCollectionName : "").trim() || subset.suggestedName || "Imported map",
      bindings: { basePaths: [] },
      include: {
        pinKeys: [],
        favorites: [],
        stickers: [],
        swapPins: [],
        pingPins: []
      }
    };
    collections.push(target);
    changed = true;
  }
  ensureCollectionArrays(target);
  for (const p of importedBasePaths) {
    if (!target.bindings.basePaths.includes(p)) {
      target.bindings.basePaths.push(p);
      changed = true;
    }
  }
  for (const key of (_g = subset.pinKeys) != null ? _g : []) {
    if (!target.include.pinKeys.includes(key)) {
      target.include.pinKeys.push(key);
      changed = true;
    }
  }
  for (const sticker of (_h = subset.stickers) != null ? _h : []) {
    const sig = normalizeStickerSignature(sticker);
    const exists = ((_i = target.include.stickers) != null ? _i : []).some((s) => normalizeStickerSignature(s) === sig);
    if (!exists) {
      target.include.stickers.push(deepClone5(sticker));
      changed = true;
    }
  }
  const takenIds = new Set(collections.flatMap((c) => {
    var _a2, _b2, _c2, _d2;
    return [
      ...((_b2 = (_a2 = c.include) == null ? void 0 : _a2.swapPins) != null ? _b2 : []).map((p) => p.id),
      ...((_d2 = (_c2 = c.include) == null ? void 0 : _c2.pingPins) != null ? _d2 : []).map((p) => p.id)
    ];
  }));
  for (const preset of (_j = subset.swapPins) != null ? _j : []) {
    const sig = normalizeSwapSignature(preset);
    const same = ((_k = target.include.swapPins) != null ? _k : []).find((sp) => normalizeSwapSignature(sp) === sig);
    if (same) {
      swapIdMap.set(preset.id, same.id);
      continue;
    }
    const clone = deepClone5(preset);
    clone.id = uniqueCollectionItemId("swp", takenIds, clone.id);
    target.include.swapPins.push(clone);
    swapIdMap.set(preset.id, clone.id);
    changed = true;
  }
  for (const preset of (_l = subset.pingPins) != null ? _l : []) {
    const sig = normalizePingSignature(preset);
    const same = ((_m = target.include.pingPins) != null ? _m : []).find((pp) => normalizePingSignature(pp) === sig);
    if (same) {
      pingIdMap.set(preset.id, same.id);
      continue;
    }
    const clone = deepClone5(preset);
    clone.id = uniqueCollectionItemId("ping", takenIds, clone.id);
    target.include.pingPins.push(clone);
    pingIdMap.set(preset.id, clone.id);
    changed = true;
  }
  return { changed, warnings, swapIdMap, pingIdMap };
}
function remapImportedPresetIds(data, swapIdMap, pingIdMap) {
  var _a;
  const out = deepClone5(data);
  out.markers = ((_a = out.markers) != null ? _a : []).map((m) => {
    var _a2, _b;
    return {
      ...m,
      swapKey: m.swapKey ? (_a2 = swapIdMap.get(m.swapKey)) != null ? _a2 : m.swapKey : m.swapKey,
      pingPresetId: m.pingPresetId ? (_b = pingIdMap.get(m.pingPresetId)) != null ? _b : m.pingPresetId : m.pingPresetId
    };
  });
  return out;
}
function collectImportedBasePaths(data) {
  return normalizeBases(data.bases).map((b) => b.path);
}
function rewriteYamlForImport(bundle, data, mapId, storageMode, markersPath, framePath) {
  var _a, _b;
  let obj = {};
  if (bundle.map.yamlObject && typeof bundle.map.yamlObject === "object") {
    obj = deepClone5(bundle.map.yamlObject);
  } else {
    try {
      const parsed = (0, import_obsidian27.parseYaml)(bundle.map.yamlRaw);
      if (isRecord2(parsed)) {
        obj = parsed;
      }
    } catch (e) {
      obj = {};
    }
  }
  const bases = normalizeBases(data.bases);
  const overlays = normalizeOverlays(data.overlays);
  obj.image = (_b = (_a = bases[0]) == null ? void 0 : _a.path) != null ? _b : obj.image;
  obj.imageBases = bases.map((b) => b.name ? { path: b.path, name: b.name } : { path: b.path });
  obj.imageOverlays = overlays.map((o) => ({
    path: o.path,
    name: o.name,
    visible: o.visible
  }));
  obj.id = mapId;
  obj.storage = storageMode;
  if (storageMode === "json") obj.markers = markersPath;
  else delete obj.markers;
  if (framePath) {
    obj.viewportFrame = framePath;
  } else {
    const vf = obj.viewportFrame;
    if (typeof vf === "string" && !vf.trim()) delete obj.viewportFrame;
  }
  return `\`\`\`zoommap
${(0, import_obsidian27.stringifyYaml)(obj).trimEnd()}
\`\`\`
`;
}
async function importBundleToVault(app, plugin, loaded, options) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
  const { bundle, zip } = loaded;
  const warnings = [];
  const writtenPaths = [];
  const effectiveStorage = options.storageMode === "match-export" ? bundle.map.storageMode : options.storageMode;
  if (bundle.warnings.hasDrawings && !plugin.settings.enableDrawing) {
    warnings.push("This bundle contains drawings, but drawings are disabled in your plugin settings.");
  }
  if (bundle.warnings.hasTextLayers && !plugin.settings.enableTextLayers) {
    warnings.push("This bundle contains text layers, but text layers are disabled in your plugin settings.");
  }
  if (((_a = bundle.warnings.customFonts) != null ? _a : []).length > 0) {
    warnings.push(`Custom fonts used by this map are not installed automatically: ${bundle.warnings.customFonts.join(", ")}`);
  }
  if (bundle.warnings.usesCustomUnits) {
    warnings.push("The bundle uses custom travel/measurement units. Their travel-rule definitions are not imported automatically.");
  }
  const previousIcons = deepClone5((_b = plugin.settings.icons) != null ? _b : []);
  const previousCollections = deepClone5((_c = plugin.settings.baseCollections) != null ? _c : []);
  const filePathMap = /* @__PURE__ */ new Map();
  const notePathMap = /* @__PURE__ */ new Map();
  const reservedPaths = /* @__PURE__ */ new Set();
  try {
    for (const asset of (_d = bundle.assets) != null ? _d : []) {
      const entry = zip.file(asset.zipPath);
      if (!entry) {
        throw new Error(`Missing asset in ZIP: ${asset.zipPath}`);
      }
      if (asset.kind === "linked-note") {
        const desired2 = await uniqueVaultPath(
          app,
          joinRoot(options.notesRoot, asset.originalPath),
          reservedPaths
        );
        notePathMap.set(asset.originalPath, desired2);
        continue;
      }
      const root = asset.kind === "drawing" ? options.drawingsRoot : options.assetsRoot;
      const desired = await uniqueVaultPath(
        app,
        joinRoot(root, asset.originalPath),
        reservedPaths
      );
      filePathMap.set(asset.originalPath, desired);
    }
    const importedIcons = ensureImportedIcons(
      app,
      plugin,
      (_e = bundle.icons) != null ? _e : [],
      (_f = bundle.resolvedLinks) != null ? _f : {},
      notePathMap,
      options.targetNotePath
    );
    let subset = bundle.collectionSubset ? remapCollectionSubset(
      app,
      bundle.collectionSubset,
      importedIcons.keyMap,
      filePathMap,
      notePathMap,
      (_g = bundle.resolvedLinks) != null ? _g : {},
      options.targetNotePath,
      options.notesRoot
    ) : void 0;
    let data = patchMarkerDataPaths(
      app,
      bundle.map.markerData,
      filePathMap,
      notePathMap,
      (_h = bundle.resolvedLinks) != null ? _h : {},
      options.targetNotePath,
      importedIcons.keyMap
    );
    const collectionImport = importCollectionSubset(
      plugin,
      subset,
      options.collectionMode,
      collectImportedBasePaths(data),
      options.mergeCollectionId,
      options.newCollectionName
    );
    warnings.push(...collectionImport.warnings);
    data = remapImportedPresetIds(data, collectionImport.swapIdMap, collectionImport.pingIdMap);
    const settingsChanged = importedIcons.changed || collectionImport.changed;
    let markersPath;
    if (effectiveStorage === "json") {
      const baseName = sanitizeFileName(basename2(bundle.map.markersPath || `${bundle.bundleName}.markers.json`));
      markersPath = await uniqueVaultPath(
        app,
        (0, import_obsidian27.normalizePath)(`${options.markersRoot}/${baseName || `${sanitizeFileName(bundle.bundleName)}.markers.json`}`),
        reservedPaths
      );
    }
    for (const asset of (_i = bundle.assets) != null ? _i : []) {
      const entry = zip.file(asset.zipPath);
      if (!entry) {
        throw new Error(`Missing asset in ZIP: ${asset.zipPath}`);
      }
      if (asset.kind === "linked-note") {
        const targetPath2 = notePathMap.get(asset.originalPath);
        if (!targetPath2) continue;
        const rawText = await entry.async("string");
        const rewrittenText = rewriteImportedNoteText(
          app,
          rawText,
          asset.originalPath,
          (_j = bundle.noteResolvedLinks) == null ? void 0 : _j[asset.originalPath],
          notePathMap,
          targetPath2,
          !!options.stripUnresolvedNoteLinks
        );
        await writeVaultText(app, targetPath2, rewrittenText);
        writtenPaths.push(targetPath2);
        continue;
      }
      const targetPath = filePathMap.get(asset.originalPath);
      if (!targetPath) continue;
      const bytes = await entry.async("uint8array");
      await writeVaultBinary(app, targetPath, bytes);
      writtenPaths.push(targetPath);
    }
    if (markersPath) {
      await writeVaultText(app, markersPath, JSON.stringify(sanitizeMarkerFileDataForSave(data), null, 2));
      writtenPaths.push(markersPath);
    }
    const originalFramePath = typeof ((_k = bundle.map.yamlObject) == null ? void 0 : _k.viewportFrame) === "string" ? bundle.map.yamlObject.viewportFrame.trim() : void 0;
    const importedFramePath = originalFramePath ? filePathMap.get(originalFramePath) : void 0;
    const yaml = rewriteYamlForImport(
      bundle,
      data,
      options.mapId,
      effectiveStorage,
      markersPath,
      importedFramePath
    );
    if (settingsChanged) {
      await plugin.saveSettings();
    }
    return {
      codeBlock: yaml,
      inlineBlock: effectiveStorage === "note" ? buildInlineStorageBlock(options.mapId, data) : void 0,
      warnings
    };
  } catch (err) {
    plugin.settings.icons = previousIcons;
    plugin.settings.baseCollections = previousCollections;
    for (let i = writtenPaths.length - 1; i >= 0; i -= 1) {
      try {
        await deleteVaultPathIfExists(app, writtenPaths[i]);
      } catch (e) {
      }
    }
    throw err;
  }
}
var ExportMapBundleModal = class extends import_obsidian27.Modal {
  constructor(app, plugin, map) {
    super(app);
    this.ctx = null;
    this.zipName = "zoommap-export";
    this.includeLinkedNotes = true;
    this.plugin = plugin;
    this.map = map;
  }
  onOpen() {
    void this.renderAsync();
  }
  onClose() {
    this.contentEl.empty();
  }
  async renderAsync() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Export map package" });
    this.ctx = await this.map.buildShareExportContext();
    if (!this.ctx) {
      contentEl.createEl("div", {
        text: "Could not read the current zoommap block. Please save the note and try again."
      });
      const footer2 = contentEl.createDiv({ cls: "zoommap-modal-footer" });
      footer2.createEl("button", { text: "Close" }).onclick = () => this.close();
      return;
    }
    const suggested = sanitizeFileName(fileStem2(this.ctx.sourcePath) || this.map.getMapId() || "zoommap-export");
    if (!this.zipName.trim()) {
      this.zipName = suggested || "zoommap-export";
    }
    new import_obsidian27.Setting(contentEl).setName("ZIP name").setDesc("The exported file will be downloaded as a ZIP.").addText((t) => {
      t.setPlaceholder("zoommap-export");
      t.setValue(this.zipName);
      t.onChange((v) => {
        this.zipName = sanitizeFileName(v) || suggested || "zoommap-export";
      });
    });
    new import_obsidian27.Setting(contentEl).setName("Include linked notes from pins").setDesc("Copies linked .md files referenced by pins, swap-pin frames and imported icon default links.").addToggle((tg) => {
      tg.setValue(this.includeLinkedNotes).onChange((on) => {
        this.includeLinkedNotes = on;
        void this.renderAsync();
      });
    });
    const summary = contentEl.createDiv();
    summary.createEl("h3", { text: "Summary" });
    const prepared = await prepareExportData(
      this.app,
      this.plugin,
      this.ctx,
      {
        zipName: this.zipName,
        includeLinkedNotes: this.includeLinkedNotes
      }
    );
    const lines = buildExportSummaryLines(this.ctx.storageMode, prepared);
    for (const line of lines) {
      summary.createEl("div", { text: line }).addClass("zoommap-muted");
    }
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const exportBtn = footer.createEl("button", { text: "Export" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    exportBtn.onclick = () => {
      void this.runExport();
    };
    cancelBtn.onclick = () => this.close();
  }
  async runExport() {
    if (!this.ctx) return;
    try {
      const fileName = `${sanitizeFileName(this.zipName || "zoommap-export") || "zoommap-export"}.zip`;
      new import_obsidian27.Notice("Building map package\u2026", 2e3);
      const prepared = await prepareExportData(this.app, this.plugin, this.ctx, {
        zipName: sanitizeFileName(this.zipName || "zoommap-export") || "zoommap-export",
        includeLinkedNotes: this.includeLinkedNotes
      });
      const bytes = await buildBundleBytes(this.app, this.plugin, this.ctx, {
        zipName: sanitizeFileName(this.zipName || "zoommap-export") || "zoommap-export",
        includeLinkedNotes: this.includeLinkedNotes
      }, prepared);
      downloadZip(fileName, bytes);
      new import_obsidian27.Notice(`Export ready: ${fileName}`, 2500);
      this.close();
    } catch (err) {
      console.error(err);
      new import_obsidian27.Notice(`Export failed: ${err instanceof Error ? err.message : String(err)}`, 5e3);
    }
  }
};
var ImportMapBundleModal = class extends import_obsidian27.Modal {
  constructor(app, plugin, editor, view) {
    super(app);
    this.selectedFile = null;
    this.loaded = null;
    this.storageMode = "match-export";
    this.assetsRoot = "ZoomMap/Imports/assets";
    this.drawingsRoot = "ZoomMap/Imports/drawings";
    this.notesRoot = "ZoomMap/Imports/notes";
    this.markersRoot = "ZoomMap/Imports/data";
    this.collectionMode = "create";
    this.mergeCollectionId = "";
    this.newCollectionName = "Imported map";
    this.stripUnresolvedNoteLinks = false;
    this.plugin = plugin;
    this.editor = editor;
    this.view = view;
  }
  getImportDefaults() {
    var _a, _b, _c;
    const safeBundleName = sanitizeFileName(((_a = this.loaded) == null ? void 0 : _a.bundle.bundleName) || fileStem2((_c = (_b = this.selectedFile) == null ? void 0 : _b.name) != null ? _c : "import")) || "import";
    return {
      assetsRoot: `ZoomMap/Imports/${safeBundleName}/assets`,
      drawingsRoot: `ZoomMap/Imports/${safeBundleName}/drawings`,
      notesRoot: `ZoomMap/Imports/${safeBundleName}/notes`,
      markersRoot: `ZoomMap/Imports/${safeBundleName}/data`
    };
  }
  openFolderPicker(onPick) {
    new FolderSuggestModal(this.app, (folder) => {
      onPick(folder.path);
    }).open();
  }
  onOpen() {
    this.render();
  }
  onClose() {
    this.contentEl.empty();
  }
  render() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Import map package" });
    const pickerWrap = contentEl.createDiv();
    pickerWrap.createEl("div", { text: "ZIP file" });
    const fileInput = pickerWrap.createEl("input");
    fileInput.type = "file";
    fileInput.accept = ".zip,application/zip";
    fileInput.addEventListener("change", () => {
      var _a2, _b2;
      const file = (_b2 = (_a2 = fileInput.files) == null ? void 0 : _a2[0]) != null ? _b2 : null;
      if (!file) return;
      void this.loadSelectedFile(file);
    });
    if (this.selectedFile) {
      pickerWrap.createEl("div", { text: `Selected: ${this.selectedFile.name}` }).addClass("zoommap-muted");
    }
    if (!this.loaded) {
      const footer2 = contentEl.createDiv({ cls: "zoommap-modal-footer" });
      footer2.createEl("button", { text: "Cancel" }).onclick = () => this.close();
      return;
    }
    const bundle = this.loaded.bundle;
    const defaults = this.getImportDefaults();
    this.assetsRoot = this.assetsRoot.trim() || defaults.assetsRoot;
    this.drawingsRoot = this.drawingsRoot.trim() || defaults.drawingsRoot;
    this.notesRoot = this.notesRoot.trim() || defaults.notesRoot;
    this.markersRoot = this.markersRoot.trim() || defaults.markersRoot;
    contentEl.createEl("h3", { text: "Summary" });
    for (const line of parseBundleSummary(bundle)) {
      contentEl.createEl("div", { text: line }).addClass("zoommap-muted");
    }
    const warningWrap = contentEl.createDiv();
    const warnings = [];
    if (bundle.warnings.hasDrawings && !this.plugin.settings.enableDrawing) {
      warnings.push("This package contains drawings, but drawings are disabled in your settings.");
    }
    if (bundle.warnings.hasTextLayers && !this.plugin.settings.enableTextLayers) {
      warnings.push("This package contains text layers, but text layers are disabled in your settings.");
    }
    if (((_a = bundle.warnings.customFonts) != null ? _a : []).length > 0) {
      warnings.push(`Fonts are not installed automatically: ${bundle.warnings.customFonts.join(", ")}`);
    }
    if (bundle.warnings.usesCustomUnits) {
      warnings.push("Custom travel/measurement units are not imported automatically.");
    }
    for (const line of warnings) {
      warningWrap.createEl("div", { text: `\u2022 ${line}` }).addClass("zoommap-muted");
    }
    contentEl.createEl("h3", { text: "Import options" });
    new import_obsidian27.Setting(contentEl).setName("Import storage mode").setDesc("Import as JSON beside the map or inline inside the current note.").addDropdown((d) => {
      d.addOption("match-export", `Match export (${bundle.map.storageMode})`);
      d.addOption("json", "JSON file");
      d.addOption("note", "Inline in note");
      d.setValue(this.storageMode);
      d.onChange((v) => {
        if (v === "json" || v === "note" || v === "match-export") {
          this.storageMode = v;
          this.render();
        }
      });
    });
    new import_obsidian27.Setting(contentEl).setName("Assets folder").setDesc("Base images, overlays, frame image and sticker images are copied here.").addText((t) => {
      t.setPlaceholder(defaults.assetsRoot);
      t.setValue(this.assetsRoot);
      t.onChange((v) => {
        const next = v.trim() || defaults.assetsRoot;
        this.assetsRoot = next;
        if (!v.trim()) t.setValue(next);
      });
    }).addButton((b) => {
      b.setButtonText("Pick\u2026").onClick(() => {
        this.openFolderPicker((path) => {
          this.assetsRoot = path.trim() || defaults.assetsRoot;
          this.render();
        });
      });
    });
    new import_obsidian27.Setting(contentEl).setName("Drawings folder").setDesc("Pattern SVG files are copied here.").addText((t) => {
      t.setPlaceholder(defaults.drawingsRoot);
      t.setValue(this.drawingsRoot);
      t.onChange((v) => {
        const next = v.trim() || defaults.drawingsRoot;
        this.drawingsRoot = next;
        if (!v.trim()) t.setValue(next);
      });
    }).addButton((b) => {
      b.setButtonText("Pick\u2026").onClick(() => {
        this.openFolderPicker((path) => {
          this.drawingsRoot = path.trim() || defaults.drawingsRoot;
          this.render();
        });
      });
    });
    new import_obsidian27.Setting(contentEl).setName("Notes folder").setDesc("Imported linked note files are copied here.").addText((t) => {
      t.setPlaceholder(defaults.notesRoot);
      t.setValue(this.notesRoot);
      t.onChange((v) => {
        const next = v.trim() || defaults.notesRoot;
        this.notesRoot = next;
        if (!v.trim()) t.setValue(next);
      });
    }).addButton((b) => {
      b.setButtonText("Pick\u2026").onClick(() => {
        this.openFolderPicker((path) => {
          this.notesRoot = path.trim() || defaults.notesRoot;
          this.render();
        });
      });
    });
    new import_obsidian27.Setting(contentEl).setName("Remove unresolved links inside imported notes").setDesc("If enabled, links inside imported note files that were not imported will be converted to plain text instead of keeping broken links.").addToggle((tg) => {
      tg.setValue(this.stripUnresolvedNoteLinks).onChange((on) => {
        this.stripUnresolvedNoteLinks = on;
      });
    });
    if (this.storageMode === "json" || this.storageMode === "match-export" && bundle.map.storageMode === "json") {
      new import_obsidian27.Setting(contentEl).setName("Marker JSON folder").setDesc("The marker.json is copied here when importing as JSON.").addText((t) => {
        t.setPlaceholder(defaults.markersRoot);
        t.setValue(this.markersRoot);
        t.onChange((v) => {
          const next = v.trim() || defaults.markersRoot;
          this.markersRoot = next;
          if (!v.trim()) t.setValue(next);
        });
      }).addButton((b) => {
        b.setButtonText("Pick\u2026").onClick(() => {
          this.openFolderPicker((path) => {
            this.markersRoot = path.trim() || defaults.markersRoot;
            this.render();
          });
        });
      });
    }
    const hasCollectionSubset = ((_d = (_c = (_b = bundle.collectionSubset) == null ? void 0 : _b.swapPins) == null ? void 0 : _c.length) != null ? _d : 0) > 0 || ((_g = (_f = (_e = bundle.collectionSubset) == null ? void 0 : _e.pingPins) == null ? void 0 : _f.length) != null ? _g : 0) > 0 || ((_j = (_i = (_h = bundle.collectionSubset) == null ? void 0 : _h.pinKeys) == null ? void 0 : _i.length) != null ? _j : 0) > 0 || ((_m = (_l = (_k = bundle.collectionSubset) == null ? void 0 : _k.stickers) == null ? void 0 : _l.length) != null ? _m : 0) > 0;
    if (hasCollectionSubset) {
      const collections = existingCollectionOptions(this.plugin);
      new import_obsidian27.Setting(contentEl).setName("Collection import").setDesc("Used items from collections can be merged into an existing collection or imported into a new one.").addDropdown((d) => {
        d.addOption("create", "Create new collection");
        d.addOption("merge", "Merge into existing collection");
        d.addOption("none", "Do not import collection items");
        d.setValue(this.collectionMode);
        d.onChange((v) => {
          if (v === "create" || v === "merge" || v === "none") {
            this.collectionMode = v;
            this.render();
          }
        });
      });
      if (this.collectionMode === "create") {
        new import_obsidian27.Setting(contentEl).setName("New collection name").addText((t) => {
          var _a2, _b2;
          t.setPlaceholder((_b2 = (_a2 = bundle.collectionSubset) == null ? void 0 : _a2.suggestedName) != null ? _b2 : "Imported map");
          t.setValue(this.newCollectionName);
          t.onChange((v) => {
            var _a3;
            this.newCollectionName = v.trim() || ((_a3 = bundle.collectionSubset) == null ? void 0 : _a3.suggestedName) || "Imported map";
          });
        });
      }
      if (this.collectionMode === "merge") {
        new import_obsidian27.Setting(contentEl).setName("Target collection").addDropdown((d) => {
          var _a2;
          for (const opt of collections) d.addOption(opt.id, opt.name);
          d.setValue(this.mergeCollectionId || ((_a2 = collections[0]) == null ? void 0 : _a2.id) || "");
          d.onChange((v) => {
            this.mergeCollectionId = v;
          });
        });
      }
    }
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const importBtn = footer.createEl("button", { text: "Import" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    importBtn.onclick = () => {
      void this.runImport();
    };
    cancelBtn.onclick = () => this.close();
  }
  async loadSelectedFile(file) {
    var _a, _b;
    try {
      this.selectedFile = file;
      this.loaded = await loadBundleFromFile(file);
      const defaults = this.getImportDefaults();
      this.assetsRoot = defaults.assetsRoot;
      this.drawingsRoot = defaults.drawingsRoot;
      this.notesRoot = defaults.notesRoot;
      this.markersRoot = defaults.markersRoot;
      const safeBundleName = sanitizeFileName(this.loaded.bundle.bundleName || fileStem2(file.name)) || "import";
      this.newCollectionName = ((_a = this.loaded.bundle.collectionSubset) == null ? void 0 : _a.suggestedName) || `Imported ${safeBundleName}`;
      const firstCollection = existingCollectionOptions(this.plugin)[0];
      this.mergeCollectionId = (_b = firstCollection == null ? void 0 : firstCollection.id) != null ? _b : "";
      this.render();
    } catch (err) {
      console.error(err);
      new import_obsidian27.Notice(`Import file could not be read: ${err instanceof Error ? err.message : String(err)}`, 5e3);
    }
  }
  async runImport() {
    if (!this.loaded) return;
    if (!this.view.file) {
      new import_obsidian27.Notice("Please import into a saved note.", 3e3);
      return;
    }
    try {
      const defaults = this.getImportDefaults();
      const mapId = nextUniqueMapId(this.editor, this.loaded.bundle.map.mapId);
      const prepared = await importBundleToVault(this.app, this.plugin, this.loaded, {
        targetNotePath: this.view.file.path,
        mapId,
        storageMode: this.storageMode,
        assetsRoot: this.assetsRoot.trim() || defaults.assetsRoot,
        drawingsRoot: this.drawingsRoot.trim() || defaults.drawingsRoot,
        notesRoot: this.notesRoot.trim() || defaults.notesRoot,
        markersRoot: this.markersRoot.trim() || defaults.markersRoot,
        collectionMode: this.collectionMode,
        mergeCollectionId: this.mergeCollectionId,
        newCollectionName: this.newCollectionName,
        stripUnresolvedNoteLinks: this.stripUnresolvedNoteLinks
      });
      const insertText = quoteAwareInsertionText(
        this.editor,
        prepared.codeBlock,
        prepared.inlineBlock
      );
      this.editor.replaceRange(insertText, this.editor.getCursor());
      const allWarnings = prepared.warnings;
      if (allWarnings.length > 0) {
        new import_obsidian27.Notice(allWarnings.join("\n"), 9e3);
      } else {
        new import_obsidian27.Notice("Map package imported.", 2500);
      }
      this.close();
    } catch (err) {
      console.error(err);
      new import_obsidian27.Notice(`Import failed: ${err instanceof Error ? err.message : String(err)}`, 6e3);
    }
  }
};

// src/travelRulesModals.ts
var import_obsidian28 = require("obsidian");
function genId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}
function deepClone6(x) {
  if (typeof structuredClone === "function") return structuredClone(x);
  return JSON.parse(JSON.stringify(x));
}
function isRecord3(x) {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}
function isTravelPerDayConfig(x) {
  if (!isRecord3(x)) return false;
  return typeof x.value === "number" && typeof x.unit === "string";
}
function isTravelPerDayPreset(x) {
  if (!isRecord3(x)) return false;
  return typeof x.id === "string" && typeof x.name === "string" && typeof x.value === "number" && typeof x.unit === "string";
}
function isCustomUnitDef(x) {
  if (!isRecord3(x)) return false;
  return typeof x.id === "string" && typeof x.name === "string" && typeof x.abbreviation === "string" && typeof x.metersPerUnit === "number";
}
function isTravelTimePreset(x) {
  if (!isRecord3(x)) return false;
  if (typeof x.id !== "string" || typeof x.name !== "string") return false;
  if (typeof x.distanceValue !== "number") return false;
  if (typeof x.distanceUnit !== "string") return false;
  if (typeof x.timeValue !== "number" || typeof x.timeUnit !== "string") return false;
  return true;
}
function isTerrainDef(x) {
  if (!isRecord3(x)) return false;
  return typeof x.id === "string" && typeof x.name === "string" && typeof x.factor === "number";
}
function isTravelRulesPack(x) {
  if (!isRecord3(x)) return false;
  if (typeof x.id !== "string" || typeof x.name !== "string") return false;
  if (!Array.isArray(x.customUnits) || !x.customUnits.every(isCustomUnitDef)) return false;
  if (!Array.isArray(x.terrains) || !x.terrains.every(isTerrainDef)) return false;
  if (!Array.isArray(x.travelTimePresets) || !x.travelTimePresets.every(isTravelTimePreset)) return false;
  const hasNew = Array.isArray(x.travelPerDayPresets) && x.travelPerDayPresets.every(isTravelPerDayPreset);
  const hasOld = isTravelPerDayConfig(x.travelPerDay);
  if (!hasNew && !hasOld) return false;
  if ("enabled" in x && typeof x.enabled !== "boolean") return false;
  return true;
}
async function ensureFolderPathExists2(app, folder) {
  const normalized = (0, import_obsidian28.normalizePath)(folder).trim();
  if (!normalized) return;
  const parts = normalized.split("/").filter(Boolean);
  let current = "";
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!app.vault.getAbstractFileByPath(current)) {
      await app.vault.createFolder(current);
    }
  }
}
async function writeVaultText2(app, path, text) {
  const normalized = (0, import_obsidian28.normalizePath)(path);
  await ensureFolderPathExists2(app, normalized.split("/").slice(0, -1).join("/"));
  const existing = app.vault.getAbstractFileByPath(normalized);
  if (existing instanceof import_obsidian28.TFile) {
    await app.vault.modify(existing, text);
  } else {
    await app.vault.create(normalized, text);
  }
}
async function writeJsonToVault(app, path, payload) {
  const p = (0, import_obsidian28.normalizePath)(path);
  const json = JSON.stringify(payload, null, 2);
  await writeVaultText2(
    app,
    p,
    json
  );
  return p;
}
var TravelRulesManagerModal = class extends import_obsidian28.Modal {
  constructor(app, plugin, onDone) {
    super(app);
    this.plugin = plugin;
    this.onDone = onDone;
  }
  onOpen() {
    this.render();
  }
  onClose() {
    var _a;
    this.contentEl.empty();
    (_a = this.onDone) == null ? void 0 : _a.call(this);
  }
  render() {
    var _a, _b;
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Travel rules" });
    const packs = (_b = (_a = this.plugin.settings).travelRulesPacks) != null ? _b : _a.travelRulesPacks = [];
    const list = contentEl.createDiv();
    if (packs.length === 0) {
      list.createEl("div", { text: "No travel packs yet." });
    }
    packs.forEach((p, idx) => {
      var _a2, _b2, _c, _d, _e, _f;
      const row = list.createDiv({ cls: "zoommap-travel-pack-row" });
      const enabled = row.createEl("input", { type: "checkbox" });
      enabled.addClass("zoommap-travel-pack-enabled");
      enabled.checked = p.enabled === true;
      enabled.onchange = () => {
        p.enabled = enabled.checked ? true : false;
        void this.plugin.saveSettings();
      };
      const left = row.createDiv({ cls: "zoommap-travel-pack-left" });
      left.createEl("div", { text: p.name || "(unnamed pack)" }).addClass("zoommap-collections-name");
      left.createEl("div", {
        text: `${(_b2 = (_a2 = p.customUnits) == null ? void 0 : _a2.length) != null ? _b2 : 0} custom units \u2022 ${(_d = (_c = p.terrains) == null ? void 0 : _c.length) != null ? _d : 0} terrains \u2022 ${(_f = (_e = p.travelTimePresets) == null ? void 0 : _e.length) != null ? _f : 0} travel presets`
      }).addClass("zoommap-collections-meta");
      const actions2 = row.createDiv({ cls: "zoommap-travel-pack-actions" });
      const edit = actions2.createEl("button", { text: "Edit" });
      edit.onclick = () => {
        new TravelRulesPackEditorModal(this.app, this.plugin, p, (res) => {
          if (res.action !== "save" || !res.pack) return;
          packs[idx] = res.pack;
          void this.plugin.saveSettings().then(() => this.render());
        }).open();
      };
      const exportBtn = actions2.createEl("button", { text: "Export" });
      exportBtn.addClass("zm-btn-sm");
      exportBtn.onclick = () => {
        void (async () => {
          try {
            const outPath = (0, import_obsidian28.normalizePath)(`ZoomMap/travel-pack-${p.id}.json`);
            const payload = {
              version: 1,
              pack: p,
              exportedAt: (/* @__PURE__ */ new Date()).toISOString()
            };
            const written = await writeJsonToVault(this.app, outPath, payload);
            new import_obsidian28.Notice(`Exported: ${written}`, 2500);
          } catch (e) {
            console.error(e);
            new import_obsidian28.Notice("Export failed.", 3e3);
          }
        })();
      };
      const del = actions2.createEl("button", { text: "Delete" });
      del.onclick = () => {
        packs.splice(idx, 1);
        void this.plugin.saveSettings().then(() => this.render());
      };
    });
    const actions = contentEl.createDiv({ cls: "zoommap-collections-actions" });
    const addBtn = actions.createEl("button", { text: "Add pack" });
    addBtn.onclick = () => {
      packs.push({
        id: genId("trp"),
        name: `Travel pack ${packs.length + 1}`,
        enabled: packs.length === 0,
        customUnits: [],
        terrains: [{ id: genId("ter"), name: "Normal", factor: 1 }],
        travelTimePresets: [],
        travelPerDayPresets: [{ id: genId("tpd"), name: "Default", value: 8, unit: "h" }],
        travelPerDay: { value: 8, unit: "h" }
        // legacy mirror
      });
      void this.plugin.saveSettings().then(() => this.render());
    };
    const importBtn = actions.createEl("button", { text: "Import\u2026" });
    importBtn.onclick = () => {
      new JsonFileSuggestModal(this.app, (file) => {
        void (async () => {
          await this.importFromFile(file);
          this.render();
        })();
      }).open();
    };
    const exportAllBtn = actions.createEl("button", { text: "Export all" });
    exportAllBtn.onclick = () => {
      void (async () => {
        try {
          const outPath = (0, import_obsidian28.normalizePath)("ZoomMap/travel-rules-packs.json");
          const payload = { version: 1, packs, exportedAt: (/* @__PURE__ */ new Date()).toISOString() };
          const written = await writeJsonToVault(this.app, outPath, payload);
          new import_obsidian28.Notice(`Exported: ${written}`, 2500);
        } catch (e) {
          console.error(e);
          new import_obsidian28.Notice("Export failed.", 3e3);
        }
      })();
    };
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    footer.createEl("button", { text: "Close" }).onclick = () => this.close();
  }
  async importFromFile(file) {
    var _a, _b;
    try {
      const raw = await this.app.vault.read(file);
      const obj = JSON.parse(raw);
      const packs = (_b = (_a = this.plugin.settings).travelRulesPacks) != null ? _b : _a.travelRulesPacks = [];
      const existingIds = new Set(packs.map((p) => p.id));
      const addPack = (p) => {
        var _a2, _b2, _c;
        const next = deepClone6(p);
        if (!next.id || existingIds.has(next.id)) next.id = genId("trp");
        if (!next.name) next.name = `Imported pack ${packs.length + 1}`;
        (_a2 = next.customUnits) != null ? _a2 : next.customUnits = [];
        (_b2 = next.travelTimePresets) != null ? _b2 : next.travelTimePresets = [];
        (_c = next.travelPerDay) != null ? _c : next.travelPerDay = { value: 8, unit: "h" };
        packs.push(next);
        existingIds.add(next.id);
      };
      if (isRecord3(obj) && "version" in obj) {
        const v = obj.version;
        if (v !== 1) {
          new import_obsidian28.Notice("Unsupported import format.", 3500);
          return;
        }
        if ("packs" in obj && Array.isArray(obj.packs)) {
          for (const p of obj.packs) {
            if (isTravelRulesPack(p)) addPack(p);
          }
        } else if ("pack" in obj && isTravelRulesPack(obj.pack)) {
          addPack(obj.pack);
        } else {
          new import_obsidian28.Notice("Invalid travel rules JSON.", 3500);
          return;
        }
      } else {
        if (!isTravelRulesPack(obj)) {
          new import_obsidian28.Notice("Invalid travel pack JSON.", 3500);
          return;
        }
        addPack(obj);
      }
      await this.plugin.saveSettings();
      new import_obsidian28.Notice("Import successful.", 2e3);
    } catch (e) {
      console.error(e);
      new import_obsidian28.Notice("Import failed.", 3e3);
    }
  }
};
var TravelRulesPackEditorModal = class extends import_obsidian28.Modal {
  constructor(app, plugin, pack, onDone) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    super(app);
    this.plugin = plugin;
    this.original = pack;
    this.working = deepClone6(pack);
    (_b = (_a = this.working).customUnits) != null ? _b : _a.customUnits = [];
    (_d = (_c = this.working).terrains) != null ? _d : _c.terrains = [];
    (_f = (_e = this.working).travelTimePresets) != null ? _f : _e.travelTimePresets = [];
    (_h = (_g = this.working).travelPerDayPresets) != null ? _h : _g.travelPerDayPresets = [{ id: genId("tpd"), name: "Default", value: 8, unit: "h" }];
    (_j = (_i = this.working).travelPerDay) != null ? _j : _i.travelPerDay = { value: 8, unit: "h" };
    this.onDone = onDone;
  }
  onOpen() {
    this.modalEl.addClass("zoommap-modal--travel");
    this.render();
  }
  onClose() {
    this.contentEl.empty();
  }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Edit travel pack" });
    new import_obsidian28.Setting(contentEl).setName("Name").addText((t) => {
      var _a;
      t.setValue((_a = this.working.name) != null ? _a : "");
      t.onChange((v) => this.working.name = v.trim() || this.working.name);
    });
    contentEl.createEl("h3", { text: "Max travel time presets" });
    const perDayWrap = contentEl.createDiv();
    const renderPerDayPresets = () => {
      var _a, _b;
      perDayWrap.empty();
      const list = (_b = (_a = this.working).travelPerDayPresets) != null ? _b : _a.travelPerDayPresets = [];
      if (list.length === 0) {
        perDayWrap.createEl("div", { text: "No max travel time presets." }).addClass("zoommap-muted");
      }
      list.forEach((p, idx) => {
        var _a2, _b2, _c;
        const row = perDayWrap.createDiv({ cls: "zoommap-travel-perday-row" });
        const name = row.createEl("input", { type: "text" });
        name.placeholder = "Name";
        name.value = (_a2 = p.name) != null ? _a2 : "";
        name.oninput = () => {
          p.name = name.value.trim();
        };
        const val = row.createEl("input", { type: "number" });
        val.placeholder = "8";
        val.value = String((_b2 = p.value) != null ? _b2 : 8);
        val.oninput = () => {
          const n = Number(String(val.value).replace(",", "."));
          if (Number.isFinite(n) && n > 0) p.value = n;
        };
        const unit = row.createEl("input", { type: "text" });
        unit.placeholder = "H";
        unit.value = (_c = p.unit) != null ? _c : "h";
        unit.oninput = () => {
          p.unit = unit.value.trim() || "h";
        };
        const delBtn = row.createEl("button", { text: "Delete" });
        delBtn.onclick = () => {
          list.splice(idx, 1);
          renderPerDayPresets();
        };
      });
      const addBtn = perDayWrap.createEl("button", { text: "Add max travel time" });
      addBtn.onclick = () => {
        list.push({ id: genId("tpd"), name: `Mode ${list.length + 1}`, value: 8, unit: "h" });
        renderPerDayPresets();
      };
    };
    renderPerDayPresets();
    contentEl.createEl("h3", { text: "Custom units" });
    const unitsWrap = contentEl.createDiv();
    const renderUnits = () => {
      var _a, _b;
      unitsWrap.empty();
      const units = (_b = (_a = this.working).customUnits) != null ? _b : _a.customUnits = [];
      if (units.length === 0) {
        unitsWrap.createEl("div", { text: "No custom units." }).addClass("zoommap-muted");
      }
      units.forEach((u, idx) => {
        var _a2, _b2;
        const row = unitsWrap.createDiv({ cls: "zoommap-custom-unit-row" });
        const nameInput = row.createEl("input", { type: "text" });
        nameInput.classList.add("zm-cu-name");
        nameInput.placeholder = "Name";
        nameInput.value = (_a2 = u.name) != null ? _a2 : "";
        nameInput.oninput = () => u.name = nameInput.value.trim();
        const abbrInput = row.createEl("input", { type: "text" });
        abbrInput.classList.add("zm-cu-abbr");
        abbrInput.placeholder = "Abbreviation";
        abbrInput.value = (_b2 = u.abbreviation) != null ? _b2 : "";
        abbrInput.oninput = () => u.abbreviation = abbrInput.value.trim();
        const hint = row.createEl("div");
        hint.addClass("zoommap-muted");
        hint.setText("Calibrate on map");
        const delBtn = row.createEl("button", { text: "Delete" });
        delBtn.onclick = () => {
          units.splice(idx, 1);
          renderUnits();
        };
      });
      const addBtn = unitsWrap.createEl("button", { text: "Add custom unit" });
      addBtn.onclick = () => {
        units.push({
          id: genId("cu"),
          name: "Hex",
          abbreviation: "hex",
          metersPerUnit: 5 * 0.3048
        });
        renderUnits();
      };
    };
    renderUnits();
    contentEl.createEl("h3", { text: "Terrains" });
    const terrainsWrap = contentEl.createDiv();
    const renderTerrains = () => {
      var _a, _b;
      terrainsWrap.empty();
      const terrains = (_b = (_a = this.working).terrains) != null ? _b : _a.terrains = [];
      if (terrains.length === 0) {
        terrainsWrap.createEl("div", { text: "No terrains." }).addClass("zoommap-muted");
      }
      terrains.forEach((t, idx) => {
        var _a2, _b2;
        const row = terrainsWrap.createDiv({ cls: "zoommap-custom-unit-row" });
        const nameInput = row.createEl("input", { type: "text" });
        nameInput.classList.add("zm-cu-name");
        nameInput.placeholder = "Name";
        nameInput.value = (_a2 = t.name) != null ? _a2 : "";
        nameInput.oninput = () => t.name = nameInput.value.trim();
        const factorInput = row.createEl("input", { type: "number" });
        factorInput.classList.add("zm-cu-factor");
        factorInput.placeholder = "1";
        factorInput.value = String((_b2 = t.factor) != null ? _b2 : 1);
        factorInput.oninput = () => {
          const n = Number(String(factorInput.value).replace(",", "."));
          if (Number.isFinite(n) && n > 0) t.factor = n;
        };
        const hint = row.createEl("div");
        hint.addClass("zoommap-muted");
        hint.setText("Speed factor");
        const delBtn = row.createEl("button", { text: "Delete" });
        delBtn.onclick = () => {
          terrains.splice(idx, 1);
          renderTerrains();
        };
      });
      const addBtn = terrainsWrap.createEl("button", { text: "Add terrain" });
      addBtn.onclick = () => {
        terrains.push({ id: genId("ter"), name: "Road", factor: 2 });
        renderTerrains();
      };
    };
    renderTerrains();
    contentEl.createEl("h3", { text: "Travel time presets" });
    const presetsWrap = contentEl.createDiv();
    const renderPresets = () => {
      var _a, _b, _c;
      presetsWrap.empty();
      const presets = (_b = (_a = this.working).travelTimePresets) != null ? _b : _a.travelTimePresets = [];
      const customDefs = (_c = this.working.customUnits) != null ? _c : [];
      const head = presetsWrap.createDiv({ cls: "zm-travel-grid-head" });
      head.createSpan({ text: "Mode" });
      head.createSpan({ text: "Dist" });
      head.createSpan({ text: "Unit" });
      head.createSpan({ text: "Time" });
      head.createSpan({ text: "Time unit" });
      head.createSpan({ text: "" });
      const grid = presetsWrap.createDiv({ cls: "zm-travel-grid" });
      const addUnitOptions = (sel) => {
        const add = (value, label) => {
          const opt = sel.ownerDocument.createElement("option");
          opt.value = value;
          opt.textContent = label;
          sel.appendChild(opt);
        };
        add("m", "m");
        add("km", "km");
        add("mi", "mi");
        add("ft", "ft");
        for (const def of customDefs) {
          const label = def.abbreviation ? `${def.name} (${def.abbreviation})` : def.name;
          add(`custom:${def.id}`, label);
        }
      };
      presets.forEach((p, idx) => {
        var _a2, _b2, _c2, _d, _e;
        const name = grid.createEl("input", { type: "text", cls: "zm-travel-name" });
        name.value = (_a2 = p.name) != null ? _a2 : "";
        name.oninput = () => p.name = name.value.trim();
        const distVal = grid.createEl("input", { type: "number", cls: "zm-travel-num" });
        distVal.value = String((_b2 = p.distanceValue) != null ? _b2 : 1);
        distVal.oninput = () => {
          const n = Number(distVal.value);
          if (Number.isFinite(n) && n > 0) p.distanceValue = n;
        };
        const unitSel = grid.createEl("select", { cls: "zm-travel-unit" });
        addUnitOptions(unitSel);
        const current = p.distanceUnit === "custom" ? `custom:${(_c2 = p.distanceCustomUnitId) != null ? _c2 : ""}` : p.distanceUnit;
        unitSel.value = Array.from(unitSel.options).some((o) => o.value === current) ? current : "km";
        unitSel.onchange = () => {
          const v = unitSel.value;
          if (v.startsWith("custom:")) {
            p.distanceUnit = "custom";
            p.distanceCustomUnitId = v.slice("custom:".length) || void 0;
          } else {
            const isStd = v === "m" || v === "km" || v === "mi" || v === "ft";
            if (isStd) {
              p.distanceUnit = v;
            } else {
              p.distanceUnit = "km";
            }
            p.distanceCustomUnitId = void 0;
          }
        };
        const timeVal = grid.createEl("input", { type: "number", cls: "zm-travel-num" });
        timeVal.value = String((_d = p.timeValue) != null ? _d : 1);
        timeVal.oninput = () => {
          const n = Number(timeVal.value);
          if (Number.isFinite(n) && n > 0) p.timeValue = n;
        };
        const timeUnit = grid.createEl("input", { type: "text", cls: "zm-travel-timeunit" });
        timeUnit.value = (_e = p.timeUnit) != null ? _e : "";
        timeUnit.oninput = () => {
          p.timeUnit = timeUnit.value.trim();
        };
        const del = grid.createEl("button", { text: "Delete" });
        del.onclick = () => {
          presets.splice(idx, 1);
          renderPresets();
        };
      });
      const addBtn = presetsWrap.createEl("button", { text: "Add travel preset" });
      addBtn.onclick = () => {
        presets.push({
          id: genId("tt"),
          name: "Donkey",
          distanceValue: 1,
          distanceUnit: "mi",
          timeValue: 4,
          timeUnit: "h"
        });
        renderPresets();
      };
    };
    renderPresets();
    const footer = contentEl.createDiv({ cls: "zoommap-modal-footer" });
    const saveBtn = footer.createEl("button", { text: "Save" });
    const cancelBtn = footer.createEl("button", { text: "Cancel" });
    saveBtn.onclick = () => {
      var _a, _b, _c, _d;
      this.original.name = this.working.name;
      this.original.enabled = this.working.enabled;
      this.original.customUnits = (_a = this.working.customUnits) != null ? _a : [];
      this.original.terrains = (_b = this.working.terrains) != null ? _b : [];
      this.original.travelTimePresets = (_c = this.working.travelTimePresets) != null ? _c : [];
      this.original.travelPerDayPresets = (_d = this.working.travelPerDayPresets) != null ? _d : [];
      const first = this.original.travelPerDayPresets[0];
      this.original.travelPerDay = first ? { value: first.value, unit: first.unit } : { value: 8, unit: "h" };
      this.close();
      this.onDone({ action: "save", pack: this.original });
    };
    cancelBtn.onclick = () => {
      this.close();
      this.onDone({ action: "cancel" });
    };
  }
};

// src/main.ts
function svgPinDataUrl(color = "#d23c3c") {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <path fill="${color}" d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"/>
</svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}
function toCssSize(v, fallback) {
  if (typeof v === "number" && Number.isFinite(v)) return `${v}px`;
  if (typeof v === "string" && v.trim().length > 0) return v.trim();
  return fallback;
}
function folderOf3(path) {
  const i = path.lastIndexOf("/");
  return i >= 0 ? path.slice(0, i) : "";
}
var DEFAULT_FA_ZIP_URL = "https://use.fontawesome.com/releases/v6.4.0/fontawesome-free-6.4.0-web.zip";
var DEFAULT_RPG_ZIP_URL = "https://github.com/nagoshiashumari/rpg-awesome-raw/archive/refs/heads/master.zip";
function isPlainObject(val) {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}
function setCssProps2(el, props) {
  for (const [key, value] of Object.entries(props)) {
    if (value === null) el.style.removeProperty(key);
    else el.style.setProperty(key, value);
  }
}
function isCrossWindowHTMLElement(el, uiWin) {
  const candidate = el;
  const crossWin = uiWin;
  if (typeof crossWin.HTMLElement !== "function") {
    return false;
  }
  return candidate.instanceOf(crossWin.HTMLElement);
}
var DEFAULT_SETTINGS = {
  icons: [
    {
      key: "pinRed",
      pathOrDataUrl: svgPinDataUrl("#d23c3c"),
      size: 24,
      anchorX: 12,
      anchorY: 12,
      inCollections: true
    },
    {
      key: "pinBlue",
      pathOrDataUrl: svgPinDataUrl("#3c62d2"),
      size: 24,
      anchorX: 12,
      anchorY: 12,
      inCollections: true
    }
  ],
  defaultIconKey: "pinRed",
  wheelZoomFactor: 1.1,
  panMouseButton: "left",
  hoverMaxWidth: 360,
  applyHoverPopoverSizeGlobally: false,
  hoverMaxHeight: 260,
  showLinkFileNameInTooltip: false,
  presets: [],
  stickerPresets: [],
  defaultWidth: "100%",
  defaultHeight: "480px",
  defaultResizable: false,
  defaultResizeHandle: "right",
  forcePopoverWithoutModKey: true,
  measureLineColor: "var(--text-accent)",
  measureLineWidth: 2,
  storageDefault: "json",
  defaultWidthWrapped: "50%",
  baseCollections: [],
  pinPlaceOpensEditor: false,
  libraryFilePath: "ZoomMap/library.json",
  faFolderPath: "ZoomMap/SVGs",
  customUnits: [],
  travelTimePresets: [],
  travelPerDay: { value: 8, unit: "h" },
  travelRulesPacks: [],
  defaultScaleLikeSticker: false,
  enableDrawing: false,
  preferActiveLayerInEditor: false,
  enableTextLayers: false,
  enableMeasurePro: false,
  enableSessionImageCache: false,
  showZoomButtonsHud: false,
  sessionImageCacheMb: 512,
  keepOverlaysLoaded: false,
  preferCanvasImagesWhenCaching: false,
  svgRasterMaxScale: 8,
  showImageIconPreviewInSettings: false,
  enableGrid: false,
  middleClickOpensLinkInNewTab: false,
  enableSecondScreen: false,
  secondScreenFolder: "ZoomMap/SecondScreen"
};
function parseBasesYaml(v) {
  if (!Array.isArray(v)) return [];
  return v.map((it) => {
    if (typeof it === "string") return { path: it };
    if (it && typeof it === "object" && "path" in it) {
      const obj = it;
      if (typeof obj.path === "string") {
        return {
          path: obj.path,
          name: typeof obj.name === "string" ? obj.name : void 0
        };
      }
    }
    return null;
  }).filter((b) => b !== null);
}
function parseOverlaysYaml(v) {
  if (!Array.isArray(v)) return [];
  return v.map((it) => {
    if (typeof it === "string") return { path: it };
    if (it && typeof it === "object" && "path" in it) {
      const obj = it;
      if (typeof obj.path === "string") {
        return {
          path: obj.path,
          name: typeof obj.name === "string" ? obj.name : void 0,
          visible: typeof obj.visible === "boolean" ? obj.visible : void 0
        };
      }
    }
    return null;
  }).filter((o) => o !== null);
}
function parseScaleYaml(v) {
  if (!v || typeof v !== "object") return void 0;
  const obj = v;
  const mpp = typeof obj.metersPerPixel === "number" && obj.metersPerPixel > 0 ? obj.metersPerPixel : void 0;
  const ppm = typeof obj.pixelsPerMeter === "number" && obj.pixelsPerMeter > 0 ? 1 / obj.pixelsPerMeter : void 0;
  return mpp != null ? mpp : ppm;
}
function parseZoomYaml(value, fallback) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    let s = value.trim();
    if (!s) return fallback;
    const hasPercent = s.endsWith("%");
    if (hasPercent) s = s.slice(0, -1).trim();
    s = s.replace(",", ".");
    const n = Number(s);
    if (Number.isFinite(n) && n > 0) {
      return hasPercent ? n / 100 : n;
    }
  }
  return fallback;
}
function parsePxNumber(value, fallback) {
  var _a;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return fallback;
    const m = (_a = /^(-?\d+(?:[.,]\d+)?)\s*px$/i.exec(s)) != null ? _a : /^(-?\d+(?:[.,]\d+)?)$/.exec(s);
    if (m) {
      const n = Number(m[1].replace(",", "."));
      if (Number.isFinite(n)) return n;
    }
  }
  return fallback;
}
function parseFrameInsetsYaml(v) {
  if (!v || typeof v !== "object") return void 0;
  const o = v;
  const unit = o.unit === "percent" ? "percent" : "framePx";
  const parsePercent = (x) => {
    if (typeof x === "number") return x;
    if (typeof x === "string") {
      let s = x.trim();
      if (!s) return Number.NaN;
      if (s.endsWith("%")) s = s.slice(0, -1).trim();
      const n = Number(s.replace(",", "."));
      return n;
    }
    return Number.NaN;
  };
  const parseFramePx = (x) => {
    return parsePxNumber(x, Number.NaN);
  };
  const top = unit === "percent" ? parsePercent(o.top) : parseFramePx(o.top);
  const right = unit === "percent" ? parsePercent(o.right) : parseFramePx(o.right);
  const bottom = unit === "percent" ? parsePercent(o.bottom) : parseFramePx(o.bottom);
  const left = unit === "percent" ? parsePercent(o.left) : parseFramePx(o.left);
  if (![top, right, bottom, left].every((n) => Number.isFinite(n) && n >= 0)) {
    return void 0;
  }
  return { unit, top, right, bottom, left };
}
function parseAlign(v) {
  if (v === "left" || v === "center" || v === "right") return v;
  return void 0;
}
function parseResizeHandle(v) {
  return v === "left" || v === "right" || v === "both" || v === "native" ? v : "right";
}
async function readSavedFrame(app, markersPath) {
  try {
    const file = app.vault.getAbstractFileByPath((0, import_obsidian29.normalizePath)(markersPath));
    if (!(file instanceof import_obsidian29.TFile)) return null;
    const raw = await app.vault.read(file);
    const parsed = JSON.parse(raw);
    let fw = Number.NaN;
    let fh = Number.NaN;
    if (isPlainObject(parsed)) {
      const frame = parsed.frame;
      if (frame && typeof frame === "object") {
        const fr = frame;
        fw = typeof fr.w === "number" ? fr.w : Number(fr.w);
        fh = typeof fr.h === "number" ? fr.h : Number(fr.h);
      }
    }
    if (Number.isFinite(fw) && Number.isFinite(fh) && fw >= 48 && fh >= 48) {
      return { w: Math.round(fw), h: Math.round(fh) };
    }
  } catch (e) {
  }
  return null;
}
var ZoomMapPlugin = class extends import_obsidian29.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.imageCache = null;
    this.mapInstances = /* @__PURE__ */ new Set();
    this.pendingMapRestores = /* @__PURE__ */ new Map();
    this.activeMap = null;
  }
  makeMapRestoreKey(sourcePath, mapId) {
    return `${(0, import_obsidian29.normalizePath)(sourcePath)}::${mapId.trim()}`;
  }
  registerMapInstance(inst) {
    this.mapInstances.add(inst);
  }
  unregisterMapInstance(inst) {
    this.mapInstances.delete(inst);
    if (this.activeMap === inst) this.activeMap = null;
  }
  stashMapRestore(sourcePath, mapId, state) {
    if (!mapId.trim()) return;
    this.pendingMapRestores.set(this.makeMapRestoreKey(sourcePath, mapId), state);
  }
  consumeMapRestore(sourcePath, mapId) {
    var _a;
    if (!mapId.trim()) return null;
    const key = this.makeMapRestoreKey(sourcePath, mapId);
    const state = (_a = this.pendingMapRestores.get(key)) != null ? _a : null;
    if (state) this.pendingMapRestores.delete(key);
    return state;
  }
  snapshotMapsForSourceNote(sourcePath) {
    for (const inst of this.mapInstances) {
      if ((0, import_obsidian29.normalizePath)(inst.getSourcePath()) !== (0, import_obsidian29.normalizePath)(sourcePath)) continue;
      const mapId = inst.getMapId();
      const state = inst.captureRestoreState();
      if (state && mapId.trim()) this.stashMapRestore(sourcePath, mapId, state);
    }
  }
  setActiveMap(inst) {
    this.activeMap = inst;
  }
  notifyMapInstancesSettingsChanged() {
    for (const inst of this.mapInstances) {
      inst.onPluginSettingsChanged();
    }
  }
  getUiDocument() {
    return this.app.workspace.containerEl.ownerDocument;
  }
  clearGlobalHoverPopoverSettings() {
    const doc = this.getUiDocument();
    const root = doc.documentElement;
    const body = doc.body;
    if (!root || !body) return;
    body.classList.remove("zm-global-hover-popover-size");
    root.style.removeProperty("--zm-hover-popover-max-width");
    root.style.removeProperty("--zm-hover-popover-max-height");
    root.style.removeProperty("--popover-width");
    root.style.removeProperty("--popover-height");
    root.style.removeProperty("--popover-max-height");
    body.style.removeProperty("--zm-hover-popover-max-width");
    body.style.removeProperty("--zm-hover-popover-max-height");
    body.style.removeProperty("--popover-width");
    body.style.removeProperty("--popover-height");
    body.style.removeProperty("--popover-max-height");
  }
  applyGlobalHoverPopoverSettings() {
    var _a, _b;
    const doc = this.getUiDocument();
    const root = doc.documentElement;
    const body = doc.body;
    if (!root || !body) return;
    if (!this.settings.applyHoverPopoverSizeGlobally) {
      this.clearGlobalHoverPopoverSettings();
      return;
    }
    const maxW = Math.max(200, (_a = this.settings.hoverMaxWidth) != null ? _a : 360);
    const maxH = Math.max(120, (_b = this.settings.hoverMaxHeight) != null ? _b : 260);
    body.classList.add("zm-global-hover-popover-size");
    root.style.setProperty("--zm-hover-popover-max-width", `${maxW}px`);
    root.style.setProperty("--zm-hover-popover-max-height", `${maxH}px`);
  }
  async onload() {
    await this.loadSettings();
    this.applyGlobalHoverPopoverSettings();
    this.applyImageCacheSettings();
    this.addCommand({
      id: "insert-new-map",
      name: "Insert new map\u2026",
      editorCallback: (editor, view) => {
        const file = view.file;
        if (!file) return;
        const initialConfig = {
          imageBases: [{ path: "", name: "" }],
          overlays: [],
          markersPath: "",
          renderMode: "dom",
          minZoom: 0.25,
          maxZoom: 8,
          wrap: false,
          responsive: false,
          width: "100%",
          height: "480px",
          useWidth: true,
          useHeight: true,
          resizable: false,
          resizeHandle: "native",
          align: void 0,
          markerLayers: ["Default"],
          id: `map-${Date.now().toString(36)}`,
          viewportFrame: "",
          viewportFrameInsets: {
            unit: "framePx",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }
        };
        new ViewEditorModal(this.app, initialConfig, (res) => {
          var _a, _b;
          if (res.action !== "save" || !res.config) return;
          const yaml = this.buildYamlFromViewConfig(res.config);
          const block = "```zoommap\n" + yaml + "\n```\n";
          const cur = editor.getCursor();
          const curLineText = (_a = editor.getLine(cur.line)) != null ? _a : "";
          const m = /^(\s*(?:>\s*)+)/.exec(curLineText);
          const quotePrefix = (_b = m == null ? void 0 : m[1]) != null ? _b : "";
          if (!quotePrefix) {
            editor.replaceRange(block, cur);
            return;
          }
          const cursorAfterPrefix = cur.ch >= quotePrefix.length;
          const lines = block.split("\n");
          const quoted = lines.map((ln, idx) => {
            if (idx === 0 && cursorAfterPrefix) return ln;
            return quotePrefix + ln;
          }).join("\n");
          editor.replaceRange(quoted, cur);
        }).open();
      }
    });
    this.addCommand({
      id: "export-active-map-package",
      name: "Export active map package\u2026",
      checkCallback: (checking) => {
        const map = this.activeMap;
        if (!map) return false;
        if (!checking) this.openExportMapBundleModal(map);
        return true;
      }
    });
    this.addCommand({
      id: "import-map-package",
      name: "Import map package\u2026",
      editorCallback: (editor, view) => {
        const mdView = view;
        const file = mdView.file;
        if (!file) {
          new import_obsidian29.Notice("Please open a note in edit mode first.", 2500);
          return;
        }
        new ImportMapBundleModal(this.app, this, editor, mdView).open();
      }
    });
    this.addCommand({
      id: "toggle-measure-mode",
      name: "Toggle measure mode",
      checkCallback: (checking) => {
        const map = this.activeMap;
        if (!map) return false;
        if (!checking) map.toggleMeasureFromCommand();
        return true;
      }
    });
    this.addCommand({
      id: "clear-measurement",
      name: "Clear measurement",
      checkCallback: (checking) => {
        const map = this.activeMap;
        if (!map) return false;
        if (!checking) map.clearMeasurementFromCommand();
        return true;
      }
    });
    this.registerMarkdownCodeBlockProcessor(
      "zoommap",
      async (src, el, ctx) => {
        var _a, _b, _c, _d;
        let opts = {};
        try {
          const parsed = (0, import_obsidian29.parseYaml)(src);
          if (parsed && typeof parsed === "object") {
            opts = parsed;
          }
        } catch (error) {
          console.error("Zoom Map: failed to parse zoommap block", error);
        }
        const yamlBases = parseBasesYaml(opts.imageBases);
        const yamlOverlays = parseOverlaysYaml(opts.imageOverlays);
        const yamlMetersPerPixel = parseScaleYaml(opts.scale);
        const yamlFrameInsets = parseFrameInsetsYaml(opts.viewportFrameInsets);
        let initialZoom;
        let initialCenter;
        let initialViewRect;
        const viewOpt = opts.view;
        if (viewOpt && typeof viewOpt === "object") {
          const rawZoom = parseZoomYaml(viewOpt.zoom, NaN);
          if (!Number.isFinite(rawZoom) || rawZoom <= 0) {
            initialZoom = void 0;
          } else {
            initialZoom = rawZoom;
          }
          const cx = typeof viewOpt.centerX === "number" ? viewOpt.centerX : NaN;
          const cy = typeof viewOpt.centerY === "number" ? viewOpt.centerY : NaN;
          if (Number.isFinite(cx) && Number.isFinite(cy)) {
            initialCenter = {
              x: Math.min(Math.max(cx, 0), 1),
              y: Math.min(Math.max(cy, 0), 1)
            };
          }
          const left = typeof viewOpt.left === "number" ? viewOpt.left : Number.NaN;
          const top = typeof viewOpt.top === "number" ? viewOpt.top : Number.NaN;
          const right = typeof viewOpt.right === "number" ? viewOpt.right : Number.NaN;
          const bottom = typeof viewOpt.bottom === "number" ? viewOpt.bottom : Number.NaN;
          if (Number.isFinite(left) && Number.isFinite(top) && Number.isFinite(right) && Number.isFinite(bottom) && right > left && bottom > top) {
            initialViewRect = { left, top, right, bottom };
          }
        }
        const preferCanvas = !!this.settings.enableSessionImageCache && !!this.settings.preferCanvasImagesWhenCaching;
        const yamlRender = typeof opts.render === "string" ? opts.render.trim().toLowerCase() : "";
        const renderMode = yamlRender === "canvas" ? "canvas" : yamlRender === "dom" ? "dom" : preferCanvas ? "canvas" : "dom";
        let image = typeof opts.image === "string" ? opts.image.trim() : "";
        if (!image && yamlBases.length > 0) image = yamlBases[0].path;
        if (!image) {
          el.createEl("div", { text: "Image is missing." });
          return;
        }
        const responsive = !!((_a = opts.responsive) != null ? _a : opts.responsiv);
        const storageRaw = typeof opts.storage === "string" ? opts.storage.toLowerCase() : "";
        const storageMode = storageRaw === "note" || storageRaw === "inline" || storageRaw === "in-note" ? "note" : storageRaw === "json" ? "json" : (_b = this.settings.storageDefault) != null ? _b : "json";
        const sectionInfo = ctx.getSectionInfo(el);
        const defaultId = `map-${(_c = sectionInfo == null ? void 0 : sectionInfo.lineStart) != null ? _c : Date.now()}`;
        const idFromYaml = opts.id;
        const mapId = typeof idFromYaml === "string" && idFromYaml.trim() ? idFromYaml.trim() : defaultId;
        const screenRole = opts.screenRole === "player" || opts.screenRole === "controller" ? opts.screenRole : void 0;
        const markersPathRaw = typeof opts.markers === "string" ? opts.markers : void 0;
        const minZoom = responsive ? 1e-6 : parseZoomYaml(opts.minZoom, 0.25);
        const maxZoom = responsive ? 1e6 : parseZoomYaml(opts.maxZoom, 8);
        const markersPath = (0, import_obsidian29.normalizePath)(markersPathRaw != null ? markersPathRaw : `${image}.markers.json`);
        const align = parseAlign(opts.align);
        const wrap = !!opts.wrap;
        const classesValue = opts.classes;
        const extraClasses = Array.isArray(classesValue) ? classesValue.map((c) => String(c)) : typeof classesValue === "string" ? classesValue.split(/\s+/).map((c) => c.trim()).filter(Boolean) : [];
        const resizable = responsive ? false : typeof opts.resizable === "boolean" ? opts.resizable : this.settings.defaultResizable;
        const resizeHandle = responsive ? "right" : parseResizeHandle(opts.resizeHandle);
        const widthFromYaml = Object.prototype.hasOwnProperty.call(opts, "width");
        const heightFromYaml = Object.prototype.hasOwnProperty.call(opts, "height");
        const extSettings = this.settings;
        const widthDefault = wrap ? (_d = extSettings.defaultWidthWrapped) != null ? _d : "50%" : this.settings.defaultWidth;
        let widthCss = responsive ? "100%" : toCssSize(opts.width, widthDefault);
        let heightCss = responsive ? "auto" : toCssSize(opts.height, this.settings.defaultHeight);
        if (!responsive && storageMode === "json" && !widthFromYaml && !heightFromYaml) {
          const saved = await readSavedFrame(this.app, markersPath);
          if (saved) {
            widthCss = `${Math.max(220, saved.w)}px`;
            heightCss = `${Math.max(220, saved.h)}px`;
            el.style.width = widthCss;
            el.style.height = heightCss;
          }
        }
        const markerLayersFromYaml = Array.isArray(opts.markerLayers) ? opts.markerLayers.map((v) => {
          if (typeof v === "string") {
            return v.trim();
          }
          if (v && typeof v === "object" && "name" in v) {
            const name = v.name;
            return typeof name === "string" ? name.trim() : "";
          }
          return "";
        }).filter((s) => s.length > 0) : void 0;
        const cfg = {
          imagePath: image,
          markersPath,
          minZoom,
          maxZoom,
          sourcePath: ctx.sourcePath,
          width: widthCss,
          height: heightCss,
          resizable,
          resizeHandle,
          align,
          wrap,
          extraClasses,
          renderMode,
          yamlBases,
          yamlOverlays,
          yamlMetersPerPixel,
          sectionStart: sectionInfo == null ? void 0 : sectionInfo.lineStart,
          sectionEnd: sectionInfo == null ? void 0 : sectionInfo.lineEnd,
          widthFromYaml,
          heightFromYaml,
          storageMode,
          mapId,
          responsive,
          yamlMarkerLayers: markerLayersFromYaml,
          displayOnly: !!opts.displayOnly,
          initialZoom,
          initialCenter,
          initialViewRect,
          screenRole,
          viewportFrame: typeof opts.viewportFrame === "string" ? opts.viewportFrame.trim() : void 0,
          viewportFrameInsets: yamlFrameInsets
        };
        const inst = new MapInstance(this.app, this, el, cfg);
        ctx.addChild(inst);
      }
    );
    this.addSettingTab(new ZoomMapSettingTab(this.app, this));
  }
  getIconDefaultLink(iconKey) {
    var _a;
    const key = (iconKey != null ? iconKey : "").trim();
    if (!key) return void 0;
    const icon = (_a = this.settings.icons) == null ? void 0 : _a.find((i) => i.key === key);
    const raw = icon == null ? void 0 : icon.defaultLink;
    const trimmed = typeof raw === "string" ? raw.trim() : "";
    return trimmed.length ? trimmed : void 0;
  }
  openExportMapBundleModal(map) {
    new ExportMapBundleModal(this.app, this, map).open();
  }
  getEnabledTravelPacks() {
    var _a;
    const packsRaw = (_a = this.settings.travelRulesPacks) != null ? _a : [];
    const packs = packsRaw.filter((p) => {
      if (!p || typeof p !== "object") return false;
      if (Array.isArray(p)) return false;
      const r = p;
      return typeof r.id === "string";
    });
    return packs.filter((p) => p.enabled === true);
  }
  getActiveCustomUnits() {
    const packs = this.getEnabledTravelPacks();
    return packs.flatMap((p) => {
      var _a;
      return (_a = p.customUnits) != null ? _a : [];
    });
  }
  getActiveTerrains() {
    const packs = this.getEnabledTravelPacks();
    return packs.flatMap((p) => {
      var _a;
      return (_a = p.terrains) != null ? _a : [];
    });
  }
  getActiveTravelTimePresets() {
    const packs = this.getEnabledTravelPacks();
    return packs.flatMap((p) => {
      var _a;
      return (_a = p.travelTimePresets) != null ? _a : [];
    });
  }
  getActiveTravelPerDayPresets() {
    var _a;
    const packs = this.getEnabledTravelPacks();
    if (packs.length === 0) return null;
    const first = packs[0];
    const presets = ((_a = first.travelPerDayPresets) != null ? _a : []).filter((x) => !!x && typeof x.id === "string");
    return {
      presets,
      packName: first.name,
      multipleEnabled: packs.length > 1
    };
  }
  onunload() {
    var _a;
    this.clearGlobalHoverPopoverSettings();
    (_a = this.imageCache) == null ? void 0 : _a.clear();
    this.imageCache = null;
  }
  builtinIcon() {
    var _a;
    return (_a = this.settings.icons[0]) != null ? _a : {
      key: "builtin",
      pathOrDataUrl: svgPinDataUrl("#d23c3c"),
      size: 24,
      anchorX: 12,
      anchorY: 12,
      inCollections: true
    };
  }
  async loadSettings() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B, _C, _D, _E, _F, _G, _H, _I, _J, _K, _L, _M, _N, _O, _P, _Q, _R, _S, _T, _U, _V, _W, _X, _Y, _Z, __, _$, _aa;
    const savedUnknown = await this.loadData();
    const merged = { ...DEFAULT_SETTINGS };
    if (isPlainObject(savedUnknown)) {
      Object.assign(merged, savedUnknown);
    }
    this.settings = merged;
    const ext = this.settings;
    (_b = (_a = this.settings).baseCollections) != null ? _b : _a.baseCollections = [];
    (_c = ext.defaultWidthWrapped) != null ? _c : ext.defaultWidthWrapped = "50%";
    (_d = ext.libraryFilePath) != null ? _d : ext.libraryFilePath = "ZoomMap/library.json";
    (_e = ext.faFolderPath) != null ? _e : ext.faFolderPath = "ZoomMap/SVGs";
    (_g = (_f = this.settings).customUnits) != null ? _g : _f.customUnits = [];
    (_i = (_h = this.settings).travelTimePresets) != null ? _i : _h.travelTimePresets = [];
    (_k = (_j = this.settings).travelPerDay) != null ? _k : _j.travelPerDay = { value: 8, unit: "h" };
    (_m = (_l = this.settings).travelRulesPacks) != null ? _m : _l.travelRulesPacks = [];
    if (Array.isArray(this.settings.travelRulesPacks)) {
      for (const p of this.settings.travelRulesPacks) {
        if (typeof p.enabled !== "boolean") {
          p.enabled = true;
        }
        (_n = p.customUnits) != null ? _n : p.customUnits = [];
        (_o = p.terrains) != null ? _o : p.terrains = [];
        (_p = p.travelTimePresets) != null ? _p : p.travelTimePresets = [];
        (_q = p.travelPerDay) != null ? _q : p.travelPerDay = { value: 8, unit: "h" };
        const perDay = p.travelPerDay;
        if (!Number.isFinite(perDay.value) || perDay.value <= 0) perDay.value = 8;
        perDay.unit = ((_r = perDay.unit) != null ? _r : "").trim() || "h";
      }
    }
    if (((_t = (_s = this.settings.travelRulesPacks) == null ? void 0 : _s.length) != null ? _t : 0) === 0) {
      const legacyUnits = (_u = this.settings.customUnits) != null ? _u : [];
      const legacyPresets = (_v = this.settings.travelTimePresets) != null ? _v : [];
      const legacyPerDay = (_w = this.settings.travelPerDay) != null ? _w : { value: 8, unit: "h" };
      const shouldCreate = legacyUnits.length > 0 || legacyPresets.length > 0 || !!legacyPerDay;
      if (shouldCreate) {
        const pack = {
          id: `trp-${Math.random().toString(36).slice(2, 8)}`,
          name: "Default travel rules",
          enabled: true,
          customUnits: legacyUnits,
          travelTimePresets: legacyPresets,
          travelPerDay: legacyPerDay
        };
        this.settings.travelRulesPacks = [pack];
      }
    }
    if (!Number.isFinite(this.settings.travelPerDay.value) || this.settings.travelPerDay.value <= 0) {
      this.settings.travelPerDay.value = 8;
    }
    this.settings.travelPerDay.unit = ((_x = this.settings.travelPerDay.unit) != null ? _x : "").trim() || "h";
    (_z = (_y = this.settings).enableTextLayers) != null ? _z : _y.enableTextLayers = false;
    (_B = (_A = this.settings).enableMeasurePro) != null ? _B : _A.enableMeasurePro = false;
    (_D = (_C = this.settings).showLinkFileNameInTooltip) != null ? _D : _C.showLinkFileNameInTooltip = false;
    (_F = (_E = this.settings).showZoomButtonsHud) != null ? _F : _E.showZoomButtonsHud = false;
    (_H = (_G = this.settings).enableGrid) != null ? _H : _G.enableGrid = false;
    (_J = (_I = this.settings).applyHoverPopoverSizeGlobally) != null ? _J : _I.applyHoverPopoverSizeGlobally = false;
    (_L = (_K = this.settings).enableSessionImageCache) != null ? _L : _K.enableSessionImageCache = false;
    (_N = (_M = this.settings).sessionImageCacheMb) != null ? _N : _M.sessionImageCacheMb = 512;
    (_P = (_O = this.settings).keepOverlaysLoaded) != null ? _P : _O.keepOverlaysLoaded = false;
    (_R = (_Q = this.settings).preferCanvasImagesWhenCaching) != null ? _R : _Q.preferCanvasImagesWhenCaching = false;
    (_T = (_S = this.settings).svgRasterMaxScale) != null ? _T : _S.svgRasterMaxScale = 8;
    (_V = (_U = this.settings).showImageIconPreviewInSettings) != null ? _V : _U.showImageIconPreviewInSettings = false;
    (_X = (_W = this.settings).middleClickOpensLinkInNewTab) != null ? _X : _W.middleClickOpensLinkInNewTab = false;
    (_Z = (_Y = this.settings).enableSecondScreen) != null ? _Z : _Y.enableSecondScreen = false;
    (_$ = (__ = this.settings).secondScreenFolder) != null ? _$ : __.secondScreenFolder = "ZoomMap/SecondScreen";
    for (const ico of (_aa = this.settings.icons) != null ? _aa : []) {
      if (typeof ico.inCollections !== "boolean") {
        ico.inCollections = true;
      }
    }
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.applyGlobalHoverPopoverSettings();
    this.notifyMapInstancesSettingsChanged();
    this.applyImageCacheSettings();
  }
  applyImageCacheSettings() {
    var _a, _b;
    const enabled = !!this.settings.enableSessionImageCache;
    if (!enabled) {
      (_a = this.imageCache) == null ? void 0 : _a.clear();
      this.imageCache = null;
      return;
    }
    const mbRaw = (_b = this.settings.sessionImageCacheMb) != null ? _b : 512;
    const mb = Number.isFinite(mbRaw) && mbRaw > 0 ? mbRaw : 512;
    const bytes = Math.round(mb * 1024 * 1024);
    if (!this.imageCache) {
      this.imageCache = new ImageCache(this.app, bytes);
    } else {
      this.imageCache.setMaxBytes(bytes);
    }
  }
  /* -------- Library file (icons + collections) -------- */
  async ensureFolder(path) {
    const folder = folderOf3(path);
    if (!folder) return;
    if (!this.app.vault.getAbstractFileByPath(folder)) {
      await this.app.vault.createFolder(folder);
    }
  }
  async saveLibraryToPath(path) {
    var _a, _b, _c;
    const p = (0, import_obsidian29.normalizePath)(path);
    const ext = this.settings;
    const payload = {
      version: 1,
      icons: (_a = this.settings.icons) != null ? _a : [],
      baseCollections: (_b = this.settings.baseCollections) != null ? _b : [],
      travelRulesPacks: (_c = this.settings.travelRulesPacks) != null ? _c : [],
      exportedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      await this.ensureFolder(p);
      const existing = this.app.vault.getAbstractFileByPath(p);
      const json = JSON.stringify(payload, null, 2);
      if (existing instanceof import_obsidian29.TFile) {
        await this.app.vault.modify(existing, json);
      } else {
        await this.app.vault.create(p, json);
      }
      ext.libraryFilePath = p;
      await this.saveSettings();
      new import_obsidian29.Notice(`Library saved to ${p}`, 2e3);
    } catch (e) {
      console.error("Save library failed", e);
      new import_obsidian29.Notice("Failed to save library.", 2500);
    }
  }
  async loadLibraryFromFile(file) {
    try {
      const raw = await this.app.vault.read(file);
      const obj = JSON.parse(raw);
      if (!isPlainObject(obj)) {
        new import_obsidian29.Notice("Invalid library file.", 2500);
        return;
      }
      const hasIcons = (x) => isPlainObject(x) && "icons" in x;
      const hasBaseCollections = (x) => isPlainObject(x) && "baseCollections" in x;
      let icons = [];
      if (hasIcons(obj) && Array.isArray(obj.icons)) {
        icons = obj.icons;
      }
      let cols = [];
      if (hasBaseCollections(obj) && Array.isArray(obj.baseCollections)) {
        cols = obj.baseCollections;
      }
      this.settings.icons = icons;
      this.settings.baseCollections = cols;
      this.settings.libraryFilePath = file.path;
      await this.saveSettings();
      new import_obsidian29.Notice(`Library loaded from ${file.path}`, 2e3);
    } catch (e) {
      console.error("Load library failed", e);
      new import_obsidian29.Notice("Failed to load library.", 2500);
    }
  }
  async downloadFontAwesomeZip() {
    var _a;
    const ext = this.settings;
    const folder = (0, import_obsidian29.normalizePath)(((_a = ext.faFolderPath) == null ? void 0 : _a.trim()) || "ZoomMap/SVGs");
    const zipPath = (0, import_obsidian29.normalizePath)(`${folder}/fontawesome-free.zip`);
    try {
      if (!this.app.vault.getAbstractFileByPath(folder)) {
        await this.app.vault.createFolder(folder);
      }
      new import_obsidian29.Notice("Downloading font awesome free zip\u2026", 2500);
      const res = await (0, import_obsidian29.requestUrl)({
        url: DEFAULT_FA_ZIP_URL,
        method: "GET"
      });
      await this.app.vault.adapter.writeBinary(zipPath, res.arrayBuffer);
      new import_obsidian29.Notice(
        `Downloaded Font Awesome ZIP to ${zipPath}. Please unzip it so that SVG files are available in this folder.`,
        6e3
      );
    } catch (e) {
      console.error("Download Font Awesome ZIP failed", e);
      new import_obsidian29.Notice("Failed to download font awesome zip.", 4e3);
    }
  }
  async downloadRpgAwesomeZip() {
    var _a;
    const ext = this.settings;
    const folder = (0, import_obsidian29.normalizePath)(((_a = ext.faFolderPath) == null ? void 0 : _a.trim()) || "ZoomMap/SVGs");
    const zipPath = (0, import_obsidian29.normalizePath)(`${folder}/rpg-awesome.zip`);
    try {
      if (!this.app.vault.getAbstractFileByPath(folder)) {
        await this.app.vault.createFolder(folder);
      }
      new import_obsidian29.Notice("Downloading rpg awesome SVG pack\u2026", 2500);
      const res = await (0, import_obsidian29.requestUrl)({
        url: DEFAULT_RPG_ZIP_URL,
        method: "GET"
      });
      await this.app.vault.adapter.writeBinary(zipPath, res.arrayBuffer);
      new import_obsidian29.Notice(
        `Downloaded RPG Awesome ZIP to ${zipPath}. Please unzip it so that the SVG files are available in this folder.`,
        6e3
      );
    } catch (e) {
      console.error("Download RPG Awesome ZIP failed", e);
      new import_obsidian29.Notice("Failed to download rpg awesome zip.", 4e3);
    }
  }
  rescanSvgFolder() {
    var _a;
    const ext = this.settings;
    const folder = (0, import_obsidian29.normalizePath)(((_a = ext.faFolderPath) == null ? void 0 : _a.trim()) || "ZoomMap/SVGs");
    const files = this.app.vault.getFiles();
    const prefix = folder.endsWith("/") ? folder : folder + "/";
    const count = files.filter((f) => {
      var _a2;
      if (((_a2 = f.extension) == null ? void 0 : _a2.toLowerCase()) !== "svg") return false;
      return f.path === folder || f.path.startsWith(prefix);
    }).length;
    new import_obsidian29.Notice(
      `Found ${count} SVG files under ${folder}. They will be available in the \u201CAdd SVG icon\u201D picker.`,
      4e3
    );
    return count;
  }
  buildYamlFromViewConfig(cfg) {
    var _a, _b, _c, _d;
    const obj = {};
    const bases = ((_a = cfg.imageBases) != null ? _a : []).filter(
      (b) => b.path && b.path.trim().length > 0
    );
    if (bases.length > 0) {
      obj.imageBases = bases.map(
        (b) => b.name ? { path: b.path, name: b.name } : { path: b.path }
      );
    }
    const overlays = ((_b = cfg.overlays) != null ? _b : []).filter(
      (o) => o.path && o.path.trim().length > 0
    );
    if (overlays.length > 0) {
      obj.imageOverlays = overlays.map((o) => {
        const r = {
          path: o.path
        };
        if (o.name) r.name = o.name;
        if (typeof o.visible === "boolean") r.visible = o.visible;
        return r;
      });
    }
    let markersPath = (_c = cfg.markersPath) == null ? void 0 : _c.trim();
    if ((!markersPath || !markersPath.length) && bases.length > 0) {
      const first = bases[0].path;
      const dot = first.lastIndexOf(".");
      const base = dot >= 0 ? first.slice(0, dot) : first;
      markersPath = `${base}.markers.json`;
    }
    if (markersPath) obj.markers = markersPath;
    if (cfg.markerLayers && cfg.markerLayers.length > 0) {
      obj.markerLayers = cfg.markerLayers.map((n) => n.trim()).filter((n) => n.length > 0);
    }
    obj.minZoom = cfg.minZoom;
    obj.maxZoom = cfg.maxZoom;
    obj.wrap = !!cfg.wrap;
    obj.responsive = !!cfg.responsive;
    if (cfg.useWidth && cfg.width && cfg.width.trim().length > 0) {
      obj.width = cfg.width;
    }
    if (cfg.useHeight && cfg.height && cfg.height.trim().length > 0) {
      obj.height = cfg.height;
    }
    obj.resizable = !!cfg.resizable;
    obj.resizeHandle = cfg.resizeHandle;
    obj.render = cfg.renderMode;
    if (cfg.align) obj.align = cfg.align;
    if (cfg.id && cfg.id.trim().length > 0) {
      obj.id = cfg.id.trim();
    }
    const frame = (_d = cfg.viewportFrame) == null ? void 0 : _d.trim();
    if (frame) {
      obj.viewportFrame = frame;
      if (cfg.viewportFrameInsets) {
        obj.viewportFrameInsets = {
          unit: cfg.viewportFrameInsets.unit,
          top: cfg.viewportFrameInsets.top,
          right: cfg.viewportFrameInsets.right,
          bottom: cfg.viewportFrameInsets.bottom,
          left: cfg.viewportFrameInsets.left
        };
      }
    }
    return (0, import_obsidian29.stringifyYaml)(obj).trimEnd();
  }
};
function tintSvgMarkup2(svg, color) {
  var _a;
  const c = color.trim();
  if (!c) return svg;
  try {
    const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
    const root = doc.querySelector("svg");
    if (!root) return svg;
    const inner = (_a = root.querySelector("#zm-inner")) != null ? _a : root;
    const base = root.querySelector("#zm-base");
    const outline = root.querySelector("#zm-outline");
    const shapes = inner.querySelectorAll("path, circle, rect, polygon, polyline, line, ellipse");
    let touched = false;
    shapes.forEach((el) => {
      var _a2, _b;
      if (base && base.contains(el)) return;
      if (outline && outline.contains(el)) return;
      const styleFill = (_a2 = el.style) == null ? void 0 : _a2.fill;
      const styleStroke = (_b = el.style) == null ? void 0 : _b.stroke;
      const fillAttr = el.getAttribute("fill");
      const strokeAttr = el.getAttribute("stroke");
      const hasFill = typeof styleFill === "string" && styleFill && styleFill.toLowerCase() !== "none" || typeof fillAttr === "string" && fillAttr && fillAttr.toLowerCase() !== "none";
      const hasStroke = typeof styleStroke === "string" && styleStroke && styleStroke.toLowerCase() !== "none" || typeof strokeAttr === "string" && strokeAttr && strokeAttr.toLowerCase() !== "none";
      if (hasFill) {
        el.style.fill = c;
        el.setAttribute("fill", c);
        touched = true;
      }
      if (hasStroke) {
        el.style.stroke = c;
        el.setAttribute("stroke", c);
        touched = true;
      }
    });
    if (!touched) {
      inner.setAttribute("fill", c);
    }
    return new XMLSerializer().serializeToString(root);
  } catch (e) {
    return svg;
  }
}
var ZoomMapSettingTab = class extends import_obsidian29.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.svgFileCache = /* @__PURE__ */ new Map();
    this.plugin = plugin;
  }
  async addFontAwesomeIcon(file) {
    var _a;
    try {
      const svg = await this.app.vault.read(file);
      const defaultColor = "#b0b0b0";
      const tinted = tintSvgMarkup2(svg, defaultColor);
      const dataUrl = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(tinted);
      const icons = (_a = this.plugin.settings.icons) != null ? _a : [];
      let baseKey = file.name.replace(/\.svg$/i, "");
      baseKey = baseKey.replace(/\s+/g, "-");
      let key = baseKey;
      let idx = 1;
      while (icons.some((i) => i.key === key)) {
        key = `${baseKey}-${idx++}`;
      }
      icons.unshift({
        key,
        pathOrDataUrl: dataUrl,
        size: 24,
        anchorX: 12,
        anchorY: 12,
        defaultLink: "",
        inCollections: true
      });
      this.plugin.settings.icons = icons;
      await this.plugin.saveSettings();
      this.display();
    } catch (e) {
      console.error("Zoom Map: failed to add Font Awesome icon", e);
      new import_obsidian29.Notice("Failed to add font awesome icon.", 2500);
    }
  }
  async recolorIconSvg(icon, color) {
    var _a;
    const c = color.trim();
    if (!c) return;
    let svg = null;
    const src = (_a = icon.pathOrDataUrl) != null ? _a : "";
    if (typeof src === "string" && src.startsWith("data:image/svg+xml")) {
      const idx = src.indexOf(",");
      if (idx >= 0) {
        try {
          const payload = src.slice(idx + 1);
          svg = decodeURIComponent(payload);
        } catch (e) {
          svg = null;
        }
      }
    } else if (typeof src === "string" && src.toLowerCase().endsWith(".svg")) {
      const cached = this.svgFileCache.get(src);
      if (cached) {
        svg = cached;
      } else {
        const f = this.app.vault.getAbstractFileByPath(src);
        if (f instanceof import_obsidian29.TFile) {
          try {
            const text = await this.app.vault.read(f);
            this.svgFileCache.set(src, text);
            svg = text;
          } catch (e) {
            svg = null;
          }
        }
      }
    }
    if (!svg) return;
    const tinted = tintSvgMarkup2(svg, c);
    const dataUrl = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(tinted);
    icon.pathOrDataUrl = dataUrl;
    await this.plugin.saveSettings();
  }
  getSvgColorFromDataUrl(dataUrl) {
    if (typeof dataUrl !== "string") return null;
    if (!dataUrl.startsWith("data:image/svg+xml")) return null;
    const idx = dataUrl.indexOf(",");
    if (idx < 0) return null;
    try {
      const payload = dataUrl.slice(idx + 1);
      const svg = decodeURIComponent(payload);
      const mFill = /fill="([^"]+)"/i.exec(svg);
      if (mFill) return mFill[1];
      const mStroke = /stroke="([^"]+)"/i.exec(svg);
      if (mStroke) return mStroke[1];
      return null;
    } catch (e) {
      return null;
    }
  }
  display() {
    var _a;
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("zoommap-settings");
    containerEl.classList.toggle(
      "zoommap-settings--imgpreview",
      !!this.plugin.settings.showImageIconPreviewInSettings
    );
    new import_obsidian29.Setting(containerEl).setName("Storage").setHeading();
    new import_obsidian29.Setting(containerEl).setName("Storage location by default").setDesc("Store marker data in JSON beside image, or inline in the note.").addDropdown((d) => {
      var _a2;
      d.addOption("json", "JSON file (beside image)");
      d.addOption("note", "Inside the note (hidden comment)");
      d.setValue((_a2 = this.plugin.settings.storageDefault) != null ? _a2 : "json");
      d.onChange((v) => {
        this.plugin.settings.storageDefault = v === "note" ? "note" : "json";
        void this.plugin.saveSettings();
      });
    });
    new import_obsidian29.Setting(containerEl).setName("Layout").setHeading();
    new import_obsidian29.Setting(containerEl).setName("Default width when wrapped").setDesc("Initial width if wrap: true and no width is set in the code block.").addText((t) => {
      var _a2;
      const ext = this.plugin.settings;
      t.setPlaceholder("50%");
      t.setValue((_a2 = ext.defaultWidthWrapped) != null ? _a2 : "50%");
      t.onChange((v) => {
        ext.defaultWidthWrapped = (v || "50%").trim();
        void this.plugin.saveSettings();
      });
    });
    new import_obsidian29.Setting(containerEl).setName("Interaction").setHeading();
    new import_obsidian29.Setting(containerEl).setName("Mouse wheel zoom factor").setDesc("Multiplier per step. 1.1 = 10% per tick.").addText(
      (t) => t.setPlaceholder("1.1").setValue(String(this.plugin.settings.wheelZoomFactor)).onChange((v) => {
        const n = Number(v);
        if (!Number.isNaN(n) && n > 1.001 && n < 2.5) {
          this.plugin.settings.wheelZoomFactor = n;
          void this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian29.Setting(containerEl).setName("Panning mouse button").setDesc("Which mouse button pans the map?").addDropdown((d) => {
      var _a2;
      d.addOption("left", "Left");
      d.addOption("middle", "Middle");
      d.addOption("right", "Right");
      d.setValue((_a2 = this.plugin.settings.panMouseButton) != null ? _a2 : "left");
      d.onChange((v) => {
        const next = v === "left" || v === "middle" || v === "right" ? v : "left";
        this.plugin.settings.panMouseButton = next;
        void this.plugin.saveSettings();
      });
    });
    new import_obsidian29.Setting(containerEl).setName("Hover popover size").setDesc("Max width and height in pixels.").addToggle(
      (tg) => tg.setValue(!!this.plugin.settings.applyHoverPopoverSizeGlobally).onChange((v) => {
        this.plugin.settings.applyHoverPopoverSizeGlobally = v;
        void this.plugin.saveSettings();
      })
    ).addText(
      (t) => t.setPlaceholder("360").setValue(String(this.plugin.settings.hoverMaxWidth)).onChange((v) => {
        const n = Number(v);
        if (!Number.isNaN(n) && n >= 200) {
          this.plugin.settings.hoverMaxWidth = n;
          void this.plugin.saveSettings();
        }
      })
    ).addText(
      (t) => t.setPlaceholder("260").setValue(String(this.plugin.settings.hoverMaxHeight)).onChange((v) => {
        const n = Number(v);
        if (!Number.isNaN(n) && n >= 120) {
          this.plugin.settings.hoverMaxHeight = n;
          void this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian29.Setting(containerEl).setName("Force popovers without ctrl").setDesc("Opens preview popovers on simple hover.").addToggle(
      (t) => t.setValue(!!this.plugin.settings.forcePopoverWithoutModKey).onChange((v) => {
        this.plugin.settings.forcePopoverWithoutModKey = v;
        void this.plugin.saveSettings();
      })
    );
    new import_obsidian29.Setting(containerEl).setName("Open editor when placing pin from menu").setDesc("When enabled, placing a pin from the pins menu opens the marker editor.").addToggle(
      (t) => t.setValue(!!this.plugin.settings.pinPlaceOpensEditor).onChange((v) => {
        this.plugin.settings.pinPlaceOpensEditor = v;
        void this.plugin.saveSettings();
      })
    );
    new import_obsidian29.Setting(containerEl).setName("Preferences").setDesc("Global defaults for marker creation and behavior.").addButton(
      (b) => b.setButtonText("Open\u2026").onClick(() => {
        new PreferencesModal(this.app, this.plugin).open();
      })
    );
    new import_obsidian29.Setting(containerEl).setName("Ruler").setHeading();
    const applyStyleToAll = () => {
      var _a2, _b;
      const color = ((_a2 = this.plugin.settings.measureLineColor) != null ? _a2 : "var(--text-accent)").trim();
      const widthPx = Math.max(1, (_b = this.plugin.settings.measureLineWidth) != null ? _b : 2);
      const uiDoc = this.plugin.app.workspace.containerEl.ownerDocument;
      const uiWin = uiDoc.defaultView;
      if (!uiWin) return;
      uiDoc.querySelectorAll(".zm-root").forEach((el) => {
        if (isCrossWindowHTMLElement(el, uiWin)) {
          setCssProps2(el, {
            "--zm-measure-color": color,
            "--zm-measure-width": `${widthPx}px`
          });
        }
      });
    };
    const colorRow = new import_obsidian29.Setting(containerEl).setName("Line color").setDesc("CSS color, e.g. #ff0055.");
    colorRow.addText(
      (t) => {
        var _a2;
        return t.setPlaceholder("Default").setValue((_a2 = this.plugin.settings.measureLineColor) != null ? _a2 : "var(--text-accent)").onChange((v) => {
          this.plugin.settings.measureLineColor = (v == null ? void 0 : v.trim()) || "var(--text-accent)";
          void this.plugin.saveSettings();
          applyStyleToAll();
        });
      }
    );
    const picker = colorRow.controlEl.createEl("input", {
      attr: {
        type: "color",
        style: "margin-left:8px; vertical-align: middle;"
      }
    });
    const setPickerFromValue = (val) => {
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) picker.value = val;
      else picker.value = "#ff0000";
    };
    setPickerFromValue((_a = this.plugin.settings.measureLineColor) != null ? _a : "");
    picker.oninput = () => {
      this.plugin.settings.measureLineColor = picker.value;
      void this.plugin.saveSettings();
      applyStyleToAll();
    };
    new import_obsidian29.Setting(containerEl).setName("Line width").setDesc("Stroke width in pixels.").addText(
      (t) => {
        var _a2;
        return t.setPlaceholder("2").setValue(String((_a2 = this.plugin.settings.measureLineWidth) != null ? _a2 : 2)).onChange((v) => {
          const n = Number(v);
          if (Number.isFinite(n) && n > 0 && n <= 20) {
            this.plugin.settings.measureLineWidth = n;
            void this.plugin.saveSettings();
            applyStyleToAll();
          }
        });
      }
    );
    new import_obsidian29.Setting(containerEl).setName("Travel rules").setHeading();
    new import_obsidian29.Setting(containerEl).setName("Manage travel rules packs").setDesc("Custom units + distance\u2192time presets are managed in packs (import/export supported).").addButton(
      (b) => b.setButtonText("Open\u2026").onClick(() => {
        new TravelRulesManagerModal(this.app, this.plugin, () => {
          this.display();
        }).open();
      })
    );
    new import_obsidian29.Setting(containerEl).setName("Collections (base-bound)").setHeading();
    const collectionsWrap = containerEl.createDiv();
    const renderCollections = () => {
      var _a2;
      collectionsWrap.empty();
      const hint = collectionsWrap.createEl("div", {
        text: "Collections bundle pins, favorites and stickers for specific base images. Create a 'global' collection without bindings for items that should be available everywhere."
      });
      hint.addClass("zoommap-collections-hint");
      const list = collectionsWrap.createDiv();
      const cols = (_a2 = this.plugin.settings.baseCollections) != null ? _a2 : [];
      if (cols.length === 0) {
        list.createEl("div", { text: "No collections yet." });
      } else {
        cols.forEach((c) => {
          var _a3, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
          const row = list.createDiv({ cls: "zoommap-collections-row" });
          const left = row.createDiv();
          const name = left.createEl("div", { text: c.name || "(unnamed collection)" });
          name.addClass("zoommap-collections-name");
          const meta = left.createEl("div", {
            text: `${(_c = (_b = (_a3 = c.bindings) == null ? void 0 : _a3.basePaths) == null ? void 0 : _b.length) != null ? _c : 0} bases \u2022 ${(_f = (_e = (_d = c.include) == null ? void 0 : _d.pinKeys) == null ? void 0 : _e.length) != null ? _f : 0} pins \u2022 ${(_i = (_h = (_g = c.include) == null ? void 0 : _g.favorites) == null ? void 0 : _h.length) != null ? _i : 0} favorites \u2022 ${(_l = (_k = (_j = c.include) == null ? void 0 : _j.stickers) == null ? void 0 : _k.length) != null ? _l : 0} stickers \u2022 ${(_o = (_n = (_m = c.include) == null ? void 0 : _m.swapPins) == null ? void 0 : _n.length) != null ? _o : 0} swap pins`
          });
          meta.addClass("zoommap-collections-meta");
          const edit = row.createEl("button", { text: "Edit" });
          edit.onclick = () => {
            new CollectionEditorModal(this.app, this.plugin, c, ({ updated, deleted }) => {
              var _a4;
              if (deleted) {
                const arr = (_a4 = this.plugin.settings.baseCollections) != null ? _a4 : [];
                const pos = arr.indexOf(c);
                if (pos >= 0) arr.splice(pos, 1);
                void this.plugin.saveSettings().then(() => {
                  renderCollections();
                });
                return;
              }
              if (updated) {
                void this.plugin.saveSettings().then(() => {
                  renderCollections();
                });
              }
            }).open();
          };
          const del = row.createEl("button", { text: "Delete" });
          del.onclick = () => {
            var _a4;
            const arr = (_a4 = this.plugin.settings.baseCollections) != null ? _a4 : [];
            const pos = arr.indexOf(c);
            if (pos >= 0) arr.splice(pos, 1);
            void this.plugin.saveSettings().then(() => {
              renderCollections();
            });
          };
        });
      }
      const actions = collectionsWrap.createDiv({ cls: "zoommap-collections-actions" });
      const add = actions.createEl("button", { text: "Add collection" });
      add.onclick = () => {
        const fresh = {
          id: `col-${Math.random().toString(36).slice(2, 8)}`,
          name: "New Collection",
          bindings: { basePaths: [] },
          include: { pinKeys: [], favorites: [], stickers: [], swapPins: [], pingPins: [] }
        };
        new CollectionEditorModal(this.app, this.plugin, fresh, ({ updated, deleted }) => {
          var _a3;
          if (deleted) return;
          if (updated) {
            this.plugin.settings.baseCollections = (_a3 = this.plugin.settings.baseCollections) != null ? _a3 : [];
            this.plugin.settings.baseCollections.push(fresh);
            void this.plugin.saveSettings().then(() => {
              renderCollections();
            });
          }
        }).open();
      };
    };
    renderCollections();
    new import_obsidian29.Setting(containerEl).setName("Marker icons (library)").setHeading();
    const libRow = new import_obsidian29.Setting(containerEl).setName("Library file (icons + collections)").setDesc("Save/load your icons and collections to/from a JSON file.");
    libRow.addText((t) => {
      var _a2;
      const ext = this.plugin.settings;
      t.setPlaceholder("ZoomMap/library.json");
      t.setValue((_a2 = ext.libraryFilePath) != null ? _a2 : "ZoomMap/library.json");
      t.onChange((v) => {
        this.plugin.settings.libraryFilePath = v.trim() || "ZoomMap/library.json";
        void this.plugin.saveSettings();
      });
    });
    libRow.addButton(
      (b) => b.setButtonText("Pick\u2026").onClick(() => {
        new JsonFileSuggestModal(this.app, (file) => {
          this.plugin.settings.libraryFilePath = file.path;
          void this.plugin.saveSettings().then(() => {
            this.display();
          });
        }).open();
      })
    );
    libRow.addButton(
      (b) => b.setButtonText("Save now").onClick(() => {
        var _a2, _b;
        const ext = this.plugin.settings;
        const p = (_b = (_a2 = ext.libraryFilePath) == null ? void 0 : _a2.trim()) != null ? _b : "ZoomMap/library.json";
        void this.plugin.saveLibraryToPath(p);
      })
    );
    libRow.addButton(
      (b) => b.setButtonText("Load\u2026").onClick(() => {
        new JsonFileSuggestModal(this.app, (file) => {
          void this.plugin.loadLibraryFromFile(file).then(() => {
            this.display();
          });
        }).open();
      })
    );
    new import_obsidian29.Setting(containerEl).setName("SVG icon sources").setHeading();
    const svgFolderRow = new import_obsidian29.Setting(containerEl).setName("SVG icon folder in vault").setDesc("Folder that contains SVG packs.");
    svgFolderRow.addText((t) => {
      var _a2;
      const ext = this.plugin.settings;
      t.setPlaceholder("e.g. ZoomMap/SVGs");
      t.setValue((_a2 = ext.faFolderPath) != null ? _a2 : "ZoomMap/SVGs");
      t.onChange((v) => {
        ext.faFolderPath = (v || "ZoomMap/SVGs").trim();
        void this.plugin.saveSettings();
      });
    });
    svgFolderRow.addButton(
      (b) => b.setButtonText("Ensure folder").onClick(() => {
        var _a2;
        const ext = this.plugin.settings;
        const folder = (0, import_obsidian29.normalizePath)(((_a2 = ext.faFolderPath) == null ? void 0 : _a2.trim()) || "ZoomMap/SVGs");
        if (!this.app.vault.getAbstractFileByPath(folder)) {
          void this.app.vault.createFolder(folder).then(() => {
            new import_obsidian29.Notice(`Created folder: ${folder}`, 2e3);
          });
        } else {
          new import_obsidian29.Notice("Folder already exists.", 1500);
        }
      })
    );
    svgFolderRow.addButton(
      (b) => b.setButtonText("Rescan icons").onClick(() => {
        this.plugin.rescanSvgFolder();
      })
    );
    const svgDownloadRow = new import_obsidian29.Setting(containerEl).setName("Download icon packs").setDesc("Download common SVG packs into the configured folder.");
    svgDownloadRow.addButton(
      (b) => b.setButtonText("Download font awesome free").onClick(() => {
        void this.plugin.downloadFontAwesomeZip();
      })
    );
    svgDownloadRow.addButton(
      (b) => b.setButtonText("Download rpg awesome").onClick(() => {
        void this.plugin.downloadRpgAwesomeZip();
      })
    );
    const buildLinkSuggestions = () => {
      var _a2, _b, _c, _d;
      const files = this.app.vault.getFiles().filter((f) => {
        var _a3;
        return ((_a3 = f.extension) == null ? void 0 : _a3.toLowerCase()) === "md";
      });
      const suggestions = [];
      const active = this.app.workspace.getActiveFile();
      const fromPath = (_c = (_b = active == null ? void 0 : active.path) != null ? _b : (_a2 = files[0]) == null ? void 0 : _a2.path) != null ? _c : "";
      for (const file of files) {
        const baseLink = this.app.metadataCache.fileToLinktext(file, fromPath);
        suggestions.push({ label: baseLink, value: baseLink });
        const cache = this.app.metadataCache.getCache(file.path);
        const headings = (_d = cache == null ? void 0 : cache.headings) != null ? _d : [];
        for (const h of headings) {
          const headingName = h.heading;
          const full = `${baseLink}#${headingName}`;
          suggestions.push({ label: `${baseLink} \u203A ${headingName}`, value: full });
        }
      }
      return suggestions;
    };
    const allLinkSuggestions = buildLinkSuggestions();
    const attachLinkAutocomplete = (input, getValue, setValue) => {
      const wrapper = input.parentElement;
      if (!wrapper) return;
      wrapper.classList.add("zoommap-link-input-wrapper");
      const listEl = wrapper.createDiv({ cls: "zoommap-link-suggestions is-hidden" });
      const hide = () => listEl.classList.add("is-hidden");
      const show = () => listEl.classList.remove("is-hidden");
      const updateList = (query) => {
        const q = query.trim().toLowerCase();
        listEl.empty();
        if (!q) {
          hide();
          return;
        }
        const maxItems = 20;
        const matches = allLinkSuggestions.filter((s) => s.value.toLowerCase().includes(q) || s.label.toLowerCase().includes(q)).slice(0, maxItems);
        if (matches.length === 0) {
          hide();
          return;
        }
        show();
        matches.forEach((s) => {
          const row = listEl.createDiv({ cls: "zoommap-link-suggestion-item" });
          row.setText(s.label);
          row.addEventListener("mousedown", (ev) => {
            ev.preventDefault();
            setValue(s.value);
            hide();
          });
        });
      };
      input.addEventListener("input", () => updateList(input.value));
      input.addEventListener("blur", () => {
        window.setTimeout(() => hide(), 150);
      });
      updateList(getValue());
    };
    const isSvgIcon = (icon) => {
      var _a2;
      const src = (_a2 = icon.pathOrDataUrl) != null ? _a2 : "";
      if (typeof src !== "string") return false;
      const lower = src.toLowerCase();
      return lower.startsWith("data:image/svg+xml") || lower.endsWith(".svg");
    };
    new import_obsidian29.Setting(containerEl).setName("SVG icons").setHeading();
    const addSvgSetting = new import_obsidian29.Setting(containerEl).setName("Add SVG icon or sort the list").setDesc("Create a pin icon from an SVG file in the configured folder, or sort the SVG icon list alphabetically.");
    const infoIcon = addSvgSetting.controlEl.createDiv({ cls: "zoommap-info-icon" });
    (0, import_obsidian29.setIcon)(infoIcon, "info");
    infoIcon.setAttr(
      "title",
      "Rendering many SVG files in the picker can cause noticeable delays while all previews are generated. Once the icons are cached, searching and adding should feel much faster."
    );
    addSvgSetting.addButton(
      (b) => b.setButtonText("Sort a\u2192z").onClick(() => {
        var _a2;
        const icons = (_a2 = this.plugin.settings.icons) != null ? _a2 : [];
        if (icons.length === 0) return;
        const svgIcons = icons.filter((i) => isSvgIcon(i));
        if (svgIcons.length <= 1) {
          new import_obsidian29.Notice("No SVG icons to sort.", 2e3);
          return;
        }
        const keyOf = (i) => {
          var _a3;
          return String((_a3 = i.key) != null ? _a3 : "").trim();
        };
        const sorted = [...svgIcons].sort(
          (a, b2) => keyOf(a).localeCompare(keyOf(b2), void 0, { sensitivity: "base", numeric: true })
        );
        let j = 0;
        const next = icons.map((ico) => isSvgIcon(ico) ? sorted[j++] : ico);
        this.plugin.settings.icons = next;
        void this.plugin.saveSettings().then(() => {
          renderIcons == null ? void 0 : renderIcons();
          new import_obsidian29.Notice(`Sorted ${sorted.length} SVG icons.`, 2e3);
        });
      })
    );
    addSvgSetting.addButton(
      (b) => b.setButtonText("Add SVG icon").onClick(() => {
        var _a2;
        const ext = this.plugin.settings;
        const folder = ((_a2 = ext.faFolderPath) == null ? void 0 : _a2.trim()) || "ZoomMap/SVGs";
        new FaIconPickerModal(this.app, folder, (file) => {
          void this.addFontAwesomeIcon(file);
        }).open();
      })
    );
    const svgIconsHead = containerEl.createDiv({ cls: "zm-icons-grid-head zm-grid" });
    svgIconsHead.createSpan();
    svgIconsHead.createSpan({ text: "Name" });
    svgIconsHead.createSpan({ text: "Preview / color / link" });
    svgIconsHead.createSpan({ text: "Size" });
    const headSvgAX = svgIconsHead.createSpan({ cls: "zm-icohead" });
    const svgAxIco = headSvgAX.createSpan();
    (0, import_obsidian29.setIcon)(svgAxIco, "anchor");
    headSvgAX.appendText(" X");
    const headSvgAY = svgIconsHead.createSpan({ cls: "zm-icohead" });
    const svgAyIco = headSvgAY.createSpan();
    (0, import_obsidian29.setIcon)(svgAyIco, "anchor");
    headSvgAY.appendText(" Y");
    svgIconsHead.createSpan({ text: "Angle" });
    const headSvgTrash = svgIconsHead.createSpan();
    (0, import_obsidian29.setIcon)(headSvgTrash, "trash");
    const svgIconsGrid = containerEl.createDiv({ cls: "zm-icons-grid zm-grid" });
    new import_obsidian29.Setting(containerEl).setName("Image icons").setHeading();
    new import_obsidian29.Setting(containerEl).setName("Add new icon or sort the list").setDesc("Create a new image-based icon entry, or sort the image icon list alphabetically.").addButton(
      (b) => b.setButtonText("Sort a\u2192z").onClick(() => {
        var _a2;
        const icons = (_a2 = this.plugin.settings.icons) != null ? _a2 : [];
        if (icons.length === 0) return;
        const imgIcons = icons.filter((i) => !isSvgIcon(i));
        if (imgIcons.length <= 1) {
          new import_obsidian29.Notice("No image icons to sort.", 2e3);
          return;
        }
        const keyOf = (i) => {
          var _a3;
          return String((_a3 = i.key) != null ? _a3 : "").trim();
        };
        const sorted = [...imgIcons].sort(
          (a, b2) => keyOf(a).localeCompare(keyOf(b2), void 0, { sensitivity: "base", numeric: true })
        );
        let j = 0;
        const next = icons.map((ico) => isSvgIcon(ico) ? ico : sorted[j++]);
        this.plugin.settings.icons = next;
        void this.plugin.saveSettings().then(() => {
          renderIcons == null ? void 0 : renderIcons();
          new import_obsidian29.Notice(`Sorted ${sorted.length} image icons.`, 2e3);
        });
      })
    ).addButton(
      (b) => b.setButtonText("Add").onClick(() => {
        const idx = this.plugin.settings.icons.length + 1;
        this.plugin.settings.icons.unshift({
          key: `pin-${idx}`,
          pathOrDataUrl: "",
          size: 24,
          anchorX: 12,
          anchorY: 12,
          inCollections: true
        });
        void this.plugin.saveSettings();
        renderIcons == null ? void 0 : renderIcons();
      })
    );
    const imgIconsHead = containerEl.createDiv({ cls: "zm-icons-grid-head zm-grid zm-icons-grid-head--img" });
    imgIconsHead.createSpan();
    imgIconsHead.createSpan({ text: "Name" });
    if (this.plugin.settings.showImageIconPreviewInSettings) {
      imgIconsHead.createSpan();
    }
    imgIconsHead.createSpan({ text: "Path / data:URL + default link" });
    imgIconsHead.createSpan({ text: "Size" });
    const headImgAX = imgIconsHead.createSpan({ cls: "zm-icohead" });
    const axIco = headImgAX.createSpan();
    (0, import_obsidian29.setIcon)(axIco, "anchor");
    headImgAX.appendText(" X");
    const headImgAY = imgIconsHead.createSpan({ cls: "zm-icohead" });
    const ayIco = headImgAY.createSpan();
    (0, import_obsidian29.setIcon)(ayIco, "anchor");
    headImgAY.appendText(" Y");
    imgIconsHead.createSpan({ text: "Angle" });
    const headImgTrash = imgIconsHead.createSpan();
    (0, import_obsidian29.setIcon)(headImgTrash, "trash");
    const imgIconsGrid = containerEl.createDiv({ cls: "zm-icons-grid zm-grid zm-icons-grid--img" });
    let renderIcons;
    renderIcons = () => {
      var _a2, _b, _c, _d, _e, _f, _g;
      svgIconsGrid.empty();
      imgIconsGrid.empty();
      for (const icon of this.plugin.settings.icons) {
        if (isSvgIcon(icon)) {
          const row = svgIconsGrid.createDiv({ cls: "zm-row" });
          const enabled = row.createEl("input", { type: "checkbox" });
          enabled.addClass("zoommap-settings__icon-collections-toggle");
          enabled.checked = icon.inCollections !== false;
          enabled.onchange = () => {
            icon.inCollections = enabled.checked;
            void this.plugin.saveSettings();
          };
          const name = row.createEl("input", { type: "text" });
          name.classList.add("zm-name");
          name.value = icon.key;
          name.oninput = () => {
            icon.key = name.value.trim();
            void this.plugin.saveSettings();
          };
          const previewCell = row.createDiv({ cls: "zoommap-settings__preview-cell" });
          const img = previewCell.createEl("img");
          img.addClass("zoommap-settings__icon-preview");
          let src = (_a2 = icon.pathOrDataUrl) != null ? _a2 : "";
          if (typeof src === "string" && !src.startsWith("data:") && src) {
            const f = this.app.vault.getAbstractFileByPath(src);
            if (f instanceof import_obsidian29.TFile) {
              src = this.app.vault.getResourcePath(f);
            }
          }
          img.src = typeof src === "string" ? src : "";
          const applyRotationPreview = () => {
            var _a3;
            const deg = (_a3 = icon.rotationDeg) != null ? _a3 : 0;
            setCssProps2(img, {
              transform: deg ? `rotate(${deg}deg)` : null
            });
          };
          applyRotationPreview();
          const rawSrc = (_b = icon.pathOrDataUrl) != null ? _b : "";
          const isSvgData = typeof rawSrc === "string" && rawSrc.startsWith("data:image/svg+xml");
          let currentColor = "";
          if (isSvgData) {
            const c = this.getSvgColorFromDataUrl(rawSrc);
            if (c) currentColor = c;
          }
          const colorInput = previewCell.createEl("input", { type: "text" });
          colorInput.addClass("zoommap-settings__color-input");
          colorInput.placeholder = "Color";
          colorInput.value = currentColor;
          const colorPicker = previewCell.createEl("input", { type: "color" });
          colorPicker.addClass("zoommap-settings__color-picker");
          if (currentColor && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(currentColor)) {
            if (currentColor.length === 4) {
              const r = currentColor[1];
              const g = currentColor[2];
              const b = currentColor[3];
              colorPicker.value = `#${r}${r}${g}${g}${b}${b}`;
            } else {
              colorPicker.value = currentColor;
            }
          }
          const applyColor = (val) => {
            const c = val.trim();
            if (!c) return;
            void this.recolorIconSvg(icon, c).then(() => {
              var _a3;
              const updated = (_a3 = icon.pathOrDataUrl) != null ? _a3 : "";
              let out = updated;
              if (typeof out === "string" && !out.startsWith("data:") && out) {
                const f = this.app.vault.getAbstractFileByPath(out);
                if (f instanceof import_obsidian29.TFile) out = this.app.vault.getResourcePath(f);
              }
              img.src = typeof out === "string" ? out : "";
            });
          };
          colorInput.addEventListener("change", () => {
            const val = colorInput.value;
            applyColor(val);
            if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
              if (val.length === 4) {
                const r = val[1];
                const g = val[2];
                const b = val[3];
                colorPicker.value = `#${r}${r}${g}${g}${b}${b}`;
              } else {
                colorPicker.value = val;
              }
            }
          });
          colorPicker.addEventListener("input", () => {
            const hex = colorPicker.value;
            colorInput.value = hex;
            applyColor(hex);
          });
          const linkInput = previewCell.createEl("input", { type: "text" });
          linkInput.addClass("zoommap-settings__link-input--small");
          linkInput.placeholder = "Default link (optional)";
          linkInput.value = (_c = icon.defaultLink) != null ? _c : "";
          linkInput.oninput = () => {
            icon.defaultLink = linkInput.value.trim() || void 0;
            void this.plugin.saveSettings();
          };
          attachLinkAutocomplete(
            linkInput,
            () => {
              var _a3;
              return (_a3 = icon.defaultLink) != null ? _a3 : "";
            },
            (val) => {
              icon.defaultLink = val;
              linkInput.value = val;
              void this.plugin.saveSettings();
            }
          );
          const outlineBtn = previewCell.createEl("button", {
            attr: { title: "SVG outline\u2026" }
          });
          outlineBtn.classList.add("zm-icon-btn");
          (0, import_obsidian29.setIcon)(outlineBtn, "gear");
          outlineBtn.onclick = () => {
            new IconOutlineModal(this.app, this.plugin, icon, (newDataUrl) => {
              img.src = newDataUrl;
            }).open();
          };
          const size = row.createEl("input", { type: "number" });
          size.classList.add("zm-num");
          size.value = String(icon.size);
          size.oninput = () => {
            const n = Number(size.value);
            if (!Number.isNaN(n) && n > 0) {
              icon.size = n;
              void this.plugin.saveSettings();
            }
          };
          const ax = row.createEl("input", { type: "number" });
          ax.classList.add("zm-num");
          ax.value = String(icon.anchorX);
          ax.oninput = () => {
            const n = Number(ax.value);
            if (!Number.isNaN(n)) {
              icon.anchorX = n;
              void this.plugin.saveSettings();
            }
          };
          const ay = row.createEl("input", { type: "number" });
          ay.classList.add("zm-num");
          ay.value = String(icon.anchorY);
          ay.oninput = () => {
            const n = Number(ay.value);
            if (!Number.isNaN(n)) {
              icon.anchorY = n;
              void this.plugin.saveSettings();
            }
          };
          const angle = row.createEl("input", { type: "number" });
          angle.classList.add("zm-num");
          angle.value = String((_d = icon.rotationDeg) != null ? _d : 0);
          angle.oninput = () => {
            const n = Number(angle.value);
            if (!Number.isNaN(n)) {
              icon.rotationDeg = n || 0;
              void this.plugin.saveSettings();
              applyRotationPreview();
            }
          };
          const del = row.createEl("button", { attr: { title: "Delete" } });
          del.classList.add("zm-icon-btn");
          (0, import_obsidian29.setIcon)(del, "trash");
          del.onclick = () => {
            this.plugin.settings.icons = this.plugin.settings.icons.filter((i) => i !== icon);
            void this.plugin.saveSettings();
            renderIcons();
          };
        } else {
          const row = imgIconsGrid.createDiv({ cls: "zm-row" });
          const enabled = row.createEl("input", { type: "checkbox" });
          enabled.addClass("zoommap-settings__icon-collections-toggle");
          enabled.checked = icon.inCollections !== false;
          enabled.onchange = () => {
            icon.inCollections = enabled.checked;
            void this.plugin.saveSettings();
          };
          const name = row.createEl("input", { type: "text" });
          name.classList.add("zm-name");
          name.value = icon.key;
          name.oninput = () => {
            icon.key = name.value.trim();
            void this.plugin.saveSettings();
          };
          const showPreview = !!this.plugin.settings.showImageIconPreviewInSettings;
          let previewImg = null;
          const refreshPreview = () => {
            var _a3;
            if (!previewImg) return;
            let src = ((_a3 = icon.pathOrDataUrl) != null ? _a3 : "").trim();
            if (!src) {
              previewImg.src = "";
              return;
            }
            if (src.startsWith("data:")) {
              previewImg.src = src;
              return;
            }
            const f = this.app.vault.getAbstractFileByPath(src);
            if (f instanceof import_obsidian29.TFile) {
              previewImg.src = this.app.vault.getResourcePath(f);
              return;
            }
            previewImg.src = src;
          };
          if (showPreview) {
            previewImg = row.createEl("img", { cls: "zoommap-settings__icon-preview zoommap-settings__icon-preview--img" });
            refreshPreview();
          }
          const pathWrap = row.createDiv({ cls: "zm-path-wrap" });
          const path = pathWrap.createEl("input", { type: "text" });
          path.addClass("zoommap-settings__icon-path-input");
          path.value = (_e = icon.pathOrDataUrl) != null ? _e : "";
          path.oninput = () => {
            icon.pathOrDataUrl = path.value.trim();
            void this.plugin.saveSettings();
            refreshPreview();
          };
          const pick = pathWrap.createEl("button", { attr: { title: "Choose file\u2026" } });
          pick.classList.add("zm-icon-btn");
          (0, import_obsidian29.setIcon)(pick, "folder-open");
          pick.onclick = () => {
            new ImageFileSuggestModal(this.app, (file) => {
              icon.pathOrDataUrl = file.path;
              void this.plugin.saveSettings();
              path.value = file.path;
              refreshPreview();
              renderIcons();
            }).open();
          };
          const linkInput = pathWrap.createEl("input", { type: "text" });
          linkInput.addClass("zoommap-settings__link-input--medium");
          linkInput.placeholder = "Default link (optional)";
          linkInput.value = (_f = icon.defaultLink) != null ? _f : "";
          linkInput.oninput = () => {
            icon.defaultLink = linkInput.value.trim() || void 0;
            void this.plugin.saveSettings();
          };
          attachLinkAutocomplete(
            linkInput,
            () => {
              var _a3;
              return (_a3 = icon.defaultLink) != null ? _a3 : "";
            },
            (val) => {
              icon.defaultLink = val;
              linkInput.value = val;
              void this.plugin.saveSettings();
            }
          );
          const size = row.createEl("input", { type: "number" });
          size.classList.add("zm-num");
          size.value = String(icon.size);
          size.oninput = () => {
            const n = Number(size.value);
            if (!Number.isNaN(n) && n > 0) {
              icon.size = n;
              void this.plugin.saveSettings();
            }
          };
          const ax = row.createEl("input", { type: "number" });
          ax.classList.add("zm-num");
          ax.value = String(icon.anchorX);
          ax.oninput = () => {
            const n = Number(ax.value);
            if (!Number.isNaN(n)) {
              icon.anchorX = n;
              void this.plugin.saveSettings();
            }
          };
          const ay = row.createEl("input", { type: "number" });
          ay.classList.add("zm-num");
          ay.value = String(icon.anchorY);
          ay.oninput = () => {
            const n = Number(ay.value);
            if (!Number.isNaN(n)) {
              icon.anchorY = n;
              void this.plugin.saveSettings();
            }
          };
          const angle = row.createEl("input", { type: "number" });
          angle.classList.add("zm-num");
          angle.value = String((_g = icon.rotationDeg) != null ? _g : 0);
          angle.oninput = () => {
            const n = Number(angle.value);
            if (!Number.isNaN(n)) {
              icon.rotationDeg = n || 0;
              void this.plugin.saveSettings();
            }
          };
          const del = row.createEl("button", { attr: { title: "Delete" } });
          del.classList.add("zm-icon-btn");
          (0, import_obsidian29.setIcon)(del, "trash");
          del.onclick = () => {
            this.plugin.settings.icons = this.plugin.settings.icons.filter((i) => i !== icon);
            void this.plugin.saveSettings();
            renderIcons();
          };
        }
      }
    };
    renderIcons();
  }
};
/*! Bundled license information:

jszip/dist/jszip.min.js:
  (*!
  
  JSZip v3.10.1 - A JavaScript class for generating and reading zip files
  <http://stuartk.com/jszip>
  
  (c) 2009-2016 Stuart Knightley <stuart [at] stuartk.com>
  Dual licenced under the MIT license or GPLv3. See https://raw.github.com/Stuk/jszip/main/LICENSE.markdown.
  
  JSZip uses the library pako released under the MIT license :
  https://github.com/nodeca/pako/blob/main/LICENSE
  *)
*/
