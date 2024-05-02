import { test } from '@jest/globals';


describe('CopyLinkToBlockToClipboardCommand test', () => {

    test.skip.each(
        [
            {
                name: "test1",
                text: "text",
                expectedEnabled: true
            },

        ]
    )('status - cursor on [$name]', ({ name, text, expectedEnabled }) => {
        //TODO:
    })

    test.skip.each(
        [
            {
                name: "test1",
                text: "text",
                expected: "exp"
            },

        ]
    )('copy - [$name] - success', ({ name, text, expected }) => {

        //TODO:
    })

})