import type { MediaAsset, ImageSlot } from "../types";

/*
 * Media register (CR-04).
 *
 * Every photograph currently in /public/images is an AI-generated mock supplied during early
 * development. None is approved photography, so each record is marked as a placeholder and
 * approvedForPublic is false. The founder portrait in particular is not a photograph of the
 * founder and must be replaced before launch.
 * TODO(CLIENT): approved photography with documented source, licence and usage rights.
 */
const MOCK_SOURCE = "[PLACEHOLDER] AI-generated development mock — replace before launch";
const MOCK_LICENCE = "None — mock image, not licensed for publication";
const MOCK_RIGHTS = "Not approved for public use";

export const mediaRegisterSource: MediaAsset[] = [
  {
    id: "img-portrait-founder",
    src: "/images/founder-portrait.jpg",
    alt: "Portrait placeholder for the founder. Mock image, not a photograph of the founder.",
    caption: "Founder portrait. Mock image pending an approved photograph.",
    width: 896,
    height: 1200,
    source: MOCK_SOURCE,
    licence: MOCK_LICENCE,
    usageRights: MOCK_RIGHTS,
    approvedForPublic: false,
  },
  {
    id: "img-hero-control-room",
    src: "/images/hero-control-room.jpg",
    alt: "Operator console in an industrial control room with process graphics on two screens",
    caption: "Operator console, industrial control room. Representative image.",
    width: 1200,
    height: 896,
    source: MOCK_SOURCE,
    licence: MOCK_LICENCE,
    usageRights: MOCK_RIGHTS,
    approvedForPublic: false,
  },
  {
    id: "img-ot-industrial-rack",
    src: "/images/ot-industrial-rack.jpg",
    alt: "Open control system enclosure with PLC modules, network switches and fibre patching",
    caption: "Control system enclosure with PLC and network modules. Representative image.",
    width: 1200,
    height: 896,
    source: MOCK_SOURCE,
    licence: MOCK_LICENCE,
    usageRights: MOCK_RIGHTS,
    approvedForPublic: false,
  },
  {
    id: "img-perth-industrial-hub",
    src: "/images/perth-industrial-hub.jpg",
    alt: "Bulk commodity port and processing plant on the Western Australian coast",
    caption: "Port and processing infrastructure, Western Australia. Representative image.",
    width: 1376,
    height: 768,
    source: MOCK_SOURCE,
    licence: MOCK_LICENCE,
    usageRights: MOCK_RIGHTS,
    approvedForPublic: false,
  },
  {
    id: "img-services-facility",
    src: "/images/services-facility.jpg",
    alt: "Multi-discipline process facility seen from a control room mezzanine",
    caption: "Process facility from the control room mezzanine. Representative image.",
    width: 1024,
    height: 1024,
    source: MOCK_SOURCE,
    licence: MOCK_LICENCE,
    usageRights: MOCK_RIGHTS,
    approvedForPublic: false,
  },
  {
    id: "img-service-control",
    src: "/images/service-control.jpg",
    alt: "Control systems engineering workstation showing PLC logic",
    caption: "Control systems engineering workstation. Representative image.",
    width: 1024,
    height: 1024,
    source: MOCK_SOURCE,
    licence: MOCK_LICENCE,
    usageRights: MOCK_RIGHTS,
    approvedForPublic: false,
  },
  {
    id: "img-service-cyber",
    src: "/images/service-cyber.jpg",
    alt: "Monitoring console showing industrial network segmentation",
    caption: "OT network monitoring console. Representative image.",
    width: 1024,
    height: 1024,
    source: MOCK_SOURCE,
    licence: MOCK_LICENCE,
    usageRights: MOCK_RIGHTS,
    approvedForPublic: false,
  },
  {
    id: "img-service-idmz",
    src: "/images/service-idmz.jpg",
    alt: "Network equipment rack in an industrial communications room",
    caption: "Communications rack, industrial boundary network. Representative image.",
    width: 1024,
    height: 1024,
    source: MOCK_SOURCE,
    licence: MOCK_LICENCE,
    usageRights: MOCK_RIGHTS,
    approvedForPublic: false,
  },
  {
    id: "img-service-reliability",
    src: "/images/service-reliability.jpg",
    alt: "Heavy rotating machinery fitted with vibration monitoring sensors",
    caption: "Rotating machinery with vibration instrumentation. Representative image.",
    width: 1024,
    height: 1024,
    source: MOCK_SOURCE,
    licence: MOCK_LICENCE,
    usageRights: MOCK_RIGHTS,
    approvedForPublic: false,
  },
  {
    id: "img-credentials-audit",
    src: "/images/credentials-audit.jpg",
    alt: "Engineering standards documentation on a review desk",
    caption: "Standards documentation under review. Representative image.",
    width: 1024,
    height: 1024,
    source: MOCK_SOURCE,
    licence: MOCK_LICENCE,
    usageRights: MOCK_RIGHTS,
    approvedForPublic: false,
  },
  {
    id: "img-contact-office",
    src: "/images/contact-office.jpg",
    alt: "Engineering office in the Perth central business district",
    caption: "Engineering office, Perth. Representative image.",
    width: 1024,
    height: 1024,
    source: MOCK_SOURCE,
    licence: MOCK_LICENCE,
    usageRights: MOCK_RIGHTS,
    approvedForPublic: false,
  },
];

/*
 * Reserved image positions with no photograph yet. Each renders as a marked frame and has a
 * generation or photography brief in docs/image-prompts/.
 */
export const imageSlotSource: ImageSlot[] = [
  {
    id: "slot-service-control-detail",
    subject: "Marshalling cabinet terminal strips during a loop check",
    caption: "Marshalling cabinet during loop checking.",
    promptRef: "docs/image-prompts/slot-service-control-detail.md",
  },
  {
    id: "slot-service-cyber-detail",
    subject: "Engineer marking up a zone and conduit drawing at a site desk",
    caption: "Zone and conduit drawing under review.",
    promptRef: "docs/image-prompts/slot-service-cyber-detail.md",
  },
  {
    id: "slot-service-idmz-detail",
    subject: "Closed communications cabinet in a site switchroom, no legible labels",
    caption: "Boundary network cabinet in a site switchroom.",
    promptRef: "docs/image-prompts/slot-service-idmz-detail.md",
  },
  {
    id: "slot-service-reliability-detail",
    subject: "Vibration reading taken on a pump bearing housing",
    caption: "Condition monitoring on a pump bearing housing.",
    promptRef: "docs/image-prompts/slot-service-reliability-detail.md",
  },
  {
    id: "slot-about-site",
    subject: "Engineer in PPE walking a process plant pipe rack in early light",
    caption: "Site walkdown on an operating process plant.",
    promptRef: "docs/image-prompts/slot-about-site.md",
  },
  {
    id: "slot-about-desk",
    subject: "Marked-up drawings, scale rule and field notebook on a site office desk",
    caption: "Drawing markup at a site office.",
    promptRef: "docs/image-prompts/slot-about-desk.md",
  },
  {
    id: "slot-home-close",
    subject: "Western Australian industrial landscape at dusk, plant lighting coming on",
    caption: "Industrial site at dusk, Western Australia.",
    promptRef: "docs/image-prompts/slot-home-close.md",
  },
];
