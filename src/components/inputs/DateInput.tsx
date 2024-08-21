import { JSX, h } from 'preact'

interface DateInputProps {
  today: Date
  onChange: (event: JSX.TargetedEvent<HTMLInputElement, Event>) => void
}

export default function DateInput({today, onChange}: DateInputProps) {
  return (
    <div class="flex flex-col gap-1">
      <label for="date" class="label-s">Date</label>

      <input type="date" id="date" name="date" defaultValue={today.toISOString().split('T')[0]} onChange={onChange} class="px-3 py-2 body rounded-s surface-02"/>
    </div>
  )
}