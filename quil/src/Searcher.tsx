import ReactQuill, { Quill } from "react-quill";
class Searcher {
  quill: any;
  container: any;

  occurrencesIndices: any = [];
  currentIndex = 0;
  SearchedStringLength = 0;
  SearchedString: string = "";

  constructor(quill: any) {
    this.quill = quill;
    this.container = document.getElementById("search-container");

    // document
    //   .getElementById("search")
    //   ?.addEventListener("click", this.search.bind(this));
    // document
    //   .getElementById("search-input")?.addEventListener("keyup", this.keyPressedHandle
  }

  
}

export default Searcher;
