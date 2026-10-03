import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";

function App() {
  const [page, setPageState] = useState("home");
  const [history, setHistory] = useState([]);

  const setPage = (newPage) => {
    setHistory((prev) => [...prev, page]);
    setPageState(newPage);
  };

  const goBack = () => {
    if (history.length === 0) {
      setPageState("home");
      return;
    }

    const previousPage = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setPageState(previousPage);
  };

  if (page === "login") {
    return <Login setPage={setPage} goBack={goBack} />;
  }

  if (page === "signup") {
    return <Signup setPage={setPage} goBack={goBack} />;
  }

  if (page === "dashboard") {
    return <Dashboard setPage={setPage} goBack={goBack} />;
  }

  if (page === "profile") {
    return <Profile setPage={setPage} goBack={goBack} />;
  }

  if (page === "changePassword") {
    return <ChangePassword setPage={setPage} goBack={goBack} />;
  }

  return <Home setPage={setPage} goBack={goBack} />;
}

export default App;