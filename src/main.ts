import { App, Command, MarkdownView, Notice, Platform, Plugin, TFile } from 'obsidian';
import { ATSettings, DEFAULT_SETTINGS } from './types';
import ATSettingsTab from './ui/settings/settingsTab';

export default class AdvancedToolbar extends Plugin {
	settings: ATSettings;

	async onload() {
		console.log('Loading Advanced Mobile Toolbar plugin.');

		await this.loadSettings();

		this.addSettingTab(new ATSettingsTab(this.app, this));

		document.body.addClass('advanced-toolbar');

		if (Platform.isDesktop) {
			console.log('Advanced Mobile Toolbar detected desktop Obsidian and is aborting. You still have access to change the settings.')
			return;
		}


		this.app.workspace.onLayoutReady(() => {
			this.updateStyles();
			this.injectIcons();
			//Toolbar Opened Event:
			new MutationObserver((event) => {
				//@ts-ignore
				if ((event.first().addedNodes as NodeList).item(0)?.hasClass("mobile-toolbar")) {
					dispatchEvent(new CustomEvent("toolbarOpened", { detail: { "toolbar": event.first().addedNodes.item(0) } }))
				}
			}).observe(document.body.getElementsByClassName("app-container").item(0), { childList: true });
		});

		addEventListener("toolbarOpened", (e: CustomEvent) => this.injectHoverTooltips(e.detail.toolbar));
	}

	onunload() {
		console.log('Unloading Advanced Mobile Toolbar plugin.');
		this.removeStyles();
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
		s.setProperty("--at-button-width", (this.settings.buttonWidth ?? 48) + "px");
		s.setProperty("--at-row-count", this.settings.rowCount.toString());
		s.setProperty("--at-spacing", (this.settings.spacing) + "px");
		s.setProperty("--at-offset", (this.settings.heightOffset) + "px");
		c.toggle('AT-multirow', this.settings.rowCount > 1);
		c.toggle('AT-row', !this.settings.columnLayout);
		c.toggle('AT-column', this.settings.columnLayout);
		c.toggle('AT-no-toolbar', this.settings.rowCount === 0);
		c.toggle('AT-always-shown', this.settings.alwaysShowToolbar);
	}

	removeStyles() {
		const { classList: c, style: s } = document.body;
		s.removeProperty("--at-button-height");
		s.removeProperty("--at-button-width");
		s.removeProperty("--at-row-count");
		s.removeProperty("--at-spacing");
		s.removeProperty("--at-offset");
		c.remove('AT-multirow');
		c.remove('AT-row');
		c.remove('AT-column');
		c.remove('AT-no-toolbar');
		c.remove('advanced-toolbar');
	}

	listActiveToolbarCommands(): String[] {
		//@ts-ignore
		const activeCommands = this.app.vault.getConfig('mobileToolbarCommands');
		return activeCommands;
	}

	getCommands(): Command[] {
		const commands: Command[] = [];
		this.listActiveToolbarCommands().forEach(id => {
			//@ts-ignore
			const c = this.app.commands.commands[id];
			if (c) commands.push(c);
		});
		return commands;
	}

	getCommandsWithoutIcons(includeSelfAdded = true): Command[] {
		const commands: Command[] = [];
		this.getCommands().forEach(c => {
			if (c && !c.icon) {
				commands.push(c);
			}
		});
		if (includeSelfAdded) {
			this.getCommands().forEach(c => {
				if (this.settings.mappedIcons.find(m => m.commandID === c.id)) {
					commands.push(c);
				}
			});
		}
		return commands;
	}

	injectIcons() {
		this.settings.mappedIcons.forEach(mapped => {
			//@ts-ignore 
			const command = this.app.commands.commands[mapped.commandID];
			if (command) {
				command.icon = mapped.iconID;
			} else {
				this.settings.mappedIcons.remove(mapped);
			}
		});
		this.saveSettings();
	}

	injectHoverTooltips(el: HTMLElement) {
		if (this.settings.tooltips) {
			const commands = this.getCommands();
			el.firstChild.childNodes.forEach((child: HTMLElement, i: number) => {
				child.setAttrs({
					"aria-label": commands[i]?.name.replace(/.*: /, ""),
					"aria-label-position": "top"
				})
			});
		}
	}
}
