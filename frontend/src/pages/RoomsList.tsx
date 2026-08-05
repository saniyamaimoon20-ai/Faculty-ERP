import React, { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  DoorOpen, Plus, Search, Filter, ChevronLeft, 
  ChevronRight, ArrowUpDown, CheckCircle2, Building 
} from 'lucide-react';
import type { Room } from '../types';

export const RoomsList: React.FC = () => {
  const { user } = useAuth();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [roomType, setRoomType] = useState('');
  const [sortBy, setSortBy] = useState('room_number');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [addModal, setAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    room_number: '',
    building: 'SSMIET Cyber Block',
    floor: '1st Floor',
    capacity: 60,
    room_type: 'Lecture Hall'
  });
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        type: roomType,
        sort_by: sortBy,
        order,
        page: currentPage.toString(),
        per_page: '10'
      });

      const res = await apiRequest(`/rooms?${params.toString()}`);
      setRooms(res.rooms || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    } finally {
      setLoading(false);
    }
  }, [search, roomType, sortBy, order, currentPage]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const openAddModal = () => {
    setEditingRoom(null);
    setFormData({
      room_number: '',
      building: 'SSMIET Cyber Block',
      floor: '1st Floor',
      capacity: 60,
      room_type: 'Lecture Hall'
    });
    setModalError(null);
    setModalSuccess(null);
    setAddModal(true);
  };

  const openEditModal = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      building: room.building,
      floor: room.floor,
      capacity: room.capacity,
      room_type: room.room_type
    });
    setModalError(null);
    setModalSuccess(null);
    setAddModal(true);
  };

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSuccess(null);

    if (!formData.room_number.trim()) {
      setModalError('Room number / name is required.');
      return;
    }

    setModalLoading(true);

    try {
      if (editingRoom) {
        const res = await apiRequest(`/rooms/${editingRoom.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
        setModalSuccess(`Room ${res.room.room_number} updated successfully!`);
      } else {
        const res = await apiRequest('/rooms', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
        setModalSuccess(`Room ${res.room.room_number} added successfully!`);
      }

      fetchRooms();
      setTimeout(() => {
        setAddModal(false);
        setModalSuccess(null);
      }, 1200);
    } catch (err: any) {
      setModalError(err.message || 'Failed to save room.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-orange-500" /> Cyber Security Department Rooms
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            SSM Institute of Engineering and Technology — Lecture Halls & Laboratories
          </p>
        </div>

        {user?.role === 'HOD' && (
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-xs font-semibold rounded-xl shadow-md shadow-orange-600/30 flex items-center gap-1.5 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add New Room
          </button>
        )}
      </div>

      {/* Controls Bar */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search room number, building, floor..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={roomType}
            onChange={(e) => { setRoomType(e.target.value); setCurrentPage(1); }}
            className="w-full sm:w-56 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
          >
            <option value="">All Room Types</option>
            <option value="Lecture Hall">Lecture Hall</option>
            <option value="Cyber Forensics Lab">Cyber Forensics Lab</option>
            <option value="SOC Center Lab">SOC Center Lab</option>
            <option value="Seminar Hall">Seminar Hall</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-4 cursor-pointer hover:text-orange-500" onClick={() => handleSort('room_number')}>
                  <span className="flex items-center gap-1">Room Number <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="py-3.5 px-4">Building</th>
                <th className="py-3.5 px-4">Floor</th>
                <th className="py-3.5 px-4 text-center">Capacity</th>
                <th className="py-3.5 px-4">Room Type</th>
                {user?.role === 'HOD' && <th className="py-3.5 px-4 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={user?.role === 'HOD' ? 6 : 5} className="py-8 text-center text-slate-400">
                    <span className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin inline-block"></span>
                    <p className="mt-2 text-xs">Loading Department Rooms...</p>
                  </td>
                </tr>
              ) : rooms.length === 0 ? (
                <tr>
                  <td colSpan={user?.role === 'HOD' ? 6 : 5} className="py-8 text-center text-slate-400">
                    No rooms found matching your search.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="hover:bg-orange-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">
                      {room.room_number}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" /> {room.building}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{room.floor}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold rounded-full text-[11px]">
                        {room.capacity} Seats
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 rounded-md font-semibold text-[10px]">
                        {room.room_type}
                      </span>
                    </td>
                    {user?.role === 'HOD' && (
                      <td className="py-3.5 px-4 text-center space-x-1.5">
                        <button
                          onClick={() => openEditModal(room)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete room ${room.room_number}?`)) {
                              try {
                                await apiRequest(`/rooms/${room.id}`, { method: 'DELETE' });
                                fetchRooms();
                              } catch (err: any) {
                                alert(err.message || 'Failed to delete room');
                              }
                            }
                          }}
                          className="px-2.5 py-1 bg-red-50 dark:bg-red-950/60 hover:bg-red-600 hover:text-white text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold border border-red-200 dark:border-red-900 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-slate-100">{rooms.length}</strong> of <strong className="text-slate-900 dark:text-slate-100">{total}</strong> rooms
          </span>

          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Page {currentPage} of {pages}
            </span>
            <button
              disabled={currentPage >= pages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Room Modal */}
      {addModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-orange-500" /> {editingRoom ? 'Edit Room / Hall Details' : 'Add New Room / Hall'}
              </h3>
              <button onClick={() => setAddModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
            </div>

            {modalError && (
              <div className="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 rounded-2xl border border-red-200 dark:border-red-900">
                {modalError}
              </div>
            )}

            {modalSuccess && (
              <div className="p-3 text-xs bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 rounded-2xl border border-green-200 dark:border-green-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                {modalSuccess}
              </div>
            )}

            <form onSubmit={handleSaveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Room Number / Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value.toUpperCase() })}
                  placeholder="Type room number or name e.g. CY-103 or CY-LAB-03"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Building</label>
                <input
                  type="text"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  placeholder="e.g. SSMIET Cyber Block"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Floor Location</label>
                <input
                  type="text"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  placeholder="e.g. 1st Floor / Ground Floor"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Room Type</label>
                  <input
                    type="text"
                    list="room-type-suggestions"
                    value={formData.room_type}
                    onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                    placeholder="Type or select room type"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 dark:text-slate-100 font-medium"
                  />
                  <datalist id="room-type-suggestions">
                    <option value="Lecture Hall" />
                    <option value="Cyber Forensics Lab" />
                    <option value="SOC Center Lab" />
                    <option value="Malware Analysis Lab" />
                    <option value="Seminar Hall" />
                  </datalist>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-md shadow-orange-600/30"
                >
                  {modalLoading ? 'Saving...' : editingRoom ? 'Update Room' : 'Save Room'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default RoomsList;
