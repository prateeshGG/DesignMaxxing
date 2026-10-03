# Reading a reference film

1. Download it and extract frames: `ffmpeg -i ref.mp4 -vf "fps=1/2.5,scale=480:-2" fr/%03d.jpg`, then tile them into a contact sheet with timestamps.
2. Note, for each shot: length, the one thing that moves, how it enters and exits, camera (static, push, pan, whip), background (colour field, art, photo), type (serif statement, mono label), texture (grain, glyph rows, patterns).
3. Write the grammar as rules, not a description. Example from the Maydit films (studiomaydit.com) the founder liked:
   - one idea per shot, 1.5–4 s, full-bleed field;
   - product UI large and crisp, exactly one focal action (typing, cursor click, chart drawing, counter, tab switch, colour change);
   - containers morph into the next shot instead of cutting;
   - an art layer behind a soft floating card;
   - transitions: hard cuts on the beat, pixel-mosaic dissolves, colour swap behind a fixed card, pull-out into a wall;
   - calm depth: blurred copies and gentle push-ins, never spinning 3D;
   - serif statements revealed word by word, small mono labels, very little copy.
4. Never reuse the reference's content, logos, characters or artwork.
