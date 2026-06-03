export interface GenerateRequest {
  title: string;
  packet_loss: number;
  latency: number;
  throughput: number;
  experiment_description: string;
}

export interface GenerateResponse {
  observation: string;
  analysis: string;
  conclusion: string;
}

// Local mock template-based generator
function generateMockReport(req: GenerateRequest): GenerateResponse {
  const { title, packet_loss, latency, throughput, experiment_description } = req;
  
  // Decide severity levels based on metrics
  const isLossHigh = packet_loss > 1.5;
  const isLatencyHigh = latency > 40;
  const isThroughputLow = throughput < 80;

  let lossAnalysis = '';
  if (isLossHigh) {
    lossAnalysis = `在此丢包率（${packet_loss}%）下，网络中出现了明显的TCP包丢失。由于TCP使用拥塞控制机制（如快速重传和拥塞避免），丢包会导致拥塞窗口（cwnd）减半或直接降为初始值，触发频繁的超时重传，严重恶化了传输效率。`;
  } else {
    lossAnalysis = `丢包率控制在较低水平（${packet_loss}%），表明信道物理质量良好，重传开销微乎其微。这有利于TCP滑动窗口稳定地保持在最大拥塞窗口大小，避免了进入快速恢复或慢启动状态。`;
  }

  let latencyAnalysis = '';
  if (isLatencyHigh) {
    latencyAnalysis = `实验中观测到的平均延迟为 ${latency} ms，这代表往返时间（RTT）较长。RTT的增加会直接导致TCP发送端确认包（ACK）接收变慢，从而延缓了拥塞窗口的增长速度（拥塞窗口在每收到一个ACK时增长）。在高延迟环境下，即使带宽充裕，TCP连接也需要更长的时间才能达到最大传输速率。`;
  } else {
    latencyAnalysis = `网络往返延迟仅为 ${latency} ms，表现非常优异。较短的往返时间（RTT）使得ACK确认能够迅速返回发送端，TCP拥塞窗口得以在极短的时间内快速扩张，使得系统可以非常敏捷地响应网络容量变化。`;
  }

  let throughputAnalysis = '';
  if (isThroughputLow) {
    throughputAnalysis = `实际吞吐量仅为 ${throughput} Mbps，远低于千兆以太网的理论上限。这主要是由高延迟（${latency} ms）和丢包率（${packet_loss}%）共同引起的。在高时延和丢包的交互作用下，TCP发送方的滑动窗口难以打满，信道利用率（吞吐量/带宽）低下。`;
  } else {
    throughputAnalysis = `系统达到了 ${throughput} Mbps 的高吞吐量，信道利用率优秀。这得益于优异的丢包控制（${packet_loss}%）以及低延迟（${latency} ms），使得数据报文能以高密度、连续不断地通过网络瓶颈链路。`;
  }

  const observation = `在本实验“${title}”中，测试环境描述为“${experiment_description || '默认网络性能测试'}”。在运行网络测试工具（如 iPerf/Ping）期间，实验平台实时监控并记录了关键传输性能指标。
具体实验现象如下：
1. 报文传输状态：发送端持续向接收端发送测试数据，在丢包率为 ${packet_loss}% 时，控制台输出中伴随有零星的“Duplicate ACK”和“TCP Retransmission”警告。
2. 时延监测：网络往返延迟稳定在 ${latency} ms 左右，未出现大幅度的抖动或排队延迟飙升。
3. 带宽占用：在测试周期内，吞吐量曲线在起伏后趋于平稳，平均吞吐量维持在 ${throughput} Mbps。`;

  const analysis = `针对本实验测得的数据（吞吐量：${throughput} Mbps，延迟：${latency} ms，丢包率：${packet_loss}%）进行深入分析：
首先，${lossAnalysis}
其次，${latencyAnalysis}
此外，${throughputAnalysis}
综合来看，该网络的物理链路瓶颈主要体现在${isLossHigh ? '信道丢包' : ''}${isLossHigh && isLatencyHigh ? '与' : ''}${isLatencyHigh ? '传输时延' : ''}${!isLossHigh && !isLatencyHigh ? '带宽上限' : ''}上。这符合TCP协议中吞吐量与RTT成反比、与丢包率的平方根成反比的经典数学模型（Mathis公式）。`;

  const conclusion = `通过对“${title}”实验数据的分析，得出以下主要结论：
1. 网络性能评估：本组实验网络表现为“${isLossHigh || isLatencyHigh ? '受限型网络' : '高效能网络'}”。在高丢包或高延迟下，TCP协议的传输效能受到极大抑制。
2. 拥塞控制验证：实验现象完美验证了TCP的滑动窗口与拥塞控制机制。任何轻微的包丢失都会被TCP误判为网络拥塞，从而启动窗口退避策略，降低吞吐量。
3. 优化建议：为提升当前网络的吞吐量，建议在物理层提高信道抗干扰能力以降低丢包率（当前为 ${packet_loss}%）；对于高延迟（${latency} ms）链路，可以考虑启用TCP BBR等现代拥塞控制算法，或者增大 socket 缓冲区大小，以充分布局“长肥管道”（LFN）。`;

  return { observation, analysis, conclusion };
}

// Call API
export async function generateAIReport(req: GenerateRequest): Promise<GenerateResponse> {
  const geminiKey = process.env.GEMINI_API_KEY || '';
  const openaiKey = process.env.OPENAI_API_KEY || '';
  const deepseekKey = process.env.DEEPSEEK_API_KEY || '';

  const systemPrompt = `你是一个大学计算机网络实验助教。请根据用户提供的实验数据，生成一份结构化、专业、高水平的中文实验报告内容。
你必须返回符合以下JSON格式的数据，不要带有任何Markdown标记或包裹字符，只输出合法的JSON对象：
{
  "observation": "详细描述实验现象，包含网络报文重传、滑动窗口变化等底层细节",
  "analysis": "深入分析实验结果，结合计算机网络理论（如TCP拥塞控制机制、时延带宽积、丢包对吞吐量的影响公式等）对数据进行定量和定性分析",
  "conclusion": "总结实验结论，给出网络性能评估及针对性的优化建议（如缓冲区调整、拥塞控制算法选择等）"
}

输入数据如下：
- 实验名称: ${req.title}
- 丢包率: ${req.packet_loss}%
- 延迟: ${req.latency} ms
- 吞吐量: ${req.throughput} Mbps
- 实验描述: ${req.experiment_description}

注意：输出语言必须为中文，内容要丰富、专业，避免假大空的套话，要紧扣具体的数值进行科学推导。`;

  // 1. Try Gemini API
  if (geminiKey.trim() !== '') {
    try {
      console.log('Using Gemini API for generation...');
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: systemPrompt,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const resJson = await response.json();
      const text = resJson.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const parsed = JSON.parse(text);
      if (parsed.observation && parsed.analysis && parsed.conclusion) {
        return parsed as GenerateResponse;
      }
    } catch (e) {
      console.error('Gemini Generation failed, trying OpenAI or falling back:', e);
    }
  }

  // 2. Try OpenAI API
  if (openaiKey.trim() !== '') {
    try {
      console.log('Using OpenAI API for generation...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that outputs structured JSON for lab reports.',
            },
            {
              role: 'user',
              content: systemPrompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned status ${response.status}`);
      }

      const resJson = await response.json();
      const text = resJson.choices?.[0]?.message?.content || '';
      const parsed = JSON.parse(text);
      if (parsed.observation && parsed.analysis && parsed.conclusion) {
        return parsed as GenerateResponse;
      }
    } catch (e) {
      console.error('OpenAI Generation failed, falling back to local mock:', e);
    }
  }

  // 3. Try DeepSeek API (OpenAI compatible)
  if (deepseekKey.trim() !== '') {
    try {
      console.log('Using DeepSeek API for generation...');
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that outputs structured JSON for lab reports.',
            },
            {
              role: 'user',
              content: systemPrompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API returned status ${response.status}`);
      }

      const resJson = await response.json();
      const text = resJson.choices?.[0]?.message?.content || '';
      const parsed = JSON.parse(text);
      if (parsed.observation && parsed.analysis && parsed.conclusion) {
        return parsed as GenerateResponse;
      }
    } catch (e) {
      console.error('DeepSeek Generation failed, falling back to local mock:', e);
    }
  }

  // 4. Fallback to Local Mock
  console.log('Using local mock template generator (Zero-setup)...');
  return generateMockReport(req);
}
