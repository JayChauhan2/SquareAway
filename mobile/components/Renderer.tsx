import React from 'react';
import { View, StyleSheet } from 'react-native';
import Markdown, { MarkdownProps } from 'react-native-markdown-display';

interface RendererProps {
  content: string;
  color?: string;
}

export default function Renderer({ content, color = '#1e293b' }: RendererProps) {
  return (
    <View style={styles.container}>
      <Markdown
        style={{
          body: { color, fontSize: 16, lineHeight: 24 },
          code_inline: { backgroundColor: 'rgba(0,0,0,0.05)', padding: 4, borderRadius: 4 },
          fence: { backgroundColor: '#1e293b', color: '#f8fafc', padding: 12, borderRadius: 8 },
          blockquote: { borderLeftColor: '#6366f1', borderLeftWidth: 4, paddingLeft: 12, color: '#64748b' },
          heading1: { fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
          heading2: { fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
        }}
      >
        {content}
      </Markdown>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
