import { h } from "preact";
import Button from "./buttons/Button";
import { emit } from "@create-figma-plugin/utilities";

export default function VehicleImageGenerator() {
  function generateVehicles() {
    emit('GENERATE_VEHICLES');
  }
  
  return (
    <div class="w-full h-full flex flex-col gap-4 p-4 items-center justify-center">
      <Button label="Generate vehicle images" fullWidth onClick={generateVehicles}/>
    </div>
  )
}