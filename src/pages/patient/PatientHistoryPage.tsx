import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockAppointments, mockPrescriptions, mockDiagnosisLogs } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge, RiskBadge } from '@/components/shared/Badges';
import { Calendar, FileText, Activity } from 'lucide-react';

const PatientHistoryPage = () => {
  const { user } = useAuth();
  const patientId = 'p-1'; // In real app, link user to patient record
  const appointments = mockAppointments.filter(a => a.patientId === patientId);
  const prescriptions = mockPrescriptions.filter(p => p.patientId === patientId);
  const diagnoses = mockDiagnosisLogs.filter(d => d.patientId === patientId);

  // Build timeline
  const timeline = [
    ...appointments.map(a => ({ type: 'appointment' as const, date: a.date, data: a })),
    ...prescriptions.map(p => ({ type: 'prescription' as const, date: p.createdAt, data: p })),
    ...diagnoses.map(d => ({ type: 'diagnosis' as const, date: d.createdAt, data: d })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Medical History</h1>
        <p className="text-muted-foreground">Complete timeline of your medical records</p>

        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-4">
            {timeline.map((item, i) => (
              <div key={i} className="relative pl-10">
                <div className={`absolute left-2.5 top-3 h-3 w-3 rounded-full ${
                  item.type === 'appointment' ? 'bg-blue-500' :
                  item.type === 'prescription' ? 'bg-emerald-500' : 'bg-amber-500'
                }`} />
                <Card className="glass-card">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-2 mb-2">
                      {item.type === 'appointment' && <Calendar className="h-4 w-4 text-blue-500" />}
                      {item.type === 'prescription' && <FileText className="h-4 w-4 text-emerald-500" />}
                      {item.type === 'diagnosis' && <Activity className="h-4 w-4 text-amber-500" />}
                      <span className="text-xs font-semibold uppercase text-muted-foreground">{item.type}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{item.date}</span>
                    </div>
                    {item.type === 'appointment' && (
                      <div className="text-sm">
                        <p className="font-medium">{item.data.doctorName}</p>
                        <p className="text-muted-foreground">{(item.data as any).reason || 'Checkup'}</p>
                        <div className="mt-1"><StatusBadge status={(item.data as any).status} /></div>
                      </div>
                    )}
                    {item.type === 'prescription' && (
                      <div className="text-sm">
                        <p className="font-medium">{(item.data as any).diagnosis}</p>
                        <p className="text-muted-foreground">
                          Medicines: {(item.data as any).medicines.map((m: any) => m.name).join(', ')}
                        </p>
                      </div>
                    )}
                    {item.type === 'diagnosis' && (
                      <div className="text-sm">
                        <p className="font-medium">Symptoms: {(item.data as any).symptoms.join(', ')}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <RiskBadge level={(item.data as any).riskLevel} />
                          {(item.data as any).possibleConditions && (
                            <span className="text-muted-foreground">{(item.data as any).possibleConditions.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientHistoryPage;
