import { Card, Statistic } from 'antd'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  PieChartOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'

interface StatCardsProps {
  activeCount: number
  doneCount: number
  totalCount: number
  permissionCount: number
}

interface CardItem {
  title: string
  value: number | string
  suffix?: string
  icon: ReactNode
  iconClass: string
}

export function StatCards({ activeCount, doneCount, totalCount, permissionCount }: StatCardsProps) {
  const percent = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100)

  const items: CardItem[] = [
    {
      title: '进行中待办',
      value: activeCount,
      icon: <ClockCircleOutlined />,
      iconClass: 'bg-blue-500/10 text-blue-500',
    },
    {
      title: '已完成待办',
      value: doneCount,
      icon: <CheckCircleOutlined />,
      iconClass: 'bg-green-500/10 text-green-500',
    },
    {
      title: '待办完成率',
      value: percent,
      suffix: '%',
      icon: <PieChartOutlined />,
      iconClass: 'bg-purple-500/10 text-purple-500',
    },
    {
      title: '授权权限点',
      value: permissionCount,
      icon: <SafetyCertificateOutlined />,
      iconClass: 'bg-cyan-500/10 text-cyan-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title} variant="borderless" className="shadow-sm">
          <div className="flex items-center justify-between">
            <Statistic title={item.title} value={item.value} suffix={item.suffix} />
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${item.iconClass}`}
            >
              {item.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
