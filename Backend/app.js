
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("./config/passport");
const airoute = require("./routes/aiAssistantRoute");
const userrouter = require("./routes/userLogin");
const taskrouter = require("./routes/taskroute");
const notesrouter = require("./routes/notesroute");
const timerrouter = require("./routes/timerrouter");
const notificationRoute = require("./routes/notificationRoute");
const profileRoute = require("./routes/profileRoute");

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());
app.use(passport.initialize());

mongoose
  .connect("mongodb://localhost:27017/uerpass")
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((error) => {
    console.log("Failed to connect the DB:", error);
  });

app.use("/profile", profileRoute);

app.use(userrouter);
app.use(taskrouter);
app.use(notesrouter);
app.use(timerrouter);
app.use(notificationRoute);
app.use("/api/ai-assistant", airoute);
app.listen(9000, () => {
  console.log("Server running at http://localhost:9000");
});
