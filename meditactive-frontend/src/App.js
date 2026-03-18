import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

function App() {
  const api = axios.create({ baseURL: "http://localhost:5000/api" });

  // --- UTENTI ---
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("");
  const [userSurname, setUserSurname] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [editUserId, setEditUserId] = useState(null);

  // --- INTERVALLI ---
  const [intervals, setIntervals] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [userIdInterval, setUserIdInterval] = useState("");
  const [editIntervalId, setEditIntervalId] = useState(null);

  // --- FILTRAGGIO INTERVALLI ---
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterGoal, setFilterGoal] = useState("");

  const [userErrors, setUserErrors] = useState({});

  // --- GOAL ---
  const [meditations, setMeditations] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState({});

  // --- FUNZIONE MAP INTERVALLI ---
  const mapIntervals = (intervalsData, usersData, meditationsData) => {
    return intervalsData.map(i => {
      const user = usersData.find(u => u.id === i.userId) || { nome: "Utente", cognome: "Sconosciuto" };
      const goalObjects = (i.goals || []).map(goalId => {
        return meditationsData.find(m => m.id === goalId) || { id: goalId, title: "Goal sconosciuto", type: "custom" };
      });

      return {
        ...i,
        userName: `${user.nome} ${user.cognome}`,
        goals: goalObjects
      };
    });
  };

  // --- FETCH INIZIALE ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, meditationsRes] = await Promise.all([
          api.get("/users"),
          api.get("/meditations")
        ]);

        setUsers(usersRes.data);
        setMeditations(meditationsRes.data);

        const intervalsRes = await api.get("/intervals");
        setIntervals(mapIntervals(intervalsRes.data, usersRes.data, meditationsRes.data));
      } catch (err) {
        console.error("Errore fetch iniziale:", err);
      }
    };

    fetchData();
  }, []);

  // --- FILTRO INTERVALLI ---
  const applyFilter = async () => {
    try {
      let url = "/intervals?";
      if (filterGoal) url += `goalId=${filterGoal}&`;
      if (filterStart) url += `start=${filterStart}&`;
      if (filterEnd) url += `end=${filterEnd}&`;

      const res = await api.get(url);
      setIntervals(mapIntervals(res.data, users, meditations));
    } catch (err) {
      console.error("Errore filtraggio intervalli:", err);
    }
  };

  const resetFilter = async () => {
    setFilterStart("");
    setFilterEnd("");
    setFilterGoal("");

    try {
      const res = await api.get("/intervals");
      setIntervals(mapIntervals(res.data, users, meditations));
    } catch (err) {
      console.error("Errore reset intervalli:", err);
    }
  };

  // --- CRUD UTENTI ---
  const addOrEditUser = async () => {
    let errors = {};
    if (!userName.trim()) errors.name = "Inserisci un nome";
    if (!userSurname.trim()) errors.surname = "Inserisci un cognome";
    if (!userEmail.trim()) errors.email = "Inserisci una email";
    setUserErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      if (editUserId) {
        const res = await api.put(`/users/${editUserId}`, { nome: userName, cognome: userSurname, email: userEmail });
        setUsers(users.map(u => u.id === editUserId ? res.data : u));
        setEditUserId(null);
      } else {
        const res = await api.post("/users", { nome: userName, cognome: userSurname, email: userEmail });
        setUsers([...users, res.data]);
      }
      setUserName("");
      setUserSurname("");
      setUserEmail("");
      setUserErrors({});
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async id => {
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const startEditUser = user => {
    setEditUserId(user.id);
    setUserName(user.nome);
    setUserSurname(user.cognome);
    setUserEmail(user.email);
  };

  // --- CRUD INTERVALLI ---
  const addOrEditInterval = async () => {
    if (!startDate || !endDate || !userIdInterval) {
      alert("Inserisci tutte le informazioni: startDate, endDate, Utente!");
      return;
    }

    try {
      if (editIntervalId) {
        const res = await api.put(`/intervals/${editIntervalId}`, { startDate, endDate, userId: Number(userIdInterval) });
        setIntervals(intervals.map(i => i.id === editIntervalId ? { ...res.data, goals: [] } : i));
        setEditIntervalId(null);
      } else {
        const res = await api.post("/intervals", { startDate, endDate, userId: Number(userIdInterval) });
        const user = users.find(u => u.id === Number(userIdInterval));
        setIntervals([...intervals, { ...res.data, userName: user ? `${user.nome} ${user.cognome}` : "Utente sconosciuto", goals: [] }]);
      }

      setStartDate("");
      setEndDate("");
      setUserIdInterval("");
    } catch (err) {
      console.error("Errore Intervallo:", err);
      alert("Errore durante la creazione/modifica dell'intervallo");
    }
  };

  const startEditInterval = interval => {
    setEditIntervalId(interval.id);
    setStartDate(interval.startDate);
    setEndDate(interval.endDate);
    setUserIdInterval(interval.userId);
  };

  const deleteInterval = async id => {
    try {
      await api.delete(`/intervals/${id}`);
      setIntervals(intervals.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // --- ASSOCIA GOAL ---
  const associateGoal = async intervalId => {
    const goalId = selectedGoal[intervalId];
    if (!goalId) return;

    try {
      const res = await api.post(`/intervals/${intervalId}/goals`, { goalId: Number(goalId) });
      const user = users.find(u => u.id === res.data.interval.userId);
      const updatedInterval = { ...res.data.interval, userName: user ? `${user.nome} ${user.cognome}` : "Utente sconosciuto", goals: (res.data.interval.goals || []).map(id => meditations.find(m => m.id === id) || { id, title: "Goal sconosciuto", type: "custom" }) };
      setIntervals(intervals.map(i => i.id === intervalId ? updatedInterval : i));
      setSelectedGoal({ ...selectedGoal, [intervalId]: "" });
    } catch (err) {
      console.error(err);
    }
  };

  // --- RENDER ---
  return (
    <div className="app-container">
      <h1 className="app-title">MeditActive Dashboard</h1>

      {/* UTENTI */}
      <h2>Utenti</h2>
      <div className="form-add">
        <input placeholder="Nome" value={userName} onChange={e => setUserName(e.target.value)} />
        {userErrors.name && <div className="error">{userErrors.name}</div>}
        <input placeholder="Cognome" value={userSurname} onChange={e => setUserSurname(e.target.value)} />
        {userErrors.surname && <div className="error">{userErrors.surname}</div>}
        <input placeholder="Email" value={userEmail} onChange={e => setUserEmail(e.target.value)} />
        {userErrors.email && <div className="error">{userErrors.email}</div>}
        <button onClick={addOrEditUser}>{editUserId ? "Salva Modifica" : "Aggiungi Utente"}</button>
      </div>

      <ul className="meditations-list">
        {users.map(u => (
          <li key={u.id}>
            {u.nome} {u.cognome} ({u.email})
            <button onClick={() => startEditUser(u)}>Modifica</button>
            <button className="btn-delete" onClick={() => deleteUser(u.id)}>Elimina</button>
          </li>
        ))}
      </ul>

      {/* INTERVALLI */}
      <h2>Intervalli</h2>

      {/* FILTRO INTERVALLI */}
      <div className="filter-form">
        <h3>Filtra Intervalli</h3>
        <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} placeholder="Data inizio" />
        <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} placeholder="Data fine" />
        <select value={filterGoal} onChange={e => setFilterGoal(e.target.value)}>
          <option value="">Tutti i goal</option>
          {meditations.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
        <button onClick={applyFilter}>Filtra</button>
        <button onClick={resetFilter}>Reset</button>
      </div>

      <div className="form-interval">
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <select value={userIdInterval} onChange={e => setUserIdInterval(e.target.value)}>
          <option value="">Seleziona Utente</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.nome} {u.cognome} ({u.email})</option>)}
        </select>
        <button onClick={addOrEditInterval}>{editIntervalId ? "Salva Modifica" : "Aggiungi Intervallo"}</button>
      </div>

      <ul>
        {intervals.map(i => (
          <li key={i.id}>
            {new Date(i.startDate).toLocaleDateString("it-IT")} → {new Date(i.endDate).toLocaleDateString("it-IT")} | Utente: {i.userName} |
            Goals: {(i.goals || []).length ? i.goals.map(goal => <span key={goal.id} className={`badge-goal ${goal.type || 'custom'}`}>{goal.title}</span>) : "Nessuno"}
            <button onClick={() => startEditInterval(i)}>Modifica</button>
            <button className="btn-delete" onClick={() => deleteInterval(i.id)}>Elimina</button>

            <select value={selectedGoal[i.id] || ""} onChange={e => setSelectedGoal({ ...selectedGoal, [i.id]: e.target.value })}>
              <option value="">Seleziona Goal</option>
              {meditations.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
            <button onClick={() => associateGoal(i.id)}>Aggiungi Goal</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;