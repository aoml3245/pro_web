import React, { useEffect, useRef, useState } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { QuillBinding } from "y-quill"; // Make sure this is correctly imported

const Inline = Quill.import("blots/inline");

function generateUniqueName() : string {
  return   Math.random().toString(36).substr(2, 9);

}
class SearchedStringBlot extends Inline {}




SearchedStringBlot.blotName = searchRandName;
SearchedStringBlot.className = "ql-searched-string";
SearchedStringBlot.tagName = "div";

export default function CollaborativeEditor() {
  const quillRef = useRef<ReactQuill | null>(null);
  let [searchValue, setSearchValue] = useState<string>("");
  const [textLength, setTextLength] = useState<number>(0); // State to hold the text length


  

  useEffect(() => {
    Quill.register(SearchedStringBlot);
    // Initialize the Yjs document
    const ydoc = new Y.Doc();
    // Connect to the public Yjs Websocket server using the unique room name
    const provider = new WebsocketProvider(
      "wss://knuproweb.kro.kr/api/",
      "my_room",
      ydoc
    );
    const ytext = ydoc.getText("quill");
    let binding: any;

    // Initialize the Quill editor when the component is mounted
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      binding = new QuillBinding(ytext, editor, provider.awareness);
    }

    // 글자 수 세기
    const updateTextLength = () => {
      setTextLength(ytext.length);
    };

    ytext.observe(updateTextLength); // Update text length whenever the Yjs text changes

    // Cleanup function
    return () => {
      if (binding) {
        binding.destroy();
      }
      provider.disconnect();
    };
  }, []);

  function getIndicesOf(searchStr: string, totalString: string) {
    let searchStrLen = searchStr.length;
    let startIndex = 0,
      index,
      indices = [];
    while (
      (index = totalString.indexOf(searchStr.toLowerCase(), startIndex)) > -1
    ) {
      indices.push(index);
      startIndex = index + searchStrLen;
    }
    return indices;
  }

  // function search() {
  //   console.log("test");
  //   const SearchedString = (
  //     document.getElementById("search-input") as HTMLInputElement
  //   ).value;
  //   const editor = quillRef.current!.getEditor();
  //   editor.formatText(0, editor.getText().length, "SearchedString", false);

  //   if (SearchedString) {
  //     let totalText: string = editor.getText();
  //     let re = new RegExp(SearchedString, "gi");
  //     let match = re.test(totalText);

  //     console.log(match);
  //     if (match) {
  //       let indices = getIndicesOf(SearchedString, totalText);
  //       console.log(indices);
  //       let length = SearchedString.length;
  //       indices.forEach((index: number) =>
  //         editor.formatText(index, length, "SearchedString", true)
  //       );
  //     }
  //   } else {
  //     editor.formatText(0, editor.getText().length, "SearchedString", false);
  //   }
  // }

  const onSearch = (e: React.FormEvent<HTMLInputElement>) => {
    const newValue = e.currentTarget.value;
    setSearchValue(newValue);

    const editor = quillRef.current!.getEditor();
    editor.formatText(0, editor.getText().length, searchRandName, false);
    const SearchedString = newValue;

    let totalText = editor.getText();
    let re = new RegExp(`${SearchedString}`, "gi");

    let match = re.test(totalText);

    if (match && SearchedString !== "") {
      getIndicesOf(SearchedString, totalText);
      let indices = getIndicesOf(SearchedString, totalText);
      let length = SearchedString.length;
      indices.forEach((index) =>
        editor.formatText(index, length, searchRandName, true)
      );
    }
  };

  const handleEditorChange = (
    content: any,
    delta: any,
    source: any,
    editor: any
  ) => {
    console.log(content, delta);
  };
  return (
    <>
      <input
        type="search"
        placeholder="검색어를 입력하세요"
        id="search-input"
        onChange={onSearch}
      />
      <button id="search">find</button>
      <div>Text Length: {textLength}</div>

      <ReactQuill ref={quillRef} theme="snow" onChange={handleEditorChange} />
    </>
  );
}
