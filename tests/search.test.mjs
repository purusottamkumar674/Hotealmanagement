import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime.js";
const dom = new JSDOM(
  '<!doctype html><html><body><div id="root"></div></body></html>',
  { url: "http://localhost:3000" },
);
globalThis.window = dom.window;
globalThis.self = dom.window;
globalThis.document = dom.window.document;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { SearchForm } = await import("../src/components/SearchForm.tsx");
test("a family can search six guests in a single BHK unit without the legacy four-guest cap", async () => {
  let destination = "";
  const router = {
    push: (url) => {
      destination = url;
    },
  };
  const root = createRoot(document.getElementById("root"));
  try {
    await act(() =>
      root.render(
        React.createElement(
          AppRouterContext.Provider,
          { value: router },
          React.createElement(SearchForm, {
            initial: {
              hotel: "all",
              checkin: "2099-01-01",
              checkout: "2099-01-03",
              guests: 6,
              rooms: 1,
            },
          }),
        ),
      ),
    );
    assert.equal(
      document.querySelector('[aria-label="Guest count"]').value,
      "6",
    );
    assert.equal(
      document.querySelector('[aria-label="Accommodation unit count"]').value,
      "1",
    );
    await act(() =>
      document
        .querySelector("form")
        .dispatchEvent(
          new window.Event("submit", { bubbles: true, cancelable: true }),
        ),
    );
    const url = new URL(destination, "http://localhost:3000");
    assert.equal(url.pathname, "/search");
    assert.equal(url.searchParams.get("guests"), "6");
    assert.equal(url.searchParams.get("rooms"), "1");
  } finally {
    await act(() => root.unmount());
    dom.window.close();
  }
});
