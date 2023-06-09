# Obsidian Links

Manipulate links in Obsidian (https://obsidian.md).

- [Obsidian Links](#obsidian-links)
- [Features](#features)
  - [Unlink](#unlink)
  - [Delete link](#delete-link)
  - [Convert a wikilink or html link to a markdown link](#convert-a-wikilink-or-html-link-to-a-markdown-link)
  - [Convert markdown link to Wikilink](#convert-markdown-link-to-wikilink)
  - [Copy link destination to clipboard](#copy-link-destination-to-clipboard)
  - [Remove links from headings](#remove-links-from-headings)
  - [Edit link text](#edit-link-text)
  - [Edit link destination](#edit-link-destination)
  - [Add link text](#add-link-text)
  - [Create link from selection](#create-link-from-selection)
  - [Create link from clipboard](#create-link-from-clipboard)


# Features

## Unlink

- Command palette: **Unlink**
- Context menu: **Unlink**

<details>
<summary>Demo. Unlink single link.</summary>

![remove link](docs/img/unlink-link.gif)

</details>

<details>
<summary>Demo. Unlink links in selection.</summary>

![remove link](docs/img/unlink-selection.gif)

</details>


## Delete link

- Command palette: **Delete link**
- Context menu: **Delete**

<details>
<summary>Demo</summary>

![delete link](docs/img/delete-link.gif)

</details>

## Convert a wikilink or html link to a markdown link

Convert a wikilink or HTML link to markdown link. If a wiki link contains spaces a destination of a markdown link will be places in <>. HTML link must be expanded.

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
- Command palette: **Convert link to wikilink**
- Context menu: **Convert to wikilink**


<details>
<summary>Demo</summary>

![convert markdown link to wiki link](docs/img/convert-to-wikilink.gif)

</details>


## Copy link destination to clipboard

Copy link part of markdown, wiki or html link to clipboard.

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

## Add link text
Add link text, select it and place cursor at the end of the text. 
Link text depends on the kind of a link. 
For local notes text will be either file name of the note or popup with suggested link texts. Title separator can be specified in setting. 
For external http[s] links, page content is requested and link text is set to the title (content of `<title/>` element) of the page.


- Command palette: **Add link text**
- Context menu: **Add link text**


<details>
<summary>Demo. Link to local note</summary>

![Link to local note](docs/img/add-link-text-local.gif)

</details>

<details>
<summary>Demo. Link to a heading in local note</summary>

![Link to a heading in local note](docs/img/add-link-text-local-heading.gif)

</details>

<details>
<summary>Demo. External link</summary>

![External link](docs/img/add-link-text-external.gif)

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
