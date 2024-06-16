"use client";
import Editor from "../components/Editor";
import Modal from "../components/Modal";
import { useState } from "react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const username = "user1_manuscript"; // 사용자 이름
  const [roomname, setRoomname] = useState<string>(getDocNameFromList(1));

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

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

  return (
    <div>
      <div className="header">
        <div className="header-text" id="manuscript-name" />
        <div className="header-buttons">
          <button onClick={openModal} className="search-button">
            검색
          </button>

          {/* <button onClick={맞춤법 검사 핸들러} className="correct-button">
            맞춤법 검사
          </button> */}
        </div>
      </div>
      <div className={`content ${isModalOpen ? "darken" : ""}`}>
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
            username={username}
            roomname={roomname}
            setRoomname={setRoomname}
          />
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        username={username}
        setRoomname={setRoomname}
      />
    </div>
  );
}
