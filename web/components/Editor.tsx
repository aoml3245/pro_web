"use client";
import React, { useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";

import CommentSection from "./CommentSectioin";

const Inline = Quill.import("blots/inline") as any;

class CommentedStringBlot extends Inline {
  static blotName = "commented";
  static className = "ql-commented-string";
  static tagName = "div";
}

class CommentStringBlot extends Inline {
  static blotName = "comment";
  static className = "ql-comment-string";
  static tagName = "div";
}

const Editor = () => {
  const quillRef = useRef<ReactQuill | null>(null);
  const [selectedComment, setSelectedComment] = useState<any>();
  const [comments, setComments] = useState<any>([]);

  const commenting = () => {
    const editor = quillRef.current!.getEditor();
    const selected = quillRef.current?.selection;
    if (
      !selected ||
      selected.index === undefined ||
      selected.length === undefined
    )
      return;

    const index_ = selected.index;
    const length_ = selected.length;
    for (let i = index_; i < index_ + length_; i++) {
      let format = editor.getFormat(i, 1);
      if (format.commented) {
        alert("현재 버전에서는 중복된 코멘트를 사용할 수 없습니다.");
        return;
      }
    }

    const comment = prompt("what is your comment");
    if (!comment) return;

    editor.insertText(index_ + length_, comment);
    editor.formatText(index_ + length_, comment.length, "commented", false);
    editor.formatText(index_ + length_, comment.length, "comment", true);
    editor.formatText(index_, length_, "commented", true);
  };

  useEffect(() => {
    quillRef.current!.editor?.on(
      "selection-change",
      (range, oldRange, source) => {
        if (range) {
          setSelectedComment(range);
        }
      }
    );

    Quill.register(CommentedStringBlot);
    Quill.register(CommentStringBlot);

    quillRef.current!.onEditorChange = async () => {
      let commented = document.getElementsByClassName("ql-commented-string");
      let comments_ = Array.from(commented).map((c) => {
        let commentedDiv = c as HTMLDivElement;
        let commentDiv = commentedDiv.nextElementSibling as HTMLDivElement;
        return {
          commented: commentedDiv.innerText,
          comment: commentDiv.innerText,
        };
      });
      setComments(comments_);
    };
  });

  const handleEditorChange = (
    content: any,
    delta: any,
    source: any,
    editor: any
  ) => {
    console.log(content, delta);
  };

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
      <div className="editor-bottom">
        <div className="ql-editor">
          <ReactQuill
            onChange={handleEditorChange}
            ref={quillRef}
            theme="snow"
            modules={{ toolbar: "#toolbar" }}
          />
        </div>
        <div className="comment-section">
          <CommentSection
            onComment={commenting}
            comments={comments}
            // onEdit={editComment}
            // onDelete={deleteComment}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor;
