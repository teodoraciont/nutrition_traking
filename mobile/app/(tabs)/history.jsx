import { useState } from 'react'
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors, radius } from '../../constants/theme'
import { useEntries } from '../../hooks/useEntries'
import { fmtDate } from '../../utils/stats'

const todayStr = new Date().toISOString().slice(0, 10)

function Row({ entry }) {
  const [open, setOpen] = useState(false)
  const isToday = entry.date === todayStr

  return (
    <TouchableOpacity onPress={() => setOpen(!open)} activeOpacity={0.7}>
      <View style={[styles.row, isToday && styles.rowToday]}>
        <View style={styles.rowLeft}>
          <Text style={[styles.dateText, isToday && styles.dateBold]}>{fmtDate(entry.date)}</Text>
          <View style={styles.badges}>
            {entry.gym && <View style={styles.gymBadge}><Text style={styles.gymBadgeText}>✓ gym</Text></View>}
          </View>
        </View>

        <View style={styles.rowCenter}>
          <Text style={[styles.kcalText, isToday && styles.dateBold]}>{entry.kcal != null ? entry.kcal.toLocaleString() : '—'}</Text>
          {entry.protein != null && (
            <Text style={styles.proteinText}>{entry.protein}g</Text>
          )}
        </View>

        <View style={styles.rowRight}>
          {entry.weight != null && (
            <View style={styles.weightBadge}>
              <Text style={styles.weightBadgeText}>{entry.weight}</Text>
            </View>
          )}
          <Text style={styles.arrow}>{open ? '▲' : '▼'}</Text>
        </View>
      </View>

      {open && entry.foodNote && (
        <View style={styles.expanded}>
          {entry.foodNote.split('\n').map((line, i) => (
            <Text key={i} style={styles.foodLine}>• {line}</Text>
          ))}
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>✎ Edit</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  )
}

export default function History() {
  const { entries, loading } = useEntries()
  const sorted = [...entries].reverse()

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.dark} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>History</Text>
        <View style={styles.card}>
          {sorted.map((entry, i) => (
            <View key={entry.date}>
              {i > 0 && <View style={styles.divider} />}
              <Row entry={entry} />
            </View>
          ))}
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
  card: { backgroundColor: colors.card, borderRadius: radius, overflow: 'hidden', marginBottom: 20 },
  divider: { height: 1, backgroundColor: '#f0ede6', marginHorizontal: 16 },

  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowToday: { backgroundColor: '#fffdf5' },
  rowLeft: { width: 90 },
  rowCenter: { flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  dateText: { fontSize: 14, color: colors.gray },
  dateBold: { fontWeight: '700', color: colors.dark },
  badges: { flexDirection: 'row', gap: 4, marginTop: 3 },

  gymBadge: { backgroundColor: colors.dark, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  gymBadgeText: { fontSize: 10, color: '#fff', fontWeight: '600' },

  kcalText: { fontSize: 16, fontWeight: '600', color: colors.dark },
  proteinText: { fontSize: 13, color: colors.gray },

  weightBadge: { backgroundColor: colors.accent, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  weightBadgeText: { fontSize: 12, fontWeight: '700', color: colors.dark },
  arrow: { fontSize: 10, color: colors.gray },

  expanded: { paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4 },
  foodLine: { fontSize: 13, color: colors.dark, marginBottom: 3, lineHeight: 20 },
  editBtn: { marginTop: 10, alignSelf: 'flex-start', backgroundColor: colors.lightGray, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  editBtnText: { fontSize: 13, color: colors.gray },
})
