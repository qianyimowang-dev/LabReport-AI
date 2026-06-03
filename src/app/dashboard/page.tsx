'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/db';
import { Report } from '@/types';
import { 
  FileText, 
  PlusCircle, 
  ArrowRight, 
  TrendingUp, 
  Zap, 
  Activity, 
  Percent,
  Download,
  Eye,
  Trash2,
  AlertCircle,
  Info
} from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [fetching, setFetching] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    avgLatency: 0,
    avgThroughput: 0,
    avgLoss: 0
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      db.getReports(user.id).then((data) => {
        setReports(data);
        
        // Compute stats
        if (data.length > 0) {
          const total = data.length;
          const sumLatency = data.reduce((acc, r) => acc + Number(r.latency), 0);
          const sumThroughput = data.reduce((acc, r) => acc + Number(r.throughput), 0);
          const sumLoss = data.reduce((acc, r) => acc + Number(r.packet_loss), 0);

          setStats({
            total,
            avgLatency: Number((sumLatency / total).toFixed(1)),
            avgThroughput: Number((sumThroughput / total).toFixed(1)),
            avgLoss: Number((sumLoss / total).toFixed(2))
          });
        }
        setFetching(false);
      });
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (confirm('确定要删除这份实验报告吗？此操作不可逆。')) {
      const success = await db.deleteReport(id, user.id);
      if (success) {
        setReports(reports.filter(r => r.id !== id));
        // Recalculate stats
        const updated = reports.filter(r => r.id !== id);
        if (updated.length > 0) {
          const total = updated.length;
          const sumLatency = updated.reduce((acc, r) => acc + Number(r.latency), 0);
          const sumThroughput = updated.reduce((acc, r) => acc + Number(r.throughput), 0);
          const sumLoss = updated.reduce((acc, r) => acc + Number(r.packet_loss), 0);
          setStats({
            total,
            avgLatency: Number((sumLatency / total).toFixed(1)),
            avgThroughput: Number((sumThroughput / total).toFixed(1)),
            avgLoss: Number((sumLoss / total).toFixed(2))
          });
        } else {
          setStats({ total: 0, avgLatency: 0, avgThroughput: 0, avgLoss: 0 });
        }
      }
    }
  };

  const exportMarkdown = (report: Report) => {
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

  if (loading || fetching) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin-custom"></div>
          <p className="text-sm text-muted">加载控制台数据...</p>
        </div>
      </div>
    );
  }

  const recentReports = reports.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1 flex flex-col">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-primary/5 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              欢迎回来，同学 👋
            </h1>
            <p className="text-sm text-muted max-w-xl">
              使用 LabReport AI，您只需输入底层的网络通信指标（吞吐量、丢包率、延迟），AI 将会自动化为您构建出一份具备专业学术水准的中文实验报告现象、分析及结论。
            </p>
          </div>
          <Link
            href="/reports/create"
            className="inline-flex items-center justify-center space-x-2 bg-primary text-primary-foreground hover:bg-primary-hover px-5 py-3 rounded-xl text-sm font-semibold shadow-md shadow-primary/10 transition-all card-hover cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>创建实验报告</span>
          </Link>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reports */}
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between card-hover">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">总报告数</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-xl text-primary">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        {/* Avg Throughput */}
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between card-hover">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">平均吞吐量</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {stats.total > 0 ? `${stats.avgThroughput} Mbps` : '--'}
            </p>
          </div>
          <div className="bg-amber-500/10 p-3 rounded-xl text-amber-500">
            <Zap className="h-6 w-6" />
          </div>
        </div>

        {/* Avg Latency */}
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between card-hover">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">平均时延</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {stats.total > 0 ? `${stats.avgLatency} ms` : '--'}
            </p>
          </div>
          <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-500">
            <Activity className="h-6 w-6" />
          </div>
        </div>

        {/* Avg Loss */}
        <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between card-hover">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">平均丢包率</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {stats.total > 0 ? `${stats.avgLoss}%` : '--'}
            </p>
          </div>
          <div className="bg-rose-500/10 p-3 rounded-xl text-rose-500">
            <Percent className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Reports Area (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-foreground flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>最近生成的报告</span>
            </h2>
            {reports.length > 5 && (
              <Link href="/history" className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1">
                <span>查看全部历史</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {recentReports.length === 0 ? (
            <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">暂无报告数据</p>
                <p className="text-xs text-muted">点击右上角按钮开始创建您的第一份智能实验报告。</p>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-accent/30 text-xs font-bold text-muted uppercase tracking-wider">
                      <th className="px-6 py-4">实验名称</th>
                      <th className="px-6 py-4">指标参数</th>
                      <th className="px-6 py-4">生成时间</th>
                      <th className="px-6 py-4 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {recentReports.map((report) => (
                      <tr key={report.id} className="hover:bg-accent/20 transition-all">
                        <td className="px-6 py-4 font-semibold text-foreground">
                          <Link href={`/reports/${report.id}`} className="hover:text-primary hover:underline block max-w-[200px] truncate">
                            {report.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-xs space-y-0.5 text-muted font-mono">
                          <div>带宽: {report.throughput} Mbps</div>
                          <div>时延: {report.latency} ms | 丢包: {report.packet_loss}%</div>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted font-medium">
                          {new Date(report.created_at).toLocaleDateString('zh-CN', {
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center space-x-1.5">
                            <Link
                              href={`/reports/${report.id}`}
                              className="p-1.5 rounded-lg border border-border hover:bg-accent text-muted hover:text-foreground transition-all cursor-pointer"
                              title="查看报告"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => exportMarkdown(report)}
                              className="p-1.5 rounded-lg border border-border hover:bg-accent text-primary hover:bg-primary/5 transition-all cursor-pointer"
                              title="导出 Markdown"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(report.id)}
                              className="p-1.5 rounded-lg border border-border hover:bg-error/5 hover:border-error/20 text-error transition-all cursor-pointer"
                              title="删除报告"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Quick Instructions & Card (Right 1 column) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center space-x-2">
            <Info className="h-5 w-5 text-primary" />
            <span>实验报告写作指南</span>
          </h2>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="space-y-3">
              <div className="flex items-start space-x-3 text-sm">
                <div className="bg-primary/10 text-primary h-6 w-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">精准输入实验参数</h3>
                  <p className="text-xs text-muted mt-0.5">
                    请填写您实验中获取的真实的吞吐量（Mbps）、平均单向或双向延迟（ms）以及网络丢包率（%）。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-sm">
                <div className="bg-primary/10 text-primary h-6 w-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">描述实验拓扑与工具</h3>
                  <p className="text-xs text-muted mt-0.5">
                    在描述中注明使用的是何种软件（如 iPerf3, Wireshark）或拓扑情况（如 Mininet, NS3），AI 会结合场景输出。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-sm">
                <div className="bg-primary/10 text-primary h-6 w-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">审查并导出 Markdown</h3>
                  <p className="text-xs text-muted mt-0.5">
                    报告生成后，包含详细的图表化参数，支持一键保存为 Markdown，可以直接贴入您的大学课程大作业中。
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-border pt-4 text-center">
              <p className="text-xs text-muted">
                提示：未绑定云端 Supabase 数据库时，数据保存在本地浏览器中，请定期导出备份。
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
