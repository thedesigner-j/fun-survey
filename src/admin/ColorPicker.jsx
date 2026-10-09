import { CARD_COLORS } from '../lib/constants.js'

export default function ColorPicker({ value, onChange }) {
  return (
    <div className="swatches">
      {CARD_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          className={`swatch ${value?.toLowerCase() === c.toLowerCase() ? 'is-selected' : ''}`}
          style={{ background: c }}
          onClick={() => onChange(c)}
          aria-label={c}
        />
      ))}
      <label className="swatch swatch--custom" title="Custom color">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        🎨
      </label>
    </div>
  )
}
