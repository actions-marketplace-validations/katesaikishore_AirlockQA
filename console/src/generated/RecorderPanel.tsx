// Generated from the original console markup by html2jsx. Static design preview.
export default function RecorderPanel() {
  return (
    <>
<main style={{"flex": "1 1 0%", "width": "100%", "maxWidth": "1320px", "padding": "28px 32px 56px"}}>
<h1 style={{"margin": "0px", "font": "800 30px / 1.2 Manrope, system-ui, sans-serif", "letterSpacing": "-0.02em", "color": "rgb(21, 33, 28)"}}>
Record a test
</h1>
<p style={{"margin": "6px 0px 0px", "fontSize": "15.5px", "color": "rgb(90, 105, 97)"}}>
Click through your app like a customer would. AirlockQA writes down each step and turns it into a Playwright test.
</p>
<ol aria-label="Progress" style={{"listStyle": "none", "margin": "20px 0px 0px", "padding": "0px", "display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "10px"}}>
<li style={{"display": "inline-flex", "alignItems": "center", "gap": "10px", "height": "40px", "padding": "0px 14px 0px 6px", "borderRadius": "999px", "border": "1px solid rgb(227, 232, 226)", "background": "rgb(255, 255, 255)", "fontSize": "14px", "fontWeight": "600", "color": "rgb(21, 33, 28)"}}>
<span style={{"width": "28px", "height": "28px", "borderRadius": "50%", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "font": "700 12.5px \"JetBrains Mono\", monospace", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)"}}>
<span className="sc-interp">
✓
</span>
</span>
<span className="sc-interp">
Record
</span>
</li>
<li style={{"display": "inline-flex", "alignItems": "center", "gap": "10px", "height": "40px", "padding": "0px 14px 0px 6px", "borderRadius": "999px", "border": "1px solid rgb(47, 111, 91)", "background": "rgb(242, 248, 244)", "fontSize": "14px", "fontWeight": "600", "color": "rgb(21, 33, 28)"}}>
<span style={{"width": "28px", "height": "28px", "borderRadius": "50%", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "font": "700 12.5px \"JetBrains Mono\", monospace", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)"}}>
<span className="sc-interp">
2
</span>
</span>
<span className="sc-interp">
Review steps
</span>
</li>
<li style={{"display": "inline-flex", "alignItems": "center", "gap": "10px", "height": "40px", "padding": "0px 14px 0px 6px", "borderRadius": "999px", "border": "1px solid rgb(227, 232, 226)", "background": "rgb(255, 255, 255)", "fontSize": "14px", "fontWeight": "600", "color": "rgb(90, 105, 97)"}}>
<span style={{"width": "28px", "height": "28px", "borderRadius": "50%", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "font": "700 12.5px \"JetBrains Mono\", monospace", "background": "rgb(241, 244, 240)", "color": "rgb(90, 105, 97)"}}>
<span className="sc-interp">
3
</span>
</span>
<span className="sc-interp">
Save as a test
</span>
</li>
</ol>
<section aria-labelledby="rc-start" style={{"marginTop": "16px", "padding": "20px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)"}}>
<div>
<h2 id="rc-start" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
New recording
</h2>
<div style={{"marginTop": "14px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", "gap": "14px", "alignItems": "end"}}>
<div>
<label htmlFor="rc-url" style={{"display": "block", "fontSize": "13.5px", "fontWeight": "600"}}>
Start at this address
</label>
<input id="rc-url" className="c-input" type="url" readOnly defaultValue="http://localhost:3000" style={{"marginTop": "6px", "width": "100%", "height": "44px", "padding": "0px 12px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "font": "500 14px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)"}} />
</div>
<div>
<label htmlFor="rc-name" style={{"display": "block", "fontSize": "13.5px", "fontWeight": "600"}}>
Test name
</label>
<input id="rc-name" className="c-input" type="text" readOnly defaultValue="checkout-flow" style={{"marginTop": "6px", "width": "100%", "height": "44px", "padding": "0px 12px", "border": "1px solid rgb(211, 219, 212)", "borderRadius": "10px", "background": "rgb(255, 255, 255)", "font": "500 14px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)"}} />
</div>
<button type="button" className="c-btn c-pri" style={{"display": "inline-flex", "alignItems": "center", "justifyContent": "center", "gap": "10px", "height": "44px", "padding": "0px 18px", "border": "0px", "borderRadius": "10px", "background": "rgb(47, 111, 91)", "color": "rgb(255, 255, 255)", "font": "700 15px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
<span style={{"width": "11px", "height": "11px", "borderRadius": "50%", "background": "rgb(255, 180, 165)"}}>
</span>
Start recording
</button>
</div>
<div style={{"marginTop": "14px", "display": "flex", "flexWrap": "wrap", "gap": "10px 22px", "fontSize": "14px", "color": "rgb(70, 84, 76)"}}>
<label style={{"display": "inline-flex", "alignItems": "center", "gap": "8px"}}>
<input type="checkbox" defaultChecked style={{"width": "18px", "height": "18px", "accentColor": "rgb(47, 111, 91)"}} />
Capture network requests
</label>
<label style={{"display": "inline-flex", "alignItems": "center", "gap": "8px"}}>
<input type="checkbox" defaultChecked style={{"width": "18px", "height": "18px", "accentColor": "rgb(47, 111, 91)"}} />
Suggest save points after login and cart
</label>
<label style={{"display": "inline-flex", "alignItems": "center", "gap": "8px"}}>
<input type="checkbox" defaultChecked style={{"width": "18px", "height": "18px", "accentColor": "rgb(47, 111, 91)"}} />
Run behind the safety door while recording
</label>
</div>
<p style={{"margin": "14px 0px 0px", "display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "8px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Prefer the terminal?
<code style={{"padding": "4px 8px", "borderRadius": "6px", "background": "rgb(241, 244, 240)", "font": "500 13px \"JetBrains Mono\", monospace", "color": "rgb(21, 33, 28)"}}>
npx airlock explore http://localhost:3000 --name checkout-flow
</code>
</p>
</div>
</section>
<div style={{"marginTop": "14px", "display": "grid", "gridTemplateColumns": "repeat(auto-fit, minmax(min(440px, 100%), 1fr))", "gap": "14px", "alignItems": "start"}}>
<section aria-labelledby="rc-steps" style={{"border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "overflow": "hidden"}}>
<div style={{"display": "flex", "alignItems": "center", "justifyContent": "space-between", "gap": "10px", "padding": "16px 20px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<div>
<h2 id="rc-steps" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Recorded steps
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
checkout-flow ·{" "}
<span className="sc-interp">
8
</span>
{" "}steps · 14 requests seen
</p>
</div>
<span style={{"height": "26px", "padding": "0px 10px", "borderRadius": "999px", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)", "font": "600 12px / 26px \"JetBrains Mono\", monospace"}}>
trace_65fb1d16
</span>
</div>
<ol style={{"listStyle": "none", "margin": "0px", "padding": "6px 0px"}}>
<li data-anim="1" style={{"display": "grid", "gridTemplateColumns": "34px minmax(0px, 1fr)", "gap": "12px", "padding": "12px 20px", "borderBottom": "1px solid rgb(241, 244, 240)", "animation": "0.35s ease 0s 1 normal both running c-in"}}>
<span style={{"width": "34px", "height": "34px", "borderRadius": "10px", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "background": "rgb(234, 241, 251)", "color": "rgb(36, 88, 155)"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12h14M13 6l6 6-6 6">
</path>
</svg>
</span>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "600"}}>
<span className="sc-interp">
Open http://127.0.0.1:3900
</span>
</span>
<span style={{"display": "flex", "flexWrap": "wrap", "gap": "6px", "marginTop": "6px"}}>
<span style={{"height": "24px", "padding": "0px 8px", "borderRadius": "7px", "background": "rgb(247, 248, 245)", "border": "1px solid rgb(227, 232, 226)", "font": "500 12px / 22px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
goto
</span>
</span>
<span style={{"height": "24px", "padding": "0px 8px", "borderRadius": "7px", "background": "rgb(247, 248, 245)", "border": "1px solid rgb(227, 232, 226)", "font": "500 12px / 22px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
domcontentloaded
</span>
</span>
</span>
</span>
</li>
<li data-anim="1" style={{"display": "grid", "gridTemplateColumns": "34px minmax(0px, 1fr)", "gap": "12px", "padding": "12px 20px", "borderBottom": "1px solid rgb(241, 244, 240)", "animation": "0.35s ease 0s 1 normal both running c-in"}}>
<span style={{"width": "34px", "height": "34px", "borderRadius": "10px", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 3l14 7.2-6.4 1.9L9.9 18.5z">
</path>
</svg>
</span>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "600"}}>
<span className="sc-interp">
Click “Log In to Sandbox”
</span>
</span>
<span style={{"display": "flex", "flexWrap": "wrap", "gap": "6px", "marginTop": "6px"}}>
<span style={{"height": "24px", "padding": "0px 8px", "borderRadius": "7px", "background": "rgb(247, 248, 245)", "border": "1px solid rgb(227, 232, 226)", "font": "500 12px / 22px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
testId login-btn
</span>
</span>
<span style={{"height": "24px", "padding": "0px 8px", "borderRadius": "7px", "background": "rgb(247, 248, 245)", "border": "1px solid rgb(227, 232, 226)", "font": "500 12px / 22px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
text
</span>
</span>
</span>
</span>
</li>
<li data-anim="1" style={{"display": "grid", "gridTemplateColumns": "34px minmax(0px, 1fr)", "gap": "12px", "padding": "12px 20px", "borderBottom": "1px solid rgb(241, 244, 240)", "animation": "0.35s ease 0s 1 normal both running c-in"}}>
<span style={{"width": "34px", "height": "34px", "borderRadius": "10px", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "background": "rgb(226, 242, 233)", "color": "rgb(47, 111, 91)"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M12 3l9 9-9 9-9-9z">
</path>
</svg>
</span>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "600"}}>
<span className="sc-interp">
Save point · post_auth
</span>
</span>
<span style={{"display": "flex", "flexWrap": "wrap", "gap": "6px", "marginTop": "6px"}}>
<span style={{"height": "24px", "padding": "0px 8px", "borderRadius": "7px", "background": "rgb(247, 248, 245)", "border": "1px solid rgb(227, 232, 226)", "font": "500 12px / 22px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
cookies
</span>
</span>
<span style={{"height": "24px", "padding": "0px 8px", "borderRadius": "7px", "background": "rgb(247, 248, 245)", "border": "1px solid rgb(227, 232, 226)", "font": "500 12px / 22px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
storage
</span>
</span>
<span style={{"height": "24px", "padding": "0px 8px", "borderRadius": "7px", "background": "rgb(247, 248, 245)", "border": "1px solid rgb(227, 232, 226)", "font": "500 12px / 22px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
DOM hash
</span>
</span>
</span>
</span>
</li>
<li data-anim="1" style={{"display": "grid", "gridTemplateColumns": "34px minmax(0px, 1fr)", "gap": "12px", "padding": "12px 20px", "borderBottom": "1px solid rgb(241, 244, 240)", "animation": "0.35s ease 0s 1 normal both running c-in"}}>
<span style={{"width": "34px", "height": "34px", "borderRadius": "10px", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 3l14 7.2-6.4 1.9L9.9 18.5z">
</path>
</svg>
</span>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "600"}}>
<span className="sc-interp">
Click “Add to cart”
</span>
</span>
<span style={{"display": "flex", "flexWrap": "wrap", "gap": "6px", "marginTop": "6px"}}>
<span style={{"height": "24px", "padding": "0px 8px", "borderRadius": "7px", "background": "rgb(247, 248, 245)", "border": "1px solid rgb(227, 232, 226)", "font": "500 12px / 22px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
css [data-testid=add-to-cart]
</span>
</span>
</span>
</span>
</li>
<li data-anim="1" style={{"display": "grid", "gridTemplateColumns": "34px minmax(0px, 1fr)", "gap": "12px", "padding": "12px 20px", "borderBottom": "1px solid rgb(241, 244, 240)", "animation": "0.35s ease 0s 1 normal both running c-in"}}>
<span style={{"width": "34px", "height": "34px", "borderRadius": "10px", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "background": "rgb(226, 242, 233)", "color": "rgb(47, 111, 91)"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M12 3l9 9-9 9-9-9z">
</path>
</svg>
</span>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "600"}}>
<span className="sc-interp">
Save point · cart_filled
</span>
</span>
<span style={{"display": "flex", "flexWrap": "wrap", "gap": "6px", "marginTop": "6px"}}>
<span style={{"height": "24px", "padding": "0px 8px", "borderRadius": "7px", "background": "rgb(247, 248, 245)", "border": "1px solid rgb(227, 232, 226)", "font": "500 12px / 22px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
cookies
</span>
</span>
<span style={{"height": "24px", "padding": "0px 8px", "borderRadius": "7px", "background": "rgb(247, 248, 245)", "border": "1px solid rgb(227, 232, 226)", "font": "500 12px / 22px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
storage
</span>
</span>
<span style={{"height": "24px", "padding": "0px 8px", "borderRadius": "7px", "background": "rgb(247, 248, 245)", "border": "1px solid rgb(227, 232, 226)", "font": "500 12px / 22px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
DOM hash
</span>
</span>
</span>
</span>
</li>
<li data-anim="1" style={{"display": "grid", "gridTemplateColumns": "34px minmax(0px, 1fr)", "gap": "12px", "padding": "12px 20px", "borderBottom": "1px solid rgb(241, 244, 240)", "animation": "0.35s ease 0s 1 normal both running c-in"}}>
<span style={{"width": "34px", "height": "34px", "borderRadius": "10px", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4">
</path>
</svg>
</span>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "600"}}>
<span className="sc-interp">
Type “SAVE20” into the coupon box
</span>
</span>
<span style={{"display": "flex", "flexWrap": "wrap", "gap": "6px", "marginTop": "6px"}}>
<span style={{"height": "24px", "padding": "0px 8px", "borderRadius": "7px", "background": "rgb(247, 248, 245)", "border": "1px solid rgb(227, 232, 226)", "font": "500 12px / 22px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
testId coupon-input
</span>
</span>
</span>
</span>
</li>
<li data-anim="1" style={{"display": "grid", "gridTemplateColumns": "34px minmax(0px, 1fr)", "gap": "12px", "padding": "12px 20px", "borderBottom": "1px solid rgb(241, 244, 240)", "animation": "0.35s ease 0s 1 normal both running c-in"}}>
<span style={{"width": "34px", "height": "34px", "borderRadius": "10px", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "background": "rgb(241, 244, 240)", "color": "rgb(70, 84, 76)"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 3l14 7.2-6.4 1.9L9.9 18.5z">
</path>
</svg>
</span>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "600"}}>
<span className="sc-interp">
Click “Apply Coupon”
</span>
</span>
<span style={{"display": "flex", "flexWrap": "wrap", "gap": "6px", "marginTop": "6px"}}>
<span style={{"height": "24px", "padding": "0px 8px", "borderRadius": "7px", "background": "rgb(247, 248, 245)", "border": "1px solid rgb(227, 232, 226)", "font": "500 12px / 22px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
testId apply-coupon-btn
</span>
</span>
<span style={{"height": "24px", "padding": "0px 8px", "borderRadius": "7px", "background": "rgb(247, 248, 245)", "border": "1px solid rgb(227, 232, 226)", "font": "500 12px / 22px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
text
</span>
</span>
</span>
</span>
</li>
<li data-anim="1" style={{"display": "grid", "gridTemplateColumns": "34px minmax(0px, 1fr)", "gap": "12px", "padding": "12px 20px", "borderBottom": "1px solid rgb(241, 244, 240)", "animation": "0.35s ease 0s 1 normal both running c-in"}}>
<span style={{"width": "34px", "height": "34px", "borderRadius": "10px", "display": "inline-flex", "alignItems": "center", "justifyContent": "center", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M5 12.5l4.2 4.2L19 7">
</path>
</svg>
</span>
<span style={{"minWidth": "0px"}}>
<span style={{"display": "block", "fontWeight": "600"}}>
<span className="sc-interp">
Check the total shows $50.00
</span>
</span>
<span style={{"display": "flex", "flexWrap": "wrap", "gap": "6px", "marginTop": "6px"}}>
<span style={{"height": "24px", "padding": "0px 8px", "borderRadius": "7px", "background": "rgb(247, 248, 245)", "border": "1px solid rgb(227, 232, 226)", "font": "500 12px / 22px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
testId cart-total
</span>
</span>
<span style={{"height": "24px", "padding": "0px 8px", "borderRadius": "7px", "background": "rgb(247, 248, 245)", "border": "1px solid rgb(227, 232, 226)", "font": "500 12px / 22px \"JetBrains Mono\", monospace", "color": "rgb(70, 84, 76)", "whiteSpace": "nowrap"}}>
<span className="sc-interp">
text $50.00
</span>
</span>
</span>
</span>
</li>
</ol>
</section>
<section aria-labelledby="rc-code" style={{"borderRadius": "16px", "background": "rgb(15, 29, 23)", "color": "rgb(215, 231, 221)", "overflow": "hidden", "minWidth": "0px"}}>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "justifyContent": "space-between", "gap": "10px", "padding": "14px 18px", "borderBottom": "1px solid rgb(35, 57, 47)"}}>
<div>
<h2 id="rc-code" style={{"margin": "0px", "font": "700 16px / 1.3 Manrope, system-ui, sans-serif", "color": "rgb(255, 255, 255)"}}>
Generated Playwright test
</h2>
<p style={{"margin": "2px 0px 0px", "font": "500 12.5px \"JetBrains Mono\", monospace", "color": "rgb(169, 196, 182)"}}>
tests/checkout.spec.ts · no AI tokens used
</p>
</div>
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "background": "rgb(30, 58, 46)", "color": "rgb(191, 240, 216)", "fontSize": "12px", "fontWeight": "700"}}>
Fallback locators on
</span>
</div>
<pre style={{"margin": "0px", "padding": "18px", "overflowX": "auto", "font": "500 12.8px / 1.75 \"JetBrains Mono\", ui-monospace, monospace", "whiteSpace": "pre", "color": "rgb(215, 231, 221)"}}>
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
{";\n"}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"import"}
</span>
{" { AirlockRunner, airlockLocator } "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"from"}
</span>
{" "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'airlockqa'"}
</span>
{";\n\ntest.describe("}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'checkout-flow'"}
</span>
{", () ="}
{">"}
{" {\n  "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"let"}
</span>
{" airlock: AirlockRunner;\n\n  test.beforeEach("}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"async"}
</span>
{" ({ page, context }) ="}
{">"}
{" {\n    airlock = "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"new"}
</span>
{" AirlockRunner();\n    "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" airlock.initialize(context, page);\n  });\n\n  test("}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'checkout-flow'"}
</span>
{", "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"async"}
</span>
{" ({ page }) ="}
{">"}
{" {\n    "}
<span style={{"color": "rgb(110, 138, 123)"}}>
{"// 1 \u00b7 open the shop"}
</span>
{"\n    "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" page.goto("}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'http://127.0.0.1:3900'"}
</span>
{");\n    "}
<span style={{"color": "rgb(110, 138, 123)"}}>
{"// 2 \u00b7 log in (falls back to text if the test id changes)"}
</span>
{"\n    "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"const"}
</span>
{" login = "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" airlockLocator(page, { testId: "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'login-btn'"}
</span>
{", text: "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'Log In to Sandbox'"}
</span>
{" });\n    "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" login.click();\n    "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" airlock.checkpoint("}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'post_auth'"}
</span>
{", page);\n    "}
<span style={{"color": "rgb(110, 138, 123)"}}>
{"// 4\u20137 \u00b7 cart and coupon"}
</span>
{"\n    "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" ("}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" airlockLocator(page, { css: "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'[data-testid=\"add-to-cart\"]'"}
</span>
{" })).click();\n    "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" airlock.checkpoint("}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'cart_filled'"}
</span>
{", page);\n    "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" ("}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" airlockLocator(page, { testId: "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'coupon-input'"}
</span>
{" })).fill("}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'SAVE20'"}
</span>
{");\n    "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" ("}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" airlockLocator(page, { testId: "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'apply-coupon-btn'"}
</span>
{" })).click();\n    "}
<span style={{"color": "rgb(110, 138, 123)"}}>
{"// 8 \u00b7 the total should read $50.00"}
</span>
{"\n    "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"const"}
</span>
{" total = "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" airlockLocator(page, { testId: "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'cart-total'"}
</span>
{", text: "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"'$50.00'"}
</span>
{" });\n    "}
<span style={{"color": "rgb(127, 214, 174)"}}>
{"await"}
</span>
{" expect(total).toBeVisible({ timeout: "}
<span style={{"color": "rgb(233, 201, 139)"}}>
{"4000"}
</span>
{" });\n  });\n});"}
</pre>
<div style={{"display": "flex", "flexWrap": "wrap", "alignItems": "center", "gap": "10px", "padding": "14px 18px", "borderTop": "1px solid rgb(35, 57, 47)"}}>
<button type="button" className="c-btn" style={{"display": "inline-flex", "alignItems": "center", "gap": "8px", "height": "40px", "padding": "0px 16px", "border": "0px", "borderRadius": "10px", "background": "rgb(184, 228, 206)", "color": "rgb(15, 29, 23)", "font": "700 14.5px \"DM Sans\", system-ui, sans-serif", "cursor": "pointer"}}>
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
<path d="M12 4v12M6 10l6 6 6-6M5 20h14">
</path>
</svg>
Save to tests/checkout.spec.ts
</button>
<span style={{"fontSize": "13px", "color": "rgb(169, 196, 182)"}}>
or{" "}
<code style={{"fontFamily": "\"JetBrains Mono\", monospace", "color": "rgb(215, 231, 221)"}}>
npx airlock compile trace.json -o tests/checkout.spec.ts
</code>
</span>
</div>
</section>
</div>
<section aria-labelledby="rc-list" style={{"marginTop": "14px", "border": "1px solid rgb(227, 232, 226)", "borderRadius": "16px", "background": "rgb(255, 255, 255)", "overflow": "hidden"}}>
<div style={{"padding": "16px 20px"}}>
<h2 id="rc-list" style={{"margin": "0px", "font": "700 16.5px / 1.3 Manrope, system-ui, sans-serif"}}>
Recordings
</h2>
<p style={{"margin": "2px 0px 0px", "fontSize": "13.5px", "color": "rgb(90, 105, 97)"}}>
Saved in .airlock/traces — commit them alongside your tests
</p>
</div>
<div style={{"overflowX": "auto"}}>
<div role="table" aria-label="Recordings" style={{"minWidth": "700px"}}>
<div role="row" style={{"display": "grid", "gridTemplateColumns": "minmax(220px, 2fr) 90px 100px 110px 150px", "gap": "12px", "padding": "10px 20px", "borderTop": "1px solid rgb(238, 242, 238)", "borderBottom": "1px solid rgb(227, 232, 226)", "background": "rgb(247, 248, 245)", "fontSize": "12.5px", "fontWeight": "700", "color": "rgb(90, 105, 97)"}}>
<span role="columnheader">
Recording
</span>
<span role="columnheader">
Steps
</span>
<span role="columnheader">
Requests
</span>
<span role="columnheader">
Recorded
</span>
<span role="columnheader">
Status
</span>
</div>
<div role="row" className="c-row" style={{"display": "grid", "gridTemplateColumns": "minmax(220px, 2fr) 90px 100px 110px 150px", "gap": "12px", "alignItems": "center", "padding": "13px 20px", "borderBottom": "1px solid rgb(238, 242, 238)"}}>
<span role="cell" style={{"font": "500 13.5px \"JetBrains Mono\", monospace"}}>
checkout-flow-trace.json
</span>
<span role="cell">
8
</span>
<span role="cell">
14
</span>
<span role="cell" style={{"color": "rgb(90, 105, 97)"}}>
Nov 5
</span>
<span role="cell">
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "background": "rgb(226, 242, 233)", "color": "rgb(31, 107, 79)", "fontSize": "12.5px", "fontWeight": "700"}}>
Compiled
</span>
</span>
</div>
<div role="row" className="c-row" style={{"display": "grid", "gridTemplateColumns": "minmax(220px, 2fr) 90px 100px 110px 150px", "gap": "12px", "alignItems": "center", "padding": "13px 20px"}}>
<span role="cell" style={{"font": "500 13.5px \"JetBrains Mono\", monospace"}}>
puter-notes-trace.json
</span>
<span role="cell">
6
</span>
<span role="cell">
5
</span>
<span role="cell" style={{"color": "rgb(90, 105, 97)"}}>
Nov 6
</span>
<span role="cell">
<span style={{"display": "inline-flex", "alignItems": "center", "gap": "6px", "height": "26px", "padding": "0px 10px", "borderRadius": "999px", "background": "rgb(255, 243, 226)", "color": "rgb(154, 74, 7)", "fontSize": "12.5px", "fontWeight": "700"}}>
Not compiled yet
</span>
</span>
</div>
</div>
</div>
</section>
</main>
    </>
  );
}
