import { Button, Dialog, DialogActions, DialogTitle, Stack } from "@mui/material";
import { useState } from "react";
import { AuthData } from "../../interfaces/auth/Auth";
import { TaskTagsAutocomplete } from "../taskTagsAutocomplete/TaskTagsAutocomplete";

export interface TaskFilterDialogProps {
    open: boolean
    tags: Array<string>
    authData: AuthData
    listId: string
    onClose: (tagsSelected: Array<string> | null) => void
}

const DEFAULT_TAGS_SELECTED_VALUE: Array<string> = []

export function TaskFilterDialog(props: TaskFilterDialogProps) {
    const { open, tags, authData, listId, onClose } = props

    const [tagsSelected, setTagsSelected] = useState<Array<string>>(tags ? tags : DEFAULT_TAGS_SELECTED_VALUE)

    const handleDialogClose = () => {
        onClose(null)
    }

    const handleFilter = () => {
        onClose(tagsSelected)
    }

    return (
        <Dialog onClose={handleDialogClose} open={open}>
            <DialogTitle>
                Filter tasks
            </DialogTitle>

            <Stack direction={'column'} gap={2} sx={{ width: '300px', padding: 2 }}>
                <TaskTagsAutocomplete authData={authData} listId={listId} tags={tagsSelected} onTagsSelect={setTagsSelected} />
            </Stack>

            <DialogActions>
                <Button onClick={handleDialogClose}>
                    Cancel
                </Button>

                <Button variant="contained" onClick={handleFilter}>
                    {tagsSelected.length == 0 ? "Clear Filter" : "Set Filter"}
                </Button>
            </DialogActions>
        </Dialog >
    )
}