# Access & Ownership Register

This register details the administrative accounts required to govern the DeepTsight Consulting website infrastructure.

**IMPORTANT: This document must be kept strictly confidential. The client (Founder) must retain Owner-level access to all listed platforms.**

| Platform                | Purpose                          | Access Role Needed (Founder) | Access Role Needed (Developer)        |
| ----------------------- | -------------------------------- | ---------------------------- | ------------------------------------- |
| **Domain Registrar**    | Domain Name Ownership & DNS      | Owner / Admin                | None (or restricted technical access) |
| **Vercel**              | Hosting & Deployments            | Owner                        | Member / Contributor                  |
| **Cloudflare**          | DNS Routing & Turnstile Security | Owner / Super Admin          | Administrator                         |
| **Upstash**             | Rate-limiting infrastructure     | Owner                        | Member                                |
| **Resend**              | Transactional Email API          | Owner                        | Member                                |
| **Plausible Analytics** | Traffic Analytics                | Owner                        | Viewer                                |
| **GitHub**              | Source Code Repository           | Owner                        | Collaborator (with write access)      |

## Access Handover Checklist

- [ ] All platform accounts created using a DeepTsight organizational email (e.g., `admin@deeptsight.com.au`), not a personal email or agency email.
- [ ] Billing information transferred to DeepTsight.
- [ ] Developer access downgraded from `Owner` to `Contributor/Member` on Vercel, Cloudflare, Upstash, Resend, and GitHub.
- [ ] Unused developer accounts or agency sub-accounts removed from all platforms.
- [ ] Two-Factor Authentication (2FA) enforced on all Owner accounts.
