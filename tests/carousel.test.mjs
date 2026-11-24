import { test, after } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";

const dom = new JSDOM(
  '<!doctype html><html><body><div id="root"></div></body></html>',
  { url: "http://localhost:3000" },
);
globalThis.window = dom.window;
globalThis.self = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
Object.defineProperty(document, "hidden", { configurable: true, value: false });
const nativeInterval = globalThis.setInterval;
globalThis.setInterval = (...args) => nativeInterval(...args).unref();
let reduced = false;
window.matchMedia = () => ({
  matches: reduced,
  addEventListener() {},
  removeEventListener() {},
});
const { HeroCarousel } = await import("../src/components/HeroCarousel.tsx");
const slides = [
  {
    id: "one",
    heading: "First TEST slide",
    subtitle: "TEST",
    cta_text: "Find a stay",
    cta_link: "/search",
    image: "/test.jpg",
    alt: "TEST image",
    hotel: "flower-inn",
  },
  {
    id: "two",
    heading: "Second TEST slide",
    subtitle: "TEST",
    cta_text: "Visit the property",
    cta_link: "/hotels/petal-inn",
    image: "/test2.jpg",
    alt: "TEST image 2",
    hotel: "petal-inn",
  },
];
let root;
const mount = async (items = slides) => {
  if (root) await act(() => root.unmount());
  root = createRoot(document.getElementById("root"));
  await act(() =>
    root.render(React.createElement(HeroCarousel, { slides: items })),
  );
};
const click = async (label) => {
  const button = [...document.querySelectorAll("button")].find(
    (b) => b.getAttribute("aria-label") === label,
  );
  assert.ok(button, `Button ${label} exists`);
  await act(() => button.click());
};
const heading = () => document.querySelector("h1").textContent;
test("carousel supports next, previous, dots and the selected CTA", async () => {
  await mount();
  assert.equal(heading(), "First TEST slide");
  await click("Next slide");
  assert.equal(heading(), "Second TEST slide");
  assert.equal(
    document.querySelector(".hero-copy a").getAttribute("href"),
    "/hotels/petal-inn",
  );
  await click("Previous slide");
  assert.equal(heading(), "First TEST slide");
  await click("Show slide 2: Second TEST slide");
  assert.equal(heading(), "Second TEST slide");
  assert.equal(document.querySelectorAll("[aria-current=true]").length, 1);
});
test("keyboard arrows change slides only when the carousel region itself has focus", async () => {
  await mount();
  const region = document.querySelector("section");
  await act(() =>
    region.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    ),
  );
  assert.equal(heading(), "Second TEST slide");
  const button = document.querySelector("button");
  await act(() =>
    button.dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
    ),
  );
  assert.equal(heading(), "Second TEST slide");
});
test("autoplay uses three seconds, continues on hover and pauses on focus", async (t) => {
  t.mock.timers.enable({ apis: ["setInterval"] });
  await mount();
  await act(() => t.mock.timers.tick(3000));
  assert.equal(heading(), "Second TEST slide");
  await click("Pause slideshow");
  await act(() => t.mock.timers.tick(10000));
  assert.equal(heading(), "Second TEST slide");
  await click("Play slideshow");
  await act(() => t.mock.timers.tick(3000));
  assert.equal(heading(), "First TEST slide");
  const region = document.querySelector("section");
  await act(() =>
    region.dispatchEvent(new window.MouseEvent("mouseover", { bubbles: true })),
  );
  await act(() => t.mock.timers.tick(3000));
  assert.equal(heading(), "Second TEST slide");
  await act(() =>
    region.dispatchEvent(new window.MouseEvent("mouseout", { bubbles: true })),
  );
  await act(() =>
    region.dispatchEvent(new window.FocusEvent("focusin", { bubbles: true })),
  );
  await act(() => t.mock.timers.tick(10000));
  assert.equal(heading(), "Second TEST slide");
  t.mock.timers.reset();
});
test("reduced motion prevents automatic transitions", async (t) => {
  reduced = true;
  t.mock.timers.enable({ apis: ["setInterval"] });
  await mount();
  await act(() => t.mock.timers.tick(20000));
  assert.equal(heading(), "First TEST slide");
  reduced = false;
  t.mock.timers.reset();
});
test("empty and single-slide states have no unusable slideshow controls", async () => {
  await mount([]);
  assert.match(heading(), /Find your place/);
  assert.equal(document.querySelectorAll(".carousel-controls").length, 0);
  await mount(slides.slice(0, 1));
  assert.equal(document.querySelectorAll(".carousel-controls").length, 0);
});
after(async () => {
  if (root) await act(() => root.unmount());
  dom.window.close();
});
