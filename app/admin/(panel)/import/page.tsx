import ImportExcel from "./ImportExcel";

export default function ImportPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Importer des montres depuis Excel</h1>
      <div className="card space-y-2 text-sm text-stone-600">
        <p>
          La première ligne doit contenir les en-têtes. Colonnes reconnues :{" "}
          <b>reference</b>, <b>nom</b>, <b>prix</b> (obligatoires), <b>marque</b>, <b>stock</b> (oui/non),{" "}
          <b>description</b>.
        </p>
        <p>
          Si une référence existe déjà, la montre est <b>mise à jour</b> (sa photo est conservée). Les
          colonnes absentes du fichier ne sont pas modifiées.
        </p>
        <p>Après l&apos;import, ajoutez les photos dans l&apos;onglet « Photos ».</p>
      </div>
      <ImportExcel />
    </div>
  );
}
