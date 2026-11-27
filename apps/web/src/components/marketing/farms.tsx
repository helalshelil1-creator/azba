'use client'

import Image from 'next/image'
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Tractor, ArrowLeft, Beaker, Warehouse, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLang, tx } from '@/lib/lang-store'

const FARMS = [
  {
    name: 'مزرعة المنوفية الرئيسية',
    nameEn: 'Menoufia Main Farm',
    location: 'المنوفية، مصر',
    locationEn: 'Menoufia, Egypt',
    area: '12 فدان',
    areaEn: '12 feddan',
    animals: 850,
    pens: 24,
    cover: '/images/farm.jpg',
  },
  {
    name: 'مزرعة البحيرة للألبان',
    nameEn: 'Beheira Dairy Farm',
    location: 'البحيرة، مصر',
    locationEn: 'Beheira, Egypt',
    area: '8 فدان',
    areaEn: '8 feddan',
    animals: 420,
    pens: 18,
    cover: '/images/hay.jpg',
  },
  {
    name: 'مزرعة كفر الشيخ',
    nameEn: 'Kafr El-Sheikh Farm',
    location: 'كفر الشيخ، مصر',
    locationEn: 'Kafr El-Sheikh, Egypt',
    area: '15 فدان',
    areaEn: '15 feddan',
    animals: 1100,
    pens: 32,
    cover: '/images/livestock.jpg',
  },
]

export function Farms() {
  const { lang } = useLang()
  return (
    <section className="section-padding bg-ivory">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">{tx(lang, 'مزارعنا', 'Our farms')}</span>
          <h2 className="mt-5 text-3xl font-bold text-primary sm:text-4xl lg:text-5xl">
            {lang === 'ar' ? (
              <>أصول حقيقية <span className="text-gradient-gold">على أرض الواقع</span></>
            ) : (
              <>Real assets <span className="text-gradient-gold">on the ground</span></>
            )}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {tx(lang, 'كل مشروع مرتبط بمزرعة قائمة بعنابرها وحظائرها ومخزونها وعمالها.', 'Every project is tied to an existing farm with its barns, pens, inventory, and workers.')}
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
                <Image
                  src={farm.cover}
                  alt={farm.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 640px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/85 via-transparent to-transparent" />
                <div className="absolute bottom-4 right-4 left-4">
                  <h3 className="text-lg font-bold text-white">{lang === 'ar' ? farm.name : farm.nameEn}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-ivory/80">
                    <MapPin className="h-3.5 w-3.5 text-gold" />
                    {lang === 'ar' ? farm.location : farm.locationEn}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-x-reverse divide-border/60 p-4 text-center sm:p-5">
                <div>
                  <div className="text-base font-bold text-primary sm:text-xl">{lang === 'ar' ? farm.area : farm.areaEn}</div>
                  <div className="text-[10px] text-muted-foreground">{tx(lang, 'المساحة', 'Area')}</div>
                </div>
                <div>
                  <div className="text-base font-bold text-primary sm:text-xl">{farm.animals}</div>
                  <div className="text-[10px] text-muted-foreground">{tx(lang, 'رأس حيوان', 'Head of livestock')}</div>
                </div>
                <div>
                  <div className="text-base font-bold text-primary sm:text-xl">{farm.pens}</div>
                  <div className="text-[10px] text-muted-foreground">{tx(lang, 'حظيرة', 'Pens')}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 grid gap-5 rounded-3xl border border-border/60 bg-white p-8 sm:grid-cols-3">
          {[
            { icon: Tractor, title: tx(lang, 'إدارة المزرعة', 'Farm management'), desc: tx(lang, 'عنابر، حظائر، أوزان، تغذية، مخزون، صيانة', 'Barns, pens, weights, feeding, inventory, maintenance') },
            { icon: Beaker, title: tx(lang, 'إدارة الأعلاف', 'Feed management'), desc: tx(lang, 'أنواع، موردون، مخزون، وصفات، تكاليف يومية', 'Types, suppliers, inventory, recipes, daily costs') },
            { icon: ClipboardList, title: tx(lang, 'تتبع بيطري', 'Veterinary tracking'), desc: tx(lang, 'سجل صحي، لقاحات، فحوصات، تقارير معتمدة', 'Health records, vaccinations, checkups, certified reports') },
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
