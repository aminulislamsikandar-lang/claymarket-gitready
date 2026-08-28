# Claymarket production quality checklist

## Implemented in this release
- Privacy Policy page at `/privacy-policy`
- Terms & Conditions page at `/terms`
- FAQ page at `/faq`
- Custom 404 state with an Explore Markets CTA
- Clear primary CTAs preserved: Search, Explore Market, Add Product, seller actions
- `robots.txt` and `sitemap.xml` generated during production build from `VITE_SITE_URL`
- Per-view document titles and meta descriptions
- Canonical URLs
- Open Graph and Twitter social metadata
- Default social preview image
- Favicon and theme color
- Cookie/optional analytics consent banner
- Optional Google Analytics only after consent and only when `VITE_GA_ID` is configured
- Web Share API with clipboard fallback for shop/product sharing
- Responsive/mobile layouts preserved
- Skip-to-content link and visible keyboard focus styles
- Reduced-motion preference support
- Image lazy-loading/decoding optimization for non-critical images
- Image alt-text audit: all `<img>` elements have alt text
- Auth/address forms retain required validation and now expose labels to assistive technology
- Internal `navigateTo` targets audited: no unknown view targets found
- Social footer placeholders no longer navigate to broken hash destinations; they show a non-blocking availability notice

## Verification performed in this environment
- Static navigation target audit: passed
- Image `alt` attribute audit: passed (34/34 images)
- TypeScript syntax/typecheck was attempted, but dependencies were not installable within the execution environment; the resulting errors were dependency-resolution errors (`react`, `vite`, `lucide-react`, etc.), not a successful project typecheck.
- Full browser/form/link/performance testing must be run on the developer machine after `npm install` because the local browser and MongoDB/runtime environment are not available here.

## Production configuration
Set:

`VITE_SITE_URL=https://your-real-domain.example`

Optional:

`VITE_GA_ID=G-XXXXXXXXXX`

Then run:

`npm install`

`npm run build`

The build emits `dist/robots.txt` and `dist/sitemap.xml`.


## Final automated/static audit performed

- TypeScript/TSX parser diagnostics: PASS (0 parse errors).
- Backend JavaScript `node --check`: PASS for all backend source files.
- `useApp()` consumer audit: PASS; no consumer requests a missing context property.
- Removed broken direct `setProducts` context usage from seller/product components.
- Fixed CartDrawer calling the wrong `createOrder` signature.
- Fixed optional-price checkout behavior and prevented misleading zero-price orders.
- Fixed optional stock display so missing stock is not reported as 20 units.
- Added persistent cart, wishlist, followed shops and local orders.
- Added deep-link route mapping and invalid-detail 404 handling.
- Production default role is Guest; demo role is opt-in.

## Runtime verification limitation

A full `npm install`, browser E2E run, local MongoDB connection, payment test and camera hardware test require the user's machine/runtime. The package is therefore not represented as having passed those unavailable runtime checks.
