"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type LegendProps,
} from "recharts";
import { type ComponentProps, type HTMLAttributes } from "react";

import { cn } from "@pergon/ui/lib/utils";

type ChartDatum = Record<string, string | number | null | undefined>;

export interface ChartSeries {
  key: string;
  name?: string;
}

export interface ChartContainerProps extends HTMLAttributes<HTMLDivElement> {
  height?: number;
}

function ChartContainer({ children, className, height = 240, ...props }: ChartContainerProps) {
  return (
    <div className={cn("w-full", className)} style={{ minHeight: height }} {...props}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function ChartTooltip(props: ComponentProps<typeof Tooltip>) {
  return <Tooltip cursor={{ stroke: "hsl(var(--border))" }} {...props} />;
}

function ChartLegend(props: LegendProps) {
  return <Legend {...props} />;
}

interface ChartBaseProps<T extends ChartDatum> {
  data: T[];
  dataKey: keyof T & string;
  series: ChartSeries[];
  height?: number;
  className?: string;
}

function chartColor(index: number) {
  return `hsl(var(--chart-${(index % 5) + 1}))`;
}

function LineChartBase<T extends ChartDatum>({
  className,
  data,
  dataKey,
  height,
  series,
}: ChartBaseProps<T>) {
  return (
    <ChartContainer className={className} height={height}>
      <LineChart data={data}>
        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={dataKey as never} axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} width={36} />
        <ChartTooltip />
        <ChartLegend />
        {series.map((item, index) => (
          <Line
            key={item.key}
            type="monotone"
            dataKey={item.key}
            name={item.name ?? item.key}
            stroke={chartColor(index)}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}

function BarChartBase<T extends ChartDatum>({
  className,
  data,
  dataKey,
  height,
  series,
}: ChartBaseProps<T>) {
  return (
    <ChartContainer className={className} height={height}>
      <BarChart data={data}>
        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={dataKey as never} axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} width={36} />
        <ChartTooltip />
        <ChartLegend />
        {series.map((item, index) => (
          <Bar
            key={item.key}
            dataKey={item.key}
            name={item.name ?? item.key}
            fill={chartColor(index)}
            radius={4}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

function AreaChartBase<T extends ChartDatum>({
  className,
  data,
  dataKey,
  height,
  series,
}: ChartBaseProps<T>) {
  return (
    <ChartContainer className={className} height={height}>
      <AreaChart data={data}>
        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={dataKey as never} axisLine={false} tickLine={false} />
        <YAxis axisLine={false} tickLine={false} width={36} />
        <ChartTooltip />
        <ChartLegend />
        {series.map((item, index) => (
          <Area
            key={item.key}
            type="monotone"
            dataKey={item.key}
            name={item.name ?? item.key}
            stroke={chartColor(index)}
            fill={chartColor(index)}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}

export {
  AreaChartBase,
  BarChartBase,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  LineChartBase,
  type ChartBaseProps,
  type ChartDatum,
};
