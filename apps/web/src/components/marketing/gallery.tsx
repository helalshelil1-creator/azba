import Image from 'next/image'
import React from 'react'

type Shot = { file: string; title: string; desc: string; alt: string }

const SHOTS: Shot[] = [
  {
    file: 'aerial-herd',
    title: 'القطيع على المرعى',
    desc: 'لقطة جوية لقطيع يتحرك على مرعى مفتوح. تعداد القطيع وتوزيعه على الحظائر هو أساس أي متابعة.',
    alt: 'لقطة جوية لقطيع ماشية على مرعى أخضر وقت الغروب',
  },
  {
    file: 'buffalo-feeding',
    title: 'تغذية الجاموس',
    desc: 'جاموس عند المعلف في حظيرة مفتوحة. نوع العلف وكميته اليومية يُسجلان لكل حظيرة.',
    alt: 'جاموس عند معلف في حظيرة مفتوحة وقت الغروب',
  },
  {
    file: 'buffalo-barn',
    title: 'ممر عنبر الجاموس',
    desc: 'عنبر مسقوف بممر وسطي ومعالف على الجانبين. تنظيم العنابر والحظائر يسهّل الرعاية والمتابعة.',
    alt: 'عنبر مسقوف فيه جاموس على جانبي ممر وسطي',
  },
  {
    file: 'sheep-cattle-shelter',
    title: 'أغنام وماشية تحت المظلات',
    desc: 'أغنام على العشب وماشية عند المعالف المسقوفة. تنوع القطيع يحتاج سجلات مستقلة لكل نوع.',
    alt: 'أغنام على العشب وماشية عند معالف مسقوفة وقت الغروب',
  },
  {
    file: 'mixed-yard-sunset',
    title: 'حظيرة مختلطة وقت الغروب',
    desc: 'أغنام وماعز وأبقار في ساحة واحدة بمعالف طويلة. الجرد اليومي بحسب النوع والحظيرة.',
    alt: 'ساحة مزرعة فيها أغنام وماعز وأبقار عند المعالف وقت الغروب',
  },
  {
    file: 'mixed-farm-sunset',
    title: 'حيوانات المزرعة',
    desc: 'بقرة وجاموس وماعز ودواجن في مكان واحد. لكل نوع احتياجه من التغذية والرعاية.',
    alt: 'بقرة وجاموس وجدي وفراخ في مزرعة وقت الغروب',
  },
  {
    file: 'barn-open-gate',
    title: 'عنبر بمدخل مفتوح على المرعى',
    desc: 'أبقار وأغنام داخل عنبر واسع التهوية. التهوية والنظافة جزء من متابعة صحة القطيع.',
    alt: 'عنبر واسع فيه أبقار وأغنام وباب مفتوح على مرعى أخضر',
  },
  {
    file: 'sunlit-barn',
    title: 'عنبر مضاء بالشمس',
    desc: 'ماشية على جانبي ممر داخل عنبر مسقوف بإضاءة طبيعية وعلف على الأرض.',
    alt: 'عنبر مسقوف بإضاءة طبيعية فيه ماشية على جانبي الممر',
  },
  {
    file: 'vet-exam',
    title: 'فحص بيطري',
    desc: 'طبيبان بيطريان يفحصان بقرة ويدونان الملاحظات. نتيجة الفحص تدخل في السجل الصحي للحيوان.',
    alt: 'طبيبان بيطريان يفحصان بقرة داخل حظيرة ويدونان ملاحظات',
  },
  {
    file: 'vet-white-coat',
    title: 'متابعة الحالة الصحية',
    desc: 'طبيبة بيطرية تفحص بقرة داخل عنبر. الفحوصات الدورية واللقاحات تُسجَّل وتُراجَع.',
    alt: 'طبيبة بيطرية بالمعطف الأبيض تفحص بقرة داخل عنبر',
  },
  {
    file: 'vets-feed-lane',
    title: 'جولة بيطرية على المعالف',
    desc: 'فريق بيطري يمر على صف المعالف ويراجع حالة الحيوانات واحدًا واحدًا.',
    alt: 'طبيب وطبيبة بيطريان يمشيان في ممر العلف بين صفوف الماشية',
  },
  {
    file: 'vet-tablet-barn',
    title: 'تسجيل البيانات بالتابلت',
    desc: 'طبيبة تسجل بيانات الحيوان على التابلت أثناء الفحص بدل الورق.',
    alt: 'طبيبة بيطرية تستخدم تابلت بجوار بقرة داخل عنبر',
  },
  {
    file: 'ear-tag-scan',
    title: 'قراءة وسم الأذن',
    desc: 'قراءة رقم الوسم بجهاز يدوي ومطابقته ببيانات الحيوان على الهاتف.',
    alt: 'عامل يقرأ وسم أذن بقرة بجهاز يدوي وهاتف يعرض بيانات',
  },
  {
    file: 'night-field-map',
    title: 'متابعة العمل من المكتب',
    desc: 'مراجعة خريطة الأرض على التابلت من مكتب المزرعة مساءً.',
    alt: 'رجل يراجع خريطة حقول على تابلت داخل مكتب مزرعة مساءً',
  },
  {
    file: 'night-dashboard',
    title: 'لوحة مؤشرات',
    desc: 'صورة تعبيرية لمتابعة المؤشرات من التابلت. الأرقام الظاهرة فيها للتوضيح فقط.',
    alt: 'رجل يتابع لوحة مؤشرات على تابلت في حقل ليلاً',
  },
]

export function Gallery() {
  return (
    <section id="gallery" className="section-padding bg-white">
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-primary sm:text-4xl">
            من حياة المزرعة
          </h2>
          <p className="mt-4 text-muted-foreground">
            صور توضيحية للرعاية والتغذية والمتابعة البيطرية وتنظيم العنابر.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SHOTS.map((s, i) => (
            <figure
              key={s.file}
              className="overflow-hidden rounded-2xl border border-border/60 bg-ivory"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={`/images/gallery/${s.file}.jpg`}
                  alt={s.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                  className="object-cover"
                  loading={i < 3 ? 'eager' : 'lazy'}
                />
              </div>
              <figcaption className="p-4">
                <h3 className="font-bold text-primary">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          الصور للتوضيح فقط، ولا تعني أن المزارع أو الأشخاص الظاهرين فيها تابعون لعزبة.
        </p>
      </div>
    </section>
  )
}

export default Gallery
