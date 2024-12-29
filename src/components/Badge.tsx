import { h } from 'preact'

interface BadgeProps {
  label: string
  communicationType?: 'neutral' | 'info'
}

export default function Badge({ label, communicationType = 'info' }: BadgeProps) {
  const communicationTypeClasses = {
    'neutral': 'surface-03 text-01',
    'info': 'surface-info text-info'
  };

  const classes = [
    'flex gap-1 px-2 py-1 rounded-xs',
    communicationTypeClasses[communicationType]
  ];

  return (
    <div class={classes.filter(Boolean).join(' ')}>
      <p class='caption'>{label}</p>
    </div>
  )
}