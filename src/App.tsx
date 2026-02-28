import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, List as ListIcon, Database, ChevronLeft, ChevronRight, Upload, Download, Plus, Trash2, Edit2, X, Heart, Image as ImageIcon } from 'lucide-react';

interface Couple {
  id: string;
  nombre: string;
  fechaMatrimonio: string; // YYYY-MM-DD
  imagen: string; // base64
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'datos' | 'calendario'>('datos');
  const [couples, setCouples] = useState<Couple[]>(() => {
    const saved = localStorage.getItem('anniversaries');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('anniversaries', JSON.stringify(couples));
  }, [couples]);

  return (
    <div className="min-h-screen bg-pink-50 font-sans text-gray-700 selection:bg-pink-200">
      <header className="bg-white shadow-sm border-b-4 border-pink-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-extrabold text-pink-400 flex items-center gap-2">
            <Heart className="text-pink-400 fill-pink-400" />
            Aniversarios 
          </h1>
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveTab('datos')}
              className={`px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all ${
                activeTab === 'datos'
                  ? 'bg-pink-400 text-white shadow-md scale-105'
                  : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
              }`}
            >
              <Database size={20} />
              Datos
            </button>
            <button
              onClick={() => setActiveTab('calendario')}
              className={`px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all ${
                activeTab === 'calendario'
                  ? 'bg-purple-400 text-white shadow-md scale-105'
                  : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
              }`}
            >
              <CalendarIcon size={20} />
              Calendario
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8">
        {activeTab === 'datos' ? (
          <DatosTab couples={couples} setCouples={setCouples} />
        ) : (
          <CalendarioTab couples={couples} />
        )}
      </main>
    </div>
  );
}

function DatosTab({ couples, setCouples }: { couples: Couple[], setCouples: React.Dispatch<React.SetStateAction<Couple[]>> }) {
  const [nombre, setNombre] = useState('');
  const [fecha, setFecha] = useState('');
  const [imagen, setImagen] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagen(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !fecha) return;

    if (editingId) {
      setCouples(couples.map(c => c.id === editingId ? { ...c, nombre, fechaMatrimonio: fecha, imagen } : c));
      setEditingId(null);
    } else {
      setCouples([...couples, { id: Date.now().toString(), nombre, fechaMatrimonio: fecha, imagen }]);
    }
    setNombre('');
    setFecha('');
    setImagen('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (couple: Couple) => {
    setNombre(couple.nombre);
    setFecha(couple.fechaMatrimonio);
    setImagen(couple.imagen);
    setEditingId(couple.id);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      setCouples(couples.filter(c => c.id !== id));
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(couples, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aniversarios_.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (Array.isArray(imported)) {
            setCouples(imported);
            alert('¡Datos importados correctamente! 🌸');
          }
        } catch (error) {
          alert('Error al importar el archivo JSON. 😿');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[2rem] shadow-sm border-4 border-pink-100 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-pink-500 mb-6 flex items-center gap-2">
          {editingId ? <Edit2 /> : <Plus />}
          {editingId ? 'Editar Aniversario' : 'Nuevo Aniversario'}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block font-bold text-pink-400">Nombre (ej. Cony y Antonio)</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-pink-50/50"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block font-bold text-pink-400">Fecha de Matrimonio</label>
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="w-full p-3 rounded-xl border-2 border-pink-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all bg-pink-50/50"
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="block font-bold text-pink-400">Imagen 📸</label>
            <div className="flex items-center gap-4">
              <label className="cursor-pointer bg-pink-100 hover:bg-pink-200 text-pink-600 px-4 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 border-2 border-pink-200 border-dashed">
                <ImageIcon size={20} />
                Subir Foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
              </label>
              {imagen && (
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-pink-300">
                  <img src={imagen} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImagen(''); if(fileInputRef.current) fileInputRef.current.value=''; }}
                    className="absolute top-0 right-0 bg-red-400 text-white p-1 rounded-bl-xl"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 mt-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setNombre('');
                  setFecha('');
                  setImagen('');
                  if(fileInputRef.current) fileInputRef.current.value='';
                }}
                className="px-6 py-3 rounded-xl font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-bold bg-pink-400 text-white hover:bg-pink-500 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
              <Heart size={20} />
              {editingId ? 'Guardar Cambios' : 'Guardar Aniversario'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border-4 border-purple-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-purple-500 flex items-center gap-2">
            <Database />
            Registros Guardados
          </h2>
          <div className="flex gap-2">
            <label className="cursor-pointer px-4 py-2 rounded-xl font-bold bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors flex items-center gap-2">
              <Upload size={18} />
              Importar JSON
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-xl font-bold bg-green-100 text-green-600 hover:bg-green-200 transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              Exportar JSON
            </button>
          </div>
        </div>

        {couples.length === 0 ? (
          <div className="text-center py-12 bg-purple-50 rounded-2xl border-2 border-dashed border-purple-200">
            <p className="text-purple-400 font-bold text-lg">Aún no hay aniversarios registrados. ¡Agrega uno arriba! ✨</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {couples.map(couple => (
              <div key={couple.id} className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-purple-200 flex-shrink-0">
                  {couple.imagen ? (
                    <img src={couple.imagen} alt={couple.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-300">
                      <Heart size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-purple-700 truncate">{couple.nombre}</h3>
                  <p className="text-sm text-purple-500">{couple.fechaMatrimonio}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleEdit(couple)} className="p-2 bg-white text-blue-400 rounded-full hover:bg-blue-50 transition-colors shadow-sm">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(couple.id)} className="p-2 bg-white text-red-400 rounded-full hover:bg-red-50 transition-colors shadow-sm">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CalendarioTab({ couples }: { couples: Couple[] }) {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCouple, setSelectedCouple] = useState<Couple | null>(null);

  const currentYear = new Date().getFullYear(); // For list view, always current year

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getAnniversariesForDay = (m: number, d: number) => {
    return couples.filter(c => {
      const [, mStr, dStr] = c.fechaMatrimonio.split('-');
      return parseInt(mStr, 10) - 1 === m && parseInt(dStr, 10) === d;
    });
  };

  const listAnniversaries = couples.map(c => {
    const [, mStr, dStr] = c.fechaMatrimonio.split('-');
    const m = parseInt(mStr, 10) - 1;
    const d = parseInt(dStr, 10);
    const dateThisYear = new Date(currentYear, m, d);
    return { couple: c, dateThisYear, m, d };
  }).sort((a, b) => a.dateThisYear.getTime() - b.dateThisYear.getTime());

  const calculateYears = (fechaMatrimonio: string, targetYear: number) => {
    const [yStr] = fechaMatrimonio.split('-');
    return targetYear - parseInt(yStr, 10);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border-4 border-blue-100 p-6 sm:p-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex bg-blue-50 p-1 rounded-full border-2 border-blue-100">
          <button
            onClick={() => setView('calendar')}
            className={`px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all ${
              view === 'calendar' ? 'bg-blue-400 text-white shadow-md' : 'text-blue-400 hover:bg-blue-100'
            }`}
          >
            <CalendarIcon size={18} />
            Mes
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all ${
              view === 'list' ? 'bg-blue-400 text-white shadow-md' : 'text-blue-400 hover:bg-blue-100'
            }`}
          >
            <ListIcon size={18} />
            Lista
          </button>
        </div>

        {view === 'calendar' && (
          <div className="flex items-center gap-4 bg-blue-50 px-4 py-2 rounded-full border-2 border-blue-100">
            <button onClick={prevMonth} className="p-1 text-blue-500 hover:bg-blue-200 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-extrabold text-blue-600 min-w-[140px] text-center">
              {monthNames[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-1 text-blue-500 hover:bg-blue-200 rounded-full transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>
        )}
        {view === 'list' && (
          <h2 className="text-xl font-extrabold text-blue-600 bg-blue-50 px-6 py-2 rounded-full border-2 border-blue-100">
            Aniversarios {currentYear}
          </h2>
        )}
      </div>

      {view === 'calendar' ? (
        <div className="w-full">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center font-bold text-blue-400 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square rounded-2xl bg-gray-50/50 border-2 border-transparent"></div>;
              }
              const dayAnniversaries = getAnniversariesForDay(month, day);
              const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

              return (
                <div
                  key={day}
                  className={`aspect-square rounded-2xl border-2 p-1 sm:p-2 flex flex-col transition-all ${
                    isToday ? 'border-pink-300 bg-pink-50' : 'border-blue-100 bg-white hover:border-blue-300'
                  } ${dayAnniversaries.length > 0 ? 'cursor-pointer hover:shadow-md' : ''}`}
                  onClick={() => {
                    if (dayAnniversaries.length > 0) {
                      setSelectedCouple(dayAnniversaries[0]);
                    }
                  }}
                >
                  <span className={`text-sm sm:text-base font-bold ${isToday ? 'text-pink-500' : 'text-blue-400'}`}>
                    {day}
                  </span>
                  <div className="flex-1 overflow-y-auto mt-1 space-y-1 no-scrollbar">
                    {dayAnniversaries.map(c => (
                      <div key={c.id} className="bg-pink-100 text-pink-600 text-[10px] sm:text-xs font-bold px-1 sm:px-2 py-1 rounded-lg truncate text-center shadow-sm">
                        {c.nombre}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {listAnniversaries.length === 0 ? (
            <div className="text-center py-12 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200">
              <p className="text-blue-400 font-bold text-lg">No hay aniversarios registrados. 😿</p>
            </div>
          ) : (
            listAnniversaries.map(({ couple, d, m }) => {
              const years = calculateYears(couple.fechaMatrimonio, currentYear);
              return (
                <div
                  key={couple.id}
                  onClick={() => setSelectedCouple(couple)}
                  className="bg-white border-2 border-blue-100 hover:border-pink-300 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all group"
                >
                  <div className="bg-pink-100 text-pink-500 font-bold rounded-xl w-16 h-16 flex flex-col items-center justify-center flex-shrink-0 border-2 border-pink-200 group-hover:bg-pink-400 group-hover:text-white transition-colors">
                    <span className="text-xl leading-none">{d}</span>
                    <span className="text-xs uppercase tracking-wider">{monthNames[m].substring(0, 3)}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-700 group-hover:text-pink-500 transition-colors">{couple.nombre}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Heart size={14} className="text-pink-400" />
                      Cumplen {years} {years === 1 ? 'año' : 'años'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-200">
                    {couple.imagen ? (
                      <img src={couple.imagen} alt={couple.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-pink-50 flex items-center justify-center text-pink-300">
                        <Heart size={20} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Popup Modal */}
      {selectedCouple && (
        <div className="fixed inset-0 bg-pink-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-sm w-full shadow-2xl border-4 border-pink-200 relative transform transition-all scale-100">
            <button
              onClick={() => setSelectedCouple(null)}
              className="absolute top-4 right-4 bg-pink-100 text-pink-500 hover:bg-pink-500 hover:text-white p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center text-center mt-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-pink-300 shadow-lg mb-4 relative">
                {selectedCouple.imagen ? (
                  <img src={selectedCouple.imagen} alt={selectedCouple.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-pink-50 flex items-center justify-center text-pink-300">
                    <Heart size={48} />
                  </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1">
                  <div className="bg-pink-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                    {calculateYears(selectedCouple.fechaMatrimonio, view === 'calendar' ? year : currentYear)}
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-extrabold text-gray-800 mb-1">{selectedCouple.nombre}</h3>
              
              <div className="bg-pink-50 text-pink-600 px-4 py-2 rounded-xl font-bold mt-2 border-2 border-pink-100 flex items-center gap-2">
                <CalendarIcon size={18} />
                {(() => {
                  const [, m, d] = selectedCouple.fechaMatrimonio.split('-');
                  return `${parseInt(d, 10)} de ${monthNames[parseInt(m, 10) - 1]}`;
                })()}
              </div>
              
              <p className="text-gray-500 mt-4 text-sm font-medium bg-gray-50 px-4 py-2 rounded-xl border-2 border-gray-100">
                Se casaron el {selectedCouple.fechaMatrimonio.split('-').reverse().join('-')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
