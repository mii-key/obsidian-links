# Obsidian Links <!-- omit in toc -->

Manipulate links in Obsidian (https://obsidian.md).

- [Features](#features)
  - [Unlink](#unlink)
  - [Delete link](#delete-link)
  - [Convert wikilink or html link to markdown link](#convert-wikilink-or-html-link-to-markdown-link)
  - [Convert markdown link to Wikilink](#convert-markdown-link-to-wikilink)
  - [Convert markdown link to autolink](#convert-markdown-link-to-autolink)
  - [Copy link destination to clipboard](#copy-link-destination-to-clipboard)
  - [Remove links from headings](#remove-links-from-headings)
  - [Edit link text](#edit-link-text)
  - [Edit link destination](#edit-link-destination)
  - [Set link text](#set-link-text)
  - [Create link from selection](#create-link-from-selection)
  - [Create link from clipboard](#create-link-from-clipboard)
  - [Convert autolink to markdown link](#convert-autolink-to-markdown-link)
  - [Embed / Unembed files](#embed--unembed-files)


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

Convert a wikilink or HTML link to a markdown link. If a wiki link contains spaces a destination of a markdown link will be places in <>. HTML link must be expanded.

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

- Command palette:  **Remove links from headings**

<details>
<summary>Demo</summary>

![Remove links from headings](docs/img/remove-links-from-headings.gif)

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
For local notes text will be either file name of the note or popup with suggested link texts. Title separator can be specified in the plugin setting. 
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

![Create link from selection](docs/img/create-mdlink-from-clipboard.gif)

</details>

## Convert autolink to markdown link

Convert an autolink to a markdown link.
If an autolink has an absolute URI with `http` or `https` scheme content of the `<page/>` element will be set as a link text. If request fails or the URL has other scheme cursor will be places inside the `[]` of the markdown link. For email autolink `mailto` scheme will be added before email address.

<details>
<summary>Demo. Convert autolink to markdown link</summary>

![convert to markdown link](/docs/img/convert-autolink-to-markdown-link.gif)

</details>

## Embed / Unembed files

Add or remove [file embedding](https://help.obsidian.md/Linking+notes+and+files/Embedding+files#:~:text=To%20embed%20a%20file%20in,of%20the%20Accepted%20file%20formats.) from a wikilink or a markdown link.

<details>
<summary>Demo. Embed </summary>

![remove link](/docs/img/embed-link.gif)

</details>

<details>
<summary>Demo. Unembed </summary>

![remove link](/docs/img/unembed-link.gif)

</details>
