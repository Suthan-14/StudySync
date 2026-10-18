import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

import "./analytics.css";

const Analytics = () => {
  const [tasks, setTasks] = useState([]);
  const [timer, setTimer] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [timerLoading, setTimerLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTasks = async () => {
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

        setTasks(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Error fetching tasks:",
          error
        );

        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
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

        const timerArray =
          Array.isArray(data)
            ? data
            : [data];

        setTimer(timerArray);
      } catch (error) {
        console.error(
          "Error fetching timer:",
          error
        );

        setTimer([]);
      } finally {
        setTimerLoading(false);
      }
    };

    fetchTimer();
  }, [token]);

  const loading =
    tasksLoading || timerLoading;

  const totalTasks =
    tasks.length;

  const completedTasks =
    tasks.filter(
      (task) =>
        task.status?.toLowerCase() ===
        "complete"
    ).length;

  const pendingTasks =
    tasks.filter(
      (task) =>
        task.status?.toLowerCase() !==
        "complete"
    ).length;

  const completionRate =
    totalTasks > 0
      ? Math.round(
          (completedTasks /
            totalTasks) *
            100
        )
      : 0;

  const priorityData = useMemo(() => {
    const high =
      tasks.filter(
        (task) =>
          task.priority?.toLowerCase() ===
          "high"
      ).length;

    const medium =
      tasks.filter(
        (task) =>
          task.priority?.toLowerCase() ===
          "medium"
      ).length;

    const low =
      tasks.filter(
        (task) =>
          task.priority?.toLowerCase() ===
          "low"
      ).length;

    return [
      {
        name: "High",
        value: high,
      },
      {
        name: "Medium",
        value: medium,
      },
      {
        name: "Low",
        value: low,
      },
    ];
  }, [tasks]);

  const statusData = [
    {
      name: "Completed",
      value: completedTasks,
    },
    {
      name: "Pending",
      value: pendingTasks,
    },
  ];

  const weeklyData = useMemo(() => {
    const today = new Date();

    const currentDay =
      today.getDay();

    const sunday =
      new Date(today);

    sunday.setDate(
      today.getDate() -
        currentDay
    );

    sunday.setHours(
      0,
      0,
      0,
      0
    );

    const result = [];

    for (let i = 0; i < 7; i++) {
      const date =
        new Date(sunday);

      date.setDate(
        sunday.getDate() +
          i
      );

      const dateString =
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${String(
          date.getDate()
        ).padStart(2, "0")}`;

      result.push({
        date: dateString,

        day:
          date.toLocaleDateString(
            "en-US",
            {
              weekday: "short",
            }
          ),

        total: 0,

        completed: 0,
      });
    }

    tasks.forEach((task) => {
      if (!task.startDate) {
        return;
      }

      const taskDate =
        task.startDate.split(
          "T"
        )[0];

      const completeDate =
        task.completed?.split(
          "T"
        )[0];

      const day =
        result.find(
          (item) =>
            item.date ===
            taskDate
        );

      if (!day) {
        return;
      }

      day.total += 1;

      if (
        task.status?.toLowerCase() ===
          "complete" &&
        completeDate ===
          day.date
      ) {
        day.completed += 1;
      }
    });

    return result;
  }, [tasks]);

  const labelData = useMemo(() => {
    const labels = {};

    tasks.forEach((task) => {
      const label =
        task.label ||
        "Other";

      if (!labels[label]) {
        labels[label] = 0;
      }

      labels[label]++;
    });

    return Object.entries(
      labels
    ).map(
      ([label, count]) => ({
        label,
        count,
      })
    );
  }, [tasks]);

  const deadlineData = useMemo(() => {
    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    let upcoming = 0;
    let overdue = 0;
    let completed = 0;

    tasks.forEach((task) => {
      if (!task.dueDate) {
        return;
      }

      const deadline =
        new Date(
          task.dueDate
        );

      if (
        isNaN(
          deadline.getTime()
        )
      ) {
        return;
      }

      deadline.setHours(
        0,
        0,
        0,
        0
      );

      if (
        task.status?.toLowerCase() ===
        "complete"
      ) {
        completed++;
      } else if (
        deadline < today
      ) {
        overdue++;
      } else {
        upcoming++;
      }
    });

    return [
      {
        name: "Upcoming",
        value: upcoming,
      },
      {
        name: "Overdue",
        value: overdue,
      },
      {
        name: "Completed",
        value: completed,
      },
    ];
  }, [tasks]);

  const studyData = useMemo(() => {
    const today = new Date();

    const currentDay =
      today.getDay();

    const sunday =
      new Date(today);

    sunday.setDate(
      today.getDate() -
        currentDay
    );

    sunday.setHours(
      0,
      0,
      0,
      0
    );

    const hours = [];

    for (let i = 0; i < 7; i++) {
      const date =
        new Date(sunday);

      date.setDate(
        sunday.getDate() +
          i
      );

      const dateString =
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}-${String(
          date.getDate()
        ).padStart(2, "0")}`;

      hours.push({
        date: dateString,

        day:
          date.toLocaleDateString(
            "en-US",
            {
              weekday: "short",
            }
          ),

        hours: 0,
      });
    }

    if (!Array.isArray(timer)) {
      return hours;
    }

    timer.forEach((item) => {
      const sessionCount =
        Number(
          item.sessions ??
            item.session ??
            0
        );

      const dateValue =
        item.date;

      if (!dateValue) {
        return;
      }

      if (!sessionCount) {
        return;
      }

      let timerDate;

      if (
        typeof dateValue ===
          "string" &&
        dateValue.includes("T")
      ) {
        timerDate =
          dateValue.split(
            "T"
          )[0];
      } else {
        const parsedDate =
          new Date(
            dateValue
          );

        if (
          isNaN(
            parsedDate.getTime()
          )
        ) {
          console.log(
            "Invalid timer date:",
            dateValue
          );

          return;
        }

        timerDate =
          `${parsedDate.getFullYear()}-${String(
            parsedDate.getMonth() + 1
          ).padStart(2, "0")}-${String(
            parsedDate.getDate()
          ).padStart(2, "0")}`;
      }

      const dayData =
        hours.find(
          (day) =>
            day.date ===
            timerDate
        );

      if (!dayData) {
        console.log(
          "Timer date is not in current week:",
          timerDate
        );

        return;
      }

      dayData.hours +=
        sessionCount;
    });

    return hours;
  }, [timer]);

  const COLORS = [
    "#dc3545",
    "#ffc107",
    "#198754",
  ];

  const cursorStyle = {
    fill: "rgba(255, 255, 255, 0.08)",
  };

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "#141428",
      border: "1px solid #555",
      borderRadius: "8px",
    },
    labelStyle: {
      color: "white",
    },
    itemStyle: {
      color: "white",
    },
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="mt-2">
          Loading analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="analytics-page">

      <div className="mb-4">
        <h2 className="fw-bold mb-1">
          Analytics
        </h2>

        <p className="text-secondary">
          Track your productivity and task
          performance
        </p>
      </div>

      <div className="row g-4 mb-4">

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="analytics-card">

            <div className="stat-icon bg-primary-subtle text-primary">
              <i className="bi bi-list-check"></i>
            </div>

            <div>
              <p className="text-secondary mb-1">
                Total Tasks
              </p>

              <h3 className="fw-bold mb-0">
                {totalTasks}
              </h3>
            </div>

          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="analytics-card">

            <div className="stat-icon bg-success-subtle text-success">
              <i className="bi bi-check-circle"></i>
            </div>

            <div>
              <p className="text-secondary mb-1">
                Completed
              </p>

              <h3 className="fw-bold mb-0">
                {completedTasks}
              </h3>
            </div>

          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="analytics-card">

            <div className="stat-icon bg-warning-subtle text-warning">
              <i className="bi bi-clock"></i>
            </div>

            <div>
              <p className="text-secondary mb-1">
                Pending
              </p>

              <h3 className="fw-bold mb-0">
                {pendingTasks}
              </h3>
            </div>

          </div>
        </div>

        <div className="col-12 col-sm-6 col-xl-3">
          <div className="analytics-card">

            <div className="stat-icon bg-info-subtle text-info">
              <i className="bi bi-graph-up"></i>
            </div>

            <div>
              <p className="text-secondary mb-1">
                Completion Rate
              </p>

              <h3 className="fw-bold mb-0">
                {completionRate}%
              </h3>
            </div>

          </div>
        </div>

      </div>

      <div className="row g-4 mb-4">

        <div className="col-12 col-xl-8">

          <div className="chart-card">

            <h5 className="fw-bold mb-1">
              Weekly Task Performance
            </h5>

            <p className="text-secondary small">
              Tasks created and completed this week
            </p>

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={weeklyData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={true}
                  />

                  <XAxis
                    dataKey="day"
                  />

                  <YAxis
                    allowDecimals={false}
                  />

                  <Tooltip
                    cursor={cursorStyle}
                    {...tooltipStyle}
                  />

                  <Legend />

                  <Bar
                    dataKey="total"
                    name="Total Tasks"
                    fill="#3956f8b3"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />

                  <Bar
                    dataKey="completed"
                    name="Completed"
                    fill="#1bc7499e"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

        <div className="col-12 col-xl-4">

          <div className="chart-card h-100">

            <h5 className="fw-bold mb-1">
              Task Priority
            </h5>

            <p className="text-secondary small">
              Distribution of your priorities
            </p>

            <div className="pie-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >

                    {priorityData.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            COLORS[index]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Tooltip
                    {...tooltipStyle}
                  />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

      </div>

      <div className="row g-4 mb-4">

        <div className="col-12 col-xl-7">

          <div className="chart-card">

            <h5 className="fw-bold mb-1">
              Tasks by Category
            </h5>

            <p className="text-secondary small">
              Number of tasks in each category
            </p>

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={labelData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                  />

                  <YAxis
                    allowDecimals={false}
                  />

                  <Tooltip
                    cursor={cursorStyle}
                    {...tooltipStyle}
                  />

                  <Bar
                    dataKey="count"
                    name="Tasks"
                    radius={[
                      6,
                      6,
                      0,
                      0,
                    ]}
                  >

                    {labelData.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            [
                              "#ff0000",
                              "#ff7f00",
                              "#ffff00",
                              "#00ff00",
                              "#0000ff",
                              "#4b0082",
                              "#9400d3",
                            ][index % 7]
                          }
                        />
                      )
                    )}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

        <div className="col-12 col-xl-5">

          <div className="chart-card h-100">

            <h5 className="fw-bold mb-1">
              Task Status
            </h5>

            <p className="text-secondary small">
              Completed vs pending
            </p>

            <div className="pie-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >

                    <Cell fill="#198754" />

                    <Cell fill="#ffc107" />

                  </Pie>

                  <Tooltip
                    {...tooltipStyle}
                  />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

      </div>

      <div className="row g-4">

        <div className="col-12 col-xl-5">

          <div className="chart-card h-100">

            <h5 className="fw-bold mb-1">
              Deadline Overview
            </h5>

            <p className="text-secondary small">
              Current task deadline status
            </p>

            <div className="pie-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={deadlineData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >

                    <Cell fill="#0d6efd" />

                    <Cell fill="#dc3545" />

                    <Cell fill="#198754" />

                  </Pie>

                  <Tooltip
                    {...tooltipStyle}
                  />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

        <div className="col-12 col-xl-7">

          <div className="chart-card">

            <h5 className="fw-bold mb-1">
              Study Hours
            </h5>

            <p className="text-secondary small">
              Study time recorded this week
            </p>

            <div className="chart-container">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={studyData}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                  />

                  <YAxis
                    allowDecimals={false}
                  />

                  <Tooltip
                    cursor={cursorStyle}
                    {...tooltipStyle}
                    formatter={(value) => [
                      `${value} hours`,
                      "Study Time",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="hours"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Analytics;