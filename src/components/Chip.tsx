import { h } from "preact"

interface IChip {
  label: string
  selected?: boolean
  disabled?: boolean
  onClick: () => void
}

export default function Chip({
  label,
  selected = false,
  disabled = false,
  onClick
}: IChip) {

  const classes = [
    'font-semibold',
    'rounded-s',
    'label-xs py-2 px-3',
    selected ? 'interactive-02 text-inverse interactive-stroke-02-selected border border-solid' : 'surface-01 border border-solid interactive-stroke-02 text-01',
    disabled ? 'interactive-disabled pointer-events-none' : 'hover:opacity-80',
  ];

  return (
    <button
      selected={selected}
      disabled={disabled}
      onClick={onClick}
      class={classes.filter(Boolean).join(' ')}
    >
      {label}
    </button>
  )
}