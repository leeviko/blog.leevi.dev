/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import { useDispatch, useSelector } from "react-redux";
import PostList from "../features/posts/PostList";
import { fetchPosts } from "../features/posts/postSlice";
import { AppDispatch, RootState } from "../store";
import Pagination from "./Pagination";

type Props = {
  limit: number;
  cursor: {
    prev: string | null;
    next: string | null;
  } | null;
};

const Archive = ({ limit, cursor }: Props) => {
  const [pageNum, setPageNum] = useState(1);
  const pagination = useSelector((state: RootState) => state.posts.pagination);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchPosts({ limit, cursor, status: "live" }));
  }, []);

  return (
    <div className="archive-page page">
      <div className="page-wrapper">
        <h1 className="section-title">archive</h1>
        <PostList />
        {pagination.cursor !== null && (
          <Pagination
            pageNum={pageNum}
            setPageNum={setPageNum}
            cursor={pagination.cursor}
          />
        )}
      </div>
    </div>
  );
};

export default Archive;
