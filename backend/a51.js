// A5/1 educational implementation (NOT for production security)
class LFSR {
    constructor(size, taps, clockBit) {
        this.size = size;
        this.taps = taps; // indices from LSB=0
        this.clockBit = clockBit;
        this.state = 0;
    }
    getBit(i) {
        return (this.state >> i) & 1;
    }
    feedback() {
        return this.taps.reduce((acc, t) => acc ^ this.getBit(t), 0) & 1;
    }
    clockOnce(inBit = null) {
        let fb = this.feedback();
        if (inBit !== null) fb ^= (inBit & 1);
        this.state = ((this.state << 1) & ((1 << this.size) - 1)) | fb;
    }
    majorityClock(maj) {
        if (this.getBit(this.clockBit) === maj) this.clockOnce(null);
    }
}

class A51 {
    constructor(key64, frame22) {
        this.R1 = new LFSR(19, [13, 16, 17, 18], 8);
        this.R2 = new LFSR(22, [20, 21], 10);
        this.R3 = new LFSR(23, [7, 20, 21, 22], 10);
        this.init(key64, frame22);
    }
    init(key64, frame22) {
        // load 64-bit key, LSB first
        for (let i = 0; i < 64; i++) {
            const kb = (key64 >> i) & 1;
            this.R1.clockOnce(kb);
            this.R2.clockOnce(kb);
            this.R3.clockOnce(kb);
        }
        // load 22-bit frame, LSB first
        for (let i = 0; i < 22; i++) {
            const fb = (frame22 >> i) & 1;
            this.R1.clockOnce(fb);
            this.R2.clockOnce(fb);
            this.R3.clockOnce(fb);
        }
        // warm-up 100 cycles (majority)
        for (let i = 0; i < 100; i++) this._majCycle();
    }
    _majBit() {
        const sum = this.R1.getBit(this.R1.clockBit) +
            this.R2.getBit(this.R2.clockBit) +
            this.R3.getBit(this.R3.clockBit);
        return sum >= 2 ? 1 : 0;
    }
    _majCycle() {
        const maj = this._majBit();
        this.R1.majorityClock(maj);
        this.R2.majorityClock(maj);
        this.R3.majorityClock(maj);
    }
    keystreamByte() {
        let out = 0;
        for (let i = 0; i < 8; i++) {
            this._majCycle();
            const bit = (this.R1.getBit(this.R1.size - 1) ^
                this.R2.getBit(this.R2.size - 1) ^
                this.R3.getBit(this.R3.size - 1)) & 1;
            out |= (bit << i);
        }
        return out & 0xff;
    }
    keystream(n) {
        const buf = Buffer.allocUnsafe(n);
        for (let i = 0; i < n; i++) buf[i] = this.keystreamByte();
        return buf;
    }
}

function parseKey64Hex(hexStr) {
    const s = (hexStr || "").trim().toLowerCase().replace(/^0x/, "");
    if (!/^[0-9a-f]{1,16}$/.test(s)) {
        throw new Error("Key must be hex up to 16 hex chars (64-bit), e.g. 0011223344556677");
    }
    const v = BigInt("0x" + s);
    if (v >= (1n << 64n)) throw new Error("Key too large for 64 bits");
    return Number(v); // safe: we only use bitwise within 64-bit range
}

function parseFrame22(val) {
    const str = String(val ?? "").trim().toLowerCase();
    let num;
    if (/^0x[0-9a-f]+$/.test(str)) num = parseInt(str, 16);
    else if (/^[0-9]+$/.test(str)) num = parseInt(str, 10);
    else throw new Error("Frame must be int or hex, e.g. 0x134 or 308");
    if (num >= (1 << 22)) throw new Error("Frame too large for 22 bits");
    return num;
}

function a51XorBuffer(inputBuf, keyHex, frameVal) {
    const key64 = parseKey64Hex(keyHex);
    const frame22 = parseFrame22(frameVal);
    const a51 = new A51(key64, frame22);

    // XOR stream
    const out = Buffer.allocUnsafe(inputBuf.length);
    let offset = 0;
    const CHUNK = 1024 * 1024;
    while (offset < inputBuf.length) {
        const n = Math.min(CHUNK, inputBuf.length - offset);
        const ks = a51.keystream(n);
        for (let i = 0; i < n; i++) out[offset + i] = inputBuf[offset + i] ^ ks[i];
        offset += n;
    }
    return out;
}

module.exports = {
    a51XorBuffer,
    parseKey64Hex,
    parseFrame22
};