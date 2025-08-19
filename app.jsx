import { useEffect, useMemo, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { Sun, Moon, Edit3, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function App() {
  // -------------------- STATE --------------------
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Olá! Eu sou seu assistente financeiro 💰. Como posso ajudar hoje?' }
  ])
  const [input, setInput] = useState('')
  const [expenses, setExpenses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('expenses')) || [] } catch { return [] }
  })
  const [editingIndex, setEditingIndex] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [balance, setBalance] = useState(() => {
    try { return JSON.parse(localStorage.getItem('balance')) ?? 2000 } catch { return 2000 }
  })
  const [darkMode, setDarkMode] = useState(false)

  // -------------------- EFFECTS --------------------
  useEffect(() => { try { localStorage.setItem('expenses', JSON.stringify(expenses)) } catch {} }, [expenses])
  useEffect(() => { try { localStorage.setItem('balance', JSON.stringify(balance)) } catch {} }, [balance])
  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode) }, [darkMode])

  // -------------------- DERIVED DATA --------------------
  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + Number(e.value || 0), 0), [expenses])
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC']

  // Agrupa despesas por categoria para os gráficos
  const aggregated = useMemo(() => {
    const map = new Map()
    for (const { category, value } of expenses) {
      const v = Number(value || 0)
      map.set(category, (map.get(category) || 0) + v)
    }
    return Array.from(map, ([category, value]) => ({ category, value }))
  }, [expenses])

  // -------------------- HELPERS --------------------
  function parseValue(raw) {
    if (!raw) return 0
    const n = String(raw).replace(',', '.')
    const f = parseFloat(n)
    return Number.isFinite(f) ? f : 0
  }

  // -------------------- ACTIONS --------------------
  const handleSend = () => {
    if (!input.trim()) return
    const text = input.trim()
    const newMessages = [...messages, { sender: 'user', text }]
    let botReply = 'Ainda estou aprendendo a responder sobre finanças pessoais.'

    const lower = text.toLowerCase()
    if (lower.includes('gastei')) {
      // Ex.: "gastei 120 mercado" → valor = 120, categoria = mercado
      const valueMatch = text.match(/([0-9]+([\.,][0-9]+)?)/)
      const value = parseValue(valueMatch?.[1])
      const parts = text.split(/\s+/)
      const category = parts[parts.length - 1]
      setExpenses(prev => [...prev, { category, value }])
      setBalance(prev => prev - value)
      botReply = `Anotado ✅! Você registrou uma despesa de R$ ${value.toFixed(2)}.`
    } else if (lower.includes('resumo')) {
      botReply = `Resumo: R$ ${totalExpenses.toFixed(2)} gastos, saldo disponível R$ ${balance.toFixed(2)}.`
    } else if (lower.includes('meta')) {
      botReply = 'Meta registrada 🎯! Lembre-se de acompanhar mensalmente.'
    } else if (lower.includes('dica')) {
      botReply = 'Dica: Use a regra 50/30/20 para equilibrar despesas e poupança.'
    }

    setMessages([...newMessages, { sender: 'bot', text: botReply }])
    setInput('')
  }

  const handleDelete = (index) => {
    const deleted = expenses[index]
    setBalance(prev => prev + Number(deleted?.value || 0))
    setExpenses(expenses.filter((_, i) => i !== index))
  }

  const handleEdit = (index) => {
    setEditingIndex(index)
    setEditValue(String(expenses[index].value))
  }

  const handleSaveEdit = () => {
    const oldValue = Number(expenses[editingIndex].value)
    const newValue = parseValue(editValue)
    const updated = expenses.map((e, i) => i === editingIndex ? { ...e, value: newValue } : e)
    setExpenses(updated)
    setBalance(prev => prev + oldValue - newValue)
    setEditingIndex(null)
    setEditValue('')
  }

  // -------------------- UI --------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 p-4 dark:bg-gray-900 dark:text-white">
      <div className="w-full max-w-md card bg-white dark:bg-gray-800">
        <div className="p-4 space-y-4">
          {/* Toggle Dark Mode */}
          <div className="flex justify-end">
            <button className="btn btn-ghost" onClick={() => setDarkMode(v => !v)} aria-label="Alternar modo escuro">
              {darkMode ? <Sun size={20}/> : <Moon size={20}/>} 
            </button>
          </div>

          {/* Saldo */}
          <div className={`p-4 rounded-xl shadow-md flex flex-col items-center ${darkMode ? 'bg-gray-700 text-white' : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'}`}>
            <h2 className="text-lg font-semibold">Saldo disponível</h2>
            <p className="text-2xl font-bold">R$ {balance.toFixed(2)}</p>
            <span className="text-sm">Total de gastos: R$ {totalExpenses.toFixed(2)}</span>
          </div>

          {/* Chat */}
          <div className={`h-72 overflow-y-auto p-3 rounded-lg border shadow-inner transition-colors duration-500 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            {messages.map((msg, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`my-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span className={`px-3 py-2 rounded-xl text-sm shadow transition-all duration-200 ${msg.sender === 'user' ? 'bg-blue-600 text-white hover:bg-blue-700' : darkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-black hover:bg-gray-300'}`}>{msg.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input className="input" value={input} onChange={e => setInput(e.target.value)} placeholder="Digite sua mensagem..." onKeyDown={e => e.key==='Enter' && handleSend()} />
            <button className="btn btn-primary" onClick={handleSend}>Enviar</button>
          </div>

          {/* Sugestões rápidas */}
          <div className="flex gap-2 justify-center">
            <button className="btn btn-ghost" onClick={() => setInput('resumo')}>Resumo</button>
            <button className="btn btn-ghost" onClick={() => setInput('meta')}>Meta</button>
            <button className="btn btn-ghost" onClick={() => setInput('dica')}>Dica</button>
          </div>

          {/* Lista de despesas */}
          {expenses.length > 0 && (
            <div className={`p-3 rounded-lg border space-y-2 shadow transition-colors duration-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'}`}>
              <h3 className="font-semibold">Suas despesas</h3>
              {expenses.map((e, i) => (
                <div key={i} className={`flex justify-between items-center px-3 py-2 rounded-lg shadow-sm ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                  {editingIndex === i ? (
                    <div className="flex gap-2 items-center w-full">
                      <input type="number" className="input w-24" value={editValue} onChange={ev => setEditValue(ev.target.value)} />
                      <button className="btn btn-primary" onClick={handleSaveEdit}>Salvar</button>
                    </div>
                  ) : (
                    <>
                      <span>{e.category}: R$ {Number(e.value).toFixed(2)}</span>
                      <div className="flex gap-1">
                        <button className="btn btn-ghost" onClick={() => handleEdit(i)} aria-label="Editar"><Edit3 size={18} className="text-blue-500"/></button>
                        <button className="btn btn-ghost" onClick={() => handleDelete(i)} aria-label="Excluir"><Trash2 size={18} className="text-red-500"/></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Gráficos */}
          {expenses.length > 0 && (
            <div className="flex flex-col items-center mt-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
              <PieChart width={280} height={280}>
                <Pie data={aggregated} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {aggregated.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>

              <BarChart width={280} height={200} data={aggregated} className="mt-4">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
