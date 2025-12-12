import { useEffect, useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    console.log(import.meta.env.VITE_API_URL)
  }, [])

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-200">
        <h1 className="text-4xl font-bold mb-4 text-slate-100 text-blue-300">This is a placeholder</h1>
        <h1 className="text-4xl font-bold mb-4 text-slate-100">Vite + React + Tailwind CSS</h1>
        <div className="text-2xl mb-4">Count: {count}</div>
        <div className="space-x-2">
          <button
            className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400"
            onClick={() => setCount((c) => c + 1)}
          >
            Increment
          </button>
          <button
            className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500"
            onClick={() => setCount((c) => c - 1)}
          >
            Decrement
          </button>
        </div>
      </div>
    </>
  )
}

export default App
