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
    const htmlString = grammarCheckResult.checked;

    // Use pasteHTML to convert HTML content to Quill format
    editor.clipboard.dangerouslyPasteHTML(htmlString);

    // Dispatch a custom event to notify about the text change
    const change = new CustomEvent('text-change', {
      detail: { newText: editor.getText() },
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
      console.log(word);
      let color = "";
      switch (errorType) {
        case 1:
          color = "#FF5757"; // Wrong spelling (Red) 
          break;
        case 2:
          color = "#00C73C"; // Wrong spacing (Green)
          break;
        case 3:
          color = "#B22AF8"; // Ambiguous (Violet)
          break;
        case 4:
          color = "#32ABEA"; // Statistical correction (Blue)
          break;
        default:
          color = "black";
      }

      // Replace <br> tags with line breaks and preserve spaces
      const formattedWord = word.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");

      console.log(formattedWord);
      return (
        <React.Fragment key={index}>
          {formattedWord.split("\n").map((line, lineIndex) => (
            <React.Fragment key={lineIndex}>
              <span style={{ color: color }}>
                {line}{" "}
              </span>
              {lineIndex < formattedWord.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))}
        </React.Fragment>
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
