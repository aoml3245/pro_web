import React, { useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { QuillBinding } from "y-quill"; // Make sure this is correctly imported

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
  let [searchValue, setSearchValue] = useState<string>("");
  const [textLength, setTextLength] = useState<number>(0); // State to hold the text length
  const [xy, setXY] = useState({ x: 0, y: 0 });
  const [commentContents, setCommentContents] = useState<string>("");

  useEffect(() => {
    Quill.register(SearchedStringBlot);
    Quill.register(CommentedStringBlot);
    Quill.register(CommentStringBlot);
    // Initialize the Yjs document
    const ydoc = new Y.Doc();
    // Connect to the public Yjs Websocket server using the unique room name
    const provider = new WebsocketProvider(
      "wss://knuproweb.kro.kr/api/",
      "my_room",
      ydoc
    );
    const ytext = ydoc.getText("quill");
    let binding: any;

    // Initialize the Quill editor when the component is mounted
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      binding = new QuillBinding(ytext, editor, provider.awareness);
    }

    // 글자 수 세기
    const updateTextLength = () => {
      setTextLength(ytext.length);
    };

    ytext.observe(updateTextLength); // Update text length whenever the Yjs text changes

    // 원고 내용 출력, text
    const ytextstringBtn = document.getElementById("ytextstring");
    ytextstringBtn?.addEventListener("click", () => {
      const string = ytext.toString();
      const blob = new Blob([string], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "manuscript.txt";

      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log(string);
    });

    quillRef.current!.onEditorChange = () => {
      let commented = document.getElementsByClassName("ql-commented-string");
      Array.from(commented).forEach(async (c) => {
        c.addEventListener("mouseover", async (e: Event) => {
          // 클릭 이벤트 부모 노드로 전파 차단
          e.stopPropagation();

          let commentedDiv = (e as PointerEvent).target as HTMLDivElement; // 코멘트된 부분
          let commentDiv = (
            (e as PointerEvent).target as HTMLDivElement
          ).getElementsByClassName("ql-comment-string")[0]; // 코멘트
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

    // 원고 내용 출력, 델타 format(JSON 형식)
    const ytextdeltaBtn = document.getElementById("ytextdelta");
    ytextdeltaBtn?.addEventListener("click", () => {
      const delta = JSON.stringify(ytext.toDelta());
      const blob = new Blob([delta], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "manuscript.json";

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

    // Cleanup function
    return () => {
      if (binding) {
        binding.destroy();
      }
      provider.disconnect();
    };
  }, []);

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
    setSearchValue(newValue);

    const editor = quillRef.current!.getEditor();
    editor.formatText(0, editor.getText().length, searchRandName, false);
    const SearchedString = newValue;

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
  };

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
    let format = editor.getFormat(selected);

    //중복 코멘트 방지
    if (format.commented !== undefined && format.commented === true) {
      return;
    }

    const comment: string | null = prompt("what is your comment");
    if (comment === null || comment === "") return;

    //선택된 부분과 코멘트 부분 스타일 지정
    editor.insertText(index_ + length_, comment);

    editor.formatText(index_ + length_, comment.length, "comment", true);

    editor.formatText(index_, comment.length + length_, "commented", true);
  };

  const handleEditorChange = (
    content: any,
    delta: any,
    source: any,
    editor: any
  ) => {
    console.log(content, delta);
  };
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
          <br></br>
          <input type="file" id="fileInput" accept=".json"></input>
          <button type="button" id="quillset">
            델타 불러오기
          </button>
          <button type="button" onClick={commenting}>
            코멘트 달기
          </button>
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
    </>
  );
}
