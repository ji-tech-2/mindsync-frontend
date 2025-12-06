const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const SPRING_URL = "http://localhost:8080";

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const response = await axios.post(`${SPRING_URL}/register`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Register Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Register failed",
    });
  }
});

// SIGN IN
app.post("/signIn", async (req, res) => {
  try {
    const response = await axios.post(`${SPRING_URL}/signIn`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error("Login Error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || "Login failed",
    });
  }
});

// DASHBOARD
app.get("/dashboard", async (req, res) => {
  try {
    const response = await axios.get(`${SPRING_URL}/dashboard`);
    res.json(response.data);
  } catch (error) {
    console.error("Dashboard Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to connect to Spring Boot (dashboard)",
    });
  }
});

// START SERVER ONCE
app.listen(5000, () => {
  console.log("Node Gateway running on port 5000");
});


// const express = require("express");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // =======================================
// // TEST REGISTER (tanpa Spring Boot)
// // =======================================
// app.post("/api/register", (req, res) => {
//   console.log("Data register diterima dari React:", req.body);

//   res.json({
//     success: true,
//     message: "Register OK (React → Node sukses)",
//     data: req.body,
//   });
// });

// // =======================================
// // TEST LOGIN (tanpa Spring Boot)
// // =======================================
// app.post("/api/signIn", (req, res) => {
//   console.log("Data login diterima dari React:", req.body);

//   res.json({
//     success: true,
//     message: "Login OK (React → Node sukses)",
//     data: req.body,
//   });
// });

// // =======================================
// // TEST DASHBOARD (tanpa Spring Boot)
// // =======================================
// app.get("/api/dashboard", (req, res) => {
//   res.json({
//     success: true,
//     message: "Dashboard OK",
//   });
// });

// // START SERVER
// app.listen(5000, () => {
//   console.log("Node TEST server running on port 5000");
// });
