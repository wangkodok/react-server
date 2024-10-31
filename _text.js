const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const path = require("path");

app.use(bodyParser.json());

app.use(
  cors({
    origin: ['https://korean-dictionary-tan.vercel.app/'],
    credentials: true,
  })
);

app.set("views", path.join(__dirname, "/"));
app.set("view engine", "ejs");

const { API_KEY } = process.env;
const externalApiUrl = `https://stdict.korean.go.kr/api/search.do?key=${API_KEY}&type_search=search&req_type=json&q=`;

app.get("/get-search", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is missing" });
  }

  try {
    const response = await axios.get(`${externalApiUrl}${query}`);
    console.log("Data received:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching data from external API:", error.message);
    res.status(500).json({
      error: "Error fetching data from external API",
      details: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
