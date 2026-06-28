import { useRef, useEffect, useState } from 'react'
import { calculateSegments, getRotationForPrize } from '../lib/prizes'

export default function SpinWheel({ prizes, onSpinComplete, disabled, spinning, setSpinning }) {
  const canvasRef = useRef(null)
  const [rotation, setRotation] = useState(0)
  const rotationRef = useRef(0)
  const animFrameRef = useRef(null)

  const segments = calculateSegments(prizes)

  useEffect(() => {
    drawWheel(rotationRef.current)
  }, [prizes])

  function drawWheel(currentRot) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = canvas.width
    const cx = size / 2
    const cy = size / 2
    const radius = size / 2 - 10

    ctx.clearRect(0, 0, size, size)

    // Draw outer glow ring
    const glowGrad = ctx.createRadialGradient(cx, cy, radius - 5, cx, cy, radius + 10)
    glowGrad.addColorStop(0, 'rgba(0, 245, 255, 0.8)')
    glowGrad.addColorStop(1, 'rgba(0, 245, 255, 0)')
    ctx.beginPath()
    ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2)
    ctx.strokeStyle = glowGrad
    ctx.lineWidth = 10
    ctx.stroke()

    // Draw segments
    const rotRad = (currentRot * Math.PI) / 180

    segments.forEach((seg, i) => {
      const startRad = ((seg.startAngle - 90) * Math.PI) / 180 + rotRad
      const endRad = ((seg.endAngle - 90) * Math.PI) / 180 + rotRad

      // Segment fill
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, radius - 2, startRad, endRad)
      ctx.closePath()

      // Alternating darkness
      const baseColor = seg.color
      const isEven = i % 2 === 0
      ctx.fillStyle = isEven ? baseColor : darkenColor(baseColor, 25)
      ctx.fill()

      // Segment border
      ctx.strokeStyle = 'rgba(0, 245, 255, 0.4)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Text
      const midRad = ((seg.midAngle - 90) * Math.PI) / 180 + rotRad
      const textRadius = radius * 0.65
      const textX = cx + Math.cos(midRad) * textRadius
      const textY = cy + Math.sin(midRad) * textRadius

      ctx.save()
      ctx.translate(textX, textY)
      ctx.rotate(midRad + Math.PI / 2)

      // Emoji
      ctx.font = `${Math.max(12, size * 0.042)}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(seg.emoji, 0, -12)

      // Label
      ctx.font = `bold ${Math.max(9, size * 0.028)}px Arial`
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = 3
      
      const label = seg.name.length > 14 ? seg.name.substring(0, 12) + '…' : seg.name
      ctx.fillText(label, 0, 6)
      ctx.restore()
    })

    // Center circle
    const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 35)
    centerGrad.addColorStop(0, '#00F5FF')
    centerGrad.addColorStop(0.4, '#0891B2')
    centerGrad.addColorStop(1, '#041218')

    ctx.beginPath()
    ctx.arc(cx, cy, 35, 0, Math.PI * 2)
    ctx.fillStyle = centerGrad
    ctx.fill()

    ctx.beginPath()
    ctx.arc(cx, cy, 35, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(0, 245, 255, 0.8)'
    ctx.lineWidth = 2
    ctx.stroke()

    // MV logo text
    ctx.font = 'bold 16px Arial'
    ctx.fillStyle = '#020B0F'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.shadowColor = 'transparent'
    ctx.fillText('MV', cx, cy - 5)
    ctx.font = '9px Arial'
    ctx.fillText('STORE', cx, cy + 8)
  }

  function darkenColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16)
    const r = Math.max(0, (num >> 16) - amount)
    const g = Math.max(0, ((num >> 8) & 0xff) - amount)
    const b = Math.max(0, (num & 0xff) - amount)
    return `rgb(${r},${g},${b})`
  }

  function startSpin(targetPrize) {
    if (spinning || disabled) return

    setSpinning(true)
    const targetRotation = getRotationForPrize(targetPrize, segments, rotationRef.current)
    const startRotation = rotationRef.current
    const totalRotation = targetRotation - startRotation
    const duration = 5000 + Math.random() * 2000 // 5-7 seconds
    const startTime = performance.now()

    function easeOut(t) {
      // Custom ease-out with slight bounce
      return 1 - Math.pow(1 - t, 4)
    }

    function animate(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOut(progress)

      rotationRef.current = startRotation + totalRotation * easedProgress
      drawWheel(rotationRef.current)

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      } else {
        rotationRef.current = targetRotation
        setRotation(targetRotation)
        setSpinning(false)
        onSpinComplete(targetPrize)
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)
  }

  // Expose startSpin via ref trick
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__spinWheel = startSpin
    }
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [spinning, segments])

  return (
    <div className="wheel-container flex items-center justify-center relative">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 wheel-pointer" style={{ marginTop: '-2px' }}>
        <svg width="32" height="48" viewBox="0 0 32 48">
          <defs>
            <linearGradient id="pointerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F5FF" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
            <filter id="pointerGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <polygon 
            points="16,2 30,46 2,46" 
            fill="url(#pointerGrad)" 
            filter="url(#pointerGlow)"
            stroke="rgba(0,245,255,0.5)"
            strokeWidth="1"
          />
          <circle cx="16" cy="46" r="5" fill="#00F5FF" filter="url(#pointerGlow)" />
        </svg>
      </div>

      {/* Outer decorative ring */}
      <div className="absolute inset-0 rounded-full" style={{
        background: 'conic-gradient(from 0deg, transparent 0%, rgba(0,245,255,0.1) 50%, transparent 100%)',
        animation: 'spin 8s linear infinite',
        borderRadius: '50%',
      }} />

      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="relative z-10 w-full max-w-[380px] md:max-w-[500px]"
        style={{ borderRadius: '50%' }}
      />
    </div>
  )
}
