import { h } from "preact";

interface HeaderBarProps {
  title: string
}

export default function HeaderBar({ title }: HeaderBarProps) {
  return (
    <div class="p-4 w-full flex gap-3 surface-sticky border-b border-solid stroke-01">
      <h1 class="header-xs">
        {title}
      </h1>
    </div>
  )
}