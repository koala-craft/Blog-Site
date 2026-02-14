import { CheckCircle2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { sendContact } from './contactApi'

const INPUT_STYLES =
  'w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed'

const LABEL_STYLES = 'block text-sm font-medium text-zinc-300 mb-1.5'

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<
    { type: 'success' | 'error'; text: string } | null
  >(null)
  const [submitted, setSubmitted] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setResult(null)
    setSending(true)

    const res = await sendContact({ data: { name, email, message } })
    setSending(false)

    if (res.success) {
      setSubmitted(true)
    } else {
      setResult({
        type: 'error',
        text: res.error ?? '送信に失敗しました。しばらく経ってからお試しください。',
      })
      resultRef.current?.focus()
    }
  }

  if (submitted) {
    return <ContactSuccess />
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
    >
      <div>
        <label htmlFor="contact-name" className={LABEL_STYLES}>
          お名前 <span className="text-zinc-500" aria-hidden>必須</span>
        </label>
        <input
          id="contact-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={100}
          autoComplete="name"
          className={INPUT_STYLES}
          placeholder="山田 太郎"
          disabled={sending}
          aria-required="true"
          aria-invalid={result?.type === 'error' ? 'true' : undefined}
        />
      </div>

      <div>
        <label htmlFor="contact-email" className={LABEL_STYLES}>
          メールアドレス <span className="text-zinc-500" aria-hidden>必須</span>
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={254}
          autoComplete="email"
          className={INPUT_STYLES}
          placeholder="example@email.com"
          disabled={sending}
          aria-required="true"
          aria-invalid={result?.type === 'error' ? 'true' : undefined}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className={LABEL_STYLES}>
          お問い合わせ内容{' '}
          <span className="text-zinc-500" aria-hidden>必須</span>
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          maxLength={5000}
          rows={6}
          className={`${INPUT_STYLES} resize-y min-h-[140px]`}
          placeholder="お問い合わせ内容をご記入ください"
          disabled={sending}
          aria-required="true"
          aria-invalid={result?.type === 'error' ? 'true' : undefined}
          aria-describedby="contact-message-hint"
        />
        <p
          id="contact-message-hint"
          className="text-xs text-zinc-500 mt-1.5 tabular-nums"
        >
          {message.length.toLocaleString()} / 5,000 文字
        </p>
      </div>

      {result?.type === 'error' && (
        <div
          ref={resultRef}
          role="alert"
          tabIndex={-1}
          className="rounded-lg px-4 py-3 text-sm bg-amber-500/10 text-amber-400 border border-amber-500/20"
        >
          {result.text}
        </div>
      )}

      <button
        type="submit"
        disabled={sending}
        className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-zinc-950 min-w-[120px]"
      >
        {sending ? (
          <>
            <span
              className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              aria-hidden
            />
            送信中
          </>
        ) : (
          '送信する'
        )}
      </button>
    </form>
  )
}

function ContactSuccess() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  return (
    <div
      ref={containerRef}
      className="max-w-md mx-auto text-center py-12"
      role="status"
      aria-live="polite"
      tabIndex={-1}
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mb-6">
        <CheckCircle2 className="w-10 h-10" aria-hidden />
      </div>
      <h2 className="text-xl font-semibold text-zinc-100 mb-2">
        送信完了
      </h2>
      <p className="text-zinc-500 text-sm leading-relaxed">
        お問い合わせいただきありがとうございます。
        内容を確認のうえ、2〜3営業日以内にご返信いたします。
      </p>
    </div>
  )
}
