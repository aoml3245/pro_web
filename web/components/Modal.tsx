"use client";
import React from "react";
import Editor from "./Editor";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  setRoomname: (roomname: string) => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  username,
  setRoomname,
}) => {
  if (!isOpen) return null;
  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // // 통합 검색 결과 가져오기
  const entireSearch = () => {
    const url = "https://knuproweb.kro.kr/api/entire-search"; // 서버 백엔드 API
    //const url = "http://127.0.0.1:8080/entire-search"; // 테스트용 로컬 백엔드 API

    // 검색어 요소 가져오기
    const searchWordInput = document.getElementById(
      "search-word"
    ) as HTMLInputElement;
    const searchWord = searchWordInput.value;

    // 사용자 이름, 검색어 지정
    const data = {
      collectionName: username,
      searchWord: searchWord,
    };

    // 검색 결과 목록 요소 가져오기
    const modalList = document.getElementById("modal-list") as HTMLDivElement;

    // 원고 내 검색 요소 가져오기
    /*
    const searchInput = document.getElementById(
      "search-input"
    ) as HTMLInputElement;
    */

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
        modalList.innerHTML = "";

        // 통합 검색 결과 채우기
        response.results.forEach((result: any) => {
          const div = document.createElement("div");
          div.className = "modal-list-item";
          div.addEventListener("click", () => {
            // 선택한 원고 열기
            setRoomname(result.title);

            /*
            // 원고 내 검색어에 넣기, 에디터 로딩 될 때까지 재시도
            let attempt = 0;
            const editorMarking = setInterval(() => {
              if (quillRef?.current) {
                searchInput.value = response.searchWord;
                searchInEditor(response.searchWord);
                clearInterval(editorMarking);
              }
              if (++attempt == 10) clearInterval(editorMarking);
            }, 200); // 0.2초마다 실행, 최대 10번 시도
            */
            onClose();
          });

          // 원고 이름
          const titleDiv = document.createElement("div");
          titleDiv.textContent = result.title;
          titleDiv.className = "result-title";
          div.appendChild(titleDiv);

          // 문맥
          result.contexts.forEach((context: string) => {
            const contextDiv = document.createElement("div");
            contextDiv.textContent = context;
            contextDiv.className = "result-context";
            div.appendChild(contextDiv);

            // 검색어와 일치하는 부분 표시하기
            const parts = context.split(searchWord);
            contextDiv.innerHTML = parts.join(
              `<span class="result-search-word">${searchWord}</span>`
            );
          });

          modalList.appendChild(div);
        });

        if (modalList.innerHTML == "") {
          const div = document.createElement("div");
          div.className = "modal-list-item";
          div.innerHTML = "검색 결과가 없습니다.";
          div.style.color = "red";
          modalList.appendChild(div);
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  return (
    <div className="modal" onClick={handleBackgroundClick}>
      <div className="modal-content">
        <div className="modal-header">
          <input
            type="text"
            className="modal-search-input"
            id="search-word"
            placeholder="검색 내용을 입력하세요."
          />
          <button className="modal-action-button" onClick={entireSearch}>
            검색
          </button>
        </div>
        <div className="modal-list" id="modal-list">
          <div className="modal-list-item">검색어를 입력해주세요.</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
