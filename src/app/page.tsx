'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { DynamicBanner } from '@/components/ui/DynamicBanner';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import EventCard from '@/components/EventCard';

interface PillarCardData {
  pillarId: string;
  image: string;
  altText?: string;
}

const DEFAULT_IMAGES: Record<string, string> = {
  saude: '/images/sections/pilar-saude.jpg',
  business: '/images/sections/pilar-business.jpg',
  experiencias: '/images/sections/pilar-experiencias.jpg',
};

export default function Home() {
  const { t, language } = useLanguage();
  const isPt = language === 'pt';
  const [cardImages, setCardImages] = useState<Record<string, string>>(DEFAULT_IMAGES);

  useEffect(() => {
    fetch('/api/pillar-cards')
      .then((r) => r.json())
      .then((data: PillarCardData[]) => {
        if (Array.isArray(data)) {
          const map: Record<string, string> = { ...DEFAULT_IMAGES };
          data.forEach((c) => { if (c.image) map[c.pillarId] = c.image; });
          setCardImages(map);
        }
      })
      .catch(() => {/* use defaults */});
  }, []);

  return (
    <div className="min-h-screen bg-[#02150f] text-white selection:bg-emerald-400 selection:text-emerald-950">
      <DynamicBanner />

      {/* ── HERO SECTION (INVERTED DARK THEME) ── */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Ambient radial glows & subtle grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_60%)] pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-32 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #34d399 1px, transparent 1px), linear-gradient(to bottom, #34d399 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-7 shadow-[0_0_25px_rgba(16,185,129,0.2)] backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t.hero.badge}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-6 leading-[1.12] tracking-tight">
              <TypewriterText text={t.hero.title} speed={50} />
            </h1>

            <p className="text-lg md:text-xl text-emerald-100/75 leading-relaxed max-w-2xl mx-auto mb-9">
              {t.hero.subtitle}
            </p>

            {/* Quick Hero Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#pilares">
                <Button
                  size="lg"
                  className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-extrabold px-8 shadow-[0_10px_30px_rgba(52,211,153,0.25)] transition-all"
                >
                  {isPt ? 'Descobrir os 3 Pilares' : 'Discover the 3 Pillars'} ↓
                </Button>
              </a>
              <Link href="/formulario?tema=conheca-neolife&pais=mz-pt">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-emerald-500/50 text-emerald-200 hover:bg-emerald-900/50 hover:text-white font-semibold px-8 backdrop-blur-sm"
                >
                  {t.cta.fillForm}
                </Button>
              </Link>
            </div>
          </div>

          {/* 3 Pillar Cards (Inverted Polarity: Outer Dark Glass, Center Crisp White) */}
          <div id="pilares" className="grid grid-cols-1 lg:grid-cols-3 gap-7 lg:gap-8 max-w-6xl mx-auto items-stretch">

            {/* ── 1. SAÚDE (Dark Glass Card) ── */}
            <div className="group relative bg-emerald-950/60 backdrop-blur-md rounded-3xl shadow-xl hover:shadow-emerald-500/10 border border-emerald-500/25 hover:border-emerald-400/60 transition-all duration-300 flex flex-col overflow-hidden">
              <div className="relative h-56 overflow-hidden">
                <img
                  src={cardImages.saude}
                  alt="Família saudável e feliz"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#02150f]/20 via-[#031d15]/60 to-[#031d15]" />
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-400/40 backdrop-blur-md flex items-center justify-center text-emerald-300 shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30">
                      {isPt ? 'Nutrição & Vitalidade' : 'Nutrition & Vitality'}
                    </span>
                  </div>
                  <span className="text-3xl font-black text-white/15 select-none">01</span>
                </div>
              </div>

              <div className="flex flex-col flex-1 px-7 pb-7 pt-2 bg-[#031d15]/90">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                  {isPt ? 'Pilar 01' : 'Pillar 01'}
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-3 group-hover:text-emerald-300 transition-colors">
                  {isPt ? '1. SAÚDE' : '1. HEALTH'}
                </h3>
                <blockquote className="text-emerald-100/80 text-sm sm:text-base leading-relaxed mb-6 italic border-l-2 border-emerald-400/70 pl-3.5 flex-1">
                  {isPt
                    ? '"Eleve a forma como você cuida da sua saúde, de dentro para fora, através da nutrição celular."'
                    : '"Elevate how you care for your health, from the inside out, through cellular nutrition."'}
                </blockquote>
                <div className="pt-4 border-t border-emerald-800/60">
                  <Link href="/saude" className="block w-full">
                    <button className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm bg-emerald-400 hover:bg-emerald-300 text-emerald-950 shadow-md hover:shadow-emerald-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <span>{isPt ? 'Explorar Soluções de Saúde' : 'Explore Health Solutions'}</span>
                      <span>➔</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* ── 2. BUSINESS (Inverted Featured Crisp White Card) ── */}
            <div className="group relative bg-white text-emerald-950 rounded-3xl shadow-[0_20px_60px_-15px_rgba(16,185,129,0.35)] border-2 border-emerald-300 hover:border-emerald-400 transition-all duration-300 flex flex-col overflow-hidden lg:-translate-y-4">
              <div className="absolute top-4 right-4 z-20 bg-emerald-950 text-emerald-300 text-xs font-extrabold uppercase px-3.5 py-1 rounded-full tracking-wider shadow-md border border-emerald-500/30">
                {isPt ? 'Empreendedorismo' : 'Entrepreneurship'}
              </div>

              <div className="relative h-56 overflow-hidden">
                <img
                  src={cardImages.business}
                  alt="Empreendedor a trabalhar no computador"
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/35 to-white" />
                <div className="absolute top-4 left-4 flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/95 border border-emerald-200 backdrop-blur-md flex items-center justify-center text-emerald-700 shadow-sm">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/95 text-emerald-900 border border-emerald-200 shadow-sm">
                    {isPt ? 'Negócio Próprio' : 'Own Business'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col flex-1 px-7 pb-7 pt-2">
                <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">
                  {isPt ? 'Pilar 02' : 'Pillar 02'}
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                  2. BUSINESS
                </h3>
                <blockquote className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 italic border-l-2 border-emerald-500 pl-3.5 flex-1">
                  {isPt
                    ? '"Construa uma nova fonte de renda sustentável e transforme o seu negócio em liberdade para escolher como viver."'
                    : '"Build a sustainable income stream and turn your ambition into the freedom to choose how you live."'}
                </blockquote>
                <div className="pt-4 border-t border-gray-100">
                  <Link href="/business" className="block w-full">
                    <button className="w-full py-3.5 px-4 rounded-2xl font-black text-sm bg-emerald-950 hover:bg-emerald-900 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <span>{isPt ? 'Conhecer o Business' : 'Explore Business'}</span>
                      <span>➔</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* ── 3. EXPERIÊNCIAS (Dark Glass Card) ── */}
            <div className="group relative bg-[#031b1a]/75 backdrop-blur-md rounded-3xl shadow-xl hover:shadow-teal-500/10 border border-teal-500/25 hover:border-teal-400/60 transition-all duration-300 flex flex-col overflow-hidden">
              <div className="relative h-56 overflow-hidden">
                <img
                  src={cardImages.experiencias}
                  alt="Casal a viajar pelo mundo"
                  className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#02150f]/20 via-[#031b1a]/60 to-[#031b1a]" />
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-950/80 border border-teal-400/40 backdrop-blur-md flex items-center justify-center text-teal-300 shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-950/80 backdrop-blur-md text-teal-300 border border-teal-500/30">
                      {isPt ? 'Viagens & Lifestyle' : 'Travel & Lifestyle'}
                    </span>
                  </div>
                  <span className="text-3xl font-black text-white/15 select-none">03</span>
                </div>
              </div>

              <div className="flex flex-col flex-1 px-7 pb-7 pt-2 bg-[#031b1a]/90">
                <div className="text-xs font-bold text-teal-400 uppercase tracking-widest mb-1">
                  {isPt ? 'Pilar 03' : 'Pillar 03'}
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-3 group-hover:text-teal-300 transition-colors">
                  {isPt ? '3. EXPERIÊNCIAS' : '3. EXPERIENCES'}
                </h3>
                <blockquote className="text-teal-100/80 text-sm sm:text-base leading-relaxed mb-6 italic border-l-2 border-teal-400/70 pl-3.5 flex-1">
                  {isPt
                    ? '"Expanda os seus horizontes, conheça o mundo e viva experiências únicas de reconhecimento e comunidade."'
                    : '"Expand your horizons, see the world and live unique experiences of recognition and community."'}
                </blockquote>
                <div className="pt-4 border-t border-teal-800/60">
                  <Link href="/experiencias" className="block w-full">
                    <button className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm bg-teal-400 hover:bg-teal-300 text-teal-950 shadow-md hover:shadow-teal-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer">
                      <span>{isPt ? 'Descobrir Experiências' : 'Discover Experiences'}</span>
                      <span>➔</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA SECTION (INVERTED LIGHT SURFACE ON DARK CANVAS) ── */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-t border-emerald-900/60 bg-gradient-to-b from-[#02150f] to-[#010d09]">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-white via-emerald-50 to-teal-50 text-gray-900 p-8 sm:p-12 md:p-16 shadow-[0_25px_70px_-15px_rgba(16,185,129,0.25)] border border-emerald-200/80 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-300/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-300/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 mb-5">
              <TypewriterText text={t.cta.readyTitle} speed={40} />
            </h2>
            <p className="text-lg text-gray-600 mb-9 max-w-2xl mx-auto leading-relaxed">
              {t.cta.readyText}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="https://wa.me/258823056900" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-emerald-950 hover:bg-emerald-900 text-white font-bold px-8 shadow-lg">
                  {t.cta.startNow}
                </Button>
              </a>
              <Link href="/formulario?tema=conheca-neolife&pais=mz-pt">
                <Button size="lg" variant="outline" className="border-emerald-700 text-emerald-900 hover:bg-emerald-100 font-bold px-8">
                  {t.cta.fillForm}
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-gray-500 font-mono">
              {t.cta.directContact}
            </p>
          </div>
        </div>
      </section>

      <EventCard />
    </div>
  );
}
