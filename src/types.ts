export interface ATSettings {
    rowHeight: number;
    rowCount: number;
    alwaysShowToolbar: boolean;
    mappedIcons: CommandIconPair[];
}

export const DEFAULT_SETTINGS: ATSettings = {
    rowHeight: 48,
    rowCount: 2,
    alwaysShowToolbar: false,
    mappedIcons: [],
}

export interface CommandIconPair{
    iconID: string,
    commandID: string,
}