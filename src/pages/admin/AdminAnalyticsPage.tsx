import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { mockPatients, mockAppointments, mockPrescriptions, mockDiagnosisLogs } from '@/lib/mock-data';
import { Users, Calendar, FileText, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';

const COLORS = ['hsl(173,58%,39%)', 'hsl(217,91%,60%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)'];

const AdminAnalyticsPage = () => {
  const statusData = [
    { name: 'Pending', value: mockAppointments.filter(a => a.status === 'Pending').length },
    { name: 'Confirmed', value: mockAppointments.filter(a => a.status === 'Confirmed').length },
    { name: 'Completed', value: mockAppointments.filter(a => a.status === 'Completed').length },
    { name: 'Cancelled', value: mockAppointments.filter(a => a.status === 'Cancelled').length },
  ];
  const riskData = [
    { name: 'Low', count: mockDiagnosisLogs.filter(d => d.riskLevel === 'Low').length },
    { name: 'Medium', count: mockDiagnosisLogs.filter(d => d.riskLevel === 'Medium').length },
    { name: 'High', count: mockDiagnosisLogs.filter(d => d.riskLevel === 'High').length },
  ];
  const trendData = [
    { month: 'Jul', patients: 12, appointments: 20 }, { month: 'Aug', patients: 18, appointments: 28 },
    { month: 'Sep', patients: 22, appointments: 35 }, { month: 'Oct', patients: 30, appointments: 42 },
    { month: 'Nov', patients: 25, appointments: 38 }, { month: 'Dec', patients: mockPatients.length, appointments: mockAppointments.length },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Patients" value={mockPatients.length} icon={<Users className="h-5 w-5" />} />
          <StatCard title="Appointments" value={mockAppointments.length} icon={<Calendar className="h-5 w-5" />} />
          <StatCard title="Prescriptions" value={mockPrescriptions.length} icon={<FileText className="h-5 w-5" />} />
          <StatCard title="Diagnoses" value={mockDiagnosisLogs.length} icon={<Activity className="h-5 w-5" />} />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Appointment Status</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base">Risk Level Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={riskData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip />
                  <Bar dataKey="count" fill="hsl(173,58%,39%)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Growth Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip />
                <Area type="monotone" dataKey="patients" stroke="hsl(173,58%,39%)" fill="hsl(173,58%,39%)" fillOpacity={0.2} />
                <Area type="monotone" dataKey="appointments" stroke="hsl(217,91%,60%)" fill="hsl(217,91%,60%)" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalyticsPage;
