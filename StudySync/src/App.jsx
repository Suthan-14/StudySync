
import { useState, createContext, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Outlet,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { CiLogout } from "react-icons/ci";

import home from "./assets/home.svg";
import arrow from "./assets/arrow.svg";
import note from "./assets/note.svg";
import graph from "./assets/graph.svg";
import clock from "./assets/clock.svg";
import setting from "./assets/setting.svg";
import tick from "./assets/tick.svg";
import img from "./assets/images.png";
import profile from "./assets/profilee.svg";
import Notes from "./component/Notes";
import Dashboard from "./component/Dashboard";
import Timer from "./component/Timer";
import Task from "./component/Task";
import AddNote from "./component/AddNote";
import OneNote from "./component/OneNote";
import Edit from "./component/Edit";
import Analytics from "./component/Analytics";
import Signup from "./component/Signup";
import Login from "./component/Login";
import NotificationBell from "./component/NotificationBell";
import User from "./component/User";
import ThemeToggle from "./component/ThemeToggle";
import AiStudyAssistant from "./component/AiStudyAssistant";
import GoogleSuccess from "./component/GoogleSuccess";

import "./App.css";

export const Timerclock = createContext();

function MainLayout() {
  const [cls, setcls] = useState(false);
  const [sear, setsear] = useState("");
  const [logout, setlogout] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://localhost:9000/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const data = await response.json();
        const profile = data.user || data;

        setUser((previous) => ({
          ...previous,
          ...profile,
        }));

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            ...profile,
          })
        );
      } catch (error) {
        console.error("Unable to fetch profile:", error);
      }
    };

    fetchProfile();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setlogout(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="navbar">
      <nav className={`navigation ${cls ? "display" : ""}`}>
        <div className="sidebar-header">
          <Link className="logo" to="/dashboard">
            <span className={`span ${cls ? "spandis" : ""}`}>
              Study Sync .
            </span>
          </Link>

          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setcls((previous) => !previous)}
            aria-label="Toggle sidebar"
          >
            <img
              src={arrow}
              alt=""
              className="svg arrow-svg"
            />
          </button>
        </div>

        <Link
          onClick={() => setcls(true)}
          className="lnk"
          to="/dashboard"
        >
          <img src={home} alt="Dashboard" className="svg" />
          <span>Dashboard</span>
        </Link>

        <Link
          onClick={() => setcls(true)}
          className="lnk"
          to="/task"
        >
          <img src={tick} alt="Task" className="svg" />
          <span>Task</span>
        </Link>

        <Link
          onClick={() => setcls(true)}
          className="lnk"
          to="/timer"
        >
          <img src={clock} alt="Timer" className="svg" />
          <span>Pomodoro Timer</span>
        </Link>

        <Link
          onClick={() => setcls(true)}
          className="lnk"
          to="/Notes"
        >
          <img src={note} alt="Notes" className="svg" />
          <span>Notes</span>
        </Link>

        <Link
          onClick={() => setcls(true)}
          className="lnk blast"
          to="/Analytics"
        >
          <img src={graph} alt="Analytics" className="svg" />
          <span>Analysis</span>
        </Link>

        <div className="bottom">
          
<div className="bottom">
  <div className="settings-wrapper">
    <button
      type="button"
      className="lnk settings"
      onClick={() =>{ setShowTheme((prev) => !prev)
        setcls(true)
      }}
    >
      <img src={setting} alt="Settings" className="svg rotate" />
      <span>Settings</span>
    </button>

    {showTheme && (
      <div className="sidebar-theme-toggle">
        <ThemeToggle />
      </div>
    )}
  </div>

  <Link onClick={() => setcls(true)} className="lnk profile" to="/user">
    <img src={profile} alt="Profile" className="svg" />
    <span>Profile</span>
  </Link>
</div>


       
        </div>
      </nav>

      <div className="search">
        <div className="info">
          <p>Welcome back |</p>
          <p>{user.username || user.name || "Student"}</p>
        </div>

        <div className="algleft">
          <input
            type="search"
            value={sear}
            placeholder="Search StudySync"
            onChange={(e) => setsear(e.target.value)}
          />

          <div className="notification-container">
            <NotificationBell />
          </div>

          <button
            type="button"
            className="profile-options"
            onClick={() => setlogout((previous) => !previous)}
            aria-label="Open profile menu"
          >
            <img
              src={user.profileImage || img}
              alt="Profile"
            />
          </button>

          <div className={logout ? "log-out" : "hidden"}>
            <div className="container">
              <button type="button" onClick={handleLogout}>
                <CiLogout size={25} className="logout-icon" />
                <span>LogOut</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rend">
        <Outlet context={{ sear }} />
      </div>
      <AiStudyAssistant />
    </div>
  );
}

function App() {
  const [timer, settimer] = useState(25 * 60);
  const [pasue, setpasue] = useState(false);
  const [timeleft, settimeleft] = useState(25 * 60);
  const [cont, setcont] = useState(false);
  const [session, setsession] = useState(0);

  useEffect(() => {
    if (!cont || pasue || timeleft <= 0) return;

    const interval = setInterval(() => {
      settimeleft((previous) => {
        if (previous <= 1) {
          clearInterval(interval);
          setcont(false);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cont, pasue, timeleft]);

  return (
    <Timerclock.Provider
      value={{
        timer,
        settimer,
        pasue,
        setpasue,
        timeleft,
        settimeleft,
        cont,
        setcont,
        session,
        setsession,
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/google-success"
            element={<GoogleSuccess />}
          />

          <Route element={<MainLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />
            <Route path="/task" element={<Task />} />
            <Route path="/timer" element={<Timer />} />
            <Route path="/Notes" element={<Notes />} />
            <Route path="/New-notes" element={<AddNote />} />
            <Route path="/P-Notes/:id" element={<OneNote />} />
            <Route path="/Edit/:id" element={<Edit />} />
            <Route path="/Analytics" element={<Analytics />} />
            <Route path="/user" element={<User />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Timerclock.Provider>
  );
}

export default App;
