import { useEffect } from 'react';
import { useAppDispatch } from '../../../../app/hooks';
import { CurrentPageState, setCurrentPage } from '../../../main-window/current-page-slice';

type UseMyProfileProps = {
    currentPageState: CurrentPageState;
};

export const useMyProfile = (props: UseMyProfileProps) => {
    const { currentPageState } = props;
    const dispatch = useAppDispatch();

      // Set the current page
    useEffect(() => {
        dispatch(setCurrentPage(currentPageState));
    }, [dispatch]);

    return {
    };
};
