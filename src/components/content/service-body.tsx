import * as React from "react";
import { Figure } from "@/components/primitives/figure";
import { Placeholder, isPlaceholder } from "@/components/primitives/placeholder";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/primitives/table";
import { Part } from "./part";
import { ProcessSequence } from "./process-sequence";
import { IndexList } from "./index-list";
import { ServiceIcon } from "./service-icon";
import type { FigureData, Service } from "@/content/types";

export type ServiceBodyProps = {
  service: Service;
  relatedServices: Service[];
  detailFigure: FigureData | undefined;
  figures: Record<string, FigureData>;
};

/** Parts 1.0 to 8.0 of the service template. Part 9.0 is the enquiry band that follows. */
export function ServiceBody({ service, relatedServices, detailFigure, figures }: ServiceBodyProps) {
  return (
    <div>
      <Part id="challenge" number="1.0" title="Client challenge">
        <p className="text-lead text-ink-700 measure">{service.challenge}</p>
      </Part>

      <Part id="why-it-matters" number="2.0" title="Why it matters operationally">
        <blockquote className="border-ink-900 font-display text-ink-900 measure text-h3-lg border-l pl-6">
          {service.whyItMatters}
        </blockquote>
      </Part>

      <Part id="capability" number="3.0" title="DeepTsight capability">
        <p className="text-ink-700 measure">{service.capability}</p>
        <Figure
          figure={detailFigure}
          aspect="landscape"
          reveal
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="mt-10"
        />
      </Part>

      <Part id="scope" number="4.0" title="Typical scope and outputs">
        <Table caption={`Typical scope and outputs: ${service.shortTitle}`}>
          <TableHeader>
            <TableRow>
              <TableHead className="col-key">Scope</TableHead>
              <TableHead>Outputs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {service.scopeAndOutputs.map((item) => (
              <TableRow key={item.scope}>
                <TableHead scope="row" className="text-ink-900 text-small py-5 font-medium">
                  {item.scope}
                </TableHead>
                <TableCell className="py-5">
                  <ul className="marker:text-control list-square space-y-1.5 pl-5">
                    {item.outputs.map((output) => (
                      <li key={output}>{output}</li>
                    ))}
                  </ul>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Part>

      <Part id="approach" number="5.0" title="Delivery approach">
        <ProcessSequence steps={service.deliveryApproach} orientation="vertical" />
      </Part>

      <Part id="standards" number="6.0" title="Standards and methods">
        <ul className="border-ink-900 border-t">
          {service.standards.map((standard) => (
            <li
              key={standard}
              className="border-rule text-ink-900 text-small border-b py-3 font-mono"
            >
              {standard}
            </li>
          ))}
        </ul>
      </Part>

      <Part id="evidence" number="7.0" title="Representative experience">
        {service.evidence && isPlaceholder(service.evidence) ? (
          <Placeholder label="Approved, anonymised project evidence required">
            {service.evidence.replace("[PLACEHOLDER] ", "")}
          </Placeholder>
        ) : (
          <p className="text-ink-700 measure">{service.evidence}</p>
        )}
      </Part>

      <Part id="related" number="8.0" title="Related services">
        <IndexList
          size="compact"
          items={relatedServices.map((related) => ({
            href: `/services/${related.slug}`,
            title: related.title,
            icon: <ServiceIcon name={related.icon} />,
            description: related.outcome,
            figure: figures[related.media.hero],
          }))}
        />
      </Part>
    </div>
  );
}
