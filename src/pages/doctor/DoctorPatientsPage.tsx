import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { mockPatients, mockAppointments, mockPrescriptions, mockDiagnosisLogs } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { StatusBadge, RiskBadge } from '@/components/shared/Badges';
import type { Patient } from '@/lib/types';

const DoctorPatientsPage = () => {
  const [selected, setSelected] = useState<Patient | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Patient Records</h1>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPatients.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.age}</TableCell>
                    <TableCell>{p.gender}</TableCell>
                    <TableCell>{p.bloodGroup || '-'}</TableCell>
                    <TableCell>{p.contact}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => setSelected(p)}>
                        <Eye className="mr-1 h-3 w-3" /> View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{selected?.name} - Medical History</DialogTitle></DialogHeader>
            {selected && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-muted-foreground">Age:</span> {selected.age}</div>
                  <div><span className="text-muted-foreground">Gender:</span> {selected.gender}</div>
                  <div><span className="text-muted-foreground">Blood Group:</span> {selected.bloodGroup || '-'}</div>
                  <div><span className="text-muted-foreground">Allergies:</span> {selected.allergies?.join(', ') || 'None'}</div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Appointment History</h4>
                  {mockAppointments.filter(a => a.patientId === selected.id).map(a => (
                    <div key={a.id} className="flex items-center justify-between py-2 border-b border-border text-sm">
                      <span>{a.date} - {a.reason || 'Checkup'}</span>
                      <StatusBadge status={a.status} />
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Diagnosis History</h4>
                  {mockDiagnosisLogs.filter(d => d.patientId === selected.id).map(d => (
                    <div key={d.id} className="py-2 border-b border-border text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span>{d.symptoms.join(', ')}</span>
                        <RiskBadge level={d.riskLevel} />
                      </div>
                      {d.possibleConditions && <p className="text-muted-foreground">Possible: {d.possibleConditions.join(', ')}</p>}
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Prescriptions</h4>
                  {mockPrescriptions.filter(p => p.patientId === selected.id).map(rx => (
                    <div key={rx.id} className="py-2 border-b border-border text-sm">
                      <p className="font-medium">{rx.diagnosis}</p>
                      <p className="text-muted-foreground">{rx.medicines.map(m => m.name).join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DoctorPatientsPage;
