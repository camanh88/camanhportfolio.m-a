// Settings of the live website. Not copy: the words of the site stay in content/.
// Address of the Mùa web (canonical and share-image links use it).
export const SITE_URL = 'https://mua.camanhportfolio.online';
// false = search engines are asked not to list the site (only people with the link find it).
// To let Google list it one day: set true, run `npm run build` and deploy. (robots.txt stays "Allow": the "noindex" tag on every page is what keeps the site out of the results; blocking in robots.txt as well would stop Google from reading that tag.)
export const INDEXABLE = false;
