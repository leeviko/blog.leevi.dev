import React from "react";
import { useDispatch } from "react-redux";
import { fetchPosts } from "../features/posts/postSlice";
import { AppDispatch } from "../store";

type Props = {
  cursor: {
    prev: string | null;
    next: string | null;
  };
};

const Pagination = (props: Props) => {
  const { cursor } = props;
  const dispatch = useDispatch<AppDispatch>();

  const handlePrev = () => {
    if (cursor.prev) {
      dispatch(fetchPosts({ limit: 10, cursor: cursor.prev, page: "prev" }));
    }
  };
  const handleNext = () => {
    if (cursor.next) {
      dispatch(fetchPosts({ limit: 10, cursor: cursor.next, page: "next" }));
    }
  };

  return (
    <div className="pagination">
      <div className="pagination-wrapper">
        <button
          onClick={handlePrev}
          className={`prev-btn ${cursor.prev ? "enabled" : "disabled"}`}
        >
          Prev
        </button>
        <button
          onClick={handleNext}
          className={`next-btn ${cursor.next ? "enabled" : "disabled"}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Pagination;
