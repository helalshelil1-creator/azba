'use client'

import React from 'react'
import { AnimalDetailClient } from './client'

export default function AnimalDetailPage({ params }: { params: { id: string } }) {
  return <AnimalDetailClient id={params.id} />
}
