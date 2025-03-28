import { LoginType } from "./client-sso";

export class EditUserItem {
    isEnabled: boolean = false;
    fullName: string = '';
    email: string = '';
    role: string = '';
    tokensLimit: number = 0;
}

export class CreateUserItem extends EditUserItem {
    login: string = '';
    password: string = '';
    created: Date = new Date();
    createdBy: string = '';
}

export class UserItem extends CreateUserItem {
    loginId: number = 0;
    loginType: LoginType = LoginType.GoogleSso;
    tokensSpent?: number = 0;
}