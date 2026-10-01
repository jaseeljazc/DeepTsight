/**
 * Content-model rules added for the CMS (Phase 3). Offline; runs against the static source.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildEnquirySchema, enquirySchema } from "../../../src/content/enquiry-schema";
import { isMapsUrl } from "../../../src/content/schema";
import { getEnquiryOptions, getServices, getSite } from "../../../src/content/index";

const valid = {
  name: "Test Editor",
  workEmail: "test@example.com",
  enquiryType: "Something else",
  message: "Hello",
  consent: true,
};

test("buildEnquirySchema accepts only the given types, with the original message", () => {
  const schema = buildEnquirySchema(["Something else"]);
  assert.ok(schema.safeParse(valid).success);
  const refused = schema.safeParse({
    ...valid,
    enquiryType: "Plant reliability and asset lifecycle",
  });
  assert.ok(!refused.success);
  assert.deepEqual(refused.error?.flatten().fieldErrors.enquiryType, ["Select an area of enquiry"]);
  const missing = schema.safeParse({ ...valid, enquiryType: undefined });
  assert.deepEqual(missing.error?.flatten().fieldErrors.enquiryType, ["Select an area of enquiry"]);
});

test("the static schema accepts every enabled option", async () => {
  const { types } = await getEnquiryOptions();
  for (const type of types) {
    assert.ok(enquirySchema.safeParse({ ...valid, enquiryType: type.value }).success, type.value);
  }
});

test("Google Maps links are restricted to Google Maps hosts over https", () => {
  assert.ok(isMapsUrl("https://maps.app.goo.gl/abc123"));
  assert.ok(isMapsUrl("https://www.google.com/maps/place/Perth"));
  assert.ok(isMapsUrl("https://goo.gl/maps/abc"));
  assert.ok(!isMapsUrl("http://maps.app.goo.gl/abc123"));
  assert.ok(!isMapsUrl("https://www.google.com/search?q=perth"));
  assert.ok(!isMapsUrl("https://example.com/maps"));
  assert.ok(!isMapsUrl("javascript:alert(1)"));
});

test("navigation is built from fixed routes and hides Insights while it is off", async () => {
  const site = await getSite();
  assert.deepEqual(
    site.nav.map((item) => item.href),
    ["/", "/about", "/services", "/credentials", "/contact"],
  );
});

test("services come back enabled, in sort order, with valid related links", async () => {
  const services = await getServices();
  assert.ok(services.every((service) => service.enabled));
  const orders = services.map((service) => service.sortOrder);
  assert.deepEqual(
    orders,
    [...orders].sort((a, b) => a - b),
  );
  const slugs = new Set(services.map((service) => service.slug));
  for (const service of services) {
    for (const related of service.relatedSlugs) assert.ok(slugs.has(related));
  }
});
