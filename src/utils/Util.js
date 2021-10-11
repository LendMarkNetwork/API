const crypto = require('crypto');

class Util {
    static playerNameToUUID(name) {
        let hash = crypto.createHash('md5').update(`OfflinePlayer:${name}`).digest();

        hash[6] &= 0x0f;
        hash[6] |= 0x30;
        hash[8] &= 0x3f;
        hash[8] |= 0x80;
    
        const hex = hash.toString('hex');
        return hex.replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, '$1-$2-$3-$4-$5')
    }
}

module.exports = Util;