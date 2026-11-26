# Stack FHIR pour le TP HL7v2 vers FHIR

## 1. Objectif

La pile applicative du TP doit permettre aux étudiants de :

- uploader un fichier HL7 v2 ;
- transformer le message en ressources FHIR ;
- valider les ressources selon le standard FHIR ;
- stocker les données dans un serveur FHIR réel ;
- lire les données et reconstruire le tableau des patients.

La solution la plus pertinente pour cette étape est de faire appel à un serveur FHIR.

## 2. Architecture cible

### 2.1. Vue d’ensemble

```text
HL7v2 file
   ↓
Front-end (upload + conversion)
   ↓
Bundle FHIR
   ↓
FHIR serveur
   ↓
Validation FHIR + stockage
   ↓
Lecture FHIR
   ↓
Tableau des patients / historique / état d’un patient
```

### 2.2. Rôle de chaque composant

#### Front-end

Le front est responsable de :

- l’upload du fichier HL7 ;
- la validation du message HL7 ;
- la construction d’un `Bundle` FHIR ;
- l’appel au serveur FHIR ;
- l’affichage du tableau patients.

#### Serveur FHIR

Le serveur FHIR est responsable de :

- recevoir les ressources FHIR ;
- valider le `Bundle` et les ressources ;
- stocker les données ;
- exposer les endpoints FHIR REST ;
- répondre au front avec les résultats de transaction.

---
