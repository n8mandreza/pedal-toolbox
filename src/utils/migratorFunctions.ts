import { emit } from "@create-figma-plugin/utilities";

// Find component set instances and collect detailed information
export async function findComponentSetInstances(componentSetKey: string): Promise<any[]> {
  const instances: any[] = [];

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
            componentProperties: node.componentProperties
          });
        }
      } catch (error) {
        console.error("Failed to get main component:", error);
      }
    }
  }

  const selection = figma.currentPage.selection;
  if (selection.length > 0) {
    await Promise.all(selection.map(node => traverse(node)));
  } else {
    await traverse(figma.currentPage);
  }

  return instances;
}

// Find and send AspectRatio instances
export async function handleAspectRatioInstances(componentSetKey: string) {
  const instances = await findComponentSetInstances(componentSetKey);
  console.log('Emitting instances:', instances);

  if (Array.isArray(instances)) {
    emit('INSTANCES_FOUND', instances);
  } else {
    console.error('No instances found or the returned data is not an array:', instances);
    emit('INSTANCES_FOUND', []); // Fallback to emitting an empty array
  }
}

// Replace found instances with new component
export async function replaceAllInstances({ replacements }: any) {
  const promises = replacements.map(async ({ instanceId, newComponentKey }: {instanceId: string, newComponentKey: string}) => {
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