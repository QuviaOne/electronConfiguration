const orbitalNames = ["s", "p", "d", "f", "g", "h", "i", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
import elements from "./elements.js";
export class PeriodicTable extends Array {
    /**
     * 
     * @param {Number} tableLength The number elements in the table.
     */
    constructor(tableLength) {
        super(tableLength);
        for(var i = 0; i < tableLength; i++) {
            new Element(this, i);
        }
    }
}
export class Element {
    /**
     * 
     * @param {PeriodicTable} periodicTable The periodic table this element belongs to.
     * @param {Number} atomicNumber Atomic number of the element.
     * @param {String} symbol The symbol of the element.
     * @param {String} name The name of the element.
     * @param {String} czechName The czech name of the element.
     */
    constructor(periodicTable, atomicNumber) {
        if (atomicNumber < 0 || atomicNumber % 1 != 0) throw new Error("Invalid atomic number.");
        /**
         * @description The periodic table this element belongs to.
         */
        this.periodicTable = periodicTable;
        /**
         * @description Atomic number of the element.
         */
        this.atomicNumber = atomicNumber;
        if (!elements[this.atomicNumber - 1]) elements[this.atomicNumber - 1] = {symbol: "Unk", czech: "Neznámý", name: "Unknown"}
        /**
         * @description The symbol of the element.
         * @type {String}
         */
        this.symbol = elements[this.atomicNumber - 1].symbol;
        /**
         * @description The name of the element.
         * @type {String}
         */
        this.name = elements[this.atomicNumber - 1].name;
        /**
         * @description The czech name of the element.
         * @type {String}
         */
        this.czechName = elements[this.atomicNumber - 1].czech;
        this.electronConfiguration = new ElectronConfiguration(this);
        this.periodicTable[this.atomicNumber - 1] = this;
    }
    /**
     * 
     * @param {Boolean} shorten If the notation should be shortened.
     * @returns {String}
     */
    toString(shorten = true) {
        return this.symbol + ": " + this.electronConfiguration.toString(shorten)
    }
}
export class MagneticOrbital {
    constructor(up = false, down = false) {
        this[-1 / 2] = down;
        this[1 / 2] = up;
    }
    /**
     * @returns {Boolean}
     */
    getUp() {
        return this[1 / 2];
    }
    /**
     * @returns {Boolean}
     */
    getDown() {
        return this[-1 / 2]
    }
    /**
     * 
     * @param {Boolean} value 
     */
    setUp(value) {
        this[1 / 2] = value;
    }
    /**
     * 
     * @param {Boolean} value 
     */
    setDown(value) {
        this[-1 / 2] = value;
    }
    toString() {
        if (this[1 / 2]) {
            if (this[-1 / 2]) return "[↿⇂]";
            return "[↿]"
        } else if (this[-1 / 2]) return "[⇂]";
        return "[]";
    }
    /**
     * @returns {void}
     */
    fill() {
        this[1 / 2] = true;
        this[-1 / 2] = true;
    }
    /**
     * @returns {void}
     */
    empty() {
        this[1 / 2] = false;
        this[-1 / 2] = false;
    }
}
/**
 * @extends {Array<MagneticOrbital>}
 */
export class Orbital extends Array {
    /**
     * @param {ElectronConfiguration} electronConfiguration The electron configuration this Orbital is part of.
     * @param {Number} n Primary quantum number.
     * @param {Number} l Secondary quantum number.
     */
    constructor(electronConfiguration, n, l) {
        if (!n || n % 1 !== 0 || n <= 0) throw new Error("Invalid primary quantum number." + " N: " + n);
        if (l != 0 && (!l || l % 1 !== 0 || l < 0)) throw new Error("Invalid secondary quantum number." + " L: " + l);
        if (l >= n) throw new Error("Secondary quantum number must be less than the primary quantum number.");
        super(2 * l + 1);
        this.electronConfiguration = electronConfiguration;
        /**
         * @description Primary quantum number.
         */
        this.n = n;
        /**
         * @description Secondary quantum number.
         */
        this.l = l;
        if (this.l >= orbitalNames.length) {
            console.warn("Secondary quantum number is out of range. Can not construct name.");
            this.name = "n:" + this.n.toString() + " l:" + this.l.toString();
        } else {
            this.name = this.n + orbitalNames[this.l];
        }
        for (var i = 0; i < this.length; i++) {
            this[i] = new MagneticOrbital();
        }
        this.maxElectrons = this.length * 2;
    }
    /**
     * @returns {string}
     */
    toString() {
        return this.name + this.join("");
    }
    /**
     * 
     * @param {Number?} electrons 
     * @returns {Number} Electrons left to fill in next orbitals.
     * @description Fills the orbital due to known laws
     */
    fill(electrons) {
        if (electrons == null) {
            for (var o of this) {
                o.fill();
                return 0;
            }
        }
        if (electrons >= this.length * 2) {
            for (var o of this) {
                o.fill();
            }
            return electrons - this.length * 2;
        }
        for (var i = 0; i <= electrons; i++) {
            if (i == this.length) {
                electrons -= this.length;
                break;
            }
            this[i].setUp(true);
        }
        for (var i = 0; i < electrons; i++) {
            this[i].setDown(true);
        }
        return 0;
    }
}
export class ElectronConfiguration extends Array {
    /**
     * 
     * @param {Element} element The element this electron configuration describes;
     */
    constructor(element) {
        super();
        this.element = element;
        var electrons = this.element.atomicNumber;
        while (electrons > 0) {
            var o = getOrbitalNumbers(this.length + 1);
            electrons = this.addOrbital(o.n, o.l).fill(electrons);

        }
    }
    /**
     * 
     * @param {Number} n Primary quantum number
     * @param {Number} l Secondary quantum number
     * @returns {Orbital}
     */
    addOrbital(n, l) {
        var rv = new Orbital(this, n, l);
        this.push(rv);
        return rv;
    }
    /**
     * 
     * @param {Boolean} shorten If the notation is shortened.
     * @returns {String}
     */
    toString(shorten = false) {
        return this.join(" ");
    }

}
/**
 * 
 * @param {Number} number Number of the orbital in the sequence
 * @return {Map<String, Number>}
 */
function getOrbitalNumbers(number) {
    /**
    * @type {Number}
    * @description Primary quantum number
    */
    var n;
    /**
     * @type {Number}
     * @description Secondary quantum number
     */
    var l;
    /**
     * @type {Number} 
     * @summary The value of n + l for the n + l level.rule.
     */
    var NplusL = 0;
    for (var i = 0; i < number; NplusL++) {
        i += Math.round((NplusL + 1) / 2);
    }
    /**
     * @type {Number}
     * @description Number of orbitals with lower n + l value
     */
    var orbitalBeforeNplusL = 0;
    for (var i = 1; i < NplusL; i++) {
        orbitalBeforeNplusL += Math.floor((i + 1) / 2)
    }
    /**
     * @type {Number}
     * @description The maximim value l an orbital in with this n + l value can have.
     */
    var maxLinNplusL = Math.round((NplusL) / 2) - 1;
    l = maxLinNplusL - (number - orbitalBeforeNplusL) + 1;
    n = NplusL - l;
    return {
        n, l
    }
}