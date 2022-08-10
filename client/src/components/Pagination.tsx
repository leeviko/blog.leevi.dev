import React from "react";
import { useDispatch } from "react-redux";
import { fetchPosts } from "../features/posts/postSlice";
import { AppDispatch } from "../store";

type Props = {
  pageNum: number;
  setPageNum: React.Dispatch<React.SetStateAction<number>>;
  cursor: {
    prev: string | null;
    next: string | null;
  };
};

const Pagination = (props: Props) => {
  const { pageNum, setPageNum, cursor } = props;
  const dispatch = useDispatch<AppDispatch>();

  const handlePrev = () => {
    if (cursor.prev) {
      if (pageNum > 1) {
        setPageNum(pageNum - 1);
        if (pageNum >= 1) {
          dispatch(
            fetchPosts({ limit: 10, cursor: cursor.prev, page: "prev" })
          );
        }
      }
    }
  };
  const handleNext = () => {
    if (cursor.next) {
      setPageNum(pageNum + 1);
      dispatch(fetchPosts({ limit: 10, cursor: cursor.next, page: "next" }));
    }
  };

  return (
    <div className="pagination">
      <div className="pagination-wrapper">
        <button
          onClick={handlePrev}
          className={`prev-btn ${
            cursor.prev && pageNum > 1 ? "enabled" : "disabled"
          }`}
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
