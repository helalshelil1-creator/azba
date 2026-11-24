'use client'

import React, { use } from 'react'
import { FarmDetailClient } from './client'

export default function FarmDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <FarmDetailClient id={id} />
}
