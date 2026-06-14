import { Card, CardContent } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const weeklyData = [
  { day: 'Seg', receita: 420, cortes: 7 },
  { day: 'Ter', receita: 380, cortes: 6 },
  { day: 'Qua', receita: 510, cortes: 9 },
  { day: 'Qui', receita: 450, cortes: 8 },
  { day: 'Sex', receita: 620, cortes: 11 },
  { day: 'Sáb', receita: 780, cortes: 14 },
  { day: 'Dom', receita: 200, cortes: 3 },
]

const pieData = [
  { name: 'Corte', value: 60 },
  { name: 'Barba', value: 25 },
  { name: 'Combo', value: 15 },
]

const COLORS = ['#D32F2F', '#fca5a5', '#b91c1c']

export function RechartsComponents() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-gray-500 mb-2">Faturamento Semanal</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklyData}>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1A1A',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: 12,
              }}
            />
            <Bar dataKey="receita" fill="#D32F2F" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500 mb-2">Serviços</p>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={45}
                dataKey="value"
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-2">Performance</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={weeklyData}>
              <XAxis dataKey="day" tick={{ fontSize: 8 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Line type="monotone" dataKey="cortes" stroke="#D32F2F" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
