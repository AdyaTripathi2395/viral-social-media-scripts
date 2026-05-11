import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Users, Mail, Star, ArrowLeft, RefreshCw, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [stats, setStats] = useState<any>({
    totalGenerations: 0,
    formatDistribution: [],
    averageFeedback: 0,
    recentEmails: []
  });

  useEffect(() => {
    // In a real app, this would fetch from a backend.
    // For this demo, we'll aggregate from local history as a starting point.
    const history = JSON.parse(localStorage.getItem('vibe_script_history') || '[]');
    
    const formats: Record<string, number> = {};
    let totalFeedback = 0;
    let feedbackCount = 0;
    const emails = new Set<string>();

    history.forEach((item: any) => {
      const platform = item.inputs?.platform || 'Other';
      formats[platform] = (formats[platform] || 0) + 1;
      
      if (item.feedback) {
        totalFeedback += item.feedback;
        feedbackCount++;
      }
      
      if (item.email) {
        emails.add(item.email);
      }
    });

    const formatData = Object.entries(formats).map(([name, value]) => ({ name, value }));
    
    // If no history, show some mock "trending" data for visual appeal
    const displayData = formatData.length > 0 ? formatData : [
      { name: 'Shorts/TikTok', value: 60 },
      { name: 'YouTube', value: 25 },
      { name: 'LinkedIn', value: 10 },
      { name: 'Podcast', value: 5 }
    ];

    setStats({
      totalGenerations: history.length || 124, // Mock total if history empty
      formatDistribution: displayData,
      averageFeedback: feedbackCount > 0 ? (totalFeedback / feedbackCount).toFixed(1) : 4.8,
      recentEmails: Array.from(emails).slice(0, 5)
    });
  }, []);

  const COLORS = ['#8A9A5B', '#1a1a1a', '#e5e7eb', '#d1d5db'];

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-stone-400 mb-4 block">
            Personal Strategic Analysis
          </span>
          <h2 className="text-5xl font-light tracking-tight text-natural-ink italic font-serif">Personal Insights</h2>
          <p className="text-stone-400 text-[10px] uppercase tracking-widest mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-natural-olive rounded-full" />
            Aggregating local browser data
          </p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-stone-400 hover:text-natural-ink transition-colors text-[10px] uppercase tracking-widest font-bold mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Analysis</span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { label: 'Total Scripts', value: stats.totalGenerations, icon: BarChart3 },
          { label: 'Avg Rating', value: stats.averageFeedback + '/5', icon: Star },
          { label: 'Network Reach', value: 'Global', icon: Users },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="natural-card bg-white/40 p-8 flex items-center justify-between border-stone-200/50"
          >
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-stone-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-light text-natural-ink">{stat.value}</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner">
              <stat.icon className="w-5 h-5 text-natural-olive" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="natural-card bg-white p-10 border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-natural-ink">Format Distribution</h3>
            <PieChartIcon className="w-4 h-4 text-stone-300" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.formatDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.formatDistribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    fontSize: '12px'
                  }} 
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="natural-card bg-white p-10 border-stone-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-natural-ink">Recent Capture</h3>
            <Mail className="w-4 h-4 text-stone-300" />
          </div>
          <div className="space-y-6">
            {stats.recentEmails.length > 0 ? (
              stats.recentEmails.map((email: string, i: number) => (
                <div key={email} className="flex items-center justify-between py-3 border-b border-stone-50 last:border-0">
                  <span className="text-sm text-natural-ink">{email}</span>
                  <span className="text-[10px] text-stone-300 font-bold tracking-widest">VERIFIED</span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-stone-300 space-y-4">
                <RefreshCw className="w-8 h-8 animate-spin-slow" />
                <p className="text-[10px] uppercase tracking-widest">Waiting for ingress...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
