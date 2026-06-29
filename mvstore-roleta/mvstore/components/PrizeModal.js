import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function PrizeModal({ prize, onClose, spinsLeft }) {
  const isWin = !prize?.is_retry

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (isWin) {
          import('canvas-confetti').then(confetti => {
            const colors = ['#00F5FF', '#67E8F9', '#ffffff', '#0891B2']
            confetti.default({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.5 },
              colors,
              shapes: ['circle', 'square'],
              scalar: 1.2,
            })
            setTimeout(() => {
              confetti.default({
                particleCount: 60,
                spread: 100,
                origin: { y: 0.4 },
                colors,
                angle: 60,
              })
              confetti.default({
                particleCount: 60,
                spread: 100,
                origin: { y: 0.4 },
                colors,
                angle: 120,
              })
            }, 500)
          })
        }
      } catch (e) {}
    }
  }, [prize])

  if (!prize) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop">
      <div
        className={`relative w-full max-w-sm rounded-2xl overflow-hidden ${
          isWin ? 'border border-cyan-400/50' : 'border border-white/10'
        }`}
        style={{
          background: isWin
            ? 'linear-gradient(135deg, #041218, #061A24)'
            : 'linear-gradient(135deg, #0A0A0A, #1A1A1A)',
          boxShadow: isWin
            ? '0 0 60px rgba(0, 245, 255, 0.3), 0 0 120px rgba(0, 245, 255, 0.1)'
            : '0 0 40px rgba(0,0,0,0.5)',
        }}
      >
        {isWin && (
          <div
            className="absolute inset-0 rounded-2xl opacity-50"
            style={{
              background: 'conic-gradient(from 0deg, #00F5FF, transparent, #00F5FF)',
              animation: 'spin 3s linear infinite',
              padding: '1px',
              zIndex: -1,
            }}
          />
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          {isWin ? (
            <>
              <div className="mb-4">
                <div className="text-sm font-semibold tracking-widest text-cyan-400 mb-2 uppercase">
                  🏆 Parabéns! Você ganhou!
                </div>
                <div className="text-7xl mb-4" style={{ animation: 'float 2s ease-in-out infinite' }}>
                  {prize.emoji}
                </div>
              </div>

              <div className="text-3xl font-black mb-2 shimmer-text">
                {prize.name}
              </div>

              <p className="text-white/60 text-sm mb-6">
                Entre em contato com o suporte para resgatar seu prêmio.
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">🔄</div>
              <div className="text-2xl font-bold text-white/80 mb-2">
                Não foi dessa vez...
              </div>
              <p className="text-white/40 text-sm mb-6">
                Continue tentando! Os prêmios são incríveis.
              </p>
            </>
          )}

          <div className="flex items-center justify-center gap-2 text-sm mb-4">
            <div className={`px-4 py-2 rounded-full ${
              spinsLeft > 0
                ? 'bg-cyan-400/10 border border-cyan-400/30 text-cyan-400'
                : 'bg-red-400/10 border border-red-400/30 text-red-400'
            }`}>
              {spinsLeft > 0
                ? `⚡ ${spinsLeft} giro${spinsLeft !== 1 ? 's' : ''} restante${spinsLeft !== 1 ? 's' : ''}`
                : '❌ Sem giros restantes'}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-sm font-semibold border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all"
          >
            {spinsLeft > 0 ? 'Girar novamente' : 'Fechar'}
          </button>
        </div>
      </div>
    </div>
  )
}
