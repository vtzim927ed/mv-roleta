// Default prizes - stored in Supabase but this is the seed/fallback
export const DEFAULT_PRIZES = [
  {
    id: 1,
    name: 'Pix R$5',
    emoji: '💵',
    percentage: 6.8,
    color: '#00C896',
    active: true,
    sort_order: 1,
    is_retry: false,
  },
  {
    id: 2,
    name: 'Pix R$15',
    emoji: '💵',
    percentage: 3.4,
    color: '#00A878',
    active: true,
    sort_order: 2,
    is_retry: false,
  },
  {
    id: 3,
    name: 'Pix R$20',
    emoji: '💵',
    percentage: 1.7,
    color: '#008F65',
    active: true,
    sort_order: 3,
    is_retry: false,
  },
  {
    id: 4,
    name: 'Conta Nitrada',
    emoji: '🔥',
    percentage: 10.2,
    color: '#FF6B35',
    active: true,
    sort_order: 4,
    is_retry: false,
  },
  {
    id: 5,
    name: 'Decoração R$15,99',
    emoji: '🎨',
    percentage: 8.2,
    color: '#9B59B6',
    active: true,
    sort_order: 5,
    is_retry: false,
  },
  {
    id: 6,
    name: '2 Impulsos',
    emoji: '🚀',
    percentage: 8.2,
    color: '#2980B9',
    active: true,
    sort_order: 6,
    is_retry: false,
  },
  {
    id: 7,
    name: '2 Impulsos',
    emoji: '🚀',
    percentage: 10.2,
    color: '#1A6FA8',
    active: true,
    sort_order: 7,
    is_retry: false,
  },
  {
    id: 8,
    name: 'Produto à escolha',
    emoji: '🎁',
    percentage: 1.4,
    color: '#F39C12',
    active: true,
    sort_order: 8,
    is_retry: false,
  },
  {
    id: 9,
    name: 'Tente novamente',
    emoji: '🔄',
    percentage: 50.0,
    color: '#2C3E50',
    active: true,
    sort_order: 9,
    is_retry: true,
  },
]

export function getActivePrizes(prizes) {
  return prizes.filter(p => p.active)
}

export function spinWheel(prizes) {
  const activePrizes = getActivePrizes(prizes)
  const totalPercentage = activePrizes.reduce((sum, p) => sum + p.percentage, 0)
  const random = Math.random() * totalPercentage
  
  let cumulative = 0
  for (const prize of activePrizes) {
    cumulative += prize.percentage
    if (random <= cumulative) {
      return prize
    }
  }
  
  // Fallback to last prize
  return activePrizes[activePrizes.length - 1]
}

// Calculate wheel segment angles
export function calculateSegments(prizes) {
  const activePrizes = getActivePrizes(prizes)
  const totalPercentage = activePrizes.reduce((sum, p) => sum + p.percentage, 0)
  
  let currentAngle = 0
  return activePrizes.map(prize => {
    const angle = (prize.percentage / totalPercentage) * 360
    const segment = {
      ...prize,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      midAngle: currentAngle + angle / 2,
    }
    currentAngle += angle
    return segment
  })
}

// Find the angle to rotate to land on a specific prize
export function getRotationForPrize(prize, segments, currentRotation) {
  const segment = segments.find(s => s.id === prize.id)
  if (!segment) return currentRotation
  
  // We want the midpoint of the winning segment to be at the top (pointer)
  // The pointer is at 0 degrees (top), wheel rotates clockwise
  const targetAngle = segment.midAngle
  
  // Minimum rotations for dramatic effect (5-8 full spins)
  const minRotations = (5 + Math.random() * 3) * 360
  
  // Calculate how much to rotate
  // Current position mod 360, then figure out additional rotation needed
  const currentPos = currentRotation % 360
  let additionalRotation = (360 - targetAngle - currentPos + 360) % 360
  
  if (additionalRotation < 30) additionalRotation += 360
  
  return currentRotation + minRotations + additionalRotation
}
