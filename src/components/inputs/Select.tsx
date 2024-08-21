import { JSX, h } from 'preact'
import RightChevron from '../../icons/RightChevron'

interface SelectProps {
  label: string
  hideLabel?: boolean
  options: string[]
  selection: string | undefined
  caption?: string
  onChange: (event: JSX.TargetedEvent<HTMLSelectElement, Event>) => void
}

export default function Select({label, hideLabel = false, options, selection, caption, onChange}: SelectProps) {
  return (
    <div class="flex flex-col w-full gap-1">
      {hideLabel ? (
        null
      ) : (
          <label for={label} class="label-s font-medium">{label}</label>
      )}

      <div class="relative text-base rounded-s surface-02 cursor-pointer">
        <div class="flex gap-3 pointer-events-none px-3 py-2">
          <span class="w-full">{selection}</span>
          <div class="rotate-90">
            <RightChevron/>
          </div>
        </div>

        <select name={label} onChange={onChange} aria-label={label} class="absolute appearance-none opacity-0 h-full w-full bg-transparent px-2 top-0 right-0 left-0 bottom-0 cursor-pointer">
          {options.length > 0 ? (
            options.map((option: string) => (
              options.indexOf(option) === 0 ?
                <option selected>{option}</option> : <option>{option}</option>
            ))
          ) : null}
        </select>
      </div>

      {caption ? <p class="caption text-02">{caption}</p> : null}
    </div>
  )
}