import type { Metadata } from "next";
import { Button } from "@/components/primitives/button";
import { Link } from "@/components/primitives/link";
import { Field } from "@/components/primitives/field";
import { Input } from "@/components/primitives/input";
import { Textarea } from "@/components/primitives/textarea";
import { Select } from "@/components/primitives/select";
import { Checkbox } from "@/components/primitives/checkbox";
import { Radio } from "@/components/primitives/radio";
import { Badge } from "@/components/primitives/badge";
import { Alert } from "@/components/primitives/alert";
import { SpecBlock } from "@/components/primitives/spec-block";
import { SectionHeader } from "@/components/primitives/section-header";
import { DrawingRule } from "@/components/primitives/drawing-rule";
import { Placeholder, MarkedText } from "@/components/primitives/placeholder";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/primitives/table";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Wordmark } from "@/components/layout/wordmark";
import { ProcessSequence } from "@/components/content/process-sequence";

export const metadata: Metadata = {
  title: "Design system",
  description: "Internal specimen of the DeepTsight design tokens and primitives.",
  robots: {
    index: false,
    follow: false,
  },
};

const swatches = [
  ["ground", "bg-ground"],
  ["ground-deep", "bg-ground-deep"],
  ["panel", "bg-panel"],
  ["white", "bg-white"],
  ["rule", "bg-rule"],
  ["control", "bg-control"],
  ["steel-600", "bg-steel-600"],
  ["ink-700", "bg-ink-700"],
  ["ink-900", "bg-ink-900"],
  ["primary", "bg-primary"],
  ["primary-on-dark", "bg-primary-on-dark"],
  ["error", "bg-error"],
  ["status", "bg-status"],
] as const;

/** Internal harness, excluded from indexing. Every primitive in its main states. */
export default function DesignSystemPage() {
  return (
    <main id="main-content" tabIndex={-1} className="bg-ground min-h-screen outline-none">
      <Container className="py-10">
        <Wordmark />
        <DrawingRule className="mt-6" />
        <h1 className="font-display text-h1 text-ink-900 mt-12 font-medium">Design system</h1>
        <p className="text-lead text-ink-700 measure mt-6">
          Internal specimen. Tokens live in{" "}
          <code className="font-mono">src/styles/globals.css</code> and are documented in DESIGN.md.
        </p>
      </Container>

      <Section spacing="tight" aria-labelledby="colour-heading">
        <Container>
          <SectionHeader id="colour-heading" number="1.0" title="Colour" />
          <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {swatches.map(([name, className]) => (
              <li key={name}>
                <div className={`border-rule h-20 border ${className}`} />
                <p className="text-ink-900 text-caption mt-2 font-mono">{name}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section spacing="tight" aria-labelledby="type-heading">
        <Container className="space-y-6">
          <SectionHeader id="type-heading" number="2.0" title="Type" />
          <p className="font-display text-display text-ink-900 font-medium">Display, Archivo</p>
          <p className="font-display text-h2 text-ink-900 font-medium">Heading two, Archivo</p>
          <p className="text-h3 text-ink-900 font-medium">Heading three, Plex Sans</p>
          <p className="text-lead measure">Lead paragraph in IBM Plex Sans at the lead size.</p>
          <p className="measure">Body copy in IBM Plex Sans, capped at 68 characters per line.</p>
          <p className="text-steel-600 text-caption font-mono">
            ISA/IEC 62443-3-3, set in Plex Mono for data
          </p>
        </Container>
      </Section>

      <Section spacing="tight" aria-labelledby="controls-heading">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader id="controls-heading" number="3.0" title="Actions" />
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button disabled>Disabled</Button>
              <Button isLoading loadingText="Sending">
                Loading
              </Button>
              <Link href="/contact" variant="buttonPrimary" withArrow>
                Link as button
              </Link>
              <Link href="/services">Text link</Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Badge>IEC 61511</Badge>
              <span className="tag-plate">4.0</span>
              <MarkedText text="[PLACEHOLDER] Unverified copy" />
            </div>
          </div>
          <div className="space-y-6">
            <Field id="ds-name" label="Name" required>
              {(props) => <Input {...props} />}
            </Field>
            <Field
              id="ds-email"
              label="Work email"
              required
              error="Enter an email address in the format name@company.com"
            >
              {(props) => <Input {...props} hasError />}
            </Field>
            <Field id="ds-type" label="Area of enquiry">
              {(props) => (
                <Select {...props} defaultValue="">
                  <option value="">Select an area</option>
                  <option value="ot">OT cybersecurity</option>
                </Select>
              )}
            </Field>
            <Field
              id="ds-message"
              label="Message"
              helperText="Leave out site names and network details."
            >
              {(props) => <Textarea {...props} />}
            </Field>
            <Checkbox label="I consent to being contacted about this enquiry." />
            <div className="flex gap-6">
              <Radio name="ds-radio" label="Option one" defaultChecked />
              <Radio name="ds-radio" label="Option two" />
            </div>
          </div>
        </Container>
      </Section>

      <Section spacing="tight" aria-labelledby="data-heading">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <SectionHeader id="data-heading" number="4.0" title="Data and states" />
            <SpecBlock
              items={[
                { label: "Based", value: "Perth, Western Australia" },
                { label: "Standard", value: "ISA/IEC 62443" },
              ]}
            />
            <Alert variant="danger" title="There is a problem">
              Check the highlighted fields.
            </Alert>
            <Alert variant="success" title="Enquiry sent">
              The practitioner will review it.
            </Alert>
            <Placeholder label="Client content required">Approved wording goes here.</Placeholder>
          </div>
          <Table caption="Example schedule" showCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Scope</TableHead>
                <TableHead>Output</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableHead scope="row" className="text-ink-900 text-small">
                  Assessment
                </TableHead>
                <TableCell>Gap assessment report</TableCell>
              </TableRow>
              <TableRow>
                <TableHead scope="row" className="text-ink-900 text-small">
                  Architecture
                </TableHead>
                <TableCell>Zone and conduit specification</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Container>
      </Section>

      <Section ground="ink" aria-labelledby="dark-heading">
        <Container>
          <SectionHeader id="dark-heading" number="5.0" title="Dark band" onDark />
          <ProcessSequence
            onDark
            className="mt-12"
            steps={[
              { step: "01", title: "Assess", description: "Establish the current state." },
              { step: "02", title: "Architect", description: "Specify the target." },
              { step: "03", title: "Implement", description: "Stage and test." },
              { step: "04", title: "Assure", description: "Commission and hand over." },
            ]}
          />
        </Container>
      </Section>
    </main>
  );
}
