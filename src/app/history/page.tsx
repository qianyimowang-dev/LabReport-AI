'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/db';
import { Report } from '@/types';
import { 
  Search, 
  Eye, 
  Trash2, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  History,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Data States
  const [reports, setReports] = useState<Report[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      db.getReports(user.id).then((data) => {
        setReports(data);
        setFetching(false);
      });
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (confirm('确定要删除这份实验报告吗？该操作不可撤销。')) {
      const success = await db.deleteReport(id, user.id);
      if (success) {
        setReports(reports.filter(r => r.id !== id));
      } else {
        alert('删除失败，请稍后重试');
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

  // Filtered reports based on search query
  const filteredReports = reports.filter((report) => 
    report.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, startIndex + itemsPerPage);

  // Reset page to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (loading || fetching) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin-custom"></div>
          <p className="text-sm text-muted">加载历史记录...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 flex flex-col">
      
      {/* Title & Count Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center space-x-2">
            <History className="h-6 w-6 text-primary" />
            <span>实验报告历史记录</span>
          </h1>
          <p className="text-sm text-muted">
            共匹配到 {filteredReports.length} 份报告 {searchQuery && `(关键词: "${searchQuery}")`}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-80 shrink-0">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索实验名称..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
          />
        </div>
      </div>

      {/* Reports Table / List */}
      {filteredReports.length === 0 ? (
        <div className="bg-card border border-border border-dashed rounded-2xl p-16 text-center flex flex-col items-center justify-center space-y-4 flex-1">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">没有找到匹配的实验报告</p>
            <p className="text-xs text-muted">
              {searchQuery ? '尝试修改搜索关键词或清除搜索条件' : '您尚未创建任何报告，返回控制台开始生成！'}
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 border border-border hover:bg-accent rounded-xl text-xs font-semibold cursor-pointer"
            >
              清除搜索
            </button>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between space-y-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-accent/30 text-xs font-bold text-muted uppercase tracking-wider">
                    <th className="px-6 py-4">实验名称</th>
                    <th className="px-6 py-4">网络吞吐量</th>
                    <th className="px-6 py-4">往返时延</th>
                    <th className="px-6 py-4">丢包率</th>
                    <th className="px-6 py-4">生成时间</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {paginatedReports.map((report) => (
                    <tr key={report.id} className="hover:bg-accent/20 transition-all">
                      <td className="px-6 py-4">
                        <Link 
                          href={`/reports/${report.id}`} 
                          className="font-semibold text-foreground hover:text-primary hover:underline block max-w-sm truncate"
                        >
                          {report.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-foreground">
                        {report.throughput} Mbps
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-foreground">
                        {report.latency} ms
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-foreground">
                        {report.packet_loss}%
                      </td>
                      <td className="px-6 py-4 text-xs text-muted font-medium">
                        {new Date(report.created_at).toLocaleDateString('zh-CN', {
                          year: 'numeric',
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
                            title="查看详情"
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <span className="text-xs text-muted">
                显示第 {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredReports.length)} 条记录，共 {filteredReports.length} 条
              </span>
              
              <div className="inline-flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-border rounded-xl text-muted hover:text-foreground disabled:opacity-30 transition-all cursor-pointer"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const isCurrent = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer
                        ${isCurrent 
                          ? 'bg-primary border-primary text-primary-foreground' 
                          : 'border-border text-muted hover:bg-accent hover:text-foreground'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-border rounded-xl text-muted hover:text-foreground disabled:opacity-30 transition-all cursor-pointer"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
