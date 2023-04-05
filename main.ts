import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, TFolder } from 'obsidian';
import { getAPI } from 'obsidian-dataview'

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	recsFolderPath: string;
	tableTemplatePath: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	recsFolderPath: 'gamerecs',
	tableTemplatePath: 'templates/Recs Table Template.md'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();


		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				const vault = this.app.vault

				// testing: insert the first file in the list.
				// const files = vault.getMarkdownFiles()
				// console.log(files)

				const dv = getAPI(this.app)
				if (dv === undefined)
				{
					new Notice('Could not get the Dataview API.')
					return;
				}

				const data = dv.pages('"gamerecs"')
					.sort(b => b["release-date"])
					.dateformat()
					.map(b => [b.file.link, b.developer, b.publisher, b["release-date"], b.oneliner, b["play-today"]]);
				// console.log(JSON.stringify(data.array()));
				
				const table = dv.markdownTable(["Title", "Developer", "Publisher", "Release Date", "Desc", "Play"], data)

				const recFolder = vault.getAbstractFileByPath(this.settings.recsFolderPath);
				const templateFile = vault.getAbstractFileByPath(this.settings.tableTemplatePath);

				if (recFolder instanceof TFolder && templateFile instanceof TFile) {
					// console.log(templateFile)
					// console.log(recFolder.children)

					// const rowFmt = "<tr> </tr><tr> </tr><tr> </tr><tr> </tr><tr> </tr><tr> </tr>"

					const tem = vault.cachedRead(templateFile)
					console.log(tem)

					const outputText = "assign output text here"
					editor.replaceSelection(table)
				}
				else
				{
					if (!(recFolder instanceof TFolder)) {
						new Notice("Could not open recs folder at " + this.settings.recsFolderPath)
					}

					if (!(recFolder instanceof TFile)) {
						new Notice("Could not open recommendation table template at" + this.settings.tableTemplatePath)
					}

					return
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Template path')
			.setDesc('The markdown file that serves as a template for your recommendation data.')
			.addText(text => text
				.setPlaceholder('Enter a file')
				.setValue(this.plugin.settings.tableTemplatePath)
				.onChange(async (value) => {
					this.plugin.settings.tableTemplatePath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Recommendations folder path')
			.setDesc('The folder that contains the items to include in the table.')
			.addText(text => text
				.setPlaceholder('Enter a path')
				.setValue(this.plugin.settings.recsFolderPath)
				.onChange(async (value) => {
					this.plugin.settings.recsFolderPath = value;
					await this.plugin.saveSettings();
				}));
	}
}
