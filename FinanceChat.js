// FinanceChat.js
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Trash2, Edit3, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export default function FinanceChat() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Olá! Eu sou seu assistente financeiro 💰. Como posso ajudar hoje?" }
  ]);
  const [input, setInput] = useState("");
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem("expenses")) || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem("balance")) || 2000);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => { localStorage.setItem("expenses", JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem("balance", JSON.stringify(balance)); }, [balance]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: "user", text: input }];
    let botReply = "Ainda estou aprendendo a responder sobre finanças pessoais.";

    if (input.toLowerCase().includes("gastei")) {
      const valueMatch = input.match(/(\d+)/);
      const value = valueMatch ? parseFloat(valueMatch[0]) : 0;
      const category = input.split(" ").pop();
      setExpenses([...expenses, { category, value }]);
      setBalance(prev => prev - value);
      botReply = `Anotado ✅! Você registrou uma despesa de R$ ${value}.`;
    } else if (input.toLowerCase().includes("resumo")) {
      const total = expenses.reduce((sum, e) => sum + e.value, 0);
      botReply = `Resumo: R$ ${total} gastos, saldo disponível R$ ${balance}.`;
    } else if (input.toLowerCase().includes("meta")) {
      botReply = "Meta registrada 🎯! Lembre-se de acompanhar mensalmente.";
    } else if (input.toLowerCase().includes("dica")) {
      botReply = "Dica: Tente usar a regra 50/30/20 para equilibrar gastos e poupança.";
    }

    setMessages([...newMessages, { sender: "bot", text: botReply }]);
    setInput("");
  };

  const handleDelete = (index) => { 
    const deleted = expenses[index]; 
    setBalance(prev => prev + deleted.value); 
    setExpenses(expenses.filter((_, i) => i !== index)); 
  };
  
  const handleEdit = (index) => { setEditingIndex(index); setEditValue(expenses[index].value); };
  const handleSaveEdit = () => {
    const oldValue = expenses[editingIndex].value;
    const updated = expenses.map((e, i) => i === editingIndex ? { ...e, value: parseFloat(editValue) } : e);
    setExpenses(updated);
    setBalance(prev => prev + oldValue - parseFloat(editValue));
    setEditingIndex(null); 
    setEditValue("");
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.value, 0);
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA66CC"];

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100'} flex justify-center items-center min-h-screen p-4 transition-colors duration-500`}>
      <Card className={`w-full max-w-md shadow-2xl rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-end">
            <Button size="icon" variant="ghost" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>

          {/* Saldo */}
          <div className={`p-4 rounded-xl shadow-md flex flex-col items-center ${darkMode ? 'bg-gray-700 text-white' : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'}`}>
            <h2 className="text-lg font-semibold">Saldo disponível</h2>
            <p className="text-2xl font-bold">R$ {balance}</p>
            <span className="text-sm">Total de gastos: R$ {totalExpenses}</span>
          </div>

          {/* Chat */}
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} h-72 overflow-y-auto p-3 rounded-lg border shadow-inner transition-colors duration-500`}>
            {messages.map((msg, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`my-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <span className={`px-3 py-2 rounded-xl text-sm shadow transition-all duration-200 ${msg.sender === 'user' ? 'bg-blue-500 text-white hover:bg-blue-600' : darkMode ? 'bg-gray-600 text-white hover:bg-gray-500' : 'bg-gray-200 text-black hover:bg-gray-300'}`}>{msg.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Digite sua mensagem..." className="rounded-xl" />
            <Button onClick={handleSend} className="rounded-xl shadow-md">Enviar</Button>
          </div>

          {/* Sugestões rápidas */}
          <div className="flex gap-2 justify-center">
            <Button size="sm" onClick={() => setInput('resumo')}>Resumo</Button>
            <Button size="sm" onClick={() => setInput('meta')}>Meta</Button>
            <Button size="sm" onClick={() => setInput('dica')}>Dica</Button>
          </div>

          {/* Despesas */}
          {expenses.length > 0 && (
            <div className={`${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-50'} p-3 rounded-lg border space-y-2 shadow transition-colors duration-500`}>
              <h3 className="font-semibold">Suas despesas</h3>
              {expenses.map((e, i) => (
                <div key={i} className={`flex justify-between items-center px-3 py-2 rounded-lg shadow-sm ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                  {editingIndex === i ? (
                    <div className="flex gap-2 items-center w-full">
                      <Input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-20" />
                      <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
                    </div>
                  ) : (
                    <>
                      <span>{e.category}: R$ {e.value}</span>
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(i)}><Edit3 className="w-4 h-4 text-blue-500" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(i)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
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
                <Pie data={expenses} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                  {expenses.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>

              <BarChart width={280} height={200} data={expenses} className="mt-4">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
