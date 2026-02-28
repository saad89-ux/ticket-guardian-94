import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { mockUsers, mockPatients, mockAppointments } from '@/lib/mock-data';
import { Users, Stethoscope, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/Badges';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const COLORS = ['hsl(173,58%,39%)', 'hsl(217,91%,60%)', 'hsl(38,92%,50%)', 'hsl(0,72%,51%)'];

const AdminDashboard = () => {
  const doctors = mockUsers.filter(u => u.role === 'doctor');
  const statusData = [
    { name: 'Pending', value: mockAppointments.filter(a => a.status === 'Pending').length },
    { name: 'Confirmed', value: mockAppointments.filter(a => a.status === 'Confirmed').length },
    { name: 'Completed', value: mockAppointments.filter(a => a.status === 'Completed').length },
    { name: 'Cancelled', value: mockAppointments.filter(a => a.status === 'Cancelled').length },
  ];
  const monthlyData = [
    { month: 'Sep', appointments: 35 }, { month: 'Oct', appointments: 42 },
    { month: 'Nov', appointments: 38 }, { month: 'Dec', appointments: mockAppointments.length },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Patients" value={mockPatients.length} icon={<Users className="h-5 w-5" />} />
          <StatCard title="Total Doctors" value={doctors.length} icon={<Stethoscope className="h-5 w-5" />} />
          <StatCard title="Appointments" value={mockAppointments.length} icon={<Calendar className="h-5 w-5" />} />
          <StatCard title="Revenue (Sim)" value="Rs. 45,000" icon={<DollarSign className="h-5 w-5" />} />
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
            <CardHeader><CardTitle className="text-base">Monthly Appointments</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip />
                  <Bar dataKey="appointments" fill="hsl(173,58%,39%)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Doctors Overview</CardTitle></CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Specialization</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{doctors.map(d => (
                <TableRow key={d.id}><TableCell className="font-medium">{d.name}</TableCell><TableCell>{d.specialization || '-'}</TableCell>
                  <TableCell><span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${d.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{d.isActive ? 'Active' : 'Inactive'}</span></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Recent Appointments</CardTitle></CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow><TableHead>Patient</TableHead><TableHead>Doctor</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{mockAppointments.slice(0, 5).map(a => (
                <TableRow key={a.id}><TableCell>{a.patientName}</TableCell><TableCell>{a.doctorName}</TableCell><TableCell>{a.date} {a.time}</TableCell><TableCell><StatusBadge status={a.status} /></TableCell></TableRow>
              ))}</TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
