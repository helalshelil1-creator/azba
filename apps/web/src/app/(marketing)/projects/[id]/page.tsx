import React from 'react'
import { ProjectDetailClient } from './client'

export const metadata = {
  title: 'تفاصيل المشروع',
  description: 'تفاصيل المشروع الاستثماري والعوائد المتوقعة',
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return <ProjectDetailClient id={params.id} />
}
