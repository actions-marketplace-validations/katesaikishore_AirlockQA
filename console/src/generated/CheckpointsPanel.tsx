// Generated from the original console markup by html2jsx. Static design preview.
export default function CheckpointsPanel() {
  return (
    <>
<main style={{"flex": "1 1 0%", "width": "100%", "maxWidth": "1320px", "padding": "28px 32px 56px"}}>
<h1 style={{"margin": "0px", "font": "800 30px / 1.2 Manrope, system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
Checkpoints
</h1>
<p style={{"margin": "6px 0px 0px", "maxWidth": "780px", "fontSize": "15.5px", "color": "rgb(90, 105, 97)"}}>
Save points for your app. Capture a moment — signed in, cart filled — then start new tests from it, side by side, without repeating the setup.
</p>
<section aria-label="What a checkpoint holds" style={{"marginTop": "18px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", "gap": "12px"}}>
<div style={{"display": "flex", "gap": "12px", "alignItems": "flex-start", "padding": "14px 16px", "border": "1px solid rgb(207, 227, 215)", "borderRadius": "14px", "background": "rgb(242, 248, 244)"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1F6B4F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{"flex": "0 0 auto", "marginTop": "2px"}}>
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
<div>
<strong>
Saved in every checkpoint
</strong>
<div style={{"fontSize": "14px", "color": "rgb(70, 84, 76)"}}>
Cookies, local storage, session storage, the page URL and a DOM snapshot with its hash.
</div>
</div>
</div>
<div style={{"display": "flex", "gap": "12px", "alignItems": "flex-start", "padding": "14px 16px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "14px", "background": "rgb(255, 255, 255)"}}>
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5A6961" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true" style={{"flex": "0 0 auto", "marginTop": "2px"}}>
<path d="M6 12h12">
</path>
</svg>
<div>
<strong>
Not saved
</strong>
<div style={{"fontSize": "14px", "color": "rgb(70, 84, 76)"}}>
Your server’s data, background jobs, or process and VM memory. Branches share the same backend.
</div>
</div>
</div>
</section>
<section aria-labelledby="cp-list" style={{"marginTop": "20px"}}>
<div style={{"display": "flex", "alignItems": "baseline", "justifyContent": "space-between", "gap": "12px"}}>
<h2 id="cp-list" style={{"margin": "0px", "font": "700 17px / 1.3 Manrope, system-ui, sans-serif"}}>
Saved checkpoints
</h2>
<span style={{"font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
.airlock/checkpoints
</span>
</div>
<div style={{"marginTop": "12px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", "gap": "12px"}}>
<button type="button" className="c-cp" aria-pressed="true" style={{"padding": "16px", "border": "1px solid rgb(47, 111, 91)", "borderRadius": "14px", "background": "rgb(255, 255, 255)", "boxShadow": "rgba(47, 111, 91, 0.14) 0px 0px 0px 3px", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "10px"}}>
<span style={{"width": "14px", "height": "14px", "borderRadius": "3px", "background": "rgb(47, 111, 91)", "transform": "rotate(45deg)"}}>
</span>
<span style={{"font": "700 14.5px \"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
cart_ready
</span>
</span>
<span style={{"marginLeft": "auto", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
step{" "}
<span className="sc-interp">
5
</span>
</span>
</span>
<span style={{"display": "grid", "gridTemplateColumns": "auto minmax(0px, 1fr)", "gap": "4px 12px", "marginTop": "12px", "fontSize": "13px"}}>
<span style={{"color": "rgb(90, 105, 97)"}}>
From
</span>
<span style={{"fontWeight": "600", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Checkout payment
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)"}}>
URL
</span>
<span style={{"fontFamily": "\"JetBrains Mono\", monospace", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
/cart
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)"}}>
Holds
</span>
<span>
<span className="sc-interp">
3 cookies · 4 storage keys
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)"}}>
DOM hash
</span>
<span style={{"fontFamily": "\"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
c41e08bd…
</span>
</span>
</span>
<span style={{"display": "flex", "justifyContent": "space-between", "marginTop": "12px", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span>
<span className="sc-interp">
Saved Nov 6, 09:31
</span>
</span>
<span>
<span className="sc-interp">
9.2 KB
</span>
</span>
</span>
</button>
<button type="button" className="c-cp" aria-pressed="false" style={{"padding": "16px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "14px", "background": "rgb(255, 255, 255)", "boxShadow": "none", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "10px"}}>
<span style={{"width": "14px", "height": "14px", "borderRadius": "3px", "background": "rgb(47, 111, 91)", "transform": "rotate(45deg)"}}>
</span>
<span style={{"font": "700 14.5px \"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
post_auth
</span>
</span>
<span style={{"marginLeft": "auto", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
step{" "}
<span className="sc-interp">
3
</span>
</span>
</span>
<span style={{"display": "grid", "gridTemplateColumns": "auto minmax(0px, 1fr)", "gap": "4px 12px", "marginTop": "12px", "fontSize": "13px"}}>
<span style={{"color": "rgb(90, 105, 97)"}}>
From
</span>
<span style={{"fontWeight": "600", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Checkout payment
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)"}}>
URL
</span>
<span style={{"fontFamily": "\"JetBrains Mono\", monospace", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
/account
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)"}}>
Holds
</span>
<span>
<span className="sc-interp">
3 cookies · 3 storage keys
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)"}}>
DOM hash
</span>
<span style={{"fontFamily": "\"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
7f3a91c2…
</span>
</span>
</span>
<span style={{"display": "flex", "justifyContent": "space-between", "marginTop": "12px", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span>
<span className="sc-interp">
Saved Nov 6, 09:31
</span>
</span>
<span>
<span className="sc-interp">
9.2 KB
</span>
</span>
</span>
</button>
<button type="button" className="c-cp" aria-pressed="false" style={{"padding": "16px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "14px", "background": "rgb(255, 255, 255)", "boxShadow": "none", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "10px"}}>
<span style={{"width": "14px", "height": "14px", "borderRadius": "3px", "background": "rgb(47, 111, 91)", "transform": "rotate(45deg)"}}>
</span>
<span style={{"font": "700 14.5px \"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
e2e_cart_ready
</span>
</span>
<span style={{"marginLeft": "auto", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
step{" "}
<span className="sc-interp">
5
</span>
</span>
</span>
<span style={{"display": "grid", "gridTemplateColumns": "auto minmax(0px, 1fr)", "gap": "4px 12px", "marginTop": "12px", "fontSize": "13px"}}>
<span style={{"color": "rgb(90, 105, 97)"}}>
From
</span>
<span style={{"fontWeight": "600", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Warm state branching
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)"}}>
URL
</span>
<span style={{"fontFamily": "\"JetBrains Mono\", monospace", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
/cart
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)"}}>
Holds
</span>
<span>
<span className="sc-interp">
3 cookies · 4 storage keys
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)"}}>
DOM hash
</span>
<span style={{"fontFamily": "\"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
a90d77e1…
</span>
</span>
</span>
<span style={{"display": "flex", "justifyContent": "space-between", "marginTop": "12px", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span>
<span className="sc-interp">
Saved Nov 6, 08:46
</span>
</span>
<span>
<span className="sc-interp">
9.2 KB
</span>
</span>
</span>
</button>
<button type="button" className="c-cp" aria-pressed="false" style={{"padding": "16px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "14px", "background": "rgb(255, 255, 255)", "boxShadow": "none", "cursor": "pointer", "textAlign": "left", "fontFamily": "inherit", "color": "rgb(21, 33, 28)"}}>
<span style={{"display": "flex", "alignItems": "center", "gap": "10px"}}>
<span style={{"width": "14px", "height": "14px", "borderRadius": "3px", "background": "rgb(47, 111, 91)", "transform": "rotate(45deg)"}}>
</span>
<span style={{"font": "700 14.5px \"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
e2e_post_auth
</span>
</span>
<span style={{"marginLeft": "auto", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
step{" "}
<span className="sc-interp">
3
</span>
</span>
</span>
<span style={{"display": "grid", "gridTemplateColumns": "auto minmax(0px, 1fr)", "gap": "4px 12px", "marginTop": "12px", "fontSize": "13px"}}>
<span style={{"color": "rgb(90, 105, 97)"}}>
From
</span>
<span style={{"fontWeight": "600", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
Warm state branching
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)"}}>
URL
</span>
<span style={{"fontFamily": "\"JetBrains Mono\", monospace", "whiteSpace": "nowrap", "overflow": "hidden", "textOverflow": "ellipsis"}}>
<span className="sc-interp">
/account
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)"}}>
Holds
</span>
<span>
<span className="sc-interp">
3 cookies · 3 storage keys
</span>
</span>
<span style={{"color": "rgb(90, 105, 97)"}}>
DOM hash
</span>
<span style={{"fontFamily": "\"JetBrains Mono\", monospace"}}>
<span className="sc-interp">
1b6fe3a0…
</span>
</span>
</span>
<span style={{"display": "flex", "justifyContent": "space-between", "marginTop": "12px", "fontSize": "12.5px", "color": "rgb(90, 105, 97)"}}>
<span>
<span className="sc-interp">
Saved Nov 6, 08:46
</span>
</span>
<span>
<span className="sc-interp">
9.2 KB
</span>
</span>
</span>
</button>
</div>
</section>
<div style={{"marginTop": "16px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(440px, 100%), 1fr))", "gap": "14px", "alignItems": "start"}}>
<section aria-labelledby="cp-fork" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<h2 id="cp-fork" style={{"margin": "0px", "font": "700 17px / 1.3 Manrope, system-ui, sans-serif"}}>
Branch from{" "}
<span style={{"fontFamily": "\"JetBrains Mono\", monospace", "color": "rgb(47, 111, 91)"}}>
<span className="sc-interp">
cart_ready
</span>
</span>
</h2>
<p style={{"margin": "4px 0px 0px", "fontSize": "14px", "color": "rgb(90, 105, 97)"}}>
Each branch starts in a fresh browser context restored from the checkpoint, then tries one variation.
</p>
<fieldset style={{"margin": "16px 0px 0px", "padding": "0px", "border": "0px"}}>
<legend style={{"fontSize": "13.5px", "fontWeight": "700", "color": "rgb(21, 33, 28)"}}>
Variations to try
</legend>
<div style={{"marginTop": "8px", "display": "grid", "gap": "8px"}}>
<label style={{"display": "flex", "alignItems": "flex-start", "gap": "12px", "padding": "12px 14px", "border": "1px solid rgb(207, 227, 215)", "borderRadius": "12px", "background": "rgb(247, 251, 248)", "cursor": "pointer"}}>
<input type="checkbox" defaultChecked style={{"width": "18px", "height": "18px", "margin": "2px 0px 0px", "accentColor": "rgb(47, 111, 91)"}} />
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "600"}}>
<span className="sc-interp">
Apply coupon SAVE20
</span>
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
coupon=SAVE20
</span>
{" "}· expects{" "}
<span className="sc-interp">
pass
</span>
</span>
</span>
</label>
<label style={{"display": "flex", "alignItems": "flex-start", "gap": "12px", "padding": "12px 14px", "border": "1px solid rgb(207, 227, 215)", "borderRadius": "12px", "background": "rgb(247, 251, 248)", "cursor": "pointer"}}>
<input type="checkbox" defaultChecked style={{"width": "18px", "height": "18px", "margin": "2px 0px 0px", "accentColor": "rgb(47, 111, 91)"}} />
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "600"}}>
<span className="sc-interp">
Expired coupon
</span>
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
coupon=EXPIRED10
</span>
{" "}· expects{" "}
<span className="sc-interp">
edge handled
</span>
</span>
</span>
</label>
<label style={{"display": "flex", "alignItems": "flex-start", "gap": "12px", "padding": "12px 14px", "border": "1px solid rgb(207, 227, 215)", "borderRadius": "12px", "background": "rgb(247, 251, 248)", "cursor": "pointer"}}>
<input type="checkbox" defaultChecked style={{"width": "18px", "height": "18px", "margin": "2px 0px 0px", "accentColor": "rgb(47, 111, 91)"}} />
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "600"}}>
<span className="sc-interp">
Guest checkout
</span>
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
account=guest
</span>
{" "}· expects{" "}
<span className="sc-interp">
pass
</span>
</span>
</span>
</label>
<label style={{"display": "flex", "alignItems": "flex-start", "gap": "12px", "padding": "12px 14px", "border": "1px solid rgb(207, 227, 215)", "borderRadius": "12px", "background": "rgb(247, 251, 248)", "cursor": "pointer"}}>
<input type="checkbox" defaultChecked style={{"width": "18px", "height": "18px", "margin": "2px 0px 0px", "accentColor": "rgb(47, 111, 91)"}} />
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "600"}}>
<span className="sc-interp">
Pay with saved card
</span>
</span>
<span style={{"display": "block", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
card=saved_4242
</span>
{" "}· expects{" "}
<span className="sc-interp">
pass
</span>
</span>
</span>
</label>
</div>
</fieldset>
<label htmlFor="cp-workers" style={{"display": "flex", "justifyContent": "space-between", "marginTop": "16px", "fontSize": "13.5px", "fontWeight": "700"}}>
Run at the same time
<span style={{"fontVariantNumeric": "tabular-nums"}}>
<span className="sc-interp">
4
</span>
{" "}of 5
</span>
</label>
<input id="cp-workers" type="range" min="1" max="5" step="1" defaultValue="4" style={{"width": "100%", "marginTop": "8px", "accentColor": "rgb(47, 111, 91)"}} />
<div style={{"marginTop": "12px", "padding": "10px 12px", "borderRadius": "10px", "background": "rgb(15, 29, 23)", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(215, 231, 221)", "overflowX": "auto", "whiteSpace": "nowrap"}}>
<span style={{"color": "rgb(127, 214, 174)"}}>
$
</span>
{" "}npx airlock fork{" "}
<span className="sc-interp">
cart_ready
</span>
{" "}--workers{" "}
<span className="sc-interp">
4
</span>
</div>
<button type="button" className="c-btn c-pri" style={{"marginTop": "14px", "width": "100%", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "gap": "8px", "height": "44px", "border": "0px", "borderRadius": "11px", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)", "font": "700 15px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<circle cx="6" cy="6" r="2.5">
</circle>
<circle cx="6" cy="18" r="2.5">
</circle>
<circle cx="18" cy="9" r="2.5">
</circle>
<path d="M6 8.5v7M18 11.5c0 3.5-3.5 4.5-9.5 5.5">
</path>
</svg>
Start{" "}
<span className="sc-interp">
4
</span>
{" "}branches
</button>
</section>
<section aria-labelledby="cp-res" style={{"padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "baseline", "justifyContent": "space-between", "gap": "10px"}}>
<h2 id="cp-res" style={{"margin": "0px", "font": "700 17px / 1.3 Manrope, system-ui, sans-serif"}}>
Latest branch results
</h2>
<span style={{"fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
4 branches · 4 at a time · run 1
</span>
</span>
</div>
<div style={{"position": "relative", "marginTop": "16px", "paddingLeft": "34px"}}>
<span style={{"position": "absolute", "left": "10px", "top": "6px", "width": "22px", "height": "22px"}}>
<span data-anim="1" style={{"position": "absolute", "inset": "-6px", "borderRadius": "50%", "border": "2px solid rgb(47, 111, 91)", "animation": "2.2s ease-out 0s infinite normal none running c-ping"}}>
</span>
<span style={{"position": "absolute", "inset": "4px", "borderRadius": "3px", "background": "rgb(47, 111, 91)", "transform": "rotate(45deg)"}}>
</span>
</span>
<div style={{"font": "700 14px \"JetBrains Mono\", monospace", "paddingTop": "6px"}}>
<span className="sc-interp">
cart_ready
</span>
</div>
<div style={{"fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
setup skipped in every branch · saved{" "}
<span className="sc-interp">
24.8s of repeated setup
</span>
</div>
<span style={{"position": "absolute", "left": "20px", "top": "34px", "bottom": "30px", "width": "2px", "background": "rgb(220, 230, 223)"}}>
</span>
<ol style={{"listStyle": "none", "margin": "12px 0px 0px", "padding": "0px", "display": "grid", "gap": "10px"}}>
<li data-anim="1" style={{"position": "relative", "padding": "12px 14px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "12px", "background": "rgb(255, 255, 255)", "animation": "0.35s ease 0s 1 normal both running c-in"}}>
<span style={{"position": "absolute", "left": "-14px", "top": "22px", "width": "14px", "height": "2px", "background": "rgb(220, 230, 223)"}}>
</span>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "8px 12px"}}>
<strong style={{"flex": "1 1 0%", "minWidth": "160px"}}>
<span className="sc-interp">
Apply coupon SAVE20
</span>
</strong>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "24px", "padding": "0px 9px", "borderRadius": "999px", "fontSize": "12px", "fontWeight": "700", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)"}}>
<span className="sc-interp">
Passed
</span>
</span>
<span style={{"font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
1.4s
</span>
</span>
</div>
<div style={{"marginTop": "4px", "fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Reached /checkout/review with a $50.00 total
</span>
</div>
<div style={{"marginTop": "4px", "font": "500 12px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
assertions{" "}
<span className="sc-interp">
3/3
</span>
{" "}· ledger{" "}
<span className="sc-interp">
4be1c9…
</span>
</div>
</li>
<li data-anim="1" style={{"position": "relative", "padding": "12px 14px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "12px", "background": "rgb(255, 255, 255)", "animation": "0.35s ease 0.12s 1 normal both running c-in"}}>
<span style={{"position": "absolute", "left": "-14px", "top": "22px", "width": "14px", "height": "2px", "background": "rgb(220, 230, 223)"}}>
</span>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "8px 12px"}}>
<strong style={{"flex": "1 1 0%", "minWidth": "160px"}}>
<span className="sc-interp">
Expired coupon
</span>
</strong>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "24px", "padding": "0px 9px", "borderRadius": "999px", "fontSize": "12px", "fontWeight": "700", "background": "rgb(234, 241, 251)", "color": "rgb(36, 88, 155)"}}>
<span className="sc-interp">
Handled
</span>
</span>
<span style={{"font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
1.1s
</span>
</span>
</div>
<div style={{"marginTop": "4px", "fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Showed “This coupon has expired” and kept the full price
</span>
</div>
<div style={{"marginTop": "4px", "font": "500 12px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
assertions{" "}
<span className="sc-interp">
3/3
</span>
{" "}· ledger{" "}
<span className="sc-interp">
91c07a…
</span>
</div>
</li>
<li data-anim="1" style={{"position": "relative", "padding": "12px 14px", "border": "1px solid rgb(245, 213, 208)", "borderRadius": "12px", "background": "rgb(255, 255, 255)", "animation": "0.35s ease 0.24s 1 normal both running c-in"}}>
<span style={{"position": "absolute", "left": "-14px", "top": "22px", "width": "14px", "height": "2px", "background": "rgb(220, 230, 223)"}}>
</span>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "8px 12px"}}>
<strong style={{"flex": "1 1 0%", "minWidth": "160px"}}>
<span className="sc-interp">
Guest checkout
</span>
</strong>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "24px", "padding": "0px 9px", "borderRadius": "999px", "fontSize": "12px", "fontWeight": "700", "background": "rgb(253, 237, 235)", "color": "rgb(180, 35, 24)"}}>
<span className="sc-interp">
Failed
</span>
</span>
<span style={{"font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
1.6s
</span>
</span>
</div>
<div style={{"marginTop": "4px", "fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Expected /checkout/guest but landed on /login
</span>
</div>
<div style={{"marginTop": "4px", "font": "500 12px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
assertions{" "}
<span className="sc-interp">
2/3
</span>
{" "}· ledger{" "}
<span className="sc-interp">
7d2a18…
</span>
</div>
</li>
<li data-anim="1" style={{"position": "relative", "padding": "12px 14px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "12px", "background": "rgb(255, 255, 255)", "animation": "0.35s ease 0.36s 1 normal both running c-in"}}>
<span style={{"position": "absolute", "left": "-14px", "top": "22px", "width": "14px", "height": "2px", "background": "rgb(220, 230, 223)"}}>
</span>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "8px 12px"}}>
<strong style={{"flex": "1 1 0%", "minWidth": "160px"}}>
<span className="sc-interp">
Pay with saved card
</span>
</strong>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "24px", "padding": "0px 9px", "borderRadius": "999px", "fontSize": "12px", "fontWeight": "700", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)"}}>
<span className="sc-interp">
Passed
</span>
</span>
<span style={{"font": "600 13px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)"}}>
<span className="sc-interp">
1.3s
</span>
</span>
</div>
<div style={{"marginTop": "4px", "fontSize": "13px", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
Card ending 4242 preselected, stand-in key swapped at the door
</span>
</div>
<div style={{"marginTop": "4px", "font": "500 12px \"JetBrains Mono\", monospace", "color": "rgb(90, 105, 97)"}}>
assertions{" "}
<span className="sc-interp">
3/3
</span>
{" "}· ledger{" "}
<span className="sc-interp">
e05f3b…
</span>
</div>
</li>
</ol>
</div>
</section>
</div>
</main>
    </>
  );
}
