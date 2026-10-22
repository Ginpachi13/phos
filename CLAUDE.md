# Phos home page: instructions for Claude

You are setting up the Phos home page for its owner. Read this whole file first.
Then do the steps in "First-time setup" in order. Ask the owner only where a step says to ask.

## What this is

Phos (φῶς, Greek for light) is a personal hub for an author-traveler: books, places, art, ideas,
and recommendations from real people. This folder is the finished home page.

It is a scroll story in 9 chapters. Each chapter is a short cinematic video with one line of text.
The reader moves one step per scroll, swipe or arrow key, and flies into the light between chapters.
It ends on the newsletter signup ("Let a little light in").

- Stack: Vite 5 + three.js (WebGL shader stage) + Lenis (scroll input) + plain HTML/CSS/JS.
- No framework, no build-time CMS. Static output in `dist/` plus one serverless function in `api/`.
- All copy comes from the owner's "Website Framework and Home Page Copy" document (Oct 2026).

## First-time setup

1. **Check Node.** Run `node -v`. It must be 18 or newer. If Node is missing or old, tell the owner
   and offer to install the current LTS (for example with Homebrew: `brew install node`).

2. **Pick the folder. Do not overwrite existing work.**
   - The owner may already have a folder called `~/phos-site` with an earlier Phos page, linked to
     GitHub and Vercel. If `~/phos-site` exists, do NOT unzip or copy over it.
   - Put this project in `~/phos-story` instead (or a name the owner picks).
   - Later, ask the owner whether this version should replace the old one. See step 7.

3. **Install.** In the project folder: `npm ci` (uses the exact versions in `package-lock.json`).

4. **Check the build.** `npm run build`. It must end with "built in". Fix nothing else at this point.

5. **Run it.** `npm run dev`, then open http://localhost:7911 in the owner's browser.
   Tell the owner how to use it: wait for the loader, then scroll once (or swipe, or press ↓).
   Sound starts after the first click, tap or key press (browsers block sound until then).

6. **Show the owner what still needs their input** (list below under "Open items"). Do not invent
   names, emails, social handles or numbers. Leave the bracketed placeholders until the owner gives
   the real values.

7. **Deploy only when the owner says so.**
   - Vercel: `npx vercel` (preview) and `npx vercel --prod` (live). The `api/` folder deploys as a
     serverless function on its own. Vercel detects Vite and uses `npm run build` and `dist/`.
   - If the old `~/phos-site` is already linked to a Vercel project and domain, ask the owner
     whether to deploy this version to that same project (replacing the old page) or to a new one.
   - Never push, deploy or change DNS without a clear yes from the owner.

## How the page works

| Piece | File | Notes |
|---|---|---|
| Page structure | `index.html` | Loader, header, title, captions, panels, end screen, footer |
| Chapters and copy | `src/chapters.js` | 9 chapters: rail name, caption, and the "hold to illuminate" panel HTML |
| Behaviour | `src/main.js` | Loader, step scroll, gestures, panels, join forms, chapter strip, play mode, cursor |
| Shader stage | `src/stage.js` | Draws the video, light shaft, dust, cursor light, fly-through between chapters |
| Sound | `src/sound.js` | Generated with Web Audio. No audio files |
| Styles | `src/style.css` | Layout, type, timings. Colour tokens at the top (`:root`) |
| Scene media | `public/scenes/` | `01.mp4` … `09.mp4` (H.264), same names `.webm` (VP9), `.jpg` stills. `01t.*` = carved-title opening (wide screens) |
| Signup endpoint | `api/subscribe.js` | Validates email + consent and logs. Not yet connected to a newsletter tool |
| Design reference | `DESIGN.md` | Layout and timing system, and why each choice was made |
| Scene prompts | `SCENE-PROMPTS.md` | The image and video prompts used, to make new or matching scenes |

### Interaction rules (keep these unless the owner asks otherwise)

- One gesture = one step. Thresholds: wheel 90, touch 70 (`src/main.js`, search `const th`).
- The scene leans with the gesture before the step fires, then springs back if the reader lets go.
- Forward = fly into the light (warm). Back = pull away (cool, dust rushes inward).
- The first and last stops resist: a push only stretches a little.
- Nothing moves on its own unless the reader presses PLAY (7 s per stop, `PLAY_HOLD`).
- Each video plays once at a slow rate and holds its last frame. Do not loop or seek them; seeking
  causes black flashes.
- Phones (and any screen narrower than 980 px or taller than wide) use the live type title instead of
  the carved-stone title video, because a portrait crop cuts the stone letters off.

### Changing a chapter's video

1. Make a 16:9 clip, about 5 s, slow continuous camera move, no cuts, no text.
2. Encode both formats into `public/scenes/` with the chapter number (example for chapter 04):
   ```
   ffmpeg -i new.mp4 -an -vf "scale=1280:-2,fps=30" -c:v libx264 -preset slow -crf 22 -g 30 -pix_fmt yuv420p -movflags +faststart public/scenes/04.mp4
   ffmpeg -i new.mp4 -an -vf "scale=1280:-2,fps=30" -c:v libvpx-vp9 -b:v 0 -crf 27 -row-mt 1 public/scenes/04.webm
   ffmpeg -i new.mp4 -vf "select=eq(n\,0),scale=1920:-2" -frames:v 1 -q:v 3 public/scenes/04.jpg
   ```
3. Keep the right third of each frame dark. The vertical caption sits there.

## Open items for the owner

- Placeholders from the copy document, still in the page: **[Name]**, **[Sunday]**, **[INSTAGRAM]**,
  **[CONTACT EMAIL]**, and the book card ("[Book title]", "[Author]", the two-sentence take).
  Search the project for `[` to find them all.
- **Newsletter tool.** `api/subscribe.js` only checks and logs the email. Once the owner picks a tool
  (Substack, Beehiiv, Kit or Mailchimp), connect its API there. Use double opt-in. Keep the consent box.
  Store the API key in Vercel environment variables, never in the code.
- **Amazon link.** The "View on Amazon" button in the Mind panel points to `#`. Add the real affiliate
  link. Keep the disclosure line right under it.
- **Links in the footer** (`/library`, `/journal`, `/videos`, …) point to pages that do not exist yet.
  They are the next pages in the rollout.
- **Logo.** The header emblem is a placeholder (a lens outline with "phos" in Instrument Serif).
  `brand/logo/brief.md` and `brand/logo/specs.md` hold a full logo brief and three written concepts.
- **Optional later page:** a `/places` map for Food and Drinks recommendations (points of light on a
  dark map, filters for city, cuisine, price and occasion). Not built.

## Rules

- The layout, hierarchy and timing were modelled on the structure of the IVRESS brand site
  (brand.ivress.co.jp, "SPIN A TALE"). Only the format was studied. Every image, video, line of copy and
  line of code here is original. Do not add IVRESS files, text, models or audio.
- Keep the Amazon Associates disclosure next to any Amazon link.
- Do not publish the owner's name, email or socials until the owner provides them.
- Test in a real browser after every change: load, scroll forward three steps, scroll back one, hold
  to illuminate on the Mind chapter, reach the end screen, and check a phone-sized window.
