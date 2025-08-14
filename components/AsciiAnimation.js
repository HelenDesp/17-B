import React, { useState, useEffect, useMemo } from 'react';

// Animation frames copied from your HTML file
const originalFrames = [
    `_____________ o ____\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `_____________ o ___<\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                   o\n_____________ o __<(\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                   _\n                  o)\n_____________ o _<(_\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                   .\n                  __\n                 o)_\n_____________ o <(__\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                  .-\n                 __|\n                o)__\n_____________ o (__( \n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                   (\n                 .--\n                __|| \n               o)__ \n_____________ o __(*\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                   (\n                  ()\n                .--.\n               __||_\n              ~)__ |\n_____________.o _(*)\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                  ( \n                 (  \n               .--. \n              __||__\n             o)__ |_\n____________< o (*)_\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                  ( \n                  ) \n              .--.  \n             __||___\n            o)__ |_ \n___________<( o *)_(\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                   (\n                (   \n               ()   \n             .--.  -\n            __||___|\n           o)__ |_ |\n__________<(  o )_(*\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                  ( \n                 ) )\n              (     \n            .--.  --\n           __||___|[\n          o)__ |_ | \n_________<(_  o _(*)\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                 ) )\n              ()    \n           .--.  ---\n          __||___|[_ \n         o)__ |_ | .\n________<(_ ( o (*)_\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                  ( \n                (  )\n             ( ) )  \n            ()      \n          .--.  ----\n         __||___|[_]\n        o)__ |_ | ..\n_______<(__(* o *)_~\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                  ( \n                   )\n             (   )  \n            (       \n         .--.  -----\n        __||___|[_]|\n       o)__ |_ | ..|\n______<(__(*) o )_~_\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `              (  )  \n           ( )      \n          (         \n        .--.  ----- \n       __||___|[_]| \n      o)__ |_ | ..|=\n_____<(__(*)_ o _~__\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `               (    \n                )  ) \n            )       \n         ()        _\n       .--.  ----- |\n      __||___|[_]| |\n     o)__ |_ | ..|=|\n____<(__(*)_( o ~___\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `               (    \n             (  )   \n          (   )     \n          )       __\n      .--.  ----- | \n     __||___|[_]| |.\n    o)__ |_ | ..|=|_\n___<(__(*)_(* o ____\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `             (      \n           (  )  )  \n        ( ) )       \n       ()        ___\n     .--.  ----- |  \n    __||___|[_]| |.|\n   o)__ |_ | ..|=|_|\n__<(__(*)_(*) o ____\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `             (      \n                )   \n        ( )         \n       (        ____\n    .--.  ----- |  _\n   __||___|[_]| |.|#\n  o)__ |_ | ..|=|_|-\n_<(__(*)_(*)_ o ___~\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `           (        \n         (  )  )    \n      ( ) )         \n     ()        ____.\n   .--.  ----- |  _ \n  __||___|[_]| |.|#|\n o)__ |_ | ..|=|_|-|\n<(__(*)_(*)_~ o __~(\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `            )  )    \n      () )          \n     (        ____._\n  .--.  ----- |  _  \n __||___|[_]| |.|#|.\no)__ |_ | ..|=|_|-|_ \n(__(*)_(*)_~_ o _~(*\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `         ( )        \n       (  )         \n      ) )           \n   ()        ____.__\n .--.  ----- |  _  -\n__||___|[_]| |.|#|.[\n)__ |_ | ..|=|_|-|__\n__(*)_(*)_~__ o ~(*)\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `           )        \n       (  )         \n   (  ) )           \n    )       ____.___\n.--.  ----- |  _  - \n_||___|[_]| |.|#|.[]\n__ |_ | ..|=|_|-|___\n_(*)_(*)_~___ o (*)_\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `       (            \n     (  )  )        \n  ( ) )             \n ()        ____.____\n--.  ----- |  _  - g\n||___|[_]| |.|#|.[].\n_ |_ | ..|=|_|-|____\n(*)_(*)_~____ o *)__\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `      ( )           \n    (               \n (  )               \n )        ____._____\n-.  ----- |  _  - g:\n|___|[_]| |.|#|.[].[\n |_ | ..|=|_|-|_____\n*)_(*)_~____  o )___\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `     (              \n   (  )  )          \n( ) )               \n)        ____.______\n.  ----- |  _  - g:v\n___|[_]| |.|#|.[].[]\n|_ | ..|=|_|-|______\n)_(*)_~_____~ o ____\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `     ( )            \n   (  )             \n ( )                \n        ____.______.\n  ----- |  _  - g:v \n__|[_]| |.|#|.[].[].\n_ | ..|=|_|-|_______\n_(*)_~_____~( o ___(\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    ` (  )               \n) )                 \n       ____.______._\n ----- |  _  - g:v:r\n_|[_]| |.|#|.[].[].[\n | ..|=|_|-|________\n(*)_~_____~(* o __(*\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `  (                 \n(                   \n )                  \n      ____.______.__\n----- |  _  - g:v:r  \n|[_]| |.|#|.[].[].[]\n| ..|=|_|-|_________\n*)_~_____~(*) o _(*)\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    ` (                  \n                    \n)                   \n     ____.______.___\n---- |  _   - g:v:r   \n[_]| |.|#|.[].[].[]\n ..|=|_|-|__________\n)_~_____~(*)_ o (*)_\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    ` (                  \n )                  \n                    \n    ____.______.____\n--- |  _   - g:v:r -   \n_]| |.|#|.[].[].[]..\n..|=|_|-|___________\n_~_____~(*)__ o *)__\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                    \n)                   \n                    \n   ____.______._____\n-- |  _ - g:v:r - |\n]| |.|#|.[].[].[]..|\n.|=|_|-|___________|\n~_____~(*)___ o )___\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                    \n                    \n                    \n  ____.______._____ \n- |  _ - g:v:r - | \n| |.|#|.[].[].[]..| \n|=|_|-|___________| \n_____~(*)____ o ____\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                    \n                    \n                    \n ____.______._____  \n |  _ - g:v:r - | \n |.|#|.[].[].[]..|  \n=|_|-|___________|  \n____~(*)____( o ____\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                    \n                    \n                    \n ____.______._____  \n |  _ - g:v:r - | \n |.|#|.[].[].[]..|  \n=|_|-|___________|  \n____~(*)____( o ____\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                    \n                    \n                    \n ____.______._____  \n | ._ - g:v:r - | \n |.: |.[].[].[]..|  \n=|_: |___________|  \n____-(*)____( o ____\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                    \n                    \n                    \n ____.______._____  \n | ._ - g:v:r - | \n |.: |.[].[].[]..|  \n=|_: |___________|  \n____-(*)____( o ____\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                    \n                    \n                    \n ____.______._____  \n | ._ - g:v:r - | \n |.:o|.[].[].[]..|  \n=|_-||___________|  \n____<(*)____( o ____\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                    \n                    \n                    \n ____.______._____  \n | ._ - g:v:r - | \n |.: |.[].[].[]..|  \n=|_:o|__________.|  \n___/|\\\\,)____( o.____\n~ ~<< # ~ ~ ~< >~ ~ \n              |     `,
    `                    \n                    \n                    \n ____.______._____  \n | ._ - g:v:r - | \n |.: |.[].[].[]..|  \n=|_: |___________   \n___ o *)____( o.'___\n~ ~/|\\\\, ~ ~ ~< >~ ~ \n    | #       |     `,
    `                    \n                    \n                    \n ____.______._____  \n | ._ - g:v:r - | \n |.:o|.[].[].[]..   \n=|_: |_________ hi! \n___ o *)____( o  ___\n  ~ ~/|\\\\, ~ ~ ~/|>~ ~   \n    | #       |     `,
    `                    \n                    \n                    \n ____.______._____  \n | ._ - g:v:r - | \n |.:o|.[].[].[]..    \n=|_: |_____ .   hi! \n___ o *)___  \\\\o ____\n~ ~<< , ~ ~    >~ ~ \n    | #       |     `,
    `                    \n                    \n                    \n ____.______._____  \n | ._ - g:v:r - | \n |.:o|.[].[].[]..    \n=|_: |____  .  .hi! \n___  o )____ \\\\o ____\n~ ~  \\\\, ~ ~    >~ ~ \n    |\\\\#       |     `,
    `                    \n                    \n                    \n ____.______._____  \n | ._ - g:v:r - | \n |.:o|.[].[].[]..    \n=|_/||____      hi! \n___ < o , __ \\\\o ____\n~ ~   |~# ~ ~  >~ ~ \n     />       |     `,
    `                    \n                    \n                    \n ____.______._____  \n | ._ - g:v:r - | \n |.: |.[].[].[]..   \n=|_:o|________  hi! \n___ |  o ___( o ____\n~ ~<<  <, ~ ~  >~ ~ \n       /#     |     `,
    `                    \n                    \n                    \n ____.______._____  \n | ._ - g:v:r - | \n |.: |.[].[].[]..   \n=|_: |_________ -:. \n___ o * o __( o ____\n~ ~<|\\\\  ,.~ ~< >~ ~ \n    |   #\\\\    |     `,
    `                    \n                    \n                    \n ____.______._____  \n |  _ - g:v:r - | \n |.|#|.[].[].[]..   \n=|_|-|__________ .  \n___ o *) o _( o ____\n~ ~<|>~ ,<  ~< >~ ~ \n    |   #|    |     `,
    `                    \n                    \n                    \n____.______._____   \n|  _ - g:v:r - |  \n|.|#|.[].[].[]..|   \n|_|-|___________.   \n___ o )__ o *) o ___\n~ ~<|>~ ~ < ~ ~|. ~ \n    |    /#   /|    `,
    `                    \n                    \n                    \n___.______._____    \n  _ - g:v:r - |   \n.|#|.[].[].[]..|    \n_|-|___________|    \n__~ o ___ (o __ o___\n~ ~<|>~ ~  <  ~ < ~ \n    |      |#   |.  `,
    `                    \n                    \n                    \n__.______._____     \n _ - g:v:r - |    \n|#|.[].[].[]..|     \n|-|___________|     \n_~( o ___(* o __ o _\n~ ~<|>~ ~ ~ | ~  <. \n    |       #\\\\   >. `,
    `                    \n                    \n                    \n_.______._____      \n_ - g:v:r - |     \n#|.[].[].[]..|      \n-|___________|      \n~(* o___(*)_ o __ o \n~ ~<|>~ ~ ~ ,|~ ~ |\\\\\n    |       #>   /. `,
    `                    \n                    \n                    \n.______._____       \n - g:v:r - |      \n|.[].[].[]..|       \n|___________|       \n(*) o _(*)___ o __ o\n~ ~<|>~ ~ ~ ~,| ~ .|\n    |        #>   .>`,
    `                    \n                    \n                    \n______._____        \n- g:v:r - |       \n.[].[].[]..|        \n___________|        \n*)_ o (*)_____ o ___\n~ ~< \\\\~ ~ ~ ~  <~   \n    |\\\\        /#    `,
    `                    \n                    \n                    \n_____._____         \n g:v:r - |        \n[].[].[]..|         \n__________|         \n)___ o )_______ o __\n~ ~ <<~ ~ ~ ~ ~ |.  \n    /|         .|#  `,
    `                    \n                    \n                    \n____._____          \ng:v:r - |         \n].[].[]..|          \n_________|          \n____( o ________ o _\n~ ~ ~ |.~ ~ ~ ~  <  \n     .|          #\\\\ `,
    `                    \n                    \n                    \n___._____           \n:v:r - |          \n.[].[]..|           \n________|           \n___(*) o ________ o \n~ ~ ~ < ~ ~ ~ ~ ~,| \n       |\\\\        #> `,
    `                    \n                    \n                    \n__._____            \n:v:r - |            \n[].[]..|            \n_______|  .         \n__(*)__ o ________ o\n~ ~ ~ ~.|\\\\  ~ ~ ~  <\n       .>         #|`,
    `                    \n                    \n                    \n_._____             \nv:r - |             \n].[]..|     ,       \n______|   .         \n_(*)____ o _________\n~ ~ ~ ~  <  ~ ~ ~ ~ \n        /|          `,
    `                    \n                    \n                    \n._____              \n:r - |       .      \n.[]..|       ?      \n_____|     .        \n(*)______ o ________\n~ ~ ~ ~ ~ | ~ ~ ~ ~ \n         .>         `,
    `                    \n                    \n                    \n_____         .     \nr - |      - ? '    \n[]..|       , \`     \n____|               \n*)________ o _______\n~ ~ ~ ~ ~  |  ~ ~ ~ \n           |\\\\       `,
    `                    \n                    \n             .      \n____            .   \n - |       \` ?      \n]..|           '    \n___|                \n)__________ o ______\n~ ~ ~ ~ ~ ~ < ~ ~ ~ \n           .|       `,
    `                    \n           .        \n                    \n___      .       '  \n- |          ?      \n..|                 \n__|                 \n____________ o _____\n~ ~ ~ ~ ~ ~  |. ~ ~ \n            /|      `,
    `                    \n                    \n                    \n__                  \n |           :      \n.|                  \n_|                  \n_____________ o ____\n~ ~ ~ ~ ~ ~ ~ < ~ ~ \n             .|     `,
    `                    \n                    \n                    \n_                   \n|            .      \n|                   \n|                   \n_____________ o ____\n~ ~ ~ ~ ~ ~ ~ |>~ ~ \n             /|     `,
    `                    \n                    \n                    \n                    \n                    \n                    \n                    \n_____________ o ____\n~ ~ ~ ~ ~ ~ ~<|>~ ~ \n             /|     `,
    `                    \n                    \n                    \n                    \n                    \n                    \n                    \n_____________ o ____\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                    \n                    \n                    \n                    \n                    \n                    \n                    \n_____________ o ____\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                    \n                    \n                    \n                    \n                    \n                    \n                    \n_____________ o ____\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                    \n                    \n                    \n                    \n                    \n                    \n                    \n_____________ o ____\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `,
    `                    \n                    \n                    \n                    \n                    \n                    \n                    \n_____________ o ____\n~ ~ ~ ~ ~ ~ ~< >~ ~ \n              |     `
];

const speed = 140; // Animation speed in milliseconds

const AsciiAnimation = () => {
    const [currentFrame, setCurrentFrame] = useState(0);

    // Memoize the processed frames so the heavy logic runs only once.
    const normalizedFrames = useMemo(() => {
        // --- Horizontal Flip Logic ---
        const swapChars = { '(': ')', ')': '(', '<': '>', '>': '<', '[': ']', ']': '[', '{': '}', '}': '{', '/': '\\', '\\': '/' };
        const protectedWords = { '__HI__': 'hi!' };
        const placeholderKeys = Object.keys(protectedWords);

        const frames = originalFrames.map(frame => {
            let tempFrame = frame;
            placeholderKeys.forEach(key => {
                const regex = new RegExp(protectedWords[key].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
                tempFrame = tempFrame.replace(regex, key);
            });

            const lines = tempFrame.split('\n');
            const flippedLines = lines.map(line => {
                const reversedChars = line.split('').reverse();
                const swappedAndFlipped = reversedChars.map(char => swapChars[char] || char);
                return swappedAndFlipped.join('');
            });
            
            let flippedFrame = flippedLines.join('\n');

            placeholderKeys.forEach(key => {
                const flippedPlaceholder = key.split('').reverse().join('');
                const regex = new RegExp(flippedPlaceholder, 'g');
                flippedFrame = flippedFrame.replace(regex, protectedWords[key]);
            });
            
            return flippedFrame;
        });

        // --- Frame Normalization Logic (to prevent shifting) ---
        let maxHeight = 0;
        let maxWidth = 0;

        // First pass: find the maximum dimensions of any frame
        const framesAsLines = frames.map(f => f.split('\n'));

        framesAsLines.forEach(lines => {
            maxHeight = Math.max(maxHeight, lines.length);
            lines.forEach(line => {
                maxWidth = Math.max(maxWidth, line.length);
            });
        });

        // Second pass: normalize each frame to the max dimensions
        return framesAsLines.map(lines => {
            // 1. Pad each line on the right to match maxWidth. This prevents horizontal jitter.
            const blockLines = lines.map(line => line.padEnd(maxWidth, ' '));
            
            // 2. Add empty lines to the top to match maxHeight. This prevents vertical jitter.
            while (blockLines.length < maxHeight) {
                blockLines.unshift(' '.repeat(maxWidth));
            }

            return { frame: blockLines.join('\n') };
        });
    }, []);

    // Effect to handle the animation interval
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrame(prev => (prev + 1) % normalizedFrames.length);
        }, speed);

        return () => clearInterval(interval); // Cleanup on unmount
    }, [normalizedFrames.length]);
    
    // Inline styles to match the aesthetic of the original file and your dashboard
    const preStyle = {
        fontFamily: "'Courier New', monospace",
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#6b7280', // Tailwind's gray-500
        lineHeight: 1.1,
        backgroundColor: 'transparent',
        textAlign: 'center',
        overflow: 'hidden',
        margin: '0 auto'
    };

    return (
        <pre style={preStyle}>
            {normalizedFrames[currentFrame]?.frame || ''}
        </pre>
    );
};

export default AsciiAnimation;