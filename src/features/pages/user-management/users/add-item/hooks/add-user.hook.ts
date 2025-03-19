import { useEffect } from 'react';
import { createUserCall } from '../../../../../../api/w3c/w3c-api';
import { useAppDispatch } from '../../../../../../app/hooks';
import { CurrentPageState, setCurrentPage } from '../../../../../main-window/current-page-slice';
import { CreateUserItem } from '../../../../../../api/w3c/models/user';

type UseAddUserProps = {
    currentPageState: CurrentPageState;
};

export const useAddUser = (props: UseAddUserProps) => {
    const { currentPageState } = props;
    const dispatch = useAppDispatch();

    const createUser = async (createUserItem: CreateUserItem): Promise<boolean> => {
        const response = await createUserCall(createUserItem);
        return response;
    };

    // Set the current page
    useEffect(() => {
        dispatch(setCurrentPage(currentPageState));
    }, [dispatch]);

    return {
        createUser
    };
};
