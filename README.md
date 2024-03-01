# Obsidian Links <!-- omit in toc -->


Manipulate links in [Obsidian](https://obsidian.md).

- [Features](#features)
  - [Unlink](#unlink)
  - [Delete link](#delete-link)
  - [Convert wikilink or html link to markdown link](#convert-wikilink-or-html-link-to-markdown-link)
  - [Convert markdown link to Wikilink](#convert-markdown-link-to-wikilink)
  - [Convert markdown link to autolink](#convert-markdown-link-to-autolink)
  - [Convert autolink to markdown link](#convert-autolink-to-markdown-link)
  - [Convert URL to markdown link](#convert-url-to-markdown-link)
  - [Convert URL to autolink](#convert-url-to-autolink)
  - [Convert multiple links](#convert-multiple-links)
    - [Convert all links to markdown links](#convert-all-links-to-markdown-links)
    - [Convert wikilinks to markdown links](#convert-wikilinks-to-markdown-links)
    - [Convert autolinks to markdown links](#convert-autolinks-to-markdown-links)
    - [Convert URLs to markdown links](#convert-urls-to-markdown-links)
    - [Convert HTML links to markdown links](#convert-html-links-to-markdown-links)
  - [Copy link destination to clipboard](#copy-link-destination-to-clipboard)
  - [Remove links from headings](#remove-links-from-headings)
    - [Configuration](#configuration)
      - [Internal wikilink without text](#internal-wikilink-without-text)
  - [Edit link text](#edit-link-text)
  - [Edit link destination](#edit-link-destination)
  - [Set link text](#set-link-text)
  - [Set link text from clipboard](#set-link-text-from-clipboard)
  - [Create link from selection](#create-link-from-selection)
  - [Create link from clipboard](#create-link-from-clipboard)
  - [Embed / Unembed files](#embed--unembed-files)
  - [Copy link](#copy-link)
  - [Cut link](#cut-link)


# Features

## Unlink

Unlink single link or all links in a selection.

- Command palette: **Unlink**
- Context menu: **Unlink**

<details>
<summary>Demo. Single link.</summary>

![remove link](docs/img/unlink-link.gif)

</details>

<details>
<summary>Demo. Links in a selection.</summary>

![remove link](docs/img/unlink-selection.gif)

</details>


## Delete link

- Command palette: **Delete link**
- Context menu: **Delete**


If the target file for the deleted link is unreferenced the prompt to delete the file is displayed.
Configure this feature in the plugin settings:
![delete unreferenced link target on delete link](/docs/img/delete-unreferenced-link-target-on-delete-link-setting.png)

<details>
<summary>Demo. Wikilink</summary>

![delete link](docs/img/delete-wikilink.gif)

</details>

<details>
<summary>Demo. Makdown link</summary>

![delete link](docs/img/delete-markdown-link.gif)

</details>

<details>
<summary>Demo. Autolink</summary>

![delete link](docs/img/delete-autolink.gif)

</details>


## Convert wikilink or html link to markdown link

Convert a wikilink or HTML link to a markdown link. If a wiki link contains spaces a destination of a markdown link will be places in `<>`. HTML link must be expanded.

If a wikilink destination doesn't have an extension, the `.md` extension can be added to a markdown link destination after conversion by enabling the **Convert to Markdown link | Append extension** option in Settings.


- Command palette: **Convert to markdown link**
- Context menu: **Convert to markdown link**


<details>
<summary>Demo. Wikilink</summary>

![convert wikilink to markdown link](docs/img/convert-wikilink-to-mdlink.gif)

</details>

<details>
<summary>Demo. HTML link</summary>

![convert html link to markdown link](docs/img/convert-htmllink-to-mdlink.gif)

</details>

see [Convert wikilinks to markdown links](#convert-wikilinks-to-markdown-links)<br/>
see [Convert HTML links to markdown links](#convert-html-links-to-markdown-links)


## Convert markdown link to Wikilink
- Command palette: **Convert to wikilink**
- Context menu: **Convert to wikilink**


<details>
<summary>Demo</summary>

![convert markdown link to wiki link](docs/img/convert-to-wikilink.gif)

</details>

## Convert markdown link to autolink

Converts a markdown link with an absolute URL or an email address to an autolink.

- Command palette: **Convert to autolink**
- Context menu: **Convert to autolink**


<details>
<summary>Demo. Markdown link with absolute URL.</summary>

![convert markdown link to wiki link](docs/img/convert-markdown-url-link-to-autolink.gif)

</details>

<details>
<summary>Demo. Markdown link with email address.</summary>

![convert markdown link to wiki link](docs/img/convert-markdown-email-link-to-autolink.gif)

</details>

## Convert autolink to markdown link

Convert an autolink to a markdown link.
If an autolink has an absolute URI with `http` or `https` scheme content of the `<title/>` element will be set as a link text. If request fails or the URL has other scheme cursor will be placed inside the `[]` of the markdown link. For email autolink `mailto` scheme will be added before email address.

- Command palette: **Convert to markdown link**
- Context menu: **Convert to markdown link**

<details>
<summary>Demo. Convert autolink to markdown link</summary>

![convert to markdown link](/docs/img/convert-autolink-to-markdown-link.gif)

</details>

see [Convert autolinks to markdown links](#convert-autolinks-to-markdown-links)

## Convert URL to markdown link

Convert a raw URL to a markdown link.
If a URL has an absolute URI with `http` or `https` scheme content of the `<title/>` element will be set as a link text. If request fails or the URL has other scheme cursor will be placed inside the `[]` of the markdown link.

- Command palette: **Convert to markdown link**
- Context menu: **Convert to markdown link**

<details>
<summary>Demo. Convert a URL to a markdown link</summary>

![convert to markdown link](/docs/img/convert-url-to-markdown-link.gif)

</details>

see [Convert URLs to markdown links](#convert-urls-to-markdown-links)

## Convert URL to autolink

Convert an absolute URL to an autolink.

- Command palette: **Convert to autolink**
- Context menu: **Convert to autolink**

<details>
<summary>Demo. Convert an absolute URL to an autolink</summary>

![convert to markdown link](/docs/img/convert-url-to-autolink.gif)

</details>

## Convert multiple links

Converts multiple links in a note or in a selection to markdown links.

### Convert all links to markdown links
Convert plain URLs, html links, wiki links, autolinks in a note or in a selection to markdown links.
For URLs and autolinks with absolute URL with `http://` or `https://` schemes link text will be set to a content of a `<title/>` element of the page loaded from the URL.

If a wikilink destination doesn't have an extension, the `.md` extension can be added to a markdown link destination after conversion by enabling the **Convert to Markdown link | Append extension** option in Settings.

- Command palette: **Convert all links to Markdown links**
- Context menu: **Convert all links to Markdown links** (enable in Settings)

<details>
<summary>Demo. Convert all links in a note to markdown links </summary>

![remove link](/docs/img/convert-all-to-mdlinks.gif)

</details>

<details>
<summary>Demo. Convert all links in a selection to markdown links </summary>

![remove link](/docs/img/convert-all-in-selection-to-mdlinks.gif)

</details>

### Convert wikilinks to markdown links
Convert multiple wikilinks in a note or in a selection to markdown links.

If a wikilink destination doesn't have an extension, the `.md` extension can be added to a markdown link destination after conversion by enabling the **Convert to Markdown link | Append extension** option in Settings.


- Command palette: **Convert Wikilinks to Markdown links**
- Context menu: **Convert Wikilinks to Markdown links** (enable in Settings)

Demo. see [Convert all links to markdown links](#convert-all-links-to-markdown-links)

see [Convert all links to markdown links](#convert-all-links-to-markdown-links)

### Convert autolinks to markdown links
Convert multiple autolinks in a note or in a selection to markdown links.
For autolinks with absolute URL with `http://` or `https://` schemes link text will be set to a content of a `<title/>` element of the page loaded from the URL.

- Command palette: **Convert Autolinks to Markdown links**
- Context menu: **Convert Autolinks to Markdown links** (enable in Settings)

Demo. see [Convert all links to markdown links](#convert-all-links-to-markdown-links)

### Convert URLs to markdown links
Convert multiple raw URLs in a note or in a selection to markdown links.
For absolute URLs with `http://` or `https://` schemes link text will be set to a content of a `<title/>` element of the page loaded from the URL.

- Command palette: **Convert URLs to Markdown links**
- Context menu: **Convert URLs to Markdown links** (enable in Settings)

Demo. see [Convert all links to markdown links](#convert-all-links-to-markdown-links)

### Convert HTML links to markdown links
Convert multiple raw URLs in a note or in a selection to markdown links.

- Command palette: **Convert HTML links to Markdown links**
- Context menu: **Convert HTML links to Markdown links** (enable in Settings)

Demo. see [Convert all links to markdown links](#convert-all-links-to-markdown-links)

## Copy link destination to clipboard

Copy link part of markdown, wiki or html link to the clipboard.

- Command palette: **Copy link destination**
- Context menu: **Copy link destination**

<details>
<summary>Demo</summary>

![copy link destination to clipboard](docs/img/copy-link-destination.gif)

</details>


## Remove links from headings

Remove links from headings in selection or in an entier note. 
Each link is replaced with it's text. Links without text are removed. Wikilink without text by default replaced with it's destination.

- Command palette:  **Remove links from headings**

<details>
<summary>Demo</summary>

![Remove links from headings](docs/img/remove-links-from-headings.gif)

</details>

### Configuration

#### Internal wikilink without text

Available options:
- Remove
- Replace with destination   [default]
- Replace with lowest heading

<details>
<summary>Demo. Remove</summary>
Original text:

![Alt text](/docs/img/heading-wikilink-notext-subheadings.png)

After command execution:

![Alt text](/docs/img/heading-wikilink-notext-result-remove.png)

</details>

<details>
<summary>Demo. Replace with destination</summary>
Original text:

![Alt text](/docs/img/heading-wikilink-notext-subheadings.png)

After command execution:

![Alt text](/docs/img/heading-wikilink-notext-result-destination.png)

</details>

<details>
<summary>Demo. Replace with lowest heading</summary>
Original text:

![Alt text](/docs/img/heading-wikilink-notext-subheadings.png)

After command execution:

![Alt text](/docs/img/heading-wikilink-notext-result-lowest-heading.png)

</details>

## Edit link text

Select link text and place cursor at the end of the text

- Command palette: **Edit link text**
- Context menu: **Edit link text**

<details>
<summary>Demo</summary>

![Edit link text](docs/img/edit-link-text.gif)

</details>

## Edit link destination

Select link text and place cursor at the end of the text

- Command palette: **Edit link destination**
- Context menu: **Edit link destination**

<details>
<summary>Demo</summary>

![Edit link text](docs/img/edit-link-destination.gif)

</details>

## Set link text
Change or add link text, select it and place cursor at the end of the text. 
Link text depends on the kind of a link. 
For local notes text will be either file name of the note or popup with suggested link texts. Title separator can be specified in the plugin settings. 
For external http[s] links, page content is requested and link text is set to the title (content of `<title/>` element) of the requested page content.

- Command palette: **Set link text**
- Context menu: **Set link text**


<details>
<summary>Demo. Link to a local note</summary>

![Link to local note](docs/img/set-link-text-local.gif)

</details>

<details>
<summary>Demo. Link to a heading in a local note</summary>

![Link to a heading in local note](docs/img/set-link-text-local-heading.gif)

</details>

<details>
<summary>Demo. External link</summary>

![External link](docs/img/set-link-text-external.gif)

</details>

## Set link text from clipboard

Set markdown, wikilink or URL text from clipboard.
Links that can't have text, like URL, will be converted to markdown link.

- Command palette: **Set link text from clipboard**
- Context menu: **Set link text from clipboard**

<details>
<summary>Demo.</summary>

![set link text from clipbaord](/docs/img/set-link-text-from-clipboard.gif)

</details>

<details>
<summary>Demo. Link to image</summary>

![set link text from clipbaord](/docs/img/set-image-link-text-from-clipboard.gif)

</details>


## Create link from selection
Create link from selected text.

- Command palette: **Create link**
- Context menu: **Create link**


<details>
<summary>Demo</summary>

![Create link from selection](docs/img/create-wikilink-from-selection.gif)

</details>

## Create link from clipboard
Create link from textual content of the system clipboard.

- Command palette: **Create link from clipboard**
- Context menu: **Create link from clipboard**


<details>
<summary>Demo</summary>

![Create link from clipboard](docs/img/create-mdlink-from-clipboard.gif)

</details>

## Embed / Unembed files

Add or remove [file embedding](https://help.obsidian.md/Linking+notes+and+files/Embedding+files#:~:text=To%20embed%20a%20file%20in,of%20the%20Accepted%20file%20formats.) from a wikilink or a markdown link.

- Command palette: Embed / Unembed link
- Context menu: Embed / Unembed

<details>
<summary>Demo. Embed </summary>

![remove link](/docs/img/embed-link.gif)

</details>

<details>
<summary>Demo. Unembed </summary>

![remove link](/docs/img/unembed-link.gif)

</details>

## Copy link

Copy markdown, wiki, auto, html link or plain url to the clipboard

- Command palette: Copy link
- Context menu: Copy link

<details>
<summary>Demo. Copy link to the clipbard </summary>

![remove link](/docs/img/copy-link-to-clipboard.gif)

</details>

## Cut link

Cut markdown, wiki, auto, html link or plain url to the clipboard

- Command palette: Cut link
- Context menu: Cut link

<details>
<summary>Demo. Cut link to the clipbard </summary>

![remove link](/docs/img/cut-link-to-clipboard.gif)

</details>
