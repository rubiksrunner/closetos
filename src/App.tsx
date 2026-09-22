import { type FormEvent, useEffect, useState } from 'react'
import { type Session } from '@supabase/supabase-js'
import './App.css'
import { supabase } from './lib/supabase'

type ClothingItem = {
  id: string
  name: string
  category: string
  colour: string
  season: string
}

const categories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories']

const initialForm = { name: '', category: 'Tops', colour: '', season: 'All seasons' }

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoadingSession, setIsLoadingSession] = useState(true)
  const [items, setItems] = useState<ClothingItem[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null)
  const [form, setForm] = useState(initialForm)
  const [formMessage, setFormMessage] = useState('')
  const [isSavingItem, setIsSavingItem] = useState(false)
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsLoadingSession(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setIsLoadingSession(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setItems([])
      setIsLoadingItems(false)
      return
    }

    async function loadItems() {
      setIsLoadingItems(true)
      const { data, error } = await supabase
        .from('clothing_items')
        .select('id, name, category, colour, season')
        .order('created_at', { ascending: false })

      if (!error && data) {
        setItems(data)
      }
      setIsLoadingItems(false)
    }

    void loadItems()
  }, [session])

  function openNewItemForm() {
    setEditingItem(null)
    setForm(initialForm)
    setFormMessage('')
    setIsFormOpen(true)
  }

  function openEditItemForm(item: ClothingItem) {
    setEditingItem(item)
    setForm({ name: item.name, category: item.category, colour: item.colour ?? '', season: item.season })
    setFormMessage('')
    setIsFormOpen(true)
  }

  function closeItemForm() {
    setIsFormOpen(false)
    setFormMessage('')
  }

  async function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session) return

    setIsSavingItem(true)
    setFormMessage('')
    const query = editingItem
      ? supabase
          .from('clothing_items')
          .update(form)
          .eq('id', editingItem.id)
          .select('id, name, category, colour, season')
          .single()
      : supabase
          .from('clothing_items')
          .insert({ ...form, user_id: session.user.id })
          .select('id, name, category, colour, season')
          .single()
    const { data, error } = await query
    setIsSavingItem(false)

    if (error) {
      setFormMessage(`Your item could not be ${editingItem ? 'updated' : 'saved'}. Please try again.`)
      return
    }

    setItems((currentItems) => editingItem
      ? currentItems.map((item) => item.id === data.id ? data : item)
      : [data, ...currentItems])
    setForm(initialForm)
    setEditingItem(null)
    closeItemForm()
  }

  async function deleteItem(item: ClothingItem) {
    const shouldDelete = window.confirm(`Delete “${item.name}” from your closet? This cannot be undone.`)
    if (!shouldDelete) return

    setDeletingItemId(item.id)
    const { error } = await supabase.from('clothing_items').delete().eq('id', item.id)
    setDeletingItemId(null)

    if (!error) {
      setItems((currentItems) => currentItems.filter((currentItem) => currentItem.id !== item.id))
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  if (isLoadingSession) {
    return <main className="loading-screen">Opening your closet…</main>
  }

  if (!session) {
    return <AuthScreen />
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="ClosetOS home">ClosetOS</a>
        <div className="account-menu">
          <span className="header-note">{session.user.email}</span>
          <button type="button" className="text-button" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <section className="welcome" aria-labelledby="welcome-title">
        <p className="eyebrow">Welcome to your closet</p>
        <h1 id="welcome-title">Style starts with knowing what you own.</h1>
        <p className="intro">
          Keep every piece in one calm, organised place. Add your first item to begin building your digital closet.
        </p>
        <button type="button" className="primary-button" onClick={openNewItemForm}>
          Add your first item
        </button>
      </section>

      <section className="overview" aria-labelledby="overview-title">
        <div>
          <p className="eyebrow">Your closet</p>
          <h2 id="overview-title">{isLoadingItems ? 'Loading your closet…' : items.length === 0 ? 'A fresh start' : 'Your wardrobe'}</h2>
        </div>
        <div className="stats" aria-label="Closet summary">
          <article className="stat-card"><span className="stat-number">{items.length}</span><span className="stat-label">Clothing items</span></article>
          <article className="stat-card"><span className="stat-number">0</span><span className="stat-label">Saved outfits</span></article>
        </div>
      </section>

      {items.length > 0 && (
        <section className="items-section" aria-labelledby="items-title">
          <div className="items-heading">
            <div>
              <p className="eyebrow">Recently added</p>
              <h2 id="items-title">Your pieces</h2>
            </div>
            <button type="button" className="text-button" onClick={openNewItemForm}>Add another</button>
          </div>
          <div className="item-grid">
            {items.map((item) => (
              <article className="item-card" key={item.id}>
                <div className="item-placeholder" aria-hidden="true">{item.category.slice(0, 1)}</div>
                <p className="item-category">{item.category}</p>
                <h3>{item.name}</h3>
                <p className="item-details">{item.colour || 'Colour not set'} · {item.season}</p>
                <div className="card-actions">
                  <button type="button" className="text-button" onClick={() => openEditItemForm(item)}>Edit</button>
                  <button type="button" className="text-button danger-button" onClick={() => void deleteItem(item)} disabled={deletingItemId === item.id}>
                    {deletingItemId === item.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {isFormOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={closeItemForm}>
          <section className="item-form" role="dialog" aria-modal="true" aria-labelledby="form-title" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="close-button" onClick={closeItemForm} aria-label="Close form">×</button>
            <p className="eyebrow">{editingItem ? 'Edit clothing item' : 'New clothing item'}</p>
            <h2 id="form-title">{editingItem ? 'Update your piece' : 'Add a piece to your closet'}</h2>
            <form onSubmit={saveItem}>
              <label>
                Item name
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Black linen shirt" required autoFocus />
              </label>
              <label>
                Category
                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                  {categories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label>
                Colour <span className="optional">Optional</span>
                <input value={form.colour} onChange={(event) => setForm({ ...form, colour: event.target.value })} placeholder="e.g. Black" />
              </label>
              <label>
                Season
                <select value={form.season} onChange={(event) => setForm({ ...form, season: event.target.value })}>
                  <option>All seasons</option><option>Spring</option><option>Summer</option><option>Autumn</option><option>Winter</option>
                </select>
              </label>
              {formMessage && <p className="form-message" role="alert">{formMessage}</p>}
              <button type="submit" className="primary-button" disabled={isSavingItem}>{isSavingItem ? 'Saving…' : editingItem ? 'Save changes' : 'Add to closet'}</button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

function AuthScreen() {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    const result = mode === 'signUp'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })

    setIsSubmitting(false)

    if (result.error) {
      setMessage(result.error.message)
      return
    }

    if (mode === 'signUp' && !result.data.session) {
      setMessage('Check your email to confirm your account, then return here to sign in.')
    }
  }

  const isSignUp = mode === 'signUp'

  return (
    <main className="auth-shell">
      <section className="auth-intro">
        <a className="brand" href="/" aria-label="ClosetOS home">ClosetOS</a>
        <div>
          <p className="eyebrow">Your digital wardrobe</p>
          <h1>Dress with intention.</h1>
          <p className="intro">A private home for every piece you own and every outfit you want to remember.</p>
        </div>
      </section>

      <section className="auth-card" aria-labelledby="auth-title">
        <p className="eyebrow">{isSignUp ? 'Begin your closet' : 'Welcome back'}</p>
        <h2 id="auth-title">{isSignUp ? 'Create your account' : 'Sign in to ClosetOS'}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Email address
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isSignUp ? 'new-password' : 'current-password'} minLength={6} required />
          </label>
          {message && <p className="auth-message" role="status">{message}</p>}
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <button type="button" className="auth-switch" onClick={() => { setMode(isSignUp ? 'signIn' : 'signUp'); setMessage('') }}>
          {isSignUp ? 'Already have an account? Sign in' : 'New to ClosetOS? Create an account'}
        </button>
      </section>
    </main>
  )
}

export default App
