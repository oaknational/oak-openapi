import React from 'react';

interface SimpleButtonProps {
  label: string;
  onClick?: () => void;
}

export function SimpleButton({ label, onClick }: SimpleButtonProps) {
  return (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  );
} 