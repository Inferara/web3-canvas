// Database.ts
export type Transaction = {
    id: string;
    from: string;
    to: string;
    amount: number;
    timestamp: string;
};

export class W3CDatabase {
    private static instance: W3CDatabase;
    private transactions: Transaction[] = [];
    private intervals: Map<string, NodeJS.Timeout> = new Map();

    // Private constructor for singleton pattern
    private constructor() { }

    // Retrieve the single instance of LedgerDatabase
    public static getInstance(): W3CDatabase {
        if (!W3CDatabase.instance) {
            W3CDatabase.instance = new W3CDatabase();
        }
        return W3CDatabase.instance;
    }

    // Add a new transaction if it doesn't already exist
    public addTransaction(tx: Transaction): void {
        if (!this.transactions.find(t => t.id === tx.id)) {
            this.transactions.push(tx);
        }
    }

    // Get all stored transactions
    public getTransactions(): Transaction[] {
        return this.transactions;
    }

    // Optionally clear the ledger
    public clear(): void {
        this.transactions = [];
    }

    public addInterval(id: string, interval: NodeJS.Timeout): void {
        this.intervals.set(id, interval);
    }

    public getInterval(id: string): NodeJS.Timeout | undefined {
        return this.intervals.get(id);
    }

    public removeInterval(id: string): void {
        const interval = this.intervals.get(id);
        if (interval) {
            clearInterval(interval);
        }
        this.intervals.delete(id);
    }

}
