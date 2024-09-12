// Linting functions
import { emit } from "@create-figma-plugin/utilities"

interface ISimplifiedNode {
  id: string;
  name: string;
  type: string;
}

interface IErrorObject {
  node: ISimplifiedNode
  type: string
  message: string
  value?: string | undefined
  update?: () => void
}

// Generic function for creating an error object to pass to the app.
export function createErrorObject({ node, type, message, value }: IErrorObject) {
  return {
    node: {
      id: node.id,
      name: node.name,
      type: node.type
    },
    type: type,
    message: message,
    value: value || ""
  };
}

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (x: number): string => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

function isAllowedNodeType(node: PageNode | SceneNode): node is ComponentNode | FrameNode | GroupNode | InstanceNode | LineNode | TextNode | VectorNode {
  return ['COMPONENT', 'FRAME', 'GROUP', 'INSTANCE', 'LINE', 'TEXT', 'VECTOR'].includes(node.type)
}

// Components to ignore
async function isIgnoredComponent(node: InstanceNode): Promise<boolean> {
  const ignoredComponents = [
    'a825037de1d179b0b669312d8a2f1c5f14e33eac',
    'b97240f6a0f5a6800774de0f2b9da10367e24fa0',
    'cd1bb2c50bcca112c4ed727763c862c63488f7e4'
  ];

  if (node.getMainComponentAsync) {
    const mainComponent = await node.getMainComponentAsync();
    if (mainComponent) {
      return ignoredComponents.includes(mainComponent.key);
    }
  }
  return false;
}

async function lintAll() {
  const errors: IErrorObject[] = [];
  const traverse = async (node: PageNode | SceneNode) => {
    // Skip if the node isn't visible
    if (node.type !== 'PAGE' && !node.visible) {
      return;
    }
    
    // Ignore specified components
    if (node.type === 'INSTANCE' && await isIgnoredComponent(node)) {
      return; // Skip this node because it's an ignored component
    }

    if (isAllowedNodeType(node)) {
      // Check fills
      if ('fills' in node && Array.isArray(node.fills)) {
        node.fills.forEach(fill => {
          if (fill.type === 'SOLID' && !fill.colorStyleId && fill.visible) {
            const hasNoBoundVariables = !fill.boundVariables || Object.keys(fill.boundVariables).length === 0;
            if (hasNoBoundVariables && fill.color) {
              const colorHex = rgbToHex(fill.color.r, fill.color.g, fill.color.b);
              errors.push(createErrorObject({
                node: node,
                type: 'Fill',
                message: 'Missing fill token',
                value: colorHex
              }));
            }
          }
        });
      }

      // Check strokes
      if ('strokes' in node && Array.isArray(node.strokes)) {
        node.strokes.forEach(stroke => {
          if (stroke.type === 'SOLID' && !stroke.colorStyleId && stroke.visible) {
            const hasNoBoundStrokeVariables = !stroke.boundVariables || Object.keys(stroke.boundVariables).length === 0;
            if (hasNoBoundStrokeVariables) {
              const strokeColorHex = stroke.color ? rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b) : 'Unknown Color';
              errors.push(createErrorObject({
                node: node,
                type: 'Stroke',
                message: 'Missing border token',
                value: strokeColorHex  // Providing the actual stroke color value as hex
              }));
            }
          }
        });
      }

      // Check text styles
      if ('textStyleId' in node && 'fontName' in node && 'fontSize' in node) {
        const missingTypeToken = node.textStyleId === "";
        if (missingTypeToken) {
          if (node.fontName !== figma.mixed) {
            try {
              await figma.loadFontAsync(node.fontName);

              const fontValues = `${node.fontName.family} / ${String(node.fontSize)}px`;
              errors.push(createErrorObject({
                node: node,
                type: 'Type',
                message: 'Missing typography token',
                value: fontValues
              }));
            } catch (error) {
              console.error('Failed to load font:', error);
              errors.push(createErrorObject({
                node: node,
                type: 'Type',
                message: 'Missing typography token',
                value: 'Failed to load font'
              }))
              // Handle the error appropriately, perhaps by logging it or by creating an error object with a default message
            }
          }
        }
      }

      // Check border radius
    }

    // Traverse children
    if ('children' in node) {
      await Promise.all(node.children.map(child => traverse(child)));
    }
  };

  const selection = figma.currentPage.selection;
  if (selection.length > 0) {
    await Promise.all(selection.map(node => traverse(node)));
  } else {
    await traverse(figma.currentPage);
  }

  return errors;
}

// Collect errors and send to app
export async function handleLinting() {
  const issues = await lintAll();
  emit('ISSUES_FOUND', issues);
}
