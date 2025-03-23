

export class W3CMessageQueue {
    private static instance: W3CMessageQueue;
    private queue: any[] = [];
    private listeners: Map<string, any> = new Map();

    // Private constructor for singleton pattern
    private constructor() { }

    // Retrieve the single instance of W3CMessageQueue
    public static getInstance(): W3CMessageQueue {
        if (!W3CMessageQueue.instance) {
            W3CMessageQueue.instance = new W3CMessageQueue();
        }
        return W3CMessageQueue.instance;
    }

    // Add a new item to the queue
    public enqueue(message: W3CQueueMessage): void {
        this.queue.push(message);
        setTimeout(() => {
            this.notify();
        }, message.delay);
    }

    // Remove and return the next item from the queue
    public dequeue(): any {
        return this.queue.shift();
    }

    // Get the next item in the queue without removing it
    public peek(): any {
        return this.queue[0];
    }

    // Get the number of items in the queue
    public size(): number {
        return this.queue.length;
    }

    // Optionally clear the queue
    public clear(): void {
        this.queue = [];
    }

    // Subscribe to updates to the queue
    public subscribe(id: string, listener: any): void {
        this.listeners.set(id, listener);
    }

    // Unsubscribe from updates to the queue
    public unsubscribe(id: string): void {
        this.listeners.delete(id);
    }

    // Notify all listeners of an update to the queue
    private notify(): void {
        this.listeners.forEach((value, _key, _map) => value());
    }

    // Process the next item in the queue
    public processNext(): void {
        const item = this.dequeue();
        if (item) {
            this.notify();
        }
    }

    // Process all items in the queue
    public processAll(): void {
        while (this.size() > 0) {
            this.processNext();
        }
    }

    // Process the next item in the queue after a delay
    public processNextDelayed(delay: number): void {
        setTimeout(() => {
            this.processNext();
        }, delay);
    }
}

export enum W3CQueueMessageType {
    Transaction = "Transaction",
    Message = "Tessage",
    Block = "Block",
    Request = "Request",
    Response = "Response",
    Log = "Log",
    Node = "Node"
}

export type W3CQueueMessage = {
    from: string;
    to: string[];
    payload: any;
    type: W3CQueueMessageType;
    timestamp: string;
    delay: number;
}