import { emit } from "@create-figma-plugin/utilities";
import { InstanceSwapProps } from "../types";

// Find instances of the specified component set and collect detailed information
// A component set is a special type of node that contains multiple variants
export async function findComponentSetInstances(componentSetKey: string): Promise<any[]> {
  const instances: any[] = [];

  // Traverse the node tree and collect instances of the specified component set
  async function traverse(node: SceneNode | PageNode) {
    if ("children" in node) {
      // Wait for all children to be processed
      await Promise.all(node.children.map(child => traverse(child)));
    }
    if (node.type === "INSTANCE") {
      try {
        const mainComponent = await node.getMainComponentAsync();
        if (mainComponent && mainComponent.parent &&
          mainComponent.parent.type === "COMPONENT_SET" &&
          mainComponent.parent.key === componentSetKey) {
          instances.push({
            id: node.id,
            name: node.name,
            type: node.type,
            componentProperties: node.componentProperties
          });
        }
      } catch (error) {
        console.error("Failed to get main component:", error);
      }
    }
  }

  // Traverse the selection or the whole page
  const selection = figma.currentPage.selection;
  if (selection.length > 0) {
    await Promise.all(selection.map(node => traverse(node)));
  } else {
    await traverse(figma.currentPage);
  }

  return instances;
}

// Find and send specified component set instances
export async function handleComponentSetInstances(componentSetKey: string) {
  const instances = await findComponentSetInstances(componentSetKey);
  console.log('Emitting instances:', instances);

  if (Array.isArray(instances)) {
    emit('INSTANCES_FOUND', instances);
  } else {
    console.error('No instances found or the returned data is not an array:', instances);
    emit('INSTANCES_FOUND', []); // Fallback to emitting an empty array
  }
}

// Replace single instance with new component
export async function replaceInstance({ instanceId, newComponentKey }: InstanceSwapProps) {
  const instance = await figma.getNodeByIdAsync(instanceId);
  if (instance && instance.type === 'INSTANCE') {
    const newComponent = await figma.importComponentByKeyAsync(newComponentKey);
    if (newComponent) {
      instance.swapComponent(newComponent);
      emit('UPDATE_INSTANCE_LIST', { instanceId });
      figma.notify('Instance successfully updated')
    } else {
      console.error(`Failed to import component with key: ${newComponentKey}.`)
    }
  } else {
    console.error(`Instance not found or is not of type INSTANCE: ${instanceId}.`)
  }
}

// Replace all instances at once with new component
export async function replaceAllInstances({ replacements }: any) {
  const promises = replacements.map(async ({ instanceId, newComponentKey }: InstanceSwapProps) => {
    const instance = await figma.getNodeByIdAsync(instanceId);
    if (instance && instance.type === 'INSTANCE') {
      const newComponent = await figma.importComponentByKeyAsync(newComponentKey);
      if (newComponent) {
        instance.swapComponent(newComponent);
        return { status: 'success', message: `Instance ${instanceId} replaced successfully.` };
      } else {
        return { status: 'error', message: `Failed to import component with key: ${newComponentKey}.` };
      }
    } else {
      return { status: 'error', message: `Instance not found or is not of type INSTANCE: ${instanceId}.` };
    }
  });

  const results = await Promise.all(promises);
  const successCount = results.filter(result => result.status === 'success').length;
  const errorCount = results.length - successCount;

  emit('REPLACEMENT_FEEDBACK', {
    message: `Replaced ${successCount} instances successfully. ${errorCount} replacements failed.`
  });
}