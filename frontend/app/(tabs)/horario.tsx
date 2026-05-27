import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  TextInput,
  Platform,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { saveLastRoute, getToken } from '@/src/utils/storage';
import { getSchedule, saveSchedule, deleteBlock as deleteBlockAPI } from '@/src/services/scheduleService';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

// ─── Types ──────────────────────────────────────────────────────────────────────

type DayCode = 'L' | 'M' | 'X' | 'J' | 'V' | 'S';

interface ClassBlock {
  id: string;
  subject: string;
  color: string;
  day: DayCode;
  startHour: number;
  endHour: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────────

const DAYS: { code: DayCode; label: string }[] = [
  { code: 'L', label: 'LUN' },
  { code: 'M', label: 'MAR' },
  { code: 'X', label: 'MIÉ' },
  { code: 'J', label: 'JUE' },
  { code: 'V', label: 'VIE' },
  { code: 'S', label: 'SÁB' },
];

const DAY_FULL: Record<DayCode, string> = {
  L: 'Lunes', M: 'Martes', X: 'Miércoles', J: 'Jueves', V: 'Viernes', S: 'Sábado',
};

const PALETTE = [
  '#5B8DEF', '#F97066', '#32BEA6', '#F5A623',
  '#A78BFA', '#EC4899', '#0EA5E9', '#F59E0B',
];

const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const CELL_H = 60;
const TIME_W = 48;

const uid = () => Math.random().toString(36).slice(2, 9);
const colorFor = (i: number) => PALETTE[i % PALETTE.length];

// ─── Component ───────────────────────────────────────────────────────────────────

export default function HorarioScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme] || Colors.light;
  const isDark = colorScheme === 'dark';
  const scheduleColors = {
    background: theme.background,
    surface: theme.surface,
    surfaceAlt: theme.surfaceAlt,
    border: theme.border,
    text: theme.text,
    textMuted: theme.textMuted,
    tint: theme.tint,
    scrim: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0.38)',
    dangerBg: isDark ? '#2A1616' : '#FFF0F0',
  };
  const [blocks, setBlocks] = useState<ClassBlock[]>([]);
  const [detailBlock, setDetailBlock] = useState<ClassBlock | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [editData, setEditData] = useState<Partial<ClassBlock>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    saveLastRoute('/(tabs)/horario');
    loadSchedule();
  }, []);

  const loadSchedule = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        console.warn('No token found');
        setLoading(false);
        return;
      }
      const schedule = await getSchedule(token);
      setBlocks(schedule.blocks || []);
    } catch (error) {
      console.error('Error cargando horario:', error);
      Alert.alert('Error', 'No se pudo cargar el horario');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSchedule();
    setRefreshing(false);
  }, [loadSchedule]);

  const persist = useCallback(async (updated: ClassBlock[]) => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert('Error', 'No hay sesión activa');
        return;
      }
      setBlocks(updated);
      await saveSchedule(updated, token);
    } catch (error) {
      console.error('Error guardando horario:', error);
      Alert.alert('Error', 'No se pudo guardar el horario');
      // Revertir cambios locales en caso de error
      loadSchedule();
    }
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const openNew = (day: DayCode, hour: number) => {
    setEditData({
      id: uid(),
      day, startHour: hour, endHour: hour + 2,
      subject: '', color: colorFor(blocks.length),
    });
    setEditVisible(true);
  };

  const openEdit = (b: ClassBlock) => {
    setDetailBlock(null);
    setEditData({ ...b });
    setEditVisible(true);
  };

  const saveBlock = () => {
    if (!editData.subject?.trim()) {
      Alert.alert('Campo requerido', 'El nombre de la materia es obligatorio');
      return;
    }
    const block: ClassBlock = {
      id: editData.id!, subject: editData.subject!,
      color: editData.color || colorFor(blocks.length),
      day: editData.day!, startHour: editData.startHour!, endHour: editData.endHour!,
    };
    const exists = blocks.some(b => b.id === block.id);
    persist(exists ? blocks.map(b => b.id === block.id ? block : b) : [...blocks, block]);
    setEditVisible(false);
    setEditData({});
  };

const confirmDelete = (id: string) => {
  Alert.alert(
    'Eliminar clase',
    '¿Seguro que deseas eliminar esta materia?',
    [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            if (!token) {
              Alert.alert('Error', 'No hay sesión activa');
              return;
            }

            const updatedBlocks = blocks.filter(
              item => item.id !== id
            );

            await deleteBlockAPI(id, token);
            setBlocks(updatedBlocks);
            setDetailBlock(null);

          } catch (err) {
            console.error('Error eliminando clase:', err);
            Alert.alert('Error', 'No se pudo eliminar la clase');
          }
        },
      },
    ]
  );
};

  // ── Grid layout ─────────────────────────────────────────────────────────────

  const { width: SW } = Dimensions.get('window');
  const DAY_W = (SW - TIME_W) / DAYS.length;
  const GRID_H = HOURS.length * CELL_H;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={[s.root, { backgroundColor: scheduleColors.background }]}>

      {/* Top bar */}
      <View style={[s.topBar, { paddingTop: insets.top + 16, backgroundColor: scheduleColors.surface, borderBottomColor: scheduleColors.border }]}> 
        <View>
          <Text style={[s.topEye, { color: scheduleColors.textMuted }]}>SEMESTRE ACTUAL</Text>
          <Text style={[s.topTitle, { color: scheduleColors.text }]}>Mi Horario</Text>
        </View>
        <TouchableOpacity style={[s.addBtn, { backgroundColor: scheduleColors.tint }]} onPress={() => openNew('L', 8)}>
          <Text style={s.addBtnText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={[s.scroll, { backgroundColor: scheduleColors.background }]} showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* Day header row */}
        <View style={[s.headerRow, { backgroundColor: scheduleColors.surface, borderBottomColor: scheduleColors.border }]}>
          <View style={{ width: TIME_W }} />
          {DAYS.map(d => (
            <View key={d.code} style={[s.dayHeader, { width: DAY_W }]}>
              <Text style={[s.dayHeaderTxt, { color: scheduleColors.textMuted }]}>{d.label}</Text>
            </View>
          ))}
        </View>

        {/* Grid: relative container with absolute children */}
        <View style={{ height: GRID_H, position: 'relative', backgroundColor: scheduleColors.background }}>

          {/* Background hour stripes */}
          {HOURS.map((hr, i) => (
            <View
              key={hr}
              style={[
                s.stripe,
                {
                  top: i * CELL_H,
                  width: SW,
                  borderBottomColor: scheduleColors.border,
                  backgroundColor: scheduleColors.background,
                },
              ]}
            >
              {/* Time label — pinned left, doesn't stretch */}
              <View style={[s.timeLabelBox, { width: TIME_W }]}>
                <Text style={[s.timeLabelTxt, { color: scheduleColors.textMuted }]}>{hr}:00</Text>
              </View>
              {/* Tappable empty cells */}
              {DAYS.map(d => (
                <TouchableOpacity
                  key={d.code}
                  style={[s.emptyCell, { width: DAY_W, borderLeftColor: scheduleColors.border }]}
                  onPress={() => openNew(d.code, hr)}
                  activeOpacity={0.35}
                />
              ))}
            </View>
          ))}

          {/* Floating class blocks */}
          {blocks.map(b => {
            const dayIdx = DAYS.findIndex(d => d.code === b.day);
            if (dayIdx === -1) return null;
            const hourIdx = HOURS.indexOf(b.startHour);
            if (hourIdx === -1) return null;
            const dur = Math.max(b.endHour - b.startHour, 1);
            const top = hourIdx * CELL_H + 3;
            const height = dur * CELL_H - 6;
            const left = TIME_W + dayIdx * DAY_W + 3;
            const width = DAY_W - 6;

            return (
              <TouchableOpacity
                key={b.id}
                activeOpacity={0.82}
                onPress={() => setDetailBlock(b)}
                style={[s.block, {
                  top, left, width, height,
                  backgroundColor: b.color + '1E',
                  borderColor: b.color + '55',
                  shadowColor: b.color,
                }]}
              >
                <View style={[s.blockAccent, { backgroundColor: b.color }]} />
                <View style={s.blockContent}>
                  <Text style={[s.blockName, { color: scheduleColors.text }]} numberOfLines={height > 72 ? 3 : 2}>{b.subject}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

{/* ── Detail modal ── */}
<Modal
  visible={!!detailBlock}
  transparent
  animationType="fade"
  onRequestClose={() => setDetailBlock(null)}
>
  <View style={[s.scrim, { backgroundColor: scheduleColors.scrim }]}>

    {/* Fondo */}
    <TouchableOpacity
      style={StyleSheet.absoluteFillObject}
      activeOpacity={1}
      onPress={() => setDetailBlock(null)}
    />

    {/* Modal */}
    {detailBlock && (
      <View style={[s.detailCard, { backgroundColor: scheduleColors.surface }]}>

        <View
          style={[
            s.detailStripe,
            { backgroundColor: detailBlock.color },
          ]}
        />

        <View style={s.detailBody}>

          <Text
            style={[
              s.detailMeta,
              { color: detailBlock.color },
            ]}
          >
            {DAY_FULL[detailBlock.day]} · {detailBlock.startHour}:00 - {detailBlock.endHour}:00
          </Text>

          <Text style={[s.detailTitle, { color: scheduleColors.text }]}>
            {detailBlock.subject}
          </Text>

          <View style={s.dRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[s.dEdit, { backgroundColor: scheduleColors.surfaceAlt }]}
              onPress={() => openEdit(detailBlock)}
            >
              <Text style={[s.dEditTxt, { color: scheduleColors.text }]}> 
                ✏ Editar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[s.dDel, { backgroundColor: scheduleColors.dangerBg }]}
              onPress={() => {
                confirmDelete(detailBlock.id);
              }}
            >
              <Text style={s.dDelTxt}>
                🗑 Eliminar
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[s.dClose, { backgroundColor: scheduleColors.surfaceAlt }]}
            onPress={() => setDetailBlock(null)}
          >
            <Text style={[s.dCloseTxt, { color: scheduleColors.textMuted }]}> 
              Cerrar
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    )}
  </View>
</Modal>

      {/* ── Edit / New modal ── */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={[s.scrim, { backgroundColor: scheduleColors.scrim }]}> 
          <View style={[s.editSheet, { backgroundColor: scheduleColors.surface }]}> 
            <Text style={[s.editTitle, { color: scheduleColors.text }]}> 
              {blocks.some(b => b.id === editData.id) ? 'Editar clase' : 'Nueva clase'}
            </Text>
            <ScrollView
              contentContainerStyle={s.editForm}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <EF label="MATERIA *" value={editData.subject || ''}
                onChange={v => setEditData(p => ({ ...p, subject: v }))}
                placeholder="Nombre de la materia" />

              <Text style={[s.editLabel, { color: scheduleColors.textMuted }]}>DÍA</Text>
              <View style={s.pillWrap}>
                {DAYS.map(d => (
                  <TouchableOpacity
                    key={d.code}
                    style={[
                      s.pill,
                      { backgroundColor: scheduleColors.surfaceAlt, borderColor: scheduleColors.border },
                      editData.day === d.code && [s.pillOn, { backgroundColor: scheduleColors.tint, borderColor: scheduleColors.tint }],
                    ]}
                    onPress={() => setEditData(p => ({ ...p, day: d.code }))}
                  >
                    <Text style={[s.pillTxt, { color: scheduleColors.textMuted }, editData.day === d.code && s.pillTxtOn]}>{d.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[s.editLabel, { color: scheduleColors.textMuted }]}>HORA INICIO</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={s.pillRow}>
                  {HOURS.slice(0, -1).map(h => (
                    <TouchableOpacity
                      key={h}
                      style={[
                        s.pill,
                        { backgroundColor: scheduleColors.surfaceAlt, borderColor: scheduleColors.border },
                        editData.startHour === h && [s.pillOn, { backgroundColor: scheduleColors.tint, borderColor: scheduleColors.tint }],
                      ]}
                      onPress={() => setEditData(p => ({
                        ...p, startHour: h,
                        endHour: Math.max(h + 1, p.endHour ?? h + 1),
                      }))}
                    >
                      <Text style={[s.pillTxt, { color: scheduleColors.textMuted }, editData.startHour === h && s.pillTxtOn]}>{h}:00</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={[s.editLabel, { color: scheduleColors.textMuted }]}>HORA FIN</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 26 }}>
                <View style={s.pillRow}>
                  {HOURS.filter(h => h > (editData.startHour ?? 6)).map(h => (
                    <TouchableOpacity
                      key={h}
                      style={[
                        s.pill,
                        { backgroundColor: scheduleColors.surfaceAlt, borderColor: scheduleColors.border },
                        editData.endHour === h && [s.pillOn, { backgroundColor: scheduleColors.tint, borderColor: scheduleColors.tint }],
                      ]}
                      onPress={() => setEditData(p => ({ ...p, endHour: h }))}
                    >
                      <Text style={[s.pillTxt, { color: scheduleColors.textMuted }, editData.endHour === h && s.pillTxtOn]}>{h}:00</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={s.row2}>
                <TouchableOpacity
                  style={[s.btnCancel, { backgroundColor: scheduleColors.surfaceAlt }]}
                  onPress={() => { setEditVisible(false); setEditData({}); }}
                >
                  <Text style={[s.btnCancelTxt, { color: scheduleColors.textMuted }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.btnSave, { backgroundColor: scheduleColors.tint }]} onPress={saveBlock}>
                  <Text style={s.btnSaveTxt}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────────

function EF({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme] || Colors.light;
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[s.editLabel, { color: theme.textMuted }]}>{label}</Text>
      <TextInput
        style={[s.editInput, { backgroundColor: theme.surfaceAlt, borderColor: theme.border, color: theme.text }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F7F6F3' },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
    paddingBottom: 16, paddingHorizontal: 20,
    backgroundColor: '#FAFAF8',
    borderBottomWidth: 1, borderBottomColor: '#EEEDEB',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
    elevation: 2,
  },
  topEye: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: '#BDBDBD', marginBottom: 2 },
  topTitle: { fontSize: 24, fontWeight: '800', color: '#141414', letterSpacing: -0.5 },
  addBtn: { backgroundColor: '#141414', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Scroll
  scroll: { flex: 1 },

  // Day header — uses exact same TIME_W spacer so columns align with grid
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#FAFAF8',
    borderBottomWidth: 1, borderBottomColor: '#EEEDEB',
    paddingVertical: 10,
  },
  dayHeader: { alignItems: 'center' },
  dayHeaderTxt: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: '#AEAEAE' },

  // Hour stripe — absolutely positioned row, full width
  stripe: {
    position: 'absolute', left: 0,
    height: CELL_H,
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: '#EEEDEB',
  },
  timeLabelBox: { justifyContent: 'flex-start', paddingTop: 5, paddingLeft: 6 },
  timeLabelTxt: { fontSize: 10, fontWeight: '600', color: '#CBCBCB' },
  emptyCell: { height: CELL_H, borderLeftWidth: 1, borderLeftColor: '#EEEDEB' },

  // Class blocks
  block: {
    position: 'absolute',
    borderRadius: 12, borderWidth: 1,
    flexDirection: 'row', overflow: 'hidden',
    shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  blockAccent: { width: 3 },
  blockContent: { flex: 1, paddingHorizontal: 5, paddingVertical: 5 },
  blockName: { fontSize: 11, fontWeight: '700', color: '#1A1A1A', lineHeight: 14 },

  // Scrim
  scrim: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'center', alignItems: 'center', padding: 18,
  },

  // Detail card
  detailCard: {
    backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', width: '100%',
    shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 30, elevation: 10,
  },
  detailStripe: { height: 5 },
  detailBody: { padding: 22 },
  detailMeta: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
  detailTitle: { fontSize: 21, fontWeight: '800', color: '#141414', marginBottom: 16, letterSpacing: -0.3 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  dRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  dEdit: {
    flex: 1, backgroundColor: '#F0F0EE', borderRadius: 14,
    paddingVertical: 13, alignItems: 'center',
  },
  dEditTxt: { fontWeight: '700', color: '#333', fontSize: 14 },
  dDel: {
    flex: 1, backgroundColor: '#FFF0F0', borderRadius: 14,
    paddingVertical: 13, alignItems: 'center',
  },
  dDelTxt: { fontWeight: '700', color: '#E53935', fontSize: 14 },
  dClose: { backgroundColor: '#F7F6F3', borderRadius: 14, paddingVertical: 13, alignItems: 'center' },
  dCloseTxt: { fontWeight: '600', color: '#888', fontSize: 14 },

  // Edit sheet
  editSheet: {
    backgroundColor: '#fff', borderRadius: 26, width: '100%', maxHeight: '92%',
    padding: 24,
    shadowColor: '#000', shadowOpacity: 0.16, shadowRadius: 30, elevation: 12,
  },
  editTitle: { fontSize: 20, fontWeight: '800', color: '#141414', marginBottom: 20, letterSpacing: -0.3 },
  editForm: { paddingBottom: 10 },
  editLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: '#AEAEAE', marginBottom: 8 },
  editInput: {
    borderWidth: 1.5, borderColor: '#E8E8E5', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: '#141414',
    backgroundColor: '#FAFAF8',
  },
  row2: { flexDirection: 'row' },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12,
    backgroundColor: '#F4F4F2', borderWidth: 1.5, borderColor: '#E8E8E5',
  },
  pillOn: { backgroundColor: '#141414', borderColor: '#141414' },
  pillTxt: { fontSize: 12, fontWeight: '700', color: '#AEAEAE' },
  pillTxtOn: { color: '#fff' },
  btnCancel: {
    flex: 1, backgroundColor: '#F4F4F2', borderRadius: 16,
    paddingVertical: 15, alignItems: 'center', marginRight: 10,
  },
  btnCancelTxt: { fontWeight: '700', color: '#888', fontSize: 15 },
  btnSave: {
    flex: 2, backgroundColor: '#141414', borderRadius: 16,
    paddingVertical: 15, alignItems: 'center',
  },
  btnSaveTxt: { fontWeight: '700', color: '#fff', fontSize: 15 },
});
