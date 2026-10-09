import { useState } from 'react'
import { appUrl, ADMIN_PAGE_URL } from '../lib/site.js'

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false)

  const copy = async (e) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard can be blocked inside an iframe: select the code so it can be copied by hand.
      const pre = e.currentTarget.parentElement.querySelector('pre')
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

  const surveyCode = `<iframe
  src="${appUrl}/${transparent ? '?bg=transparent' : ''}"
  style="width:100%;height:${height}px;border:0;display:block"
  title="Survey"
  loading="lazy"
></iframe>`

  const adminCode = `<iframe id="survey-admin" title="Survey admin" allow="clipboard-write"
  style="width:100%;height:100vh;border:0;display:block"></iframe>
<script>
  (function () {
    var app = '${appUrl}/admin';
    document.getElementById('survey-admin').src = app + location.hash;
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  })();
</script>`

  return (
    <div className="embed">
      <section className="q-editor">
        <div className="panel-head">
          <h2>Survey embed</h2>
        </div>
        <p className="field-help">
          In Webflow, drag an <b>Embed</b> element onto your survey page and paste this in. Custom code needs a paid
          Site plan.
        </p>
        <div className="field-row field-row--checks">
          <label className="check">
            <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} />
            See-through background (show your Webflow section behind the cards)
          </label>
        </div>
        <label className="field embed-height">
          Height in pixels
          <input
            type="number"
            min={400}
            step={20}
            value={height}
            onChange={(e) => setHeight(Number(e.target.value) || 760)}
          />
        </label>
        <CodeBlock code={surveyCode} />
      </section>

      <section className="q-editor">
        <div className="panel-head">
          <h2>Admin embed</h2>
        </div>
        <p className="field-help">
          Make a separate Webflow page for the admin (for example <b>/survey-admin</b>), add an <b>Embed</b> element and
          paste this in. It fills the screen and signs people in from invite and password-reset emails.
        </p>
        <CodeBlock code={adminCode} />
      </section>

      <section className="q-editor">
        <div className="panel-head">
          <h2>Finish setup</h2>
        </div>
        <ol className="embed-steps">
          <li>
            Publish both Webflow pages. Tip: in the admin page's settings, turn off <b>search engine indexing</b>.
          </li>
          <li>
            In Supabase, open <b>Authentication → URL Configuration</b>. Set <b>Site URL</b> to your Webflow admin page
            and add it under <b>Redirect URLs</b>, so invite and password emails open in Webflow.
          </li>
          {!ADMIN_PAGE_URL && (
            <li>
              Put both Webflow page addresses in <code>src/lib/site.js</code> so the "View survey" button and
              password-reset emails point at Webflow too.
            </li>
          )}
        </ol>
      </section>
    </div>
  )
}
