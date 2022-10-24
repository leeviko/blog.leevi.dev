import React from "react";
import { Link } from "react-router-dom";

class ErrorBoundary extends React.Component<
  any,
  { hasError: boolean; msg: null | string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, msg: null };
  }

  componentDidCatch(error: any, info: any) {
    console.log(error.message);
    this.setState({ hasError: true, msg: error.message });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError)
      return (
        <div className="page error">
          <div className="error-text" style={{ marginTop: "1rem" }}>
            <h3 className="error title">Error:</h3>
            <p className="error message">Something went wrong:</p>
            <p className="error error-msg">{this.state.msg}</p>
            <p className="error back">
              Try to{" "}
              <Link to="/" className="link" onClick={this.handleRefresh}>
                Refresh
              </Link>{" "}
              the page.
            </p>
          </div>
        </div>
      );
    return this.props.children;
  }
}

export default ErrorBoundary;
