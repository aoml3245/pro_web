import "./styles.css";
import Editor from "./Editor";
import EditorWithSerializer from "./EditorWithSerializer";
import CollaborativeEditor from "./ColaborativeEditor";
export default function App() {
  return (
    <div className="App">
      <Editor />
      {/* <EditorWithSerializer /> */}
      <CollaborativeEditor />
    </div>
  );
}
