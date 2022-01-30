import { App, Setting, PluginSettingTab, Platform, FuzzySuggestModal, FuzzyMatch, setIcon, Command, Notice } from "obsidian"
import AdvancedToolbar from "src/main";

export default class ATSettingsTab extends PluginSettingTab {
    plugin: AdvancedToolbar;

    constructor(app: App, plugin: AdvancedToolbar) {
        super(app, plugin);
        this.plugin = plugin;
        addEventListener("AT-iconPicked", () => {
            this.display();
        });
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
                    new Notice('Obsidian needs to be reloaded for this setting to take effect.')
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName("Toolbar Row Count")
            .setDesc("Set how many Rows the Mobile Toolbar should have. Set this to 0 to remove the Toolbar.")
            .addSlider(cb => cb
                .setLimits(0, 5, 1)
                .setValue(this.plugin.settings.rowCount)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.rowCount = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateStyles();
                })
            );

        new Setting(containerEl)
            .setName("Column Layout")
            .setDesc("Use a column based layout instead of the default row. This makes it easier to arrange the Commands.")
            .addToggle(cb => cb
                .setValue(this.plugin.settings.columnLayout)
                .onChange(async value => {
                    this.plugin.settings.columnLayout = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateStyles();
                })
            );

        new Setting(containerEl)
            .setName("Show Tooltips for Quick Actions")
            .setDesc("Show Tooltips over the Quick Actions on hover. This helps to more easily identify Commands. IMPORTANT: Only works with a Stylus/Apple Pen/Mouse")
            .addToggle(cb => {
                cb.setValue(this.plugin.settings.tooltips)
                    .onChange(async (value) => {
                        this.plugin.settings.tooltips = value;
                        await this.plugin.saveSettings();
                    })
            })

        new Setting(containerEl)
            .setName("Allow Styling of all Quick Actions")
            .setDesc("If enabled you can change the Icons of all Quick Actions, not only these that don't provide their own Icon.")
            .addToggle(cb => cb
                .setValue(this.plugin.settings.allowStylingOfAllActions)
                .onChange(async (value) => {
                    this.plugin.settings.allowStylingOfAllActions = value;
                    await this.plugin.saveSettings();
                    this.display();
                })
            );

        if (Platform.isMobile) {
            const description = document.createDocumentFragment();
            description.appendChild(createEl("h3", { text: "Custom Icons" }));
            containerEl.appendChild(description);

            if (this.plugin.settings.allowStylingOfAllActions) {
                this.plugin.getCommands().forEach(command => {
                    new Setting(containerEl)
                        .setName(command.name)
                        .setDesc(`ID: ${command.id}`)
                        .addButton(bt => {
                            const iconDiv = bt.buttonEl.createDiv({ cls: "AT-settings-icon" });
                            if (command.icon) {
                                setIcon(iconDiv, command.icon, 20);
                            } else {
                                const currentIcon = this.plugin.settings.mappedIcons.find(m => m.commandID === command.id)?.iconID;
                                currentIcon ? setIcon(iconDiv, currentIcon, 20) : bt.setButtonText("No Icon");
                            }
                            bt.onClick(() => {
                                new IconPicker(this.plugin, command, this.display).open();
                            })
                        })
                        .addExtraButton(bt => {
                            bt.setIcon("reset")
                                .setTooltip("Reset to default - Requires a restart")
                                .onClick(async () => {
                                    this.plugin.settings.mappedIcons.remove(this.plugin.settings.mappedIcons.find((p) => p.iconID === command.icon));
                                    command.icon = undefined;
                                    await this.plugin.saveSettings();
                                    this.display();
                                    new Notice("If the default Icon doesn't appear, you might have to restart Obsidian.")
                                });
                        });
                });
            } else {
                this.plugin.getCommandsWithoutIcons().forEach(command => {
                    new Setting(containerEl)
                        .setName(command.name)
                        .setDesc(`ID: ${command.id}`)
                        .addButton(bt => {
                            const iconDiv = bt.buttonEl.createDiv({ cls: "AT-settings-icon" });
                            if (command.icon) {
                                setIcon(iconDiv, command.icon, 20);
                            } else {
                                const currentIcon = this.plugin.settings.mappedIcons.find(m => m.commandID === command.id)?.iconID;
                                currentIcon ? setIcon(iconDiv, currentIcon, 20) : bt.setButtonText("No Icon");
                            }
                            bt.onClick(() => {
                                new IconPicker(this.plugin, command, this.display).open();
                            });
                        })
                        .addExtraButton(bt => {
                            bt.setIcon("reset")
                                .setTooltip("Reset to default - Requires a restart")
                                .onClick(async () => {
                                    this.plugin.settings.mappedIcons.remove(this.plugin.settings.mappedIcons.find((p) => p.iconID === command.icon));
                                    command.icon = undefined;
                                    await this.plugin.saveSettings();
                                    this.display();
                                    new Notice("If the default Icon doesn't appear, you might have to restart Obsidian.")
                                });
                        });
                });
            }
        }

        const advancedEl = containerEl.appendChild(createEl("details"));
        advancedEl.appendChild(createEl("summary", { text: "Advanced Settings" }));

        new Setting(advancedEl)
            .setName("Button Height")
            .setDesc("Change the Height of each Button inside the Mobile Toolbar (in px).")
            .addText(cb => cb
                .setValue(this.plugin.settings.rowHeight?.toString() ?? "48")
                .setPlaceholder("48")
                .onChange(async (value) => {
                    const height = Number(value);
                    const invalid = isNaN(height);
                    cb.inputEl.toggleClass("is-invalid", invalid)
                    if (!invalid) {
                        this.plugin.settings.rowHeight = height;
                        await this.plugin.saveSettings();
                        this.plugin.updateStyles();
                    }
                })
            );
        new Setting(advancedEl)
            .setName("Button Width")
            .setDesc("Change the Width of each Button inside the Mobile Toolbar (in px).")
            .addText(cb => cb
                .setValue(this.plugin.settings.buttonWidth?.toString() ?? "48")
                .setPlaceholder("48")
                .onChange(async (value) => {
                    const width = Number(value);
                    const invalid = isNaN(width);
                    cb.inputEl.toggleClass("is-invalid", invalid)
                    if (!invalid) {
                        this.plugin.settings.buttonWidth = width;
                        await this.plugin.saveSettings();
                        this.plugin.updateStyles();
                    }
                })
            );
        new Setting(advancedEl)
            .setName("Toolbar Extra Spacing")
            .setDesc("Some Themes need extra spacing in the toolbar. If your Toolbar doesn't wrap properly, try increasing this value.")
            .addSlider(cb => cb
                .setLimits(0, 64, 1)
                .setValue(this.plugin.settings.spacing)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.spacing = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateStyles();
                })
            );
        new Setting(advancedEl)
            .setName("Debugging")
            .setDesc("Enable Debugging")
            .addToggle(cb => {
                cb.setValue(this.plugin.settings.debugging);
                cb.onChange(async (value) => {
                    this.plugin.settings.debugging = value;
                    await this.plugin.saveSettings();
                })
            });
        new Setting(containerEl)
            .setName('Donate')
            .setDesc('If you like this Plugin, consider donating to support continued development:')
            .setClass("AT-extra")
            .addButton((bt) => {
                bt.buttonEl.outerHTML = `<a href="https://www.buymeacoffee.com/phibr0"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=phibr0&button_colour=5F7FFF&font_colour=ffffff&font_family=Inter&outline_colour=000000&coffee_colour=FFDD00"></a>`;
            });
    }
}

export class IconPicker extends FuzzySuggestModal<string> {
    plugin: AdvancedToolbar;
    command: Command;

    constructor(plugin: AdvancedToolbar, command: Command, display: any) {
        super(plugin.app);
        this.plugin = plugin;
        this.command = command;
        this.setPlaceholder("Pick an Icon");
    }

    private cap(string: string): string {
        const words = string.split(" ");

        return words.map((word) => {
            return word[0].toUpperCase() + word.substring(1);
        }).join(" ");
    }

    getItems(): string[] {
        return this.plugin.iconList;
    }

    getItemText(item: string): string {
        return this.cap(item.replace("feather-", "").replace(/-/ig, " "));
    }

    renderSuggestion(item: FuzzyMatch<string>, el: HTMLElement): void {
        el.addClass("AT-icon-container");
        const div = createDiv({ cls: "AT-icon" });
        el.appendChild(div);
        setIcon(div, item.item);
        super.renderSuggestion(item, el);
    }

    async onChooseItem(item: string): Promise<void> {
        this.plugin.log("changed to: " + item);
        this.plugin.settings.mappedIcons.remove(this.plugin.settings.mappedIcons.find(m => m.commandID === this.command.id))
        this.plugin.settings.mappedIcons.push({ commandID: this.command.id, iconID: item })
        await this.plugin.saveSettings();
        this.plugin.injectIcons();
        this.close();
        setTimeout(() => {
            dispatchEvent(new Event("AT-iconPicked"));
        }, 100);
    }

}
