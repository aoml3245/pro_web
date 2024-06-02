#!/usr/bin/env node
const WebSocket = require("ws");
const http = require("http");
const express = require("express");
const cors = require("cors");
const number = require("lib0/number");
const wss = new WebSocket.Server({ noServer: true });
const Y = require("yjs");
const yUtils = require("./utils.cjs");
const { MongodbPersistence } = require("y-mongodb-provider");
const MiniSearch = require("minisearch");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // 모든 도메인에서의 요청 허용

const server = http.createServer(app);
const host = "localhost";
const port = number.parseInt("8080");

const mdbUrl = "mongodb://mongodb:27017/webpro"; // 서버 DB URL
//const mdbUrl = "mongodb://127.0.0.1:27017/webpro"; // 테스트용 로컬 DB  URL

wss.on("connection", yUtils.setupWSConnection);

server.on("upgrade", (request, socket, head) => {
  // You may check auth of request here..
  // Call `wss.HandleUpgrade` *after* you checked whether the client has access
  // (e.g. by checking cookies, or url parameters).
  // See https://github.com/websockets/ws#client-authentication
  wss.handleUpgrade(
    request,
    socket,
    head,
    /** @param {any} ws */ (ws) => {
      wss.emit("connection", ws, request);
    }
  );
});

// MongoDB Persistence 생성
// localhost말고 IP를 직접 써야 문제가 없습니다.
// mongodb://<주소>:<포트번호>/<데이터베이스 이름>
// collectionName에 없는 콜렉션을 써도 자동으로 생성, 사용자(혹은 그룹) 구별에 유용할 것 같습니다.
const mdb = new MongodbPersistence(mdbUrl, {
  collectionName: "user1_manuscript",
  flushSize: 100,
  multipleCollections: false,
});

// MongoDB 자동저장
yUtils.setPersistence({
  provider: mdb,
  bindState: async (docName, ydoc) => {
    // Here you listen to granular document updates and store them in the database
    // You don't have to do this, but it ensures that you don't lose content when the server crashes
    // See https://github.com/yjs/yjs#Document-Updates for documentation on how to encode
    // document updates

    // official default code from: https://github.com/yjs/y-websocket/blob/37887badc1f00326855a29fc6b9197745866c3aa/bin/utils.js#L36
    const persistedYdoc = await mdb.getYDoc(docName);
    const newUpdates = Y.encodeStateAsUpdate(ydoc);
    mdb.storeUpdate(docName, newUpdates);
    Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));
    ydoc.on("update", async (update) => {
      mdb.storeUpdate(docName, update);
    });
  },
  writeState: async (docName, ydoc) => {
    // This is called when all connections to the document are closed.
    // In the future, this method might also be called in intervals or after a certain number of updates.
    await mdb.flushDocument(docName); // 버퍼에 있는 나머지도 업데이트

    // return new Promise((resolve) => {
    //   // When the returned Promise resolves, the document will be destroyed.
    //   // So make sure that the document really has been written to the database.
    //   resolve();
    // });
  },
});

server.listen(port, () => {
  console.log(`running at '${host}' on port ${port}`);
});

// 원고 목록 반환 api
// POST /api/manuscripts
/* request 형식
  {
    "collectionName" : "사용자 이름"
  }
*/
/* response 형식
{
  "manuscripts": [
      "원고 1",
      "manuscript two",
      "One Go 셋"
  ]
}
*/
app.post("/manuscripts", async (req, res) => {
  const { collectionName } = req.body;
  console.log(`원고 목록 불러오기 : ${collectionName}`);

  // mongoDB와 연결
  const manuscriptListMdb = new MongodbPersistence(mdbUrl, {
    collectionName: collectionName,
    flushSize: 100,
    multipleCollections: false,
  });

  // 원고 목록 가져오기
  const allDocNames = await manuscriptListMdb.getAllDocNames();

  // 원고 이름 정제
  const decodedAllDocNames = allDocNames.map((docName) =>
    decodeURIComponent(docName)
  );

  console.log(allDocNames);
  res.json({ manuscripts: decodedAllDocNames });
});

// 원고 통합 검색 api
// POST /api/entire-search
/* request 형식
  {
    "collectionName" : "사용자 이름",
    "searchWord" : "고대"
  }
*/
/* response 형식
{
    "searchWord": "고대",
    "results": [
        {
            "title": "엘프의 숲",
            "contexts": [
                "...는 숲의 중심에 서서 고대의 나무에게 속삭였다....",
                "...있도록 도와주세요.\"\n고대의 나무는 그녀에게 빛...",
                "... 릴리아는 은빛 활을 고대의 나무에 돌려주며 말..."
            ]
        },
        {
            "title": "마법사의 제자",
            "contexts": [
                "루카스는 고대의 마법 책을 들여다보..."
            ]
        }
    ]
}
*/
app.post("/entire-search", async (req, res) => {
  const { collectionName, searchWord } = req.body;
  console.log(`원고 통합 검색 : ${collectionName} : ${searchWord}`);

  // mongoDB와 연결
  const entireSearchMdb = new MongodbPersistence(mdbUrl, {
    collectionName: collectionName,
    flushSize: 100,
    multipleCollections: false,
  });

  // 원고 목록 가져오기
  const allDocNames = await entireSearchMdb.getAllDocNames();

  // miniSearch 검색을 위한 데이터 만들기
  const manuscripts = [];
  let id = 1;
  for (let docName of allDocNames) {
    const ydoc = await entireSearchMdb.getYDoc(docName);
    const ytext = ydoc.getText("quill");

    // id(의미 없음), 원고 이름, 원고 내용
    manuscripts.push({
      id: id++,
      title: docName,
      content: ytext.toString(),
    });
  }

  // miniSearch 검색 // 에러 무시해주세요.
  const miniSearch = new MiniSearch({
    fields: ["content"], // fields to index for full-text search
    storeFields: ["title", "content"], // fields to return with search results
  });
  miniSearch.addAll(manuscripts);
  const miniSearchResult = miniSearch.search(searchWord, { prefix: true }); // 전체 혹은 앞부분이 일치하는 단어를 검색

  // 겸색 결과 정제
  const result = miniSearchResult.map((result) => {
    const { title, content } = result;
    const contexts = []; // 원고 내용 전체가 아닌, 검색어와 주변 문맥만 담기 위한 배열
    const regex = new RegExp(searchWord, "g"); // searchWord와 일치하는 부분 찾기 위한 RegExp객체
    const contextLength = searchWord.length + 10; // 검색어 앞 뒤 문맥 길이
    let match;

    // 원고 이름 디코딩
    const decodedTitle = decodeURIComponent(title);

    // 검색어가 여러 번 등장하는지 확인하고, 각 위치에서 문맥 추출
    while ((match = regex.exec(content)) !== null) {
      const indexOfSearchWord = match.index;
      const startIndex = Math.max(0, indexOfSearchWord - contextLength);
      const endIndex = Math.min(
        content.length,
        indexOfSearchWord + searchWord.length + contextLength
      );

      let context = content.substring(startIndex, endIndex).replace(/\n/g, " "); // 주변 문맥까지 포함해서 추출, 줄바꿈은 띄어쓰기로 바꿈
      if (indexOfSearchWord - contextLength > 0) context = "..." + context;
      if (
        indexOfSearchWord + searchWord.length + contextLength <
        content.length
      )
        context = context + "...";
      contexts.push(context);
    }

    return { title: decodedTitle, contexts };
  });

  console.log("검색 개수 : ", result.length);
  res.json({ searchWord, results: result });
});
