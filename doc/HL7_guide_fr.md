# HL7v2 : guide

## HL7 et l'interopérabilité en santé

L'interopérabilité permet à des équipements de communiquer entre eux et de s'échanger des données dans un langage commun, idéalement en suivant des standards. Dans le domaine de la santé, de nombreux équipements différents sont opérationnels dans les établissements de soin, de nature à la fois matérielle et logicielle. Nous pouvons citer par exemple les dossiers patients informatisés (DPI), les modalités d'imagerie et d'examens (IRM, Scanner, TEP...), le logiciel de suivi de bloc, la pharmacie, etc.

L'ensemble de ces équipements doit s'échanger de l'information afin de garder une cohérence du système d'informations de l'établissement de soin. Cela permet que l'ajout d'un rendez-vous pour un examen d'imagerie pour un patient A soit enregistré au sein de la modalité et que cette dernière enregistre directement les images de l'examen avec les données relatives au patient A. Cela évite une deuxième saisie des informations du patient A sur la modalité, donc des risques d'erreur, et permet de garder les informations à jour. En effet, si une information importante concernant le patient A est modifiée dans un équipement, cette mise à jour est aussi indiquée aux autres systèmes.

L'interopérabilité est donc primordiale en santé, et ne doit pas être confondue avec l'interconnexion.

![Schéma décrivant les compatibilités entre systèmes](./interop.png)

## Le parcours patient et les messages HL7v2 de type ADT

Un des grands flux d'information au sein d'un établissement de santé est celui relatif aux informations administratives des patients et notamment leur parcours hospitalier.

En effet, tout patient dans un établissement de soin va suivre un parcours ponctué d'étapes et d'événements. Ainsi, dans le cas d'un séjour ambulatoire par exemple, un patient va être pré-admis pour une date d'hospitalisation, puis admis le jour J dans le service ambulatoire de l'établissement. Il sera ensuite transféré dans différentes zones (chambre, bloc, SSPI, retour en chambre), jusqu'à sa sortie définitive de l'établissement.

Ce parcours très simpifié (Admission, Transfert, Sortie) est suivi au sein de chaque système à travers un flux d'information ADT (Admission, Discharge, Transfert) via le standard HL7.

Ces messages HL7 de type ADT décrivent des événéments du parcours patient (une admission, un transfert...).

### Les séjours/venues et les mouvements

En France, la présence d'un patient au sein d'un établissement de santé voit son parcours décomposé en 2 élements. D'une part le séjour (ou la venue) et d'autre part, le mouvement.

Le patient effectue un séjour au sein de l'établissement entre son admission et sa sortie. Il s'agit d'un seul et même séjour. Si le patient est de nouveau admis 15 jours plus tard au sein du même établissement, il s'agira d'un nouveau séjour.

Durant un séjour, le patient est amené à évoluer dans différents services ou dans différentes phases : l'admission, un transfert entre les services (on parle alors de mutation), une sortie...  Ces évolutions sont les mouvements du patient. Un nouveau mouvement est donc créé à chaque changement de situation du patient durant son séjour.

## Anatomie d'un message HL7

Un message HL7 est un fichier texte structuré en segment (un segment par ligne) permettant de transférer de l'information entre systèmes.

Voici un exemple de message HL7 :

```txt
MSH|^~\&|PatientManager|PAM_FR|PatientManager|PAM_FR|20261109215348||ADT^A01^ADT_A01|20261109215348|P|2.5^FRA^2.11||||||UNICODE UTF-8|||2.11^IHE_FRANCE-2.11-PAM
EVN||20261109215348||||20261109215348
PID|||0411952093730690797489^^^ASIP-SANTE-INS-C&1.2.250.1.213.1.4.6&ISO^NH~DDS-55441^^^DDS&1.3.6.1.4.1.12559.11.36.3&ISO^PI~11246^^^GZL_INTEROP&2.16.840.1.113883.2.8.3.7&ISO^PI~102015748006365^^^ASIP-SANTE-INS-NIR&1.2.250.1.213.1.4.10&ISO^INS~102015748006365^^^ASIP-SANTE-INS-NIA&1.2.250.1.213.1.4.9&ISO^INS||BOUVIER^FIRMIN^FIRMIN^^^^L|Martin^^^^^^L|20020129|M|||Rue des Chasseurs^^Soisy-sous-Montmorency^^95230^FRA^H~^^Montigny-lès-Metz^^57950^FRA^BDL^BDL^57480|||||||AN2779^^^GZL_INTEROP&2.16.840.1.113883.2.8.3.7&ISO^AN|||||||||||||N|VALI
PV1||I|8780^211^231-2^140027210|N|||10002135423^Hamel^Maïwenn^^^^^^ASIP-SANTE-PS&1.2.250.1.71.4.2.1 I&ISO^D^^^RPPS|10002106291^Bouard^Eric^^^^^^ASIP-SANTE-PS&1.2.250.1.71.4.2.1 I&ISO^D^^^RPPS||152|||||||10002110418^Alkofer^Aude^^^^^^ASIP-SANTE-PS&1.2.250.1.71.4.2.1 I&ISO^D^^^RPPS||VN3607^^^GZL_INTEROP&2.16.840.1.113883.2.8.3.7&ISO^VN|||||||||||||||||||||||||20261109215300|||||||V
ZBE|MOV7090^GZL_INTEROP^2.16.840.1.113883.2.8.3.7^ISO|20261109215348||INSERT|N||Rhumatologie^^^^^^UF^^^8792|Gériatrie^^^^^^UF^^^6262|HMS^Changement conjoint des trois responsabilités.
ZFA|INEXISTANT
ZFP|4|75
ZFM|8
ZFD|||N|N
```

Chaque segment commence par son identifiant de segment (MSH, EVN, PID, PD1, ROL, NK1, PV1, etc.). Ces segments sont ensuite découpés en champs, séparés ici par des symboles `|`. A l'intérieur de ces champs, des sous-champs peuvent délimités par des symboles `^`.
Chaque champ a une signification décrite dans le standard HL7.

Ainsi, le premier champ `MSH` correspond à l'en-tête du message (Message Header) et donne notamment des informations sur l'expéditeur (MSH|3 et MSH|4) du message et son destinataire (MSH|5 et MSH|6), le type de message (MSH|9), la version d'HL7 utilisée (MSH|12), etc.

Nous pouvons citer en segments d'intérêts, en plus de MSH :

* EVN, qui donne des informations sur l'événément ;
* PID, qui donne des informations sur l'identification patient (Patient Identification) ;
* PV1, qui donne des informations sur le séjour du patient dans l'établissement ;
* ZBE, qui donne des informations sur les mouvements du patient durant son séjour.

## L'identification patient

L'identification patient est un facteur important dans le système d'information hospitalier. En effet, il faut pouvoir reconnaître un même patient à travers les différents équipements et logiciels au sein de l'établissement et - idéalement - entre établissements.

Au vu des problèmes d'homonymie et de probabilité d'avoir des dates de naissance identique, le trio nom/prénom/date de naissance n'est évidement pas l'identifiant du patient au sein du SIH.

Pour ce faire, on attribue au patient un ou plusieurs IPP (Identifiant Permanent Patient) qui sont des identifiants patients uniques. Ces IPP sont générés par des logiciels garants de l'authentification patient et considérés comme identifiant de confiance par les autres logiciels.

Les IPP sont donc la référence d'identifiant patient sur lesquelles se basent l'ensemble des dispositifs communiquant avec le SIH.

Ces IPP sont composés d'un identifiant unique et de la référence de l'entité émettrice de cet identifiant, que l'on appelle l'autorité d'affectation ou d'assignation (Assigning Authority). Par exemple : `1111^^^HMLIT^PI` indique que l'identifiant du patient est 1111 et il a été généré par Hopital Manager.

## Message d'admission : ADT_A01

L'admission d'un patient est gérée avec un message HL7 de type ADT A01. Ce message comporte évidemment les identifiants du patient et des informations administratives le concernant (nom, prénom, etc).

En voici un exemple :

```text
MSH|^~\&|PatientManager|PAM_FR|PatientManager|PAM_FR|20261109215348||ADT^A01^ADT_A01|20261109215348|P|2.5^FRA^2.11||||||UNICODE UTF-8|||2.11^IHE_FRANCE-2.11-PAM
EVN||20261109215348||||20261109215348
PID|||0411952093730690797489^^^ASIP-SANTE-INS-C&1.2.250.1.213.1.4.6&ISO^NH~DDS-55441^^^DDS&1.3.6.1.4.1.12559.11.36.3&ISO^PI~11246^^^GZL_INTEROP&2.16.840.1.113883.2.8.3.7&ISO^PI~102015748006365^^^ASIP-SANTE-INS-NIR&1.2.250.1.213.1.4.10&ISO^INS~102015748006365^^^ASIP-SANTE-INS-NIA&1.2.250.1.213.1.4.9&ISO^INS||BOUVIER^FIRMIN^FIRMIN^^^^L|Martin^^^^^^L|20020129|M|||Rue des Chasseurs^^Soisy-sous-Montmorency^^95230^FRA^H~^^Montigny-lès-Metz^^57950^FRA^BDL^BDL^57480|||||||AN2779^^^GZL_INTEROP&2.16.840.1.113883.2.8.3.7&ISO^AN|||||||||||||N|VALI
PV1||I|8780^211^231-2^140027210|N|||10002135423^Hamel^Maïwenn^^^^^^ASIP-SANTE-PS&1.2.250.1.71.4.2.1 I&ISO^D^^^RPPS|10002106291^Bouard^Eric^^^^^^ASIP-SANTE-PS&1.2.250.1.71.4.2.1 I&ISO^D^^^RPPS||152|||||||10002110418^Alkofer^Aude^^^^^^ASIP-SANTE-PS&1.2.250.1.71.4.2.1 I&ISO^D^^^RPPS||VN3607^^^GZL_INTEROP&2.16.840.1.113883.2.8.3.7&ISO^VN|||||||||||||||||||||||||20261109215300|||||||V
ZBE|MOV7090^GZL_INTEROP^2.16.840.1.113883.2.8.3.7^ISO|20261109215348||INSERT|N||Rhumatologie^^^^^^UF^^^8792|Gériatrie^^^^^^UF^^^6262|HMS^Changement conjoint des trois responsabilités.
ZFA|INEXISTANT
ZFP|4|75
ZFM|8
ZFD|||N|N
```

Le champs EVN|2 indique la date de l'évenement. Il s'agit donc d'une admission du 09/11/2026 à 21h53 pour le patient Firmin Bouvier, de son nom de naissance, né le 29/01/2002 avec l'IPP DDS-55441 délivré par DDS (DDS&1.3.6.1.4.1.12559.11.36.3&ISO) en tant qu'identifiant patient.

On peut également y trouver son sexe, son adresse, numéro de téléphone et autres possibilités de contact.

Son identifiant de séjour est VN3607, donné par Gazelle (GZL_INTEROP&2.16.840.1.113883.2.8.3.7&ISO). Et son identifiant de mouvement est MOV7090, également donné par Gazelle.

Le type du message dans le header est bien A01, pour une admission.

## Message de transfert : ADT_A02

Un transfert de patient correspond à un changement de chambre ou de service d'un patient durant son parcours. Il comporte notamment l'ancienne localisation du patient et son nouvel emplacement.

Voici un exemple présentant le transfert du même patient, de la chambre 231-2 du service CHIR à la chambre 270-1 du service AMBU.

```text
MSH|^~\&|PatientManager|PAM_FR|PatientManager|PAM_FR|20261109215552||ADT^A02^ADT_A02|20261109215552|P|2.5^FRA^2.11||||||UNICODE UTF-8|||2.11^IHE_FRANCE-2.11-PAM
EVN||20261109215552||||20261109215552
PID|||0411952093730690797489^^^ASIP-SANTE-INS-C&1.2.250.1.213.1.4.6&ISO^NH~DDS-55441^^^DDS&1.3.6.1.4.1.12559.11.36.3&ISO^PI~11246^^^GZL_INTEROP&2.16.840.1.113883.2.8.3.7&ISO^PI~102015748006365^^^ASIP-SANTE-INS-NIR&1.2.250.1.213.1.4.10&ISO^INS~102015748006365^^^ASIP-SANTE-INS-NIA&1.2.250.1.213.1.4.9&ISO^INS||BOUVIER^FIRMIN^FIRMIN^^^^L|Martin^^^^^^L|20020129|M|||Rue des Chasseurs^^Soisy-sous-Montmorency^^95230^FRA^H~^^Montigny-lès-Metz^^57950^FRA^BDL^BDL^57480|||||||AN2779^^^GZL_INTEROP&2.16.840.1.113883.2.8.3.7&ISO^AN|||||||||||||N|VALI
PV1||I|AMBU^270^270-1^140024886|N||CHIR^211^231-2^140027210|10002135423^Hamel^Maïwenn^^^^^^ASIP-SANTE-PS&1.2.250.1.71.4.2.1 I&ISO^D^^^RPPS|10002106291^Bouard^Eric^^^^^^ASIP-SANTE-PS&1.2.250.1.71.4.2.1 I&ISO^D^^^RPPS||152|||||||10002110418^Alkofer^Aude^^^^^^ASIP-SANTE-PS&1.2.250.1.71.4.2.1 I&ISO^D^^^RPPS||VN3607^^^GZL_INTEROP&2.16.840.1.113883.2.8.3.7&ISO^VN|||||||||||||||||||||||||20261109215300|||||||V
ZBE|MOV7091^GZL_INTEROP^2.16.840.1.113883.2.8.3.7^ISO|20261109215552||INSERT|N||Rhumatologie^^^^^^UF^^^8792|Gériatrie^^^^^^UF^^^6262
ZFP|4|75
ZFM|8
ZFD|||N|N
```

## Message de sortie : ADT_A03

Ce message permet d'indiquer la sortie d'un patient de l'établissement.

## Ressources et outils

Pour vous aider, vous pouvez vous aider des ressources suivantes :

* [documentation officielle d'HL7 v2.5](http://www.hl7.org/implement/standards/product_brief.cfm?product_id=143) (le chapitre 3 correspond aux messages ADT), attention, un compte est nécessaire pour télécharger le standard
* [le site Caristix](https://hl7-definition.caristix.com/v2/) qui décrit de façon plus interactive les différents segments et messages HL7 ADT
* l'extension [HL7Tools](https://marketplace.visualstudio.com/items?itemName=RobHolme.hl7tools) pour [Visual Studio Code](https://code.visualstudio.com/) peut être utile, notamment son découpage du message en segments et champs
* la plateforme de tests d'interopérabilité de l'Agence du Numérique en Santé dispose [d'un générateur de message HL7](https://interop.esante.gouv.fr/PatientManager/home.seam) qui peut être utile pour vous générez des templates. **ATTENTION : ne jamais utiliser de DONNEES REELLES sur les plateformes de test.**
