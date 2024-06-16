"use client";
import React from "react";

interface AccidentModalContentProps {
  insertPlot: (title: string, content: string) => void;
}

const AccidentModalContent: React.FC<AccidentModalContentProps> = ({
  insertPlot,
}) => {
  const plotDummy = [
    {
      title: "[1부]",
      content: `눈을 뜨니 이세계에 와있는 여주.
      어지러워 하지만, 바람 능력을 갖고 있다는 자각을 하고 그 후에 집에 갈 방안을 찾기위해 노력함.
      그러던 중 어린아이의 모습을 띄고 있는 또다른 생존인(남주)를 만나게 되고 남주를 키우게 됨.`,
    },
    {
      title: "[피곤한 하루를 보낸 뒤, 세상이 뒤바뀌었다.]",
      content: `여주는 대학생이며 평범한 하루를 보내고 소파에 누워 잠깐의 잠을 잔다. 
      자고 일어나자 세상이 뒤바뀌어 있다.`,
    },
    {
      title: "[이상한 집, 이상한 세상]",
      content: `눈을 뜬 곳은 허름한 집의 허름한 소파.
      소파에서 일어나 주변을 살피지만 주변엔 먼지 뿐 아무것도 없다. 
      의문이 드는 여주는 일어나 밖에 나가보기로 결심한다.`,
    },
    {
      title: "[괴물이 사는 바깥 세계]",
      content: `바깥에 나간 여주는 아주 커다란 괴물을 발견한다. 
      멀리에 있었지만 매우 위협적인 소리를 내며 새 형태의 괴물과 싸우는 듯한 모습을 보고 여주는 겁을 먹는다. 
      여주는 빠르게 집안으로 다시 숨는다.`,
    },
    {
      title: "[여주의 공황]",
      content: `여주는 이러한 상황에 공황에 빠진다. 
      여주는 모든 것을 잊고자, 구석진 옷장에 들어가 숨는다. 
      (왜인진 모르지만 창문과 문이 모두 닫힌다. 여주의 능력 복선)`,
    },
    {
      title: "[공황이 어느정도 정리된 후]",
      content: `여주는 이 상황을 객관적으로 판단하려 한다.
      그리고 집을 조사한다. 
      그러던 중, 편지를 발견하다.`,
    },
    {
      title: "[정찰]",
      content: `집을 어느 정도 뒤진 후, 집 밖을 둘러보아야 겠다고 생각한 여주는 조심스레 집주위를 돌아본다.`,
    },
    {
      title: "[편지]",
      content: `편지에는 이상한 말이 적혀있다. 
      데리러 온다는 내용과 사람을 믿지 말라는 내용 (남주에 대한 복선).
      여주는 편지의 내용처럼 사람을 기다리기로 한다.`,
    },
    {
      title: "[쓰러져 있는 사람, 남주.]",
      content: `그러던 중, 쓰러진 한 소년(남주)을 발견한다. 
      남주는 빈사 상태고 여주는 남주를 집으로 들인다.`,
    },
    {
      title: "[남주 깨어나다]",
      content: `여주는 남주를 돌보았고, 남주는 깨어난다. 
      남주는 여주를 보고 놀라며, 누구인지 묻는다. 
      여주는 자기의 정보를 숨기며, 남주의 정보를 먼저 요구한다. 
      남주는 여주에게 약한 모습을 보이며 자기소개를 한다.`,
    },
    {
      title: "[남주의 사연]",
      content: `여주는 남주가 왜 쓰러져 있어야 했는지 묻는다. 
      남주는 자신이 괴물을 만나 일행을 잃어버렸다고 한다.
      그리고 자신의 일행을 보지는 않았는지 물어본다. `,
    },
    {
      title: "[여주의 의심]",
      content: `여주는 남주가 의심된다. 
      일행을 잃었다는 말과 상반되는 행동을 한 적이 있음을 지적한다. 
      남주는 망설이다가 조금더 자세한 내막을 설명한다.`,
    },
    {
      title: "[[진실] 남주의 진짜 내막]",
      content: `남주는 사실 괴물이다
      이 세상에는 종종 인간이 나타나는 데, 해당 인간을 잡아 먹을 경우, 특별한 능력을 얻을 수 있다. 
      그 능력은 인간이 쓰는 이능력으로, 인간은 여기에 도착할 때 새로운 능력을 깨우친다.
      하지만 괴물이 얻을 수 있는 이능력은 인간이 생전에 그 능력을 사용할 수 있는 정도로 제한되기 때문에,
      인간이 어느 정도 그 능력을 훈련을 통해 키운 이후에 잡아 먹어 능력을 흡수하는 것이 더 이득이다. 
      이에 남주는 여주를 잡아 먹기 전, 여주를 훈련시켜 강하게 하고, 이후에 죽여 능력을 흡수하기 위해 여주에게 접근한 것이다.`,
    },
    {
      title: "[남주의 내막 (가짜)]",
      content: `남주는 여주와 동일하게 새로이 나타난 인간이다. 
      남주는 일행에게 기피받았으며, 끝내 괴물이 나타났을 때, 눈속임 용도로 버려졌다. 
      남주는 일행에게 돌아가고 싶어하며, 자신의 편을 만들고 싶어한다.`,
    },
  ];

  const searchPlot = () => {
    const searchWordInput = document.getElementById(
      "search-case"
    ) as HTMLInputElement;
    const searchWord = searchWordInput.value;

    const matchedPlot = plotDummy.filter((plot) => {
      return (
        plot.title.includes(searchWord) || plot.content.includes(searchWord)
      );
    });

    const modalList = document.getElementById("modal-list") as HTMLDivElement;
    modalList.innerHTML = "";

    matchedPlot.forEach((plot) => {
      const div = document.createElement("div");
      div.className = "modal-list-item";
      div.addEventListener("click", () => {
        insertPlot(plot.title, plot.content); // 선택한 사건을 에디터에 삽입
      });

      const titleDiv = document.createElement("div");
      titleDiv.textContent = plot.title;
      titleDiv.className = "result-title";
      div.appendChild(titleDiv);

      const contextDiv = document.createElement("div");
      contextDiv.textContent = plot.content;
      contextDiv.className = "result-context";
      div.appendChild(contextDiv);

      modalList.appendChild(div);
    });

    if (modalList.innerHTML === "") {
      const div = document.createElement("div");
      div.className = "modal-list-item";
      div.innerHTML = "검색 결과가 없습니다.";
      div.style.color = "red";
      modalList.appendChild(div);
    }
  };

  return (
    <div>
      <div className="modal-header">
        <input
          type="text"
          className="modal-search-input"
          id="search-case"
          placeholder="사건 내용을 입력하세요."
        />
        <button className="modal-action-button" onClick={searchPlot}>
          검색
        </button>
      </div>
      <div className="modal-list" id="modal-list">
        <div className="modal-list-item">검색어를 입력해주세요.</div>
      </div>
    </div>
  );
};

export default AccidentModalContent;
