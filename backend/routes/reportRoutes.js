const express = require("express");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

const { poolPromise } = require("../config/db");

const router = express.Router();

const FROM_DATE = "2026-06-01";

// Use real Times New Roman fonts to avoid broken/symbol characters in PDFKit.
const TIMES_REGULAR_PATH = "C:/Windows/Fonts/times.ttf";
const TIMES_BOLD_PATH = "C:/Windows/Fonts/timesbd.ttf";

const FALLBACK_FONT_REGULAR = "Times-Roman";
const FALLBACK_FONT_BOLD = "Times-Bold";

let FONT_REGULAR = "TimesNewRoman";
let FONT_BOLD = "TimesNewRomanBold";

function registerFonts(doc) {
  try {
    if (fs.existsSync(TIMES_REGULAR_PATH) && fs.existsSync(TIMES_BOLD_PATH)) {
      doc.registerFont("TimesNewRoman", TIMES_REGULAR_PATH);
      doc.registerFont("TimesNewRomanBold", TIMES_BOLD_PATH);
      FONT_REGULAR = "TimesNewRoman";
      FONT_BOLD = "TimesNewRomanBold";
    } else {
      FONT_REGULAR = FALLBACK_FONT_REGULAR;
      FONT_BOLD = FALLBACK_FONT_BOLD;
    }
  } catch (error) {
    console.log("Times New Roman font registration failed. Using PDFKit fallback fonts.");
    FONT_REGULAR = FALLBACK_FONT_REGULAR;
    FONT_BOLD = FALLBACK_FONT_BOLD;
  }

  doc.font(FONT_REGULAR);
}

const COMPANY_ADDRESS = "No.28, Joseph's Lane,\nColombo 00400,\nSri Lanka";
const COMPANY_TELEPHONE = "+94 112 598 831";

const normalizeSelected = `
  UPPER(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            LTRIM(RTRIM(ISNULL(a.SelectedAnswer, ''))),
          ' ', ''),
        CHAR(9), ''),
      CHAR(10), ''),
    CHAR(13), '')
  )
`;

const normalizeCorrect = `
  UPPER(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            LTRIM(RTRIM(ISNULL(q.CorrectAnswer, ''))),
          ' ', ''),
        CHAR(9), ''),
      CHAR(10), ''),
    CHAR(13), '')
  )
`;

function getRecruitmentQuery(whereClause) {
  return `
    WITH IQDetails AS (
      SELECT
        n.RecruitID,
        a.QuestionID,
        CASE
          WHEN ${normalizeSelected} = ${normalizeCorrect}
          THEN 1 ELSE 0
        END AS IsCorrect
      FROM CommonData.dbo.NewRecruitInformation n
      CROSS APPLY (
        VALUES
          (1, n.IQ1), (2, n.IQ2), (3, n.IQ3), (4, n.IQ4), (5, n.IQ5),
          (6, n.IQ6), (7, n.IQ7), (8, n.IQ8), (9, n.IQ9), (10, n.IQ10),
          (11, n.IQ11), (12, n.IQ12), (13, n.IQ13), (14, n.IQ14),
          (15, n.IQ15), (16, n.IQ16), (17, n.IQ17), (18, n.IQ18),
          (19, n.IQ19), (20, n.IQ20)
      ) a(QuestionID, SelectedAnswer)
      INNER JOIN CommonData.dbo.IQTestQnA q
        ON q.QuestionID = a.QuestionID
      ${whereClause}
    ),
    IQMarks AS (
      SELECT
        RecruitID,
        COUNT(*) AS TotalQuestions,
        SUM(IsCorrect) AS CorrectAnswers,
        MAX(CASE WHEN QuestionID = 1 THEN IsCorrect END) AS IQ1Status,
        MAX(CASE WHEN QuestionID = 2 THEN IsCorrect END) AS IQ2Status,
        MAX(CASE WHEN QuestionID = 3 THEN IsCorrect END) AS IQ3Status,
        MAX(CASE WHEN QuestionID = 4 THEN IsCorrect END) AS IQ4Status,
        MAX(CASE WHEN QuestionID = 5 THEN IsCorrect END) AS IQ5Status,
        MAX(CASE WHEN QuestionID = 6 THEN IsCorrect END) AS IQ6Status,
        MAX(CASE WHEN QuestionID = 7 THEN IsCorrect END) AS IQ7Status,
        MAX(CASE WHEN QuestionID = 8 THEN IsCorrect END) AS IQ8Status,
        MAX(CASE WHEN QuestionID = 9 THEN IsCorrect END) AS IQ9Status,
        MAX(CASE WHEN QuestionID = 10 THEN IsCorrect END) AS IQ10Status,
        MAX(CASE WHEN QuestionID = 11 THEN IsCorrect END) AS IQ11Status,
        MAX(CASE WHEN QuestionID = 12 THEN IsCorrect END) AS IQ12Status,
        MAX(CASE WHEN QuestionID = 13 THEN IsCorrect END) AS IQ13Status,
        MAX(CASE WHEN QuestionID = 14 THEN IsCorrect END) AS IQ14Status,
        MAX(CASE WHEN QuestionID = 15 THEN IsCorrect END) AS IQ15Status,
        MAX(CASE WHEN QuestionID = 16 THEN IsCorrect END) AS IQ16Status,
        MAX(CASE WHEN QuestionID = 17 THEN IsCorrect END) AS IQ17Status,
        MAX(CASE WHEN QuestionID = 18 THEN IsCorrect END) AS IQ18Status,
        MAX(CASE WHEN QuestionID = 19 THEN IsCorrect END) AS IQ19Status,
        MAX(CASE WHEN QuestionID = 20 THEN IsCorrect END) AS IQ20Status
      FROM IQDetails
      GROUP BY RecruitID
    )
    SELECT
      n.RecruitID,
      n.Name,
      n.Email,
      n.MobileNumber,
      n.Position,
      n.NHRNo,

      CONVERT(VARCHAR(23), n.HQExamStartTime, 121) AS HQExamStartTime,
      CONVERT(VARCHAR(23), n.HQExamEndTime, 121) AS HQExamEndTime,
      DATEDIFF(MINUTE, n.HQExamStartTime, n.HQExamEndTime) AS EQTimeTakenMinutes,

      CONVERT(VARCHAR(23), n.IQExamStartTime, 121) AS IQExamStartTime,
      CONVERT(VARCHAR(23), n.IQExamEndTime, 121) AS IQExamEndTime,
      DATEDIFF(MINUTE, n.IQExamStartTime, n.IQExamEndTime) AS IQTimeTakenMinutes,

      n.HQ1, n.HQ2, n.HQ3, n.HQ4, n.HQ5,
      n.HQ6, n.HQ7, n.HQ8, n.HQ9, n.HQ10,

      n.IQ1, n.IQ2, n.IQ3, n.IQ4, n.IQ5,
      n.IQ6, n.IQ7, n.IQ8, n.IQ9, n.IQ10,
      n.IQ11, n.IQ12, n.IQ13, n.IQ14, n.IQ15,
      n.IQ16, n.IQ17, n.IQ18, n.IQ19, n.IQ20,

      ISNULL(iq.TotalQuestions, 20) AS TotalQuestions,
      ISNULL(iq.CorrectAnswers, 0) AS CorrectAnswers,
      ISNULL(iq.TotalQuestions, 20) - ISNULL(iq.CorrectAnswers, 0) AS WrongAnswers,
      CAST(
        ISNULL(iq.CorrectAnswers, 0) * 100.0 / ISNULL(iq.TotalQuestions, 20)
        AS DECIMAL(5,2)
      ) AS Percentage,

      iq.IQ1Status, iq.IQ2Status, iq.IQ3Status, iq.IQ4Status, iq.IQ5Status,
      iq.IQ6Status, iq.IQ7Status, iq.IQ8Status, iq.IQ9Status, iq.IQ10Status,
      iq.IQ11Status, iq.IQ12Status, iq.IQ13Status, iq.IQ14Status, iq.IQ15Status,
      iq.IQ16Status, iq.IQ17Status, iq.IQ18Status, iq.IQ19Status, iq.IQ20Status
    FROM CommonData.dbo.NewRecruitInformation n
    LEFT JOIN IQMarks iq
      ON iq.RecruitID = n.RecruitID
    ${whereClause}
    ORDER BY n.RecruitID DESC;
  `;
}

function addHeader(doc, title, subtitle) {
  const logoPath = path.join(__dirname, "../assets/GRI_logo.png");

  try {
    doc.image(logoPath, 40, 25, { width: 95 });
  } catch (error) {
    console.log("Logo not found. PDF generated without logo.");
  }

  doc
    .font(FONT_BOLD)
    .fillColor("#111827")
    .fontSize(18)
    .text("Global Rubber Industries (Pvt) Ltd", 160, 25, {
      width: 330,
    });

  doc
    .font(FONT_REGULAR)
    .fontSize(8)
    .fillColor("#4b5563")
    .text(COMPANY_ADDRESS, 430, 25, {
      width: 110,
      align: "right",
    });

  doc
    .font(FONT_BOLD)
    .fontSize(8)
    .fillColor("#111827")
    .text(`Tel: ${COMPANY_TELEPHONE}`, 420, 58, {
      width: 120,
      align: "right",
    });

  doc
    .font(FONT_BOLD)
    .fontSize(13)
    .fillColor("#111827")
    .text(title, 160, 50);

  doc
    .font(FONT_REGULAR)
    .fontSize(9)
    .fillColor("#4b5563")
    .text(subtitle, 160, 74);

  doc
    .font(FONT_REGULAR)
    .fontSize(9)
    .text(`Generated Date: ${new Date().toLocaleString()}`, 160, 92);

  doc.strokeColor("#d1d5db").moveTo(40, 105).lineTo(555, 105).stroke();
  doc.y = 118;
}

function addSummary(doc, candidates) {
  const total = candidates.length;
  const passed = candidates.filter((item) => Number(item.Percentage || 0) >= 80).length;
  const failed = total - passed;

  const average =
    total > 0
      ? (
          candidates.reduce((sum, item) => sum + Number(item.Percentage || 0), 0) /
          total
        ).toFixed(2)
      : "0.00";

  const summaryY = doc.y;
  doc.font(FONT_BOLD).fontSize(13).fillColor("#111827").text("Report Summary", 40, summaryY);

  const cardY = summaryY + 22;
  const cardW = 118;
  const cardH = 48;
  const gap = 14;

  drawMonthlySummaryCard(doc, "Total Candidates", String(total), 40, cardY, cardW, cardH, "#2563eb");
  drawMonthlySummaryCard(doc, "Passed", String(passed), 40 + cardW + gap, cardY, cardW, cardH, "#16a34a");
  drawMonthlySummaryCard(doc, "Failed", String(failed), 40 + 2 * (cardW + gap), cardY, cardW, cardH, "#dc2626");
  drawMonthlySummaryCard(doc, "Average IQ Score", `${average}%`, 40 + 3 * (cardW + gap), cardY, cardW, cardH, "#2563eb");

  doc.y = cardY + cardH + 22;
}

function drawMonthlySummaryCard(doc, label, value, x, y, width, height, accentColor) {
  drawRoundedRect(doc, x, y, width, height, 8, "#ffffff", "#dbeafe");
  doc.rect(x, y, 4, height).fill(accentColor);

  doc
    .font(FONT_BOLD)
    .fontSize(8)
    .fillColor("#64748b")
    .text(label, x + 8, y + 9, {
      width: width - 16,
      align: "center",
    });

  doc
    .font(FONT_BOLD)
    .fontSize(16)
    .fillColor("#111827")
    .text(value, x + 8, y + 27, {
      width: width - 16,
      align: "center",
    });
}

function addCandidateBlock(doc, candidate, index) {
  const cardHeight = 150;

  if (doc.y + cardHeight > 760) {
    doc.addPage();
    registerFonts(doc);
    addHeader(doc, "Monthly Recruitment Report", "Continuation of recruitment performance report");
  }

  const y = doc.y;
  const x = 40;
  const width = 515;

  const percentage = Number(candidate.Percentage || 0);
  const score = percentage.toFixed(2);
  const status = percentage >= 80 ? "Pass" : "Fail";

  const statusColor = status === "Pass" ? "#16a34a" : "#dc2626";
  const statusBorder = status === "Pass" ? "#86efac" : "#fca5a5";
  const statusFill = status === "Pass" ? "#dcfce7" : "#fee2e2";

  drawRoundedRect(doc, x, y, width, cardHeight, 8, "#ffffff", "#dbeafe");
  doc.rect(x, y, 5, cardHeight).fill(statusColor);

  doc
    .font(FONT_BOLD)
    .fontSize(12)
    .fillColor("#111827")
    .text(`${index + 1}. ${candidate.Name || "N/A"}`, x + 15, y + 12, {
      width: 290,
    });

  doc
    .font(FONT_BOLD)
    .fontSize(8.5)
    .fillColor("#334155")
    .text(candidate.Position || "N/A", x + 15, y + 30, {
      width: 290,
    });

  doc
    .font(FONT_BOLD)
    .fontSize(8)
    .fillColor("#111827")
    .text(`Recruit ID: ${candidate.RecruitID || "N/A"}`, x + 15, y + 50, {
      width: 160,
    });

  doc
    .font(FONT_BOLD)
    .fontSize(8)
    .fillColor("#111827")
    .text(`NHR No: ${candidate.NHRNo || "N/A"}`, x + 185, y + 50, {
      width: 160,
    });

  doc
    .font(FONT_BOLD)
    .fontSize(8)
    .fillColor("#111827")
    .text(`Mobile: ${candidate.MobileNumber || "N/A"}`, x + 15, y + 66, {
      width: 160,
    });

  doc
    .font(FONT_BOLD)
    .fontSize(8)
    .fillColor("#111827")
    .text(`Email: ${candidate.Email || "N/A"}`, x + 185, y + 66, {
      width: 210,
    });

  drawSmallStatusBadge(doc, status, x + 420, y + 14, 75, 22, statusFill, statusBorder, statusColor);

  drawMiniMetric(doc, "Questions", String(candidate.TotalQuestions || 0), x + 15, y + 94, 80, 34, "#2563eb");
  drawMiniMetric(doc, "Correct", String(candidate.CorrectAnswers || 0), x + 105, y + 94, 80, 34, "#16a34a");
  drawMiniMetric(doc, "Wrong", String(candidate.WrongAnswers || 0), x + 195, y + 94, 80, 34, "#dc2626");
  drawMiniMetric(doc, "IQ Score", `${score}%`, x + 285, y + 94, 90, 34, statusColor);

  doc
    .font(FONT_REGULAR)
    .fontSize(7)
    .fillColor("#4b5563")
    .text(`IQ: ${formatDate(candidate.IQExamStartTime)} - ${formatDate(candidate.IQExamEndTime)} (${candidate.IQTimeTakenMinutes ?? "N/A"} min)`, x + 15, y + 132, {
      width: 250,
    });

  doc
    .font(FONT_REGULAR)
    .fontSize(7)
    .fillColor("#4b5563")
    .text(`EQ: ${formatDate(candidate.HQExamStartTime)} - ${formatDate(candidate.HQExamEndTime)} (${candidate.EQTimeTakenMinutes ?? "N/A"} min)`, x + 275, y + 132, {
      width: 220,
    });

  doc.y = y + cardHeight + 14;
}

function drawSmallStatusBadge(doc, text, x, y, width, height, fillColor, borderColor, textColor) {
  drawRoundedRect(doc, x, y, width, height, 6, fillColor, borderColor);

  doc
    .font(FONT_BOLD)
    .fontSize(11)
    .fillColor(textColor)
    .text(text, x, y + 6, {
      width,
      align: "center",
    });
}

function drawMiniMetric(doc, label, value, x, y, width, height, accentColor) {
  drawRoundedRect(doc, x, y, width, height, 6, "#f8fafc", "#e5e7eb");
  doc.rect(x, y, 3, height).fill(accentColor);

  doc
    .font(FONT_BOLD)
    .fontSize(6.5)
    .fillColor("#64748b")
    .text(label, x + 6, y + 5, {
      width: width - 12,
      align: "center",
    });

  doc
    .font(FONT_BOLD)
    .fontSize(11)
    .fillColor("#111827")
    .text(value, x + 6, y + 18, {
      width: width - 12,
      align: "center",
    });
}

function drawRoundedRect(doc, x, y, width, height, radius, fillColor, strokeColor) {
  doc.roundedRect(x, y, width, height, radius).fillAndStroke(fillColor, strokeColor);
}

function drawSingleLineInfo(doc, text, x, y, width) {
  doc
    .font(FONT_BOLD)
    .fontSize(8)
    .fillColor("#111827")
    .text(text, x, y, {
      width,
    });
}

 

function drawMetricCard(
  doc,
  label,
  value,
  x,
  y,
  width,
  height,
  borderColor = "#bfdbfe",
  accentColor = "#2563eb",
  valueColor = "#111827"
) {
  drawRoundedRect(
    doc,
    x,
    y,
    width,
    height,
    7,
    "#ffffff",
    borderColor
  );

  doc.rect(x, y, 4, height).fill(accentColor);

  doc
    .font(FONT_BOLD)
    .fontSize(7)
    .fillColor("#64748b")
    .text(label, x + 6, y + 7, {
      width: width - 12,
      align: "center",
    });

  doc
    .font(FONT_BOLD)
    .fontSize(14)
    .fillColor(valueColor)
    .text(value, x + 6, y + 23, {
      width: width - 12,
      align: "center",
    });
}
function drawInfoLine(doc, label, value, x, y, width) {
  doc
    .font(FONT_REGULAR)
    .fontSize(7)
    .fillColor("#64748b")
    .text(label, x, y, { width });

  doc
    .font(FONT_BOLD)
    .fontSize(7.5)
    .fillColor("#111827")
    .text(value || "N/A", x, y + 10, { width });
}

function drawAssessmentBox(doc, title, start, end, duration, x, y, width, height) {
  drawRoundedRect(doc, x, y, width, height, 8, "#ffffff", "#e5e7eb");

  doc.font(FONT_BOLD).fontSize(11).fillColor("#111827").text(title, x + 14, y + 12);

  drawInfoLine(doc, "Start Time", formatDate(start), x + 14, y + 35, 100);
  drawInfoLine(doc, "End Time", formatDate(end), x + 126, y + 35, 105);

  doc.roundedRect(x + 14, y + 63, width - 28, 16, 5).fill("#dbeafe");

  doc.font(FONT_BOLD).fontSize(9).fillColor("#1d4ed8").text(
    duration === null || duration === undefined ? "N/A" : `${duration} min`,
    x + 14,
    y + 66,
    {
      width: width - 28,
      align: "center",
    }
  );
}

function drawEQBox(doc, label, value, x, y, width, height) {
  drawRoundedRect(doc, x, y, width, height, 5, "#f8fafc", "#e5e7eb");

  doc.font(FONT_BOLD).fontSize(6.2).fillColor("#64748b").text(label, x + 6, y + 5);
  doc.font(FONT_BOLD).fontSize(7.3).fillColor("#111827").text(cleanAnswer(value), x + 6, y + 16);
}

function cleanAnswer(value) {
  if (!value) return "-";

  return String(value)
    .replace(/[^\x20-\x7E]/g, "") // remove non-ASCII chars
    .replace(/â€™/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/Â/g, "")
    .trim();
}

function drawIQBox(doc, label, value, isCorrect, x, y, width, height) {
  const fillColor = isCorrect ? "#dcfce7" : "#fee2e2";
  const strokeColor = isCorrect ? "#22c55e" : "#ef4444";
  const textColor = isCorrect ? "#166534" : "#991b1b";

  drawRoundedRect(doc, x, y, width, height, 5, fillColor, strokeColor);

  doc
    .font(FONT_BOLD)
    .fontSize(6.2)
    .fillColor(textColor)
    .text(label, x + 6, y + 5);

  doc
    .font(FONT_BOLD)
    .fontSize(7.2)
    .fillColor(textColor)
    .text(cleanAnswer(value), x + 6, y + 16, {
      width: width - 12,
      height: height - 18,
    });
}

function addCandidateDetails(doc, candidate) {
  const percentage = Number(candidate.Percentage || 0);
const score = percentage.toFixed(2);
const status = percentage >= 80 ? "Pass" : "Fail";

const scoreColor = percentage >= 80 ? "#16a34a" : "#dc2626";
const scoreBorder = percentage >= 80 ? "#86efac" : "#fca5a5";

const statusColor = status === "Pass" ? "#16a34a" : "#dc2626";
const statusBorder = status === "Pass" ? "#86efac" : "#fca5a5";

  const pageLeft = 40;
  const pageWidth = 515;

  // Candidate card
  const candidateY = 118;
  drawRoundedRect(doc, pageLeft, candidateY, pageWidth, 50, 8, "#ffffff", "#bfdbfe");
  doc.rect(pageLeft, candidateY, 5, 50).fill("#2563eb");

  doc
    .font(FONT_BOLD)
    .fontSize(15)
    .fillColor("#111827")
    .text(candidate.Name || "N/A", 58, candidateY + 11, {
      width: 285,
      height: 18,
    });

  doc
    .font(FONT_BOLD)
    .fontSize(8.5)
    .fillColor("#334155")
    .text(candidate.Position || "N/A", 58, candidateY + 32, {
      width: 285,
      height: 12,
    });

drawSingleLineInfo(doc, `Email: ${candidate.Email || "N/A"}`, 365, candidateY + 10, 160);
drawSingleLineInfo(doc, `Mobile: ${candidate.MobileNumber || "N/A"}`, 365, candidateY + 26, 160);
drawSingleLineInfo(doc, `NHR No: ${candidate.NHRNo || "N/A"}`, 365, candidateY + 34, 160);

  // Assessment cards
  const assessY = 182;
  drawAssessmentBox(
    doc,
    "EQ Assessment",
    candidate.HQExamStartTime,
    candidate.HQExamEndTime,
    candidate.EQTimeTakenMinutes,
    40,
    assessY,
    245,
    84
  );

  drawAssessmentBox(
    doc,
    "IQ Assessment",
    candidate.IQExamStartTime,
    candidate.IQExamEndTime,
    candidate.IQTimeTakenMinutes,
    310,
    assessY,
    245,
    84
  );

  // Metric cards
  const metricY = 280;
  const metricW = 94;
  const metricH = 42;
  const metricGap = 9;

  drawMetricCard(doc, "Total Questions", String(candidate.TotalQuestions || 0), 40, metricY, metricW, metricH);
  drawMetricCard(doc, "Correct", String(candidate.CorrectAnswers || 0), 40 + metricW + metricGap, metricY, metricW, metricH);
  drawMetricCard(doc, "Wrong", String(candidate.WrongAnswers || 0), 40 + 2 * (metricW + metricGap), metricY, metricW, metricH);
drawMetricCard(
  doc,
  "IQ Score",
  `${score}%`,
  40 + 3 * (metricW + metricGap),
  metricY,
  metricW,
  metricH,
  scoreBorder,
  scoreColor,
  scoreColor
);

drawMetricCard(
  doc,
  "Status",
  status,
  40 + 4 * (metricW + metricGap),
  metricY,
  metricW,
  metricH,
  statusBorder,
  statusColor,
  statusColor
);

  // EQ answers
  const eqY = 342;
  doc.font(FONT_BOLD).fontSize(12).fillColor("#111827").text("EQ Answers", 40, eqY);

  const eqBoxW = 95;
  const eqBoxH = 26;
  const answerGap = 8;

  for (let i = 1; i <= 10; i += 1) {
    const row = i <= 5 ? 0 : 1;
    const col = (i - 1) % 5;
    const x = 40 + col * (eqBoxW + answerGap);
    const y = eqY + 22 + row * (eqBoxH + 8);

    drawEQBox(doc, `EQ${i}`, candidate[`HQ${i}`] || "-", x, y, eqBoxW, eqBoxH);
  }

  // IQ answers
  const iqY = 440;
  doc.font(FONT_BOLD).fontSize(12).fillColor("#111827").text("IQ Answers", 40, iqY);

  const iqBoxW = 95;
  const iqBoxH = 33;

  for (let i = 1; i <= 20; i += 1) {
    const row = Math.floor((i - 1) / 5);
    const col = (i - 1) % 5;
    const x = 40 + col * (iqBoxW + answerGap);
    const y = iqY + 22 + row * (iqBoxH + 7);

    const isCorrect = Number(candidate[`IQ${i}Status`]) === 1;

    drawIQBox(doc, `IQ${i}`, candidate[`IQ${i}`] || "-", isCorrect, x, y, iqBoxW, iqBoxH);
  }

  // Legend
  const legendY = 630;

  doc.roundedRect(40, legendY, 12, 8, 2).fill("#dcfce7");
  doc.font(FONT_REGULAR).fontSize(7).fillColor("#334155").text("Correct", 57, legendY - 1);

  doc.roundedRect(110, legendY, 12, 8, 2).fill("#fee2e2");
  doc.font(FONT_REGULAR).fontSize(7).fillColor("#334155").text("Wrong", 127, legendY - 1);

  doc
    .font(FONT_REGULAR)
    .fontSize(7)
    .fillColor("#64748b")
    .text("This is a system-generated recruitment assessment report.", 40, 785, {
      width: 515,
      align: "center",
    });
}

function sendPdf(res, filename, title, subtitle, candidates) {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  registerFonts(doc);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

  doc.pipe(res);
  addHeader(doc, title, subtitle);

  if (!candidates || candidates.length === 0) {
    doc.font(FONT_REGULAR).fontSize(12).fillColor("#111827").text("No candidate data available.");
    doc.end();
    return;
  }

  addSummary(doc, candidates);

  doc
    .font(FONT_BOLD)
    .fontSize(13)
    .fillColor("#111827")
    .text("Candidate Performance Details", 40, doc.y);

  doc.y += 22;

  candidates.forEach((candidate, index) => addCandidateBlock(doc, candidate, index));

  doc.end();
}

router.get("/candidate-pdf/:recruitId", async (req, res) => {
  try {
    const recruitId = Number(req.params.recruitId);

    if (!recruitId) {
      return res.status(400).json({ message: "Invalid RecruitID" });
    }

    const pool = await poolPromise;

    const whereClause = `
      WHERE n.RecruitID = ${recruitId}
    `;

    const result = await pool.request().query(getRecruitmentQuery(whereClause));
    const candidate = result.recordset[0];

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const safeName = String(candidate.Name || "Candidate").replace(/[^a-z0-9]/gi, "_");

    const doc = new PDFDocument({
      margin: 40,
      size: "A4",
      autoFirstPage: true,
    });

    registerFonts(doc);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=GRI_Individual_Candidate_Report_${safeName}.pdf`
    );

    doc.pipe(res);

    addHeader(
      doc,
      "Individual Candidate Report",
      `Recruit ID: ${candidate.RecruitID || "N/A"}`
    );

    addCandidateDetails(doc, candidate);

    doc.end();
  } catch (error) {
    console.error("Individual candidate PDF error:", error);
    res.status(500).json({
      message: "Failed to generate individual candidate PDF",
      error: error.message,
    });
  }
});

router.get("/individual-candidates-current-month-pdf", async (req, res) => {
  try {
    const pool = await poolPromise;

    const whereClause = `
      WHERE n.IQExamStartTime >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
        AND n.IQExamStartTime < DATEADD(MONTH, 1, DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1))
    `;

    const result = await pool.request().query(getRecruitmentQuery(whereClause));

    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    sendPdf(
      res,
      "GRI_Current_Month_Individual_Candidates_Report.pdf",
      "Individual Candidates Report",
      `Assessment candidates for ${currentMonth}`,
      result.recordset
    );
  } catch (error) {
    console.error("Current month individual report error:", error);
    res.status(500).json({
      message: "Failed to generate current month individual candidates PDF",
      error: error.message,
    });
  }
});

router.get("/monthly-pdf", async (req, res) => {
  try {
    const month = req.query.month;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        message: "Month is required in YYYY-MM format. Example: ?month=2026-06",
      });
    }

    const [year, monthNumber] = month.split("-").map(Number);

    if (monthNumber < 1 || monthNumber > 12) {
      return res.status(400).json({ message: "Invalid month value" });
    }

    const pool = await poolPromise;

    const whereClause = `
      WHERE n.IQExamStartTime >= DATEFROMPARTS(${year}, ${monthNumber}, 1)
        AND n.IQExamStartTime < DATEADD(MONTH, 1, DATEFROMPARTS(${year}, ${monthNumber}, 1))
    `;

    const result = await pool.request().query(getRecruitmentQuery(whereClause));

    const monthLabel = new Date(year, monthNumber - 1, 1).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    sendPdf(
      res,
      `GRI_Monthly_Recruitment_Report_${month}.pdf`,
      "Monthly Recruitment Report",
      `Recruitment performance summary for ${monthLabel}`,
      result.recordset
    );
  } catch (error) {
    console.error("Monthly PDF report error:", error);
    res.status(500).json({
      message: "Failed to generate monthly PDF report",
      error: error.message,
    });
  }
});

router.get("/recruitment-pdf", async (req, res) => {
  try {
    const pool = await poolPromise;

    const whereClause = `
      WHERE n.IQExamStartTime >= '${FROM_DATE}'
    `;

    const result = await pool.request().query(getRecruitmentQuery(whereClause));

    sendPdf(
      res,
      "GRI_Recruitment_Performance_Report.pdf",
      "Recruitment Performance Report",
      `All recruitment performance records from ${FROM_DATE}`,
      result.recordset
    );
  } catch (error) {
    console.error("Recruitment PDF report error:", error);
    res.status(500).json({
      message: "Failed to generate recruitment PDF report",
      error: error.message,
    });
  }
});

function formatDate(value) {
  if (!value) return "N/A";

  // SQL query returns datetime values as strings using style 121:
  // YYYY-MM-DD HH:mm:ss.mmm
  // Do not use new Date(value).toLocaleString() here, because it converts
  // the database time to the server/browser timezone and changes the displayed time.
  const rawValue = String(value).trim();

  const normalizedValue = rawValue.replace("T", " ");
  const [datePart, rawTimePart = ""] = normalizedValue.split(" ");

  if (!datePart || !rawTimePart) return rawValue;

  const [year, month, day] = datePart.split("-");
  const [hourText, minuteText, secondWithMs = "00"] = rawTimePart.split(":");

  if (!year || !month || !day || !hourText || !minuteText) return rawValue;

  const hour = Number(hourText);
  const minute = String(minuteText).padStart(2, "0");
  const second = String(secondWithMs).split(".")[0].padStart(2, "0");

  if (Number.isNaN(hour)) return rawValue;

  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${Number(month)}/${Number(day)}/${year}, ${displayHour}:${minute}:${second} ${ampm}`;
}

module.exports = router;
