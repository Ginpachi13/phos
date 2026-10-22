// The 9 chapters. Copy comes from the 10-page framework PDF (Fadi, 2026-10-19).
// Bracketed items are the PDF's own placeholders.
// scene: per-chapter look for the shader until the Higgsfield clips land.
//   shaft = x position of the light shaft (0..1), tilt = lean, warm = 0 cold .. 1 gold, fog = haze amount
export const CHAPTERS = [
  {
    video: true, id: 'prologue', rail: 'PROLOGUE',
    scene: { shaft: 0.68, tilt: -0.18, warm: 0.55, fog: 0.55, arches: 1 },
    caption: { vert: 'A traveler walked on toward the light.', plain: 'Books I read, places I travel and ideas worth passing on, shared so we can learn from each other.' },
  },
  {
    video: true, id: 'notice', rail: 'NOTICE',
    scene: { shaft: 0.42, tilt: 0.1, warm: 0.7, fog: 0.45, arches: 0.6 },
    caption: { tag: '01', vert: 'Notice one thing that catches your eye.', plain: 'Start with one book, place or artwork that catches your eye.' },
  },
  {
    video: true, id: 'mind', rail: 'MIND',
    scene: { shaft: 0.55, tilt: -0.06, warm: 0.85, fog: 0.35, arches: 0.2 },
    caption: { tag: 'i · MIND', vert: 'Books, essays and ideas to think with.', plain: 'The Virtual Library, reading lists and the newsletter.' },
    reveal: {
      kicker: 'ON THE SHELF THIS MONTH', title: 'A book worth your evening.',
      html: `<article class="card"><img class="cover" src="/scenes/cover-book.jpg" alt="" aria-hidden="true"><div>
        <h3>[Book title]</h3><p class="by">[Author] · recommended by [Name]</p>
        <p>[Two sentences in the author's own voice on why it is worth reading.]</p>
        <div class="row"><a class="btn solid" href="/library">Read my take</a><a class="btn" href="#" rel="sponsored nofollow">View on Amazon</a></div>
        <p class="disclosure">As an Amazon Associate I earn from qualifying purchases.</p></div></article>
        <a class="more" href="/library">Browse all reading lists →</a>`,
    },
  },
  {
    video: true, id: 'body', rail: 'BODY',
    scene: { shaft: 0.3, tilt: 0.22, warm: 1.0, fog: 0.5, arches: 0 },
    caption: { tag: 'ii · BODY', vert: 'Places, meals and people who help you live well.', plain: 'Where to eat, from people who have been, and a short list of trusted services.' },
    reveal: {
      kicker: 'WHERE TO EAT, FROM PEOPLE WHO\'VE BEEN', title: 'A table someone loved.',
      html: `<p class="end-copy" style="opacity:1;margin:0 auto">A growing guide to restaurants and bars around the world, each recommended by someone who loved it.</p>
        <div class="row" style="justify-content:center;display:flex;gap:10px;margin-top:18px"><a class="btn solid" href="/food-and-drinks">Explore the guide</a><a class="btn" href="/submit">Send in your favorite</a></div>`,
    },
  },
  {
    video: true, id: 'soul', rail: 'SOUL',
    scene: { shaft: 0.62, tilt: -0.25, warm: 0.4, fog: 0.6, arches: 0.8 },
    caption: { tag: 'iii · SOUL', vert: 'Art, history and the view from the road.', plain: 'First-person videos from places I visit and books I record.' },
    reveal: {
      kicker: 'THROUGH MY EYES', title: 'See it as I saw it.',
      html: `<div class="card" style="grid-template-columns:1fr"><video class="cover" style="aspect-ratio:16/9" muted playsinline loop autoplay aria-hidden="true"><source src="/scenes/08.mp4" type="video/mp4"><source src="/scenes/08.webm" type="video/webm"></video>
        <p>[Latest POV video: place, length, one line on what to watch for.]</p>
        <div class="row"><a class="btn solid" href="/videos">Watch the latest</a><a class="btn" href="/art-and-history">Art and History</a></div></div>`,
    },
  },
  {
    video: true, id: 'practise', rail: 'PRACTISE',
    scene: { shaft: 0.5, tilt: 0.0, warm: 0.95, fog: 0.3, arches: 0.1 },
    caption: { tag: '02', vert: 'Read it, try it, taste it.', plain: 'Let one idea change one habit.' },
    reveal: {
      kicker: 'FROM THE JOURNAL', title: 'Field Notes',
      html: `<p class="end-copy" style="opacity:1;margin:0 auto">Short notes from my reading and travels. A few minutes each, ending with something to read, see or try.</p>
        <a class="more" href="/journal">See all notes →</a>`,
    },
  },
  {
    video: true, id: 'illuminate', rail: 'ILLUMINATE',
    scene: { shaft: 0.5, tilt: 0.0, warm: 1.0, fog: 0.4, arches: 0.4, many: 1 },
    caption: { tag: '03', vert: 'Pass it on.', plain: 'Send me your own recommendation and I\'ll share it.' },
    reveal: {
      kicker: 'ILLUMINATE OTHERS', title: 'What should more people know about?',
      html: `<p class="end-copy" style="opacity:1;margin:0 auto">A book, a place, a person you trust. Tell me why in one line, and I'll share the best ones with your name on them.</p>
        <div class="row" style="justify-content:center;display:flex;margin-top:18px"><a class="btn solid" href="/submit">Send a recommendation</a></div>`,
    },
  },
  {
    video: true, id: 'author', rail: 'AUTHOR',
    scene: { shaft: 0.72, tilt: -0.1, warm: 0.75, fog: 0.4, arches: 0.5 },
    caption: { vert: 'Hi, I\'m [Name].', plain: 'I write books, record audiobooks and travel to learn from people and places. Phos is where I share what I find, and where I hope you\'ll share what you know.' },
  },
  {
    video: true, id: 'phos', rail: 'PHOS',
    scene: { shaft: 0.5, tilt: 0.0, warm: 0.8, fog: 0.5, arches: 1, open: 1 },
    caption: null, // the end screen carries this chapter
  },
];

export const GOLD_STOPS = ['#FFF1C9', '#FFE3A0', '#FFD98A', '#FBC968', '#F2B84B'];
