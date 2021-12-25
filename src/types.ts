export interface ATSettings {
    rowHeight: number;
    rowCount: number;
    spacing: number;
    buttonWidth: number;
    columnLayout: boolean;
    alwaysShowToolbar: boolean;
    mappedIcons: CommandIconPair[];
    debugging: boolean;
    allowStylingOfAllActions: boolean;
    tooltips: boolean;
}

export const DEFAULT_SETTINGS: ATSettings = {
    rowHeight: 48,
    rowCount: 2,
    spacing: 0,
    buttonWidth: 48,
    columnLayout: false,
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