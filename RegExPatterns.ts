export class RegExPatterns {
    static readonly Email = /([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)/;
    //static readonly AbsoluteUri = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/;
    static readonly AbsoluteUri = /^[a-z][a-z+-\.]+:\/\/.+/;
    static readonly Wikilink = /(!?)\[\[([^\[\]|]*)(\|([^\[\]]*))?\]\]/;
    static readonly Markdownlink = /(!?)\[([^\]\[]*)\]\(([^)(]*)\)/;
    static readonly Htmllink = /<a\s+[^>]*href\s*=\s*['"]([^'"]*)['"][^>]*>(.*?)<\/a>/;
    static readonly AutolinkUrl = /<([a-zA-Z]{2,32}:[^>]+)>/;
    static readonly AutolinkMail = /<([a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)>/;
    static readonly PlainUrl = /\b((?:[a-z][\w\-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))*\))+(?:\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/
    static readonly InvalidNoteNameChars = /[#^\[\]\|*"\/\\<>:?]/
    static readonly NoteHeader = /^#+\s+(.*)$/
    static readonly AbsoluteUriCheck = /^(?:[a-z+]+:)?\/\//;
    static readonly AbsoluteFilePathCheck = /^\/|([a-z]:[\/\\])/;
    //TODO: fix
    static readonly CodeBlock = /(\`{3}([a-z#\s\"]*?)\n+)(.*?)(\n+\`{3})/;
    static readonly ImageDimentions = /((\d+)|((\d+)x(\d+)))$/;

    static readonly Frontmatter = /(\-{3}\n+)(.*?)(\n*\-{3}\n)/;
}