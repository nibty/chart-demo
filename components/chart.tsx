import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  TimeScale,
  TimeSeriesScale,
} from 'chart.js';

import {Line} from 'react-chartjs-2';
import useSWR from 'swr';
import 'chartjs-adapter-date-fns';
import type {ChartData, ChartOptions, ChartDataset} from 'chart.js';
import getConfig from "next/config";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  TimeScale,
  TimeSeriesScale,
);

const {publicRuntimeConfig} = getConfig()

interface MyChartProps {
  title?: string;
  endpoint?: string;
  baseApiUrl?: string;
  colorPalette?: string[];
  filterDataPoints?: any;
}

interface EventTrendEntry {
  [key: string]: number
}

function hexToRGB(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
  } else {
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
  }
}

export const defaultColorPalette: string[] = [
'#004c6d',
'#055e80',
'#0e7194',
'#1685a7',
'#2099ba',
'#2baecc',
'#38c3de',
'#46d9ef',
'#56efff'
]

export const altColorPalette: string[] = [
  '#003f5c',
  '#2f4b7c',
  '#665191',
  '#a05195',
  '#d45087',
  '#f95d6a',
  '#ff7c43',
  '#ffa600',
  '#ffd800'
]

export const retroColorPalette: string[] = [
  "#ea5545",
  "#f46a9b",
  "#ef9b20",
  "#edbf33",
  "#ede15b",
  "#bdcf32",
  "#87bc45",
  "#27aeef",
  "#b33dc6"
];

export const pastelColorPalette: string[] = [
  "#fd7f6f",
  "#7eb0d5",
  "#b2e061",
  "#bd7ebe",
  "#ffb55a",
  "#ffee65",
  "#beb9db",
  "#fdcce5",
  "#8bd3c7",
  "#8bd3c7"
]

function generateChartData(
  eventTrendEntries: EventTrendEntry[],
  colorPalette: string[]
): ChartData<'line'> {
  const labels = eventTrendEntries.map(eventTrendEntry => eventTrendEntry.blockTimestamp);
  let dataKeys: string[] = Object.keys(eventTrendEntries[0])
    .filter(key => key !== 'blockTimestamp')

  const dataSets: ChartDataset<'line'>[] = [];

  let i = 0;
  for (const dataKey of dataKeys) {
    const data: number[] = eventTrendEntries.map(eventTrendEntry => eventTrendEntry[dataKey]);
    dataSets.push({
      label: dataKey,
      fill: true,
      data: data,
      borderColor: colorPalette[i],
      backgroundColor: hexToRGB(colorPalette[i], .4),
      pointRadius: 2,
    });
    i++;
  }

  return {
    labels: labels,
    datasets: dataSets,
  };
}

function chartOptions(title?: string): ChartOptions<'line'> {
  return {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: Boolean(title),
        text: title || '',
      },
    },
    scales: {
      x: {
        type: 'timeseries',
      },
    }
  }
}

export function MyChart({
                          title,
                          endpoint = '/v1/trends/events',
                          baseApiUrl = publicRuntimeConfig.baseApiUrl,
                          colorPalette = defaultColorPalette
                        }: MyChartProps) {
  const {data, error} = useSWR(`${baseApiUrl}${endpoint}`, (apiURL: string) => {
    return fetch(apiURL).then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      return res.json()
    })
  });

  if (error) return <div>Failed to load</div>;
  if (!data || data.length === 0) return <div>loading...</div>;
  const chartData = generateChartData(data, colorPalette);

  return <Line options={chartOptions(title)} data={chartData}/>;
}
