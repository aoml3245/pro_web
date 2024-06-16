"use client";
import Editor from "../components/Editor";
import Modal from "../components/Modal";
import SearchModalContent from "../components/SearchModalContent";
import AccidentModalContent from "../components/AccidentModalContent"; // 새로운 컴포넌트 추가
import { useState, useRef, MutableRefObject } from "react";
import ReactQuill from "react-quill";

export default function Home() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAccidentModalOpen, setIsAccidentModalOpen] = useState(false);
  const username = "user1_manuscript"; // 사용자 이름
  const [roomname, setRoomname] = useState<string>("");
  const editorRef = useRef(null);
  // const quillRef: MutableRefObject<ReactQuill | null> =
  //   useRef<ReactQuill | null>(null);

  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  const textExport = () => {
    if (editorRef.current) {
      editorRef.current.textExport();
    }
  };

  const openAccidentModal = () => {
    setIsAccidentModalOpen(true);
  };

  const closeAccidentModal = () => {
    setIsAccidentModalOpen(false);
  };

  return (
    <div>
      <div className="header">
        <div className="header-text" id="manuscript-name" />
        <div className="header-buttons">
          <button onClick={textExport} className="search-button">
            텍스트 내보내기
          </button>
          <button onClick={openSearchModal} className="search-button">
            통합 검색
          </button>
          <button onClick={openAccidentModal} className="search-button">
            사건 가져오기
          </button>
        </div>
      </div>
      <div
        className={`content ${
          isSearchModalOpen || isAccidentModalOpen ? "darken" : ""
        }`}
      >
        <div className="sidebar1">
          <div className="sidebar1-block">원고</div>
          <div className="sidebar1-block">플롯</div>
          <div className="sidebar1-block">캐릭터</div>
          <div className="sidebar1-block">메모</div>
        </div>
        <div className="sidebar2">
          <div
            className="sidebar2-block"
            style={{ borderBottom: "3px solid #e8eef7" }}
          >
            <h4 id="manuscript-list-title">원고</h4>
            <button className="add-button" id="manuscript-add" />
          </div>
          <div id="manuscript-list" />
        </div>
        <div className="main">
          <Editor
            ref={editorRef}
            username={username}
            roomname={roomname}
            setRoomname={setRoomname}
          />
        </div>
      </div>
      <Modal isOpen={isSearchModalOpen} onClose={closeSearchModal}>
        <SearchModalContent
          username={username}
          setRoomname={setRoomname}
          closeSearchModal={closeSearchModal}
        />
      </Modal>
      <Modal isOpen={isAccidentModalOpen} onClose={closeAccidentModal}>
        <AccidentModalContent
          insertPlot={(title: string, content: string) => {
            let editor = editorRef.current?.getQuillEditor();
            editor?.insertText(editor.getLength(), title);
            editor?.insertText(editor.getLength(), content);
            closeAccidentModal();
          }}
        />
      </Modal>
    </div>
  );
}
