# Image prompts: every image on the site

This covers 17 images: the 7 empty slots (dashed frames on the site) and the 10 AI mock photos
that must be replaced before launch. Each entry gives the page it's on, the crop, a prompt ready
to paste and anything specific to avoid. The per-slot files in this folder hold longer notes and
shot lists for a photographer.

**Not included: the founder portrait.** It has to be a real photograph of Deepak Pazhoor, so
never generate it.

---

## How to make it read as a real photograph

Generated images give themselves away through the same few habits. Each prompt below already
works against them, so keep these rules when you edit one.

1. **Describe a photo, not a picture.** Name the camera, lens, aperture and time of day. Words
   like _cinematic, epic, stunning, hyperrealistic, 8k, masterpiece, dramatic, award-winning_ push
   the output towards the polished stock look. Leave them out.
2. **Ask for ordinary imperfection.** Scuffed paint, cable ties, a coiled patch lead, uneven
   light, a slightly off-level horizon, dust on a cabinet top. Real sites are clean but used.
3. **Keep people small and turned away.** Faces and hands are where generators fail most, and
   anonymous figures also keep real people and sites unidentifiable.
4. **Use flat, available light.** Overcast daylight, fluorescent tubes, early side light. Avoid
   rim light, glow and haze.
5. **Keep the grading muted and cool-neutral.** The site renders every image at 82% saturation
   against grey and anthracite grounds with one blue accent. Warm, teal-and-orange or saturated
   images will fight the page.
6. **Keep text out of the frame.** Generators write gibberish on labels. Ask for blank tags,
   turned-away screens and out-of-focus signage.
7. **Generate several, keep one.** Make 4–8 variations and choose the dullest believable one, not
   the most impressive.

### Reject the image if you see

- Letters or numbers anywhere, even blurred
- Hands with the wrong number of fingers, or tools held impossibly
- Cables that go nowhere, merge or loop back into themselves
- Repeated identical modules or valves in a perfect row
- Glowing screens, blue light spill, or smoke or haze indoors
- A rendered look: plastic surfaces, over-sharp edges, or HDR halos around the skyline
- PPE worn wrong: no hard hat on a plant, or hi-vis without reflective tape
- Anything that looks like a specific real site, logo or company livery

### Shared ending (add to every prompt)

> Documentary photograph, natural available light, true-to-life colour with slightly muted
> saturation and cool neutral greys, soft contrast, fine natural grain, realistic minor wear and
> imperfection, calm and unposed, no text, no logos, no legible labels or numbers.

### Shared negative prompt

> text, letters, numbers, labels, signage, logo, brand name, watermark, UI, glowing screen,
> hologram, padlock, shield, binary code, circuit pattern, hooded figure, neon, blue glow,
> teal and orange, HDR, oversaturated, lens flare, bokeh balls, fisheye, tilt-shift, cinematic,
> dramatic lighting, rim light, fog, smoke, 3D render, CGI, illustration, cartoon, plastic,
> extra fingers, distorted hands, duplicated objects, symmetrical composition, face looking at camera

### Aspect ratios

| Site crop | Ratio | Minimum size | Midjourney  | Others                 |
| --------- | ----- | ------------ | ----------- | ---------------------- |
| wide      | 21:9  | 2940 × 1260  | `--ar 21:9` | generate 16:9 and crop |
| landscape | 3:2   | 2400 × 1600  | `--ar 3:2`  | 3:2                    |
| classic   | 4:3   | 2400 × 1800  | `--ar 4:3`  | 4:3                    |
| portrait  | 4:5   | 1600 × 2000  | `--ar 4:5`  | 4:5                    |

---

## Home page

### 1. Hero: `hero-control-room.jpg` (replace mock)

- **Crop:** wide 21:9, the first thing a visitor sees
- **Caption:** Operator console, industrial control room. Representative image.

> Wide photograph of an industrial control room on an operating plant during a quiet day shift,
> seen from the back of the room at standing height, a long curved operator desk with several
> monitors turned slightly away so no screen content is readable, one operator seated at the far
> end seen from behind, grey acoustic ceiling tiles with fluorescent panels, a large wall display
> out of focus and too far away to read, cable trays behind a raised floor edge, a hard hat and a
> high-visibility vest resting on a spare chair, a paper logbook and a mug on the desk, flat even
> interior light, shot on a full-frame camera with a 24mm lens at f/5.6, ISO 1600, slight natural
> noise. [shared ending]

Avoid: dark room with glowing screens, blue light, many operators, dramatic angle.

### 2. Problems section: `ot-industrial-rack.jpg` (replace mock)

- **Crop:** classic 4:3
- **Caption:** Control system enclosure with PLC and network modules. Representative image.

> Photograph of an open steel control system enclosure in an electrical switchroom, door swung
> open to the left, DIN-rail mounted PLC modules and a small industrial Ethernet switch, neatly
> bundled grey and blue wiring in slotted cable duct, a few yellow fibre patch leads looping to a
> patch panel, blank white ferrule markers, a laminated document pocket on the inside of the door
> with papers blurred, cool overhead fluorescent light with a soft reflection on the cabinet paint,
> light dust on the top edge, three-quarter view from standing height, shot with a 35mm lens at
> f/4, ISO 800. [shared ending]

Avoid: data-centre server racks, blinking LEDs as a feature, text on modules, rainbow cables.

### 3. "Based in Perth" section: `perth-industrial-hub.jpg` (replace mock)

- **Crop:** landscape 3:2
- **Caption:** Port and processing infrastructure, Western Australia. Representative image.

> Landscape photograph of a bulk commodity port and processing area on a dry Western Australian
> coastline in mid-morning, long conveyor gantries running to a ship loader, stockpiles of red-brown
> ore, low scrub and red earth in the foreground, a flat pale-blue sky with thin high cloud, heat
> haze very slight, photographed from a low rise about a kilometre away with a 70mm lens at f/8,
> muted natural colour, no ships' names or company markings visible. [shared ending]

Avoid: sunset drama, drone top-down view, recognisable real port layout, saturated red.

### 4. Closing band: `slot-home-close` (empty slot)

- **Crop:** portrait 4:5
- **Caption:** Industrial site at dusk, Western Australia.

> Vertical photograph of a processing plant on flat Western Australian land at blue hour just
> after sunset, plant area lighting starting to come on as small warm points, the structure
> silhouetted against a clear fading sky, a strip of red earth and low saltbush in the foreground,
> a single light tower, no people, calm and still, shot on a tripod with a 50mm lens at f/8, one
> second exposure, fine grain, the colour restrained with the sky cool and slightly desaturated.
> [shared ending]

Avoid: orange-and-teal sunset, flare, flames or flares from stacks, light trails.

---

## Services

### 5. Services page header: `services-facility.jpg` (replace mock)

- **Crop:** wide 21:9
- **Caption:** Process facility from the control room mezzanine. Representative image.

> Wide photograph looking out through a large window from a control room mezzanine over a
> multi-discipline process facility, pipe racks, tanks, a small compressor shelter and cable
> ladders below, overcast even daylight, the window frame and a strip of the desk edge visible
> in the lower foreground slightly out of focus, a faint reflection on the glass, shot with a
> 28mm lens at f/8. [shared ending]

Avoid: glowing interior, people at the window, dramatic sky.

### 6. Control systems and E&I: `service-control.jpg` (replace mock)

- **Crop:** landscape 3:2 on the services page, cropped to 21:9 on the service page, so keep
  the subject in the middle horizontal band
- **Caption:** Control systems engineering workstation. Representative image.

> Photograph of an engineering workstation in a site office, a laptop and a second monitor
> angled away from camera so the screens are not readable, a printed cause and effect matrix and
> a loop drawing on the desk with pencil markups, a multimeter and a coil of test leads, a hard hat
> on the desk corner, window light from the left, ordinary office clutter, shot at desk height with
> a 35mm lens at f/4. [shared ending]

Avoid: code on screens, glowing monitors, dark room.

### 7. Control systems and E&I detail: `slot-service-control-detail` (empty slot)

- **Crop:** landscape 3:2
- **Caption:** Marshalling cabinet during loop checking.

> Close photograph of a marshalling cabinet during a loop check, rows of grey terminal blocks with
> blank white markers, orange and blue field wiring entering from the bottom gland plate, a gloved
> hand holding a multimeter probe to one terminal, the rest of the technician out of frame, a
> clipboard with a blurred checksheet resting on the cabinet frame, cool fluorescent light, shallow
> depth of field at f/2.8 with a 50mm lens. [shared ending]

Avoid: bare hands on live terminals, sparks, legible terminal numbers.

### 8. OT cybersecurity: `service-cyber.jpg` (replace mock)

- **Crop:** landscape 3:2, cropped to 21:9 on the service page
- **Caption:** OT network monitoring console. Representative image.

> Photograph of a small engineering room on a plant, an industrial network cabinet with its door
> open showing managed Ethernet switches and a firewall appliance on DIN rail, patch leads neatly
> labelled with blank tags, a laptop on a fold-out shelf connected by a single blue cable with its
> screen turned away, flat overhead light, a scuffed vinyl floor, shot with a 35mm lens at f/4.
> [shared ending]

Avoid: dark room, hacker imagery, code, padlocks, glow, anything that looks like a data centre.

### 9. OT cybersecurity detail: `slot-service-cyber-detail` (empty slot)

- **Crop:** landscape 3:2
- **Caption:** Zone and conduit drawing under review.

> Overhead photograph of an A1 network architecture drawing printed in black line work on white
> paper, spread on a site office desk, an engineer's hand marking an area boundary with a red pen,
> a highlighter and a scale rule beside it, the drawing's text too small and out of focus to read,
> a coffee mug ring on the paper corner, soft window light from one side, shot from above with a
> 35mm lens at f/5.6. [shared ending]

Avoid: readable labels or IP addresses, glowing diagrams, a tablet instead of paper.

### 10. IT/OT segregation: `service-idmz.jpg` (replace mock)

- **Crop:** landscape 3:2, cropped to 21:9 on the service page
- **Caption:** Communications rack, industrial boundary network. Representative image.

> Photograph of a communications room on an industrial site, two floor-standing network racks
> with front doors closed and a perforated door showing dim shapes of equipment behind, a cable
> ladder overhead with neatly dressed fibre, an earth bar on the wall, a fire extinguisher and a
> small step stool in the corner, cool even light, painted concrete floor with a yellow walkway
> line, shot with a 28mm lens at f/5.6 from the doorway. [shared ending]

Avoid: blinking lights as the subject, data-centre aisles, blue light.

### 11. IT/OT segregation detail: `slot-service-idmz-detail` (empty slot)

- **Crop:** landscape 3:2
- **Caption:** Boundary network cabinet in a site switchroom.

> Photograph of a single closed grey wall-mounted network cabinet in an electrical switchroom,
> keyed lock on the door, a blank white equipment tag, a gland plate with cables entering from
> below in a neat bundle, switchboard panels out of focus to the side, flat fluorescent light,
> slight reflection on the powder-coated door, shot at eye level with a 50mm lens at f/4.
> [shared ending]

Avoid: an open door with visible configuration, padlock icons, text on the tag.

### 12. Plant reliability: `service-reliability.jpg` (replace mock)

- **Crop:** landscape 3:2, cropped to 21:9 on the service page
- **Caption:** Rotating machinery with vibration instrumentation. Representative image.

> Photograph of a large electric motor driving a centrifugal pump on a concrete plinth inside a
> pump house, painted guard over the coupling, small vibration sensors on the bearing housings with
> armoured cables running to a junction box, drip tray, grating floor, soft daylight from high
> windows, slight wear on the paint, shot at a low three-quarter angle with a 35mm lens at f/5.6.
> [shared ending]

Avoid: oil leaks, rust, sparks, shiny new-render look.

### 13. Plant reliability detail: `slot-service-reliability-detail` (empty slot)

- **Crop:** landscape 3:2
- **Caption:** Condition monitoring on a pump bearing housing.

> Close photograph of a technician's gloved hand holding a handheld vibration probe against a pump
> bearing housing, the handheld meter's screen turned away, the sleeve of a high-visibility shirt
> with reflective tape visible, the pump casing and pipework softly out of focus behind, natural
> side light, shot with a 50mm lens at f/2.8. [shared ending]

Avoid: readable meter values, bare hands, a face in frame.

---

## About page

### 14. Site walkdown: `slot-about-site` (empty slot)

- **Crop:** landscape 3:2
- **Caption:** Site walkdown on an operating process plant.

> Horizontal photograph along an elevated steel grating walkway beside a large pipe rack on an
> operating process plant in early morning, strong perspective, insulated pipes of varying
> diameter with aluminium cladding, gate valves with handwheels, overhead cable tray, one engineer
> seen from behind at a small scale walking away, white hard hat, safety glasses, long-sleeve
> orange high-visibility shirt with reflective tape, gloves, clipboard at their side, low side
> light casting long soft shadows across the grating, pale clear sky, shot with a 35mm lens at
> f/5.6. [shared ending]

Avoid: face visible, heroic pose, pointing, rust and decay, fire.

### 15. Drawing markup: `slot-about-desk` (empty slot)

- **Crop:** portrait 4:5
- **Caption:** Drawing markup at a site office.

> Vertical photograph of a site office desk from slightly above, marked-up engineering drawings
> with red and green pen, a triangular scale rule, a worn hardback field notebook held open with a
> pen, safety glasses folded on top, the corner of a laptop closed, window light from the side, the
> drawing text too small and soft to read, ordinary desk wear, shot with a 50mm lens at f/4.
> [shared ending]

Avoid: readable text, a styled flat-lay, plants and props, perfect symmetry.

---

## Credentials and contact

### 16. Credentials page header: `credentials-audit.jpg` (replace mock)

- **Crop:** wide 21:9
- **Caption:** Standards documentation under review. Representative image.

> Wide low photograph along a meeting table in a site office, a spiral-bound standards document
> open with tabbed sticky notes, a printed report with a highlighter, a pair of safety glasses, the
> rest of the table empty and receding, window light from the far end, the document text soft
> and unreadable, shot with a 35mm lens at f/4 from table height. [shared ending]

Avoid: certificate frames, trophies, readable titles or logos.

### 17. Contact page: `contact-office.jpg` (replace mock)

- **Crop:** landscape 3:2
- **Caption:** Engineering office, Perth. Representative image.

> Photograph of a quiet small engineering office on an upper floor in a city in late afternoon,
> one desk with a monitor turned away, a stack of drawings, a hard hat on a shelf, a window view
> of low mid-rise buildings in soft focus with no recognisable landmark, pale blinds half down,
> neutral interior light mixed with daylight, shot with a 35mm lens at f/4. [shared ending]

Avoid: recognisable Perth skyline landmarks, a busy open-plan office, people.

---

## After you generate

1. Save each image with its file name above (for example `hero-control-room.jpg`) at the
   minimum size or larger, as JPEG at about 85% quality.
2. Put it in `public/images/`. For an empty slot, tell me the file name and I'll wire it into
   `media.ts` in place of the dashed frame.
3. The project rules (CLAUDE.md §3 and README point 3) require every generated image to be
   recorded as generated in `media.ts`, and to keep "Representative image" or "Illustrative image"
   in its caption. It can look like a real photograph. It must never be presented as a photograph
   of the client's own sites or work.
