import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useAnimationControls,
  useDragControls,
  useIsPresent,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react'
import { Link, useLocation } from 'react-router-dom'
import confetti from 'canvas-confetti'
import CardFace from './CardFace.jsx'
import { supabase, isConfigured } from '../lib/supabase.js'
import { DEMO_QUESTIONS, DEMO_SETTINGS } from '../lib/demo.js'
import { introCard, outroCard, questionCard } from '../lib/cards.js'
import { isAnswered } from '../lib/constants.js'
import { announceView } from '../lib/site.js'

const STACK_DEPTH = 3
const SPRING = { type: 'spring', stiffness: 260, damping: 26 }

const pose = (depth) => ({
  x: 0,
  y: depth * 26,
  scale: 1 - depth * 0.06,
  rotateZ: depth === 0 ? 0 : depth % 2 ? -3 : 2.5,
  rotateY: 0,
  opacity: depth >= STACK_DEPTH ? 0 : 1,
  filter: `brightness(${1 - depth * 0.05})`,
  transition: SPRING,
})

const variants = {
  exit: (direction) =>
    direction > 0
      ? {
          x: '-135%',
          y: 60,
          rotateZ: -24,
          rotateY: 28,
          opacity: 0,
          transition: { duration: 0.55, ease: [0.55, 0.05, 0.35, 1] },
        }
      : { ...pose(STACK_DEPTH), transition: { duration: 0.25 } },
}

function DeckCard({ card, depth, direction, shakeKey, onSwipe, faceProps }) {
  const isPresent = useIsPresent()
  const isTop = depth === 0 && isPresent
  const dragControls = useDragControls()
  const shake = useAnimationControls()

  const x = useMotionValue(0)
  const dragTilt = useTransform(x, [-220, 220], [-14, 14])

  // Mouse-follow 3D tilt + shine
  const tiltX = useSpring(0, { stiffness: 180, damping: 18 })
  const tiltY = useSpring(0, { stiffness: 180, damping: 18 })
  const shineX = useMotionValue(50)
  const shineY = useMotionValue(30)
  const artX = useTransform(tiltY, (v) => v * 1.4)
  const artY = useTransform(tiltX, (v) => v * -1.4)
  const shine = useMotionTemplate`radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,.55), transparent 55%)`

  useEffect(() => {
    if (isTop && shakeKey) shake.start({ x: [0, -14, 12, -8, 6, 0], transition: { duration: 0.45 } })
  }, [shakeKey, isTop, shake])

  const handlePointerMove = (e) => {
    if (!isTop || e.pointerType !== 'mouse') return
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    tiltY.set((px - 0.5) * 16)
    tiltX.set((0.5 - py) * 12)
    shineX.set(px * 100)
    shineY.set(py * 100)
  }

  const resetTilt = () => {
    tiltX.set(0)
    tiltY.set(0)
  }

  return (
    <motion.div
      className={`deck-card ${isTop ? 'is-top' : ''}`}
      style={{ x, zIndex: 10 - depth }}
      inert={!isTop}
      custom={direction}
      variants={variants}
      initial={isTop && direction < 0 ? { x: '-135%', rotateZ: -24, rotateY: 28, opacity: 0 } : pose(STACK_DEPTH)}
      animate={pose(depth)}
      exit="exit"
      drag={isTop && onSwipe ? 'x' : false}
      dragControls={dragControls}
      dragListener={false}
      dragSnapToOrigin
      dragElastic={0.55}
      onDragEnd={(_, info) => {
        if (info.offset.x < -110 || info.velocity.x < -650) onSwipe(1)
        else if (info.offset.x > 110 || info.velocity.x > 650) onSwipe(-1)
      }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <motion.div className="deck-card-tilt" animate={shake} style={{ rotateX: tiltX, rotateY: tiltY, rotateZ: dragTilt }}>
        <CardFace
          card={card}
          {...faceProps}
          artStyle={{ x: artX, y: artY }}
          shineStyle={{ background: shine }}
          onArtPointerDown={isTop && onSwipe ? (e) => dragControls.start(e) : undefined}
        />
      </motion.div>
    </motion.div>
  )
}

function celebrate() {
  const fire = (ratio, opts) =>
    confetti({
      particleCount: Math.floor(220 * ratio),
      origin: { y: 0.7 },
      colors: ['#da291c', '#ffc72c', '#ffffff', '#27251f', '#ffd85c'],
      disableForReducedMotion: true,
      ...opts,
    })
  fire(0.25, { spread: 26, startVelocity: 55 })
  fire(0.2, { spread: 60 })
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 })
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
  fire(0.1, { spread: 120, startVelocity: 45 })
}

export default function Survey() {
  const [data, setData] = useState({ status: 'loading' })
  const [[index, direction], setPage] = useState([0, 0])
  const [answers, setAnswers] = useState({})
  const [shakeKey, setShakeKey] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const answersRef = useRef(answers)
  const advanceTimer = useRef()
  const { search } = useLocation()

  useEffect(() => announceView('survey'), [])

  useEffect(() => {
    if (!isConfigured) {
      setData({ status: 'ready', settings: DEMO_SETTINGS, questions: DEMO_QUESTIONS, demo: true })
      return
    }
    Promise.all([
      supabase.from('settings').select('*').eq('id', 1).single(),
      supabase.from('questions').select('*').eq('active', true).order('position'),
    ]).then(([s, q]) => {
      if (s.error || q.error) setData({ status: 'error' })
      else setData({ status: 'ready', settings: s.data, questions: q.data })
    })
  }, [])

  const questions = useMemo(() => (data.questions ?? []).map(questionCard), [data.questions])
  const cards = useMemo(
    () => (data.status === 'ready' ? [introCard(data.settings), ...questions, outroCard(data.settings)] : []),
    [data, questions],
  )
  const lastQuestion = questions.length // index of the last question card
  const current = cards[index]

  const submit = useCallback(async () => {
    const payload = {}
    for (const q of questions) {
      const value = answersRef.current[q.id]
      if (value !== undefined) payload[q.id] = { q: q.title, a: value }
    }
    if (data.demo) return
    const { error: err } = await supabase.from('responses').insert({ answers: payload })
    if (err) throw err
  }, [questions, data.demo])

  const goNext = useCallback(async () => {
    clearTimeout(advanceTimer.current)
    if (!current || current.kind === 'outro' || busy) return
    if (current.kind === 'question' && current.required && !isAnswered(current, answersRef.current[current.id])) {
      setError('Pick an answer first 👀')
      setShakeKey((k) => k + 1)
      return
    }
    setError('')
    if (index === lastQuestion && questions.length > 0) {
      setBusy(true)
      try {
        await submit()
      } catch {
        setBusy(false)
        setError('Hmm, that didn’t send. Try again?')
        setShakeKey((k) => k + 1)
        return
      }
      setBusy(false)
      setPage([index + 1, 1])
      setTimeout(celebrate, 350)
      return
    }
    setPage([index + 1, 1])
    if (index + 1 === cards.length - 1) setTimeout(celebrate, 350)
  }, [current, busy, index, lastQuestion, questions.length, submit, cards.length])

  const goBack = useCallback(() => {
    clearTimeout(advanceTimer.current)
    if (index === 0 || index > lastQuestion || busy) return
    setError('')
    setPage([index - 1, -1])
  }, [index, lastQuestion, busy])

  const setAnswer = useCallback(
    (value, { advance } = {}) => {
      if (!current) return
      const next = { ...answersRef.current, [current.id]: value }
      answersRef.current = next
      setAnswers(next)
      setError('')
      clearTimeout(advanceTimer.current)
      if (advance) advanceTimer.current = setTimeout(goNext, 480)
    },
    [current, goNext],
  )

  // Keyboard: Enter = next, ←/→ navigate, 1–9 pick options
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName
      const inText = tag === 'TEXTAREA' || (tag === 'INPUT' && e.target.type !== 'range')
      if (e.key === 'Enter') {
        if (tag === 'TEXTAREA' && !(e.metaKey || e.ctrlKey)) return
        if (tag === 'BUTTON') return
        e.preventDefault()
        goNext()
        return
      }
      if (inText || tag === 'INPUT') return
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goBack()
      if (current?.kind === 'question' && /^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1
        if (current.type === 'single' && current.options[i]) setAnswer(current.options[i], { advance: true })
        if (current.type === 'rating' && i < 5) setAnswer(i + 1, { advance: true })
        if (current.type === 'multi' && current.options[i]) {
          const list = answersRef.current[current.id] ?? []
          const option = current.options[i]
          setAnswer(list.includes(option) ? list.filter((v) => v !== option) : [...list, option])
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, goNext, goBack, setAnswer])

  useEffect(() => () => clearTimeout(advanceTimer.current), [])

  if (data.status === 'loading') {
    return (
      <main className="survey">
        <div className="loader">
          <span />
          <span />
          <span />
        </div>
      </main>
    )
  }

  if (data.status === 'error') {
    return (
      <main className="survey">
        <p className="survey-message">This survey is taking a nap 😴 Please try again later.</p>
      </main>
    )
  }

  const progress = questions.length ? Math.min(index, questions.length) / questions.length : 0
  const visible = cards.slice(index, index + STACK_DEPTH).map((card, depth) => ({ card, depth }))

  return (
    <MotionConfig reducedMotion="user">
      <main className="survey">
        <div className="bg-shapes" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="progress" aria-hidden={index === 0}>
          <motion.div className="progress-fill" animate={{ scaleX: progress }} transition={SPRING} />
        </div>

        <div className="deck">
          <AnimatePresence custom={direction}>
            {visible.reverse().map(({ card, depth }) => {
              const isQuestion = card.kind === 'question'
              const qNumber = cards.indexOf(card)
              return (
                <DeckCard
                  key={card.id}
                  card={card}
                  depth={depth}
                  direction={direction}
                  shakeKey={depth === 0 ? shakeKey : 0}
                  onSwipe={card.kind === 'outro' ? undefined : (dir) => (dir > 0 ? goNext() : goBack())}
                  faceProps={{
                    value: answers[card.id],
                    onChange: setAnswer,
                    onNext: goNext,
                    onBack: depth === 0 && index > 0 && index <= lastQuestion ? goBack : undefined,
                    busy,
                    error: depth === 0 ? error : '',
                    step: isQuestion
                      ? { label: `${qNumber} / ${questions.length}`, isLast: qNumber === lastQuestion }
                      : undefined,
                  }}
                />
              )
            })}
          </AnimatePresence>
        </div>

        <div className="survey-foot">
          <AnimatePresence>
            {index === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Link className="admin-link" to={`/admin${search}`}>
                  Admin login
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          {data.demo && <p className="demo-badge">Demo mode — connect Supabase to save answers</p>}
        </div>
      </main>
    </MotionConfig>
  )
}
