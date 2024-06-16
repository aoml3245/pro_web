"use client";
import React from "react";

interface SearchModalContentProps {
  username: string;
  setRoomname: (roomname: string) => void;
  closeSearchModal: () => void;
}

const SearchModalContent: React.FC<SearchModalContentProps> = ({
  username,
  setRoomname,
  closeSearchModal,
}) => {
  const entireSearch = () => {
    const url = "https://knuproweb.kro.kr/api/entire-search";
    const searchWordInput = document.getElementById(
      "search-word"
    ) as HTMLInputElement;
    const searchWord = searchWordInput.value;

    const data = {
      collectionName: username,
      searchWord: searchWord,
    };

    const modalList = document.getElementById("modal-list") as HTMLDivElement;

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((response) => {
        modalList.innerHTML = "";

        response.results.forEach((result: any) => {
          const div = document.createElement("div");
          div.className = "modal-list-item";
          div.addEventListener("click", () => {
            setRoomname(result.title);
            closeSearchModal();
          });

          const titleDiv = document.createElement("div");
          titleDiv.textContent = result.title;
          titleDiv.className = "result-title";
          div.appendChild(titleDiv);

          result.contexts.forEach((context: string) => {
            const contextDiv = document.createElement("div");
            contextDiv.className = "result-context";
            contextDiv.innerHTML = context
              .split(searchWord)
              .join(`<span class="result-search-word">${searchWord}</span>`);
            div.appendChild(contextDiv);
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
    <div>
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
  );
};

export default SearchModalContent;
