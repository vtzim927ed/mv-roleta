import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import {
  Users, RotateCcw, Gift, LogOut, Plus, Edit2, Check, X,
  BarChart2, RefreshCw, Shield, ChevronDown, Zap, Toggle,
  Search, Copy, Trash2, Eye
} from 'lucide-react'
import {
  isAdminLoggedIn, adminLogout,
  getAllClients, createClient_db, updateClientSpins,
  getAllSpins, getAllPrizes, updatePrize, getPrizeStats
} from '../../lib/supabase'
import { DEFAULT_PRIZES } from '../../lib/prizes'

const StarsBackground = dynamic(() => import('../../components/StarsBackground'), { ssr: false })

const TABS = [
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'spins', label: 'Histórico', icon: RotateCcw },
  { id: 'prizes', label: 'Prêmios', icon: Gift },
  { id: 'stats', label: 'Estatísticas', icon: BarChart2 },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('clients')
  const [loading, setLoading] = useState(true)

  // Data
  const [clients, setClients] = useState([])
  const [spins, setSpins] = useState([])
  const [prizes, setPrizes] = useState([])
  const [prizeStats, setPrizeStats] = useState([])

  // Forms
  const [newClient, setNewClient] = useState({ name: '', code: '', spins_available: 1 })
  const [showNewClient, setShowNewClient] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [addSpinsValue, setAddSpinsValue] = useState({})
  const [editingPrize, setEditingPrize] = useState(null)
  const [searchClient, setSearchClient] = useState('')

  const [notification, setNotification] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/admin')
      return
    }
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)
    try {
      const [c, s, p, ps] = await Promise.all([
        getAllClients(),
        getAllSpins(),
        getAllPrizes(),
        getPrizeStats(),
      ])
      if (c.data) setClients(c.data)
      if (s.data) setSpins(s.data)
      if (p.data && p.data.length > 0) setPrizes(p.data)
      else setPrizes(DEFAULT_PRIZES)
      if (ps.data) setPrizeStats(ps.data)
    } catch (e) {
      showNotif('Erro ao carregar dados', 'error')
    }
    setLoading(false)
  }

  function showNotif(msg, type = 'success') {
    setNotification({ msg, type })
    setTimeout(() => setNotification(null), 3000)
  }

  function handleLogout() {
    adminLogout()
    router.push('/admin')
  }

  // Generate random code
  function generateCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = 'MV'
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
    return code
  }

  async function handleCreateClient(e) {
    e.preventDefault()
    if (!newClient.name || !newClient.code) return
    setSaving(true)
    const { data, error } = await createClient_db(newClient)
    if (error) {
      showNotif(error.message || 'Erro ao criar cliente', 'error')
    } else {
      setClients(prev => [data, ...prev])
      setNewClient({ name: '', code: '', spins_available: 1 })
      setShowNewClient(false)
      showNotif('Cliente criado com sucesso!')
    }
    setSaving(false)
  }

  async function handleAddSpins(client) {
    const add = parseInt(addSpinsValue[client.id] || 0)
    if (!add || add <= 0) return
    setSaving(true)
    const { data, error } = await updateClientSpins(client.id, client.spins_available + add)
    if (!error && data) {
      setClients(prev => prev.map(c => c.id === client.id ? data : c))
      setAddSpinsValue(prev => ({ ...prev, [client.id]: '' }))
      showNotif(`+${add} giro(s) adicionado(s)!`)
    }
    setSaving(false)
  }

  async function handleUpdatePrize(prize) {
    setSaving(true)
    const { data, error } = await updatePrize(prize.id, {
      name: prize.name,
      emoji: prize.emoji,
      percentage: parseFloat(prize.percentage),
      color: prize.color,
      active: prize.active,
    })
    if (!error) {
      setPrizes(prev => prev.map(p => p.id === prize.id ? { ...p, ...prize } : p))
      setEditingPrize(null)
      showNotif('Prêmio atualizado!')
    } else {
      showNotif('Erro ao atualizar', 'error')
    }
    setSaving(false)
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
    showNotif('Código copiado!')
  }

  // Total percentage
  const totalPct = prizes.filter(p => p.active).reduce((sum, p) => sum + parseFloat(p.percentage || 0), 0)

  const filteredClients = clients.filter(c =>
    c.name?.toLowerCase().includes(searchClient.toLowerCase()) ||
    c.code?.toLowerCase().includes(searchClient.toLowerCase())
  )

  const stats = {
    totalClients: clients.length,
    totalSpins: spins.length,
    activeCodes: clients.filter(c => c.spins_available > 0).length,
    totalSpinsAvail: clients.reduce((sum, c) => sum + (c.spins_available || 0), 0),
  }

  return (
    <>
      <Head><title>Admin Dashboard - MV Store</title></Head>
      <div className="relative min-h-screen cyber-grid-bg" style={{ background: '#020B0F' }}>
        <StarsBackground />

        {notification && (
          <div className={`notification fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg ${
            notification.type === 'success'
              ? 'bg-cyan-400/20 border border-cyan-400/50 text-cyan-400'
              : 'bg-red-400/20 border border-red-400/50 text-red-400'
          }`}>
            {notification.msg}
          </div>
        )}

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <header className="px-4 md:px-6 py-4 flex items-center justify-between border-b border-cyan-400/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #00F5FF, #0891B2)' }}>
                <Shield size={18} color="#020B0F" />
              </div>
              <div>
                <div className="font-black text-sm" style={{ color: '#00F5FF' }}>PAINEL ADMIN</div>
                <div className="text-xs text-white/30">MV Store</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={fetchAll} className="p-2 rounded-lg border border-white/10 text-white/40 hover:text-cyan-400 hover:border-cyan-400/30 transition-all">
                <RefreshCw size={14} />
              </button>
              <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 border border-red-400/30 hover:border-red-400 transition-all">
                <LogOut size={12} />
                <span className="hidden sm:block">Sair</span>
              </button>
            </div>
          </header>

          {/* Stats bar */}
          <div className="px-4 md:px-6 py-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Clientes', value: stats.totalClients, icon: '👥' },
              { label: 'Giros totais', value: stats.totalSpins, icon: '🎰' },
              { label: 'Códigos ativos', value: stats.activeCodes, icon: '⚡' },
              { label: 'Giros disponíveis', value: stats.totalSpinsAvail, icon: '🎁' },
            ].map(stat => (
              <div key={stat.label} className="prize-card rounded-xl p-3 flex items-center gap-3">
                <span className="text-xl">{stat.icon}</span>
                <div>
                  <div className="text-lg font-black text-cyan-400">{stat.value}</div>
                  <div className="text-xs text-white/40">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab nav */}
          <div className="px-4 md:px-6 flex gap-1 border-b border-white/5 overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-white/40 hover:text-white/70'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Tab content */}
          <div className="flex-1 px-4 md:px-6 py-4 overflow-auto">

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="spinner-glow w-8 h-8" />
              </div>
            ) : (

              <>
                {/* ============ CLIENTS TAB ============ */}
                {activeTab === 'clients' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex-1 min-w-48 relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                          type="text"
                          placeholder="Buscar cliente ou código..."
                          value={searchClient}
                          onChange={e => setSearchClient(e.target.value)}
                          className="input-cyber w-full pl-9 pr-4 py-2.5 text-sm"
                        />
                      </div>
                      <button
                        onClick={() => setShowNewClient(!showNewClient)}
                        className="btn-cyan px-4 py-2.5 text-sm flex items-center gap-1.5"
                      >
                        <Plus size={14} />
                        Novo cliente
                      </button>
                    </div>

                    {/* New client form */}
                    {showNewClient && (
                      <div className="prize-card rounded-2xl p-4">
                        <h3 className="text-sm font-bold text-cyan-400 mb-3">Criar novo cliente</h3>
                        <form onSubmit={handleCreateClient} className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input
                              type="text"
                              placeholder="Nome do cliente"
                              value={newClient.name}
                              onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))}
                              className="input-cyber px-3 py-2.5 text-sm"
                              required
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Código único"
                                value={newClient.code}
                                onChange={e => setNewClient(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                                className="input-cyber flex-1 px-3 py-2.5 text-sm font-mono"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setNewClient(p => ({ ...p, code: generateCode() }))}
                                className="px-2.5 py-2 rounded-lg border border-cyan-400/30 text-cyan-400 text-xs hover:border-cyan-400 transition-all whitespace-nowrap"
                                title="Gerar código automático"
                              >
                                <RefreshCw size={14} />
                              </button>
                            </div>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              placeholder="Qtd. giros"
                              value={newClient.spins_available}
                              onChange={e => setNewClient(p => ({ ...p, spins_available: parseInt(e.target.value) || 1 }))}
                              className="input-cyber px-3 py-2.5 text-sm"
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" disabled={saving} className="btn-cyan px-4 py-2 text-sm">
                              {saving ? '...' : 'Criar'}
                            </button>
                            <button type="button" onClick={() => setShowNewClient(false)} className="px-4 py-2 text-sm border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                              Cancelar
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Clients table */}
                    <div className="prize-card rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Cliente</th>
                              <th>Código</th>
                              <th>Giros restantes</th>
                              <th>Criado em</th>
                              <th>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredClients.length === 0 ? (
                              <tr><td colSpan={5} className="text-center text-white/30 py-8">Nenhum cliente encontrado</td></tr>
                            ) : filteredClients.map(client => (
                              <tr key={client.id}>
                                <td>
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                      style={{ background: 'linear-gradient(135deg, #00F5FF, #0891B2)', color: '#020B0F' }}>
                                      {client.name?.[0]?.toUpperCase()}
                                    </div>
                                    {client.name}
                                  </div>
                                </td>
                                <td>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-cyan-400 text-xs">{client.code}</span>
                                    <button onClick={() => copyToClipboard(client.code)} className="text-white/20 hover:text-cyan-400">
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                </td>
                                <td>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    client.spins_available > 0 ? 'bg-cyan-400/15 text-cyan-400' : 'bg-red-400/15 text-red-400'
                                  }`}>
                                    {client.spins_available}
                                  </span>
                                </td>
                                <td className="text-white/40 text-xs">
                                  {new Date(client.created_at).toLocaleDateString('pt-BR')}
                                </td>
                                <td>
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      min={1}
                                      max={100}
                                      placeholder="+N"
                                      value={addSpinsValue[client.id] || ''}
                                      onChange={e => setAddSpinsValue(p => ({ ...p, [client.id]: e.target.value }))}
                                      className="input-cyber w-14 px-2 py-1 text-xs text-center"
                                    />
                                    <button
                                      onClick={() => handleAddSpins(client)}
                                      disabled={!addSpinsValue[client.id]}
                                      className="px-2 py-1 rounded-lg bg-cyan-400/15 text-cyan-400 text-xs hover:bg-cyan-400/30 transition-all disabled:opacity-40"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ============ SPINS HISTORY TAB ============ */}
                {activeTab === 'spins' && (
                  <div className="prize-card rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-cyan-400/10 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-cyan-400">Histórico de giros ({spins.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Cliente</th>
                            <th>Prêmio</th>
                            <th>Data e hora</th>
                          </tr>
                        </thead>
                        <tbody>
                          {spins.length === 0 ? (
                            <tr><td colSpan={3} className="text-center text-white/30 py-8">Nenhum giro registrado</td></tr>
                          ) : spins.map(spin => (
                            <tr key={spin.id}>
                              <td>{spin.client_name}</td>
                              <td>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  spin.prize_name === 'Tente novamente'
                                    ? 'bg-white/5 text-white/40'
                                    : 'bg-cyan-400/15 text-cyan-400'
                                }`}>
                                  {spin.prize_name}
                                </span>
                              </td>
                              <td className="text-white/40 text-xs">
                                {new Date(spin.spun_at).toLocaleString('pt-BR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ============ PRIZES TAB ============ */}
                {activeTab === 'prizes' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-cyan-400">Configuração da Roleta</h3>
                      <div className={`text-xs px-3 py-1 rounded-full ${
                        Math.abs(totalPct - 100) < 0.1
                          ? 'bg-green-400/15 text-green-400 border border-green-400/30'
                          : 'bg-red-400/15 text-red-400 border border-red-400/30'
                      }`}>
                        Total: {totalPct.toFixed(1)}%
                      </div>
                    </div>

                    {prizes.map(prize => (
                      <div key={prize.id} className="prize-card rounded-xl p-4">
                        {editingPrize?.id === prize.id ? (
                          // Edit mode
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              <input
                                type="text"
                                value={editingPrize.emoji}
                                onChange={e => setEditingPrize(p => ({ ...p, emoji: e.target.value }))}
                                className="input-cyber px-3 py-2 text-sm text-center"
                                placeholder="Emoji"
                              />
                              <input
                                type="text"
                                value={editingPrize.name}
                                onChange={e => setEditingPrize(p => ({ ...p, name: e.target.value }))}
                                className="input-cyber px-3 py-2 text-sm col-span-2"
                                placeholder="Nome do prêmio"
                              />
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  step="0.1"
                                  min={0}
                                  max={100}
                                  value={editingPrize.percentage}
                                  onChange={e => setEditingPrize(p => ({ ...p, percentage: e.target.value }))}
                                  className="input-cyber px-3 py-2 text-sm flex-1"
                                  placeholder="%"
                                />
                                <span className="text-white/40 text-sm">%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={editingPrize.color}
                                onChange={e => setEditingPrize(p => ({ ...p, color: e.target.value }))}
                                className="w-8 h-8 rounded cursor-pointer"
                              />
                              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editingPrize.active}
                                  onChange={e => setEditingPrize(p => ({ ...p, active: e.target.checked }))}
                                  className="accent-cyan-400"
                                />
                                Ativo
                              </label>
                              <div className="flex gap-2 ml-auto">
                                <button onClick={() => handleUpdatePrize(editingPrize)} disabled={saving}
                                  className="px-3 py-1.5 bg-cyan-400/20 text-cyan-400 rounded-lg text-xs hover:bg-cyan-400/30">
                                  <Check size={14} />
                                </button>
                                <button onClick={() => setEditingPrize(null)}
                                  className="px-3 py-1.5 bg-white/5 text-white/40 rounded-lg text-xs hover:text-white">
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                              style={{ backgroundColor: prize.color + '33' }}>
                              {prize.emoji}
                            </div>
                            <div className="flex-1">
                              <div className={`text-sm font-semibold ${prize.active ? 'text-white' : 'text-white/30'}`}>
                                {prize.name}
                              </div>
                              <div className="text-xs text-white/30">{prize.percentage}%</div>
                            </div>
                            {/* Bar */}
                            <div className="hidden md:block w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${prize.percentage}%`, backgroundColor: prize.color }} />
                            </div>
                            <div className={`text-xs px-2 py-0.5 rounded-full ${prize.active ? 'bg-green-400/15 text-green-400' : 'bg-red-400/15 text-red-400'}`}>
                              {prize.active ? 'Ativo' : 'Inativo'}
                            </div>
                            <button onClick={() => setEditingPrize({ ...prize })}
                              className="p-1.5 rounded-lg text-white/30 hover:text-cyan-400 hover:bg-cyan-400/10 transition-all">
                              <Edit2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ============ STATS TAB ============ */}
                {activeTab === 'stats' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Prize frequency */}
                      <div className="prize-card rounded-2xl p-4">
                        <h3 className="text-sm font-bold text-cyan-400 mb-4">Prêmios mais sorteados</h3>
                        {prizeStats.length === 0 ? (
                          <p className="text-white/30 text-sm text-center py-4">Nenhum dado ainda</p>
                        ) : (
                          <div className="space-y-3">
                            {prizeStats
                              .sort((a, b) => b.count - a.count)
                              .map(stat => {
                                const prize = prizes.find(p => p.id === stat.prize_id)
                                const pct = spins.length > 0 ? ((stat.count / spins.length) * 100).toFixed(1) : 0
                                return (
                                  <div key={stat.prize_id} className="flex items-center gap-3">
                                    <span className="text-lg w-7 text-center">{prize?.emoji || '?'}</span>
                                    <div className="flex-1">
                                      <div className="flex justify-between mb-1">
                                        <span className="text-xs text-white/70">{stat.prize_name}</span>
                                        <span className="text-xs text-white/40">{stat.count}x ({pct}%)</span>
                                      </div>
                                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #00F5FF, #0891B2)' }} />
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        )}
                      </div>

                      {/* Summary */}
                      <div className="prize-card rounded-2xl p-4">
                        <h3 className="text-sm font-bold text-cyan-400 mb-4">Resumo geral</h3>
                        <div className="space-y-3">
                          {[
                            { label: 'Total de giros realizados', value: spins.length },
                            { label: 'Clientes cadastrados', value: clients.length },
                            { label: 'Giros pendentes (todos)', value: clients.reduce((s, c) => s + (c.spins_available || 0), 0) },
                            { label: 'Prêmios reais ganhos', value: spins.filter(s => s.prize_name !== 'Tente novamente').length },
                            { label: 'Taxa de prêmio', value: spins.length > 0 ? `${((spins.filter(s => s.prize_name !== 'Tente novamente').length / spins.length) * 100).toFixed(1)}%` : '0%' },
                          ].map(item => (
                            <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                              <span className="text-xs text-white/50">{item.label}</span>
                              <span className="text-sm font-bold text-cyan-400">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
