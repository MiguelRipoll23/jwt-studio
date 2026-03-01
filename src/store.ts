import { useState, useCallback, useEffect } from 'react';
import type { Project, Token } from './types';
import { loadConfig, saveProjects as persistProjects } from './fileStore';

function generateId(): string {
  return crypto.randomUUID();
}

export function useProjectStore() {
  const [projects, setProjectsState] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  useEffect(() => {
    loadConfig().then(config => setProjectsState(config.projects));
  }, []);

  const setProjects = useCallback((updater: (prev: Project[]) => Project[]) => {
    setProjectsState(prev => {
      const next = updater(prev);
      persistProjects(next);
      return next;
    });
  }, []);

  const selectedProject = projects.find(p => p.id === selectedProjectId) ?? null;
  const selectedToken = selectedProject?.tokens.find(t => t.id === selectedTokenId) ?? null;

  const selectProject = useCallback((id: string | null) => {
    setSelectedProjectId(id);
    setSelectedTokenId(null);
  }, []);

  const selectToken = useCallback((id: string | null) => {
    setSelectedTokenId(id);
  }, []);

  const createProject = useCallback((data: Omit<Project, 'id' | 'tokens'>) => {
    const project: Project = { ...data, id: generateId(), tokens: [] };
    setProjects(prev => [...prev, project]);
    setSelectedProjectId(project.id);
    setSelectedTokenId(null);
    return project;
  }, [setProjects]);

  const updateProject = useCallback((id: string, data: Partial<Omit<Project, 'id' | 'tokens'>>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, [setProjects]);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setSelectedProjectId(prev => prev === id ? null : prev);
    setSelectedTokenId(null);
  }, [setProjects]);

  const createToken = useCallback((projectId: string, data: Omit<Token, 'id'>) => {
    const token: Token = { ...data, id: generateId() };
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, tokens: [...p.tokens, token] } : p
    ));
    setSelectedTokenId(token.id);
    return token;
  }, [setProjects]);

  const updateToken = useCallback((projectId: string, tokenId: string, data: Partial<Omit<Token, 'id'>>) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, tokens: p.tokens.map(t => t.id === tokenId ? { ...t, ...data } : t) }
        : p
    ));
  }, [setProjects]);

  const deleteToken = useCallback((projectId: string, tokenId: string) => {
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, tokens: p.tokens.filter(t => t.id !== tokenId) } : p
    ));
    setSelectedTokenId(prev => prev === tokenId ? null : prev);
  }, [setProjects]);

  const replaceProjects = useCallback((incoming: Project[]) => {
    setProjects(() => incoming);
    setSelectedProjectId(null);
    setSelectedTokenId(null);
  }, [setProjects]);

  return {
    projects,
    selectedProject,
    selectedToken,
    selectedProjectId,
    selectedTokenId,
    selectProject,
    selectToken,
    createProject,
    updateProject,
    deleteProject,
    createToken,
    updateToken,
    deleteToken,
    replaceProjects,
  };
}

export type ProjectStore = ReturnType<typeof useProjectStore>;
