# Stack Aidbox pour le TP HL7 v2 vers FHIR

## 1. Objectif

La pile applicative du TP doit permettre aux étudiants de :

- uploader un fichier HL7 v2 ;
- transformer le message en ressources FHIR ;
- valider les ressources selon le standard FHIR ;
- stocker les données dans un serveur FHIR réel ;
- lire les données et reconstruire le tableau des patients.

La solution la plus pertinente pour cette étape est de faire appel à un serveur FHIR mature et prêt à l’emploi, ici `Aidbox`.

Aidbox est un bon choix pour le TP, car il permet :

- de stocker des ressources FHIR `Patient`, `Encounter`, etc. ;
- de gérer l’API REST FHIR ;
- de valider automatiquement les ressources ;
- de fournir un modèle de données standard pour la pédagogie ;
- de servir de point de comparaison avec le modèle métier improvisé actuel.

---

## 3. Architecture cible

### 3.1. Vue d’ensemble

```text
HL7 file
   ↓
Front-end (upload + conversion)
   ↓
Bundle FHIR
   ↓
Aidbox (FHIR server)
   ↓
Validation FHIR + stockage
   ↓
Lecture FHIR
   ↓
Tableau des patients / historique / état d’un patient
```

### 3.2. Rôle de chaque composant

#### Front-end

Le front est responsable de :

- l’upload du fichier HL7 ;
- la validation du message HL7 ;
- la construction d’un `Bundle` FHIR ;
- l’appel au serveur Aidbox ;
- l’affichage du tableau patients.

#### Aidbox

Aidbox est responsable de :

- recevoir les ressources FHIR ;
- valider le `Bundle` et les ressources ;
- stocker les données ;
- exposer les endpoints FHIR REST ;
- répondre au front avec les résultats de transaction.

---

## 7. Validation FHIR côté server

Aidbox doit permettre au front d’obtenir une réponse de type `OperationOutcome` si les ressources sont invalides.

### Exemple d’erreur

```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "invalid",
      "details": {
        "text": "Encounter must have a valid subject reference."
      }
    }
  ]
}
```

---
