// Generated from the original console markup by html2jsx. Static design preview.
export default function CapsulesPanel() {
  return (
    <>
<main style={{"flex": "1 1 0%", "width": "100%", "maxWidth": "1320px", "padding": "28px 32px 56px"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "12px"}}>
<h1 style={{"margin": "0px", "font": "800 30px / 1.2 Manrope, system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
Bug capsules
</h1>
<span style={{"height": "26px", "padding": "0px 10px", "borderRadius": "999px", "background": "rgb(240, 237, 248)", "color": "rgb(87, 71, 154)", "fontSize": "12.5px", "fontWeight": "700", "lineHeight": "26px", "letterSpacing": "0.04em"}}>
PREVIEW
</span>
</div>
<p style={{"margin": "6px 0px 0px", "maxWidth": "780px", "fontSize": "15.5px", "color": "rgb(90, 105, 97)"}}>
When something breaks in a test environment, a capsule keeps the last moments before the error. AirlockQA turns it into a Playwright test that reproduces the bug.
</p>
<div role="note" style={{"marginTop": "18px", "display": "flex", "gap": "12px", "alignItems": "flex-start", "padding": "14px 16px", "border": "1px solid rgb(243, 211, 174)", "borderRadius": "14px", "background": "rgb(255, 251, 245)"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9A4A07" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{"flex": "0 0 auto", "marginTop": "1px"}}>
<path d="M12 3l10 18H2z">
</path>
<path d="M12 10v5M12 18v.5">
</path>
</svg>
<div style={{"fontSize": "14.5px", "color": "rgb(21, 33, 28)"}}>
<strong>
Prototype — keep real customer data out.
</strong>
{" "}Emails, card numbers, tokens and obvious secrets are scrubbed on a best-effort basis, but capsules aren’t encrypted and storage can still hold sensitive values. Use staging or preview data only.
</div>
</div>
<div style={{"marginTop": "16px", "display": "flex", "flexWrap": "wrap", "gap": "14px", "alignItems": "flex-start"}}>
<section aria-labelledby="cs-list" style={{"flex": "1 1 300px", "minWidth": "0px"}}>
<h2 id="cs-list" style={{"margin": "0px 0px 10px", "fontSize": "13px", "fontWeight": "700", "letterSpacing": "0.06em", "textTransform": "uppercase", "color": "rgb(90, 105, 97)"}}>
Captured · 3
</h2>
<div style={{"display": "grid", "gap": "8px"}}>
<button type="button" className="c-cap" aria-pressed="true" style={{"width": "100%", "padding": "14px 16px", "border": "1px solid rgb(47, 111, 91)", "borderRadius": "14px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(47, 111, 91, 0.14) 0px 0px 0px 3px", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#57479A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5.17 13.17L13.17 5.17A4 4 0 0 1 18.83 10.83L10.83 18.83A4 4 0 0 1 5.17 13.17zM9.17 9.17l5.66 5.66">
</path>
</svg>
<span style={{"font": "700 13.5px \"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
cap_7f2a91
</span>
</span>
<span style={{"marginLeft": "auto", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Nov 6, 09:12
</span>
</span>
</span>
<span style={{"display": "block", "marginTop": "8px", "font": "600 13px / 1.45 \"JetBrains Mono\", monospace", "color": "rgb(180, 35, 24)"}}>
<span className="sc-interp">
TypeError: Cannot read properties of undefined (reading 'total')
</span>
</span>
<span style={{"display": "flex", "flexWrap": "wrap", "gap": "6px", "marginTop": "8px"}}>
<span style={{"height": "22px", "padding": "0px 8px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "fontSize": "12px", "fontWeight": "600", "lineHeight": "22px"}}>
<span className="sc-interp">
staging
</span>
</span>
<span style={{"height": "22px", "padding": "0px 8px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "font": "600 12px / 22px \"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
/checkout
</span>
</span>
<span style={{"height": "22px", "padding": "0px 8px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "fontSize": "12px", "fontWeight": "600", "lineHeight": "22px"}}>
<span className="sc-interp">
38
</span>
{" "}events
</span>
</span>
</button>
<button type="button" className="c-cap" aria-pressed="false" style={{"width": "100%", "padding": "14px 16px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "14px", "background": "rgb(255, 255, 255)", "boxShadow": "none", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#57479A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5.17 13.17L13.17 5.17A4 4 0 0 1 18.83 10.83L10.83 18.83A4 4 0 0 1 5.17 13.17zM9.17 9.17l5.66 5.66">
</path>
</svg>
<span style={{"font": "700 13.5px \"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
cap_19bd04
</span>
</span>
<span style={{"marginLeft": "auto", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Nov 5, 16:40
</span>
</span>
</span>
<span style={{"display": "block", "marginTop": "8px", "font": "600 13px / 1.45 \"JetBrains Mono\", monospace", "color": "rgb(180, 35, 24)"}}>
<span className="sc-interp">
Unhandled promise rejection: 409 Conflict
</span>
</span>
<span style={{"display": "flex", "flexWrap": "wrap", "gap": "6px", "marginTop": "8px"}}>
<span style={{"height": "22px", "padding": "0px 8px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "fontSize": "12px", "fontWeight": "600", "lineHeight": "22px"}}>
<span className="sc-interp">
preview
</span>
</span>
<span style={{"height": "22px", "padding": "0px 8px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "font": "600 12px / 22px \"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
/cart
</span>
</span>
<span style={{"height": "22px", "padding": "0px 8px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "fontSize": "12px", "fontWeight": "600", "lineHeight": "22px"}}>
<span className="sc-interp">
22
</span>
{" "}events
</span>
</span>
</button>
<button type="button" className="c-cap" aria-pressed="false" style={{"width": "100%", "padding": "14px 16px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "14px", "background": "rgb(255, 255, 255)", "boxShadow": "none", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "8px"}}>
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#57479A" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5.17 13.17L13.17 5.17A4 4 0 0 1 18.83 10.83L10.83 18.83A4 4 0 0 1 5.17 13.17zM9.17 9.17l5.66 5.66">
</path>
</svg>
<span style={{"font": "700 13.5px \"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
cap_c03e77
</span>
</span>
<span style={{"marginLeft": "auto", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Nov 4, 11:08
</span>
</span>
</span>
<span style={{"display": "block", "marginTop": "8px", "font": "600 13px / 1.45 \"JetBrains Mono\", monospace", "color": "rgb(180, 35, 24)"}}>
<span className="sc-interp">
ReferenceError: couponState is not defined
</span>
</span>
<span style={{"display": "flex", "flexWrap": "wrap", "gap": "6px", "marginTop": "8px"}}>
<span style={{"height": "22px", "padding": "0px 8px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "fontSize": "12px", "fontWeight": "600", "lineHeight": "22px"}}>
<span className="sc-interp">
staging
</span>
</span>
<span style={{"height": "22px", "padding": "0px 8px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "font": "600 12px / 22px \"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
/checkout
</span>
</span>
<span style={{"height": "22px", "padding": "0px 8px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "fontSize": "12px", "fontWeight": "600", "lineHeight": "22px"}}>
<span className="sc-interp">
15
</span>
{" "}events
</span>
</span>
</button>
</div>
<div style={{"marginTop": "14px", "padding": "16px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "14px", "background": "rgb(255, 255, 255)"}}>
<div style={{"font": "700 14.5px / 1.3 Manrope, system-ui, sans-serif"}}>
How a capsule is made
</div>
<ol style={{"margin": "10px 0px 0px", "paddingLeft": "18px", "display": "grid", "gap": "6px", "fontSize": "13.5px", "color": "rgb(70, 84, 76)"}}>
<li>
Your test app keeps a small rolling log of recent clicks, inputs, requests and console messages.
</li>
<li>
When an error isn’t caught, it saves that log as a capsule with a checksum.
</li>
<li>
Teleport replays the steps in a fresh browser and writes a repro test.
</li>
</ol>
</div>
</section>
<section aria-labelledby="cs-detail" style={{"flex": "999 1 560px", "minWidth": "0px", "display": "grid", "gap": "14px"}}>
<div style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "flex-start", "justifyContent": "space-between", "gap": "12px"}}>
<div style={{"minWidth": "0px"}}>
<h2 id="cs-detail" style={{"margin": "0px", "font": "700 17px / 1.3 Manrope, system-ui, sans-serif"}}>
<span className="sc-interp">
Checkout crashed after applying a coupon twice
</span>
</h2>
<p style={{"margin": "2px 0px 0px", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(180, 35, 24)", "overflowWrap": "anywhere"}}>
<span className="sc-interp">
TypeError: Cannot read properties of undefined (reading 'total')
</span>
</p>
</div>
<span style={{"height": "26px", "padding": "0px 10px", "borderRadius": "999px", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)", "fontSize": "12.5px", "fontWeight": "700", "lineHeight": "26px"}}>
Checksum valid
</span>
</div>
<dl style={{"margin": "14px 0px 0px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(170px, 100%), 1fr))", "gap": "10px 18px", "fontSize": "13.5px"}}>
<div>
<dt style={{"color": "rgb(90, 105, 97)"}}>
Environment
</dt>
<dd style={{"margin": "2px 0px 0px", "fontWeight": "600"}}>
<span className="sc-interp">
staging
</span>
{" "}· app{" "}
<span className="sc-interp">
2.14.0
</span>
</dd>
</div>
<div>
<dt style={{"color": "rgb(90, 105, 97)"}}>
Page
</dt>
<dd style={{"margin": "2px 0px 0px", "fontFamily": "\"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
/checkout
</span>
</dd>
</div>
<div>
<dt style={{"color": "rgb(90, 105, 97)"}}>
Browser
</dt>
<dd style={{"margin": "2px 0px 0px"}}>
Chromium · 1280×800
</dd>
</div>
<div>
<dt style={{"color": "rgb(90, 105, 97)"}}>
Checksum
</dt>
<dd style={{"margin": "2px 0px 0px", "fontFamily": "\"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
sha256:5be0…a91c
</span>
</dd>
</div>
</dl>
<div style={{"marginTop": "14px", "fontSize": "13px", "fontWeight": "700", "letterSpacing": "0.05em", "textTransform": "uppercase", "color": "rgb(90, 105, 97)"}}>
Scrubbed before saving
</div>
<div style={{"marginTop": "8px", "display": "flex", "flexWrap": "wrap", "gap": "8px"}}>
<span style={{"height": "28px", "padding": "0px 10px", "borderRadius": "8px", "background": "rgb(240, 237, 248)", "color": "rgb(87, 71, 154)", "font": "600 12.5px / 28px \"JetBrains Mono\", monospace"}}>
[REDACTED_EMAIL] × 2
</span>
<span style={{"height": "28px", "padding": "0px 10px", "borderRadius": "8px", "background": "rgb(240, 237, 248)", "color": "rgb(87, 71, 154)", "font": "600 12.5px / 28px \"JetBrains Mono\", monospace"}}>
[REDACTED_PAYMENT_CARD] × 1
</span>
<span style={{"height": "28px", "padding": "0px 10px", "borderRadius": "8px", "background": "rgb(240, 237, 248)", "color": "rgb(87, 71, 154)", "font": "600 12.5px / 28px \"JetBrains Mono\", monospace"}}>
[REDACTED_JWT_TOKEN] × 1
</span>
<span style={{"height": "28px", "padding": "0px 10px", "borderRadius": "8px", "background": "rgb(255, 243, 226)", "color": "rgb(154, 74, 7)", "fontSize": "12.5px", "fontWeight": "700", "lineHeight": "28px"}}>
Review: 3 storage keys, 2 cookies kept
</span>
</div>
</div>
<div style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<h3 style={{"margin": "0px", "font": "700 16px / 1.3 Manrope, system-ui, sans-serif"}}>
The last moments before the error
</h3>
<ol style={{"listStyle": "none", "margin": "12px 0px 0px", "padding": "0px", "display": "grid", "gap": "0px"}}>
<li style={{"display": "grid", "gridTemplateColumns": "64px 120px minmax(0px, 1fr)", "gap": "12px", "alignItems": "baseline", "padding": "9px 0px", "borderBottom": "1px solid rgb(241, 244, 240)", "fontSize": "13.5px"}}>
<span style={{"font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
−4.8s
</span>
</span>
<span>
<span style={{"display": "inline-block", "height": "22px", "padding": "0px 8px", "borderRadius": "6px", "font": "600 11.5px / 22px \"JetBrains Mono\", monospace", "background": "rgb(234, 241, 251)", "color": "rgb(36, 88, 155)"}}>
<span className="sc-interp">
navigation
</span>
</span>
</span>
<span style={{"minWidth": "0px", "fontFamily": "\"JetBrains Mono\", monospace", "fontSize": "13px", "color": "rgb(21, 33, 28)", "overflowWrap": "anywhere"}}>
<span className="sc-interp">
/checkout
</span>
</span>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "64px 120px minmax(0px, 1fr)", "gap": "12px", "alignItems": "baseline", "padding": "9px 0px", "borderBottom": "1px solid rgb(241, 244, 240)", "fontSize": "13.5px"}}>
<span style={{"font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
−4.1s
</span>
</span>
<span>
<span style={{"display": "inline-block", "height": "22px", "padding": "0px 8px", "borderRadius": "6px", "font": "600 11.5px / 22px \"JetBrains Mono\", monospace", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
dom_input
</span>
</span>
</span>
<span style={{"minWidth": "0px", "fontFamily": "\"JetBrains Mono\", monospace", "fontSize": "13px", "color": "rgb(21, 33, 28)", "overflowWrap": "anywhere"}}>
<span className="sc-interp">
input[name=email] → [REDACTED_EMAIL]
</span>
</span>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "64px 120px minmax(0px, 1fr)", "gap": "12px", "alignItems": "baseline", "padding": "9px 0px", "borderBottom": "1px solid rgb(241, 244, 240)", "fontSize": "13.5px"}}>
<span style={{"font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
−3.6s
</span>
</span>
<span>
<span style={{"display": "inline-block", "height": "22px", "padding": "0px 8px", "borderRadius": "6px", "font": "600 11.5px / 22px \"JetBrains Mono\", monospace", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
dom_input
</span>
</span>
</span>
<span style={{"minWidth": "0px", "fontFamily": "\"JetBrains Mono\", monospace", "fontSize": "13px", "color": "rgb(21, 33, 28)", "overflowWrap": "anywhere"}}>
<span className="sc-interp">
input[name=coupon] → "SAVE20"
</span>
</span>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "64px 120px minmax(0px, 1fr)", "gap": "12px", "alignItems": "baseline", "padding": "9px 0px", "borderBottom": "1px solid rgb(241, 244, 240)", "fontSize": "13.5px"}}>
<span style={{"font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
−3.2s
</span>
</span>
<span>
<span style={{"display": "inline-block", "height": "22px", "padding": "0px 8px", "borderRadius": "6px", "font": "600 11.5px / 22px \"JetBrains Mono\", monospace", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
dom_click
</span>
</span>
</span>
<span style={{"minWidth": "0px", "fontFamily": "\"JetBrains Mono\", monospace", "fontSize": "13px", "color": "rgb(21, 33, 28)", "overflowWrap": "anywhere"}}>
<span className="sc-interp">
button “Apply coupon”
</span>
</span>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "64px 120px minmax(0px, 1fr)", "gap": "12px", "alignItems": "baseline", "padding": "9px 0px", "borderBottom": "1px solid rgb(241, 244, 240)", "fontSize": "13.5px"}}>
<span style={{"font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
−2.9s
</span>
</span>
<span>
<span style={{"display": "inline-block", "height": "22px", "padding": "0px 8px", "borderRadius": "6px", "font": "600 11.5px / 22px \"JetBrains Mono\", monospace", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)"}}>
<span className="sc-interp">
network_req
</span>
</span>
</span>
<span style={{"minWidth": "0px", "fontFamily": "\"JetBrains Mono\", monospace", "fontSize": "13px", "color": "rgb(21, 33, 28)", "overflowWrap": "anywhere"}}>
<span className="sc-interp">
POST /api/cart/coupon → 200
</span>
</span>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "64px 120px minmax(0px, 1fr)", "gap": "12px", "alignItems": "baseline", "padding": "9px 0px", "borderBottom": "1px solid rgb(241, 244, 240)", "fontSize": "13.5px"}}>
<span style={{"font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
−1.4s
</span>
</span>
<span>
<span style={{"display": "inline-block", "height": "22px", "padding": "0px 8px", "borderRadius": "6px", "font": "600 11.5px / 22px \"JetBrains Mono\", monospace", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
dom_click
</span>
</span>
</span>
<span style={{"minWidth": "0px", "fontFamily": "\"JetBrains Mono\", monospace", "fontSize": "13px", "color": "rgb(21, 33, 28)", "overflowWrap": "anywhere"}}>
<span className="sc-interp">
button “Apply coupon” (again)
</span>
</span>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "64px 120px minmax(0px, 1fr)", "gap": "12px", "alignItems": "baseline", "padding": "9px 0px", "borderBottom": "1px solid rgb(241, 244, 240)", "fontSize": "13.5px"}}>
<span style={{"font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
−1.1s
</span>
</span>
<span>
<span style={{"display": "inline-block", "height": "22px", "padding": "0px 8px", "borderRadius": "6px", "font": "600 11.5px / 22px \"JetBrains Mono\", monospace", "background": "rgb(255, 243, 226)", "color": "rgb(154, 74, 7)"}}>
<span className="sc-interp">
console
</span>
</span>
</span>
<span style={{"minWidth": "0px", "fontFamily": "\"JetBrains Mono\", monospace", "fontSize": "13px", "color": "rgb(21, 33, 28)", "overflowWrap": "anywhere"}}>
<span className="sc-interp">
warn: coupon already applied
</span>
</span>
</li>
<li style={{"display": "grid", "gridTemplateColumns": "64px 120px minmax(0px, 1fr)", "gap": "12px", "alignItems": "baseline", "padding": "9px 0px", "borderBottom": "1px solid rgb(241, 244, 240)", "fontSize": "13.5px"}}>
<span style={{"font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
0.0s
</span>
</span>
<span>
<span style={{"display": "inline-block", "height": "22px", "padding": "0px 8px", "borderRadius": "6px", "font": "600 11.5px / 22px \"JetBrains Mono\", monospace", "background": "rgb(253, 237, 235)", "color": "rgb(180, 35, 24)"}}>
<span className="sc-interp">
uncaught_error
</span>
</span>
</span>
<span style={{"minWidth": "0px", "fontFamily": "\"JetBrains Mono\", monospace", "fontSize": "13px", "color": "rgb(180, 35, 24)", "overflowWrap": "anywhere"}}>
<span className="sc-interp">
TypeError: Cannot read properties of undefined (reading 'total') · checkout.js:212
</span>
</span>
</li>
</ol>
</div>
<div style={{"borderRadius": "16px", "background": "rgb(15, 29, 23)", "color": "rgb(215, 231, 221)", "overflow": "hidden"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "justifyContent": "space-between", "gap": "10px", "padding": "14px 18px", "borderBottom": "1px solid rgb(35, 57, 47)"}}>
<div>
<h3 style={{"margin": "0px", "font": "700 15.5px / 1.3 Manrope, system-ui, sans-serif", "color": "rgb(255, 255, 255)"}}>
Repro test
</h3>
<p style={{"margin": "2px 0px 0px", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(169, 196, 182)"}}>
npx airlock teleport{" "}
<span className="sc-interp">
cap_7f2a91
</span>
.json -o tests/repro-bug.spec.ts
</p>
</div>
<a className="c-btn" href="#runs" data-nav="runs" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "38px", "padding": "0px 14px", "borderRadius": "10px", "background": "rgb(184, 228, 206)", "color": "rgb(15, 29, 23)", "fontSize": "14px", "fontWeight": "700", "textDecoration": "none"}}>
<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
<path d="M8 5.5v13l10.5-6.5z">
</path>
</svg>
Run the repro
</a>
</div>
<pre data-anim="1" style={{"margin": "0px", "padding": "16px 18px", "overflowX": "auto", "font": "500 12.8px / 1.75 \"JetBrains Mono\", ui-monospace, monospace", "whiteSpace": "pre", "color": "rgb(215, 231, 221)", "animation": "0.3s ease 0s 1 normal both running c-in"}}>
<span style={{"color": "rgb(127, 214, 174)"}}>
{"import"}
</span>
{" { test, expect } "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"from"}
</span>
{" "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'@playwright/test'"}
</span>
{";\n\ntest("}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'repro: "}
<span className="sc-interp">
{"cap_7f2a91"}
</span>
{" on "}
<span className="sc-interp">
{"/checkout"}
</span>
{"'"}
</span>
{", "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"async"}
</span>
{" ({ page }) ="}
{">"}
{" {\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"const"}
</span>
{" errors: string[] = [];\n  page.on("}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'pageerror'"}
</span>
{", (e) ="}
{">"}
{" errors.push(e.message));\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" page.goto("}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'https://staging.shop.test"}
<span className="sc-interp">
{"/checkout"}
</span>
{"'"}
</span>
{");\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" page.getByLabel("}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'Coupon'"}
</span>
{").fill("}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'SAVE20'"}
</span>
{");\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" page.getByRole("}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'button'"}
</span>
{", { name: "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'Apply coupon'"}
</span>
{" }).click();\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" page.getByRole("}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'button'"}
</span>
{", { name: "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'Apply coupon'"}
</span>
{" }).click();\n  expect(errors).toContain("}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"\""}
<span className="sc-interp">
{"Cannot read properties of undefined (reading 'total')"}
</span>
{"\""}
</span>
{");\n});"}
</pre>
</div>
</section>
</div>
</main>
    </>
  );
}
