// Generated from the original console markup by html2jsx. Static design preview.
export default function PolicyPanel() {
  return (
    <>
<main style={{"flex": "1 1 0%", "width": "100%", "maxWidth": "1320px", "padding": "28px 32px 56px"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "flex-end", "justifyContent": "space-between", "gap": "16px"}}>
<div style={{"minWidth": "0px", "maxWidth": "780px"}}>
<h1 style={{"margin": "0px", "font": "800 30px / 1.2 Manrope, system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
Request policy
</h1>
<p style={{"margin": "6px 0px 0px", "fontSize": "15.5px", "color": "rgb(90, 105, 97)"}}>
Your tests’ safety door. Decide what the test browser may reach, and give it stand-in keys so real ones never enter the browser.
</p>
</div>
<div style={{"display": "flex", "flexWrap": "wrap", "gap": "10px"}}>
<a className="c-btn c-sec" href="#settings" data-nav="settings" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "40px", "padding": "0px 16px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "color": "rgb(21, 33, 28)", "fontSize": "14.5px", "fontWeight": "600", "textDecoration": "none"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M8 8l-4 4 4 4M16 8l4 4-4 4">
</path>
</svg>
Edit as JSON
</a>
<button type="button" className="c-btn c-pri" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "40px", "padding": "0px 16px", "border": "0px", "borderRadius": "10px", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)", "font": "600 14.5px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
<path d="M12 5v14M5 12h14">
</path>
</svg>
Add rule
</button>
</div>
</div>
<div style={{"marginTop": "20px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(420px, 100%), 1fr))", "gap": "14px", "alignItems": "stretch"}}>
<section aria-labelledby="pl-default" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<h2 id="pl-default" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
When no rule matches
</h2>
<p style={{"margin": "4px 0px 0px", "fontSize": "14px", "color": "rgb(90, 105, 97)"}}>
What should happen to a request headed somewhere you haven’t listed?
</p>
<div role="radiogroup" aria-labelledby="pl-default" style={{"marginTop": "14px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(180px, 100%), 1fr))", "gap": "10px"}}>
<button type="button" role="radio" aria-checked="true" style={{"padding": "14px", "border": "2px solid rgb(47, 111, 91)", "borderRadius": "12px", "background": "rgb(242, 248, 244)", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px", "fontWeight": "700"}}>
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#9A4A07" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5c-4.3-1.3-7.5-4.9-7.5-9.5V6z">
</path>
</svg>
Block it
</span>
<span style={{"display": "block", "marginTop": "4px", "fontSize": "13.5px", "color": "rgb(70, 84, 76)"}}>
Recommended. Unknown sites never hear from your tests.
</span>
</button>
<button type="button" role="radio" aria-checked="false" style={{"padding": "14px", "border": "2px solid rgb(227, 232, 226)", "borderRadius": "12px", "background": "rgb(255, 255, 255)", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px", "fontWeight": "700"}}>
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#24589B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<circle cx="12" cy="12" r="8.5">
</circle>
<path d="M3.5 12h17M12 3.5c2.5 3 2.5 14 0 17M12 3.5c-2.5 3-2.5 14 0 17">
</path>
</svg>
Let it through
</span>
<span style={{"display": "block", "marginTop": "4px", "fontSize": "13.5px", "color": "rgb(70, 84, 76)"}}>
Only rules and the blocked list stop requests.
</span>
</button>
</div>
<code style={{"display": "block", "marginTop": "12px", "padding": "8px 10px", "borderRadius": "8px", "background": "rgb(241, 244, 240)", "font": "500 13px \"JetBrains Mono\", monospace"}}>
"defaultAction": "
<span className="sc-interp">
BLOCK
</span>
"
</code>
</section>
<section aria-labelledby="pl-try" style={{"position": "relative", "overflow": "hidden", "padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<h2 id="pl-try" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Try a request
</h2>
<p style={{"margin": "4px 0px 0px", "fontSize": "14px", "color": "rgb(90, 105, 97)"}}>
Pick one to see what the safety door would do with your current policy.
</p>
<div style={{"marginTop": "12px", "display": "flex", "flexWrap": "wrap", "gap": "8px"}}>
<button type="button" className="c-chip" aria-pressed="false" style={{"height": "32px", "padding": "0px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "9px", "background": "rgb(255, 255, 255)", "cursor": "pointer", "font": "600 12.5px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
GET api.stripe.com
</span>
</button>
<button type="button" className="c-chip" aria-pressed="true" style={{"height": "32px", "padding": "0px 10px", "border": "1px solid rgb(47, 111, 91)", "borderRadius": "9px", "background": "rgb(242, 248, 244)", "cursor": "pointer", "font": "600 12.5px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
POST api.stripe.com
</span>
</button>
<button type="button" className="c-chip" aria-pressed="false" style={{"height": "32px", "padding": "0px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "9px", "background": "rgb(255, 255, 255)", "cursor": "pointer", "font": "600 12.5px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
POST webhook.site
</span>
</button>
<button type="button" className="c-chip" aria-pressed="false" style={{"height": "32px", "padding": "0px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "9px", "background": "rgb(255, 255, 255)", "cursor": "pointer", "font": "600 12.5px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
GET cdn.segment.io
</span>
</button>
<button type="button" className="c-chip" aria-pressed="false" style={{"height": "32px", "padding": "0px 10px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "9px", "background": "rgb(255, 255, 255)", "cursor": "pointer", "font": "600 12.5px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
GET localhost:3000
</span>
</button>
</div>
<div style={{"position": "relative", "marginTop": "12px", "display": "flex", "alignItems": "center", "gap": "10px", "height": "46px", "padding": "0px 14px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "12px", "background": "rgb(247, 248, 245)", "overflow": "hidden", "font": "500 13.5px \"JetBrains Mono\", monospace"}}>
<span style={{"fontWeight": "700", "color": "rgb(154, 74, 7)"}}>
<span className="sc-interp">
POST
</span>
</span>
<span style={{"minWidth": "0px", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
https://api.stripe.com/v1/refunds
</span>
</span>
<span data-anim="1" aria-hidden="true" style={{"position": "absolute", "top": "0px", "bottom": "0px", "width": "30%", "background": "linear-gradient(90deg, rgba(47, 111, 91, 0), rgba(47, 111, 91, 0.1), rgba(47, 111, 91, 0))", "animation": "2.4s ease-in-out 0s infinite normal none running c-scan"}}>
</span>
</div>
<div role="status" data-anim="1" style={{"marginTop": "12px", "display": "flex", "gap": "12px", "alignItems": "flex-start", "padding": "14px", "borderRadius": "12px", "background": "rgb(255, 243, 226)", "animation": "0.25s ease 0s 1 normal both running c-in"}}>
<span style={{"flex": "0 0 auto", "width": "34px", "height": "34px", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "color": "rgb(154, 74, 7)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M12 3l7.5 3v5.5c0 4.6-3.2 8.2-7.5 9.5c-4.3-1.3-7.5-4.9-7.5-9.5V6z">
</path>
</svg>
</span>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "800", "color": "rgb(154, 74, 7)"}}>
<span className="sc-interp">
Stopped
</span>
</span>
<span style={{"display": "block", "fontSize": "14px", "color": "rgb(21, 33, 28)"}}>
<span className="sc-interp">
Refunds are never allowed from a test.
</span>
</span>
<span style={{"display": "block", "marginTop": "4px", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "overflowWrap": "anywhere"}}>
<span className="sc-interp">
Rule 'block-destructive-refunds' blocked path '/v1/refunds'
</span>
</span>
</span>
</div>
</section>
</div>
<section aria-labelledby="pl-keys" style={{"marginTop": "14px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "overflow": "hidden"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "flex-start", "justifyContent": "space-between", "gap": "12px", "padding": "18px 20px"}}>
<div>
<h2 id="pl-keys" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Stand-in keys
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
The test browser only ever sees the stand-in. The real value is added at the door — and only for the hosts and methods listed.
</p>
</div>
<button type="button" className="c-btn c-sec" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "36px", "padding": "0px 14px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "color": "rgb(21, 33, 28)", "font": "600 14px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
<path d="M12 5v14M5 12h14">
</path>
</svg>
Add key
</button>
</div>
<div style={{"overflowX": "auto"}}>
<table style={{"width": "100%", "minWidth": "920px", "borderCollapse": "collapse", "fontSize": "13.5px"}}>
<thead>
<tr style={{"background": "rgb(247, 248, 245)"}}>
<th scope="col" style={{"padding": "10px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Name
</th>
<th scope="col" style={{"padding": "10px 12px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Stand-in the browser sees
</th>
<th scope="col" style={{"padding": "10px 12px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Real value
</th>
<th scope="col" style={{"padding": "10px 12px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Only for hosts
</th>
<th scope="col" style={{"padding": "10px 12px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Methods
</th>
<th scope="col" style={{"padding": "10px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Never on paths
</th>
</tr>
</thead>
<tbody>
<tr className="c-row">
<th scope="row" style={{"padding": "14px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "textAlign": "left", "font": "700 13.5px \"JetBrains Mono\", monospace"}}>
STRIPE_KEY
</th>
<td style={{"padding": "14px 12px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontFamily": "\"JetBrains Mono\", monospace"}}>
ph_sec_stripe_test_placeholder
</td>
<td style={{"padding": "14px 12px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<rect x="5" y="11" width="14" height="10" rx="2">
</rect>
<path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3">
</path>
</svg>
In your runner · never shown
</span>
</td>
<td style={{"padding": "14px 12px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontFamily": "\"JetBrains Mono\", monospace"}}>
api.stripe.com, localhost, 127.0.0.1
</td>
<td style={{"padding": "14px 12px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontFamily": "\"JetBrains Mono\", monospace"}}>
GET, POST
</td>
<td style={{"padding": "14px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontFamily": "\"JetBrains Mono\", monospace", "color": "rgb(154, 74, 7)"}}>
*/refunds*, */transfers*, */wipe*
</td>
</tr>
<tr className="c-row">
<th scope="row" style={{"padding": "14px 20px", "textAlign": "left", "font": "700 13.5px \"JetBrains Mono\", monospace"}}>
API_TOKEN
</th>
<td style={{"padding": "14px 12px", "fontFamily": "\"JetBrains Mono\", monospace"}}>
ph_sec_test_dummy_token
</td>
<td style={{"padding": "14px 12px"}}>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "color": "rgb(70, 84, 76)"}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<rect x="5" y="11" width="14" height="10" rx="2">
</rect>
<path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3">
</path>
</svg>
In your runner · never shown
</span>
</td>
<td style={{"padding": "14px 12px", "fontFamily": "\"JetBrains Mono\", monospace"}}>
api.example.com
</td>
<td style={{"padding": "14px 12px", "fontFamily": "\"JetBrains Mono\", monospace"}}>
GET, POST
</td>
<td style={{"padding": "14px 20px", "fontFamily": "\"JetBrains Mono\", monospace", "color": "rgb(154, 74, 7)"}}>
/v1/delete*, /v1/refund*
</td>
</tr>
</tbody>
</table>
</div>
</section>
<div style={{"marginTop": "14px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(420px, 100%), 1fr))", "gap": "14px", "alignItems": "start"}}>
<section aria-labelledby="pl-rules" style={{"border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "overflow": "hidden"}}>
<div style={{"padding": "18px 20px"}}>
<h2 id="pl-rules" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Rules
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Checked top to bottom. The first rule that matches decides.
</p>
</div>
<ol style={{"listStyle": "none", "margin": "0px", "padding": "0px"}}>
<li style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) auto", "gap": "12px", "alignItems": "center", "padding": "14px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "opacity": "1"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "8px"}}>
<span style={{"height": "22px", "padding": "0px 8px", "borderRadius": "6px", "font": "700 11.5px / 22px \"JetBrains Mono\", monospace", "background": "rgb(255, 243, 226)", "color": "rgb(154, 74, 7)"}}>
<span className="sc-interp">
BLOCK
</span>
</span>
<strong style={{"fontFamily": "\"JetBrains Mono\", monospace", "fontSize": "13.5px"}}>
<span className="sc-interp">
block-destructive-refunds
</span>
</strong>
</span>
<span style={{"display": "block", "marginTop": "4px", "fontSize": "13.5px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Prevent accidental refunds or wipes during test runs
</span>
</span>
<span style={{"display": "block", "marginTop": "4px", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
any host · */refunds*, */wipe*, */delete-all*
</span>
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "12px"}}>
<span style={{"fontSize": "12.5px", "color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
9
</span>
{" "}this week
</span>
<button type="button" role="switch" aria-checked="true" aria-label="Turn off block-destructive-refunds" style={{"position": "relative", "width": "44px", "height": "26px", "border": "0px", "borderRadius": "999px", "background": "rgb(47, 111, 91)", "cursor": "pointer", "padding": "0px"}}>
<span style={{"position": "absolute", "top": "3px", "left": "21px", "width": "20px", "height": "20px", "borderRadius": "50%", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(0, 0, 0, 0.2) 0px 1px 3px", "transition": "left 0.15s"}}>
</span>
</button>
</span>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) auto", "gap": "12px", "alignItems": "center", "padding": "14px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "opacity": "1"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "8px"}}>
<span style={{"height": "22px", "padding": "0px 8px", "borderRadius": "6px", "font": "700 11.5px / 22px \"JetBrains Mono\", monospace", "background": "rgb(255, 243, 226)", "color": "rgb(154, 74, 7)"}}>
<span className="sc-interp">
BLOCK
</span>
</span>
<strong style={{"fontFamily": "\"JetBrains Mono\", monospace", "fontSize": "13.5px"}}>
<span className="sc-interp">
block-admin-mutations
</span>
</strong>
</span>
<span style={{"display": "block", "marginTop": "4px", "fontSize": "13.5px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Role tests may read admin pages but never change them
</span>
</span>
<span style={{"display": "block", "marginTop": "4px", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
staging.shop.test · POST · /admin/*
</span>
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "12px"}}>
<span style={{"fontSize": "12.5px", "color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
5
</span>
{" "}this week
</span>
<button type="button" role="switch" aria-checked="true" aria-label="Turn off block-admin-mutations" style={{"position": "relative", "width": "44px", "height": "26px", "border": "0px", "borderRadius": "999px", "background": "rgb(47, 111, 91)", "cursor": "pointer", "padding": "0px"}}>
<span style={{"position": "absolute", "top": "3px", "left": "21px", "width": "20px", "height": "20px", "borderRadius": "50%", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(0, 0, 0, 0.2) 0px 1px 3px", "transition": "left 0.15s"}}>
</span>
</button>
</span>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) auto", "gap": "12px", "alignItems": "center", "padding": "14px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "opacity": "1"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "8px"}}>
<span style={{"height": "22px", "padding": "0px 8px", "borderRadius": "6px", "font": "700 11.5px / 22px \"JetBrains Mono\", monospace", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)"}}>
<span className="sc-interp">
ALLOW
</span>
</span>
<strong style={{"fontFamily": "\"JetBrains Mono\", monospace", "fontSize": "13.5px"}}>
<span className="sc-interp">
allow-stripe-reads
</span>
</strong>
</span>
<span style={{"display": "block", "marginTop": "4px", "fontSize": "13.5px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Payment lookups are safe to make with the stand-in key
</span>
</span>
<span style={{"display": "block", "marginTop": "4px", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
api.stripe.com · GET
</span>
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "12px"}}>
<span style={{"fontSize": "12.5px", "color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
412
</span>
{" "}this week
</span>
<button type="button" role="switch" aria-checked="true" aria-label="Turn off allow-stripe-reads" style={{"position": "relative", "width": "44px", "height": "26px", "border": "0px", "borderRadius": "999px", "background": "rgb(47, 111, 91)", "cursor": "pointer", "padding": "0px"}}>
<span style={{"position": "absolute", "top": "3px", "left": "21px", "width": "20px", "height": "20px", "borderRadius": "50%", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(0, 0, 0, 0.2) 0px 1px 3px", "transition": "left 0.15s"}}>
</span>
</button>
</span>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "minmax(0px, 1fr) auto", "gap": "12px", "alignItems": "center", "padding": "14px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "opacity": "1"}}>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "8px"}}>
<span style={{"height": "22px", "padding": "0px 8px", "borderRadius": "6px", "font": "700 11.5px / 22px \"JetBrains Mono\", monospace", "background": "rgb(255, 243, 226)", "color": "rgb(154, 74, 7)"}}>
<span className="sc-interp">
BLOCK
</span>
</span>
<strong style={{"fontFamily": "\"JetBrains Mono\", monospace", "fontSize": "13.5px"}}>
<span className="sc-interp">
limit-upload-size
</span>
</strong>
</span>
<span style={{"display": "block", "marginTop": "4px", "fontSize": "13.5px", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
Stop unusually large uploads leaving the browser
</span>
</span>
<span style={{"display": "block", "marginTop": "4px", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
any host · payload over 1 MB
</span>
</span>
</span>
<span style={{"display": "flex", "alignItems": "center", "gap": "12px"}}>
<span style={{"fontSize": "12.5px", "color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
0
</span>
{" "}this week
</span>
<button type="button" role="switch" aria-checked="true" aria-label="Turn off limit-upload-size" style={{"position": "relative", "width": "44px", "height": "26px", "border": "0px", "borderRadius": "999px", "background": "rgb(47, 111, 91)", "cursor": "pointer", "padding": "0px"}}>
<span style={{"position": "absolute", "top": "3px", "left": "21px", "width": "20px", "height": "20px", "borderRadius": "50%", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(0, 0, 0, 0.2) 0px 1px 3px", "transition": "left 0.15s"}}>
</span>
</button>
</span>
</li>
</ol>
</section>
<section aria-labelledby="pl-hosts" style={{"padding": "18px 20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<h2 id="pl-hosts" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Hosts
</h2>
<div style={{"marginTop": "14px", "fontSize": "13px", "fontWeight": "700", "letterSpacing": "0.05em", "textTransform": "uppercase", "color": "rgb(31, 107, 79)"}}>
Allowed
</div>
<ul style={{"listStyle": "none", "margin": "8px 0px 0px", "padding": "0px", "display": "flex", "flexWrap": "wrap", "gap": "8px"}}>
<li style={{"display": "inline-flex", "alignItems": "center", "height": "32px", "padding": "0px 12px", "border": "1px solid rgb(207, 227, 215)", "borderRadius": "9px", "background": "rgb(242, 248, 244)", "font": "500 13px \"JetBrains Mono\", monospace"}}>
localhost
</li>
<li style={{"display": "inline-flex", "alignItems": "center", "height": "32px", "padding": "0px 12px", "border": "1px solid rgb(207, 227, 215)", "borderRadius": "9px", "background": "rgb(242, 248, 244)", "font": "500 13px \"JetBrains Mono\", monospace"}}>
127.0.0.1
</li>
<li style={{"display": "inline-flex", "alignItems": "center", "height": "32px", "padding": "0px 12px", "border": "1px solid rgb(207, 227, 215)", "borderRadius": "9px", "background": "rgb(242, 248, 244)", "font": "500 13px \"JetBrains Mono\", monospace"}}>
api.stripe.com
</li>
<li style={{"display": "inline-flex", "alignItems": "center", "height": "32px", "padding": "0px 12px", "border": "1px solid rgb(207, 227, 215)", "borderRadius": "9px", "background": "rgb(242, 248, 244)", "font": "500 13px \"JetBrains Mono\", monospace"}}>
staging.shop.test
</li>
<li>
<button type="button" style={{"height": "32px", "padding": "0px 12px", "border": "1px dashed rgb(157, 176, 165)", "borderRadius": "9px", "background": "rgb(255, 255, 255)", "color": "rgb(47, 111, 91)", "font": "600 13px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
+ Add host
</button>
</li>
</ul>
<div style={{"marginTop": "16px", "fontSize": "13px", "fontWeight": "700", "letterSpacing": "0.05em", "textTransform": "uppercase", "color": "rgb(154, 74, 7)"}}>
Always blocked
</div>
<ul style={{"listStyle": "none", "margin": "8px 0px 0px", "padding": "0px", "display": "flex", "flexWrap": "wrap", "gap": "8px"}}>
<li style={{"display": "inline-flex", "alignItems": "center", "height": "32px", "padding": "0px 12px", "border": "1px solid rgb(243, 211, 174)", "borderRadius": "9px", "background": "rgb(255, 248, 238)", "font": "500 13px \"JetBrains Mono\", monospace"}}>
pastebin.com
</li>
<li style={{"display": "inline-flex", "alignItems": "center", "height": "32px", "padding": "0px 12px", "border": "1px solid rgb(243, 211, 174)", "borderRadius": "9px", "background": "rgb(255, 248, 238)", "font": "500 13px \"JetBrains Mono\", monospace"}}>
webhook.site
</li>
<li style={{"display": "inline-flex", "alignItems": "center", "height": "32px", "padding": "0px 12px", "border": "1px solid rgb(243, 211, 174)", "borderRadius": "9px", "background": "rgb(255, 248, 238)", "font": "500 13px \"JetBrains Mono\", monospace"}}>
transfer.sh
</li>
<li>
<button type="button" style={{"height": "32px", "padding": "0px 12px", "border": "1px dashed rgb(157, 176, 165)", "borderRadius": "9px", "background": "rgb(255, 255, 255)", "color": "rgb(47, 111, 91)", "font": "600 13px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
+ Add host
</button>
</li>
</ul>
<p style={{"margin": "16px 0px 0px", "display": "flex", "gap": "8px", "alignItems": "flex-start", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{"flex": "0 0 auto", "marginTop": "1px"}}>
<circle cx="12" cy="12" r="9">
</circle>
<path d="M12 11v5.5M12 7.6v.1">
</path>
</svg>
The safety door covers requests made by the test browser. Calls your own servers make aren’t routed through it.
</p>
</section>
</div>
<section aria-labelledby="pl-log" style={{"marginTop": "14px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "overflow": "hidden"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "flex-start", "justifyContent": "space-between", "gap": "12px", "padding": "18px 20px"}}>
<div>
<h2 id="pl-log" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Recent decisions
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Every decision is also written to the run’s signed ledger
</p>
</div>
<a href="#runs" data-nav="runs" style={{"fontSize": "13.5px", "fontWeight": "600", "textDecoration": "none"}}>
See runs
</a>
</div>
<div style={{"overflowX": "auto"}}>
<table style={{"width": "100%", "minWidth": "900px", "borderCollapse": "collapse", "fontSize": "13.5px"}}>
<thead>
<tr style={{"background": "rgb(247, 248, 245)"}}>
<th scope="col" style={{"padding": "10px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Time
</th>
<th scope="col" style={{"padding": "10px 12px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Decision
</th>
<th scope="col" style={{"padding": "10px 12px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Request
</th>
<th scope="col" style={{"padding": "10px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Reason
</th>
</tr>
</thead>
<tbody>
<tr className="c-row">
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
10:18:42
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(255, 243, 226)", "color": "rgb(154, 74, 7)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block"}}>
Stopped
</span>
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontFamily": "\"JetBrains Mono\", monospace"}}>
POST staging.shop.test/admin/settings
</td>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(70, 84, 76)"}}>
Rule block-admin-mutations blocked path /admin/settings
</td>
</tr>
<tr className="c-row">
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
09:31:27
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(255, 243, 226)", "color": "rgb(154, 74, 7)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block"}}>
Stopped
</span>
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontFamily": "\"JetBrains Mono\", monospace"}}>
POST api.stripe.com/v1/refunds
</td>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(70, 84, 76)"}}>
Secret policy blocks mutations on /v1/refunds (matches */refunds*)
</td>
</tr>
<tr className="c-row">
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
09:31:22
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(240, 237, 248)", "color": "rgb(87, 71, 154)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block"}}>
Key swapped
</span>
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontFamily": "\"JetBrains Mono\", monospace"}}>
GET api.stripe.com/v1/payment_methods
</td>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(70, 84, 76)"}}>
STRIPE_KEY stand-in replaced on an allowed host
</td>
</tr>
<tr className="c-row">
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
09:31:19
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(234, 241, 251)", "color": "rgb(36, 88, 155)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block"}}>
Cleaned
</span>
</td>
<td style={{"padding": "12px", "borderBottom": "1px solid rgb(238, 242, 238)", "fontFamily": "\"JetBrains Mono\", monospace"}}>
GET staging.shop.test/api/cart
</td>
<td style={{"padding": "12px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "color": "rgb(70, 84, 76)"}}>
1 real secret removed from the response before the page saw it
</td>
</tr>
<tr className="c-row">
<td style={{"padding": "12px 20px", "color": "rgb(90, 105, 97)", "whiteSpace": "nowrap"}}>
09:31:05
</td>
<td style={{"padding": "12px"}}>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(255, 243, 226)", "color": "rgb(154, 74, 7)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block"}}>
Stopped
</span>
</td>
<td style={{"padding": "12px", "fontFamily": "\"JetBrains Mono\", monospace"}}>
POST webhook.site/a1b2c3
</td>
<td style={{"padding": "12px 20px", "color": "rgb(70, 84, 76)"}}>
Host webhook.site is on the blocked list
</td>
</tr>
</tbody>
</table>
</div>
</section>
</main>
    </>
  );
}
