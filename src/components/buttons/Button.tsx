import { h } from "preact"

interface IButton {
  label: string
  fullWidth?: boolean
  variant?: 'outline' | 'primary'
  size?: 'regular' | 'compact'
  disabled?: boolean
  onClick: () => void
}

export default function Button({
  label, 
  fullWidth = false, 
  size = 'regular', 
  variant = 'outline', 
  disabled = false, 
  onClick
}: IButton) {

  const variantClasses = {
    'primary': 'interactive-01 text-white',
    'outline': 'surface-01 interactive-stroke-02 border border-solid',
    'ghost': 'interactive-transparent'
  };

  const classes = [
    'font-semibold',
    'rounded-s',
    fullWidth ? 'w-full' : '',
    size === 'compact' ? 'label-xs py-2 px-3' : 'label-xl py-2 px-3',
    disabled ? 'interactive-disabled pointer-events-none' : 'hover:opacity-80',
    variantClasses[variant]
  ];

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      class={classes.filter(Boolean).join(' ')}
    >
      {label}
    </button>
  )
}