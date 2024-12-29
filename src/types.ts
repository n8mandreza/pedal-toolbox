import { EventHandler } from '@create-figma-plugin/utilities'

export interface ResizeWindowHandler extends EventHandler {
    name: 'RESIZE_WINDOW'
    handler: (windowSize: { width: number; height: number }) => void
}

export interface InstanceDetailsProps {
    id: string;
    name: string;
    componentName: string;
    componentId: string;
    componentProperties: any;
    children?: any;
}

export interface InstanceSwapProps {
    instanceId: string;
    newComponentKey: string;
}

export interface FeedbackMessageProps {
    id: string;
    status: 'success' | 'error';
    message: string;
}

export type DeviceOption = {
    name: string
    checked: boolean;
    description: string;
};