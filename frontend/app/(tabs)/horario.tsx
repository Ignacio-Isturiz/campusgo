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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveLastRoute } from '@/src/utils/storage';

// ─── Types ──────────────────────────────────────────────────────────────────────

type DayCode = 'L' | 'M' | 'X' | 'J' | 'V' | 'S';

interface ClassBlock {
  id: string;
  subject: string;
  code: string;
  room: string;
  teacher: string;
  group: string;
  credits: number;
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
const STORAGE_KEY = 'horario_grid_v3';

const uid = () => Math.random().toString(36).slice(2, 9);
const colorFor = (i: number) => PALETTE[i % PALETTE.length];

// ─── Component ───────────────────────────────────────────────────────────────────

export default function HorarioScreen() {
  const [blocks, setBlocks] = useState<ClassBlock[]>([]);
  const [detailBlock, setDetailBlock] = useState<ClassBlock | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [editData, setEditData] = useState<Partial<ClassBlock>>({});

  useEffect(() => {
    saveLastRoute('/(tabs)/horario');
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) setBlocks(JSON.parse(raw));
    });
  }, []);

  const persist = useCallback(async (updated: ClassBlock[]) => {
    setBlocks(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const openNew = (day: DayCode, hour: number) => {
    setEditData({
      id: uid(),
      day, startHour: hour, endHour: hour + 2,
      subject: '', code: '', room: '', teacher: '', group: '',
      credits: 3, color: colorFor(blocks.length),
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
      code: editData.code || '', room: editData.room || '',
      teacher: editData.teacher || '', group: editData.group || '',
      credits: editData.credits || 3, color: editData.color || colorFor(blocks.length),
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
            const updatedBlocks = blocks.filter(
              item => item.id !== id
            );

            await AsyncStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(updatedBlocks)
            );

            setBlocks(updatedBlocks);

            setDetailBlock(null);

          } catch (err) {
            console.log(err);
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
    <View style={s.root}>

      {/* Top bar */}
      <View style={s.topBar}>
        <View>
          <Text style={s.topEye}>SEMESTRE ACTUAL</Text>
          <Text style={s.topTitle}>Mi Horario</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => openNew('L', 8)}>
          <Text style={s.addBtnText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Day header row */}
        <View style={s.headerRow}>
          <View style={{ width: TIME_W }} />
          {DAYS.map(d => (
            <View key={d.code} style={[s.dayHeader, { width: DAY_W }]}>
              <Text style={s.dayHeaderTxt}>{d.label}</Text>
            </View>
          ))}
        </View>

        {/* Grid: relative container with absolute children */}
        <View style={{ height: GRID_H, position: 'relative' }}>

          {/* Background hour stripes */}
          {HOURS.map((hr, i) => (
            <View
              key={hr}
              style={[s.stripe, { top: i * CELL_H, width: SW }]}
            >
              {/* Time label — pinned left, doesn't stretch */}
              <View style={[s.timeLabelBox, { width: TIME_W }]}>
                <Text style={s.timeLabelTxt}>{hr}:00</Text>
              </View>
              {/* Tappable empty cells */}
              {DAYS.map(d => (
                <TouchableOpacity
                  key={d.code}
                  style={[s.emptyCell, { width: DAY_W }]}
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
                  {b.code ? (
                    <Text style={[s.blockCode, { color: b.color }]} numberOfLines={1}>{b.code}</Text>
                  ) : null}
                  <Text style={s.blockName} numberOfLines={height > 72 ? 3 : 2}>{b.subject}</Text>
                  {height > 80 && b.room ? (
                    <Text style={s.blockRoom} numberOfLines={1}>{b.room}</Text>
                  ) : null}
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
  <View style={s.scrim}>

    {/* Fondo */}
    <TouchableOpacity
      style={StyleSheet.absoluteFillObject}
      activeOpacity={1}
      onPress={() => setDetailBlock(null)}
    />

    {/* Modal */}
    {detailBlock && (
      <View style={s.detailCard}>

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
            {[
              detailBlock.code,
              DAY_FULL[detailBlock.day],
              `${detailBlock.startHour}:00 - ${detailBlock.endHour}:00`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>

          <Text style={s.detailTitle}>
            {detailBlock.subject}
          </Text>

          <View style={s.chipRow}>
            {detailBlock.room ? (
              <Chip
                icon="🏛"
                val={detailBlock.room}
              />
            ) : null}

            <Chip
              icon="👤"
              val={
                detailBlock.teacher?.trim()
                  ? detailBlock.teacher
                  : 'Sin profesor'
              }
            />

            <Chip
              icon="📚"
              val={`${detailBlock.credits} créditos`}
            />

            {detailBlock.group ? (
              <Chip
                icon="👥"
                val={`Grupo ${detailBlock.group}`}
              />
            ) : null}
          </View>

          <View style={s.dRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={s.dEdit}
              onPress={() => openEdit(detailBlock)}
            >
              <Text style={s.dEditTxt}>
                ✏ Editar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={s.dDel}
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
            style={s.dClose}
            onPress={() => setDetailBlock(null)}
          >
            <Text style={s.dCloseTxt}>
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
        <View style={s.scrim}>
          <View style={s.editSheet}>
            <Text style={s.editTitle}>
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

              <View style={s.row2}>
                <View style={{ flex: 1.5, marginRight: 10 }}>
                  <EF label="CÓDIGO" value={editData.code || ''}
                    onChange={v => setEditData(p => ({ ...p, code: v }))} placeholder="IF0113" />
                </View>
                <View style={{ flex: 1 }}>
                  <EF label="GRUPO" value={editData.group || ''}
                    onChange={v => setEditData(p => ({ ...p, group: v }))} placeholder="001" />
                </View>
              </View>

              <EF label="DOCENTE" value={editData.teacher || ''}
                onChange={v => setEditData(p => ({ ...p, teacher: v }))}
                placeholder="Nombre del profesor" />
              <EF label="AULA" value={editData.room || ''}
                onChange={v => setEditData(p => ({ ...p, room: v }))} placeholder="02-205" />
              <EF
  label="CRÉDITOS"
  value={String(editData.credits || '')}
  onChange={v =>
    setEditData(p => ({
      ...p,
      credits: Number(v) || 0,
    }))
  }
  placeholder="3"
/>
              <Text style={s.editLabel}>DÍA</Text>
              <View style={s.pillWrap}>
                {DAYS.map(d => (
                  <TouchableOpacity
                    key={d.code}
                    style={[s.pill, editData.day === d.code && s.pillOn]}
                    onPress={() => setEditData(p => ({ ...p, day: d.code }))}
                  >
                    <Text style={[s.pillTxt, editData.day === d.code && s.pillTxtOn]}>{d.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={s.editLabel}>HORA INICIO</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={s.pillRow}>
                  {HOURS.slice(0, -1).map(h => (
                    <TouchableOpacity
                      key={h}
                      style={[s.pill, editData.startHour === h && s.pillOn]}
                      onPress={() => setEditData(p => ({
                        ...p, startHour: h,
                        endHour: Math.max(h + 1, p.endHour ?? h + 1),
                      }))}
                    >
                      <Text style={[s.pillTxt, editData.startHour === h && s.pillTxtOn]}>{h}:00</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={s.editLabel}>HORA FIN</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 26 }}>
                <View style={s.pillRow}>
                  {HOURS.filter(h => h > (editData.startHour ?? 6)).map(h => (
                    <TouchableOpacity
                      key={h}
                      style={[s.pill, editData.endHour === h && s.pillOn]}
                      onPress={() => setEditData(p => ({ ...p, endHour: h }))}
                    >
                      <Text style={[s.pillTxt, editData.endHour === h && s.pillTxtOn]}>{h}:00</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={s.row2}>
                <TouchableOpacity
                  style={s.btnCancel}
                  onPress={() => { setEditVisible(false); setEditData({}); }}
                >
                  <Text style={s.btnCancelTxt}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.btnSave} onPress={saveBlock}>
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

function Chip({ icon, val }: { icon: string; val: string }) {
  return (
    <View style={ch.wrap}>
      <Text style={ch.icon}>{icon}</Text>
      <Text style={ch.txt} numberOfLines={1}>{val}</Text>
    </View>
  );
}

function EF({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.editLabel}>{label}</Text>
      <TextInput
        style={s.editInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#C4C4C4"
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
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
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
  blockCode: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
  blockName: { fontSize: 11, fontWeight: '700', color: '#1A1A1A', lineHeight: 14 },
  blockRoom: { fontSize: 10, color: '#888', marginTop: 3 },

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

const ch = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#F4F4F2', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 7, maxWidth: 160,
  },
  icon: { fontSize: 13 },
  txt: { fontSize: 12, fontWeight: '600', color: '#555', flexShrink: 1 },
});