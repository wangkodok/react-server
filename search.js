const express = require("express");
// const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config(); // node에서 CommonJS에서 환경 변수 불러오기 (require) .env 파일 이용하려면 dotenv 설치하고 코드 작성
const cors = require("cors"); // CORS
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const path = require("path");

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// CORS
app.use(
  cors({
    origin: true, // 모든 출처 허용 옵션 true 를 써도 된다.
    credentials: true, // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
  })
);

app.set("views", path.join(__dirname, "/"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

// 표준국어대사전 get
const { API_KEY } = process.env;
const externalApiUrl = `https://stdict.korean.go.kr/api/search.do?key=${API_KEY}&type_search=search&req_type=json&q=`;

// let queryResult = null;

// async function fetchDataFromApi(query) {
//   console.log(query, "값 받아와서 함수 실행");
//   try {
//     const response = await axios.get(`${externalApiUrl}${query}`);
//     console.log(response.data, "데이터 값");
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching data from external API:", error);
//     throw new Error("Failed to fetch data from API");
//   }
// }

async function Api(query) {
  const response = await axios.get(`${externalApiUrl}${query}`);
  console.log(response.data);
}

app.get("/get-search", async (req, res) => {
  //   const { query } = req.query;
  //   console.log(query, "query 값은?");

  const result = await Api();
  //   console.log(result, "GET 값");
  res.json({ result });
});

app.post("/post-search", async (req, res) => {
  const queryResult = req.body.queryData; // React에서 보낸 검색어
  //   console.log(queryResult, "React에서 보낸 검색어");
  //   await fetchDataFromApi(queryResult);
  await Api(queryResult);
});

app.listen(8000);
