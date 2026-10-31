import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Text, TextInputProps, TouchableWithoutFeedback } from 'react-native';
import { colors } from '../../theme';

type Props = TextInputProps & {
  label: string;
  multiline?: boolean;
};

export default function FloatingLabelInput({ label, multiline, style, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  return (
    <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
      <View style={[styles.wrapper, multiline && styles.wrapperMulti, focused && styles.wrapperFocused, style as any]}>
        <Text style={[styles.label, focused && styles.labelFocused]}>{label}</Text>
        <TextInput
          ref={inputRef}
          style={[styles.input, multiline && styles.inputMulti]}
          placeholderTextColor={colors.subtle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...props}
        />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1.5,
    borderColor: colors.subtle,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: colors.white,
  },
  wrapperMulti: { paddingBottom: 14, minHeight: 110 },
  wrapperFocused: { borderColor: colors.primary },
  label: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 4,
    fontWeight: '500',
  },
  labelFocused: { color: colors.primary },
  input: {
    fontSize: 15,
    color: colors.dark,
    padding: 0,
  },
  inputMulti: { minHeight: 72 },
});
