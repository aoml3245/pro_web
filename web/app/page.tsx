import Editor from "../components/Editor";

export default function Home() {
  return (
    <div>
      <div className="header" id="manuscript-name" />

      <div className="content">
        <div className="sidebar1">
          <div className="sidebar1-block">원고</div>
          <div className="sidebar1-block">플롯</div>
          <div className="sidebar1-block">캐릭터</div>
          <div className="sidebar1-block">메모</div>
        </div>
        <div className="sidebar2">
          <div
            className="sidebar2-block"
            style={{ borderBottom: "3px solid #e8eef7" }}
          >
            <h4 id="manuscript-list-title">원고</h4>
            <button className="add-button" id="manuscript-add" />
          </div>
          <div id="manuscript-list" />
        </div>
        <div className="main">
          <Editor />
        </div>
      </div>
    </div>
  );
}
