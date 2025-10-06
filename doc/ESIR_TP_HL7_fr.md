# TP ESRH

Ce document décrit le déroulement du TP d'ESRH. Vous y trouverez les objectifs du TP, comment avoir un template de message HL7 à compléter et comment soumettre votre travail.

## Objectifs du TP

Les objectifs de ce TP sont les suivants :

* réaliser l'admission d'un patient dans un système d'information hospitalier ;
* réaliser le transfert de ce patient dans un système d'information hospitalier ;
* réaliser la sortie de ce patient dans un système d'information hospitalier.

Les étudiants doivent avoir compris à la sortie du TP les notions suivantes :

* l'inscription du système de messages HL7 au sein d'un système d'information hospitalier ;
* les bases de l'interopérabilité ;
* le parcours patient simplifié dans un établissement de soin.

## Déroulement du TP

Ce TP peut s'exécuter en binôme ou seul en fonction des contraintes de la salle informatique.

Après avoir pris connaissance du contenu du TP (5'), les étudiants doivent regarder le mini-guide HL7 fourni (10') et ensuite réaliser les trois objectifs du TP en forgeant leurs propres messages HL7.

## Utiliser le template HL7 fourni

Dans ce projet, dans le dossier message, vous trouverez un fichier `HL7_template.HL7`.
Ce dernier contient l'ensemble des segments utilisés dans les messages HL7 d'admission (A01), de transfert (A02) et de sortie (A03) confondus. Certains champs sont pré-remplis avec des informations de base, d'autres sont vides.

Vous pouvez récupérer ce template, soit en le téléchargeant depuis la page web du projet, soit en téléchargeant/clonant l'ensemble du projet.

Pour créer votre message HL7, vous devez :

* créer une copie de ce template ;
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

Compléter les champs vides des segments avec les informations requises en suivant la mini-documentation sur HL7 jointe au TP.

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

## Soumettre son message

Une fois votre message forgé, rendez-vous sur la page http://clotaire-delanchy.fr/patients/new et suivez les instructions.

Un message de succès ou d'erreur vous indiquera si votre message a été pris en compte ou non.

## Visualiser le résultat

Pour voir le résultat de votre message (admission, transfert ou sortie), vous pouvez vous rendre sur http://clotaire-delanchy.fr/.

Un tableau vous représente l'état du SIH avec les patients enregistrés et leur statut ainsi que des informations sur leur localisation. Si vous cliquez sur un patient, vous verrez apparaître son historique.
