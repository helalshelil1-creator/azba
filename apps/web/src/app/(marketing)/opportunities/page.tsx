import React from 'react'
import { OpportunitiesClient } from './client'

export const metadata = {
  title: 'فرص الاستثمار',
  description: 'تصفح فرص الاستثمار في الثروة الحيوانية المتاحة على منصة عزبة',
}

export default function OpportunitiesPage() {
  return <OpportunitiesClient />
}
