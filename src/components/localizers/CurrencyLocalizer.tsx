import { emit } from '@create-figma-plugin/utilities'
import { JSX, h } from 'preact'
import { useState } from 'preact/hooks'
import Select from '../inputs/Select'
import Button from '../buttons/Button'
import Preview from '../Preview'
import LocalizerHeader from './LocalizerHeader'
import TextInput from '../inputs/TextInput'

export default function CurrencyLocalizer () {
  const [number, setNumber] = useState<number>(123456.789)
  const [locale, setLocale] = useState<string>('en-US')
  const [currency, setCurrency] = useState<string>('USD')
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency
  }
  const formattedNumber = new Intl.NumberFormat(locale, options).format(number);

  const locales = ['en-US', 'en-CA', 'en-GB', 'en-AU', 'fr-FR', 'fr-CA']
  const currencies = ['USD', 'CAD', 'GBP', 'EUR', 'AUD']

  function handleNumberChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newNumber = event.currentTarget.valueAsNumber // returns as string

    setNumber(newNumber)
  }

  function handleLocaleChange(event: JSX.TargetedEvent<HTMLSelectElement>) {
    const newValue = event.currentTarget.value

    setLocale(newValue);
  }

  function handleCurrencyChange(event: JSX.TargetedEvent<HTMLSelectElement>) {
    const newCurrency = event.currentTarget.value as Intl.NumberFormatOptions['currency']

    setCurrency(newCurrency || '');
  }

  function submitNumber () {
    emit('CREATE-NUMBER', formattedNumber)
  }

  return (
    <div class="flex flex-col w-full">
      <LocalizerHeader title="Localize currencies"/>

      <div class="p-4 flex flex-col gap-4">
        <Preview value={formattedNumber}/>

        <div class="flex gap-3 flex-col">
          <TextInput id="currency" label="Number" type="number" defaultValue={number.toString()} onChange={handleNumberChange}/>

          <div class="flex gap-3">
            <Select label='Locale' options={locales} selection={locale} onChange={handleLocaleChange}/>

            <Select label='Currency' options={currencies} selection={currency} onChange={handleCurrencyChange}/>
          </div>

          <div class="mt-2">
            <Button label="Apply" variant='primary' fullWidth onClick={submitNumber}/>
          </div>
        </div>
      </div>
    </div>
  )
}
