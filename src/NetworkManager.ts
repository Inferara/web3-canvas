import { W3CDatabase } from "./Database";

export type Transaction = {
    id: string;
    from: string;
    to: string;
    amount: number;
    timestamp: string;
};

type Listener = (tx: Transaction) => void;

export class NetworkManager {
    private static instance: NetworkManager;
    private listeners = new Map<string, Listener>();
    // private messageQueue: Transaction[] = [];
    private delay: number = 0 * 2000; // Default network delay in milliseconds
    private db: W3CDatabase = W3CDatabase.getInstance();

    // Private constructor for singleton pattern
    private constructor() { }

    // Retrieve the single instance of NetworkManager
    public static getInstance(): NetworkManager {
        if (!NetworkManager.instance) {
            NetworkManager.instance = new NetworkManager();
        }
        return NetworkManager.instance;
    }

    // Subscribe to receive broadcasted transactions
    public subscribe(id: string, listener: Listener): void {
        this.listeners.set(id, listener);
    }

    // Unsubscribe from transaction broadcasts
    public unsubscribe(id: string): void {
        this.listeners.delete(id);
    }

    // Send a transaction with simulated network delay
    public sendTransaction(tx: Transaction): void {
        setTimeout(() => {
            this.broadcast(tx);
            this.db.addTransaction(tx);
        }, this.delay);
    }

    // Broadcast the transaction to all subscribers
    private broadcast(tx: Transaction): void {
        this.listeners.forEach(listener => listener(tx));
    }

    // Allow updating the simulated network delay
    public setDelay(delay: number): void {
        this.delay = delay;
    }
}
