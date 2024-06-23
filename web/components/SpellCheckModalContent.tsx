"use client";
import React, { useState } from "react";
import ReactQuill from "react-quill";
import axios from "axios";

interface SpellCheckModalContentProps {
  quillRef: React.RefObject<ReactQuill>;
  closeSpellCheckModal: () => void;
}

const SpellCheckModalContent: React.FC<SpellCheckModalContentProps> = ({
  quillRef,
  closeSpellCheckModal,
}) => {
  const [grammarCheckResult, setGrammarCheckResult] = useState<any>(null);

  const handleExit = () => {
    closeSpellCheckModal();
  };

  const handleSaveChanges = () => {
    if (quillRef.current && grammarCheckResult) {
      const editor = quillRef.current.getEditor();
      const newText = grammarCheckResult.checked; // 수정된 텍스트를 가져옴
  
      // 에디터의 내용을 새로운 텍스트로 설정
      editor.setText(newText);
  
      // 에디터 내용이 변경되었음을 알리기 위해 이벤트를 발생시킴
      const change = new CustomEvent('text-change', {
        detail: { newText },
      });
      editor.root.dispatchEvent(change);
    }
    closeSpellCheckModal();
  };

  const runGrammarCheck = async () => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const text = editor.getText();
      try {
        // const response = await axios.post("http://localhost:5000/spell_check", {
        //   text,
        // });
        const response = await axios.post(
          "https://knuproweb.kro.kr//api2/spell_check",
          {
            text,
          }
        );
        setGrammarCheckResult(response.data);
      } catch (error) {
        console.error("Error during grammar check:", error);
      }
    }
  };

  const renderCheckedText = (checked: string, words: [string, number][]) => {
    return words.map(([word, errorType], index) => {
      let color = "";
      switch (errorType) {
        case 2:
          color = "#FF5757";
          break;
        case 1:
          color = "#00C73C";
          break;
        case 3:
          color = "#B22AF8";
          break;
        case 4:
          color = "#32ABEA";
          break;
        default:
          color = "black";
      }
      return (
        <span key={index} style={{ color: color }}>
          {word}{" "}
        </span>
      );
    });
  };

  return (
    <div>
      <div className="modal-header">
        <h2>맞춤법 검사</h2>
      </div>
      {grammarCheckResult && (
        <div>
          <h3>Grammar Check Results:</h3>
          <div style={{ whiteSpace: "pre-wrap" }}>
            {renderCheckedText(grammarCheckResult.checked, grammarCheckResult.words)}
          </div>
          <div style={{ marginTop: "20px" }}>
            <span style={{ color: "#FF5757" }}>●</span> 맞춤법 <span style={{ color: "#00C73C" }}>●</span> 뛰어쓰기 <span style={{ color: "#B22AF8" }}>●</span> 표준어 의심 <span style={{ color: "#32ABEA" }}>●</span> 통계적 교정
          </div>
        </div>
      )}
      <div className="modal-actions">
        <button onClick={handleExit} className="modal-action-button">Exit</button>
        <button onClick={runGrammarCheck} className="modal-action-button">Run Grammar Check</button>
        <button onClick={handleSaveChanges} className="modal-action-button">Save Changes</button>
      </div>
    </div>
  );
};

export default SpellCheckModalContent;
