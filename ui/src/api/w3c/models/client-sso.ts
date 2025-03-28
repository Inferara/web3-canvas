export class ClientSsoItem {
    clientSsoId: number = 0;
    name: string = '';
    loginType: LoginType = LoginType.MicrosoftSSO;
    settings: Record<string, string> = {};
}

export enum LoginType {
    Password = 'Password',
    MicrosoftSSO = 'SsoMicrosoft',
    GoogleSso = 'SsoGoogle',
}

export class ClientSsoSettingItem {
    parameterId: number = 0; 
    parameterName: string = ''; 
    parameterCode: string = ''; 
    required: boolean = false; 
}

export const ClientSsoSettings = [
    {
        loginType: LoginType.GoogleSso,
        settings: [
            {
                parameterId: 0,
                parameterName: 'Domain',
                parameterCode: 'Domain',
                required: true,
            },
            {
                parameterId: 1,
                parameterName: 'Allowed login for users from this domain group...',
                parameterCode: 'Group',
                required: false,
            }
        ],
    },
];