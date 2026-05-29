import { useState } from 'react'
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, radius } from '../../constants/theme'
import { WEIGHT_START, WEIGHT_GOAL, GYM_GOAL } from '../../constants/data'
import { useEntries } from '../../hooks/useEntries'
import { getLast7Avg, getWeightAvg7d, getGymSessionsThisWeek, getDaysSinceStart } from '../../utils/stats'

export default function Dashboard() {
  const [foodText, setFoodText] = useState('')
  const { entries, loading, error } = useEntries()

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.dark} />
        </View>
      </SafeAreaView>
    )
  }

  if (error || !entries.length) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ color: colors.dark, fontWeight: '700', marginBottom: 8 }}>Could not load data</Text>
          <Text style={{ color: colors.gray, fontSize: 12, textAlign: 'center' }}>{error?.message ?? 'Backend not reachable — is it running?'}</Text>
        </View>
      </SafeAreaView>
    )
  }

  const today = entries[entries.length - 1]
  const kcal7dAvg = getLast7Avg(entries, 'kcal')
  const protein7dAvg = getLast7Avg(entries, 'protein')
  const weightCurrent = getWeightAvg7d(entries)
  const weightLost = Math.round((WEIGHT_START - weightCurrent) * 10) / 10
  const weightRemaining = Math.round((weightCurrent - WEIGHT_GOAL) * 10) / 10
  const weightProgress = weightLost / (WEIGHT_START - WEIGHT_GOAL)
  const gymThisWeek = getGymSessionsThisWeek(entries)
  const daysSinceStart = getDaysSinceStart(entries)

  const now = new Date()
  const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning, Theo</Text>
          <Text style={styles.subtitle}>
            {todayStr} · {daysSinceStart} days since you started
          </Text>
        </View>

        {/* Kcal + Protein row */}
        <View style={styles.row}>
          <View style={[styles.card, styles.accentCard]}>
            <Text style={styles.cardLabel}>KCAL TODAY</Text>
            <Text style={styles.cardValue}>{today?.kcal ?? '—'}</Text>
            <Text style={styles.cardSub}>7d avg: {kcal7dAvg.toLocaleString()}</Text>
          </View>
          <View style={[styles.card, styles.whiteCard]}>
            <Text style={styles.cardLabel}>PROTEIN TODAY</Text>
            <Text style={styles.cardValue}>{today?.protein != null ? `${today.protein}g` : '—'}</Text>
            <Text style={styles.cardSub}>7d avg: {protein7dAvg}g</Text>
          </View>
        </View>

        {/* Add food */}
        <View style={[styles.card, styles.whiteCard, styles.fullCard]}>
          <Text style={styles.addFoodLabel}>Add food</Text>
          <TextInput
            multiline
            numberOfLines={3}
            placeholder="e.g. 2 eggs and oatmeal with blueberries..."
            placeholderTextColor={colors.gray}
            value={foodText}
            onChangeText={setFoodText}
            style={styles.addFoodInput}
            textAlignVertical="top"
          />
          <TouchableOpacity style={[styles.parseButton, !foodText && styles.parseButtonDisabled]} disabled={!foodText}>
            <Text style={styles.parseButtonText}>✨ Parse with AI</Text>
          </TouchableOpacity>
        </View>

        {/* Gym tracker */}
        <View style={[styles.card, styles.whiteCard, styles.fullCard]}>
          <View style={styles.gymHeader}>
            <View>
              <Text style={styles.gymTitle}>Workout this week</Text>
              <Text style={styles.gymSub}>Goal: {GYM_GOAL}x / week</Text>
            </View>
            <Text style={styles.gymCount}>
              <Text style={styles.gymCountBig}>{gymThisWeek}</Text>/{GYM_GOAL}
            </Text>
          </View>
          <View style={styles.gymDots}>
            {Array.from({ length: GYM_GOAL }).map((_, i) => (
              <View key={i} style={[styles.dot, i < gymThisWeek && styles.dotFilled]} />
            ))}
          </View>
          <TouchableOpacity style={styles.gymButton}>
            <Text style={styles.gymButtonText}>Log workout today 💪</Text>
          </TouchableOpacity>
        </View>

        {/* Weight progress */}
        <View style={[styles.card, styles.darkCard, styles.fullCard]}>
          <Text style={styles.weightLabel}>WEIGHT PROGRESS</Text>
          <View style={styles.weightRow}>
            <View>
              <Text style={styles.weightMeta}>start</Text>
              <Text style={styles.weightSide}>{WEIGHT_START} kg</Text>
            </View>
            <View style={styles.weightCenter}>
              <Text style={styles.weightMeta}>7-day avg</Text>
              <Text style={styles.weightCurrent}>{weightCurrent} <Text style={styles.weightKg}>kg</Text></Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.weightMeta}>goal</Text>
              <Text style={styles.weightSide}>{WEIGHT_GOAL} kg</Text>
            </View>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${Math.round(weightProgress * 100)}%` }]} />
          </View>
          <Text style={styles.progressPct}>{Math.round(weightProgress * 100)}% complete</Text>
          <View style={styles.weightStats}>
            <View style={styles.weightStatCard}>
              <Text style={styles.weightStatLabel}>lost</Text>
              <Text style={styles.weightStatValue}>–{weightLost} kg</Text>
            </View>
            <View style={styles.weightStatCard}>
              <Text style={styles.weightStatLabel}>remaining</Text>
              <Text style={styles.weightStatValue}>{weightRemaining} kg</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1, paddingHorizontal: 16 },
  header: { paddingTop: 16, paddingBottom: 20 },
  greeting: { fontSize: 26, fontWeight: 'bold', color: colors.dark },
  subtitle: { fontSize: 13, color: colors.gray, marginTop: 4 },

  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: { borderRadius: radius, padding: 18 },
  accentCard: { flex: 1, backgroundColor: colors.accent },
  whiteCard: { flex: 1, backgroundColor: colors.card },
  fullCard: { flex: undefined, marginBottom: 12 },

  cardLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(0,0,0,0.5)', letterSpacing: 0.5, marginBottom: 6 },
  cardValue: { fontSize: 36, fontWeight: 'bold', color: colors.dark },
  cardSub: { fontSize: 12, color: 'rgba(0,0,0,0.5)', marginTop: 4 },

  addFoodLabel: { fontSize: 13, fontWeight: '600', color: colors.gray, marginBottom: 8 },
  addFoodInput: {
    fontSize: 15, color: colors.dark, minHeight: 72,
    borderWidth: 1, borderColor: '#ebe8e0', borderRadius: 12,
    padding: 12, marginBottom: 12,
  },
  parseButton: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  parseButtonDisabled: { opacity: 0.4 },
  parseButtonText: { fontSize: 14, fontWeight: '700', color: colors.dark },

  gymHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  gymTitle: { fontSize: 16, fontWeight: '700', color: colors.dark },
  gymSub: { fontSize: 12, color: colors.gray, marginTop: 2 },
  gymCount: { fontSize: 14, color: colors.gray, fontWeight: '500' },
  gymCountBig: { fontSize: 22, fontWeight: 'bold', color: colors.dark },
  gymDots: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  dot: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.lightGray },
  dotFilled: { backgroundColor: colors.dark },
  gymButton: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  gymButtonText: { fontSize: 15, fontWeight: '700', color: colors.dark },

  darkCard: { backgroundColor: colors.dark },
  weightLabel: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5, marginBottom: 16 },
  weightRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  weightMeta: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  weightSide: { fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  weightCenter: { alignItems: 'center' },
  weightCurrent: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' },
  weightKg: { fontSize: 18, fontWeight: '400' },
  progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, marginBottom: 8 },
  progressFill: { height: 6, backgroundColor: colors.accent, borderRadius: 3 },
  progressPct: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 14 },
  weightStats: { flexDirection: 'row', gap: 10 },
  weightStatCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12 },
  weightStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  weightStatValue: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
})
