import { AgentType } from "./agent-type";

export class AgentItem {
    agentId: number = 0;
    isEnabled: boolean = true;
    name: string = '';
    description: string = '';
    llmType?: number;
    type: AgentType = AgentType.ApiCall;
    content: Record<string, ConfigurableSetting> = {};
    tags: TagModel[] = [];
    version: number = 0;
}

export interface ConfigurableSetting {
    name: string;
    code: string;
    value: string;
    extension?: string;
}

export interface TagModel {
    id: number;
    name: string;
}
