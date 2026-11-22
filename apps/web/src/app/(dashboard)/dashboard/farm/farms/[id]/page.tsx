'use client'

import React from 'react'
import { FarmDetailClient } from './client'

export default function FarmDetailPage({ params }: { params: { id: string } }) {
  return <FarmDetailClient id={params.id} />
}
