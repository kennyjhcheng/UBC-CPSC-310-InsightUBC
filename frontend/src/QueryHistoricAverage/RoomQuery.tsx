import React, {useState} from "react";
import {fetchInsight} from "../requests/fetchInsight";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";
import {Close} from "@mui/icons-material";

interface RoomsQueryData {
    "rooms_name": string;
    "rooms_fullname": string;
    "rooms_address": string;
    "rooms_seats": number;
    "rooms_furniture": string;
}


const initialData: RoomsQueryData[] = [];

function RoomsQuery() {
    const [name, setName] = useState<string>("");
    const [number, setNumber] = useState<string>("");
    const [data, setData] = useState<RoomsQueryData[]>(initialData);
    const [open, setOpen] = useState<boolean>(false);

    const onClose = () =>
        setOpen(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newData = await fetchInsight("POST", "query", JSON.stringify(
            {
                "WHERE": {
                    "AND": [
                        {
                            "IS": {
                                "rooms_shortname": name.trim().toUpperCase()
                            }
                        },
                        {
                            "IS": {
                                "rooms_number": number.trim()
                            }
                        }
                    ]
                },
                "OPTIONS": {
                    "COLUMNS": [
                        "rooms_name",
                        "rooms_fullname",
                        "rooms_address",
                        "rooms_seats",
                        "rooms_furniture"
                    ]
                }
            }
        ));
        console.log(newData.result)
        setData(newData.result);
        if (newData.result.length === 0) setOpen(true);

    }

    const handleReset = () => {
        setName("");
        setNumber("");
        setData([]);
    }

    return (
        <Box sx={{ my: 2 }}>
            <Typography variant="h5" sx={{ my: 1 }}>
               Search Room
            </Typography>
            <form onSubmit={handleSubmit} onReset={handleReset}>
                <TextField
                    id="name"
                    label="Room Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    id="room-number"
                    label="Room Number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                />
                <Button type="submit" variant="contained" color="primary">
                    Submit
                </Button>
                <Button type="reset" variant="contained" color="primary">
                    Reset
                </Button>
            </form>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>FullName</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Seats</TableCell>
                            <TableCell>Furniture</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.rooms_name}</TableCell>
                                <TableCell>{item.rooms_fullname}</TableCell>
                                <TableCell>{item.rooms_address}</TableCell>
                                <TableCell>{item.rooms_seats}</TableCell>
                                <TableCell>{item.rooms_furniture}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={open} onClose={onClose}>
                <DialogTitle style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <Typography variant="h6" style={{color: 'red'}}>Error</Typography>
                    <IconButton onClick={onClose}>
                        <Close/>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body1">{"Room not found. :("}</Typography>
                </DialogContent>
            </Dialog>
        </Box>
    )
}

export default RoomsQuery;