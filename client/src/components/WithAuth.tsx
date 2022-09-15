import Cookies from "js-cookie";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserLoading, isAuth } from "../features/users/userSlice";
import { AppDispatch, RootState } from "../store";

type Props = {
  children: any;
  redirect?: string;
};

const WithAuth = ({ children, redirect = "/" }: Props) => {
  const loading = useSelector(getUserLoading);
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.users.isAuth);
  const navigate = useNavigate();

  useEffect(() => {
    if (Cookies.get("user_sid")) {
      if (isAuthenticated === false) {
        return navigate(redirect, { replace: true });
      } else if (!loading && !isAuthenticated) {
        dispatch(isAuth());
      }
    }
  }, [isAuthenticated, navigate, loading, redirect, dispatch]);

  if (isAuthenticated !== null && loading === false) return children;
};

const withAuth =
  (Component: any, redirect?: string) =>
  ({ ...props }) =>
    (
      <WithAuth redirect={redirect}>
        <Component {...props} />
      </WithAuth>
    );

export default withAuth;
