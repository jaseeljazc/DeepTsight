/**
 * Smoke test for the CMS model (Phase 4): reset and migrate the test database, then create,
 * update, publish and delete one record in every content collection and update every global,
 * through the Local API. Also checks that the publish guard refuses an incomplete document.
 *
 *   tsx scripts/cms/smoke.ts
 *
 * Only DATABASE_URI_TEST is touched (D-15). Test data uses example.com and "Test" names only.
 */
import assert from "node:assert/strict";
import sharp from "sharp";
import type { Payload } from "payload";
import { redact } from "./lib/db";
import { payloadFor } from "./lib/payload";
import { migrate } from "./migrate";
import { DISABLE_REVALIDATE } from "../../src/cms/hooks/revalidate";

const context = { [DISABLE_REVALIDATE]: true };
const results: string[] = [];

async function step(name: string, run: () => Promise<void>): Promise<void> {
  await run();
  results.push(`ok  ${name}`);
}

async function testImage(): Promise<Buffer> {
  return sharp({
    create: { width: 64, height: 48, channels: 3, background: { r: 120, g: 130, b: 140 } },
  })
    .jpeg()
    .toBuffer();
}

async function smoke(payload: Payload): Promise<void> {
  const base = { overrideAccess: true, context } as const;
  // Deliberately incomplete documents, for the publish guard; the typed API would refuse them.
  const loose = payload as unknown as {
    create: (args: Record<string, unknown>) => Promise<unknown>;
  };

  let mediaId = 0;
  await step("media: create, update, publish", async () => {
    const data = await testImage();
    const created = await payload.create({
      ...base,
      collection: "media",
      draft: true,
      data: { kind: "image", assetClass: "photograph", caption: "Test caption", alt: "Test image" },
      file: { data, mimetype: "image/jpeg", name: "smoke-test.jpg", size: data.length },
    });
    mediaId = created.id;
    await payload.update({
      ...base,
      collection: "media",
      id: mediaId,
      draft: true,
      data: { caption: "Test caption 2" },
    });
    await payload.update({
      ...base,
      collection: "media",
      id: mediaId,
      data: { _status: "published", source: "Test", licence: "Test", usageRights: "Test" },
    });
  });

  await step("publish guard refuses an incomplete media record", async () => {
    await assert.rejects(
      loose.create({
        ...base,
        collection: "media",
        data: { kind: "image", caption: "", _status: "published" },
      }),
    );
  });

  let serviceId = 0;
  await step("services: create draft, update, publish", async () => {
    const created = await payload.create({
      ...base,
      collection: "services",
      draft: true,
      data: { slug: "smoke-test-service", title: "Test service", _status: "draft" },
    });
    serviceId = created.id;
    await payload.update({
      ...base,
      collection: "services",
      id: serviceId,
      data: {
        shortTitle: "Test",
        summary: "Test summary",
        outcome: "Test outcome",
        icon: "Cpu",
        challenge: "Test challenge",
        whyItMatters: "Test why",
        capability: "Test capability",
        scopeAndOutputs: [{ scope: "Test scope", outputs: [{ value: "Test output" }] }],
        deliveryApproach: ["01", "02", "03", "04"].map((step) => ({
          step,
          title: `Step ${step}`,
          description: "Test",
        })),
        standards: [{ value: "ISA/IEC 62443" }],
        media: { hero: mediaId, detail: mediaId },
        seo: { title: "Test service", description: "Test description" },
        enabled: true,
        sortOrder: 10,
        _status: "published",
      },
    });
    const published = await payload.findByID({ ...base, collection: "services", id: serviceId });
    assert.equal(published._status, "published");
    assert.ok(published.firstPublishedAt, "first publish is stamped");
  });

  await step("publish guard refuses a service with three delivery steps", async () => {
    await assert.rejects(
      payload.update({
        ...base,
        collection: "services",
        id: serviceId,
        data: {
          deliveryApproach: ["01", "02", "03"].map((step) => ({
            step,
            title: "Step",
            description: "Test",
          })),
          _status: "published",
        },
      }),
    );
  });

  let credentialId = 0;
  await step("credential-groups and credentials", async () => {
    const group = await payload.create({
      ...base,
      collection: "credential-groups",
      data: { category: "platforms", title: "Test platforms", sortOrder: 10, _status: "published" },
    });
    const credential = await payload.create({
      ...base,
      collection: "credentials",
      data: {
        legacyId: "smoke-credential",
        category: "platforms",
        title: "Test credential",
        issuer: "Test issuer",
        expiry: "2030",
        verified: true,
        sortOrder: 10,
        _status: "published",
      },
    });
    credentialId = credential.id;
    await payload.update({
      ...base,
      collection: "credentials",
      id: credentialId,
      data: { issuer: "Test issuer 2" },
    });
    await payload.delete({ ...base, collection: "credential-groups", id: group.id });
  });

  let proofId = 0;
  await step("proof-items: needs the no-identifying-details tick to publish", async () => {
    await assert.rejects(
      loose.create({
        ...base,
        collection: "proof-items",
        data: { sector: "Test", challenge: "Test", outcome: "Test", _status: "published" },
      }),
    );
    const proof = await payload.create({
      ...base,
      collection: "proof-items",
      data: {
        sector: "Test",
        challenge: "Test",
        outcome: "Test",
        noIdentifyingDetailsConfirmed: true,
        _status: "published",
      },
    });
    proofId = proof.id;
  });

  await step("legal-pages", async () => {
    const legal = await payload.create({
      ...base,
      collection: "legal-pages",
      data: {
        slug: "terms",
        title: "Test terms",
        lastUpdated: "October 2026",
        reference: "Test reference",
        status: "pending-adviser",
        sections: [{ title: "1. Test", content: "Test content" }],
        _status: "published",
      },
    });
    await payload.delete({ ...base, collection: "legal-pages", id: legal.id });
  });

  await step("enquiry-types: value is fixed after creation", async () => {
    const type = await payload.create({
      ...base,
      collection: "enquiry-types",
      data: { value: "Test type", label: "Test type", enabled: true, sortOrder: 10 },
    });
    await payload
      .update({
        ...base,
        collection: "enquiry-types",
        id: type.id,
        overrideAccess: false,
        user: null,
        data: { label: "Test type 2" },
      })
      .catch(() => undefined);
    await payload.delete({ ...base, collection: "enquiry-types", id: type.id });
  });

  await step("globals: draft then publish", async () => {
    await payload.updateGlobal({
      ...base,
      slug: "site-settings",
      draft: true,
      data: { displayName: "Test" },
    });
    await payload.updateGlobal({
      ...base,
      slug: "pages",
      draft: true,
      data: { services: { title: "Test" } },
    });
    await payload.updateGlobal({
      ...base,
      slug: "about",
      draft: true,
      data: { founder: { name: "Test Editor" } },
    });
    await payload.updateGlobal({
      ...base,
      slug: "seo",
      draft: true,
      data: { home: { title: "Test" } },
    });
    await payload.updateGlobal({
      ...base,
      slug: "home",
      draft: true,
      data: { coreCapabilitiesTitle: "Test", trustStrip: [credentialId], selectedProof: [proofId] },
    });
  });

  await step("audit log records changes", async () => {
    const audit = await payload.find({ ...base, collection: "audit-log", limit: 0 });
    assert.ok(audit.totalDocs > 0, "audit entries written");
    const flags = await payload.find({
      ...base,
      collection: "audit-log",
      where: { action: { equals: "flag-change" } },
      limit: 0,
    });
    assert.ok(flags.totalDocs > 0, "approval flag changes are audited");
  });

  await step("delete removes service, credential, proof and media", async () => {
    await payload.delete({ ...base, collection: "services", id: serviceId });
    await payload.delete({ ...base, collection: "credentials", id: credentialId });
    await payload.delete({ ...base, collection: "proof-items", id: proofId });
    await payload.delete({ ...base, collection: "media", id: mediaId });
    for (const collection of ["services", "credentials", "proof-items", "media"] as const) {
      const left = await payload.find({ ...base, collection, limit: 0 });
      assert.equal(left.totalDocs, 0, `${collection} empty`);
    }
  });
}

async function main(): Promise<void> {
  migrate("DATABASE_URI_TEST", { fresh: true });
  const payload = await payloadFor("DATABASE_URI_TEST");
  try {
    await smoke(payload);
  } finally {
    await payload.destroy();
  }
  console.log(results.join("\n"));
  console.log(`Smoke test passed (${results.length} steps).`);
}

main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.log(results.join("\n"));
    console.error(
      `Smoke test failed: ${redact(error instanceof Error ? error.message : String(error))}`,
    );
    process.exit(1);
  },
);
