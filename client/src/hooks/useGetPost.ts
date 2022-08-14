import { useState, useEffect } from "react";
import api from "../api";

import { PostType } from "../types";

const useGetPost = (postId: string | undefined) => {
  const [postData, setPostData] = useState<PostType>({
    authorid: "",
    content: "",
    created_at: "",
    private: null,
    slug: "",
    tags: [],
    title: "",
  });

  const getPost = () => {
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
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
