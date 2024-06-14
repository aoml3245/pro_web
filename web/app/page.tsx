import Editor from "../components/Editor";

export default function Home() {
  return (
    <div>
      <div className="header">현재 원고 : 원고 1 </div>

      <div className="content">
        <div className="sidebar1">
          <div className="sidebar1-block">원고</div>
          <div className="sidebar1-block">플롯</div>
          <div className="sidebar1-block">캐릭터</div>
          <div className="sidebar1-block">메모</div>
        </div>
        <div className="sidebar2">
          <div className="sidebar2-block">
            <h4>원고</h4>
          </div>
          <div className="sidebar2-block">원고 1</div>
        </div>
        <div className="main">
          // 맞춤법 블럭
          <Editor />
        </div>
      </div>
    </div>
  );
}
