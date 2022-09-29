import { useState, useEffect } from "react";
import api from "../api";

import { TAxiosError, TPostResult } from "../types";

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
        let error: TAxiosError;

        if (err.response) {
          error = {
            msg: err.response.data.msg || err.response.data.errors[0].msg,
            status: err.response.status,
          };
        } else {
          error = { msg: err.request.statusText, status: err.request.status };
        }
        setErrors(error);
        console.log(error);
      });
  };

  useEffect(() => {
    getPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { post, errors };
};

export default useGetPost;
