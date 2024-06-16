import React from "react";
import "react-quill/dist/quill.snow.css";

interface CommentItemProps {
  commented: string;
  comment: string;
}

interface CommentSectionProps {
  comments: Array<any>;
  commenteds: Array<any>;
  onComment: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  commented,
  // author,
  // avatar,
  // timestamp,
}) => (
  <div className="commentBox">
    <div className="commentHeader">
      <div className="commentAuthor"></div>
      <div>
        <button className="button" title="Edit">
          ✏️
        </button>
        <button className="button" title="Delete">
          🗑️
        </button>
      </div>
    </div>
    <div className="commentContent">{commented}</div>
    <div className="commentFooter">{comment}</div>
  </div>
);

const CommentSection: React.FC<CommentSectionProps> = ({
  onComment,
  comments,
  commenteds,
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
          key={c.index}
          commented={commenteds[index].commented}
          comment={c.comment}
        />
      ))}
    </div>
  );
};

export default CommentSection;
