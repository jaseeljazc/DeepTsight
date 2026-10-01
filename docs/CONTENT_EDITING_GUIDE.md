# Editing the website

A plain-language guide to the website's content management system (CMS). It covers signing in, changing
text and images, publishing, the enquiry inbox, and what the approval switches do.

The CMS is built and tested on the `cms/phase-2` branch. It is not live yet: the steps in
`docs/cms/MORNING_REPORT.md` come first.

---

## 1. Signing in

1. Go to `/admin` on the website (for example `https://<your domain>/admin`).
2. Enter your email address and password.
3. Open your authenticator app (Microsoft Authenticator, Google Authenticator or similar) and type the
   six-digit code shown for **DeepTsight CMS**.

You stay signed in for up to two hours. After that you sign in again, with a new code.

**Setting up the authenticator (once).** Your developer gives you a sign-in sheet with your password, an
authenticator key and ten recovery codes. In your authenticator app, choose "add account", then "enter a
setup key", and type the key (it is time-based, six digits). If your account has no authenticator yet, the
CMS shows a QR code to scan instead.

**Recovery codes.** Each one works once, in place of an authenticator code, if you lose your phone. Keep
them in a password manager or on paper, away from your computer. When you are down to two or three, ask
your developer for new ones.

**Locked out?** Five wrong passwords lock the account for 15 minutes. If you have forgotten your password,
there is no reset email: ask your developer, who runs a password-reset script and gives you a new one.

---

## 2. What you can edit

The menu on the left groups everything:

| Group                  | What is in it                                                                                                                                             |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Website content**    | Site settings (company, contact details, menu and button wording), Home, About, page introductions, search results (titles and descriptions), legal pages |
| **Services and proof** | The four services (every part of each service page, its icon, on/off and order) and the project notes on Home                                             |
| **Credentials**        | The credentials register and its four groups                                                                                                              |
| **Media**              | Every image, with its rights record                                                                                                                       |
| **Insights**           | Articles and their categories (shown only when Insights is switched on)                                                                                   |
| **Enquiries**          | The enquiry inbox and the list of "Area of enquiry" options on the contact form                                                                           |
| **System**             | Accounts and the audit log                                                                                                                                |

**What you cannot change here, on purpose:** the layout and order of sections, the nine parts of a service
page, colours, fonts, the contact form's fields and messages, web addresses of fixed pages, and security
settings. Those are part of the design and are changed by your developer.

---

## 3. Drafts, preview and publishing

Every page and record has two states: **Draft** and **Published**. The public website only ever shows the
published version.

- **Save draft** keeps your changes without showing them to anyone. You can come back later.
- **Preview** opens the page as it will look with your draft, visible only to you.
- **Publish** makes the change live. The affected pages update on their next visit.

When you publish, the CMS checks the content the same way the website does. If something is missing or
wrong (an empty required field, a service without exactly four delivery steps), it tells you which field
to fix, and nothing changes on the site until it is fixed.

**Version history.** The last 25 saved versions of each page are kept. Open a document and choose
**Versions** to compare or restore an earlier one.

**Web addresses.** A service's or article's web address is set from its "slug" (for example
`ot-cybersecurity`). It cannot be changed after the first publish, because links to it would break.

---

## 4. Approval switches

Some switches decide whether something may appear on the live site at all. Only an account with the
**approver** role can change them, and every change is recorded in the audit log with who changed it and
when:

- **Credentials → Verified:** confirmed against the issuer. Unverified credentials never appear on the live site.
- **Project notes → Disclosure approved:** the client has agreed it may be published.
- **Media → Approved for public use:** the image's rights are confirmed and it is safe to show.
- **Legal pages → Status:** set to "Approved by adviser" only when your adviser has approved the wording.
- **Site settings → Insights switched on:** shows the Insights section and its menu link.

A project note also has a tick box, **"Contains no client, site or plant names"**. It must be ticked before
the note can be published.

---

## 5. Things that must never be entered

The website is a public work sample for a security consultancy. Never put any of these anywhere in the CMS,
including drafts, captions and file names:

- client names, site or plant names, locations of client assets;
- network details, IP addresses, equipment tags, screenshots of control systems;
- vulnerability information;
- photographs of a client site, plant, equipment or screens.

Uploaded photographs have their hidden location data removed automatically, but the picture itself can
still give a site away. If in doubt, leave it out.

**Placeholders.** Text that still contains `[PLACEHOLDER]`, `TODO(CLIENT)` or `TBD — CLIENT` is marked as
unfinished. On the live site, anything containing one of these cannot be published, and the site cannot be
built while one is visible.

---

## 6. Images

1. Go to **Media → Create new**, choose the file (JPEG, PNG, WebP or AVIF, up to 10 MB).
2. Write **alternative text**: what the image shows, for people who cannot see it. Tick **decorative** only
   if the image adds nothing to the text.
3. Write the **caption** (shown under the image) and fill in the rights record: source, licence, usage
   rights and attribution.
4. An approver ticks **Approved for public use** once the rights are confirmed.

SVG files are refused (they can contain code). Every upload is re-saved without its hidden metadata.

---

## 7. The enquiry inbox

Every enquiry from the contact form is saved under **Enquiries → Enquiries**, as well as being emailed to you.

- The top of the list shows how many are **unread** and how many **email notifications failed**. A failed
  notification means the enquiry is here but did not reach your mailbox: read it here.
- Search by name, email, organisation or any word in the message.
- Tick **Read** once you have dealt with an enquiry.
- **Delete** removes an enquiry permanently. Delete enquiries you no longer need, and any you are asked to
  delete. (Copies remain in backups until those expire.)

**Enquiry types.** Under **Enquiries → Enquiry types** you can rename, reorder or switch off the options in
the "Area of enquiry" list. Switch an option off rather than deleting it; old enquiries keep the label they
were sent with.

---

## 8. Contact details and the map link

Under **Site settings → Contact**: phone, email, LinkedIn and other social links, the location line and the
**Google Maps link** (paste the "Share" link from Google Maps; it appears as an "Open in Google Maps" link on
the contact page). The office address and business hours have their own tab and stay hidden until their
switch is turned on.

---

## 9. If something looks wrong

- **I published but the page has not changed:** reload the page once. If it still has not changed, the
  publish may have been refused: open the document and look for a red message.
- **The site shows something I did not expect:** check **System → Audit log** for recent changes, then use
  **Versions** on that document to restore the previous version.
- **I cannot sign in:** see section 1. Do not share your password or recovery codes with anyone, including
  your developer.
