import { emit } from '@create-figma-plugin/utilities'
import { JSX, h } from 'preact'
import { useState } from 'preact/hooks'
import Select from '../inputs/Select'
import Button from '../buttons/Button'
import TimeInput from '../inputs/TimeInput'
import Preview from '../Preview'
import LocalizerHeader from './LocalizerHeader'

export default function TimeLocalizer () {
  const [time, setTime] = useState<Date>(new Date('1970-01-01T10:00:00Z'))
  const [locale, setLocale] = useState<string>('en-US')
  const [timeZone, setTimeZone] = useState<string>('UTC')
  const [timeStyle, setTimeStyle] = useState<Intl.DateTimeFormatOptions['timeStyle']>('short')
  const options: Intl.DateTimeFormatOptions = {
    timeStyle: timeStyle,
    timeZone: timeZone
  }
  const locales = ['en-US', 'en-CA', 'en-GB', 'en-AU', 'fr-FR', 'fr-CA']
  const timeZones = [
    'UTC',
    'Pacific/Honolulu', // HST GMT-10
    'America/Anchorage', // AKST GMT-9
    'America/Los_Angeles', // PST GMT-8
    'America/Denver', // MST GMT-7
    'America/Phoenix', // MST GMT-7
    'America/Chicago', // CST GMT-6
    'America/New_York', // EST GMT-5
    'America/Toronto', // EST GMT-5
    'Europe/London', // GMT GMT-0
    'Europe/Paris', // CET GMT+1
    'Australia/Perth', // AWST GMT+8
    'Australia/Adelaide', // ACST GMT+9:30
    'Australia/Sydney' // AEST GMT+10
  ]
  const timeStyles = ['short', 'medium', 'long', 'full']

  const formattedTime = new Intl.DateTimeFormat(locale, options).format(time);

  function handleTimeChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newTime = event.currentTarget.value // returns as string
    const newTimeAsDate = new Date(`1970-01-01T${newTime}:00Z`) // convert back to Date

    setTime(newTimeAsDate)
  }

  function handleLocaleChange(event: JSX.TargetedEvent<HTMLSelectElement>) {
    const newValue = event.currentTarget.value
    setLocale(newValue);
  }

  function handleTimeZoneChange(event: JSX.TargetedEvent<HTMLSelectElement>) {
    const newValue = event.currentTarget.value
    setTimeZone(newValue);
  }

  function handleTimeStyleChange(event: JSX.TargetedEvent<HTMLSelectElement>) {
    const newValue = event.currentTarget.value as Intl.DateTimeFormatOptions['timeStyle']
    setTimeStyle(newValue);
  }

  function submitTime() {
    emit('CREATE-TIME', formattedTime)
  }

  return (
    <div class="w-full flex flex-col">
      <LocalizerHeader title="Localize times" />

      <div class="p-4 flex flex-col gap-4">
        <Preview value={formattedTime}/>

        <div class="flex gap-3 flex-col">
          <TimeInput value={formattedTime} onChange={handleTimeChange}/>

          <Select label='Time zone' options={timeZones} selection={timeZone} caption="UTC is essentially the same as GMT." onChange={handleTimeZoneChange}/>

          <div class="flex gap-3">
            <Select label='Locale' options={locales} selection={locale} onChange={handleLocaleChange}/>

            <Select label='Time style' options={timeStyles} selection={timeStyle} onChange={handleTimeStyleChange}/>
          </div>

          <div class="mt-2">
            <Button label="Apply" variant='primary' fullWidth onClick={submitTime}/>
          </div>
        </div>
      </div>
    </div>
  )
}
