import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getPosts } from "../slices/postSlice";

type Props = {};

const Home = (props: Props) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPosts());
  }, []);

  return <div className="home-page page"></div>;
};

export default Home;
