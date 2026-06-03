'use client';

import React, { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/db';
import { Report } from '@/types';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Download, 
  Save, 
  X,
  Gauge,
  Clock,
  Network,
  FileText,
  Activity,
  Award,
  BookOpen
} from 'lucide-react';

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();

  // Data States
  const [report, setReport] = useState<Report | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  // Editing States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editThroughput, setEditThroughput] = useState<number>(0);
  const [editLatency, setEditLatency] = useState<number>(0);
  const [editPacketLoss, setEditPacketLoss] = useState<number>(0);
  const [editDesc, setEditDesc] = useState('');
  const [editObs, setEditObs] = useState('');
  const [editAna, setEditAna] = useState('');
  const [editCon, setEditCon] = useState('');
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && id) {
      db.getReportById(id, user.id).then((data) => {
        if (data) {
          setReport(data);
          // populate edit states
          setEditTitle(data.title);
          setEditThroughput(data.throughput);
          setEditLatency(data.latency);
          setEditPacketLoss(data.packet_loss);
          setEditDesc(data.experiment_description || '');
          setEditObs(data.generated_observation || '');
          setEditAna(data.generated_analysis || '');
          setEditCon(data.generated_conclusion || '');
        } else {
          setError('实验报告不存在或您无权查看此报告');
        }
        setFetching(false);
      });
    }
  }, [user, id]);

  const handleDelete = async () => {
    if (!user || !report) return;
    if (confirm('确定要删除这份实验报告吗？该操作不可撤销。')) {
      const success = await db.deleteReport(report.id, user.id);
      if (success) {
        router.push('/dashboard');
      } else {
        alert('删除失败，请稍后重试');
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!user || !report) return;
    if (!editTitle.trim()) {
      alert('实验标题不能为空');
      return;
    }

    try {
      setSaving(true);
      const updated = await db.updateReport(report.id, {
        title: editTitle,
        throughput: Number(editThroughput),
        latency: Number(editLatency),
        packet_loss: Number(editPacketLoss),
        experiment_description: editDesc,
        generated_observation: editObs,
        generated_analysis: editAna,
        generated_conclusion: editCon
      }, user.id);

      setReport(updated);
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || '保存修改失败');
    } finally {
      setSaving(false);
    }
  };

  const exportMarkdown = () => {
    if (!report) return;
    const content = `# 实验报告：${report.title}

## 一、 实验数据参数
- **吞吐量 (Throughput)**: ${report.throughput} Mbps
- **时延 (Latency)**: ${report.latency} ms
- **丢包率 (Packet Loss)**: ${report.packet_loss}%
- **实验背景描述**: ${report.experiment_description || '无'}

## 二、 实验现象 (Observation)
${report.generated_observation}

## 三、 结果分析 (Analysis)
${report.generated_analysis}

## 四、 实验结论 (Conclusion)
${report.generated_conclusion}
`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `report-${report.id}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Safe client-side markdown bold parser
  const renderText = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((para, i) => {
      const trimmed = para.trim();
      if (!trimmed) return <div key={i} className="h-4" />;
      
      const isListItem = trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed);
      
      const parts = para.split(/(\*\*.*?\*\*)/g);
      const content = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j} className="font-extrabold text-foreground">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isListItem) {
        return (
          <p key={i} className="pl-4 border-l-2 border-primary/20 text-sm leading-relaxed text-foreground my-2.5 font-sans">
            {content}
          </p>
        );
      }
      
      return (
        <p key={i} className="text-sm leading-relaxed text-foreground my-2.5 text-justify font-sans">
          {content}
        </p>
      );
    });
  };

  if (loading || fetching) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin-custom"></div>
          <p className="text-sm text-muted">读取报告内容...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 flex-1 flex flex-col justify-center">
        <div className="bg-error/10 border border-error/20 p-6 rounded-2xl text-error">
          <h2 className="text-lg font-bold mb-2">出错了</h2>
          <p className="text-sm">{error || '无法获取实验报告。'}</p>
        </div>
        <Link href="/dashboard" className="text-primary hover:underline text-sm font-semibold">
          返回控制台仪表盘
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 flex flex-col">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link 
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-muted hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>返回控制台</span>
        </Link>

        {/* Action button triggers */}
        {!isEditing ? (
          <div className="inline-flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-1.5 px-4 py-2 border border-border bg-card hover:bg-accent rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              <Edit3 className="h-4 w-4" />
              <span>编辑报告</span>
            </button>
            <button
              onClick={exportMarkdown}
              className="flex items-center space-x-1.5 px-4 py-2 border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>导出 Markdown</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-1.5 px-4 py-2 border border-error/20 hover:bg-error/10 text-error rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              <span>删除</span>
            </button>
          </div>
        ) : (
          <div className="inline-flex items-center space-x-2 shrink-0">
            <button
              onClick={handleSaveEdit}
              disabled={saving}
              className="flex items-center space-x-1.5 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary-hover rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin-custom"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>保存修改</span>
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                // reset edits
                setEditTitle(report.title);
                setEditThroughput(report.throughput);
                setEditLatency(report.latency);
                setEditPacketLoss(report.packet_loss);
                setEditDesc(report.experiment_description || '');
                setEditObs(report.generated_observation || '');
                setEditAna(report.generated_analysis || '');
                setEditCon(report.generated_conclusion || '');
              }}
              className="flex items-center space-x-1.5 px-4 py-2 border border-border hover:bg-accent rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span>取消</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Body */}
      {isEditing ? (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-foreground">编辑报告内容</h2>
          
          <div className="space-y-4">
            {/* Title edit */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                报告标题
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              />
            </div>

            {/* Metrics edit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  丢包率 (%)
                </label>
                <input
                  type="number"
                  step="any"
                  value={editPacketLoss}
                  onChange={(e) => setEditPacketLoss(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  延迟 (ms)
                </label>
                <input
                  type="number"
                  step="any"
                  value={editLatency}
                  onChange={(e) => setEditLatency(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                  吞吐量 (Mbps)
                </label>
                <input
                  type="number"
                  step="any"
                  value={editThroughput}
                  onChange={(e) => setEditThroughput(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                />
              </div>
            </div>

            {/* Description edit */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                背景描述
              </label>
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-sans"
              />
            </div>

            {/* Obs edit */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                实验现象 (Observation)
              </label>
              <textarea
                value={editObs}
                onChange={(e) => setEditObs(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-sans text-justify"
              />
            </div>

            {/* Ana edit */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                结果分析 (Analysis)
              </label>
              <textarea
                value={editAna}
                onChange={(e) => setEditAna(e.target.value)}
                rows={8}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-sans text-justify"
              />
            </div>

            {/* Con edit */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
                实验结论 (Conclusion)
              </label>
              <textarea
                value={editCon}
                onChange={(e) => setEditCon(e.target.value)}
                rows={6}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-sans text-justify"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Header Card */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="space-y-2">
              <span className="inline-flex bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold font-sans">
                实验报告
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {report.title}
              </h1>
            </div>

            {/* Params indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 border-t border-b border-border py-4">
              <div className="flex items-center space-x-3">
                <div className="bg-amber-500/10 text-amber-500 p-2.5 rounded-xl">
                  <Gauge className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-muted uppercase tracking-wider">吞吐量</span>
                  <span className="text-sm font-bold text-foreground">{report.throughput} Mbps</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-emerald-500/10 text-emerald-500 p-2.5 rounded-xl">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-muted uppercase tracking-wider">网络延迟</span>
                  <span className="text-sm font-bold text-foreground">{report.latency} ms</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-rose-500/10 text-rose-500 p-2.5 rounded-xl">
                  <Network className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-muted uppercase tracking-wider">丢包率</span>
                  <span className="text-sm font-bold text-foreground">{report.packet_loss}%</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-purple-500/10 text-purple-500 p-2.5 rounded-xl">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[11px] font-semibold text-muted uppercase tracking-wider">生成时间</span>
                  <span className="text-xs font-semibold text-foreground">
                    {new Date(report.created_at).toLocaleDateString('zh-CN', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Description Paragraph */}
            {report.experiment_description && (
              <div className="space-y-1">
                <span className="block text-xs font-semibold text-muted uppercase tracking-wider">实验背景描述</span>
                <p className="text-sm text-foreground/80 leading-relaxed font-sans text-justify">
                  {report.experiment_description}
                </p>
              </div>
            )}
          </div>

          {/* Section 1: Observation */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center space-x-2 border-b border-border pb-3">
              <Activity className="h-5 w-5 text-primary" />
              <span>一、 实验现象 (Observation)</span>
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed">
              {renderText(report.generated_observation || '无生成内容')}
            </div>
          </div>

          {/* Section 2: Analysis */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center space-x-2 border-b border-border pb-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>二、 结果分析 (Analysis)</span>
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed">
              {renderText(report.generated_analysis || '无生成内容')}
            </div>
          </div>

          {/* Section 3: Conclusion */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-foreground flex items-center space-x-2 border-b border-border pb-3">
              <Award className="h-5 w-5 text-primary" />
              <span>三、 实验结论 (Conclusion)</span>
            </h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed">
              {renderText(report.generated_conclusion || '无生成内容')}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
