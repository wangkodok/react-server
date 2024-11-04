const express = require("express");
// const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config(); // node에서 CommonJS에서 환경 변수 불러오기 (require) .env 파일 이용하려면 dotenv 설치하고 코드 작성
const cors = require("cors"); // CORS
const bodyParser = require("body-parser");
const axios = require("axios");
const today = require("./today");

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
      "https://korean-dictionary-tan.vercel.app/",
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
  res.json({ posts: storedPosts });
});

app.get("/posts/:id", async (req, res) => {
  const storedPosts = await getStoredPosts();
  const post = storedPosts.find((post) => post.id === req.params.id);
  res.json({ post });
});

// start 표준국어대사전
const { API_KEY } = process.env;
const externalApiUrl = `https://stdict.korean.go.kr/api/search.do?key=${API_KEY}&type_search=search&req_type=json&q=`;

app.post("/api/data", async (req, res) => {
  const query = req.body.query;
  console.log(query, today);

  try {
    // Open API에 GET 요청
    const response = await axios.get(`${externalApiUrl}${query}`);
    res.json(response.data); // API 응답을 클라이언트로 전송
  } catch (error) {
    console.error(error);
    res.status(500).send("서버 오류");
  }
});
// end 표준국어대사전

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
