import { App, Setting, PluginSettingTab, Platform, Notice, debounce } from "obsidian"
import AdvancedToolbar from "src/main";

export default class ATSettingsTab extends PluginSettingTab {
    plugin: AdvancedToolbar;

    constructor(app: App, plugin: AdvancedToolbar) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Advanced Toolbar Settings' });

        if (Platform.isDesktop) {
            containerEl.createEl('span', { text: "Please Note that this Plugin doesn't affect the Desktop App. It only applies to Obsidian's Mobile App.", cls: "setting-item AT-warning" })
        }

        new Setting(containerEl)
            .setName('Always Show Toolbar')
            .setDesc('Set the Mobile Toolbar to be always visible, even if your on-screen Keyboard disappears.')
            .addToggle(cb => cb
                .setValue(this.plugin.settings.alwaysShowToolbar)
                .onChange(async (value) => {
                    this.plugin.settings.alwaysShowToolbar = value;
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName("Toolbar Row Count")
            .setDesc("Set how many Rows the Mobile Toolbar should have.")
            .addSlider(cb => cb
                .setLimits(1, 5, 1)
                .setValue(this.plugin.settings.rowCount)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.rowCount = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateStyles();
                })
            );

        if(Platform.isMobile){
            this.plugin.getCommandsWithoutIcons().forEach(command => {
                new Setting(containerEl)
                    .setName(command.name)
                    .setDesc(`ID: ${command.id}`)
                    .addText(cb => {
                        cb.setValue(this.plugin.settings.mappedIcons.find(value => value.commandID === command.id).iconID)
                        cb.onChange(async (value) => {
                            this.plugin.settings.mappedIcons.push({ commandID: command.id, iconID: value });
                            await this.plugin.saveSettings();
                            this.plugin.injectIcons();
                        });
                    })
            });
        }

        const advancedEl = containerEl.appendChild(createEl("details"));
        advancedEl.appendChild(createEl("summary", { text: "Advanced Settings" }));

        new Setting(advancedEl)
            .setName("Button Height")
            .setDesc("Change the Height of each Button inside the Mobile Toolbar (in px).")
            .addText(cb => cb
                .setValue(this.plugin.settings.rowHeight.toString() ?? "48")
                .setPlaceholder("48")
                .onChange(async (value) => {
                    let height = parseInt(value);
                    if (height) {
                        this.plugin.settings.rowHeight = height;
                        await this.plugin.saveSettings();
                        this.plugin.updateStyles();
                    } else {
                        debounce(() => new Notice("Value is not a valid number."));
                    }
                })
            );
    }
}