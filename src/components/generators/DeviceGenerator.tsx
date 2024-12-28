import { h, Fragment } from "preact"
import { emit, on } from "@create-figma-plugin/utilities"
import HeaderBar from "../HeaderBar"
import Button from "../buttons/Button"
import { useState } from "preact/hooks"
import { Check } from "lucide-preact"
import { DeviceOption } from "../../types"

interface CheckboxProps {
  label: string;
  value: string;
  checked?: boolean;
  description?: string | null;
  onChange: (event: Event) => void;
}

function Checkbox({label, value, checked = false, description = null, onChange}: CheckboxProps) {
  
  const checkBoxStyles = checked ? 'surface-05' : 'screen-01 interactive-stroke-02 border'
  const checkStyles = checked ? 'opacity-100' : 'opacity-0'

  return (
    <label for={value} className='flex gap-3 items-center hover:cursor-pointer'>
      <div className={`${checkBoxStyles} cursor-inherit transition-colors box-border relative w-5 h-5 rounded-xs flex items-center justify-center p-px`}>
        <input 
          type='checkbox' 
          id={value} 
          name={value} 
          value={value} 
          checked={checked}
          onChange={onChange}
          className='sr-only' 
        />

        <Check className={`transition-opacity icon-02 ${checkStyles}`} strokeWidth={3} />
      </div>
      <div className='flex flex-col gap-1 cursor-inherit'>
        <span className='cursor-inherit'>{label}</span>
        {description ? (
          <span className='text-sm text-02 cursor-inherit'>{description}</span>
        ) : null}
      </div>
    </label>
  )
}

export default function DeviceGenerator() {
  // Store all the device size options to loop over them in the UI
  const deviceSizes = [
    { label: '375 x 667', value: 'size375x667', description: 'iPhone SE (3rd Gen)' },
    { label: '375 x 812', value: 'size375x812', description: 'iPhone 11 Pro | 12 mini | 13 mini' },
    { label: '390 x 844', value: 'size390x844', description: 'iPhone 12 | 12 Pro | 13 | 13 Pro | 14' },
    { label: '393 x 852', value: 'size393x852', description: 'iPhone 14 Pro | 15 | 15 Pro | 16' },
    { label: '402 x 874', value: 'size402x874', description: 'iPhone 16 Pro' },
    { label: '414 x 896', value: 'size414x896', description: 'iPhone XR | 11 | 11 Pro Max' },
    { label: '428 x 926', value: 'size428x926', description: 'iPhone 12 Pro Max | 13 Pro Max | 14 Plus' },
    { label: '430 x 932', value: 'size430x932', description: 'iPhone 14 Pro Max | 15 Plus | 15 Pro Max | 16 Plus' },
    { label: '440 x 956', value: 'size440x956', description: 'iPhone 16 Pro Max' }
  ]

  const [devices, setDevices] = useState<DeviceOption[]>([]);

  // Event handler to manage state when a checkbox is toggled
  function handleCheckboxChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const { name, checked } = target;

    setDevices((prevDevices) => {
      // Check if the device is already in the list
      const index = prevDevices.findIndex(device => device.name === name);
      const updatedDevices = [...prevDevices];

      if (checked) {
        if (index === -1) {
          // Add the device if it is checked and not already in the list
          const deviceSize = deviceSizes.find(device => device.value === name);
          if (deviceSize) {
            updatedDevices.push({
              name: name,
              checked: true,
              description: deviceSize.description,
            });
          }
        } else {
          // Ensure it is marked as checked
          updatedDevices[index].checked = true;
        }
      } else if (index !== -1) {
        // Remove the device from the list if unchecked
        updatedDevices.splice(index, 1);
      }

      return updatedDevices;
    });
  }

  function generateDevices() {
    emit('GENERATE_DEVICES', devices)
  }

  console.log(devices)

  return (
    <div class="w-full h-full flex flex-col">
      <HeaderBar title='Generate device frames' />
      <div className='p-4 flex flex-col gap-4'>
        <p className='text-sm text-02'>Select a frame to generate new frames based on the selected devices</p>

        {deviceSizes.map((deviceSize) => (
          <Checkbox
            label={deviceSize.label}
            value={deviceSize.value}
            checked={!!devices.find(device => device.name === deviceSize.value)}
            description={deviceSize.description}
            onChange={handleCheckboxChange}
          />
        ))}
      </div>

      <div class="w-full h-full flex flex-col gap-3 p-4">
        <Button
          label="Generate frames"
          variant="primary"
          onClick={generateDevices}
        />
      </div>
    </div>
  )
}