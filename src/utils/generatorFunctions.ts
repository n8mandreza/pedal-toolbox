import { HeartIcon } from 'lucide-preact';
import vehicleImagesJson from './vehicleImages.json'
import { DeviceOption } from '../types';
const vehicleImages: { [key: string]: string } = vehicleImagesJson;

async function fetchImageAsUint8Array(imageUrl: string) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const blob = await response.blob();
    console.log(`Blob size for ${imageUrl}:`, blob.size); // Should be > 0, indicates non-empty response
    
    const arrayBuffer = await blob.arrayBuffer();
    console.log(`ArrayBuffer byte length for ${imageUrl}:`, arrayBuffer.byteLength); // Should be > 0
    
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error(`Failed to fetch or convert image from ${imageUrl}`, error);
    throw error;  // Re-throw to handle it in the calling function
  }
}

async function loadVehicleImages() {
  const imageNames = [
    'bmwSedan', 'chevroletTruck', 'dodgeChallenger', 'ferrari', 'fordMustang',
    'hondaCivic', 'jeepWrangler', 'mercedesBenzGWagen', 'porsche911', 'teslaModel3', 'teslaModelX'
  ];
  try {
    const imagesData = await Promise.all(
      imageNames.map(name => fetchImageAsUint8Array(vehicleImages[name]))
    );
    return imagesData;
  } catch (error) {
    console.error('Error loading vehicle images:', error);
    throw error;
  }
}

// Replace selected nodes with image fills
function renderImages(imageDataArray: Uint8Array[]) {
  // Create image hashes for all images
  const imageHashes = imageDataArray.map(data => figma.createImage(data).hash);

  // Get currently selected nodes
  const selection = figma.currentPage.selection;

  if (selection.length > 0) {
    // Loop through each selected node and assign an image fill from imageHashes
    selection.forEach((node, index) => {
      if ("fills" in node) {
        // Calculate the index for the imageHashes array, looping if necessary
        const imageIndex = index % imageHashes.length;
        const imageHash = imageHashes[imageIndex];

        // Set the fill to the corresponding image
        node.fills = [
          { type: "IMAGE", scaleMode: "FILL", imageHash },
        ];
      }
    });
  } else {
    // If no nodes are selected, notify the user to select a layer
    figma.notify("Please select a layer to generate a fill");
  }
}

// Try renderImages or show an error
export async function applyImagesToSelectedNodes() {
  try {
    const imageDataArray = await loadVehicleImages();
    renderImages(imageDataArray);
  } catch (error) {
    console.error('Failed to load images:', error);
    figma.notify('Failed to load images');
  }
}

// Devices grouped by size (screen resolution)
type DeviceSize = {
  name: string;
  width: number;
  height: number;
};

const sizes: DeviceSize[] = [
  { name: 'size414x896', width: 414, height: 896 },
  { name: 'size375x812', width: 375, height: 812 },
  { name: 'size375x667', width: 375, height: 667 },
  { name: 'size390x844', width: 390, height: 844 },
  { name: 'size428x926', width: 428, height: 926 },
  { name: 'size393x852', width: 393, height: 852 },
  { name: 'size430x932', width: 430, height: 932 },
  { name: 'size402x874', width: 402, height: 874 },
  { name: 'size440x956', width: 440, height: 956 },
]

// Clones a frame with the specified width & height
function generateNewDevice(
  parent: FrameNode | ComponentNode | InstanceNode,
  startX: number,
  y: number,
  width: number,
  height: number,
  deviceName: string
): number {
  // Clone the original frame
  const clonedFrame = parent.clone();

  // Set the new position
  clonedFrame.x = startX;
  clonedFrame.y = y;

  // Set new dimensions
  clonedFrame.resize(width, height);

  // Rename the frame
  clonedFrame.name = deviceName;

  // Ensure the new frame is appended to the same parent
  if (parent.parent) {
    parent.parent.appendChild(clonedFrame);
  } else {
    figma.currentPage.appendChild(clonedFrame);
  }

  figma.notify("Frame duplicated successfully!");

  // Return the right edge of the new frame
  return clonedFrame.x + clonedFrame.width + 80;
}

export function generateDevices(devices: DeviceOption[]) {
  const selection = figma.currentPage.selection;

  if (selection.length === 1 && selection[0].type === 'FRAME') {
    const sourceFrame = selection[0] as FrameNode;
    let currentXPosition = sourceFrame.x + sourceFrame.width + 80;

    devices.forEach(device => {
      if (device.checked) {
        const size = sizes.find((s) => s.name === device.name);

        if (size) {
          currentXPosition = generateNewDevice(
            sourceFrame,
            currentXPosition,
            sourceFrame.y,
            size.width,
            size.height,
            device.description
          );
        } else {
          figma.notify(`Size for ${device.name} not found`, { error: true });
        }
      }
    });
  } else {
    figma.notify("Please select a single frame to duplicate.", { error: true });
  }
}