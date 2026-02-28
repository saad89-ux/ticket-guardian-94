import { useState } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { mockUsers } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminDoctorsPage = () => {
  const doctors = mockUsers.filter(u => u.role === 'doctor');
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Doctor created (demo)' });
    setOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Manage Doctors</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><UserPlus className="mr-2 h-4 w-4" />Add Doctor</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Doctor</DialogTitle></DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div><Label>Name</Label><Input required /></div>
                <div><Label>Email</Label><Input type="email" required /></div>
                <div><Label>Specialization</Label><Input required /></div>
                <Button type="submit" className="w-full">Create Doctor</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell>{d.email}</TableCell>
                    <TableCell>{d.specialization || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${d.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {d.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => toast({ title: `${d.isActive ? 'Deactivated' : 'Activated'} ${d.name} (demo)` })}>
                        {d.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
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

export default AdminDoctorsPage;
