import { h, Fragment } from "preact"
import { emit, on } from "@create-figma-plugin/utilities"
import Button from "../buttons/Button"
import { useEffect, useState } from "preact/hooks"
import SpotIllustration from "../SpotIllustration";
import SpotSparkleLight from "../../illustrations/SpotSparkleLight";
import SpotSparkleDark from "../../illustrations/SpotSparkleDark";
import SpotThumbsUpSuccess from "../../illustrations/SpotThumbsUpSuccess";
import ProgressIndicator from "../ProgressIndicator";
import { FeedbackMessageProps } from "../../types";
import NodeListItem from "../NodeListItem";
import AlertBanner from "../AlertBanner";
import HeaderBar from "../HeaderBar";

export default function ButtonMigrator() {
  const [instances, setInstances] = useState<InstanceNode[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<InstanceNode | null>(null);
  const [platform, setPlatform] = useState('Web');
  const [feedback, setFeedback] = useState<FeedbackMessageProps[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const platforms = [
    'Apple',
    'Android',
    'Web'
  ]

  function getComponentKey(platform: string, buttonType: string,  size: string) {
    const componentKeys: any = {
      'Web': {
        'OutlineButton': {
          'Small': '7eab8a53a112740d128c5d500b825a42752fd2c9',
          'Medium': '',
          'Large': ''
        },
      }
    };
    
    return (
      componentKeys[platform] && componentKeys[platform][buttonType]
    ) ? componentKeys[platform][buttonType][size] : '7eab8a53a112740d128c5d500b825a42752fd2c9';
  }

  // Find instances of all variants of Buttons
  function findButtonInstances() {
    setIsScanning(true); // Start scanning
    emit('FIND_COMPONENT_INSTANCES', '32cdde05e0068922c778d61df135dca1d2b93374')
  }

  function replaceButtonInstances(instances: InstanceNode[]) {
    console.log('Current instances at migration:', instances);
    if (Array.isArray(instances) && instances.length > 0) {
      const replacements = instances.map(instance => {
        const buttonType: any = instance.componentProperties['Communication type'] ? instance.componentProperties['Communication type'].value : 'Info';
        const size: any = instance.componentProperties['Density'] ? instance.componentProperties['Density'].value : 'Regular';

        return {
          instanceId: instance.id,
          newComponentKey: getComponentKey(platform, buttonType, size)
        };
      });

      emit('REPLACE_ALL_INSTANCES', { replacements });
    } else {
      console.error('Attempted to migrate with invalid data:', instances);
    }
  }

  function replaceInstance(instance: InstanceNode) {
    const buttonType: any = instance.componentProperties['Communication type'] ? instance.componentProperties['Communication type'].value : 'Info';
    const style: any = instance.componentProperties['Style'] ? instance.componentProperties['Style'].value : 'Subtle';
    const size: any = instance.componentProperties['Density'] ? instance.componentProperties['Density'].value : 'Regular';

    const instanceId = instance.id
    const newComponentKey = getComponentKey(platform, buttonType, size)

    emit('REPLACE_INSTANCE', { instanceId, newComponentKey });
  }

  function handleNodeClick(instance: InstanceNode) {
    setSelectedInstance(instance);  // Set the selected instance state
    emit('SELECT_AND_CENTER_NODE', { id: instance.id });  // Emit an event to center on this node
  }

  function handleClearAndReset() {
    setSelectedInstance(null)
    setFeedback([])
    setInstances([])
  }

  // Side effect to set instances when found
  useEffect(() => {
    const unsubscribeInstances = on('INSTANCES_FOUND', (foundInstances) => {
      console.log('Received in UI:', foundInstances); // Check received data
      if (Array.isArray(foundInstances)) {
        setInstances(foundInstances);
      } else {
        console.error('Data received is not an array:', foundInstances);
        setInstances([]); // Fallback to setting an empty array
      }
      setIsScanning(false); // End scanning
    });

    return () => {
      unsubscribeInstances();
    };
  }, []);

  // Side effect to listen for individual node updates
  useEffect(() => {
    const unsubscribe = on('UPDATE_INSTANCE_LIST', ({ instanceId }) => {
      setInstances(currentInstances => currentInstances.filter(instance => instance.id !== instanceId));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Side effect to listen for migration feedback
  useEffect(() => {
    const unsubscribeFeedback = on('REPLACEMENT_FEEDBACK', (feedback) => {
      setFeedback(feedback.message);
      setInstances([])
    });

    return () => {
      unsubscribeFeedback();
    };
  }, []);

  return (
    <div class="w-full h-full flex flex-col">
      <HeaderBar title='Migrate to new Web PDL-Alert components' />

      {feedback.length > 0 ? (
        // Case 3: Feedback is present
        <div class="w-full h-full flex flex-col gap-3 p-4">
          <div class="flex gap-3">
            <p class="body-dense text-02 w-full">{instances.length} instances found</p>

            <button class="hover:opacity-80 label-s" onClick={() => handleClearAndReset()}>
              Reset
            </button>
          </div>

          <div class="flex flex-col w-full h-full items-center justify-center screen-02 rounded-m gap-4 p-4">
            <SpotIllustration
              communicationType="success"
              lightSpotIllustration={<SpotThumbsUpSuccess />}
              darkSpotIllustration={<SpotThumbsUpSuccess />}
            />

            <p class="body text-center">{feedback}</p>
          </div>
        </div>
      ) : instances.length > 0 ? (
        // Case 2: Instances are present
        <Fragment>
          <div class="flex flex-col gap-3 w-full h-full overflow-scroll p-4">
            <div class="flex gap-3">
              <p class="body-dense text-02 w-full">{instances.length} instances found</p>

              <button class="hover:opacity-80 label-s" onClick={() => handleClearAndReset()}>
                Clear
              </button>
            </div>

            {instances.map(instance => (
              <NodeListItem
                node={instance}
                property={instance.componentProperties['Communication type'].value}
                selected={instance.id === selectedInstance?.id}
                onClick={() => handleNodeClick(instance)}
                actionLabel='Update'
                action={() => replaceInstance(instance)}
              />
            ))}
          </div>
          <div class="flex flex-col p-4 gap-3 surface-sticky border-t border-solid stroke-01">
            <AlertBanner message="Running the migrator will reset any existing button labels. All other properties will be preserved." />
            <Button 
                label={`Migrate ${instances.length > 1 ? `${instances.length} instances` : `${instances.length} instance`}`}
              fullWidth 
              onClick={() => replaceAlertInstances(instances)} 
              variant="primary" 
            />
          </div>
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
                  lightSpotIllustration={<SpotSparkleLight />}
                  darkSpotIllustration={<SpotSparkleDark />}
                />
                <p class="text-center body-dense">Select frames to scan them for deprecated Alert instances. If nothing is selected, the current page will be scanned.</p>
                <p class="text-center body-dense">Large pages may take longer to scan.</p>
                <Button
                  label="Scan for instances"
                  onClick={findButtonInstances}
                />
              </Fragment>
            )}
          </div>
        </div>
      )}
    </div>
  )
}