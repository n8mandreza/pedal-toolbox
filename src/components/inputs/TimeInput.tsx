import { JSX, h } from 'preact'

interface TimeInputProps {
  value: string
  onChange: (event: JSX.TargetedEvent<HTMLInputElement, Event>) => void
}

export default function TimeInput({onChange}: TimeInputProps) {
  return (
    <div class="flex flex-col gap-1">
      <label for="time" class="label-s">Time</label>

      <input type="time" id="time" name="time" defaultValue="10:00" onChange={onChange} class="px-3 py-2 text-base rounded-s surface-02"/>
    </div>
  )
}