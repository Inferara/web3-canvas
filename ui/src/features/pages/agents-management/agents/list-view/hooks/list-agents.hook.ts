import { useEffect, useState } from 'react';
import { getAgentListDataCall, agentEnabledCall, agentDisableCall } from '../../../../../../api/w3c/w3c-api'; 
import { useAppDispatch } from '../../../../../../app/hooks';
import { CurrentPageState, setCurrentPage } from '../../../../../main-window/current-page-slice';
import { AgentItem } from '../../../../../../api/w3c/models/agent';

type UseListAgentsProps = {
    currentPageState: CurrentPageState;
};

export const useListAgents = (props: UseListAgentsProps) => {
    const { currentPageState } = props;
    const [agentListData, setAgentListData] = useState<AgentItem[]>([]);
    const dispatch = useAppDispatch();

    const getAgentListData = async (): Promise<void> => {
        const agentListDataResponse = await getAgentListDataCall();
        setAgentListData(agentListDataResponse);
    };

    const agentEnabledChange = async (agentId: number, isEnabled: boolean): Promise<void> => {        
        if (isEnabled){
            await agentEnabledCall(agentId);
        } 
        else {
            await agentDisableCall(agentId);
        }
    }
      // Set the current page
    useEffect(() => {
        dispatch(setCurrentPage(currentPageState));
        void getAgentListData();
    }, [dispatch]);

    return {
        agentListData,
        agentEnabledChange,
    };
};
