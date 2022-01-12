import { Autocomplete, Chip, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { AuthData } from "../../interfaces/auth/Auth";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { retrieveTagsByListId, selectTags } from "../../services/task/tagSplice";
import { RetrieveTagsByListIdRequest } from "../../interfaces/task/TaskRequest";

export interface TaskTagsAutocompleteProps {
    authData: AuthData
    listId: string
    tags: Array<string>
    freeSolo: boolean
    onTagsSelect: (tagsSelected: Array<string>) => void
}

const DEFAULT_TAG_SUGGESTIONS_OPEN_VALUE = false

export function TaskTagsAutocomplete(props: TaskTagsAutocompleteProps) {
    const dispatch = useAppDispatch()
    const { authData, listId, tags, freeSolo, onTagsSelect} = props

    const tagSuggestions = useAppSelector(selectTags)
    const [tagsSuggestionsOpen, setTagsSuggestionsOpen] = useState<boolean>(DEFAULT_TAG_SUGGESTIONS_OPEN_VALUE)

    useEffect(() => {
        if (!tagsSuggestionsOpen) {
            return undefined
        }

        let tagRequest: RetrieveTagsByListIdRequest = {
            authData: authData,
            listId: listId
        }

        dispatch(retrieveTagsByListId(tagRequest))
    }, [tagsSuggestionsOpen])

    return (
        <Autocomplete
            multiple
            limitTags={3}
            id="tags"
            open={tagsSuggestionsOpen}
            onOpen={() => {
                setTagsSuggestionsOpen(true)
            }}
            onClose={() => {
                setTagsSuggestionsOpen(false)
            }}
            freeSolo={freeSolo}
            options={tagSuggestions}
            value={tags}
            onChange={(_, tagsSelected: Array<string>) => {
                onTagsSelect(tagsSelected)
            }}
            getOptionLabel={(option) => option}
            renderTags={(value: readonly string[], getTagProps) =>
                value.map((option: string, index: number) => (
                    <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                ))
            }
            renderInput={(params) => (
                <TextField {...params} label="Tags" placeholder="Add a tag" />
            )}
        />
    )
}