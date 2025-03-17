import { useReactFlow } from '@xyflow/react';
import { W3CMessageQueue, W3CQueueMessage, W3CQueueMessageType } from './Queue';

export class NetworkManager {
    private static instance: NetworkManager;
    private static queue: W3CMessageQueue = W3CMessageQueue.getInstance();
    private static logWatchers: any[] = [];
    
    private constructor() { 
        NetworkManager.queue.subscribe(() => NetworkManager.instance.processNext());
    }

    // Retrieve the single instance of NetworkManager
    public static getInstance(): NetworkManager {
        if (!NetworkManager.instance) {
            NetworkManager.instance = new NetworkManager();
        }
        return NetworkManager.instance;
    }

    public processNext() {
        const message: W3CQueueMessage = NetworkManager.queue.peek();
        if (message.type === W3CQueueMessageType.Log) {
            NetworkManager.queue.dequeue();
            NetworkManager.notifyLogWatchers(`[${message.timestamp}] ${message.from} -> ${message.to}: ${message.payload}`);
        }

        if (message.type === W3CQueueMessageType.Node) {
            const { getNode } = useReactFlow();
            const node = getNode(message.to[0]);
            node?.triggerMessage(message.payload);
        }
    }

    private static notifyLogWatchers(message: string) {
        NetworkManager.logWatchers.forEach((watcher) => watcher(message));
    }

    public addLogWatcher(watcher: any) {
        NetworkManager.logWatchers.push(watcher);
    }

}
