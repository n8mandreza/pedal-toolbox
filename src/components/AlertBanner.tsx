import { h } from "preact"
import AlertFilled from "../icons/AlertFilled"

interface AlertBannerProps {
  title?: string
  message: string
}

export default function AlertBanner({ title, message }: AlertBannerProps) {
  return (
    <div class="surface-alert flex gap-3 items-center p-4 rounded-m">
      <div class="icon-alert w-6 h-6">
        <AlertFilled />
      </div>

      <div class="flex flex-col gap-1">
        {title ? (
          <h4 class="label-m">{title}</h4>
        ) : null}

        <p class="body-dense">{message}</p>
      </div>
    </div>
  )
}