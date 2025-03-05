import ObsidianLinksPlugin from "main";
import { App, PluginSettingTab, setIcon, Setting } from "obsidian";
import { InternalWikilinkWithoutTextAction } from "utils";

export class ObsidianLinksSettingTab extends PluginSettingTab {

    repoUrl: string;
    plugin: ObsidianLinksPlugin;
    constructor(app: App, plugin: ObsidianLinksPlugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.repoUrl = 'https://github.com/mii-key/obsidian-links';
    }

    getFullDocUrl(fragment: string): string {
        return this.repoUrl + '?tab=readme-ov-file#' + fragment;
    }

    getFullInsiderDocUrl(filename: string): string {
        return this.repoUrl + '/blob/master/docs/insider/' + filename;
    }

    setSettingHelpLink(setting: Setting, helpUrl: string): void {
        const nameEl = setting.settingEl.querySelector(".setting-item-name");
        if (!nameEl) {
            return;
        }
        this.setElementHelpLink(nameEl, helpUrl);
    }

    setElementHelpLink(element: Element, helpUrl: string): void {
        if (!element) {
            return;
        }
        const linkEl = createEl('a', {
            href: helpUrl
        });

        const iconEl = element.createSpan();
        iconEl.addClass('settings-help-icon');
        setIcon(iconEl, "circle-help");
        linkEl.appendChild(iconEl)
        element.appendChild(linkEl);
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h3', { text: 'Command settings' });

        const generalHeading = containerEl.createEl('h4', { text: 'General' });



        new Setting(containerEl)
            .setName('Autoselect upon creating a link')
            .setDesc('Autoselect a word under the cursor when creating a link.')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.autoselectWordOnCreateLink)
                    .onChange(async (value) => {
                        this.plugin.settings.autoselectWordOnCreateLink = value;
                        await this.plugin.saveSettings();
                    })
            });

        const skipFrontmatterInNoteWideCommandsSetting = new Setting(containerEl)
            .setName('Skip Frontmatter')
            .setDesc('Skip Frontmatter in note wide commands.')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.skipFrontmatterInNoteWideCommands)
                    .onChange(async (value) => {
                        this.plugin.settings.skipFrontmatterInNoteWideCommands = value;
                        await this.plugin.saveSettings();
                    })
            });

        const toggleskipFrontmatterInNoteWideCommandsSetting = (enabled: boolean) => {
            if (enabled) {
                skipFrontmatterInNoteWideCommandsSetting.settingEl.show();
                generalHeading.show();
            } else {
                skipFrontmatterInNoteWideCommandsSetting.settingEl.hide();
                generalHeading.hide();
            }
        }

        toggleskipFrontmatterInNoteWideCommandsSetting(this.plugin.settings.ffSkipFrontmatterInNoteWideCommands);


        const setListTextEl = containerEl.createEl('h4', { text: 'Set link text' });
        this.setElementHelpLink(setListTextEl, this.getFullDocUrl('set-link-text'));

        new Setting(containerEl)
            .setName('Title separator')
            .setDesc('String used as headings separator in \'Set link text\' command.')
            .addText(text => text
                .setValue(this.plugin.settings.titleSeparator)
                .onChange(async (value) => {
                    this.plugin.settings.titleSeparator = value;
                    await this.plugin.saveSettings();
                }));

        const removeLinksFromHeadingEl = containerEl.createEl('h4', { text: 'Remove links from headings' });
        this.setElementHelpLink(removeLinksFromHeadingEl, this.getFullDocUrl('remove-links-from-headings'));

        new Setting(containerEl)
            .setName('Internal wikilink without text')
            .addDropdown(dropDown =>
                dropDown
                    .addOptions({
                        Delete: "Remove",
                        ReplaceWithDestination: "Replace with destination",
                        ReplaceWithLowestNoteHeading: "Replace with lowest heading"
                    })
                    .setValue(InternalWikilinkWithoutTextAction[this.plugin.settings.removeLinksFromHeadingsInternalWikilinkWithoutTextAction])
                    .onChange(async (value: string) => {
                        this.plugin.settings.removeLinksFromHeadingsInternalWikilinkWithoutTextAction = value as InternalWikilinkWithoutTextAction;
                        await this.plugin.saveSettings();
                    }));


        const deleteLinkEl = containerEl.createEl('h4', { text: 'Delete link' });
        this.setElementHelpLink(deleteLinkEl, this.getFullDocUrl('delete-link'));

        new Setting(containerEl)
            .setName('Delete unreferenced link target')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.deleteUnreferencedLinkTarget)
                    .onChange(async (value) => {
                        this.plugin.settings.deleteUnreferencedLinkTarget = value;
                        await this.plugin.saveSettings();
                    })
            });

        containerEl.createEl('h4', { text: 'Convert to Markdown link' });
        const settingAppendMdExtension = new Setting(containerEl)
            .setName('Append .md extension')
            .setDesc("")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.onConvertToMdlinkAppendMdExtension)
                    .onChange(async (value) => {
                        this.plugin.settings.onConvertToMdlinkAppendMdExtension = value;
                        await this.plugin.saveSettings();
                    })
            });
        this.setSettingHelpLink(settingAppendMdExtension, this.getFullDocUrl('convert-to-markdown-link'));

        // -- Configure context menu
        containerEl.createEl('h3', { text: 'Context menu' });


        // const feature1Settings = new Setting(containerEl)
        //     .setName('Feature1 context menu item')
        //     .setDesc('')
        //     .addToggle((toggle) => {
        //         toggle
        //             .setValue(this.plugin.settings.contexMenu.feature1)
        //             .onChange(async (value) => {
        //                 this.plugin.settings.contexMenu.feature1 = value;
        //                 await this.plugin.saveSettings();
        //             })

        //     });

        // const toggleFeature1Section = (enabled: boolean) => {
        //     if (enabled) {
        //         feature1Settings.settingEl.show();
        //     } else {
        //         feature1Settings.settingEl.hide();
        //     }
        // }

        // toggleFeature1Section(this.plugin.settings.ffFeature1);

        const settingEditLinkText = new Setting(containerEl)
            .setName('Edit link text')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.editLinkText)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.editLinkText = value;
                        await this.plugin.saveSettings();
                    })

            });

        this.setSettingHelpLink(settingEditLinkText, this.getFullDocUrl('edit-link-text'));

        const settingSetLinkText = new Setting(containerEl)
            .setName('Set link text')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.setLinkText)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.setLinkText = value;
                        await this.plugin.saveSettings();
                    })

            });

        this.setSettingHelpLink(settingSetLinkText, this.getFullDocUrl('set-link-text'));

        const settingSetLinkTextFromClipboard = new Setting(containerEl)
            .setName('Set link text from clipboard')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.setLinkTextFromClipboard)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.setLinkTextFromClipboard = value;
                        await this.plugin.saveSettings();
                    })

            });

        this.setSettingHelpLink(settingSetLinkTextFromClipboard, this.getFullDocUrl('set-link-text-from-clipboard'));

        const settingEditLinkDestination = new Setting(containerEl)
            .setName('Edit link destination')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.editLinkDestination)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.editLinkDestination = value;
                        await this.plugin.saveSettings();
                    })

            });

        this.setSettingHelpLink(settingEditLinkDestination, this.getFullDocUrl('edit-link-destination'));


        const setLinkDestinationFromClipboardContextMenuSetting = new Setting(containerEl)
            .setName('Set link destination from clipboard')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.setLinkDestinationFromClipboard)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.setLinkDestinationFromClipboard = value;
                        await this.plugin.saveSettings();
                    })

            });

        const toggleSetLinkDestinationFromClipboardContextMenuSetting = (enabled: boolean) => {
            if (enabled) {
                setLinkDestinationFromClipboardContextMenuSetting.settingEl.show();
            } else {
                setLinkDestinationFromClipboardContextMenuSetting.settingEl.hide();
            }
        }

        toggleSetLinkDestinationFromClipboardContextMenuSetting(this.plugin.settings.ffSetLinkDestinationFromClipbard);

        new Setting(containerEl)
            .setName('Copy link')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.copyLinkToClipboard)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.copyLinkToClipboard = value;
                        await this.plugin.saveSettings();
                    })

            });

        new Setting(containerEl)
            .setName('Cut link')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.cutLinkToClipboard)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.cutLinkToClipboard = value;
                        await this.plugin.saveSettings();
                    })

            });

        new Setting(containerEl)
            .setName('Copy link destination')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.copyLinkDestination)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.copyLinkDestination = value;
                        await this.plugin.saveSettings();
                    })

            });

        const settingCopyLinkToObjectContextMenu = new Setting(containerEl)
            .setName('Copy link to element')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.copyLinkToHeadingToClipboard)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.copyLinkToHeadingToClipboard = value;
                        await this.plugin.saveSettings();
                    })

            });

        const toggleCopyLinkToObjectContextMenuSetting = (enabled: boolean) => {
            if (enabled) {
                settingCopyLinkToObjectContextMenu.settingEl.show();
            } else {
                settingCopyLinkToObjectContextMenu.settingEl.hide();
            }
        }

        toggleCopyLinkToObjectContextMenuSetting(this.plugin.settings.ffCopyLinkToObject);

        new Setting(containerEl)
            .setName('Unlink')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.unlink)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.unlink = value;
                        await this.plugin.saveSettings();
                    })

            });
        new Setting(containerEl)
            .setName('Convert to wikilink')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.convertToWikilink)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.convertToWikilink = value;
                        await this.plugin.saveSettings();
                    })

            });
        new Setting(containerEl)
            .setName('Convert to autolink')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.convertToAutolink)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.convertToAutolink = value;
                        await this.plugin.saveSettings();
                    })

            });
        new Setting(containerEl)
            .setName('Convert to markdown link')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.convertToMakrdownLink)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.convertToMakrdownLink = value;
                        await this.plugin.saveSettings();
                    })

            });

        new Setting(containerEl)
            .setName('Convert to HTML link')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.convertToHtmlLink)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.convertToHtmlLink = value;
                        await this.plugin.saveSettings();
                    })

            });

        if (this.plugin.settings.ffReplaceLink) {
            new Setting(containerEl)
                .setName('Replace link')
                .setDesc('')
                .addToggle((toggle) => {
                    toggle
                        .setValue(this.plugin.settings.contexMenu.replaceLink)
                        .onChange(async (value) => {
                            this.plugin.settings.contexMenu.replaceLink = value;
                            await this.plugin.saveSettings();
                        })

                });
        }

        new Setting(containerEl)
            .setName('Embed/Unembed')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.embedUnembedLink)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.embedUnembedLink = value;
                        await this.plugin.saveSettings();
                    })

            });

        new Setting(containerEl)
            .setName('Delete')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.deleteLink)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.deleteLink = value;
                        await this.plugin.saveSettings();
                    })

            });
        new Setting(containerEl)
            .setName('Create link')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.createLink)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.createLink = value;
                        await this.plugin.saveSettings();
                    })

            });
        let settings1 = new Setting(containerEl)
            .setName('Create link from clipboard')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.createLinkFromClipboard)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.createLinkFromClipboard = value;
                        await this.plugin.saveSettings();
                    })

            });

        const convertAllToMdLinksSettings = new Setting(containerEl)
            .setName('Convert all links to Markdown links')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.convertAllLinksToMdLinks)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.convertAllLinksToMdLinks = value;
                        await this.plugin.saveSettings();
                    })

            });
        const convertWikilinksToMdLinksSettings = new Setting(containerEl)
            .setName('Convert Wikilinks to Markdown links')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.convertWikilinkToMdLinks)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.convertWikilinkToMdLinks = value;
                        await this.plugin.saveSettings();
                    })

            });

        const convertUrlsToMdLinksSettings = new Setting(containerEl)
            .setName('Convert URLs to Markdown links')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.convertUrlsToMdlinks)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.convertUrlsToMdlinks = value;
                        await this.plugin.saveSettings();
                    })

            });

        const convertAutolinksToMdLinksSettings = new Setting(containerEl)
            .setName('Convert Autolinks to Markdown links')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.convertAutolinksToMdlinks)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.convertAutolinksToMdlinks = value;
                        await this.plugin.saveSettings();
                    })

            });
        const convertHtmllinksToMdLinksSettings = new Setting(containerEl)
            .setName('Convert HTML links to Markdown links')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.convertHtmllinksToMdlinks)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.convertHtmllinksToMdlinks = value;
                        await this.plugin.saveSettings();
                    })

            });

        const extractSectionSettings = new Setting(containerEl)
            .setName('Extract section')
            .setDesc('')
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.contexMenu.extractSection)
                    .onChange(async (value) => {
                        this.plugin.settings.contexMenu.extractSection = value;
                        await this.plugin.saveSettings();
                    })

            });

        const toggleExtractSection = (enabled: boolean) => {
            if (enabled) {
                extractSectionSettings.settingEl.show();
            } else {
                extractSectionSettings.settingEl.hide();
            }
        }

        toggleExtractSection(this.plugin.settings.ffExtractSection);

        // ----------------------------------------------
        // --          Early access features           --
        // ----------------------------------------------

        containerEl.createEl('h3', { text: 'Early access features' });
        const earlyAccessDescription = containerEl.createEl('p');
        earlyAccessDescription.createEl('span', {
            text: "Almost finished features with some "
        });

        earlyAccessDescription.createEl('a', {
            href: 'https://github.com/mii-key/obsidian-links/issues',
            text: 'bugs'
        });

        earlyAccessDescription.createEl('span', {
            text: " to be fixed."
        });

        // ----------------------------
        // ----- Early access feature1

        // new Setting(containerEl)
        // 	.setName("Early access feature1")
        // 	.setDesc("Feature description")
        // 	.setClass("setting-item-feature1")
        // 	.addToggle((toggle) => {
        // 		toggle
        // 			.setValue(this.plugin.settings.ffEarlyAccessFeature1)
        // 			.onChange(async (value) => {
        // 				this.plugin.settings.ffEarlyAccessFeature1 = value;
        // 				await this.plugin.saveSettings();
        // 			})
        // 	});

        // const earlyAccessFeature1SettingDesc = containerEl.querySelector(".setting-item-feature1 .setting-item-description");
        // if (earlyAccessFeature1SettingDesc) {
        // 	earlyAccessFeature1SettingDesc.appendText(' see ');
        // 	earlyAccessFeature1SettingDesc.appendChild(
        // 		createEl('a', {
        // 			href: 'https://github.com/mii-key/obsidian-links#readme',
        // 			text: 'docs'
        // 		}));
        // 	earlyAccessFeature1SettingDesc.appendText('.');
        // }
        // ----------

        // ------------------------------------
        // copy link to heading


        // ----------------------------------------------
        // --            Insider features              --
        // ----------------------------------------------

        containerEl.createEl('h3', { text: 'Insider features' });

        const insiderDescription = containerEl.createEl('p');


        insiderDescription.createEl('span', {
            text: "Incomplete features currently under development. Enable these features to "
        });

        insiderDescription.createEl('a', {
            href: 'https://github.com/mii-key/obsidian-links/issues',
            text: 'provide your input'
        });

        insiderDescription.createEl('span', {
            text: " and influence the direction of development."
        });

        // ------------------------------------
        // insider feature1

        // new Setting(containerEl)
        // 	.setName("Insinder feature")
        // 	.setDesc("description")
        // 	.setClass("setting-item-feature1")
        // 	.addToggle((toggle) => {
        // 		toggle
        // 			.setValue(this.plugin.settings.ffFeature1)
        // 			.onChange(async (value) => {
        // 				this.plugin.settings.ffFeature1 = value;
        // 				await this.plugin.saveSettings();
        // 			})

        // 	});

        // const feature1SettingDesc = containerEl.querySelector(".setting-item-feature1 .setting-item-description");

        // if (feature1SettingDesc) {
        // 	feature1SettingDesc.appendText(' see ');
        // 	feature1SettingDesc.appendChild(
        // 		createEl('a', {
        // 			href: 'https://github.com/mii-key/obsidian-links/blob/master/docs/insider/feature1.md',
        // 			text: 'docs'
        // 		}));
        // 	feature1SettingDesc.appendText('.');
        // }

        // ------------------------------------
        // insider feature1

        // const settingInsiderFeature1 = new Setting(containerEl)
        //     .setName("Insider feature")
        //     .setDesc("Insider feature desc ")
        //     .addToggle((toggle) => {
        //         toggle
        //             .setValue(this.plugin.settings.ffInsiderFeature1)
        //             .onChange(async (value) => {
        //                 this.plugin.settings.ffInsiderFeaturei = value;
        //                 await this.plugin.saveSettings();
        //             })

        //     });

        // this.setSettingHelpLink(settingInsiderFeature1, this.getFullInsiderDocUrl('insider-feature1.md'));



        // ------------------------------------
        // convert links in a folder

        const settingConvertLinksInFolder = new Setting(containerEl)
            .setName("Convert links in folder")
            .setDesc("Convert links in a folder")
            .setClass("setting-item--feature-convert-links-in-folder")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.ffConvertLinksInFolder)
                    .onChange(async (value) => {
                        this.plugin.settings.ffConvertLinksInFolder = value;
                        await this.plugin.saveSettings();
                    })

            });

        this.setSettingHelpLink(settingConvertLinksInFolder, this.getFullInsiderDocUrl('convert-links-in-folder.md'));

        // ------------------------------
        // feature: extract section

        // new Setting(containerEl)
        //     .setName("Extract section")
        //     .setDesc("Extract section into a note.")
        //     .setClass("setting-item--insider-feature3")
        //     .addToggle((toggle) => {
        //         toggle
        //             .setValue(this.plugin.settings.ffExtractSection)
        //             .onChange(async (value) => {
        //                 this.plugin.settings.ffExtractSection = value;
        //                 await this.plugin.saveSettings();
        //                 toggleExtractSection(value);
        //             })
        //     });

        // const feature3SettingDesc = containerEl.querySelector(".setting-item--insider-feature3 .setting-item-description");

        // if (feature3SettingDesc) {
        //     feature3SettingDesc.appendText(' see ');
        //     feature3SettingDesc.appendChild(
        //         createEl('a', {
        //             href: 'https://github.com/mii-key/obsidian-links/blob/master/docs/insider/extract-section.md',
        //             text: 'docs'
        //         }));
        //     feature3SettingDesc.appendText('.');
        // }




        // ------------------------------------
        // Obsidian URL support

        new Setting(containerEl)
            .setName("Obsidian URL support")
            .setDesc("Add support for Obsidian URL")
            .setClass("setting-item-featureObsidianUrl")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.ffObsidianUrlSupport)
                    .onChange(async (value) => {
                        this.plugin.settings.ffObsidianUrlSupport = value;
                        await this.plugin.saveSettings();
                    })

            });

        const featureObsidianUrlSettingDesc = containerEl.querySelector(".setting-item-featureObsidianUrl .setting-item-description");

        if (featureObsidianUrlSettingDesc) {
            featureObsidianUrlSettingDesc.appendText(' see ');
            featureObsidianUrlSettingDesc.appendChild(
                createEl('a', {
                    href: 'https://github.com/mii-key/obsidian-links/blob/master/docs/insider/obsidian-url.md',
                    text: 'docs'
                }));
            featureObsidianUrlSettingDesc.appendText('.');
        }

        // const autoselectWordOnCreateLinkSettingDesc = containerEl.querySelector(".setting-item-autoselect-word-create-link .setting-item-description");

        // if (autoselectWordOnCreateLinkSettingDesc) {
        //     autoselectWordOnCreateLinkSettingDesc.appendText(' see ');
        //     autoselectWordOnCreateLinkSettingDesc.appendChild(
        //         createEl('a', {
        //             href: 'https://github.com/mii-key/obsidian-links/blob/master/docs/insider/feature1.md',
        //             text: 'docs'
        //         }));
        //     autoselectWordOnCreateLinkSettingDesc.appendText('.');
        // }


        // ------------------------------------
        // skip front matter in note wide commands

        new Setting(containerEl)
            .setName("Skip Frontmatter")
            .setDesc("Skip Frontmatter in note wide commands")
            .setClass("setting-item-skip-frontmatter-notewide")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.ffSkipFrontmatterInNoteWideCommands)
                    .onChange(async (value) => {
                        this.plugin.settings.ffSkipFrontmatterInNoteWideCommands = value;
                        await this.plugin.saveSettings();
                        toggleskipFrontmatterInNoteWideCommandsSetting(value);
                    })

            });

        const ffSkipFrontmatterSettingDesc = containerEl.querySelector(".setting-item-skip-frontmatter-notewide .setting-item-description");

        if (ffSkipFrontmatterSettingDesc) {
            ffSkipFrontmatterSettingDesc.appendText(' see ');
            ffSkipFrontmatterSettingDesc.appendChild(
                createEl('a', {
                    href: 'https://github.com/mii-key/obsidian-links/blob/master/docs/insider/skip-frontmatter.md',
                    text: 'docs '
                }));
            ffSkipFrontmatterSettingDesc.appendText('.');
        }



        // ------------------------------------
        // copy link to element to the clipboard

        const settingCopyLinkToElement = new Setting(containerEl)
            .setName("Copy link to element")
            .setDesc("Copy link to a heading or a block to the clipboard. ")
            .setClass("setting-item-copy-link-to-object")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.ffCopyLinkToObject)
                    .onChange(async (value) => {
                        this.plugin.settings.ffCopyLinkToObject = value;
                        toggleCopyLinkToObjectContextMenuSetting(value);
                        await this.plugin.saveSettings();
                    })

            });

        this.setSettingHelpLink(settingCopyLinkToElement, this.getFullInsiderDocUrl('copy-link-to-element.md'));

        // ------------------------------------
        // Set link destination from clipboard

        //const settingSetLinkDestinationFromClipboard = 
        new Setting(containerEl)
            .setName("Set link destination from clipboard")
            .setDesc("Sets destination of a link from clipboard")
            .addToggle((toggle) => {
                toggle
                    .setValue(this.plugin.settings.ffSetLinkDestinationFromClipbard)
                    .onChange(async (value) => {
                        this.plugin.settings.ffSetLinkDestinationFromClipbard = value;
                        await this.plugin.saveSettings();
                    })
            });

        // this.setSettingHelpLink(settingSetLinkDestinationFromClipboard, this.getFullInsiderDocUrl('set-link-destination-from-clipboard.md'));
    }
}