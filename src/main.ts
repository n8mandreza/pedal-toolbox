import { on, showUI } from '@create-figma-plugin/utilities'
import { ResizeWindowHandler } from './types';
import { createDate, createNumber, createTime } from './utils/localizerFunctions';
import { handleComponentSetInstances, replaceAllInstances, replaceInstance } from './utils/migratorFunctions';
import { applyImagesToSelectedNodes } from './utils/generatorFunctions'
import { handleLinting, updateNode } from './utils/lintingFunctions';

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

  on('FIND_COMPONENT_INSTANCES', handleComponentSetInstances);
  on('REPLACE_INSTANCE', replaceInstance);
  on('REPLACE_ALL_INSTANCES', replaceAllInstances);

  on('SELECT_AND_CENTER_NODE', async ({ id }) => {
    const node = await figma.getNodeByIdAsync(id);
    // Check if the node is an InstanceNode
    if (node && node.type !== 'PAGE' && node.type !== 'DOCUMENT') {
      figma.currentPage.selection = [node];
      figma.viewport.scrollAndZoomIntoView([node]);
    } else {
      console.error('Node is not valid or does not exist');
    }
  });

  on('FIND_ISSUES', handleLinting);
  on('UPDATE_NODE_PROPERTY', updateNode);
}
