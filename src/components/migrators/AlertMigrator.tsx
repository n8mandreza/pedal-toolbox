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

export default function AlertMigrator() {
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

  function getComponentKey(platform: string, communicationType: string, style: string, size: string) {
    const componentKeys: any = {
      'Web': {
        'Info': {
          'Subtle': {
            'Regular': '62bb7b203a7882f4307d255b290ded7b197b4346',
            'Compact': '6eaa0caaa30512a692569bdb8dc4486a3d211ed4'
          },
          'Emphasis': {
            'Regular': 'b1e3a69488be357c2746187a78d235cfb5727c67',
            'Compact': 'e4da15097617f0ac70f573a2710249cf936f6129'
          }
        },
        'Recommendation': {
          'Subtle': {
            'Regular': '9581e2dd0bb8268e4074fd26018d2412009f18a5',
            'Compact': '4f090fd165627838c7029710e49ef6b4502b5313'
          },
          'Emphasis': {
            'Regular': 'e54df828e6847fd6b963ee5655d97807c9950675',
            'Compact': 'db20f071ce488eaa52290784957eebe6349951a7'
          }
        },
        'Success': {
          'Subtle': {
            'Regular': 'a1c30ab800ba5862220053221579c658dc2cb8a6',
            'Compact': '5ae55c15eacb1a214f0b291b79a0150534e56d4a'
          },
          'Emphasis': {
            'Regular': '034e91eefa9ed063fa85e24c913ff2c202da8789',
            'Compact': '76b762324fe23b878bbbe343fee371d4342ce54b'
          }
        },
        'Caution': {
          'Subtle': {
            'Regular': '8f0f7102ea94adff0ed67eab1402b82433511e07',
            'Compact': '50bc8bdc8a0f7d256ec54025d1c407724b1d2dcb'
          },
          'Emphasis': {
            'Regular': '75f84f5a62c98f8633982e994b845d1925b2fb75',
            'Compact': '850476b109c5309c3affcff7428132535855e398'
          }
        },
        'Critical': {
          'Subtle': {
            'Regular': '34bb01d9848989e187e24af912ecba1d190941a8',
            'Compact': '73e1c732f931eb9f6a852ff7e6778f276b7cd3a7'
          },
          'Emphasis': {
            'Regular': '7f528e313df1852aef0e61f57e29ace672548749',
            'Compact': 'e051cd5a3f673b06f77e3586a077bd3cdc3ae8de'
          }
        },
      }
    };
    return (componentKeys[platform] && componentKeys[platform][communicationType]) ? componentKeys[platform][communicationType][style][size] : '62bb7b203a7882f4307d255b290ded7b197b4346';
  }

  // Find instances of all variants of Alert
  function findAlertInstances() {
    setIsScanning(true); // Start scanning
    emit('FIND_COMPONENT_INSTANCES', '32cdde05e0068922c778d61df135dca1d2b93374')
  }

  function replaceAlertInstances(instances: InstanceNode[]) {
    console.log('Current instances at migration:', instances);
    if (Array.isArray(instances) && instances.length > 0) {
      const replacements = instances.map(instance => {
        const communicationType: any = instance.componentProperties['Communication type'] ? instance.componentProperties['Communication type'].value : 'Info';
        const orientation: any = instance.componentProperties['Orientation'] ? instance.componentProperties['Orientation'].value : 'Subtle';
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
    const style: any = instance.componentProperties['Style'] ? instance.componentProperties['Style'].value : 'Subtle';
    const size: any = instance.componentProperties['Density'] ? instance.componentProperties['Density'].value : 'Regular';

    const instanceId = instance.id
    const newComponentKey = getComponentKey(platform, communicationType, style, size)

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
                <p class="text-center body-dense">Select frames to scan them for deprecated Alert instances. If nothing is selected, the current page will be scanned.</p>
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