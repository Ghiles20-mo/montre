import ImportExcel from "./ImportExcel";

export default function ImportPage() {
  return (
    <div className="space-y-4">
      <details className="card text-sm text-stone-600">
        <summary className="cursor-pointer font-semibold text-stone-900">Comment préparer le fichier ?</summary>
        <div className="mt-3 space-y-2">
          <p>
            La première ligne contient les en-têtes. Colonnes reconnues : <b>reference</b>, <b>nom</b>,{" "}
            <b>prix</b> (obligatoires), <b>marque</b>, <b>numero de serie</b>, <b>stock</b> (oui/non),{" "}
            <b>description</b>.
          </p>
          <p>
            Si une référence existe déjà, la montre est <b>mise à jour</b> (sa photo est conservée). Les colonnes
            absentes du fichier ne sont pas modifiées.
          </p>
          <p>Après l&apos;import, ajoutez les photos dans l&apos;onglet « Photos ».</p>
        </div>
      </details>
      <ImportExcel />
    </div>
  );
}
