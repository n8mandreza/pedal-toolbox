import { h, Fragment } from "preact"
import { emit, on } from "@create-figma-plugin/utilities"
import Button from "../buttons/Button"
import { useEffect, useState } from "preact/hooks"
import SpotIllustration from "../SpotIllustration";
import SpotSparkleLight from "../../illustrations/SpotSparkleLight";
import SpotSparkleDark from "../../illustrations/SpotSparkleDark";
import SpotThumbsUpSuccess from "../../illustrations/SpotThumbsUpSuccess";
import ProgressIndicator from "../ProgressIndicator";
import { IFeedbackMessage } from "../../types";
import NodeListItem from "../NodeListItem";
import AlertBanner from "../AlertBanner";
import HeaderBar from "../HeaderBar";

// AlertBanner (DEPRECATED): b9244f3b866ef87043235de1ebfeb6032f0de67b
// Alert (DEPRECATED): 32cdde05e0068922c778d61df135dca1d2b93374

export default function AlertBannerMigrator() {
  const [instances, setInstances] = useState<InstanceNode[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<InstanceNode | null>(null);
  const [platform, setPlatform] = useState('Web');
  const [feedback, setFeedback] = useState<IFeedbackMessage[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const platforms = [
    'Apple',
    'Android',
    'Web'
  ]

  function getComponentKey(platform: string, communicationType: string, orientation: string, size: string) {
    const componentKeys: any = {
      'Web': {
        'Info': {
          'Vertical': {
            'Regular': '5d3c73ab419f1fdc6a7c96a5fafb57a55ff39de9',
            'Compact': 'a2592aeb07daed4974e63faa043dadfdd284e00e'
          },
          'Horizontal': {
            'Regular': '8145a2bdb75f89636ea5813bdcf0c1c2e9ffa10c',
            'Compact': '9f290e91e2fdff36122a273bd497835cde313e61'
          }
        },
        'Recommendation': {
          'Vertical': {
            'Regular': '3a1752674ae0e5638853e1e8a873df6801c14d8c',
            'Compact': '518dcd1fefa241a8bea5b0769749ddd36c8b6646'
          },
          'Horizontal': {
            'Regular': 'f06878cd535aa1fa5f3d96d4b2d15cbec385e03b',
            'Compact': '7a673748cc31a76ddc17d3b91bbb3a4786d143c0'
          }
        },
        'Success': {
          'Vertical': {
            'Regular': '8552e52643609439cd7721b98d5d6fdb1b6c382f',
            'Compact': 'bd3b821998237d78aec32689455179c61c5e2fde'
          },
          'Horizontal': {
            'Regular': 'e4226b7aa7a0ab33a18a033c59c04aaf8f961be5',
            'Compact': '28cda02b3e60dd842f1c229885616f12e2b625c3'
          }
        },
        'Caution': {
          'Vertical': {
            'Regular': 'cdbfc8392a0c14513dbfd587424614b8811ad4cd',
            'Compact': '3917a3f3793fa758a28b7a55c807f58e5ddb33f8'
          },
          'Horizontal': {
            'Regular': 'a31d0e45d16118f21909988bc00f6cdee4b3262f',
            'Compact': '5f380bd874012df95e14f5fe4f767f8fdec39944'
          }
        },
        'Critical': {
          'Vertical': {
            'Regular': 'e716cceabeeb036197ad89eb130d82b781d01c8c',
            'Compact': 'e30263abf29601ea25abdb5bb684e1f9e5d26c30'
          },
          'Horizontal': {
            'Regular': 'ba3b70709b79602971e764a2985aee4a605245a0',
            'Compact': '8d098c8a27ff07a03a608ce5545e0eb9bfd6e97c'
          }
        },
      }
    };
    return (componentKeys[platform] && componentKeys[platform][communicationType]) ? componentKeys[platform][communicationType][orientation][size] : 'default-component-key';
  }

  // Find instances of all variants of AlertBanner
  function findAlertInstances() {
    setIsScanning(true); // Start scanning
    emit('FIND_COMPONENT_INSTANCES', 'b9244f3b866ef87043235de1ebfeb6032f0de67b')
  }

  function replaceAlertInstances(instances: InstanceNode[]) {
    console.log('Current instances at migration:', instances);
    if (Array.isArray(instances) && instances.length > 0) {
      const replacements = instances.map(instance => {
        const communicationType: any = instance.componentProperties['Communication type'] ? instance.componentProperties['Communication type'].value : 'Info';
        const orientation: any = instance.componentProperties['Orientation'] ? instance.componentProperties['Orientation'].value : 'Vertical';
        const size: any = instance.componentProperties['Density'] ? instance.componentProperties['Density'].value : 'Regular';

        return {
          instanceId: instance.id,
          newComponentKey: getComponentKey(platform, communicationType, orientation, size)
        };
      });

      emit('REPLACE_ALL_INSTANCES', { replacements });
    } else {
      console.error('Attempted to migrate with invalid data:', instances);
    }
  }

  function replaceInstance(instance: InstanceNode) {
    const communicationType: any = instance.componentProperties['Communication type'] ? instance.componentProperties['Communication type'].value : 'Info';
    const orientation: any = instance.componentProperties['Orientation'] ? instance.componentProperties['Orientation'].value : 'Vertical';
    const size: any = instance.componentProperties['Density'] ? instance.componentProperties['Density'].value : 'Regular';

    const instanceId = instance.id
    const newComponentKey = getComponentKey(platform, communicationType, orientation, size)

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
      <HeaderBar title='Migrate to new Web PDL-AlertBanner components' />

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
            <Button label="Migrate all" fullWidth onClick={() => replaceAlertInstances(instances)} variant="primary" />
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
                <p class="text-center body-dense">Select frames to scan them for deprecated AlertBanner instances. If nothing is selected, the current page will be scanned.</p>
                <p class="text-center body-dense">Large pages may take longer to scan.</p>
                <Button
                  label="Scan for instances"
                    onClick={findAlertInstances}
                />
              </Fragment>
            )}
          </div>
        </div>
      )}
    </div>
  )
}