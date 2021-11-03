import { Children, createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from "../services/api";



interface TransactionsTableProps {
    id: number;
    vehicle: string;
    amount: number;
    type: string;
    createdAt: string;
    plate: string,
    observation: string,
    scheduleDate: Date,
    coupon: string,
    payment: 'card' | 'cash',
    vehicleType: 'Carro' | 'Moto' | 'Caminhão' | 'Outros',

}


type TransactionInput = Omit<TransactionsTableProps, "id" | 'createdAt'>;


interface TransactionsProviderProps {
    children: ReactNode;
}

interface TransactionsContextData {
    transactions: TransactionsTableProps[];
    createTransaction: (transaction: TransactionInput) => Promise<void>;
}

const TransactionsContext = createContext<TransactionsContextData>(
    {} as TransactionsContextData
);

export function TransactionsProvider({ children }: TransactionsProviderProps) {
    const [transactions, setTransactions] = useState<TransactionsTableProps[]>([]);
    useEffect(() => {
        api.get("transactions")
            .then(response => setTransactions(response.data.transactions));
    }, []);

    async function createTransaction(transactionInput: TransactionInput) {

        const response = await api.post('/transactions', {...transactionInput, createdAt: new Date().toISOString()});
        const transct : TransactionsTableProps = response.data.transaction;

        setTransactions([
            ...transactions,
            transct
        ]);
    }

    return (
        <TransactionsContext.Provider value={{ transactions, createTransaction }}>
            {children}
        </TransactionsContext.Provider>
    );
}

export function useTransactions() {
    const context = useContext(TransactionsContext);

    return context;
}