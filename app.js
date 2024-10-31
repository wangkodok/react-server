const express = require("express");
// const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config(); // node에서 CommonJS에서 환경 변수 불러오기 (require) .env 파일 이용하려면 dotenv 설치하고 코드 작성
const cors = require("cors"); // CORS
const bodyParser = require("body-parser");
const axios = require("axios");

const { getStoredPosts, storePosts } = require("./data/posts");

const app = express();
const path = require("path");

app.use(bodyParser.json());

app.use((req, res, next) => {
  // Attach CORS headers
  // Required when using a detached backend (that runs on a different domain)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// CORS
app.use(
  cors({
    origin: [
      // "http://127.0.0.1:5173",
      'https://korean-dictionary-tan.vercel.app/',
    ], // 모든 출처 허용 옵션 true 를 써도 된다.
    credentials: true, // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
    // optionsSuccessStatus: 200,
  })
);
// app.use(cors());

// module.exports = function (app) {
//   app.use(
//     "/",
//     createProxyMiddleware({
//       target: "http://127.0.0.1:5173",
//       changeOrigin: true,
//     })
//   );
// };

app.set("views", path.join(__dirname, "/"));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/posts", async (req, res) => {
  const storedPosts = await getStoredPosts();
  // await new Promise((resolve, reject) => setTimeout(() => resolve(), 1500));
  res.json({ posts: storedPosts });
});

app.get("/posts/:id", async (req, res) => {
  const storedPosts = await getStoredPosts();
  const post = storedPosts.find((post) => post.id === req.params.id);
  res.json({ post });
});

// 표준국어대사전 get
const { API_KEY } = process.env;
const externalApiUrl = `https://stdict.korean.go.kr/api/search.do?key=${API_KEY}&type_search=search&req_type=json&q=`;

let queryResult = null;

app.get("/get-search", async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is missing" });
  }

  try {
    const response = await axios.get(`${externalApiUrl}${query}`);
    console.log(response.data, externalApiUrl + query)
    res.json(response.data);
  } catch (error) {
    res.status(500).send("Error fetching data from external API");
  }
  // // if (queryResult !== null) {
  // //   res.json(queryResult);
  // // }
  // const query = req.query.q; // 쿼리 파라미터에서 검색어 가져오기
  // console.log(query, "Received query via GET");

  // try {
  //   const response = await axios.get(`${externalApiUrl}${query}`);
  //   console.log(response);
  //   console.log(externalApiUrl + query);
  //   res.json(response.data); // 검색 결과 반환
  //   // if (response.data && response.data.channel) {
  //   //   res.json(response.data); // 검색 결과 반환
  //   // }
  //   // if (response.data !== "") {
  //   //   queryResult = response.data;
  //   // }
  // } catch (error) {
  //   console.error(error, "POST에서 오류");
  //   res.status(500).json({ error: "Failed to fetch data from API" });
  // }
});

// app.post("/post-search", async (req, res) => {
//   queryResult = req.body.queryData; // React에서 보낸 검색어
//   // console.log(req.body.queryData);
//   console.log(queryResult, "없음");

//   try {
//     const response = await axios.get(`${externalApiUrl}${queryResult}`);
//     if (response.data !== "") {
//       queryResult = response.data;
//     }
//   } catch (error) {
//     console.error(error, "POST에서 오류");
//     res.status(500).json({ error: "Failed to fetch data from API" });
//   }
// });
// end 표준국어대사전 get

app.post("/posts", async (req, res) => {
  const existingPosts = await getStoredPosts();
  const postData = req.body;
  const newPost = {
    ...postData,
    id: Math.random().toString(),
  };
  const updatedPosts = [newPost, ...existingPosts];
  await storePosts(updatedPosts);
  res.status(201).json({ message: "Stored new post.", post: newPost });
});

app.listen(8000);
