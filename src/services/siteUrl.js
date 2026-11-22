// The website address to put in links that are sent to other people.
//
// WhatsApp makes a link clickable only when its address is a real domain name
// (one that ends in .com, .in, .me and so on). It does not make "localhost" or
// a number address like 127.0.0.1 clickable.
//
// localtest.me is a public domain made for this: every name that ends in
// .localtest.me answers with 127.0.0.1, which means "this computer". So the
// link below is a real domain name, and it still opens our local website.
// It can be changed with VITE_LOCAL_SHARE_HOST in the .env file.
const LOCAL_SHARE_HOST = import.meta.env.VITE_LOCAL_SHARE_HOST || 'wedding-planner.localtest.me'

// On localhost it returns the address with the local domain name.
// A hosted website (a real address) is returned unchanged.
export function getShareOrigin(origin = window.location.origin, localHost = LOCAL_SHARE_HOST) {
  const url = new URL(origin)
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    url.hostname = localHost
  }
  return url.origin
}
