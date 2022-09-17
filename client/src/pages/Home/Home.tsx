import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import PostList from "../Post/PostList";
import { fetchPosts } from "../../store/slices/postSlice";
import { AppDispatch } from "../../store/store";

type Props = {
  limit: number;
  cursor: string;
};

const Home = ({ limit, cursor }: Props) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchPosts({ limit, cursor, status: "live" }));
  }, [cursor, dispatch, limit]);

  return (
    <div className="home-page page">
      <div className="page-wrapper">
        <h1 className="section-title">recent posts</h1>
        <PostList />
      </div>
    </div>
  );
};

export default Home;
