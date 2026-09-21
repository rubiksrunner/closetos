import { type FormEvent, useState } from 'react'
import './App.css'

type ClothingItem = {
  id: number
  name: string
  category: string
  colour: string
  season: string
}

const categories = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes', 'Accessories']

const initialForm = { name: '', category: 'Tops', colour: '', season: 'All seasons' }

function App() {
  const [items, setItems] = useState<ClothingItem[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [form, setForm] = useState(initialForm)

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setItems((currentItems) => [
      ...currentItems,
      { id: Date.now(), ...form },
    ])
    setForm(initialForm)
    setIsFormOpen(false)
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="ClosetOS home">ClosetOS</a>
        <span className="header-note">Your digital wardrobe</span>
      </header>

      <section className="welcome" aria-labelledby="welcome-title">
        <p className="eyebrow">Welcome to your closet</p>
        <h1 id="welcome-title">Style starts with knowing what you own.</h1>
        <p className="intro">
          Keep every piece in one calm, organised place. Add your first item to begin building your digital closet.
        </p>
        <button type="button" className="primary-button" onClick={() => setIsFormOpen(true)}>
          Add your first item
        </button>
      </section>

      <section className="overview" aria-labelledby="overview-title">
        <div>
          <p className="eyebrow">Your closet</p>
          <h2 id="overview-title">A fresh start</h2>
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
            <button type="button" className="text-button" onClick={() => setIsFormOpen(true)}>Add another</button>
          </div>
          <div className="item-grid">
            {items.map((item) => (
              <article className="item-card" key={item.id}>
                <div className="item-placeholder" aria-hidden="true">{item.category.slice(0, 1)}</div>
                <p className="item-category">{item.category}</p>
                <h3>{item.name}</h3>
                <p className="item-details">{item.colour || 'Colour not set'} · {item.season}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {isFormOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setIsFormOpen(false)}>
          <section className="item-form" role="dialog" aria-modal="true" aria-labelledby="form-title" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="close-button" onClick={() => setIsFormOpen(false)} aria-label="Close form">×</button>
            <p className="eyebrow">New clothing item</p>
            <h2 id="form-title">Add a piece to your closet</h2>
            <form onSubmit={addItem}>
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
              <button type="submit" className="primary-button">Add to closet</button>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default App
