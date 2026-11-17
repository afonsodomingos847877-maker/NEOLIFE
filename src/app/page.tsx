'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { DynamicBanner } from '@/components/ui/DynamicBanner';
import { TypewriterText } from '@/components/ui/TypewriterText';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { saveGateData } from '@/lib/utils/gateUtils';
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
  const [quickName, setQuickName] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickInterest, setQuickInterest] = useState<'saude' | 'business' | 'ambos'>('ambos');
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [quickSuccess, setQuickSuccess] = useState(false);
  const [quickError, setQuickError] = useState('');

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

  const handleQuickLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickError('');
    const trimmedName = quickName.trim();
    const trimmedPhone = quickPhone.trim();

    if (!trimmedName || !trimmedPhone) {
      setQuickError(isPt ? 'Por favor, preencha o seu nome e WhatsApp.' : 'Please enter your name and WhatsApp.');
      return;
    }

    const themeMap: Record<'saude' | 'business' | 'ambos', string> = {
      saude: 'saude',
      business: 'business',
      ambos: 'conheca-neolife',
    };

    const interestLabel =
      quickInterest === 'saude'
        ? (isPt ? 'Saúde & Nutrição' : 'Health & Nutrition')
        : quickInterest === 'business'
        ? (isPt ? 'Negócio / Empreendedorismo' : 'Business / Entrepreneurship')
        : (isPt ? 'Saúde, Negócio & Experiências' : 'Health, Business & Experiences');

    setQuickSubmitting(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: 'mz-pt',
          name: trimmedName,
          phone: trimmedPhone,
          whatsapp: trimmedPhone,
          theme: themeMap[quickInterest],
          source: 'home-quick-lead',
          notes: `Interesse rápido na Home: ${interestLabel}`,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || (isPt ? 'Não foi possível enviar. Tente novamente.' : 'Could not submit. Please try again.'));
      }

      saveGateData({ name: trimmedName, phone: trimmedPhone, country: 'mz-pt' });
      setQuickSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : (isPt ? 'Erro ao enviar.' : 'Submission error.');
      setQuickError(msg);
    } finally {
      setQuickSubmitting(false);
    }
  };

  const quickWhatsappMessage = encodeURIComponent(
    isPt
      ? `Olá! Chamo-me ${quickName || 'visitante'} e tenho interesse em ${
          quickInterest === 'saude' ? 'Saúde & Nutrição' : quickInterest === 'business' ? 'Negócio NeoLife' : 'Saúde e Negócio NeoLife'
        }. Gostaria de receber aconselhamento.`
      : `Hello! My name is ${quickName || 'visitor'} and I'm interested in ${
          quickInterest === 'saude' ? 'Health & Nutrition' : quickInterest === 'business' ? 'NeoLife Business' : 'NeoLife Health & Business'
        }. I would like personalized guidance.`
  );

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
                  <TypewriterText text={isPt ? '1. SAÚDE' : '1. HEALTH'} speed={60} />
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
                  <TypewriterText text="2. BUSINESS" speed={60} />
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
                  <TypewriterText text={isPt ? '3. EXPERIÊNCIAS' : '3. EXPERIENCES'} speed={60} />
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

      {/* ── TRUST & AUTHORITY STRIP ── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-emerald-900/50 bg-[#02150f]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl bg-emerald-950/60 border border-emerald-500/20 p-6 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0 font-black text-sm">
              1958
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">
                {isPt ? 'Ciência NeoLife desde 1958' : 'NeoLife Science Since 1958'}
              </h3>
              <p className="text-xs text-emerald-100/70 mt-1 leading-relaxed">
                {isPt
                  ? 'Mais de 65 anos de nutrição celular com base científica e padrão internacional.'
                  : 'Over 65 years of science-backed cellular nutrition and global quality.'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-950/60 border border-emerald-500/20 p-6 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">
                {isPt ? 'Mentoria Direta' : 'Direct Mentorship'}
              </h3>
              <p className="text-xs text-emerald-100/70 mt-1 leading-relaxed">
                {isPt
                  ? 'Acompanhamento próximo de José Sarmento Machado & Ofélia Alfredo Machado.'
                  : 'Close guidance from José Sarmento Machado & Ofélia Alfredo Machado.'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-emerald-950/60 border border-emerald-500/20 p-6 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-teal-400/15 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wide">
                {isPt ? 'Moçambique & Global' : 'Mozambique & Global'}
              </h3>
              <p className="text-xs text-emerald-100/70 mt-1 leading-relaxed">
                {isPt
                  ? 'Atendimento rápido via WhatsApp e acesso a oportunidades em mais de 50 países.'
                  : 'Fast WhatsApp support and access to opportunities in over 50 countries.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA SECTION (QUICK LEAD CAPTURE ON LIGHT SURFACE) ── */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-t border-emerald-900/60 bg-gradient-to-b from-[#02150f] to-[#010d09]">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-white via-emerald-50 to-teal-50 text-gray-900 p-8 sm:p-12 md:p-14 shadow-[0_25px_70px_-15px_rgba(16,185,129,0.25)] border border-emerald-200/80 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-300/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-300/30 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 mb-4">
              <TypewriterText text={t.cta.readyTitle} speed={40} />
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t.cta.readyText}
            </p>

            {quickSuccess ? (
              <div className="max-w-lg mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-emerald-200 shadow-lg text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-extrabold text-emerald-950 mb-2">
                  {isPt ? 'Contacto Registado com Sucesso!' : 'Contact Registered Successfully!'}
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  {isPt
                    ? 'A nossa equipa recebeu o seu pedido e o acesso aos pilares foi desbloqueado. Clique abaixo para falar agora no WhatsApp:'
                    : 'Our team received your request and pillar access is unlocked. Click below to chat now on WhatsApp:'}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={`https://wa.me/258823056900?text=${quickWhatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto"
                  >
                    <Button size="lg" className="w-full bg-emerald-950 hover:bg-emerald-900 text-white font-bold px-8 shadow-lg">
                      {isPt ? 'Abrir no WhatsApp ➔' : 'Open on WhatsApp ➔'}
                    </Button>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickSuccess(false);
                      setQuickName('');
                      setQuickPhone('');
                    }}
                    className="text-xs font-semibold text-emerald-800 hover:underline px-3 py-2 cursor-pointer"
                  >
                    {isPt ? 'Enviar outro contacto' : 'Send another contact'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleQuickLeadSubmit} className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl p-5 sm:p-7 border border-emerald-200/80 shadow-md text-left">
                {/* Interest selector */}
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-2">
                    {isPt ? 'Qual é o seu principal interesse?' : 'What is your main interest?'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'saude' as const, label: isPt ? 'Saúde' : 'Health' },
                      { id: 'business' as const, label: 'Business' },
                      { id: 'ambos' as const, label: isPt ? 'Ambos' : 'Both' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setQuickInterest(opt.id)}
                        className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                          quickInterest === opt.id
                            ? 'bg-emerald-950 text-white border-emerald-950 shadow-sm'
                            : 'bg-emerald-50/70 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      {isPt ? 'Seu Nome' : 'Your Name'}
                    </label>
                    <input
                      type="text"
                      value={quickName}
                      onChange={(e) => setQuickName(e.target.value)}
                      placeholder={isPt ? 'Ex: Maria Silva' : 'Ex: John Doe'}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={quickPhone}
                      onChange={(e) => setQuickPhone(e.target.value)}
                      placeholder="+258 84 000 0000"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {quickError && (
                  <p className="text-xs font-semibold text-red-600 mb-3">{quickError}</p>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={quickSubmitting}
                    className="w-full sm:flex-1 bg-emerald-950 hover:bg-emerald-900 text-white font-bold px-6 shadow-lg disabled:opacity-60"
                  >
                    {quickSubmitting
                      ? (isPt ? 'A enviar...' : 'Sending...')
                      : (isPt ? 'Receber Atendimento Rápido ➔' : 'Get Quick Guidance ➔')}
                  </Button>
                  <Link href="/formulario?tema=conheca-neolife&pais=mz-pt" className="w-full sm:w-auto">
                    <Button type="button" size="lg" variant="outline" className="w-full border-emerald-700 text-emerald-900 hover:bg-emerald-100 font-bold px-5">
                      {t.cta.fillForm}
                    </Button>
                  </Link>
                </div>
              </form>
            )}

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
