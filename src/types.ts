export interface ATSettings {
    rowHeight: number;
    rowCount: number;
    alwaysShowToolbar: boolean;
    mappedIcons: CommandIconPair[];
    debugging: boolean;
}

export const DEFAULT_SETTINGS: ATSettings = {
    rowHeight: 48,
    rowCount: 2,
    alwaysShowToolbar: false,
    mappedIcons: [],
    debugging: false,
}

export interface CommandIconPair{
    iconID: string,
    commandID: string,
}