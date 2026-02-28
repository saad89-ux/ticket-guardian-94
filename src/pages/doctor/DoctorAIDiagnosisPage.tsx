import { useState } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Loader2, AlertTriangle, Beaker, Activity } from 'lucide-react';
import { RiskBadge } from '@/components/shared/Badges';
import type { RiskLevel } from '@/lib/types';

interface AIResult {
  possibleConditions: string[];
  riskLevel: RiskLevel;
  suggestedTests: string[];
  explanation: string;
}

const mockAIResults: Record<string, AIResult> = {
  fever: {
    possibleConditions: ['Viral Fever', 'Influenza', 'Dengue Fever', 'Typhoid'],
    riskLevel: 'Medium',
    suggestedTests: ['CBC', 'Dengue NS1', 'Blood Culture', 'Widal Test'],
    explanation: 'Fever with body aches suggests viral or bacterial infection. Given the symptoms, dengue and typhoid should be ruled out.',
  },
  chest: {
    possibleConditions: ['Angina', 'GERD', 'Costochondritis', 'Pulmonary Embolism'],
    riskLevel: 'High',
    suggestedTests: ['ECG', 'Troponin', 'Chest X-ray', 'D-Dimer'],
    explanation: 'Chest pain requires urgent evaluation. Cardiac causes must be ruled out first before considering musculoskeletal or GI causes.',
  },
  default: {
    possibleConditions: ['Common Cold', 'Allergic Rhinitis', 'Sinusitis'],
    riskLevel: 'Low',
    suggestedTests: ['CBC', 'Allergy Panel'],
    explanation: 'Symptoms appear mild and suggestive of upper respiratory involvement. Monitor and treat symptomatically.',
  },
};

const DoctorAIDiagnosisPage = () => {
  const [symptoms, setSymptoms] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [history, setHistory] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);

  const handleAnalyze = () => {
    setLoading(true);
    setTimeout(() => {
      const lower = symptoms.toLowerCase();
      if (lower.includes('chest') || lower.includes('heart')) {
        setResult(mockAIResults.chest);
      } else if (lower.includes('fever') || lower.includes('temperature')) {
        setResult(mockAIResults.fever);
      } else {
        setResult(mockAIResults.default);
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Smart Diagnosis</h1>
          <p className="text-muted-foreground">Enter patient symptoms for AI-powered analysis</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /> Symptom Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Symptoms *</Label>
                <Textarea placeholder="e.g., Fever, headache, body aches, runny nose..." value={symptoms} onChange={e => setSymptoms(e.target.value)} rows={4} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Age</Label>
                  <Input type="number" placeholder="32" value={age} onChange={e => setAge(e.target.value)} />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Medical History</Label>
                <Textarea placeholder="Any previous conditions, allergies, medications..." value={history} onChange={e => setHistory(e.target.value)} rows={2} />
              </div>
              <Button onClick={handleAnalyze} disabled={!symptoms.trim() || loading} className="w-full">
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Brain className="mr-2 h-4 w-4" />Analyze Symptoms</>}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> AI Analysis Result</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Risk Level</Label>
                  <div className="mt-1"><RiskBadge level={result.riskLevel} /></div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Possible Conditions</Label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {result.possibleConditions.map(c => (
                      <span key={c} className="px-2 py-1 bg-accent text-accent-foreground rounded-md text-sm">{c}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">Suggested Tests</Label>
                  <div className="mt-1 space-y-1">
                    {result.suggestedTests.map(t => (
                      <div key={t} className="flex items-center gap-2 text-sm">
                        <Beaker className="h-3 w-3 text-primary" />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-muted-foreground">AI Explanation</Label>
                  <p className="mt-1 text-sm text-foreground bg-accent/50 rounded-lg p-3">{result.explanation}</p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <span className="text-amber-800">This AI analysis is for assistance only. Clinical judgment should always prevail.</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorAIDiagnosisPage;
