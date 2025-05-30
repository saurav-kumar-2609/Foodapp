// app/index.tsx
import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the menu screen when the app starts
  return <Redirect href="/menu" />;
}
