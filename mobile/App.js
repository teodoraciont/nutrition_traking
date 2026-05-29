import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nutrition Tracker</Text>
      <Text style={styles.subtitle}>Hello, Theo 👋</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f2eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e1e1e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#F5C842',
    fontWeight: '600',
  },
});
