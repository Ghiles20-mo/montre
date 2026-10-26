import ConfirmButton from "@/components/ConfirmButton";
import { db } from "@/lib/supabase";
import { createEmployee, deleteEmployee, regenerateCode, toggleEmployee, toggleEmployeeEdit } from "../actions";

type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  access_code: string;
  active: boolean;
  can_edit: boolean;
};

export default async function EmployeesPage() {
  const { data } = await db().from("employees").select("*").order("last_name");
  const employees = (data ?? []) as Employee[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Employés</h1>
        <p className="text-sm text-stone-500">
          « Lecture seule » : recherche et consultation. « Peut modifier » : peut aussi changer le prix, le
          stock, les infos et la photo d&apos;une montre. Ajout, suppression et import restent réservés à
          l&apos;admin.
        </p>
      </div>

      <form action={createEmployee} className="card flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">Prénom</label>
          <input name="first_name" required className="input" />
        </div>
        <div className="flex-1">
          <label className="label">Nom</label>
          <input name="last_name" required className="input" />
        </div>
        <button className="btn">Ajouter (code généré)</button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-left text-stone-500">
            <tr>
              <th className="p-3">Nom</th>
              <th className="p-3">Code d&apos;accès</th>
              <th className="p-3">Droits</th>
              <th className="p-3">Statut</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-b border-stone-100 last:border-0">
                <td className="p-3 font-medium">{e.first_name} {e.last_name}</td>
                <td className="p-3">
                  <span className="rounded bg-stone-100 px-2 py-1 font-mono tracking-widest">{e.access_code}</span>
                </td>
                <td className="p-3">
                  <form action={toggleEmployeeEdit}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="can_edit" value={String(e.can_edit)} />
                    <button
                      title="Cliquer pour changer"
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${e.can_edit ? "bg-amber-100 text-amber-800" : "bg-sky-100 text-sky-800"}`}
                    >
                      {e.can_edit ? "Peut modifier" : "Lecture seule"}
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <form action={toggleEmployee}>
                    <input type="hidden" name="id" value={e.id} />
                    <input type="hidden" name="active" value={String(e.active)} />
                    <button
                      title="Cliquer pour changer"
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${e.active ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"}`}
                    >
                      {e.active ? "Actif" : "Désactivé"}
                    </button>
                  </form>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <form action={regenerateCode}>
                      <input type="hidden" name="id" value={e.id} />
                      <ConfirmButton message="Générer un nouveau code ? L'ancien ne fonctionnera plus." className="btn-light">
                        Nouveau code
                      </ConfirmButton>
                    </form>
                    <form action={deleteEmployee}>
                      <input type="hidden" name="id" value={e.id} />
                      <ConfirmButton message={`Supprimer ${e.first_name} ${e.last_name} ?`} className="btn-danger">
                        Suppr.
                      </ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-stone-500">Aucun employé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
