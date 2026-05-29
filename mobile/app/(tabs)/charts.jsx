import { useState } from 'react'
import { ScrollView, View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Polyline, Circle, Line } from 'react-native-svg'
import { colors, radius } from '../../constants/theme'
import { WEIGHT_START, WEIGHT_GOAL, GYM_GOAL } from '../../constants/data'
import { useEntries } from '../../hooks/useEntries'
import { getWeeklyGym, fmtDate } from '../../utils/stats'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const Y_AXIS_WIDTH = 38
const CHART_W = SCREEN_WIDTH - 64 - Y_AXIS_WIDTH
const BAR_H = 120
const LINE_H = 160

function YAxis({ values }) {
  return (
    <View style={{ width: Y_AXIS_WIDTH, height: BAR_H, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 6 }}>
      {values.map((v, i) => (
        <Text key={i} style={styles.axisLabel}>{v}</Text>
      ))}
    </View>
  )
}

function BarChart({ data, labels, yLabels, color, maxVal, unit = '', detailLabels }) {
  const [selected, setSelected] = useState(null)
  const n = data.length
  const barW = Math.floor((CHART_W - (n - 1) * 3) / n)

  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <YAxis values={yLabels} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: BAR_H, gap: 3 }}>
            {data.map((val, i) => {
              const h = val ? Math.max(4, Math.round((val / maxVal) * BAR_H)) : 4
              const isSelected = selected === i
              const barColor = isSelected ? colors.accent : color
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelected(isSelected ? null : i)}
                  activeOpacity={0.7}
                  style={{ alignItems: 'center', justifyContent: 'flex-end', height: BAR_H, width: barW }}
                >
                  <View style={{ width: barW, height: h, backgroundColor: barColor, borderRadius: 3 }} />
                </TouchableOpacity>
              )
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: 3, marginTop: 6 }}>
            {labels.map((label, i) => (
              <Text key={i} style={[styles.xLabel, { width: barW }]} numberOfLines={1}>{label}</Text>
            ))}
          </View>
        </View>
      </View>
      {selected !== null && (
        <View style={{ marginTop: 8, backgroundColor: colors.lightGray, borderRadius: 10, padding: 10, flexDirection: 'row', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
          <Text style={{ fontSize: 13, color: colors.gray }}>{detailLabels ? detailLabels[selected] : labels[selected]}</Text>
          <Text style={{ fontSize: 13, color: colors.dark, fontWeight: '700' }}>{data[selected].toLocaleString()}{unit}</Text>
        </View>
      )}
    </View>
  )
}

function GymBarChart({ data }) {
  const [selected, setSelected] = useState(null)
  const n = data.length
  const barW = Math.floor((CHART_W - (n - 1) * 4) / n)
  const labels = data.map(([week]) => {
    const d = new Date(week + 'T00:00:00')
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <YAxis values={[GYM_GOAL, 2, 1, 0]} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: BAR_H, gap: 4 }}>
            {data.map(([week, count], i) => {
              const h = count ? Math.min(BAR_H, Math.max(8, Math.round((count / GYM_GOAL) * BAR_H))) : 4
              const atGoal = count >= GYM_GOAL
              const isSelected = selected === i
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelected(isSelected ? null : i)}
                  activeOpacity={0.7}
                  style={{ alignItems: 'center', justifyContent: 'flex-end', height: BAR_H, width: barW }}
                >
                  {count > 0 && <Text style={styles.barValue}>{count}</Text>}
                  <View style={{ width: barW, height: h, backgroundColor: isSelected ? '#888' : (atGoal ? colors.dark : colors.accent), borderRadius: 3 }} />
                </TouchableOpacity>
              )
            })}
          </View>
          <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
            {labels.map((label, i) => (
              <Text key={i} style={[styles.xLabel, { width: barW, color: selected === i ? colors.dark : colors.gray, fontWeight: selected === i ? '700' : 'normal' }]} numberOfLines={1}>{label}</Text>
            ))}
          </View>
        </View>
      </View>
      {selected !== null && (
        <View style={{ marginTop: 8, backgroundColor: colors.lightGray, borderRadius: 10, padding: 10, alignItems: 'center' }}>
          <Text style={{ fontSize: 13, color: colors.dark, fontWeight: '600' }}>
            Week of {labels[selected]} · {data[selected][1]} session{data[selected][1] !== 1 ? 's' : ''}
          </Text>
        </View>
      )}
      <View style={styles.legend}>
        <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
        <Text style={styles.legendText}>Below goal</Text>
        <View style={[styles.legendDot, { backgroundColor: colors.dark, marginLeft: 12 }]} />
        <Text style={styles.legendText}>Goal reached</Text>
      </View>
    </View>
  )
}

const RANGES = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: 'All', days: null },
]

function WeightLineChart({ entries }) {
  const [tooltip, setTooltip] = useState(null)
  const [range, setRange] = useState('3M')

  const selectedDays = RANGES.find(r => r.label === range)?.days
  const cutoff = selectedDays
    ? new Date(Date.now() - selectedDays * 86400000).toISOString().slice(0, 10)
    : null

  const weightEntries = entries
    .filter(e => e.weight != null && (!cutoff || e.date >= cutoff))

  if (weightEntries.length < 2) return null

  const weights = weightEntries.map(e => e.weight)
  const minW = Math.floor(Math.min(...weights)) - 1
  const maxW = Math.ceil(Math.max(...weights)) + 1
  const n = weightEntries.length

  const getX = i => (i / (n - 1)) * CHART_W
  const getY = w => LINE_H - ((w - minW) / (maxW - minW)) * LINE_H
  const midW = Math.round((minW + maxW) / 2)
  const points = weightEntries.map((e, i) => `${getX(i)},${getY(e.weight)}`).join(' ')
  const xLabels = weightEntries.map(e => fmtDate(e.date))

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
        {RANGES.map(r => (
          <TouchableOpacity
            key={r.label}
            onPress={() => { setRange(r.label); setTooltip(null) }}
            style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: range === r.label ? colors.dark : colors.lightGray }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: range === r.label ? '#fff' : colors.gray }}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: Y_AXIS_WIDTH, height: LINE_H, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 6 }}>
          <Text style={styles.axisLabel}>{maxW}</Text>
          <Text style={styles.axisLabel}>{midW}</Text>
          <Text style={styles.axisLabel}>{minW}</Text>
        </View>
        <View>
          <View style={{ position: 'relative' }}>
            <Svg width={CHART_W} height={LINE_H}>
              {[maxW, midW, minW].map(w => (
                <Line key={w} x1={0} y1={getY(w)} x2={CHART_W} y2={getY(w)} stroke="rgba(0,0,0,0.06)" strokeWidth={1} />
              ))}
              <Line x1={0} y1={getY(WEIGHT_GOAL)} x2={CHART_W} y2={getY(WEIGHT_GOAL)} stroke={colors.accent} strokeWidth={1} strokeDasharray="5,5" />
              <Polyline points={points} fill="none" stroke={colors.accent} strokeWidth={2.5} strokeLinejoin="round" />
              {weightEntries.map((e, i) => (
                <Circle key={i} cx={getX(i)} cy={getY(e.weight)} r={tooltip?.i === i ? 7 : 5} fill={tooltip?.i === i ? colors.dark : colors.accent} />
              ))}
            </Svg>

            {/* Touch targets overlaid as RN views */}
            {weightEntries.map((e, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setTooltip(tooltip?.i === i ? null : { i, entry: e })}
                style={{ position: 'absolute', left: getX(i) - 20, top: getY(e.weight) - 20, width: 40, height: 40 }}
              />
            ))}

            {tooltip && (() => {
              const x = getX(tooltip.i)
              const left = Math.min(Math.max(x - 40, 0), CHART_W - 90)
              return (
                <View style={[styles.tooltip, { left }]}>
                  <Text style={styles.tooltipDate}>{fmtDate(tooltip.entry.date)}</Text>
                  <Text style={styles.tooltipWeight}>{tooltip.entry.weight} kg</Text>
                </View>
              )
            })()}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, width: CHART_W }}>
            <Text style={styles.axisLabel}>{xLabels[0]}</Text>
            <Text style={styles.axisLabel}>{xLabels[Math.floor(n / 2)]}</Text>
            <Text style={styles.axisLabel}>{xLabels[n - 1]}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.goalHint}>-- goal: {WEIGHT_GOAL} kg</Text>
    </View>
  )
}

export default function Charts() {
  const { entries, loading } = useEntries()

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.dark} />
        </View>
      </SafeAreaView>
    )
  }

  const last14 = entries.slice(-14)
  const gymWeeks = getWeeklyGym(entries)
  const kcalMax = Math.ceil(Math.max(...last14.map(e => e.kcal ?? 0)) / 500) * 500
  const proteinData = last14.map(e => e.protein ?? 0)
  const proteinMax = Math.ceil(Math.max(...proteinData) / 40) * 40
  const kcal14dAvg = Math.round(last14.reduce((s, e) => s + (e.kcal ?? 0), 0) / last14.length)
  const protein14dAvg = Math.round(proteinData.filter(v => v > 0).reduce((s, v) => s + v, 0) / proteinData.filter(v => v > 0).length)
  const kcalLabels = last14.map((e, i) => i % 2 === 0 ? fmtDate(e.date) : '')
  const proteinLabels = last14.map((e, i) => i % 2 === 0 ? fmtDate(e.date) : '')
  const dayLabels = last14.map(e => fmtDate(e.date))

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Charts</Text>

        <View style={styles.card}>
          <Text style={styles.chartTitle}>Workouts per week</Text>
          <Text style={styles.chartSub}>Goal: {GYM_GOAL}x · last 8 weeks</Text>
          <GymBarChart data={gymWeeks} />
        </View>

        <View style={styles.card}>
          <Text style={styles.chartTitle}>Weight evolution</Text>
          <Text style={styles.chartSub}>Start {WEIGHT_START} kg · tap a dot for details</Text>
          <WeightLineChart entries={entries} />
        </View>

        <View style={styles.card}>
          <Text style={styles.chartTitle}>Daily calories</Text>
          <Text style={styles.chartSub}>Last 14 days · avg {kcal14dAvg.toLocaleString()} kcal</Text>
          <BarChart
            data={last14.map(e => e.kcal ?? 0)}
            labels={kcalLabels}
            detailLabels={dayLabels}
            unit=" kcal"
            yLabels={[kcalMax, Math.round(kcalMax * 0.5), 0]}
            color="#d9d5cc"
            maxVal={kcalMax}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.chartTitle}>Daily protein</Text>
          <Text style={styles.chartSub}>Last 14 days · avg {protein14dAvg}g</Text>
          <BarChart
            data={proteinData}
            labels={proteinLabels}
            detailLabels={dayLabels}
            unit="g"
            yLabels={[proteinMax, Math.round(proteinMax * 0.5), 0]}
            color={colors.dark}
            maxVal={proteinMax}
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1, paddingHorizontal: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.dark, paddingTop: 16, paddingBottom: 20 },
  card: { backgroundColor: colors.card, borderRadius: radius, padding: 20, marginBottom: 12 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: colors.dark, marginBottom: 2 },
  chartSub: { fontSize: 12, color: colors.gray, marginBottom: 16 },
  axisLabel: { fontSize: 10, color: colors.gray },
  xLabel: { fontSize: 9, color: colors.gray, textAlign: 'center' },
  barValue: { fontSize: 10, color: colors.gray, marginBottom: 2 },
  legend: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: colors.gray, marginLeft: 4 },
  tooltip: {
    position: 'absolute', top: -48,
    backgroundColor: colors.dark, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 6,
    width: 90, alignItems: 'center',
  },
  tooltipDate: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  tooltipWeight: { fontSize: 15, fontWeight: '700', color: colors.accent },
  goalHint: { fontSize: 11, color: colors.gray, marginTop: 4 },
})
