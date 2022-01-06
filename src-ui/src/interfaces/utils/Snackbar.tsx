export interface SnackBarState {
    open: boolean
    severity: "error" | "info" | "success" | "warning"
    message: string
}