import type { EvaluateResponse } from "@/lib/api/types";

import type { ApplicantInput } from "../model/applicant.schema";

function stamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
}

function eligibleBankNames(data: EvaluateResponse): string {
  return data.eligible_banks.map((b) => b.bank_name).join(", ") || "None";
}

/** Export the rule match to a styled PDF (jsPDF + autotable). */
export async function exportRuleMatchToPdf(
  data: EvaluateResponse,
  applicant: ApplicantInput | null,
): Promise<void> {
  const [{ jsPDF }, autoTableMod] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableMod.default;

  const doc = new jsPDF();
  // jspdf-autotable augments jsPDF at runtime; type the accessor explicitly.
  const finalY = (): number =>
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Real-time Rule Match", 14, 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 22);
  doc.setTextColor(20);
  doc.setFontSize(10);
  doc.text(`Eligibility: ${data.eligibility_status}`, 14, 30);
  doc.text(`Eligible banks (${data.matched_rule_count}): ${eligibleBankNames(data)}`, 14, 36);

  let y = 44;
  for (const e of data.evaluations) {
    const pct = Math.round(e.confidence_score * 100);
    autoTable(doc, {
      startY: y,
      head: [
        [`${e.bank_name}  -  ${e.eligible ? "ELIGIBLE" : "not eligible"}  -  ${pct}%  (${e.rules_passed}/${e.rules_total})`],
      ],
      body: [],
      theme: "plain",
      headStyles: {
        fillColor: e.eligible ? [223, 245, 234] : [250, 233, 235],
        textColor: [20, 20, 20],
        fontStyle: "bold",
        fontSize: 9,
      },
      margin: { left: 14, right: 14 },
    });
    y = finalY();
    autoTable(doc, {
      startY: y,
      head: [["Parameter", "Rule", "Value", "Status"]],
      body: e.rules.map((r) => [r.parameter, r.rule, String(r.value), r.status]),
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [238, 238, 240], textColor: [60, 60, 60], fontSize: 8 },
      margin: { left: 14, right: 14 },
      didParseCell: (hook) => {
        if (hook.section === "body" && hook.column.index === 3) {
          const fail = hook.cell.raw === "FAIL";
          hook.cell.styles.textColor = fail ? [200, 30, 50] : [18, 140, 90];
          hook.cell.styles.fontStyle = "bold";
        }
      },
    });
    y = finalY() + 6;
    if (y > 268) {
      doc.addPage();
      y = 16;
    }
  }

  if (applicant) {
    if (y > 240) {
      doc.addPage();
      y = 16;
    }
    autoTable(doc, {
      startY: y,
      head: [["Applicant Parameter", "Value"]],
      body: Object.entries(applicant).map(([k, v]) => [k, String(v)]),
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [238, 238, 240], textColor: [60, 60, 60], fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
  }

  doc.save(`rule-match-${stamp()}.pdf`);
}

/** Export the rule match to an .xlsx (Summary + Rule Match sheets). */
export async function exportRuleMatchToExcel(
  data: EvaluateResponse,
  applicant: ApplicantInput | null,
): Promise<void> {
  const writeXlsxFile = (await import("write-excel-file/browser")).default;

  const H = { fontWeight: "bold" as const };
  const blank = [{ value: "" }];

  const header = [
    "Bank",
    "Eligible",
    "Confidence %",
    "Passed",
    "Total",
    "Parameter",
    "Rule",
    "Value",
    "Status",
  ].map((h) => ({ value: h, ...H }));

  type Cell = { value: string | number; fontWeight?: "bold"; type?: NumberConstructor };
  const rows: Cell[][] = [
    [{ value: "Real-time Rule Match", ...H }],
    [{ value: "Eligibility Status", ...H }, { value: data.eligibility_status }],
    [{ value: "Eligible Banks", ...H }, { value: eligibleBankNames(data) }],
    [{ value: "Matched Rule Count", ...H }, { value: data.matched_rule_count, type: Number }],
    blank,
    header,
    ...data.evaluations.flatMap((e) =>
      e.rules.map((r): Cell[] => [
        { value: e.bank_name },
        { value: e.eligible ? "Yes" : "No" },
        { value: Math.round(e.confidence_score * 1000) / 10, type: Number },
        { value: e.rules_passed, type: Number },
        { value: e.rules_total, type: Number },
        { value: r.parameter },
        { value: r.rule },
        { value: String(r.value) },
        { value: r.status },
      ]),
    ),
    ...(applicant
      ? [
          blank,
          [{ value: "Applicant", ...H }],
          ...Object.entries(applicant).map(([k, v]): Cell[] => [
            { value: k },
            { value: String(v) },
          ]),
        ]
      : []),
  ];

  // The browser build returns { toBlob, toFile }; toFile() generates + downloads.
  await writeXlsxFile(rows).toFile(`rule-match-${stamp()}.xlsx`);
}
