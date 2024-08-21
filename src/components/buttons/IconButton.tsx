import { h } from "preact";
import { ReactNode } from "preact/compat";

interface IconButtonProps {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

export default function IconButton({ children, disabled = false, onClick }: IconButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      class={`${disabled ? 'interactive-fg-disabled' : 'hover:opacity-80 hover:surface-02'} rounded-s p-2`}
    >
      {children}
    </button>
  )
}
