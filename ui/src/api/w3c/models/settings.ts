export class SettingsItem {
    settingId: string = '';
    description: string = '';
    value: string = '';
    dateType: DateType = DateType.String;
    tooltip: string = '';
    state: string = '';
    category: string = '';
}

export enum DateType {
    String = "String",
    Password = "Password",
    Int = "Int",
    Boolean = "Boolean",
    Double = "Double",
    Url = "Url",
    Color = "Color",
    Hidden = "Hidden",
    Link = "Link",
}