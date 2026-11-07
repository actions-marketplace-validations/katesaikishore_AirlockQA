// Generated from the original console markup by html2jsx. Static design preview.
export default function IntegrationsPanel() {
  return (
    <>
<main style={{"flex": "1 1 0%", "width": "100%", "maxWidth": "1320px", "padding": "28px 32px 56px"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "flex-end", "justifyContent": "space-between", "gap": "16px"}}>
<div style={{"minWidth": "0px", "maxWidth": "760px"}}>
<h1 style={{"margin": "0px", "font": "800 30px / 1.2 Manrope, system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
Connect your pipeline
</h1>
<p style={{"margin": "6px 0px 0px", "fontSize": "15.5px", "color": "rgb(90, 105, 97)"}}>
Run AirlockQA on every push and pull request, and get the result — with its signed receipt — right on the pull request.
</p>
</div>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "34px", "padding": "0px 12px", "border": "1px solid rgb(207, 227, 215)", "borderRadius": "999px", "background": "rgb(242, 248, 244)", "color": "rgb(31, 107, 79)", "fontSize": "13.5px", "fontWeight": "600"}}>
<span data-anim="1" style={{"width": "8px", "height": "8px", "borderRadius": "50%", "background": "rgb(35, 132, 90)", "animation": "2s ease-in-out 0s infinite normal none running c-pulse"}}>
</span>
Cloud API reachable · api.qbrin.cloud
</span>
</div>
<section aria-labelledby="ci-where" style={{"marginTop": "20px"}}>
<h2 id="ci-where" style={{"margin": "0px 0px 10px", "font": "700 17px / 1.3 Manrope, system-ui, sans-serif"}}>
1 · Where should tests run?
</h2>
<div role="radiogroup" aria-labelledby="ci-where" style={{"display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", "gap": "12px"}}>
<button type="button" role="radio" className="c-opt" aria-checked="false" style={{"padding": "16px", "border": "2px solid rgb(227, 232, 226)", "borderRadius": "14px", "background": "rgb(255, 255, 255)", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "10px"}}>
<span style={{"width": "36px", "height": "36px", "borderRadius": "10px", "background": "rgb(226, 242, 233)", "color": "rgb(47, 111, 91)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M4 5h16v11H4zM2.5 19h19">
</path>
</svg>
</span>
<span style={{"font": "800 16px / 1.3 Manrope, system-ui, sans-serif"}}>
<span className="sc-interp">
Local
</span>
</span>
<span style={{"marginLeft": "auto", "font": "600 12.5px \"JetBrains Mono\", monospace", "color": "rgb(47, 111, 91)"}}>
<span className="sc-interp">
--local
</span>
</span>
</span>
<span style={{"display": "block", "marginTop": "8px", "fontSize": "14px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Your CI runner’s own browser. Free and keyless — nothing leaves your machine.
</span>
</span>
</button>
<button type="button" role="radio" className="c-opt" aria-checked="true" style={{"padding": "16px", "border": "2px solid rgb(47, 111, 91)", "borderRadius": "14px", "background": "rgb(247, 251, 248)", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "10px"}}>
<span style={{"width": "36px", "height": "36px", "borderRadius": "10px", "background": "rgb(234, 241, 251)", "color": "rgb(36, 88, 155)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M7 18.5h10.5a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.6 9.1 4.75 4.75 0 0 0 7 18.5z">
</path>
</svg>
</span>
<span style={{"font": "800 16px / 1.3 Manrope, system-ui, sans-serif"}}>
<span className="sc-interp">
Cloud plan
</span>
</span>
<span style={{"marginLeft": "auto", "font": "600 12.5px \"JetBrains Mono\", monospace", "color": "rgb(47, 111, 91)"}}>
<span className="sc-interp">
--cloud
</span>
</span>
</span>
<span style={{"display": "block", "marginTop": "8px", "fontSize": "14px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Hosted runners. CI submits the run with a project API key.
</span>
</span>
</button>
<button type="button" role="radio" className="c-opt" aria-checked="false" style={{"padding": "16px", "border": "2px solid rgb(227, 232, 226)", "borderRadius": "14px", "background": "rgb(255, 255, 255)", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "10px"}}>
<span style={{"width": "36px", "height": "36px", "borderRadius": "10px", "background": "rgb(240, 237, 248)", "color": "rgb(87, 71, 154)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M4 21V5.5L12 3v18M12 8.5l8 2.5v10M3 21h18">
</path>
</svg>
</span>
<span style={{"font": "800 16px / 1.3 Manrope, system-ui, sans-serif"}}>
<span className="sc-interp">
Enterprise
</span>
</span>
<span style={{"marginLeft": "auto", "font": "600 12.5px \"JetBrains Mono\", monospace", "color": "rgb(47, 111, 91)"}}>
<span className="sc-interp">
AIRLOCK_CLOUD_URL
</span>
</span>
</span>
<span style={{"display": "block", "marginTop": "8px", "fontSize": "14px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Same CLI, pointed at your own deployment and its own keys.
</span>
</span>
</button>
</div>
</section>
<div style={{"marginTop": "16px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(460px, 100%), 1fr))", "gap": "14px", "alignItems": "start"}}>
<div style={{"display": "grid", "gap": "14px"}}>
<section aria-labelledby="ci-install" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "justifyContent": "space-between", "gap": "10px"}}>
<h2 id="ci-install" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
2 · Install
</h2>
<div role="group" aria-label="Package manager" style={{"display": "inline-flex", "gap": "2px", "padding": "3px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(247, 248, 245)"}}>
<button type="button" aria-pressed="false" style={{"height": "30px", "padding": "0px 12px", "border": "0px", "borderRadius": "8px", "cursor": "pointer", "font": "600 13px \"JetBrains Mono\", monospace", "background": "transparent", "color": "rgb(90, 105, 97)"}}>
npm
</button>
<button type="button" aria-pressed="true" style={{"height": "30px", "padding": "0px 12px", "border": "0px", "borderRadius": "8px", "cursor": "pointer", "font": "600 13px \"JetBrains Mono\", monospace", "background": "rgb(255, 255, 255)", "color": "rgb(21, 33, 28)"}}>
bun
</button>
</div>
</div>
<pre style={{"margin": "12px 0px 0px", "padding": "14px 16px", "overflowX": "auto", "borderRadius": "12px", "background": "rgb(15, 29, 23)", "color": "rgb(215, 231, 221)", "font": "500 13.5px / 1.8 \"JetBrains Mono\", monospace", "whiteSpace": "pre"}}>
<span style={{"color": "rgb(127, 214, 174)"}}>
{"$"}
</span>
{" "}
<span className="sc-interp">
<div data-cli-panel="bun">
<span id="bun-install-command">
{"bun add --dev airlockqa"}
</span>
</div>
</span>
{"\n"}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"$"}
</span>
{" "}
<span className="sc-interp">
{"bunx airlock test --cloud"}
</span>
</pre>
</section>
<section aria-labelledby="ci-secret" data-anim="1" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "animation": "0.3s ease 0s 1 normal both running c-in"}}>
<h2 id="ci-secret" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
3 · Store the key as a CI secret
</h2>
<div style={{"marginTop": "12px", "display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "12px", "padding": "14px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "12px", "background": "rgb(247, 248, 245)"}}>
<span style={{"width": "36px", "height": "36px", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "color": "rgb(47, 111, 91)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<rect x="5" y="11" width="14" height="10" rx="2">
</rect>
<path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3">
</path>
</svg>
</span>
<span style={{"flex": "1 1 0%", "minWidth": "200px"}}>
<span style={{"display": "block", "fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
Secret name
</span>
<code style={{"font": "700 14px \"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
AIRLOCK_API_KEY
</span>
</code>
</span>
<span style={{"fontSize": "13.5px", "color": "rgb(70, 84, 76)"}}>
GitHub → Settings → Secrets → Actions
</span>
</div>
<ul style={{"margin": "12px 0px 0px", "paddingLeft": "18px", "display": "grid", "gap": "6px", "fontSize": "14px", "color": "rgb(70, 84, 76)"}}>
<li>
The CLI sends the key only as an HTTPS Bearer token — never in the run body or a command argument.
</li>
<li>
Don’t expose the secret to workflows triggered by pull requests from forks.
</li>
<li>
Real app secrets stay in your runner; only stand-in values travel to the cloud.
</li>
</ul>
</section>
<section aria-labelledby="ci-yaml" style={{"borderRadius": "16px", "background": "rgb(15, 29, 23)", "color": "rgb(215, 231, 221)", "overflow": "hidden"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "justifyContent": "space-between", "gap": "10px", "padding": "14px 18px", "borderBottom": "1px solid rgb(35, 57, 47)"}}>
<div>
<h2 id="ci-yaml" style={{"margin": "0px", "font": "700 16px / 1.3 Manrope, system-ui, sans-serif", "color": "rgb(255, 255, 255)"}}>
<span className="sc-interp">
4
</span>
{" "}· Add the workflow
</h2>
<p style={{"margin": "2px 0px 0px", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(169, 196, 182)"}}>
.github/workflows/airlockqa.yml
</p>
</div>
<button type="button" className="c-btn" style={{"height": "34px", "padding": "0px 12px", "border": "1px solid rgb(47, 75, 63)", "borderRadius": "9px", "background": "transparent", "color": "rgb(231, 242, 236)", "font": "600 13.5px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
<span className="sc-interp">
Copy
</span>
</button>
</div>
<pre style={{"margin": "0px", "padding": "16px 18px", "overflowX": "auto", "font": "500 13px / 1.8 \"JetBrains Mono\", ui-monospace, monospace", "whiteSpace": "pre", "color": "rgb(215, 231, 221)"}}>
<span style={{"color": "rgb(127, 214, 174)"}}>
{"name"}
</span>
{": AirlockQA\n"}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"on"}
</span>
{": [push, pull_request]\n"}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"jobs"}
</span>
{":\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"browser-tests"}
</span>
{":\n    "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"runs-on"}
</span>
{": ubuntu-latest\n    "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"steps"}
</span>
{":\n      - "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"uses"}
</span>
{": actions/checkout@v4\n      - "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"uses"}
</span>
{": oven-sh/setup-bun@v2\n      - "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"run"}
</span>
{": bun install "}
&
&
{" bunx playwright install --with-deps chromium\n      - "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"run"}
</span>
{": "}
<span className="sc-interp">
{"bunx airlock test --cloud"}
</span>
{"\n        "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"env"}
</span>
{":\n          "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"AIRLOCK_API_KEY"}
</span>
{": "}
<span style={{"color": "rgb(233, 201, 139)"}}>
<span className="sc-interp">
{"${{ secrets.AIRLOCK_API_KEY }}"}
</span>
{"\n"}
</span>
{"      - "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"run"}
</span>
{": bunx airlock audit"}
</pre>
</section>
<section aria-labelledby="ci-pr" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<h2 id="ci-pr" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
<span className="sc-interp">
5
</span>
{" "}· See results on your pull requests
</h2>
<div style={{"marginTop": "12px", "padding": "14px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "12px", "background": "rgb(247, 248, 245)", "fontSize": "14px", "lineHeight": "1.6"}}>
<div style={{"display": "flex", "alignItems": "center", "gap": "8px", "fontWeight": "700"}}>
<svg width="20" height="20" viewBox="0 0 64 64" aria-hidden="true">
<rect x="2" y="2" width="60" height="60" rx="18" fill="#2F6F5B">
</rect>
<path d="M16 48V31.5C16 22.94 22.94 16 31.5 16h1C41.06 16 48 22.94 48 31.5V48" fill="none" stroke="#F7FBF8" strokeWidth="5" strokeLinecap="round">
</path>
</svg>
airlockqa bot{" "}
<span style={{"fontWeight": "400", "color": "rgb(90, 105, 97)"}}>
commented on #131
</span>
</div>
<p style={{"margin": "8px 0px 0px"}}>
<strong>
All 3 suites passed
</strong>
{" "}· 72 of 72 steps · 38s
</p>
<p style={{"margin": "2px 0px 0px", "color": "rgb(70, 84, 76)"}}>
2 requests stopped by policy · 1 locator healed (needs review) · receipt{" "}
<span style={{"fontFamily": "\"JetBrains Mono\", monospace", "fontSize": "13px"}}>
e2114ac9…
</span>
{" "}signed
</p>
</div>
</section>
</div>
<div style={{"display": "grid", "gap": "14px"}}>
<section aria-labelledby="ci-keys" style={{"border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "overflow": "hidden"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "flex-start", "justifyContent": "space-between", "gap": "10px", "padding": "18px 20px"}}>
<div>
<h2 id="ci-keys" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
API keys
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Project-scoped. Shown once, stored as a hash.
</p>
</div>
<button type="button" className="c-btn c-pri" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "38px", "padding": "0px 14px", "border": "0px", "borderRadius": "10px", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)", "font": "600 14px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
<path d="M12 5v14M5 12h14">
</path>
</svg>
Create key
</button>
</div>
<div style={{"overflowX": "auto"}}>
<table style={{"width": "100%", "minWidth": "560px", "borderCollapse": "collapse", "fontSize": "13.5px"}}>
<thead>
<tr style={{"background": "rgb(247, 248, 245)"}}>
<th scope="col" style={{"padding": "10px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Key
</th>
<th scope="col" style={{"padding": "10px 12px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Project
</th>
<th scope="col" style={{"padding": "10px 12px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Last used
</th>
<th scope="col" style={{"padding": "10px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "right", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span style={{"position": "absolute", "width": "1px", "height": "1px", "overflow": "hidden", "clip": "rect(0px, 0px, 0px, 0px)"}}>
Actions
</span>
</th>
</tr>
</thead>
<tbody>
<tr className="c-row">
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<strong style={{"display": "block"}}>
GitHub Actions
</strong>
<span style={{"font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
air_live_7Hk2…
</span>
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontFamily": "\"JetBrains Mono\", monospace"}}>
acme-web
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(70, 84, 76)"}}>
2 min ago
</td>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "textAlign": "right"}}>
<button type="button" style={{"height": "32px", "padding": "0px 10px", "border": "1px solid rgb(245, 213, 208)", "borderRadius": "8px", "background": "rgb(255, 255, 255)", "color": "rgb(180, 35, 24)", "font": "600 13px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
Revoke
</button>
</td>
</tr>
<tr className="c-row">
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<strong style={{"display": "block"}}>
Nightly regression
</strong>
<span style={{"font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
air_live_c81d…
</span>
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontFamily": "\"JetBrains Mono\", monospace"}}>
acme-web
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(70, 84, 76)"}}>
Nov 6, 02:00
</td>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "textAlign": "right"}}>
<button type="button" style={{"height": "32px", "padding": "0px 10px", "border": "1px solid rgb(245, 213, 208)", "borderRadius": "8px", "background": "rgb(255, 255, 255)", "color": "rgb(180, 35, 24)", "font": "600 13px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
Revoke
</button>
</td>
</tr>
<tr className="c-row">
<td style={{"padding": "12px 20px"}}>
<strong style={{"display": "block", "color": "rgb(90, 105, 97)"}}>
Old laptop key
</strong>
<span style={{"font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
air_live_02fe…
</span>
</td>
<td style={{"padding": "12px", "fontFamily": "\"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
acme-admin
</td>
<td style={{"padding": "12px", "color": "rgb(90, 105, 97)"}}>
Revoked Oct 21
</td>
<td style={{"padding": "12px 20px", "textAlign": "right", "color": "rgb(90, 105, 97)", "fontSize": "13px"}}>
—
</td>
</tr>
</tbody>
</table>
</div>
</section>
<section aria-labelledby="ci-usage" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<h2 id="ci-usage" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Cloud usage today
</h2>
<div style={{"marginTop": "14px", "display": "grid", "gap": "14px"}}>
<div>
<div style={{"display": "flex", "justifyContent": "space-between", "fontSize": "14px"}}>
<span style={{"fontWeight": "600"}}>
acme-web
</span>
<span style={{"fontFamily": "\"JetBrains Mono\", monospace"}}>
64 / [LIMIT] runs
</span>
</div>
<div style={{"marginTop": "6px", "height": "8px", "borderRadius": "4px", "background": "rgb(226, 242, 233)", "overflow": "hidden"}}>
<span style={{"display": "block", "width": "64%", "height": "100%", "background": "rgb(35, 132, 90)"}}>
</span>
</div>
</div>
<div>
<div style={{"display": "flex", "justifyContent": "space-between", "fontSize": "14px"}}>
<span style={{"fontWeight": "600"}}>
Whole workspace
</span>
<span style={{"fontFamily": "\"JetBrains Mono\", monospace"}}>
91 / [LIMIT] runs
</span>
</div>
<div style={{"marginTop": "6px", "height": "8px", "borderRadius": "4px", "background": "rgb(226, 242, 233)", "overflow": "hidden"}}>
<span style={{"display": "block", "width": "30%", "height": "100%", "background": "rgb(35, 132, 90)"}}>
</span>
</div>
</div>
</div>
<p style={{"margin": "12px 0px 0px", "fontSize": "13.5px", "color": "rgb(70, 84, 76)"}}>
Each parallel worker and each retry counts as a run. Limits reset at midnight UTC; the CLI warns when 20% or less remains.
</p>
</section>
<section aria-labelledby="ci-api" style={{"borderRadius": "16px", "background": "rgb(15, 29, 23)", "color": "rgb(215, 231, 221)", "overflow": "hidden"}}>
<div style={{"padding": "14px 18px", "borderBottom": "1px solid rgb(35, 57, 47)"}}>
<h2 id="ci-api" style={{"margin": "0px", "font": "700 16px / 1.3 Manrope, system-ui, sans-serif", "color": "rgb(255, 255, 255)"}}>
API contract
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13px", "color": "rgb(169, 196, 182)"}}>
Today the cloud API accepts one call. History, usage and key endpoints are planned.
</p>
</div>
<pre style={{"margin": "0px", "padding": "16px 18px", "overflowX": "auto", "font": "500 12.8px / 1.75 \"JetBrains Mono\", ui-monospace, monospace", "whiteSpace": "pre", "color": "rgb(215, 231, 221)"}}>
<span style={{"color": "rgb(127, 214, 174)"}}>
{"POST"}
</span>
{" /v1/runs\n"}
<span style={{"color": "rgb(143, 179, 160)"}}>
{"Authorization: Bearer air_live_\u2022\u2022\u2022\u2022"}
</span>
{"\n{\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"suiteName\""}
</span>
{": "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"\"checkout-flow\""}
</span>
{",\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"targetUrl\""}
</span>
{": "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"\"https://staging.shop.test\""}
</span>
{",\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"phantomConfig\""}
</span>
{": { "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"STRIPE_KEY\""}
</span>
{": "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"\"ph_sec_stripe_test_placeholder\""}
</span>
{" },\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"options\""}
</span>
{": { "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"browser\""}
</span>
{": "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"\"chromium\""}
</span>
{", "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"headless\""}
</span>
{": true }\n}\n\n"}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"202"}
</span>
{" Accepted   "}
<span style={{"color": "rgb(143, 179, 160)"}}>
{"x-ratelimit-remaining: 36"}
</span>
{"\n{ "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"runId\""}
</span>
{": "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"\"run_7c1e09\""}
</span>
{", "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"status\""}
</span>
{": "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"\"queued\""}
</span>
{" }\n\n"}
<span style={{"color": "rgb(242, 178, 107)"}}>
{"429"}
</span>
{" Too Many Requests   "}
<span style={{"color": "rgb(143, 179, 160)"}}>
{"example"}
</span>
{"\n{ "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"code\""}
</span>
{": "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"\"DAILY_QUOTA_EXCEEDED\""}
</span>
{", "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"quota\""}
</span>
{": { "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"scope\""}
</span>
{": "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"\"workspace\""}
</span>
{", "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"resetAt\""}
</span>
{": "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"\"2026-11-07T00:00:00Z\""}
</span>
{" } }"}
</pre>
</section>
</div>
</div>
<section className="panel flow-card" id="flow-card" style={{"marginTop": "32px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "18px", "background": "rgb(255, 255, 255)", "padding": "24px"}}>
<div className="flow-heading" style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "marginBottom": "16px"}}>
<div>
<span className="eyebrow" style={{"fontSize": "11px", "fontWeight": "700", "letterSpacing": "0.08em", "textTransform": "uppercase", "color": "rgb(47, 111, 91)"}}>
EXECUTION FLOW · THREE.JS ARCHITECTURE
</span>
<h3 style={{"margin": "4px 0 0", "font": "800 18px Manrope, sans-serif"}}>
From commit to verified attestation
</h3>
</div>
<button className="c-btn c-sec" id="replay-flow" type="button" aria-label="Replay flow animation" style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "padding": "6px 14px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "8px", "background": "#fff", "cursor": "pointer", "fontSize": "13px", "fontWeight": "600"}}>
↻ Replay
</button>
</div>
<div className="flow-stage" style={{"position": "relative", "height": "260px", "borderRadius": "12px", "background": "rgb(21, 33, 28)", "overflow": "hidden"}}>
<canvas id="flow-canvas" aria-label="Three.js animation: CI runner to Airlock Cloud API, POST /v1/runs, to browser runner, then run response" style={{"width": "100%", "height": "100%", "display": "block"}}>
</canvas>
<div className="flow-label flow-label-ci" style={{"position": "absolute", "left": "16px", "top": "16px", "color": "#fff", "fontSize": "12px"}}>
<span style={{"color": "#7CC4A2"}}>
⌘
</span>
{" "}CI runner
</div>
<div className="flow-label flow-label-api" style={{"position": "absolute", "left": "35%", "top": "16px", "color": "#fff", "fontSize": "12px"}}>
<span style={{"color": "#7CC4A2"}}>
⇄
</span>
{" "}Airlock Cloud API
</div>
<div className="flow-label flow-label-vm" style={{"position": "absolute", "right": "35%", "top": "16px", "color": "#fff", "fontSize": "12px"}}>
<span style={{"color": "#7CC4A2"}}>
▣
</span>
{" "}Browser runner
</div>
<div className="flow-label flow-label-proof" style={{"position": "absolute", "right": "16px", "top": "16px", "color": "#fff", "fontSize": "12px"}}>
<span style={{"color": "#7CC4A2"}}>
✓
</span>
{" "}Run response
</div>
</div>
<div style={{"marginTop": "16px", "display": "flex", "flexWrap": "wrap", "alignItems": "center", "justifyContent": "space-between", "gap": "12px"}}>
<p className="motion-status" id="motion-status" aria-live="polite" style={{"margin": "0", "fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
Three.js CI to attestation flow
</p>
<div style={{"display": "flex", "gap": "8px"}}>
<button className="c-btn c-sec" id="record-motion" type="button" style={{"padding": "6px 14px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "8px", "background": "#fff", "cursor": "pointer", "fontSize": "13px", "fontWeight": "600"}}>
Record 5-second preview
</button>
<a className="download-motion" id="download-motion" hidden style={{"fontSize": "13px", "color": "rgb(47, 111, 91)", "fontWeight": "600", "alignSelf": "center"}}>
Download recorded clip
</a>
</div>
</div>
<div className="contract-row" style={{"marginTop": "20px", "padding": "12px 16px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "background": "rgb(251, 252, 250)", "display": "flex", "alignItems": "center", "gap": "12px", "fontSize": "13.5px"}}>
<span style={{"fontWeight": "700", "color": "rgb(47, 111, 91)"}}>
POST
</span>
<code style={{"fontFamily": "'JetBrains Mono', monospace", "fontWeight": "600"}}>
/v1/runs
</code>
<span style={{"color": "rgb(90, 105, 97)"}}>
· Cloud run submission endpoint
</span>
</div>
</section>
</main>
    </>
  );
}
