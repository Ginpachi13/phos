# Phos home page: design system

## The idea

The page tells the Phos idea as a short film. A traveler walks through a dark world toward light,
finds books, places, art and people, and passes the light on. The first scene is a dark stone hall
with "phos" carved in stone. The last scene is the same hall flooded with gold light, where the
reader joins the newsletter.

The three paths (Mind, Body, Soul) and the three-step practice (Notice, Practise, Illuminate) from the
copy document are the chapters.

| # | Rail name | Scene | Line | Hold-to-illuminate panel |
|---|---|---|---|---|
| 01 | PROLOGUE | Dark hall, carved "phos", one shaft of light | A traveler walked on toward the light. | none |
| 02 | NOTICE | A hand reaches for a book in the beam | Notice one thing that catches your eye. | none |
| 03 | MIND | Library with glowing books in the air | Books, essays and ideas to think with. | On the shelf this month |
| 04 | BODY | Lantern-lit table under olive trees | Places, meals and people who help you live well. | Where to eat |
| 05 | SOUL | Light across marble statues | Art, history and the view from the road. | Through my eyes (video) |
| 06 | PRACTISE | Journal, candle, tea | Read it, try it, taste it. | Field Notes |
| 07 | ILLUMINATE | Lanterns lit one from another | Pass it on. | Send a recommendation |
| 08 | AUTHOR | Traveler at a window over a city | Hi, I'm [Name]. | none |
| 09 | PHOS | The hall floods with gold | Let a little light in. | End screen: email signup + footer |

## Layout (desktop / phone)

- Header: emblem centred at the top (phones: top left). Right: SOUND, PLAY, JOIN.
- Chapter name: small, top left. Progress: thin strip of 9 bars, bottom centre. Click a bar to jump.
- Caption: one vertical line in Instrument Serif, right column, letters blur in at random delays.
- Title (chapter 01): wide screens show the carved-stone video; the subtitle sits bottom right.
  Phones show the live type lockup.
- Hold to illuminate: a round button follows the cursor on chapters with a panel. Holding fills a gold
  ring, then a panel opens with gold lettering over that chapter's video.
- End screen: emblem, "Let a little light in.", email + consent, footer links and the affiliate note.

## Type and colour

- Display and captions: Instrument Serif. Interface and body: Inter. Both from Google Fonts.
- Near-black `#030304`, cream `#F3EBD8`, gold `#FFD98A`, deep gold `#F2B84B`. Tokens at the top of
  `src/style.css`.

## Motion

- Main ease `cubic-bezier(.25, 1, .5, 1)`. Follow ease (things that chase the cursor)
  `cubic-bezier(.19, 1, .22, 1)`.
- Letter reveal: opacity 1.4 s, blur 12 px → 0 over 1.9 s, scale .8 → 1 over 1 s, delay 0–0.45 s random.
- Title letters rise 1.7 s with 0.1 s stagger.
- Step glide: 1.5 s, ease in-out cubic. Between chapters the current scene rushes toward the light with
  a radial blur and the next one opens out of the light and settles.
- Cursor: gold dot and ring. Around it, a soft pool of light brightens the scene and lights up dust.
- No flashes: videos never loop or seek on screen; transitions only add a faint warm edge.

## Where the format came from

The structure (loader with a mark and a percent counter, one opening line, a big title in the lower
left, a chapter rail, vertical captions in a right column, hold-to-interact moments with gold text,
a story that loops back to its start) was modelled on the IVRESS brand site (brand.ivress.co.jp).
Only that format was studied. All media, copy and code in this project are original.
