const { poolPromise } = require("../config/db");

const FROM_DATE = "2026-06-01";

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

exports.getIQResults = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      WITH IQDetails AS (
        SELECT
          n.RecruitID,
          n.Name,
          n.Email,
          n.MobileNumber,
          n.Position,
          n.NHRNo,
          n.IQExamStartTime,
          n.IQExamEndTime,
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
        WHERE n.IQExamStartTime >= '${FROM_DATE}'
      )
      SELECT
        RecruitID,
        Name,
        Email,
        MobileNumber,
        Position,
        NHRNo,
        IQExamStartTime,
        IQExamEndTime,
        COUNT(*) AS TotalQuestions,
        SUM(IsCorrect) AS CorrectAnswers,
        COUNT(*) - SUM(IsCorrect) AS WrongAnswers,
        CAST(SUM(IsCorrect) * 100.0 / COUNT(*) AS DECIMAL(5,2)) AS Percentage,
        DATEDIFF(MINUTE, IQExamStartTime, IQExamEndTime) AS TimeTakenMinutes
      FROM IQDetails
      GROUP BY
        RecruitID,
        Name,
        Email,
        MobileNumber,
        Position,
        NHRNo,
        IQExamStartTime,
        IQExamEndTime
      ORDER BY RecruitID DESC;
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Get IQ Results Error:", error);
    res.status(500).json({
      message: "Server error while loading IQ results",
      error: error.message,
    });
  }
};

exports.getHQResults = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        RecruitID,
        Name,
        Email,
        MobileNumber,
        Position,
        NHRNo,
        HQ1,
        HQ2,
        HQ3,
        HQ4,
        HQ5,
        HQ6,
        HQ7,
        HQ8,
        HQ9,
        HQ10,
        HQExamStartTime,
        HQExamEndTime,
        DATEDIFF(MINUTE, HQExamStartTime, HQExamEndTime) AS HQTimeTakenMinutes,
        CASE
          WHEN HQ1 IS NOT NULL AND LTRIM(RTRIM(HQ1)) <> ''
           AND HQ2 IS NOT NULL AND LTRIM(RTRIM(HQ2)) <> ''
           AND HQ3 IS NOT NULL AND LTRIM(RTRIM(HQ3)) <> ''
           AND HQ4 IS NOT NULL AND LTRIM(RTRIM(HQ4)) <> ''
           AND HQ5 IS NOT NULL AND LTRIM(RTRIM(HQ5)) <> ''
           AND HQ6 IS NOT NULL AND LTRIM(RTRIM(HQ6)) <> ''
           AND HQ7 IS NOT NULL AND LTRIM(RTRIM(HQ7)) <> ''
           AND HQ8 IS NOT NULL AND LTRIM(RTRIM(HQ8)) <> ''
           AND HQ9 IS NOT NULL AND LTRIM(RTRIM(HQ9)) <> ''
           AND HQ10 IS NOT NULL AND LTRIM(RTRIM(HQ10)) <> ''
          THEN 'Completed'
          ELSE 'Pending'
        END AS HQStatus
      FROM CommonData.dbo.NewRecruitInformation
      WHERE HQExamStartTime >= '${FROM_DATE}'
      ORDER BY RecruitID DESC;
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Get HQ Results Error:", error);
    res.status(500).json({
      message: "Server error while loading HQ results",
      error: error.message,
    });
  }
};

exports.getRecruitmentPerformance = async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
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
        WHERE n.IQExamStartTime >= '${FROM_DATE}'
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

        n.HQExamStartTime,
        n.HQExamEndTime,
        DATEDIFF(MINUTE, n.HQExamStartTime, n.HQExamEndTime) AS HQTimeTakenMinutes,

        n.IQExamStartTime,
        n.IQExamEndTime,
        DATEDIFF(MINUTE, n.IQExamStartTime, n.IQExamEndTime) AS IQTimeTakenMinutes,

        n.HQ1,
        n.HQ2,
        n.HQ3,
        n.HQ4,
        n.HQ5,
        n.HQ6,
        n.HQ7,
        n.HQ8,
        n.HQ9,
        n.HQ10,

        n.IQ1,
        n.IQ2,
        n.IQ3,
        n.IQ4,
        n.IQ5,
        n.IQ6,
        n.IQ7,
        n.IQ8,
        n.IQ9,
        n.IQ10,
        n.IQ11,
        n.IQ12,
        n.IQ13,
        n.IQ14,
        n.IQ15,
        n.IQ16,
        n.IQ17,
        n.IQ18,
        n.IQ19,
        n.IQ20,

        ISNULL(iq.TotalQuestions, 20) AS TotalQuestions,
        ISNULL(iq.CorrectAnswers, 0) AS CorrectAnswers,
        ISNULL(iq.TotalQuestions, 20) - ISNULL(iq.CorrectAnswers, 0) AS WrongAnswers,
        CAST(
          ISNULL(iq.CorrectAnswers, 0) * 100.0 / ISNULL(iq.TotalQuestions, 20)
          AS DECIMAL(5,2)
        ) AS Percentage,

        iq.IQ1Status,
        iq.IQ2Status,
        iq.IQ3Status,
        iq.IQ4Status,
        iq.IQ5Status,
        iq.IQ6Status,
        iq.IQ7Status,
        iq.IQ8Status,
        iq.IQ9Status,
        iq.IQ10Status,
        iq.IQ11Status,
        iq.IQ12Status,
        iq.IQ13Status,
        iq.IQ14Status,
        iq.IQ15Status,
        iq.IQ16Status,
        iq.IQ17Status,
        iq.IQ18Status,
        iq.IQ19Status,
        iq.IQ20Status

      FROM CommonData.dbo.NewRecruitInformation n
      LEFT JOIN IQMarks iq
        ON iq.RecruitID = n.RecruitID
      WHERE n.IQExamStartTime >= '${FROM_DATE}'
      ORDER BY n.RecruitID DESC;
    `);

    res.json(result.recordset);
  } catch (error) {
    console.error("Recruitment Performance Error:", error);
    res.status(500).json({
      message: "Server error while loading recruitment performance",
      error: error.message,
    });
  }
};