import { motion } from 'motion/react'
import confetti from 'canvas-confetti'
import { Illustration } from '../illustrations/index.jsx'
import { RATING_FACES, SLIDER_FACES } from '../lib/constants.js'

const KEYS = '123456789'

function pop(event, color) {
  if (!event?.clientX) return
  confetti({
    particleCount: 14,
    spread: 60,
    startVelocity: 18,
    scalar: 0.7,
    ticks: 60,
    origin: { x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight },
    colors: ['#da291c', '#ffc72c', '#ffffff', '#27251f'],
    disableForReducedMotion: true,
  })
}

function SingleChoice({ question, value, onChange }) {
  return (
    <div className="choices">
      {question.options.map((option, i) => (
        <motion.button
          key={option + i}
          type="button"
          className={`choice ${value === option ? 'is-selected' : ''}`}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.97 }}
          onClick={(e) => {
            pop(e, question.color)
            onChange(option, { advance: true })
          }}
        >
          <span className="choice-key">{KEYS[i] ?? '•'}</span>
          <span>{option}</span>
        </motion.button>
      ))}
    </div>
  )
}

function MultiChoice({ question, value = [], onChange }) {
  const toggle = (option) =>
    onChange(value.includes(option) ? value.filter((v) => v !== option) : [...value, option])
  return (
    <div className="chips">
      {question.options.map((option, i) => {
        const on = value.includes(option)
        return (
          <motion.button
            key={option + i}
            type="button"
            className={`chip ${on ? 'is-selected' : ''}`}
            whileTap={{ scale: 0.92 }}
            animate={on ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            onClick={(e) => {
              if (!on) pop(e, question.color)
              toggle(option)
            }}
          >
            <span className="chip-check">{on ? '✓' : '+'}</span>
            {option}
          </motion.button>
        )
      })}
    </div>
  )
}

function Rating({ question, value, onChange }) {
  return (
    <div className="rating">
      {RATING_FACES.map((face, i) => {
        const score = i + 1
        const on = value === score
        return (
          <motion.button
            key={face}
            type="button"
            aria-label={`${score} out of 5`}
            className={`rating-face ${on ? 'is-selected' : ''} ${value && !on ? 'is-dim' : ''}`}
            whileHover={{ scale: 1.25, rotate: i % 2 ? 8 : -8 }}
            whileTap={{ scale: 0.85 }}
            animate={on ? { scale: [1, 1.5, 1.2], rotate: [0, -12, 0] } : { scale: 1, rotate: 0 }}
            onClick={(e) => {
              pop(e, question.color)
              onChange(score, { advance: true })
            }}
          >
            {face}
          </motion.button>
        )
      })}
    </div>
  )
}

function Slider({ question, value, onChange }) {
  const current = value ?? 5
  const face = SLIDER_FACES[Math.min(SLIDER_FACES.length - 1, Math.floor((current / 10) * SLIDER_FACES.length))]
  const [minLabel = '0', maxLabel = '10'] = question.options
  return (
    <div className={`slider ${value === undefined ? 'is-untouched' : ''}`}>
      <div className="slider-readout">
        <motion.span key={face} className="slider-face" initial={{ scale: 0.4, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}>
          {face}
        </motion.span>
        <motion.span key={current} className="slider-number" initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          {value === undefined ? '?' : current}
        </motion.span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        step="1"
        value={current}
        style={{ '--fill': `${current * 10}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={question.title}
      />
      <div className="slider-labels">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
}

function TextAnswer({ question, value = '', onChange }) {
  return (
    <div className="text-answer">
      <textarea
        value={value}
        maxLength={1000}
        rows={4}
        placeholder="Type away…"
        onChange={(e) => onChange(e.target.value)}
        aria-label={question.title}
      />
      <span className="text-count">{value.length}/1000</span>
    </div>
  )
}

const INPUTS = { single: SingleChoice, multi: MultiChoice, rating: Rating, slider: Slider, text: TextAnswer }

export default function CardFace({
  card,
  value,
  onChange = () => {},
  onNext = () => {},
  onBack,
  step,
  busy = false,
  error = '',
  hint = '',
  artStyle,
  shineStyle,
  onArtPointerDown,
}) {
  const Input = card.kind === 'question' ? INPUTS[card.type] ?? SingleChoice : null
  const autoAdvances = card.type === 'single' || card.type === 'rating'

  return (
    <div className={`card card--${card.kind}`} style={{ '--card': card.color }}>
      <div className="card-art" onPointerDown={onArtPointerDown}>
        <span className="art-blob art-blob--a" />
        <span className="art-blob art-blob--b" />
        <motion.div className="art-frame" style={artStyle}>
          <Illustration value={card.illustration} />
        </motion.div>
        {step && <span className="card-step">{step.label}</span>}
        {onBack && (
          <button type="button" className="card-back" onClick={onBack} aria-label="Previous question">
            ←
          </button>
        )}
        {onArtPointerDown && <span className="card-grip" aria-hidden="true" />}
      </div>

      <div className="card-body">
        {card.section && <p className="card-section">{card.section}</p>}
        <h2 className="card-title">{card.title}</h2>
        {card.subtitle && <p className="card-subtitle">{card.subtitle}</p>}

        {Input && (
          <div className="answer-area">
            <Input question={card} value={value} onChange={onChange} />
          </div>
        )}

        {card.kind !== 'outro' && (
          <footer className="card-footer">
            <span className={`card-hint ${error ? 'is-error' : ''}`}>
              {error || hint || (card.kind === 'question' && !card.required ? 'Optional' : '')}
            </span>
            {!(autoAdvances && value === undefined) && (
              <motion.button
                type="button"
                className="btn-primary"
                onClick={onNext}
                disabled={busy}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
              >
                {busy ? 'Sending…' : card.kind === 'intro' ? card.button || "Let's go" : step?.isLast ? 'Submit ✨' : 'Next →'}
              </motion.button>
            )}
          </footer>
        )}

        {card.kind === 'outro' && <div className="outro-emoji">🍟</div>}
      </div>
      <motion.span className="card-shine" style={shineStyle} aria-hidden="true" />
    </div>
  )
}
