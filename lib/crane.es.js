import { defineComponent as d, ref as p, openBlock as i, createElementBlock as _, Fragment as h, createElementVNode as e, toDisplayString as u, pushScopeId as m, popScopeId as g, createTextVNode as n } from "vue";
const c = (t) => (m("data-v-d0283464"), t = t(), g(), t), f = { class: "card" }, v = /* @__PURE__ */ c(() => /* @__PURE__ */ e("p", null, [
  /* @__PURE__ */ n(" Edit "),
  /* @__PURE__ */ e("code", null, "components/HelloWorld.vue"),
  /* @__PURE__ */ n(" to test HMR ")
], -1)), k = /* @__PURE__ */ c(() => /* @__PURE__ */ e("p", null, [
  /* @__PURE__ */ n(" Check out "),
  /* @__PURE__ */ e("a", {
    href: "https://vuejs.org/guide/quick-start.html#local",
    target: "_blank"
  }, "create-vue"),
  /* @__PURE__ */ n(", the official Vue + Vite starter ")
], -1)), V = /* @__PURE__ */ c(() => /* @__PURE__ */ e("p", null, [
  /* @__PURE__ */ n(" Learn more about IDE Support for Vue in the "),
  /* @__PURE__ */ e("a", {
    href: "https://vuejs.org/guide/scaling-up/tooling.html#ide-support",
    target: "_blank"
  }, "Vue Docs Scaling up Guide"),
  /* @__PURE__ */ n(". ")
], -1)), S = /* @__PURE__ */ c(() => /* @__PURE__ */ e("p", { class: "read-the-docs" }, "Click on the Vite and Vue logos to learn more", -1)), b = /* @__PURE__ */ d({
  __name: "HelloWorld",
  props: {
    msg: {}
  },
  setup(t) {
    const o = p(0);
    return (l, s) => (i(), _(h, null, [
      e("h1", null, u(l.msg), 1),
      e("div", f, [
        e("button", {
          type: "button",
          onClick: s[0] || (s[0] = (a) => o.value++)
        }, "count is " + u(o.value), 1),
        v
      ]),
      k,
      V,
      S
    ], 64));
  }
}), E = (t, o) => {
  const l = t.__vccOpts || t;
  for (const [s, a] of o)
    l[s] = a;
  return l;
}, r = /* @__PURE__ */ E(b, [["__scopeId", "data-v-d0283464"]]);
r.install = (t) => (t.component("HelloWorld", r), t);
const H = [
  r
], I = (t) => {
  H.forEach((o) => {
    t.use(o);
  });
}, C = {
  install: I
  //   ...ButtonTypes
};
export {
  r as HelloWorld,
  C as default
};
