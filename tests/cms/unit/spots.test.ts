import assert from "node:assert/strict";
import { test } from "node:test";
import type { Field } from "payload";
import { About, Home, Pages, Seo } from "../../../src/cms/globals";
import { Credentials } from "../../../src/cms/collections/credentials";
import { Services } from "../../../src/cms/collections/services";
import {
  credentialSpot,
  globalSpots,
  isRegisteredPath,
  registeredFieldPaths,
  serviceSpots,
} from "../../../src/cms/images/spots";

/** Every upload field that points at `media`, as a dotted path (groups only; no arrays hold images). */
function mediaFieldPaths(fields: Field[], prefix = ""): string[] {
  const out: string[] = [];
  for (const field of fields) {
    const name = "name" in field && typeof field.name === "string" ? field.name : undefined;
    if (field.type === "upload" && field.relationTo === "media" && name) out.push(prefix + name);
    if (field.type === "group" && name && "fields" in field) {
      out.push(...mediaFieldPaths(field.fields, `${prefix}${name}.`));
    } else if (field.type === "tabs") {
      for (const tab of field.tabs) out.push(...mediaFieldPaths(tab.fields, prefix));
    } else if ((field.type === "row" || field.type === "collapsible") && "fields" in field) {
      out.push(...mediaFieldPaths(field.fields, prefix));
    } else if (field.type === "array" && name && "fields" in field) {
      // An image inside an array would need a spot per row; the registry does not support that.
      assert.deepEqual(mediaFieldPaths(field.fields), [], `image inside array "${prefix}${name}"`);
    }
  }
  return out;
}

test("every image field in the CMS is in the registry (so no image can be missing from the page)", () => {
  const registered = registeredFieldPaths();
  const actual = {
    home: mediaFieldPaths(Home.fields).sort(),
    about: mediaFieldPaths(About.fields).sort(),
    pages: mediaFieldPaths(Pages.fields).sort(),
    seo: mediaFieldPaths(Seo.fields).sort(),
    services: mediaFieldPaths(Services.fields).sort(),
    credentials: mediaFieldPaths(Credentials.fields).sort(),
  };
  for (const owner of Object.keys(actual) as (keyof typeof actual)[]) {
    assert.deepEqual([...registered[owner]].sort(), actual[owner], `registry for ${owner}`);
  }
});

test("global spots have unique ids and plain-words locations", () => {
  const spots = globalSpots();
  assert.equal(new Set(spots.map((spot) => spot.id)).size, spots.length);
  for (const spot of spots) {
    assert.ok(spot.where.length > 10, spot.id);
    assert.ok(spot.title.length > 0, spot.id);
  }
});

test("a service has a main image, a detail image and a share image", () => {
  const spots = serviceSpots({ id: 3, slug: "ot-cybersecurity", title: "OT cybersecurity" });
  assert.deepEqual(
    spots.map((spot) => spot.path),
    ["media.hero", "media.detail", "seo.ogImage"],
  );
  assert.equal(spots[0]?.pagePath, "/services/ot-cybersecurity");
  assert.equal(spots[0]?.required, true);
  assert.equal(spots[2]?.required, false);
});

test("a credential badge spot is optional and badge-only", () => {
  const spot = credentialSpot({ id: 9, title: "Chartered Professional Engineer (CPEng)" });
  assert.equal(spot.path, "badge");
  assert.equal(spot.badgeOnly, true);
  assert.equal(spot.required, false);
});

test("only registered paths may be written by the page", () => {
  assert.equal(isRegisteredPath({ kind: "global", slug: "home" }, "media.why"), true);
  assert.equal(isRegisteredPath({ kind: "global", slug: "home" }, "hero.headline"), false);
  assert.equal(
    isRegisteredPath({ kind: "collection", slug: "services", id: 1 }, "seo.ogImage"),
    true,
  );
  assert.equal(isRegisteredPath({ kind: "collection", slug: "services", id: 1 }, "title"), false);
});
