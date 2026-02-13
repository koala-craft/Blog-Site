import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import type { Task } from '~/features/tasks/api'
import {
  fetchAdminTasks,
  createTask,
  updateTaskStatus,
  updateTaskTitle,
  updateTaskVisibility,
  deleteTask,
} from '~/features/tasks/adminApi'

export const Route = createFileRoute('/admin/tasks')({
  component: AdminTasks,
})

const STATUS_LABELS: Record<string, string> = {
  todo: '未着手',
  doing: '進行中',
  done: '完了',
}

const STATUS_ORDER: Array<'todo' | 'doing' | 'done'> = ['todo', 'doing', 'done']

function nextStatus(current: string): 'todo' | 'doing' | 'done' {
  const i = STATUS_ORDER.indexOf(current as 'todo' | 'doing' | 'done')
  return STATUS_ORDER[(i + 1) % 3]
}

function AdminTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadTasks = async () => {
    setLoading(true)
    const list = await fetchAdminTasks()
    setTasks(list)
    setLoading(false)
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setAdding(true)
    const result = await createTask({ title: newTitle })
    setAdding(false)
    if (result.success) {
      setNewTitle('')
      await loadTasks()
      setMessage({ type: 'success', text: 'タスクを追加しました' })
    } else {
      setMessage({ type: 'error', text: result.error ?? '追加に失敗しました' })
    }
  }

  const handleStatusClick = async (task: Task) => {
    const next = nextStatus(task.status)
    const result = await updateTaskStatus(task.id, next)
    if (result.success) await loadTasks()
  }

  const handleEditStart = (task: Task) => {
    setEditingId(task.id)
    setEditTitle(task.title)
  }

  const handleEditSave = async (id: string) => {
    const result = await updateTaskTitle(id, editTitle)
    if (result.success) {
      setEditingId(null)
      await loadTasks()
    } else {
      setMessage({ type: 'error', text: result.error ?? '更新に失敗しました' })
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const handleVisibilityToggle = async (task: Task) => {
    const next = task.visibility === 'public' ? 'private' : 'public'
    const result = await updateTaskVisibility(task.id, next)
    if (result.success) await loadTasks()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このタスクを削除しますか？')) return
    const result = await deleteTask(id)
    if (result.success) await loadTasks()
  }

  const summary = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === 'done').length,
    doing: tasks.filter((t) => t.status === 'doing').length,
    todo: tasks.filter((t) => t.status === 'todo').length,
  }

  if (loading && tasks.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">タスク管理（Todo）</h1>
        <p className="text-zinc-500">読み込み中...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">タスク管理（Todo）</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-800 p-4 rounded">
          <div className="text-2xl font-mono">{summary.total}</div>
          <div className="text-sm text-zinc-500">合計</div>
        </div>
        <div className="bg-zinc-800 p-4 rounded">
          <div className="text-2xl font-mono text-green-400">{summary.done}</div>
          <div className="text-sm text-zinc-500">完了</div>
        </div>
        <div className="bg-zinc-800 p-4 rounded">
          <div className="text-2xl font-mono text-yellow-400">{summary.doing}</div>
          <div className="text-sm text-zinc-500">進行中</div>
        </div>
        <div className="bg-zinc-800 p-4 rounded">
          <div className="text-2xl font-mono text-zinc-400">{summary.todo}</div>
          <div className="text-sm text-zinc-500">未着手</div>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-8">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="新しいタスク"
          className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          maxLength={200}
        />
        <button
          type="submit"
          disabled={adding || !newTitle.trim()}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white font-medium rounded transition"
        >
          追加
        </button>
      </form>

      {message && (
        <p
          className={`mb-4 text-sm ${
            message.type === 'success' ? 'text-green-400' : 'text-amber-400'
          }`}
        >
          {message.text}
        </p>
      )}

      <ul className="space-y-2">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 p-3 bg-zinc-800 rounded group"
          >
            <button
              type="button"
              onClick={() => handleStatusClick(task)}
              className={`text-xs px-2 py-1 rounded shrink-0 ${
                task.status === 'done'
                  ? 'bg-green-900 text-green-300 hover:bg-green-800'
                  : task.status === 'doing'
                    ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {STATUS_LABELS[task.status]}
            </button>

            {editingId === task.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 px-2 py-1 bg-zinc-700 rounded text-zinc-100"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave(task.id)
                    if (e.key === 'Escape') handleEditCancel()
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleEditSave(task.id)}
                  className="px-2 py-1 bg-cyan-600 text-white text-sm rounded"
                >
                  保存
                </button>
                <button
                  type="button"
                  onClick={handleEditCancel}
                  className="px-2 py-1 bg-zinc-600 text-zinc-300 text-sm rounded"
                >
                  キャンセル
                </button>
              </div>
            ) : (
              <>
                <span
                  className={`flex-1 ${
                    task.status === 'done' ? 'line-through text-zinc-500' : ''
                  }`}
                >
                  {task.title}
                </span>
                <button
                  type="button"
                  onClick={() => handleEditStart(task)}
                  className="text-zinc-500 hover:text-cyan-400 text-sm opacity-0 group-hover:opacity-100 transition"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => handleVisibilityToggle(task)}
                  className={`text-xs px-2 py-1 rounded ${
                    task.visibility === 'public'
                      ? 'bg-cyan-900/50 text-cyan-300'
                      : 'bg-zinc-700 text-zinc-400'
                  }`}
                  title={task.visibility === 'public' ? '公開（サイトに表示）' : '非公開'}
                >
                  {task.visibility === 'public' ? '公開' : '非公開'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  className="text-zinc-500 hover:text-red-400 text-sm opacity-0 group-hover:opacity-100 transition"
                >
                  削除
                </button>
              </>
            )}
          </li>
        ))}
        {tasks.length === 0 && (
          <li className="text-zinc-500 py-8 text-center">タスクがありません</li>
        )}
      </ul>
    </div>
  )
}
