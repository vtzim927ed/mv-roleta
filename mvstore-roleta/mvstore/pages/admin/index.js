import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { adminLogin, isAdminLoggedIn } from '../../lib/supabase'
import dynamic from 'next/dynamic'

const StarsBackground = dynamic(() => import('../../components/StarsBackground'), { ssr: false })

export default function AdminLogin() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAdminLoggedIn()) router.push('/admin/dashboard')
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await adminLogin(username, password)
    if (result.success) {
      router.push('/admin/dashboard')
    } else {
      setError(result.error || 'Erro ao fazer login')
    }
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Admin - MV Store</title>
      </Head>
      <div className="relative min-h-screen cyber-grid-bg flex items-center justify-center p-4" style={{ background: '#020B0F' }}>
        <StarsBackground />
        <div className="relative z-10 w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, #00F5FF, #0891B2)', boxShadow: '0 0 30px rgba(0,245,255,0.4)' }}>
              <Shield size={28} color="#020B0F" />
            </div>
            <h1 className="text-2xl font-black text-glow" style={{ color: '#00F5FF' }}>Painel Admin</h1>
            <p className="text-white/40 text-sm mt-1">MV Store · Acesso Restrito</p>
          </div>

          <div className="prize-card rounded-2xl p-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-widest">
                  Usuário
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="input-cyber w-full px-4 py-3"
                  placeholder="admin"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-cyan-400 mb-2 uppercase tracking-widest">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-cyber w-full px-4 py-3 pr-11"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-cyan w-full py-3.5">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="spinner-glow w-4 h-4" />
                    Entrando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Shield size={16} />
                    Acessar Painel
                  </span>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-white/20 text-xs mt-4">
            Acesso exclusivo para administradores
          </p>
        </div>
      </div>
    </>
  )
}
