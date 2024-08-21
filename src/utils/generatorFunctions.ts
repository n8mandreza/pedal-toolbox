import vehicleImagesJson from './vehicleImages.json'
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
  const selectedNodes = figma.currentPage.selection;

  if (selectedNodes.length > 0) {
    // Loop through each selected node and assign an image fill from imageHashes
    selectedNodes.forEach((node, index) => {
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