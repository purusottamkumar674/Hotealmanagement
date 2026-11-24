import { test, after } from "node:test";
import assert from "node:assert/strict";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime.js";
const dom = new JSDOM(
  '<!doctype html><html><body><div id="root"></div></body></html>',
  { url: "http://localhost:3000", pretendToBeVisual: true },
);
Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  self: dom.window,
  MutationObserver: dom.window.MutationObserver,
  requestAnimationFrame: dom.window.requestAnimationFrame.bind(dom.window),
  cancelAnimationFrame: dom.window.cancelAnimationFrame.bind(dom.window),
  IS_REACT_ACT_ENVIRONMENT: true,
});
dom.window.HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
dom.window.HTMLDialogElement.prototype.close = function () {
  if (this.open) {
    this.removeAttribute("open");
    this.dispatchEvent(new dom.window.Event("close"));
  }
};
const { SiteHeader } = await import("../src/components/SiteHeader.tsx");
const root = createRoot(document.getElementById("root"));
await act(() =>
  root.render(
    React.createElement(
      PathnameContext.Provider,
      { value: "/" },
      React.createElement(SiteHeader),
    ),
  ),
);
test("homepage header preserves carousel overlay and active navigation", () => {
  assert.ok(document.querySelector(".header-over-hero"));
  assert.equal(
    document.querySelector(
      'nav[aria-label="Main navigation"] a[aria-current="page"]',
    ).textContent,
    "Home",
  );
  assert.equal(
    document.querySelector(".header-book-button").getAttribute("href"),
    "/search",
  );
  assert.equal(document.querySelectorAll("header").length, 1);
  assert.equal(document.querySelector('a[href="/admin"]'), null);
});
test("hotel disclosure closes with Escape and outside click", async () => {
  const details = document.querySelector(".hotels-disclosure"),
    summary = details.querySelector("summary");
  details.open = true;
  await act(() =>
    summary.dispatchEvent(
      new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  assert.equal(details.open, false);
  assert.equal(document.activeElement, summary);
  details.open = true;
  await act(() =>
    document.body.dispatchEvent(
      new dom.window.MouseEvent("pointerdown", { bubbles: true }),
    ),
  );
  assert.equal(details.open, false);
  assert.equal(details.querySelectorAll("a").length, 3);
});
test("mobile drawer locks scrolling, closes on navigation and restores focus", async () => {
  const trigger = document.querySelector(".luxury-menu-trigger"),
    dialog = document.querySelector("dialog");
  await act(() => trigger.click());
  assert.equal(dialog.open, true);
  assert.equal(document.body.style.overflow, "hidden");
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  await act(() => dialog.querySelector('a[href="/rooms"]').click());
  assert.equal(dialog.open, false);
  assert.equal(document.body.style.overflow, "");
  assert.equal(document.activeElement, trigger);
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
});
after(async () => {
  await act(() => root.unmount());
  dom.window.close();
});
