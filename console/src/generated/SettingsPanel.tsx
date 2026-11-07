// Generated from the original console markup by html2jsx. Static design preview.
export default function SettingsPanel() {
  return (
    <>
<main style={{"flex": "1 1 0%", "width": "100%", "maxWidth": "1320px", "padding": "28px 32px 56px"}}>
<h1 style={{"margin": "0px", "font": "800 30px / 1.2 Manrope, system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
Settings
</h1>
<p style={{"margin": "6px 0px 0px", "fontSize": "15.5px", "color": "rgb(90, 105, 97)"}}>
Workspace details, people, run defaults and how evidence is signed. Everything here maps to airlock.config.json.
</p>
<div style={{"marginTop": "20px", "display": "flex", "flexWrap": "wrap", "gap": "20px", "alignItems": "flex-start"}}>
<nav aria-label="Settings sections" style={{"flex": "1 1 200px", "maxWidth": "100%", "display": "flex", "flexFlow": "column wrap", "gap": "2px"}}>
<a className="c-sub" href="#general" style={{"display": "flex", "alignItems": "center", "height": "38px", "padding": "0px 12px", "borderRadius": "10px", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)", "fontWeight": "700", "textDecoration": "none"}}>
General
</a>
<a className="c-sub" href="#members" style={{"display": "flex", "alignItems": "center", "height": "38px", "padding": "0px 12px", "borderRadius": "10px", "color": "rgb(70, 84, 76)", "textDecoration": "none"}}>
Members
</a>
<a className="c-sub" href="#defaults" style={{"display": "flex", "alignItems": "center", "height": "38px", "padding": "0px 12px", "borderRadius": "10px", "color": "rgb(70, 84, 76)", "textDecoration": "none"}}>
Run defaults
</a>
<a className="c-sub" href="#config" style={{"display": "flex", "alignItems": "center", "height": "38px", "padding": "0px 12px", "borderRadius": "10px", "color": "rgb(70, 84, 76)", "textDecoration": "none"}}>
Configuration file
</a>
<a className="c-sub" href="#signing" style={{"display": "flex", "alignItems": "center", "height": "38px", "padding": "0px 12px", "borderRadius": "10px", "color": "rgb(70, 84, 76)", "textDecoration": "none"}}>
Evidence signing
</a>
<a className="c-sub" href="#plan" style={{"display": "flex", "alignItems": "center", "height": "38px", "padding": "0px 12px", "borderRadius": "10px", "color": "rgb(70, 84, 76)", "textDecoration": "none"}}>
Plan
</a>
</nav>
<div style={{"flex": "999 1 600px", "minWidth": "0px", "display": "grid", "gap": "14px"}}>
<section id="general" aria-labelledby="st-general" style={{"padding": "22px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<h2 id="st-general" style={{"margin": "0px", "font": "700 17px / 1.3 Manrope, system-ui, sans-serif"}}>
General
</h2>
<div style={{"marginTop": "16px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", "gap": "14px"}}>
<div>
<label htmlFor="st-name" style={{"display": "block", "fontSize": "13.5px", "fontWeight": "600"}}>
Workspace name
</label>
<input id="st-name" className="c-input" type="text" readOnly defaultValue="Acme workspace" style={{"marginTop": "6px", "width": "100%", "height": "42px", "padding": "0px 12px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "font": "14.5px \"DM Sans\", system-ui, sans-serif", "color": "rgb(21, 33, 28)"}} />
</div>
<div>
<label htmlFor="st-url" style={{"display": "block", "fontSize": "13.5px", "fontWeight": "600"}}>
App address to test{" "}
<span style={{"fontWeight": "400", "color": "rgb(90, 105, 97)"}}>
(baseUrl)
</span>
</label>
<input id="st-url" className="c-input" type="url" readOnly defaultValue="https://staging.shop.test" style={{"marginTop": "6px", "width": "100%", "height": "42px", "padding": "0px 12px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "font": "500 14px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)"}} />
</div>
<div>
<label htmlFor="st-env" style={{"display": "block", "fontSize": "13.5px", "fontWeight": "600"}}>
Default environment
</label>
<select id="st-env" className="c-input" style={{"marginTop": "6px", "width": "100%", "height": "42px", "padding": "0px 10px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "font": "14.5px \"DM Sans\", system-ui, sans-serif", "color": "rgb(21, 33, 28)"}}>
<option>
staging
</option>
<option>
preview
</option>
</select>
</div>
</div>
<div style={{"marginTop": "16px", "fontSize": "13.5px", "fontWeight": "600"}}>
Projects
</div>
<ul style={{"listStyle": "none", "margin": "8px 0px 0px", "padding": "0px", "display": "flex", "flexWrap": "wrap", "gap": "8px"}}>
<li style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "34px", "padding": "0px 12px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "font": "500 13.5px \"JetBrains Mono\", monospace"}}>
acme-web
<span style={{"fontFamily": "\"DM Sans\", system-ui, sans-serif", "fontSize": "12px", "color": "rgb(90, 105, 97)"}}>
3 suites
</span>
</li>
<li style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "34px", "padding": "0px 12px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "font": "500 13.5px \"JetBrains Mono\", monospace"}}>
acme-admin
<span style={{"fontFamily": "\"DM Sans\", system-ui, sans-serif", "fontSize": "12px", "color": "rgb(90, 105, 97)"}}>
1 suite
</span>
</li>
<li style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "34px", "padding": "0px 12px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "10px", "font": "500 13.5px \"JetBrains Mono\", monospace"}}>
notes-app
<span style={{"fontFamily": "\"DM Sans\", system-ui, sans-serif", "fontSize": "12px", "color": "rgb(90, 105, 97)"}}>
1 suite
</span>
</li>
<li>
<button type="button" style={{"height": "34px", "padding": "0px 12px", "border": "1px dashed rgb(157, 176, 165)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "color": "rgb(47, 111, 91)", "font": "600 13.5px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
+ New project
</button>
</li>
</ul>
</section>
<section id="members" aria-labelledby="st-members" style={{"border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "overflow": "hidden"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "flex-start", "justifyContent": "space-between", "gap": "12px", "padding": "20px 22px"}}>
<div>
<h2 id="st-members" style={{"margin": "0px", "font": "700 17px / 1.3 Manrope, system-ui, sans-serif"}}>
Members
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Admins manage keys and policy · Editors record and run tests · Viewers read results and receipts
</p>
</div>
<div style={{"display": "flex", "flexWrap": "wrap", "gap": "8px"}}>
<label htmlFor="st-invite" style={{"position": "absolute", "width": "1px", "height": "1px", "overflow": "hidden", "clip": "rect(0px, 0px, 0px, 0px)"}}>
Invite by email
</label>
<input id="st-invite" className="c-input" type="email" placeholder="name@company.com" style={{"width": "220px", "height": "38px", "padding": "0px 12px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "font": "14px \"DM Sans\", system-ui, sans-serif", "color": "rgb(21, 33, 28)"}} />
<button type="button" className="c-btn c-pri" style={{"height": "38px", "padding": "0px 14px", "border": "0px", "borderRadius": "10px", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)", "font": "600 14px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
Invite
</button>
</div>
</div>
<div style={{"overflowX": "auto"}}>
<table style={{"width": "100%", "minWidth": "620px", "borderCollapse": "collapse", "fontSize": "14px"}}>
<thead>
<tr style={{"background": "rgb(247, 248, 245)"}}>
<th scope="col" style={{"padding": "10px 22px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Person
</th>
<th scope="col" style={{"padding": "10px 12px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Role
</th>
<th scope="col" style={{"padding": "10px 22px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Last active
</th>
</tr>
</thead>
<tbody>
<tr className="c-row">
<td style={{"padding": "12px 22px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "10px"}}>
<span style={{"width": "32px", "height": "32px", "borderRadius": "50%", "background": "rgb(241, 233, 223)", "color": "rgb(107, 78, 49)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "fontSize": "12.5px", "fontWeight": "700"}}>
MC
</span>
<span>
<strong style={{"display": "block"}}>
Maya Chen
</strong>
<span style={{"fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
maya@acme.test
</span>
</span>
</span>
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block"}}>
Admin
</span>
</td>
<td style={{"padding": "12px 22px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(70, 84, 76)"}}>
Now
</td>
</tr>
<tr className="c-row">
<td style={{"padding": "12px 22px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "10px"}}>
<span style={{"width": "32px", "height": "32px", "borderRadius": "50%", "background": "rgb(234, 241, 251)", "color": "rgb(36, 88, 155)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "fontSize": "12.5px", "fontWeight": "700"}}>
JL
</span>
<span>
<strong style={{"display": "block"}}>
Jordan Lee
</strong>
<span style={{"fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
jordan@acme.test
</span>
</span>
</span>
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(234, 241, 251)", "color": "rgb(36, 88, 155)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block"}}>
Editor
</span>
</td>
<td style={{"padding": "12px 22px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(70, 84, 76)"}}>
Today, 09:54
</td>
</tr>
<tr className="c-row">
<td style={{"padding": "12px 22px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "10px"}}>
<span style={{"width": "32px", "height": "32px", "borderRadius": "50%", "background": "rgb(240, 237, 248)", "color": "rgb(87, 71, 154)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "fontSize": "12.5px", "fontWeight": "700"}}>
PN
</span>
<span>
<strong style={{"display": "block"}}>
Priya Nair
</strong>
<span style={{"fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
priya@acme.test
</span>
</span>
</span>
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block"}}>
Viewer
</span>
</td>
<td style={{"padding": "12px 22px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(70, 84, 76)"}}>
Nov 5
</td>
</tr>
<tr className="c-row">
<td style={{"padding": "12px 22px"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "10px"}}>
<span style={{"width": "32px", "height": "32px", "borderRadius": "9px", "background": "rgb(21, 33, 28)", "color": "rgb(184, 228, 206)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M6 3.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5zM6 8.5v12M18 15.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5zM18 15.5V9a2 2 0 0 0-2-2h-4">
</path>
</svg>
</span>
<span>
<strong style={{"display": "block"}}>
CI pipeline
</strong>
<span style={{"fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
service · uses key air_live_7Hk2…
</span>
</span>
</span>
</td>
<td style={{"padding": "12px"}}>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block"}}>
Runner
</span>
</td>
<td style={{"padding": "12px 22px", "color": "rgb(70, 84, 76)"}}>
2 min ago
</td>
</tr>
</tbody>
</table>
</div>
</section>
<section id="defaults" aria-labelledby="st-defaults" style={{"padding": "22px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<h2 id="st-defaults" style={{"margin": "0px", "font": "700 17px / 1.3 Manrope, system-ui, sans-serif"}}>
Run defaults
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Used by every run unless a suite overrides them
</p>
<ul style={{"listStyle": "none", "margin": "14px 0px 0px", "padding": "0px"}}>
<li style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) auto", "gap": "16px", "alignItems": "center", "padding": "14px 0px", "borderTop": "1px solid rgb(238, 242, 238)"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "600"}}>
<span className="sc-interp">
Run browsers without a window
</span>
</span>
<span style={{"display": "block", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Faster in CI. Turn off to watch a run locally.
</span>
</span>
<code style={{"font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(47, 111, 91)"}}>
<span className="sc-interp">
browser.headless
</span>
</code>
</span>
<button type="button" role="switch" aria-checked="true" aria-label="Run browsers without a window" style={{"position": "relative", "width": "46px", "height": "28px", "padding": "0px", "border": "0px", "borderRadius": "999px", "background": "rgb(47, 111, 91)", "cursor": "pointer"}}>
<span style={{"position": "absolute", "top": "3px", "left": "21px", "width": "22px", "height": "22px", "borderRadius": "50%", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(0, 0, 0, 0.2) 0px 1px 3px", "transition": "left 0.15s"}}>
</span>
</button>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) auto", "gap": "16px", "alignItems": "center", "padding": "14px 0px", "borderTop": "1px solid rgb(238, 242, 238)"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "600"}}>
<span className="sc-interp">
Safety door on
</span>
</span>
<span style={{"display": "block", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Every browser request passes the request policy.
</span>
</span>
<code style={{"font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(47, 111, 91)"}}>
<span className="sc-interp">
proxy.enabled
</span>
</code>
</span>
<button type="button" role="switch" aria-checked="true" aria-label="Safety door on" style={{"position": "relative", "width": "46px", "height": "28px", "padding": "0px", "border": "0px", "borderRadius": "999px", "background": "rgb(47, 111, 91)", "cursor": "pointer"}}>
<span style={{"position": "absolute", "top": "3px", "left": "21px", "width": "22px", "height": "22px", "borderRadius": "50%", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(0, 0, 0, 0.2) 0px 1px 3px", "transition": "left 0.15s"}}>
</span>
</button>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) auto", "gap": "16px", "alignItems": "center", "padding": "14px 0px", "borderTop": "1px solid rgb(238, 242, 238)"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "600"}}>
<span className="sc-interp">
Add accessible-name fallbacks to compiled tests
</span>
</span>
<span style={{"display": "block", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Gives each step a second way to find its element.
</span>
</span>
<code style={{"font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(47, 111, 91)"}}>
<span className="sc-interp">
compiler.emitAriaFallbacks
</span>
</code>
</span>
<button type="button" role="switch" aria-checked="true" aria-label="Add accessible-name fallbacks to compiled tests" style={{"position": "relative", "width": "46px", "height": "28px", "padding": "0px", "border": "0px", "borderRadius": "999px", "background": "rgb(47, 111, 91)", "cursor": "pointer"}}>
<span style={{"position": "absolute", "top": "3px", "left": "21px", "width": "22px", "height": "22px", "borderRadius": "50%", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(0, 0, 0, 0.2) 0px 1px 3px", "transition": "left 0.15s"}}>
</span>
</button>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) auto", "gap": "16px", "alignItems": "center", "padding": "14px 0px", "borderTop": "1px solid rgb(238, 242, 238)"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "600"}}>
<span className="sc-interp">
Self-heal broken locators
</span>
</span>
<span style={{"display": "block", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Applies a fix at 80% match or higher, then asks for review.
</span>
</span>
<code style={{"font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(47, 111, 91)"}}>
<span className="sc-interp">
healer.autoHeal
</span>
</code>
</span>
<button type="button" role="switch" aria-checked="true" aria-label="Self-heal broken locators" style={{"position": "relative", "width": "46px", "height": "28px", "padding": "0px", "border": "0px", "borderRadius": "999px", "background": "rgb(47, 111, 91)", "cursor": "pointer"}}>
<span style={{"position": "absolute", "top": "3px", "left": "21px", "width": "22px", "height": "22px", "borderRadius": "50%", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(0, 0, 0, 0.2) 0px 1px 3px", "transition": "left 0.15s"}}>
</span>
</button>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) auto", "gap": "16px", "alignItems": "center", "padding": "14px 0px", "borderTop": "1px solid rgb(238, 242, 238)"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "600"}}>
<span className="sc-interp">
Save every heal to the dataset
</span>
</span>
<span style={{"display": "block", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Powers the healing log and airlock dataset.
</span>
</span>
<code style={{"font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(47, 111, 91)"}}>
<span className="sc-interp">
healer.saveMutations
</span>
</code>
</span>
<button type="button" role="switch" aria-checked="true" aria-label="Save every heal to the dataset" style={{"position": "relative", "width": "46px", "height": "28px", "padding": "0px", "border": "0px", "borderRadius": "999px", "background": "rgb(47, 111, 91)", "cursor": "pointer"}}>
<span style={{"position": "absolute", "top": "3px", "left": "21px", "width": "22px", "height": "22px", "borderRadius": "50%", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(0, 0, 0, 0.2) 0px 1px 3px", "transition": "left 0.15s"}}>
</span>
</button>
</li>
</ul>
<div style={{"marginTop": "6px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(180px, 100%), 1fr))", "gap": "12px", "paddingTop": "14px", "borderTop": "1px solid rgb(238, 242, 238)"}}>
<div>
<label htmlFor="st-vp" style={{"display": "block", "fontSize": "13.5px", "fontWeight": "600"}}>
Viewport
</label>
<input id="st-vp" className="c-input" type="text" readOnly defaultValue="1280 \u00d7 800" style={{"marginTop": "6px", "width": "100%", "height": "40px", "padding": "0px 12px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "font": "500 14px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)"}} />
</div>
<div>
<label htmlFor="st-timeout" style={{"display": "block", "fontSize": "13.5px", "fontWeight": "600"}}>
Step timeout
</label>
<input id="st-timeout" className="c-input" type="text" readOnly defaultValue="10,000 ms" style={{"marginTop": "6px", "width": "100%", "height": "40px", "padding": "0px 12px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "font": "500 14px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)"}} />
</div>
<div>
<label htmlFor="st-forks" style={{"display": "block", "fontSize": "13.5px", "fontWeight": "600"}}>
Branches at once
</label>
<input id="st-forks" className="c-input" type="text" readOnly defaultValue="5" style={{"marginTop": "6px", "width": "100%", "height": "40px", "padding": "0px 12px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "font": "500 14px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)"}} />
</div>
<div>
<label htmlFor="st-port" style={{"display": "block", "fontSize": "13.5px", "fontWeight": "600"}}>
Gateway port
</label>
<input id="st-port" className="c-input" type="text" readOnly defaultValue="8899" style={{"marginTop": "6px", "width": "100%", "height": "40px", "padding": "0px 12px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "font": "500 14px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)"}} />
</div>
</div>
</section>
<section id="config" aria-labelledby="st-config" style={{"borderRadius": "16px", "background": "rgb(15, 29, 23)", "color": "rgb(215, 231, 221)", "overflow": "hidden"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "justifyContent": "space-between", "gap": "10px", "padding": "16px 20px", "borderBottom": "1px solid rgb(35, 57, 47)"}}>
<div>
<h2 id="st-config" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif", "color": "rgb(255, 255, 255)"}}>
airlock.config.json
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13px", "color": "rgb(169, 196, 182)"}}>
Real secret values are never shown or uploaded — they stay in your runner.
</p>
</div>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "28px", "padding": "0px 10px", "borderRadius": "999px", "background": "rgb(30, 58, 46)", "color": "rgb(191, 240, 216)", "fontSize": "12.5px", "fontWeight": "700"}}>
<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
Matches the schema
</span>
</div>
<pre style={{"margin": "0px", "padding": "16px 20px", "overflowX": "auto", "font": "500 12.8px / 1.75 \"JetBrains Mono\", ui-monospace, monospace", "whiteSpace": "pre", "color": "rgb(215, 231, 221)"}}>
{"{\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"projectName\""}
</span>
{": "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"\"Acme SaaS QA\""}
</span>
{",\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"baseUrl\""}
</span>
{": "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"\"https://staging.shop.test\""}
</span>
{",\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"browser\""}
</span>
{": { "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"headless\""}
</span>
{": "}
<span className="sc-interp">
{"true"}
</span>
{", "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"viewport\""}
</span>
{": { "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"width\""}
</span>
{": 1280, "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"height\""}
</span>
{": 800 } },\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"proxy\""}
</span>
{": { "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"enabled\""}
</span>
{": "}
<span className="sc-interp">
{"true"}
</span>
{", "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"port\""}
</span>
{": 8899 },\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"secrets\""}
</span>
{": {\n    "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"STRIPE_KEY\""}
</span>
{": { "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"real\""}
</span>
{": "}
<span style={{"color": "rgb(143, 179, 160)"}}>
{"\"\u2022\u2022\u2022\u2022 kept in your runner\""}
</span>
{", "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"phantom\""}
</span>
{": "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"\"ph_sec_stripe_test_placeholder\""}
</span>
{", \u2026 }\n  },\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"policy\""}
</span>
{": { "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"defaultAction\""}
</span>
{": "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"\"BLOCK\""}
</span>
{", \u2026 },\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"compiler\""}
</span>
{": { "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"defaultTimeoutMs\""}
</span>
{": 10000, "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"emitAriaFallbacks\""}
</span>
{": "}
<span className="sc-interp">
{"true"}
</span>
{" },\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"healer\""}
</span>
{": { "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"autoHeal\""}
</span>
{": "}
<span className="sc-interp">
{"true"}
</span>
{", "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"confidenceThreshold\""}
</span>
{": 0.8, "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"saveMutations\""}
</span>
{": "}
<span className="sc-interp">
{"true"}
</span>
{" },\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"forker\""}
</span>
{": { "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"maxParallelForks\""}
</span>
{": 5 },\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"compliance\""}
</span>
{": { "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"outputDir\""}
</span>
{": "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"\"./.airlock/compliance\""}
</span>
{", "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"\"generateHtmlReport\""}
</span>
{": true }\n}"}
</pre>
<div style={{"display": "flex", "flexWrap": "wrap", "gap": "10px", "padding": "14px 20px", "borderTop": "1px solid rgb(35, 57, 47)"}}>
<button type="button" className="c-btn" style={{"height": "36px", "padding": "0px 14px", "border": "0px", "borderRadius": "9px", "background": "rgb(184, 228, 206)", "color": "rgb(15, 29, 23)", "font": "700 14px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
Download file
</button>
<button type="button" className="c-btn" style={{"height": "36px", "padding": "0px 14px", "border": "1px solid rgb(47, 75, 63)", "borderRadius": "9px", "background": "transparent", "color": "rgb(231, 242, 236)", "font": "600 14px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
Copy
</button>
</div>
</section>
<section id="signing" aria-labelledby="st-signing" style={{"padding": "22px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<h2 id="st-signing" style={{"margin": "0px", "font": "700 17px / 1.3 Manrope, system-ui, sans-serif"}}>
Evidence signing
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
How each run’s receipt is sealed
</p>
<div role="radiogroup" aria-labelledby="st-signing" style={{"marginTop": "14px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", "gap": "10px"}}>
<button type="button" role="radio" aria-checked="true" style={{"padding": "14px", "border": "2px solid rgb(47, 111, 91)", "borderRadius": "12px", "background": "rgb(242, 248, 244)", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<strong style={{"display": "block", "fontFamily": "\"JetBrains Mono\", monospace"}}>
HMAC-SHA256
</strong>
<span style={{"fontSize": "13.5px", "color": "rgb(70, 84, 76)"}}>
One shared key signs and verifies. Simple for a single team.
</span>
</button>
<button type="button" role="radio" aria-checked="false" style={{"padding": "14px", "border": "2px solid rgb(227, 232, 226)", "borderRadius": "12px", "background": "rgb(255, 255, 255)", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<strong style={{"display": "block", "fontFamily": "\"JetBrains Mono\", monospace"}}>
Ed25519
</strong>
<span style={{"fontSize": "13.5px", "color": "rgb(70, 84, 76)"}}>
A private key signs; anyone with the public key can verify.
</span>
</button>
</div>
<dl style={{"margin": "16px 0px 0px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", "gap": "12px 20px", "fontSize": "14px"}}>
<div>
<dt style={{"color": "rgb(90, 105, 97)"}}>
Key ID
</dt>
<dd style={{"margin": "2px 0px 0px", "fontFamily": "\"JetBrains Mono\", monospace"}}>
airlock-signer-key-id-01
</dd>
</div>
<div>
<dt style={{"color": "rgb(90, 105, 97)"}}>
Receipts folder
</dt>
<dd style={{"margin": "2px 0px 0px", "fontFamily": "\"JetBrains Mono\", monospace"}}>
./.airlock/compliance
</dd>
</div>
<div>
<dt style={{"color": "rgb(90, 105, 97)"}}>
Last rotated
</dt>
<dd style={{"margin": "2px 0px 0px"}}>
Oct 30, 2026 by Maya Chen
</dd>
</div>
</dl>
<div style={{"marginTop": "14px", "display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "12px"}}>
<button type="button" className="c-btn c-sec" style={{"height": "38px", "padding": "0px 14px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "color": "rgb(21, 33, 28)", "font": "600 14px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
Rotate key
</button>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "fontSize": "13.5px", "color": "rgb(154, 74, 7)"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M12 3l10 18H2z">
</path>
<path d="M12 10v5M12 18v.5">
</path>
</svg>
Never use the sample key from the docs outside a demo.
</span>
</div>
</section>
<section id="plan" aria-labelledby="st-plan" style={{"padding": "22px", "border": "2px solid rgb(47, 111, 91)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "flex-start", "justifyContent": "space-between", "gap": "12px"}}>
<div>
<h2 id="st-plan" style={{"margin": "0px", "font": "700 17px / 1.3 Manrope, system-ui, sans-serif"}}>
Cloud plan{" "}
<span style={{"marginLeft": "6px", "height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block", "verticalAlign": "middle"}}>
Early access
</span>
</h2>
<p style={{"margin": "4px 0px 0px", "fontSize": "14px", "color": "rgb(70, 84, 76)"}}>
[YOUR PRICE] / month · daily runs: [YOUR LIMIT] per repository
</p>
</div>
<div style={{"display": "flex", "flexWrap": "wrap", "gap": "10px"}}>
<a className="c-btn c-sec" href="#cicd" data-nav="integrations" style={{"display": "inline-flex", "alignItems": "center", "height": "38px", "padding": "0px 14px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "color": "rgb(21, 33, 28)", "fontSize": "14px", "fontWeight": "600", "textDecoration": "none"}}>
View usage
</a>
<button type="button" className="c-btn c-pri" style={{"height": "38px", "padding": "0px 14px", "border": "0px", "borderRadius": "10px", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)", "font": "600 14px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
Manage billing
</button>
</div>
</div>
<p style={{"margin": "12px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Running locally is always free and doesn’t count toward cloud usage.
</p>
</section>
</div>
</div>
</main>
    </>
  );
}
