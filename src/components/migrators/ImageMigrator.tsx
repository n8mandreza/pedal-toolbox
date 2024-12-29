import { h, Fragment } from "preact"
import { emit, on } from "@create-figma-plugin/utilities"
import Button from "../buttons/Button"
import { useEffect, useState } from "preact/hooks"
import Select from "../inputs/Select";
import SpotIllustration from "../SpotIllustration";
import SpotSparkleLight from "../../illustrations/SpotSparkleLight";
import SpotSparkleDark from "../../illustrations/SpotSparkleDark";
import SpotThumbsUpSuccess from "../../illustrations/SpotThumbsUpSuccess";
import ProgressIndicator from "../ProgressIndicator";
import NodeListItem from "../NodeListItem";
import HeaderBar from "../HeaderBar";

// Aspect Ratio (ComponentSetNode) key: d5e459bec5a66d106c1350180cb0f8b038defc03
// Aspect Ratio=1:1 key: b1df749ba02102cf0255c9b34c18809cab8cfbde

interface IFeedbackMessage {
  id: string;
  status: 'success' | 'error';
  message: string;
}

export default function ImageMigrator() {
  const [instances, setInstances] = useState<InstanceNode[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<InstanceNode | null>(null);
  const [platform, setPlatform] = useState('Apple');
  const [feedback, setFeedback] = useState <IFeedbackMessage[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const platforms = [
    'Apple',
    'Android',
    'Web'
  ]

  function getComponentKey(platform: string, aspectRatio: string) {
    const componentKeys: any = {
      'Apple': {
        '1:1': '24c736f44badde52c9bcc514d77071b2172a0365',
        '21:9': '3e309fa0c8d10cd3bcb3dd75b9c62944317bc55d',
        '16:9': '7a5ad1c037296fdc2b1ad3bb0f3dce41dd293cf1',
        '3:2': 'f5d86c9aacee494612b93384aaa957d46a21ae16',
        '4:3': '0342fc9458c582baa93a5aeb7053b058efdaaf29',
        '5:4': 'dca754553cb0fd167da6e08d3f39c2497ef93e26',
        '4:5': '5579a2c1bf5735ac07107cb3d43bbe97caa51037',
        '3:4': '352043d69e97f4093a4fc52fd0bab928d46321b8',
        '2:3': 'a7418d7cd3dff1f5dca1e7cbcd85598ef1ebc8af',
        '9:16': '63f864607414d80cec88e87ce6f3c97000c29d4e'
      },
      'Android': {
        '1:1': '186f68935af5d9aa92352b0dfa2715409a3c658c',
        '21:9': 'cf30a669b3e86f0724630d4d28fb917db3e8227f',
        '16:9': '81f13c26655b3e9eccd43095fea3c49d7d7d197a',
        '3:2': '0f647b7e1111e239a43869beee805d805a423f7c',
        '4:3': '9d23965d1b2937f5cae4c89f28b8bb938f09471d',
        '5:4': '1f4001d694c4668b8fdb9a3eb902719d4333364b',
        '4:5': '212780f58dd19a9121b9e7a442cd96dc812b9648',
        '3:4': 'accb547bb164ce63994eeca562190bd11930503b',
        '2:3': '1e3cb29527e8ad88581a96997ceb8c203612f191',
        '9:16': 'c5391c6db27a94010009e98584d4ce08dc221edb'
      },
      'Web': {
        '1:1': '5ea4ec213a65379e4398073d1f959cad5b86ddcb',
        '21:9': 'c1e13b68a68deaac2e6dd98a32775094a0edf6f0',
        '16:9': '89ad5b3baa809c33fe7a07b79b63ab727b4391de',
        '3:2': '76057cdb2f4799b5614223cc7464924f028dc1fb',
        '4:3': '03b49858a9706dd4e2ee3b310d8e2b991b114f0d',
        '5:4': '232cc191fff461109f69b853cb7a0652543ccdca',
        '4:5': 'f1843e5c08654ec4cf202206130dcbae471902f0',
        '3:4': 'a88e0cd70a54a5055bf9f5a45854a991d9302cad',
        '2:3': '0d4cfdcc984bad0955fe3a3c40c0d58d23d5699b',
        '9:16': 'c210bc5d5e12712bdf70f89bf9e05ae1973904f9'
      }
    };
    return (componentKeys[platform] && componentKeys[platform][aspectRatio]) ? componentKeys[platform][aspectRatio] : 'default-component-key';
  }

  // Find instances of all variants of Aspect Ratio
  function findAspectRatioInstances() {
    setIsScanning(true); // Start scanning
    emit('FIND_COMPONENT_INSTANCES', 'd5e459bec5a66d106c1350180cb0f8b038defc03')
  }

  function replaceAspectRatioInstances() {
    console.log('Current instances at migration:', instances);
    if (Array.isArray(instances) && instances.length > 0) {
      const replacements = instances.map(instance => {
        const aspectRatio: any = instance.componentProperties['Aspect Ratio'] ? instance.componentProperties['Aspect Ratio'].value : '1:1';
        return {
          instanceId: instance.id,
          newComponentKey: getComponentKey(platform, aspectRatio)
        };
      });

      emit('REPLACE_ALL_INSTANCES', { replacements });
    } else {
      console.error('Attempted to migrate with invalid data:', instances);
    }
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
      <HeaderBar title='Migrate Aspect Ratio to PDL-Image' />

      {feedback.length > 0 ? (
        // Case 3: Feedback is present
        <div class="w-full h-full flex flex-col gap-3 p-4">
          <div class="flex gap-3">
            <p class="body-dense text-02 w-full">{instances.length} instances found</p>

            <button class="hover:opacity-80 label-s" onClick={() => handleClearAndReset}>
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

                <button class="hover:opacity-80 label-s" onClick={() => handleClearAndReset}>
                Clear
              </button>
            </div>

            {instances.map(instance => (
              <NodeListItem 
                node={instance} 
                property={instance.componentProperties['Aspect Ratio'].value} 
                selected={instance.id === selectedInstance?.id}
                actionLabel={'Update'}
                onClick={() => handleNodeClick(instance)}
              />
            ))}
          </div>
          <div class="flex flex-col p-4 gap-3 surface-sticky border-t border-solid stroke-01">
            <Select 
              label="Platform" 
              options={platforms} 
              selection={platform} 
              onChange={(event) => {
                const target = event.target as HTMLSelectElement
                const newPlatform = target.value;
                setPlatform(newPlatform);
              }}
            />

            <Button 
                label={`Migrate ${instances.length > 1 ? `${instances.length} instances` : `${instances.length} instance`}`}
              fullWidth 
              onClick={replaceAspectRatioInstances} 
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
                <p class="text-center body-dense">Select frames to scan them for Aspect Ratio instances. If nothing is selected, the current page will be scanned.</p>
                <p class="text-center body-dense">Large pages may take longer to scan.</p>
                <Button
                  label="Scan for instances"
                  onClick={findAspectRatioInstances}
                />
              </Fragment>
            )}
          </div>
        </div>
      )}
    </div>
  )
}