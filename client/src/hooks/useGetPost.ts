import { useState, useEffect } from "react";
import api from "../api";

import { TPostResult } from "../types";

const useGetPost = (postId: string | undefined) => {
  const [post, setPost] = useState<TPostResult | null>(null);
  const [errors, setErrors] = useState<any>(null);

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
        setPost(res.data.result[0]);
      })
      .catch((err) => {
        setErrors(err);
      });
  };

  useEffect(() => {
    getPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { post, errors };
};

export default useGetPost;
