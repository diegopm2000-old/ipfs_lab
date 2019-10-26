// filemetadata.entity.

class Filemetadata {
  constructor({ ipfshash, name, type }) {
    this.ipfshash = ipfshash;
    this.name = name;
    this.type = type;
  }
}

module.exports = Filemetadata;
