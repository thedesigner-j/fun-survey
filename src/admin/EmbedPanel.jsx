import { useState } from 'react'
import { appUrl, PAGE_URL } from '../lib/site.js'

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false)

  const copy = async (e) => {
    const pre = e.currentTarget.parentElement.querySelector('pre')
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard can be blocked inside an iframe: select the code so it can be copied by hand.
      window.getSelection().selectAllChildren(pre)
    }
  }

  return (
    <div className="embed-code">
      <pre>{code}</pre>
      <button className="a-btn a-btn--primary" onClick={copy}>
        {copied ? 'Copied!' : 'Copy code'}
      </button>
    </div>
  )
}

export default function EmbedPanel() {
  const [transparent, setTransparent] = useState(true)
  const [height, setHeight] = useState(760)

  const code = `<iframe id="fun-survey" title="Survey" allow="clipboard-write"
  style="width:100%;height:${height}px;border:0;display:block"></iframe>
<script>
  (function () {
    var app = '${appUrl}';
    var frame = document.getElementById('fun-survey');
    var view = 'survey';
    // Invite and password-reset emails land here with a sign-in token: hand it to the admin.
    var auth = /access_token|error_description/.test(location.hash) ? location.hash : '';
    frame.src = app + '/${transparent ? '?bg=transparent' : ''}' + auth;
    if (auth) history.replaceState(null, '', location.pathname + location.search);
    // The admin gets the full screen; the survey goes back to its own height.
    window.addEventListener('message', function (e) {
      if (e.origin !== app || !e.data || e.data.type !== 'fun-survey:view' || e.data.view === view) return;
      view = e.data.view;
      frame.style.height = view === 'admin' ? '100vh' : '${height}px';
      frame.scrollIntoView({ block: 'start' });
    });
  })();
</script>`

  return (
    <div className="embed">
      <section className="q-editor">
        <div className="panel-head">
          <h2>Webflow embed</h2>
        </div>
        <p className="field-help">
          In Webflow, drag an <b>Embed</b> element onto your survey page and paste this in. It holds both the survey
          and this admin: the <b>Admin login</b> button under the welcome card opens it. Custom code needs a paid Site
          plan.
        </p>
        <div className="field-row field-row--checks">
          <label className="check">
            <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} />
            See-through background (show your Webflow section behind the cards)
          </label>
        </div>
        <label className="field embed-height">
          Survey height in pixels
          <input
            type="number"
            min={400}
            step={20}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value) || 760)}
          />
        </label>
        <CodeBlock code={code} />
      </section>

      <section className="q-editor">
        <div className="panel-head">
          <h2>Finish setup</h2>
        </div>
        <ol className="embed-steps">
          <li>Publish the Webflow page.</li>
          <li>
            In Supabase, open <b>Authentication → URL Configuration</b>. Set <b>Site URL</b> to{' '}
            <b>{PAGE_URL || 'your Webflow survey page'}</b> and add the same address under <b>Redirect URLs</b>, so
            invite and password emails open on your Webflow page.
          </li>
        </ol>
      </section>
    </div>
  )
}
