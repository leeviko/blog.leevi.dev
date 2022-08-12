/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import { useDispatch, useSelector } from "react-redux";
import PostList from "../features/posts/PostList";
import { fetchPosts } from "../features/posts/postSlice";
import { AppDispatch } from "../store";
import Loader from "./Loader";
import LoaderWrapper from "./LoaderWrapper";
import Pagination from "./Pagination";

type Props = {
  limit: number;
  cursor: string;
};

const Archive = ({ limit, cursor }: Props) => {
  const [pageNum, setPageNum] = useState(1);
  const pagination = useSelector((state: any) => state.posts.pagination);
  const loading = useSelector((state: any) => state.posts.loading);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchPosts({ limit, cursor }));
  }, []);

  return (
    <div className="archive-page page">
      <div className="page-wrapper">
        <h1 className="section-title">archive</h1>
        <LoaderWrapper
          loading={loading}
          loaderComponent={<Loader />}
          delay={500}
        >
          <PostList />
          {pagination.cursor !== null && (
            <Pagination
              pageNum={pageNum}
              setPageNum={setPageNum}
              cursor={pagination.cursor}
            />
          )}
        </LoaderWrapper>
      </div>
    </div>
  );
};

export default Archive;
