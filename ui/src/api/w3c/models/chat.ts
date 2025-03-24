import { UploadFile } from "../../../features/components/file-upload";

export class ChatItem {
    sender: string = '';
    text: string = '';
    sources: ChatItemSource[] = [];
    debugMessages?: DebugMessage[] = undefined;
    files?: UploadFile[] = [];
    spentTokens?: Record<string, TokenSpent> = undefined;
    options?: CallOptionsType[] = undefined;
}

export class CallOptionsType {
    type: CallOptionsEnum = CallOptionsEnum.AgentCall;
    name: string = '';
    parameters: Record<string, string> = {};
}

export enum CallOptionsEnum{
    AgentCall = 1,
}

export class TokenSpent {
    request: number = 0;
    response: number = 0;
}

export class DebugMessage {
    dateTime?: Date = undefined;
    details: string = '';
    sender: string = '';
    title: string = '';
}

export class ChatItemSource {
    name: string = '';
    url: string = '';
}

export class ChatMessages {
    messages: ChatItem[] = [];
}