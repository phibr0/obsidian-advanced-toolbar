import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

export default class AdvancedToolbar extends Plugin {

	async onload() {
		console.log('loading plugin');

		//@ts-ignore
		if(this.app.isMobile){
			this.registerDomEvent(window, 'resize', () => {
				//@ts-ignore
				if(!this.app.mobileToolbar.isOpen){
					//@ts-ignore
					this.app.mobileToolbar.open();
				}
			});
		}
	}

	onunload() {
		console.log('unloading plugin');
	}
}