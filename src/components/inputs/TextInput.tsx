import { JSX, h } from "preact";

interface ITextInput {
  id: string;
  type: 'text' | 'number';
  label: string;
  defaultValue?: string;
  placeholder?: string;
  showLabel?: boolean;
  onChange: (event: JSX.TargetedEvent<HTMLInputElement, Event>) => void;
}

export default function TextInput({ id, type, label, defaultValue, placeholder, showLabel = true, onChange }: ITextInput) {
  return (
    <div class="flex flex-col gap-1 w-full">
      <label for={id} class={`label-s ${showLabel ? '' : 'hidden'}`}>
        {label}
      </label>

      <input
        type={type}
        id={id}
        name={id}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={onChange}
        class="px-3 py-2 text-base rounded-s surface-02 placeholder:text-02"
      />
    </div>
  );
}