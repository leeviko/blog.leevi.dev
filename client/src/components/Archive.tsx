/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import { useDispatch, useSelector } from "react-redux";
import PostList from "../features/posts/PostList";
import {
  fetchPosts,
  getPostsLoading,
  selectAllPosts,
} from "../features/posts/postSlice";
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
  const [moveType, setMoveType] = useState<"prev" | "next" | null>(null);
  const pagination = useSelector((state: RootState) => state.posts.pagination);
  const posts = useSelector(selectAllPosts);
  const loading = useSelector(getPostsLoading);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!moveType) {
      dispatch(
        fetchPosts({
          limit,
          cursor,
          page: moveType,
          status: "live",
        })
      );
      return;
    }
    if (moveType === "prev") {
      dispatch(
        fetchPosts({
          limit,
          cursor: pagination.cursor?.prev,
          page: moveType,
          status: "live",
        })
      );
    } else if (moveType === "next") {
      dispatch(
        fetchPosts({
          limit,
          cursor: pagination.cursor?.next,
          page: moveType,
          status: "live",
        })
      );
    }
    setMoveType(null);
  }, [pageNum]);

  return (
    <div className="archive-page page">
      <div className="page-wrapper">
        <h1 className="section-title">archive</h1>
        <PostList />
        {posts.length > 0 && pagination.cursor && !loading && (
          <Pagination
            pageNum={pageNum}
            setPageNum={setPageNum}
            cursor={pagination.cursor}
            setMoveType={setMoveType}
          />
        )}
      </div>
    </div>
  );
};

export default Archive;
