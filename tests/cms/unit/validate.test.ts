import assert from "node:assert/strict";
import { test } from "node:test";
import {
  decodeSpotId,
  imageProblemFor,
  isBadgeSpot,
  isConfirmed,
  isImageRecord,
  parseId,
  parseOwner,
  parsePercent,
  parseSpotPath,
  writable,
} from "../../../src/cms/images/validate";
import type { OwnerRef } from "../../../src/cms/images/types";

const home: OwnerRef = { kind: "global", slug: "home" };
const credential: OwnerRef = { kind: "collection", slug: "credentials", id: 3 };
const service: OwnerRef = { kind: "collection", slug: "services", id: 12 };

test("parseOwner accepts the allowed globals and collections, as a fresh object", () => {
  for (const slug of ["home", "about", "pages", "seo"] as const) {
    assert.deepEqual(parseOwner({ kind: "global", slug }), { kind: "global", slug });
  }
  assert.deepEqual(parseOwner({ kind: "collection", slug: "services", id: 12 }), service);
  assert.deepEqual(
    parseOwner({ kind: "collection", slug: "credentials", id: 3, extra: 1 }),
    credential,
  );
  assert.deepEqual(parseOwner({ kind: "global", slug: "home", id: 4 }), home);
});

test("parseOwner refuses anything else", () => {
  const bad: unknown[] = [
    null,
    undefined,
    "home",
    42,
    [],
    {},
    { kind: "global" },
    { kind: "global", slug: "services" },
    { kind: "global", slug: "constructor" },
    { kind: "global", slug: "__proto__" },
    { kind: "global", slug: "toString" },
    { kind: "global", slug: "legal" },
    { kind: "collection", slug: "home", id: 1 },
    { kind: "collection", slug: "media", id: 1 },
    { kind: "collection", slug: "users", id: 1 },
    { kind: "collection", slug: "constructor", id: 1 },
    { kind: "collection", slug: "services" },
    { kind: "collection", slug: "services", id: 0 },
    { kind: "collection", slug: "services", id: -1 },
    { kind: "collection", slug: "services", id: 1.5 },
    { kind: "collection", slug: "services", id: "12" },
    { kind: "collection", slug: "services", id: Number.NaN },
    { kind: "collection", slug: "services", id: Number.POSITIVE_INFINITY },
    { kind: "Global", slug: "home" },
    { kind: "other", slug: "home" },
    Object.create({ kind: "global", slug: "home" }),
  ];
  for (const value of bad) assert.equal(parseOwner(value), null, JSON.stringify(value));
});

test("parseSpotPath accepts registered paths only", () => {
  assert.equal(parseSpotPath(home, "media.why"), "media.why");
  assert.equal(parseSpotPath(credential, "badge"), "badge");
  assert.equal(parseSpotPath(service, "seo.ogImage"), "seo.ogImage");
  for (const value of [
    "",
    "media",
    "badge",
    "media.why.x",
    "verified",
    "approvedForPublic",
    1,
    null,
    undefined,
    {},
  ]) {
    assert.equal(parseSpotPath(home, value), null, String(value));
  }
  assert.equal(parseSpotPath(credential, "verified"), null);
  assert.equal(parseSpotPath(service, "_status"), null);
});

test("parseId takes positive safe integers only", () => {
  assert.equal(parseId(1), 1);
  assert.equal(parseId(9007), 9007);
  for (const value of [
    0,
    -1,
    1.5,
    "1",
    null,
    undefined,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    2 ** 60,
    true,
    {},
  ]) {
    assert.equal(parseId(value), null, String(value));
  }
});

test("parsePercent takes finite numbers from 0 to 100", () => {
  assert.equal(parsePercent(0), 0);
  assert.equal(parsePercent(100), 100);
  assert.equal(parsePercent(33.3), 33.3);
  for (const value of [-0.1, 100.1, Number.NaN, Number.POSITIVE_INFINITY, "50", null, undefined]) {
    assert.equal(parsePercent(value), null, String(value));
  }
});

test("isConfirmed is true only for the boolean true", () => {
  assert.equal(isConfirmed(true), true);
  for (const value of [false, "true", 1, {}, [], null, undefined]) {
    assert.equal(isConfirmed(value), false, String(value));
  }
});

test("decodeSpotId turns registry ids back into owner and path", () => {
  assert.deepEqual(decodeSpotId("home:media.why"), { owner: home, path: "media.why" });
  assert.deepEqual(decodeSpotId("services:12:media.hero"), { owner: service, path: "media.hero" });
  assert.deepEqual(decodeSpotId("credentials:3:badge"), { owner: credential, path: "badge" });
});

test("decodeSpotId refuses ids outside the registry", () => {
  for (const value of [
    "",
    "home",
    "home:verified",
    "constructor:media.why",
    "__proto__:media.why",
    "services:media.hero",
    "services:0:media.hero",
    "services:1.5:media.hero",
    "services:abc:media.hero",
    "services:12:verified",
    "users:1:badge",
    "home:media.why:extra:more",
    "home:1:media.why",
    42,
    null,
  ]) {
    assert.equal(decodeSpotId(value), null, String(value));
  }
});

test("isBadgeSpot is the credential badge only", () => {
  assert.equal(isBadgeSpot(credential, "badge"), true);
  assert.equal(isBadgeSpot(service, "media.hero"), false);
  assert.equal(isBadgeSpot(home, "media.why"), false);
});

test("isImageRecord needs an image with a file", () => {
  assert.equal(isImageRecord({ id: 1, kind: "image", filename: "a.jpg" }), true);
  assert.equal(isImageRecord({ id: 1, filename: "a.jpg" }), true);
  assert.equal(isImageRecord({ id: 1, kind: "slot", filename: "a.jpg" }), false);
  assert.equal(isImageRecord({ id: 1, kind: "image" }), false);
  assert.equal(isImageRecord({ id: 1, kind: "image", filename: "" }), false);
  assert.equal(isImageRecord(null), false);
});

test("imageProblemFor matches badges to the badge spot and nothing else", () => {
  const photo = { id: 1, kind: "image", filename: "a.jpg", assetClass: "photograph" };
  const badge = { id: 2, kind: "image", filename: "b.png", assetClass: "issuer-badge" };
  assert.equal(imageProblemFor(photo, home, "media.why"), null);
  assert.equal(imageProblemFor(badge, credential, "badge"), null);
  assert.match(imageProblemFor(badge, home, "media.why") ?? "", /badge/i);
  assert.match(imageProblemFor(photo, credential, "badge") ?? "", /badge/i);
  assert.match(
    imageProblemFor({ ...photo, assetClass: undefined }, credential, "badge") ?? "",
    /badge/i,
  );
  assert.match(imageProblemFor(null, home, "media.why") ?? "", /not found|no image/i);
  assert.match(
    imageProblemFor({ ...photo, kind: "slot" }, home, "media.why") ?? "",
    /no image|file/i,
  );
});

test("writable drops bookkeeping fields and approval flags, and leaves the input alone", () => {
  const doc = {
    id: 5,
    createdAt: "x",
    updatedAt: "y",
    globalType: "home",
    verified: true,
    approvedForPublic: true,
    disclosureApproved: true,
    insightsEnabled: true,
    _status: "draft",
    media: { why: 3 },
  };
  assert.deepEqual(writable(doc), { _status: "draft", media: { why: 3 } });
  assert.equal(doc.id, 5);
  assert.equal(doc.verified, true);
});
