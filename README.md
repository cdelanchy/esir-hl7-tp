# ESRH TP HL7 [![licence](https://i.creativecommons.org/l/by-nc-sa/4.0/80x15.png)](http://creativecommons.org/licenses/by-nc-sa/4.0/)

This project contains the ESRH TP for the ESIR engineering school. It will presents students the basics understanding of HL7 ADT messages.

## Project structure

This project is eventually composed by 3 projects:

* esrh-tp-hL7: this one, describing the project and serving as a direct entry point to launch the program;
* [esrh-hl7-back-end](https://gitlab.com/esrh-tp-hl7/esrh-hl7-back-end): this is the project hosting the back-end of the web application;
* [esrh-hl7-front-end](https://gitlab.com/esrh-tp-hl7/esrh-hl7-front-end): this project hosts the front-end part.

## Documentation for students

This project is part of the ESRH module for the ESIR engineering school in Rennes (France). You can find two main documentations:

1. [the instructions for the practical work](./doc/ESRH_TP_fr.md) :fr:;
2. [a very simplifed guide for the HL7 standard](./doc/HL7_guide_fr.md) and especially the ADT part :fr:.

## Documentation for developpers

You can start the project using `docker-compose` and the compose file at the root of this project.

    docker-compose up -d


This will start the different containers needed for this project to run, and especially an nginx one listening on port 80.

Then, you can access the project using your favorited browser at `http://localhost`.

## Contributions

Contributions are welcome. Please, be sure to follow the [contributing guide](./CONTRIBUTING.md).

We are currently looking for people to translate in English the two guides available in the `doc` directory.
