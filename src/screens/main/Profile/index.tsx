import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../store/store";
import { setUser, updateUser, logout } from "../../../store/authSlice";
import { AuthAPI } from "../../../api/auth";
import { getFullAvatarUrl } from "../../../util/avatar";

import { useNavigation } from "@react-navigation/native";
import { Calendar, ChevronRight } from "lucide-react-native";
import { Colors } from "../../../constant/colors";
import { fetchMyBookings } from "../../../store/bookingSlice";

const Profile = () => {
  const nav: any = useNavigation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const myBookings = useSelector((state: RootState) => state.booking.myBookings);

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Fetch current user details on mount if user object is not in store
  useEffect(() => {
    if (isAuthenticated && !user) {
      setFetching(true);
      AuthAPI.getProfile()
        .then((userData) => {
          dispatch(setUser(userData));
          setDisplayName(userData.displayName || "");
        })
        .catch((err) => {
          console.error("Failed to fetch profile:", err);
        })
        .finally(() => {
          setFetching(false);
        });
    } else if (user) {
      setDisplayName(user.displayName || "");
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyBookings() as any);
    }
  }, [isAuthenticated, dispatch]);

  // Pick Image from Gallery
  const handlePickImage = async () => {
    try {
      const response = await launchImageLibrary({
        mediaType: "photo",
        quality: 0.8,
        selectionLimit: 1,
      });

      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert("Error", response.errorMessage || "Image selection failed");
        return;
      }

      if (response.assets && response.assets.length > 0 && response.assets[0].uri) {
        setLocalImageUri(response.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Could not pick image");
    }
  };

  // Submit Profile Changes
  const handleSaveProfile = async () => {
    const trimmedName = displayName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      Alert.alert("Invalid Input", "Display name must be at least 2 characters.");
      return;
    }

    try {
      setLoading(true);
      let updatedAvatarUrl = user?.avatarUrl;

      // 1. Upload photo if selected
      if (localImageUri) {
        const formData = new FormData();
        formData.append("image", {
          uri: localImageUri,
          name: `avatar_${Date.now()}.jpg`,
          type: "image/jpeg",
        } as any);

        const uploadRes = await AuthAPI.uploadAvatar(formData);
        updatedAvatarUrl = uploadRes.url;
      }

      // 2. Call backend PATCH /api/auth/me
      const updatedUserData = await AuthAPI.updateProfile({
        displayName: trimmedName,
        avatarUrl: updatedAvatarUrl || undefined,
      });

      // 3. Update Redux store state (Reflects everywhere in app)
      dispatch(setUser(updatedUserData));
      setLocalImageUri(null);

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error: any) {
      const msg =
        error.response?.data?.error?.message ||
        error.message ||
        "Failed to update profile";
      Alert.alert("Update Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => dispatch(logout()) },
    ]);
  };

  if (fetching) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const avatarDisplayUri = localImageUri
    ? localImageUri
    : getFullAvatarUrl(user?.avatarUrl);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>User Profile</Text>

        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handlePickImage} activeOpacity={0.8}>
            <Image source={{ uri: avatarDisplayUri }} style={styles.avatarImage} />
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>Change</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap image to upload new avatar</Text>
        </View>

        {/* Details Form */}
        <View style={styles.card}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            value={user?.email || "N/A"}
            editable={false}
            style={[styles.input, styles.disabledInput]}
          />

          <Text style={styles.label}>Role</Text>
          <TextInput
            value={user?.role || "USER"}
            editable={false}
            style={[styles.input, styles.disabledInput]}
          />

          <Text style={styles.label}>Display Name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter display name"
            style={styles.input}
            placeholderTextColor="#9ca3af"
          />

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* My Bookings Action Card */}
        <TouchableOpacity
          style={styles.bookingsCard}
          activeOpacity={0.8}
          onPress={() => nav.navigate('MyBookings')}
        >
          <View style={styles.bookingsCardLeft}>
            <View style={styles.bookingsIconWrapper}>
              <Calendar size={22} color={Colors.PRIMARY_COLOR} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bookingsTitle}>My Bookings</Text>
              <Text style={styles.bookingsSubtitle} numberOfLines={1}>
                {myBookings.length === 0
                  ? 'View your reservations'
                  : `${myBookings.length} ${myBookings.length === 1 ? 'reservation' : 'reservations'}`}
              </Text>
            </View>
          </View>
          <View style={styles.bookingsCardRight}>
            {myBookings.length > 0 && (
              <View style={styles.bookingCountBadge}>
                <Text style={styles.bookingCountText}>{myBookings.length}</Text>
              </View>
            )}
            <ChevronRight size={20} color="#9CA3AF" />
          </View>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  container: { padding: 20, flexGrow: 1, paddingBottom: 110 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#6b7280" },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  avatarContainer: { alignItems: "center", marginBottom: 24 },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#e5e7eb",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2563eb",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editBadgeText: { color: "#ffffff", fontSize: 12, fontWeight: "600" },
  avatarHint: { marginTop: 8, fontSize: 12, color: "#6b7280" },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
    color: "#111827",
  },
  disabledInput: { backgroundColor: "#f3f4f6", color: "#6b7280" },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  saveButton: { backgroundColor: "#2563eb" },
  saveButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  bookingsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F0F0F5",
  },
  bookingsCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  bookingsIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFF1EB",
    justifyContent: "center",
    alignItems: "center",
  },
  bookingsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.TEXT_PRIMARY,
  },
  bookingsSubtitle: {
    fontSize: 13,
    color: Colors.TEXT_GRAY,
    marginTop: 2,
  },
  bookingsCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bookingCountBadge: {
    backgroundColor: "#FFF1EB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE0D1",
  },
  bookingCountText: {
    color: Colors.PRIMARY_COLOR,
    fontWeight: "700",
    fontSize: 12,
  },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  logoutText: { color: "#dc2626", fontSize: 16, fontWeight: "600" },
});

export default Profile;

