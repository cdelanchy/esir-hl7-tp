# TP ESI

Ce document décrit le déroulement du TP d'ESI sur HL7v2. Vous y trouverez les objectifs du TP, les consignes pour le compte-rendu et comment soumettre votre travail.

> Ce TP est à réaliser sans l'aide d'IA

## Objectifs du TP

Les objectifs de ce TP sont les suivants :

* réaliser l'admission d'un patient dans un système d'information hospitalier ;
* réaliser le transfert de ce patient dans un système d'information hospitalier ;
* réaliser la sortie de ce patient dans un système d'information hospitalier.

Les étudiants doivent avoir compris à la sortie du TP les notions suivantes :

* l'inscription du système de messages HL7v2 au sein d'un système d'information hospitalier ;
* les bases de l'interopérabilité ;
* le parcours patient simplifié dans un établissement de soin.

## Déroulement du TP

Ce TP peut s'exécuter en binôme ou seul en fonction des contraintes de la salle informatique.

Après avoir pris connaissance du contenu du TP (5'), les étudiants doivent doivent se documenter sur le format HL7v2.X et la partie ADT (Admission Discharge Transfert) de ce standard (30') et ensuite réaliser les trois objectifs du TP en forgeant leurs propres messages HL7.

Les étudiants **doivent renvoyer un compte-rendu à une date fixée avec l'enseignant**. Son contenu est décrit ci-après.

## Compte-rendu de TP

Le compte-rendu est à envoyer à l'adresse mail donnée par l'enseignant, jusqu'à la date convenue et indiquée lors du TP, jusqu'à minuit au plus tard. L'enseignant se réserve le droit de mettre des pénalités en cas de retard.

Le contenu du compte-rendu doit correspondre à la description ci-dessous.

* **Copie du message HL7** et **capture d'écran du résultat sur le tableau** des patients pour chaque événement (Admission, Transfert et Sortie).
* Réponses aux questions :
  * Quel est le profil d'intégration IHE correspondant à l'admistration des patients ?
  * À quel domaine d'IHE appartient-il ?
  * Donnez l'identifiant de la transaction IHE réalisée dans ce TP, au sein du domaine et profil d'intégration susmentionnés.
  * Quel acteur avez-vous simulé au sein de cette transaction ?
  * Ce profil d'intégration a-t-il été profilé en France ? Le cas échéant, quel organisme l'a profilé et comment se nomme la version profilée ?
  * De quoi est constitué l'Identifiant Patient (IPP) dans ce TP ?
  * À quoi sert-il ?
  * Quel élément devrait accompagner l'IPP et est obligatoire depuis le 1er janvier 2021 en France ?
  * D'après vous, et en vous documentant, existe-t-il un événément HL7v2 pouvant arriver avant l'admission ?
    * Si oui, donner son code type d'événement et un exemple de message.
    * Préciser les sources vous ayant permis de répondre à la question.
  * BONUS : comment enlever les informations de votre patient du SIH du TP en ligne (i.e. l'enlever du tableau) ? Donner la théorie et si possible la mise en pratique, captures d'écran à l'appui.

## Utiliser le template HL7 fourni

Dans ce projet, dans le dossier message, vous trouverez un fichier `HL7_template.HL7` ou des messages d'exemples présents dans le dossier `message`.
Le fichier `HL7_template.hl7` contient l'ensemble des segments utilisés dans les messages HL7 d'admission (A01), de transfert (A02) et de sortie (A03) confondus. Certains champs sont pré-remplis avec des informations de base, d'autres sont vides.
Le dossier `message` contient en plus des messages HL7v2 d'exemples que vous pouvez modifier.

Vous pouvez récupérer ce template, soit en le téléchargeant depuis la page web du projet, soit en téléchargeant/clonant l'ensemble du projet.

Pour créer votre message HL7, vous devez :

* créer une copie de ce template ou d'un message d'exemple ;
* garder les segments d'intérêts ;
* ajouter les informations nécessaire à votre type de message dans les champs correspondants ;
* enregistrer cette copie avec une extension de fichier .HL7 ;

quelque soit le type de message à créer.

## Réaliser une admission

Pour réaliser une admission, vous avez au minimum besoin des segments et éléments suivants :

* MSH : Message Header
  * type de message
* EVN : Event
  * date de l'événement
* PID : Patient Identification
  * IPP
  * Nom
  * Prénom
  * Date de naissance
  * Sexe
* PV1 : Patient Visit
  * Localisation du patient
  * Identifiant de la venue/du séjour du patient
* ZBE : Informations sur le mouvement
  * Identifiant du mouvement

Compléter les champs vides des segments avec les informations requises en suivant la mini-documentation sur HL7 jointe au TP et les documentations associées au standard et au profil IHE.

## Réaliser un transfert

Pour le transfert, les segments minimum sont les suivants :

* MSH : Message Header
  * type de message
* EVN : Event
  * date de l'événement
* PID : Patient Identification
  * IPP
  * Nom
  * Prénom
  * Date de naissance
  * Sexe
* PV1 : Patient Visit
  * Localisation du patient
  * Précédente localisation du patient
  * Identifiant de la venue/du séjour du patient
* ZBE : Informations sur le mouvement
  * Identifiant du mouvement

## Réaliser une sortie

Pour la sortie, les segments minimum sont les suivants :

* MSH : Message Header
  * type de message
* EVN : Event
  * date de l'événement
* PID : Patient Identification
  * IPP
  * Nom
  * Prénom
  * Date de naissance
  * Sexe
* PV1 : Patient Visit
  * Localisation du patient
  * Précédente localisation du patient
  * Identifiant de la venue/du séjour du patient
* ZBE : Informations sur le mouvement
  * Identifiant du mouvement

## Soumettre son message

Une fois votre message forgé, rendez-vous sur la page [https://esir-tp.clotaire-delanchy.fr/](https://esir-tp.clotaire-delanchy.fr/), cliquez sur "Upload HL7" et suivez les instructions.

Un message de succès ou d'erreur vous indiquera si votre message a été pris en compte ou non.

Attention : votre message doit forcément avoir l'extension `.HL7`.

## Visualiser le résultat

Pour voir le résultat de votre message (admission, transfert ou sortie), vous pouvez vous rendre sur [https://esir-tp.clotaire-delanchy.fr/](https://esir-tp.clotaire-delanchy.fr/).

Un tableau vous représente l'état du SIH avec les patients enregistrés et leurs statuts ainsi que des informations sur leur localisation. Si vous cliquez sur le bouton "Historique" d'un patient, vous verrez apparaître son historique.

Le tableau est mis à jour automatiquement toutes les 15 secondes.
