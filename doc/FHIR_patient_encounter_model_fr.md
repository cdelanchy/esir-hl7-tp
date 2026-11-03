# Modèle de données FHIR pour le TP HL7 v2

## 1. Objectif

Le but de cette version FHIR du TP est de remplacer la logique ad hoc de stockage du patient dans une base Mongo par des ressources standardisées conformes à FHIR R4.

Pour une application pédagogique simplifiée, nous retenons uniquement deux ressources principales :

- `Patient` pour les données administratives du patient ;
- `Encounter` pour les mouvements d’admission, transfert et sortie.

Le but est de représenter de manière simple et explicite les événements HL7 ADT suivants :

- `ADT^A01` : admission
- `ADT^A02` : transfert
- `ADT^A03` : sortie / discharge

---

## 2. Principes de modélisation

### 2.1. Ressource `Patient`

La ressource `Patient` contient les informations démographiques et d’identité du patient.

### 2.2. Ressource `Encounter`

La ressource `Encounter` représente un séjour ou un mouvement hospitalier. Elle est utilisée pour l’admission, le transfert et la sortie.

Dans le cadre du TP, on ne modélise pas toute la complexité d’un séjour hospitalier complet. On garde uniquement les informations utiles à l’interface pédagogique :

- patient concerné ;
- service ;
- chambre ;
- lit ;
- date de début ;
- date de fin ;
- statut courant ;
- historique des mouvements.

---

## 3. Modèle `Patient`

### 3.1. Champs retenus

| Champ FHIR | Type | Description | Source HL7 v2 |
|---|---|---|---|
| `id` | string | identifiant technique de la ressource | généré par le serveur FHIR |
| `identifier` | array | identifiants du patient, notamment l’IPP | PID-3 |
| `name` | array | nom et prénom | PID-5, PID-4 |
| `gender` | code | sexe | PID-8 |
| `birthDate` | date | date de naissance | PID-7 |
| `active` | boolean | patient actif | calculé par le système |
| `managingOrganization` | Reference | structure de rattachement | à définir selon le cas |

### 3.2. Mapping conceptuel

| Donnée métier | FHIR |
|---|---|
| Ipp | `Patient.identifier` |
| Nom | `Patient.name[0].family` |
| Prénom | `Patient.name[0].given[]` |
| Sexe | `Patient.gender` |
| Date de naissance | `Patient.birthDate` |

### 3.3. Exemple JSON de `Patient`

```json
{
  "resourceType": "Patient",
  "id": "patient-123",
  "identifier": [
    {
      "system": "urn:ipp",
      "value": "1234567890"
    }
  ],
  "active": true,
  "name": [
    {
      "family": "Dupont",
      "given": ["Jean", "Pierre"]
    }
  ],
  "gender": "male",
  "birthDate": "1982-05-14"
}
```

### 3.4. Règles métier simplifiées

- un identifiant IPP doit être unique ;
- un patient ne peut pas être recréé s’il existe déjà ;
- si le message `A01` arrive pour un patient déjà admis, l’application doit signaler une anomalie métier.

---

## 4. Modèle `Encounter`

### 4.1. Champs retenus

| Champ FHIR | Type | Description | Source HL7 v2 |
|---|---|---|---|
| `id` | string | identifiant technique | généré par le serveur FHIR |
| `status` | code | statut du séjour (`planned`, `in-progress`, `finished`, `cancelled`) | dérivé du type ADT |
| `class` | Coding | type d’encounter (`inpatient`, `ambulatory`) | PV1-2 |
| `subject` | Reference | référence vers le patient | PID |
| `participant` | array | acteurs / personnel | optionnel pour le TP |
| `period` | object | date de début / fin | PV1-44 / PV1-45 / date événement |
| `location` | array | chambre / lit / service | PV1-3, PV1-6, PV1-10 |
| `serviceType` | CodeableConcept | service de soins | PV1-10 |
| `statusHistory` | array | historique des statuts | utile pour les transferts |
| `reasonCode` | array | motif du mouvement | optionnel |

### 4.2. Mapping principal

| Donnée métier | FHIR |
|---|---|
| service | `Encounter.serviceType` |
| chambre | `Encounter.location[0].physicalType` ou zone de localisation |
| lit | `Encounter.location[0].status` / libellé de localisation |
| date admission | `Encounter.period.start` |
| date sortie | `Encounter.period.end` |
| patient | `Encounter.subject` |
| transfert | nouveau `Encounter` ou mise à jour du déplacement |

### 4.3. Exemple JSON de `Encounter`

```json
{
  "resourceType": "Encounter",
  "id": "encounter-456",
  "status": "in-progress",
  "class": {
    "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code": "IMP",
    "display": "inpatient"
  },
  "subject": {
    "reference": "Patient/patient-123"
  },
  "serviceType": {
    "coding": [
      {
        "system": "http://example.org/service",
        "code": "CARD",
        "display": "Cardiologie"
      }
    ],
    "text": "Cardiologie"
  },
  "period": {
    "start": "2026-11-03T09:15:00+01:00"
  },
  "location": [
    {
      "location": {
        "reference": "Location/room-101"
      },
      "status": "active"
    }
  ]
}
```

---

## 5. Règles de mapping HL7 ADT -> FHIR

### 5.1. `ADT^A01` : admission

- création d’un `Patient` si absent ;
- création d’un `Encounter` avec `status = in-progress` ;
- `period.start = dateEvenement` ;
- `serviceType` = service ;
- `location` = chambre / lit ;

### 5.2. `ADT^A02` : transfert

- le patient existe déjà ;
- l’`Encounter` actif est mis à jour ;
- si le système gère un historique, on ouvre un nouvel `Encounter` ou on enrichit `statusHistory` ;
- `location` est mise à jour avec la nouvelle chambre / lit ;
- la nouvelle période de séjour reste cohérente ;

### 5.3. `ADT^A03` : sortie

- le patient est déjà admis ;
- on met à jour l’`Encounter` actif avec `status = finished` ;
- `period.end = dateEvenement` ;
- la ressource `Patient` reste présente, mais le séjour est clôturé.

---

## 6. Modèle simplifié d’historique

Pour la vue “tableau des patients” du front, on peut reconstruire l’historique à partir des `Encounter`.

### 6.1. Vue métier souhaitée

Le front affiche :

- nom du patient ;
- prénom ;
- sexe ;
- IPP ;
- date de naissance ;
- date d’admission ;
- service ;
- chambre ;
- lit ;
- date de sortie ;
- historique des mouvements.

### 6.2. Calcul à partir des `Encounter`

- `dateAdmission` = première `Encounter.period.start` active ou la date de l’`A01` ;
- `service` = dernier `Encounter.serviceType` actif ;
- `room` / `bed` = dernière localisation connue ;
- `checkoutDate` = date de fin du dernier encounter terminé ;
- `history` = liste ordonnée des mouvements à partir des événements d’`Encounter`.

---

## 7. Bundle de transaction FHIR

Pour l’envoi au serveur FHIR, on peut utiliser un `Bundle` de type `transaction`.

### 7.1. Exemple de Bundle

```json
{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "identifier": [
          {
            "system": "urn:ipp",
            "value": "1234567890"
          }
        ],
        "name": [
          {
            "family": "Dupont",
            "given": ["Jean", "Pierre"]
          }
        ],
        "gender": "male",
        "birthDate": "1982-05-14"
      },
      "request": {
        "method": "PUT",
        "url": "Patient?identifier=urn:ipp|1234567890"
      }
    },
    {
      "resource": {
        "resourceType": "Encounter",
        "status": "in-progress",
        "class": {
          "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          "code": "IMP",
          "display": "inpatient"
        },
        "subject": {
          "reference": "Patient/1234567890"
        },
        "serviceType": {
          "text": "Cardiologie"
        },
        "period": {
          "start": "2026-11-03T09:15:00+01:00"
        }
      },
      "request": {
        "method": "POST",
        "url": "Encounter"
      }
    }
  ]
}
```

### 7.2. Intérêt pédagogique

Ce format est intéressant car il montre clairement au plus tôt :

- le front produit des ressources FHIR structurées ;
- le serveur reçoit des ressources, pas des objets métiers improvisés ;
- la validation se fait selon le standard.

---

## 8. Recommandation pour le TP

Pour éviter de trop complexifier le TP, on recommande de garder un périmètre strict :

- 1 ressource `Patient` ;
- 1 ressource `Encounter` par séjour / mouvement ;
- uniquement 3 événements : admission, transfert, sortie ;
- validation métier minimale réalisée côté interface ou côté service applicatif ;
- stockage sur Aidbox via un `Bundle` transaction.

Ce niveau de modélisation est suffisant pour :

- montrer le principe de FHIR ;
- rester compatible avec la logique métier actuelle ;
- permettre un front autonome et pédagogique.

---

## 9. Synthèse

Le modèle FHIR retenu pour ce TP est le suivant :

- `Patient` pour l’identité du patient ;
- `Encounter` pour le séjour et ses mouvements ;
- mapping simple des messages HL7 ADT `A01/A02/A03` ;
- `Bundle` transaction pour l’échange avec Aidbox ;
- reconstruction du tableau front à partir des ressources FHIR.

C’est une base solide pour une prochaine version plus riche, tout en restant suffisamment simple pour être mise en œuvre rapidement et enseignée aux étudiants en autonomie.
