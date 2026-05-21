import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

function App() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-3xl font-bold">Free Ai Tools</h1>
      <p>Site en cours de reconstruction...</p>
    </div>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
