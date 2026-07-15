import type { EvaluateResponse } from "@/lib/api/types";
import { translateRule } from "@/components/ui/feedback";

import type { ApplicantInput } from "../model/applicant.schema";

function stamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
}

function eligibleBankNames(data: EvaluateResponse): string {
  return data.eligible_banks.map((b) => b.bank_name).join(", ") || "None";
}

function generateExecutiveSummary(data: EvaluateResponse, applicant: ApplicantInput | null): string {
  if (!applicant) return "";

  const name = "The applicant";
  const cibil = applicant.cibil_score;
  const recommendedLenders = data.eligible_banks.map((b) => b.bank_name).join(", ") || "None";
  
  let riskProfile = "Standard";
  if (cibil >= 750) riskProfile = "Strong";
  else if (cibil < 675) riskProfile = "Critical";

  let summary = `EXECUTIVE SUMMARY:\n`;
  summary += `${name} has been evaluated against the risk and credit policies of ${data.evaluations.length} member banks. `;
  summary += `The applicant presents a ${riskProfile} risk profile with a CIBIL score of ${cibil} and `;
  
  const totalWo = applicant.wo_amount;
  if (totalWo > 0) {
    summary += `outstanding write-offs totaling ₹${totalWo.toLocaleString("en-IN")}.\n\n`;
  } else {
    summary += `no write-off history.\n\n`;
  }

  summary += `ELIGIBLE MATCHES:\n`;
  if (data.eligible_banks.length > 0) {
    summary += `The applicant meets 100% of the underwriting criteria for the following institutions:\n`;
    summary += `- Recommended Lenders: ${recommendedLenders}\n`;
  } else {
    summary += `The applicant did not qualify for any bank under the current profile.\n`;
  }

  // Risk Factors (failed rules)
  const rejections: string[] = [];
  data.evaluations.forEach((e) => {
    if (!e.eligible) {
      e.rules.forEach((r) => {
        if (r.status === "FAIL") {
          const ruleDetail = translateRule(r.parameter, r.rule, r.value);
          rejections.push(`[${e.bank_name}] ${ruleDetail.label}: Expected ${ruleDetail.benchmark}, but actual was ${ruleDetail.actual}.`);
        }
      });
    }
  });

  if (rejections.length > 0) {
    summary += `\nREJECTION / RISK FACTOR SUMMARY:\n`;
    rejections.slice(0, 5).forEach((rej) => {
      summary += `- ${rej}\n`;
    });
    if (rejections.length > 5) {
      summary += `- ... and ${rejections.length - 5} other policy mismatches.\n`;
    }
  }

  summary += `\nRECOMMENDED ACTION ITEMS:\n`;
  let actionCount = 1;
  if (cibil < 700) {
    summary += `${actionCount++}. Work on improving CIBIL score to qualify for more lenders.\n`;
  }
  if (applicant.currently_outstanding) {
    summary += `${actionCount++}. Clear currently outstanding defaults and close outstanding credit lines.\n`;
  }
  if (applicant.self_employed && applicant.business_income < 100000) {
    summary += `${actionCount++}. Increase business turnover/income to meet minimum turnover criteria.\n`;
  }
  if (applicant.no_income_proof) {
    summary += `${actionCount++}. Provide registration certificates or tax files to lift income proof restrictions.\n`;
  }
  if (actionCount === 1) {
    summary += `${actionCount++}. Standard documentation processing. Proceed with application submission.\n`;
  }

  return summary;
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
  const finalY = (): number =>
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Real-time Rule Match & Loan Eligibility", 14, 16);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 22);
  
  doc.setTextColor(20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Eligibility Status: ${data.eligibility_status}`, 14, 30);
  doc.text(`Eligible Lenders (${data.matched_rule_count}): ${eligibleBankNames(data)}`, 14, 36);

  let y = 42;

  // Insert Executive Summary Block
  const summaryText = generateExecutiveSummary(data, applicant);
  if (summaryText) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    const lines = doc.splitTextToSize(summaryText, 182);
    const rectHeight = lines.length * 4.5 + 8;
    
    doc.setFillColor(245, 246, 248);
    doc.setDrawColor(220, 224, 230);
    doc.roundedRect(14, y, 182, rectHeight, 2, 2, "FD");
    
    doc.setTextColor(50, 50, 50);
    doc.text(lines, 18, y + 6);
    
    y += rectHeight + 10;
  }

  for (const e of data.evaluations) {
    if (y > 240) {
      doc.addPage();
      y = 16;
    }

    const pct = Math.round(e.confidence_score * 100);
    autoTable(doc, {
      startY: y,
      head: [
        [`${e.bank_name}  -  [STATUS: ${e.eligible ? "ELIGIBLE - PASS" : "NOT ELIGIBLE"}]  -  Confidence: ${pct}%  (${e.rules_passed}/${e.rules_total} passed)`],
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
      head: [["Checked Policy Parameter", "Target Benchmark Limit", "Applicant Actual Status", "Verdict"]],
      body: e.rules.map((r) => {
        const trans = translateRule(r.parameter, r.rule, r.value);
        const verdict = r.status === "FAIL" ? "REJECTED" : trans.isWaived ? "WAIVED" : "PASSED";
        return [trans.label, trans.benchmark, trans.actual, verdict];
      }),
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [238, 238, 240], textColor: [60, 60, 60], fontSize: 8 },
      margin: { left: 14, right: 14 },
      didParseCell: (hook) => {
        if (hook.section === "body" && hook.column.index === 3) {
          const val = hook.cell.raw;
          if (val === "REJECTED") {
            hook.cell.styles.textColor = [200, 30, 50];
          } else if (val === "WAIVED") {
            hook.cell.styles.textColor = [217, 119, 6];
          } else {
            hook.cell.styles.textColor = [18, 140, 90];
          }
          hook.cell.styles.fontStyle = "bold";
        }
      },
    });
    y = finalY() + 6;
  }

  if (applicant) {
    if (y > 220) {
      doc.addPage();
      y = 16;
    }
    autoTable(doc, {
      startY: y,
      head: [["Applicant Profile Parameter", "Value"]],
      body: Object.entries(applicant).map(([k, v]) => {
        const trans = translateRule(k, "", v);
        return [trans.label, trans.actual];
      }),
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [238, 238, 240], textColor: [60, 60, 60], fontSize: 8 },
      margin: { left: 14, right: 14 },
    });
  }

  doc.save(`loan-eligibility-report-${stamp()}.pdf`);
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
    "Bank Name",
    "Eligibility",
    "Confidence %",
    "Rules Passed",
    "Rules Total",
    "Checked Policy",
    "Target Benchmark",
    "Applicant Actual Status",
    "Verdict Status",
  ].map((h) => ({ value: h, ...H }));

  type Cell = { value: string | number; fontWeight?: "bold"; type?: NumberConstructor };

  // Generate Executive Summary
  const summaryText = generateExecutiveSummary(data, applicant);
  const summaryLines = summaryText ? summaryText.split("\n") : [];
  const summaryRows = summaryLines.map((line): Cell[] => [
    {
      value: line,
      ...(line.startsWith("EXECUTIVE SUMMARY") ||
      line.startsWith("ELIGIBLE MATCHES") ||
      line.startsWith("REJECTION") ||
      line.startsWith("RECOMMENDED")
        ? H
        : {}),
    },
  ]);

  const rows: Cell[][] = [
    [{ value: "Real-time Rule Match & Loan Eligibility Report", ...H }],
    [{ value: "Overall Eligibility Status", ...H }, { value: data.eligibility_status }],
    [{ value: "Recommended Lenders", ...H }, { value: eligibleBankNames(data) }],
    [{ value: "Matched Rule Count", ...H }, { value: data.matched_rule_count, type: Number }],
    blank,
    ...summaryRows,
    blank,
    header,
    ...data.evaluations.flatMap((e) =>
      e.rules.map((r): Cell[] => {
        const trans = translateRule(r.parameter, r.rule, r.value);
        const verdict = r.status === "FAIL" ? "Rejected" : trans.isWaived ? "Waived" : "Passed";
        return [
          { value: e.bank_name },
          { value: e.eligible ? "Eligible" : "Not Eligible" },
          { value: Math.round(e.confidence_score * 1000) / 10, type: Number },
          { value: e.rules_passed, type: Number },
          { value: e.rules_total, type: Number },
          { value: trans.label },
          { value: trans.benchmark },
          { value: trans.actual },
          { value: verdict },
        ];
      }),
    ),
    ...(applicant
      ? [
          blank,
          [{ value: "Applicant Profile Details", ...H }],
          ...Object.entries(applicant).map(([k, v]): Cell[] => {
            const trans = translateRule(k, "", v);
            return [{ value: trans.label }, { value: trans.actual }];
          }),
        ]
      : []),
  ];

  await writeXlsxFile(rows).toFile(`loan-eligibility-report-${stamp()}.xlsx`);
}
