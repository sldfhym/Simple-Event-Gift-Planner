import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator
} from 'react-native';
import {
  collection, onSnapshot, deleteDoc,
  doc, query, where, updateDoc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebase/config';
import { COLORS } from '../theme';
import CustomAlert from '../components/CustomAlert';

export default function DashboardScreen({ navigation }) {
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const getGreeting = () => {
  const hour = new Date().getHours();
  const email = auth.currentUser?.email || '';
  const firstName = email.split('@')[0].split('.')[0];
  const name = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  if (hour >= 5 && hour < 12) return `Good morning, ${name}! ☀️`;
  if (hour >= 12 && hour < 18) return `Good afternoon, ${name}! 🌤️`;
  if (hour >= 18 && hour < 22) return `Good evening, ${name}! 🌙`;
  return `Good night, ${name}! ⭐`;};

  // Alert state
  const [alert, setAlert] = useState({
    visible: false, title: '', message: '',
    type: 'warning', confirmText: 'Confirm',
    onConfirm: null
  });

  const showAlert = (config) => setAlert({ ...alert, visible: true, ...config });
  const hideAlert = () => setAlert(a => ({ ...a, visible: false }));

  useEffect(() => {
    const user = auth.currentUser;
    const q = query(
      collection(db, 'gifts'),
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setGifts(list);
      checkUpcomingEvents(list);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const checkUpcomingEvents = (list) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = list.filter(gift => {
      if (gift.isGiven) return false;
      const eventDate = new Date(gift.eventDate);
      eventDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });
    setNotifications(upcoming);
  };

  const getDaysLeft = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return { label: 'Today!', color: '#E53935' };
    if (diff === 1) return { label: 'Tomorrow!', color: '#FF9800' };
    if (diff <= 7) return { label: `${diff} days left`, color: '#6B46C1' };
    return { label: `${diff} days left`, color: COLORS.textMuted };
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const handleMarkGiven = (item) => {
    showAlert({
      title: 'Mark as Given?',
      message: `Did you already give the gift to ${item.personName}?`,
      type: 'success',
      confirmText: 'Yes, Given!',
      cancelText: 'Not yet',
      onConfirm: async () => {
        hideAlert();
        await updateDoc(doc(db, 'gifts', item.id), { isGiven: true });
      }
    });
  };

  const handleMarkNotGiven = (item) => {
    showAlert({
      title: 'Unmark Gift?',
      message: `Mark this gift to ${item.personName} as not yet given?`,
      type: 'info',
      confirmText: 'Yes, Unmark',
      onConfirm: async () => {
        hideAlert();
        await updateDoc(doc(db, 'gifts', item.id), { isGiven: false });
      }
    });
  };

  const handleDelete = (item) => {
    showAlert({
      title: 'Delete Gift Plan?',
      message: `Are you sure you want to delete the gift plan for ${item.personName}? This cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: async () => {
        hideAlert();
        await deleteDoc(doc(db, 'gifts', item.id));
      }
    });
  };

  const handleLogout = () => {
    showAlert({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      type: 'warning',
      confirmText: 'Logout',
      onConfirm: async () => {
        hideAlert();
        await signOut(auth);
      }
    });
  };

  const renderNotifPanel = () => (
    <View style={styles.notifPanel}>
      <Text style={styles.notifPanelTitle}>Upcoming Events — Next 7 Days</Text>
      {notifications.length === 0 ? (
        <Text style={styles.notifEmpty}>No upcoming ungiven gifts this week!</Text>
      ) : (
        notifications.map(n => {
          const days = getDaysLeft(n.eventDate);
          return (
            <View key={n.id} style={styles.notifItem}>
              <View style={styles.notifIconCircle}>
                <Ionicons name="gift-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifName}>{n.personName}</Text>
                <Text style={styles.notifGift}>{n.giftIdea}</Text>
                <Text style={[styles.notifDate, { color: days.color }]}>{days.label}</Text>
              </View>
              <TouchableOpacity
                style={styles.givenButtonSmall}
                onPress={() => handleMarkGiven(n)}
              >
                <Ionicons name="checkmark" size={14} color="#fff" />
                <Text style={styles.givenButtonSmallText}>Given</Text>
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </View>
  );

  const renderItem = ({ item }) => {
    const days = getDaysLeft(item.eventDate);
    return (
      <View style={[styles.card, item.isGiven && styles.cardGiven]}>

        {item.isGiven && (
          <View style={styles.givenBadge}>
            <Ionicons name="checkmark-circle" size={13} color="#4CAF50" />
            <Text style={styles.givenBadgeText}> Given</Text>
          </View>
        )}

        <View style={styles.cardTop}>
          <View style={[styles.avatarCircle, item.isGiven && styles.avatarGiven]}>
            <Text style={styles.avatarText}>
              {item.personName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.personName, item.isGiven && styles.textGiven]}>
              {item.personName}
            </Text>
            <Text style={[styles.daysLeft, { color: days.color }]}>{days.label}</Text>
            <Text style={styles.eventDateFull}>{formatDate(item.eventDate)}</Text>
          </View>
        </View>

        <View style={styles.giftBadge}>
          <Ionicons name="gift-outline" size={15} color={COLORS.primaryMid} />
          <Text style={styles.giftBadgeText}> {item.giftIdea}</Text>
        </View>

        <View style={styles.cardActions}>
          {!item.isGiven ? (
            <>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('AddEdit', { gift: item })}
              >
                <Ionicons name="pencil-outline" size={15} color={COLORS.primary} />
                <Text style={styles.editButtonText}> Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.givenButton}
                onPress={() => handleMarkGiven(item)}
              >
                <Ionicons name="checkmark-circle-outline" size={15} color="#4CAF50" />
                <Text style={styles.givenButtonText}> Given</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item)}
              >
                <Ionicons name="trash-outline" size={16} color="#E53935" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.unmarkButton}
                onPress={() => handleMarkNotGiven(item)}
              >
                <Ionicons name="arrow-undo-outline" size={15} color="#FF9800" />
                <Text style={styles.unmarkButtonText}> Unmark</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item)}
              >
                <Ionicons name="trash-outline" size={16} color="#E53935" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  const givenCount = gifts.filter(g => g.isGiven).length;
  const pendingCount = gifts.filter(g => !g.isGiven).length;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>{getGreeting()}</Text>
          <Text style={styles.headerTitle}>Gift Sanctuary</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notifButton}
            onPress={() => setShowNotif(!showNotif)}
          >
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            {notifications.length > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{notifications.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={18} color="#fff" />
            <Text style={styles.logoutText}> Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification panel */}
      {showNotif && renderNotifPanel()}

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{gifts.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#E53935' }]}>{pendingCount}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{givenCount}</Text>
          <Text style={styles.statLabel}>Given</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#FF9800' }]}>{notifications.length}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>

      {/* Gift list */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : gifts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="gift-outline" size={64} color={COLORS.textLight} />
          <Text style={styles.emptyText}>No gift plans yet</Text>
          <Text style={styles.emptySubText}>Tap the + button below to add one!</Text>
        </View>
      ) : (
        <FlatList
          data={gifts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddEdit', { gift: null })}
      >
        <Ionicons name="add" size={36} color="#fff" />
      </TouchableOpacity>

      {/* Custom Alert */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        confirmText={alert.confirmText}
        cancelText={alert.cancelText || 'Cancel'}
        onConfirm={alert.onConfirm}
        onCancel={hideAlert}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 55, paddingBottom: 20, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerGreeting: { fontSize: 13, color: COLORS.accent, marginBottom: 2 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  notifButton: { position: 'relative', padding: 4 },
  notifBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#FF4D4D', borderRadius: 8,
    minWidth: 16, height: 16,
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3,
  },
  notifBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
    flexDirection: 'row', alignItems: 'center',
  },
  logoutText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  notifPanel: {
    backgroundColor: COLORS.card, margin: 16, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: COLORS.border,
    elevation: 3, shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6,
  },
  notifPanelTitle: { fontSize: 14, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
  notifEmpty: { fontSize: 13, color: COLORS.textMuted },
  notifItem: {
    backgroundColor: COLORS.primarySoft, borderRadius: 10,
    padding: 10, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  notifIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
  },
  notifName: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  notifGift: { fontSize: 12, color: COLORS.textMuted, marginTop: 1 },
  notifDate: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  givenButtonSmall: {
    backgroundColor: COLORS.primary, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  givenButtonSmallText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  statsBar: {
    flexDirection: 'row', backgroundColor: COLORS.card,
    marginHorizontal: 16, marginTop: 16, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: COLORS.border, justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  list: { padding: 16, paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: COLORS.border,
    elevation: 2, shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6,
  },
  cardGiven: { opacity: 0.75, borderColor: '#C8E6C9', backgroundColor: '#F9FFF9' },
  givenBadge: {
    alignSelf: 'flex-end', backgroundColor: '#E8F5E9', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 3, marginBottom: 8,
    flexDirection: 'row', alignItems: 'center',
  },
  givenBadgeText: { color: '#4CAF50', fontSize: 12, fontWeight: '600' },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarGiven: { backgroundColor: '#C8E6C9' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  cardInfo: { flex: 1 },
  personName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  textGiven: { color: COLORS.textMuted, textDecorationLine: 'line-through' },
  daysLeft: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  eventDateFull: { fontSize: 11, color: COLORS.textLight, marginTop: 1 },
  giftBadge: {
    backgroundColor: COLORS.primarySoft, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center',
  },
  giftBadgeText: { fontSize: 14, color: COLORS.primaryMid, fontWeight: '500' },
  cardActions: { flexDirection: 'row', gap: 8 },
  editButton: {
    flex: 1, backgroundColor: COLORS.primarySoft, borderRadius: 10,
    padding: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
  },
  editButtonText: { color: COLORS.primary, fontWeight: '600', fontSize: 13 },
  givenButton: {
    flex: 1, backgroundColor: '#E8F5E9', borderRadius: 10,
    padding: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
  },
  givenButtonText: { color: '#4CAF50', fontWeight: '600', fontSize: 13 },
  unmarkButton: {
    flex: 1, backgroundColor: '#FFF8E1', borderRadius: 10,
    padding: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center',
  },
  unmarkButtonText: { color: '#FF9800', fontWeight: '600', fontSize: 13 },
  deleteButton: {
    backgroundColor: '#FFEEEE', borderRadius: 10,
    padding: 10, alignItems: 'center', paddingHorizontal: 14,
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: COLORS.textMuted, marginTop: 16 },
  emptySubText: { fontSize: 14, color: COLORS.textLight, marginTop: 6 },
  addButton: {
    position: 'absolute', bottom: 28, right: 24,
    backgroundColor: COLORS.primary, width: 62, height: 62,
    borderRadius: 31, justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8,
  },
});