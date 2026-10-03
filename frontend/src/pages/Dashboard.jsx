import { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

const API_BASE_URL = "http://172.20.245.27:5001";

function Dashboard({ setPage }) {
  const [activeTab, setActiveTab] = useState("iqAnalytics");
  const [results, setResults] = useState([]);
  const [hqResults, setHqResults] = useState([]);
  const [performanceResults, setPerformanceResults] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [hqSearchText, setHqSearchText] = useState("");
  const [performanceSearch, setPerformanceSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const recordsPerPage = 10;
  const loggedUser = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    loadIQResults();
    loadHQResults();
    loadRecruitmentPerformance();
  }, []);

  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const loadIQResults = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/dashboard/iq-results`,
        getAuthHeader()
      );

      setResults(response.data);
    } catch (error) {
      console.error("IQ load error:", error);

      if (error.code === "ERR_NETWORK") {
        alert(
          "Cannot connect to backend. Make sure backend is running on http://172.20.245.27:5001"
        );
        return;
      }

      alert(error.response?.data?.message || "Failed to load IQ dashboard data");
    }
  };

  const loadHQResults = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/dashboard/hq-results`,
        getAuthHeader()
      );

      setHqResults(response.data);
    } catch (error) {
      console.error("HQ load error:", error);

      if (error.code === "ERR_NETWORK") {
        alert(
          "Cannot connect to backend. Make sure backend is running on http://172.20.245.27:5001"
        );
        return;
      }

      alert(error.response?.data?.message || "Failed to load HQ dashboard data");
    }
  };

  const loadRecruitmentPerformance = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/dashboard/recruitment-performance`,
        getAuthHeader()
      );

      setPerformanceResults(response.data);
    } catch (error) {
      console.error("Performance load error:", error);

      if (error.code === "ERR_NETWORK") {
        alert(
          "Cannot connect to backend. Make sure backend is running on http://172.20.245.27:5001"
        );
        return;
      }

      alert(error.response?.data?.message || "Failed to load recruitment performance data");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setPage("home");
  };

  const filteredResults = results.filter((item) =>
    item.Name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalPages = Math.ceil(filteredResults.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;

  const paginatedResults = filteredResults.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  const totalCandidates = filteredResults.length;

  const averageScore =
    filteredResults.length > 0
      ? (
          filteredResults.reduce(
            (sum, item) => sum + Number(item.Percentage || 0),
            0
          ) / filteredResults.length
        ).toFixed(2)
      : "0.00";

  const highestScore =
    filteredResults.length > 0
      ? Math.max(...filteredResults.map((item) => Number(item.Percentage || 0)))
      : 0;

  const failedCandidates = filteredResults.filter(
    (item) => Number(item.Percentage || 0) < 80
  ).length;

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  const selectTab = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="hr-layout">
      {/* MOBILE HEADER */}
      <header className="mobile-dashboard-header">
        <button
          type="button"
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          ☰
        </button>

        <div className="mobile-dashboard-brand">
          <strong>GRI HR</strong>
          <span>IQ / EQ Analytics</span>
        </div>

        <div className="mobile-dashboard-avatar">
          {(loggedUser?.fullName || loggedUser?.FullName || "H")
            .charAt(0)
            .toUpperCase()}
        </div>
      </header>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <button
          type="button"
          className="mobile-sidebar-overlay"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${mobileMenuOpen ? "sidebar-mobile-open" : ""}`}>
        <div className="sidebar-mobile-top">
          <div className="sidebar-logo">
            <h2>GRI HR</h2>
            <p>IQ / EQ Analytics</p>
          </div>

          <button
            type="button"
            className="sidebar-close-button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            ×
          </button>
        </div>

        <nav className="sidebar-menu">
          <button
            className={activeTab === "iqAnalytics" ? "active" : ""}
            onClick={() => selectTab("iqAnalytics")}
          >
            IQ Analytics
          </button>

          <button
            className={activeTab === "hqAnalytics" ? "active" : ""}
            onClick={() => selectTab("hqAnalytics")}
          >
            EQ Analytics
          </button>

          <button
            className={
              activeTab === "recruitmentPerformance" ? "active" : ""
            }
            onClick={() => selectTab("recruitmentPerformance")}
          >
            Recruitment Performance
          </button>

          <button
            className={activeTab === "reports" ? "active" : ""}
            onClick={() => selectTab("reports")}
          >
            Reports
          </button>
        </nav>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="topbar">
          <div className="topbar-copy">
            <h1>{getPageTitle(activeTab)}</h1>
            <p>Human Resource candidate performance dashboard</p>
          </div>

          <UserProfileDropdown
            loggedUser={loggedUser}
            logout={logout}
            setPage={setPage}
          />
        </div>

        {activeTab === "iqAnalytics" && (
          <>
            <SummaryCards
              totalCandidates={totalCandidates}
              averageScore={averageScore}
              highestScore={highestScore}
              failedCandidates={failedCandidates}
            />

            <CandidateTable
              results={paginatedResults}
              allResults={results}
              filteredCount={filteredResults.length}
              searchText={searchText}
              setSearchText={setSearchText}
              handleSearch={handleSearch}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </>
        )}

        {activeTab === "hqAnalytics" && (
          <HQAnalytics
            hqResults={hqResults}
            hqSearchText={hqSearchText}
            setHqSearchText={setHqSearchText}
          />
        )}

        {activeTab === "recruitmentPerformance" && (
          <RecruitmentPerformance
            performanceResults={performanceResults}
            performanceSearch={performanceSearch}
            setPerformanceSearch={setPerformanceSearch}
          />
        )}

        {activeTab === "reports" && (
          <ReportsSection performanceResults={performanceResults} />
        )}
      </main>
    </div>
  );
}


function getDatePartsFromDbValue(value) {
  if (!value) return null;

  const text = String(value);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})[T\s]/);

  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]) - 1,
    day: Number(match[3]),
  };
}

function ReportsSection({ performanceResults }) {
  const [showIndividualReports, setShowIndividualReports] = useState(false);
  const [reportSearchText, setReportSearchText] = useState("");

  const today = new Date();
  const selectedYear = today.getFullYear();

  const getCandidateExamDate = (item) =>
    item.IQExamStartTime ||
    item.EQExamStartTime ||
    item.HQExamStartTime ||
    item.IQExamEndTime ||
    item.EQExamEndTime ||
    item.HQExamEndTime;

  const monthlyReportsMap = performanceResults.reduce((groups, item) => {
    const dateValue = getCandidateExamDate(item);
    if (!dateValue) return groups;

    const dbParts = getDatePartsFromDbValue(dateValue);
    if (!dbParts) return groups;

    const date = new Date(dbParts.year, dbParts.month, dbParts.day);
    const key = `${dbParts.year}-${String(dbParts.month + 1).padStart(2, "0")}`;
    const label = date.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    if (!groups[key]) {
      groups[key] = {
        key,
        label,
        monthIndex: dbParts.month,
        year: dbParts.year,
        candidates: [],
      };
    }

    groups[key].candidates.push(item);
    return groups;
  }, {});

  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(selectedYear, index, 1);
    const key = `${selectedYear}-${String(index + 1).padStart(2, "0")}`;
    const label = date.toLocaleString("default", { month: "long" });
    const shortLabel = date.toLocaleString("default", { month: "short" });
    const report = monthlyReportsMap[key];

    return {
      key,
      label,
      shortLabel,
      year: selectedYear,
      candidates: report?.candidates || [],
      available: Boolean(report),
    };
  });

  const currentMonthKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const firstAvailableMonth = months.find((month) => month.available);
  const currentMonthAvailable = months.find(
    (month) => month.key === currentMonthKey && month.available
  );

  const [selectedMonthKey, setSelectedMonthKey] = useState(
    currentMonthAvailable?.key || firstAvailableMonth?.key || currentMonthKey
  );

  useEffect(() => {
    const selectedStillAvailable = months.some(
      (month) => month.key === selectedMonthKey && month.available
    );

    if (!selectedStillAvailable) {
      setSelectedMonthKey(currentMonthAvailable?.key || firstAvailableMonth?.key || currentMonthKey);
    }
  }, [performanceResults]);

  const selectedMonth = months.find((month) => month.key === selectedMonthKey);
  const selectedMonthCandidates = selectedMonth?.candidates || [];
  const selectedMonthLabel = selectedMonth
    ? `${selectedMonth.label} ${selectedMonth.year}`
    : "No month selected";

  const currentMonthCandidates = monthlyReportsMap[currentMonthKey]?.candidates || [];
  const currentMonthLabel = today.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const filteredCurrentMonthCandidates = currentMonthCandidates.filter((item) => {
    const searchValue = reportSearchText.trim().toLowerCase();

    if (!searchValue) return true;

    const name = item.Name?.toLowerCase() || "";
    const email = item.Email?.toLowerCase() || "";
    const position = item.Position?.toLowerCase() || "";
    const nhrNo = item.NHRNo?.toLowerCase() || "";

    return (
      name.includes(searchValue) ||
      email.includes(searchValue) ||
      position.includes(searchValue) ||
      nhrNo.includes(searchValue)
    );
  });

  const openPdf = (url) => {
    window.open(url, "_blank");
  };

  const downloadCandidateReport = (candidate) => {
    if (!candidate?.RecruitID) {
      alert("Candidate ID not found");
      return;
    }

    openPdf(`${API_BASE_URL}/api/reports/candidate-pdf/${candidate.RecruitID}`);
  };

  const downloadSelectedMonthlyReport = () => {
    if (!selectedMonth?.available) return;

    openPdf(`${API_BASE_URL}/api/reports/monthly-pdf?month=${selectedMonth.key}`);
  };

  const monthButtonStyle = (month) => ({
    border: month.key === selectedMonthKey ? "2px solid #2563eb" : "1px solid #dbe3ef",
    background: !month.available
      ? "#f1f5f9"
      : month.key === selectedMonthKey
      ? "#2563eb"
      : "#ffffff",
    color: !month.available
      ? "#94a3b8"
      : month.key === selectedMonthKey
      ? "#ffffff"
      : "#0f172a",
    cursor: month.available ? "pointer" : "not-allowed",
    borderRadius: "14px",
    padding: "16px 12px",
    minHeight: "78px",
    textAlign: "center",
    boxShadow: month.available ? "0 8px 20px rgba(15, 23, 42, 0.08)" : "none",
    transition: "all 0.2s ease",
  });

  return (
    <section className="reports-page">
      <div className="reports-title-card">
        <div>
          <h2>Reports</h2>
          <p>Download individual candidate reports and monthly recruitment reports</p>
        </div>
      </div>

      {!showIndividualReports && (
        <>
          <div className="report-grid two-report-grid">
            <div className="report-card featured-report-card">
              <div className="report-icon">
                {today.toLocaleString("default", { month: "long" })}
              </div>

              <h3>Individual Candidate Reports</h3>

              <p>
                Current month candidates: {currentMonthLabel}. Download a
                separate PDF for each candidate.
              </p>

              <button
                type="button"
                onClick={() => {
                  setShowIndividualReports(true);
                  setReportSearchText("");
                }}
              >
                Show Individual Candidate Reports
              </button>
            </div>

            <div className="report-card featured-report-card">
             <div className="report-icon">
  {selectedMonth?.label || today.toLocaleString("default", { month: "long" })}
</div>

              <h3>Monthly Recruitment Report</h3>

              <p>
                Select an available month below, then download the monthly
                recruitment performance PDF.
              </p>

              <button
                type="button"
                disabled={!selectedMonth?.available}
                onClick={downloadSelectedMonthlyReport}
              >
                Download this Month Report
              </button>
            </div>
          </div>

          <div className="monthly-report-section">
            <div className="monthly-report-header">
              <h3>Available Monthly Reports - {selectedYear}</h3>
              <p>
                Select a month first. Months with no candidate data are disabled.
              </p>
            </div>

            <div
              className="month-selector-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, minmax(120px, 1fr))",
                gap: "14px",
                marginTop: "22px",
              }}
            >
              {months.map((month) => (
                <button
                  key={month.key}
                  type="button"
                  disabled={!month.available}
                  onClick={() => {
                    if (month.available) {
                      setSelectedMonthKey(month.key);
                    }
                  }}
                  style={monthButtonStyle(month)}
                >
                  <strong style={{ display: "block", fontSize: "16px" }}>
                    {month.shortLabel}
                  </strong>

                  <span style={{ display: "block", fontSize: "13px", marginTop: "6px" }}>
                    {month.available
                      ? `${month.candidates.length} candidate(s)`
                      : "No report"}
                  </span>
                </button>
              ))}
            </div>

            <div
              className="selected-month-card"
              style={{
                marginTop: "24px",
                border: "1px solid #dbeafe",
                borderRadius: "18px",
                padding: "22px",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>{selectedMonthLabel}</h3>
                <p style={{ margin: "8px 0 0", color: "#64748b" }}>
                  {selectedMonth?.available
                    ? `${selectedMonthCandidates.length} candidate(s) available for this monthly report.`
                    : "No monthly report available for this month."}
                </p>
              </div>

              <button
                type="button"
                disabled={!selectedMonth?.available}
                onClick={downloadSelectedMonthlyReport}
                style={{
                  background: selectedMonth?.available ? "#2563eb" : "#cbd5e1",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "14px",
                  padding: "14px 26px",
                  fontWeight: 700,
                  cursor: selectedMonth?.available ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                }}
              >
                Download PDF
              </button>
            </div>
          </div>
        </>
      )}

      {showIndividualReports && (
        <div className="monthly-report-section individual-report-panel">
          <div className="report-back-row">
            <button
              type="button"
              className="report-back-btn"
              onClick={() => {
                setShowIndividualReports(false);
                setReportSearchText("");
              }}
            >
              ← Back to Reports
            </button>
          </div>

          <div className="monthly-report-header report-list-header">
            <div>
              <h3>Individual Candidate Reports - {currentMonthLabel}</h3>
              <p>
                Showing {filteredCurrentMonthCandidates.length} of{" "}
                {currentMonthCandidates.length} current month candidates.
              </p>
            </div>

            <input
              className="search-input report-search-input"
              type="text"
              placeholder="Search by name, email, position, or NHR No..."
              value={reportSearchText}
              onChange={(e) => setReportSearchText(e.target.value)}
            />
          </div>

          {currentMonthCandidates.length === 0 ? (
            <div className="empty-section">
              No current month candidates available.
            </div>
          ) : filteredCurrentMonthCandidates.length === 0 ? (
            <div className="empty-section">
              No candidates found for "{reportSearchText}".
            </div>
          ) : (
            <div className="individual-candidate-report-list">
              {filteredCurrentMonthCandidates.map((candidate) => (
                <div
                  className="individual-candidate-report-row"
                  key={candidate.RecruitID}
                >
                  <div className="candidate-report-info">
                    <div className="candidate-report-avatar">
                      {(candidate.Name || "?").charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <strong>{candidate.Name || "No name"}</strong>
                      <span>{candidate.Email || "No email"}</span>
                      <small>
                        {candidate.Position || "No position"} | NHR No:{" "}
                        {candidate.NHRNo || "N/A"}
                      </small>
                    </div>
                  </div>

                  <div className="candidate-report-actions">
                    <span className="candidate-report-date">
                      {formatDate(getCandidateExamDate(candidate))}
                    </span>

                    <button
                      type="button"
                      onClick={() => downloadCandidateReport(candidate)}
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
function UserProfileDropdown({ loggedUser, logout, setPage }) {
  const [open, setOpen] = useState(false);

  const fullName = loggedUser?.fullName || "HR User";
  const email = loggedUser?.email || loggedUser?.Email || "No email available";
  const role = loggedUser?.role || loggedUser?.Role || "HR Executive";
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <div className="profile-dropdown-wrapper">
      <button
        type="button"
        className="profile-trigger"
        onClick={() => setOpen(!open)}
      >
        <div className="profile-avatar">{initial}</div>

        <div className="profile-trigger-info">
          <span className="profile-trigger-name">{fullName}</span>
          <span className="profile-trigger-role">{role}</span>
        </div>

        <span className={`profile-arrow ${open ? "open" : ""}`}>▼</span>
      </button>

      {open && (
        <div className="profile-menu">
          <div className="profile-menu-header">
            <div className="profile-menu-avatar">{initial}</div>

            <div>
              <h4>{fullName}</h4>
              <p>{email}</p>
            </div>
          </div>

          <div className="profile-menu-divider" />


<button
  type="button"
  className="profile-menu-item"
  onClick={() => setPage("changePassword")}
>
  Change Password
</button>

          <div className="profile-menu-divider" />

          <button
            type="button"
            className="profile-menu-item logout-menu-item"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function getPageTitle(activeTab) {
  if (activeTab === "iqAnalytics") return "IQ Analytics";
  if (activeTab === "hqAnalytics") return "EQ Analytics";
  if (activeTab === "recruitmentPerformance") return "Recruitment Performance";
  if (activeTab === "eqAnalytics") return "EQ Analytics";
  if (activeTab === "reports") return "Reports";
  return "IQ Analytics";
}

function SummaryCards({
  totalCandidates,
  averageScore,
  highestScore,
  failedCandidates,
}) {
  return (
    <div className="cards">
      <DashboardCard title="IQ Candidates" value={totalCandidates} />
      <DashboardCard title="Average Score" value={`${averageScore}%`} />
      <DashboardCard title="Highest Score" value={`${highestScore}%`} />
      <DashboardCard title="Failed Candidates" value={failedCandidates} />
    </div>
  );
}

function CandidateTable({
  results,
  allResults,
  filteredCount,
  searchText,
  setSearchText,
  handleSearch,
  currentPage,
  setCurrentPage,
  totalPages,
}) {
  return (
    <section className="table-card modern-table-card">
      <div className="table-header">
        <div>
          <h2>IQ Candidate Results</h2>
          <p>
            Showing {results.length} of {filteredCount} candidates
          </p>
        </div>

        <AutocompleteSearch
          value={searchText}
          onChange={handleSearch}
          onSelect={(name) => {
            setSearchText(name);
            setCurrentPage(1);
          }}
          candidates={allResults}
          placeholder="Search candidate by name..."
        />
      </div>

      <div className="responsive-table-wrapper">
      <table className="results-table modern-table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Email</th>
            <th>Position</th>
            <th>Correct</th>
            <th>Wrong</th>
            <th>Score</th>
            <th>Time Taken</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {results.map((item) => (
            <tr key={item.RecruitID}>
              <td className="candidate-name">{item.Name}</td>
              <td>{item.Email}</td>
              <td>{item.Position}</td>
              <td>
                {item.CorrectAnswers} / {item.TotalQuestions}
              </td>
              <td>{item.WrongAnswers}</td>
              <td className="score-cell">
                {Number(item.Percentage || 0).toFixed(2)}%
              </td>
              <td>
                {item.TimeTakenMinutes !== null &&
                item.TimeTakenMinutes !== undefined
                  ? `${item.TimeTakenMinutes} min`
                  : "N/A"}
              </td>
              <td>
                <span
                  className={
                    Number(item.Percentage) >= 80
                      ? "status-pass"
                      : "status-fail"
                  }
                >
                  {Number(item.Percentage) >= 80 ? "Pass" : "Fail"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <Pagination
        resultsLength={results.length}
        filteredCount={filteredCount}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />
    </section>
  );
}

function HQAnalytics({ hqResults, hqSearchText, setHqSearchText }) {
  const [hqCurrentPage, setHqCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const filteredHQ = hqResults.filter((item) =>
    item.Name?.toLowerCase().includes(hqSearchText.toLowerCase())
  );

  const hqTotalPages = Math.ceil(filteredHQ.length / recordsPerPage);
  const hqStartIndex = (hqCurrentPage - 1) * recordsPerPage;

  const paginatedHQ = filteredHQ.slice(
    hqStartIndex,
    hqStartIndex + recordsPerPage
  );

  const completedCount = filteredHQ.filter(
    (item) => item.HQStatus === "Completed"
  ).length;

  const pendingCount = filteredHQ.filter(
    (item) => item.HQStatus === "Pending"
  ).length;

  const handleHQSearch = (e) => {
    setHqSearchText(e.target.value);
    setHqCurrentPage(1);
  };

  return (
    <>
      <div className="cards">
        <DashboardCard title="EQ Candidates" value={filteredHQ.length} />
        <DashboardCard title="Completed EQ" value={completedCount} />
        <DashboardCard title="Pending EQ" value={pendingCount} />
        <DashboardCard title="EQ Questions" value="10" />
      </div>

      <section className="table-card modern-table-card">
        <div className="table-header">
          <div>
            <h2>EQ Candidate Results</h2>
            <p>
              Showing {paginatedHQ.length} of {filteredHQ.length} candidates
            </p>
          </div>

          <AutocompleteSearch
            value={hqSearchText}
            onChange={handleHQSearch}
            onSelect={(name) => {
              setHqSearchText(name);
              setHqCurrentPage(1);
            }}
            candidates={hqResults}
            placeholder="Search candidate by name..."
          />
        </div>

        <div className="responsive-table-wrapper">
        <table className="results-table modern-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Email</th>
              <th>Position</th>
              <th>EQ Answers</th>
              <th>Time Taken</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {paginatedHQ.map((item) => (
              <tr key={item.RecruitID}>
                <td className="candidate-name">{item.Name}</td>
                <td>{item.Email}</td>
                <td>{item.Position}</td>

                <td>
                  <div className="answer-grid">
                    <span>1: {item.HQ1 || "-"}</span>
                    <span>2: {item.HQ2 || "-"}</span>
                    <span>3: {item.HQ3 || "-"}</span>
                    <span>4: {item.HQ4 || "-"}</span>
                    <span>5: {item.HQ5 || "-"}</span>
                    <span>6: {item.HQ6 || "-"}</span>
                    <span>7: {item.HQ7 || "-"}</span>
                    <span>8: {item.HQ8 || "-"}</span>
                    <span>9: {item.HQ9 || "-"}</span>
                    <span>10: {item.HQ10 || "-"}</span>
                  </div>
                </td>

                <td>
                  {item.HQTimeTakenMinutes !== null &&
                  item.HQTimeTakenMinutes !== undefined
                    ? `${item.HQTimeTakenMinutes} min`
                    : "N/A"}
                </td>

                <td>
                  <span
                    className={
                      item.HQStatus === "Completed"
                        ? "status-pass"
                        : "status-fail"
                    }
                  >
                    {item.HQStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <Pagination
          resultsLength={paginatedHQ.length}
          filteredCount={filteredHQ.length}
          currentPage={hqCurrentPage}
          setCurrentPage={setHqCurrentPage}
          totalPages={hqTotalPages}
        />
      </section>
    </>
  );
}

function RecruitmentPerformance({
  performanceResults,
  performanceSearch,
  setPerformanceSearch,
}) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const filteredCandidates = performanceResults.filter((item) =>
    item.Name?.toLowerCase().includes(performanceSearch.toLowerCase())
  );

  return (
    <section className="performance-page">
      <div className="performance-search-card">
        <div>
          <h2>Individual Recruitment Performance</h2>
          <p>Search one candidate and review EQ and IQ paper performance</p>
        </div>

        <AutocompleteSearch
          value={performanceSearch}
          onChange={(e) => {
            setPerformanceSearch(e.target.value);
            setSelectedCandidate(null);
          }}
          onSelect={(candidate) => {
            setPerformanceSearch(candidate.Name);
            setSelectedCandidate(candidate);
          }}
          candidates={performanceResults}
          placeholder="Search candidate by name..."
          extraClassName="performance-search"
        />
      </div>

      {!selectedCandidate && (
        <div className="empty-section">
          Search a candidate name to view individual performance.
        </div>
      )}

      {selectedCandidate && (
        <>
          <div className="candidate-profile-card">
            <div>
              <h2>{selectedCandidate.Name}</h2>
              <p>{selectedCandidate.Position || "No position available"}</p>
            </div>

            <div className="profile-meta">
              <span>Email: {selectedCandidate.Email || "N/A"}</span>
              <span>Mobile: {selectedCandidate.MobileNumber || "N/A"}</span>
              <span>NHR No: {selectedCandidate.NHRNo || "N/A"}</span>
            </div>
          </div>

          <div className="performance-grid">
            <TimeCard
              title="EQ Assessment"
              startTime={selectedCandidate.HQExamStartTime}
              endTime={selectedCandidate.HQExamEndTime}
              duration={selectedCandidate.EQTimeTakenMinutes}
            />

            <TimeCard
              title="IQ Assessment"
              startTime={selectedCandidate.IQExamStartTime}
              endTime={selectedCandidate.IQExamEndTime}
              duration={selectedCandidate.IQTimeTakenMinutes}
            />
          </div>

          <div className="performance-answer-section">
            <AnswerPanel
              title="EQ Answers"
              count={10}
              prefix="HQ"
              candidate={selectedCandidate}
            />

            <IQMarkSummary candidate={selectedCandidate} />

            <AnswerPanel
              title="IQ Answers"
              count={20}
              prefix="IQ"
              candidate={selectedCandidate}
            />
          </div>
        </>
      )}
    </section>
  );
}

function IQMarkSummary({ candidate }) {
  return (
    <div className="iq-mark-summary">
      <div>
        <p>Total Questions</p>
        <h3>{candidate.TotalQuestions || 0}</h3>
      </div>

      <div>
        <p>Correct Answers</p>
        <h3>{candidate.CorrectAnswers || 0}</h3>
      </div>

      <div>
        <p>Wrong Answers</p>
        <h3>{candidate.WrongAnswers || 0}</h3>
      </div>

      <div>
        <p>IQ Score</p>
        <h3>{Number(candidate.Percentage || 0).toFixed(2)}%</h3>
      </div>
    </div>
  );
}

function TimeCard({ title, startTime, endTime, duration }) {
  return (
    <div className="time-card">
      <h3>{title}</h3>

      <div className="time-row">
        <span>Start Time</span>
        <strong>{formatDate(startTime)}</strong>
      </div>

      <div className="time-row">
        <span>End Time</span>
        <strong>{formatDate(endTime)}</strong>
      </div>

      <div className="duration-box">
        {duration !== null && duration !== undefined ? `${duration} min` : "N/A"}
      </div>
    </div>
  );
}

function AnswerPanel({ title, count, prefix, candidate }) {
  const correctIQAnswers = [
    "2)19and24",
    "3)80",
    "2)2",
    "1)3",
    "1)6",
    "3)24",
    "3)Lion",
    "3)Liverpool",
    "3)Sled",
    "4)9:00",
    "1)21",
    "3)72",
    "1)1",
    "2)False",
    "1)6",
    "2)18",
    "2)BC3D",
    "2)36years",
    "3)33.33%",
    "1)E87PQ",
  ];

  const normalizeAnswer = (value) =>
    String(value || "")
      .replace(/\s+/g, "")
      .replace(/\t/g, "")
      .replace(/\n/g, "")
      .replace(/\r/g, "")
      .toUpperCase();

  return (
      <div className="answer-panel">
      <h3>{prefix === "HQ" ? "EQ Answers" : title}</h3>

      <div className="individual-answer-grid">
        {[...Array(count)].map((_, index) => {
          const questionNo = index + 1;
          const key = `${prefix}${questionNo}`;
          const statusKey = `${key}Status`;
          const answerValue = candidate[key];

          const hasAnswer =
            answerValue !== null &&
            answerValue !== undefined &&
            String(answerValue).trim() !== "";

          const isIQ = prefix === "IQ";
          const apiStatus = candidate[statusKey];

          let isCorrect = false;

          if (isIQ && hasAnswer) {
            if (apiStatus !== null && apiStatus !== undefined) {
              isCorrect = Number(apiStatus) === 1;
            } else {
              isCorrect =
                normalizeAnswer(answerValue) ===
                normalizeAnswer(correctIQAnswers[index]);
            }
          }
           const displayLabel =
            prefix === "HQ" ? `EQ${questionNo}` : `${prefix}${questionNo}`;
          return (
            <div
              className={`individual-answer-card ${
                isIQ && hasAnswer
                  ? isCorrect
                    ? "answer-correct"
                    : "answer-wrong"
                  : ""
              }`}
              key={key}
            >
              <span>{displayLabel}</span>
              <strong>{hasAnswer ? answerValue : "-"}</strong>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AutocompleteSearch({
  value,
  onChange,
  onSelect,
  candidates,
  placeholder,
  extraClassName = "",
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchValue = value.trim().toLowerCase();

  const suggestions = searchValue
    ? candidates
        .filter((item) => {
          const name = item.Name?.toLowerCase() || "";
          const email = item.Email?.toLowerCase() || "";
          const nhrNo = item.NHRNo?.toLowerCase() || "";
          return (
            name.includes(searchValue) ||
            email.includes(searchValue) ||
            nhrNo.includes(searchValue)
          );
        })
        .slice(0, 8)
    : [];

  return (
    <div className={`autocomplete-container better-autocomplete ${extraClassName}`}>
      <input
        className="search-input better-search-input"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          setTimeout(() => setShowSuggestions(false), 180);
        }}
      />

      {showSuggestions && searchValue && (
        <div className="autocomplete-list better-autocomplete-list">
          {suggestions.length > 0 ? (
            suggestions.map((item) => (
              <button
                type="button"
                key={item.RecruitID || item.Email || item.NHRNo}
                className="autocomplete-item better-autocomplete-item"
                onMouseDown={() => {
                  onSelect(item);
                  setShowSuggestions(false);
                }}
              >
                <div className="suggestion-avatar">
                  {(item.Name || "?").charAt(0).toUpperCase()}
                </div>

                <div className="suggestion-content">
                  <div className="suggestion-name-row">
                    <strong>{item.Name || "No name"}</strong>
                    <span>{item.Position || "No position"}</span>
                  </div>

                  <div className="suggestion-meta">
                    <span>{item.Email || "No email"}</span>
                    <span>{item.NHRNo || "No NHR No"}</span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="autocomplete-empty">No candidates found</div>
          )}
        </div>
      )}
    </div>
  );
}

function formatDate(value) {
  if (!value) return "N/A";

  const text = String(value);

  const match = text.match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/
  );

  if (!match) return text;

  const [, year, month, day, hour, minute, second] = match;

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

function Pagination({
  resultsLength,
  filteredCount,
  currentPage,
  setCurrentPage,
  totalPages,
}) {
  return (
    <div className="pagination-wrapper">
      <div className="pagination-info">
        Showing {resultsLength} of {filteredCount} results
      </div>

      <div className="pagination">
        <button
          className="pagination-nav"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          Previous
        </button>

        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1;

          if (
            page === 1 ||
            page === totalPages ||
            Math.abs(page - currentPage) <= 2
          ) {
            return (
              <button
                key={page}
                className={currentPage === page ? "page-active" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            );
          }

          if (page === currentPage + 3 || page === currentPage - 3) {
            return (
              <span key={page} className="dots">
                ...
              </span>
            );
          }

          return null;
        })}

        <button
          className="pagination-nav"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function DashboardCard({ title, value }) {
  return (
    <div className="dashboard-card">
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

export default Dashboard;
