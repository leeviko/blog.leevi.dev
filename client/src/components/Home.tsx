import React from "react";
import PostList from "../features/posts/PostList";

type Props = {};

const Home = (props: Props) => {
  return (
    <div className="home-page page">
      <PostList />
    </div>
  );
};

export default Home;
