# Supabase setup: database and file storage

How to run the DeepTsight CMS on Supabase: PostgreSQL for the content, and Supabase Storage for uploaded
images. Written for the site owner. Nothing here has been done yet.

> **Status, read this first**
>
> - **The repository does not use Supabase today.** The database is local PostgreSQL 17 and uploads are
>   files in `.data/media/<database name>`. Everything below is a plan to follow, not a description of
>   what exists.
> - **The database half needs no code change.** The CMS already talks to any PostgreSQL over a
>   connection string. Only the connection string and the TLS (certificate) handling change.
> - **The file-storage half needs code.** A new package, new environment variables and a config change
>   (section 4.4). Those are listed but **not written**.
> - **Not tested against Supabase.** I could not reach a Supabase project from here. Items marked
>   **(verify)** come from the code in this repository or from general knowledge of Supabase, and should
>   be checked against the Supabase dashboard and docs, whose labels change.
> - **No secrets in this file.** Every value in angle brackets is a placeholder. Real passwords, keys and
>   connection strings go only in your hosting provider's environment settings and a password manager.
>   Never in the repository, a chat or a screenshot (`CLAUDE.md` §6).

---

## 1. The short version

| Question                                      | Answer                                                                                                                                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Can Supabase be the production database?      | Yes. It is managed PostgreSQL. The CMS needs nothing from Supabase except Postgres.                                                                                                  |
| Which Supabase features do we use?            | **Database** and **Storage** only. Not Auth, not the REST/GraphQL data API, not Realtime, not Edge Functions. The CMS has its own login (with MFA).                                  |
| Biggest database risk                         | Supabase can expose tables over a public web API. Turn that off (section 3.2).                                                                                                       |
| Biggest connection gotcha                     | Certificate verification. The `pg` driver in this project verifies the server certificate, and Supabase's certificate is not from a public authority (section 3.5). Test this first. |
| Can uploads stay on local disk in production? | No. On Vercel the file system is temporary, so uploaded images would vanish. Use object storage (section 4).                                                                         |
| Biggest storage gotcha                        | Vercel limits the size of a request to about 4.5 MB **(verify)**. The CMS allows 10 MB images. See section 4.6.                                                                      |
| Does this change the privacy position?        | Yes. Supabase would store enquiry data (names, work emails, messages). It becomes another service that handles personal information. See section 2.                                  |

---

## 2. Decisions to make before you start

These belong to you and your advisers, not to the code.

1. **Region.** The client is in Western Australia and serves Australian critical-infrastructure
   operators. Supabase offers a Sydney region (`ap-southeast-2`) **(verify)**. Pick it unless an adviser
   says otherwise. The region cannot be changed later without migrating.
2. **Plan.** Do not run production on the free plan: free projects can be paused when idle and have no
   managed backups **(verify)**. Check the current paid plan for backup retention.
3. **Privacy notice and registers.** Supabase would hold enquiry personal data, and the notice still
   needs adviser-approved wording (`MORNING_REPORT.md` §4, item 2). Before go-live:
   - add Supabase to `docs/LICENCES_SERVICES.md` and `TECH_STACK.md`;
   - update `docs/DATA_FLOW_PRIVACY.md` (where data is stored, in which country);
   - have the adviser confirm the retention and backup wording.
4. **Who holds the account.** The Supabase organisation should belong to the client (or a role mailbox),
   with the developer invited, not the other way round.
5. **Plan the exit.** Section 8 explains how to move back to another Postgres.

New services also need approval under `CLAUDE.md` §7 (no dependency outside `TECH_STACK.md` without
asking). Treat this document as that request.

---

## 3. The database

### 3.1 Create the project

1. In Supabase, create an organisation, then a project.
2. Choose the **Sydney** region.
3. Set a long random **database password**. Store it in your password manager. Supabase shows it once.
4. Wait for the project to finish provisioning.

You will use only the **Postgres connection details** from the project's database settings.

### 3.2 Security first: switch off the public data API

Supabase automatically offers a web API (PostgREST) that can read and write tables in the `public`
schema using a public "anon" key. Payload creates its tables in `public`. If that API is on and a table
has no row-level security, **anyone who has the project URL and anon key could read it**, bypassing the
CMS login and MFA entirely. Treat this as the most important step in the document.

Do all of these:

1. **Turn the Data API off** for the project (in the project's API/Data API settings) **(verify the
   current label)**. The CMS does not use it.
2. **Never put the project's `anon` key or `service_role` key in this site.** It does not need them.
   `service_role` bypasses all security. If either appears in a `.env` file or in the hosting settings,
   remove it.
3. **Defence in depth.** Enable row-level security on every CMS table, with **no** policies. A table with
   RLS on and no policies is unreadable to the web-API roles. Run this after each migration (it is
   harmless to repeat):

   ```sql
   -- Run in the Supabase SQL editor, as the project owner.
   DO $$
   DECLARE t record;
   BEGIN
     FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
       EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
     END LOOP;
   END $$;
   ```

   Because the CMS connects as the tables' owner (section 3.3), the owner is not blocked by RLS, so
   the CMS keeps working.

4. **Check the result** (section 3.7) and keep the check in your go-live list.

### 3.3 Create a least-privilege role for the CMS

The project's rule: the app connects as its own role, never as a superuser (`03_SECURITY_AND_OPS.md`
§10). On Supabase the default `postgres` user is powerful. Do not use it for the app.

Run once in the SQL editor, replacing the placeholder with a new long random password (not the project
password):

```sql
CREATE ROLE deeptsight_cms LOGIN PASSWORD '<new-random-password>';
GRANT USAGE, CREATE ON SCHEMA public TO deeptsight_cms;
```

Notes:

- Supabase has one database per project, so you cannot create a separate database as the local setup
  does. The role owns the tables it creates, which keeps the permissions simple.
- Migrations create the tables, so they run as this same role.
- Tables created by this role should not be granted automatically to Supabase's web-API roles. **(verify)**
  with the query in section 3.7.

### 3.4 Connection strings: which one to use where

Supabase offers three ways to reach the database **(verify the hostnames and ports in the dashboard)**:

| Kind                   | Typical port       | Use it for                                        | Notes                                                                                                 |
| ---------------------- | ------------------ | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Direct connection**  | 5432               | Migrations, backups, one-off scripts              | Often IPv6 only. Many home and office networks and some hosts cannot reach IPv6.                      |
| **Session pooler**     | 5432 (pooler host) | Migrations, backups, and the app if it behaves    | Works over IPv4. Behaves like a normal connection. The username has the project reference appended.   |
| **Transaction pooler** | 6543               | Serverless apps with many short-lived connections | Does not support every Postgres feature (for example prepared statements). Test before relying on it. |

Recommendation:

- **Migrations and backups** (`pnpm cms:migrate`, `pnpm cms:backup`): direct, or the session pooler if
  your network cannot do IPv6. Run them from your own machine or a CI job, never at app start-up.
- **The live app on Vercel:** start with the **session pooler**. Move to the transaction pooler only if
  you hit connection-limit errors, and only after testing the whole CMS (publish, drafts, uploads, MFA)
  against it.
- `src/payload.config.ts` already limits each process to 5 connections (`max: 5`). Vercel can run many
  copies at once, so a pooler matters.

All three need TLS. The project already enforces it on the live site: `DATABASE_URI` must contain
`sslmode=require` or `sslmode=verify-full` (`src/lib/env-rules.ts`).

### 3.5 TLS and the certificate (test this first)

This is the part most likely to cause a confusing failure.

- The installed driver (`pg` 8.20, `pg-connection-string` 2.14) treats `sslmode=require` as a request to
  **verify** the server certificate (and prints a deprecation warning). I read this in the installed code.
- Supabase's database certificate is signed by Supabase's own authority, which Node does not trust by
  default **(verify)**. The usual symptom is an error such as _self-signed certificate in certificate
  chain_.

Ways to fix it, safest first:

1. **Trust Supabase's certificate authority.** Download the CA certificate from the project's database
   settings (SSL configuration) **(verify)**. It is a public certificate, so it may be kept in the repo.
   Then add `sslrootcert=<path to that file>` to the connection string and use `sslmode=verify-full`.
   Both the Node driver and `pg_dump` understand these parameters. If `verify-full` fails on the
   hostname, try the other host form (pooler versus direct) before weakening anything.
2. **Trust it through Node.** Set the `NODE_EXTRA_CA_CERTS` environment variable to the certificate's
   path. This works for the app but not for `pg_dump`.
3. **Do not** use `sslmode=no-verify`. It encrypts but accepts any certificate, so it does not stop an
   impostor. The project's rules also reject it on the live site.

On Vercel the certificate file must be part of the deployed bundle. A file that is only referenced from
the connection string may not be included automatically, so confirm with a test deployment
(Next.js `outputFileTracingIncludes` is the usual tool) **(verify)**.

**Test early:** create a throwaway Supabase project and run `pnpm cms:check-db` against it before you
build anything else.

### 3.6 Environment variables for the database

Set these in the hosting provider (Vercel project settings, **Environment Variables**) and in your own
`.env.local` for local runs against Supabase. Names only:

| Name                 | What                                                    | Notes                                                                                                    |
| -------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `DATABASE_URI`       | The CMS connection string, as the `deeptsight_cms` role | Must contain `sslmode=require` or `verify-full`. Production only accepts this one for the live database. |
| `PAYLOAD_SECRET`     | 32 or more random characters                            | Already required. Not related to Supabase.                                                               |
| `MFA_ENCRYPTION_KEY` | 32 random bytes, base64                                 | Already required. Losing it locks everyone out of MFA.                                                   |
| `CONTENT_SOURCE`     | `cms`                                                   | Makes the public site read the database.                                                                 |
| `CMS_ADMIN_ENABLED`  | `true`                                                  | Opens `/admin`. Your decision, after `pnpm cms:test` passes.                                             |

`DATABASE_URI_TEST` and `DATABASE_URI_RESTORE` are for development and tests only. They are rejected in
production. Do not point them at the live database.

### 3.7 Create the tables, load the content, and check

Do this from your own machine with `DATABASE_URI` temporarily pointing at the **session pooler or direct**
connection. Back up first if the database already holds anything.

1. **Check the connection:** `pnpm cms:check-db`.
2. **Create the tables:** `pnpm cms:migrate`. The schema changes only through committed migrations
   (`push` is off).
3. **Load the existing content:** `pnpm cms:import`. It imports the static content and its images.
   Approval flags stay off unless the static source already says otherwise, so an approver still has to
   approve images and credentials.
4. **Create the first administrator** with the existing `create-admin` script, which writes the password
   and authenticator key to a git-ignored file under `.data/`.
5. **Run the RLS statement** from section 3.2 (step 3).
6. **Confirm nothing is exposed.** In the SQL editor:

   ```sql
   -- 1. Row-level security is on for every table (rowsecurity should be true everywhere):
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY 1;

   -- 2. The web-API roles hold no privileges on CMS tables (this should return no rows):
   SELECT grantee, table_name, privilege_type
   FROM information_schema.role_table_grants
   WHERE table_schema = 'public' AND grantee IN ('anon', 'authenticated');
   ```

   If the second query returns rows, revoke them (`REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon,
authenticated;`) and tell whoever maintains the project.

7. **Smoke test:** `pnpm cms:smoke`, then sign in to `/admin` and publish a small edit.

### 3.8 Backups

- **Managed backups.** Paid Supabase plans include daily backups with a limited retention, and
  point-in-time recovery is an add-on **(verify the current plan details)**. Managed backups live inside
  Supabase.
- **Your own copy.** `pnpm cms:backup` runs `pg_dump` and stores the file in `.data/backups/`. For
  production, schedule it and copy the output **off the database host and off Supabase** (for example
  encrypted storage the client controls). `03_SECURITY_AND_OPS.md` §11 asks for this.
- **Use a direct or session-pooler connection for `pg_dump`**, not the transaction pooler.
- **Version match:** `pg_dump` must be the same major version as the server, or newer. Check the server
  version in the Supabase dashboard against `pg_dump --version` locally.
- **Prove a restore** before go-live: `pnpm cms:prove-backup` restores into the `_restore` database
  (a different, local database) and compares row counts.
- Deleted enquiries remain in backups until those backups expire. The retention wording must say so.

### 3.9 Limits and pitfalls

- **Connections:** each plan has a connection limit. The pooler exists to stay under it.
- **Paused projects:** the free plan can pause an idle project, and the site then fails on the next
  database call **(verify)**.
- **Extensions and Supabase's own schemas** (`auth`, `storage`, `realtime`, and others) are Supabase's.
  Do not change them. The CMS only uses `public`.
- **Do not edit the schema in the Supabase dashboard.** Every change is a migration in this repository,
  so that dev, test and live stay identical.
- **Passwords with special characters** in the connection string must be percent-encoded. A random
  alphanumeric password avoids this.

---

## 4. File storage (uploaded images)

### 4.1 Why local disk cannot stay

Today the media collection stores files in `.data/media/<database name>` (`src/cms/collections/media.ts`,
`staticDir`). On Vercel the running site's disk is read-only or discarded after each request, so an
image uploaded in the admin would disappear. Production needs an object store. Supabase Storage fits,
because it speaks the S3 protocol.

### 4.2 Create the bucket

In Supabase, **Storage → New bucket**:

- **Name:** for example `deeptsight-media`.
- **Public bucket: OFF.** Keep it private. This is essential: the CMS decides which images the public may
  see (only approved, published images on the live site). A public bucket would serve every file to
  anyone who has its address, including unapproved images.
- **File size limit:** 10 MB, matching the CMS.
- **Allowed types:** `image/jpeg`, `image/png`, `image/webp`, `image/avif`. No SVG.

Do not add storage policies that allow `anon` or `authenticated` access. With none, only the S3 keys
below can read and write.

### 4.3 S3 access keys

In the project's Storage settings there is an **S3 connection** section **(verify the label)** that shows:

- the **endpoint** (a URL ending in `/storage/v1/s3`),
- the **region** (matches the project, for example `ap-southeast-2`),
- a form to **create an access key** (an access key ID and a secret).

Create one key for the CMS. Copy the secret into your password manager and the hosting settings
immediately, as it is shown once. **These keys have full access to every bucket and ignore bucket
privacy.** They belong only in server-side environment variables. Never `NEXT_PUBLIC_*`, never the
repository, never the browser.

### 4.4 What has to change in the code (not done yet)

1. **Package.** `@payloadcms/storage-s3`, pinned to the same version as Payload (`3.90.2`). It is not in
   `TECH_STACK.md`, so it needs your approval (`CLAUDE.md` §7).
2. **Config.** In `src/payload.config.ts`, add the plugin only when the storage variables are set, so
   local development keeps using disk. A sketch (adapt to the project's env helper, which forbids
   non-null assertions):

   ```ts
   import { s3Storage } from "@payloadcms/storage-s3";

   // plugins: [ ... ]
   s3Storage({
     collections: { media: true }, // keep Payload's access control on (see 4.5)
     bucket: bucketName,
     config: {
       endpoint,
       region,
       forcePathStyle: true, // Supabase's S3 endpoint is path-style
       credentials: { accessKeyId, secretAccessKey },
     },
   });
   ```

3. **Variables**, added to `src/lib/env-rules.ts` and the server env schema, with errors that name the
   variable and never its value: `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`,
   `S3_SECRET_ACCESS_KEY`. In production they should be required whenever `CONTENT_SOURCE=cms`.
4. **Register the service** in `docs/LICENCES_SERVICES.md` (section 2).
5. **Tests.** The CMS test pipeline uses local disk. Keep the plugin off in tests (variables unset) and
   add one manual upload check against the real bucket.

### 4.5 How images reach visitors, and a gate you must know about

In CMS mode, pages show images through Payload's file route, `/api/media/file/<filename>`, wrapped by
`next/image` (`next.config.ts` allows exactly that path). With the S3 plugin and the default setting,
the same route keeps working: Payload fetches the file from the private bucket and applies the media
access rule (approved and published only, on the live site). That is the safest arrangement and needs
no change to the Content Security Policy.

**Important, from reading `src/proxy.ts`:** on the live site every `/api/...` path, including that
image route, answers 404 until `CMS_ADMIN_ENABLED=true`. So with `CONTENT_SOURCE=cms` and the admin
**closed**, public pages would request their images from a path that is blocked and the images would
fail to load. **This corrects something I said earlier:** "only `CONTENT_SOURCE=cms` on" is not a safe,
working, locked-down state for images. I have not run it, so treat it as likely rather than proven.
Decide one of these before go-live, and test it:

- **A.** Leave the admin open (`CMS_ADMIN_ENABLED=true`), as intended for the live CMS. Images work.
- **B.** Change the gate so the public image route (`/api/media/file/**`) is exempt while the rest of
  `/api` stays closed. That is a small code change in `src/proxy.ts`, but it touches the production
  gate, so it needs your explicit say-so (`CLAUDE.md` §10).

The alternative of a **public bucket with direct URLs** also needs `next.config.ts` image settings and
a Content Security Policy change for the Supabase address. It also drops the approved-only rule.
It is not recommended.

### 4.6 Upload size and the image-cleaning step

Two limits meet here:

- **Vercel request size.** Vercel limits the body of a request to a function (about 4.5 MB **(verify)**).
  An admin upload goes through a function, so images between about 4.5 MB and the CMS's 10 MB limit
  would fail on Vercel. Either lower the CMS's own limit to a safe size (the `upload.limits.fileSize`
  line in `src/payload.config.ts`) or resize images before uploading. Phone photos are often larger
  than 4.5 MB, so tell the editors.
- **Direct-to-bucket uploads would skip our safety step.** Payload's S3 plugin can upload straight from
  the browser to the bucket to avoid the size limit. But the CMS removes location and camera data from
  every upload with `sharp` on the server (`03_SECURITY_AND_OPS.md` §8, `src/cms/media/hook.ts`). A
  direct upload would bypass that. Do not enable direct (client-side) uploads unless that step is
  redesigned first.

### 4.7 Moving the images you already have

- **New live database:** with the S3 variables set, run the import (`pnpm cms:import`) and the images
  upload straight into the bucket as they are created. Nothing else to move.
- **Existing local uploads** (`.data/media/<database name>`): copy every file into the bucket under the
  **same file name**, with no folder prefix, because the database stores only the file name. Use any
  S3-capable tool pointed at the Supabase endpoint with the key from section 4.3 (the AWS CLI with
  `--endpoint-url`, or `rclone`). Afterwards open a few images in the admin to confirm.

### 4.8 Backing up the files

A database backup does **not** contain the images. Once uploads live in Supabase, they need their own
copy:

- Copy the bucket to storage you control on a schedule, for example nightly.
- `pnpm cms:backup` and `cms:prove-backup` currently copy the local media folder. They would need
  updating to cover the bucket. That is **not done**.
- Include image restore in the "one tested restore before go-live" check.

---

## 5. Hosting settings checklist (names only)

Add in Vercel under **Settings → Environment Variables**, for **Production** (and **Preview** only if
previews should reach the same data; prefer a separate Supabase project for previews):

```text
NEXT_PUBLIC_ENV           production
CONTENT_SOURCE            cms
CMS_ADMIN_ENABLED         true        (your decision; closes /admin when absent)
DATABASE_URI              <session-pooler connection string, TLS, CA certificate path>
PAYLOAD_SECRET            <32+ random characters>
MFA_ENCRYPTION_KEY        <32 random bytes, base64>
S3_BUCKET                 <bucket name>              (after 4.4 is implemented)
S3_ENDPOINT               <Supabase S3 endpoint>
S3_REGION                 <project region>
S3_ACCESS_KEY_ID          <key id>
S3_SECRET_ACCESS_KEY      <secret>
```

Plus the variables the site already needs (Turnstile, Resend, Upstash, and the rest, listed in
`docs/LICENCES_SERVICES.md`). Redeploy after changing any of them.

---

## 6. Go-live checklist

- [ ] Region chosen; paid plan; account owned by the client.
- [ ] Privacy notice approved; Supabase added to the service register, `TECH_STACK.md` and
      `DATA_FLOW_PRIVACY.md`.
- [ ] Data API off; no `anon` or `service_role` key anywhere; RLS statement run; both checks in 3.7
      clean.
- [ ] `deeptsight_cms` role in use; `postgres` is not.
- [ ] `pnpm cms:check-db` passes through the chosen connection type with certificate checking **on**.
- [ ] `pnpm cms:migrate` applied; `pnpm cms:import` run; first administrator created with MFA.
- [ ] `pnpm cms:test` passes (against the local test database).
- [ ] Bucket private; size and type limits set; S3 key created and stored only server-side.
- [ ] Storage code implemented, reviewed and tested (section 4.4); upload and display checked on a
      preview deployment.
- [ ] Decision made and tested for the `/api/media/file` gate (4.5).
- [ ] Upload size limit set below Vercel's request limit; editors told (4.6).
- [ ] Database backup scheduled with an off-site copy; bucket copy scheduled; one restore tested,
      images included.
- [ ] Environment variables set in the hosting provider, then redeployed.
- [ ] Only then: `CMS_ADMIN_ENABLED=true`, by the owner.

---

## 7. Troubleshooting

| What you see                                               | Likely cause                                                                        | What to do                                                                                                 |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| _self-signed certificate in certificate chain_             | The driver cannot verify Supabase's certificate                                     | Section 3.5: trust Supabase's CA. Do not use `no-verify`.                                                  |
| `pnpm cms:check-db` hangs or times out                     | Direct host is IPv6-only and your network is not                                    | Use the session pooler.                                                                                    |
| _password authentication failed_                           | Wrong role or password, or the pooler username form                                 | The pooler expects the role with the project reference appended; copy the exact string from the dashboard. |
| _SASL: client password must be a string_                   | `DATABASE_URI` empty or unparsable                                                  | Check the variable is set and special characters are percent-encoded.                                      |
| _prepared statement ... does not exist_                    | Transaction pooler in use                                                           | Switch to the session pooler.                                                                              |
| _too many connections_ / _remaining connection slots_      | Many serverless copies, each with its own pool                                      | Use a pooler; keep `max` small.                                                                            |
| Migrations fail with _permission denied for schema public_ | The `CREATE` grant is missing                                                       | Re-run the grants in 3.3 as the project owner.                                                             |
| Admin works but public images are missing                  | `/api/media/file` blocked by the production gate, or object missing from the bucket | Section 4.5; check the file exists in the bucket under the same name.                                      |
| Upload fails only on the live site, for large images       | Vercel request size limit                                                           | Section 4.6.                                                                                               |
| `pg_dump: server version mismatch`                         | Local `pg_dump` older than the server                                               | Install a matching or newer PostgreSQL client.                                                             |
| Whole site errors after weeks of quiet                     | Free project paused                                                                 | Upgrade, or resume in the dashboard.                                                                       |

---

## 8. Switching back, or moving elsewhere

- **The database** is plain PostgreSQL. To leave Supabase: take a `pg_dump`, restore into the new host
  (`pnpm cms:restore` shows the pattern, into a `_restore` database first), change `DATABASE_URI`, and
  redeploy.
- **The files:** copy the bucket out with an S3 tool and point the S3 variables at the new store. File
  names are unchanged, so no database edit is needed.
- **Back to local-only:** unset the S3 variables (the plugin is off, so uploads use local disk again) and
  point `DATABASE_URI` at the local database. Content edited on Supabase stays there unless you restore
  it locally first.
- **Turning the CMS off** on the live site is covered in the notes on `CONTENT_SOURCE` and
  `CMS_ADMIN_ENABLED` (set `CONTENT_SOURCE=static`, remove `CMS_ADMIN_ENABLED`, redeploy).

---

## 9. What I could not verify

- Everything about the Supabase dashboard (labels, current plan limits, whether the Sydney region and
  backup retention are as described).
- Whether Supabase's certificate verifies with `sslmode=verify-full` on each of the three hosts.
- That the transaction pooler works with this CMS.
- That tables created by the `deeptsight_cms` role are not exposed to Supabase's web-API roles (the
  query in 3.7 checks it).
- Vercel's current request-size limit and how a certificate file is bundled.
- That images fail with the admin closed (4.5). This follows from reading `src/proxy.ts` and
  `next.config.ts`, and has not been run.

When in doubt, do the throwaway-project test first. It costs nothing and answers most of these.
