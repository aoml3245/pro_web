"use client";
import Editor from "../components/Editor";
import Modal from "../components/Modal";
import SearchModalContent from "../components/SearchModalContent";
import AccidentModalContent from "../components/AccidentModalContent"; // 새로운 컴포넌트 추가
import { useState, useRef } from "react";

export default function Home() {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAccidentModalOpen, setIsAccidentModalOpen] = useState(false);
  const username = "user1_manuscript"; // 사용자 이름
  const [roomname, setRoomname] = useState<string>(getDocNameFromList(1));
  const editorRef = useRef<Editor | null>(null);

  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  const openAccidentModal = () => {
    setIsAccidentModalOpen(true);
  };

  const closeAccidentModal = () => {
    setIsAccidentModalOpen(false);
  };

  function getDocNameFromList(index: number): string {
    const url = "https://knuproweb.kro.kr/api/manuscripts";
    const data = { collectionName: username };

    let docName = "";

    const request = new XMLHttpRequest();
    request.open("POST", url, false);
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify(data));

    if (request.status === 200) {
      const response = JSON.parse(request.responseText);
      if (index <= response.manuscripts.length + 1 && index > 0) {
        docName = response.manuscripts[index - 1];
      }
    } else {
      console.error("원고 목록 불러오기 실패 : ", request.statusText);
    }

    return docName;
  }

  return (
    <div>
      <div className="header">
        <div className="header-text" id="manuscript-name" />
        <div className="header-buttons">
          <button onClick={openSearchModal} className="search-button">
            검색
          </button>
          <button onClick={openAccidentModal} className="search-button">
            사건 검색
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
        <SearchModalContent username={username} setRoomname={setRoomname} />
      </Modal>
      <Modal isOpen={isAccidentModalOpen} onClose={closeAccidentModal}>
        <AccidentModalContent
          insertPlot={(title: string, content: string) => {
            if (editorRef.current) {
              editorRef.current.insertPlot(title, content);
            }
            closeAccidentModal();
          }}
        />
      </Modal>
    </div>
  );
}
