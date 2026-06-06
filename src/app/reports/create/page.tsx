'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/db';
import { 
  ArrowLeft, 
  Sparkles, 
  HelpCircle, 
  Network,
  Cpu,
  Clock,
  Gauge,
  BookOpen
} from 'lucide-react';

export default function CreateReportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Form States
  const [title, setTitle] = useState('');
  const [packetLoss, setPacketLoss] = useState<number | ''>('');
  const [latency, setLatency] = useState<number | ''>('');
  const [throughput, setThroughput] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  
  // UX States
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');

  // Loading sub-messages rotation for rich user experience
  const loadingSteps = [
    'AI 正在读取网络测量参数...',
    'AI 正在根据丢包率与时延计算理论吞吐量上限 (Mathis 拥塞控制模型)...',
    'AI 正在根据经典时延带宽积 (BDP) 分析滑动窗口容量...',
    'AI 正在撰写实验现象 (Observation) 章节，分析 TCP Duplicate ACK 状态...',
    'AI 正在撰写结果分析 (Analysis) 章节，解剖拥塞窗口退避行为与吞吐衰退量化分析...',
    'AI 正在生成最终结论并配置针对性的长肥管道 (LFN) 调优建议...'
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Loading steps animation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (generating) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [generating, loadingSteps.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) return;
    if (!title.trim()) {
      setError('请输入实验名称');
      return;
    }
    if (packetLoss === '' || packetLoss < 0 || packetLoss > 100) {
      setError('请输入合法的丢包率 (0 - 100%)');
      return;
    }
    if (latency === '' || latency < 0) {
      setError('请输入合法的网络延迟 (>= 0)');
      return;
    }
    if (throughput === '' || throughput < 0) {
      setError('请输入合法的吞吐量 (>= 0)');
      return;
    }

    try {
      setGenerating(true);
      
      // 1. Call AI Generation endpoint
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          packet_loss: Number(packetLoss),
          latency: Number(latency),
          throughput: Number(throughput),
          experiment_description: description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'AI 报告生成失败');
      }

      const generatedData = await response.json();

      // 2. Save in database
      const savedReport = await db.createReport({
        title,
        packet_loss: Number(packetLoss),
        latency: Number(latency),
        throughput: Number(throughput),
        experiment_description: description,
        generated_observation: generatedData.observation,
        generated_analysis: generatedData.analysis,
        generated_conclusion: generatedData.conclusion,
      }, user.id);

      router.push(`/reports/${savedReport.id}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '系统繁忙，生成失败，请稍后重试');
      setGenerating(false);
    }
  };

  // Preset templates
  const applyTemplate = (type: 'tcp' | 'wifi' | 'optical') => {
    if (type === 'tcp') {
      setTitle('TCP 拥塞控制与窗口机制实验');
      setPacketLoss(0.5);
      setLatency(20);
      setThroughput(450);
      setDescription('使用 Mininet 构建单瓶颈链路拓扑，瓶颈带宽为 500Mbps。在瓶颈链路配置 0.5% 丢包率及 20ms 双向传播时延，启动 iPerf3 发送 TCP BBR 拥塞流并持续 60 秒，分析吞吐量表现。');
    } else if (type === 'wifi') {
      setTitle('802.11ac Wi-Fi 信道衰减与重传率测试');
      setPacketLoss(2.8);
      setLatency(15);
      setThroughput(110);
      setDescription('在实验室屏蔽房环境，设置 802.11ac AP 工作在 5GHz (80MHz信道)。改变测试节点与 AP 之间的物理距离和障碍物阻挡，利用 Wireshark 抓包监控数据链路层 MAC 重传，测量信道恶化对实际有效应用层吞吐量的衰退关系。');
    } else if (type === 'optical') {
      setTitle('光纤骨干网长肥管道 (LFN) 传输特性分析');
      setPacketLoss(0.01);
      setLatency(120);
      setThroughput(950);
      setDescription('模拟跨国洲际光纤链路（时延 120ms，瓶颈带宽 1Gbps）。分别测试传统 TCP Cubic 算法与新兴 TCP BBR 算法在千分之一丢包率及长时延窗口下的滑动窗口变化情况，探索 BBR 在避免长肥管道带宽搁置方面的优势。');
    }
  };

  if (generating) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg bg-card border border-border rounded-3xl p-8 shadow-xl text-center space-y-6 animate-pulse">
          <div className="mx-auto bg-primary/10 text-primary h-16 w-16 rounded-full flex items-center justify-center animate-spin-custom" style={{ animationDuration: '3s' }}>
            <Sparkles className="h-8 w-8" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">AI 智能报告内容生成中</h2>
            <p className="text-sm font-semibold text-primary font-mono transition-all duration-300">
              {loadingSteps[loadingStep]}
            </p>
            <p className="text-xs text-muted max-w-xs mx-auto">
              我们将为你生成完整的“实验现象”、“结果分析”及“实验结论”三个核心章节，这通常需要 3 至 8 秒钟。
            </p>
          </div>

          {/* Simple progress bar */}
          <div className="w-full bg-accent rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500" 
              style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 flex flex-col">
      {/* Navigation Top */}
      <div className="flex items-center space-x-2">
        <Link 
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium text-muted hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>返回控制台</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Form Container (Left 2/3) */}
        <div className="flex-1 w-full bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              创建实验报告
            </h1>
            <p className="text-sm text-muted">
              请录入底层测试数据参数，AI 将基于学术报告格式生成专业的长文本内容。
            </p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 text-error p-4 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                实验名称 / 报告标题
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：TCP 滑动窗口与拥塞避免算法实验"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
              />
            </div>

            {/* Parameter Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Packet Loss */}
              <div className="space-y-2">
                <label className="flex items-center text-xs font-semibold text-muted uppercase tracking-wider">
                  <Network className="h-3.5 w-3.5 mr-1 text-primary" />
                  <span>丢包率 (%)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={packetLoss}
                  onChange={(e) => setPacketLoss(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0.5"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                />
              </div>

              {/* Latency */}
              <div className="space-y-2">
                <label className="flex items-center text-xs font-semibold text-muted uppercase tracking-wider">
                  <Clock className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                  <span>双向延迟 (ms)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={latency}
                  onChange={(e) => setLatency(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="25"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                />
              </div>

              {/* Throughput */}
              <div className="space-y-2">
                <label className="flex items-center text-xs font-semibold text-muted uppercase tracking-wider">
                  <Gauge className="h-3.5 w-3.5 mr-1 text-amber-500" />
                  <span>吞吐量 (Mbps)</span>
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={throughput}
                  onChange={(e) => setThroughput(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="280"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                <BookOpen className="h-3.5 w-3.5 mr-1 text-purple-500" />
                <span>实验环境与步骤描述 (可选)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="描述您的实验拓扑、采用的网络流量测试软件或具体的步骤。例如：使用 NS3 网络模拟器构建包含瓶颈节点的哑铃型拓扑，使用 TCP Cubic 流作为背景流量..."
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground resize-y font-sans"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 border-t border-border pt-6">
              <Link 
                href="/dashboard"
                className="px-4 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-accent text-muted hover:text-foreground transition-all"
              >
                取消
              </Link>
              <button
                type="submit"
                className="inline-flex items-center space-x-2 bg-primary text-primary-foreground hover:bg-primary-hover px-6 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-primary/10 transition-all card-hover cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>生成 AI 实验报告</span>
              </button>
            </div>

          </form>
        </div>

        {/* Sidebar Templates (Right 1/3) */}
        <div className="w-full md:w-80 space-y-4">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider flex items-center space-x-2">
            <Cpu className="h-4 w-4 text-primary" />
            <span>实验快速模板</span>
          </h2>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
            <p className="text-xs text-muted">
              没有准备好的实验数据？点击下方学术模板，即可自动填入经典的计算机网络测试数据：
            </p>

            <button
              onClick={() => applyTemplate('tcp')}
              className="w-full text-left p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all space-y-1 cursor-pointer"
            >
              <h3 className="text-xs font-bold text-foreground">1. TCP 窗口拥塞控制</h3>
              <p className="text-[11px] text-muted line-clamp-2">
                0.5% 丢包率, 20ms 延迟, 450Mbps 吞吐量。基于 Mininet 的经典拓扑测试。
              </p>
            </button>

            <button
              onClick={() => applyTemplate('wifi')}
              className="w-full text-left p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all space-y-1 cursor-pointer"
            >
              <h3 className="text-xs font-bold text-foreground">2. Wi-Fi MAC 层重传测试</h3>
              <p className="text-[11px] text-muted line-clamp-2">
                2.8% 丢包率, 15ms 延迟, 110Mbps 吞吐量。5GHz 信道下的衰减与吞吐衰退分析。
              </p>
            </button>

            <button
              onClick={() => applyTemplate('optical')}
              className="w-full text-left p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all space-y-1 cursor-pointer"
            >
              <h3 className="text-xs font-bold text-foreground">3. 跨国光纤长肥管道 (LFN)</h3>
              <p className="text-[11px] text-muted line-clamp-2">
                0.01% 丢包率, 120ms 延迟, 950Mbps 吞吐量。TCP Cubic 与 BBR 算法在长肥管道的性能对比。
              </p>
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 flex items-start space-x-2.5 text-xs text-muted leading-relaxed">
            <HelpCircle className="h-4 w-4 shrink-0 text-muted mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-foreground">参数校验规则</span>
              <p>
                - 丢包率在 0 到 100% 之间。<br />
                - 时延与吞吐量值必须大于等于 0。<br />
                - 填写准确的环境有助于 AI 输出定制化的分析算法（如 CUBIC, Reno 等）。
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
