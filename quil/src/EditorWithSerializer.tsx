import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

export default function EditorWithSerializer() {
  const [editorContent, setEditorContent] = useState("");
  //console.log(editorContent);
  const handleContentChange = (content: any, delta: any, source: any, editor: any) => {
    // To get HTML content
    const htmlContent = editor.getHTML(); // or content for the HTML
    console.log(content, "content");
    console.log(delta, "delta");
    console.log(source, "source");
    console.log(editor, "editor");
    console.log(editor.getHTML(), "getHTML");
    // To get delta (operations that represent the change)
    const deltaContent = editor.getContents();

    // To get text
    const textContent = editor.getText();

    // serialize delta to JSON
    const serializedDelta = JSON.stringify(deltaContent);

    // Update the state or do something with the serialized content
    setEditorContent(serializedDelta);
  };

  return <ReactQuill theme="snow" onChange={handleContentChange} />;
}
