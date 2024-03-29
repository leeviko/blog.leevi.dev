import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { getAuthError, login } from "../../store/slices/authSlice";
import { AppDispatch, RootState } from "../../store/store";
import LoaderInline from "../../components/LoaderInline";

type Props = {};

const Login = (props: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuth);
  const errors = useSelector(getAuthError);
  const [localErrors, setLocalErrors] = useState("");
  const loading = useSelector((state: RootState) => state.auth.loading);

  useEffect(() => {
    document.title = "Blog - Login";
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setLocalErrors("");

    if (loading) {
      return;
    }

    if (!username || !password) {
      setLocalErrors("Username and password must be set");
      return;
    }

    dispatch(login({ username, password }));
  };

  return (
    <div className="login-page page">
      {loading === false && isAuthenticated && (
        <Navigate to="/" replace={true} />
      )}
      <div className="page-wrapper">
        <div className="login-form-wrapper">
          <h1 className="section-title">login</h1>
          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="username">username</label>
            <input
              onChange={(e) => setUsername(e.target.value)}
              value={username}
              type="text"
              id="username"
            />
            <label htmlFor="password">password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              type="password"
              id="password"
            />
            {localErrors || errors ? (
              <p className="errors">
                {localErrors ||
                  (errors && typeof errors === "object"
                    ? errors.msg
                    : "Failed to login")}
              </p>
            ) : null}
            <div>
              <button
                type="submit"
                className="btn submit-btn"
                disabled={loading != null && loading}
              >
                {loading ? <LoaderInline /> : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
