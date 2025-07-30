'use client'

import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  secondaryDescription?: string
  trend?: {
    value: number
    label: string
  }
  icon?: React.ReactNode
  className?: string
}

export default function MetricCard({
  title,
  value,
  description,
  secondaryDescription,
  trend,
  icon,
  className
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null
    
    if (trend.value > 0) {
      return <TrendingUp />
    } else if (trend.value < 0) {
      return <TrendingDown />
    } else {
      return <TrendingUp />
    }
  }

  return (
    <Card className={cn("@container/card", className)}>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">{value}</CardTitle>
        {trend && (
          <CardAction>
            <Badge variant="outline">
              {getTrendIcon()}
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        {(description || trend) && (
          <div className="line-clamp-1 flex gap-2 font-medium">
            {trend ? trend.label : description} {getTrendIcon() && <span className="size-4">{getTrendIcon()}</span>}
          </div>
        )}
        {secondaryDescription && (
          <div className="text-muted-foreground">{secondaryDescription}</div>
        )}
      </CardFooter>
    </Card>
  )
}