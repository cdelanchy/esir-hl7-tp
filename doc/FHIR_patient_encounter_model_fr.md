# Modèle de données FHIR pour le TP HL7v2

## 1. Objectif

Le but de cette version FHIR du TP est de remplacer la logique *ad hoc* de stockage du patient dans une base Mongo par des ressources standardisées conformes à FHIR R4.

Le front-end lit un message HL7 v2 ADT, le transforme en un `Bundle` FHIR de type `transaction` et l'envoie au serveur FHIR. Le tableau des patients est ensuite reconstruit uniquement à partir des ressources présentes sur le serveur.

Trois ressources sont utilisées :

- `Patient` pour les données administratives du patient ;
- `Encounter` pour le séjour (la venue) **et** pour chacun de ses mouvements ;
- `Location` pour les emplacements (service, chambre, lit).

Les événements HL7 ADT pris en charge sont :

- `ADT^A01` : admission ;
- `ADT^A02` : transfert/mutation ;
- `ADT^A03` : sortie.

Tout autre type de message est rejeté (`Message type is unknown or undefined`).

---

## 2. Principes de modélisation

### 2.1. Ressource `Patient`

La ressource `Patient` contient les informations démographiques et l'identité du patient (IPP, noms, sexe, date de naissance).

### 2.2. Ressources `Encounter` : séjour et mouvements

Le modèle distingue deux niveaux d'`Encounter` :

| Niveau | Identifié par | Rôle |
|---|---|---|
| **Séjour** (venue) | PV1-19 (numéro de venue, type `VN`) | Encounter parent : statut global et dates d'admission / de sortie du séjour. Il n'a pas de `partOf`. |
| **Mouvement** | ZBE-1 (identifiant du mouvement) | Un Encounter par message A01 / A02 / A03, rattaché au séjour par `partOf`. Il porte la date du mouvement et la localisation (service / chambre / lit). |

```text
Patient
  ▲ subject
  │
Encounter « séjour » (PV1-19 = VN3607)          status, period.start, period.end
  ▲ partOf
  ├── Encounter « mouvement » (ZBE-1 = MOV7090)  A01 : admission    → Location 8780 / 211 / 231-2
  ├── Encounter « mouvement » (ZBE-1 = MOV7091)  A02 : transfert    → Location 8786 / 270 / 270-1
  └── Encounter « mouvement » (ZBE-1 = MOV7092)  A03 : sortie       → Location 8786 / 270 / 270-1
```

L'historique des mouvements est porté par la liste des Encounters « mouvement » d'un séjour.

### 2.3. Ressource `Location`

La ressource `Location` représente l'emplacement du patient. Chaque message crée une hiérarchie de trois `Location` reliées par `partOf` :

```text
Location service (physicalType = wa)
  ▲ partOf
Location chambre (physicalType = ro)
  ▲ partOf
Location lit (physicalType = bd)
```

Ces `Location` sont référencées par l'Encounter « mouvement » (`Encounter.location[]`).

---

## 3. Extraction des données du message HL7

| Donnée | Segment / champ HL7 v2 | Remarque |
|---|---|---|
| Type de message | MSH-9 | normalisé en `ADT^A01`, `ADT^A02` ou `ADT^A03` |
| Date de l'événement | EVN-6, à défaut EVN-2 | **seule** date utilisée pour l'admission, le mouvement et la sortie ; obligatoire |
| IPP | PID-3 | répétition dont le type (PID-3.5) vaut `PI`, sinon la première répétition |
| Système de l'IPP | PID-3.4 (autorité d'affectation, type HD) | voir § 3.1 ; `urn:esir` par défaut |
| Noms | PID-5 (répété) | PID-5.1 nom, PID-5.2 prénom, PID-5.3 second prénom, PID-5.7 type de nom |
| Date de naissance | PID-7 | |
| Sexe | PID-8 | |
| Classe du patient | PV1-2 | |
| Service | PV1-3.1, à défaut PV1-10 | |
| Chambre | PV1-3.2 | |
| Lit | PV1-3.3 | |
| Numéro de séjour (venue) | PV1-19 (type CX) | valeur + système issu de PV1-19.4 |
| Identifiant du mouvement | ZBE-1 (type EI) | valeur + système issu de ZBE-1.2 à ZBE-1.4 |

Les messages sans MSH-9, sans PID-3 ou sans date d'événement (EVN-6 / EVN-2) sont rejetés.

Pour des raisons de simplification, les champs PV1-44 / PV1-45 (dates d'admission et de sortie) ne sont **pas** utilisés : toutes les dates proviennent du segment EVN.

### 3.1. Système des identifiants

Le système (`identifier.system`) des identifiants Patient, séjour et mouvement est calculé à partir de l'autorité d'affectation HL7, à défaut : `urn:esir` (Patient), `urn:esir:encounter-visit` (séjour), `urn:esir:encounter-movement` (mouvement).

Exemple : `GZL_INTEROP&2.16.840.1.113883.2.8.3.7&ISO` → `urn:oid:2.16.840.1.113883.2.8.3.7`.

### 3.2. Dates

Les dates HL7 sont converties au format FHIR :

- `yyyyMMdd` → date (`2002-01-29`) ;
- `yyyyMMddHHmmss` → dateTime ISO avec le fuseau horaire local (`2026-11-09T21:53:48+01:00`).

---

## 4. Modèle `Patient`

### 4.1. Champs produits

| Champ FHIR | Valeur | Source HL7 v2 |
|---|---|---|
| `id` | identifiant technique | attribué par le serveur FHIR |
| `identifier[0].use` | `official` | constante |
| `identifier[0].type` | `v2-0203#PI` (*Patient internal identifier*) | constante |
| `identifier[0].system` | système de l'IPP | PID-3.4 |
| `identifier[0].value` | IPP | PID-3.1 |
| `active` | `true` | constante |
| `name[]` | un élément par répétition de PID-5 | PID-5 |
| `gender` | `male` / `female` / `other` / `unknown` | PID-8 (`M` / `F` / `O` / autre) |
| `birthDate` | date de naissance | PID-7 |

### 4.2. Mapping des noms (PID-5)

| HL7 v2 | FHIR |
|---|---|
| PID-5.1 | `name[].family` |
| PID-5.2, PID-5.3 | `name[].given[]` (prénom puis second prénom) |
| PID-5.7 = `L` (nom de naissance / légal) | `name[].use = official` |
| PID-5.7 = `D` (nom d'usage) | `name[].use = usual` |

Si PID-5 est vide, un nom par défaut est produit (`family = "Inconnu"`, `given = ["Patient"]`).

### 4.3. Exemple JSON de `Patient`

```json
{
  "resourceType": "Patient",
  "identifier": [
    {
      "use": "official",
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/v2-0203",
            "code": "PI",
            "display": "Patient internal identifier"
          }
        ]
      },
      "system": "urn:oid:1.3.6.1.4.1.12559.11.36.3",
      "value": "DDS-55441"
    }
  ],
  "active": true,
  "name": [
    {
      "use": "official",
      "family": "BOUVIER",
      "given": ["FIRMIN"]
    }
  ],
  "gender": "male",
  "birthDate": "2002-01-29"
}
```

---

## 5. Modèle `Encounter`

### 5.1. Champs communs (séjour et mouvement)

| Champ FHIR | Valeur | Source HL7 v2 |
|---|---|---|
| `id` | identifiant technique | attribué par le serveur FHIR |
| `status` | `finished` pour un A03, sinon `in-progress` | type de message |
| `class` | code `v3-ActCode` | PV1-2 (voir ci-dessous) |
| `subject` | référence vers le `Patient` du Bundle | PID-3 |

Mapping de PV1-2 vers `Encounter.class` (système `http://terminology.hl7.org/CodeSystem/v3-ActCode`) :

| PV1-2 | `class.code` | `class.display` |
|---|---|---|
| `O` | `AMB` | ambulatory |
| `E` | `EMER` | emergency |
| `I`, `R` ou autre | `IMP` | inpatient encounter |

### 5.2. Encounter « séjour »

| Champ FHIR | Valeur | Source |
|---|---|---|
| `identifier[0].type` | `fr-core-cs-identifier-type#VN` (*Visit Number*) | constante |
| `identifier[0].system` / `value` | numéro de séjour | PV1-19 |
| `period.start` | date d'admission | date d'événement de l'A01 (reprise du serveur pour A02 / A03) |
| `period.end` | date de sortie | date d'événement de l'A03 |

Le séjour n'a pas de `partOf`. Comme il est remplacé intégralement à chaque message (PUT conditionnel, § 7), les messages A02 et A03 relisent sur le serveur la date d'admission du séjour pour la conserver dans `period.start`.

### 5.3. Encounter « mouvement »

| Champ FHIR | Valeur | Source |
|---|---|---|
| `identifier[0].type.text` | `Identifiant du mouvement (ZBE-1)` | constante |
| `identifier[0].system` / `value` | identifiant du mouvement | ZBE-1 |
| `partOf` | référence vers l'Encounter « séjour » | PV1-19 |
| `period.start` | date du mouvement | EVN-6 / EVN-2 |
| `period.end` | date du mouvement, uniquement pour un A03 | EVN-6 / EVN-2 |
| `location[]` | une entrée par niveau (service, chambre, lit) | PV1-3 |
| `location[].location` | référence vers la `Location` + `display` = nom | PV1-3 |
| `location[].status` | `completed` pour un A03, sinon `active` | type de message |
| `location[].physicalType` | `wa` / `ro` / `bd` | niveau de la localisation |

### 5.4. Exemple JSON : séjour et mouvement (A01)

```json
{
  "resourceType": "Encounter",
  "identifier": [
    {
      "use": "official",
      "type": {
        "coding": [
          {
            "system": "https://hl7.fr/ig/fhir/core/CodeSystem/fr-core-cs-identifier-type",
            "code": "VN",
            "display": "Visit Number"
          }
        ]
      },
      "system": "urn:oid:2.16.840.1.113883.2.8.3.7",
      "value": "VN3607"
    }
  ],
  "status": "in-progress",
  "class": {
    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code": "IMP",
    "display": "inpatient encounter"
  },
  "subject": { "reference": "urn:uuid:<patient>" },
  "period": { "start": "2026-11-09T21:53:48+01:00" }
}
```

```json
{
  "resourceType": "Encounter",
  "identifier": [
    {
      "use": "official",
      "type": { "text": "Identifiant du mouvement (ZBE-1)" },
      "system": "urn:oid:2.16.840.1.113883.2.8.3.7",
      "value": "MOV7090"
    }
  ],
  "status": "in-progress",
  "class": {
    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code": "IMP",
    "display": "inpatient encounter"
  },
  "subject": { "reference": "urn:uuid:<patient>" },
  "partOf": { "reference": "urn:uuid:<sejour>" },
  "period": { "start": "2026-11-09T21:53:48+01:00" },
  "location": [
    {
      "location": { "reference": "urn:uuid:<service>", "display": "8780" },
      "status": "active",
      "physicalType": {
        "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/location-physical-type", "code": "wa", "display": "Ward" }]
      }
    },
    {
      "location": { "reference": "urn:uuid:<chambre>", "display": "211" },
      "status": "active",
      "physicalType": {
        "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/location-physical-type", "code": "ro", "display": "Room" }]
      }
    },
    {
      "location": { "reference": "urn:uuid:<lit>", "display": "231-2" },
      "status": "active",
      "physicalType": {
        "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/location-physical-type", "code": "bd", "display": "Bed" }]
      }
    }
  ]
}
```

Pour l'A03 correspondant, le séjour passe à `status = finished` avec `period.end` renseignée, et le mouvement MOV7092 a `status = finished`, `period.start = period.end = date de sortie` et ses `location[].status = completed`.

---

## 6. Modèle `Location`

### 6.1. Champs produits

| Champ FHIR | Service | Chambre | Lit |
|---|---|---|---|
| `name` | PV1-3.1 (à défaut PV1-10) | PV1-3.2 | PV1-3.3 |
| `status` | `active` | `active` | `active` |
| `physicalType` (`location-physical-type`) | `wa` / Ward | `ro` / Room | `bd` / Bed |
| `type` (`urn:esir:location-type`) | `AILE` / Aile | `CHAMB` / Chambre | `LIT` / Lit |
| `partOf` | — | service | chambre (à défaut service) |

Un niveau absent du message (par exemple pas de lit) n'est pas créé.

### 6.2. Exemple JSON de `Location` (lit)

```json
{
  "resourceType": "Location",
  "status": "active",
  "name": "231-2",
  "physicalType": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/location-physical-type",
        "code": "bd",
        "display": "Bed"
      }
    ]
  },
  "type": [
    {
      "coding": [
        {
          "system": "urn:esir:location-type",
          "code": "LIT",
          "display": "Lit"
        }
      ]
    }
  ],
  "partOf": { "reference": "urn:uuid:<chambre>" }
}
```

---

## 7. Bundle de transaction FHIR

Chaque message HL7 produit **un** `Bundle` de type `transaction`, envoyé par `POST` à la racine du serveur FHIR (`/fhir/`). Il contient, dans cet ordre :

| Entrée | Requête | Effet |
|---|---|---|
| `Patient` | `PUT Patient?identifier=<system>\|<IPP>` | création ou mise à jour du patient identifié par son IPP |
| Encounter « séjour » | `PUT Encounter?identifier=<system>\|<PV1-19>` | création (A01) ou remplacement (A02 / A03) du séjour |
| Encounter « mouvement » | `PUT Encounter?identifier=<system>\|<ZBE-1>` | création du mouvement (ou remplacement s'il est rejoué) |
| `Location` service / chambre / lit | `POST Location` | création des localisations |

Points importants :

- chaque entrée possède un `fullUrl` de la forme `urn:uuid:<uuid>` ; les références internes (`subject`, `partOf`, `location`) utilisent ces `fullUrl` et sont réécrites par le serveur avec les identifiants définitifs ;
- les `PUT` conditionnels sur l'identifiant permettent à un A02 / A03 de **mettre à jour le même séjour** au lieu d'en créer un nouveau ;
- si un Encounter n'a pas d'identifiant (PV1-19 ou ZBE-1 absent), il est créé par `POST` ;
- les `Location` sont recréées à chaque message (pas de dédoublonnage).

### 7.1. Exemple de Bundle (A01, abrégé)

```json
{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [
    {
      "fullUrl": "urn:uuid:<patient>",
      "resource": { "resourceType": "Patient", "...": "voir § 4.3" },
      "request": {
        "method": "PUT",
        "url": "Patient?identifier=urn:oid:1.3.6.1.4.1.12559.11.36.3|DDS-55441"
      }
    },
    {
      "fullUrl": "urn:uuid:<sejour>",
      "resource": { "resourceType": "Encounter", "...": "séjour, voir § 5.4" },
      "request": {
        "method": "PUT",
        "url": "Encounter?identifier=urn:oid:2.16.840.1.113883.2.8.3.7|VN3607"
      }
    },
    {
      "fullUrl": "urn:uuid:<mouvement>",
      "resource": { "resourceType": "Encounter", "...": "mouvement, voir § 5.4" },
      "request": {
        "method": "PUT",
        "url": "Encounter?identifier=urn:oid:2.16.840.1.113883.2.8.3.7|MOV7090"
      }
    },
    {
      "fullUrl": "urn:uuid:<service>",
      "resource": { "resourceType": "Location", "name": "8780", "...": "voir § 6" },
      "request": { "method": "POST", "url": "Location" }
    },
    {
      "fullUrl": "urn:uuid:<chambre>",
      "resource": { "resourceType": "Location", "name": "211", "...": "voir § 6" },
      "request": { "method": "POST", "url": "Location" }
    },
    {
      "fullUrl": "urn:uuid:<lit>",
      "resource": { "resourceType": "Location", "name": "231-2", "...": "voir § 6" },
      "request": { "method": "POST", "url": "Location" }
    }
  ]
}
```

---

## 8. Règles de mapping et de contrôle HL7 ADT -> FHIR

Avant la transformation, le front interroge le serveur FHIR :

1. recherche du `Patient` par `identifier=<system>|<IPP>` ;
2. pour A02 / A03 : recherche de l'Encounter « séjour » par `identifier=<system>|<PV1-19>` ;
3. recherche du dernier mouvement du séjour (`part-of=Encounter/<id>`, `_sort=-date`, `_count=1`).

Ces informations servent aux contrôles ci-dessous. En cas d'erreur, aucun Bundle n'est envoyé.

### 8.1. `ADT^A01` : admission

- refusé si un `Patient` avec cet IPP existe déjà sur le serveur (`Patient already exists!`) ;
- création du `Patient` ;
- création du séjour : `status = in-progress`, `period.start = date d'événement` ;
- création du mouvement d'admission : `status = in-progress`, `period.start = date d'événement`, `partOf` = séjour, localisation issue de PV1-3 ;
- création des `Location` service / chambre / lit.

### 8.2. `ADT^A02` : transfert

- refusé si le patient n'existe pas (`Patient has not been admitted yet.`) ;
- refusé si le séjour PV1-19 n'existe pas sur le serveur ;
- refusé si le séjour est déjà terminé (`Patient already discharged!`) ;
- refusé si la date d'événement est antérieure à la date du dernier mouvement (ou, à défaut, à la date d'admission) ;
- le séjour est remplacé en conservant sa date d'admission, `status = in-progress` ;
- un nouveau mouvement (ZBE-1) est créé avec la nouvelle localisation et `period.start = date d'événement` ;
- les mouvements précédents ne sont pas modifiés.

### 8.3. `ADT^A03` : sortie

- mêmes contrôles que pour l'A02 (patient, séjour existant et non terminé, date cohérente) ;
- le séjour est remplacé avec `status = finished`, `period.start` = date d'admission conservée, `period.end = date d'événement` ;
- un mouvement de sortie est créé avec `status = finished`, `period.start = period.end = date d'événement` et des `location[].status = completed` ;
- la ressource `Patient` reste présente, seul le séjour est clôturé.

---

## 9. Reconstruction du tableau des patients

Le front recharge périodiquement (toutes les 15 s par défaut, variable `VITE_PATIENTS_REFRESH_INTERVAL_SECONDS`) **tous** les `Patient` et **tous** les `Encounter` du serveur, puis construit une ligne par patient.

### 9.1. Classement des Encounters

- un Encounter **sans** `partOf` (ou dont `partOf` pointe sur lui-même) est un **séjour**, rattaché au patient via `subject` ;
- un Encounter **avec** `partOf` est un **mouvement** du séjour référencé ;
- les Encounters sont triés du plus récent au plus ancien sur `period.start`, puis sur `meta.lastUpdated`.

### 9.2. Colonnes du tableau

| Colonne | Calcul |
|---|---|
| Nom | `Patient.name` de `use = official` (sinon sans `use`, sinon le premier) → `family` |
| Nom d'usage | `Patient.name` de `use = usual` → `family` |
| Prénom | premier `given` du nom officiel, sinon du nom d'usage |
| Sexe | `Patient.gender` |
| Date de naissance | `Patient.birthDate` |
| IPP | `Patient.identifier` de type `PI` (sinon le premier), affiché avec son `system` |
| Date d'admission | `period.start` du séjour le plus récent |
| Date de sortie | `period.end` du séjour le plus récent |
| Service / chambre / lit | `location[].location.display` du dernier mouvement du séjour, selon `physicalType` (`wa` / `ro` / `bd`) |
| Statut | `Sortie` si le séjour est `finished`, `Transfert` s'il a plus d'un mouvement, sinon `Admission` |

Les patients sont triés par activité la plus récente (date du dernier mouvement, à défaut date d'admission) ; les patients sans séjour apparaissent en dernier.

### 9.3. Historique des mouvements

L'historique déplié sous chaque patient liste tous ses séjours (le plus récent d'abord) avec :

- le numéro de séjour (`identifier[0].value`), les dates de début et de fin ;
- ses mouvements dans l'ordre chronologique, chacun avec sa date (`period.start`), son service / sa chambre / son lit et son type :
  - `Sortie` si le mouvement est `finished` ;
  - `Admission` pour le premier mouvement du séjour ;
  - `Transfert / mutation` pour les autres.
