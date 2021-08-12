export interface ATSettings {
    rowHeight: number;
    rowCount: number;
    alwaysShowToolbar: boolean;
    mappedIcons: CommandIconPair[];
    debugging: boolean;
    allowStylingOfAllActions: boolean;
    tooltips: boolean;
}

export const DEFAULT_SETTINGS: ATSettings = {
    rowHeight: 48,
    rowCount: 2,
    alwaysShowToolbar: false,
    mappedIcons: [],
    debugging: false,
    allowStylingOfAllActions: false,
    tooltips: false,
}

export interface CommandIconPair{
    iconID: string,
    commandID: string,
}