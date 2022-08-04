import React from "react";
import PostList from "../features/posts/PostList";

type Props = {};

const Home = (props: Props) => {
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
