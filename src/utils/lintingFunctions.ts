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
  suggested?: string | undefined
}

// Generic function for creating an error object to pass to the app.
export function createErrorObject({ node, type, message, value, suggested }: IErrorObject) {
  return {
    node: {
      id: node.id,
      name: node.name,
      type: node.type
    },
    type: type,
    message: message,
    value: value || "",
    suggested: suggested || ""
  };
}

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (x: number): string => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toLowerCase();
};

function isAllowedNodeType(node: PageNode | SceneNode): node is ComponentNode | FrameNode | GroupNode | InstanceNode | LineNode | TextNode | VectorNode {
  return ['COMPONENT', 'FRAME', 'GROUP', 'INSTANCE', 'LINE', 'TEXT', 'VECTOR'].includes(node.type)
}

function getSuggestedVariable(nodeType: string, colorHex: string): string | undefined {
  if (nodeType === 'TEXT') {
    if (colorHex === '#231f20' || colorHex === '#121214' || colorHex === '#000000') {
      return 'text_01';  // Suggest text_01 for standard text colors
    } else if (colorHex === '#59595b') {
      return 'text_02'
    } else if (colorHex === '#767677') {
      return 'text_04'
    } else if (colorHex === '#593cfb') {
      return 'interactive_text';
    } 
  }
  return undefined;  // Return undefined if no suggestions match
}

// Define a mapping from suggestion strings to Figma variable IDs or other properties
interface IVariableSuggestionMap {
  [key: string]: string;
}

const suggestionToVariableKey: IVariableSuggestionMap = {
  'text_01': '2ec1aa98cd38553ce2f64c5b787e9a0ead9d5bd9',  // VariableId:2ec1aa98cd38553ce2f64c5b787e9a0ead9d5bd9/134:765
  'text_02': 'f3224d037f3a58ebbe4b87534454c54ba9ee18be',
  'text_04': '894848e7a87968547692491d8aeed0bddd2e0a54',
  'interactive_text': '3baed139d69459a2c081bcdba0ab1fc59c988baf',
  'stroke_01': '744f49c6519b8ba20e1829c3e36df92bb4877720'
};

export async function updateNode({ nodeId, issueType, suggestion }: { nodeId: string, issueType: string, suggestion: string }) {
  const node = await figma.getNodeByIdAsync(nodeId) // as TextNode;

  if (node) {
    if (suggestionToVariableKey[suggestion]) {
      try {
        // Check if node supports fills
        if ("fills" in node) {
          // Fetch the variable from the team library
          const variable = await figma.variables.importVariableByKeyAsync(suggestionToVariableKey[suggestion]);

          if (variable) {
            // Apply the style to the node's fills
            node.fills = [figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', variable)];
            emit('UPDATE_ISSUE_LIST', { nodeId: nodeId, issueType: issueType });  // Emit an event to update the UI state
            figma.notify('Layer successfully updated')
          } else {
            console.error("Variable not found");
            figma.notify('Variable not found', { error: true })
          }
        } else {
          console.error("Node type does not support fills");
          figma.notify('Node type does not support fills', { error: true })
        }
      } catch (error) {
        console.error('Error applying suggestion:', error);
        figma.notify('Failed to apply suggested changes', {error: true})
      }
    } else {
      console.error('Suggestion not recognized');
      figma.notify('Suggestion not found', { error: true });
    }
  } else {
    console.error('Could not find node');
    figma.notify('Could not find node', {error: true});
  }
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

// Traverse all nodes once
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
              const suggestion = getSuggestedVariable(node.type, colorHex)
              errors.push(createErrorObject({
                node: node,
                type: 'Fill',
                message: 'Missing fill token',
                value: colorHex,
                suggested: suggestion
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
