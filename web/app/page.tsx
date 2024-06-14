"use client";
import Editor from "../components/Editor";
import Modal from "../components/Modal";
import { useState } from "react";
export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  return (
    <div>
      <div className="header">
        <div className="header-text">현재 원고 : 원고 1</div>
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
          <div className="sidebar2-block">
            <h4>원고</h4>
          </div>
          <div className="sidebar2-block">원고 1</div>
        </div>
        <div className="main">
          <Editor />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
