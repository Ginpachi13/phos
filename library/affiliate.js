// Amazon Associates settings for the library.
// tag: your Associates tracking ID for this marketplace (looks like "yourname-20"). Empty = plain links, no commission.
// domain: the Amazon store your tag belongs to (each country has its own tag).
export const AMAZON = { domain: 'www.amazon.com', tag: 'manuelfadi10-20' };

// Books with an ISBN-10 link straight to the product page; the rest open an Amazon search.
export function amazonUrl(book) {
  const q = new URLSearchParams();
  let path;
  if (book.isbn10) {
    path = `/dp/${book.isbn10}`;
  } else {
    path = '/s';
    q.set('k', `${book.title} ${book.author}`);
  }
  if (AMAZON.tag) q.set('tag', AMAZON.tag);
  const qs = q.toString();
  return `https://${AMAZON.domain}${path}${qs ? `?${qs}` : ''}`;
}
