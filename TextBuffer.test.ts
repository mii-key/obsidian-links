// import { ITextBuffer } from "./ITextBuffer";
import { TextBuffer } from "./TextBuffer";

test.each(
    [
        {
            name: 'middle',
            text: "Consequat pariatur mollit veniam proident laborum reprehenderit duis excepteur.",
            replacement: "Irure laboris officia",
            from: "Consequat paria".length,
            to: "Consequat pariatur mollit veniam proi".length,
            expected: "Consequat pariaIrure laboris officiadent laborum reprehenderit duis excepteur."

        },
        {
            name: 'start',
            text: "Consequat pariatur mollit veniam proident laborum reprehenderit duis excepteur.",
            replacement: "Irure laboris officia",
            from: 0,
            to: "Consequat pariatur mollit veniam proi".length,
            expected: "Irure laboris officiadent laborum reprehenderit duis excepteur."

        },
        {
            name: 'end',
            text: "Consequat pariatur mollit veniam proident laborum reprehenderit duis excepteur.",
            replacement: "Irure laboris officia",
            from: "Consequat paria".length,
            to: undefined,
            expected: "Consequat pariaIrure laboris officia"

        }
    ])('replaceRange $name', ({ name, text, replacement, from, to, expected }) => {
        const buffer = new TextBuffer(text);
        //
        buffer.replaceRange(replacement, from, to);
        const result = buffer.getValue();
        //
        expect(result).toBe(expected);
    });