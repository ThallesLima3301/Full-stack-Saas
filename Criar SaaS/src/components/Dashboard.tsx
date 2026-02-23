import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { projectService } from "../services/project.service";
import { taskService } from "../services/task.service";
import { useAuth } from "../hooks/useAuth";

// ... mantenha TODO o resto do seu código igual, só modifique a parte dos dados
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Settings, 
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface DashboardProps {
  onLogout: () => void;
}

interface Task {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "done";
  priority: "low" | "medium" | "high";
  dueDate: string;
  project: string;
}

interface Project {
  id: string;
  name: string;
  progress: number;
  tasks: number;
  completedTasks: number;
  color: string;
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "Website Redesign", progress: 65, tasks: 24, completedTasks: 16, color: "blue" },
    { id: "2", name: "App Mobile", progress: 40, tasks: 18, completedTasks: 7, color: "purple" },
    { id: "3", name: "Marketing Campaign", progress: 85, tasks: 12, completedTasks: 10, color: "green" },
    { id: "4", name: "Product Launch", progress: 20, tasks: 30, completedTasks: 6, color: "orange" },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: "1", title: "Criar protótipo do dashboard", status: "in-progress", priority: "high", dueDate: "2026-02-25", project: "Website Redesign" },
    { id: "2", title: "Revisar copy das landing pages", status: "todo", priority: "medium", dueDate: "2026-02-26", project: "Marketing Campaign" },
    { id: "3", title: "Configurar pipeline CI/CD", status: "done", priority: "high", dueDate: "2026-02-22", project: "App Mobile" },
    { id: "4", title: "Realizar testes de usabilidade", status: "todo", priority: "medium", dueDate: "2026-02-28", project: "Website Redesign" },
    { id: "5", title: "Atualizar documentação API", status: "in-progress", priority: "low", dueDate: "2026-03-01", project: "App Mobile" },
    { id: "6", title: "Preparar apresentação para stakeholders", status: "todo", priority: "high", dueDate: "2026-02-24", project: "Product Launch" },
  ]);

  const [newTask, setNewTask] = useState({
    title: "",
    status: "todo" as const,
    priority: "medium" as const,
    dueDate: "",
    project: ""
  });

  const [newProject, setNewProject] = useState({
    name: "",
    color: "blue"
  });

  const handleCreateTask = () => {
    if (newTask.title && newTask.project) {
      const task: Task = {
        id: Date.now().toString(),
        ...newTask
      };
      setTasks([...tasks, task]);
      setNewTask({ title: "", status: "todo", priority: "medium", dueDate: "", project: "" });
      setIsNewTaskOpen(false);
    }
  };

  const handleCreateProject = () => {
    if (newProject.name) {
      const project: Project = {
        id: Date.now().toString(),
        name: newProject.name,
        progress: 0,
        tasks: 0,
        completedTasks: 0,
        color: newProject.color
      };
      setProjects([...projects, project]);
      setNewProject({ name: "", color: "blue" });
      setIsNewProjectOpen(false);
    }
  };

  const todoTasks = tasks.filter(t => t.status === "todo");
  const inProgressTasks = tasks.filter(t => t.status === "in-progress");
  const doneTasks = tasks.filter(t => t.status === "done");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getProjectColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-500",
      purple: "bg-purple-500",
      green: "bg-green-500",
      orange: "bg-orange-500",
      red: "bg-red-500",
      cyan: "bg-cyan-500"
    };
    return colors[color] || colors.blue;
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="mb-3 hover:shadow-md transition cursor-pointer">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-medium">{task.title}</h4>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={getPriorityColor(task.priority)}>
            {task.priority === "high" ? "Alta" : task.priority === "medium" ? "Média" : "Baixa"}
          </Badge>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(task.dueDate).toLocaleDateString("pt-BR")}
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-500">{task.project}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">TaskFlow</span>
          </div>
          <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
                <DialogDescription>Adicione uma nova tarefa ao seu projeto</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="task-title">Título</Label>
                  <Input
                    id="task-title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Nome da tarefa"
                  />
                </div>
                <div>
                  <Label htmlFor="task-project">Projeto</Label>
                  <Select value={newTask.project} onValueChange={(value) => setNewTask({ ...newTask, project: value })}>
                    <SelectTrigger id="task-project">
                      <SelectValue placeholder="Selecione um projeto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.name}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="task-priority">Prioridade</Label>
                  <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger id="task-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="task-date">Data de Entrega</Label>
                  <Input
                    id="task-date"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateTask} className="w-full">Criar Tarefa</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            <li>
              <Button
                variant={activeTab === "overview" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("overview")}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Visão Geral
              </Button>
            </li>
            <li>
              <Button
                variant={activeTab === "projects" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("projects")}
              >
                <FolderKanban className="w-4 h-4 mr-2" />
                Projetos
              </Button>
            </li>
            <li>
              <Button
                variant={activeTab === "team" ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab("team")}
              >
                <Users className="w-4 h-4 mr-2" />
                Equipe
              </Button>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start" onClick={onLogout}>
            <Settings className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Bem-vindo de volta!</h1>
              <p className="text-gray-600 mt-1">Aqui está o que está acontecendo com seus projetos hoje</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                JD
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total de Tarefas</CardDescription>
                    <CardTitle className="text-3xl">{tasks.length}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>+12% este mês</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Em Progresso</CardDescription>
                    <CardTitle className="text-3xl">{inProgressTasks.length}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <Clock className="w-4 h-4" />
                      <span>Ativas agora</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Concluídas</CardDescription>
                    <CardTitle className="text-3xl">{doneTasks.length}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{Math.round((doneTasks.length / tasks.length) * 100)}% do total</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Projetos Ativos</CardDescription>
                    <CardTitle className="text-3xl">{projects.length}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>2 novos</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Kanban Board */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Quadro de Tarefas</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* To Do Column */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Circle className="w-5 h-5 text-gray-400" />
                      <h3 className="font-semibold">A Fazer</h3>
                      <Badge variant="secondary">{todoTasks.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {todoTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  </div>

                  {/* In Progress Column */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold">Em Progresso</h3>
                      <Badge variant="secondary">{inProgressTasks.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {inProgressTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  </div>

                  {/* Done Column */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold">Concluído</h3>
                      <Badge variant="secondary">{doneTasks.length}</Badge>
                    </div>
                    <div className="space-y-3">
                      {doneTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Meus Projetos</h2>
                <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Projeto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Projeto</DialogTitle>
                      <DialogDescription>Adicione um novo projeto para sua equipe</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="project-name">Nome do Projeto</Label>
                        <Input
                          id="project-name"
                          value={newProject.name}
                          onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                          placeholder="Ex: Redesign do Website"
                        />
                      </div>
                      <div>
                        <Label htmlFor="project-color">Cor</Label>
                        <Select value={newProject.color} onValueChange={(value) => setNewProject({ ...newProject, color: value })}>
                          <SelectTrigger id="project-color">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blue">Azul</SelectItem>
                            <SelectItem value="purple">Roxo</SelectItem>
                            <SelectItem value="green">Verde</SelectItem>
                            <SelectItem value="orange">Laranja</SelectItem>
                            <SelectItem value="red">Vermelho</SelectItem>
                            <SelectItem value="cyan">Ciano</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleCreateProject} className="w-full">Criar Projeto</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {projects.map(project => (
                  <Card key={project.id} className="hover:shadow-lg transition">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 ${getProjectColor(project.color)} rounded-lg flex items-center justify-center text-white font-bold`}>
                            {project.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <CardTitle>{project.name}</CardTitle>
                            <CardDescription>
                              {project.completedTasks} de {project.tasks} tarefas concluídas
                            </CardDescription>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progresso</span>
                          <span className="font-semibold">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Equipe</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Convidar Membro
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { name: "João Silva", role: "Product Manager", avatar: "JS", color: "blue", tasks: 12 },
                  { name: "Maria Santos", role: "Designer", avatar: "MS", color: "purple", tasks: 8 },
                  { name: "Pedro Costa", role: "Developer", avatar: "PC", color: "green", tasks: 15 },
                  { name: "Ana Oliveira", role: "Developer", avatar: "AO", color: "orange", tasks: 10 },
                  { name: "Carlos Lima", role: "QA Engineer", avatar: "CL", color: "red", tasks: 6 },
                  { name: "Julia Rocha", role: "Marketing", avatar: "JR", color: "cyan", tasks: 9 },
                ].map((member, index) => (
                  <Card key={index} className="hover:shadow-lg transition">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 bg-${member.color}-500 rounded-full flex items-center justify-center text-white font-semibold`}>
                          {member.avatar}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          <CardDescription>{member.role}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Tarefas ativas</span>
                        <Badge variant="secondary">{member.tasks}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
