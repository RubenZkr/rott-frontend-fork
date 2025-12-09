import { Typography } from '@mui/material';
import AppShell from '@/components/AppShell';
import AuthHelper from '@/helpers/AuthHelper';

export default function Dashboard() {
    const user = AuthHelper.getUser();

    return (
        <AppShell>{{
            appBarButtons: null,
            body: (
                <Typography variant="h4">
                    Welkom {user?.name} op het dashboard
                </Typography>
            )
        }}</AppShell>
    );
}
