import { useEffect, useState } from 'react';
import { editSsoClientCall, getSsoClientByIdCall } from '../../../../../../api/w3c/w3c-api'; 
import { useAppDispatch } from '../../../../../../app/hooks';
import { CurrentPageState, setCurrentPage } from '../../../../../main-window/current-page-slice';
import { ClientSsoItem } from '../../../../../../api/w3c/models/client-sso';
import { useSearchParams } from 'react-router-dom';

type UseEditSsoClientProps = {
    currentPageState: CurrentPageState;
};

export const useEditSsoClient = (props: UseEditSsoClientProps) => {
    const { currentPageState } = props;
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const [ssoClient, setSsoClient] = useState<ClientSsoItem | null | undefined>(undefined);
    const ssoClientId = parseInt(searchParams.get('clientSsoId') ?? '');

    const editSsoClient = async (ssoClientItem: ClientSsoItem): Promise<boolean> => {
        const editSsoClientResponse = await editSsoClientCall(ssoClientItem);
        return editSsoClientResponse;
    };

    const getSsoClientById = async (): Promise<void> => {
        if (ssoClientId) {
            const ssoClientResponse = await getSsoClientByIdCall(ssoClientId);
            setSsoClient(ssoClientResponse);
          } else {
            setSsoClient(null);
          }
    };

     // Set the current page
    useEffect(() => {
        dispatch(setCurrentPage(currentPageState));
        void getSsoClientById();
    }, [dispatch]);

    return {
        editSsoClient,
        ssoClient
    };
};
