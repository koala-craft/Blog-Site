import { getSupabase } from '~/shared/lib/supabase'

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'doing' | 'done'
  visibility: 'public' | 'private'
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface TaskSummary {
  total: number
  done: number
  doing: number
  todo: number
}

export async function fetchTasks(): Promise<{ tasks: Task[]; summary: TaskSummary }> {
  try {
    const supabase = getSupabase()
    const { data } = supabase
      ? await supabase
          .from('tasks')
          .select('*')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
      : { data: null }

    const tasks = (data ?? []) as Task[]
    const summary: TaskSummary = {
      total: tasks.length,
      done: tasks.filter((t) => t.status === 'done').length,
      doing: tasks.filter((t) => t.status === 'doing').length,
      todo: tasks.filter((t) => t.status === 'todo').length,
    }
    return { tasks, summary }
  } catch {
    return {
      tasks: [],
      summary: { total: 0, done: 0, doing: 0, todo: 0 },
    }
  }
}

export async function fetchTaskSummary(): Promise<{ total: number; done: number }> {
  try {
    const supabase = getSupabase()
    const { data } = supabase
      ? await supabase.from('tasks').select('status').eq('visibility', 'public')
      : { data: null }

    const list = data ?? []
    return {
      total: list.length,
      done: list.filter((t: { status: string }) => t.status === 'done').length,
    }
  } catch {
    return { total: 0, done: 0 }
  }
}
