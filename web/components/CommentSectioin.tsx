import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const styles = {
  container: {
    width: "400px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
    backgroundColor: "#fff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  headerTitle: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  addButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
  },
  commentBox: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    marginBottom: "10px",
  },
  commentHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: "10px",
  },
  commentFooter: {
    display: "flex",
    alignItems: "center",
    marginTop: "10px",
  },
  button: {
    background: "none",
    border: "none",
    cursor: "pointer",
    marginLeft: "10px",
  },
};

interface CommentItemProps {
  content: string;
  status: string;
}

interface CommentSectionProps {
  comments: [any];
  onComment: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ content, status }) => (
  <div style={styles.commentBox}>
    <div style={styles.commentHeader}>
      <button style={styles.button} title="Edit">
        ✏️
      </button>
      <button style={styles.button} title="Delete">
        🗑️
      </button>
    </div>
    <div>{content}</div>
    <div>{status}</div>
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
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>댓글</div>
        <button
          style={styles.addButton}
          title="Add Comment"
          onClick={handleAddComment}
        >
          ➕
        </button>
      </div>
      {/* Comment List */}
      {comments.map((c) => {
        return (
          <>
            <CommentItem content={c.commented} status={c.comment} />
          </>
        );
      })}
    </div>
  );
};

export default CommentSection;
