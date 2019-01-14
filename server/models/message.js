const bunyan = require('bunyan');
const hl7 = require('L7');
const logger = bunyan.createLogger({ name: 'Message', level: 'debug' });
const moment = require('moment')

function Message (message) {
  logger.debug('creating new Message');

  if (!message) throw new TypeError('Message constructor:: no message in parameter');

  // Check params and directories
  this.message = message;
  this.parsedMsg = hl7.parse(this.message);
  if (typeof this.parsedMsg.error !== 'function') {
    logger.error('Message constructor:: HL7 is not valid : ' + this.parsedMsg.error);
    throw new TypeError('Message constructor:: HL7 is not valid : ', this.parsedMsg.error);
  }
}

Message.prototype = {

  getType: function () {
    let type = this.parsedMsg.query('MSH|9[0]') + '^' + this.parsedMsg.query('MSH|9[1]');
    logger.debug('getType: ', type);
    return type;
  },

  getZ99type: function () {
    let type = 'ADT^XXX';
    if (this.getType() === 'ADT^Z99') {
      type = this.parsedMsg.query('MSH|9[0]') + '^' + this.parsedMsg.query('ZBE|6');
    }
    logger.debug('getZ99type: ', type);
    return type;
  },

  getZBEdate: function () {
    let zbeDate = this.parsedMsg.query('ZBE|2');
    logger.debug('getZBEdate: ', zbeDate);
    return zbeDate;
  },

  getZBEaction: function () {
    let action = this.parsedMsg.query('ZBE|4');
    logger.debug('getZBEaction: ', action);
    return action;
  },

  getIpp: function () {
    let ipp = this.parsedMsg.query('PID|3').split('~');
    logger.debug('getIpp: ', ipp);
    return ipp;
  },

  getExpectedAdmissionDate: function () {
    let date = this.parsedMsg.query('PV2|8');
    logger.debug('getExpectedAdmissionDate : ', date);
    return date;
  },

  getExpectedSurgeryDate: function () {
    let date = this.parsedMsg.query('PV2|33');
    logger.debug('getExpectedSurgeryDate : ', date);
    if (date === '') date = null;
    return date;
  },

  getLegalName: function () {
    let res = this._getNameOfType('L');
    if (!res.name) res.name = '';
    if (!res.firstname) res.firstname = '';
    logger.debug('getLegalName: ', res);
    return res;
  },

  getDisplayName: function () {
    let res = this._getNameOfType('D');
    if (!res.name) res.name = '';
    if (!res.firstname) res.firstname = '';
    logger.debug('getDisplayName: ', res);
    return res;
  },

  /**
   * Returns a String containing the birthdate:
   *'19521203'
   * @returns {''}
   */
  getBirthDate: function () {
    return this.parsedMsg.query('PID|7');
  },

  /**
   * Returns a String containing the room number:
   *'P315'
   * @returns {''}
   */
  getRoom: function () {
    return this.parsedMsg.query('PV1|3[1]')[0];
  },

  getService: function () {
    return this.parsedMsg.query('PV1|3[0]')[0];
  },

  getBed: function () {
    return this.parsedMsg.query('PV1|3[2]')[0];
  },

  getSex: function () {
    return this.parsedMsg.query('PID|8')[0];
  },

  getEventDate: function () {
    return this.parsedMsg.query('EVN|6');
  },

  /**
   * Returns an object containing tabs:
   * {
   *      L: [ 'CAMBOURD', 'MONIQUE', 'L' ],
   *      D: [ 'VERHULST', 'MONIQUE', 'D' ]
   * }
   * @returns {{}}
   * @private
   */
  _getAllNames: function () {
    let names = this.parsedMsg.query('PID|5').split('~');
    let namesResults = {};

    // Extract all names
    let nameTab;
    let type;
    let content;
    names.forEach(name => {
      nameTab = this._parseName(name);
      content = name.split('^');
      type = content[6];
      namesResults[type] = nameTab;
    });
    logger.debug('_getAllNames : ', namesResults);
    return namesResults;
  },

  /**
   * Returns an object with property name & firstname or an empty one
   * @param nameType
   * @returns {{}}
   * @private
   */
  _getNameOfType: function (nameType) {
    let names = this._getAllNames();
    let res = {};
    if (names.hasOwnProperty(nameType)) {
      res = {
        name: names[nameType][0],
        firstname: names[nameType][1]
      };
    }
    logger.debug('_getNameOfType: ', res);
    return res;
  },

  _parseName: function (name) {
    let regex = new RegExp('\\^+', 'g');
    let output = name.replace(regex, ',').split(',');
    logger.debug('_parseName: ', output);
    return output;
  },

  getPatientFromMessage: function () {
    let displayName = this.getDisplayName();
    let legalName = this.getLegalName();
    let name = displayName.name === '' ? legalName.name : displayName.name;
    let maiden = displayName.name !== '' ? legalName.name : '';
    let firstname = displayName.firstname === '' ? legalName.firstname : displayName.firstname;
    let patient = {
      name: name,
      firstname: firstname,
      maiden: maiden,
      birthDate: moment(this.getBirthDate()).format('DD/MM/YYYY'),
      eventDate: moment(this.getEventDate(), 'YYYYMMDDHHmmss').format('DD/MM/YYYY HH:mm'),
      ipp: this.getIpp(),
      room: this.getRoom(),
      service: this.getService(),
      bed: this.getBed(),
      sex: this.getSex(),

    };
    logger.debug('getPatientFromMessage : ', patient);
    return patient;
  },

};

module.exports = Message;
