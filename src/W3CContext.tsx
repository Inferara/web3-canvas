import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

type W3CContextType = [string | null, Dispatch<SetStateAction<string | null>>];

const W3CContext = createContext<W3CContextType>([null, () => {}]);

interface W3CProviderProps {
    children: ReactNode;
}

export const W3CProvider: React.FC<W3CProviderProps> = ({ children }) => {
    const [type, setType] = useState<string | null>(null);

    return (
        <W3CContext.Provider value={[type, setType]}>
            {children}
        </W3CContext.Provider>
    );
}

export default W3CContext;

export const useW3C = (): W3CContextType => {
    return useContext(W3CContext);
}