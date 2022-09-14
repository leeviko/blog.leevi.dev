import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import PostList from "../features/posts/PostList";
import { fetchPosts } from "../features/posts/postSlice";
import { AppDispatch, RootState } from "../store";
import Loader from "./Loader";
import LoaderWrapper from "./LoaderWrapper";

type Props = {
  limit: number;
  cursor: string;
};

const Home = ({ limit, cursor }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.posts.loading);

  useEffect(() => {
    dispatch(fetchPosts({ limit, cursor }));
  }, []);

  return (
    <div className="home-page page">
      <div className="page-wrapper">
        <h1 className="section-title">recent posts</h1>
        <LoaderWrapper
          loading={loading !== null && loading}
          loaderComponent={<Loader />}
          delay={500}
        >
          <PostList />
        </LoaderWrapper>
      </div>
    </div>
  );
};

export default Home;
