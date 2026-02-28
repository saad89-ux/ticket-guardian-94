import { useState } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { mockAppointments, mockUsers, mockPatients } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/Badges';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ReceptionistAppointmentsPage = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const doctors = mockUsers.filter(u => u.role === 'doctor' && u.isActive);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><CalendarPlus className="mr-2 h-4 w-4" />Book Appointment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Book New Appointment</DialogTitle></DialogHeader>
              <form onSubmit={e => { e.preventDefault(); toast({ title: 'Appointment booked (demo)' }); setOpen(false); }} className="space-y-4">
                <div>
                  <Label>Patient</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                    <SelectContent>
                      {mockPatients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Doctor</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                    <SelectContent>
                      {doctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name} - {d.specialization}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Date</Label><Input type="date" required /></div>
                  <div><Label>Time</Label><Input type="time" required /></div>
                </div>
                <div><Label>Reason</Label><Input placeholder="Reason for visit" /></div>
                <Button type="submit" className="w-full">Book Appointment</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAppointments.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.patientName}</TableCell>
                    <TableCell>{a.doctorName}</TableCell>
                    <TableCell>{a.date}</TableCell>
                    <TableCell>{a.time}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                    <TableCell>
                      {a.status === 'Pending' && (
                        <Button size="sm" variant="destructive" onClick={() => toast({ title: 'Cancelled (demo)' })}>Cancel</Button>
                      )}
                    </TableCell>
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

export default ReceptionistAppointmentsPage;
