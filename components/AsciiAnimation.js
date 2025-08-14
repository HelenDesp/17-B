import React, { useState, useEffect, useMemo } from 'react';

// This is the unmodified, original array of frames from your HTML file.
const originalFrames = [
    `_____________ o ____
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `_____________ o ___<
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                   o
_____________ o __<(
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                   _
                  o)
_____________ o _<(_
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                   .
                  __
                 o)_
_____________ o <(__
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                  .-
                 __|
                o)__
_____________ o (__(
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                   (
                 .--
                __||
               o)__ 
_____________ o __(*
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                   (
                  ()
                .--.
               __||_
              ~)__ |
_____________.o _(*)
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                  ( 
                 (  
               .--. 
              __||__
             o)__ |_
____________< o (*)_
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                  ( 
                  ) 
              .--.  
             __||___
            o)__ |_ 
___________<( o *)_(
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                   (
                (   
               ()   
             .--.  -
            __||___|
           o)__ |_ |
__________<(  o )_(*
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                  ( 
                 ) )
              (     
            .--.  --
           __||___|[
          o)__ |_ | 
_________<(_  o _(*)
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                 ) )
              ()    
           .--.  ---
          __||___|[_
         o)__ |_ | .
________<(_ ( o (*)_
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                  ( 
                (  )
             ( ) )  
            ()      
          .--.  ----
         __||___|[_]
        o)__ |_ | ..
_______<(__(* o *)_~
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                  ( 
                   )
             (   )  
            (       
         .--.  -----
        __||___|[_]|
       o)__ |_ | ..|
______<(__(*) o )_~_
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `              (  )  
           ( )      
          (         
        .--.  ----- 
       __||___|[_]| 
      o)__ |_ | ..|=
_____<(__(*)_ o _~__
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `               (    
                )  )
            )       
         ()        _
       .--.  ----- |
      __||___|[_]| |
     o)__ |_ | ..|=|
____<(__(*)_( o ~___
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `               (    
             (  )   
          (   )     
          )       __
      .--.  ----- | 
     __||___|[_]| |.
    o)__ |_ | ..|=|_
___<(__(*)_(* o ____
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `             (      
           (  )  )  
        ( ) )       
       ()        ___
     .--.  ----- |  
    __||___|[_]| |.|
   o)__ |_ | ..|=|_|
__<(__(*)_(*) o ____
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `             (      
                )   
        ( )         
       (        ____
    .--.  ----- |  _
   __||___|[_]| |.|#
  o)__ |_ | ..|=|_|-
_<(__(*)_(*)_ o ___~
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `           (        
         (  )  )    
      ( ) )         
     ()        ____.
   .--.  ----- |  _ 
  __||___|[_]| |.|#|
 o)__ |_ | ..|=|_|-|
<(__(*)_(*)_~ o __~(
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `            )  )    
      () )          
     (        ____._
  .--.  ----- |  _  
 __||___|[_]| |.|#|.
o)__ |_ | ..|=|_|-|_
(__(*)_(*)_~_ o _~(*
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `         ( )        
       (  )         
      ) )           
   ()        ____.__
 .--.  ----- |  _  -
__||___|[_]| |.|#|.[
)__ |_ | ..|=|_|-|__
__(*)_(*)_~__ o ~(*)
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `           )        
       (  )         
   (  ) )           
    )       ____.___
.--.  ----- |  _  - 
_||___|[_]| |.|#|.[]
__ |_ | ..|=|_|-|___
_(*)_(*)_~___ o (*)_
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `       (            
     (  )  )        
  ( ) )             
 ()        ____.____
--.  ----- |  _  - g
||___|[_]| |.|#|.[].
_ |_ | ..|=|_|-|____
(*)_(*)_~____ o *)__
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `      ( )           
    (               
 (  )               
 )        ____._____
-.  ----- |  _  - g:
|___|[_]| |.|#|.[].[
 |_ | ..|=|_|-|_____
*)_(*)_~____  o )___
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `     (              
   (  )  )          
( ) )               
)        ____.______
.  ----- |  _  - g:v
___|[_]| |.|#|.[].[]
|_ | ..|=|_|-|______
)_(*)_~_____~ o ____
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `     ( )            
   (  )             
 ( )                
        ____.______.
  ----- |  _  - g:v 
__|[_]| |.|#|.[].[].
_ | ..|=|_|-|_______
_(*)_~_____~( o ___(
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    ` (  )               
) )                 
       ____.______._
 ----- |  _  - g:v:r
_|[_]| |.|#|.[].[].[
 | ..|=|_|-|________
(*)_~_____~(* o __(*
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `  (                 
(                   
 )                  
      ____.______.__
----- |  _  - g:v:r  
|[_]| |.|#|.[].[].[]
| ..|=|_|-|_________
*)_~_____~(*) o _(*)
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    ` (                  
                    
)                   
     ____.______.___
---- |  _   - g:v:r   
[_]| |.|#|.[].[].[]
 ..|=|_|-|__________
)_~_____~(*)_ o (*)_
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    ` (                  
 )                  
                    
    ____.______.____
--- |  _   - g:v:r -   
_]| |.|#|.[].[].[]..
..|=|_|-|___________
_~_____~(*)__ o *)__
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                    
)                   
                    
   ____.______._____
-- |  _ - g:v:r - |
]| |.|#|.[].[].[]..|
.|=|_|-|___________|
~_____~(*)___ o )___
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                    
                    
                    
  ____.______._____ 
- |  _ - g:v:r - | 
| |.|#|.[].[].[]..| 
|=|_|-|___________| 
_____~(*)____ o ____
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                    
                    
                    
 ____.______._____  
 |  _ - g:v:r - | 
 |.|#|.[].[].[]..|  
=|_|-|___________|  
____~(*)____( o ____
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                    
                    
                    
 ____.______._____  
 |  _ - g:v:r - | 
 |.|#|.[].[].[]..|  
=|_|-|___________|  
____~(*)____( o ____
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                    
                    
                    
 ____.______._____  
 | ._ - g:v:r - | 
 |.: |.[].[].[]..|  
=|_: |___________|  
____-(*)____( o ____
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                    
                    
                    
 ____.______._____  
 | ._ - g:v:r - | 
 |.: |.[].[].[]..|  
=|_: |___________|  
____-(*)____( o ____
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                    
                    
                    
 ____.______._____  
 | ._ - g:v:r - | 
 |.:o|.[].[].[]..|  
=|_-||___________|  
____<(*)____( o ____
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                    
                    
                    
 ____.______._____  
 | ._ - g:v:r - | 
 |.: |.[].[].[]..|  
=|_:o|__________.|  
___/|\\,)____( o.____
~ ~<< # ~ ~ ~< >~ ~ 
              |     `,
    `                    
                    
                    
 ____.______._____  
 | ._ - g:v:r - | 
 |.: |.[].[].[]..|  
=|_: |___________   
___ o *)____( o.'___
~ ~/|\\, ~ ~ ~< >~ ~ 
    | #       |     `,
    `                    
                    
                    
 ____.______._____  
 | ._ - g:v:r - | 
 |.:o|.[].[].[]..   
=|_: |_________ hi! 
___ o *)____( o  ___
  ~ ~/|\\, ~ ~ ~/|>~ ~   
    | #       |     `,
    `                    
                    
                    
 ____.______._____  
 | ._ - g:v:r - | 
 |.:o|.[].[].[]..    
=|_: |_____ .   hi! 
___ o *)___  \\o ____
~ ~<< , ~ ~    >~ ~ 
    | #       |     `,
    `                    
                    
                    
 ____.______._____  
 | ._ - g:v:r - | 
 |.:o|.[].[].[]..    
=|_: |____  .  .hi! 
___  o )____ \\o ____
~ ~  \\, ~ ~    >~ ~ 
    |\\#       |     `,
    `                    
                    
                    
 ____.______._____  
 | ._ - g:v:r - | 
 |.:o|.[].[].[]..    
=|_/||____      hi! 
___ < o , __ \\o ____
~ ~   |~# ~ ~  >~ ~ 
     />       |     `,
    `                    
                    
                    
 ____.______._____  
 | ._ - g:v:r - | 
 |.: |.[].[].[]..   
=|_:o|________  hi! 
___ |  o ___( o ____
~ ~<<  <, ~ ~  >~ ~ 
       /#     |     `,
    `                    
                    
                    
 ____.______._____  
 | ._ - g:v:r - | 
 |.: |.[].[].[]..   
=|_: |_________ -:. 
___ o * o __( o ____
~ ~<|\\  ,.~ ~< >~ ~ 
    |   #\\    |     `,
    `                    
                    
                    
 ____.______._____  
 |  _ - g:v:r - | 
 |.|#|.[].[].[]..   
=|_|-|__________ .  
___ o *) o _( o ____
~ ~<|>~ ,<  ~< >~ ~ 
    |   #|    |     `,
    `                    
                    
                    
____.______._____   
|  _ - g:v:r - |  
|.|#|.[].[].[]..|   
|_|-|___________.   
___ o )__ o *) o ___
~ ~<|>~ ~ < ~ ~|. ~ 
    |    /#   /|    `,
    `                    
                    
                    
___.______._____    
  _ - g:v:r - |   
.|#|.[].[].[]..|    
_|-|___________|    
__~ o ___ (o __ o___
~ ~<|>~ ~  <  ~ < ~ 
    |      |#   |.  `,
    `                    
                    
                    
__.______._____     
 _ - g:v:r - |    
|#|.[].[].[]..|     
|-|___________|     
_~( o ___(* o __ o _
~ ~<|>~ ~ ~ | ~  <. 
    |       #\\   >. `,
    `                    
                    
                    
_.______._____      
_ - g:v:r - |     
#|.[].[].[]..|      
-|___________|      
~(* o___(*)_ o __ o 
~ ~<|>~ ~ ~ ,|~ ~ |\\
    |       #>   /. `,
    `                    
                    
                    
.______._____       
 - g:v:r - |      
|.[].[].[]..|       
|___________|       
(*) o _(*)___ o __ o
~ ~<|>~ ~ ~ ~,| ~ .|
    |        #>   .>`,
    `                    
                    
                    
______._____        
- g:v:r - |       
.[].[].[]..|        
___________|        
*)_ o (*)_____ o ___
~ ~< \\~ ~ ~ ~  <~   
    |\\        /#    `,
    `                    
                    
                    
_____._____         
 g:v:r - |        
[].[].[]..|         
__________|         
)___ o )_______ o __
~ ~ <<~ ~ ~ ~ ~ |.  
    /|         .|#  `,
    `                    
                    
                    
____._____          
g:v:r - |         
].[].[]..|          
_________|          
____( o ________ o _
~ ~ ~ |.~ ~ ~ ~  <  
     .|          #\\ `,
    `                    
                    
                    
___._____           
:v:r - |          
.[].[]..|           
________|           
___(*) o ________ o 
~ ~ ~ < ~ ~ ~ ~ ~,| 
       |\\        #> `,
    `                    
                    
                    
__._____            
:v:r - |            
[].[]..|            
_______|  .         
__(*)__ o ________ o
~ ~ ~ ~.|\\  ~ ~ ~  <
       .>         #|`,
    `                    
                    
                    
_._____             
v:r - |             
].[]..|     ,       
______|   .         
_(*)____ o _________
~ ~ ~ ~  <  ~ ~ ~ ~ 
        /|          `,
    `                    
                    
                    
._____              
:r - |       .      
.[]..|       ?      
_____|     .        
(*)______ o ________
~ ~ ~ ~ ~ | ~ ~ ~ ~ 
         .>         `,
    `                    
                    
                    
_____         .     
r - |      - ? '    
[]..|       , \`     
____|               
*)________ o _______
~ ~ ~ ~ ~  |  ~ ~ ~ 
           |\\       `,
    `                    
                    
             .      
____            .   
 - |       \` ?      
]..|           '    
___|                
)__________ o ______
~ ~ ~ ~ ~ ~ < ~ ~ ~ 
           .|       `,
    `                    
           .        
                    
___      .       '  
- |          ?      
..|                 
__|                 
____________ o _____
~ ~ ~ ~ ~ ~  |. ~ ~ 
            /|      `,
    `                    
                    
                    
__                  
 |           :      
.|                  
_|                  
_____________ o ____
~ ~ ~ ~ ~ ~ ~ < ~ ~ 
             .|     `,
    `                    
                    
                    
_                   
|            .      
|                   
|                   
_____________ o ____
~ ~ ~ ~ ~ ~ ~ |>~ ~ 
             /|     `,
    `                    
                    
                    
                    
                    
                    
                    
_____________ o ____
~ ~ ~ ~ ~ ~ ~<|>~ ~ 
             /|     `,
    `                    
                    
                    
                    
                    
                    
                    
_____________ o ____
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                    
                    
                    
                    
                    
                    
                    
_____________ o ____
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                    
                    
                    
                    
                    
                    
                    
_____________ o ____
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                    
                    
                    
                    
                    
                    
                    
_____________ o ____
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `,
    `                    
                    
                    
                    
                    
                    
                    
_____________ o ____
~ ~ ~ ~ ~ ~ ~< >~ ~ 
              |     `
];
const speed = 140;

const AsciiAnimation = () => {
    const [currentFrame, setCurrentFrame] = useState(0);

    // This useMemo hook runs the processing script from your HTML file exactly once.
    const processedData = useMemo(() => {
        // --- Start of EXACT SCRIPT from animation-ascii-reverse-flip.html ---
        const swapChars = {
            '(': ')', ')': '(', '<': '>', '>': '<', '[': ']', ']': '[',
            '{': '}', '}': '{', '/': '\\', '\\': '/'
        };
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

        let maxHeight = 0;
        let maxWidth = 0;
        frames.forEach(frame => {
            const lines = frame.split('\n');
            if (lines.length > maxHeight) {
                maxHeight = lines.length;
            }
            lines.forEach(line => {
                if (line.length > maxWidth) {
                    maxWidth = line.length;
                }
            });
        });

        const normalizedFrames = frames.map(frame => {
            let lines = frame.split('\n');
            let paddedLines = lines.map(line => {
                const padding = maxWidth - line.length;
                const leftPadding = Math.floor(padding / 2);
                const rightPadding = Math.ceil(padding / 2);
                return ' '.repeat(leftPadding) + line + ' '.repeat(rightPadding);
            });
            while (paddedLines.length < maxHeight) {
                paddedLines.unshift(' '.repeat(maxWidth));
            }
            return paddedLines.join('\n');
        });
        // --- End of EXACT SCRIPT ---

        // Return all the calculated data
        return { normalizedFrames, maxHeight, maxWidth };
    }, []); // Empty array ensures this logic runs only once.

    // Effect to handle the animation interval
    useEffect(() => {
        const animationInterval = setInterval(() => {
            setCurrentFrame(prev => (prev + 1) % processedData.normalizedFrames.length);
        }, speed);
        return () => clearInterval(animationInterval);
    }, [processedData.normalizedFrames.length]);

    // These styles are an EXACT match of the CSS in the original HTML file.
    const textareaStyle = {
        fontFamily: "'Courier New', monospace",
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#000000',
        lineHeight: 1.1,
        backgroundColor: 'transparent',
        textAlign: 'center',
        overflow: 'hidden',
        border: 'none',
        resize: 'none',
        outline: 'none',
    };

    return (
        <textarea
            readOnly
            style={textareaStyle}
            // Set rows and cols dynamically, just like the original script
            rows={processedData.maxHeight}
            cols={processedData.maxWidth}
            value={processedData.normalizedFrames[currentFrame]}
        />
    );
};

export default AsciiAnimation;