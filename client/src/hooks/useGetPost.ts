import { useState, useEffect } from "react";
import api from "../api";

const useGetPost = (postId: string | undefined) => {
  const [postData, setPostData] = useState(null);

  const getPost = () => {
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    api
      .get(`/posts/${postId}`, headers)
      .then((res) => {
        setPostData(res.data.result);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return postData;
};

export default useGetPost;
