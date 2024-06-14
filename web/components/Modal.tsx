"use client";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };
  return (
    <div className="modal" onClick={handleBackgroundClick}>
      <div className="modal-content">
        <div className="modal-header">
          <input
            type="text"
            className="modal-search-input"
            placeholder="검색 내용을 입력하세요."
          />
          <button className="modal-action-button" onClick={onClose}>
            검색
          </button>
        </div>
        <div className="modal-list">
          <div className="modal-list-item">[화교] 기타 서류</div>
          <div className="modal-list-item">창업활동비</div>
          <div className="modal-list-item">인건비</div>
          <div className="modal-list-item">복리후생비</div>
          <div className="modal-list-item">[라이프메이트] 예비창업패키지</div>
          <div className="modal-list-item">서버비</div>
          <div className="modal-list-item">[라이프메이트] 컴퓨터 지원사항</div>
          <div className="modal-list-item">UI에 맞추어 기능 구현</div>
          <div className="modal-list-item">[화교] 고급프로그램</div>
          <div className="modal-list-item">WRITEMATE</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
