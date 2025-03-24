import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../../../app/hooks';
import { CurrentPageState, setCurrentPage } from '../../../main-window/current-page-slice';
import { getEmailsListDataCall } from '../../../../api/w3c/w3c-api';
import { EmailItem } from '../../../../api/w3c/models/email-item';

type UseListEmailsProps = {
    currentPageState: CurrentPageState;
};

export const useListEmails = (props: UseListEmailsProps) => {
    const { currentPageState } = props;
    const [emailsListData, setEmailsListData] = useState<EmailItem[]>([]);    
    const [emailsListDataLoading, setEmailsListDataLoading] = useState(true);
    const dispatch = useAppDispatch();

    const getFiles = async (): Promise<void> => {
        setEmailsListDataLoading(true);
        const emailsListDataResponse = await getEmailsListDataCall();
        setEmailsListData(emailsListDataResponse);
        setEmailsListDataLoading(false);
    };

    // Set the current page
    useEffect(() => {
        dispatch(setCurrentPage(currentPageState));
        void getFiles();
    }, [dispatch]);

    return {
        emailsListData,
        emailsListDataLoading,
    };
};
