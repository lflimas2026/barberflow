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

interface RechartsComponentsProps {
  weeklyData?: { day: string; receita: number; cortes: number }[]
  pieData?: { name: string; value: number }[]
}

const defaultWeeklyData = [
  { day: 'Seg', receita: 0, cortes: 0 },
  { day: 'Ter', receita: 0, cortes: 0 },
  { day: 'Qua', receita: 0, cortes: 0 },
  { day: 'Qui', receita: 0, cortes: 0 },
  { day: 'Sex', receita: 0, cortes: 0 },
  { day: 'Sáb', receita: 0, cortes: 0 },
  { day: 'Dom', receita: 0, cortes: 0 },
]

const defaultPieData = [
  { name: 'Corte', value: 0 },
  { name: 'Barba', value: 0 },
  { name: 'Combo', value: 0 },
]

const COLORS = ['#D32F2F', '#fca5a5', '#b91c1c']

export function RechartsComponents({
  weeklyData = defaultWeeklyData,
  pieData = defaultPieData,
}: RechartsComponentsProps) {
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