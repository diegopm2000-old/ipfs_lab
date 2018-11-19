// filemultipart.entity.

const File = require('./file.entity');

class Filemultipart {
  constructor({ arrayData, name, type }) {
    this.arrayParts = [];
    for (let i = 0; i < arrayData.length; i += 1) {
      const fileProperties = {
        data: arrayData[i],
        name: `name_#${i}`,
        type,
      };
      this.arrayParts.push(new File(fileProperties));
    }
    this.name = name;
    this.type = type;
  }

  getSize() {
    let result = 0;
    for (let i = 0; i < this.arrayParts.length; i += 1) {
      result += this.arrayParts[i].data.length;
    }
    return result;
  }
}

module.exports = Filemultipart;
