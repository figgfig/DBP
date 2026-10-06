import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/card';
import { Screen } from '@/components/screen';
import { AppText } from '@/components/text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Studio } from '@/lib/content';

const address = `${Studio.address.line1}, ${Studio.address.city}, ${Studio.address.state} ${Studio.address.zip}`;
const mapsUrl = Platform.select({
  ios: `maps:0,0?q=${encodeURIComponent(address)}`,
  default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
});

export default function ContactScreen() {
  const theme = useTheme();

  const rows: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; onPress: () => void }[] = [
    { icon: 'call-outline', label: 'Phone', value: Studio.phone, onPress: () => Linking.openURL(`tel:${Studio.phoneDial}`) },
    { icon: 'mail-outline', label: 'Email', value: Studio.email, onPress: () => Linking.openURL(`mailto:${Studio.email}`) },
    { icon: 'location-outline', label: 'Studio', value: address, onPress: () => Linking.openURL(mapsUrl) },
    { icon: 'globe-outline', label: 'Website', value: Studio.website.replace('https://', ''), onPress: () => WebBrowser.openBrowserAsync(Studio.website) },
    { icon: 'logo-facebook', label: 'Facebook', value: 'DuBose Photography', onPress: () => WebBrowser.openBrowserAsync(Studio.facebookUrl) },
  ];

  return (
    <Screen>
      <AppText variant="title">{Studio.name}</AppText>
      <AppText color="textSecondary" style={styles.intro}>
        Questions about a session, your proofs, or an order? We’d love to hear from you.
      </AppText>
      <Card padded={false}>
        {rows.map((row, i) => (
          <Pressable
            key={row.label}
            accessibilityRole="link"
            accessibilityLabel={`${row.label}: ${row.value}`}
            onPress={() => row.onPress()}
            style={({ pressed }) => [
              styles.row,
              i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border },
              pressed && { backgroundColor: theme.surfaceAlt },
            ]}>
            <Ionicons name={row.icon} size={22} color={theme.accent} />
            <View style={styles.rowText}>
              <AppText variant="caption">{row.label}</AppText>
              <AppText>{row.value}</AppText>
            </View>
            <Ionicons name="open-outline" size={18} color={theme.textMuted} />
          </Pressable>
        ))}
      </Card>

      <Card>
        <AppText variant="subheading">Hosting a session?</AppText>
        <AppText color="textSecondary" style={styles.repBody}>
          Contact {Studio.representative.name}, representative for {Studio.representative.states.join(', ')}.
        </AppText>
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(`tel:${Studio.representative.phoneDial}`)} style={styles.phone}>
          <Ionicons name="call-outline" size={18} color={theme.accent} />
          <AppText variant="label" color="accent">
            {Studio.representative.phone}
          </AppText>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginVertical: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  rowText: { flex: 1 },
  repBody: { marginVertical: Spacing.xs },
  phone: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingVertical: 4 },
});
