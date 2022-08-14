import { useState, useEffect } from "react";
import api from "../api";

const useGetAuthor = (authorId: string | null) => {
  const [author, setAuthor] = useState(null);

  const getAuthor = () => {
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    api
      .get(`/users/${authorId}`, headers)
      .then((res) => {
        setAuthor(res.data.result);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (authorId) {
      getAuthor();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorId]);

  return author;
};

export default useGetAuthor;
