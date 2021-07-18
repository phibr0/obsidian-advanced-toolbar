import { Platform, Plugin } from 'obsidian';

export default class AdvancedToolbar extends Plugin {

	async onload() {
		console.log('loading plugin');

		if(Platform.isMobile){
			//@ts-ignore
			const toolbar = this.app.mobileToolbar;
			this.registerDomEvent(window, 'resize', () => {
				if(!toolbar.isOpen && this.app.workspace.activeLeaf?.getViewState().state?.mode == "source"){
					//@ts-ignore
					toolbar.open();
				}
			});
		}
	}

	onunload() {
		console.log('unloading plugin');
	}
}