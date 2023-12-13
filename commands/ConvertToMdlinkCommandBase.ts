import { LinkData, LinkTypes, getPageTitle } from "../utils";
import { Editor } from "obsidian";
import { IObsidianProxy } from "./IObsidianProxy";
import { RegExPatterns } from "../RegExPatterns";
import { CommandBase, Func } from "./ICommand";
import { ITextBuffer } from "ITextBuffer";

export abstract class ConvertToMdlinkCommandBase extends CommandBase {

    obsidianProxy: IObsidianProxy;
    readonly EmailScheme: string = "mailto:";

    constructor(obsidianProxy: IObsidianProxy,
        isPresentInContextMenu: Func<boolean> = () => true, isEnabled: Func<boolean> = () => true) {
        super(isPresentInContextMenu, isEnabled);
        this.obsidianProxy = obsidianProxy;
    }

    async convertLinkToMarkdownLink(linkData: LinkData, editor: Editor, setCursor: boolean = true, linkOffset: number = 0) {
        let text = linkData.text ? linkData.text.content : "";
        const link = linkData.link ? linkData.link.content : "";

        if (linkData.type === LinkTypes.Wiki && !text) {
            text = link;
        }

        let destination = "";

        const urlRegEx = /^(http|https):\/\/[^ "]+$/i;
        if ((linkData.type === LinkTypes.Autolink || linkData.type === LinkTypes.PlainUrl) && linkData.link && urlRegEx.test(linkData.link.content)) {
            const notice = this.obsidianProxy.createNotice("Getting title ...", 0);
            try {
                text = await getPageTitle(new URL(linkData.link.content), this.getPageText.bind(this));
            }
            catch (error) {
                this.obsidianProxy.createNotice(error);
            }
            finally {
                notice.hide();
            }
        }

        let rawLinkText = "";
        if (linkData.type === LinkTypes.Autolink && linkData.link && RegExPatterns.Email.test(linkData.link.content)) {
            rawLinkText = `[${text}](${this.EmailScheme}${linkData.link.content})`;
        } else {
            destination = encodeURI(link);
            if (destination && linkData.type === LinkTypes.Wiki && (destination.indexOf("%20") > 0)) {
                destination = `<${destination.replace(/%20/g, " ")}>`;
            }

            //TODO: use const for !
            const embededSymbol = linkData.embedded ? '!' : ''
            rawLinkText = `${embededSymbol}[${text}](${destination})`
        }

        editor.replaceRange(
            rawLinkText,
            editor.offsetToPos(linkOffset + linkData.position.start),
            editor.offsetToPos(linkOffset + linkData.position.end));
        if (setCursor) {
            if (text) {
                editor.setCursor(editor.offsetToPos(linkData.position.start + rawLinkText.length));
            } else {
                editor.setCursor(editor.offsetToPos(linkData.position.start + 1));
            }
        }
    }

    //TODO: refactor
    async convertLinkToMarkdownLink1(linkData: LinkData, textBuffer: ITextBuffer, setCursor: boolean = true, linkOffset: number = 0) {
        let text = linkData.text ? linkData.text.content : "";
        const link = linkData.link ? linkData.link.content : "";

        if (linkData.type === LinkTypes.Wiki && !text) {
            text = link;
        }

        let destination = "";

        const urlRegEx = /^(http|https):\/\/[^ "]+$/i;
        if ((linkData.type === LinkTypes.Autolink || linkData.type === LinkTypes.PlainUrl) && linkData.link && urlRegEx.test(linkData.link.content)) {
            const notice = this.obsidianProxy.createNotice("Getting title ...", 0);
            try {
                text = await getPageTitle(new URL(linkData.link.content), this.getPageText.bind(this));
            }
            catch (error) {
                this.obsidianProxy.createNotice(error);
            }
            finally {
                notice.hide();
            }
        }

        let rawLinkText = "";
        if (linkData.type === LinkTypes.Autolink && linkData.link && RegExPatterns.Email.test(linkData.link.content)) {
            rawLinkText = `[${text}](${this.EmailScheme}${linkData.link.content})`;
        } else {
            destination = encodeURI(link);
            if (destination && linkData.type === LinkTypes.Wiki && (destination.indexOf("%20") > 0)) {
                destination = `<${destination.replace(/%20/g, " ")}>`;
            }

            //TODO: use const for !
            const embededSymbol = linkData.embedded ? '!' : ''
            rawLinkText = `${embededSymbol}[${text}](${destination})`
        }

        textBuffer.replaceRange(
            rawLinkText,
            linkOffset + linkData.position.start,
            linkOffset + linkData.position.end);
        if (setCursor) {
            if (text) {
                textBuffer.setPosition(linkData.position.start + rawLinkText.length);
            } else {
                textBuffer.setPosition(linkData.position.start + 1);
            }
        }
    }

    async getPageText(url: URL): Promise<string> {
        const response = await this.obsidianProxy.requestUrl({ url: url.toString() });
        if (response.status !== 200) {
            throw new Error(`Failed to request '${url}': ${response.status}`);
        }
        return response.text;
    }
}