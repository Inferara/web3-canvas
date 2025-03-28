import RestApi from '../rest-api';
import { environment } from '../../environments/environment';
import { User } from "oidc-client-ts";
import { SettingsItem } from './models/settings';
import { UiSettings } from './models/ui-settings';
import { ClientSsoItem } from './models/client-sso';
import { CreateUserItem, EditUserItem, UserItem } from './models/user';
import { EmailItem } from './models/email-item';

// --- SETTINGS ---
export const rebootCall = async (): Promise<void> => {
    const client = await getRestClient();
    await client.request('api/v1/settings/reboot', 'POST', undefined, true);
};
export const saveSettingsCall = async (settings: SettingsItem[]): Promise<boolean> => {
    const client = await getRestClient();
    const response = await client.request('api/v1/settings', 'POST', settings);
    return response.data as boolean;
};
export const getSettingsListCall = async (): Promise<SettingsItem[]> => {
    const client = await getRestClient();
    const response = await client.request('api/v1/settings', 'GET');
    return response.data as SettingsItem[];
}
export const getSettingsUiListCall = async (): Promise<UiSettings> => {
    const client = await getRestClient();
    const response = await client.request('api/v1/settings/ui', 'GET');
    return response.data as UiSettings;
}

export const getTranscriptCall = async (blob: Blob): Promise<string> => {
    const client = await getRestClient();
    client.setContentType("multipart/form-data")
    const formData = new FormData();
    formData.append('file', blob);
    const response = await client.request('api/v1/copilot/transcript', 'POST', formData);
    return response.data as string;
}

// --- SSO ---
export const getSsoClientsListDataCall = async (): Promise<ClientSsoItem[]> => {
    const client = await getRestClient();
    const response = await client.request('api/v1/sso/clients', 'GET');
    return response.data as ClientSsoItem[];
}
export const getSsoClientByIdCall = async (ssoClientId: number): Promise<ClientSsoItem> => {
    const client = await getRestClient();
    const response = await client.request(`api/v1/sso/clients/${ssoClientId}`, 'GET');
    return response.data as ClientSsoItem;
}
export const removeSsoClientCall = async (ssoClientId: number): Promise<void> => {
    const client = await getRestClient();
    await client.request(`api/v1/sso/clients/${ssoClientId}`, 'DELETE');
}
export const createSsoClientCall = async (ssoClientItem: ClientSsoItem): Promise<boolean> => {
    const client = await getRestClient();
    const response = await client.request('api/v1/sso/clients', 'POST', ssoClientItem);
    return response.data as boolean;
}
export const editSsoClientCall = async (ssoClientItem: ClientSsoItem): Promise<boolean> => {
    const client = await getRestClient();
    const response = await client.request(`api/v1/sso/clients/${ssoClientItem.clientSsoId}`, 'PUT', ssoClientItem);
    return response.data as boolean;
}

// --- USERS ---
export const changePasswordCall = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    const client = await getRestClient();
    const response = await client.request('api/v1/user/changePassword', 'POST', {oldPassword, newPassword});
    return response.data as boolean;
};
export const getUserByIdCall = async (loginId: number): Promise<UserItem | null | undefined> => {
    const client = await getRestClient();
    const response = await client.request(`api/v1/user/${loginId}`, 'GET');
    return response.data as UserItem;
};
export const getUserListDataCall = async (): Promise<UserItem[]> => {
    const client = await getRestClient();
    const response = await client.request('api/v1/user', 'GET');
    return response.data as UserItem[];
};
export const userEnabledCall = async (loginId: number): Promise<void> => {
    const client = await getRestClient();
    await client.request(`api/v1/user/${loginId}/enable`, 'POST');
};
export const userDisableCall = async (loginId: number): Promise<void> => {
    const client = await getRestClient();
    await client.request(`api/v1/user/${loginId}/disable`, 'POST');
};
export const createUserCall = async (createUserItem: CreateUserItem): Promise<boolean> => {
    const client = await getRestClient();
    const response = await client.request('api/v1/user', 'POST', createUserItem);
    return response.data as boolean;
};
export const editUserCall = async (loginId: number, userItem: EditUserItem): Promise<boolean> => {
    const client = await getRestClient();
    const response = await client.request(`api/v1/user/${loginId}`, 'PUT', userItem);
    return response.data as boolean;
}

// --- EMAILS ---
export const getEmailsListDataCall = async (): Promise<EmailItem[]> => {
    const client = await getRestClient();
    const response = await client.request('api/v1/email', 'GET');
    return response.data as EmailItem[];
};

// Rest client
const getRestClient = async (): Promise<RestApi> => {
    const accessToken = getAccessToken()
    const restClient = new RestApi(environment.w3cApiUrl, `Bearer ${accessToken}`);
    return restClient;
};

const getAccessToken = () => {
    const oidcStorage = sessionStorage.getItem(`oidc.user:${environment.w3cApiUrl}/api/v1/connect:${environment.clientId}`)
    if (!oidcStorage) {
        return null;
    }
    return User.fromStorageString(oidcStorage).access_token;
}