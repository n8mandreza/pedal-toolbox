import { render, useWindowResize } from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { ResizeWindowHandler } from './types'
import { h } from 'preact'
import '!./output.css'
import { useState } from 'preact/hooks'
import TabItem from './components/TabItem'
import CurrencyLocalizer from './components/localizers/CurrencyLocalizer'
import DateLocalizer from './components/localizers/DateLocalizer'
import NumberLocalizer from './components/localizers/NumberLocalizer'
import TimeLocalizer from './components/localizers/TimeLocalizer'
import ImageMigrator from './components/migrators/ImageMigrator'
import AlertMigrator from './components/migrators/AlertMigrator'
import Linter from './components/Linter'
import AlertBannerMigrator from './components/migrators/AlertBannerMigrator'
import DeviceGenerator from './components/generators/DeviceGenerator'

function Plugin () {
  const [currentView, setCurrentView] = useState('linter')
  
  function onWindowResize(windowSize: { width: number; height: number }) {
    emit<ResizeWindowHandler>('RESIZE_WINDOW', windowSize)
  }
  useWindowResize(onWindowResize, {
    maxHeight: 800,
    maxWidth: 800,
    minHeight: 480,
    minWidth: 540,
    resizeBehaviorOnDoubleClick: 'minimize'
  })

  function handleViewChange(view: string) {
    setCurrentView(view);
  }

  function renderView() {
    switch (currentView) {
      // case 'vehicleImageGenerator':
      //   return <VehicleImageGenerator />;
      case 'devices':
        return <DeviceGenerator />;
      case 'currencyLocalizer':
        return <CurrencyLocalizer />;
      case 'dateLocalizer':
        return <DateLocalizer />;
      case 'numberLocalizer':
        return <NumberLocalizer />;
      case 'timeLocalizer':
        return <TimeLocalizer />;
      case 'imageMigrator':
        return <ImageMigrator />;
      case 'alertMigrator':
        return <AlertMigrator />;
      case 'alertBannerMigrator':
        return <AlertBannerMigrator />
      case 'linter':
        return <Linter />;
      default:
        return <Linter />;
    }
  }
  
  return (
    <div class="w-screen h-screen flex body overflow-y-scroll text-base screen-01 text-01">
      <div class="flex flex-col justify-between flex-shrink-0 w-48 px-2 py-2 overflow-scroll border-r border-solid surface-sticky stroke-01 h-screen">
        <div class="flex flex-col gap-2">
          <div class="flex flex-col">
            <TabItem label='Linter' badge='beta' selected={currentView === 'linter'} onClick={() => handleViewChange('linter')} />
          </div>

          <div class="flex flex-col">
            <p class="text-03 label-s py-2 px-1">Generators</p>
            {/* <TabItem label='Vehicles' selected={currentView === 'vehicleImageGenerator'} onClick={() => handleViewChange('vehicleImageGenerator')} /> */}
            <TabItem label='Devices' badge='new' selected={currentView === 'devices'} onClick={() => handleViewChange('devices')} />
          </div>

          <div class="flex flex-col">
            <p class="text-03 label-s py-2 px-1">Localizers</p>
            <TabItem label='Currency' selected={currentView === 'currencyLocalizer'} onClick={() => handleViewChange('currencyLocalizer')} />
            <TabItem label='Date' selected={currentView === 'dateLocalizer'} onClick={() => handleViewChange('dateLocalizer')} />
            <TabItem label='Number' selected={currentView === 'numberLocalizer'} onClick={() => handleViewChange('numberLocalizer')} />
            <TabItem label='Time' selected={currentView === 'timeLocalizer'} onClick={() => handleViewChange('timeLocalizer')} />
          </div>

          <div class="flex flex-col">
            <p class="text-03 label-s py-2 px-1">Migrators</p>
            <TabItem label='AspectRatio → Image' selected={currentView === 'imageMigrator'} onClick={() => handleViewChange('imageMigrator')} />
            <TabItem label='Alert (Web)' selected={currentView === 'alertMigrator'} onClick={() => handleViewChange('alertMigrator')} />
            <TabItem label='AlertBanner (Web)' selected={currentView === 'alertBannerMigrator'} onClick={() => handleViewChange('alertBannerMigrator')} />
          </div>
        </div>
      </div>
      
      <div class="flex-grow h-screen overflow-y-scroll">
        {renderView()}
      </div>
    </div>
  )
}

export default render(Plugin)
