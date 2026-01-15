import React from 'react';

interface SimpleButtonProps {
  label: string;
  onClick?: () => void;
}

export function SimpleButton({
  label,
  onClick,
}: SimpleButtonProps): React.ReactElement {
  return (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  );
}
