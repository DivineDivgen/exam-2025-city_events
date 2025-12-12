import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Select,
  Option,
  Chip,
  Alert,
} from "@material-tailwind/react";
import useAuth from "@/hooks/useAuth";

const emptyEvent = {
  title: "",
  description: "",
  location: "",
  imageUrl: "",
  startAt: "",
  endAt: "",
  categoryId: "",
  published: true,
};

export default function Events() {
  const { user, headers, API_BASE, error: authError, message: authMsg } = useAuth();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyEvent);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
    loadEvents();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError("Nepavyko gauti kategorijų");
    }
  };

  const loadEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/events?includeUnpublished=1&includeBlocked=1`);
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError("Nepavyko gauti renginių");
    }
  };

  const createCategory = async (name) => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Nepavyko sukurti kategorijos");
      setMessage("Kategorija sukurta");
      await loadCategories();
    } catch (err) {
      setError(err.message);
    }
  };

  const createEvent = async () => {
    if (!user) {
      setError("Prisijunkite (ADMIN) norėdami kurti renginius");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const payload = {
        ...form,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
      };
      const res = await fetch(`${API_BASE}/api/events`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.message || "Nepavyko sukurti renginio");
      }
      setMessage("Renginys sukurtas");
      setForm(emptyEvent);
      await loadEvents();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleBlocked = async (id, blocked) => {
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ blocked }),
      });
      if (!res.ok) throw new Error("Nepavyko atnaujinti");
      await loadEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  const togglePublished = async (id, published) => {
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ published }),
      });
      if (!res.ok) throw new Error("Nepavyko atnaujinti");
      await loadEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteEvent = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Nepavyko ištrinti");
      await loadEvents();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mt-10 flex flex-col gap-6">
      <Card className="border border-blue-gray-100">
        <CardHeader floated={false} shadow={false} className="p-6 bg-gray-50">
          <Typography variant="h6">Naujas renginys</Typography>
          <Typography variant="small" color="blue-gray">
            Sukurkite renginį (ADMIN arba renginio autorius)
          </Typography>
        </CardHeader>
        <CardBody className="grid gap-4">
          {(error || authError) && (
            <Alert color="red" variant="ghost">
              {error || authError}
            </Alert>
          )}
          {(message || authMsg) && (
            <Alert color="green" variant="ghost">
              {message || authMsg}
            </Alert>
          )}
          <div className="grid md:grid-cols-2 gap-3">
            <Input label="Pavadinimas" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            <Input label="Vieta" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            <Input label="Pradžia" type="datetime-local" value={form.startAt} onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))} />
            <Input label="Pabaiga" type="datetime-local" value={form.endAt} onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))} />
            <Input label="Nuotraukos URL" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} />
            <Select label="Kategorija" value={form.categoryId} onChange={(val) => setForm((f) => ({ ...f, categoryId: val || "" }))}>
              <Option value="">Be kategorijos</Option>
              {categories.map((c) => (
                <Option key={c.id} value={String(c.id)}>
                  {c.name}
                </Option>
              ))}
            </Select>
            <Input label="Aprašymas" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="flex gap-3 items-center">
            <Button onClick={createEvent} disabled={loading}>
              {loading ? "Kuriama..." : "Sukurti renginį"}
            </Button>
            <Button variant="text" color="blue" onClick={() => createCategory(prompt("Nauja kategorija"))}>
              + Nauja kategorija
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card className="border border-blue-gray-100">
        <CardHeader floated={false} shadow={false} className="p-6 bg-gray-50">
          <Typography variant="h6">Renginiai</Typography>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          <table className="w-full min-w-[800px] table-auto text-left">
            <thead>
              <tr>
                {["Pavadinimas", "Data", "Kategorija", "Autorius", "Būsena", "Veiksmai"].map((h) => (
                  <th key={h} className="border-b border-blue-gray-50 py-3 px-4">
                    <Typography variant="small" className="font-semibold text-blue-gray-600 uppercase text-xs">
                      {h}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-blue-gray-50 last:border-none">
                  <td className="py-3 px-4">
                    <Typography className="font-semibold">{e.title}</Typography>
                    <Typography variant="small" className="text-blue-gray-500">
                      {e.location}
                    </Typography>
                  </td>
                  <td className="py-3 px-4 text-sm text-blue-gray-500">
                    {new Date(e.startAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    {e.category ? (
                      <Chip size="sm" value={e.category.name} variant="outlined" color="blue" />
                    ) : (
                      <Chip size="sm" value="Nenurodyta" variant="ghost" color="gray" />
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Typography variant="small" className="text-blue-gray-600">
                      {e.createdBy?.email || "-"}
                    </Typography>
                  </td>
                  <td className="py-3 px-4 flex flex-col gap-2">
                    <Chip
                      size="sm"
                      variant="ghost"
                      color={e.published ? "green" : "gray"}
                      value={e.published ? "Publikuota" : "Nepublikuota"}
                    />
                    <Chip
                      size="sm"
                      variant="ghost"
                      color={e.blocked ? "red" : "green"}
                      value={e.blocked ? "Užblokuota" : "Leidžiama"}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outlined" color="green" onClick={() => togglePublished(e.id, !e.published)}>
                        {e.published ? "Paslėpti" : "Publikuoti"}
                      </Button>
                      <Button size="sm" variant="outlined" color="red" onClick={() => toggleBlocked(e.id, !e.blocked)}>
                        {e.blocked ? "Atblokuoti" : "Blokuoti"}
                      </Button>
                      <Button size="sm" variant="text" color="red" onClick={() => deleteEvent(e.id)}>
                        Ištrinti
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
