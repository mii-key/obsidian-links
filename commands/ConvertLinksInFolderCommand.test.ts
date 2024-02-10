import { expect, test } from '@jest/globals';

import { EditorMock } from './EditorMock'
import { ObsidianProxyMock } from './ObsidianProxyMock';
import { ConvertLinksInFolderCommand } from './ConvertLinksInFolderCommand';
import { TFile, VaultMock } from '../VaultMock';

describe('ConvertLinksInFolderCommand test', () => {

    test('status', () => {
        const editor = new EditorMock()
        const obsidianProxyMock = new ObsidianProxyMock()
        const cmd = new ConvertLinksInFolderCommand(obsidianProxyMock)
        //
        const result = cmd.handler(editor, true)
        //
        expect(result).toBe(true)
        expect(editor.__mocks.replaceRange.mock.calls).toHaveLength(0)
    })



    const convertData = [
        {
            name: "wiki links",
            files: [
                {
                    filePath: 'note 1.md',
                    content: 'Nulla ut sint in [[laboris|excepteur]] consequat cillum [[anim|minim]] sit ad. Labore ex quis magna',
                    expected: 'Nulla ut sint in [excepteur](laboris) consequat cillum [minim](anim) sit ad. Labore ex quis magna'
                },
                {
                    filePath: 'note 2.md',
                    content: 'Labore amet ut ea [[quis]] laboris id est [[deserunt|nisi]] cupidatat aliquip elit deserunt. Laboris nulla',
                    expected: 'Labore amet ut ea [quis](quis) laboris id est [nisi](deserunt) cupidatat aliquip elit deserunt. Laboris nulla'
                },
            ]
        },
        {
            name: "wiki links, mdlinkAppendMdExtension=true",
            mdlinkAppendMdExtension: true,
            files: [
                {
                    filePath: 'note 1.md',
                    content: 'Nulla ut sint in [[laboris|excepteur]] consequat cillum [[anim|minim]] sit ad. Labore [[ex.doc|quis]] magna',
                    expected: 'Nulla ut sint in [excepteur](laboris.md) consequat cillum [minim](anim.md) sit ad. Labore [quis](ex.doc) magna'
                },
                {
                    filePath: 'note 2.md',
                    content: 'Labore amet ut ea [[quis]] laboris id est [[deserunt|nisi]] cupidatat aliquip elit deserunt. Laboris nulla',
                    expected: 'Labore amet ut ea [quis](quis.md) laboris id est [nisi](deserunt.md) cupidatat aliquip elit deserunt. Laboris nulla'
                },
            ]
        },
        {
            name: "wikilinks, skip code blocks",
            files: [
                {
                    filePath: 'note 1.md',
                    content: 'Nulla ut sint in [[laboris|excepteur]]\n```\n [[aliquip]]\n```\n consequat cillum [[anim|minim]] sit ad. Labore ex quis magna',
                    expected: 'Nulla ut sint in [excepteur](laboris)\n```\n [[aliquip]]\n```\n consequat cillum [minim](anim) sit ad. Labore ex quis magna'
                }
            ]
        },

    ];

    test.only.each(convertData
    )('convert - $name', ({ name, mdlinkAppendMdExtension, files }, done) => {
        const editor = new EditorMock()

        const vault = new VaultMock();
        const obsidianProxyMock = new ObsidianProxyMock(vault);
        obsidianProxyMock.settings.onConvertToMdlinkAppendMdExtension = !!mdlinkAppendMdExtension;
        vault.__mocks.getActiveNoteView.mockReturnValue({
            file: {
                parent: vault.getRoot()
            }
        })
        const tFiles = files.map(f => {
            return new TFile(f.filePath, vault.getRoot())
        });
        vault.__mocks.getFilesInFolder.mockReturnValue(tFiles);
        vault.__mocks.read.mockImplementation((f: TFile) => {
            return Promise.resolve(files.filter(i => i.filePath == f.path)[0].content);
        })
        vault.__mocks.modify.mockReturnValue(Promise.resolve());

        const cmd = new ConvertLinksInFolderCommand(obsidianProxyMock, () => true, () => true, (err, data) => {
            if (err) {
                done(err)
                return
            }
            try {
                expect(vault.__mocks.modify.mock.calls).toHaveLength(files.length);
                for (let call = 0; call < files.length; call++) {
                    expect(vault.__mocks.modify.mock.calls[call][0].path).toBe(files[call].filePath)
                    expect(vault.__mocks.modify.mock.calls[call][1]).toBe(files[call].expected)
                }
                done()
            }
            catch (err) {
                done(err)
            }
        })

        // //
        cmd.handler(editor, false)
        // //
    })

})