import React, { useState } from 'react';

import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
};

export default function CreatePostModal({
  visible,
  onClose,
  onSubmit,
}: Props) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    onSubmit({
      text,
    });

    setText('');

    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
    >
      <View style={styles.container}>
        <TextInput
          placeholder="¿Qué está pasando?"
          placeholderTextColor="#999"
          multiline
          value={text}
          onChangeText={setText}
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>
            Publicar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onClose}
        >
          <Text style={styles.cancel}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },

  input: {
    color: '#fff',
    fontSize: 18,
    minHeight: 140,
  },

  button: {
    backgroundColor: '#4DA6FF',
    padding: 16,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 30,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },

  cancel: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});