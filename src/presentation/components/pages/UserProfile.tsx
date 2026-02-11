import React, { useEffect, useMemo } from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/src/presentation/context/AuthContext";
import { useRouter } from "expo-router";

import { UserEntity } from "@/src/domain/entities/UserEntity";
import { useUserById } from "../../hooks/useUserById";

const fallbackAvatar =
  "https://ui-avatars.com/api/?name=Usuario&background=273E47&color=ffffff&bold=true";

const safe = (v?: string | null) => (v && String(v).trim() ? String(v) : "—");

export default function UserProfile() {
  const scheme = useColorScheme();
  const palette = Colors[scheme ?? "light"];
  const router = useRouter();

  const { user: sessionUser, isLoading: isAuthLoading, logout } = useAuth();

  // ✅ DATOS REALES DEL BACKEND
  const userId = sessionUser?.id;
  const { data, isLoading: isProfileLoading } = useUserById(userId);

  // ✅ normaliza ResponseStatusDTO<UserEntity>
  const profile: UserEntity | undefined =
    (data as any)?.data?.data ?? (data as any)?.data;

  // ✅ mezcla sesión + backend (backend tiene prioridad)
  const mergedUser: UserEntity | undefined = useMemo(():
    | UserEntity
    | undefined => {
    if (!sessionUser && !profile) return undefined;

    return {
      id: sessionUser?.id ?? profile?.id,
      name: profile?.name ?? sessionUser?.name,
      lastName: profile?.lastName ?? sessionUser?.lastName,
      email: profile?.email ?? sessionUser?.email,
      imageUrl: profile?.imageUrl ?? sessionUser?.imageUrl,

      dni: profile?.dni,
      phone: profile?.phone,
      address: profile?.address,
      registrationDate: profile?.registrationDate,
      enabled: profile?.enabled,
      emailVerified: profile?.emailVerified,
      roles: profile?.roles,
    } as UserEntity;
  }, [sessionUser, profile]);

  // ✅ protección: si no hay sesión, al login
  useEffect(() => {
    if (!isAuthLoading && !sessionUser) {
      router.replace("/login");
    }
  }, [isAuthLoading, sessionUser, router]);

  const fullName = useMemo(() => {
    const name =
      `${mergedUser?.name ?? ""} ${mergedUser?.lastName ?? ""}`.trim();
    return name.length ? name : "Usuario";
  }, [mergedUser?.name, mergedUser?.lastName]);

  const avatarUri = mergedUser?.imageUrl || fallbackAvatar;

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // ✅ LOADING
  if (isAuthLoading || isProfileLoading) {
    return (
      <View style={[styles.center, { backgroundColor: palette.background }]}>
        <ActivityIndicator />
        <Text style={{ color: palette.textSecondary, marginTop: 10 }}>
          Cargando perfil...
        </Text>
      </View>
    );
  }

  // ✅ mientras redirige o si falló carga
  if (!mergedUser) {
    return (
      <View style={[styles.center, { backgroundColor: palette.background }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: palette.card,
              borderColor: palette.borderVariant,
              shadowColor: palette.border,
            },
          ]}
        >
          <View style={styles.avatarWrap}>
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          </View>

          <View style={styles.headerInfo}>
            <Text
              style={[
                styles.name,
                { color: palette.text, fontFamily: palette.fontPrimary },
              ]}
              numberOfLines={1}
            >
              {fullName}
            </Text>

            <Text
              style={[
                styles.email,
                {
                  color: palette.textSecondary,
                  fontFamily: palette.fontSecondary,
                },
              ]}
              numberOfLines={1}
            >
              {safe(mergedUser.email)}
            </Text>
          </View>
        </View>

        {/* INFO */}
        <Text
          style={[
            styles.sectionTitle,
            { color: palette.text, fontFamily: palette.fontPrimary },
          ]}
        >
          Información personal
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.card,
              borderColor: palette.borderVariant,
              shadowColor: palette.border,
            },
          ]}
        >
          <InfoRow
            label="ID"
            value={String(mergedUser.id ?? "—")}
            palette={palette}
          />
          <Divider palette={palette} />

          <InfoRow
            label="Nombre"
            value={safe(mergedUser.name)}
            palette={palette}
          />
          <Divider palette={palette} />

          <InfoRow
            label="Apellidos"
            value={safe(mergedUser.lastName)}
            palette={palette}
          />
          <Divider palette={palette} />

          <InfoRow
            label="Email"
            value={safe(mergedUser.email)}
            palette={palette}
          />
          <Divider palette={palette} />

          <InfoRow label="DNI" value={safe(mergedUser.dni)} palette={palette} />
          <Divider palette={palette} />

          <InfoRow
            label="Teléfono"
            value={safe(mergedUser.phone)}
            palette={palette}
          />
          <Divider palette={palette} />

          <InfoRow
            label="Dirección"
            value={safe(mergedUser.address)}
            palette={palette}
          />
        </View>

        {/* ACTIONS */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.btn,
              {
                backgroundColor: palette.buttonSecondary,
                borderColor: palette.borderVariant,
              },
            ]}
          >
            <Text style={[styles.btnText, { color: palette.text }]}>
              Volver
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={[
              styles.btn,
              {
                backgroundColor: palette.error,
                borderColor: palette.border,
              },
            ]}
          >
            <Text style={[styles.btnText, { color: palette.textInverse }]}>
              Cerrar sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

/* =========================
   UI helpers
========================= */

function InfoRow({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: any;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: palette.textSecondary }]}>
        {label}
      </Text>
      <Text
        style={[styles.rowValue, { color: palette.text }]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function Divider({ palette }: { palette: any }) {
  return (
    <View
      style={[styles.divider, { backgroundColor: palette.borderVariant }]}
    />
  );
}

/* =========================
   Styles
========================= */

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 16, paddingBottom: 28 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  headerCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 14,
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 12,
  },
  avatar: { width: "100%", height: "100%" },
  headerInfo: { flex: 1 },

  name: { fontSize: 18, fontWeight: "700" },
  email: { marginTop: 4, fontSize: 13 },

  sectionTitle: { fontSize: 14, fontWeight: "800", marginBottom: 10 },

  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },

  row: { paddingVertical: 10 },
  rowLabel: { fontSize: 12, marginBottom: 4 },
  rowValue: { fontSize: 14, fontWeight: "600" },

  divider: { height: 1, width: "100%" },

  actionsRow: { flexDirection: "row", gap: 12, marginTop: 14 },
  btn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnText: { fontSize: 14, fontWeight: "700" },
});
