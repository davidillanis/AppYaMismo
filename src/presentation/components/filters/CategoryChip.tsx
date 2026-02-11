import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface Props {
  name: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const CategoryChip: React.FC<Props> = ({
  name,
  isSelected,
  onSelect,
}) => {
  return (
    <TouchableOpacity
      onPress={onSelect}
      style={[styles.button, isSelected && styles.activeButton]}
    >
      <Text style={[styles.text, isSelected && styles.activeText]}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#C4A676",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  activeButton: {
    backgroundColor: "#A4243B",
  },
  text: {
    color: "#000",
    fontWeight: "600",
  },
  activeText: {
    color: "#fff",
  },
});
