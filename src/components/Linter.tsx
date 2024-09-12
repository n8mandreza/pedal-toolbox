import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import NodeListItem from "./NodeListItem";
import Button from "./buttons/Button";
import SpotIllustration from "./SpotIllustration";
import ProgressIndicator from "./ProgressIndicator";
import { emit, on } from "@create-figma-plugin/utilities";
import SpotMagnifyingGlassLight from "../illustrations/SpotMagnifyingGlassLight";
import SpotMagnifyingGlassDark from "../illustrations/SpotMagnifyingGlassDark";
import Chip from "./Chip";
import HeaderBar from "./HeaderBar";

export default function Linter() {
  const [issues, setIssues] = useState<any[]>([])
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [filter, setFilter] = useState('All');

  // Find issues using lintingFunctions
  function findIssues() {
    setIsScanning(true); // Start scanning
    emit('FIND_ISSUES')
  }

  function handleNodeClick(node: any) {
    setSelectedNode(node);  // Set the selected instance state
    emit('SELECT_AND_CENTER_NODE', { id: node.id });  // Emit an event to center on this node
  }

  function handleClearAndReset() {
    setIssues([])
    setSelectedNode(null)
  }

  // Side effect to set instances when found
  useEffect(() => {
    const unsubscribeInstances = on('ISSUES_FOUND', (issues) => {
      console.log('Received in UI:', issues); // Check received data
      if (Array.isArray(issues)) {
        setIssues(issues);
        console.log(issues)
      } else {
        console.error('Data received is not an array:', issues);
        setIssues([]); // Fallback to setting an empty array
      }
      setIsScanning(false); // End scanning
    });

    return () => {
      unsubscribeInstances();
    };
  }, []);

  // Side effect to update node list if an item is updated
  useEffect(() => {
    const unsubscribe = on('UPDATE_ISSUE_LIST', ({ nodeId, issueType }) => {
      setIssues(currentIssues => currentIssues.filter(issue => issue.node.id !== nodeId && issue.type !== issueType));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const filteredIssues = issues.filter(issue => {
    if (filter === 'All') {
      return true;
    }
    return issue.type === filter;
  });

  return (
    <div class="w-full h-full flex flex-col">
      <HeaderBar title='Linter' />

      {issues.length > 0 ? (
        // Case 2: Issues are present
        <Fragment>
          <div class="flex flex-col gap-3 w-full h-full overflow-scroll p-4">
            <div class="flex gap-3">
                <p class="body-dense text-02 w-full">{issues.length} issues found</p>

              <button class="hover:opacity-80 label-s" onClick={handleClearAndReset}>
                Clear
              </button>
            </div>

            <div class="flex gap-3">
              <Chip label="All" selected={filter === 'All'} onClick={() => setFilter('All')} />
              <Chip label="Type" selected={filter === 'Type'} onClick={() => setFilter('Type')} />
              <Chip label="Fill" selected={filter === 'Fill'} onClick={() => setFilter('Fill')} />
              <Chip label="Stroke" selected={filter === 'Stroke'} onClick={() => setFilter('Stroke')} />
            </div>

            {filteredIssues.map(issue => (
              <NodeListItem 
                node={issue.node} 
                issue={issue.message} 
                property={issue.value ? `Using: ${issue.value}` : null}
                suggestion={issue.suggested ? `Suggested: ${issue.suggested}` : null}
                selected={issue.node.id === selectedNode?.id}
                onClick={() => handleNodeClick(issue.node)}
                // actionLabel={issue.suggested ? 'Update' : null}
                // action={issue.suggested ? () => emit('UPDATE_NODE_PROPERTY', {
                //   nodeId: issue.node.id, 
                //   issueType: issue.type, 
                //   update: issue.suggested
                // }) : undefined}
              />
            ))}
          </div>
          {/* <div class="flex flex-col p-4 gap-3 surface-sticky border-t border-solid stroke-01">
            <Button label="Migrate" fullWidth onClick={} variant="primary" />
          </div> */}
        </Fragment>
      ) : (
        // Case 1: No instances and no feedback
        <div class="w-full h-full p-4">
          <div class="flex flex-col w-full h-full items-center justify-center screen-02 rounded-m gap-4 p-4">
            {isScanning ? (
              <ProgressIndicator />
            ) : (
              <Fragment>
                <SpotIllustration
                  communicationType="decorative"
                  lightSpotIllustration={<SpotMagnifyingGlassLight />}
                  darkSpotIllustration={<SpotMagnifyingGlassDark />}
                />
                <p class="text-center body-dense">Select frames to scan them for issues. If nothing is selected, the current page will be scanned.</p>
                <p class="text-center body-dense">Large pages may take longer to scan.</p>
                <Button
                  label="Run linter"
                  onClick={findIssues}
                />
              </Fragment>
            )}
          </div>
        </div>
      )}
    </div>
  )
}