import * as React from "react";
import type { MonthBucket } from "./dashboard-data";

/*
 * Enquiries per month as two bars (received, still unread). Plain HTML and CSS, no chart library:
 * heights are percentages of a rounded-up axis maximum. A visually hidden table carries the same
 * numbers for screen readers.
 */

const TICKS = 4;

/** The smallest step of 1, 2, 5, 10, 20, ... that makes TICKS steps cover the largest bar. */
function stepFor(max: number): number {
  const raw = Math.max(max, 1) / TICKS;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  for (const factor of [1, 2, 5, 10]) {
    if (factor * magnitude >= raw) return factor * magnitude;
  }
  return 10 * magnitude;
}

export function EnquiryChart({ months }: { months: MonthBucket[] }) {
  const max = Math.max(0, ...months.map((month) => month.received));
  const step = stepFor(max);
  const top = step * TICKS;
  const total = months.reduce((sum, month) => sum + month.received, 0);
  const ticks = Array.from({ length: TICKS + 1 }, (_, index) => index * step);

  return (
    <figure className="dts-chart">
      <figcaption className="dts-chart__legend">
        <span>
          <i className="dts-chart__key dts-chart__key--received" aria-hidden="true" />
          Received
        </span>
        <span>
          <i className="dts-chart__key dts-chart__key--unread" aria-hidden="true" />
          Still unread
        </span>
      </figcaption>

      <div className="dts-chart__plot" aria-hidden="true">
        <ul className="dts-chart__axis">
          {ticks.map((tick) => (
            <li key={tick} style={{ bottom: `${(tick / top) * 100}%` }}>
              {tick}
            </li>
          ))}
        </ul>
        <div className="dts-chart__area">
          <div className="dts-chart__lines">
            {ticks.map((tick) => (
              <span key={tick} style={{ bottom: `${(tick / top) * 100}%` }} />
            ))}
          </div>
          <ol className="dts-chart__bars">
            {months.map((month) => (
              <li
                key={month.key}
                className="dts-chart__month"
                title={`${month.label}: ${month.received} received, ${month.unread} unread`}
              >
                <span className="dts-chart__pair">
                  <span
                    className="dts-chart__bar dts-chart__bar--received"
                    style={{ height: `${(month.received / top) * 100}%` }}
                  />
                  <span
                    className="dts-chart__bar dts-chart__bar--unread"
                    style={{ height: `${(month.unread / top) * 100}%` }}
                  />
                </span>
                <span className="dts-chart__label">{month.label}</span>
              </li>
            ))}
          </ol>
          {total === 0 && <p className="dts-chart__empty">No enquiries in this period yet.</p>}
        </div>
      </div>

      <table className="dts-sr-only">
        <caption>Enquiries per month, last {months.length} months</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Received</th>
            <th scope="col">Still unread</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <tr key={month.key}>
              <th scope="row">{month.label}</th>
              <td>{month.received}</td>
              <td>{month.unread}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
