15:52:47.739 Running build in Washington, D.C., USA (East) – iad1
15:52:47.739 Build machine configuration: 2 cores, 8 GB
15:52:47.750 Cloning github.com/jevotv/WHATSOU (Branch: feature/monorepo, Commit: 0050225)
15:52:47.751 Skipping build cache, deployment was triggered without cache.
15:52:48.711 Cloning completed: 961.000ms
15:52:49.291 Running "vercel build"
15:52:49.778 Vercel CLI 50.1.6
15:52:49.941 > Detected Turbo. Adjusting default settings...
15:52:50.125 Running "install" command: `npm install --prefix=../..`...
15:52:53.367 npm warn deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
15:52:53.805 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
15:52:53.984 npm warn deprecated glob@7.1.7: Glob versions prior to v9 are no longer supported
15:52:55.918 npm warn deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
15:52:56.160 npm warn deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
15:53:02.502 npm warn deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.
15:53:08.392 
15:53:08.394 added 763 packages, and audited 766 packages in 18s
15:53:08.400 
15:53:08.402 166 packages are looking for funding
15:53:08.402   run `npm fund` for details
15:53:08.476 
15:53:08.476 2 vulnerabilities (1 moderate, 1 high)
15:53:08.476 
15:53:08.476 To address all issues (including breaking changes), run:
15:53:08.478   npm audit fix --force
15:53:08.478 
15:53:08.478 Run `npm audit` for details.
15:53:08.565 Detected Next.js version: 13.5.11
15:53:08.566 Running "turbo run build"
15:53:08.608 
15:53:08.608 Attention:
15:53:08.609 Turborepo now collects completely anonymous telemetry regarding usage.
15:53:08.609 This information is used to shape the Turborepo roadmap and prioritize features.
15:53:08.609 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
15:53:08.609 https://turborepo.com/docs/telemetry
15:53:08.609 
15:53:08.652 • Packages in scope: @whatsou/web
15:53:08.653 • Running build in 1 packages
15:53:08.655 • Remote caching enabled
15:53:08.691 @whatsou/web:build: cache bypass, force executing f4bc134e900f0a7f
15:53:08.810 @whatsou/web:build: 
15:53:08.811 @whatsou/web:build: > @whatsou/web@0.1.0 build
15:53:08.811 @whatsou/web:build: > next build
15:53:08.811 @whatsou/web:build: 
15:53:09.323 @whatsou/web:build: Attention: Next.js now collects completely anonymous telemetry regarding usage.
15:53:09.324 @whatsou/web:build: This information is used to shape Next.js' roadmap and prioritize features.
15:53:09.324 @whatsou/web:build: You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
15:53:09.324 @whatsou/web:build: https://nextjs.org/telemetry
15:53:09.325 @whatsou/web:build: 
15:53:09.397 @whatsou/web:build:    Creating an optimized production build ...
15:53:22.176 @whatsou/web:build: <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (102kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
15:53:22.183 @whatsou/web:build: <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (139kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
15:53:23.249 @whatsou/web:build: Browserslist: caniuse-lite is outdated. Please run:
15:53:23.250 @whatsou/web:build:   npx update-browserslist-db@latest
15:53:23.250 @whatsou/web:build:   Why you should do it regularly: https://github.com/browserslist/update-db#readme
15:53:27.309 @whatsou/web:build: Browserslist: caniuse-lite is outdated. Please run:
15:53:27.310 @whatsou/web:build:   npx browserslist@latest --update-db
15:53:27.310 @whatsou/web:build:   Why you should do it regularly: https://github.com/browserslist/browserslist#browsers-data-updating
15:53:28.624 @whatsou/web:build:  ⚠ Compiled with warnings
15:53:28.625 @whatsou/web:build: 
15:53:28.625 @whatsou/web:build: ../../node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
15:53:28.625 @whatsou/web:build: A Node.js API is used (process.versions at line: 43) which is not supported in the Edge Runtime.
15:53:28.626 @whatsou/web:build: Learn more: https://nextjs.org/docs/api-reference/edge-runtime
15:53:28.626 @whatsou/web:build: 
15:53:28.626 @whatsou/web:build: Import trace for requested module:
15:53:28.626 @whatsou/web:build: ../../node_modules/@supabase/realtime-js/dist/module/lib/websocket-factory.js
15:53:28.627 @whatsou/web:build: ../../node_modules/@supabase/realtime-js/dist/module/index.js
15:53:28.627 @whatsou/web:build: ../../node_modules/@supabase/supabase-js/dist/index.mjs
15:53:28.628 @whatsou/web:build: ../../node_modules/@supabase/ssr/dist/module/createBrowserClient.js
15:53:28.628 @whatsou/web:build: ../../node_modules/@supabase/ssr/dist/module/index.js
15:53:28.628 @whatsou/web:build: 
15:53:28.628 @whatsou/web:build: ../../node_modules/@supabase/supabase-js/dist/index.mjs
15:53:28.629 @whatsou/web:build: A Node.js API is used (process.version at line: 389) which is not supported in the Edge Runtime.
15:53:28.630 @whatsou/web:build: Learn more: https://nextjs.org/docs/api-reference/edge-runtime
15:53:28.630 @whatsou/web:build: 
15:53:28.630 @whatsou/web:build: Import trace for requested module:
15:53:28.630 @whatsou/web:build: ../../node_modules/@supabase/supabase-js/dist/index.mjs
15:53:28.631 @whatsou/web:build: ../../node_modules/@supabase/ssr/dist/module/createBrowserClient.js
15:53:28.631 @whatsou/web:build: ../../node_modules/@supabase/ssr/dist/module/index.js
15:53:28.631 @whatsou/web:build: 
15:53:28.631 @whatsou/web:build:    Skipping linting
15:53:28.631 @whatsou/web:build:    Checking validity of types ...
15:53:40.480 @whatsou/web:build:    Collecting page data ...
15:53:41.385 @whatsou/web:build:    Generating static pages (0/37) ...
15:53:43.514 @whatsou/web:build: Session check error: eS [Error]: Dynamic server usage: Page couldn't be rendered statically because it used `headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
15:53:43.517 @whatsou/web:build:     at e_ (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:14:27572)
15:53:43.518 @whatsou/web:build:     at Module.eE (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:14:27980)
15:53:43.519 @whatsou/web:build:     at i (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:14:32403)
15:53:43.519 @whatsou/web:build:     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:14:32605)
15:53:43.520 @whatsou/web:build:     at GET (/vercel/path0/apps/web/.next/server/app/api/auth/session/route.js:1:491)
15:53:43.520 @whatsou/web:build:     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:14:39716
15:53:43.520 @whatsou/web:build:     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:121:36
15:53:43.520 @whatsou/web:build:     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7057)
15:53:43.521 @whatsou/web:build:     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:516)
15:53:43.521 @whatsou/web:build:     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18086) {
15:53:43.521 @whatsou/web:build:   digest: 'DYNAMIC_SERVER_USAGE'
15:53:43.522 @whatsou/web:build: }
15:53:43.699 @whatsou/web:build: 
@whatsou/web:build:    Generating static pages (9/37) 
15:53:43.917 @whatsou/web:build: 
@whatsou/web:build:    Generating static pages (18/37) 
15:53:44.153 @whatsou/web:build: 
15:53:44.153 @whatsou/web:build:  ⚠ metadata.metadataBase is not set for resolving social open graph or twitter images, using "https://whatsou-6sbg1uubr-jevotv-3403s-projects.vercel.app". See https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadatabase
15:53:44.188 @whatsou/web:build:  ⚠ Entire page /404 deopted into client-side rendering. https://nextjs.org/docs/messages/deopted-into-client-rendering /404
15:53:44.304 @whatsou/web:build:  ⚠ Entire page /dashboard/customers deopted into client-side rendering. https://nextjs.org/docs/messages/deopted-into-client-rendering /dashboard/customers
15:53:44.455 @whatsou/web:build:  ⚠ Entire page /dashboard/orders deopted into client-side rendering. https://nextjs.org/docs/messages/deopted-into-client-rendering /dashboard/orders
15:53:44.555 @whatsou/web:build:  ⚠ Entire page /dashboard deopted into client-side rendering. https://nextjs.org/docs/messages/deopted-into-client-rendering /dashboard
15:53:44.605 @whatsou/web:build:  ⚠ Entire page /dashboard/settings deopted into client-side rendering. https://nextjs.org/docs/messages/deopted-into-client-rendering /dashboard/settings
15:53:44.606 @whatsou/web:build: 
@whatsou/web:build:    Generating static pages (27/37) 
15:53:45.157 @whatsou/web:build:  ⚠ Entire page /dashboard/subscription deopted into client-side rendering. https://nextjs.org/docs/messages/deopted-into-client-rendering /dashboard/subscription
15:53:45.721 @whatsou/web:build:  ⚠ Entire page /login deopted into client-side rendering. https://nextjs.org/docs/messages/deopted-into-client-rendering /login
15:53:45.750 @whatsou/web:build:  ⚠ Entire page /onboarding deopted into client-side rendering. https://nextjs.org/docs/messages/deopted-into-client-rendering /onboarding
15:53:45.805 @whatsou/web:build:  ⚠ Entire page / deopted into client-side rendering. https://nextjs.org/docs/messages/deopted-into-client-rendering /
15:53:45.869 @whatsou/web:build:  ⚠ Entire page /privacy deopted into client-side rendering. https://nextjs.org/docs/messages/deopted-into-client-rendering /privacy
15:53:45.984 @whatsou/web:build:  ⚠ Entire page /signup deopted into client-side rendering. https://nextjs.org/docs/messages/deopted-into-client-rendering /signup
15:53:46.740 @whatsou/web:build: 
@whatsou/web:build:  ✓ Generating static pages (37/37) 
15:53:46.945 @whatsou/web:build:    Finalizing page optimization ...
15:53:46.945 @whatsou/web:build:    Collecting build traces ...
15:53:53.361 @whatsou/web:build: 
15:53:53.414 @whatsou/web:build: Route (app)                              Size     First Load JS
15:53:53.414 @whatsou/web:build: ┌ ○ /                                    11.6 kB         125 kB
15:53:53.415 @whatsou/web:build: ├ ○ /_not-found                          878 B            85 kB
15:53:53.415 @whatsou/web:build: ├ λ /[slug]                              13.7 kB         226 kB
15:53:53.416 @whatsou/web:build: ├ λ /[slug]/p/[id]                       6.46 kB         218 kB
15:53:53.416 @whatsou/web:build: ├ λ /[slug]/sitemap.xml                  0 B                0 B
15:53:53.416 @whatsou/web:build: ├ λ /api/auth/change-password            0 B                0 B
15:53:53.417 @whatsou/web:build: ├ λ /api/auth/delete-account             0 B                0 B
15:53:53.417 @whatsou/web:build: ├ λ /api/auth/login                      0 B                0 B
15:53:53.417 @whatsou/web:build: ├ λ /api/auth/logout                     0 B                0 B
15:53:53.417 @whatsou/web:build: ├ ○ /api/auth/session                    0 B                0 B
15:53:53.418 @whatsou/web:build: ├ λ /api/auth/signup                     0 B                0 B
15:53:53.418 @whatsou/web:build: ├ λ /api/dashboard/customers             0 B                0 B
15:53:53.418 @whatsou/web:build: ├ λ /api/dashboard/orders                0 B                0 B
15:53:53.418 @whatsou/web:build: ├ λ /api/dashboard/products              0 B                0 B
15:53:53.418 @whatsou/web:build: ├ λ /api/dashboard/products/[id]         0 B                0 B
15:53:53.418 @whatsou/web:build: ├ λ /api/dashboard/store                 0 B                0 B
15:53:53.418 @whatsou/web:build: ├ λ /api/store/create                    0 B                0 B
15:53:53.418 @whatsou/web:build: ├ λ /api/store/qr                        0 B                0 B
15:53:53.418 @whatsou/web:build: ├ λ /api/subscription/pay                0 B                0 B
15:53:53.418 @whatsou/web:build: ├ λ /api/subscription/status             0 B                0 B
15:53:53.418 @whatsou/web:build: ├ λ /api/upload                          0 B                0 B
15:53:53.418 @whatsou/web:build: ├ ○ /apple-icon.png                      0 B                0 B
15:53:53.418 @whatsou/web:build: ├ ○ /dashboard                           35 kB           237 kB
15:53:53.418 @whatsou/web:build: ├ ○ /dashboard/customers                 3.97 kB         115 kB
15:53:53.419 @whatsou/web:build: ├ ○ /dashboard/orders                    5.45 kB         152 kB
15:53:53.419 @whatsou/web:build: ├ ○ /dashboard/settings                  18.3 kB         219 kB
15:53:53.419 @whatsou/web:build: ├ ○ /dashboard/subscription              5.61 kB        98.4 kB
15:53:53.419 @whatsou/web:build: ├ λ /demo                                9.45 kB         130 kB
15:53:53.419 @whatsou/web:build: ├ λ /demo/customers                      3.55 kB         105 kB
15:53:53.419 @whatsou/web:build: ├ λ /demo/orders                         7.09 kB         147 kB
15:53:53.419 @whatsou/web:build: ├ λ /demo/settings                       7.19 kB         124 kB
15:53:53.419 @whatsou/web:build: ├ λ /go/[id]                             0 B                0 B
15:53:53.419 @whatsou/web:build: ├ ○ /icon.png                            0 B                0 B
15:53:53.419 @whatsou/web:build: ├ ○ /login                               3.87 kB         121 kB
15:53:53.419 @whatsou/web:build: ├ ○ /manifest.webmanifest                0 B                0 B
15:53:53.419 @whatsou/web:build: ├ ○ /onboarding                          9.86 kB         176 kB
15:53:53.419 @whatsou/web:build: ├ ○ /opengraph-image.png                 0 B                0 B
15:53:53.419 @whatsou/web:build: ├ ○ /privacy                             140 B          84.3 kB
15:53:53.419 @whatsou/web:build: ├ ○ /robots.txt                          0 B                0 B
15:53:53.419 @whatsou/web:build: ├ ○ /signup                              5.35 kB         122 kB
15:53:53.419 @whatsou/web:build: └ λ /sitemap.xml                         0 B                0 B
15:53:53.419 @whatsou/web:build: + First Load JS shared by all            84.2 kB
15:53:53.419 @whatsou/web:build:   ├ chunks/8593596e-871dff2a41482847.js  53.8 kB
15:53:53.419 @whatsou/web:build:   ├ chunks/9619-2c055103ee00a6ba.js      28.1 kB
15:53:53.419 @whatsou/web:build:   ├ chunks/main-app-86b422474c37e2e9.js  233 B
15:53:53.419 @whatsou/web:build:   └ chunks/webpack-8747550709128980.js   2.04 kB
15:53:53.419 @whatsou/web:build: 
15:53:53.419 @whatsou/web:build: 
15:53:53.419 @whatsou/web:build: ƒ Middleware                             146 kB
15:53:53.420 @whatsou/web:build: 
15:53:53.420 @whatsou/web:build: λ  (Server)  server-side renders at runtime (uses getInitialProps or getServerSideProps)
15:53:53.420 @whatsou/web:build: ○  (Static)  automatically rendered as static HTML (uses no initial props)
15:53:53.421 @whatsou/web:build: 
15:53:53.479 
15:53:53.479  WARNING  finished with warnings
15:53:53.480 
15:53:53.480 Warning - the following environment variables are set on your Vercel project, but missing from "turbo.json". These variables WILL NOT be available to your application and may cause your build to fail. Learn more at https://turborepo.com/docs/crafting-your-repository/using-environment-variables#platform-environment-variables
15:53:53.481 
15:53:53.481 [warn] @whatsou/web#build
15:53:53.482 [warn]   - SUPABASE_SERVICE_ROLE_KEY 
15:53:53.482 [warn]   - R2_ACCESS_KEY_ID 
15:53:53.483 [warn]   - R2_SECRET_ACCESS_KEY 
15:53:53.483 [warn]   - R2_ENDPOINT 
15:53:53.483 [warn]   - R2_BUCKET_NAME 
15:53:53.484 [warn]   - R2_PUBLIC_URL 
15:53:53.494 
15:53:53.494   Tasks:    1 successful, 1 total
15:53:53.495  Cached:    0 cached, 1 total
15:53:53.495    Time:    44.862s 
15:53:53.496 Summary:    /vercel/path0/.turbo/runs/38CnUDXobQd3jVMvvpbSAEmhMyP.json
15:53:53.496 
15:53:54.246 Traced Next.js server files in: 388.251ms
15:53:55.110 Created all serverless functions in: 862.722ms
15:53:55.229 Collected static files (public/, static/, .next/static): 9.383ms
15:53:55.404 Build Completed in /vercel/output [1m]
15:53:55.570 Deploying outputs...
15:54:08.333 Deployment completed
15:54:09.314 Creating build cache...
15:54:31.562 Created build cache: 22.247s
15:54:31.566 Uploading build cache [200.86 MB]
15:54:37.781 Build cache uploaded: 6.218s