import { useEffect, useState } from 'react';
import { getSsoClientsListDataCall, removeSsoClientCall } from '../../../../../../api/w3c/w3c-api'; 
import { useAppDispatch } from '../../../../../../app/hooks';
import { CurrentPageState, setCurrentPage } from '../../../../../main-window/current-page-slice';
import { ClientSsoItem } from '../../../../../../api/w3c/models/client-sso';

type UseListSsoClientsProps = {
    currentPageState: CurrentPageState;
};

export const useListSsoClients = (props: UseListSsoClientsProps) => {
    const { currentPageState } = props;
    const [ssoClientsListData, setSsoClientsListData] = useState<ClientSsoItem[]>([]);
    const dispatch = useAppDispatch();

    const getSsoClientsListData = async (): Promise<void> => {
        const ssoClientsListDataResponse = await getSsoClientsListDataCall();
        setSsoClientsListData(ssoClientsListDataResponse);
    };

    const removeSsoClient = async (ssoClientId: number): Promise<void> => {        
        await removeSsoClientCall(ssoClientId);
        await getSsoClientsListData();
    }
      // Set the current page
    useEffect(() => {
        dispatch(setCurrentPage(currentPageState));
        void getSsoClientsListData();
    }, [dispatch]);

    return {
        ssoClientsListData,
        removeSsoClient,
    };
};
