export interface User {
  id: string;
  email: string;
  created_at?: string;
}

export interface Session {
  user: User | null;
  token?: string | null;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  packet_loss: number;
  latency: number;
  throughput: number;
  experiment_description: string;
  generated_observation: string;
  generated_analysis: string;
  generated_conclusion: string;
  created_at: string;
  updated_at: string;
}
