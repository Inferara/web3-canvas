import { useEffect, useState } from 'react';
import { getSettingsListCall, saveSettingsCall, rebootCall } from '../../../../api/w3c/w3c-api'; 
import { useAppDispatch } from '../../../../app/hooks';
import { CurrentPageState, setCurrentPage } from '../../../main-window/current-page-slice';
import { SettingsItem } from '../../../../api/w3c/models/settings';

type UseSettingsProps = {
    currentPageState: CurrentPageState;
};

export const useSettings = (props: UseSettingsProps) => {
    const { currentPageState } = props;
    const dispatch = useAppDispatch();
    const [settingsListData, setSettingsListData] = useState<SettingsItem[]>([]);

    const getSettingsListData = async (): Promise<void> => {
        const settingsListDataResponse = await getSettingsListCall();
        setSettingsListData(settingsListDataResponse);
    };

    const saveSettings = async (settings: SettingsItem[]): Promise<boolean> => {
        const saveSettingsResponse = await saveSettingsCall(settings);
        return saveSettingsResponse;
    };

    const reboot = async (): Promise<void> => {
        await rebootCall();
    };

      // Set the current page
    useEffect(() => {
        dispatch(setCurrentPage(currentPageState));
        void getSettingsListData();
    }, [dispatch]);

    return {
        saveSettings,
        settingsListData,
        setSettingsListData,
        reboot,
    };
};
