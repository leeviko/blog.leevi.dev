import React from "react";
import { Outlet } from "react-router-dom";
import withAuth from "../../components/WithAuth";
import ProfileSidebar from "./ProfileSidebar";

type Props = {};

const Profile = (props: Props) => {
  return (
    <div className="profile page">
      <div className="page-wrapper">
        <h1 className="section-title">profile</h1>
        <div className="profile-wrapper">
          <ProfileSidebar />
          <div className="profile-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Profile);
