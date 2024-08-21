import { h } from "preact"
import Badge from "./Badge"

interface ITabItem {
  label: string
  selected: boolean
  badge?: 'new' | 'beta' | null
  onClick: () => void
}

export default function TabItem({ label, selected, badge = null, onClick }: ITabItem) {
  const classes = [
    'py-2 pl-3 pr-2', 
    'flex gap-1 w-full items-center',
    'rounded-s',
    'cursor-pointer hover:text-01',
    selected ? 'text-01 surface-02' : 'text-02'
  ];

  return (
    <button 
      class={classes.filter(Boolean).join(' ')}
      onClick={onClick}
    >
      <p class="label-s w-full text-start">{label}</p>

      {badge === 'new' ? (
        <Badge label="New" />
      ) : badge === 'beta' ? (
        <Badge label="Beta" communicationType="neutral" />
      ) : null}
    </button>
  )
}