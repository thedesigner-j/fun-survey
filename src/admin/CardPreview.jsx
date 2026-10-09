import { useEffect, useState } from 'react'
import CardFace from '../survey/CardFace.jsx'

export default function CardPreview({ card }) {
  const [value, setValue] = useState(undefined)

  useEffect(() => setValue(undefined), [card.id, card.type])

  return (
    <div className="preview-stage">
      <div className="preview-ghost preview-ghost--2" />
      <div className="preview-ghost preview-ghost--1" />
      <div className="preview-card">
        <CardFace
          card={card}
          value={value}
          onChange={(v) => setValue(v)}
          step={card.kind === 'question' ? { label: 'Preview' } : undefined}
        />
      </div>
    </div>
  )
}
