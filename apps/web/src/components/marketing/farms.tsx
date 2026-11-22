'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Tractor, ArrowLeft, Beaker, Warehouse, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

const FARMS = [
  {
    name: 'مزرعة المنوفية الرئيسية',
    location: 'المنوفية، مصر',
    area: '12 فدان',
    animals: 850,
    pens: 24,
    cover: '/images/farm.jpg',
  },
  {
    name: 'مزرعة البحيرة للألبان',
    location: 'البحيرة، مصر',
    area: '8 فدان',
    animals: 420,
    pens: 18,
    cover: '/images/hay.jpg',
  },
  {
    name: 'مزرعة كفر الشيخ',
    location: 'كفر الشيخ، مصر',
    area: '15 فدان',
    animals: 1100,
    pens: 32,
    cover: '/images/livestock.jpg',
  },
]

export function Farms() {
  return (
    <section className="section-padding bg-ivory">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">مزارعنا</span>
          <h2 className="mt-5 text-3xl font-bold text-primary sm:text-4xl lg:text-5xl">
            أصول حقيقية <span className="text-gradient-gold">على أرض الواقع</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            كل مشروع مرتبط بمزرعة قائمة بعنابرها وحظائرها ومخزونها وعمالها.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {FARMS.map((farm, i) => (
            <motion.div
              key={farm.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="card-hover group overflow-hidden p-0"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={farm.cover}
                  alt={farm.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/85 via-transparent to-transparent" />
                <div className="absolute bottom-4 right-4 left-4">
                  <h3 className="text-lg font-bold text-white">{farm.name}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-ivory/80">
                    <MapPin className="h-3.5 w-3.5 text-gold" />
                    {farm.location}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-x-reverse divide-border/60 p-5 text-center">
                <div>
                  <div className="text-xl font-bold text-primary">{farm.area}</div>
                  <div className="text-[10px] text-muted-foreground">المساحة</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">{farm.animals}</div>
                  <div className="text-[10px] text-muted-foreground">رأس حيوان</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-primary">{farm.pens}</div>
                  <div className="text-[10px] text-muted-foreground">حظيرة</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 grid gap-5 rounded-3xl border border-border/60 bg-white p-8 sm:grid-cols-3">
          {[
            { icon: Tractor, title: 'إدارة المزرعة', desc: 'عنابر، حظائر، أوزان، تغذية، مخزون، صيانة' },
            { icon: Beaker, title: 'إدارة الأعلاف', desc: 'أنواع، موردون، مخزون، وصفات، تكاليف يومية' },
            { icon: ClipboardList, title: 'تتبع بيطري', desc: 'سجل صحي، لقاحات، فحوصات، تقارير معتمدة' },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-primary">{item.title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Farms
