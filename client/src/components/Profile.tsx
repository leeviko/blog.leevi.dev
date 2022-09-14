import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../store";

type Props = {};

const Profile = (props: Props) => {
  const isAuthenticated = useSelector((state: RootState) => state.users.isAuth);

  return (
    <div className="profile page">
      {!isAuthenticated ? (
        <Navigate to="/" replace={true} />
      ) : (
        <div className="page-wrapper">
          <h1 className="section-title">profile</h1>
        </div>
      )}
    </div>
  );
};

export default Profile;
