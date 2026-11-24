import React from 'react'
import { ProjectDetailClient } from './client'

export const metadata = {
  title: 'تفاصيل المشروع',
  description: 'تفاصيل المشروع الاستثماري والعوائد المتوقعة',
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProjectDetailClient id={id} />
}
