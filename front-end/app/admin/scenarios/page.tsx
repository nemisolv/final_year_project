'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Save,
  X,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

interface Scenario {
  id: string;
  title: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'pending' | 'approved' | 'rejected';
  situation: string;
  userRole: string;
  aiRole: string;
  objectives: string[];
  createdBy: string;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

const MOCK_SCENARIOS: Scenario[] = [
  {
    id: '1',
    title: 'At the Restaurant',
    category: 'Daily Life',
    level: 'Beginner',
    status: 'approved',
    situation: 'You are at a restaurant and want to order dinner.',
    userRole: 'Customer',
    aiRole: 'Waiter',
    objectives: ['Order a meal', 'Ask about menu items', 'Make special requests'],
    createdBy: 'admin@example.com',
    createdAt: '2025-01-01',
    reviewedBy: 'reviewer@example.com',
    reviewedAt: '2025-01-02',
  },
  {
    id: '2',
    title: 'Job Interview Practice',
    category: 'Professional',
    level: 'Intermediate',
    status: 'pending',
    situation: 'You are being interviewed for a software engineer position.',
    userRole: 'Candidate',
    aiRole: 'Interviewer',
    objectives: ['Introduce yourself', 'Talk about experience', 'Ask questions'],
    createdBy: 'teacher@example.com',
    createdAt: '2025-01-03',
  },
  {
    id: '3',
    title: 'Medical Emergency',
    category: 'Healthcare',
    level: 'Advanced',
    status: 'rejected',
    situation: 'You need to explain a medical emergency to a doctor.',
    userRole: 'Patient',
    aiRole: 'Doctor',
    objectives: ['Describe symptoms', 'Understand treatment'],
    createdBy: 'teacher2@example.com',
    createdAt: '2025-01-04',
    reviewedBy: 'admin@example.com',
    reviewedAt: '2025-01-05',
  },
];

export default function ScenariosManagementPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>(MOCK_SCENARIOS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [deleteScenarioId, setDeleteScenarioId] = useState<string | null>(null);
  const [viewingScenario, setViewingScenario] = useState<Scenario | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    level: 'Beginner' as const,
    situation: '',
    userRole: '',
    aiRole: '',
    objectives: [''],
  });

  const filteredScenarios = scenarios.filter((scenario) => {
    const matchesSearch =
      scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scenario.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || scenario.status === filterStatus;
    const matchesLevel = filterLevel === 'all' || scenario.level === filterLevel;
    return matchesSearch && matchesStatus && matchesLevel;
  });

  const handleCreate = () => {
    setIsCreating(true);
    setFormData({
      title: '',
      category: '',
      level: 'Beginner',
      situation: '',
      userRole: '',
      aiRole: '',
      objectives: [''],
    });
  };

  const handleEdit = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setFormData({
      title: scenario.title,
      category: scenario.category,
      level: scenario.level,
      situation: scenario.situation,
      userRole: scenario.userRole,
      aiRole: scenario.aiRole,
      objectives: scenario.objectives,
    });
  };

  const handleSave = () => {
    if (!formData.title || !formData.category || !formData.situation) {
      toast.error('Please fill in all required fields');
      return;
    }

    const filteredObjectives = formData.objectives.filter((obj) => obj.trim() !== '');
    if (filteredObjectives.length === 0) {
      toast.error('Please add at least one objective');
      return;
    }

    if (editingScenario) {
      setScenarios(
        scenarios.map((s) =>
          s.id === editingScenario.id
            ? {
                ...s,
                ...formData,
                objectives: filteredObjectives,
              }
            : s
        )
      );
      toast.success('Scenario updated successfully');
    } else {
      const newScenario: Scenario = {
        id: Date.now().toString(),
        ...formData,
        objectives: filteredObjectives,
        status: 'pending',
        createdBy: 'current-user@example.com',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setScenarios([newScenario, ...scenarios]);
      toast.success('Scenario created successfully');
    }

    setIsCreating(false);
    setEditingScenario(null);
  };

  const handleApprove = (id: string) => {
    setScenarios(
      scenarios.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'approved' as const,
              reviewedBy: 'admin@example.com',
              reviewedAt: new Date().toISOString().split('T')[0],
            }
          : s
      )
    );
    toast.success('Scenario approved');
  };

  const handleReject = (id: string) => {
    setScenarios(
      scenarios.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'rejected' as const,
              reviewedBy: 'admin@example.com',
              reviewedAt: new Date().toISOString().split('T')[0],
            }
          : s
      )
    );
    toast.success('Scenario rejected');
  };

  const handleDelete = () => {
    if (!deleteScenarioId) return;
    setScenarios(scenarios.filter((s) => s.id !== deleteScenarioId));
    setDeleteScenarioId(null);
    toast.success('Scenario deleted');
  };

  const addObjective = () => {
    setFormData({
      ...formData,
      objectives: [...formData.objectives, ''],
    });
  };

  const removeObjective = (index: number) => {
    setFormData({
      ...formData,
      objectives: formData.objectives.filter((_, i) => i !== index),
    });
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index] = value;
    setFormData({
      ...formData,
      objectives: newObjectives,
    });
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      Beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      Intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      Advanced: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    };
    return colors[level as keyof typeof colors];
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[status as keyof typeof colors];
  };

  if (viewingScenario) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Scenario Details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setViewingScenario(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">{viewingScenario.title}</h3>
              <div className="flex gap-2 mb-4">
                <Badge className={getLevelBadge(viewingScenario.level)}>{viewingScenario.level}</Badge>
                <Badge className={getStatusBadge(viewingScenario.status)}>{viewingScenario.status}</Badge>
                <Badge variant="outline">{viewingScenario.category}</Badge>
              </div>
            </div>

            <div className="bg-secondary p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Situation:</h4>
              <p className="text-sm">{viewingScenario.situation}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-secondary p-4 rounded-lg">
                <h4 className="font-semibold mb-2">User Role:</h4>
                <p className="text-sm">{viewingScenario.userRole}</p>
              </div>
              <div className="bg-secondary p-4 rounded-lg">
                <h4 className="font-semibold mb-2">AI Role:</h4>
                <p className="text-sm">{viewingScenario.aiRole}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Objectives:</h4>
              <ul className="space-y-2">
                {viewingScenario.objectives.map((obj, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created by:</span>
                  <p className="font-medium">{viewingScenario.createdBy}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Created at:</span>
                  <p className="font-medium">{viewingScenario.createdAt}</p>
                </div>
                {viewingScenario.reviewedBy && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Reviewed by:</span>
                      <p className="font-medium">{viewingScenario.reviewedBy}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reviewed at:</span>
                      <p className="font-medium">{viewingScenario.reviewedAt}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {viewingScenario.status === 'pending' && (
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => { handleApprove(viewingScenario.id); setViewingScenario(null); }}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => { handleReject(viewingScenario.id); setViewingScenario(null); }}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCreating || editingScenario) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{editingScenario ? 'Edit Scenario' : 'Create New Scenario'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => { setIsCreating(false); setEditingScenario(null); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., At the Restaurant"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  placeholder="e.g., Daily Life"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Level *</Label>
              <Select
                value={formData.level}
                onValueChange={(value: any) => setFormData({ ...formData, level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="situation">Situation *</Label>
              <Textarea
                id="situation"
                placeholder="Describe the scenario situation..."
                rows={3}
                value={formData.situation}
                onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userRole">User Role *</Label>
                <Input
                  id="userRole"
                  placeholder="e.g., Customer"
                  value={formData.userRole}
                  onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aiRole">AI Role *</Label>
                <Input
                  id="aiRole"
                  placeholder="e.g., Waiter"
                  value={formData.aiRole}
                  onChange={(e) => setFormData({ ...formData, aiRole: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Objectives *</Label>
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Objective ${index + 1}`}
                    value={objective}
                    onChange={(e) => updateObjective(index, e.target.value)}
                  />
                  {formData.objectives.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeObjective(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addObjective}>
                <Plus className="h-4 w-4 mr-2" />
                Add Objective
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={() => { setIsCreating(false); setEditingScenario(null); }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Conversation Scenarios</CardTitle>
              <CardDescription>
                Manage and approve conversation scenarios for students
              </CardDescription>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Scenario
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scenarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Scenarios Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScenarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No scenarios found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredScenarios.map((scenario) => (
                    <TableRow key={scenario.id}>
                      <TableCell className="font-medium">{scenario.title}</TableCell>
                      <TableCell>{scenario.category}</TableCell>
                      <TableCell>
                        <Badge className={getLevelBadge(scenario.level)}>{scenario.level}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadge(scenario.status)}>{scenario.status}</Badge>
                      </TableCell>
                      <TableCell>{scenario.createdBy}</TableCell>
                      <TableCell>{scenario.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setViewingScenario(scenario)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(scenario)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {scenario.status === 'pending' && (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => handleApprove(scenario.id)}>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleReject(scenario.id)}>
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => setDeleteScenarioId(scenario.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteScenarioId} onOpenChange={() => setDeleteScenarioId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scenario</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this scenario? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
