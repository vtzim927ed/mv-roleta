export const DEFAULT_PRIZES = [
  {
    id: 1,
    name: 'Pix R$5',
    emoji: '💵',
    percentage: 11.11,
    weight: 6.8,
    color: '#00C896',
    active: true,
    sort_order: 1,
    is_retry: false,
  },
  {
    id: 4,
    name: 'Conta Nitrada',
    emoji: '🔥',
    percentage: 11.11,
    weight: 10.2,
    color: '#FF6B35',
    active: true,
    sort_order: 2,
    is_retry: false,
  },
  {
    id: 2,
    name: 'Pix R$15',
    emoji: '💵',
    percentage: 11.11,
    weight: 3.4,
    color: '#00A878',
    active: true,
    sort_order: 3,
    is_retry: false,
  },
  {
    id: 6,
    name: '2 Impulsos',
    emoji: '🚀',
    percentage: 11.11,
    weight: 8.2,
    color: '#2980B9',
    active: true,
    sort_order: 4,
    is_retry: false,
  },
  {
    id: 3,
    name: 'Pix R$20',
    emoji: '💵',
    percentage: 11.11,
    weight: 1.7,
    color: '#008F65',
    active: true,
    sort_order: 5,
    is_retry: false,
  },
  {
    id: 5,
    name: 'Decoração R$15,99',
    emoji: '🎨',
    percentage: 11.11,
    weight: 8.2,
    color: '#9B59B6',
    active: true,
    sort_order: 6,
    is_retry: false,
  },
  {
    id: 7,
    name: '4 Impulsos',
    emoji: '🚀',
    percentage: 11.11,
    weight: 10.2,
    color: '#1A6FA8',
    active: true,
    sort_order: 7,
    is_retry: false,
  },
  {
    id: 8,
    name: 'Produto à escolha',
    emoji: '🎁',
    percentage: 11.11,
    weight: 1.4,
    color: '#F39C12',
    active: true,
    sort_order: 8,
    is_retry: false,
  },
  {
    id: 9,
    name: 'Tente novamente',
    emoji: '🔄',
    percentage: 11.12,
    weight: 50.0,
    color: '#2C3E50',
    active: true,
    sort_order: 9,
    is_retry: true,
  },
]

export function getActivePrizes(prizes) {
  return prizes
    .filter(p => p.active)
    .sort((a, b) => a.sort_order - b.sort_order)
}

export function spinWheel(prizes) {
  const activePrizes = getActivePrizes(prizes)
  const totalWeight = activePrizes.reduce((sum, prize) => {
    return sum + (parseFloat(prize.weight) || parseFloat(prize.percentage) || 0)
  }, 0)
  const random = Math.random() * totalWeight

  let cumulative = 0
  for (const prize of activePrizes) {
    cumulative += parseFloat(prize.weight) || parseFloat(prize.percentage) || 0
    if (random <= cumulative) return prize
  }
  return activePrizes[activePrizes.length - 1]
}

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

export function getRotationForPrize(prize, segments, currentRotation) {
  const segment = segments.find(s => s.sort_order === prize.sort_order)
    || segments.find(s => s.id === prize.id)

  if (!segment) return currentRotation

  const targetAngle = segment.midAngle % 360
  const minRotations = (5 + Math.random() * 3) * 360
  const currentPos = currentRotation % 360

  let additionalRotation = (360 - targetAngle - currentPos + 720) % 360
  if (additionalRotation < 45) additionalRotation += 360

  return currentRotation + minRotations + additionalRotation
}
