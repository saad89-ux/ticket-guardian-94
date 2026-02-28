import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { mockAppointments, mockPrescriptions, mockPatients } from '@/lib/mock-data';
import { Calendar, FileText, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/shared/Badges';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const myAppointments = mockAppointments.filter(a => a.doctorId === user?.id);
  const myPrescriptions = mockPrescriptions.filter(p => p.doctorId === user?.id);
  const todayAppointments = myAppointments.filter(a => a.status !== 'Cancelled');
  const uniquePatients = new Set(myAppointments.map(a => a.patientId)).size;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">{user?.specialization || 'Doctor'}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Appointments" value={myAppointments.length} icon={<Calendar className="h-5 w-5" />} />
          <StatCard title="Prescriptions" value={myPrescriptions.length} icon={<FileText className="h-5 w-5" />} />
          <StatCard title="Patients Seen" value={uniquePatients} icon={<Users className="h-5 w-5" />} />
          <StatCard title="Pending Today" value={myAppointments.filter(a => a.status === 'Pending').length} icon={<Clock className="h-5 w-5" />} />
        </div>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base">Upcoming Appointments</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myAppointments.filter(a => a.status !== 'Completed' && a.status !== 'Cancelled').map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.patientName}</TableCell>
                    <TableCell>{a.date}</TableCell>
                    <TableCell>{a.time}</TableCell>
                    <TableCell>{a.reason || '-'}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
