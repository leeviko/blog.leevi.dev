import { useEffect, useState } from "react";

const LoaderWrapper = ({
  loading,
  loaderComponent,
  delay,
  children,
}: {
  loading: boolean;
  loaderComponent: any;
  delay: number;
  children: any;
}) => {
  const [isExpired, setIsExpired] = useState(true);
  let setTimeoutInstance: any;

  useEffect(() => {
    if (loading) {
      setIsExpired(false);

      if (setTimeoutInstance) {
        clearTimeout(setTimeoutInstance);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setTimeoutInstance = setTimeout(() => {
        setIsExpired(true);
      }, delay);
    }
  }, [loading]);

  if (!isExpired) {
    return loaderComponent;
  }

  return children;
};

export default LoaderWrapper;
