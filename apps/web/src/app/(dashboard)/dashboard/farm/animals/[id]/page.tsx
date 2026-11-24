'use client'

import React, { use } from 'react'
import { AnimalDetailClient } from './client'

export default function AnimalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <AnimalDetailClient id={id} />
}
