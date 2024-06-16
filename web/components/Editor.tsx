"use client";
import React, { useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css"; // or 'quill.bubble.css'
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { QuillBinding } from "y-quill";
import CommentSection from "./CommentSection";
import Delta from "quill-delta";
import { DeltaStatic } from "quill";
import { Sources } from "quill";

// 컴포넌트 간 데이터 이동을 위한 props
interface EditorProps {
  username: string;
  roomname: string;
  setRoomname: (roomname: string) => void;
}

const Editor: React.FC<EditorProps> = ({ username, roomname, setRoomname }) => {
  const [textLength, setTextLength] = useState<number>(0); // 원고 글자 수
  const quillRef = useRef<ReactQuill | null>(null);
  const [selectedComment, setSelectedComment] = useState<any>();
  const [comments, setComments] = useState<any>([]);
  const [commenteds, setCommenteds] = useState<any>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && quillRef.current) {
      const Quill = require("react-quill").Quill;
      const Inline = Quill.import("blots/inline");

      class CommentedStringBlot extends Inline {
        static blotName = "commented";
        static className = "ql-commented-string";
        static tagName = "div";
      }

      class CommentStringBlot extends Inline {
        static blotName = "comment";
        static className = "ql-comment-string";
        static tagName = "div";
      }

      Quill.register(CommentedStringBlot, true);
      Quill.register(CommentStringBlot, true);

      const editor = quillRef.current.getEditor();

      editor.on("selection-change", (range, oldRange, source) => {
        if (range) {
          setSelectedComment(range);
        }
      });

      // const handleEditorChange = () => {
      //   if (typeof document !== "undefined") {
      //     let commented = document.getElementsByClassName(
      //       "ql-commented-string"
      //     );
      //     let comments_ = Array.from(commented).map((c) => {
      //       let commentedDiv = c as HTMLDivElement;
      //       let commentDiv = commentedDiv.nextElementSibling as HTMLDivElement;
      //       return {
      //         commented: commentedDiv.innerText,
      //         comment: commentDiv.innerText,
      //       };
      //     });
      //     setComments(comments_);
      //   }
      // };

      // editor.on("text-change", handleEditorChange);
    }
  }, [isClient, quillRef.current]);

  const commenting = () => {
    if (!quillRef.current) return;
    const editor = quillRef.current.getEditor();
    const selected = quillRef.current?.selection;
    if (
      !selected ||
      selected.index === undefined ||
      selected.length === undefined
    )
      return;

    const index_ = selected.index;
    const length_ = selected.length;
    for (let i = index_; i < index_ + length_; i++) {
      let format = editor.getFormat(i, 1);
      if (format.commented) {
        alert("현재 버전에서는 중복된 코멘트를 사용할 수 없습니다.");
        return;
      }
    }

    const comment = prompt("what is your comment");
    if (!comment) return;

    editor.insertText(index_ + length_, comment);
    editor.formatText(index_ + length_, comment.length, "commented", false);
    editor.formatText(index_ + length_, comment.length, "comment", true);
    editor.formatText(index_, length_, "commented", true);
  };
  const handleEditorChange = (
    value: string,
    delta: DeltaStatic,
    source: Sources,
    editor: ReactQuill.UnprivilegedEditor
  ) => {
    let i = 0;
    let commentTemp: {
      index: number;
      comment: string;
    }[] = [];

    let commentedTemp: {
      index: number;
      commented: string;
    }[] = [];
    editor.getContents().ops.forEach((o: any) => {
      if (o.attributes !== null && o.attributes !== undefined) {
        if (o.attributes.comment) {
          commentTemp.push({ index: i, comment: "" });
          let c = commentTemp.pop();
          c!.comment = o.insert;
          commentTemp.push(c!);
        }
        if (o.attributes.commented) {
          commentedTemp.push({ index: i, commented: o.insert });
        }
      }
      i += o.insert.length;
    });

    commentTemp.sort((a, b) => a.index - b.index);
    commentedTemp.sort((a, b) => a.index - b.index);

    setComments(commentTemp);
    setCommenteds(commentedTemp);

    // let commented = document.getElementsByClassName("ql-commented-string");
    // let comments_ = Array.from(commented).map((c) => {
    //   let commentedDiv = c as HTMLDivElement;
    //   let commentDiv = commentedDiv.nextElementSibling as HTMLDivElement;
    //   return {
    //     commented: commentedDiv.innerText,
    //     comment: commentDiv.innerText,
    //   };
    // });
    // setComments(comments_);
  };

  // 원고 추가(혹은 변경)
  function changeManuscript() {
    const manuscriptName: string | null = prompt("원고 이름을 입력해주세요.");

    if (manuscriptName != null) {
      setRoomname(manuscriptName);
    }
  }

  useEffect(() => {
    console.log(comments);
  }, [comments, commenteds]);
  // 원고 목록 중 n번 째 이름 가져오기
  function getDocNameFromList(index: number): string {
    const url = "https://knuproweb.kro.kr/api/manuscripts"; // 서버 백엔드 API
    //const url = "http://127.0.0.1:8080/manuscripts"; // 테스트용 로컬 백엔드 API

    // 사용자 이름 지정
    const data = {
      collectionName: username,
    };

    let docName = "";

    // 동기식 http 요청
    const request = new XMLHttpRequest();
    request.open("POST", url, false);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(data));

    if (request.status === 200) {
      const response = JSON.parse(request.responseText);
      // index가 범위 내에 있으면 docName에 저장
      if (index <= response.manuscripts.length + 1 && index > 0) {
        docName = response.manuscripts[index - 1];
      }
    } else {
      console.error("원고 목록 불러오기 실패 : ", request.statusText);
    }

    return docName;
  }
  
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
    console.log(manuscriptList);

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

        // 원고 목록 채우기, 선택 시 해당 원고로 이동
        response.manuscripts.forEach((manuscript: string) => {
          const div = document.createElement("div");
          div.className = "sidebar2-block";
          div.addEventListener("click", () => {
            setRoomname(manuscript);
          });

          // 원고 이름
          const manuscriptDiv = document.createElement("div");
          manuscriptDiv.innerHTML = manuscript;

          // 원고 삭제
          const deleteDiv = document.createElement("div");
          deleteDiv.className = "delete-button";
          deleteDiv.addEventListener("click", (event) => {
            event.stopPropagation();
            deleteManuscript(manuscript);
          });

          if (roomname == manuscript) {
            div.classList.add("selected-manuscript");
          }
          div.appendChild(manuscriptDiv);
          div.appendChild(deleteDiv);
          manuscriptList.appendChild(div);
        });
      })
      .catch((error) => console.error("Error:", error));
  }

  // 원고 삭제하기
  function deleteManuscript(docName: String) {
    const url = "https://knuproweb.kro.kr/api/manuscript/delete"; // 서버 백엔드 API
    //const url = "http://127.0.0.1:8080/manuscript/delete"; // 테스트용 로컬 백엔드 API

    // 사용자 이름 지정
    const data = {
      collectionName: username,
      docName: docName,
    };

    if (roomname == docName) {
      alert("편집 중인 원고는 삭제할 수 없습니다.");
      return;
    }

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log("삭제 결과 : " + response.result);
        // 삭제 성공 시 원고 목록 다시 불러오기
        if (response.result == "success") {
          alert("삭제되었습니다.");
          loadManuscriptList();
        }
      })
      .catch((error) => console.error("Error:", error));
  }

  useEffect(() => {
    // 원고 목록 준비
    loadManuscriptList();

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

    // 원고 이름 요소
    const manuscriptName = document.getElementById(
      "manuscript-name"
    ) as HTMLDivElement;
    manuscriptName.innerHTML = "현재 원고 : " + roomname;

    // 원고 추가 요소
    const manuscriptListAdd = document.getElementById("manuscript-add");
    console.log(manuscriptListAdd);
    manuscriptListAdd?.addEventListener("click", changeManuscript);

    return () => {
      if (binding) {
        binding.destroy();
      }
      provider.disconnect();

      manuscriptListAdd?.removeEventListener("click", changeManuscript);
    };
  }, [roomname, quillRef.current]);
  // roomname이 바뀌면 Editor 전체가 재렌더링 되어서 의미는 없음

  const editComment = (index: number, commented: string, comment: string) => {
    const editor = quillRef.current!.getEditor();

    const index_ = index;
    const leafStartPoint = index;
    const leafLength = commented.length;
    const commentLength = comment.length;

    editor.deleteText(leafStartPoint + leafLength, commentLength);
    editor.formatText(leafStartPoint, leafLength, "commented", false);

    const newComment = prompt("what is your comment");
    if (!newComment) return;

    editor.insertText(leafStartPoint + leafLength, newComment);
    editor.formatText(
      leafStartPoint + leafLength,
      newComment.length,
      "comment",
      true
    );
    editor.formatText(leafStartPoint, leafLength, "commented", true);
  };

  const deleteComment = (index: number, commented: string, comment: string) => {
    const editor = quillRef.current!.getEditor();
    if (!selectedComment) return;

    const leafStartPoint = index;
    const leafLength = commented.length;
    const commentLength = comment.length;
    console.log(leafStartPoint, leafLength, commentLength);

    editor.deleteText(leafStartPoint + leafLength, commentLength);
    editor.formatText(leafStartPoint, leafLength, "commented", false);
  };

  return (
    <div className="editor-container">
      <div id="toolbar">
        <select
          className="ql-header"
          defaultValue=""
          onChange={(e) => e.persist()}
        >
          <option value="1"></option>
          <option value="2"></option>
          <option value=""></option>
        </select>
        <select className="ql-size">
          <option value="small"></option>
          <option value="normal"></option>
          <option value="large"></option>
          <option value="huge"></option>
        </select>
        <button className="ql-bold"></button>
        <button className="ql-italic"></button>
        <button className="ql-underline"></button>
        <button className="ql-strike"></button>
        <button className="ql-list" value="ordered"></button>
        <button className="ql-list" value="bullet"></button>
      </div>

      <div className="editor-bottom">
        {isClient && (
          <div className="ql-editor">
            <ReactQuill
              onChange={handleEditorChange}
              ref={quillRef}
              theme="snow"
              modules={{ toolbar: "#toolbar" }}
            />
          </div>
        )}
        <div className="comment-section">
          <CommentSection
            onComment={commenting}
            comments={comments}
            commenteds={commenteds}
            onEdit={editComment}
            onDelete={deleteComment}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
