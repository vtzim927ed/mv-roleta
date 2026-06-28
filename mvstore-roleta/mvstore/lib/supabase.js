import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase env vars not set. Configure .env.local')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

// ============================================================
// DATABASE HELPERS
// ============================================================

// -- CLIENTS --
export async function getClientByCode(code) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .single()
  return { data, error }
}

export async function getAllClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function createClient_db(clientData) {
  const { data, error } = await supabase
    .from('clients')
    .insert([{
      name: clientData.name,
      code: clientData.code.toUpperCase().trim(),
      spins_available: clientData.spins_available,
      created_at: new Date().toISOString()
    }])
    .select()
    .single()
  return { data, error }
}

export async function updateClientSpins(clientId, newSpins) {
  const { data, error } = await supabase
    .from('clients')
    .update({ spins_available: newSpins })
    .eq('id', clientId)
    .select()
    .single()
  return { data, error }
}

export async function decrementSpin(clientId, currentSpins) {
  const { data, error } = await supabase
    .from('clients')
    .update({ spins_available: currentSpins - 1 })
    .eq('id', clientId)
    .select()
    .single()
  return { data, error }
}

// -- SPINS / HISTORY --
export async function saveSpinResult(clientId, clientName, prizeId, prizeName) {
  const { data, error } = await supabase
    .from('spins')
    .insert([{
      client_id: clientId,
      client_name: clientName,
      prize_id: prizeId,
      prize_name: prizeName,
      spun_at: new Date().toISOString()
    }])
    .select()
    .single()
  return { data, error }
}

export async function getAllSpins() {
  const { data, error } = await supabase
    .from('spins')
    .select('*')
    .order('spun_at', { ascending: false })
  return { data, error }
}

export async function getSpinsByClient(clientId) {
  const { data, error } = await supabase
    .from('spins')
    .select('*')
    .eq('client_id', clientId)
    .order('spun_at', { ascending: false })
  return { data, error }
}

// -- PRIZES --
export async function getAllPrizes() {
  const { data, error } = await supabase
    .from('prizes')
    .select('*')
    .order('sort_order', { ascending: true })
  return { data, error }
}

export async function updatePrize(prizeId, updates) {
  const { data, error } = await supabase
    .from('prizes')
    .update(updates)
    .eq('id', prizeId)
    .select()
    .single()
  return { data, error }
}

export async function getPrizeStats() {
  const { data, error } = await supabase
    .from('spins')
    .select('prize_id, prize_name')
  
  if (error) return { data: null, error }
  
  const stats = {}
  data.forEach(spin => {
    const key = spin.prize_id
    if (!stats[key]) stats[key] = { prize_id: key, prize_name: spin.prize_name, count: 0 }
    stats[key].count++
  })
  
  return { data: Object.values(stats), error: null }
}

// -- ADMIN AUTH --
export async function adminLogin(username, password) {
  const adminUser = process.env.NEXT_PUBLIC_ADMIN_USER || 'admin'
  const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASS || 'mvstore2024'
  
  if (username === adminUser && password === adminPass) {
    const token = btoa(`${username}:${Date.now()}`)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mv_admin_token', token)
      sessionStorage.setItem('mv_admin_user', username)
    }
    return { success: true }
  }
  return { success: false, error: 'Credenciais inválidas' }
}

export function isAdminLoggedIn() {
  if (typeof window === 'undefined') return false
  return !!sessionStorage.getItem('mv_admin_token')
}

export function adminLogout() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('mv_admin_token')
    sessionStorage.removeItem('mv_admin_user')
  }
}
