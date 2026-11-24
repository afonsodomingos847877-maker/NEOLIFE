'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { getCountryById } from '@/data/countries';
import { LeadStatus } from '@/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Link from 'next/link';

type PeriodKey = 'diario' | 'semanal' | 'mensal' | 'mes_atual' | 'anual' | 'personalizado';

interface MongoLead {
  _id: string;
  country: string;
  name: string;
  phone: string;
  email: string;
  theme: string;
  whatsapp?: string;
  source?: string;
  campaign?: string;
  notes?: string;
  status: LeadStatus;
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; badge: string; bar: string }> = {
  novo: { label: 'Novo', badge: 'bg-blue-100 text-blue-800', bar: 'bg-blue-500' },
  contactado: { label: 'Contactado', badge: 'bg-yellow-100 text-yellow-800', bar: 'bg-yellow-500' },
  acompanhamento: { label: 'Acompanhamento', badge: 'bg-purple-100 text-purple-800', bar: 'bg-purple-500' },
  interessado: { label: 'Interessado', badge: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-500' },
  convertido: { label: 'Convertido', badge: 'bg-green-100 text-green-800', bar: 'bg-green-600' },
  nao_interessado: { label: 'Não Interessado', badge: 'bg-red-100 text-red-800', bar: 'bg-red-500' },
};

const PERIOD_OPTIONS: Array<{ key: PeriodKey; label: string; desc: string }> = [
  { key: 'diario', label: 'Diário (Hoje)', desc: 'Leads capturados hoje' },
  { key: 'semanal', label: 'Semanal (7 dias)', desc: 'Últimos 7 dias' },
  { key: 'mensal', label: 'Mensal (30 dias)', desc: 'Últimos 30 dias' },
  { key: 'mes_atual', label: 'Este Mês', desc: 'Desde o dia 1 do mês atual' },
  { key: 'anual', label: 'Anual', desc: 'Desde 1 de Janeiro' },
  { key: 'personalizado', label: 'Personalizado', desc: 'Intervalo de datas' },
];

export default function AdminRelatoriosPage() {
  const [leads, setLeads] = useState<MongoLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodKey>('semanal');

  const todayStr = new Date().toISOString().split('T')[0];
  const weekAgoStr = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [customStart, setCustomStart] = useState(weekAgoStr);
  const [customEnd, setCustomEnd] = useState(todayStr);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/leads');
      if (response.ok) {
        const data = await response.json();
        setLeads(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading leads for report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const dateRange = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    let start = new Date(now);
    start.setHours(0, 0, 0, 0);

    if (period === 'diario') {
      // already today 00:00 -> 23:59
    } else if (period === 'semanal') {
      start = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'mensal') {
      start = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'mes_atual') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    } else if (period === 'anual') {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    } else if (period === 'personalizado') {
      start = customStart ? new Date(`${customStart}T00:00:00`) : new Date(0);
      const parsedEnd = customEnd ? new Date(`${customEnd}T23:59:59.999`) : end;
      return { start, end: parsedEnd };
    }

    return { start, end };
  }, [period, customStart, customEnd]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (!l.createdAt) return false;
      const d = new Date(l.createdAt);
      return d >= dateRange.start && d <= dateRange.end;
    });
  }, [leads, dateRange]);

  const metrics = useMemo(() => {
    const total = filteredLeads.length;
    const byStatus: Record<string, number> = {};
    const byTheme: Record<string, number> = {};
    const byCountry: Record<string, number> = {};

    filteredLeads.forEach((l) => {
      const st = l.status || 'novo';
      byStatus[st] = (byStatus[st] || 0) + 1;

      const th = l.theme || 'geral';
      byTheme[th] = (byTheme[th] || 0) + 1;

      const ct = getCountryById(l.country)?.name || l.country || 'Outro';
      byCountry[ct] = (byCountry[ct] || 0) + 1;
    });

    const novos = byStatus['novo'] || 0;
    const convertidos = byStatus['convertido'] || 0;
    const emAtendimento = (byStatus['contactado'] || 0) + (byStatus['acompanhamento'] || 0) + (byStatus['interessado'] || 0);
    const conversionRate = total > 0 ? ((convertidos / total) * 100).toFixed(1) : '0.0';

    return {
      total,
      novos,
      convertidos,
      emAtendimento,
      conversionRate,
      byStatus,
      byTheme: Object.entries(byTheme).sort((a, b) => b[1] - a[1]),
      byCountry: Object.entries(byCountry).sort((a, b) => b[1] - a[1]),
    };
  }, [filteredLeads]);

  const periodLabel = useMemo(() => {
    const opt = PERIOD_OPTIONS.find((o) => o.key === period);
    return `${opt?.label || 'Relatório'} (${dateRange.start.toLocaleDateString('pt-PT')} - ${dateRange.end.toLocaleDateString('pt-PT')})`;
  }, [period, dateRange]);

  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      alert('Nenhum lead encontrado neste período para exportar.');
      return;
    }

    const headers = ['#', 'Nome', 'Telefone/WhatsApp', 'Email', 'País', 'Tema/Pilar', 'Origem', 'Estado', 'Data'];
    const rows = filteredLeads.map((l, idx) => [
      idx + 1,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.whatsapp || l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.email || '').replace(/"/g, '""')}"`,
      `"${(getCountryById(l.country)?.name || l.country || '').replace(/"/g, '""')}"`,
      `"${(l.theme || '').replace(/"/g, '""')}"`,
      `"${(l.source || '').replace(/"/g, '""')}"`,
      `"${STATUS_META[l.status]?.label || l.status}"`,
      `"${new Date(l.createdAt).toLocaleString('pt-PT')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_neolife_${period}_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (filteredLeads.length === 0) {
      alert('Nenhum lead encontrado neste período para exportar.');
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(16, 185, 129);
    doc.text('Relatório de Desempenho & Leads - NeoLife', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`Período: ${periodLabel}`, 14, 28);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-PT')} ${new Date().toLocaleTimeString('pt-PT')}`, 14, 34);

    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(
      `Total: ${metrics.total}   |   Novos: ${metrics.novos}   |   Em Atendimento: ${metrics.emAtendimento}   |   Convertidos: ${metrics.convertidos} (${metrics.conversionRate}%)`,
      14,
      42
    );

    const tableData = filteredLeads.map((l, idx) => [
      idx + 1,
      l.name || '',
      l.whatsapp || l.phone || '',
      l.email || '-',
      getCountryById(l.country)?.name || l.country || '',
      l.theme || '-',
      STATUS_META[l.status]?.label || l.status,
      new Date(l.createdAt).toLocaleDateString('pt-PT'),
    ]);

    autoTable(doc, {
      head: [['#', 'Nome', 'WhatsApp/Tel', 'Email', 'País', 'Tema', 'Estado', 'Data']],
      body: tableData,
      startY: 48,
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [6, 95, 70], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 250, 248] },
    });

    const pageCount = doc.internal.pages.length - 1;
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `NeoLife África & Global · Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`relatorio_neolife_${period}_${todayStr}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        title="Relatórios & Análises"
        showRefresh={true}
        isRefreshing={loading}
        onRefresh={loadLeads}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Bar: Period Selector & Export */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-gray-900">Relatórios de Leads</h1>
                <p className="text-xs text-gray-500 mt-0.5">{periodLabel}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportToCSV}
                  className="border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-bold"
                >
                  Exportar CSV
                </Button>
                <Button
                  size="sm"
                  onClick={exportToPDF}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  Baixar PDF
                </Button>
                <Link href="/admin/leads">
                  <Button size="sm" variant="outline" className="text-gray-700">
                    Gerir Leads ➔
                  </Button>
                </Link>
              </div>
            </div>

            {/* Period Pills */}
            <div className="flex flex-wrap gap-2 mt-5">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setPeriod(opt.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    period === opt.key
                      ? 'bg-emerald-950 text-white border-emerald-950 shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50 hover:border-emerald-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Custom Date Range */}
            {period === 'personalizado' && (
              <div className="flex flex-wrap items-end gap-4 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Data Início</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white text-gray-900"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-emerald-600 shadow-sm">
            <CardHeader className="pb-1">
              <p className="text-xs font-bold uppercase text-gray-500">Total no Período</p>
              <p className="text-3xl font-black text-gray-900">{loading ? '...' : metrics.total}</p>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-emerald-700 font-medium">
              Leads registados
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="pb-1">
              <p className="text-xs font-bold uppercase text-gray-500">Novos (Aguardar)</p>
              <p className="text-3xl font-black text-gray-900">{loading ? '...' : metrics.novos}</p>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-blue-700 font-medium">
              Ainda sem contacto
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-sm">
            <CardHeader className="pb-1">
              <p className="text-xs font-bold uppercase text-gray-500">Em Atendimento</p>
              <p className="text-3xl font-black text-gray-900">{loading ? '...' : metrics.emAtendimento}</p>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-purple-700 font-medium">
              Contactados / Interessados
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600 shadow-sm">
            <CardHeader className="pb-1">
              <p className="text-xs font-bold uppercase text-gray-500">Convertidos</p>
              <p className="text-3xl font-black text-gray-900">{loading ? '...' : metrics.convertidos}</p>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-green-700 font-semibold">
              Taxa de conversão: {metrics.conversionRate}%
            </CardContent>
          </Card>
        </div>

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Por Estado */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Por Estado</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(STATUS_META).map(([key, meta]) => {
                const count = metrics.byStatus[key] || 0;
                const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                      <span>{meta.label}</span>
                      <span>{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${meta.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Por Pilar / Tema */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Por Pilar / Tema</h2>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {metrics.byTheme.length === 0 ? (
                <p className="text-xs text-gray-400">Sem dados neste período.</p>
              ) : (
                metrics.byTheme.slice(0, 6).map(([themeName, count]) => (
                  <div key={themeName} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100 last:border-0">
                    <span className="font-semibold text-gray-700 truncate pr-2">{themeName}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Por País */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Por País</h2>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {metrics.byCountry.length === 0 ? (
                <p className="text-xs text-gray-400">Sem dados neste período.</p>
              ) : (
                metrics.byCountry.slice(0, 6).map(([countryName, count]) => (
                  <div key={countryName} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-100 last:border-0">
                    <span className="font-semibold text-gray-700 truncate pr-2">{countryName}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">{count}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Leads Table for Period */}
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-gray-100">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
              Detalhes dos Leads ({filteredLeads.length})
            </h2>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 uppercase font-bold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">WhatsApp / Tel</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">País</th>
                  <th className="px-4 py-3">Tema</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      A carregar leads...
                    </td>
                  </tr>
                ) : filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      Nenhum lead capturado neste período.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((l) => {
                    const meta = STATUS_META[l.status] || STATUS_META.novo;
                    return (
                      <tr key={l._id} className="hover:bg-gray-50/80">
                        <td className="px-4 py-3 font-bold text-gray-900">{l.name}</td>
                        <td className="px-4 py-3 text-gray-700">{l.whatsapp || l.phone || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{l.email || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {getCountryById(l.country)?.name || l.country}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{l.theme}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${meta.badge}`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(l.createdAt).toLocaleDateString('pt-PT')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
