import { Platform, Plugin } from 'obsidian';
import { ATSettings, DEFAULT_SETTINGS } from './types';
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

		this.updateStyles()
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
		const {classList: c, style: s} = document.body;
		s.setProperty("--at-button-height", (this.settings.rowHeight ?? 48) + "px");
		c.toggle('AT-Double', this.settings.rowCount === 2);
		c.toggle('AT-Triple', this.settings.rowCount === 3);
	}
}