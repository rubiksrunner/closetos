import './App.css'

function App() {
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
        <button type="button" className="primary-button">Add your first item</button>
      </section>

      <section className="overview" aria-labelledby="overview-title">
        <div>
          <p className="eyebrow">Your closet</p>
          <h2 id="overview-title">A fresh start</h2>
        </div>
        <div className="stats" aria-label="Closet summary">
          <article className="stat-card"><span className="stat-number">0</span><span className="stat-label">Clothing items</span></article>
          <article className="stat-card"><span className="stat-number">0</span><span className="stat-label">Saved outfits</span></article>
        </div>
      </section>
    </main>
  )
}

export default App
