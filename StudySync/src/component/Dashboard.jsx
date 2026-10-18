import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Timerclock } from "../App";
import "./dash.css";

const Dashboard = () => {
  const [task, setTask] = useState([]);
  const [timerA, setTimerA] = useState([]);
  const [filtdata, setData] = useState([]);
  const [active, setActive] = useState("completed");
  const [recentNote,setRecentNote] = useState();
  const token = localStorage.getItem("token");
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);


  const getLocalDate = (date = new Date()) => {
    const d = new Date(date);

    return `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };

  const fetchtask = async () => {
    try {
      const response = await fetch(
        "http://localhost:9000/gettask",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();

      setTask(data);

      const filtered = data.filter(
        (item) =>
          item.status?.toLowerCase() === "complete"
      );

      setData(filtered);
    } catch (error) {
      console.error(
        "Failed to fetch task data:",
        error
      );
    }
  };

  useEffect(() => {
    if (token) {
      fetchtask();
    }
  }, [token]);

  useEffect(() => {
    const fetchTimer = async () => {
      try {
        const response = await fetch(
          "http://localhost:9000/gettimer",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch timer data"
          );
        }

        const data = await response.json();

        const timerArray = Array.isArray(data)
          ? data
          : [data];

        setTimerA(timerArray);
      } catch (error) {
        console.error(
          "Error fetching timer:",
          error
        );

        setTimerA([]);
      }
    };

    if (token) {
      fetchTimer();
    }
  }, [token]);

  // Getting Streak

 useEffect(() => {
  const fetchStreak = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("Token not found");
        return;
      }

      const response = await axios.get(
        "http://localhost:9000/streak",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Streak Data:", response.data);

      setStreak(response.data.currentStreak || 0);
      setLongestStreak(response.data.longestStreak || 0);

    } catch (error) {
      console.error(
        "Error fetching streak:",
        error.response?.data || error.message
      );
    }
  };

  fetchStreak();
}, []);
  useEffect(() => {
  const fetchRecentNote = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:9000/notes/recent",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
     
      
      setRecentNote(response.data);
    } catch (error) {
      console.error("Error fetching recent note:", error);
      setRecentNote(null);
    }
  };

  if (token) {
    fetchRecentNote();
  }
}, [token]);

  function completed() {
    const filtered = task.filter(
      (item) =>
        item.status?.toLowerCase() === "complete"
    );

    setData(filtered);
  }

  function priority() {
    const filtered = task.filter(
      (item) =>
        item.priority?.toLowerCase() === "high"
    );

    setData(filtered);
  }

  function duetoday() {
    const today = getLocalDate();

    const filtered = task.filter((item) => {
      if (!item.dueDate) {
        return false;
      }

      return getLocalDate(item.dueDate) === today;
    });

    setData(filtered);
  }

  const upcomingdedline = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);

    endDate.setDate(today.getDate() + 4);
    endDate.setHours(23, 59, 59, 999);

    const upcoming = task.filter((item) => {
      if (!item.dueDate) {
        return false;
      }

      const dueDate = new Date(item.dueDate);

      return (
        dueDate >= today &&
        dueDate <= endDate
      );
    });

    upcoming.sort(
      (a, b) =>
        new Date(a.dueDate) -
        new Date(b.dueDate)
    );

    return upcoming;
  }, [task]);

  const todayProductivity = useMemo(() => {
  const today = getLocalDate();

  const todayTasks = task.filter((item) => {
    if (!item.createdAt) return false;
    return getLocalDate(item.createdAt) === today;
  });

  if (todayTasks.length === 0) return 0;

  const completedToday = todayTasks.filter(
    (item) => item.status?.toLowerCase() === "complete"
  ).length;

  return Math.round((completedToday / todayTasks.length) * 100);
}, [task]);

const completedTaskCount = task.filter(
  (item) => item.status?.toLowerCase() === "complete"
).length;

const totalTaskCount = task.length;
  
  const {
    timer,
    pasue,
    setpasue,
    timeleft,
    settimeleft,
    session,
    setsession,
  } = useContext(Timerclock);

  const start = () => {
    setpasue(true);
  };

  const togglePause = () => {
    setpasue((prev) => !prev);
  };

  const reset = () => {
    settimeleft(timer);
    setpasue(false);
  };

  const completeSession = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await axios.put(
        "http://localhost:9000/timer",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setsession(response.data.session);
      settimeleft(timer);
      setpasue(false);

      const timerResponse = await fetch(
        "http://localhost:9000/gettimer",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (timerResponse.ok) {
        const data =
          await timerResponse.json();

        setTimerA(
          Array.isArray(data)
            ? data
            : [data]
        );
      }
    } catch (error) {
      console.error(
        "Session save error:",
        error
      );
    }
  };

  useEffect(() => {
    if (!pasue) {
      return;
    }

    if (timeleft <= 0) {
      completeSession();
      return;
    }

    const interval = setInterval(() => {
      settimeleft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [pasue, timeleft]);

  const run = () => {
    const min = Math.floor(timeleft / 60);
    const sec = Math.floor(timeleft % 60);

    return `${String(min).padStart(
      2,
      "0"
    )}:${String(sec).padStart(2, "0")}`;
  };

  const weeklyData = useMemo(() => {
    const today = new Date();

    const sunday = new Date(today);

    sunday.setDate(
      today.getDate() - today.getDay()
    );

    sunday.setHours(0, 0, 0, 0);

    const result = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);

      date.setDate(
        sunday.getDate() + i
      );

      result.push({
        date: getLocalDate(date),
        day: date.toLocaleDateString(
          "en-US",
          {
            weekday: "short",
          }
        ),
        session: 0,
        completed: 0,
      });
    }

    task.forEach((item) => {
      if (
        item.status?.toLowerCase() !==
          "complete" ||
        !item.completed
      ) {
        return;
      }

      const completeDate =
        getLocalDate(item.completed);

      const day = result.find(
        (day) =>
          day.date === completeDate
      );

      if (day) {
        day.completed += 1;
      }
    });

    timerA.forEach((item) => {
      if (!item.date) {
        return;
      }

      const sessionDate =
        getLocalDate(item.date);

      const day = result.find(
        (day) =>
          day.date === sessionDate
      );

      if (day) {
        day.session +=
          Number(item.sessions) || 0;
      }
    });

    return result;
  }, [task, timerA]);

  return (
    <div className="grid">
      <div className="column1">
        <div className="perform">
          <div className="box-dt">
  <h4>{todayProductivity}%</h4>
  <p>Today's Productivity</p>
</div>

<div className="box-dt">
  <h4>{completedTaskCount} / {totalTaskCount}</h4>
  <p>Completed Tasks</p>
</div>
          <div className="box-dt">
              <h4>{streak}</h4>
  <p>Current Streak</p>
</div>

<div className="box-dt">
  <h4>{longestStreak}</h4>
  <p>Longest Streak</p>
          </div>
        </div>
      </div>

      <div className="column2">
<div className="overview">
  <div className="d">
    <h4>Task Overview</h4>

    <p>Short info about task</p>

    <div className="fl-btn">
      <center>
        <button
          className={active === "completed" ? "active" : ""}
          onClick={() => {
            setActive("completed");
            completed();
          }}
        >
          Completed
        </button>

        <button
          className={active === "today" ? "active" : ""}
          onClick={() => {
            setActive("today");
            duetoday();
          }}
        >
          Due Today
        </button>

        <button
          className={active === "high" ? "active" : ""}
          onClick={() => {
            setActive("high");
            priority();
          }}
        >
          High Priority
        </button>
      </center>
    </div>
  </div>

  <div className="task-list">
    {filtdata.length > 0 ? (
      filtdata.map((item, index) => (
        <div className="task-row" key={item._id}>

          <div className="task-number">
            {index + 1}
          </div>

          <div className="task-info">
            <span className={`task-badge ${item.priority}`}>
              {item.priority}
            </span>

            <span className="task-name">
              {item.task}
            </span>
          </div>

          <div className="task-status">
            {item.status}
          </div>

          <div className="task-date">
            {item.dueDate
              ? getLocalDate(item.dueDate)
              : "-"}
          </div>

        </div>
      ))
    ) : (
      <div className="no-task">
        No tasks found
      </div>
    )}
  </div>
</div>
        <div className="side">
<div className="box-D deadline">
  <h5>Upcoming Deadlines</h5>

  <div className="deadline-list">

    <div className="deadline-header">
      <div>S.No</div>
      <div>Task</div>
      <div>Priority</div>
      <div>Due Date</div>
    </div>

    {upcomingdedline.length > 0 ? (
      upcomingdedline.map((item, index) => (
        <div className="deadline-row" key={item._id}>

          <div className="deadline-number">
            {index + 1}
          </div>

          <div className="deadline-task">
            {item.task}
          </div>

          <div className="deadline-priority">
            <span className={`task-badge ${item.priority}`}>
              {item.priority}
            </span>
          </div>

          <div className="deadline-date">
            {getLocalDate(item.dueDate)}
          </div>

        </div>
      ))
    ) : (
      <div className="no-deadline">
        No upcoming deadlines
      </div>
    )}

  </div>
</div>

          <div className="box-D notes">
            <h5>Recent Notes</h5>
             
  {recentNote ? (
    <>
      <h5>{recentNote.title}</h5>

      <p> {(recentNote.textarea || "").length > 80
                  ? recentNote.textarea.substring(0, 80) + "..."
                  : recentNote.textarea}</p>

      <span>
        {new Date(recentNote.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}
      </span>
    </>
  ) : (
    <p>No recent note available.</p>
  )}
          </div>
        </div>
      </div>

      <div className="column3">
        <div className="box-D timer">
          <div className="timerd">
            <div className="running">
              {run()}
            </div>

            <center>
              <p>
                Session Count : {session}
              </p>
            </center>

            <div className="buttond">
              <button onClick={start}>
                Start
              </button>

              <button
                onClick={togglePause}
              >
                {pasue
                  ? "Pause"
                  : "Continue"}
              </button>

              <button onClick={reset}>
                Reset
              </button>

              <button
                className="btn btn-danger"
                onClick={reset}
              >
                End
              </button>
            </div>
          </div>
        </div>

<div className="box-D productivity">
  <h6>weekly productivity</h6>

  <div
    className="chart-container"
    style={{
      width: "100%",
      height: "90%",
    }}
  >
    <ResponsiveContainer
      width="100%"
      height="100%"
    >
<BarChart data={weeklyData}>

  <CartesianGrid
    strokeDasharray="3 3"
    vertical={false}
  />

  <XAxis dataKey="day" />

  <YAxis
    allowDecimals={false}
  />

  <Tooltip
    cursor={{
  fill: "#6cff8588",
}}
    contentStyle={{
      backgroundColor: "#141428",
      border: "1px solid #fff9f9",
      borderRadius: "8px",
    }}
    labelStyle={{
      color: "white",
    }}
    itemStyle={{
      color: "white",
    }}
  />

  <Legend />

  <Bar
    dataKey="session"
    name="Study Sessions"
    fill="#0db5f2cf"
    radius={[6, 6, 0, 0]}
  />

  <Bar
    dataKey="completed"
    name="Completed Tasks"
    fill="#feee17"
    radius={[6, 6, 0, 0]}
  />

</BarChart>
    </ResponsiveContainer>
  </div>
</div>
      </div>
    </div>
  );
};

export default Dashboard;