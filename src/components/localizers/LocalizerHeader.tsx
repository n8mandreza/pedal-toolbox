import { h } from 'preact'
import IconButton from '../buttons/IconButton'
import { BookOpenText } from 'lucide-preact'

interface ILocalizerHeader {
  title: string
}

export default function LocalizerHeader({ title }: ILocalizerHeader) {
  return (
    <div class="flex flex-col gap-1 pl-4 pr-2 pt-2">
      <div class="flex gap-3 items-center">
        <h1 class="header-xs w-full">{title}</h1>

        <IconButton onClick={() => window.open('https://zeroheight.com/69dd510dd/v/latest/p/456d8b-localization', '_blank')}>
          <BookOpenText size={16} strokeWidth={1.25} />
        </IconButton>
      </div>

      <p class="body-dense text-02">Select a text frame to replace its content with the localized string from the plugin.</p>
    </div>
  )
}