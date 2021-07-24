import { Command, Notice, Platform, Plugin } from 'obsidian';
import { ATSettings, DEFAULT_SETTINGS } from './types';
import { addFeatherIcons } from './ui/icons';
import ATSettingsTab from './ui/settings/settingsTab';

export default class AdvancedToolbar extends Plugin {
	settings: ATSettings;

	toolbarHandler = () => {
		//@ts-ignore The ignore is needed, because the mobileToolbar isn't exposed via obsidian.d.ts
		const { mobileToolbar: t, workspace: w } = this.app;
		if (this.settings.alwaysShowToolbar === true && !t.isOpen && w.activeLeaf?.getViewState().state.mode === "source") {
			t.open();
		}
	};

	log(message: any) {
		if (this.settings.debugging) {
			console.log(message)
		}
	}

	async onload() {
		console.log('loading plugin');

		await this.loadSettings();

		this.addSettingTab(new ATSettingsTab(this.app, this));

		if (Platform.isMobile) {
			//This Fires when the on-screen Keyboard opens and *closes*
			this.registerDomEvent(window, 'resize', this.toolbarHandler);
			//This supposedly fires when the View Mode Changes from Preview to Source and Vice Versa
			this.app.workspace.on("layout-change", this.toolbarHandler);
			//this.app.workspace.on("active-leaf-change", () => {});
		}

		addFeatherIcons();

		this.app.workspace.onLayoutReady(() => {
			this.updateStyles()
			this.injectIcons();
		});
	}

	onunload() {
		console.log('unloading plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	updateStyles() {
		const { classList: c, style: s } = document.body;
		s.setProperty("--at-button-height", (this.settings.rowHeight ?? 48) + "px");
		s.setProperty("--at-row-count", this.settings.rowCount.toString());
		c.toggle('AT-Multi', this.settings.rowCount > 1);
	}

	listActiveToolbarCommands(): String[] {
		//@ts-ignore
		const activeCommands = this.app.vault.getConfig('mobileToolbarCommands');
		this.log("listActiveToolbarCommands: " + activeCommands);
		return activeCommands;
	}

	getCommandsWithoutIcons(includeSelfAdded = true): Command[] {
		this.log("getCommandsWithoutIcons");
		const commands: Command[] = [];
		this.listActiveToolbarCommands().forEach(id => {
			//@ts-ignore
			const c = this.app.commands.commands[id];
			if (c && !c.icon) {
				commands.push(c);
				this.log("pushed: " + c)
			}
		});
		if (includeSelfAdded) {
			this.listActiveToolbarCommands().forEach(id => {
				//@ts-ignore
				const c = this.app.commands.commands[id];
				this.log(c);
				if (this.settings.mappedIcons.find(m => m.commandID === c.id)) {
					commands.push(c);
				}
			});
		}
		return commands;
	}

	injectIcons() {
		this.settings.mappedIcons.forEach(mapped => {
			try {
				//@ts-ignore
				this.app.commands.commands[mapped.commandID].icon = mapped.iconID;
			} catch (error) {
				new Notice(error);
			}
		});
	}
}