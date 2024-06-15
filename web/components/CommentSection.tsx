import React from "react";
import "react-quill/dist/quill.snow.css";

interface CommentItemProps {
  content: string;
  status: string;
  author: string;
  avatar: string;
  timestamp: string;
}

interface CommentSectionProps {
  comments: Array<any>;
  onComment: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  content,
  status,
  author,
  avatar,
  timestamp,
}) => (
  <div className="commentBox">
    <div className="commentHeader">
      <div className="commentAuthor">
        <img src={avatar} alt="author avatar" />
        <div>
          <div className="authorName">{author}</div>
          <div className="timestamp">{timestamp}</div>
        </div>
      </div>
      <div>
        <button className="button" title="Edit">
          ✏️
        </button>
        <button className="button" title="Delete">
          🗑️
        </button>
      </div>
    </div>
    <div className="commentContent">{content}</div>
    <div className="commentFooter">{status}</div>
  </div>
);

const CommentSection: React.FC<CommentSectionProps> = ({
  onComment,
  comments,
}) => {
  const handleAddComment = () => {
    onComment();
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <div className="headerTitle">댓글</div>
        <button
          className="addButton"
          title="Add Comment"
          onClick={handleAddComment}
        >
          ➕
        </button>
      </div>
      {/* Comment List */}
      {comments.map((c, index) => (
        <CommentItem
          key={index}
          content={c.commented}
          status={c.comment}
          author={c.author}
          avatar={c.avatar}
          timestamp={c.timestamp}
        />
      ))}
    </div>
  );
};

export default CommentSection;
