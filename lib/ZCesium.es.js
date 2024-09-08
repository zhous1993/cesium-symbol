var Y = Object.defineProperty;
var V = (r, i, t) => i in r ? Y(r, i, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[i] = t;
var l = (r, i, t) => V(r, typeof i != "symbol" ? i + "" : i, t);
import "cesium";
class X {
  constructor() {
    l(this, "listeners");
    this.listeners = /* @__PURE__ */ new Map([
      ["drawStart", /* @__PURE__ */ new Set()],
      ["drawUpdate", /* @__PURE__ */ new Set()],
      ["drawEnd", /* @__PURE__ */ new Set()],
      ["editStart", /* @__PURE__ */ new Set()],
      ["editEnd", /* @__PURE__ */ new Set()]
    ]);
  }
  on(i, t) {
    if (!this.listeners.has(i)) {
      console.warn("Event binding must be one of 'drawStart', 'drawUpdate', or 'drawEnd'.");
      return;
    }
    this.listeners.get(i).add(t);
  }
  off(i, t) {
    this.listeners.has(i) && this.listeners.get(i).delete(t);
  }
  dispatchEvent(i, t) {
    this.listeners.has(i) && this.listeners.get(i).forEach((e) => {
      e(t);
    });
  }
}
const U = 100, O = 1e-4, k = (r, i) => [(r[0] + i[0]) / 2, (r[1] + i[1]) / 2], D = (r, i) => {
  r && (r.scene.screenSpaceCameraController.enableRotate = i);
}, v = (r, i) => Math.sqrt(Math.pow(r[0] - i[0], 2) + Math.pow(r[1] - i[1], 2)), R = (r, i) => {
  let t, e = Math.asin(Math.abs(i[1] - r[1]) / v(r, i));
  return i[1] >= r[1] && i[0] >= r[0] ? t = e + Math.PI : i[1] >= r[1] && i[0] < r[0] ? t = Math.PI * 2 - e : i[1] < r[1] && i[0] < r[0] ? t = e : i[1] < r[1] && i[0] >= r[0] && (t = Math.PI - e), t;
}, A = (r, i, t) => {
  const e = R(i, r) - R(i, t);
  return e < 0 ? e + Math.PI * 2 : e;
}, I = (r, i, t) => (t[1] - r[1]) * (i[0] - r[0]) > (i[1] - r[1]) * (t[0] - r[0]), p = (r, i, t, e, s) => {
  let n = R(r, i), o = s ? n + t : n - t, a = e * Math.cos(o), h = e * Math.sin(o);
  return [i[0] + a, i[1] + h];
}, b = (r) => {
  let i = 0;
  return r && Array.isArray(r) && r.length > 0 && r.forEach((t, e) => {
    e < r.length - 1 && (i += v(t, r[e + 1]));
  }), i;
}, x = (r, i, t) => {
  let e = r[0] - i[0], s = r[1] - i[1], n = Math.sqrt(e * e + s * s);
  e /= n, s /= n;
  let o = t[0] - i[0], a = t[1] - i[1], h = Math.sqrt(o * o + a * a);
  o /= h, a /= h;
  let c = e + o, g = s + a;
  return [c, g];
}, H = (r) => {
  let i = 1;
  switch (r) {
    case r <= 1:
      i = 1;
      break;
    case r === 2:
      i = 2;
      break;
    case r === 3:
      i = 6;
      break;
    case r === 24:
      i = 24;
      break;
    case r === 5:
      i = 120;
      break;
    default:
      for (let t = 1; t <= r; t++)
        i *= t;
      break;
  }
  return i;
}, j = (r, i) => H(r) / (H(i) * H(r - i)), G = (r) => {
  if (r.length <= 2)
    return r;
  {
    let i = [], t = r.length - 1;
    for (let e = 0; e <= 1; e += 0.01) {
      let [s, n] = [0, 0];
      for (let o = 0; o <= t; o++) {
        let a = j(t, o), h = Math.pow(e, o), c = Math.pow(1 - e, t - o);
        s += a * h * c * r[o][0], n += a * h * c * r[o][1];
      }
      i.push([s, n]);
    }
    return i.push(r[t]), i;
  }
}, M = (r) => b(r) ** 0.99, _ = (r, i, t, e) => {
  let s = x(i, t, e), [n, o, a, h, c] = [null, null, null, null, null], g = Math.sqrt(s[0] * s[0] + s[1] * s[1]), d = s[0] / g, P = s[1] / g, f = v(i, t), u = v(t, e);
  return g > O ? I(i, t, e) ? (a = r * f, h = t[0] - a * P, c = t[1] + a * d, n = [h, c], a = r * u, h = t[0] + a * P, c = t[1] - a * d, o = [h, c]) : (a = r * f, h = t[0] + a * P, c = t[1] - a * d, n = [h, c], a = r * u, h = t[0] - a * P, c = t[1] + a * d, o = [h, c]) : (h = t[0] + r * (i[0] - t[0]), c = t[1] + r * (i[1] - t[1]), n = [h, c], h = t[0] + r * (e[0] - t[0]), c = t[1] + r * (e[1] - t[1]), o = [h, c]), [n, o];
}, q = (r, i) => {
  let t = 0;
  return r === 0 ? t = (i - 1) ** 2 / 2 : r === 1 ? t = (-2 * i ** 2 + 2 * i + 1) / 2 : r === 2 && (t = i ** 2 / 2), t;
}, W = (r) => {
  if (r.length <= 2)
    return r;
  const [i, t] = [2, []], e = r.length - i - 1;
  t.push(r[0]);
  for (let s = 0; s <= e; s++)
    for (let n = 0; n <= 1; n += 0.05) {
      let [o, a] = [0, 0];
      for (let h = 0; h <= i; h++) {
        const c = q(h, n);
        o += c * r[s + h][0], a += c * r[s + h][1];
      }
      t.push([o, a]);
    }
  return t.push(r[r.length - 1]), t;
}, J = (r, i) => {
  let [t, e, s, n, o] = [r[0], r[1], r[2], null, null];
  const h = _(0, t, e, s)[0], c = x(t, e, s);
  if (Math.sqrt(c[0] * c[0] + c[1] * c[1]) > O) {
    const d = k(t, e), P = t[0] - d[0], f = t[1] - d[1], m = 2 / v(t, e), w = -m * f, y = m * P, E = w * w - y * y, C = 2 * w * y, S = y * y - w * w, T = h[0] - d[0], L = h[1] - d[1];
    n = d[0] + E * T + C * L, o = d[1] + C * T + S * L;
  } else
    n = t[0] + i * (e[0] - t[0]), o = t[1] + i * (e[1] - t[1]);
  return [n, o];
}, K = (r, i) => {
  const t = r.length, e = r[t - 3], s = r[t - 2], n = r[t - 1], a = _(0, e, s, n)[1], h = x(e, s, n), c = Math.sqrt(h[0] * h[0] + h[1] * h[1]);
  let [g, d] = [null, null];
  if (c > O) {
    const P = k(s, n), f = n[0] - P[0], u = n[1] - P[1], w = 2 / v(s, n), y = -w * u, E = w * f, C = y * y - E * E, S = 2 * y * E, T = E * E - y * y, L = a[0] - P[0], B = a[1] - P[1];
    g = P[0] + C * L + S * B, d = P[1] + S * L + T * B;
  } else
    g = n[0] + i * (s[0] - n[0]), d = n[1] + i * (s[1] - n[1]);
  return [g, d];
}, Q = (r, i, t, e, s) => {
  r = Math.max(Math.min(r, 1), 0);
  const [n, o] = [1 - r, r * r], a = o * r, h = n * n, c = h * n, g = c * i[0] + 3 * h * r * t[0] + 3 * n * o * e[0] + a * s[0], d = c * i[1] + 3 * h * r * t[1] + 3 * n * o * e[1] + a * s[1];
  return [g, d];
}, Z = (r, i) => {
  const t = J(i, r);
  let [e, s, n, o, a] = [null, null, null, [t], []];
  for (let c = 0; c < i.length - 2; c++) {
    [e, s, n] = [i[c], i[c + 1], i[c + 2]];
    const g = _(r, e, s, n);
    o = o.concat(g);
  }
  const h = K(i, r);
  h && o.push(h);
  for (let c = 0; c < i.length - 1; c++) {
    e = i[c], s = i[c + 1], a.push(e);
    for (let g = 0; g < U; g++) {
      const d = Q(g / U, e, o[c * 2], o[c * 2 + 1], s);
      a.push(d);
    }
    a.push(s);
  }
  return a;
};
function $(r) {
  return JSON.parse(JSON.stringify(r));
}
class F {
  constructor(i, t, e) {
    l(this, "cesium");
    l(this, "state", "drawing");
    l(this, "category");
    l(this, "viewer");
    l(this, "handler", null);
    l(this, "dragEventHandler", null);
    l(this, "mainEntity", null);
    l(this, "lineEntity", null);
    l(this, "outlineEntity", null);
    l(this, "tempLineEntity", null);
    l(this, "centerPointEntity", null);
    l(this, "rotatePointEntity", null);
    l(this, "rotateLineEntity", null);
    l(this, "rotateHandler", null);
    l(this, "positions", []);
    l(this, "controlPoints", []);
    l(this, "points", []);
    l(this, "controlPointsEventHandler", null);
    l(this, "entityId", "");
    l(this, "style");
    l(this, "styleCache");
    l(this, "minPointsForShape", 0);
    l(this, "eventDispatcher");
    l(this, "freehand");
    this.cesium = i, this.viewer = t, this.category = this.getCategory(), this.mergeStyle(e), this.cartesianToLnglat = this.cartesianToLnglat.bind(this), this.pixelToCartesian = this.pixelToCartesian.bind(this), this.eventDispatcher = new X(), t.trackedEntity = void 0, this.onClick();
  }
  get centerPosition() {
    return this.cesium.BoundingSphere.fromPoints(this.points).center;
  }
  get rotatePosition() {
    return this.cesium.Cartesian3.midpoint(this.centerPosition, this.getPoints()[0], new this.cesium.Cartesian3());
  }
  setState(i) {
    this.state = i;
  }
  getState() {
    return this.state;
  }
  setGeometryPoints(i) {
    this.positions = i;
  }
  mergeStyle(i) {
    this.category === "polygon" ? this.style = Object.assign(
      {
        material: this.cesium.Color.fromCssColorString("rgba(109,207,201,0.8)"),
        outlineMaterial: this.cesium.Color.fromCssColorString("#0000ff"),
        outlineWidth: 2
      },
      i
    ) : this.category === "polyline" ? this.style = Object.assign(
      {
        material: this.cesium.Color.fromCssColorString("#0000ff"),
        lineWidth: 2
      },
      i
    ) : this.category === "point" && (this.style = Object.assign(
      {
        material: new this.cesium.Color(),
        size: 1
      },
      i
    )), this.styleCache = $(this.style);
  }
  updateStyle(i) {
    this.mergeStyle(i), this.category === "polygon" && (this.mainEntity && (this.mainEntity.polygon.material = this.style.material), this.lineEntity && (this.lineEntity.polyline.material = this.style.material), this.outlineEntity && (this.outlineEntity.polygon.material = this.style.outlineMaterial), this.outlineEntity && (this.outlineEntity.polygon.outlineWidth = this.style.outlineWidth)), this.category === "polyline" && (this.lineEntity && (this.lineEntity.polyline.material = this.style.material), this.lineEntity && (this.lineEntity.polyline.width = this.style.lineWidth)), this.category === "point" && this.lineEntity && (this.lineEntity.billboard.scale = this.style.size);
  }
  onClick() {
    this.handler = new this.cesium.ScreenSpaceEventHandler(this.viewer.canvas), this.handler.setInputAction((i) => {
      const t = this.viewer.scene.pick(i.position), e = this.cesium.defined(t) && t.id instanceof this.cesium.Entity, s = this.mainEntity;
      if (this.state === "drawing") {
        const n = this.pixelToCartesian(i.position), o = this.getPoints();
        if (!n || !this.freehand && o.length > 0 && !this.checkDistance(n, o[o.length - 1]))
          return;
        this.addPoint(n), this.getPoints().length === 1 && this.eventDispatcher.dispatchEvent("drawStart"), this.eventDispatcher.dispatchEvent("drawUpdate", n);
      } else this.state === "edit" ? (!e || s.id !== t.id.id) && (this.setState("static"), this.removeControlPoints(), this.disableDrag(), this.eventDispatcher.dispatchEvent("editEnd", this.getPoints())) : this.state === "static" && e && s.id === t.id.id && this.cesium.defined(this.mainEntity) && (this.setState("edit"), this.addControlPoints(), this.draggable(), this.eventDispatcher.dispatchEvent("editStart"));
    }, this.cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
  onMouseMove() {
    var i;
    (i = this.handler) == null || i.setInputAction((t) => {
      const e = this.getPoints(), s = this.pixelToCartesian(t.endPosition);
      s && this.checkDistance(s, e[e.length - 1]) && this.updateMovingPoint(s, e.length);
    }, this.cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }
  onDoubleClick() {
    var i;
    (i = this.handler) == null || i.setInputAction(() => {
      this.state === "drawing" && this.finishDrawing();
    }, this.cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  }
  finishDrawing() {
    this.category === "polygon" && this.lineEntity && this.viewer.entities.remove(this.lineEntity), this.removeMoveListener(), this.setState("edit"), this.addControlPoints(), this.draggable();
    const i = this.mainEntity;
    this.entityId = i.id, this.eventDispatcher.dispatchEvent("drawEnd", this.getPoints());
  }
  addControlPoints() {
    const i = this.getPoints();
    this.category !== "point" && (this.addCenterPoint(), this.addRotatePoint(), this.controlPoints = i.map((n) => this.viewer.entities.add({
      position: n,
      point: {
        pixelSize: 10,
        heightReference: this.cesium.HeightReference.CLAMP_TO_GROUND,
        color: this.cesium.Color.BLUE
      }
    })));
    let t = !1, e = null, s;
    this.controlPointsEventHandler = new this.cesium.ScreenSpaceEventHandler(this.viewer.canvas), this.controlPointsEventHandler.setInputAction((n) => {
      var a;
      const o = this.viewer.scene.pick(n.position);
      if (this.cesium.defined(o)) {
        for (let h = 0; h < this.controlPoints.length; h++)
          if (o.id.id === this.controlPoints[h].id) {
            t = !0, e = this.controlPoints[h], s = (a = e.position) == null ? void 0 : a.getValue(this.cesium.JulianDate.now()), e.index = h;
            break;
          }
        D(this.viewer, !1);
      }
    }, this.cesium.ScreenSpaceEventType.LEFT_DOWN), this.controlPointsEventHandler.setInputAction((n) => {
      if (t && e) {
        const o = this.viewer.camera.pickEllipsoid(n.endPosition, this.viewer.scene.globe.ellipsoid);
        o && (e.position.setValue(o), this.updateDraggingPoint(o, e.index));
      }
    }, this.cesium.ScreenSpaceEventType.MOUSE_MOVE), this.controlPointsEventHandler.setInputAction(() => {
      e && !this.cesium.Cartesian3.equals(s, e.position._value) && (this.addCenterPoint(), this.addRotatePoint(), this.eventDispatcher.dispatchEvent("drawUpdate", e.position._value)), t = !1, e = null, D(this.viewer, !0);
    }, this.cesium.ScreenSpaceEventType.LEFT_UP);
  }
  addCenterPoint() {
    this.centerPointEntity ? this.centerPointEntity.position = new this.cesium.ConstantPositionProperty(this.centerPosition) : this.centerPointEntity = this.viewer.entities.add({
      position: this.centerPosition,
      point: {
        pixelSize: 10,
        heightReference: this.cesium.HeightReference.CLAMP_TO_GROUND,
        color: this.cesium.Color.RED
      }
    });
  }
  addRotatePoint() {
    if (this.rotatePointEntity)
      this.rotatePointEntity.position = new this.cesium.ConstantPositionProperty(this.rotatePosition);
    else {
      this.rotatePointEntity = this.viewer.entities.add({
        position: this.rotatePosition,
        point: {
          pixelSize: 10,
          heightReference: this.cesium.HeightReference.CLAMP_TO_GROUND,
          color: this.cesium.Color.YELLOW
        }
      }), this.rotateHandler = new this.cesium.ScreenSpaceEventHandler(this.viewer.canvas);
      let i = !1;
      this.rotateHandler.setInputAction((t) => {
        const e = this.viewer.scene.pick(t.position);
        this.cesium.defined(e) && e.id.id === this.rotatePointEntity.id && (i = !0, this.addRotateLine(), D(this.viewer, !1));
      }, this.cesium.ScreenSpaceEventType.LEFT_DOWN), this.rotateHandler.setInputAction((t) => {
        if (i && this.rotatePointEntity) {
          const e = this.viewer.camera.pickEllipsoid(t.endPosition, this.viewer.scene.globe.ellipsoid);
          if (e) {
            const s = this.cartesianToLnglat(e), n = this.cartesianToLnglat(this.centerPosition), o = this.cartesianToLnglat(this.rotatePosition), a = I(n, o, s), h = a ? A(s, n, o) : A(o, n, s);
            this.controlPoints.forEach((c, g) => {
              var y;
              const d = (y = c.position) == null ? void 0 : y.getValue(this.cesium.JulianDate.now()), P = this.cartesianToLnglat(d), f = v(P, n), u = p(P, n, h, f, a), m = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(d).height, w = this.cesium.Cartesian3.fromDegrees(...u, m);
              c.position = new this.cesium.ConstantPositionProperty(w), this.updateDraggingPoint(w, g);
            }), this.addRotatePoint();
          }
        }
      }, this.cesium.ScreenSpaceEventType.MOUSE_MOVE), this.rotateHandler.setInputAction(() => {
        i && (this.addCenterPoint(), this.addRotatePoint()), this.viewer.entities.remove(this.rotateLineEntity), this.rotateLineEntity = null, i = !1, console.log("leftUp"), D(this.viewer, !0), this.eventDispatcher.dispatchEvent("drawUpdate");
      }, this.cesium.ScreenSpaceEventType.LEFT_UP);
    }
  }
  addRotateLine() {
    const i = new this.cesium.CallbackProperty(() => [this.centerPosition, this.rotatePosition], !1);
    this.rotateLineEntity || (this.rotateLineEntity = this.viewer.entities.add({
      polyline: {
        positions: i,
        clampToGround: !0,
        width: 2,
        material: new this.cesium.PolylineDashMaterialProperty({
          color: this.cesium.Color.YELLOW
        })
      }
    }));
  }
  draggable() {
    let i = !1, t;
    this.dragEventHandler = new this.cesium.ScreenSpaceEventHandler(this.viewer.canvas), this.dragEventHandler.setInputAction((e) => {
      const s = this.viewer.scene.camera.getPickRay(e.position);
      if (s) {
        const n = this.viewer.scene.globe.pick(s, this.viewer.scene), o = this.viewer.scene.pick(e.position);
        if (this.cesium.defined(o) && o.id instanceof this.cesium.Entity) {
          const a = o.id;
          this.isCurrentEntity(a.id) && (i = !0, t = n, this.viewer.scene.screenSpaceCameraController.enableRotate = !1);
        }
      }
    }, this.cesium.ScreenSpaceEventType.LEFT_DOWN), this.dragEventHandler.setInputAction((e) => {
      if (i && t) {
        const s = this.pixelToCartesian(e.endPosition);
        if (s) {
          const n = this.cesium.Cartesian3.subtract(s, t, new this.cesium.Cartesian3()), o = this.positions.map((a) => this.cesium.Cartesian3.add(a, n, new this.cesium.Cartesian3()));
          this.points = this.points.map((a) => this.cesium.Cartesian3.add(a, n, new this.cesium.Cartesian3())), this.controlPoints.map((a) => {
            var g;
            const h = (g = a.position) == null ? void 0 : g.getValue(this.cesium.JulianDate.now()), c = this.cesium.Cartesian3.add(h, n, new this.cesium.Cartesian3());
            a.position = new this.cesium.ConstantPositionProperty(c);
          }), this.setGeometryPoints(o), this.category !== "point" ? (this.addCenterPoint(), this.addRotatePoint()) : this.updatePoint(), t = s;
        }
      } else if (this.viewer.scene.camera.getPickRay(e.endPosition)) {
        const n = this.viewer.scene.pick(e.endPosition);
        if (this.cesium.defined(n) && n.id instanceof this.cesium.Entity) {
          const o = n.id;
          this.isCurrentEntity(o.id) ? this.viewer.scene.canvas.style.cursor = "move" : this.viewer.scene.canvas.style.cursor = "default";
        } else
          this.viewer.scene.canvas.style.cursor = "default";
      }
    }, this.cesium.ScreenSpaceEventType.MOUSE_MOVE), this.dragEventHandler.setInputAction(() => {
      i = !1, t = void 0, this.viewer.scene.screenSpaceCameraController.enableRotate = !0;
    }, this.cesium.ScreenSpaceEventType.LEFT_UP);
  }
  disableDrag() {
    var i, t, e;
    (i = this.dragEventHandler) == null || i.removeInputAction(this.cesium.ScreenSpaceEventType.LEFT_DOWN), (t = this.dragEventHandler) == null || t.removeInputAction(this.cesium.ScreenSpaceEventType.MOUSE_MOVE), (e = this.dragEventHandler) == null || e.removeInputAction(this.cesium.ScreenSpaceEventType.LEFT_UP);
  }
  getCategory() {
    return "polygon";
  }
  cartesianToLnglat(i) {
    const t = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(i), e = this.cesium.Math.toDegrees(t.latitude);
    return [this.cesium.Math.toDegrees(t.longitude), e];
  }
  pixelToCartesian(i) {
    const t = this.viewer.camera.getPickRay(i);
    return this.viewer.scene.globe.pick(t, this.viewer.scene);
  }
  checkDistance(i, t) {
    return this.cesium.Cartesian3.distance(i, t) > 10;
  }
  removeClickListener() {
    var i;
    (i = this.handler) == null || i.removeInputAction(this.cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
  removeMoveListener() {
    var i;
    (i = this.handler) == null || i.removeInputAction(this.cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }
  removeDoubleClickListener() {
    var i;
    (i = this.handler) == null || i.removeInputAction(this.cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  }
  removeControlPoints() {
    var i, t, e, s, n;
    this.controlPoints.length > 0 && (this.controlPoints.forEach((o) => {
      this.viewer.entities.remove(o);
    }), this.centerPointEntity && (this.viewer.entities.remove(this.centerPointEntity), this.centerPointEntity = null), this.rotatePointEntity && (this.viewer.entities.remove(this.rotatePointEntity), this.rotatePointEntity = null, (i = this.rotateHandler) == null || i.destroy(), this.rotateHandler = null), this.rotateLineEntity && (this.viewer.entities.remove(this.rotateLineEntity), this.rotateLineEntity = null), (t = this.controlPointsEventHandler) == null || t.removeInputAction(this.cesium.ScreenSpaceEventType.LEFT_DOWN), (e = this.controlPointsEventHandler) == null || e.removeInputAction(this.cesium.ScreenSpaceEventType.MOUSE_MOVE), (s = this.controlPointsEventHandler) == null || s.removeInputAction(this.cesium.ScreenSpaceEventType.LEFT_UP), (n = this.controlPointsEventHandler) == null || n.destroy(), this.controlPointsEventHandler = null);
  }
  remove() {
    var i;
    this.category === "polygon" ? (this.viewer.entities.remove(this.mainEntity), this.viewer.entities.remove(this.outlineEntity), this.mainEntity = null, this.outlineEntity = null, this.lineEntity = null) : this.category === "polyline" && this.viewer.entities.remove(this.lineEntity), this.removeClickListener(), this.removeMoveListener(), this.removeDoubleClickListener(), this.removeControlPoints(), (i = this.handler) == null || i.destroy(), this.handler = null;
  }
  drawPolygon() {
    const i = () => new this.cesium.PolygonHierarchy(this.positions);
    if (!this.mainEntity) {
      const t = this.style;
      this.mainEntity = this.viewer.entities.add({
        polygon: new this.cesium.PolygonGraphics({
          hierarchy: new this.cesium.CallbackProperty(i, !1),
          show: !0,
          material: t.material
        })
      }), this.outlineEntity = this.viewer.entities.add({
        polyline: {
          positions: new this.cesium.CallbackProperty(() => [...this.positions, this.positions[0]], !1),
          width: t.borderWidth,
          material: t.outlineMaterial,
          clampToGround: !0
        }
      });
    }
  }
  drawLine() {
    if (!this.lineEntity) {
      const i = this.style;
      this.lineEntity = this.addLineEntity(i);
    }
  }
  addTempLine() {
    if (!this.tempLineEntity) {
      const i = this.style, t = {
        material: i.outlineMaterial,
        lineWidth: i.borderWidth
      };
      this.tempLineEntity = this.addLineEntity(t);
    }
  }
  addLineEntity(i) {
    return this.viewer.entities.add({
      polyline: {
        positions: new this.cesium.CallbackProperty(() => this.positions, !1),
        width: i.width,
        material: i.material,
        clampToGround: !0
      }
    });
  }
  removeTempLine() {
    this.tempLineEntity && this.viewer.entities.remove(this.tempLineEntity);
  }
  on(i, t) {
    this.eventDispatcher.on(i, t);
  }
  off(i, t) {
    this.eventDispatcher.off(i, t);
  }
  isCurrentEntity(i) {
    return this.entityId === i;
  }
  //@ts-ignore
  addPoint(i) {
  }
  getPoints() {
    return [new this.cesium.Cartesian3()];
  }
  getStyle() {
    return this.style;
  }
  //@ts-ignore
  updateMovingPoint(i, t) {
  }
  //@ts-ignore
  updateDraggingPoint(i, t) {
  }
  createGraphic(i) {
    return i;
  }
  updatePoint() {
  }
}
class tt extends F {
  constructor(t, e, s) {
    super(t, e, s);
    l(this, "points", []);
    l(this, "arrowLengthScale", 5);
    l(this, "maxArrowLength", 2);
    l(this, "tailWidthFactor");
    l(this, "neckWidthFactor");
    l(this, "headWidthFactor");
    l(this, "headAngle");
    l(this, "neckAngle");
    l(this, "minPointsForShape");
    this.cesium = t, this.tailWidthFactor = 0.1, this.neckWidthFactor = 0.2, this.headWidthFactor = 0.25, this.headAngle = Math.PI / 8.5, this.neckAngle = Math.PI / 13, this.minPointsForShape = 2, this.setState("drawing");
  }
  getCategory() {
    return "polygon";
  }
  addPoint(t) {
    if (this.points.length < 2 && (this.points.push(t), this.onMouseMove()), this.points.length === 2) {
      const e = this.createGraphic(this.points);
      this.setGeometryPoints(e), this.drawPolygon(), this.finishDrawing();
    }
  }
  updateMovingPoint(t) {
    const e = [...this.points, t], s = this.createGraphic(e);
    this.setGeometryPoints(s), this.drawPolygon();
  }
  updateDraggingPoint(t, e) {
    this.points[e] = t;
    const s = this.createGraphic(this.points);
    this.setGeometryPoints(s), this.drawPolygon();
  }
  createGraphic(t) {
    const [e, s] = t.map(this.cartesianToLnglat), n = M([e, s]), o = n * this.tailWidthFactor, a = n * this.neckWidthFactor, h = n * this.headWidthFactor, c = p(s, e, Math.PI / 2, o, !0), g = p(s, e, Math.PI / 2, o, !1), d = p(e, s, this.headAngle, h, !1), P = p(e, s, this.headAngle, h, !0), f = p(e, s, this.neckAngle, a, !1), u = p(e, s, this.neckAngle, a, !0), m = [...c, ...f, ...d, ...s, ...P, ...u, ...g, ...e];
    return this.cesium.Cartesian3.fromDegreesArray(m);
  }
  getPoints() {
    return this.points;
  }
}
class et extends F {
  constructor(t, e, s) {
    super(t, e, s);
    l(this, "points", []);
    l(this, "arrowLengthScale", 5);
    l(this, "maxArrowLength", 2);
    l(this, "neckWidthFactor");
    l(this, "headWidthFactor");
    l(this, "headHeightFactor");
    l(this, "neckHeightFactor");
    l(this, "connPoint");
    l(this, "tempPoint4");
    l(this, "minPointsForShape");
    l(this, "llBodyPnts", []);
    l(this, "rrBodyPnts", []);
    l(this, "curveControlPointLeft", null);
    l(this, "curveControlPointRight", null);
    l(this, "isClockWise", !1);
    this.cesium = t, this.headHeightFactor = 0.25, this.headWidthFactor = 0.3, this.neckHeightFactor = 0.85, this.neckWidthFactor = 0.15, this.connPoint = [0, 0], this.tempPoint4 = [0, 0], this.minPointsForShape = 4, this.setState("drawing");
  }
  getCategory() {
    return "polygon";
  }
  addPoint(t) {
    this.points.push(t), this.points.length < 2 ? this.onMouseMove() : this.points.length === 2 ? (this.setGeometryPoints(this.points), this.drawPolygon()) : this.points.length === 3 ? this.lineEntity && this.viewer.entities.remove(this.lineEntity) : this.finishDrawing();
  }
  finishDrawing() {
    this.curveControlPointLeft = this.cesium.Cartesian3.fromDegrees(this.llBodyPnts[2][0], this.llBodyPnts[2][1]), this.curveControlPointRight = this.cesium.Cartesian3.fromDegrees(this.rrBodyPnts[1][0], this.rrBodyPnts[1][1]), super.finishDrawing();
  }
  updateMovingPoint(t) {
    const e = [...this.points, t];
    if (this.setGeometryPoints(e), e.length === 2)
      this.addTempLine();
    else if (e.length > 2) {
      this.removeTempLine();
      const s = this.createGraphic(e);
      this.setGeometryPoints(s), this.drawPolygon();
    }
  }
  updateDraggingPoint(t, e) {
    this.points[e] = t;
    const s = this.createGraphic(this.points);
    this.setGeometryPoints(s), this.drawPolygon();
  }
  createGraphic(t) {
    const e = t.map((L) => this.cartesianToLnglat(L)), [s, n, o] = [e[0], e[1], e[2]], a = e.length;
    a === 3 ? (this.tempPoint4 = this.getTempPoint4(s, n, o), this.connPoint = k(s, n)) : a === 4 ? (this.tempPoint4 = e[3], this.connPoint = k(s, n)) : (this.tempPoint4 = e[3], this.connPoint = e[4]);
    let h, c;
    this.isClockWise = I(s, n, o), this.isClockWise ? (h = this.getArrowPoints(s, this.connPoint, this.tempPoint4, !1), c = this.getArrowPoints(this.connPoint, n, o, !0)) : (h = this.getArrowPoints(n, this.connPoint, o, !1), c = this.getArrowPoints(this.connPoint, s, this.tempPoint4, !0));
    const g = h.length, d = (g - 5) / 2, P = h.slice(0, d), f = h.slice(d, d + 5);
    let u = h.slice(d + 5, g);
    this.llBodyPnts = P;
    let m = c.slice(0, d);
    const w = c.slice(d, d + 5), y = c.slice(d + 5, g);
    this.rrBodyPnts = y, m = G(m);
    const E = G(y.concat(P.slice(1)));
    u = G(u);
    const C = m.concat(w, E, f, u), S = [].concat(...C);
    return this.cesium.Cartesian3.fromDegreesArray(S);
  }
  getTempPoint4(t, e, s) {
    const n = k(t, e), o = v(n, s), a = A(t, n, s);
    let h = [0, 0], c, g, d;
    return a < Math.PI / 2 ? (c = o * Math.sin(a), g = o * Math.cos(a), d = p(t, n, Math.PI / 2, c, !1), h = p(n, d, Math.PI / 2, g, !0)) : a >= Math.PI / 2 && a < Math.PI ? (c = o * Math.sin(Math.PI - a), g = o * Math.cos(Math.PI - a), d = p(t, n, Math.PI / 2, c, !1), h = p(n, d, Math.PI / 2, g, !1)) : a >= Math.PI && a < Math.PI * 1.5 ? (c = o * Math.sin(a - Math.PI), g = o * Math.cos(a - Math.PI), d = p(t, n, Math.PI / 2, c, !0), h = p(n, d, Math.PI / 2, g, !0)) : (c = o * Math.sin(Math.PI * 2 - a), g = o * Math.cos(Math.PI * 2 - a), d = p(t, n, Math.PI / 2, c, !0), h = p(n, d, Math.PI / 2, g, !1)), h;
  }
  getArrowPoints(t, e, s, n) {
    const o = k(t, e), a = v(o, s);
    let h = p(s, o, 0, a * 0.3, !0), c = p(s, o, 0, a * 0.5, !0);
    h = p(o, h, Math.PI / 2, a / 5, n), c = p(o, c, Math.PI / 2, a / 4, n);
    const g = [o, h, c, s], d = this.getArrowHeadPoints(g);
    if (d && Array.isArray(d) && d.length > 0) {
      const P = d[0], f = d[4], u = v(t, e) / M(g) / 2, m = this.getArrowBodyPoints(g, P, f, u);
      if (m) {
        const w = m.length;
        let y = m.slice(0, w / 2), E = m.slice(w / 2, w);
        return y.push(P), E.push(f), y = y.reverse(), y.push(e), E = E.reverse(), E.push(t), y.reverse().concat(d, E);
      }
    } else
      throw new Error("Interpolation Error");
    return [];
  }
  getArrowBodyPoints(t, e, s, n) {
    const o = b(t), h = M(t) * n, c = v(e, s), g = (h - c) / 2;
    let d = 0, P = [], f = [];
    for (let u = 1; u < t.length - 1; u++) {
      const m = A(t[u - 1], t[u], t[u + 1]) / 2;
      d += v(t[u - 1], t[u]);
      const w = (h / 2 - d / o * g) / Math.sin(m), y = p(t[u - 1], t[u], Math.PI - m, w, !0), E = p(t[u - 1], t[u], m, w, !1);
      P.push(y), f.push(E);
    }
    return P.concat(f);
  }
  getArrowHeadPoints(t) {
    const s = M(t) * this.headHeightFactor, n = t[t.length - 1], o = s * this.headWidthFactor, a = s * this.neckWidthFactor, h = s * this.neckHeightFactor, c = p(t[t.length - 2], n, 0, s, !0), g = p(t[t.length - 2], n, 0, h, !0), d = p(n, c, Math.PI / 2, o, !1), P = p(n, c, Math.PI / 2, o, !0), f = p(n, g, Math.PI / 2, a, !1), u = p(n, g, Math.PI / 2, a, !0);
    return [f, d, n, P, u];
  }
  getPoints() {
    return this.points;
  }
  getBezierControlPointforGrowthAnimation() {
    return this.isClockWise ? {
      left: this.curveControlPointLeft,
      right: this.curveControlPointRight
    } : {
      right: this.curveControlPointLeft,
      left: this.curveControlPointRight
    };
  }
}
class it extends F {
  constructor(t, e, s) {
    super(t, e, s);
    l(this, "points", []);
    l(this, "arrowLengthScale", 5);
    l(this, "maxArrowLength", 2);
    l(this, "tailWidthFactor");
    l(this, "neckWidthFactor");
    l(this, "headWidthFactor");
    l(this, "headAngle");
    l(this, "neckAngle");
    l(this, "minPointsForShape");
    this.cesium = t, this.tailWidthFactor = 0.3, this.neckWidthFactor = 0.17, this.headWidthFactor = 0.3, this.headAngle = Math.PI / 2.8, this.neckAngle = Math.PI / 4.4, this.minPointsForShape = 2, this.setState("drawing");
  }
  getCategory() {
    return "polygon";
  }
  addPoint(t) {
    if (this.points.length < 2 && (this.points.push(t), this.onMouseMove()), this.points.length === 2) {
      const e = this.createGraphic(this.points);
      this.setGeometryPoints(e), this.drawPolygon(), this.finishDrawing();
    }
  }
  updateMovingPoint(t) {
    const e = [...this.points, t], s = this.createGraphic(e);
    this.setGeometryPoints(s), this.drawPolygon();
  }
  updateDraggingPoint(t, e) {
    this.points[e] = t;
    const s = this.createGraphic(this.points);
    this.setGeometryPoints(s), this.drawPolygon();
  }
  createGraphic(t) {
    const [e, s] = t.map(this.cartesianToLnglat), n = M([e, s]), o = n * this.tailWidthFactor, a = n * this.neckWidthFactor, h = n * this.headWidthFactor, c = p(s, e, Math.PI / 2, o, !0), g = p(s, e, Math.PI / 2, o, !1), d = p(e, s, this.headAngle, h, !1), P = p(e, s, this.headAngle, h, !0), f = p(e, s, this.neckAngle, a, !1), u = p(e, s, this.neckAngle, a, !0), m = [...c, ...f, ...d, ...s, ...P, ...u, ...g, ...e];
    return this.cesium.Cartesian3.fromDegreesArray(m);
  }
  getPoints() {
    return this.points;
  }
}
class z extends F {
  constructor(t, e, s) {
    super(t, e, s);
    l(this, "points", []);
    l(this, "headHeightFactor");
    l(this, "headWidthFactor");
    l(this, "neckHeightFactor");
    l(this, "neckWidthFactor");
    l(this, "headTailFactor");
    l(this, "minPointsForShape");
    this.cesium = t, this.headHeightFactor = 0.18, this.headWidthFactor = 0.3, this.neckHeightFactor = 0.85, this.neckWidthFactor = 0.15, this.headTailFactor = 0.8, this.minPointsForShape = 3, this.setState("drawing"), this.onDoubleClick();
  }
  getCategory() {
    return "polygon";
  }
  addPoint(t) {
    this.points.push(t), this.points.length < 2 ? this.onMouseMove() : this.points.length === 2 && (this.setGeometryPoints(this.points), this.drawPolygon());
  }
  updateMovingPoint(t) {
    const e = [...this.points, t];
    if (this.setGeometryPoints(e), e.length === 2)
      this.addTempLine();
    else {
      this.removeTempLine();
      const s = this.createGraphic(e);
      this.setGeometryPoints(s), this.drawPolygon();
    }
  }
  createGraphic(t) {
    const e = t.map((C) => this.cartesianToLnglat(C));
    let [s, n] = [e[0], e[1]];
    I(e[0], e[1], e[2]) && (s = e[1], n = e[0]);
    const a = [k(s, n)].concat(e.slice(2)), h = this.getArrowHeadPoints(a, s, n), [c, g] = [h[0], h[4]], d = v(s, n) / M(a), P = this.getArrowBodyPoints(a, c, g, d), f = P.length;
    let u = [s].concat(P.slice(0, f / 2));
    u.push(c);
    let m = [n].concat(P.slice(f / 2, f));
    m.push(g), u = W(u), m = W(m);
    const w = u.concat(h, m.reverse()), y = [].concat(...w);
    return this.cesium.Cartesian3.fromDegreesArray(y);
  }
  getPoints() {
    return this.points;
  }
  getArrowHeadPoints(t, e, s) {
    try {
      let n = M(t), o = n * this.headHeightFactor;
      const a = t[t.length - 1];
      n = v(a, t[t.length - 2]);
      const h = v(e, s);
      o > h * this.headTailFactor && (o = h * this.headTailFactor);
      const c = o * this.headWidthFactor, g = o * this.neckWidthFactor;
      o = o > n ? n : o;
      const d = o * this.neckHeightFactor, P = p(t[t.length - 2], a, 0, o, !0), f = p(t[t.length - 2], a, 0, d, !0), u = p(a, P, Math.PI / 2, c, !1), m = p(a, P, Math.PI / 2, c, !0), w = p(a, f, Math.PI / 2, g, !1), y = p(a, f, Math.PI / 2, g, !0);
      return [w, u, a, m, y];
    } catch (n) {
      console.log(n);
    }
  }
  getArrowBodyPoints(t, e, s, n) {
    const o = b(t), h = M(t) * n, c = v(e, s), g = (h - c) / 2;
    let [d, P, f] = [0, [], []];
    for (let u = 1; u < t.length - 1; u++) {
      const m = A(t[u - 1], t[u], t[u + 1]) / 2;
      d += v(t[u - 1], t[u]);
      const w = (h / 2 - d / o * g) / Math.sin(m), y = p(t[u - 1], t[u], Math.PI - m, w, !0), E = p(t[u - 1], t[u], m, w, !1);
      P.push(y), f.push(E);
    }
    return P.concat(f);
  }
  updateDraggingPoint(t, e) {
    this.points[e] = t;
    const s = this.createGraphic(this.points);
    this.setGeometryPoints(s), this.drawPolygon();
  }
}
class st extends z {
  constructor(t, e, s) {
    super(t, e, s);
    l(this, "points", []);
    l(this, "headHeightFactor");
    l(this, "headWidthFactor");
    l(this, "neckHeightFactor");
    l(this, "neckWidthFactor");
    l(this, "headTailFactor");
    l(this, "tailWidthFactor");
    l(this, "swallowTailFactor");
    l(this, "swallowTailPnt");
    this.cesium = t, this.headHeightFactor = 0.18, this.headWidthFactor = 0.3, this.neckHeightFactor = 0.85, this.neckWidthFactor = 0.15, this.tailWidthFactor = 0.1, this.headTailFactor = 0.8, this.swallowTailFactor = 1, this.swallowTailPnt = [0, 0], this.minPointsForShape = 3;
  }
  createGraphic(t) {
    const e = t.map((L) => this.cartesianToLnglat(L));
    let [s, n] = [e[0], e[1]];
    I(e[0], e[1], e[2]) && (s = e[1], n = e[0]);
    const a = [k(s, n)].concat(e.slice(2)), h = this.getArrowHeadPoints(a, s, n), [c, g] = [h[0], h[4]], d = v(s, n), P = M(a), f = P * this.tailWidthFactor * this.swallowTailFactor;
    this.swallowTailPnt = p(a[1], a[0], 0, f, !0);
    const u = d / P, m = this.getArrowBodyPoints(a, c, g, u), w = m.length;
    let y = [s].concat(m.slice(0, w / 2));
    y.push(c);
    let E = [n].concat(m.slice(w / 2, w));
    E.push(g), y = W(y), E = W(E);
    const C = y.concat(h, E.reverse(), [this.swallowTailPnt, y[0]]), S = [].concat(...C);
    return this.cesium.Cartesian3.fromDegreesArray(S);
  }
}
class nt extends F {
  constructor(t, e, s) {
    super(t, e, s);
    l(this, "points", []);
    l(this, "arrowLengthScale", 5);
    l(this, "maxArrowLength", 3e6);
    l(this, "minPointsForShape");
    this.cesium = t, this.minPointsForShape = 2, this.setState("drawing");
  }
  getCategory() {
    return "polyline";
  }
  addPoint(t) {
    if (this.points.length < 2 && (this.points.push(t), this.onMouseMove()), this.points.length === 2) {
      const e = this.createGraphic(this.points);
      this.setGeometryPoints(e), this.drawLine(), this.mainEntity = this.lineEntity, this.finishDrawing();
    }
  }
  updateMovingPoint(t) {
    const e = [...this.points, t], s = this.createGraphic(e);
    this.setGeometryPoints(s), this.drawLine();
  }
  updateDraggingPoint(t, e) {
    this.points[e] = t;
    const s = this.createGraphic(this.points);
    this.setGeometryPoints(s), this.drawLine();
  }
  createGraphic(t) {
    const [e, s] = t.map(this.cartesianToLnglat);
    let o = v(e, s) / this.arrowLengthScale;
    o = o > this.maxArrowLength ? this.maxArrowLength : o;
    const a = p(e, s, Math.PI / 6, o / 2, !1), h = p(e, s, Math.PI / 6, o / 2, !0), c = [...e, ...s, ...a, ...s, ...h];
    return this.cesium.Cartesian3.fromDegreesArray(c);
  }
  getPoints() {
    return this.points;
  }
}
class ot extends F {
  constructor(t, e, s) {
    super(t, e, s);
    l(this, "points", []);
    l(this, "arrowLengthScale", 5);
    l(this, "maxArrowLength", 3e6);
    l(this, "t");
    l(this, "minPointsForShape");
    this.cesium = t, this.t = 0.3, this.minPointsForShape = 2, this.setState("drawing"), this.onDoubleClick();
  }
  getCategory() {
    return "polyline";
  }
  addPoint(t) {
    this.points.push(t), this.points.length < 2 && this.onMouseMove();
  }
  updateMovingPoint(t) {
    const e = [...this.points, t];
    let s = this.createGraphic(e);
    this.setGeometryPoints(s), this.drawLine(), this.mainEntity = this.lineEntity;
  }
  createStraightArrow(t) {
    const [e, s] = t.map(this.cartesianToLnglat);
    let o = v(e, s) / this.arrowLengthScale;
    o = o > this.maxArrowLength ? this.maxArrowLength : o;
    const a = p(e, s, Math.PI / 6, o / 2, !1), h = p(e, s, Math.PI / 6, o / 2, !0), c = [...e, ...s, ...a, ...s, ...h];
    return this.cesium.Cartesian3.fromDegreesArray(c);
  }
  updateDraggingPoint(t, e) {
    this.points[e] = t;
    const s = this.createGraphic(this.points);
    this.setGeometryPoints(s), this.drawLine(), this.mainEntity = this.lineEntity;
  }
  createGraphic(t) {
    const e = t.map((f) => this.cartesianToLnglat(f));
    if (t.length === 2)
      return this.createStraightArrow(t);
    const s = Z(this.t, e), n = e[e.length - 1];
    let a = b(e) / this.arrowLengthScale;
    a = a > this.maxArrowLength ? this.maxArrowLength : a;
    const h = p(s[s.length - 2], s[s.length - 1], Math.PI / 6, a / 2, !1), c = p(s[s.length - 2], s[s.length - 1], Math.PI / 6, a / 2, !0), d = [...[].concat(...s), ...h, ...n, ...c];
    return this.cesium.Cartesian3.fromDegreesArray(d);
  }
  getPoints() {
    return this.points;
  }
}
class rt extends F {
  constructor(t, e, s) {
    super(t, e, s);
    l(this, "iconUrl");
    this.style = s, this.iconUrl = (s == null ? void 0 : s.iconUrl) || "point.png";
  }
  getCategory() {
    return "point";
  }
  addPoint(t) {
    this.points.push(t), this.setGeometryPoints([t]), this.drawPoint(), this.finishDrawing();
  }
  getPoints() {
    return this.points;
  }
  drawPoint() {
    this.mainEntity = this.viewer.entities.add({
      position: this.positions[0],
      billboard: {
        image: new URL((/* @__PURE__ */ Object.assign({}))[`./icon/${this.iconUrl}`], import.meta.url).href,
        horizontalOrigin: this.cesium.HorizontalOrigin.CENTER,
        verticalOrigin: this.cesium.VerticalOrigin.CENTER,
        // @ts-ignore
        scale: Number(this.style.size) || 1,
        // 标注点icon缩放比例
        heightReference: this.cesium.HeightReference.CLAMP_TO_GROUND
      }
    });
  }
  updatePoint() {
    this.mainEntity.position = new this.cesium.ConstantPositionProperty(this.positions[0]);
  }
}
const N = {
  IconPoint: rt,
  FineArrow: tt,
  PincerArrow: et,
  AttackArrow: it,
  SingleArrow: z,
  SwallowtailArrow: st,
  StraightLineArrow: nt,
  CurvedLineArrow: ot,
  //@ts-ignore
  createGeometryFromData: (r, i, t) => {
  }
};
N.createGeometryFromData = (r, i, t) => {
  const { type: e, style: s, points: n } = t, o = new N[e](r, i, s);
  o.points = n;
  const a = o.createGraphic(n);
  return o.setGeometryPoints(a), o.type == "polygon" ? o.drawPolygon() : o.type == "polyline" ? o.drawLine() : o.type == "point" && o.drawPoint(), o.finishDrawing(), o.onClick(), o;
};
export {
  N as default
};
