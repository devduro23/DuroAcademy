import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const PodcastScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Podcast</Text>
      <Text style={styles.subtitle}>Listen to our latest episodes</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#6b7280',
  },
});

export default PodcastScreen;