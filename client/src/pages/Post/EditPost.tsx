import React from "react";
import { useLocation, useParams } from "react-router-dom";
import withAuth from "../../components/WithAuth";
import EditNewPost from "./EditNewPost";
import EditOldPost from "./EditOldPost";

type Props = {};

const EditPost = (props: Props) => {
  const location = useLocation().pathname;
  const { slug } = useParams();

  return (
    <>
      {location.endsWith("/edit") && slug ? (
        <EditOldPost slug={slug} />
      ) : (
        <EditNewPost />
      )}
    </>
  );
};

export default withAuth(EditPost);
