import { prepareTestDb } from "../../scripts/cms/prepare-test-db";

/*
 * Prepares the test database before the CMS suites (scripts/cms/prepare-test-db.ts). Skipped when
 * scripts/cms/test-cms.ts has already prepared it (CMS_TEST_PREPARED=1) for the build it tests.
 */
export {
  ADMIN_FILE,
  EDITOR_FILE,
  ENQUIRY_TYPES_FILE,
  IMAGES_FILE,
  INBOX_FILE,
  INSIGHTS_FILE,
  LOCKOUT_FILE,
  PREVIEW_FILE,
  TEST_DATA_DIR,
} from "../../scripts/cms/prepare-test-db";

export default async function globalSetup(): Promise<void> {
  if (!process.env["DATABASE_URI_TEST"]) {
    console.warn("DATABASE_URI_TEST is not set: CMS tests will be skipped.");
    return;
  }
  if (process.env["CMS_TEST_PREPARED"] === "1") return;
  prepareTestDb();
}
