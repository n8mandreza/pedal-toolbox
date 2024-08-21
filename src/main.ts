import { on, showUI } from '@create-figma-plugin/utilities'
import { ResizeWindowHandler } from './types';
import { createDate, createNumber, createTime } from './utils/localizerFunctions';
import { handleAspectRatioInstances, replaceAllInstances } from './utils/migratorFunctions';
import { applyImagesToSelectedNodes } from './utils/generatorFunctions'

export default function () {
  // Set up UI
  showUI({
    height: 480,
    width: 540
  })

  // Listen for resize events
  on<ResizeWindowHandler>(
    'RESIZE_WINDOW',
    function (windowSize: { width: number; height: number }) {
      const { width, height } = windowSize
      figma.ui.resize(width, height)
    }
  )

  on('GENERATE_VEHICLES', applyImagesToSelectedNodes)

  on('CREATE-DATE', createDate)
  on('CREATE-TIME', createTime)
  on('CREATE-NUMBER', createNumber)

  on('FIND_ASPECT_RATIO_INSTANCES', handleAspectRatioInstances);
  on('REPLACE_ALL_INSTANCES', replaceAllInstances);

  on('SELECT_AND_CENTER_INSTANCE', async ({ id }) => {
    const node = await figma.getNodeByIdAsync(id);
    // Check if the node is an InstanceNode
    if (node && node.type === 'INSTANCE') {
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
    } else {
      console.error('Node is not an instance or does not exist');
    }
  });
}
