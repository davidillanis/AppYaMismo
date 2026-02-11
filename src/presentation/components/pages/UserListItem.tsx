import { Colors } from '@/constants/Colors';
import { UserEntity } from '@/src/domain/entities/UserEntity';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface UserListItemProps {
  user: UserEntity;
  onPress: (user: UserEntity) => void;
  onEdit: (user: UserEntity) => void;
  onDelete: (id: number | undefined) => void;
  colors: typeof Colors.light;
  normalize: (size: number) => number;
}

export const UserListItem: React.FC<UserListItemProps> = ({
  user,
  onPress,
  onEdit,
  onDelete,
  colors,
  normalize,
}) => {
  const styles = createStyles(colors, normalize);

  const handleDelete = () => {
    if (!user.id) return;
    Alert.alert(
      "Confirmar Eliminación",
      `¿Estás seguro de eliminar a ${user.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => onDelete(user.id) },
      ],
      { cancelable: true }
    );
  };

  const getUserRoles = () => {
    return user.roles?.map((r) => (r as any).role).join(", ") || "Sin Rol";
  };

  const getStatusColor = () => (user.enabled ? colors.success : colors.error);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(user)}
      activeOpacity={0.8}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: user.imageUrl || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {user.name} {user.lastName}
        </Text>
        <Text style={styles.email} numberOfLines={1}>
          {user.email}
        </Text>
        <Text style={styles.role} numberOfLines={1}>
          {getUserRoles()}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(user)} style={styles.actionButton}>
          <Ionicons name="pencil-outline" size={normalize(20)} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
          <MaterialIcons name="delete-outline" size={normalize(20)} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: typeof Colors.light, normalize: (n: number) => number) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      padding: normalize(12),
      marginVertical: normalize(6),
      borderRadius: normalize(12),
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    avatarContainer: {
      marginRight: normalize(12),
      position: 'relative',
    },
    avatar: {
      width: normalize(50),
      height: normalize(50),
      borderRadius: normalize(25),
    },
    statusIndicator: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: normalize(12),
      height: normalize(12),
      borderRadius: normalize(6),
      borderWidth: 2,
      borderColor: colors.card,
    },
    info: {
      flex: 1,
      justifyContent: 'center',
    },
    name: {
      fontSize: normalize(16),
      fontWeight: '600',
      color: colors.text,
    },
    email: {
      fontSize: normalize(14),
      color: colors.textSecondary,
    },
    role: {
      fontSize: normalize(12),
      color: colors.textTertiary,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: normalize(8),
    },
    actionButton: {
      marginLeft: normalize(8),
      padding: normalize(6),
      borderRadius: normalize(8),
      backgroundColor: colors.surfaceVariant,
    },
  });

export default UserListItem;
