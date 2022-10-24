import React from "react";

class ErrorBoundaryGlobal extends React.Component<
  any,
  { hasError: boolean; msg: string | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, msg: null };
  }

  componentDidCatch(error: any, info: any) {
    this.setState({ hasError: true, msg: error.message });
  }

  render() {
    if (this.state.hasError)
      return (
        <div className="page error">
          <div className="error-text" style={{ marginTop: "1rem" }}>
            <p className="error message">Something went wrong:</p>
            <p className="error error-msg">{this.state.msg}</p>
          </div>
        </div>
      );
    return this.props.children;
  }
}

export default ErrorBoundaryGlobal;
