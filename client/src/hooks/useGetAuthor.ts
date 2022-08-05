import { useState, useEffect } from "react";
import api from "../api";

const useGetAuthor = (authorid: string) => {
  const [author, setAuthor] = useState(null);

  const getAuthor = () => {
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    api
      .get(`/users/${authorid}`, headers)
      .then((res) => {
        setAuthor(res.data.result);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getAuthor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return author;
};

export default useGetAuthor;
