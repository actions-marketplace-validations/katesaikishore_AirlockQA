// Generated from the original console markup by html2jsx. Static design preview.
export default function ChaosPanel() {
  return (
    <>
<main style={{"flex": "1 1 0%", "width": "100%", "maxWidth": "1320px", "padding": "28px 32px 56px"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "12px"}}>
<h1 style={{"margin": "0px", "font": "800 30px / 1.2 Manrope, system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
Chaos report
</h1>
<span style={{"height": "26px", "padding": "0px 10px", "borderRadius": "999px", "background": "rgb(240, 237, 248)", "color": "rgb(87, 71, 154)", "fontSize": "12.5px", "fontWeight": "700", "lineHeight": "26px", "letterSpacing": "0.04em"}}>
PREVIEW
</span>
</div>
<p style={{"margin": "6px 0px 0px", "maxWidth": "780px", "fontSize": "15.5px", "color": "rgb(90, 105, 97)"}}>
Find buttons that could charge, submit or send twice — before a customer double-clicks or a network hiccup retries.
</p>
<div role="note" style={{"marginTop": "18px", "display": "flex", "gap": "12px", "alignItems": "flex-start", "padding": "14px 16px", "border": "1px solid rgb(220, 214, 239)", "borderRadius": "14px", "background": "rgb(247, 245, 252)"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#57479A" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{"flex": "0 0 auto", "marginTop": "1px"}}>
<circle cx="12" cy="12" r="9">
</circle>
<path d="M12 11v5.5M12 7.6v.1">
</path>
</svg>
<div style={{"fontSize": "14.5px", "color": "rgb(21, 33, 28)"}}>
Today the check watches{" "}
<strong>
one real click
</strong>
{" "}and looks for an idempotency key on the request it sends. Duplicate, dropped-connection and 502 scenarios are{" "}
<strong>
described, not executed
</strong>
{" "}yet — each row says which.
</div>
</div>
<div style={{"marginTop": "16px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(420px, 100%), 1fr))", "gap": "14px", "alignItems": "stretch"}}>
<section aria-labelledby="ch-run" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<h2 id="ch-run" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
What to check
</h2>
<div style={{"marginTop": "14px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(200px, 100%), 1fr))", "gap": "12px"}}>
<div>
<label htmlFor="ch-url" style={{"display": "block", "fontSize": "13.5px", "fontWeight": "600"}}>
Page
</label>
<input id="ch-url" type="url" readOnly defaultValue="http://localhost:3000/checkout" style={{"marginTop": "6px", "width": "100%", "height": "42px", "padding": "0px 12px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "font": "500 13.5px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)"}} />
</div>
<div>
<label htmlFor="ch-act" style={{"display": "block", "fontSize": "13.5px", "fontWeight": "600"}}>
Risky action
</label>
<select id="ch-act" style={{"marginTop": "6px", "width": "100%", "height": "42px", "padding": "0px 10px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "font": "14.5px \"DM Sans\", system-ui, sans-serif", "color": "rgb(21, 33, 28)"}}>
<option>
Click “Pay now”
</option>
<option>
Click “Submit order”
</option>
<option>
Click “Send invite”
</option>
</select>
</div>
</div>
<div style={{"marginTop": "14px", "display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "10px"}}>
<button type="button" className="c-btn c-pri" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "42px", "padding": "0px 18px", "border": "0px", "borderRadius": "10px", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)", "font": "700 14.5px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M13 3L5 13.5h6l-1 7.5 8-10.5h-6z">
</path>
</svg>
<span className="sc-interp">
Run check again
</span>
</button>
<code style={{"padding": "8px 10px", "borderRadius": "8px", "background": "rgb(241, 244, 240)", "font": "500 13px \"JetBrains Mono\", monospace"}}>
npx qafind chaos http://localhost:3000
</code>
</div>
<div aria-hidden="true" style={{"position": "relative", "marginTop": "18px", "display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "18px", "padding": "16px", "borderRadius": "14px", "background": "rgb(247, 248, 245)"}}>
<div style={{"position": "relative", "flex": "0 0 auto"}}>
<span style={{"display": "inline-flex", "alignItems": "center", "height": "40px", "padding": "0px 18px", "borderRadius": "10px", "background": "rgb(21, 33, 28)", "color": "rgb(255, 255, 255)", "fontWeight": "600"}}>
Pay now
</span>
<span data-anim="1" style={{"position": "absolute", "left": "50%", "top": "50%", "width": "24px", "height": "24px", "margin": "-12px 0px 0px -12px", "border": "2px solid rgb(217, 130, 43)", "borderRadius": "50%", "animation": "3s ease-out 0s infinite normal none running c-ping"}}>
</span>
<span data-anim="1" style={{"position": "absolute", "left": "50%", "top": "50%", "width": "24px", "height": "24px", "margin": "-12px 0px 0px -12px", "border": "2px solid rgb(217, 130, 43)", "borderRadius": "50%", "animation": "3s ease-out 0.25s infinite normal none running c-ping"}}>
</span>
</div>
<div style={{"display": "grid", "gap": "6px", "font": "500 12.5px \"JetBrains Mono\", monospace"}}>
<span data-anim="1" style={{"padding": "6px 10px", "borderRadius": "8px", "background": "rgb(255, 255, 255)", "border": "1px solid rgb(227, 232, 226)", "animation": "3s ease 0s infinite normal both running c-dup"}}>
order #5521 · $49.00
</span>
<span data-anim="1" style={{"padding": "6px 10px", "borderRadius": "8px", "background": "rgb(255, 243, 226)", "border": "1px solid rgb(243, 211, 174)", "color": "rgb(154, 74, 7)", "animation": "3s ease 0s infinite normal both running c-dup2"}}>
order #5522 · $49.00 · duplicate?
</span>
</div>
<span style={{"fontSize": "13.5px", "color": "rgb(70, 84, 76)"}}>
What a double-click could do without an idempotency key
</span>
</div>
</section>
<section aria-labelledby="ch-verdict" style={{"padding": "20px", "border": "1px solid rgb(243, 211, 174)", "borderRadius": "16px", "background": "rgb(255, 251, 245)"}}>
<div style={{"display": "flex", "alignItems": "center", "gap": "10px"}}>
<span style={{"width": "38px", "height": "38px", "borderRadius": "11px", "background": "rgb(255, 243, 226)", "color": "rgb(154, 74, 7)", "display": "inline-flex", "alignItems": "center", "justifyContent": "center"}}>
<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M12 3l10 18H2z">
</path>
<path d="M12 10v5M12 18v.5">
</path>
</svg>
</span>
<div>
<div style={{"fontSize": "12.5px", "fontWeight": "700", "letterSpacing": "0.06em", "textTransform": "uppercase", "color": "rgb(154, 74, 7)"}}>
Risk indicated
</div>
<h2 id="ch-verdict" style={{"margin": "0px", "font": "700 17px / 1.3 Manrope, system-ui, sans-serif"}}>
Checkout can be sent twice
</h2>
</div>
</div>
<p style={{"margin": "12px 0px 0px", "fontSize": "15px", "lineHeight": "1.6", "color": "rgb(21, 33, 28)"}}>
<span style={{"fontFamily": "\"JetBrains Mono\", monospace", "fontSize": "14px"}}>
POST /api/checkout
</span>
{" "}went out without an{" "}
<strong>
Idempotency-Key
</strong>
{" "}header. If a customer double-clicks or the browser retries, your server can’t tell the two apart.
</p>
<div style={{"marginTop": "12px", "padding": "12px 14px", "borderRadius": "12px", "background": "rgb(255, 255, 255)", "border": "1px solid rgb(243, 211, 174)"}}>
<div style={{"fontSize": "13px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
Suggested fix
</div>
<div style={{"fontSize": "14px", "color": "rgb(70, 84, 76)"}}>
Send a unique Idempotency-Key with each checkout request, and have the server return the first result for any repeat.
</div>
</div>
<p style={{"margin": "12px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
This is a warning sign, not proof of a double charge — your server may already guard against repeats in another way.
</p>
<div style={{"marginTop": "14px", "borderRadius": "12px", "background": "rgb(15, 29, 23)", "color": "rgb(215, 231, 221)", "padding": "12px 14px", "font": "500 12.5px / 1.75 \"JetBrains Mono\", monospace", "overflowX": "auto", "whiteSpace": "nowrap"}}>
<div style={{"color": "rgb(143, 179, 160)"}}>
request headers seen
</div>
<div>
<span style={{"color": "rgb(127, 214, 174)"}}>
content-type
</span>
{" "}application/json
</div>
<div>
<span style={{"color": "rgb(127, 214, 174)"}}>
authorization
</span>
{" "}Bearer ph_sec_stripe… (stand-in)
</div>
<div>
<span style={{"color": "rgb(127, 214, 174)"}}>
traceparent
</span>
{" "}00-4bf92f35…-01
</div>
<div style={{"color": "rgb(242, 178, 107)"}}>
<span>
idempotency-key
</span>
{" "}— missing
</div>
</div>
</section>
</div>
<section aria-labelledby="ch-scen" style={{"marginTop": "14px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "overflow": "hidden"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "flex-start", "justifyContent": "space-between", "gap": "12px", "padding": "18px 20px"}}>
<div>
<h2 id="ch-scen" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Scenarios
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Report{" "}
<span className="sc-interp">
chaos_1c8f
</span>
{" "}·{" "}
<span className="sc-interp">
Nov 6, 10:52 · observation only
</span>
</p>
</div>
<ul aria-label="Status meanings" style={{"listStyle": "none", "margin": "0px", "padding": "0px", "display": "flex", "flexWrap": "wrap", "gap": "8px 16px", "fontSize": "13px", "color": "rgb(70, 84, 76)"}}>
<li style={{"display": "inline-flex", "alignItems": "center", "gap": "6px"}}>
<span style={{"height": "22px", "padding": "0px 8px", "borderRadius": "999px", "background": "rgb(234, 241, 251)", "color": "rgb(36, 88, 155)", "fontSize": "11.5px", "fontWeight": "700", "lineHeight": "22px"}}>
Observed
</span>
we watched it happen
</li>
<li style={{"display": "inline-flex", "alignItems": "center", "gap": "6px"}}>
<span style={{"height": "22px", "padding": "0px 8px", "borderRadius": "999px", "background": "rgb(255, 243, 226)", "color": "rgb(154, 74, 7)", "fontSize": "11.5px", "fontWeight": "700", "lineHeight": "22px"}}>
Risk indicated
</span>
a warning sign
</li>
<li style={{"display": "inline-flex", "alignItems": "center", "gap": "6px"}}>
<span style={{"height": "22px", "padding": "0px 8px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "fontSize": "11.5px", "fontWeight": "700", "lineHeight": "22px"}}>
Simulated
</span>
described, not run
</li>
</ul>
</div>
<div style={{"overflowX": "auto"}}>
<table style={{"width": "100%", "minWidth": "880px", "borderCollapse": "collapse", "fontSize": "14px"}}>
<thead>
<tr style={{"background": "rgb(247, 248, 245)"}}>
<th scope="col" style={{"padding": "10px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Scenario
</th>
<th scope="col" style={{"padding": "10px 12px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Status
</th>
<th scope="col" style={{"padding": "10px 12px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
Measured
</th>
<th scope="col" style={{"padding": "10px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "textAlign": "left", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
What it means
</th>
</tr>
</thead>
<tbody>
<tr className="c-row">
<th scope="row" style={{"padding": "14px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "textAlign": "left", "verticalAlign": "top", "fontWeight": "700"}}>
1 · One real click
</th>
<td style={{"padding": "14px 12px", "borderBottom": "1px solid rgb(238, 242, 238)", "verticalAlign": "top"}}>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(234, 241, 251)", "color": "rgb(36, 88, 155)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block"}}>
Observed
</span>
</td>
<td style={{"padding": "14px 12px", "borderBottom": "1px solid rgb(238, 242, 238)", "verticalAlign": "top", "fontFamily": "\"JetBrains Mono\", monospace", "fontSize": "13px"}}>
412 ms · HTTP 200
</td>
<td style={{"padding": "14px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "verticalAlign": "top", "color": "rgb(70, 84, 76)"}}>
Clicked “Pay now” once and saw the checkout request leave the browser.
</td>
</tr>
<tr className="c-row">
<th scope="row" style={{"padding": "14px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "textAlign": "left", "verticalAlign": "top", "fontWeight": "700"}}>
2 · Duplicate request
</th>
<td style={{"padding": "14px 12px", "borderBottom": "1px solid rgb(238, 242, 238)", "verticalAlign": "top"}}>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(255, 243, 226)", "color": "rgb(154, 74, 7)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block"}}>
Risk indicated
</span>
</td>
<td style={{"padding": "14px 12px", "borderBottom": "1px solid rgb(238, 242, 238)", "verticalAlign": "top", "color": "rgb(90, 105, 97)"}}>
Not executed
</td>
<td style={{"padding": "14px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "verticalAlign": "top", "color": "rgb(70, 84, 76)"}}>
No idempotency key on the request, so a repeat couldn’t be recognised. No second request was sent.
</td>
</tr>
<tr className="c-row">
<th scope="row" style={{"padding": "14px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "textAlign": "left", "verticalAlign": "top", "fontWeight": "700"}}>
3 · Dropped connection
</th>
<td style={{"padding": "14px 12px", "borderBottom": "1px solid rgb(238, 242, 238)", "verticalAlign": "top"}}>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block"}}>
Simulated
</span>
</td>
<td style={{"padding": "14px 12px", "borderBottom": "1px solid rgb(238, 242, 238)", "verticalAlign": "top", "color": "rgb(90, 105, 97)"}}>
Not executed
</td>
<td style={{"padding": "14px 20px", "borderBottom": "1px solid rgb(238, 242, 238)", "verticalAlign": "top", "color": "rgb(70, 84, 76)"}}>
Run a controlled connection-interruption test and check retry and form-state behaviour.
</td>
</tr>
<tr className="c-row">
<th scope="row" style={{"padding": "14px 20px", "textAlign": "left", "verticalAlign": "top", "fontWeight": "700"}}>
4 · 502 and slow webhook
</th>
<td style={{"padding": "14px 12px", "verticalAlign": "top"}}>
<span style={{"height": "24px", "padding": "0px 9px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "fontSize": "12px", "fontWeight": "700", "lineHeight": "24px", "display": "inline-block"}}>
Simulated
</span>
</td>
<td style={{"padding": "14px 12px", "verticalAlign": "top", "color": "rgb(90, 105, 97)"}}>
Not executed
</td>
<td style={{"padding": "14px 20px", "verticalAlign": "top", "color": "rgb(70, 84, 76)"}}>
Test the 502 and delayed-webhook path with a controlled server fixture.
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
