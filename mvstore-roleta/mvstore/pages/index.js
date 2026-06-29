import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { Zap, Gift, ChevronRight, RotateCcw, History, X, AlertCircle } from 'lucide-react'
import { getClientByCode, decrementSpin, saveSpinResult, getAllPrizes } from '../lib/supabase'
import { DEFAULT_PRIZES, spinWheel } from '../lib/prizes'
import PrizeModal from '../components/PrizeModal'

const SpinWheel = dynamic(() => import('../components/SpinWheel'), { ssr: false })
const StarsBackground = dynamic(() => import('../components/StarsBackground'), { ssr: false })

export default function Home() {
  const [step, setStep] = useState('code') // code | wheel
  const [code, setCode] = useState('')
  const [client, setClient] = useState(null)
  const [prizes, setPrizes] = useState(DEFAULT_PRIZES)
  const [spinning, setSpinning] = useState(false)
  const [wonPrize, setWonPrize] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    loadPrizes()
  }, [])

  async function loadPrizes() {
    try {
      const { data, error } = await getAllPrizes()
      if (data && data.length > 0) {
        setPrizes(data)
      }
    } catch (e) {
      // Use defaults
    }
  }

  function showNotification(msg, type = 'success') {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }

  async function handleCodeSubmit(e) {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setError('')

    try {
      const { data, error } = await getClientByCode(code)
      if (error || !data) {
        setError('Código inválido. Verifique e tente novamente.')
        setLoading(false)
        return
      }
      if (data.spins_available <= 0) {
        setError('Este código não possui giros disponíveis.')
        setLoading(false)
        return
      }
      setClient(data)
      setStep('wheel')
    } catch (e) {
      setError('Erro ao validar código. Tente novamente.')
    }
    setLoading(false)
  }

  async function handleSpin() {
    if (spinning || !client || client.spins_available <= 0) return

    const prize = spinWheel(prizes)
    
    // Trigger wheel animation
    if (window.__spinWheel) {
      window.__spinWheel(prize)
    }

    // Decrement spin immediately
    try {
      const { data: updatedClient } = await decrementSpin(client.id, client.spins_available)
      if (updatedClient) setClient(updatedClient)
    } catch (e) {}

    // Save result
    try {
      await saveSpinResult(client.id, client.name, prize.id, prize.name)
      setHistory(prev => [{
        prize_name: prize.name,
        emoji: prize.emoji,
        spun_at: new Date().toISOString(),
      }, ...prev])
    } catch (e) {}
  }

  function handleSpinComplete(prize) {
    setWonPrize(prize)
    setShowModal(true)
  }

  function handleCloseModal() {
    setShowModal(false)
    setWonPrize(null)
  }

  const spinsLeft = client?.spins_available ?? 0

  return (
    <>
      <Head>
        <title>MV Store - Roleta de Prêmios</title>
        <meta name="description" content="Gire a roleta e ganhe prêmios incríveis na MV Store!" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative min-h-screen cyber-grid-bg overflow-hidden" style={{ background: '#020B0F' }}>
        <StarsBackground />

        {/* Notification */}
        {notification && (
          <div className={`notification fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg ${
            notification.type === 'success'
              ? 'bg-cyan-400/20 border border-cyan-400/50 text-cyan-400'
              : 'bg-red-400/20 border border-red-400/50 text-red-400'
          }`}>
            {notification.msg}
          </div>
        )}

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <header className="px-4 py-4 flex items-center justify-between border-b border-cyan-400/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #00F5FF, #0891B2)', boxShadow: '0 0 15px rgba(0,245,255,0.4)' }}>
                <span className="text-xl">👑</span>
              </div>
              <div>
                <div className="font-black text-base text-glow" style={{ color: '#00F5FF' }}>MV STORE</div>
                <div className="text-xs text-white/40">Roleta de Prêmios</div>
              </div>
            </div>

            {step === 'wheel' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-cyan-400 border border-cyan-400/30 hover:border-cyan-400/60 transition-all"
                >
                  <History size={12} />
                  Histórico
                </button>
                <button
                  onClick={() => { setStep('code'); setClient(null); setCode(''); setHistory([]) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 border border-white/10 hover:border-white/30 transition-all"
                >
                  <RotateCcw size={12} />
                  Sair
                </button>
              </div>
            )}
          </header>

          <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
            {step === 'code' ? (
              // CODE ENTRY SCREEN
              <div className="w-full max-w-md">
                {/* Hero */}
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4" style={{ animation: 'float 3s ease-in-out infinite', display: 'inline-block' }}>
                    🎰
                  </div>
                  <h1 className="text-3xl font-black mb-2" style={{ color: '#00F5FF' }}>
                    <span className="shimmer-text">Roleta de Prêmios</span>
                  </h1>
                  <p className="text-white/50 text-sm">
                    Insira seu código único para girar e ganhar!
                  </p>
                </div>

                {/* Code form */}
                <div className="prize-card rounded-2xl p-6">
                  <form onSubmit={handleCodeSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-widest">
                        Código de Acesso
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        placeholder="Ex: MV123ABC"
                        className="input-cyber w-full px-4 py-3.5 text-lg font-mono tracking-widest text-center"
                        maxLength={20}
                        autoFocus
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        <AlertCircle size={14} />
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !code.trim()}
                      className="btn-cyan w-full py-4 text-base"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="spinner-glow w-4 h-4" />
                          Validando...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Zap size={18} />
                          Entrar e Girar
                          <ChevronRight size={18} />
                        </span>
                      )}
                    </button>
                  </form>

                  <p className="text-center text-white/30 text-xs mt-4">
                    Receba seu código após uma compra na MV Store
                  </p>
                </div>

                {/* Preview prizes */}
                <div className="mt-6">
                  <p className="text-center text-white/30 text-xs mb-3 uppercase tracking-widest">Prêmios disponíveis</p>
                  <div className="grid grid-cols-2 gap-2">
                    {prizes.filter(p => !p.is_retry && p.active).slice(0, 6).map(prize => (
                      <div key={prize.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3 border border-white/5">
                        <span>{prize.emoji}</span>
                        <span className="text-xs text-white/60 truncate">{prize.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // WHEEL SCREEN
              <div className="w-full max-w-lg flex flex-col items-center gap-4">
                {/* Client info */}
                <div className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-cyan-400/20" style={{ background: 'rgba(0,245,255,0.05)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ background: 'linear-gradient(135deg, #00F5FF, #0891B2)' }}>
                    {client?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{client?.name || 'Cliente'}</div>
                    <div className="text-xs text-white/40">Código: {client?.code}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ background: spinsLeft > 0 ? 'rgba(0,245,255,0.15)' : 'rgba(255,60,60,0.15)', border: `1px solid ${spinsLeft > 0 ? 'rgba(0,245,255,0.4)' : 'rgba(255,60,60,0.4)'}` }}>
                    <Zap size={12} style={{ color: spinsLeft > 0 ? '#00F5FF' : '#ff6b6b' }} />
                    <span className="text-sm font-bold" style={{ color: spinsLeft > 0 ? '#00F5FF' : '#ff6b6b' }}>
                      {spinsLeft} giro{spinsLeft !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Wheel */}
                <div className="w-full flex items-center justify-center">
                  <SpinWheel
                    prizes={prizes}
                    onSpinComplete={handleSpinComplete}
                    disabled={spinsLeft <= 0}
                    spinning={spinning}
                    setSpinning={setSpinning}
                  />
                </div>

                {/* Spin button */}
                <button
                  onClick={handleSpin}
                  disabled={spinning || spinsLeft <= 0}
                  className="btn-cyan w-full max-w-xs py-4 text-lg flex items-center justify-center gap-3"
                >
                  {spinning ? (
                    <>
                      <div className="spinner-glow w-5 h-5" />
                      Girando...
                    </>
                  ) : spinsLeft <= 0 ? (
                    <>❌ Sem giros restantes</>
                  ) : (
                    <>
                      <span>🎰</span>
                      GIRAR AGORA
                      <Zap size={20} />
                    </>
                  )}
                </button>

                {spinsLeft <= 0 && (
                  <p className="text-white/30 text-xs text-center">
                    Seus giros acabaram. Faça uma nova compra para ganhar mais!
                  </p>
                )}

                {/* History panel */}
                {showHistory && (
                  <div className="w-full prize-card rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-1.5">
                        <History size={14} />
                        Histórico desta sessão
                      </h3>
                      <button onClick={() => setShowHistory(false)}>
                        <X size={14} className="text-white/40 hover:text-white" />
                      </button>
                    </div>
                    {history.length === 0 ? (
                      <p className="text-white/30 text-xs text-center py-4">Nenhum giro ainda</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {history.map((h, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <span>{h.emoji}</span>
                            <span className="text-white/70 flex-1">{h.prize_name}</span>
                            <span className="text-white/30 text-xs">
                              {new Date(h.spun_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="px-4 py-3 text-center border-t border-white/5">
            <p className="text-white/20 text-xs">© MV Store · Todos os direitos reservados</p>
          </footer>
        </div>

        {/* Prize modal */}
        {showModal && wonPrize && (
          <PrizeModal
            prize={wonPrize}
            onClose={handleCloseModal}
            spinsLeft={spinsLeft}
          />
        )}
      </div>
    </>
  )
}
