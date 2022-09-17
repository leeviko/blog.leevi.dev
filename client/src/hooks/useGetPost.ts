import { useState, useEffect } from "react";
import api from "../api";

import { TPostResult } from "../types";

const useGetPost = (postId: string | undefined) => {
  const [postData, setPostData] = useState<TPostResult | null>(null);

  const getPost = () => {
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };

    api
      .get(`/posts/${postId}`, headers)
      .then((res) => {
        setPostData(res.data.result[0]);
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
