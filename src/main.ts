import { App, Command, MarkdownView, Notice, Platform, Plugin, TFile } from 'obsidian';
import { ATSettings, DEFAULT_SETTINGS } from './types';
import { addFeatherIcons } from './ui/icons';
import ATSettingsTab from './ui/settings/settingsTab';

export default class AdvancedToolbar extends Plugin {
	settings: ATSettings;
	iconList: string[] = ["any-key", "audio-file", "blocks", "bold-glyph", "bracket-glyph", "broken-link", "bullet-list", "bullet-list-glyph", "calendar-with-checkmark", "check-in-circle", "check-small", "checkbox-glyph", "checkmark", "clock", "cloud", "code-glyph", "create-new", "cross", "cross-in-box", "crossed-star", "csv", "deleteColumn", "deleteRow", "dice", "document", "documents", "dot-network", "double-down-arrow-glyph", "double-up-arrow-glyph", "down-arrow-with-tail", "down-chevron-glyph", "enter", "exit-fullscreen", "expand-vertically", "filled-pin", "folder", "formula", "forward-arrow", "fullscreen", "gear", "go-to-file", "hashtag", "heading-glyph", "help", "highlight-glyph", "horizontal-split", "image-file", "image-glyph", "indent-glyph", "info", "insertColumn", "insertRow", "install", "italic-glyph", "keyboard-glyph", "languages", "left-arrow", "left-arrow-with-tail", "left-chevron-glyph", "lines-of-text", "link", "link-glyph", "logo-crystal", "magnifying-glass", "microphone", "microphone-filled", "minus-with-circle", "moveColumnLeft", "moveColumnRight", "moveRowDown", "moveRowUp", "note-glyph", "number-list-glyph", "open-vault", "pane-layout", "paper-plane", "paused", "pdf-file", "pencil", "percent-sign-glyph", "pin", "plus-with-circle", "popup-open", "presentation", "price-tag-glyph", "quote-glyph", "redo-glyph", "reset", "right-arrow", "right-arrow-with-tail", "right-chevron-glyph", "right-triangle", "run-command", "search", "sheets-in-box", "sortAsc", "sortDesc", "spreadsheet", "stacked-levels", "star", "star-list", "strikethrough-glyph", "switch", "sync", "sync-small", "tag-glyph", "three-horizontal-bars", "trash", "undo-glyph", "unindent-glyph", "up-and-down-arrows", "up-arrow-with-tail", "up-chevron-glyph", "uppercase-lowercase-a", "vault", "vertical-split", "vertical-three-dots", "wrench-screwdriver-glyph"];

	toolbarHandler = () => {
		//@ts-ignore The ignore is needed, because the mobileToolbar isn't exposed via obsidian.d.ts
		const { mobileToolbar: toolbar} = this.app;
		if (this.settings.alwaysShowToolbar === true && !toolbar.isOpen) {
			toolbar.open();
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
			this.registerEvent(this.app.workspace.on("layout-change", this.toolbarHandler));
			//this.app.workspace.on("active-leaf-change", () => {});
		}

		addFeatherIcons(this.iconList);

		this.app.workspace.onLayoutReady(() => {
			this.updateStyles();
			this.injectIcons();
			setTimeout(() => {
				//@ts-ignore
				if (this.app.mobileToolbar.isOpen) {
					//@ts-ignore
					this.app.mobileToolbar.close();
					//@ts-ignore
					this.app.mobileToolbar.open();
				}
			}, 50);
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
		c.toggle('AT-multirow', this.settings.rowCount > 1);
		c.toggle('AT-no-toolbar', this.settings.rowCount === 0);
	}

	listActiveToolbarCommands(): String[] {
		//@ts-ignore
		const activeCommands = this.app.vault.getConfig('mobileToolbarCommands');
		this.log("listActiveToolbarCommands: " + activeCommands);
		return activeCommands;
	}

	getCommands(): Command[] {
		const commands: Command[] = [];
		this.listActiveToolbarCommands().forEach(id => {
			//@ts-ignore
			commands.push(this.app.commands.commands[id]);
		})
		return commands;
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

	injectHoverTooltips(el: HTMLElement) {
		if (this.settings.tooltips) {
			const commands = this.getCommands();
			el.firstChild.childNodes.forEach((child: HTMLElement, i: number) => {
				child.setAttrs({
					"aria-label": commands[i].name.replace(/.*: /, ""),
					"aria-label-position": "top"
				})
			});
		}
	}
}
