class Logger {
    static info(text) {
        console.log(`\x1b[36m|INFO|\x1b[0m ${text}`)
    }
}

module.exports = Logger;
