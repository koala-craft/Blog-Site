/**
 * 管理者用タスク API（CRUD）
 * RLS で管理者のみ実行可能
 */

import { getSupabase } from '~/shared/lib/supabase'
import type { Task } from './api'

const TITLE_MAX = 200
const DESCRIPTION_MAX = 2000

export async function fetchAdminTasks(): Promise<Task[]> {
  const supabase = getSupabase()
  if (!supabase) return []
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
  return (data ?? []) as Task[]
}

export interface CreateTaskInput {
  title: string
  description?: string
  visibility?: 'public' | 'private'
}

export async function createTask(
  input: CreateTaskInput
): Promise<{ success: boolean; error?: string }> {
  const title = input.title.trim()
  if (!title) return { success: false, error: 'タイトルを入力してください' }
  if (title.length > TITLE_MAX) {
    return { success: false, error: `タイトルは${TITLE_MAX}文字以内で入力してください` }
  }
  const description = input.description?.trim() ?? null
  if (description && description.length > DESCRIPTION_MAX) {
    return { success: false, error: `説明は${DESCRIPTION_MAX}文字以内で入力してください` }
  }

  const supabase = getSupabase()
  if (!supabase) return { success: false, error: 'Supabase が設定されていません' }

  const { error } = await supabase.from('tasks').insert({
    title,
    description: description || null,
    status: 'todo',
    visibility: input.visibility ?? 'public',
  })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function updateTaskStatus(
  id: string,
  status: 'todo' | 'doing' | 'done'
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) return { success: false, error: 'Supabase が設定されていません' }

  const now = new Date().toISOString()
  const updates: Record<string, unknown> = {
    status,
    updated_at: now,
  }

  // ステータスに応じて started_at, completed_at を更新
  const { data: current } = await supabase
    .from('tasks')
    .select('status')
    .eq('id', id)
    .single()

  if (current) {
    if (status === 'doing' && (current as { status: string }).status !== 'doing') {
      updates.started_at = now
    } else if (status === 'done') {
      updates.completed_at = now
    } else if (status === 'todo') {
      updates.started_at = null
      updates.completed_at = null
    }
  }

  const { error } = await supabase.from('tasks').update(updates).eq('id', id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function updateTaskTitle(
  id: string,
  title: string
): Promise<{ success: boolean; error?: string }> {
  const trimmed = title.trim()
  if (!trimmed) return { success: false, error: 'タイトルを入力してください' }
  if (trimmed.length > TITLE_MAX) {
    return { success: false, error: `タイトルは${TITLE_MAX}文字以内で入力してください` }
  }

  const supabase = getSupabase()
  if (!supabase) return { success: false, error: 'Supabase が設定されていません' }

  const { error } = await supabase
    .from('tasks')
    .update({ title: trimmed, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function updateTaskVisibility(
  id: string,
  visibility: 'public' | 'private'
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) return { success: false, error: 'Supabase が設定されていません' }

  const { error } = await supabase
    .from('tasks')
    .update({ visibility, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function deleteTask(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase()
  if (!supabase) return { success: false, error: 'Supabase が設定されていません' }

  const { error } = await supabase.from('tasks').delete().eq('id', id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
