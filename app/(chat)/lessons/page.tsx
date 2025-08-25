'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookIcon, LinkIcon, PlusIcon, CalendarIcon, FilterIcon, ArrowLeftIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { Lesson } from '@/lib/db/schema';
import Link from 'next/link';

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    module: '',
    title: '',
    link: '',
    content: '',
  });

  // Fetch lessons on component mount
  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const response = await fetch('/api/lessons');
      const data = await response.json();
      
      if (data.success) {
        setLessons(data.lessons);
        setFilteredLessons(data.lessons);
      } else {
        toast.error('Erro ao carregar aulas');
      }
    } catch (error) {
      toast.error('Erro ao carregar aulas');
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter lessons by module
  useEffect(() => {
    if (selectedModule === 'all') {
      setFilteredLessons(lessons);
    } else {
      setFilteredLessons(lessons.filter(lesson => lesson.module === selectedModule));
    }
  }, [selectedModule, lessons]);

  // Get unique modules for filter
  const uniqueModules = Array.from(new Set(lessons.map(lesson => lesson.module))).sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Aula adicionada com sucesso!');
        setFormData({ module: '', title: '', link: '', content: '' });
        fetchLessons(); // Refresh the list
      } else {
        toast.error(data.error || 'Erro ao adicionar aula');
      }
    } catch (error) {
      toast.error('Erro ao adicionar aula');
      console.error('Error creating lesson:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="flex items-center gap-2"
        >
          <Link href="/">
            <ArrowLeftIcon className="h-4 w-4" />
            Voltar ao Chat
          </Link>
        </Button>
        <div className="h-6 w-px bg-border" />
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookIcon className="h-8 w-8 text-green-600" />
          Gerenciar Aulas
        </h1>
      </div>

      <div className="text-center">
        <p className="text-muted-foreground">
          Adicione novas aulas e visualize o conteúdo existente
        </p>
      </div>

      {/* Add New Lesson Form - MOVED TO TOP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Adicionar Nova Aula
          </CardTitle>
          <CardDescription>
            Preencha os dados da nova aula
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="module">Módulo</Label>
                <Input
                  id="module"
                  placeholder="Ex: MÓDULO 6 - PLANO SAFRA"
                  value={formData.module}
                  onChange={(e) => handleInputChange('module', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Título da Aula</Label>
                <Input
                  id="title"
                  placeholder="Ex: AULA 3 - O que são recursos subsidiados"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link da Aula</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://app.hotmart.com/membership/..."
                value={formData.link}
                onChange={(e) => handleInputChange('link', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo/Descrição</Label>
              <Textarea
                id="content"
                placeholder="Descreva o conteúdo da aula..."
                rows={4}
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={submitting} 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              {submitting ? 'Adicionando...' : 'Adicionar Aula'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lessons List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookIcon className="h-5 w-5" />
                Aulas Existentes
              </CardTitle>
              <CardDescription>
                Lista de todas as aulas cadastradas ({filteredLessons.length} {filteredLessons.length === 1 ? 'aula' : 'aulas'})
              </CardDescription>
            </div>
            
            {/* Module Filter */}
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Filtrar por módulo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os módulos</SelectItem>
                  {uniqueModules.map((module) => (
                    <SelectItem key={module} value={module}>
                      {module}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4">Carregando aulas...</p>
          ) : filteredLessons.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              {selectedModule === 'all' ? 'Nenhuma aula encontrada. Adicione a primeira aula acima.' : `Nenhuma aula encontrada para o módulo selecionado.`}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredLessons.map((lesson) => (
                <div 
                  key={lesson.id} 
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <BookIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="font-medium text-sm text-green-600 truncate">
                          {lesson.module}
                        </span>
                      </div>
                      <h3 className="font-semibold text-base mb-2 leading-tight">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {lesson.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <LinkIcon className="h-3 w-3" />
                          <a 
                            href={lesson.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-green-600 truncate max-w-[200px]"
                          >
                            Ver aula
                          </a>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(lesson.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}