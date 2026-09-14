/**
 * The power/availability state of the device's Bluetooth adapter.
 */
export type BBState =
    /** Not yet determined. */
    | 'unknown'
    /** Bluetooth is turned off. */
    | 'poweredOff'
    /** Bluetooth is turned on and available for scanning and connecting. */
    | 'poweredOn'
    /** iOS only: Bluetooth access is restricted at the OS level (e.g. by an MDM profile). */
    | 'unauthorized'
    /** iOS only: this device's hardware doesn't support Bluetooth Low Energy. */
    | 'unsupported'
    /** iOS only: the Bluetooth stack is resetting; treat like a temporary `unknown`. */
    | 'resetting'
