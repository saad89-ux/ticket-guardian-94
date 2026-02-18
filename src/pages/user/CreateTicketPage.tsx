import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { TicketCategory, TicketPriority } from '@/lib/types';
import { Upload } from 'lucide-react';

const CreateTicketPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>('Technical');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.length < 5) { toast.error('Title must be at least 5 characters'); return; }
    if (description.length < 20) { toast.error('Description must be at least 20 characters'); return; }
    setLoading(true);
    setTimeout(() => {
      toast.success('Ticket created successfully!');
      navigate('/tickets');
      setLoading(false);
    }, 800);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground mb-1">Create Support Ticket</h1>
        <p className="text-muted-foreground mb-8">Describe your issue and we'll get back to you as soon as possible.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" placeholder="Brief description of your issue" value={title} onChange={e => setTitle(e.target.value)} className="mt-1.5" maxLength={200} required />
            <p className="text-xs text-muted-foreground mt-1">{title.length}/200 characters</p>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" placeholder="Please provide detailed information about your issue..." value={description} onChange={e => setDescription(e.target.value)} rows={6} className="mt-1.5" required />
            <p className="text-xs text-muted-foreground mt-1">{description.length} characters (min 20)</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">🔧 Technical</SelectItem>
                  <SelectItem value="Billing">💳 Billing</SelectItem>
                  <SelectItem value="General">📋 General</SelectItem>
                  <SelectItem value="Sales">📈 Sales</SelectItem>
                  <SelectItem value="Product">📦 Product</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">🟢 Low</SelectItem>
                  <SelectItem value="Medium">🟡 Medium</SelectItem>
                  <SelectItem value="High">🟠 High</SelectItem>
                  <SelectItem value="Critical">🔴 Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Upload zone */}
          <div>
            <Label>Attachments (optional)</Label>
            <div className="mt-1.5 border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <Upload size={32} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Drag & drop files here, or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF, DOC up to 10MB each</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Ticket'}</Button>
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  );
};

export default CreateTicketPage;
