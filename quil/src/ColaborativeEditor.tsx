import React, { useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { QuillBinding } from "y-quill"; // Make sure this is correctly imported
import axios from "axios";

const Inline = Quill.import("blots/inline");

function generateUniqueName(): string {
  return Math.random().toString(36).substr(2, 9);
}
class SearchedStringBlot extends Inline {}

class CommentedStringBlot extends Inline {}

class CommentStringBlot extends Inline {}

const searchRandName = generateUniqueName();

SearchedStringBlot.blotName = searchRandName;
SearchedStringBlot.className = "ql-searched-string";
SearchedStringBlot.tagName = "div";

CommentedStringBlot.blotName = "commented";
CommentedStringBlot.className = "ql-commented-string";
CommentedStringBlot.tagName = "div";

CommentStringBlot.blotName = "comment";
CommentStringBlot.className = "ql-comment-string";
CommentStringBlot.tagName = "div";

export default function CollaborativeEditor() {
  const quillRef = useRef<ReactQuill | null>(null);
  const username = "user1_manuscript"; // 사용자 이름
  const [roomname, setRoomname] = useState<string>("my_room"); // 원고 이름
  const roomnameInputRef = useRef<HTMLInputElement>(null);
  let [searchValue, setSearchValue] = useState<string>("");
  const [textLength, setTextLength] = useState<number>(0); // State to hold the text length
  const [xy, setXY] = useState({ x: 0, y: 0 });
  const [commentContents, setCommentContents] = useState<string>("");
  const [clicked, setClicked] = useState(false);
  const [points, setPoints] = useState({
    x: 0,
    y: 0,
  });
  const [selectedComment, setSelectedComment] = useState<any>();
  const [grammarCheckResult, setGrammarCheckResult] = useState<any>(null);

  // 원고 목록 불러오기
  function loadManuscriptList() {
    const url = "https://knuproweb.kro.kr/api/manuscripts"; // 서버 백엔드 API
    //const url = "http://127.0.0.1:8080/manuscripts"; // 테스트용 로컬 백엔드 API

    // 사용자 이름 지정
    const data = {
      collectionName: username,
    };

    // 원고 목록 요소 불러오기
    const manuscriptList = document.getElementById(
      "manuscript-list"
    ) as HTMLDivElement;

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((response) => {
        // 원고 목록 비우기
        manuscriptList.innerHTML = "";

        // 원고 목록 채우기
        response.manuscripts.forEach((manuscript: string) => {
          // <p> 요소 생성
          const p = document.createElement("p");
          p.innerHTML = manuscript;
          p.addEventListener("click", () => {
            setRoomname(manuscript);
          });

          manuscriptList.appendChild(p);
        });
      })
      .catch((error) => console.error("Error:", error));
  }

  // 통합 검색 결과 가져오기
  function entireSearch(entireSearchWord: string) {
    const url = "https://knuproweb.kro.kr/api/entire-search"; // 서버 백엔드 API
    //const url = "http://127.0.0.1:8080/entire-search"; // 테스트용 로컬 백엔드 API

    // 사용자 이름, 검색어 지정
    const data = {
      collectionName: username,
      searchWord: entireSearchWord,
    };

    // 통합 검색 요소 가져오기
    const entireSearchResult = document.getElementById(
      "entire-search-result"
    ) as HTMLDivElement;

    // 원고 내 검색 요소 가져오기
    const searchInput = document.getElementById(
      "search-input"
    ) as HTMLInputElement;

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((response) => {
        // 통합 검색 결과 비우기
        entireSearchResult.innerHTML = "";

        // 통합 검색 결과 채우기 // any를 사용하기 싫다면 interface를 만들어야 합니다...
        response.results.forEach((result: any) => {
          const div = document.createElement("div");
          div.addEventListener("click", () => {
            // 선택한 원고 열기
            setRoomname(result.title);

            // 에디터에 표시하기, 에디터 로딩 될 때까지 재시도
            let attempt = 0;
            const editorMarking = setInterval(() => {
              if (quillRef?.current) {
                searchInput.value = response.searchWord;
                searchInEditor(response.searchWord);
                clearInterval(editorMarking);
              }
              if (++attempt == 10) clearInterval(editorMarking);
            }, 200); // 0.2초마다 실행, 최대 10번 시도
          });

          // 원고 이름
          const h4 = document.createElement("h4");
          h4.textContent = result.title;
          h4.style.marginTop = "50px";
          div.appendChild(h4);

          // 문맥
          result.contexts.forEach((context: string) => {
            const p = document.createElement("p");
            p.textContent = context;
            div.appendChild(p);
          });

          entireSearchResult.appendChild(div);
        });
      })
      .catch((error) => console.error("Error:", error));
  }

  useEffect(() => {
    const handleClick = () => setClicked(false);
    document.addEventListener("click", handleClick);
    loadManuscriptList();
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    Quill.register(SearchedStringBlot);
    Quill.register(CommentedStringBlot);
    Quill.register(CommentStringBlot);
    // Initialize the Yjs document
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText("quill");

    // Connect to the public Yjs Websocket server using the unique room name
    const provider = new WebsocketProvider(
      "wss://knuproweb.kro.kr/api/", // 서버 웹소켓 주소
      //"ws://localhost:8080/", // 테스트용 로컬 웹소켓 주소
      roomname, // 원고 이름, 이대로 DB에 저장됩니다.
      ydoc
    );

    // Initialize the Quill editor when the component is mounted
    let binding: any;
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      binding = new QuillBinding(ytext, editor, provider.awareness);
    }

    // 글자 수 세기
    const updateTextLength = () => {
      setTextLength(ytext.length);
    };

    ytext.observe(updateTextLength); // Update text length whenever the Yjs text changes

    // quillRef.current!.on("contextmenu", () => {});

    quillRef.current!.editor?.on(
      "selection-change",
      (range, oldRange, source) => {
        if (range) {
          setSelectedComment(range);
        }
      }
    );

    quillRef.current!.onEditorChange = () => {
      let commented = document.getElementsByClassName("ql-commented-string");
      Array.from(commented).forEach(async (c) => {
        c.addEventListener("contextmenu", async (e: Event) => {
          setSelectedComment(c);
          e.preventDefault();
          e.stopPropagation();
          setClicked(true);
          setPoints({
            x: (e as PointerEvent).pageX,
            y: (e as PointerEvent).pageY,
          });
        });

        c.addEventListener("mouseover", async (e: Event) => {
          // 클릭 이벤트 부모 노드로 전파 차단
          e.stopPropagation();

          let commentedDiv = (e as PointerEvent).target as HTMLDivElement; // 코멘트된 부분
          let commentDiv = ((e as PointerEvent).target as HTMLDivElement)
            .nextElementSibling as HTMLDivElement;
          let boundingRect = commentedDiv.getBoundingClientRect();

          setXY({
            x: boundingRect.left,
            y: boundingRect.bottom,
          }); // 모달 div 위치 지정
          // 코멘트 내용 정의
          setCommentContents(commentDiv.textContent ?? "");
        });
      });
    };

    // 원고 내용 출력, text
    const ytextstringBtn = document.getElementById("ytextstring");
    ytextstringBtn?.addEventListener("click", () => {
      const string = ytext.toString();
      const blob = new Blob([string], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = roomname + ".txt";

      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(string);
    });

    // 원고 내용 출력, 델타 format(JSON 형식)
    const ytextdeltaBtn = document.getElementById("ytextdelta");
    ytextdeltaBtn?.addEventListener("click", () => {
      const delta = JSON.stringify(ytext.toDelta());
      const blob = new Blob([delta], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = roomname + ".json";

      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(delta);
      // https://quilljs.com/docs/delta/
    });

    // 델타 format 가져와서 Quill Editor로 불러오기
    const quillsetBtn = document.getElementById("quillset");
    quillsetBtn?.addEventListener("click", () => {
      if (quillRef.current) {
        const editor = quillRef.current.getEditor();
        const fileInput = document.getElementById(
          "fileInput"
        ) as HTMLInputElement;
        const file = fileInput.files?.[0];

        if (!file) {
          console.log("no file");
          return;
        }
        const fr = new FileReader();

        fr.onload = (e) => {
          const text = e.target?.result as string;
          console.log(text);
          try {
            const delta = JSON.parse(text);
            // 파싱된 데이터를 문자열로 변환하여 화면에 표시합니다.
            editor.setContents(delta);
            console.log(delta);
          } catch (error) {
            console.error("Error parsing JSON!");
          }
        };

        fr.readAsText(file);
      }
    });

    const entireSearchBtn = document.getElementById("entire-search-btn");
    entireSearchBtn?.addEventListener("click", () => {
      const entireSearchInput = document.getElementById(
        "entire-search-input"
      ) as HTMLInputElement;
      entireSearch(entireSearchInput.value);

      console.log("통합 검색 : ", entireSearchInput.value);
    });

    // Cleanup function
    return () => {
      if (binding) {
        binding.destroy();
      }
      provider.disconnect();
    };
  }, [roomname]);

  function getIndicesOf(searchStr: string, totalString: string) {
    let searchStrLen = searchStr.length;
    let startIndex = 0,
      index,
      indices = [];
    while (
      (index = totalString.indexOf(searchStr.toLowerCase(), startIndex)) > -1
    ) {
      indices.push(index);
      startIndex = index + searchStrLen;
    }
    return indices;
  }

  const onSearch = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    searchInEditor(newValue);
  };

  function searchInEditor(searchStr: string) {
    setSearchValue(searchStr);
    console.log(searchStr);

    const editor = quillRef.current!.getEditor();
    editor.formatText(0, editor.getText().length, searchRandName, false);
    const SearchedString = searchStr;

    let totalText = editor.getText();
    let re = new RegExp(`${SearchedString}`, "gi");

    let match = re.test(totalText);

    if (match && SearchedString !== "") {
      getIndicesOf(SearchedString, totalText);
      let indices = getIndicesOf(SearchedString, totalText);
      let length = SearchedString.length;
      indices.forEach((index) =>
        editor.formatText(index, length, searchRandName, true)
      );
    }
  }

  const commenting = () => {
    const editor = quillRef.current!.getEditor();
    const selected = quillRef.current?.selection;
    if (
      selected === undefined ||
      selected?.index === undefined ||
      selected.length === undefined
    )
      return;

    const index_: number = selected.index;
    const length_: number = selected.length;
    for (let i = index_; i < index_ + length_; i++) {
      let format = editor.getFormat(i, 1);
      //중복 코멘트 방지
      if (format.commented !== undefined && format.commented === true) {
        alert("현재 버전에서는 중복된 코멘트를 사용할 수 없습니다.");
        return;
      }
    }

    const comment: string | null = prompt("what is your comment");
    if (comment === null || comment === "") return;

    // //선택된 부분과 코멘트 부분 스타일 지정
    editor.insertText(index_ + length_, comment);

    editor.formatText(index_ + length_, comment.length, "commented", false);

    editor.formatText(index_ + length_, comment.length, "comment", true);

    editor.formatText(index_, length_, "commented", true);
  };

  const editComment = () => {
    const editor = quillRef.current!.getEditor();
    const selected = selectedComment;
    if (
      selected === undefined ||
      selected?.index === undefined ||
      selected.length === undefined
    )
      return;

    const index_: number = selected.index;
    let format = editor.getFormat(selected);

    const leaf = editor.getLeaf(index_);
    console.log(leaf[0]);
    const leafStartPoint = index_ - leaf[1];
    const leafLength = leaf[0].text.length;

    const commentLength = leaf[0].parent.next.children.head.text.length;

    editor.deleteText(leafStartPoint + leafLength, commentLength);

    editor.formatText(leafStartPoint, leafLength, "commented", false);

    setCommentContents("");

    const comment: string | null = prompt("what is your comment");
    if (comment === null || comment === "") return;

    // //선택된 부분과 코멘트 부분 스타일 지정
    editor.insertText(leafStartPoint + leafLength, comment);

    editor.formatText(
      leafStartPoint + leafLength,
      comment.length,
      "comment",
      true
    );

    editor.formatText(leafStartPoint, leafLength, "commented", true);
  };

  const deleteComment = () => {
    const editor = quillRef.current!.getEditor();
    const selected = selectedComment;
    if (
      selected === undefined ||
      selected?.index === undefined ||
      selected.length === undefined
    )
      return;

    const index_: number = selected.index;
    let format = editor.getFormat(selected);

    const leaf = editor.getLeaf(index_);
    console.log(leaf[0]);
    const leafStartPoint = index_ - leaf[1];
    const leafLength = leaf[0].text.length;

    const commentLength = leaf[0].parent.next.children.head.text.length;

    editor.deleteText(leafStartPoint + leafLength, commentLength);
    editor.formatText(leafStartPoint, leafLength, "commented", false);
    setCommentContents("");
  };

  const handleEditorChange = (
    content: any,
    delta: any,
    source: any,
    editor: any
  ) => {
    console.log(content, delta);
  };

    // Function to run grammar check
    const runGrammarCheck = async () => {
      if (quillRef.current) {
        const editor = quillRef.current.getEditor();
        const text = editor.getText();
        try {
          const response = await axios.post(
            "https://knuproweb.kro.kr/api2/spell_check",
            { text }
          );
          // const response = await axios.post('http://localhost:5000/spell_check', { text });
          setGrammarCheckResult(response.data);
        } catch (error) {
          console.error("Error during grammar check:", error);
        }
      }
    };

  // roomname(원고) 변경
  // roomname 값을 바꿉니다. useEffect가 이를 알아채고 다시 실행되어 편집기를 다시 생성합니다.
  const roonnameSetBtn = document.getElementById("roomname-set-btn");
  roonnameSetBtn?.addEventListener("click", () => {
    if (!roomnameInputRef.current) {
      return;
    }
    setRoomname(roomnameInputRef.current.value);
    loadManuscriptList(); // 원고를 추가했을 경우 목록에도 보이도록 새로고침
  });

  return (
    <>
      <div
        onMouseOver={(e) => {
          // if (e.currentTarget != e.target) return;
          setCommentContents("");
        }}
      >
        <input
          type="search"
          placeholder="검색어를 입력하세요"
          id="search-input"
          onChange={onSearch}
        />
        <button id="search">find</button>
        <div>Text Length: {textLength}</div>
        <p>
          <button type="button" id="ytextstring">
            텍스트로 출력하기
          </button>
          <button type="button" id="ytextdelta">
            델타로 출력하기
          </button>
          <br />
          <input type="file" id="fileInput" accept=".json"></input>
          <button type="button" id="quillset">
            델타 불러오기
          </button>
          <button type="button" onClick={commenting}>
            코멘트 달기
          </button>
        </p>
        <p>
          <input
            type="text"
            id="roomname"
            ref={roomnameInputRef}
            defaultValue={roomname}
          />
          <button type="button" id="roomname-set-btn">
            원고 이름 지정
          </button>
          <br />
          {roomname}
        </p>

        <div
          style={{ position: "absolute", left: xy.x, top: xy.y }}
          onMouseOver={(e) => {
            e.stopPropagation();
          }}
        >
          {commentContents}
          <div />
        </div>

        <ReactQuill ref={quillRef} theme="snow" onChange={handleEditorChange} />
      </div>
      {clicked && (
        <div
          style={{
            position: "absolute",
            left: points.x,
            top: points.y,
            background: "white",
          }}
        >
          <ul>
            <li onClick={editComment}>수정</li>
            <li onClick={deleteComment}>삭제</li>
          </ul>
        </div>
      )}
      <h3 onClick={loadManuscriptList}>원고 목록</h3>
      <div id="manuscript-list" />
      
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <div style={{ textAlign: "center" }}>
          <h3 onClick={loadManuscriptList}>원고 목록</h3>
          <div id="manuscript-list" />
        </div>
        <div style={{ textAlign: "center" }}>
          <h3>통합 검색</h3>
          <input
            type="entire-search"
            placeholder="검색어를 입력하세요"
            id="entire-search-input"
          />
          <button id="entire-search-btn">find</button>
          <div id="entire-search-result" />
        </div>
      </div>
        <div>
      {/* Input fields and buttons */}
      {/* <input type="text" placeholder="Search..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} /> */}
      <button onClick={runGrammarCheck}>Run Grammar Check</button>
      {/* Display grammar check results */}
      {grammarCheckResult && (
        <div>
          <h3>Grammar Check Results:</h3>
          <pre>{JSON.stringify(grammarCheckResult, null, 2)}</pre>
        </div>
      )}
    </div>
    </>
  );
}
