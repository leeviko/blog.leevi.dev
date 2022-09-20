import React from "react";

export type TDialog = {
  yes?: string;
  no?: string;
  title: string;
  description: string;
};

type Props = TDialog & {
  onClose: () => void;
  onConfirm: () => void;
};

const Dialog = ({
  yes = "Yes",
  no = "Cancel",
  title,
  description,
  onClose,
  onConfirm,
}: Props) => {
  return (
    <div className="dialog">
      <div className="dialog-container">
        <h3 className="dialog-title">{title}</h3>
        <p className="dialog-desc">{description}</p>
        <div className="dialog-actions">
          <button
            className="btn dialog-btn yes-btn publish-btn"
            onClick={onConfirm}
          >
            {yes}
          </button>
          <button
            className="btn dialog-btn no-btn delete-btn"
            onClick={onClose}
          >
            {no}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dialog;
