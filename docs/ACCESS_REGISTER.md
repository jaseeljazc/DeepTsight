# Access & Ownership Register

This register details the administrative accounts required to govern the DeepTsight Consulting website infrastructure.

**IMPORTANT: This document must be kept strictly confidential. The client (Founder) must retain Owner-level access to all listed platforms.**

| Platform                 | Purpose                                   | Access Role Needed (Founder)  | Access Role Needed (Developer)                     |
| ------------------------ | ----------------------------------------- | ----------------------------- | -------------------------------------------------- |
| **Domain Registrar**     | Domain Name Ownership & DNS               | Owner / Admin                 | None (or restricted technical access)              |
| **Vercel**               | Hosting & Deployments                     | Owner                         | Member / Contributor                               |
| **Cloudflare**           | DNS Routing & Turnstile Security          | Owner / Super Admin           | Administrator                                      |
| **Upstash**              | Rate-limiting infrastructure              | Owner                         | Member                                             |
| **Resend**               | Transactional Email API                   | Owner                         | Member                                             |
| **Plausible Analytics**  | Traffic Analytics                         | Owner                         | Viewer                                             |
| **GitHub**               | Source Code Repository                    | Owner                         | Collaborator (with write access)                   |
| **CMS admin (`/admin`)** | Content and the enquiry inbox             | Editor + Approver (MFA)       | Editor only, while building; remove after handover |
| **PostgreSQL**           | CMS database (content, inbox, audit log)  | Database owner (host account) | Application role `deeptsight_cms` only             |
| **Database host**        | Production PostgreSQL (TBD — CLIENT, U-2) | Owner                         | Member                                             |
| **Media storage**        | Uploaded images (TBD — CLIENT, U-2)       | Owner                         | Member                                             |

## CMS accounts and roles

- Accounts are created only with `scripts/cms/create-admin.ts` (no sign-up). Each account has the
  `editor` role, the `approver` role, or both. The founder holds both.
- **Editor:** edits content, publishes, manages the inbox. **Approver:** additionally sets the approval
  flags (credential verified, project-note disclosure, image approved for public use, legal status,
  Insights switch) and can change roles. Every flag and role change is in the audit log.
- Every account must enrol an authenticator app (MFA) and keep its ten recovery codes offline.
- Accounts lock for 15 minutes after 5 wrong passwords. Password resets: `scripts/cms/reset-admin-password.ts`.

## Database roles

- `deeptsight_cms`: the application's login role. Not a superuser; owns only the three development
  databases (`deeptsight_cms_dev`, `_test`, `_restore`) and cannot create databases or roles. Production
  uses the same pattern: a role that owns only the production database, created by the database owner.
- The PostgreSQL superuser (`postgres`) is for the owner only and is never used by the application,
  scripts or agents.

## Access Handover Checklist

- [ ] All platform accounts created using a DeepTsight organizational email (e.g., `admin@deeptsight.com.au`), not a personal email or agency email.
- [ ] Billing information transferred to DeepTsight.
- [ ] Developer access downgraded from `Owner` to `Contributor/Member` on Vercel, Cloudflare, Upstash, Resend, and GitHub.
- [ ] Unused developer accounts or agency sub-accounts removed from all platforms.
- [ ] Two-Factor Authentication (2FA) enforced on all Owner accounts.
- [ ] CMS: developer CMS accounts deleted or reduced to editor; founder holds editor + approver with MFA enrolled.
- [ ] CMS: production database role owns only the production database; superuser credentials held by the owner only.
