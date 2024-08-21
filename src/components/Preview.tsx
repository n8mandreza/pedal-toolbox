import { h } from "preact";

interface PreviewProps {
  value: string
}

export default function Preview({value}: PreviewProps) {
  return (
    <div class="relative rounded-m flex flex-col gap-2 px-4 py-6 items-center justify-center surface-02">
      <p class="caption text-02 absolute top-2 left-3">Preview</p>
      <p class="text-base text-center">{value}</p>
    </div>
  )
}