import { useEffect } from 'react';
import { createSsoClientCall } from '../../../../../../api/w3c/w3c-api'; 
import { useAppDispatch } from '../../../../../../app/hooks';
import { CurrentPageState, setCurrentPage } from '../../../../../main-window/current-page-slice';
import { ClientSsoItem } from '../../../../../../api/w3c/models/client-sso';

type UseAddSsoClientProps = {
    currentPageState: CurrentPageState;
};

export const useAddSsoClient = (props: UseAddSsoClientProps) => {
    const { currentPageState } = props;
    const dispatch = useAppDispatch();
    
    const createSsoClient = async (ssoClientItem: ClientSsoItem): Promise<boolean> => {
        const createSsoClientResponse = await createSsoClientCall(ssoClientItem);
        return createSsoClientResponse;
    };

      // Set the current page
    useEffect(() => {
        dispatch(setCurrentPage(currentPageState));
    }, [dispatch]);

    return {
        createSsoClient
    };
};
