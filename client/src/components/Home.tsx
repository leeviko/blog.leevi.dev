import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import PostList from "../features/posts/PostList";
import { fetchPosts } from "../features/posts/postSlice";
import { AppDispatch } from "../store";

type Props = {
  limit: number;
  cursor: string;
};

const Home = (props: Props) => {
  const { limit, cursor } = props;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    console.log("home");
    dispatch(fetchPosts({ limit, cursor }));
  }, []);

  return (
    <div className="home-page page">
      <div className="page-wrapper">
        <h1 className="section-title">recent posts</h1>
        <PostList /* limit={10} cursor="" */ />
      </div>
    </div>
  );
};

export default Home;
