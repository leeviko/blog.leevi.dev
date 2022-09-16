import React from "react";

type Props = {
  pageNum: number;
  setPageNum: React.Dispatch<React.SetStateAction<number>>;
  cursor: {
    prev: string | null;
    next: string | null;
  };
  setMoveType: React.Dispatch<React.SetStateAction<"prev" | "next" | null>>;
};

const Pagination = ({ pageNum, setPageNum, cursor, setMoveType }: Props) => {
  const handlePrev = () => {
    if (cursor.prev && pageNum > 1) {
      setMoveType("prev");
      setPageNum(pageNum - 1);
    }
  };

  const handleNext = () => {
    if (cursor.next) {
      setMoveType("next");
      setPageNum(pageNum + 1);
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
