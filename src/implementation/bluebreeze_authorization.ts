/** Whether this app is currently allowed to use Bluetooth. */
export type BBAuthorization =
    /** Not yet determined. */
    | 'unknown'
    /** Permission has been denied once but not permanently. Android only. */
    | 'showRationale'
    /** Permission has been permanently denied. */
    | 'denied'
    /** Permission has been granted. */
    | 'authorized'
