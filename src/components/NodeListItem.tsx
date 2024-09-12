import { emit } from "@create-figma-plugin/utilities";
import { Diamond, Type, Frame, BoxSelect, Minus, Tangent, Component } from "lucide-preact";
import { h } from "preact";

interface INodeListItem {
  node: ComponentNode | FrameNode | GroupNode | InstanceNode | LineNode | TextNode | VectorNode;
  property?: string | boolean | null;
  suggestion?: string | boolean | null;
  issue?: string | null;
  selected?: boolean;
  actionLabel?: string | null;
  onClick: () => void;
  action?: () => void;
}

export default function NodeListItem({
  node, 
  property = null, 
  suggestion = null,
  issue = null, 
  selected = false, 
  actionLabel = null,
  onClick,
  action
}: INodeListItem) {

  function getNodeIcon(node: ComponentNode | FrameNode | GroupNode | InstanceNode | LineNode | TextNode | VectorNode) {
    switch (node.type) {
      case 'COMPONENT':
        return <Component size={20} strokeWidth={1.25} />;
      case 'INSTANCE':
        return <Diamond size={20} strokeWidth={1.25} />;
      case 'TEXT':
        return <Type size={20} strokeWidth={1.25} />;
      case 'GROUP':
        return <BoxSelect size={20} strokeWidth={1.25} />
      case 'VECTOR':
        return <Tangent size={20} strokeWidth={1.25} />
      case 'LINE':
        return <Minus size={20} strokeWidth={1.25} />
      case 'FRAME':
        return <Frame size={20} strokeWidth={1.25} />
      default:
        return <Frame size={20} strokeWidth={1.25} />; // Default case if no specific icon is needed
    }
  }

  const classes = [
    'flex items-start gap-3 surface-01 border border-solid rounded-m p-4 cursor-pointer',
    selected ? 'stroke-02 hover:stroke-02' : 'stroke-01 hover:interactive-stroke-02'
  ];

  return (
    <div key={node.id} class={classes.filter(Boolean).join(' ')} onClick={onClick}>
      {getNodeIcon(node)}
      
      <div class="flex flex-col gap-1 w-full cursor-pointer">
        <p class="w-full label-m">{node.name}</p>

        {issue ? (
          <p class="body-dense w-full">
            {issue}
          </p>
        ) : null}

        {property ? (
          <p class="body-dense text-02 w-full">
            {property}
          </p>
        ) : null }

        {suggestion ? (
          <p class="body-dense text-02 w-full">
            {suggestion}
          </p>
        ) : null}
      </div>

      {action && actionLabel && (
        <button
          class="hover:opacity-80 px-3 py-2 rounded-s surface-02 label-s"
          onClick={(e) => {
            e.stopPropagation(); // Prevent onClick of the parent div
            action();
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}