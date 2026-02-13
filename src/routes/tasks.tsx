import { createFileRoute, Link } from '@tanstack/react-router'
import { fetchTasks } from '~/features/tasks/api'

export const Route = createFileRoute('/tasks')({
  component: TasksPage,
  loader: () => fetchTasks(),
})

function TasksPage() {
  const { tasks, summary } = Route.useLoaderData()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="text-cyan-400 hover:underline mb-4 inline-block">
        ← トップ
      </Link>
      <h1 className="text-3xl font-bold mb-8">タスク一覧</h1>

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

      <section>
        <h2 className="text-xl font-semibold mb-4">消化率</h2>
        <p className="text-2xl font-mono">
          {summary.total > 0
            ? `${summary.done} / ${summary.total} (${Math.round((summary.done / summary.total) * 100)}%)`
            : '---'}
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">タスク一覧</h2>
        <ul className="space-y-2">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="flex items-center gap-4 p-3 bg-zinc-800 rounded"
            >
              <span
                className={`text-xs px-2 py-1 rounded ${
                  t.status === 'done'
                    ? 'bg-green-900 text-green-300'
                    : t.status === 'doing'
                      ? 'bg-yellow-900 text-yellow-300'
                      : 'bg-zinc-700 text-zinc-300'
                }`}
              >
                {t.status}
              </span>
              <span>{t.title}</span>
            </li>
          ))}
          {tasks.length === 0 && (
            <li className="text-zinc-500">タスクがありません</li>
          )}
        </ul>
      </section>
    </div>
  )
}
