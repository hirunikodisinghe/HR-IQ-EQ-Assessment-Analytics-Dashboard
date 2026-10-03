import "../App.css";

function Home({ setPage }) {
  return (
    <div className="home-page">
      <nav className="home-navbar">
        <div className="home-brand">
          <img
            src="/GRI_logo.png"
            alt="GRI Logo"
            className="home-logo"
          />

          <div>
            <h2>Global Rubber Industries</h2>
            <span>HR Assessment Platform</span>
          </div>
        </div>

        <div className="home-nav-actions">
          <button
            className="nav-login"
            onClick={() => setPage("login")}
          >
            Login
          </button>

          <button
            className="nav-signup"
            onClick={() => setPage("signup")}
          >
            Sign Up
          </button>
        </div>
      </nav>

      <section className="home-hero">
        <div className="home-hero-left">
          <span className="hero-badge">
            GRI | IQ & EQ Recruitment Analytics
          </span>

          <h1>
            GRI | HR Dashboard for Candidate's IQ & EQ Assessment Results
          </h1>

          <p>
            View IQ and EQ assessment results, correct answer counts,
            score percentages, time taken, and candidate performance
            insights in one secure HR dashboard.
          </p>

          <div className="home-buttons">
            <button onClick={() => setPage("login")}>
              Get Started
            </button>

            <button
              className="outline-btn"
              onClick={() => setPage("signup")}
            >
              Create HR Account
            </button>
          </div>
        </div>

        <div className="home-hero-card">
          <h3>Dashboard Features</h3>

          <div className="feature-item">
            <span>01</span>
            <p>Candidate IQ and EQ result tracking</p>
          </div>

          <div className="feature-item">
            <span>02</span>
            <p>Correct answer count and score percentage</p>
          </div>

          <div className="feature-item">
            <span>03</span>
            <p>Exam time taken and performance review</p>
          </div>

          <div className="feature-item">
            <span>04</span>
            <p>HR analytics, search, and reporting insights</p>
          </div>
        </div>
      </section>

      <section className="home-stats">
        <div>
          <h3>Secure</h3>
          <p>HR login protected system</p>
        </div>

        <div>
          <h3>Fast</h3>
          <p>Single-page candidate review</p>
        </div>

        <div>
          <h3>Accurate</h3>
          <p>Automatic score calculation</p>
        </div>
      </section>
    </div>
  );
}

export default Home;