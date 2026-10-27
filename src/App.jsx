import { useEffect, useState } from 'react'
import './App.css'
import { Card, Form, Spinner } from 'react-bootstrap'

function App() {
  const [characters, setCharacters] = useState([])
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('')
  const [status, setStatus] = useState('')
  const [visibleLimit, setVisibleLimit] = useState('20')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const buscarCharacters = async () => {
      setLoading(true)
      setError(false)

      const params = new URLSearchParams()
      if (name.trim()) params.set('name', name.trim())
      if (species) params.set('species', species)
      if (status) params.set('status', status)

      try {
        const response = await fetch(
          `https://rickandmortyapi.com/api/character/?${params.toString()}`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          setCharacters([])
          setError(true)
          return
        }

        const data = await response.json()
        let results = data.results || []
        const target = Number(visibleLimit)
        let nextPage = data.info?.next ? 2 : null

        while (results.length < target && nextPage) {
          const pageParams = new URLSearchParams(params)
          pageParams.set('page', String(nextPage))
          const pageResponse = await fetch(
            `https://rickandmortyapi.com/api/character/?${pageParams.toString()}`,
            { signal: controller.signal }
          )
          if (!pageResponse.ok) break
          const pageData = await pageResponse.json()
          results = results.concat(pageData.results || [])
          nextPage = pageData.info?.next ? nextPage + 1 : null
        }

        setCharacters(results.slice(0, target))
      } catch (err) {
        if (err.name !== 'AbortError') setError(true)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    buscarCharacters()
    return () => controller.abort()
  }, [name, species, status, visibleLimit])

  return (
    <main className="app-container">
      <header className="page-header">
        <p className="eyebrow">UNIVERSO RICK Y MORTY</p>
        <h1>Buscador de personajes</h1>
        <p className="subtitle">Encuentra a tus personajes favoritos de la dimensión C-137.</p>
      </header>

      <section className="filters" aria-label="Filtros de personajes">
        <Form.Group className="search-field">
          <Form.Label>Buscar por nombre</Form.Label>
          <Form.Control
            type="search"
            placeholder="Ej. Rick Sanchez..."
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>Especie</Form.Label>
          <Form.Select value={species} onChange={(event) => setSpecies(event.target.value)}>
            <option value="">Todas las especies</option>
            <option value="Human">Humano</option>
            <option value="Alien">Alienígena</option>
            <option value="Humanoid">Humanoide</option>
            <option value="Animal">Animal</option>
            <option value="Robot">Robot</option>
            <option value="Cronenberg">Cronenberg</option>
            <option value="Mythological Creature">Criatura mitológica</option>
            <option value="Poopybutthole">Poopybutthole</option>
            <option value="Disease">Enfermedad</option>
            <option value=" unknown">Desconocida</option>
          </Form.Select>
        </Form.Group>

        <Form.Group>
          <Form.Label>Estado</Form.Label>
          <Form.Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Todos los estados</option>
            <option value="alive">Vivo</option>
            <option value="dead">Muerto</option>
            <option value="unknown">Desconocido</option>
          </Form.Select>
        </Form.Group>

        <Form.Group>
          <Form.Label>Tarjetas visibles</Form.Label>
          <Form.Select value={visibleLimit} onChange={(event) => setVisibleLimit(event.target.value)}>
            <option value="5">5 tarjetas</option>
            <option value="10">10 tarjetas</option>
            <option value="15">15 tarjetas</option>
            <option value="20">20 tarjetas</option>
            <option value="30">30 tarjetas</option>
            <option value="40">40 tarjetas</option>
            <option value="50">50 tarjetas</option>
            <option value="100">100 tarjetas</option>
          </Form.Select>
        </Form.Group>
      </section>

      <div className="results-heading">
        <h2>Personajes</h2>
        <span>{characters.length} {characters.length === 1 ? 'resultado' : 'resultados'} · mostrando hasta {visibleLimit}</span>
      </div>

      {loading ? (
        <div className="message"><Spinner animation="border" role="status" /><span>Buscando personajes...</span></div>
      ) : error ? (
        <div className="message empty-state">
          <span className="empty-icon">🛸</span>
          <h3>No encontramos personajes</h3>
          <p>Prueba con otro nombre o cambia los filtros.</p>
        </div>
      ) : characters.length === 0 ? (
        <div className="message empty-state">
          <span className="empty-icon">🛸</span>
          <h3>No hay resultados</h3>
          <p>Prueba con otro nombre o cambia los filtros.</p>
        </div>
      ) : (
        <section className="character-grid" aria-label="Resultados de personajes">
          {characters.map((character) => (
            <Card className="character-card" key={character.id}>
              <div className="image-wrap">
                <Card.Img variant="top" src={character.image} alt={character.name} />
                <span className={`status-pill ${character.status.toLowerCase()}`}>
                  <span className="status-dot" />
                  {character.status === 'Alive' ? 'Vivo' : character.status === 'Dead' ? 'Muerto' : 'Desconocido'}
                </span>
              </div>
              <Card.Body>
                <Card.Title>{character.name}</Card.Title>
                <Card.Text className="character-species">{character.species}</Card.Text>
                <div className="character-details">
                  <p><span>Género</span><strong>{character.gender}</strong></p>
                  <p><span>Origen</span><strong>{character.origin?.name || 'Desconocido'}</strong></p>
                  <p><span>Ubicación</span><strong>{character.location?.name || 'Desconocida'}</strong></p>
                </div>
              </Card.Body>
            </Card>
          ))}
        </section>
      )}
      <footer>Puedes elegir cuántos personajes mostrar por búsqueda</footer>
    </main>
  )
}

export default App
