import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../../store";

type Props = {};

const Profile = (props: Props) => {
  const isAuthenticated = useSelector((state: RootState) => state.users.isAuth);
  const user = useSelector((state: RootState) => state.users.user);

  return (
    <div className="profile page">
      {!isAuthenticated ? (
        <Navigate to="/" replace={true} />
      ) : (
        <div className="page-wrapper">
          <h1 className="section-title">profile</h1>
          <h2>{user && user.username}</h2>
        </div>
      )}
    </div>
  );
};

export default Profile;