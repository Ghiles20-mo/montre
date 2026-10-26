import ConfirmButton from "@/components/ConfirmButton";
import Icon from "@/components/Icon";
import { db } from "@/lib/supabase";
import {
  createEmployee,
  deleteEmployee,
  regenerateCode,
  setEmployeeActive,
  setEmployeeRights,
} from "../actions";

type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  access_code: string;
  active: boolean;
  can_edit: boolean;
};

const RIGHTS = [
  { value: false, title: "Lecture seule", desc: "Recherche et consulte les montres" },
  { value: true, title: "Ajout et modification", desc: "Peut aussi ajouter des montres, changer prix, stock et photo" },
];

export default async function EmployeesPage() {
  const { data } = await db().from("employees").select("*").order("last_name");
  const employees = (data ?? []) as Employee[];

  return (
    <div className="space-y-6">
      {/* Création */}
      <form action={createEmployee} className="card space-y-4">
        <h2 className="text-base font-semibold">Nouvel employé</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="label">Prénom</span>
            <input name="first_name" required autoCapitalize="words" className="input" />
          </label>
          <label className="block">
            <span className="label">Nom</span>
            <input name="last_name" required autoCapitalize="words" className="input" />
          </label>
        </div>

        <fieldset>
          <legend className="label">Droits</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {RIGHTS.map((r) => (
              <label
                key={String(r.value)}
                className="flex cursor-pointer gap-3 rounded-xl border-2 border-stone-200 p-3 transition has-[:checked]:border-stone-900 has-[:checked]:bg-stone-50"
              >
                <input
                  type="radio"
                  name="can_edit"
                  value={String(r.value)}
                  defaultChecked={!r.value}
                  className="mt-0.5 h-5 w-5 accent-stone-900"
                />
                <span>
                  <span className="block text-sm font-semibold">{r.title}</span>
                  <span className="block text-xs text-stone-500">{r.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button className="btn w-full sm:w-auto">
          <Icon name="plus" /> Créer l&apos;employé
        </button>
        <p className="text-xs text-stone-500">Un code d&apos;accès de 8 caractères est généré automatiquement.</p>
      </form>

      {/* Liste */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold">
          {employees.length} employé{employees.length > 1 ? "s" : ""}
        </h2>

        {employees.length === 0 && <div className="card py-10 text-center text-stone-500">Aucun employé</div>}

        <ul className="grid gap-3 lg:grid-cols-2">
          {employees.map((e) => (
            <li key={e.id} className={`card space-y-4 ${e.active ? "" : "opacity-60"}`}>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-bold uppercase text-white">
                  {e.first_name[0]}
                  {e.last_name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">
                    {e.first_name} {e.last_name}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-2.5 py-1 font-mono text-base font-semibold tracking-[0.2em]">
                    <Icon name="key" className="h-4 w-4 text-stone-500" />
                    {e.access_code}
                  </div>
                </div>
                <form action={setEmployeeActive}>
                  <input type="hidden" name="id" value={e.id} />
                  <input type="hidden" name="active" value={String(!e.active)} />
                  <button
                    title={e.active ? "Désactiver" : "Activer"}
                    className={`relative h-7 w-12 rounded-full transition ${e.active ? "bg-emerald-500" : "bg-stone-300"}`}
                  >
                    <span
                      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                        e.active ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                  <span className="mt-1 block text-center text-[10px] font-medium text-stone-500">
                    {e.active ? "Actif" : "Inactif"}
                  </span>
                </form>
              </div>

              {/* Droits : contrôle segmenté bien visible */}
              <div>
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-stone-500">Droits</span>
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1">
                  {RIGHTS.map((r) => {
                    const active = e.can_edit === r.value;
                    return (
                      <form key={String(r.value)} action={setEmployeeRights}>
                        <input type="hidden" name="id" value={e.id} />
                        <input type="hidden" name="can_edit" value={String(r.value)} />
                        <button
                          disabled={active}
                          className={`w-full rounded-lg px-2 py-2.5 text-sm font-semibold transition ${
                            active
                              ? r.value
                                ? "bg-amber-500 text-white shadow-sm"
                                : "bg-sky-600 text-white shadow-sm"
                              : "text-stone-600 hover:bg-white/60"
                          }`}
                        >
                          {r.value ? "Ajout + modif." : "Lecture seule"}
                        </button>
                      </form>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <form action={regenerateCode} className="flex-1">
                  <input type="hidden" name="id" value={e.id} />
                  <ConfirmButton
                    message="Générer un nouveau code ? L'ancien ne fonctionnera plus."
                    className="btn-light w-full"
                  >
                    <Icon name="key" className="h-4 w-4" /> Nouveau code
                  </ConfirmButton>
                </form>
                <form action={deleteEmployee}>
                  <input type="hidden" name="id" value={e.id} />
                  <ConfirmButton message={`Supprimer ${e.first_name} ${e.last_name} ?`} className="btn-danger">
                    <Icon name="trash" className="h-4 w-4" />
                  </ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
