import { supabase, isSupabaseConfigured } from './supabase';
import { Report } from '@/types';

// Helper to generate UUID-like string for local mode
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Local Database Driver
const localDB = {
  getReports: (userId: string): Report[] => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem('labreport_ai_reports');
    if (!raw) return [];
    try {
      const all: Report[] = JSON.parse(raw);
      return all
        .filter((r) => r.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch {
      return [];
    }
  },

  getReportById: (id: string, userId: string): Report | null => {
    const reports = localDB.getReports(userId);
    return reports.find((r) => r.id === id) || null;
  },

  createReport: (
    data: Omit<Report, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Report => {
    const now = new Date().toISOString();
    const newReport: Report = {
      ...data,
      id: generateUUID(),
      user_id: userId,
      created_at: now,
      updated_at: now,
    };
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('labreport_ai_reports');
      let all: Report[] = [];
      if (raw) {
        try {
          all = JSON.parse(raw);
        } catch {
          all = [];
        }
      }
      all.push(newReport);
      localStorage.setItem('labreport_ai_reports', JSON.stringify(all));
    }
    return newReport;
  },

  updateReport: (
    id: string,
    data: Partial<Omit<Report, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
    userId: string
  ): Report | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('labreport_ai_reports');
    if (!raw) return null;
    try {
      let all: Report[] = JSON.parse(raw);
      const index = all.findIndex((r) => r.id === id && r.user_id === userId);
      if (index === -1) return null;
      
      const updatedReport: Report = {
        ...all[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      all[index] = updatedReport;
      localStorage.setItem('labreport_ai_reports', JSON.stringify(all));
      return updatedReport;
    } catch {
      return null;
    }
  },

  deleteReport: (id: string, userId: string): boolean => {
    if (typeof window === 'undefined') return false;
    const raw = localStorage.getItem('labreport_ai_reports');
    if (!raw) return false;
    try {
      let all: Report[] = JSON.parse(raw);
      const initialLen = all.length;
      all = all.filter((r) => !(r.id === id && r.user_id === userId));
      localStorage.setItem('labreport_ai_reports', JSON.stringify(all));
      return all.length < initialLen;
    } catch {
      return false;
    }
  },
};

// Database Service Interface
export const db = {
  isLocal: !isSupabaseConfigured,

  getReports: async (userId: string): Promise<Report[]> => {
    if (!isSupabaseConfigured || !supabase) {
      return localDB.getReports(userId);
    }
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getReports error:', error);
      // fallback to local on DB error or return empty
      return [];
    }
    return data || [];
  },

  getReportById: async (id: string, userId: string): Promise<Report | null> => {
    if (!isSupabaseConfigured || !supabase) {
      return localDB.getReportById(id, userId);
    }
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Supabase getReportById error:', error);
      return null;
    }
    return data;
  },

  createReport: async (
    data: Omit<Report, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    userId: string
  ): Promise<Report> => {
    if (!isSupabaseConfigured || !supabase) {
      return localDB.createReport(data, userId);
    }
    const { data: inserted, error } = await supabase
      .from('reports')
      .insert({
        title: data.title,
        packet_loss: data.packet_loss,
        latency: data.latency,
        throughput: data.throughput,
        experiment_description: data.experiment_description,
        generated_observation: data.generated_observation,
        generated_analysis: data.generated_analysis,
        generated_conclusion: data.generated_conclusion,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase createReport error:', error);
      throw error;
    }
    return inserted;
  },

  updateReport: async (
    id: string,
    data: Partial<Omit<Report, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
    userId: string
  ): Promise<Report> => {
    if (!isSupabaseConfigured || !supabase) {
      const res = localDB.updateReport(id, data, userId);
      if (!res) throw new Error('Report not found or update failed');
      return res;
    }
    const { data: updated, error } = await supabase
      .from('reports')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateReport error:', error);
      throw error;
    }
    return updated;
  },

  deleteReport: async (id: string, userId: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      return localDB.deleteReport(id, userId);
    }
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase deleteReport error:', error);
      return false;
    }
    return true;
  },
};
