import { App, Setting, PluginSettingTab, Platform } from "obsidian"
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
            containerEl.createSpan("Please Note that this Plugin doesn't affect the Desktop App. It only applies to Obsidian's Mobile App.")
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
            .setDesc("Set how many Rows the Mobile Toolbar should have")
            .addSlider(cb => cb
                .setLimits(1, 3, 1)
                .setValue(this.plugin.settings.rowCount)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.rowCount = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateStyles();
                })
            );
    }
}