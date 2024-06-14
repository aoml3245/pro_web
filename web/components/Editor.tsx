// components/MyEditor.tsx
"use client";
import React, { useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // or 'quill.bubble.css'

const Editor = () => {
  const quillRef = useRef<ReactQuill | null>(null);

  return (
    <div className="editor-container">
      <div id="toolbar">
        <select
          className="ql-header"
          defaultValue=""
          onChange={(e) => e.persist()}
        >
          <option value="1"></option>
          <option value="2"></option>
          <option value=""></option>
        </select>
        <select className="ql-size">
          <option value="small"></option>
          <option value="normal"></option>
          <option value="large"></option>
          <option value="huge"></option>
        </select>
        <button className="ql-bold"></button>
        <button className="ql-italic"></button>
        <button className="ql-underline"></button>
        <button className="ql-strike"></button>
        <button className="ql-list" value="ordered"></button>
        <button className="ql-list" value="bullet"></button>
      </div>
      <div>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          modules={{ toolbar: "#toolbar" }}
        />
        {/* 댓글창 */}
      </div>
    </div>
  );
};

export default Editor;
