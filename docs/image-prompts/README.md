# Image briefs for placeholder frames

Every reserved image position on the site renders as a dashed placeholder frame until an
approved image exists. Each frame links to one brief in this folder. The frame's id matches the
file name and the `imageSlotSource` entry in `src/content/source/media.ts`.

| Slot id                           | Page and position                      | Aspect        | Minimum size | Brief                                                                    |
| --------------------------------- | -------------------------------------- | ------------- | ------------ | ------------------------------------------------------------------------ |
| `slot-home-close`                 | Home, closing invitation, right column | 4:5 portrait  | 1600 × 2000  | [slot-home-close.md](slot-home-close.md)                                 |
| `slot-about-site`                 | About, image pair, left                | 3:2 landscape | 2400 × 1600  | [slot-about-site.md](slot-about-site.md)                                 |
| `slot-about-desk`                 | About, image pair, right               | 4:5 portrait  | 1600 × 2000  | [slot-about-desk.md](slot-about-desk.md)                                 |
| `slot-service-control-detail`     | Control systems and E&I, part 3.0      | 3:2 landscape | 2400 × 1600  | [slot-service-control-detail.md](slot-service-control-detail.md)         |
| `slot-service-cyber-detail`       | OT cybersecurity, part 3.0             | 3:2 landscape | 2400 × 1600  | [slot-service-cyber-detail.md](slot-service-cyber-detail.md)             |
| `slot-service-idmz-detail`        | IT/OT segregation, part 3.0            | 3:2 landscape | 2400 × 1600  | [slot-service-idmz-detail.md](slot-service-idmz-detail.md)               |
| `slot-service-reliability-detail` | Plant reliability, part 3.0            | 3:2 landscape | 2400 × 1600  | [slot-service-reliability-detail.md](slot-service-reliability-detail.md) |

## Read this before generating anything

1. **Real photography comes first.** This client sells engineering judgement and security. A real
   photograph of real work, even a modest one, is worth more than a polished generated image. Each
   brief doubles as a shot list for a photographer.
2. **Never generate the founder portrait.** `public/images/founder-portrait.jpg` is currently an
   AI-generated image of a person who is not the founder. It must be replaced by a real photograph
   of Deepak Pazhoor before launch. There is deliberately no generation prompt for it.
3. **Disclose any generated image.** Record it in `media.ts` with a `source` that says it is
   generated, and keep "Illustrative image" in its caption. Never present a generated image as a
   photograph of the client's work, site or people.
4. **Leave out identifying detail.** No legible equipment labels, tag numbers, site names, company
   logos, screen contents, network topology or anything else that identifies a real facility
   (CR-05).
5. **Check the output for tells before use.** Look for garbled text, melted hands, impossible
   cable runs, duplicated components, over-sharpened HDR and glowing screens. Reject the image
   rather than retouch it.
6. **Keep the other AI mocks on the list.** They also need replacing: `hero-control-room.jpg`,
   `ot-industrial-rack.jpg`, `perth-industrial-hub.jpg`, `services-facility.jpg`,
   `service-*.jpg`, `credentials-audit.jpg` and `contact-office.jpg`. The briefs below set the
   standard those replacements should meet.

## House style shared by every brief

End every prompt with this block:

> Documentary industrial photography, natural and available light, true-to-life colour with
> slightly muted saturation and cool neutral greys, soft contrast, fine realistic grain, shot on a
> full-frame camera with a 35mm or 50mm prime at f/4, eye-level or slightly low vantage, calm and
> unposed, generous negative space, no text, no logos, no legible labels, no screens facing camera,
> no dramatic lighting, no lens flare, no HDR, no neon, no blue cyber glow.

Shared negative prompt:

> text, letters, numbers, labels, signage, logos, brand names, watermark, UI, glowing screens,
> hologram, padlock, shield icon, binary code, circuit board pattern, hooded figure, neon, blue and
> orange grading, HDR, oversaturated, lens flare, bokeh balls, fisheye, tilt-shift, cartoon, 3D
> render, illustration, CGI, plastic skin, extra fingers, distorted hands, duplicated objects

For all 17 images, including the mock replacements, see [ALL_PROMPTS.md](ALL_PROMPTS.md).

The palette on the site is cool enclosure grey, anthracite and one blue accent (`#0E50ED`). Images graded
cool and neutral sit in it naturally. Warm, saturated or teal-and-orange grading will fight it.
